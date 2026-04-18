import * as THREE from "three";
import {
	getAssetIdKey,
	getSplatAssetWorldMatrix,
} from "./asset-accessors.js";

export function createSplatEditScope({
	store,
	updateUi,
	getSceneSplatAssets,
	syncSelectionCount,
	syncSelectionHighlight,
	syncSceneHelper,
	clearActiveTransformPreview,
	isSplatEditModeActive,
}) {
	const tempWorldPoint = new THREE.Vector3();

	function normalizeScopeAssetIds(assetIds = []) {
		const validIds = new Set(
			getSceneSplatAssets().map((asset) => getAssetIdKey(asset.id)),
		);
		return [...new Set((assetIds ?? []).map(getAssetIdKey))].filter((assetId) =>
			validIds.has(assetId),
		);
	}

	function resolveEntryScopeAssetIds() {
		const selectedScopeAssetIds = normalizeScopeAssetIds(
			store.selectedSceneAssetIds.value,
		);
		if (selectedScopeAssetIds.length > 0) {
			return selectedScopeAssetIds;
		}
		return normalizeScopeAssetIds(
			store.splatEdit.rememberedScopeAssetIds.value,
		);
	}

	function getSplatEditScopeAssetIds() {
		return [...(store.splatEdit.scopeAssetIds.value ?? [])];
	}

	function getSplatEditScopeAssets() {
		const scopeIds = new Set(getSplatEditScopeAssetIds());
		return getSceneSplatAssets().filter((asset) =>
			scopeIds.has(getAssetIdKey(asset.id)),
		);
	}

	function getSplatAssetCenterBounds(asset) {
		if (!asset?.object || asset.object.visible === false) {
			return null;
		}
		const splatMesh = asset.disposeTarget;
		const worldMatrix = getSplatAssetWorldMatrix(asset);
		if (!worldMatrix) {
			return null;
		}
		const hintedBox =
			asset.localCenterBoundsHint?.clone?.() ??
			asset.localBoundsHint?.clone?.() ??
			null;
		if (hintedBox?.applyMatrix4) {
			hintedBox.applyMatrix4(worldMatrix);
			return hintedBox.isEmpty() ? null : hintedBox;
		}
		if (typeof splatMesh?.getBoundingBox !== "function") {
			return null;
		}
		const localBox =
			splatMesh.getBoundingBox(true) ?? splatMesh.getBoundingBox(false) ?? null;
		if (!localBox?.applyMatrix4) {
			return null;
		}
		const worldBox = localBox.clone();
		worldBox.applyMatrix4(worldMatrix);
		return worldBox.isEmpty() ? null : worldBox;
	}

	function getScopeBounds() {
		const scopeAssets = getSplatEditScopeAssets();
		const scopeBox = new THREE.Box3();
		let hasBounds = false;
		for (const asset of scopeAssets) {
			const assetBounds = getSplatAssetCenterBounds(asset);
			if (!assetBounds) {
				continue;
			}
			scopeBox.union(assetBounds);
			hasBounds = true;
		}
		return hasBounds && !scopeBox.isEmpty() ? scopeBox : null;
	}

	function getPreciseScopeCenterBounds() {
		const scopeAssets = getSplatEditScopeAssets();
		const scopeBox = new THREE.Box3();
		let hasBounds = false;
		for (const asset of scopeAssets) {
			const splatMesh = asset?.disposeTarget;
			if (typeof splatMesh?.forEachSplat !== "function") {
				continue;
			}
			asset.object?.updateMatrixWorld?.(true);
			splatMesh.updateMatrixWorld?.(true);
			const worldMatrix =
				splatMesh?.matrixWorld ??
				asset.contentObject?.matrixWorld ??
				asset.object?.matrixWorld ??
				null;
			if (!worldMatrix) {
				continue;
			}
			splatMesh.forEachSplat((_index, center) => {
				tempWorldPoint.copy(center);
				tempWorldPoint.applyMatrix4(worldMatrix);
				if (!Number.isFinite(tempWorldPoint.x)) {
					return;
				}
				scopeBox.expandByPoint(tempWorldPoint);
				hasBounds = true;
			});
		}
		if (!hasBounds || scopeBox.isEmpty()) {
			return null;
		}
		scopeBox.expandByScalar(1e-4);
		return scopeBox;
	}

	function syncScopeToSceneSelection() {
		if (!isSplatEditModeActive()) {
			return false;
		}
		const nextScopeAssetIds = normalizeScopeAssetIds(
			store.selectedSceneAssetIds.value,
		);
		const currentScopeAssetIds = getSplatEditScopeAssetIds();
		if (
			nextScopeAssetIds.length === currentScopeAssetIds.length &&
			nextScopeAssetIds.every(
				(assetId, index) => assetId === currentScopeAssetIds[index],
			)
		) {
			return false;
		}
		clearActiveTransformPreview({ syncUi: false });
		store.splatEdit.scopeAssetIds.value = [...nextScopeAssetIds];
		if (nextScopeAssetIds.length > 0) {
			store.splatEdit.rememberedScopeAssetIds.value = [...nextScopeAssetIds];
		}
		syncSelectionCount();
		syncSelectionHighlight();
		syncSceneHelper();
		updateUi?.();
		return true;
	}

	return {
		normalizeScopeAssetIds,
		resolveEntryScopeAssetIds,
		getSplatEditScopeAssetIds,
		getSplatEditScopeAssets,
		getSplatAssetCenterBounds,
		getScopeBounds,
		getPreciseScopeCenterBounds,
		syncScopeToSceneSelection,
	};
}
