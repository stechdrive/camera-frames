import assert from "node:assert/strict";
import { createMeasurementControllerBindings } from "../src/app/measurement-controller-bindings.js";

{
	const bindings = createMeasurementControllerBindings({
		store: { id: "store" },
		state: { id: "state" },
		viewportShell: { id: "shell" },
		viewportCanvas: { id: "canvas" },
		guides: { id: "guides" },
		workspacePaneCamera: "camera",
		getActiveViewportCamera: () => ({ id: "viewport-camera" }),
		getActiveCameraViewCamera: () => ({ id: "camera-view" }),
		getActiveOutputCamera: () => ({ id: "output-camera" }),
		assetController: { id: "asset-controller" },
		setStatus: (value) => value,
		t: (value) => `t:${value}`,
	});

	assert.equal(bindings.store.id, "store");
	assert.equal(bindings.state.id, "state");
	assert.equal(bindings.viewportShell.id, "shell");
	assert.equal(bindings.viewportCanvas.id, "canvas");
	assert.equal(bindings.guides.id, "guides");
	assert.equal(bindings.workspacePaneCamera, "camera");
	assert.deepEqual(bindings.getActiveViewportCamera(), {
		id: "viewport-camera",
	});
	assert.deepEqual(bindings.getActiveCameraViewCamera(), { id: "camera-view" });
	assert.deepEqual(bindings.getActiveOutputCamera(), { id: "output-camera" });
	assert.equal(bindings.assetController.id, "asset-controller");
	assert.equal(bindings.t("measure"), "t:measure");
}

console.log("✅ CAMERA_FRAMES measurement controller bindings tests passed!");
