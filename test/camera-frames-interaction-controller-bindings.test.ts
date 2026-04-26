import assert from "node:assert/strict";
import { createInteractionControllerBindings } from "../src/app/interaction-controller-bindings.js";

{
	const calls = [];
	const state = {
		outputFrame: { viewZoom: 1.25 },
		baseFovX: 42,
		viewportBaseFovX: 55,
		viewportBaseFovXDirty: false,
	};
	const bindings = createInteractionControllerBindings({
		store: { id: "store" },
		state,
		viewportShell: { id: "shell" },
		viewportCanvas: { id: "canvas" },
		assetController: { id: "asset" },
		fpsMovement: { id: "fps" },
		pointerControls: { id: "pointer" },
		getActiveCamera: () => ({ id: "camera" }),
		getActiveViewportCamera: () => ({ id: "viewport-camera" }),
		getActiveCameraViewCamera: () => ({ id: "camera-view" }),
		getActiveOutputCamera: () => ({ id: "output-camera" }),
		workspacePaneCamera: "camera",
		t: (value) => `t:${value}`,
		setStatus: (value) => calls.push(["status", value]),
		updateUi: () => calls.push("ui"),
		outputFrameController: {
			setViewZoomFactor: (value) => calls.push(["zoom", value]),
		},
		viewportProjectionController: {
			isViewportOrthographic: () => true,
			panViewportOrthographic: (x, y) => ({ x, y }),
			zoomViewportOrthographic: (y, options) => ({ y, options }),
			offsetViewportOrthographicDepth: (y, options) => ({ y, options }),
			ensurePerspectiveForViewportRotation: () => true,
			setViewportTransientReferencePoint: (point, options) => ({
				point,
				options,
			}),
		},
		projectionController: {
			getShotCameraRollAxisWorld: () => ({ axis: "y" }),
			getShotCameraRollAngleDegrees: () => 12,
		},
		cameraController: {
			applyActiveShotCameraRoll: (...args) => ({ args }),
		},
		historyController: {
			beginHistoryTransaction: (label) => `begin:${label}`,
			commitHistoryTransaction: (label) => `commit:${label}`,
			cancelHistoryTransaction: () => "cancel",
		},
	});

	assert.equal(bindings.store.id, "store");
	assert.equal(bindings.viewportShell.id, "shell");
	assert.equal(bindings.viewportCanvas.id, "canvas");
	assert.deepEqual(bindings.getActiveViewportCamera(), {
		id: "viewport-camera",
	});
	assert.deepEqual(bindings.getActiveCameraViewCamera(), { id: "camera-view" });
	assert.deepEqual(bindings.getActiveOutputCamera(), { id: "output-camera" });
	assert.equal(bindings.getViewZoomFactor(), 1.25);
	bindings.setViewZoomFactor(2);
	assert.deepEqual(calls.at(-1), ["zoom", 2]);
	assert.equal(bindings.getShotCameraBaseFovX(), 42);
	bindings.setShotCameraBaseFovXLive("60");
	assert.equal(state.baseFovX, 60);
	assert.equal(calls.at(-1), "ui");
	assert.equal(bindings.getViewportBaseFovX(), 55);
	bindings.setViewportBaseFovXLive("66");
	assert.equal(state.viewportBaseFovX, 66);
	assert.equal(state.viewportBaseFovXDirty, true);
	assert.equal(bindings.isViewportOrthographic(), true);
	assert.deepEqual(bindings.panViewportOrthographic(1, 2), { x: 1, y: 2 });
	assert.deepEqual(bindings.zoomViewportOrthographic(3, { fast: true }), {
		y: 3,
		options: { fast: true },
	});
	assert.deepEqual(
		bindings.offsetViewportOrthographicDepth(4, { slow: true }),
		{
			y: 4,
			options: { slow: true },
		},
	);
	assert.equal(bindings.ensurePerspectiveForViewportRotation(), true);
	assert.deepEqual(
		bindings.setViewportTransientReferencePoint({ x: 1 }, { snap: true }),
		{ point: { x: 1 }, options: { snap: true } },
	);
	assert.deepEqual(bindings.getShotCameraRollAxisWorld(), { axis: "y" });
	assert.equal(bindings.getShotCameraRollAngleDegrees(), 12);
	assert.deepEqual(bindings.applyActiveShotCameraRoll(1, 2), { args: [1, 2] });
	assert.equal(bindings.beginHistoryTransaction("x"), "begin:x");
	assert.equal(bindings.commitHistoryTransaction("x"), "commit:x");
	assert.equal(bindings.cancelHistoryTransaction(), "cancel");
}

console.log("✅ CAMERA_FRAMES interaction controller bindings tests passed!");
