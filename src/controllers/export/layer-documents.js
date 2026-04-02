export async function renderModelLayerDocuments(
	{ camera, width, height, sceneAssets, exportSettings, onProgress = null },
	{
		renderScenePixels,
		createCanvasFromPixels,
		buildLayerMaskPixels,
		createAlphaPreviewPixels,
		exportDebugLayersEnabled = false,
	} = {},
) {
	if (!exportSettings.exportModelLayers) {
		return [];
	}

	const modelAssets = sceneAssets.filter((asset) => asset.kind === "model");
	if (modelAssets.length === 0) {
		return {
			layers: [],
			debugGroups: [],
		};
	}

	const modelLayers = [];
	const modelDebugGroups = [];
	for (const [index, modelAsset] of modelAssets.entries()) {
		onProgress?.({
			index: index + 1,
			count: modelAssets.length,
			name: modelAsset.label,
		});
		const sourcePixels = await renderScenePixels({
			camera,
			width,
			height,
			sceneAssets,
			resolveAssetRole: (asset) =>
				asset.id === modelAsset.id ? "normal" : "hide",
		});
		const modelVisibilityPixels = await renderScenePixels({
			camera,
			width,
			height,
			sceneAssets,
			resolveAssetRole: (asset) => {
				if (asset.id === modelAsset.id) {
					return "mask-target";
				}
				if (asset.exportRole === "omit") {
					return "hide";
				}
				if (asset.kind === "model") {
					return "mask-occluder";
				}
				return "hide";
			},
		});
		const splatOccluderPixels = await renderScenePixels({
			camera,
			width,
			height,
			sceneAssets,
			resolveAssetRole: (asset) => {
				if (asset.id === modelAsset.id) {
					return "depth-occluder";
				}
				if (asset.exportRole === "omit") {
					return "hide";
				}
				if (asset.kind === "splat") {
					return "mask-alpha-occluder";
				}
				return "hide";
			},
		});
		const layerMaskPixels = buildLayerMaskPixels(
			sourcePixels,
			modelVisibilityPixels,
			splatOccluderPixels,
		);
		modelLayers.push({
			name: modelAsset.label,
			canvas: createCanvasFromPixels(sourcePixels, width, height),
			mask: {
				canvas: createCanvasFromPixels(layerMaskPixels, width, height),
				left: 0,
				top: 0,
				right: width,
				bottom: height,
				defaultColor: 0,
			},
		});

		if (exportDebugLayersEnabled) {
			modelDebugGroups.push({
				name: `__DEBUG ${modelAsset.label}`,
				hidden: true,
				opened: false,
				children: [
					{
						name: "Source Alpha",
						canvas: createCanvasFromPixels(
							createAlphaPreviewPixels(sourcePixels),
							width,
							height,
						),
					},
					{
						name: "Model Visibility Alpha",
						canvas: createCanvasFromPixels(
							createAlphaPreviewPixels(modelVisibilityPixels),
							width,
							height,
						),
					},
					{
						name: "Splat Occluder Alpha",
						canvas: createCanvasFromPixels(
							createAlphaPreviewPixels(splatOccluderPixels),
							width,
							height,
						),
					},
					{
						name: "Final Mask",
						canvas: createCanvasFromPixels(layerMaskPixels, width, height),
					},
				],
			});
		}
	}

	return {
		layers: modelLayers,
		debugGroups: modelDebugGroups,
	};
}

export async function renderSplatLayerDocuments(
	{ camera, width, height, sceneAssets, exportSettings, onProgress = null },
	{
		renderScenePixels,
		createCanvasFromPixels,
		buildSplatLayerMaskPixels,
		createAlphaPreviewPixels,
		exportDebugLayersEnabled = false,
	} = {},
) {
	if (!exportSettings.exportSplatLayers) {
		return {
			layers: [],
			debugGroups: [],
		};
	}

	const splatAssets = sceneAssets.filter((asset) => asset.kind === "splat");
	if (splatAssets.length === 0) {
		return {
			layers: [],
			debugGroups: [],
		};
	}

	const splatLayers = [];
	const splatDebugGroups = [];

	for (let index = 0; index < splatAssets.length; index += 1) {
		const splatAsset = splatAssets[index];
		onProgress?.({
			index: index + 1,
			count: splatAssets.length,
			name: splatAsset.label,
		});
		const lowerSplatAssets = splatAssets.slice(index + 1);
		const lowerSplatIds = new Set(lowerSplatAssets.map((asset) => asset.id));
		const isBottomSplatLayer = index === splatAssets.length - 1;

		const sourcePixels = await renderScenePixels({
			camera,
			width,
			height,
			sceneAssets,
			resolveAssetRole: (asset) => {
				if (asset.kind === "model") {
					return "hide";
				}
				return asset.id === splatAsset.id ? "normal" : "hide";
			},
		});

		const overlay = {
			name: splatAsset.label,
			canvas: createCanvasFromPixels(sourcePixels, width, height),
		};

		if (!isBottomSplatLayer) {
			const lowerPixels = await renderScenePixels({
				camera,
				width,
				height,
				sceneAssets,
				resolveAssetRole: (asset) => {
					if (asset.kind === "model") {
						return "hide";
					}
					return lowerSplatIds.has(asset.id) ? "normal" : "hide";
				},
			});

			const compositePixels = await renderScenePixels({
				camera,
				width,
				height,
				sceneAssets,
				resolveAssetRole: (asset) => {
					if (asset.kind === "model") {
						return "hide";
					}
					return asset.id === splatAsset.id || lowerSplatIds.has(asset.id)
						? "normal"
						: "hide";
				},
			});

			const layerMaskPixels = buildSplatLayerMaskPixels(
				sourcePixels,
				compositePixels,
				lowerPixels,
				width,
				height,
			);
			overlay.mask = {
				canvas: createCanvasFromPixels(layerMaskPixels, width, height),
				left: 0,
				top: 0,
				right: width,
				bottom: height,
				defaultColor: 0,
			};

			if (exportDebugLayersEnabled) {
				splatDebugGroups.push({
					name: `__DEBUG ${splatAsset.label}`,
					hidden: true,
					opened: false,
					children: [
						{
							name: "Source Alpha",
							canvas: createCanvasFromPixels(
								createAlphaPreviewPixels(sourcePixels),
								width,
								height,
							),
						},
						{
							name: "Composite Alpha",
							canvas: createCanvasFromPixels(
								createAlphaPreviewPixels(compositePixels),
								width,
								height,
							),
						},
						{
							name: "Lower Alpha",
							canvas: createCanvasFromPixels(
								createAlphaPreviewPixels(lowerPixels),
								width,
								height,
							),
						},
						{
							name: "Final Mask",
							canvas: createCanvasFromPixels(layerMaskPixels, width, height),
						},
					],
				});
			}
		}

		splatLayers.push(overlay);
	}

	return {
		layers: splatLayers,
		debugGroups: splatDebugGroups,
	};
}
