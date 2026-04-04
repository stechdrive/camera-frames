export function createMeasurementControllerBindings({
	store,
	state,
	viewportShell,
	viewportCanvas,
	guides,
	workspacePaneCamera,
	getActiveViewportCamera,
	getActiveCameraViewCamera,
	getActiveOutputCamera,
	assetController,
	setStatus,
	t,
} = {}) {
	return {
		store,
		state,
		viewportShell,
		viewportCanvas,
		guides,
		workspacePaneCamera,
		getActiveViewportCamera,
		getActiveCameraViewCamera,
		getActiveOutputCamera,
		assetController,
		setStatus,
		t,
	};
}
