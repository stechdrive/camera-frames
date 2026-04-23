import {
	buildViewportLodExportReadinessPolicy,
	resolveEffectiveViewportLodScale,
	resolveExportViewportLodScale,
} from "../../ui/viewport-lod-scale.js";

function resolveStoreViewportLodScale(store) {
	const effectiveScale = store?.viewportLod?.effectiveScale?.value;
	if (effectiveScale !== null && effectiveScale !== undefined) {
		return resolveEffectiveViewportLodScale({ userScale: effectiveScale });
	}
	return resolveEffectiveViewportLodScale({
		userScale: store?.viewportLod?.userScale?.value ?? null,
	});
}

export function createSnapshotPhaseTracker(
	{
		targetExportSettings,
		passPlan,
		includeReferenceImages,
		onProgress = null,
		t,
	},
	{ getPhaseDefinitions, getPhaseDefaultDetail } = {},
) {
	const phaseDefinitions = getPhaseDefinitions({
		exportFormat: targetExportSettings.exportFormat,
		exportGridOverlay: targetExportSettings.exportGridOverlay,
		hasMasks: passPlan.masks.some((maskPass) => maskPass.assetIds?.length),
		exportModelLayers: targetExportSettings.exportModelLayers,
		exportSplatLayers: targetExportSettings.exportSplatLayers,
		includeReferenceImages,
		t,
	});
	const completedPhaseIds = new Set();

	return {
		definitions: phaseDefinitions,
		emitPhase(id, detail = "", progress = null) {
			const phase = phaseDefinitions.find((entry) => entry.id === id) ?? null;
			onProgress?.({
				id,
				label: phase?.label ?? "",
				detail:
					detail ||
					getPhaseDefaultDetail(id, targetExportSettings.exportFormat, t),
				definitions: phaseDefinitions,
				completedIds: new Set(completedPhaseIds),
				activeId: id,
				progress,
			});
		},
		completePhase(id) {
			completedPhaseIds.add(id);
		},
	};
}

export async function withOutputSnapshotSession(
	{ shotCameraId },
	{
		scene,
		spark,
		guides,
		guideOverlay,
		shotCameraRegistry,
		store,
		getShotCameraDocument,
		getShotCameraExportSettings,
		getActiveOutputCamera,
		getOutputSizeState,
		getRenderableSceneAssets,
		buildSceneAssetExportMetadata,
		buildExportPassPlan,
		createSolidColorCanvas,
		syncActiveShotCameraFromDocument,
		syncShotProjection,
		syncOutputCamera,
		updateShotCameraHelpers,
		setRenderLock,
	},
	callback,
) {
	const targetDocument = getShotCameraDocument(shotCameraId);
	const previousShotCameraId = store.workspace.activeShotCameraId.value;
	const shouldRestore = shotCameraId && shotCameraId !== previousShotCameraId;
	const previousGuidesVisible = guides.visible;
	const previousGuideOverlayState = guideOverlay.captureState();
	const previousSparkAutoUpdate = spark.autoUpdate;
	const previewLodScale = resolveStoreViewportLodScale(store);
	const exportLodScale = resolveExportViewportLodScale(previewLodScale);
	const readinessPolicy =
		buildViewportLodExportReadinessPolicy(previewLodScale);
	const previousHelperVisibility = new Map();
	const targetExportSettings = getShotCameraExportSettings(targetDocument);

	for (const [entryId, entry] of shotCameraRegistry.entries()) {
		previousHelperVisibility.set(entryId, entry.helper.visible);
		entry.helper.visible = false;
	}

	guides.visible = false;

	if (shouldRestore) {
		store.workspace.activeShotCameraId.value = shotCameraId;
	}

	try {
		setRenderLock(true);
		spark.lodSplatScale = exportLodScale;
		syncActiveShotCameraFromDocument();
		syncShotProjection();
		syncOutputCamera();

		const outputCamera = getActiveOutputCamera();
		const { width, height } = getOutputSizeState(targetDocument);
		const renderableSceneAssets = getRenderableSceneAssets();
		const sceneAssets = buildSceneAssetExportMetadata(renderableSceneAssets);
		const backgroundColor = scene.background?.isColor
			? `#${scene.background.getHexString()}`
			: "#08111d";
		const backgroundCanvas = createSolidColorCanvas(
			width,
			height,
			backgroundColor,
		);
		const passPlan = buildExportPassPlan(sceneAssets);

		spark.autoUpdate = false;
		guideOverlay.applyState({
			gridVisible: false,
			eyeLevelVisible: false,
			gridLayerMode: targetExportSettings.exportGridLayerMode,
		});

		return await callback({
			targetDocument,
			targetExportSettings,
			outputCamera,
			width,
			height,
			renderableSceneAssets,
			sceneAssets,
			backgroundCanvas,
			passPlan,
			previewLodScale,
			exportLodScale,
			readinessPolicy,
		});
	} finally {
		try {
			spark.autoUpdate = previousSparkAutoUpdate;
			spark.lodSplatScale = resolveStoreViewportLodScale(store);
			guides.visible = previousGuidesVisible;
			guideOverlay.applyState(previousGuideOverlayState);
			for (const [entryId, entry] of shotCameraRegistry.entries()) {
				entry.helper.visible = previousHelperVisibility.get(entryId) ?? false;
			}

			if (shouldRestore) {
				store.workspace.activeShotCameraId.value = previousShotCameraId;
				syncActiveShotCameraFromDocument();
				syncShotProjection();
				syncOutputCamera();
			}

			updateShotCameraHelpers();
		} finally {
			setRenderLock(false);
		}
	}
}
