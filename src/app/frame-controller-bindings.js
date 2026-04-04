export function createFrameControllerBindings({
	store,
	state,
	renderBox,
	workspacePaneCamera,
	isZoomToolActive,
	t,
	setStatus,
	updateUi,
	getOutputFrameController,
	getActiveShotCameraDocument,
	updateActiveShotCameraDocument,
	getOutputFrameMetrics,
	historyController,
} = {}) {
	return {
		store,
		state,
		renderBox,
		workspacePaneCamera,
		isZoomToolActive,
		t,
		setStatus,
		updateUi,
		clearOutputFrameSelection: () =>
			getOutputFrameController?.()?.clearOutputFrameSelection?.(),
		clearOutputFramePan: () =>
			getOutputFrameController?.()?.clearOutputFramePan?.(),
		getActiveShotCameraDocument,
		updateActiveShotCameraDocument,
		getOutputFrameMetrics,
		runHistoryAction: historyController.runHistoryAction,
		beginHistoryTransaction: historyController.beginHistoryTransaction,
		commitHistoryTransaction: historyController.commitHistoryTransaction,
		cancelHistoryTransaction: historyController.cancelHistoryTransaction,
	};
}
