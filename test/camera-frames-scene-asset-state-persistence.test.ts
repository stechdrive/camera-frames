import assert from "node:assert/strict";
import * as THREE from "three";
import { createSceneAssetStatePersistence } from "../src/controllers/scene-assets/state-persistence.js";

function captureObjectLocalTransformState(object) {
	if (!object) {
		return null;
	}
	return {
		position: {
			x: object.position.x,
			y: object.position.y,
			z: object.position.z,
		},
		quaternion: {
			x: object.quaternion.x,
			y: object.quaternion.y,
			z: object.quaternion.z,
			w: object.quaternion.w,
		},
		scale: {
			x: object.scale.x,
			y: object.scale.y,
			z: object.scale.z,
		},
	};
}

function applyObjectLocalTransformState(object, state) {
	if (!object || !state) {
		return;
	}
	object.position.set(state.position.x, state.position.y, state.position.z);
	object.quaternion.set(
		state.quaternion.x,
		state.quaternion.y,
		state.quaternion.z,
		state.quaternion.w,
	);
	object.scale.set(state.scale.x, state.scale.y, state.scale.z);
	object.updateMatrixWorld(true);
}

function createAsset(id, kind, label, source = null) {
	const object = new THREE.Group();
	const contentObject = new THREE.Group();
	object.add(contentObject);
	return {
		id,
		kind,
		label,
		object,
		contentObject,
		source,
		baseScale: new THREE.Vector3(1, 1, 1),
		unitMode: "meters",
		worldScale: 1,
		exportRole: "beauty",
		maskGroup: "",
		workingPivotLocal: null,
	};
}

function createPackedSplatAsset(id, label, source) {
	const asset = createAsset(id, "splat", label, source);
	let packedArray =
		source?.packedArray instanceof Uint32Array
			? new Uint32Array(source.packedArray)
			: new Uint32Array();
	let numSplats = Number.isFinite(source?.numSplats)
		? Number(source.numSplats)
		: 0;
	const disposeTarget = {
		packedSplats: {
			packedArray,
			numSplats,
			lod: true,
			nonLod: false,
			needsUpdate: false,
			reinitialize(options = {}) {
				packedArray =
					options.packedArray instanceof Uint32Array
						? new Uint32Array(options.packedArray)
						: new Uint32Array();
				numSplats = Number.isFinite(options.numSplats)
					? Number(options.numSplats)
					: packedArray.length / 4;
				this.packedArray = packedArray;
				this.numSplats = numSplats;
				this.extra = options.extra ?? {};
				this.splatEncoding = options.splatEncoding ?? null;
			},
			getNumSplats() {
				return numSplats;
			},
			disposeLodSplatsCalled: 0,
			disposeLodSplats() {
				this.disposeLodSplatsCalled += 1;
			},
		},
		numSplats,
		updateGeneratorCalls: 0,
		updateGenerator() {
			this.updateGeneratorCalls += 1;
		},
		updateVersionCalls: 0,
		updateVersion() {
			this.updateVersionCalls += 1;
		},
		getBoundingBox(centersOnly = false) {
			return centersOnly
				? new THREE.Box3(
						new THREE.Vector3(-0.5, -0.5, -0.5),
						new THREE.Vector3(0.5, 0.5, 0.5),
					)
				: new THREE.Box3(
						new THREE.Vector3(-1, -1, -1),
						new THREE.Vector3(1, 1, 1),
					);
		},
	};
	asset.disposeTarget = disposeTarget;
	return asset;
}

