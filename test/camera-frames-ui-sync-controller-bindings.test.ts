import assert from "node:assert/strict";
import { createUiSyncControllerBindings } from "../src/app/ui-sync-controller-bindings.js";

{
	const bindings = createUiSyncControllerBindings({
		store: { id: "store" },
		state: { id: "state" },
		sceneState: { id: "scene-state" },
		viewportShell: { id: "shell" },
		renderBox: { id: "render-box" },
		dropHint: { id: "drop-hint" },
		fpsMovement: { id: "fps" },
		currentLocale: () => "ja",
		t: (value) => `t:${value}`,
		syncActiveShotCameraFromDocument: () => "sync-shot",
		interactionController: {
			isZoomToolActive: () => true,
		},
		updateOutputFrameOverlay: () => "overlay",
		getSceneAssetCounts: () => ({ totalCount: 2 }),
		getSceneBounds: () => ({ size: { x: 1, y: 2, z: 3 } }),
		getTotalLoadedItems: () => 5,
		getActiveShotCamera: () => ({ id: "shot" }),
		getActiveCamera: () => ({ id: "camera" }),
		getProjectionState: () => ({ mode: "perspective" }),
		projectionController: {
			getShotCameraPoseAngles: () => ({
				yawDeg: 1,
				pitchDeg: 2,
				rollDeg: 3,
			}),
		},
		getActiveShotCameraDocument: () => ({ id: "doc" }),
	});

	assert.equal(bindings.store.id, "store");
	assert.equal(bindings.sceneState.id, "scene-state");
	assert.equal(bindings.viewportShell.id, "shell");
	assert.equal(bindings.currentLocale(), "ja");
	assert.equal(bindings.isZoomToolActive(), true);
	assert.deepEqual(bindings.getSceneAssetCounts(), { totalCount: 2 });
	assert.deepEqual(bindings.getSceneBounds(), { size: { x: 1, y: 2, z: 3 } });
	assert.equal(bindings.getTotalLoadedItems(), 5);
	assert.deepEqual(bindings.getActiveShotCamera(), { id: "shot" });
	assert.deepEqual(bindings.getActiveCamera(), { id: "camera" });
	assert.deepEqual(bindings.getProjectionState(), { mode: "perspective" });
	assert.deepEqual(bindings.getShotCameraPoseAngles(), {
		yawDeg: 1,
		pitchDeg: 2,
		rollDeg: 3,
	});
	assert.deepEqual(bindings.getActiveShotCameraDocument(), { id: "doc" });
}

{
	const bindings = createUiSyncControllerBindings({
		interactionController: null,
		projectionController: null,
	});
	assert.equal(bindings.isZoomToolActive(), false);
	assert.deepEqual(bindings.getShotCameraPoseAngles(), {
		yawDeg: 0,
		pitchDeg: 0,
		rollDeg: 0,
	});
}

console.log("✅ CAMERA_FRAMES ui sync controller bindings tests passed!");
