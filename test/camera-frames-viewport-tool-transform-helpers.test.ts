import assert from "node:assert/strict";
import * as THREE from "three";
import { createViewportToolTransformHelpers } from "../src/controllers/viewport-tool/transform-helpers.js";

function createAsset(id, visible = true) {
	const object = new THREE.Group();
	object.visible = visible;
	object.position.set(id, 0, 0);
	object.updateMatrixWorld(true);
	return {
		id,
		object,
		worldScale: id,
	};
}

function createHarness() {
	const assetA = createAsset(1);
	const assetB = createAsset(2, false);
	const assetC = createAsset(3);
	const assets = [assetA, assetB, assetC];
	const calls = {
		setAssetTransform: [],
	};
	const store = {
		selectedSceneAssetId: { value: null as number | null },
		selectedSceneAssetIds: { value: [] as number[] },
	};
	const pivots = new Map();
	const raycaster = new THREE.Raycaster();
	const pointerNdc = new THREE.Vector2();
	const transformHelpers = createViewportToolTransformHelpers({
		store,
		assetController: {
			getSceneAsset: (assetId) =>
				assets.find((asset) => asset.id === assetId) ?? null,
			getAssetWorkingPivotLocal: (asset) =>
				pivots.get(asset.id)?.local?.clone() ?? null,
			getAssetWorkingPivotWorld: (asset) =>
				pivots.get(asset.id)?.world?.clone() ?? null,
			setAssetTransform: (assetId, nextTransform, options) => {
				calls.setAssetTransform.push({
					assetId,
					nextTransform,
					options,
				});
			},
		},
		raycaster,
		pointerNdc,
		tempVector: new THREE.Vector3(),
		tempVector2: new THREE.Vector3(),
	});

	return {
		assetA,
		assetB,
		assetC,
		store,
		pivots,
		calls,
		raycaster,
		pointerNdc,
		transformHelpers,
	};
}

{
	const harness = createHarness();
	harness.store.selectedSceneAssetId.value = 1;
	harness.store.selectedSceneAssetIds.value = [2, 3];

	assert.equal(harness.transformHelpers.getSelectedTransformAsset()?.id, 1);
	assert.deepEqual(
		harness.transformHelpers
			.getSelectedTransformAssets()
			.map((asset) => asset.id),
		[3],
	);

	harness.store.selectedSceneAssetIds.value = [];
	assert.deepEqual(
		harness.transformHelpers
			.getSelectedTransformAssets()
			.map((asset) => asset.id),
		[1],
	);
}

{
	const harness = createHarness();
	harness.pivots.set(1, {
		local: new THREE.Vector3(1, 2, 3),
		world: new THREE.Vector3(4, 5, 6),
	});
	const snapshot = harness.transformHelpers.createTransformAssetSnapshot(
		harness.assetA,
	);

	assert.equal(snapshot?.assetId, 1);
	assert.deepEqual(snapshot?.startPivotLocal.toArray(), [1, 2, 3]);
	assert.deepEqual(snapshot?.startPivotWorld.toArray(), [4, 5, 6]);
	assert.equal(snapshot?.startWorldScale, 1);
	assert.deepEqual(snapshot?.startObjectScale.toArray(), [1, 1, 1]);
}

{
	const harness = createHarness();
	const identityBasis = harness.transformHelpers.getTransformBasisWorld(
		new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 2, 0)),
		"world",
	);
	const localBasis = harness.transformHelpers.getTransformBasisWorld(
		new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 2, 0)),
		"local",
	);

	assert.deepEqual(identityBasis.x.toArray(), [1, 0, 0]);
	assert.ok(localBasis.x.distanceTo(new THREE.Vector3(0, 0, -1)) < 1e-9);
	assert.ok(localBasis.z.distanceTo(new THREE.Vector3(1, 0, 0)) < 1e-9);
}

{
	const harness = createHarness();
	harness.transformHelpers.applySelectedAssetTransforms(
		[{ assetId: 1 }, { assetId: 3 }],
		(selectedAsset) =>
			selectedAsset.assetId === 1
				? { worldScale: 2 }
				: { worldPosition: new THREE.Vector3(3, 4, 5) },
		"asset.transform",
	);

	assert.deepEqual(
		harness.calls.setAssetTransform.map((entry) => entry.assetId),
		[1, 3],
	);
	assert.equal(harness.calls.setAssetTransform[0].nextTransform.worldScale, 2);
	assert.deepEqual(
		harness.calls.setAssetTransform[1].nextTransform.worldPosition.toArray(),
		[3, 4, 5],
	);
}

{
	const harness = createHarness();
	const camera = new THREE.PerspectiveCamera(90, 1, 0.1, 100);
	camera.position.set(0, 0, 10);
	camera.lookAt(0, 0, 0);
	camera.updateProjectionMatrix();
	camera.updateMatrixWorld(true);

	const planeNormal = harness.transformHelpers.getMoveAxisPlaneNormal(
		new THREE.Vector3(1, 0, 0),
		camera,
	);
	const pointerRay = harness.transformHelpers.getPointerRay(
		{ clientX: 50, clientY: 50 },
		camera,
		{ left: 0, top: 0, width: 100, height: 100 },
	);

	assert.ok(planeNormal);
	assert.ok(Math.abs(planeNormal.dot(new THREE.Vector3(1, 0, 0))) < 1e-9);
	assert.ok(pointerRay.origin.distanceTo(camera.position) < 1e-9);
	assert.ok(
		pointerRay.direction.distanceTo(new THREE.Vector3(0, 0, -1)) < 1e-9,
	);
	assert.ok(Math.abs(harness.pointerNdc.x) < 1e-12);
	assert.ok(Math.abs(harness.pointerNdc.y) < 1e-12);
}

console.log("✅ CAMERA_FRAMES viewport tool transform helper tests passed!");
