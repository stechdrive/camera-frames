export function createSceneAssetAccessors({
	getAssetController,
	getUiSyncController,
} = {}) {
	function resetLocalizedCaches() {
		return getUiSyncController?.()?.resetLocalizedCaches?.();
	}

	function getSceneAssetCounts() {
		return getAssetController?.()?.getSceneAssetCounts?.();
	}

	function getTotalLoadedItems() {
		return getAssetController?.()?.getTotalLoadedItems?.();
	}

	function getSceneAssets() {
		return getAssetController?.()?.getSceneAssets?.();
	}

	function getSceneBounds() {
		return getAssetController?.()?.getSceneBounds?.();
	}

	return {
		resetLocalizedCaches,
		getSceneAssetCounts,
		getTotalLoadedItems,
		getSceneAssets,
		getSceneBounds,
	};
}
