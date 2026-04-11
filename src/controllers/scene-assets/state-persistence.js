import * as THREE from "three";
import { debugSplatHistory } from "../../debug/splat-history-debug.js";
import {
	createProjectFilePackedSplatSource,
	toUint32Array,
} from "../../project-document.js";

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
	function sanitizePackedSplatProjectAssetState(projectAssetState) {
		if (!projectAssetState || typeof projectAssetState !== "object") {
			return null;
		}
		const { source: _source, ...snapshotWithoutSource } = projectAssetState;
		try {
			return JSON.parse(JSON.stringify(snapshotWithoutSource));
		} catch {
			return {
				id: snapshotWithoutSource.id ?? null,
				kind: snapshotWithoutSource.kind ?? "splat",
				label: snapshotWithoutSource.label ?? "",
				transform: snapshotWithoutSource.transform ?? null,
				contentTransform: snapshotWithoutSource.contentTransform ?? null,
				baseScale: snapshotWithoutSource.baseScale ?? null,
				worldScale: snapshotWithoutSource.worldScale ?? 1,
				unitMode: snapshotWithoutSource.unitMode ?? "scene-default",
				visible: snapshotWithoutSource.visible !== false,
				exportRole:
					snapshotWithoutSource.exportRole === "omit" ? "omit" : "beauty",
				maskGroup: snapshotWithoutSource.maskGroup ?? "",
				workingPivotLocal: snapshotWithoutSource.workingPivotLocal ?? null,
				legacyState: snapshotWithoutSource.legacyState ?? null,
				order: snapshotWithoutSource.order ?? 0,
			};
		}
	}

	function sanitizeJsonCompatibleValue(value) {
		if (value === null || value === undefined) {
			return null;
		}
		if (
			typeof value === "string" ||
			typeof value === "number" ||
			typeof value === "boolean"
		) {
			return value;
		}
		if (Array.isArray(value)) {
			return value
				.map((entry) => sanitizeJsonCompatibleValue(entry))
				.filter((entry) => entry !== undefined);
		}
		if (typeof value !== "object") {
			return undefined;
		}
		try {
			return JSON.parse(JSON.stringify(value));
		} catch {
			const sanitized = {};
			for (const [key, entry] of Object.entries(value)) {
				const nextValue = sanitizeJsonCompatibleValue(entry);
				if (nextValue !== undefined) {
					sanitized[key] = nextValue;
				}
			}
			return sanitized;
		}
	}

	function sanitizePackedSplatExtra(extra) {
		if (!extra || typeof extra !== "object") {
			return {};
		}
		const sanitized = {};
		for (const key of ["lodTree", "sh1", "sh2", "sh3"]) {
			const value = toUint32Array(extra[key]);
			if (value.length > 0) {
				sanitized[key] = value;
			}
		}
		const radMeta = sanitizeJsonCompatibleValue(extra.radMeta);
		if (radMeta && typeof radMeta === "object") {
			sanitized.radMeta = radMeta;
		}
		return sanitized;
	}

	function normalizePackedSplatEditSource(source) {
		if (!isProjectFilePackedSplatSource(source)) {
			return null;
		}
		return createProjectFilePackedSplatSource({
			fileName: source.fileName,
			inputBytes: source.inputBytes ?? new Uint8Array(),
			extraFiles: source.extraFiles ?? {},
			fileType: source.fileType ?? null,
			packedArray: source.packedArray ?? new Uint32Array(),
			numSplats: source.numSplats ?? 0,
			extra: sanitizePackedSplatExtra(source.extra),
			splatEncoding: sanitizeJsonCompatibleValue(source.splatEncoding),
			projectAssetState: sanitizePackedSplatProjectAssetState(
				source.projectAssetState,
			),
			legacyState: sanitizeJsonCompatibleValue(source.legacyState),
			resource: sanitizeJsonCompatibleValue(source.resource),
		});
	}

	function capturePackedSplatEditSource(asset) {
		const packedSplats = asset?.disposeTarget?.packedSplats;
		if (packedSplats) {
			return createProjectFilePackedSplatSource({
				fileName:
					asset?.source?.fileName ?? `${asset?.label ?? "edited"}.rawsplat`,
				inputBytes: asset?.source?.inputBytes ?? new Uint8Array(),
				extraFiles: asset?.source?.extraFiles ?? {},
				fileType: asset?.source?.fileType ?? null,
				packedArray: packedSplats.packedArray ?? new Uint32Array(),
				numSplats: packedSplats.getNumSplats?.() ?? packedSplats.numSplats ?? 0,
				extra: sanitizePackedSplatExtra(packedSplats.extra),
				splatEncoding: sanitizeJsonCompatibleValue(packedSplats.splatEncoding),
				projectAssetState: sanitizePackedSplatProjectAssetState(
					asset?.source?.projectAssetState,
				),
				legacyState: sanitizeJsonCompatibleValue(asset?.source?.legacyState),
				resource: sanitizeJsonCompatibleValue(asset?.source?.resource),
				skipClone: true,
			});
		}
		if (!isProjectFilePackedSplatSource(asset?.source)) {
			return null;
		}
		return createProjectFilePackedSplatSource({
			fileName: asset.source.fileName,
			inputBytes: asset.source.inputBytes ?? new Uint8Array(),
			extraFiles: asset.source.extraFiles ?? {},
			fileType: asset.source.fileType ?? null,
			packedArray: asset.source.packedArray ?? new Uint32Array(),
			numSplats: asset.source.numSplats ?? 0,
			extra: sanitizePackedSplatExtra(asset.source.extra),
			splatEncoding: sanitizeJsonCompatibleValue(asset.source.splatEncoding),
			projectAssetState: sanitizePackedSplatProjectAssetState(
				asset.source.projectAssetState,
			),
			legacyState: sanitizeJsonCompatibleValue(asset.source.legacyState),
			resource: sanitizeJsonCompatibleValue(asset.source.resource),
			skipClone: true,
		});
	}

	function shouldCapturePackedSplatEditSource(asset) {
		return (
			asset?.capturePackedSplatSourceInEditState === true &&
			(isProjectFilePackedSplatSource(asset?.source) ||
				asset?.disposeTarget?.packedSplats != null)
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

	function resetPackedSplatRuntimeResources(
		packedSplats,
		{ packedArray = null, extra = {}, splatEncoding = null } = {},
	) {
		if (!packedSplats || typeof packedSplats !== "object") {
			return false;
		}
		packedSplats.source?.dispose?.();
		packedSplats.target?.dispose?.();
		packedSplats.source = null;
		packedSplats.target = null;
		packedSplats.packedArray =
			packedArray instanceof Uint32Array
				? packedArray
				: packedSplats.packedArray;
		packedSplats.extra = extra;
		packedSplats.splatEncoding = splatEncoding;
		packedSplats.needsUpdate = true;
		return true;
	}

	function restorePackedSplatRuntimeSourceInPlace(
		packedSplats,
		{
			packedArray = null,
			extra = {},
			splatEncoding = null,
			numSplats = 0,
		} = {},
	) {
		if (
			!(packedArray instanceof Uint32Array) ||
			!(packedSplats?.packedArray instanceof Uint32Array) ||
			packedSplats.packedArray.length !== packedArray.length
		) {
			return false;
		}
		packedSplats.packedArray.set(packedArray);
		const currentExtra =
			packedSplats.extra && typeof packedSplats.extra === "object"
				? { ...packedSplats.extra }
				: {};
		for (const key of ["lodTree", "sh1", "sh2", "sh3"]) {
			const nextArray = extra?.[key];
			const currentArray = currentExtra[key];
			if (!(nextArray instanceof Uint32Array)) {
				delete currentExtra[key];
				continue;
			}
			if (
				currentArray instanceof Uint32Array &&
				currentArray.length === nextArray.length
			) {
				currentArray.set(nextArray);
				currentExtra[key] = currentArray;
				continue;
			}
			currentExtra[key] = new Uint32Array(nextArray);
		}
		if (extra?.radMeta && typeof extra.radMeta === "object") {
			currentExtra.radMeta = JSON.parse(JSON.stringify(extra.radMeta));
		} else {
			currentExtra.radMeta = undefined;
		}
		packedSplats.extra = currentExtra;
		packedSplats.splatEncoding = splatEncoding;
		packedSplats.numSplats =
			Number.isFinite(numSplats) && numSplats >= 0
				? Math.floor(numSplats)
				: packedSplats.numSplats;
		packedSplats.needsUpdate = true;
		return true;
	}

	function restorePackedSplatEditSource(asset, sourceSnapshot) {
		const nextSource = normalizePackedSplatEditSource(sourceSnapshot);
		if (!asset || !nextSource) {
			return false;
		}
		const packedSplats = asset.disposeTarget?.packedSplats;
		if (typeof packedSplats?.reinitialize !== "function") {
			return false;
		}
		const nextPackedArray = nextSource.packedArray;
		const nextExtra = nextSource.extra ?? {};
		const nextEncoding = nextSource.splatEncoding ?? null;
		const previousNumSplats =
			packedSplats.getNumSplats?.() ?? packedSplats.numSplats ?? null;
		const restoredInPlace = restorePackedSplatRuntimeSourceInPlace(
			packedSplats,
			{
				packedArray: nextPackedArray,
				numSplats: nextSource.numSplats,
				extra: nextExtra,
				splatEncoding: nextEncoding,
			},
		);
		if (!restoredInPlace) {
			packedSplats.reinitialize({
				packedArray: nextPackedArray,
				numSplats: nextSource.numSplats,
				extra: nextExtra,
				splatEncoding: nextEncoding,
				lod: packedSplats.lod,
				nonLod: packedSplats.nonLod,
			});
			resetPackedSplatRuntimeResources(packedSplats, {
				packedArray: nextPackedArray,
				extra: nextExtra,
				splatEncoding: nextEncoding,
			});
		}
		packedSplats.disposeLodSplats?.();
		packedSplats.needsUpdate = true;
		asset.disposeTarget.numSplats =
			packedSplats.getNumSplats?.() ?? packedSplats.numSplats ?? 0;
		asset.disposeTarget.lastSplats = null;
		asset.disposeTarget.splats = packedSplats;
		asset.disposeTarget.generatorDirty = true;
		asset.disposeTarget.updateGenerator?.();
		asset.disposeTarget.updateVersion?.();
		asset.source = nextSource;
		asset.capturePackedSplatSourceInEditState = false;
		asset.persistentSourceDirty = false;
		syncPackedSplatBoundsHints(asset);
		debugSplatHistory("restore-packed-source", {
			assetId: asset.id,
			beforeNumSplats: previousNumSplats,
			afterNumSplats:
				packedSplats.getNumSplats?.() ?? packedSplats.numSplats ?? null,
			snapshotNumSplats: nextSource.numSplats ?? null,
			packedArrayType: nextSource.packedArray?.constructor?.name ?? null,
			lodTreeType: nextSource.extra?.lodTree?.constructor?.name ?? null,
			sh1Type: nextSource.extra?.sh1?.constructor?.name ?? null,
			sh2Type: nextSource.extra?.sh2?.constructor?.name ?? null,
			sh3Type: nextSource.extra?.sh3?.constructor?.name ?? null,
			runtimePackedArrayType:
				packedSplats.packedArray?.constructor?.name ?? null,
			runtimeLodTreeType:
				packedSplats.extra?.lodTree?.constructor?.name ?? null,
			runtimeSh1Type: packedSplats.extra?.sh1?.constructor?.name ?? null,
			runtimeSh2Type: packedSplats.extra?.sh2?.constructor?.name ?? null,
			runtimeSh3Type: packedSplats.extra?.sh3?.constructor?.name ?? null,
			restoredInPlace,
		});
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
					? capturePackedSplatEditSource(asset)
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
				asset.persistentSourceDirty = false;
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
				item.source.projectAssetState =
					sanitizePackedSplatProjectAssetState(item);
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
