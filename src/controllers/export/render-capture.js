export async function renderConfiguredSceneCapture(
	{
		camera,
		width,
		height,
		sceneAssets,
		resolveAssetRole,
		guidesVisible = false,
		sceneBackground = null,
		clearAlpha = 0,
	},
	{
		scene,
		withAssetRenderState,
		renderScenePixelsWithReadiness,
		buildSceneAssetExportMetadata,
		flipPixels,
		clonePixels = (pixels) => (pixels ? new Uint8Array(pixels) : pixels),
	} = {},
) {
	const allowedAssetIds = new Set(sceneAssets.map((asset) => asset.id));
	const capture = await withAssetRenderState(
		{
			sceneBackground,
			clearAlpha,
			guidesVisible,
			resolveAssetRole: (asset) => {
				if (!allowedAssetIds.has(asset.id)) {
					return "hide";
				}
				return resolveAssetRole(asset);
			},
		},
		() =>
			renderScenePixelsWithReadiness({
				scene,
				camera,
				width,
				height,
				sceneAssets: buildSceneAssetExportMetadata(sceneAssets),
			}),
	);
	return {
		...capture,
		pixels: flipPixels(clonePixels(capture.pixels), width, height),
	};
}

export async function renderConfiguredScenePixels(
	config,
	{ renderCapture = renderConfiguredSceneCapture, ...captureDependencies } = {},
) {
	const capture = await renderCapture(config, captureDependencies);
	return capture.pixels;
}

export async function renderPsdBasePixels(
	{ camera, width, height, sceneAssets, exportSettings },
	{ renderScenePixels = renderConfiguredScenePixels } = {},
) {
	if (!exportSettings.exportModelLayers) {
		return null;
	}

	return renderScenePixels({
		camera,
		width,
		height,
		sceneAssets,
		guidesVisible: false,
		sceneBackground: null,
		clearAlpha: 0,
		resolveAssetRole: (asset) => {
			if (asset.exportRole === "omit") {
				return "hide";
			}
			if (asset.kind === "model") {
				return "hide";
			}
			if (exportSettings.exportSplatLayers && asset.kind === "splat") {
				return "hide";
			}
			return "normal";
		},
	});
}

export async function renderMaskPassSnapshots(
	{ scene, camera, width, height, sceneAssets, maskPasses, onProgress = null },
	{
		withMaskSceneState,
		renderScenePixelsWithReadiness,
		buildSceneAssetExportMetadata,
		getSceneAssets,
		flipPixels,
		clonePixels = (pixels) => (pixels ? new Uint8Array(pixels) : pixels),
	} = {},
) {
	const renderedMaskPasses = [];
	const allowedAssetIds = new Set(sceneAssets.map((asset) => asset.id));

	for (const [index, maskPass] of maskPasses.entries()) {
		if (!maskPass.assetIds?.length) {
			continue;
		}
		onProgress?.({
			index: index + 1,
			count: maskPasses.length,
			name: maskPass.name,
		});

		const maskCapture = await withMaskSceneState(
			maskPass,
			allowedAssetIds,
			() =>
				renderScenePixelsWithReadiness({
					scene,
					camera,
					width,
					height,
					sceneAssets: buildSceneAssetExportMetadata(getSceneAssets()),
				}),
		);
		const maskPixels = clonePixels(maskCapture.pixels);
		renderedMaskPasses.push({
			...maskPass,
			pixels: flipPixels(maskPixels, width, height),
		});
	}

	return renderedMaskPasses;
}
