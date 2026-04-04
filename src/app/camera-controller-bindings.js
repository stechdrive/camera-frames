export function createCameraControllerBindings({
	store,
	state,
	scene,
	viewportCamera,
	shotCameraRegistry,
	horizontalToVerticalFovDegrees,
	t,
	setStatus,
	updateUi,
	getSceneBounds,
	sceneFramingController,
	getFrameController,
	clearOutputFramePan,
	clearOutputFrameSelection,
	getInteractionController,
	beforeActiveShotCameraChange,
	afterActiveShotCameraChange,
	viewportProjectionController,
	historyController,
} = {}) {
	return {
		store,
		state,
		scene,
		viewportCamera,
		shotCameraRegistry,
		horizontalToVerticalFovDegrees,
		t,
		setStatus,
		updateUi,
		getSceneBounds,
		getAutoClipRange: (camera) =>
			sceneFramingController.getAutoClipRange(camera),
		clearFrameDrag: () => getFrameController?.()?.clearFrameDrag?.(),
		clearOutputFramePan,
		clearOutputFrameSelection,
		clearControlMomentum: () =>
			getInteractionController?.()?.clearControlMomentum?.(),
		beforeActiveShotCameraChange: (currentShotCameraId) =>
			beforeActiveShotCameraChange?.(currentShotCameraId),
		afterActiveShotCameraChange: (nextShotCameraId) =>
			afterActiveShotCameraChange?.(nextShotCameraId),
		applyNavigateInteractionMode: () =>
			getInteractionController?.()?.applyNavigateInteractionMode?.({
				silent: true,
			}),
		copyPose: (...args) => sceneFramingController.copyPose(...args),
		placeCameraAtHome: (...args) =>
			sceneFramingController.placeCameraAtHome(...args),
		frameCamera: (...args) => sceneFramingController.frameCamera(...args),
		getViewportCameraForShotCopy: () =>
			viewportProjectionController?.getActiveViewportCamera?.() ??
			viewportCamera,
		getViewportPerspectiveCamera: () =>
			viewportProjectionController?.getViewportPerspectiveCamera?.() ??
			viewportCamera,
		prepareViewportPerspectiveMode: () => {
			const changed =
				viewportProjectionController?.setViewportProjectionMode?.(
					"perspective",
					{
						copyActivePose: false,
					},
				) ?? false;
			getInteractionController?.()?.syncControlsToMode?.();
			return changed;
		},
		resetViewportView: () => {
			if (viewportProjectionController?.isViewportOrthographic?.()) {
				viewportProjectionController.resetViewportOrthographicView();
				return true;
			}
			return false;
		},
		syncControlsToMode: () =>
			getInteractionController?.()?.syncControlsToMode?.(),
		runHistoryAction: historyController.runHistoryAction,
	};
}
