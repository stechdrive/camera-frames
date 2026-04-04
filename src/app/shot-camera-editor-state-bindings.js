export function createShotCameraEditorStateControllerBindings({
	store,
	state,
	getReferenceImageController,
	getFrameController,
	updateUi,
} = {}) {
	return {
		store,
		state,
		getReferenceImageController,
		getFrameController,
		updateUi,
	};
}
