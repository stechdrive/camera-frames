export function createPerSplatEditControllerBindings({
	store,
	state,
	t,
	guides,
	setStatus,
	updateUi,
	assetController,
	setViewportSelectMode,
	setViewportReferenceImageEditMode,
	setViewportTransformMode,
	setViewportPivotEditMode,
	setMeasurementMode,
	getInteractionController,
} = {}) {
	return {
		store,
		state,
		t,
		guides,
		setStatus,
		updateUi,
		assetController,
		setViewportSelectMode,
		setViewportReferenceImageEditMode,
		setViewportTransformMode,
		setViewportPivotEditMode,
		setMeasurementMode,
		applyNavigateInteractionMode: (options) =>
			getInteractionController?.()?.applyNavigateInteractionMode?.(options),
		syncControlsToMode: () =>
			getInteractionController?.()?.syncControlsToMode?.(),
	};
}
