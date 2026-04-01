import assert from "node:assert/strict";
import * as THREE from "three";
import { createSceneAssetLifecycle } from "../src/controllers/scene-assets/lifecycle.js";

function createHarness() {
	const sceneState = {
		nextAssetId: 1,
		assets: [],
	};
	const store = {
		selectedSceneAssetIds: { value: [] },
		selectedSceneAssetId: { value: null },
		exportSummary: { value: "" },
	};
	const splatRoot = new THREE.Group();
	const modelRoot = new THREE.Group();
	const detachedSceneAssets = new Map();
	const calls = {
		disposedObjects: [],
		splatDisposals: 0,
		clearHistory: 0,
		home: 0,
		resetLocalizedCaches: 0,
		updateUi: 0,
		exportStatus: [],
		status: [],
	};
	const lifecycle = createSceneAssetLifecycle({
		sceneState,
		store,
		splatRoot,
		modelRoot,
		detachedSceneAssets,
		getDefaultAssetUnitMode: () => "meters",
		disposeObject: (object) => {
			calls.disposedObjects.push(object);
		},
		clearHistory: () => {
			calls.clearHistory += 1;
		},
		placeAllCamerasAtHome: () => {
			calls.home += 1;
		},
		resetLocalizedCaches: () => {
			calls.resetLocalizedCaches += 1;
		},
		updateUi: () => {
			calls.updateUi += 1;
		},
		setExportStatus: (status) => {
			calls.exportStatus.push(status);
		},
		t: (key) => key,
		setStatus: (status) => {
			calls.status.push(status);
		},
	});
	return {
		sceneState,
		store,
		splatRoot,
		modelRoot,
		detachedSceneAssets,
		calls,
		lifecycle,
	};
}

{
	const { lifecycle, sceneState, modelRoot } = createHarness();
	const object = new THREE.Group();
	const child = new THREE.Mesh();
	object.add(child);
	modelRoot.add(object);
	object.scale.setScalar(2);

	const asset = lifecycle.registerAsset({
		kind: "model",
		label: "Model A",
		object,
	});

	assert.equal(sceneState.assets.length, 1);
	assert.equal(asset.id, 1);
	assert.equal(asset.contentObject, child);
	assert.equal(asset.unitMode, "meters");
	assert.equal(lifecycle.getSceneAsset(asset.id), asset);
	assert.equal(lifecycle.getSceneAssetForObject(child), asset);
	assert.deepEqual(lifecycle.getSceneRaycastTargets(), [object]);
	object.visible = false;
	assert.deepEqual(lifecycle.getSceneRaycastTargets(), []);
}

{
	const { lifecycle, modelRoot, detachedSceneAssets } = createHarness();
	const object = new THREE.Group();
	modelRoot.add(object);
	const asset = lifecycle.registerAsset({
		kind: "model",
		label: "Detach A",
		object,
	});

	lifecycle.detachSceneAsset(asset);
	assert.equal(object.parent, null);
	assert.equal(detachedSceneAssets.get(asset.id), asset);

	lifecycle.restoreSceneAsset(asset);
	assert.equal(object.parent, modelRoot);
	assert.equal(detachedSceneAssets.has(asset.id), false);
}

{
	const { lifecycle, sceneState, store, modelRoot, splatRoot, calls } =
		createHarness();
	const modelObject = new THREE.Group();
	modelRoot.add(modelObject);
	const modelAsset = lifecycle.registerAsset({
		kind: "model",
		label: "Model Clear",
		object: modelObject,
	});
	const splatObject = new THREE.Group();
	splatRoot.add(splatObject);
	const splatAsset = lifecycle.registerAsset({
		kind: "splat",
		label: "Splat Clear",
		object: splatObject,
		disposeTarget: {
			dispose() {
				calls.splatDisposals += 1;
			},
		},
	});
	store.selectedSceneAssetIds.value = [modelAsset.id, splatAsset.id];
	store.selectedSceneAssetId.value = splatAsset.id;

	lifecycle.clearScene();

	assert.equal(sceneState.assets.length, 0);
	assert.deepEqual(store.selectedSceneAssetIds.value, []);
	assert.equal(store.selectedSceneAssetId.value, null);
	assert.deepEqual(calls.disposedObjects, [modelObject]);
	assert.equal(calls.splatDisposals, 1);
	assert.equal(calls.clearHistory, 1);
	assert.equal(calls.home, 1);
	assert.equal(calls.resetLocalizedCaches, 1);
	assert.equal(calls.updateUi, 1);
	assert.deepEqual(calls.exportStatus, ["export.idle"]);
	assert.deepEqual(calls.status, ["status.sceneCleared"]);
	assert.equal(store.exportSummary.value, "exportSummary.empty");
}

console.log("✅ CAMERA_FRAMES scene asset lifecycle tests passed!");
