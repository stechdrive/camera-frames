export function createProjectionControllerBindings({
	state,
	renderer,
	viewportShell,
	getOutputFrameController,
	syncActiveShotCameraFromDocument,
	getActiveShotCamera,
	getActiveShotCameraDocument,
	getActiveCameraViewCamera,
	getActiveOutputCamera,
	getActiveShotCameraLensOverride = () => null,
} = {}) {
	return {
		state,
		renderer,
		getRenderSurfaceSize: () => ({
			width: Math.max(Number(viewportShell?.clientWidth) || 0, 1),
			height: Math.max(Number(viewportShell?.clientHeight) || 0, 1),
		}),
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
		getActiveShotCameraLensOverride,
	};
}
