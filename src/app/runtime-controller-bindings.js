export function createRuntimeControllerBindings({
	renderer,
	scene,
	store,
	state,
	viewportShell,
	dropHint,
	anchorDot,
	assetController,
	importOpenedFiles,
	referenceImageController,
	projectController,
	historyController,
	interactionController,
	projectionController,
	viewportProjectionController,
	outputFrameController,
	frameController,
	viewportToolController,
	measurementController,
	perSplatEditController = null,
	viewportAxisGizmoController,
	exportController,
	updateDropHint,
	updateUi,
	updateOutputFrameOverlay,
	setStatus,
	startZoomToolDrag,
	toggleMeasurementMode,
	toggleZoomTool,
	toggleViewportSelectMode,
	toggleSplatEditMode,
	toggleViewportReferenceImageEditMode,
	toggleViewportTransformMode,
	toggleViewportPivotEditMode,
	openFiles,
	clearSceneAssetSelection,
	isInteractiveTextTarget,
	executeViewportPieAction,
	handleZoomToolDragMove,
	handleZoomToolDragEnd,
	handleResize,
	fpsMovement,
	pointerControls,
	getActiveCamera,
	guideOverlay,
	syncGuideOverlayState,
	syncViewportProjection,
	syncShotProjection,
	applyCameraViewProjection,
	updateShotCameraHelpers,
	getActiveCameraViewCamera,
	getActiveViewportCamera,
	updateCameraSummary,
	t,
	formatNumber,
	frameAllCameras,
	placeAllCamerasAtHome,
	syncControlsToMode,
	setExportStatus,
	projectPresentationSyncSuspendedRef,
} = {}) {
	return {
		renderer,
		scene,
		store,
		state,
		viewportShell,
		dropHint,
		anchorDot,
		assetController,
		importOpenedFiles,
		importReferenceImageFiles:
			referenceImageController.importReferenceImageFiles,
		supportsReferenceImageFile:
			referenceImageController.supportsReferenceImageFile,
		updateDropHint,
		updateUi,
		updateOutputFrameOverlay,
		setStatus,
		startOrbitAroundHitDrag: (...args) =>
			interactionController?.startOrbitAroundHitDrag(...args) ?? false,
		startZoomToolDrag,
		startLensAdjustDrag: (...args) =>
			interactionController?.startLensAdjustDrag(...args) ?? false,
		startShotCameraRollDrag: (...args) =>
			interactionController?.startShotCameraRollDrag(...args) ?? false,
		startViewportOrthographicPanDrag: (...args) =>
			interactionController?.startViewportOrthographicPanDrag?.(...args) ??
			false,
		toggleMeasurementMode,
		toggleZoomTool,
		toggleViewportSelectMode,
		toggleSplatEditMode,
		isSplatEditModeActive: () =>
			perSplatEditController?.isSplatEditModeActive?.() ?? false,
		isSplatEditBrushActive: () =>
			perSplatEditController?.isSplatEditBrushActive?.() ?? false,
		needsSplatEditBoxPlacement: () =>
			perSplatEditController?.needsSplatEditBoxPlacement?.() ?? false,
		placeSplatEditBoxAtPointer: (event) =>
			perSplatEditController?.placeSplatEditBoxAtPointer?.(event, {
				camera: getActiveCamera?.(),
				viewportRect: viewportShell?.getBoundingClientRect?.() ?? null,
			}) ?? false,
		applySplatEditBrushAtPointer: (event) =>
			perSplatEditController?.applySplatEditBrushAtPointer?.(event) ?? false,
		toggleViewportReferenceImageEditMode,
		toggleViewportTransformMode,
		toggleViewportPivotEditMode,
		openFiles,
		startNewProject: () => projectController?.startNewProject(),
		isProjectDirty: () => projectController?.isProjectDirty?.() ?? false,
		isPackageDirty: () => projectController?.isPackageDirty?.() ?? true,
		shouldWarnBeforeUnload: () =>
			projectController?.shouldWarnBeforeUnload?.() ?? false,
		syncProjectPresentation: () =>
			projectController?.syncProjectPresentation?.(),
		suspendProjectPresentationSync: (nextSuspended) => {
			projectPresentationSyncSuspendedRef.value = Boolean(nextSuspended);
		},
		establishProjectDirtyBaseline: () =>
			projectController?.establishProjectDirtyBaseline?.(),
		saveProject: () => projectController?.saveProject(),
		exportProject: () => projectController?.exportProject(),
		undoHistory: () => historyController?.undoHistory(),
		redoHistory: () => historyController?.redoHistory(),
		clearSceneAssetSelection,
		beginHistoryTransaction: (label) =>
			historyController?.beginHistoryTransaction(label),
		commitHistoryTransaction: (label) =>
			historyController?.commitHistoryTransaction(label),
		isInteractiveTextTarget,
		isZoomInteractionMode: () =>
			interactionController?.isZoomInteractionMode() ?? false,
		isPieInteractionMode: () =>
			interactionController?.isPieInteractionMode() ?? false,
		isLensInteractionMode: () =>
			interactionController?.isLensInteractionMode() ?? false,
		isRollInteractionMode: () =>
			interactionController?.isRollInteractionMode() ?? false,
		isViewportOrthographicActive: () =>
			interactionController?.isViewportOrthographicActive?.() ?? false,
		applyNavigateInteractionMode: () =>
			interactionController?.applyNavigateInteractionMode(),
		ensurePerspectiveForViewportRotation: () =>
			interactionController?.ensurePerspectiveForViewportRotation?.() ?? false,
		captureViewportProjectionState: () =>
			viewportProjectionController?.captureViewportProjectionState?.() ?? null,
		restoreViewportProjectionState: (snapshot) =>
			viewportProjectionController?.restoreViewportProjectionState?.(
				snapshot,
			) ?? false,
		openViewportPieMenu: (...args) =>
			interactionController?.openViewportPieMenu(...args) ?? false,
		openViewportPieMenuAtCenter: (...args) =>
			interactionController?.openViewportPieMenuAtCenter(...args) ?? false,
		updateViewportPiePointer: (...args) =>
			interactionController?.updateViewportPiePointer(...args),
		finishViewportPieMenu: (...args) =>
			interactionController?.finishViewportPieMenu(...args) ?? null,
		closeViewportPieMenu: (...args) =>
			interactionController?.closeViewportPieMenu(...args),
		handleViewportPieAction: executeViewportPieAction,
		isFrameSelectionActive: frameController.isFrameSelectionActive,
		isReferenceImageSelectionActive: () =>
			referenceImageController?.isReferenceImageSelectionActive?.() ?? false,
		clearFrameSelection: frameController.clearFrameSelection,
		clearReferenceImageSelection: () =>
			referenceImageController?.clearReferenceImageSelection?.(),
		clearOutputFrameSelection: outputFrameController.clearOutputFrameSelection,
		handleOrbitAroundHitDragMove: (...args) =>
			interactionController?.handleOrbitAroundHitDragMove(...args),
		handleOrbitAroundHitDragEnd: (...args) =>
			interactionController?.handleOrbitAroundHitDragEnd(...args),
		handleZoomToolDragMove,
		handleZoomToolDragEnd,
		handleLensAdjustDragMove: (...args) =>
			interactionController?.handleLensAdjustDragMove(...args),
		handleLensAdjustDragEnd: (...args) =>
			interactionController?.handleLensAdjustDragEnd(...args),
		handleShotCameraRollDragMove: (...args) =>
			interactionController?.handleShotCameraRollDragMove(...args),
		handleShotCameraRollDragEnd: (...args) =>
			interactionController?.handleShotCameraRollDragEnd(...args),
		handleViewportOrthographicPanMove: (...args) =>
			interactionController?.handleViewportOrthographicPanMove?.(...args),
		handleViewportOrthographicPanEnd: (...args) =>
			interactionController?.handleViewportOrthographicPanEnd?.(...args),
		handleViewportOrthographicWheel: (...args) =>
			interactionController?.handleViewportOrthographicWheel?.(...args) ??
			false,
		handleOutputFramePanMove: outputFrameController.handleOutputFramePanMove,
		handleOutputFramePanEnd: outputFrameController.handleOutputFramePanEnd,
		handleOutputFrameResizeMove:
			outputFrameController.handleOutputFrameResizeMove,
		handleOutputFrameResizeEnd:
			outputFrameController.handleOutputFrameResizeEnd,
		handleOutputFrameAnchorDragMove:
			outputFrameController.handleOutputFrameAnchorDragMove,
		handleOutputFrameAnchorDragEnd:
			outputFrameController.handleOutputFrameAnchorDragEnd,
		handleFrameDragMove: frameController.handleFrameDragMove,
		handleFrameDragEnd: frameController.handleFrameDragEnd,
		handleFrameResizeMove: frameController.handleFrameResizeMove,
		handleFrameResizeEnd: frameController.handleFrameResizeEnd,
		handleFrameRotateMove: frameController.handleFrameRotateMove,
		handleFrameRotateEnd: frameController.handleFrameRotateEnd,
		handleFrameAnchorDragMove: frameController.handleFrameAnchorDragMove,
		handleFrameAnchorDragEnd: frameController.handleFrameAnchorDragEnd,
		handleViewportTransformDragMove:
			viewportToolController.handleViewportTransformDragMove,
		handleViewportTransformDragEnd:
			viewportToolController.handleViewportTransformDragEnd,
		pickViewportAssetAtPointer:
			viewportToolController.pickViewportAssetAtPointer,
		handleMeasurementPointerDown: (...args) =>
			measurementController?.handleMeasurementPointerDown?.(...args) ?? false,
		handleMeasurementHoverMove: (...args) =>
			measurementController?.handleMeasurementHoverMove?.(...args),
		clearSelectedMeasurementPoint: () =>
			measurementController?.clearSelectedMeasurementPoint?.() ?? false,
		deleteSelectedMeasurement: () =>
			measurementController?.deleteSelectedMeasurement?.() ?? false,
		syncMeasurementSceneHelpers: () =>
			measurementController?.syncMeasurementSceneHelpers?.(),
		syncPerSplatEditSceneHelper: (camera, viewportSize) =>
			perSplatEditController?.syncSceneHelperForCamera?.(camera, viewportSize),
		startOutputFrameAnchorDrag:
			outputFrameController.startOutputFrameAnchorDrag,
		syncMeasurementOverlay: () =>
			measurementController?.syncMeasurementOverlay?.(),
		syncViewportTransformGizmo:
			viewportToolController.syncViewportTransformGizmo,
		syncViewportAxisGizmo: () =>
			viewportAxisGizmoController?.syncViewportAxisGizmo?.(),
		exportController,
		handleResize,
		fpsMovement,
		pointerControls,
		getActiveCamera,
		guideOverlay,
		syncGuideOverlayState,
		syncViewportProjection,
		syncShotProjection,
		applyCameraViewProjection,
		updateShotCameraHelpers,
		getActiveCameraViewCamera,
		getActiveViewportCamera,
		updateCameraSummary,
		t,
		formatNumber,
		frameAllCameras,
		placeAllCamerasAtHome,
		syncControlsToMode,
		applyInitialNavigateInteractionMode: () =>
			interactionController?.applyNavigateInteractionMode({ silent: true }),
		loadStartupUrls: () => assetController.loadStartupUrls(),
		setExportStatus,
		getShotCameraRollLock: () => store.shotCamera.rollLock.value,
		setShotCameraRollAngleDegrees: (nextValue) =>
			projectionController?.setShotCameraRollAngleDegrees?.(nextValue),
	};
}
