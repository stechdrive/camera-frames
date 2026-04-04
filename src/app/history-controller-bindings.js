export function createHistoryControllerBindings({
	store,
	captureWorkspaceState,
	restoreWorkspaceState,
	updateUi,
} = {}) {
	return {
		store,
		captureWorkspaceState,
		restoreWorkspaceState,
		updateUi,
	};
}
