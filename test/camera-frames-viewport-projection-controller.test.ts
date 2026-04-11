import assert from "node:assert/strict";
import * as THREE from "three";
import { createViewportProjectionController } from "../src/controllers/viewport-projection-controller.js";

function roundComponent(value: number) {
	const rounded = Number(value.toFixed(4));
	return Object.is(rounded, -0) ? 0 : rounded;
}

function createStore() {
	return {
		viewportProjectionMode: { value: "perspective" },
		viewportOrthoView: { value: "posZ" },
		viewportOrthoSize: { value: 3 },
		viewportOrthoDistance: { value: 6 },
		viewportOrthoFocus: { value: { x: 0, y: 0, z: 0 } },
		viewportBaseFovX: { value: 60 },
	};
}

function createHarness() {
	const store = createStore();
	const viewportPerspectiveCamera = new THREE.PerspectiveCamera(
		60,
		1,
		0.1,
		1000,
	);
	viewportPerspectiveCamera.position.set(0, 0, 0);
	viewportPerspectiveCamera.lookAt(new THREE.Vector3(0, 0, -1));
	viewportPerspectiveCamera.updateProjectionMatrix();
	viewportPerspectiveCamera.updateMatrixWorld(true);

	const viewportOrthographicCamera = new THREE.OrthographicCamera(
		-1,
		1,
		1,
		-1,
		0.1,
		1000,
	);
	let sceneRaycastTargets: THREE.Object3D[] = [];
	const controller = createViewportProjectionController({
		store,
		viewportShell: {
			getBoundingClientRect: () => ({
				width: 100,
				height: 100,
			}),
		},
		viewportPerspectiveCamera,
		viewportOrthographicCamera,
		getViewportSize: () => ({ width: 100, height: 100 }),
		getAutoClipRange: () => null,
		getSceneFraming: () => ({
			center: new THREE.Vector3(0, 0, -8),
			radius: 2,
		}),
		getSceneRaycastTargets: () => sceneRaycastTargets,
	});

	return {
		store,
		controller,
		viewportPerspectiveCamera,
		viewportOrthographicCamera,
		setSceneRaycastTargets(nextTargets: THREE.Object3D[]) {
			sceneRaycastTargets = nextTargets;
		},
	};
}

function createCenterPlane(depth: number) {
	const mesh = new THREE.Mesh(
		new THREE.PlaneGeometry(20, 20),
		new THREE.MeshBasicMaterial(),
	);
	mesh.position.set(0, 0, -depth);
	mesh.updateMatrixWorld(true);
	return mesh;
}

{
	const harness = createHarness();
	harness.setSceneRaycastTargets([createCenterPlane(10)]);
	harness.controller.alignViewportToOrthographicView("posX");
	const projectedReferencePoint = new THREE.Vector3(0, 0, -10).project(
		harness.viewportOrthographicCamera,
	);
	assert.deepEqual(
		[
			roundComponent(projectedReferencePoint.x),
			roundComponent(projectedReferencePoint.y),
		],
		[0, 0],
	);
	assert.equal(roundComponent(harness.store.viewportOrthoDistance.value), 10);
	assert.deepEqual(harness.store.viewportOrthoFocus.value, {
		x: 0,
		y: 0,
		z: -10,
	});
}

{
	const harness = createHarness();
	harness.store.viewportOrthoSize.value = 500;
	harness.store.viewportOrthoDistance.value = 2000;
	harness.viewportPerspectiveCamera.lookAt(new THREE.Vector3(0, 0, 1));
	harness.viewportPerspectiveCamera.updateMatrixWorld(true);
	harness.controller.alignViewportToOrthographicView("posX");
	assert.equal(roundComponent(harness.store.viewportOrthoDistance.value), 8);
	assert.equal(roundComponent(harness.store.viewportOrthoSize.value), 4.6188);
	assert.deepEqual(harness.store.viewportOrthoFocus.value, {
		x: 0,
		y: 0,
		z: -8,
	});
}

{
	const harness = createHarness();
	harness.viewportPerspectiveCamera.lookAt(new THREE.Vector3(0, 0, 1));
	harness.viewportPerspectiveCamera.updateMatrixWorld(true);
	harness.controller.rememberViewportReferencePoint(
		new THREE.Vector3(500, 40, -700),
	);
	harness.controller.alignViewportToOrthographicView("posX");
	assert.deepEqual(harness.store.viewportOrthoFocus.value, {
		x: 0,
		y: 0,
		z: -8,
	});
}

