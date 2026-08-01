export function createViewportProjectionControllerBindings({
	store,
	viewportShell,
	viewportCamera,
	viewportOrthoCamera,
	outputFrameController,
	sceneFramingController,
	assetController,
} = {}) {
	function getViewportSize() {
		const shellWidth = Number(viewportShell?.clientWidth) || 0;
		const shellHeight = Number(viewportShell?.clientHeight) || 0;
		if (shellWidth > 0 && shellHeight > 0) {
			return {
				width: Math.max(shellWidth, 1),
				height: Math.max(shellHeight, 1),
			};
		}
		if (outputFrameController?.getViewportSize) {
			return outputFrameController.getViewportSize();
		}
		return {
			width: Math.max(Number(viewportShell?.clientWidth) || 0, 1),
			height: Math.max(Number(viewportShell?.clientHeight) || 0, 1),
		};
	}

	return {
		store,
		viewportShell,
		viewportPerspectiveCamera: viewportCamera,
		viewportOrthographicCamera: viewportOrthoCamera,
		getViewportSize,
		getAutoClipRange: (camera) =>
			sceneFramingController.getAutoClipRange(camera),
		getSceneFraming: () => sceneFramingController.getSceneFraming(),
		getSceneRaycastTargets: () => assetController.getSceneRaycastTargets(),
	};
}
