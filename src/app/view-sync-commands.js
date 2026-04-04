import { GUIDE_GRID_LAYER_MODE_BOTTOM } from "../engine/guide-overlays.js";
import { WORKSPACE_PANE_VIEWPORT } from "../workspace-model.js";

export function createViewSyncCommands({
	state,
	guideOverlay,
	getActiveShotCameraDocument,
	getOutputFrameController,
	getUiSyncController,
	getViewportProjectionController,
	safeSyncReferenceImagePreview,
}) {
	function updateOutputFrameOverlay() {
		const result = getOutputFrameController()?.updateOutputFrameOverlay?.();
		safeSyncReferenceImagePreview?.();
		return result;
	}

	function updateDropHint() {
		return getUiSyncController?.()?.updateDropHint?.();
	}

	function updateSceneSummary() {
		return getUiSyncController?.()?.updateSceneSummary?.();
	}

	function syncGuideOverlayState(
		documentState = getActiveShotCameraDocument?.(),
		{ gridVisible = true, eyeLevelVisible = true } = {},
	) {
		const viewportOrthoPreviewGridPlane =
			state.mode === WORKSPACE_PANE_VIEWPORT
				? (getViewportProjectionController?.()?.getViewportOrthographicPreviewGridPlane?.() ??
					null)
				: null;
		const showViewportOrthoPreviewGrid =
			gridVisible !== false && viewportOrthoPreviewGridPlane !== null;
		guideOverlay.applyState({
			gridVisible: showViewportOrthoPreviewGrid ? false : gridVisible,
			eyeLevelVisible,
			gridLayerMode:
				documentState?.exportSettings?.exportGridLayerMode === "overlay"
					? "overlay"
					: GUIDE_GRID_LAYER_MODE_BOTTOM,
		});
		guideOverlay.setViewportOrthographicGridState?.({
			visible: showViewportOrthoPreviewGrid,
			plane: viewportOrthoPreviewGridPlane,
		});
	}

	function updateCameraSummary() {
		return getUiSyncController?.()?.updateCameraSummary?.();
	}

	return {
		updateOutputFrameOverlay,
		updateDropHint,
		updateSceneSummary,
		syncGuideOverlayState,
		updateCameraSummary,
	};
}
