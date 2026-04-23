import {
	buildRemainingIndices,
	getAssetIdKey,
	getSplatAssetTotalCount,
} from "./asset-accessors.js";

export function selectAllSplatsForAssets(assets, selectedSplatsByAssetId) {
	for (const asset of assets) {
		const assetIdKey = getAssetIdKey(asset.id);
		const totalCount = getSplatAssetTotalCount(asset);
		if (totalCount <= 0) {
			continue;
		}
		const allIndices = new Set();
		for (let i = 0; i < totalCount; i += 1) {
			allIndices.add(i);
		}
		selectedSplatsByAssetId.set(assetIdKey, allIndices);
	}
}

export function createSplatEditActions({
	store,
	t,
	setStatus,
	updateUi,
	selectedSplatsByAssetId,
	getSplatEditScopeAssets,
	syncSelectionCount,
	syncSelectionHighlight,
	clearSelectionHighlight,
	syncSceneHelper,
	clearActiveTransformPreview,
	isSplatEditModeActive,
}) {
	function clearSplatSelection() {
		clearActiveTransformPreview({ syncUi: false });
		selectedSplatsByAssetId.clear();
		syncSelectionCount();
		store.splatEdit.lastOperation.value = {
			mode: "clear",
			hitCount: 0,
		};
		clearSelectionHighlight();
		syncSceneHelper();
		updateUi?.();
	}

	function selectAllSplats() {
		if (!isSplatEditModeActive()) {
			return false;
		}
		const scopeAssets = getSplatEditScopeAssets();
		if (scopeAssets.length === 0) {
			return false;
		}
		clearActiveTransformPreview({ syncUi: false });
		selectAllSplatsForAssets(scopeAssets, selectedSplatsByAssetId);
		let totalSelected = 0;
		for (const asset of scopeAssets) {
			totalSelected += getSplatAssetTotalCount(asset);
		}
		store.splatEdit.lastOperation.value = {
			mode: "select-all",
			hitCount: totalSelected,
		};
		syncSelectionCount();
		syncSelectionHighlight();
		syncSceneHelper();
		updateUi?.();
		setStatus?.(t("status.splatEditSelectAllDone", { count: totalSelected }));
		return totalSelected;
	}

	function invertSplatSelection() {
		if (!isSplatEditModeActive()) {
			return false;
		}
		const scopeAssets = getSplatEditScopeAssets();
		if (scopeAssets.length === 0) {
			return false;
		}
		clearActiveTransformPreview({ syncUi: false });
		let invertedCount = 0;
		for (const asset of scopeAssets) {
			const assetIdKey = getAssetIdKey(asset.id);
			const totalCount = getSplatAssetTotalCount(asset);
			if (totalCount <= 0) {
				continue;
			}
			const currentSet = selectedSplatsByAssetId.get(assetIdKey);
			const currentIndexSet = currentSet ?? new Set();
			const remaining = buildRemainingIndices(totalCount, currentIndexSet);
			if (remaining.length > 0) {
				const newSet = new Set();
				for (let i = 0; i < remaining.length; i += 1) {
					newSet.add(remaining[i]);
				}
				selectedSplatsByAssetId.set(assetIdKey, newSet);
				invertedCount += remaining.length;
			} else {
				selectedSplatsByAssetId.delete(assetIdKey);
			}
		}
		store.splatEdit.lastOperation.value = {
			mode: "invert",
			hitCount: invertedCount,
		};
		syncSelectionCount();
		syncSelectionHighlight();
		syncSceneHelper();
		updateUi?.();
		setStatus?.(t("status.splatEditInverted", { count: invertedCount }));
		return invertedCount;
	}

	return {
		clearSplatSelection,
		selectAllSplats,
		invertSplatSelection,
	};
}
