import assert from "node:assert/strict";
import * as THREE from "three";
import {
	configureViewportOrthographicCamera,
	deriveViewportOrthoEntryStateFromCamera,
	getViewportOrthoOppositeView,
	getViewportOrthoPreviewGridPlane,
	getViewportOrthoViewForAxis,
} from "../src/engine/viewport-orthographic.js";

function roundComponent(value: number) {
	const rounded = Number(value.toFixed(4));
	return Object.is(rounded, -0) ? 0 : rounded;
}

assert.equal(getViewportOrthoOppositeView("posX"), "negX");
assert.equal(getViewportOrthoOppositeView("negZ"), "posZ");
assert.equal(getViewportOrthoViewForAxis("y", -1), "negY");
assert.equal(getViewportOrthoViewForAxis("z", 1), "posZ");
assert.equal(getViewportOrthoPreviewGridPlane("posX"), "zy");
assert.equal(getViewportOrthoPreviewGridPlane("negZ"), "xy");
assert.equal(getViewportOrthoPreviewGridPlane("posY"), null);

assert.deepEqual(
	deriveViewportOrthoEntryStateFromCamera({
		currentState: {
			viewId: "posZ",
			size: 4,
			distance: 6,
			focus: { x: 0, y: 1, z: 0 },
		},
		viewId: "posX",
		cameraPosition: { x: -5, y: 3, z: 4 },
	}),
	{
		viewId: "posX",
		size: 4,
		distance: 6,
		focus: { x: -11, y: 1, z: 0 },
	},
);

assert.deepEqual(
	deriveViewportOrthoEntryStateFromCamera({
		currentState: {
			viewId: "posX",
			size: 4,
			distance: 6,
			focus: { x: 2, y: 3, z: 4 },
		},
		viewId: "negZ",
		cameraPosition: { x: 20, y: -3, z: 14 },
	}),
	{
		viewId: "negZ",
		size: 4,
		distance: 6,
		focus: { x: 2, y: 3, z: 20 },
	},
);

{
	const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
	configureViewportOrthographicCamera(camera, {
		aspect: 2,
		viewId: "posX",
		size: 4,
		distance: 12,
		focus: { x: 1, y: 2, z: 3 },
	});
	const worldDirection = camera.getWorldDirection(new THREE.Vector3());
	assert.deepEqual(
		[
			roundComponent(camera.position.x),
			roundComponent(camera.position.y),
			roundComponent(camera.position.z),
		],
		[13, 2, 3],
	);
	assert.deepEqual(
		[
			roundComponent(camera.up.x),
			roundComponent(camera.up.y),
			roundComponent(camera.up.z),
		],
		[0, 1, 0],
	);
	assert.deepEqual(
		[
			roundComponent(camera.left),
			roundComponent(camera.right),
			roundComponent(camera.top),
			roundComponent(camera.bottom),
		],
		[-8, 8, 4, -4],
	);
	assert.deepEqual(
		[
			roundComponent(worldDirection.x),
			roundComponent(worldDirection.y),
			roundComponent(worldDirection.z),
		],
		[-1, 0, 0],
	);
}

{
	const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
	configureViewportOrthographicCamera(camera, {
		aspect: 1,
		viewId: "negY",
		size: 5,
		distance: 10,
		focus: { x: 0, y: 0, z: 0 },
	});
	const worldDirection = camera.getWorldDirection(new THREE.Vector3());
	assert.deepEqual(
		[
			roundComponent(camera.position.x),
			roundComponent(camera.position.y),
			roundComponent(camera.position.z),
		],
		[0, -10, 0],
	);
	assert.deepEqual(
		[
			roundComponent(camera.up.x),
			roundComponent(camera.up.y),
			roundComponent(camera.up.z),
		],
		[0, 0, 1],
	);
	assert.deepEqual(
		[
			roundComponent(worldDirection.x),
			roundComponent(worldDirection.y),
			roundComponent(worldDirection.z),
		],
		[0, 1, 0],
	);
}

console.log("✅ CAMERA_FRAMES viewport orthographic tests passed!");
