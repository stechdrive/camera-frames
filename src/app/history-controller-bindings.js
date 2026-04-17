export function createHistoryControllerBindings({
	store,
	captureWorkspaceState,
	restoreWorkspaceState,
	updateUi,
	onRetainSnapshot = null,
	onReleaseSnapshot = null,
} = {}) {
	return {
		store,
		captureWorkspaceState,
		restoreWorkspaceState,
		updateUi,
		onRetainSnapshot,
		onReleaseSnapshot,
	};
}