{
	const harness = createHarness();
	harness.viewportPerspectiveCamera.position.set(2, 3, 4);
	harness.viewportPerspectiveCamera.lookAt(new THREE.Vector3(-1, 1, -7));
	harness.viewportPerspectiveCamera.updateMatrixWorld(true);
	const originalPose = {
		position: harness.viewportPerspectiveCamera.position
			.toArray()
			.map(roundComponent),
		quaternion: harness.viewportPerspectiveCamera.quaternion
			.toArray()
			.map(roundComponent),
	};
	harness.controller.alignViewportToOrthographicView("posX");
	harness.controller.setViewportProjectionMode("perspective");
	assert.deepEqual(
		harness.viewportPerspectiveCamera.position.toArray().map(roundComponent),
		originalPose.position,
	);
	assert.deepEqual(
		harness.viewportPerspectiveCamera.quaternion.toArray().map(roundComponent),
		originalPose.quaternion,
	);
}

{
	const harness = createHarness();
	harness.setSceneRaycastTargets([createCenterPlane(10)]);
	harness.controller.alignViewportToOrthographicView("posX");
	harness.controller.setViewportProjectionMode("perspective");
	harness.controller.alignViewportToOrthographicView("posY");
	const projectedReferencePoint = new THREE.Vector3(0, 0, -10).project(
		harness.viewportOrthographicCamera,
	);
	assert.deepEqual(
		[
			roundComponent(projectedReferencePoint.x),
			roundComponent(projectedReferencePoint.y),
		],
		[0, 0],
	);
	assert.equal(roundComponent(harness.store.viewportOrthoSize.value), 5.7735);
}

{
	const harness = createHarness();
	harness.viewportPerspectiveCamera.position.set(2, 3, 4);
	harness.viewportPerspectiveCamera.lookAt(new THREE.Vector3(-1, 1, -7));
	harness.viewportPerspectiveCamera.updateMatrixWorld(true);
	harness.controller.alignViewportToOrthographicView("posX");
	harness.controller.alignViewportToOrthographicView("posY");
	harness.controller.setViewportProjectionMode("perspective");
	const forward = harness.viewportPerspectiveCamera
		.getWorldDirection(new THREE.Vector3())
		.toArray()
		.map(roundComponent);
	assert.deepEqual(forward, [0, -1, 0]);
}

{
	const harness = createHarness();
	harness.controller.alignViewportToOrthographicView("posX");
	harness.store.viewportOrthoSize.value = 500;
	harness.store.viewportOrthoDistance.value = 10;
	harness.controller.offsetViewportOrthographicDepth(100);
	assert.equal(roundComponent(harness.store.viewportOrthoDistance.value), 10.3);
	harness.controller.offsetViewportOrthographicDepth(100, { fine: true });
	assert.equal(
		roundComponent(harness.store.viewportOrthoDistance.value),
		10.38,
	);
}

{
	const harness = createHarness();
	harness.setSceneRaycastTargets([createCenterPlane(10)]);
	harness.controller.alignViewportToOrthographicView("posX");
	harness.controller.ensurePerspectiveForViewportRotation();
	assert.deepEqual(
		harness.viewportPerspectiveCamera.position.toArray().map(roundComponent),
		harness.viewportOrthographicCamera.position.toArray().map(roundComponent),
	);
	assert.deepEqual(
		harness.viewportPerspectiveCamera.quaternion.toArray().map(roundComponent),
		harness.viewportOrthographicCamera.quaternion.toArray().map(roundComponent),
	);
}

{
	const harness = createHarness();
	harness.setSceneRaycastTargets([createCenterPlane(10)]);
	harness.controller.alignViewportToOrthographicView("posX");
	assert.equal(roundComponent(harness.store.viewportOrthoSize.value), 5.7735);

	harness.controller.setViewportProjectionMode("perspective", {
		copyActivePose: false,
	});
	harness.setSceneRaycastTargets([]);
	harness.controller.alignViewportToOrthographicView("posY");
	assert.equal(roundComponent(harness.store.viewportOrthoSize.value), 5.7735);
}

{
	const harness = createHarness();
	harness.setSceneRaycastTargets([createCenterPlane(10)]);
	harness.controller.alignViewportToOrthographicView("posX");

	harness.controller.setViewportProjectionMode("perspective", {
		copyActivePose: false,
	});
	harness.setSceneRaycastTargets([]);
	harness.controller.setViewportTransientReferencePoint(
		new THREE.Vector3(0, 0, -4),
	);
	harness.controller.alignViewportToOrthographicView("negY");
	assert.equal(roundComponent(harness.store.viewportOrthoSize.value), 2.3094);

	harness.controller.setViewportProjectionMode("perspective", {
		copyActivePose: false,
	});
	harness.controller.alignViewportToOrthographicView("posZ");
	assert.equal(roundComponent(harness.store.viewportOrthoSize.value), 5.7735);
}

console.log("✅ CAMERA_FRAMES viewport projection controller tests passed!");
