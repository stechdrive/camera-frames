export function createPerSplatEditControllerBindings({
	store,
	state,
	t,
	guides,
	viewportShell,
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
		beginHistoryTransaction: (...args) =>
			getHistoryController?.()?.beginHistoryTransaction?.(...args),
		commitHistoryTransaction: (...args) =>
			getHistoryController?.()?.commitHistoryTransaction?.(...args),
		cancelHistoryTransaction: () =>
			getHistoryController?.()?.cancelHistoryTransaction?.(),
	};
}
