export async function renderVideoFrameSnapshotSession(
	{
		targetDocument,
		targetExportSettings,
		outputCamera,
		width,
		height,
		renderableSceneAssets,
		sceneAssets,
		backgroundCanvas,
		referenceImageDocument,
		referenceImagesExportSessionEnabled,
		t,
	},
	{
		phaseTracker,
		renderConfiguredSceneCapture,
		clonePixels,
		renderGuideLayerPixels,
		renderReferenceImageLayersForShotCamera,
	},
) {
	const { emitPhase, completePhase } = phaseTracker;
	const includeReferenceImages = referenceImagesExportSessionEnabled !== false;
	const videoExportSettings = {
		...targetExportSettings,
		exportFormat: "webm",
		exportModelLayers: false,
		exportSplatLayers: false,
	};

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

	const gridGuidePixels = videoExportSettings.exportGridOverlay
		? await (() => {
				emitPhase("guides", t("overlay.exportPhaseDetailGuidesGrid"));
				return renderGuideLayerPixels({
					camera: outputCamera,
					width,
					height,
					gridVisible: true,
					eyeLevelVisible: false,
					gridLayerMode: videoExportSettings.exportGridLayerMode,
				});
			})()
		: null;
	const eyeLevelPixels = videoExportSettings.exportGridOverlay
		? await (() => {
				emitPhase("guides", t("overlay.exportPhaseDetailGuidesEyeLevel"));
				return renderGuideLayerPixels({
					camera: outputCamera,
					width,
					height,
					gridVisible: false,
					eyeLevelVisible: true,
					gridLayerMode: videoExportSettings.exportGridLayerMode,
				});
			})()
		: null;
	if (videoExportSettings.exportGridOverlay) {
		completePhase("guides");
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
		applyOpacity: true,
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
		exportSettings: videoExportSettings,
		sceneAssets,
		readiness: sceneCapture.readiness,
		maskPasses: [],
		backgroundCanvas,
		gridGuidePixels,
		eyeLevelPixels,
		referenceImageLayers,
		psdBasePixels: null,
		modelLayers: [],
		modelDebugGroups: [],
		splatLayers: [],
		splatDebugGroups: [],
	};
}
