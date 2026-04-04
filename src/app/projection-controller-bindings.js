export function createProjectionControllerBindings({
	state,
	renderer,
	getOutputFrameController,
	syncActiveShotCameraFromDocument,
	getActiveShotCamera,
	getActiveShotCameraDocument,
	getActiveCameraViewCamera,
	getActiveOutputCamera,
} = {}) {
	return {
		state,
		renderer,
		getOutputSizeState: (documentState) =>
			getOutputFrameController?.()?.getOutputSizeState?.(documentState),
		getOutputFrameMetrics: (documentState) =>
			getOutputFrameController?.()?.getOutputFrameMetrics?.(documentState),
		getViewportSize: () => getOutputFrameController?.()?.getViewportSize?.(),
		handleOutputFrameResize: () =>
			getOutputFrameController?.()?.handleResize?.(),
		syncActiveShotCameraFromDocument,
		getActiveShotCamera,
		getActiveShotCameraDocument,
		getActiveCameraViewCamera,
		getActiveOutputCamera,
	};
}
