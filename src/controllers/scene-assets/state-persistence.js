import * as THREE from "three";

export function createSceneAssetStatePersistence({
	sceneState,
	store,
	detachedSceneAssets,
	getProjectSourceStableKey,
	isProjectFileEmbeddedFileSource,
	isProjectFilePackedSplatSource,
	captureObjectLocalTransformState,
	applyObjectLocalTransformState,
	clampAssetWorldScale,
	clampAssetTransformValue,
	normalizeWorkingPivotLocal,
	applyAssetWorldScale,
	restoreSceneAsset,
	detachSceneAsset,
	captureProjectSceneState,
	applyProjectAssetState,
	loadSources,
}) {
	function cloneSerializable(value) {
		if (value == null) {
			return value;
		}
		if (typeof structuredClone === "function") {
			return structuredClone(value);
		}
		return JSON.parse(JSON.stringify(value));
	}

	function clonePackedSplatEditSource(source) {
		if (!isProjectFilePackedSplatSource(source)) {
			return null;
		}
		return cloneSerializable(source);
	}

	function shouldCapturePackedSplatEditSource(asset) {
		return (
			asset?.capturePackedSplatSourceInEditState === true &&
			isProjectFilePackedSplatSource(asset?.source)
		);
	}

	function syncPackedSplatBoundsHints(asset) {
		const splatMesh = asset?.disposeTarget;
		if (!splatMesh || typeof splatMesh.getBoundingBox !== "function") {
			return false;
		}
		const localBoundsHint =
			splatMesh.getBoundingBox(false)?.clone?.() ??
			splatMesh.getBoundingBox()?.clone?.() ??
			null;
		const localCenterBoundsHint =
			splatMesh.getBoundingBox(true)?.clone?.() ??
			localBoundsHint?.clone?.() ??
			null;
		asset.localBoundsHint = localBoundsHint;
		asset.localCenterBoundsHint = localCenterBoundsHint;
		return true;
	}

	function restorePackedSplatEditSource(asset, sourceSnapshot) {
		const nextSource = clonePackedSplatEditSource(sourceSnapshot);
		if (!asset || !nextSource) {
			return false;
		}
		const packedSplats = asset.disposeTarget?.packedSplats;
		if (typeof packedSplats?.reinitialize !== "function") {
			return false;
		}
		packedSplats.reinitialize({
			packedArray: nextSource.packedArray,
			numSplats: nextSource.numSplats,
			extra: nextSource.extra ?? {},
			splatEncoding: nextSource.splatEncoding ?? null,
			lod: packedSplats.lod,
			nonLod: packedSplats.nonLod,
		});
		packedSplats.disposeLodSplats?.();
		packedSplats.needsUpdate = true;
		asset.disposeTarget.numSplats =
			packedSplats.getNumSplats?.() ?? packedSplats.numSplats ?? 0;
		asset.disposeTarget.updateGenerator?.();
		asset.disposeTarget.updateVersion?.();
		asset.source = nextSource;
		asset.capturePackedSplatSourceInEditState = true;
		syncPackedSplatBoundsHints(asset);
		return true;
	}

	function getSceneAssetSourceKey(asset) {
		return getProjectSourceStableKey(asset?.source);
	}

	function getWorkingSceneAssetKey(asset, index = 0) {
		return (
			getSceneAssetSourceKey(asset) ??
			asset?.source?.workingStateKey ??
			`working-asset:${asset?.kind ?? "asset"}:${asset?.label ?? index}:${index}`
		);
	}

	function captureSceneAssetEditState() {
		return {
			selectedSceneAssetIds: [...store.selectedSceneAssetIds.value],
			selectedSceneAssetId: store.selectedSceneAssetId.value,
			assets: sceneState.assets.map((asset) => ({
				id: asset.id,
				kind: asset.kind,
				worldScale: asset.worldScale,
				unitMode: asset.unitMode,
				exportRole: asset.exportRole ?? "beauty",
				maskGroup: asset.maskGroup ?? "",
				workingPivotLocal: asset.workingPivotLocal
					? {
							x: asset.workingPivotLocal.x,
							y: asset.workingPivotLocal.y,
							z: asset.workingPivotLocal.z,
						}
					: null,
				baseScale: {
					x: asset.baseScale.x,
					y: asset.baseScale.y,
					z: asset.baseScale.z,
				},
				contentTransform: captureObjectLocalTransformState(asset.contentObject),
				visible: asset.object.visible !== false,
				position: {
					x: asset.object.position.x,
					y: asset.object.position.y,
					z: asset.object.position.z,
				},
				sourceSnapshot: shouldCapturePackedSplatEditSource(asset)
					? clonePackedSplatEditSource(asset.source)
					: null,
				rotationDegrees: {
					x: THREE.MathUtils.radToDeg(asset.object.rotation.x),
					y: THREE.MathUtils.radToDeg(asset.object.rotation.y),
					z: THREE.MathUtils.radToDeg(asset.object.rotation.z),
				},
			})),
		};
	}

	function restoreSceneAssetEditState(snapshot) {
		if (!snapshot || !Array.isArray(snapshot.assets)) {
			return false;
		}

		const availableAssetsById = new Map(
			sceneState.assets.map((asset) => [asset.id, asset]),
		);
		for (const [assetId, asset] of detachedSceneAssets.entries()) {
			if (!availableAssetsById.has(assetId)) {
				availableAssetsById.set(assetId, asset);
			}
		}
		const restoredAssets = [];

		for (const item of snapshot.assets) {
			const asset = availableAssetsById.get(item.id);
			if (!asset || asset.kind !== item.kind) {
				return false;
			}
			restoredAssets.push(asset);
		}

		const restoredAssetIdSet = new Set(restoredAssets.map((asset) => asset.id));
		for (const asset of restoredAssets) {
			restoreSceneAsset(asset);
		}
		for (const asset of sceneState.assets) {
			if (!restoredAssetIdSet.has(asset.id)) {
				detachSceneAsset(asset);
			}
		}

		sceneState.assets = restoredAssets;
		for (const item of snapshot.assets) {
			const asset = availableAssetsById.get(item.id);
			asset.worldScale = clampAssetWorldScale(item.worldScale);
			asset.unitMode = item.unitMode ?? asset.unitMode;
			asset.exportRole = item.exportRole === "omit" ? "omit" : "beauty";
			asset.maskGroup = String(item.maskGroup ?? "").trim();
			asset.workingPivotLocal = normalizeWorkingPivotLocal(
				item.workingPivotLocal,
			);
			asset.baseScale.set(
				clampAssetTransformValue(item.baseScale?.x, asset.baseScale.x),
				clampAssetTransformValue(item.baseScale?.y, asset.baseScale.y),
				clampAssetTransformValue(item.baseScale?.z, asset.baseScale.z),
			);
			applyObjectLocalTransformState(
				asset.contentObject,
				item.contentTransform,
			);
			asset.object.visible = item.visible !== false;
			asset.object.position.set(
				clampAssetTransformValue(item.position?.x, asset.object.position.x),
				clampAssetTransformValue(item.position?.y, asset.object.position.y),
				clampAssetTransformValue(item.position?.z, asset.object.position.z),
			);
			asset.object.rotation.set(
				THREE.MathUtils.degToRad(
					clampAssetTransformValue(
						item.rotationDegrees?.x,
						THREE.MathUtils.radToDeg(asset.object.rotation.x),
					),
				),
				THREE.MathUtils.degToRad(
					clampAssetTransformValue(
						item.rotationDegrees?.y,
						THREE.MathUtils.radToDeg(asset.object.rotation.y),
					),
				),
				THREE.MathUtils.degToRad(
					clampAssetTransformValue(
						item.rotationDegrees?.z,
						THREE.MathUtils.radToDeg(asset.object.rotation.z),
					),
				),
			);
			applyAssetWorldScale(asset);
			asset.object.updateMatrixWorld(true);
			if (item.sourceSnapshot != null) {
				if (!restorePackedSplatEditSource(asset, item.sourceSnapshot)) {
					return false;
				}
			} else {
				asset.capturePackedSplatSourceInEditState = false;
			}
		}

		const restoredSelectedIds = Array.isArray(snapshot.selectedSceneAssetIds)
			? snapshot.selectedSceneAssetIds.filter((assetId) =>
					snapshot.assets.some((asset) => asset.id === assetId),
				)
			: [];
		store.selectedSceneAssetIds.value = [...new Set(restoredSelectedIds)];
		store.selectedSceneAssetId.value =
			snapshot.assets.some(
				(asset) => asset.id === snapshot.selectedSceneAssetId,
			) &&
			store.selectedSceneAssetIds.value.includes(snapshot.selectedSceneAssetId)
				? snapshot.selectedSceneAssetId
				: (store.selectedSceneAssetIds.value[0] ?? null);
		return true;
	}

	function captureWorkingProjectSceneState() {
		const selectedIds = new Set(store.selectedSceneAssetIds.value.map(String));
		let activeAssetKey = null;
		const assets = captureProjectSceneState().map((asset, index) => {
			const sceneAsset = sceneState.assets[index] ?? null;
			const assetKey = getWorkingSceneAssetKey(sceneAsset, index);
			const persistedSource = getProjectSourceStableKey(asset.source)
				? null
				: asset.source;
			if (
				selectedIds.has(String(asset.id)) &&
				String(asset.id) === String(store.selectedSceneAssetId.value)
			) {
				activeAssetKey = assetKey;
			}
			return {
				...asset,
				workingAssetKey: assetKey,
				source: persistedSource,
			};
		});

		const selectedAssetKeys = assets
			.filter((asset) => selectedIds.has(String(asset.id)))
			.map((asset) => asset.workingAssetKey);

		return {
			assets,
			selectedAssetKeys,
			activeAssetKey,
		};
	}

	async function applyWorkingProjectSceneState(snapshot) {
		if (!snapshot || !Array.isArray(snapshot.assets)) {
			return false;
		}

		const existingAssetsByKey = new Map();
		for (let index = 0; index < sceneState.assets.length; index += 1) {
			const asset = sceneState.assets[index];
			const assetKey = getWorkingSceneAssetKey(asset, index);
			if (!existingAssetsByKey.has(assetKey)) {
				existingAssetsByKey.set(assetKey, asset);
			}
		}

		const missingSources = [];
		for (const item of snapshot.assets) {
			if (existingAssetsByKey.has(item.workingAssetKey)) {
				continue;
			}
			if (!item.source) {
				continue;
			}
			item.source.workingStateKey = item.workingAssetKey;
			if (
				isProjectFileEmbeddedFileSource(item.source) ||
				isProjectFilePackedSplatSource(item.source)
			) {
				item.source.projectAssetState = item;
			}
			missingSources.push(item.source);
		}

		if (missingSources.length > 0) {
			await loadSources(missingSources, false, { resetHistory: false });
		}

		const refreshedAssetsByKey = new Map();
		for (let index = 0; index < sceneState.assets.length; index += 1) {
			const asset = sceneState.assets[index];
			const assetKey = getWorkingSceneAssetKey(asset, index);
			if (!refreshedAssetsByKey.has(assetKey)) {
				refreshedAssetsByKey.set(assetKey, asset);
			}
		}

		const orderedAssets = [];
		const selectedAssetIds = [];
		let activeAssetId = null;

		for (const item of snapshot.assets) {
			const asset = refreshedAssetsByKey.get(item.workingAssetKey);
			if (!asset) {
				continue;
			}
			applyProjectAssetState(asset, item);
			orderedAssets.push(asset);
			if (snapshot.selectedAssetKeys?.includes(item.workingAssetKey)) {
				selectedAssetIds.push(asset.id);
			}
			if (item.workingAssetKey === snapshot.activeAssetKey) {
				activeAssetId = asset.id;
			}
		}

		for (const asset of sceneState.assets) {
			if (!orderedAssets.includes(asset)) {
				orderedAssets.push(asset);
			}
		}

		sceneState.assets = orderedAssets;
		store.selectedSceneAssetIds.value = [...new Set(selectedAssetIds)];
		store.selectedSceneAssetId.value =
			activeAssetId && store.selectedSceneAssetIds.value.includes(activeAssetId)
				? activeAssetId
				: (store.selectedSceneAssetIds.value[0] ?? null);
		return true;
	}

	return {
		captureSceneAssetEditState,
		restoreSceneAssetEditState,
		captureWorkingProjectSceneState,
		applyWorkingProjectSceneState,
	};
}
