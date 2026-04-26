import assert from "node:assert/strict";
import * as THREE from "three";
import { createInteractionController } from "../src/controllers/interaction-controller.js";

function rect(left, top, width, height) {
	return {
		left,
		top,
		width,
		height,
		right: left + width,
		bottom: top + height,
	};
}

function createPointerEvent({
	pointerId = 1,
	button = 0,
	ctrlKey = false,
	shiftKey = false,
	altKey = false,
	clientX = 0,
	clientY = 0,
} = {}) {
	return {
		pointerId,
		button,
		ctrlKey,
		shiftKey,
		altKey,
		clientX,
		clientY,
		preventDefault() {},
		stopPropagation() {},
		stopImmediatePropagation() {},
	};
}

function createCamera() {
	const camera = new THREE.PerspectiveCamera(50, 4 / 3, 0.1, 100);
	camera.position.set(0, 0, 5);
	camera.lookAt(0, 0, 0);
	camera.updateMatrixWorld(true);
	return camera;
}

function applyPerspectiveExtents(camera, { left, right, top, bottom }) {
	camera.projectionMatrix.makePerspective(
		left,
		right,
		top,
		bottom,
		camera.near,
		camera.far,
	);
	camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
}

function syncDisplayCameraPose(sourceCamera, displayCamera) {
	displayCamera.position.copy(sourceCamera.position);
	displayCamera.quaternion.copy(sourceCamera.quaternion);
	displayCamera.up.copy(sourceCamera.up);
	displayCamera.updateMatrixWorld(true);
}

function projectWorldToClient(point, camera, bounds) {
	const projected = point.clone().project(camera);
	return {
		x: bounds.left + (projected.x * 0.5 + 0.5) * bounds.width,
		y: bounds.top + (-projected.y * 0.5 + 0.5) * bounds.height,
	};
}

function assertProjectedClientClose(point, camera, bounds, expected) {
	const actual = projectWorldToClient(point, camera, bounds);
	assert.ok(Math.abs(actual.x - expected.x) < 1e-4);
	assert.ok(Math.abs(actual.y - expected.y) < 1e-4);
}

function createPlaneTarget(size = 8) {
	const plane = new THREE.Mesh(
		new THREE.PlaneGeometry(size, size),
		new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }),
	);
	plane.updateMatrixWorld(true);
	return plane;
}

function createAssetController(target, sceneBounds = null) {
	return {
		getSceneRaycastTargets: () => [target],
		getSceneAssetForObject: (object) => (object === target ? { object } : null),
		getSceneBounds: () => sceneBounds,
	};
}

function createHarness(options = {}) {
	const updateUiCalls = [];
	const store = {
		interactionMode: { value: "navigate" },
		viewportPieMenu: { value: null },
		viewportLensHud: { value: null },
		viewportRollHud: { value: null },
		splatEdit: {
			active: { value: false },
			tool: { value: "box" },
		},
	};
	const state = {
		interactionMode: "navigate",
		mode: "camera",
		...(options.state ?? {}),
	};
	const shellRect = options.shellRect ?? rect(0, 0, 800, 600);
	const canvasRect = options.canvasRect ?? shellRect;
	const viewportShell = {
		classList: {
			add() {},
			remove() {},
		},
		getBoundingClientRect: () => shellRect,
		setPointerCapture() {},
		releasePointerCapture() {},
	};
	const viewportCanvas = {
		getBoundingClientRect: () => canvasRect,
	};
	const fpsMovement = {
		enable: false,
		keydown: {},
		keycode: {},
	};
	const pointerControls = {
		enable: true,
		moveVelocity: { set() {}, lengthSq: () => 0 },
		rotateVelocity: { set() {}, lengthSq: () => 0 },
		scroll: { set() {}, lengthSq: () => 0 },
	};
	const controller = createInteractionController({
		store,
		state,
		viewportShell,
		viewportCanvas,
		assetController: options.assetController ?? null,
		fpsMovement,
		pointerControls,
		getActiveCamera: options.getActiveCamera ?? (() => null),
		getActiveViewportCamera: options.getActiveViewportCamera,
		getActiveCameraViewCamera: options.getActiveCameraViewCamera,
		getActiveOutputCamera: options.getActiveOutputCamera,
		workspacePaneCamera: "camera",
		t: (key) => key,
		setStatus: () => {},
		updateUi: (options) => {
			updateUiCalls.push(options ?? null);
		},
		getViewZoomFactor: () => 1,
		setViewZoomFactor: () => {},
		getShotCameraBaseFovX: () => 55,
		setShotCameraBaseFovXLive: () => {},
		getViewportBaseFovX: () => 55,
		setViewportBaseFovXLive: () => {},
		getShotCameraRollAxisWorld: () => null,
		getShotCameraRollAngleDegrees: () => 0,
		applyActiveShotCameraRoll: () => false,
		beginHistoryTransaction: () => false,
		commitHistoryTransaction: () => false,
		cancelHistoryTransaction: () => {},
	});

	return {
		controller,
		state,
		store,
		pointerControls,
		updateUiCalls,
		viewportShell,
		viewportCanvas,
	};
}

