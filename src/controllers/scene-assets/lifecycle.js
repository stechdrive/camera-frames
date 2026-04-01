export function createSceneAssetLifecycle({
	sceneState,
	store,
	splatRoot,
	modelRoot,
	detachedSceneAssets,
	getDefaultAssetUnitMode,
	disposeObject,
	clearHistory,
	placeAllCamerasAtHome,
	resetLocalizedCaches,
	updateUi,
	setExportStatus,
	t,
	setStatus,
}) {
	function getSceneAssetParentRoot(asset) {
		return asset?.kind === "splat" ? splatRoot : modelRoot;
	}

	function attachSceneAsset(asset) {
		if (!asset?.object) {
			return;
		}
		const parentRoot = getSceneAssetParentRoot(asset);
		if (asset.object.parent !== parentRoot) {
			parentRoot?.add(asset.object);
		}
		asset.object.updateMatrixWorld(true);
	}

	function detachSceneAsset(asset) {
		if (!asset?.object) {
			return;
		}
		asset.object.removeFromParent();
		detachedSceneAssets.set(asset.id, asset);
	}

	function restoreSceneAsset(asset) {
		if (!asset) {
			return;
		}
		detachedSceneAssets.delete(asset.id);
		attachSceneAsset(asset);
	}

	function disposeSceneAsset(asset) {
		if (!asset?.object) {
			return;
		}
		detachedSceneAssets.delete(asset.id);
		asset.object.removeFromParent();
		if (asset.kind === "splat") {
			asset.disposeTarget?.dispose?.();
			return;
		}
		disposeObject(asset.object);
	}

	function disposeDetachedSceneAssets() {
		for (const asset of detachedSceneAssets.values()) {
			disposeSceneAsset(asset);
		}
		detachedSceneAssets.clear();
	}

	function applyAssetWorldScale(asset) {
		asset.object.scale.copy(asset.baseScale).multiplyScalar(asset.worldScale);
		asset.object.updateMatrixWorld(true);
	}

	function registerAsset({
		kind,
		label,
		object,
		contentObject = object?.children?.[0] ?? null,
		disposeTarget = null,
		source = null,
	}) {
		const asset = {
			id: sceneState.nextAssetId++,
			kind,
			label,
			object,
			contentObject,
			disposeTarget,
			source,
			localBoundsHint: null,
			localCenterBoundsHint: null,
			baseScale: object.scale.clone(),
			unitMode: getDefaultAssetUnitMode(kind),
			worldScale: 1,
			exportRole: "beauty",
			maskGroup: "",
			workingPivotLocal: null,
		};
		applyAssetWorldScale(asset);
		sceneState.assets.push(asset);
		return asset;
	}

	function getSceneAsset(assetId) {
		return sceneState.assets.find((asset) => asset.id === assetId) ?? null;
	}

	function getSceneAssetForObject(object3d) {
		let current = object3d;
		while (current) {
			const asset = sceneState.assets.find((entry) => entry.object === current);
			if (asset) {
				return asset;
			}
			current = current.parent;
		}
		return null;
	}

	function getSceneRaycastTargets() {
		return sceneState.assets
			.filter((asset) => asset.object.visible !== false)
			.map((asset) => asset.object);
	}

	function clearScene() {
		disposeDetachedSceneAssets();
		clearHistory();
		for (const asset of sceneState.assets) {
			disposeSceneAsset(asset);
		}

		sceneState.assets = [];
		store.selectedSceneAssetIds.value = [];
		store.selectedSceneAssetId.value = null;
		placeAllCamerasAtHome();
		resetLocalizedCaches();
		updateUi();
		store.exportSummary.value = t("exportSummary.empty");
		setExportStatus("export.idle");
		setStatus(t("status.sceneCleared"));
	}

	return {
		registerAsset,
		applyAssetWorldScale,
		getSceneAsset,
		getSceneAssetForObject,
		getSceneRaycastTargets,
		clearScene,
		attachSceneAsset,
		detachSceneAsset,
		restoreSceneAsset,
		disposeSceneAsset,
		disposeDetachedSceneAssets,
	};
}
