import assert from "node:assert/strict";
import { createSceneFramingControllerBindings } from "../src/app/scene-framing-controller-bindings.js";

{
	const calls = [];
	const bindings = createSceneFramingControllerBindings({
		getSceneBounds: () => ({ id: "scene-bounds" }),
		assetController: {
			getSceneFramingBounds: () => ({ id: "framing-bounds" }),
		},
		viewportCamera: { id: "viewport-camera" },
		shotCameraRegistry: new Map([["cam-a", { id: "camera-a" }]]),
		cameraController: {
			syncShotCameraEntryFromDocument: (entry) => {
				calls.push(["sync-shot-camera-entry", entry]);
				return "synced";
			},
		},
		interactionController: {
			syncControlsToMode: () => {
				calls.push(["sync-controls"]);
				return "controls-synced";
			},
		},
		fpsMovement: { id: "fps-movement" },
	});

	assert.deepEqual(bindings.getSceneBounds(), { id: "scene-bounds" });
	assert.deepEqual(bindings.getSceneFramingBounds(), { id: "framing-bounds" });
	assert.equal(bindings.viewportCamera.id, "viewport-camera");
	assert.equal(bindings.shotCameraRegistry.get("cam-a").id, "camera-a");
	assert.equal(bindings.fpsMovement.id, "fps-movement");
	assert.equal(bindings.syncShotCameraEntryFromDocument("entry-a"), "synced");
	assert.equal(bindings.syncControlsToMode(), "controls-synced");
	assert.deepEqual(calls, [
		["sync-shot-camera-entry", "entry-a"],
		["sync-controls"],
	]);
}

console.log("✅ CAMERA_FRAMES scene framing controller bindings tests passed!");
