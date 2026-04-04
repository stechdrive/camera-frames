import assert from "node:assert/strict";
import * as THREE from "three";
import { createCameraPoseCommands } from "../src/app/camera-pose-commands.js";

function createHarness(overrides = {}) {
	const state = overrides.state ?? { mode: "camera" };
	const viewportCamera =
		overrides.viewportCamera ?? new THREE.PerspectiveCamera();
	const shotCamera = overrides.shotCamera ?? new THREE.PerspectiveCamera();
	const calls = [];
	const cameraController = overrides.cameraController ?? {
		syncActiveShotCameraDocumentFromLiveCamera: () => {
			calls.push(["sync-shot-document"]);
		},
		moveActiveShotCameraLocalAxis: (axis, distance) => {
			calls.push(["move-local-axis", axis, distance]);
		},
	};
	const historyController = overrides.historyController ?? {
		runHistoryAction: (label, action) => {
			calls.push(["history", label]);
			return action();
		},
	};
	const projectionController = overrides.projectionController ?? {
		getShotCameraPoseAngles: () => ({
			yawDeg: 10,
			pitchDeg: 20,
			rollDeg: 30,
		}),
		setShotCameraPoseAngles: (angles) => {
			calls.push(["set-pose", angles]);
		},
	};
	const viewportProjectionController =
		overrides.viewportProjectionController ?? {
			getActiveViewportCamera: () => viewportCamera,
		};

	const commands = createCameraPoseCommands({
		state,
		viewportCamera,
		getActiveShotCamera: () => shotCamera,
		getCameraController: () => cameraController,
		getHistoryController: () => historyController,
		getProjectionController: () => projectionController,
		getViewportProjectionController: () => viewportProjectionController,
		updateUi: () => {
			calls.push(["update-ui"]);
		},
	});

	return {
		commands,
		shotCamera,
		viewportCamera,
		calls,
	};
}

{
	const { commands, shotCamera } = createHarness();
	shotCamera.position.set(1, 2, 3);
	assert.deepEqual(commands.getActiveShotCameraPoseState(), {
		position: { x: 1, y: 2, z: 3 },
		rotation: { yawDeg: 10, pitchDeg: 20, rollDeg: 30 },
	});
}

{
	const { commands, shotCamera } = createHarness();
	shotCamera.lookAt(new THREE.Vector3(1, 0, 1));
	const heading = commands.getActiveCameraHeadingDeg();
	assert.ok(Number.isFinite(heading));
}

{
	const { commands, viewportCamera } = createHarness({
		state: { mode: "viewport" },
	});
	viewportCamera.lookAt(new THREE.Vector3(0, 0, 1));
	assert.equal(commands.getActiveViewportCamera(), viewportCamera);
	assert.ok(Number.isFinite(commands.getActiveCameraHeadingDeg()));
}

{
	const { commands, calls } = createHarness();
	assert.equal(commands.setActiveShotCameraPoseAngle("yaw", 45), undefined);
	assert.deepEqual(calls, [
		["history", "camera.rotation.yaw"],
		["set-pose", { yawDeg: 45 }],
		["sync-shot-document"],
		["update-ui"],
	]);
}

{
	const { commands } = createHarness();
	assert.equal(commands.setActiveShotCameraPoseAngle("bad-axis", 45), false);
	assert.equal(commands.setActiveShotCameraPoseAngle("yaw", "nan"), false);
}

{
	const { commands, calls } = createHarness();
	assert.equal(commands.moveActiveShotCameraLocalAxis("x", 2), undefined);
	assert.deepEqual(calls, [["move-local-axis", "x", 2]]);
}

console.log("✅ CAMERA_FRAMES camera pose commands tests passed!");
