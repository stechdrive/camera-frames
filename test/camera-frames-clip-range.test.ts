import assert from "node:assert/strict";
import * as THREE from "three";
import {
	getAutoClipRangeFromBounds,
	getBoundingBoxCorners,
	getCameraSpaceDepthRange,
} from "../src/engine/clip-range.js";

const unitBox = new THREE.Box3(
	new THREE.Vector3(-1, -1, -1),
	new THREE.Vector3(1, 1, 1),
);
const forwardCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
forwardCamera.position.set(0, 0, 0);
forwardCamera.lookAt(new THREE.Vector3(0, 0, -1));
forwardCamera.updateMatrixWorld(true);

assert.equal(getBoundingBoxCorners(unitBox).length, 8);

{
	const box = new THREE.Box3(
		new THREE.Vector3(-1, -1, -10),
		new THREE.Vector3(1, 1, -5),
	);
	const clip = getAutoClipRangeFromBounds({
		box,
		camera: forwardCamera,
		cameraPosition: { x: 0, y: 0, z: 0 },
		framingRadius: 1,
	});
	assert.equal(clip.near, 0.25);
	assert.ok(clip.far > 6, "near scene should fit inside far clip");
}

{
	const box = new THREE.Box3(
		new THREE.Vector3(-1, -1, -130),
		new THREE.Vector3(1, 1, -100),
	);
	const clip = getAutoClipRangeFromBounds({
		box,
		camera: forwardCamera,
		cameraPosition: { x: 0, y: 0, z: 0 },
		framingRadius: 1,
	});
	assert.ok(clip.far > 130, "distant camera should expand far clip");
	assert.ok(clip.near >= 5, "distant scene should push near clip outward");
}

{
	const clip = getAutoClipRangeFromBounds({
		box: null,
		cameraPosition: { x: 0, y: 0, z: 0 },
		framingRadius: 2,
	});
	assert.equal(clip.near, 0.1);
	assert.equal(clip.far, 80);
}

{
	const depthRange = getCameraSpaceDepthRange(
		new THREE.Box3(new THREE.Vector3(-1, -1, -10), new THREE.Vector3(1, 1, -5)),
		forwardCamera,
	);
	assert.equal(depthRange?.nearestDepth, 5);
	assert.equal(depthRange?.farthestDepth, 10);
}

console.log("✅ CAMERA_FRAMES clip range tests passed!");