function createHarness() {
	const sceneState = {
		assets: [],
	};
	const store = {
		selectedSceneAssetIds: { value: [] },
		selectedSceneAssetId: { value: null },
	};
	const detachedSceneAssets = new Map();
	const calls = {
		restoreSceneAsset: [],
		detachSceneAsset: [],
		loadSources: [],
	};
	const statePersistence = createSceneAssetStatePersistence({
		sceneState,
		store,
		detachedSceneAssets,
		getProjectSourceStableKey: (source) => source?.stableKey ?? null,
		isProjectFileEmbeddedFileSource: (source) => source?.kind === "embedded",
		isProjectFilePackedSplatSource: (source) => source?.kind === "packed-splat",
		captureObjectLocalTransformState,
		applyObjectLocalTransformState,
		clampAssetWorldScale: (value) => Math.max(0.01, Number(value) || 1),
		clampAssetTransformValue: (value, fallback = 0) => {
			const nextValue = Number(value);
			return Number.isFinite(nextValue) ? nextValue : fallback;
		},
		normalizeWorkingPivotLocal: (value) =>
			value
				? new THREE.Vector3(
						Number(value.x ?? 0),
						Number(value.y ?? 0),
						Number(value.z ?? 0),
					)
				: null,
		applyAssetWorldScale: (asset) => {
			asset.object.scale.copy(asset.baseScale).multiplyScalar(asset.worldScale);
			asset.object.updateMatrixWorld(true);
		},
		restoreSceneAsset: (asset) => {
			calls.restoreSceneAsset.push(asset.id);
			detachedSceneAssets.delete(asset.id);
		},
		detachSceneAsset: (asset) => {
			calls.detachSceneAsset.push(asset.id);
			detachedSceneAssets.set(asset.id, asset);
		},
		captureProjectSceneState: () =>
			sceneState.assets.map((asset, index) => ({
				id: String(asset.id),
				kind: asset.kind,
				label: asset.label,
				source: asset.source,
				transform: {
					position: {
						x: asset.object.position.x,
						y: asset.object.position.y,
						z: asset.object.position.z,
					},
					quaternion: {
						x: asset.object.quaternion.x,
						y: asset.object.quaternion.y,
						z: asset.object.quaternion.z,
						w: asset.object.quaternion.w,
					},
				},
				contentTransform: captureObjectLocalTransformState(asset.contentObject),
				baseScale: {
					x: asset.baseScale.x,
					y: asset.baseScale.y,
					z: asset.baseScale.z,
				},
				worldScale: asset.worldScale,
				unitMode: asset.unitMode,
				visible: asset.object.visible !== false,
				exportRole: asset.exportRole,
				maskGroup: asset.maskGroup,
				workingPivotLocal: asset.workingPivotLocal
					? {
							x: asset.workingPivotLocal.x,
							y: asset.workingPivotLocal.y,
							z: asset.workingPivotLocal.z,
						}
					: null,
				order: index,
			})),
		applyProjectAssetState: (asset, item) => {
			asset.label = item.label;
			asset.worldScale = item.worldScale;
			asset.unitMode = item.unitMode ?? asset.unitMode;
			asset.exportRole = item.exportRole;
			asset.maskGroup = item.maskGroup;
			asset.workingPivotLocal = item.workingPivotLocal
				? new THREE.Vector3(
						item.workingPivotLocal.x,
						item.workingPivotLocal.y,
						item.workingPivotLocal.z,
					)
				: null;
			asset.object.position.set(
				item.transform.position.x,
				item.transform.position.y,
				item.transform.position.z,
			);
			asset.object.quaternion.set(
				item.transform.quaternion.x,
				item.transform.quaternion.y,
				item.transform.quaternion.z,
				item.transform.quaternion.w,
			);
			asset.object.visible = item.visible !== false;
		},
		loadSources: async (sources, replace, options) => {
			calls.loadSources.push({ sources, replace, options });
			for (const source of sources) {
				const asset = createAsset(
					source.projectAssetState?.id ?? source.workingStateKey,
					source.projectAssetState?.kind ?? "model",
					source.projectAssetState?.label ?? source.fileName ?? "asset",
					source,
				);
				sceneState.assets.push(asset);
			}
		},
	});
	return {
		sceneState,
		store,
		detachedSceneAssets,
		calls,
		statePersistence,
	};
}

{
	const { sceneState, store, statePersistence } = createHarness();
	const stableAsset = createAsset(1, "model", "Stable", {
		stableKey: "stable://a",
	});
	stableAsset.object.position.set(1, 2, 3);
	stableAsset.object.rotation.set(0.1, 0.2, 0.3);
	stableAsset.worldScale = 2;
	sceneState.assets.push(stableAsset);
	store.selectedSceneAssetIds.value = [1];
	store.selectedSceneAssetId.value = 1;

	const snapshot = statePersistence.captureSceneAssetEditState();

	assert.equal(snapshot.assets.length, 1);
	assert.deepEqual(snapshot.selectedSceneAssetIds, [1]);
	assert.equal(snapshot.selectedSceneAssetId, 1);
	assert.equal(snapshot.assets[0].worldScale, 2);
	assert.equal(snapshot.assets[0].position.x, 1);
	assert.ok(Math.abs(snapshot.assets[0].rotationDegrees.y - 11.459) < 0.01);
}

