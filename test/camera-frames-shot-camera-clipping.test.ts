import assert from "node:assert/strict";
import * as THREE from "three";
import { createCameraController } from "../src/controllers/camera-controller.js";
import { createCameraFramesStore } from "../src/store.js";

const store = createCameraFramesStore();
store.workspace.shotCameras.value = store.workspace.shotCameras.value.map(
	(documentState) => ({
		...documentState,
		clipping: {
			...documentState.clipping,
			mode: "auto",
			near: 3,
			far: 40,
		},
	}),
);

const scene = new THREE.Scene();
const viewportCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
const shotCameraRegistry = new Map();
const statusMessages = [];

const controller = createCameraController({
	store,
	state: {
		mode: "camera",
		baseFovX: 60,
	},
	scene,
	viewportCamera,
	shotCameraRegistry,
	horizontalToVerticalFovDegrees: () => 50,
	t: (key, params = {}) => `${key}:${JSON.stringify(params)}`,
	setStatus: (message) => {
		statusMessages.push(message);
	},
	updateUi: () => {},
	getAutoClipRange: () => ({ near: 99, far: 60 }),
	clearFrameDrag: () => {},
	clearOutputFramePan: () => {},
	clearOutputFrameSelection: () => {},
	clearControlMomentum: () => {},
	applyNavigateInteractionMode: () => {},
	copyPose: () => {},
	frameCamera: () => {},
	syncControlsToMode: () => {},
});

controller.registerShotCameraDocuments();
controller.syncActiveShotCameraFromDocument();

const autoEntry = controller.getActiveShotCameraEntry();
assert.ok(autoEntry, "active shot camera entry should exist");
assert.equal(autoEntry.camera.near, 3);
assert.equal(autoEntry.camera.far, 1000);
assert.equal(store.shotCamera.near.value, 3);
assert.equal(store.shotCamera.far.value, 1000);

controller.setShotCameraClippingMode("manual");
controller.syncActiveShotCameraFromDocument();

const manualEntry = controller.getActiveShotCameraEntry();
assert.ok(manualEntry, "manual shot camera entry should exist");
assert.equal(manualEntry.camera.near, 3);
assert.equal(manualEntry.camera.far, 40);
assert.equal(store.shotCamera.near.value, 3);
assert.equal(store.shotCamera.far.value, 40);
assert.ok(statusMessages.length > 0, "clip mode change should emit status");

console.log("✅ CAMERA_FRAMES shot camera clipping tests passed!");
