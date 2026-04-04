import assert from "node:assert/strict";
import { createExportControllerBindings } from "../src/app/export-controller-bindings.js";

{
	const bindings = createExportControllerBindings({
		scene: { id: "scene" },
		renderer: { id: "renderer" },
		spark: { id: "spark" },
		guides: { id: "guides" },
		guideOverlay: { id: "guide-overlay" },
		shotCameraRegistry: new Map([["a", { id: "cam-a" }]]),
		store: { id: "store" },
		flipPixels: () => "flip",
		drawFramesToContext: () => "draw",
		t: () => "t",
		setStatus: () => "status",
		setExportStatus: () => "export-status",
		updateUi: () => "update-ui",
		getTotalLoadedItems: () => 12,
		getSceneAssets: () => [{ id: 1 }],
		getShotCameraDocument: () => ({ id: "cam-a" }),
		getActiveShotCameraDocument: () => ({ id: "cam-active" }),
		getActiveOutputCamera: () => ({ id: "output-camera" }),
		getActiveFrames: () => [{ id: "frame-a" }],
		getOutputSizeState: () => ({ width: 1920, height: 1080 }),
		getShotCameraExportBaseName: () => "Camera-A",
		syncActiveShotCameraFromDocument: () => "sync-active",
		syncShotProjection: () => "sync-shot",
		syncOutputCamera: () => "sync-output",
		updateShotCameraHelpers: () => "helpers",
	});

	assert.equal(bindings.scene.id, "scene");
	assert.equal(bindings.renderer.id, "renderer");
	assert.equal(bindings.spark.id, "spark");
	assert.equal(bindings.guides.id, "guides");
	assert.equal(bindings.guideOverlay.id, "guide-overlay");
	assert.equal(bindings.store.id, "store");
	assert.equal(bindings.getTotalLoadedItems(), 12);
	assert.deepEqual(bindings.getSceneAssets(), [{ id: 1 }]);
	assert.deepEqual(bindings.getOutputSizeState(), {
		width: 1920,
		height: 1080,
	});
	assert.equal(bindings.getShotCameraExportBaseName(), "Camera-A");
	assert.equal(bindings.syncActiveShotCameraFromDocument(), "sync-active");
	assert.equal(bindings.syncShotProjection(), "sync-shot");
	assert.equal(bindings.syncOutputCamera(), "sync-output");
	assert.equal(bindings.updateShotCameraHelpers(), "helpers");
}

console.log("✅ CAMERA_FRAMES export controller bindings tests passed!");