{
	const { sceneState, statePersistence } = createHarness();
	const packedSource = {
		kind: "packed-splat",
		fileName: "edited.rawsplat",
		packedArray: new Uint32Array([1, 2, 3, 4]),
		numSplats: 1,
		extra: { lodTree: new Uint32Array([7, 8, 9]) },
		splatEncoding: { mode: "test" },
		resource: { type: "raw-packed-splat", packedArray: { sha256: "abc" } },
	};
	const asset = createPackedSplatAsset(1, "Edited", packedSource);
	asset.capturePackedSplatSourceInEditState = true;
	sceneState.assets.push(asset);

	const snapshot = statePersistence.captureSceneAssetEditState();

	assert.deepEqual(
		Array.from(snapshot.assets[0].sourceSnapshot.packedArray),
		[1, 2, 3, 4],
	);
	assert.notEqual(snapshot.assets[0].sourceSnapshot, packedSource);
}

{
	const { sceneState, statePersistence } = createHarness();
	const packedSource = {
		kind: "packed-splat",
		fileName: "edited.rawsplat",
		packedArray: new Uint32Array([1, 2, 3, 4]),
		numSplats: 1,
		extra: {
			lodTree: new Uint32Array([7, 8, 9]),
			radMeta: {
				mode: "test",
				update() {
					return null;
				},
			},
		},
		splatEncoding: {
			mode: "test",
			update() {
				return null;
			},
		},
		projectAssetState: {
			id: "asset-1",
			kind: "splat",
			label: "Edited",
			source: {
				update() {
					return null;
				},
			},
		},
		legacyState: {
			path: "edited.rawsplat",
			update() {
				return null;
			},
		},
		resource: {
			type: "raw-packed-splat",
			path: "assets/edited.rawsplat",
			update() {
				return null;
			},
		},
	};
	const asset = createPackedSplatAsset(1, "Edited", packedSource);
	asset.capturePackedSplatSourceInEditState = true;
	sceneState.assets.push(asset);

	const snapshot = statePersistence.captureSceneAssetEditState();

	assert.equal(
		"source" in snapshot.assets[0].sourceSnapshot.projectAssetState,
		false,
	);
	assert.equal(
		"update" in (snapshot.assets[0].sourceSnapshot.splatEncoding ?? {}),
		false,
	);
	assert.equal(
		"update" in (snapshot.assets[0].sourceSnapshot.resource ?? {}),
		false,
	);
	assert.equal(
		"update" in (snapshot.assets[0].sourceSnapshot.legacyState ?? {}),
		false,
	);
	assert.equal(
		"update" in (snapshot.assets[0].sourceSnapshot.extra?.radMeta ?? {}),
		false,
	);
	assert.doesNotThrow(() => structuredClone(snapshot));
}

{
	const { sceneState, store, detachedSceneAssets, calls, statePersistence } =
		createHarness();
	const assetA = createAsset(1, "model", "A");
	const assetB = createAsset(2, "model", "B");
	sceneState.assets.push(assetA, assetB);
	assetB.object.position.set(10, 0, 0);
	detachedSceneAssets.set(assetA.id, assetA);

	const restored = statePersistence.restoreSceneAssetEditState({
		selectedSceneAssetIds: [2],
		selectedSceneAssetId: 2,
		assets: [
			{
				id: 2,
				kind: "model",
				worldScale: 1.5,
				unitMode: "meters",
				exportRole: "beauty",
				maskGroup: "mask-a",
				workingPivotLocal: { x: 1, y: 2, z: 3 },
				baseScale: { x: 2, y: 2, z: 2 },
				contentTransform: captureObjectLocalTransformState(
					assetB.contentObject,
				),
				visible: false,
				position: { x: 4, y: 5, z: 6 },
				rotationDegrees: { x: 0, y: 90, z: 0 },
			},
		],
	});

	assert.equal(restored, true);
	assert.deepEqual(calls.restoreSceneAsset, [2]);
	assert.deepEqual(calls.detachSceneAsset, [1]);
	assert.deepEqual(
		sceneState.assets.map((asset) => asset.id),
		[2],
	);
	assert.deepEqual(store.selectedSceneAssetIds.value, [2]);
	assert.equal(store.selectedSceneAssetId.value, 2);
	assert.equal(assetB.object.visible, false);
	assert.equal(assetB.object.position.x, 4);
	assert.ok(Math.abs(assetB.object.rotation.y - Math.PI / 2) < 1e-9);
	assert.equal(assetB.maskGroup, "mask-a");
	assert.equal(assetB.workingPivotLocal.x, 1);
}

