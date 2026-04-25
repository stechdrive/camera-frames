import assert from "node:assert/strict";
import * as THREE from "three";
import { createSceneAssetTransformController } from "../src/controllers/scene-assets/transform-ops.js";

function applyObjectLocalTransformState(object, state) {
	if (!object || !state) {
		return;
	}

	object.position.set(
		state.position?.x ?? object.position.x,
		state.position?.y ?? object.position.y,
		state.position?.z ?? object.position.z,
	);
	object.quaternion.set(
		state.quaternion?.x ?? object.quaternion.x,
		state.quaternion?.y ?? object.quaternion.y,
		state.quaternion?.z ?? object.quaternion.z,
		state.quaternion?.w ?? object.quaternion.w,
	);
	object.scale.set(
		state.scale?.x ?? object.scale.x,
		state.scale?.y ?? object.scale.y,
		state.scale?.z ?? object.scale.z,
	);
	object.updateMatrixWorld(true);
}

function createAsset(id, label = `Asset ${id}`) {
	const object = new THREE.Group();
	const contentObject = new THREE.Group();
	object.add(contentObject);
	return {
		id,
		label,
		object,
		contentObject,
		baseScale: new THREE.Vector3(1, 1, 1),
		worldScale: 1,
		workingPivotLocal: null,
	};
}

function createHarness() {
	const root = new THREE.Group();
	const assetA = createAsset(1, "Asset A");
	const assetB = createAsset(2, "Asset B");
	root.add(assetA.object);
	root.add(assetB.object);
	root.updateMatrixWorld(true);

	const sceneAssets = [assetA, assetB];
	let selectedIds = [];
	let updateCount = 0;
	const historyLabels = [];
	const statusEvents = [];
	const transformController = createSceneAssetTransformController({
		getSceneAsset: (assetId) =>
			sceneAssets.find((asset) => asset.id === assetId) ?? null,
		getSelectedSceneAssets: () =>
			sceneAssets.filter((asset) => selectedIds.includes(asset.id)),
		runHistoryAction: (label, applyChange) => {
			historyLabels.push(label);
			applyChange?.();
			return false;
		},
		updateUi: () => {
			updateCount += 1;
		},
		setStatus: (message) => {
			statusEvents.push(message);
		},
		t: (key, values = {}) => {
			switch (key) {
				case "status.assetScaleUpdated":
					return `${values.name}:${values.scale}`;
				case "status.assetTransformUpdated":
					return `transform:${values.name}`;
				case "status.assetTransformApplied":
					return `applied:${values.name}`;
				default:
					return key;
			}
		},
		formatAssetWorldScale: (value) => value.toFixed(2),
		applyAssetWorldScale: (asset) => {
			asset.object.scale.copy(asset.baseScale).multiplyScalar(asset.worldScale);
			asset.object.updateMatrixWorld(true);
		},
		applyObjectLocalTransformState,
	});

	return {
		root,
		assetA,
		assetB,
		sceneAssets,
		transformController,
		statusEvents,
		historyLabels,
		getUpdateCount: () => updateCount,
		setSelectedIds: (nextIds) => {
			selectedIds = [...nextIds];
		},
	};
}

{
	const harness = createHarness();
	harness.root.position.set(5, 0, 0);
	harness.root.quaternion.setFromEuler(new THREE.Euler(0, Math.PI / 2, 0));
	harness.root.updateMatrixWorld(true);

	const worldTargetPosition = new THREE.Vector3(5, 0, -3);
	const worldTargetQuaternion = new THREE.Quaternion();
	harness.transformController.setAssetTransform(
		1,
		{
			worldPosition: worldTargetPosition,
			worldQuaternion: worldTargetQuaternion,
			worldScale: 0.001,
		},
		{ updateStatus: true },
	);

	assert.equal(harness.assetA.worldScale, 0.01);
	assert.ok(
		harness.assetA.object
			.getWorldPosition(new THREE.Vector3())
			.distanceTo(worldTargetPosition) < 1e-9,
	);
	assert.ok(
		harness.assetA.object
			.getWorldQuaternion(new THREE.Quaternion())
			.angleTo(worldTargetQuaternion) < 1e-9,
	);
	assert.equal(harness.statusEvents.at(-1), "transform:Asset A");
	assert.equal(harness.historyLabels.at(-1), "asset.transform");
}

