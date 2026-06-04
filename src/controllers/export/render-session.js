import * as THREE from "three";

function clampSettledPasses(value) {
	const nextValue = Math.floor(Number(value));
	if (!Number.isFinite(nextValue) || nextValue < 0) {
		return 0;
	}

	return nextValue;
}

function clampWarmupPasses(value) {
	const nextValue = Math.floor(Number(value));
	if (!Number.isFinite(nextValue) || nextValue < 0) {
		return 0;
	}

	return nextValue;
}

function measureElapsed(getNowMs, startMs) {
	return Math.max(0, getNowMs() - startMs);
}

export async function renderGuideLayerPixels(
	{
		camera,
		width,
		height,
		gridVisible = false,
		eyeLevelVisible = false,
		gridLayerMode = "bottom",
	},
	{ ensureRenderTarget, renderer, guideOverlay, flipPixels } = {},
) {
	if (!gridVisible && !eyeLevelVisible) {
		return null;
	}

	const target = ensureRenderTarget(width, height);
	const previousTarget = renderer.getRenderTarget();
	const previousAutoClear = renderer.autoClear;
	const previousClearAlpha = renderer.getClearAlpha();
	const previousClearColor = renderer.getClearColor(new THREE.Color()).clone();
	const previousGuideOverlayState = guideOverlay.captureState();
	const pixels = new Uint8Array(width * height * 4);

	try {
		guideOverlay.applyState({
			gridVisible,
			eyeLevelVisible,
			gridLayerMode,
		});
		renderer.setRenderTarget(target);
		renderer.autoClear = true;
		renderer.setClearColor(0x000000, 0);
		renderer.clear(true, true, true);
		guideOverlay.renderBackground(renderer, camera);
		renderer.autoClear = false;
		guideOverlay.renderOverlay(renderer, camera);
		renderer.readRenderTargetPixels(target, 0, 0, width, height, pixels);
		return flipPixels(pixels, width, height);
	} finally {
		guideOverlay.applyState(previousGuideOverlayState);
		renderer.setRenderTarget(previousTarget);
		renderer.autoClear = previousAutoClear;
		renderer.setClearColor(previousClearColor, previousClearAlpha);
	}
}

export async function renderScenePixelsWithReadiness(
	{ scene, camera, width, height, sceneAssets, readinessPolicy = {} },
	{ buildReadinessPlan, finalizeReadiness, getNowMs, renderBackend } = {},
) {
	const readinessPlan = buildReadinessPlan({
		sceneAssets,
		policy: readinessPolicy,
	});
	const startedAt = getNowMs();
	const deadline = startedAt + readinessPlan.maxWaitMs;
	let completedWarmupPasses = 0;
	let completedRenderPasses = 0;
	let completedSettledPasses = 0;
	let lastReadinessProbe = null;
	const warmupPassesRequired = clampWarmupPasses(
		readinessPlan.warmupPassesRequired ?? readinessPlan.warmupPasses,
	);
	const hasReadinessProbe =
		typeof renderBackend.captureReadinessState === "function";
	let settledPassesPlanned = hasReadinessProbe
		? clampSettledPasses(readinessPlan.settledPasses)
		: 0;
	let probeSupported = hasReadinessProbe && settledPassesPlanned > 0;
	const trace = {
		strategy: readinessPlan.readinessStrategy ?? "probe-safe",
		maxWaitMs: readinessPlan.maxWaitMs,
		warmupPassesPlanned: readinessPlan.warmupPasses,
		warmupPassesRequired,
		settledPassesPlanned,
		passes: [],
		readPixelsMs: 0,
		elapsedMs: 0,
	};

	while (true) {
		const canWait = getNowMs() <= deadline;
		const needsWarmup =
			completedWarmupPasses < warmupPassesRequired && canWait;
		const needsFinalPass =
			completedRenderPasses < completedWarmupPasses + 1;
		const needsSettled =
			probeSupported &&
			completedSettledPasses < settledPassesPlanned &&
			canWait;

		if (!needsWarmup && !needsFinalPass && !needsSettled) {
			break;
		}

		const passStartedAt = getNowMs();
		const pass = {
			index: completedRenderPasses + 1,
			elapsedStartMs: Math.max(0, passStartedAt - startedAt),
			needsWarmup,
			needsFinalPass,
			needsSettled,
			prepareMs: 0,
			renderMs: 0,
			probeMs: 0,
			passMs: 0,
			completedWarmupPasses,
			completedSettledPasses,
			probe: null,
		};

		const prepareStartedAt = getNowMs();
		await renderBackend.prepareFrame({
			scene,
			camera,
			width,
			height,
			update: true,
		});
		pass.prepareMs = measureElapsed(getNowMs, prepareStartedAt);

		const renderStartedAt = getNowMs();
		await renderBackend.renderFrame({
			scene,
			camera,
			width,
			height,
		});
		pass.renderMs = measureElapsed(getNowMs, renderStartedAt);
		completedRenderPasses += 1;

		if (needsWarmup) {
			completedWarmupPasses += 1;
		}

		if (probeSupported) {
			const probeStartedAt = getNowMs();
			lastReadinessProbe = renderBackend.captureReadinessState({
				scene,
				camera,
				width,
				height,
			});
			pass.probeMs = measureElapsed(getNowMs, probeStartedAt);
			pass.probe = lastReadinessProbe;

			if (lastReadinessProbe?.supported === false) {
				probeSupported = false;
				settledPassesPlanned = 0;
				completedSettledPasses = 0;
			} else if (lastReadinessProbe?.pending) {
				completedSettledPasses = 0;
			} else {
				completedSettledPasses += 1;
			}
		}

		pass.completedWarmupPasses = completedWarmupPasses;
		pass.completedSettledPasses = completedSettledPasses;
		pass.passMs = measureElapsed(getNowMs, passStartedAt);
		trace.passes.push(pass);
	}

	const readStartedAt = getNowMs();
	const pixels = await renderBackend.readPixels({
		width,
		height,
	});
	trace.readPixelsMs = measureElapsed(getNowMs, readStartedAt);
	trace.elapsedMs = measureElapsed(getNowMs, startedAt);
	trace.settledPassesPlanned = settledPassesPlanned;

	return {
		pixels,
		readiness: finalizeReadiness(readinessPlan, {
			completedWarmupPasses,
			completedRenderPasses,
			settledPassesPlanned,
			completedSettledPasses,
			probeSupported,
			lastReadinessProbe,
			timedOut:
				completedWarmupPasses < warmupPassesRequired ||
				(probeSupported && completedSettledPasses < settledPassesPlanned),
			trace,
		}),
	};
}