{
	const { sceneState, statePersistence } = createHarness();
	const asset = createPackedSplatAsset(1, "Edited", {
		kind: "packed-splat",
		fileName: "edited.rawsplat",
		packedArray: new Uint32Array([1, 2, 3, 4]),
		numSplats: 1,
		extra: { lodTree: new Uint32Array([5, 6, 7]) },
		splatEncoding: { mode: "before" },
	});
	asset.capturePackedSplatSourceInEditState = true;
	sceneState.assets.push(asset);
	asset.disposeTarget.packedSplats.reinitialize({
		packedArray: new Uint32Array([1, 2, 3, 4]),
		numSplats: 1,
		extra: { lodTree: new Uint32Array([5, 6, 7]) },
		splatEncoding: { mode: "before" },
	});
	const previousPackedArrayRef = asset.disposeTarget.packedSplats.packedArray;
	const previousLodTreeRef = asset.disposeTarget.packedSplats.extra.lodTree;

	const restored = statePersistence.restoreSceneAssetEditState({
		selectedSceneAssetIds: [],
		selectedSceneAssetId: null,
		assets: [
			{
				id: 1,
				kind: "splat",
				worldScale: 1,
				unitMode: "meters",
				exportRole: "beauty",
				maskGroup: "",
				workingPivotLocal: null,
				baseScale: { x: 1, y: 1, z: 1 },
				contentTransform: captureObjectLocalTransformState(asset.contentObject),
				visible: true,
				position: { x: 0, y: 0, z: 0 },
				rotationDegrees: { x: 0, y: 0, z: 0 },
				sourceSnapshot: {
					kind: "packed-splat",
					fileName: "restored.rawsplat",
					packedArray: new Uint32Array([9, 10, 11, 12]),
					numSplats: 1,
					extra: { lodTree: new Uint32Array([1, 2, 3]) },
					splatEncoding: { mode: "after" },
				},
			},
		],
	});

	assert.equal(restored, true);
	assert.deepEqual(Array.from(asset.source.packedArray), [9, 10, 11, 12]);
	assert.deepEqual(
		Array.from(asset.disposeTarget.packedSplats.packedArray),
		[9, 10, 11, 12],
	);
	assert.equal(
		asset.disposeTarget.packedSplats.packedArray,
		previousPackedArrayRef,
	);
	assert.equal(
		asset.disposeTarget.packedSplats.extra.lodTree,
		previousLodTreeRef,
	);
	assert.equal(asset.disposeTarget.updateGeneratorCalls, 1);
	assert.equal(asset.disposeTarget.updateVersionCalls, 1);
	assert.equal(asset.disposeTarget.packedSplats.disposeLodSplatsCalled, 1);
	assert.equal(asset.capturePackedSplatSourceInEditState, false);
	assert.ok(asset.localBoundsHint?.isBox3);
	assert.ok(asset.localCenterBoundsHint?.isBox3);
}

{
	const { sceneState, statePersistence } = createHarness();
	const asset = createPackedSplatAsset(1, "Edited", {
		kind: "packed-splat",
		fileName: "edited.rawsplat",
		packedArray: new Uint32Array([1, 2, 3, 4]),
		numSplats: 1,
		extra: { lodTree: new Uint32Array([5, 6, 7]) },
		splatEncoding: { mode: "before" },
	});
	sceneState.assets.push(asset);
	const restoredPackedWords = new Uint32Array([13, 14, 15, 16]);
	const restoredLodTreeWords = new Uint32Array([21, 22, 23]);

	const restored = statePersistence.restoreSceneAssetEditState({
		selectedSceneAssetIds: [],
		selectedSceneAssetId: null,
		assets: [
			{
				id: 1,
				kind: "splat",
				worldScale: 1,
				unitMode: "meters",
				exportRole: "beauty",
				maskGroup: "",
				workingPivotLocal: null,
				baseScale: { x: 1, y: 1, z: 1 },
				contentTransform: captureObjectLocalTransformState(asset.contentObject),
				visible: true,
				position: { x: 0, y: 0, z: 0 },
				rotationDegrees: { x: 0, y: 0, z: 0 },
				sourceSnapshot: {
					kind: "packed-splat",
					fileName: "restored.rawsplat",
					packedArray: new Uint8Array(restoredPackedWords.buffer.slice(0)),
					numSplats: 1,
					extra: {
						lodTree: new Uint8Array(restoredLodTreeWords.buffer.slice(0)),
					},
					splatEncoding: { mode: "after" },
				},
			},
		],
	});

	assert.equal(restored, true);
	assert.equal(asset.source.packedArray instanceof Uint32Array, true);
	assert.equal(
		asset.disposeTarget.packedSplats.packedArray instanceof Uint32Array,
		true,
	);
	assert.equal(asset.source.extra.lodTree instanceof Uint32Array, true);
	assert.equal(
		asset.disposeTarget.packedSplats.extra.lodTree instanceof Uint32Array,
		true,
	);
	assert.deepEqual(
		Array.from(asset.disposeTarget.packedSplats.packedArray),
		Array.from(restoredPackedWords),
	);
	assert.deepEqual(
		Array.from(asset.disposeTarget.packedSplats.extra.lodTree),
		Array.from(restoredLodTreeWords),
	);
}

