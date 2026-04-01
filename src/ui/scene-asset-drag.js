export function getSceneAssetById(sceneAssets, assetId) {
	return sceneAssets.find((asset) => asset.id === assetId) ?? null;
}

export function getSceneAssetDragSelectionIds(
	sceneAssets,
	selectedSceneAssetIds,
	draggedAssetId,
) {
	const draggedAsset = getSceneAssetById(sceneAssets, draggedAssetId);
	if (!draggedAsset) {
		return [];
	}

	const selectedAssetIdSet = new Set(selectedSceneAssetIds ?? []);
	const selectedKindAssetIds = sceneAssets
		.filter(
			(asset) =>
				asset.kind === draggedAsset.kind && selectedAssetIdSet.has(asset.id),
		)
		.map((asset) => asset.id);

	return selectedKindAssetIds.includes(draggedAssetId)
		? selectedKindAssetIds
		: [draggedAssetId];
}

export function getSceneAssetDropPosition(event) {
	const bounds = event.currentTarget.getBoundingClientRect();
	return event.clientY < bounds.top + bounds.height / 2 ? "before" : "after";
}

export function getSceneAssetDropTargetKindIndex(
	draggedAsset,
	targetAsset,
	position,
) {
	if (!draggedAsset || !targetAsset || draggedAsset.kind !== targetAsset.kind) {
		return null;
	}

	const currentKindIndex = draggedAsset.kindOrderIndex - 1;
	const targetKindIndex = targetAsset.kindOrderIndex - 1;
	if (position === "before") {
		return currentKindIndex < targetKindIndex
			? targetKindIndex - 1
			: targetKindIndex;
	}
	return currentKindIndex < targetKindIndex
		? targetKindIndex
		: targetKindIndex + 1;
}
