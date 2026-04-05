import assert from "node:assert/strict";
import * as THREE from "three";
import { createSplatEditSceneHelper } from "../src/engine/splat-edit-scene-helper.js";

{
	const helper = createSplatEditSceneHelper();
	const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
	const viewportSize = new THREE.Vector2(960, 540);
	camera.position.set(4, 3, 5);
	camera.lookAt(0, 0, 0);
	camera.updateMatrixWorld(true);

	helper.sync({
		visible: true,
		center: new THREE.Vector3(0, 0, 0),
		size: new THREE.Vector3(2, 2, 2),
	});
	helper.syncCamera(camera, viewportSize);

	const lineLayers = helper.group.children.filter(
		(child) => child?.isLineSegments2 === true,
	);
	assert.equal(lineLayers.length, 4);
	const positionCounts = lineLayers.map(
		(child) => child.geometry.getAttribute("instanceStart")?.count ?? 0,
	);
	assert.ok(positionCounts.some((count) => count > 0));
	assert.ok(positionCounts.reduce((sum, count) => sum + count, 0) > 24);
	assert.equal(
		lineLayers.every((child) => child.material.linewidth >= 1.5),
		true,
	);
	assert.equal(
		lineLayers.every(
			(child) =>
				child.material.resolution.x === 960 &&
				child.material.resolution.y === 540,
		),
		true,
	);

	helper.clear();
	assert.equal(
		lineLayers.every((child) => child.visible === false),
		true,
	);

	helper.dispose();
}

console.log("✅ CAMERA_FRAMES splat edit scene helper tests passed!");
