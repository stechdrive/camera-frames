export function createLightingControllerBindings({
	store,
	scene,
	updateUi,
	historyController,
} = {}) {
	return {
		store,
		scene,
		updateUi,
		runHistoryAction: historyController.runHistoryAction,
	};
}
