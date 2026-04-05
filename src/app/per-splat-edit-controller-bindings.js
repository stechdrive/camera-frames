export function createPerSplatEditControllerBindings({
	store,
	state,
	t,
	guides,
	viewportShell,
	renderBox,
	setStatus,
	updateUi,
	getAssetController,
	getActiveCamera,
	getActiveCameraViewCamera,
	selectionHighlightController,
	setViewportSelectMode,
	setViewportReferenceImageEditMode,
	setViewportTransformMode,
	setViewportPivotEditMode,
	setMeasurementMode,
	getInteractionController,
	getHistoryController,
} = {}) {
	return {
		store,
		state,
		t,
		guides,
		viewportShell,
		renderBox,
		setStatus,
		updateUi,
		getAssetController,
		getActiveCamera,
		getActiveCameraViewCamera,
		selectionHighlightController,
		setViewportSelectMode,
		setViewportReferenceImageEditMode,
		setViewportTransformMode,
		setViewportPivotEditMode,
		setMeasurementMode,
		applyNavigateInteractionMode: (options) =>
			getInteractionController?.()?.applyNavigateInteractionMode?.(options),
		syncControlsToMode: () =>
			getInteractionController?.()?.syncControlsToMode?.(),
		beginHistoryTransaction: (label) =>
			getHistoryController?.()?.beginHistoryTransaction?.(label),
		commitHistoryTransaction: (label) =>
			getHistoryController?.()?.commitHistoryTransaction?.(label),
		cancelHistoryTransaction: () =>
			getHistoryController?.()?.cancelHistoryTransaction?.(),
	};
}
