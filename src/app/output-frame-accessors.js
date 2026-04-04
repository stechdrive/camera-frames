export function createOutputFrameAccessors({
	getActiveShotCameraDocument,
	getOutputFrameController,
} = {}) {
	function getOutputFrameDocumentState(
		documentState = getActiveShotCameraDocument?.(),
	) {
		return getOutputFrameController?.()?.getOutputFrameDocumentState?.(
			documentState,
		);
	}

	function getOutputSizeState(documentState = getActiveShotCameraDocument?.()) {
		return getOutputFrameController?.()?.getOutputSizeState?.(documentState);
	}

	function getViewportSize() {
		return getOutputFrameController?.()?.getViewportSize?.();
	}

	function syncOutputFrameFitState(
		documentState = getActiveShotCameraDocument?.(),
		viewportWidth = getViewportSize()?.width,
		viewportHeight = getViewportSize()?.height,
		force = false,
	) {
		return getOutputFrameController?.()?.syncOutputFrameFitState?.(
			documentState,
			viewportWidth,
			viewportHeight,
			force,
		);
	}

	function getOutputFrameMetrics(
		documentState = getActiveShotCameraDocument?.(),
	) {
		return getOutputFrameController?.()?.getOutputFrameMetrics?.(documentState);
	}

	return {
		getOutputFrameDocumentState,
		getOutputSizeState,
		getViewportSize,
		syncOutputFrameFitState,
		getOutputFrameMetrics,
	};
}
