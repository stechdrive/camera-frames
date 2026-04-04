import assert from "node:assert/strict";
import { createProjectionFramingCommands } from "../src/app/projection-framing-commands.js";

function createHarness() {
	const calls = [];
	const interactionController = {
		clearControlMomentum: () => calls.push(["clear-momentum"]),
		syncControlsToMode: () => calls.push(["sync-controls"]),
	};
	const projectionController = {
		getProjectionState: () => ({ kind: "projection-state" }),
		syncShotProjection: () => calls.push(["sync-shot"]),
		applyCameraViewProjection: () => calls.push(["apply-camera-view"]),
		handleResize: () => calls.push(["handle-resize"]),
		syncOutputCamera: () => calls.push(["sync-output-camera"]),
	};
	const viewportProjectionController = {
		syncActiveViewportProjection: () => calls.push(["sync-viewport"]),
		setViewportProjectionMode: (nextMode, options) => {
			calls.push(["set-viewport-projection", nextMode, options]);
			return true;
		},
		alignViewportToOrthographicView: (viewId, options) => {
			calls.push(["align-orthographic", viewId, options]);
			return true;
		},
		toggleOrthographicAxis: (axisKey) => {
			calls.push(["toggle-axis", axisKey]);
			return true;
		},
	};
	const sceneFramingController = {
		copyPose: (sourceCamera, destinationCamera) => {
			calls.push(["copy-pose", sourceCamera, destinationCamera]);
			return "copied";
		},
		frameCamera: (camera, variant) => {
			calls.push(["frame-camera", camera, variant]);
			return "framed";
		},
		frameAllCameras: () => calls.push(["frame-all"]),
		placeAllCamerasAtHome: () => calls.push(["place-home-all"]),
	};

	const commands = createProjectionFramingCommands({
		getInteractionController: () => interactionController,
		getProjectionController: () => projectionController,
		getSceneFramingController: () => sceneFramingController,
		getViewportProjectionController: () => viewportProjectionController,
	});

	return {
		commands,
		calls,
	};
}

{
	const { commands } = createHarness();
	assert.deepEqual(commands.getProjectionState(), {
		kind: "projection-state",
	});
}

{
	const { commands, calls } = createHarness();
	assert.equal(
		commands.setViewportProjectionMode("orthographic", {
			copyActivePose: false,
		}),
		true,
	);
	assert.deepEqual(calls, [
		["set-viewport-projection", "orthographic", { copyActivePose: false }],
		["sync-controls"],
	]);
}

{
	const { commands, calls } = createHarness();
	assert.equal(
		commands.alignViewportToOrthographicView("pos-x", {
			copyActivePose: true,
		}),
		true,
	);
	assert.equal(commands.toggleViewportOrthographicAxis("x"), true);
	assert.deepEqual(calls, [
		["align-orthographic", "pos-x", { copyActivePose: true }],
		["sync-controls"],
		["toggle-axis", "x"],
		["sync-controls"],
	]);
}

{
	const { commands, calls } = createHarness();
	assert.equal(commands.copyPose("source", "destination"), "copied");
	assert.equal(commands.frameCamera("camera", "camera"), "framed");
	commands.frameAllCameras();
	commands.placeAllCamerasAtHome();
	commands.clearControlMomentum();
	commands.syncShotProjection();
	commands.applyCameraViewProjection();
	commands.syncViewportProjection();
	commands.handleResize();
	commands.syncOutputCamera();
	assert.deepEqual(calls, [
		["copy-pose", "source", "destination"],
		["frame-camera", "camera", "camera"],
		["frame-all"],
		["place-home-all"],
		["clear-momentum"],
		["sync-shot"],
		["apply-camera-view"],
		["sync-viewport"],
		["handle-resize"],
		["sync-output-camera"],
	]);
}

console.log("✅ CAMERA_FRAMES projection framing commands tests passed!");
