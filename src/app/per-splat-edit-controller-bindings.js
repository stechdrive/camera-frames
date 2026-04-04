export function createPerSplatEditControllerBindings({
	store,
	state,
	t,
	setStatus,
	updateUi,
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
		setStatus,
		updateUi,
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
