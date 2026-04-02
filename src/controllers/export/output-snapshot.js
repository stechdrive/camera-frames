export async function renderOutputSnapshotSession(
	{
		scene,
		targetDocument,
		targetExportSettings,
		outputCamera,
		width,
		height,
		renderableSceneAssets,
		sceneAssets,
		backgroundCanvas,
		passPlan,
		referenceImageDocument,
		referenceImagesExportSessionEnabled,
		t,
	},
	{
		phaseTracker,
		renderConfiguredSceneCapture,
		clonePixels,
		renderGuideLayerPixels,
		renderMaskPassSnapshots,
		renderPsdBasePixels,
		renderModelLayerDocuments,
		renderSplatLayerDocuments,
		renderReferenceImageLayersForShotCamera,
	},
) {
	const { emitPhase, completePhase } = phaseTracker;
	const includePsdLayers = targetExportSettings.exportFormat === "psd";
	const includeReferenceImages = referenceImagesExportSessionEnabled !== false;

	emitPhase("prepare");
	completePhase("prepare");

	emitPhase("beauty");
	const sceneCapture = await renderConfiguredSceneCapture({
		camera: outputCamera,
		width,
		height,
		sceneAssets: renderableSceneAssets,
		sceneBackground: null,
		clearAlpha: 0,
		guidesVisible: false,
		resolveAssetRole: (asset) => {
			if (asset.exportRole === "omit") {
				return "hide";
			}
			return "normal";
		},
	});
	const beautyPixels = clonePixels(sceneCapture.pixels);
	completePhase("beauty");

	const gridGuidePixels = targetExportSettings.exportGridOverlay
		? await (() => {
				emitPhase("guides", t("overlay.exportPhaseDetailGuidesGrid"));
				return renderGuideLayerPixels({
					camera: outputCamera,
					width,
					height,
					gridVisible: true,
					eyeLevelVisible: false,
					gridLayerMode: targetExportSettings.exportGridLayerMode,
				});
			})()
		: null;
	const eyeLevelPixels = targetExportSettings.exportGridOverlay
		? await (() => {
				emitPhase("guides", t("overlay.exportPhaseDetailGuidesEyeLevel"));
				return renderGuideLayerPixels({
					camera: outputCamera,
					width,
					height,
					gridVisible: false,
					eyeLevelVisible: true,
					gridLayerMode: targetExportSettings.exportGridLayerMode,
				});
			})()
		: null;
	if (targetExportSettings.exportGridOverlay) {
		completePhase("guides");
	}

	const hasMaskPasses = passPlan.masks.some(
		(maskPass) => maskPass.assetIds?.length,
	);
	if (hasMaskPasses) {
		emitPhase("masks");
	}
	const maskPasses = await renderMaskPassSnapshots({
		scene,
		camera: outputCamera,
		width,
		height,
		sceneAssets,
		maskPasses: passPlan.masks,
		onProgress: ({ index, count, name }) =>
			emitPhase(
				"masks",
				t("overlay.exportPhaseDetailMaskBatch", { index, count, name }),
			),
	});
	if (hasMaskPasses) {
		completePhase("masks");
	}

	if (includePsdLayers && targetExportSettings.exportModelLayers) {
		emitPhase("psd-base");
	}
	const psdBasePixels = includePsdLayers
		? await renderPsdBasePixels({
				camera: outputCamera,
				width,
				height,
				sceneAssets: renderableSceneAssets,
				exportSettings: targetExportSettings,
			})
		: null;
	if (includePsdLayers && targetExportSettings.exportModelLayers) {
		completePhase("psd-base");
		emitPhase("model-layers");
	}

	const modelLayers = includePsdLayers
		? await renderModelLayerDocuments({
				camera: outputCamera,
				width,
				height,
				sceneAssets: renderableSceneAssets,
				exportSettings: targetExportSettings,
				onProgress: ({ index, count, name }) =>
					emitPhase(
						"model-layers",
						t("overlay.exportPhaseDetailModelLayersBatch", {
							index,
							count,
							name,
						}),
					),
			})
		: { layers: [], debugGroups: [] };
	if (includePsdLayers && targetExportSettings.exportModelLayers) {
		completePhase("model-layers");
	}

	if (includePsdLayers && targetExportSettings.exportSplatLayers) {
		emitPhase("splat-layers");
	}
	const splatLayers = includePsdLayers
		? await renderSplatLayerDocuments({
				camera: outputCamera,
				width,
				height,
				sceneAssets: renderableSceneAssets,
				exportSettings: targetExportSettings,
				onProgress: ({ index, count, name }) =>
					emitPhase(
						"splat-layers",
						t("overlay.exportPhaseDetailSplatLayersBatch", {
							index,
							count,
							name,
						}),
					),
			})
		: { layers: [], debugGroups: [] };
	if (includePsdLayers && targetExportSettings.exportSplatLayers) {
		completePhase("splat-layers");
	}

	if (includeReferenceImages) {
		emitPhase("reference-images");
	}
	const referenceImageLayers = await renderReferenceImageLayersForShotCamera({
		referenceImageDocument,
		exportSessionEnabled: referenceImagesExportSessionEnabled,
		documentState: targetDocument,
		width,
		height,
		previewContextError: t("error.previewContext"),
		applyOpacity: targetExportSettings.exportFormat !== "psd",
		onProgress: ({ index, count, name }) =>
			emitPhase(
				"reference-images",
				t("overlay.exportPhaseDetailReferenceImagesBatch", {
					index,
					count,
					name,
				}),
			),
	});
	if (includeReferenceImages) {
		completePhase("reference-images");
	}

	return {
		width,
		height,
		pixels: beautyPixels,
		exportSettings: targetExportSettings,
		sceneAssets,
		readiness: sceneCapture.readiness,
		maskPasses,
		backgroundCanvas,
		gridGuidePixels,
		eyeLevelPixels,
		referenceImageLayers,
		psdBasePixels,
		modelLayers: modelLayers.layers,
		modelDebugGroups: modelLayers.debugGroups,
		splatLayers: splatLayers.layers,
		splatDebugGroups: splatLayers.debugGroups,
	};
}
