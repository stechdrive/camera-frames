import assert from "node:assert/strict";
import { createCameraControllerBindings } from "../src/app/camera-controller-bindings.js";

{
	const calls = [];
	const viewportCamera = { id: "viewport-camera" };
	const frameController = {
		clearFrameDrag: () => calls.push(["clearFrameDrag"]),
	};
	const interactionController = {
		clearControlMomentum: () => calls.push(["clearControlMomentum"]),
		applyNavigateInteractionMode: (options) =>
			calls.push(["applyNavigateInteractionMode", options]),
		syncControlsToMode: () => calls.push(["syncControlsToMode"]),
	};
	const bindings = createCameraControllerBindings({
		store: { id: "store" },
		state: { id: "state" },
		scene: { id: "scene" },
		viewportCamera,
		shotCameraRegistry: { id: "registry" },
		horizontalToVerticalFovDegrees: () => 42,
		t: (key) => key,
		setStatus: () => {},
		updateUi: () => {},
		getSceneBounds: () => "bounds",
		sceneFramingController: {
			getAutoClipRange: (camera) => ({ camera, near: 0.1, far: 100 }),
			copyPose: (...args) => calls.push(["copyPose", ...args]),
			placeCameraAtHome: (...args) =>
				calls.push(["placeCameraAtHome", ...args]),
			frameCamera: (...args) => calls.push(["frameCamera", ...args]),
		},
		getFrameController: () => frameController,
		clearOutputFramePan: () => calls.push(["clearOutputFramePan"]),
		clearOutputFrameSelection: () => calls.push(["clearOutputFrameSelection"]),
		getInteractionController: () => interactionController,
		beforeActiveShotCameraChange: (id) =>
			calls.push(["prepareForShotCameraSwitch", id]),
		afterActiveShotCameraChange: (id) =>
			calls.push(["restoreAfterShotCameraSwitch", id]),
		viewportProjectionController: {
			getActiveViewportCamera: () => "active-viewport-camera",
			getViewportPerspectiveCamera: () => "perspective-camera",
			setViewportProjectionMode: (mode, options) => {
				calls.push(["setViewportProjectionMode", mode, options]);
				return true;
			},
			isViewportOrthographic: () => true,
			resetViewportOrthographicView: () =>
				calls.push(["resetViewportOrthographicView"]),
		},
		historyController: {
			runHistoryAction: () => "history-result",
		},
	});

	assert.equal(bindings.store.id, "store");
	assert.equal(bindings.state.id, "state");
	assert.equal(bindings.scene.id, "scene");
	assert.equal(bindings.viewportCamera.id, "viewport-camera");
	assert.equal(bindings.shotCameraRegistry.id, "registry");
	assert.equal(bindings.getSceneBounds(), "bounds");
	assert.deepEqual(bindings.getAutoClipRange("camera"), {
		camera: "camera",
		near: 0.1,
		far: 100,
	});
	assert.equal(
		bindings.getViewportCameraForShotCopy(),
		"active-viewport-camera",
	);
	assert.equal(bindings.getViewportPerspectiveCamera(), "perspective-camera");
	assert.equal(bindings.prepareViewportPerspectiveMode(), true);
	assert.equal(bindings.resetViewportView(), true);
	assert.equal(bindings.runHistoryAction(), "history-result");

	bindings.clearFrameDrag();
	bindings.clearOutputFramePan();
	bindings.clearOutputFrameSelection();
	bindings.clearControlMomentum();
	bindings.applyNavigateInteractionMode();
	bindings.beforeActiveShotCameraChange("cam-1");
	bindings.afterActiveShotCameraChange("cam-2");
	bindings.copyPose("a");
	bindings.placeCameraAtHome("b");
	bindings.frameCamera("c");
	bindings.syncControlsToMode();

	assert.deepEqual(calls, [
		["setViewportProjectionMode", "perspective", { copyActivePose: false }],
		["syncControlsToMode"],
		["resetViewportOrthographicView"],
		["clearFrameDrag"],
		["clearOutputFramePan"],
		["clearOutputFrameSelection"],
		["clearControlMomentum"],
		["applyNavigateInteractionMode", { silent: true }],
		["prepareForShotCameraSwitch", "cam-1"],
		["restoreAfterShotCameraSwitch", "cam-2"],
		["copyPose", "a"],
		["placeCameraAtHome", "b"],
		["frameCamera", "c"],
		["syncControlsToMode"],
	]);
}

{
	const viewportCamera = { id: "viewport-camera" };
	const bindings = createCameraControllerBindings({
		viewportCamera,
		sceneFramingController: {
			getAutoClipRange: () => null,
			copyPose: () => {},
			placeCameraAtHome: () => {},
			frameCamera: () => {},
		},
		getFrameController: () => null,
		clearOutputFramePan: () => {},
		clearOutputFrameSelection: () => {},
		getInteractionController: () => null,
		beforeActiveShotCameraChange: () => {},
		afterActiveShotCameraChange: () => {},
		viewportProjectionController: null,
		historyController: { runHistoryAction: () => null },
	});

	assert.equal(bindings.getViewportCameraForShotCopy(), viewportCamera);
	assert.equal(bindings.getViewportPerspectiveCamera(), viewportCamera);
	assert.equal(bindings.prepareViewportPerspectiveMode(), false);
	assert.equal(bindings.resetViewportView(), false);
}

console.log("✅ CAMERA_FRAMES camera controller bindings tests passed!");
