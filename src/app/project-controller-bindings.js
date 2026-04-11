export function createProjectControllerBindings({
	store,
	assetController,
	applySavedProjectState,
	applyOpenedProject,
	captureShotCameraEditorStates,
	restoreShotCameraEditorStates,
	restoreShotCameraEditorState,
	getActiveShotCameraId,
	measurementController,
	perSplatEditController,
	referenceImageController,
	lightingController,
	viewportToolController,
	resetWorkspaceToDefaults,
	buildProjectFilename,
	captureProjectState,
	historyController,
	updateUi,
	setStatus,
	t,
} = {}) {
	return {
		store,
		assetController,
		applySavedProjectState,
		applyOpenedProject,
		captureWorkingEditorState: () => captureShotCameraEditorStates(),
		applyWorkingEditorState: (editorState) => {
			restoreShotCameraEditorStates(editorState);
			restoreShotCameraEditorState(getActiveShotCameraId());
		},
		clearProjectSidecars: () => {
			measurementController?.clearMeasurementSession?.({ keepActive: false });
			perSplatEditController?.resetForSceneChange?.();
			referenceImageController?.clearReferenceImages?.();
			lightingController?.resetLighting?.();
		},
		resetProjectWorkspace: () => {
			viewportToolController.setViewportTransformMode(false);
			perSplatEditController?.resetForSceneChange?.();
			resetWorkspaceToDefaults();
			referenceImageController?.clearReferenceImages?.();
			lightingController?.resetLighting?.();
			assetController.clearScene();
		},
		flushDirtySplatSources: () =>
			perSplatEditController?.flushDirtySplatAssetPersistentSources?.() ??
			false,
		buildProjectFilename,
		captureProjectState,
		clearHistory: () => historyController?.clearHistory(),
		updateUi,
		setStatus,
		t,
	};
}
