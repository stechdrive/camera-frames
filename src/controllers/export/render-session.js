import * as THREE from "three";

function clampSettledPasses(value) {
	const nextValue = Math.floor(Number(value));
	if (!Number.isFinite(nextValue) || nextValue < 0) {
		return 0;
	}

	return nextValue;
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
	const deadline = getNowMs() + readinessPlan.maxWaitMs;
	let completedWarmupPasses = 0;
	let completedRenderPasses = 0;
	let completedSettledPasses = 0;
	let lastReadinessProbe = null;
	const hasReadinessProbe =
		typeof renderBackend.captureReadinessState === "function";
	let settledPassesPlanned = hasReadinessProbe
		? clampSettledPasses(readinessPlan.settledPasses)
		: 0;
	let probeSupported = hasReadinessProbe && settledPassesPlanned > 0;

	while (true) {
		const canWait = getNowMs() <= deadline;
		const needsWarmup =
			completedWarmupPasses < readinessPlan.warmupPasses && canWait;
		const needsFinalPass =
			completedRenderPasses < completedWarmupPasses + 1;
		const needsSettled =
			probeSupported &&
			completedSettledPasses < settledPassesPlanned &&
			canWait;

		if (!needsWarmup && !needsFinalPass && !needsSettled) {
			break;
		}

		await renderBackend.prepareFrame({
			scene,
			camera,
			width,
			height,
			update: true,
		});
		await renderBackend.renderFrame({
			scene,
			camera,
			width,
			height,
		});
		completedRenderPasses += 1;

		if (needsWarmup) {
			completedWarmupPasses += 1;
		}

		if (probeSupported) {
			lastReadinessProbe = renderBackend.captureReadinessState({
				scene,
				camera,
				width,
				height,
			});

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
	}

	return {
		pixels: await renderBackend.readPixels({
			width,
			height,
		}),
		readiness: finalizeReadiness(readinessPlan, {
			completedWarmupPasses,
			completedRenderPasses,
			settledPassesPlanned,
			completedSettledPasses,
			probeSupported,
			lastReadinessProbe,
			timedOut:
				completedWarmupPasses < readinessPlan.warmupPasses ||
				(probeSupported && completedSettledPasses < settledPassesPlanned),
		}),
	};
}