{
	const harness = createHarness();
	harness.controller.toggleZoomTool();
	assert.equal(harness.state.interactionMode, "zoom");
	assert.deepEqual(harness.updateUiCalls.at(-1), {
		syncProjectPresentation: false,
	});
}

{
	const harness = createHarness();
	harness.controller.syncControlsToMode();
	assert.deepEqual(harness.updateUiCalls.at(-1), {
		syncProjectPresentation: false,
	});
}

{
	const harness = createHarness();
	harness.store.splatEdit.active.value = true;
	harness.store.splatEdit.tool.value = "brush";
	harness.controller.syncControlsToMode();
	assert.equal(harness.pointerControls.enable, false);
	assert.deepEqual(harness.updateUiCalls.at(-1), {
		syncProjectPresentation: false,
	});
}

{
	const shotCamera = createCamera();
	const cameraViewCamera = shotCamera.clone();
	applyPerspectiveExtents(cameraViewCamera, {
		left: -0.055,
		right: 0.075,
		top: 0.045,
		bottom: -0.065,
	});
	cameraViewCamera.updateMatrixWorld(true);
	const canvasRect = rect(120, 80, 800, 600);
	const pivotWorld = new THREE.Vector3(0.6, -0.25, 0);
	const startClient = projectWorldToClient(
		pivotWorld,
		cameraViewCamera,
		canvasRect,
	);
	const target = createPlaneTarget();
	const harness = createHarness({
		canvasRect,
		shellRect: rect(0, 0, 1200, 900),
		assetController: createAssetController(target),
		getActiveCamera: () => shotCamera,
		getActiveCameraViewCamera: () => cameraViewCamera,
		state: { mode: "camera" },
	});

	assert.equal(
		harness.controller.startOrbitAroundHitDrag(
			createPointerEvent({
				button: 0,
				ctrlKey: true,
				clientX: startClient.x,
				clientY: startClient.y,
			}),
		),
		true,
	);
	harness.controller.handleOrbitAroundHitDragMove(
		createPointerEvent({
			pointerId: 1,
			button: 0,
			ctrlKey: true,
			clientX: startClient.x + 42,
			clientY: startClient.y - 18,
		}),
	);
	syncDisplayCameraPose(shotCamera, cameraViewCamera);
	assertProjectedClientClose(
		pivotWorld,
		cameraViewCamera,
		canvasRect,
		startClient,
	);
}

{
	const viewportCamera = createCamera();
	const canvasRect = rect(80, 60, 800, 600);
	const pivotWorld = new THREE.Vector3(-0.45, 0.3, 0);
	const startClient = projectWorldToClient(
		pivotWorld,
		viewportCamera,
		canvasRect,
	);
	const target = createPlaneTarget();
	const harness = createHarness({
		canvasRect,
		shellRect: rect(0, 0, 1000, 800),
		assetController: createAssetController(target),
		getActiveCamera: () => viewportCamera,
		getActiveViewportCamera: () => viewportCamera,
		state: { mode: "viewport" },
	});

	assert.equal(
		harness.controller.startOrbitAroundHitDrag(
			createPointerEvent({
				button: 0,
				ctrlKey: true,
				clientX: startClient.x,
				clientY: startClient.y,
			}),
		),
		true,
	);
	harness.controller.handleOrbitAroundHitDragMove(
		createPointerEvent({
			pointerId: 1,
			button: 0,
			ctrlKey: true,
			clientX: startClient.x - 28,
			clientY: startClient.y + 35,
		}),
	);
	assertProjectedClientClose(
		pivotWorld,
		viewportCamera,
		canvasRect,
		startClient,
	);
}

{
	const camera = createCamera();
	const target = createPlaneTarget(0.1);
	const sceneBounds = {
		box: new THREE.Box3(new THREE.Vector3(1, 2, 3), new THREE.Vector3(3, 4, 5)),
	};
	const harness = createHarness({
		assetController: createAssetController(target, sceneBounds),
		getActiveCamera: () => camera,
		getActiveCameraViewCamera: () => camera,
		state: { mode: "camera" },
	});

	assert.equal(
		harness.controller.startOrbitAroundHitDrag(
			createPointerEvent({
				button: 0,
				ctrlKey: true,
				clientX: 790,
				clientY: 590,
			}),
		),
		true,
	);
}

{
	const camera = createCamera();
	const harness = createHarness({
		assetController: {
			getSceneRaycastTargets: () => [],
		},
		getActiveCamera: () => camera,
		getActiveCameraViewCamera: () => camera,
		state: { mode: "camera" },
	});

	assert.equal(
		harness.controller.startOrbitAroundHitDrag(
			createPointerEvent({
				button: 0,
				ctrlKey: true,
				clientX: 400,
				clientY: 300,
			}),
		),
		false,
	);
}

console.log("✅ CAMERA_FRAMES interaction controller tests passed!");
