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
