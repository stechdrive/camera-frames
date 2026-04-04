import assert from "node:assert/strict";
import * as THREE from "three";
import { createCameraController } from "../src/controllers/camera-controller.js";
import {
	getShotCameraExportBaseNameForDocument,
	resolveShotCameraExportNameTemplate,
	sanitizeExportName,
} from "../src/controllers/camera-controller.js";

assert.equal(sanitizeExportName(" Camera 1 "), "Camera-1");
assert.equal(
	resolveShotCameraExportNameTemplate("cut-%cam", "Shot A"),
	"cut-Shot A",
);
assert.equal(
	getShotCameraExportBaseNameForDocument(
		{
			name: "Close Up",
			exportSettings: {
				exportName: "%cam-final",
			},
		},
		1,
	),
	"Close-Up-final",
);
assert.equal(
	getShotCameraExportBaseNameForDocument(
		{
			name: "Close Up",
			exportSettings: {
				exportName: "",
			},
		},
		1,
	),
	"Close-Up",
);
assert.equal(
	getShotCameraExportBaseNameForDocument(
		{
			name: "Close Up",
			exportSettings: {
				exportName: "cf-%cam",
			},
		},
		1,
	),
	"cf-Close-Up",
);

function createCameraControllerHarness({
	mode = "camera",
	sceneBounds = null,
} = {}) {
	const calls = [];
	const store = {
		workspace: {
			shotCameras: {
				value: [
					{
						id: "shot-camera-1",
						name: "Camera 1",
						lens: { baseFovX: 60 },
						clipping: { mode: "auto", near: 0.1, far: 1000 },
						outputFrame: {
							widthScale: 1,
							heightScale: 1,
							viewZoom: 1,
							anchor: "center",
						},
						exportSettings: {
							exportName: "cf-%cam",
							exportFormat: "psd",
							exportGridOverlay: true,
							exportGridLayerMode: "bottom",
							exportModelLayers: true,
							exportSplatLayers: true,
						},
						frameMask: {
							mode: "off",
							preferredMode: "all",
							opacityPct: 80,
							selectedIds: ["frame-1"],
						},
						navigation: { rollLock: false },
						referenceImages: { presets: [], items: [], assets: [] },
						frames: [{ id: "frame-1", name: "FRAME A", x: 0.5, y: 0.5 }],
						activeFrameId: "frame-1",
					},
				],
			},
			activeShotCameraId: { value: "shot-camera-1" },
			panes: { value: [{ id: "pane-main", role: mode }] },
		},
		exportOptions: {
			presetIds: { value: [] },
		},
		shotCamera: {
			nearLive: { value: 0.1 },
			farLive: { value: 1000 },
		},
		viewportBaseFovX: { value: 60 },
	};
	const state = {
		mode,
		viewportBaseFovXDirty: false,
		baseFovX: 60,
		viewportBaseFovX: 60,
	};
	const controller = createCameraController({
		store,
		state,
		scene: new THREE.Scene(),
		viewportCamera: new THREE.PerspectiveCamera(),
		shotCameraRegistry: new Map(),
		horizontalToVerticalFovDegrees: (fovX) => fovX,
		t: (key, params) =>
			key === "shotCamera.defaultName"
				? `Camera ${params.index}`
				: key === "status.createdShotCamera"
					? `created:${params.name}`
					: key,
		setStatus: (message) => calls.push(["status", message]),
		updateUi: () => calls.push(["update-ui"]),
		getAutoClipRange: () => ({ near: 0.1, far: 1000 }),
		getSceneBounds: () => sceneBounds,
		clearFrameDrag: () => calls.push(["clear-frame-drag"]),
		clearOutputFramePan: () => calls.push(["clear-output-frame-pan"]),
		clearOutputFrameSelection: () =>
			calls.push(["clear-output-frame-selection"]),
		clearControlMomentum: () => calls.push(["clear-control-momentum"]),
		applyNavigateInteractionMode: () => calls.push(["apply-navigate"]),
		copyPose: () => calls.push(["copy-pose"]),
		placeCameraAtHome: () => calls.push(["place-home"]),
		frameCamera: () => calls.push(["frame-camera"]),
		syncControlsToMode: () => calls.push(["sync-controls"]),
		runHistoryAction: (_label, action) => {
			action();
		},
	});

	return {
		controller,
		store,
		calls,
	};
}

{
	const { controller, store, calls } = createCameraControllerHarness({
		sceneBounds: { box: new THREE.Box3(), size: new THREE.Vector3(1, 1, 1) },
	});
	controller.createShotCamera();
	assert.equal(store.workspace.shotCameras.value.length, 2);
	assert.equal(store.workspace.activeShotCameraId.value, "shot-camera-2");
	assert.ok(calls.some(([label]) => label === "frame-camera"));
	assert.ok(!calls.some(([label]) => label === "copy-pose"));
}

{
	const { controller, calls } = createCameraControllerHarness();
	controller.createShotCamera();
	assert.ok(calls.some(([label]) => label === "place-home"));
	assert.ok(!calls.some(([label]) => label === "copy-pose"));
}

console.log("✅ CAMERA_FRAMES camera controller tests passed!");
