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

{
	// ortho→ortho axis switch must preserve user-zoomed state (no scene-radius floor)
	const harness = createHarness();
	harness.setSceneRaycastTargets([createCenterPlane(10)]);
	harness.controller.alignViewportToOrthographicView("posX");
	// user zooms well below the radius*1.2 floor the old code used to enforce
	harness.store.viewportOrthoSize.value = 0.5;
	harness.store.viewportOrthoDistance.value = 1.2;
	harness.controller.alignViewportToOrthographicView("posY");
	assert.equal(roundComponent(harness.store.viewportOrthoSize.value), 0.5);
	assert.equal(roundComponent(harness.store.viewportOrthoDistance.value), 1.2);
	assert.deepEqual(harness.store.viewportOrthoFocus.value, {
		x: 0,
		y: 0,
		z: -10,
	});
}

{
	// same invariant for toggleOrthographicAxis (opposite axis path)
	const harness = createHarness();
	harness.setSceneRaycastTargets([createCenterPlane(10)]);
	harness.controller.alignViewportToOrthographicView("posX");
	harness.store.viewportOrthoSize.value = 0.4;
	harness.store.viewportOrthoDistance.value = 0.9;
	harness.controller.toggleOrthographicAxis("x");
	assert.equal(harness.store.viewportOrthoView.value, "negX");
	assert.equal(roundComponent(harness.store.viewportOrthoSize.value), 0.4);
	assert.equal(roundComponent(harness.store.viewportOrthoDistance.value), 0.9);
}

{
	// P→O with no raycast target, no prior gesture, camera inside scene sphere:
	// sphere-forward pivot fallback prevents snapping to the radius*4 scene-wide view.
	// Without this fallback, distance would be clamped to max(radius*4, DEFAULT) = 8
	// and size would be 8 * tan(30°) ≈ 4.6188 (scene-wide).
	const harness = createHarness();
	// no raycast targets; camera at origin looking -Z; scene center (0,0,-8), radius 2
	harness.controller.alignViewportToOrthographicView("posX");
	// sphere entry (tNear) depth = 6 → size = 6 * tan(30°) ≈ 3.4641
	assert.equal(roundComponent(harness.store.viewportOrthoDistance.value), 6);
	assert.equal(roundComponent(harness.store.viewportOrthoSize.value), 3.4641);
	assert.deepEqual(harness.store.viewportOrthoFocus.value, {
		x: 0,
		y: 0,
		z: -6,
	});
}

{
	// rotation gesture from ortho must land perspective at a scale-matched pose,
	// not a raw copy of ortho distance. After P→O with raycast at depth 10,
	// ortho.size=5.7735 ortho.distance=10. Scale-matched perspective depth
	// = size / tan(fov/2) = 10, so perspective position = focus + side*10.
	const harness = createHarness();
	harness.setSceneRaycastTargets([createCenterPlane(10)]);
	harness.controller.alignViewportToOrthographicView("posX");
	harness.controller.ensurePerspectiveForViewportRotation();
	// scale-matched position for posX side (+X): focus (0,0,-10) + (1,0,0)*10
	assert.deepEqual(
		harness.viewportPerspectiveCamera.position.toArray().map(roundComponent),
		[10, 0, -10],
	);
	// forward = (focus - position).normalized = (-1, 0, 0)
	const forward = harness.viewportPerspectiveCamera
		.getWorldDirection(new THREE.Vector3())
		.toArray()
		.map(roundComponent);
	assert.deepEqual(forward, [-1, 0, 0]);
}

{
	// after user pans/zooms ortho off the original entry, a plain ortho→perspective
	// toggle must reconstruct perspective so the ortho focus remains on-screen
	// at matched apparent scale.
	const harness = createHarness();
	harness.setSceneRaycastTargets([createCenterPlane(10)]);
	harness.controller.alignViewportToOrthographicView("posX");
	// user shrinks ortho size (zooms in) — entry state no longer matches current
	harness.store.viewportOrthoSize.value = 1;
	harness.controller.setViewportProjectionMode("perspective");
	// depth = size / tan(30°) = 1 / 0.5774 ≈ 1.7321
	// position = focus (0,0,-10) + sideVector posX (1,0,0) * 1.7321
	assert.deepEqual(
		harness.viewportPerspectiveCamera.position.toArray().map(roundComponent),
		[1.7321, 0, -10],
	);
}

console.log("✅ CAMERA_FRAMES viewport projection controller tests passed!");
