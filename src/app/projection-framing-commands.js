export function createProjectionFramingCommands({
	getInteractionController,
	getProjectionController,
	getSceneFramingController,
	getViewportProjectionController,
} = {}) {
	function getProjectionState() {
		return getProjectionController?.()?.getProjectionState?.();
	}

	function syncShotProjection() {
		return getProjectionController?.()?.syncShotProjection?.();
	}

	function applyCameraViewProjection() {
		return getProjectionController?.()?.applyCameraViewProjection?.();
	}

	function syncViewportProjection() {
		return getViewportProjectionController?.()?.syncActiveViewportProjection?.();
	}

	function clearControlMomentum() {
		return getInteractionController?.()?.clearControlMomentum?.();
	}

	function syncControlsToMode() {
		return getInteractionController?.()?.syncControlsToMode?.();
	}

	function setViewportProjectionMode(nextMode, options) {
		const changed =
			getViewportProjectionController?.()?.setViewportProjectionMode?.(
				nextMode,
				options,
			) ?? false;
		getInteractionController?.()?.syncControlsToMode?.();
		return changed;
	}

	function alignViewportToOrthographicView(viewId, options) {
		const changed =
			getViewportProjectionController?.()?.alignViewportToOrthographicView?.(
				viewId,
				options,
			) ?? false;
		getInteractionController?.()?.syncControlsToMode?.();
		return changed;
	}

	function toggleViewportOrthographicAxis(axisKey) {
		const changed =
			getViewportProjectionController?.()?.toggleOrthographicAxis?.(axisKey) ??
			false;
		getInteractionController?.()?.syncControlsToMode?.();
		return changed;
	}

	function copyPose(sourceCamera, destinationCamera) {
		return getSceneFramingController?.()?.copyPose?.(
			sourceCamera,
			destinationCamera,
		);
	}

	function frameCamera(camera, variant) {
		return getSceneFramingController?.()?.frameCamera?.(camera, variant);
	}

	function frameAllCameras() {
		return getSceneFramingController?.()?.frameAllCameras?.();
	}

	function placeAllCamerasAtHome() {
		return getSceneFramingController?.()?.placeAllCamerasAtHome?.();
	}

	function handleResize() {
		return getProjectionController?.()?.handleResize?.();
	}

	function syncOutputCamera() {
		return getProjectionController?.()?.syncOutputCamera?.();
	}

	return {
		getProjectionState,
		syncShotProjection,
		applyCameraViewProjection,
		syncViewportProjection,
		clearControlMomentum,
		syncControlsToMode,
		setViewportProjectionMode,
		alignViewportToOrthographicView,
		toggleViewportOrthographicAxis,
		copyPose,
		frameCamera,
		frameAllCameras,
		placeAllCamerasAtHome,
		handleResize,
		syncOutputCamera,
	};
}
