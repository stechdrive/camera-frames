import assert from "node:assert/strict";
import * as THREE from "three";
import { createSplatEditSceneHelper } from "../src/engine/splat-edit-scene-helper.js";

{
	const helper = createSplatEditSceneHelper();
	const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
	camera.position.set(4, 3, 5);
	camera.lookAt(0, 0, 0);
	camera.updateMatrixWorld(true);

	helper.sync({
		visible: true,
		center: new THREE.Vector3(0, 0, 0),
		size: new THREE.Vector3(2, 2, 2),
	});
	helper.syncCamera(camera);

	const lineLayers = helper.group.children.filter(
		(child) => child instanceof THREE.LineSegments,
	);
	assert.equal(lineLayers.length, 4);
	const positionCounts = lineLayers.map(
		(child) => child.geometry.getAttribute("position")?.count ?? 0,
	);
	assert.ok(positionCounts.some((count) => count > 0));
	assert.ok(positionCounts.reduce((sum, count) => sum + count, 0) > 24);

	helper.clear();
	assert.equal(
		lineLayers.every((child) => child.visible === false),
		true,
	);

	helper.dispose();
}

console.log("✅ CAMERA_FRAMES splat edit scene helper tests passed!");
