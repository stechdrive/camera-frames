import assert from "node:assert/strict";
import * as THREE from "three";
import { resolveMeasurementAxisSnap } from "../src/engine/measurement-axis-snap.js";

function createContext(camera: THREE.Camera, width = 800, height = 600) {
	camera.updateMatrixWorld(true);
	if ("updateProjectionMatrix" in camera) {
		(
			camera as THREE.PerspectiveCamera | THREE.OrthographicCamera
		).updateProjectionMatrix();
	}
	return {
		kind: "viewport",
		camera,
		shellRect: {
			left: 0,
			top: 0,
			width,
			height,
			right: width,
			bottom: height,
		},
		pageRect: {
			left: 0,
			top: 0,
			width,
			height,
			right: width,
			bottom: height,
		},
		localRect: {
			left: 0,
			top: 0,
			width,
			height,
			right: width,
			bottom: height,
		},
	};
}

function createCamera(position: THREE.Vector3, target = new THREE.Vector3()) {
	const camera = new THREE.PerspectiveCamera(60, 800 / 600, 0.1, 1000);
	camera.position.copy(position);
	camera.lookAt(target);
	return camera;
}

function assertNear(actual: number, expected: number, epsilon = 1e-6) {
	assert.ok(
		Math.abs(actual - expected) <= epsilon,
		`expected ${actual} to be near ${expected}`,
	);
}

{
	const context = createContext(createCamera(new THREE.Vector3(0, 0, 10)));
	const snap = resolveMeasurementAxisSnap({
		startPointWorld: new THREE.Vector3(0, 0, 0),
		clientX: 560,
		clientY: 300,
		context,
	});

	assert.equal(snap?.axisKey, "x");
	assert.ok((snap?.pointWorld.x ?? 0) > 0);
	assertNear(snap?.pointWorld.y ?? Number.NaN, 0);
	assertNear(snap?.pointWorld.z ?? Number.NaN, 0);
}

{
	const context = createContext(createCamera(new THREE.Vector3(0, 0, 10)));
	const snap = resolveMeasurementAxisSnap({
		startPointWorld: new THREE.Vector3(0, 0, 0),
		clientX: 240,
		clientY: 300,
		context,
	});

	assert.equal(snap?.axisKey, "x");
	assert.ok((snap?.pointWorld.x ?? 0) < 0);
	assertNear(snap?.pointWorld.y ?? Number.NaN, 0);
	assertNear(snap?.pointWorld.z ?? Number.NaN, 0);
}

{
	const context = createContext(createCamera(new THREE.Vector3(0, 0, 10)));
	const snap = resolveMeasurementAxisSnap({
		startPointWorld: new THREE.Vector3(0, 0, 0),
		clientX: 400,
		clientY: 140,
		context,
	});

	assert.equal(snap?.axisKey, "y");
	assertNear(snap?.pointWorld.x ?? Number.NaN, 0);
	assert.ok((snap?.pointWorld.y ?? 0) > 0);
	assertNear(snap?.pointWorld.z ?? Number.NaN, 0);
}

{
	const context = createContext(createCamera(new THREE.Vector3(10, 0, 0)));
	const snap = resolveMeasurementAxisSnap({
		startPointWorld: new THREE.Vector3(0, 0, 0),
		clientX: 560,
		clientY: 300,
		context,
	});

	assert.notEqual(snap?.axisKey, "x");
	assert.ok(snap?.axisKey === "z" || snap?.axisKey === "y");
}

{
	const context = createContext(createCamera(new THREE.Vector3(0, 0, 10)));
	const snap = resolveMeasurementAxisSnap({
		startPointWorld: new THREE.Vector3(0, 0, 0),
		clientX: 402,
		clientY: 300,
		context,
	});

	assert.equal(snap, null);
}

console.log("measurement axis snap tests passed!");
