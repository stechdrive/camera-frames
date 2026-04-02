import * as THREE from "three";

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
	{ scene, camera, width, height, sceneAssets },
	{ buildReadinessPlan, finalizeReadiness, getNowMs, renderBackend } = {},
) {
	const readinessPlan = buildReadinessPlan({
		sceneAssets,
	});
	const deadline = getNowMs() + readinessPlan.maxWaitMs;
	let completedWarmupPasses = 0;

	while (
		completedWarmupPasses < readinessPlan.warmupPasses &&
		getNowMs() <= deadline
	) {
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
		completedWarmupPasses += 1;
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

	return {
		pixels: await renderBackend.readPixels({
			width,
			height,
		}),
		readiness: finalizeReadiness(readinessPlan, {
			completedWarmupPasses,
			timedOut: completedWarmupPasses < readinessPlan.warmupPasses,
		}),
	};
}