{
	const { sceneState, store, statePersistence } = createHarness();
	const stableAsset = createAsset(1, "model", "Stable", {
		stableKey: "stable://asset",
	});
	const transientAsset = createAsset(2, "model", "Transient", {
		fileName: "transient.glb",
	});
	sceneState.assets.push(stableAsset, transientAsset);
	store.selectedSceneAssetIds.value = [2];
	store.selectedSceneAssetId.value = 2;

	const snapshot = statePersistence.captureWorkingProjectSceneState();

	assert.equal(snapshot.assets.length, 2);
	assert.equal(snapshot.assets[0].source, null);
	assert.equal(snapshot.assets[1].source.fileName, "transient.glb");
	assert.deepEqual(snapshot.selectedAssetKeys, [
		snapshot.assets[1].workingAssetKey,
	]);
	assert.equal(snapshot.activeAssetKey, snapshot.assets[1].workingAssetKey);
}

{
	const { sceneState, store, calls, statePersistence } = createHarness();
	const existingAsset = createAsset(1, "model", "Existing", {
		stableKey: "stable://existing",
	});
	sceneState.assets.push(existingAsset);

	const restored = await statePersistence.applyWorkingProjectSceneState({
		selectedAssetKeys: ["working-asset:model:Loaded:1"],
		activeAssetKey: "working-asset:model:Loaded:1",
		assets: [
			{
				id: "1",
				kind: "model",
				label: "Existing Updated",
				workingAssetKey: "stable://existing",
				source: null,
				transform: {
					position: { x: 1, y: 2, z: 3 },
					quaternion: { x: 0, y: 0, z: 0, w: 1 },
				},
				worldScale: 1,
				unitMode: "meters",
				visible: true,
				exportRole: "beauty",
				maskGroup: "",
				workingPivotLocal: null,
				baseScale: { x: 1, y: 1, z: 1 },
			},
			{
				id: "2",
				kind: "model",
				label: "Loaded",
				workingAssetKey: "working-asset:model:Loaded:1",
				source: {
					kind: "embedded",
					fileName: "loaded.glb",
				},
				transform: {
					position: { x: 4, y: 5, z: 6 },
					quaternion: { x: 0, y: 0, z: 0, w: 1 },
				},
				worldScale: 1,
				unitMode: "meters",
				visible: true,
				exportRole: "beauty",
				maskGroup: "",
				workingPivotLocal: null,
				baseScale: { x: 1, y: 1, z: 1 },
			},
		],
	});

	assert.equal(restored, true);
	assert.equal(calls.loadSources.length, 1);
	assert.equal(calls.loadSources[0].replace, false);
	assert.deepEqual(calls.loadSources[0].options, { resetHistory: false });
	assert.equal(
		calls.loadSources[0].sources[0].projectAssetState.workingAssetKey,
		"working-asset:model:Loaded:1",
	);
	assert.deepEqual(
		sceneState.assets.map((asset) => asset.label),
		["Existing Updated", "Loaded"],
	);
	assert.deepEqual(store.selectedSceneAssetIds.value, ["2"]);
	assert.equal(store.selectedSceneAssetId.value, "2");
}

console.log("✅ CAMERA_FRAMES scene asset state persistence tests passed!");
