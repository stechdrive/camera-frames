export function createReferenceImageRenderControllerBindings({
	store,
	renderBox,
	viewportShell,
	getActiveShotCameraDocument,
	getOutputSizeState,
} = {}) {
	return {
		store,
		renderBox,
		viewportShell,
		getActiveShotCameraDocument,
		getOutputSizeState,
	};
}