{
	const harness = createHarness();
	harness.assetA.object.position.set(2, 0, 0);
	harness.assetA.object.quaternion.setFromEuler(
		new THREE.Euler(0, Math.PI / 2, 0),
	);
	harness.assetA.contentObject.position.set(1, 0, 0);
	harness.assetA.worldScale = 2;
	harness.transformController.setAssetWorkingPivotWorld(
		1,
		new THREE.Vector3(2, 0, -1),
	);
	harness.assetA.object.updateMatrixWorld(true);
	harness.assetA.contentObject.updateMatrixWorld(true);

	const pivotBefore = harness.transformController
		.getAssetWorkingPivotWorld(1)
		.clone();
	const contentWorldBefore = harness.assetA.contentObject.getWorldPosition(
		new THREE.Vector3(),
	);

	harness.transformController.applyAssetTransform(1);

	assert.equal(harness.assetA.worldScale, 1);
	assert.deepEqual(harness.assetA.baseScale.toArray(), [1, 1, 1]);
	assert.ok(harness.assetA.object.position.length() < 1e-9);
	assert.ok(
		harness.assetA.object.quaternion.angleTo(new THREE.Quaternion()) < 1e-9,
	);
	assert.ok(
		harness.transformController
			.getAssetWorkingPivotWorld(1)
			.distanceTo(pivotBefore) < 1e-6,
	);
	assert.ok(
		harness.assetA.contentObject
			.getWorldPosition(new THREE.Vector3())
			.distanceTo(contentWorldBefore) < 1e-6,
	);
	assert.equal(harness.statusEvents.at(-1), "applied:Asset A");

	harness.transformController.resetAssetWorkingPivot(1);
	assert.equal(harness.assetA.workingPivotLocal, null);
}

{
	const harness = createHarness();
	harness.setSelectedIds([1, 2]);

	harness.transformController.setAssetWorldScale(1, 3);
	harness.transformController.scaleSelectedSceneAssetsByFactor(2);
	harness.transformController.resetSelectedSceneAssetsWorldScale();
	harness.transformController.setAssetPosition(1, "x", 4);
	harness.transformController.offsetSelectedSceneAssetsPosition("y", 2);
	harness.transformController.setAssetRotationDegrees(1, "z", 90);
	harness.transformController.offsetSelectedSceneAssetsRotationDegrees("z", 45);
	harness.transformController.setAssetsTransformBulk(
		[
			{
				assetId: 1,
				worldPosition: new THREE.Vector3(1, 2, 3),
			},
			{
				assetId: 2,
				worldScale: 4,
			},
		],
		{ updateStatus: true },
	);

	assert.equal(harness.statusEvents[0], "Asset A:3.00");
	assert.equal(harness.assetA.worldScale, 1);
	assert.equal(harness.assetB.worldScale, 4);
	assert.equal(harness.assetA.object.position.x, 1);
	assert.equal(harness.assetA.object.position.y, 2);
	assert.ok(
		Math.abs(THREE.MathUtils.radToDeg(harness.assetA.object.rotation.z) - 135) <
			1e-9,
	);
	assert.equal(harness.statusEvents.at(-1), "transform:2 assets");
	assert.ok(harness.getUpdateCount() >= 7);
}

{
	const harness = createHarness();
	const pagedSplats = { dispose: () => assert.fail("paged RAD was disposed") };
	const radBundle = {
		kind: "spark-rad-bundle",
		version: 1,
		root: { name: "asset-lod.rad" },
		chunks: [],
	};
	const radRuntime = {
		unregister: () => assert.fail("RAD runtime was unregistered"),
	};
	const source = {
		sourceType: "project-file-packed-splat",
		radBundle,
		deferredFullData: {
			loadFullData: () =>
				assert.fail("object transform should not materialize FullData"),
		},
	};
	harness.assetA.disposeTarget = {
		paged: pagedSplats,
		enableLod: true,
	};
	harness.assetA.radBundleRuntime = radRuntime;
	harness.assetA.source = source;

	harness.transformController.setAssetTransform(1, {
		worldPosition: new THREE.Vector3(2, 3, 4),
		worldQuaternion: new THREE.Quaternion().setFromEuler(
			new THREE.Euler(0, Math.PI / 4, 0),
		),
		worldScale: 2,
	});

	assert.equal(harness.assetA.disposeTarget.paged, pagedSplats);
	assert.equal(harness.assetA.disposeTarget.enableLod, true);
	assert.equal(harness.assetA.radBundleRuntime, radRuntime);
	assert.equal(harness.assetA.source, source);
	assert.equal(harness.assetA.source.radBundle, radBundle);
	assert.ok(
		harness.assetA.object
			.getWorldPosition(new THREE.Vector3())
			.distanceTo(new THREE.Vector3(2, 3, 4)) < 1e-9,
	);
}

console.log("✅ CAMERA_FRAMES scene asset transform ops tests passed!");
