import { WORKSPACE_PANE_CAMERA } from "../workspace-model.js";

export function createControllerApi({
	state,
	animationController = null,
	cameraController,
	exportController,
	frameController,
	historyController,
	interactionController,
	lightingController,
	measurementController,
	outputFrameController,
	perSplatEditController = null,
	assetController,
	projectController,
	referenceImageController,
	runtimeController,
	viewportToolController,
	guideOverlay,
	setLocale,
	setViewportTransformMode,
	toggleViewportTransformMode,
	setViewportSelectMode,
	toggleViewportSelectMode,
	setSplatEditMode,
	toggleSplatEditMode,
	setViewportReferenceImageEditMode,
	activateViewportReferenceImageEditModeImplicit,
	toggleViewportReferenceImageEditMode,
	setViewportPivotEditMode,
	toggleViewportPivotEditMode,
	setMeasurementMode,
	toggleMeasurementMode,
	setViewportProjectionMode,
	alignViewportToOrthographicView,
	toggleViewportOrthographicAxis,
	setActiveShotCameraPoseAngle,
	moveActiveShotCameraLocalAxis,
	resetSelectedAssetWorkingPivot,
	clearSceneAssetSelection,
	openFiles,
	handleAssetInputChange,
	startNewProject,
	saveProject,
	exportProject,
	clearScene,
	getActiveCameraHeadingDeg,
	getActiveShotCameraPoseState,
	executeViewportPieAction,
	toggleZoomTool,
	helpCommands = null,
	mobileUiScaleCommands = null,
	viewportLodScaleCommands = null,
	disposeViewportLodScaleBinding = null,
	disposeSceneResources,
}) {
	const shouldRouteShotCameraAutoKey = () =>
		animationController?.shouldHandleShotCameraAutoKey?.() === true;
	const shouldRouteSceneAssetAutoKey = (assetId) =>
		animationController?.shouldHandleSceneAssetAutoKey?.(assetId) === true;
	const setShotCameraLensShiftAxis = (axis, nextPercent) =>
		shouldRouteShotCameraAutoKey()
			? animationController?.setShotCameraLensShiftAxisKey?.(axis, nextPercent)
			: cameraController.setShotCameraLensShiftAxis(axis, nextPercent);
	const setActiveShotCameraPositionAxis = (axis, nextValue) =>
		shouldRouteShotCameraAutoKey()
			? animationController?.setShotCameraPositionKey?.(axis, nextValue)
			: cameraController.setActiveShotCameraPositionAxis(axis, nextValue);
	const setAssetWorldScale = (assetId, nextValue) =>
		shouldRouteSceneAssetAutoKey(assetId)
			? animationController?.setSceneAssetWorldScaleKey?.(assetId, nextValue)
			: assetController.setAssetWorldScale(assetId, nextValue);
	const setAssetPosition = (assetId, axis, nextValue) =>
		shouldRouteSceneAssetAutoKey(assetId)
			? animationController?.setSceneAssetPositionKey?.(
					assetId,
					axis,
					nextValue,
				)
			: assetController.setAssetPosition(assetId, axis, nextValue);
	const setAssetRotationDegrees = (assetId, axis, nextValue) =>
		shouldRouteSceneAssetAutoKey(assetId)
			? animationController?.setSceneAssetRotationKey?.(
					assetId,
					axis,
					nextValue,
				)
			: assetController.setAssetRotationDegrees(assetId, axis, nextValue);

	return {
		setMode: cameraController.setMode,
		toggleAnimationEnabled: (...args) =>
			animationController?.toggleAnimationEnabled?.(...args),
		setAnimationEnabled: (...args) =>
			animationController?.setAnimationEnabled?.(...args),
		setTimelinePanelOpen: (...args) =>
			animationController?.setTimelinePanelOpen?.(...args),
		setTimelinePanelHeight: (...args) =>
			animationController?.setTimelinePanelHeight?.(...args),
		setTimelineZoom: (...args) =>
			animationController?.setTimelineZoom?.(...args),
		zoomTimelineIn: (...args) => animationController?.zoomTimelineIn?.(...args),
		zoomTimelineOut: (...args) =>
			animationController?.zoomTimelineOut?.(...args),
		setTimelineFrame: (...args) =>
			animationController?.setTimelineFrame?.(...args),
		setAnimationFps: (...args) =>
			animationController?.setAnimationFps?.(...args),
		setAnimationDurationFrames: (...args) =>
			animationController?.setAnimationDurationFrames?.(...args),
		setAnimationAutoKey: (...args) =>
			animationController?.setAnimationAutoKey?.(...args),
		toggleAutoKeyForTarget: (...args) =>
			animationController?.toggleAutoKeyForTarget?.(...args),
		setAnimationKeyTargetMode: (...args) =>
			animationController?.setAnimationKeyTargetMode?.(...args),
		insertKeyForSelection: (...args) =>
			animationController?.insertKeyForSelection?.(...args),
		playTimeline: (...args) => animationController?.playTimeline?.(...args),
		pauseTimeline: (...args) => animationController?.pauseTimeline?.(...args),
		jumpTimelineStart: (...args) =>
			animationController?.jumpTimelineStart?.(...args),
		jumpTimelineEnd: (...args) =>
			animationController?.jumpTimelineEnd?.(...args),
		setLocale,
		setBaseFovX: (...args) =>
			shouldRouteShotCameraAutoKey()
				? animationController?.setShotCameraBaseFovXKey?.(...args)
				: cameraController.setBaseFovX(...args),
		setShotCameraLensShiftAxis,
		setShotCameraLensShiftXPercent: (nextPercent) =>
			setShotCameraLensShiftAxis("x", nextPercent),
		setShotCameraLensShiftYPercent: (nextPercent) =>
			setShotCameraLensShiftAxis("y", nextPercent),
		setViewportBaseFovX: cameraController.setViewportBaseFovX,
		setViewportTransformSpace: viewportToolController.setViewportTransformSpace,
		setViewportTransformMode,
		toggleViewportTransformMode,
		setViewportSelectMode,
		toggleViewportSelectMode,
		setSplatEditMode,
		toggleSplatEditMode,
		setSplatEditTool: (...args) =>
			perSplatEditController?.setSplatEditTool?.(...args),
		setSplatEditBrushSize: (...args) =>
			perSplatEditController?.setSplatEditBrushSize?.(...args),
		setSplatEditBrushDepthMode: (...args) =>
			perSplatEditController?.setSplatEditBrushDepthMode?.(...args),
		setSplatEditBrushDepth: (...args) =>
			perSplatEditController?.setSplatEditBrushDepth?.(...args),
		setSplatEditBoxCenterAxis: (...args) =>
			perSplatEditController?.setSplatEditBoxCenterAxis?.(...args),
		setSplatEditBoxSizeAxis: (...args) =>
			perSplatEditController?.setSplatEditBoxSizeAxis?.(...args),
		setSplatEditBoxRotationAxis: (...args) =>
			perSplatEditController?.setSplatEditBoxRotationAxis?.(...args),
		scaleSplatEditBoxUniform: (...args) =>
			perSplatEditController?.scaleSplatEditBoxUniform?.(...args),
		fitSplatEditBoxToScope: (...args) =>
			perSplatEditController?.fitSplatEditBoxToScope?.(...args),
		applySplatEditBoxSelection: (...args) =>
			perSplatEditController?.applySplatEditBoxSelection?.(...args),
		deleteSelectedSplats: (...args) =>
			perSplatEditController?.deleteSelectedSplats?.(...args),
		separateSelectedSplats: (...args) =>
			perSplatEditController?.separateSelectedSplats?.(...args),
		duplicateSelectedSplats: (...args) =>
			perSplatEditController?.duplicateSelectedSplats?.(...args),
		clearSplatSelection: (...args) =>
			perSplatEditController?.clearSplatSelection?.(...args),
		selectAllSplats: (...args) =>
			perSplatEditController?.selectAllSplats?.(...args),
		invertSplatSelection: (...args) =>
			perSplatEditController?.invertSplatSelection?.(...args),
		rebuildSplatEditLod: (...args) =>
			perSplatEditController?.rebuildSplatEditLod?.(...args),
		setViewportReferenceImageEditMode,
		activateViewportReferenceImageEditModeImplicit,
		toggleViewportReferenceImageEditMode,
		setViewportPivotEditMode,
		toggleViewportPivotEditMode,
		setMeasurementMode,
		toggleMeasurementMode,
		setViewportProjectionMode,
		alignViewportToOrthographicView,
		toggleViewportOrthographicAxis,
		setViewportTransformHover: viewportToolController.setViewportTransformHover,
		setBoxWidthPercent: outputFrameController.setBoxWidthPercent,
		setBoxHeightPercent: outputFrameController.setBoxHeightPercent,
		setViewZoomPercent: outputFrameController.setViewZoomPercent,
		fitOutputFrameToSafeArea: outputFrameController.fitOutputFrameToSafeArea,
		canFitOutputFrameToSafeArea:
			outputFrameController.canFitOutputFrameToSafeArea,
		setAnchor: outputFrameController.setAnchor,
		setShotCameraClippingMode: cameraController.setShotCameraClippingMode,
		setShotCameraNear: cameraController.setShotCameraNear,
		setShotCameraFar: cameraController.setShotCameraFar,
		setShotCameraRollLock: cameraController.setShotCameraRollLock,
		setActiveShotCameraPositionAxis,
		setActiveShotCameraPoseAngle: (axis, nextValue) =>
			shouldRouteShotCameraAutoKey()
				? animationController?.setShotCameraPoseAngleKey?.(axis, nextValue)
				: setActiveShotCameraPoseAngle(axis, nextValue),
		moveActiveShotCameraLocalAxis,
		setShotCameraName: cameraController.setShotCameraName,
		setShotCameraExportName: cameraController.setShotCameraExportName,
		setShotCameraExportFormat: cameraController.setShotCameraExportFormat,
		setShotCameraExportGridOverlay:
			cameraController.setShotCameraExportGridOverlay,
		setShotCameraExportGridLayerMode:
			cameraController.setShotCameraExportGridLayerMode,
		setShotCameraExportModelLayers:
			cameraController.setShotCameraExportModelLayers,
		setShotCameraExportSplatLayers:
			cameraController.setShotCameraExportSplatLayers,
		setCompositionGuideEnabled: cameraController.setCompositionGuideEnabled,
		setCompositionGuideScope: cameraController.setCompositionGuideScope,
		setCompositionGuidePattern: cameraController.setCompositionGuidePattern,
		setExportTarget: exportController.setExportTarget,
		toggleExportPreset: exportController.toggleExportPreset,
		setReferenceImageExportSessionEnabled:
			exportController.setReferenceImageExportSessionEnabled,
		selectFrame: frameController.selectFrame,
		createFrame: frameController.createFrame,
		duplicateActiveFrame: frameController.duplicateActiveFrame,
		duplicateSelectedFrames: frameController.duplicateSelectedFrames,
		setFrameName: frameController.setFrameName,
		deleteSelectedFrames: frameController.deleteSelectedFrames,
		deleteFrame: frameController.deleteFrame,
		deleteActiveFrame: frameController.deleteActiveFrame,
		setFrameMaskMode: frameController.setFrameMaskMode,
		toggleFrameMaskMode: frameController.toggleFrameMaskMode,
		setFrameMaskOpacity: frameController.setFrameMaskOpacity,
		setFrameMaskShape: frameController.setFrameMaskShape,
		setFrameTrajectoryMode: frameController.setFrameTrajectoryMode,
		setFrameTrajectoryNodeMode: frameController.setFrameTrajectoryNodeMode,
		setFrameTrajectoryExportSource:
			frameController.setFrameTrajectoryExportSource,
		setFrameTrajectoryEditMode: frameController.setFrameTrajectoryEditMode,
		toggleFrameTrajectoryEditMode:
			frameController.toggleFrameTrajectoryEditMode,
		startFrameDrag: frameController.startFrameDrag,
		startSelectedFramesDrag: frameController.startSelectedFramesDrag,
		startFrameResize: frameController.startFrameResize,
		startSelectedFramesResize: frameController.startSelectedFramesResize,
		startFrameRotate: frameController.startFrameRotate,
		startSelectedFramesRotate: frameController.startSelectedFramesRotate,
		startFrameAnchorDrag: frameController.startFrameAnchorDrag,
		startSelectedFramesAnchorDrag:
			frameController.startSelectedFramesAnchorDrag,
		startFrameTrajectoryHandleDrag:
			frameController.startFrameTrajectoryHandleDrag,
		startOutputFramePan: outputFrameController.startOutputFramePan,
		startOutputFrameResize: outputFrameController.startOutputFrameResize,
		selectShotCamera: cameraController.selectShotCamera,
		createShotCamera: cameraController.createShotCamera,
		duplicateActiveShotCamera: cameraController.duplicateActiveShotCamera,
		deleteActiveShotCamera: cameraController.deleteActiveShotCamera,
		selectSceneAsset: assetController.selectSceneAsset,
		clearSceneAssetSelection,
		pickViewportAssetAtPointer:
			viewportToolController.pickViewportAssetAtPointer,
		startViewportTransformDrag:
			viewportToolController.startViewportTransformDrag,
		selectMeasurementPoint: (...args) =>
			measurementController?.selectMeasurementPoint?.(...args),
		startMeasurementAxisDrag: (...args) =>
			measurementController?.startMeasurementAxisDrag?.(...args),
		setMeasurementLengthInputText: (...args) =>
			measurementController?.setMeasurementLengthInputText?.(...args),
		applyMeasurementScale: (...args) =>
			measurementController?.applyMeasurementScale?.(...args),
		setAssetWorldScale,
		setAssetTransform: assetController.setAssetTransform,
		resetAssetWorldScale: assetController.resetAssetWorldScale,
		resetSelectedSceneAssetsWorldScale:
			assetController.resetSelectedSceneAssetsWorldScale,
		resetSelectedAssetWorkingPivot,
		setAssetPosition,
		offsetSelectedSceneAssetsPosition:
			assetController.offsetSelectedSceneAssetsPosition,
		setAssetRotationDegrees,
		offsetSelectedSceneAssetsRotationDegrees:
			assetController.offsetSelectedSceneAssetsRotationDegrees,
		setAssetVisibility: assetController.setAssetVisibility,
		setAssetLabel: assetController.setAssetLabel,
		duplicateSelectedSceneAssets: assetController.duplicateSelectedSceneAssets,
		deleteSelectedSceneAssets: assetController.deleteSelectedSceneAssets,
		setSelectedSceneAssetsVisibility:
			assetController.setSelectedSceneAssetsVisibility,
		applyAssetTransform: assetController.applyAssetTransform,
		scaleSelectedSceneAssetsByFactor:
			assetController.scaleSelectedSceneAssetsByFactor,
		moveAssetUp: assetController.moveAssetUp,
		moveAssetDown: assetController.moveAssetDown,
		moveAssetToIndex: assetController.moveAssetToIndex,
		setAssetExportRole: assetController.setAssetExportRole,
		setAssetMaskGroup: assetController.setAssetMaskGroup,
		setLightingAmbient: lightingController.setAmbient,
		setModelLightEnabled: lightingController.setModelLightEnabled,
		setModelLightIntensity: lightingController.setModelLightIntensity,
		setModelLightAzimuthDeg: lightingController.setModelLightAzimuthDeg,
		setModelLightElevationDeg: lightingController.setModelLightElevationDeg,
		setModelLightDirection: lightingController.setModelLightDirection,
		resetModelLightDirection: lightingController.resetModelLightDirection,
		getActiveCameraHeadingDeg,
		openFiles,
		openReferenceImageFiles: referenceImageController.openReferenceImageFiles,
		importReferenceImageFiles:
			referenceImageController.importReferenceImageFiles,
		supportsReferenceImageFile:
			referenceImageController.supportsReferenceImageFile,
		startNewProject,
		openProjectSource: (...args) =>
			projectController?.openProjectSource?.(...args),
		saveProject,
		exportProject,
		clearScene,
		loadRemoteUrls: assetController.loadRemoteUrls,
		handleAssetInputChange,
		handleReferenceImageInputChange:
			referenceImageController.handleReferenceImageInputChange,
		setReferenceImagePreviewSessionVisible:
			referenceImageController.setPreviewSessionVisible,
		setActiveReferenceImagePreset:
			referenceImageController.setActiveReferenceImagePreset,
		setActiveReferenceImagePresetName:
			referenceImageController.setActiveReferenceImagePresetName,
		duplicateActiveReferenceImagePreset:
			referenceImageController.duplicateActiveReferenceImagePreset,
		deleteActiveReferenceImagePreset:
			referenceImageController.deleteActiveReferenceImagePreset,
		deleteSelectedReferenceImageItems:
			referenceImageController.deleteSelectedReferenceImageItems,
		clearReferenceImageSelection:
			referenceImageController.clearReferenceImageSelection,
		ensureReferenceImageEditingSelection:
			referenceImageController.ensureReferenceImageEditingSelection,
		isReferenceImageSelectionActive: () =>
			referenceImageController?.isReferenceImageSelectionActive?.() ?? false,
		getSelectedReferenceImageInspectorState:
			referenceImageController.getSelectedReferenceImageInspectorState,
		beginSelectedReferenceImageInspectorTransformSession:
			referenceImageController.beginSelectedReferenceImageInspectorTransformSession,
		endSelectedReferenceImageInspectorTransformSession:
			referenceImageController.endSelectedReferenceImageInspectorTransformSession,
		selectReferenceImageAsset:
			referenceImageController.selectReferenceImageAsset,
		selectReferenceImageItem: referenceImageController.selectReferenceImageItem,
		setReferenceImagePreviewVisible:
			referenceImageController.setReferenceImagePreviewVisible,
		setSelectedReferenceImagesPreviewVisible:
			referenceImageController.setSelectedReferenceImagesPreviewVisible,
		setReferenceImageExportEnabled:
			referenceImageController.setReferenceImageExportEnabled,
		setSelectedReferenceImagesExportEnabled:
			referenceImageController.setSelectedReferenceImagesExportEnabled,
		setSelectedReferenceImagesOpacity:
			referenceImageController.setSelectedReferenceImagesOpacity,
		setReferenceImageOpacity: referenceImageController.setReferenceImageOpacity,
		scaleSelectedReferenceImagesByFactor:
			referenceImageController.scaleSelectedReferenceImagesByFactor,
		applySelectedReferenceImagesScaleFromSession:
			referenceImageController.applySelectedReferenceImagesScaleFromSession,
		setReferenceImageScalePct:
			referenceImageController.setReferenceImageScalePct,
		offsetSelectedReferenceImagesRotationDeg:
			referenceImageController.offsetSelectedReferenceImagesRotationDeg,
		applySelectedReferenceImagesRotationFromSession:
			referenceImageController.applySelectedReferenceImagesRotationFromSession,
		setReferenceImageRotationDeg:
			referenceImageController.setReferenceImageRotationDeg,
		offsetSelectedReferenceImagesPosition:
			referenceImageController.offsetSelectedReferenceImagesPosition,
		offsetReferenceImageBoundsPosition:
			referenceImageController.offsetReferenceImageBoundsPosition,
		getReferenceImageLogicalBounds:
			referenceImageController.getReferenceImageLogicalBounds,
		getSelectedReferenceImageTransformSession:
			referenceImageController.getSelectedReferenceImageTransformSession,
		setReferenceImageOffsetPx:
			referenceImageController.setReferenceImageOffsetPx,
		setReferenceImageBoundsPosition:
			referenceImageController.setReferenceImageBoundsPosition,
		setReferenceImageGroup: referenceImageController.setReferenceImageGroup,
		setReferenceImageOrder: referenceImageController.setReferenceImageOrder,
		moveReferenceImageToDisplayTarget:
			referenceImageController.moveReferenceImageToDisplayTarget,
		startReferenceImageMove: referenceImageController.startReferenceImageMove,
		startReferenceImageResize:
			referenceImageController.startReferenceImageResize,
		startReferenceImageRotate:
			referenceImageController.startReferenceImageRotate,
		startReferenceImageAnchorDrag:
			referenceImageController.startReferenceImageAnchorDrag,
		activateShotCameraRollMode: (...args) => {
			if (state.mode !== WORKSPACE_PANE_CAMERA) {
				cameraController.setMode(WORKSPACE_PANE_CAMERA);
			}
			measurementController?.setMeasurementMode?.(false, { silent: true });
			return (
				interactionController?.activateShotCameraRollMode?.(...args) ?? false
			);
		},
		toggleZoomTool,
		openViewportPieMenuAtCenter: (...args) =>
			interactionController?.openViewportPieMenuAtCenter?.(...args) ?? false,
		copyViewportToShotCamera: cameraController.copyViewportToShotCamera,
		copyShotCameraToViewport: cameraController.copyShotCameraToViewport,
		resetActiveView: cameraController.resetActiveView,
		getActiveShotCameraPoseState,
		executeViewportPieAction,
		closeViewportPieMenu: (...args) =>
			interactionController?.closeViewportPieMenu(...args),
		downloadOutput: exportController.downloadOutput,
		downloadPng: exportController.downloadPng,
		downloadPsd: exportController.downloadPsd,
		__debugSetExportReadinessPolicyOverride:
			exportController.__debugSetExportReadinessPolicyOverride,
		__debugGetExportReadinessPolicyOverride:
			exportController.__debugGetExportReadinessPolicyOverride,
		__debugGetLastExportReadiness:
			exportController.__debugGetLastExportReadiness,
		__debugGetSceneAssets: () => assetController?.getSceneAssets?.() ?? [],
		__debugEnsureFullDataForSplatAssets: (...args) =>
			assetController?.ensureFullDataForSplatAssets?.(...args),
		beginHistoryTransaction: (label) =>
			historyController?.beginHistoryTransaction(label),
		commitHistoryTransaction: (label) =>
			historyController?.commitHistoryTransaction(label),
		cancelHistoryTransaction: () =>
			historyController?.cancelHistoryTransaction(),
		undoHistory: () => historyController?.undoHistory(),
		redoHistory: () => historyController?.redoHistory(),
		...(helpCommands || {}),
		...(mobileUiScaleCommands || {}),
		...(viewportLodScaleCommands || {}),
		dispose() {
			disposeViewportLodScaleBinding?.();
			measurementController?.dispose?.();
			perSplatEditController?.dispose?.();
			guideOverlay.dispose();
			lightingController?.dispose?.();
			disposeSceneResources?.();
			runtimeController.dispose();
		},
	};
}
