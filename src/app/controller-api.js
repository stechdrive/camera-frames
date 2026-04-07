import { WORKSPACE_PANE_CAMERA } from "../workspace-model.js";

export function createControllerApi({
	store,
	state,
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
	disposeSceneResources,
}) {
	return {
		setMode: cameraController.setMode,
		setLocale,
		setBaseFovX: cameraController.setBaseFovX,
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
		clearSplatSelection: (...args) =>
			perSplatEditController?.clearSplatSelection?.(...args),
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
		setActiveShotCameraPositionAxis:
			cameraController.setActiveShotCameraPositionAxis,
		setActiveShotCameraPoseAngle,
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
		startFrameDrag: frameController.startFrameDrag,
		startSelectedFramesDrag: frameController.startSelectedFramesDrag,
		startFrameResize: frameController.startFrameResize,
		startSelectedFramesResize: frameController.startSelectedFramesResize,
		startFrameRotate: frameController.startFrameRotate,
		startSelectedFramesRotate: frameController.startSelectedFramesRotate,
		startFrameAnchorDrag: frameController.startFrameAnchorDrag,
		startSelectedFramesAnchorDrag:
			frameController.startSelectedFramesAnchorDrag,
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
		setAssetWorldScale: assetController.setAssetWorldScale,
		setAssetTransform: assetController.setAssetTransform,
		resetAssetWorldScale: assetController.resetAssetWorldScale,
		resetSelectedSceneAssetsWorldScale:
			assetController.resetSelectedSceneAssetsWorldScale,
		resetSelectedAssetWorkingPivot,
		setAssetPosition: assetController.setAssetPosition,
		offsetSelectedSceneAssetsPosition:
			assetController.offsetSelectedSceneAssetsPosition,
		setAssetRotationDegrees: assetController.setAssetRotationDegrees,
		offsetSelectedSceneAssetsRotationDegrees:
			assetController.offsetSelectedSceneAssetsRotationDegrees,
		setAssetVisibility: assetController.setAssetVisibility,
		setAssetLabel: assetController.setAssetLabel,
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
		beginHistoryTransaction: (label) =>
			historyController?.beginHistoryTransaction(label),
		commitHistoryTransaction: (label) =>
			historyController?.commitHistoryTransaction(label),
		cancelHistoryTransaction: () =>
			historyController?.cancelHistoryTransaction(),
		undoHistory: () => historyController?.undoHistory(),
		redoHistory: () => historyController?.redoHistory(),
		dispose() {
			measurementController?.dispose?.();
			perSplatEditController?.dispose?.();
			guideOverlay.dispose();
			lightingController?.dispose?.();
			disposeSceneResources?.();
			runtimeController.dispose();
		},
	};
}
