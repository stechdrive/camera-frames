export function createProjectSceneCommands({
	store,
	getAssetController,
	getLightingController,
	getMeasurementController,
	getPerSplatEditController = null,
	getProjectController,
	getReferenceImageController,
	getViewportToolController,
}) {
	function resetSelectedAssetWorkingPivot() {
		const selectedAssetId = store.selectedSceneAssetId.value;
		if (!selectedAssetId) {
			return;
		}
		getAssetController()?.resetAssetWorkingPivot?.(selectedAssetId);
	}

	function clearSceneAssetSelection() {
		getAssetController()?.clearSceneAssetSelection?.();
	}

	function clearScene() {
		getMeasurementController()?.clearMeasurementSession?.({
			keepActive: false,
		});
		getPerSplatEditController?.()?.resetForSceneChange?.();
		getViewportToolController()?.setViewportTransformMode?.(false);
		getReferenceImageController()?.clearReferenceImages?.();
		getLightingController()?.resetLighting?.();
		getAssetController()?.clearScene?.();
	}

	function startNewProject() {
		return getProjectController()?.startNewProject?.();
	}

	function saveProject() {
		return getProjectController()?.saveProject?.();
	}

	function exportProject() {
		return getProjectController()?.exportProject?.();
	}

	return {
		resetSelectedAssetWorkingPivot,
		clearSceneAssetSelection,
		clearScene,
		startNewProject,
		saveProject,
		exportProject,
	};
}
