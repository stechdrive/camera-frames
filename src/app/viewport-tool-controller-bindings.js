export function createViewportToolControllerBindings({
	store,
	state,
	viewportShell,
	viewportGizmo,
	viewportGizmoSvg,
	getActiveCameraViewCamera,
	getActiveViewportCamera,
	assetController,
	historyController,
	workspacePaneCamera,
	getAnimationController = null,
} = {}) {
	return {
		store,
		state,
		viewportShell,
		viewportGizmo,
		viewportGizmoSvg,
		getActiveToolCamera: () =>
			state.mode === workspacePaneCamera
				? getActiveCameraViewCamera()
				: getActiveViewportCamera(),
		assetController,
		beginHistoryTransaction: historyController.beginHistoryTransaction,
		commitHistoryTransaction: historyController.commitHistoryTransaction,
		autoKeySceneAssetTransforms: (...args) =>
			getAnimationController?.()?.autoKeySceneAssetTransforms?.(...args),
	};
}
