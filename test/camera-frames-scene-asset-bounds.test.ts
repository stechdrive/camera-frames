import assert from "node:assert/strict";
import * as THREE from "three";
import { createSceneAssetBoundsController } from "../src/controllers/scene-assets/bounds.js";

function createModelAsset({
	id,
	position = new THREE.Vector3(),
	size = [1, 1, 1],
	visible = true,
} = {}) {
	const object = new THREE.Group();
	object.visible = visible;
	object.position.copy(position);
	const mesh = new THREE.Mesh(
		new THREE.BoxGeometry(size[0], size[1], size[2]),
		new THREE.MeshBasicMaterial(),
	);
	object.add(mesh);
	object.updateMatrixWorld(true);
	return {
		id,
		kind: "model",
		object,
	};
}

function createSplatAsset({
	id,
	localBoundsHint = null,
	localCenterBoundsHint = null,
	getBoundingBox,
	forEachSplat = null,
	object = new THREE.Group(),
} = {}) {
	object.updateMatrixWorld(true);
	return {
		id,
		kind: "splat",
		object,
		disposeTarget: {
			matrixWorld: object.matrixWorld,
			getBoundingBox,
			forEachSplat,
		},
		localBoundsHint,
		localCenterBoundsHint,
	};
}

function createHarness(assets = []) {
	const sceneState = { assets };
	const warnings = [];
	const boundsController = createSceneAssetBoundsController({
		sceneState,
		reportSplatBoundsWarningOnce: (asset, message, details) => {
			warnings.push({ assetId: asset.id, message, details });
		},
	});
	return {
		sceneState,
		warnings,
		boundsController,
	};
}

{
	const visibleAsset = createModelAsset({
		id: 1,
		position: new THREE.Vector3(2, 0, 0),
		size: [2, 2, 2],
	});
	const hiddenAsset = createModelAsset({
		id: 2,
		position: new THREE.Vector3(100, 0, 0),
		size: [10, 10, 10],
		visible: false,
	});
	const { boundsController } = createHarness([visibleAsset, hiddenAsset]);

	const bounds = boundsController.getSceneBounds();

	assert.equal(bounds.box.min.x, 1);
	assert.equal(bounds.box.max.x, 3);
	assert.equal(bounds.size.x, 2);
}

{
	const splatAsset = createSplatAsset({
		id: 1,
		getBoundingBox: (centersOnly) =>
			centersOnly
				? new THREE.Box3(
						new THREE.Vector3(-1, -1, -1),
						new THREE.Vector3(1, 1, 1),
					)
				: new THREE.Box3(
						new THREE.Vector3(-5, -5, -5),
						new THREE.Vector3(5, 5, 5),
					),
	});
	const { boundsController } = createHarness([splatAsset]);

	const sceneBounds = boundsController.getSceneBounds();
	const framingBounds = boundsController.getSceneFramingBounds();

	assert.equal(sceneBounds.size.x, 10);
	assert.equal(framingBounds.size.x, 2);
}

{
	const { boundsController } = createHarness();
	const splatSource = {
		numSplats: 300,
		forEachSplat(callback) {
			for (let index = 0; index < 299; index += 1) {
				callback(index, new THREE.Vector3(index / 100, 0, 0));
			}
			callback(299, new THREE.Vector3(1000, 0, 0));
		},
	};

	const framingBounds =
		boundsController.buildSplatFramingBoundsFromSource(splatSource);

	assert.ok(framingBounds);
	assert.ok(framingBounds.max.x < 10);
	assert.ok(framingBounds.min.x <= 0);
}

{
	const fallbackObject = new THREE.Group();
	fallbackObject.add(
		new THREE.Mesh(
			new THREE.BoxGeometry(4, 4, 4),
			new THREE.MeshBasicMaterial(),
		),
	);
	fallbackObject.updateMatrixWorld(true);
	const splatAsset = createSplatAsset({
		id: 7,
		object: fallbackObject,
		getBoundingBox: () => {
			throw new Error("bounds exploded");
		},
	});
	const { boundsController, warnings } = createHarness([splatAsset]);

	const bounds = boundsController.getSceneBounds();

	assert.ok(bounds);
	assert.equal(bounds.size.x, 4);
	assert.equal(warnings.length, 1);
	assert.equal(warnings[0].assetId, 7);
	assert.equal(warnings[0].message, "splat bounds threw");
}

console.log("✅ CAMERA_FRAMES scene asset bounds tests passed!");
