export function createSplatEditSceneHelperSync({
	store,
	sceneHelper,
	isSplatEditModeActive,
	getSplatEditScopeAssetIds,
	getSplatEditBoxCenter,
	getSplatEditBoxSize,
	getSplatEditBoxRotation,
}) {
	function syncSceneHelper() {
		let helperVisible = false;
		let helperCenter = null;
		let helperSize = null;
		let helperRotation = null;
		if (
			isSplatEditModeActive() &&
			store.splatEdit.tool.value === "box" &&
			store.splatEdit.boxPlaced.value &&
			getSplatEditScopeAssetIds().length > 0
		) {
			helperVisible = true;
			helperCenter = getSplatEditBoxCenter();
			helperSize = getSplatEditBoxSize();
			helperRotation = getSplatEditBoxRotation();
		}
		sceneHelper.sync({
			visible: helperVisible,
			center: helperCenter,
			size: helperSize,
			rotation: helperRotation,
		});
	}

	function syncSceneHelperForCamera(camera, viewportSize = null) {
		sceneHelper.syncCamera?.(camera, viewportSize);
	}

	return {
		syncSceneHelper,
		syncSceneHelperForCamera,
	};
}
