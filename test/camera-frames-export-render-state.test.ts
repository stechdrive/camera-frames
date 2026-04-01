import assert from "node:assert/strict";
import * as THREE from "three";
import {
	EXPORT_DEPTH_OCCLUDER_RENDER_ORDER,
	applyExportAssetRenderOrder,
	getExportAssetRenderOrder,
} from "../src/controllers/export/render-state.js";

assert.equal(
	getExportAssetRenderOrder("depth-occluder", 123),
	EXPORT_DEPTH_OCCLUDER_RENDER_ORDER,
);
assert.equal(getExportAssetRenderOrder("matte-white", 123), 123);
assert.equal(getExportAssetRenderOrder("mask-target", 456), 456);

{
	const root = new THREE.Group();
	root.renderOrder = 11;
	const nestedGroup = new THREE.Group();
	nestedGroup.renderOrder = 0;
	const mesh = new THREE.Mesh(
		new THREE.BoxGeometry(1, 1, 1),
		new THREE.MeshBasicMaterial(),
	);
	mesh.renderOrder = 0;
	nestedGroup.add(mesh);
	root.add(nestedGroup);

	const restoreCallbacks = [];
	applyExportAssetRenderOrder(root, "depth-occluder", restoreCallbacks);

	assert.equal(root.renderOrder, EXPORT_DEPTH_OCCLUDER_RENDER_ORDER);
	assert.equal(nestedGroup.renderOrder, EXPORT_DEPTH_OCCLUDER_RENDER_ORDER);
	assert.equal(mesh.renderOrder, EXPORT_DEPTH_OCCLUDER_RENDER_ORDER);

	for (let index = restoreCallbacks.length - 1; index >= 0; index -= 1) {
		restoreCallbacks[index]();
	}

	assert.equal(root.renderOrder, 11);
	assert.equal(nestedGroup.renderOrder, 0);
	assert.equal(mesh.renderOrder, 0);
}

console.log("✅ CAMERA_FRAMES export render state tests passed!");
