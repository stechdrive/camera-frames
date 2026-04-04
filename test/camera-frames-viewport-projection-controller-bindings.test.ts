import assert from "node:assert/strict";
import { createViewportProjectionControllerBindings } from "../src/app/viewport-projection-controller-bindings.js";

{
	const bindings = createViewportProjectionControllerBindings({
		store: { id: "store" },
		viewportShell: { id: "shell" },
		viewportCamera: { id: "perspective-camera" },
		viewportOrthoCamera: { id: "ortho-camera" },
		outputFrameController: {
			getViewportSize: () => ({ width: 1280, height: 720 }),
		},
		sceneFramingController: {
			getAutoClipRange: (camera) => ({ camera, near: 0.1, far: 1000 }),
			getSceneFraming: () => ({ center: { x: 1, y: 2, z: 3 } }),
		},
		assetController: {
			getSceneRaycastTargets: () => ["a", "b"],
		},
	});

	assert.equal(bindings.store.id, "store");
	assert.equal(bindings.viewportShell.id, "shell");
	assert.equal(bindings.viewportPerspectiveCamera.id, "perspective-camera");
	assert.equal(bindings.viewportOrthographicCamera.id, "ortho-camera");
	assert.deepEqual(bindings.getViewportSize(), { width: 1280, height: 720 });
	assert.deepEqual(bindings.getAutoClipRange("camera"), {
		camera: "camera",
		near: 0.1,
		far: 1000,
	});
	assert.deepEqual(bindings.getSceneFraming(), {
		center: { x: 1, y: 2, z: 3 },
	});
	assert.deepEqual(bindings.getSceneRaycastTargets(), ["a", "b"]);
}

{
	const bindings = createViewportProjectionControllerBindings({
		store: { id: "store" },
		viewportShell: { clientWidth: 640, clientHeight: 360 },
		viewportCamera: { id: "perspective-camera" },
		viewportOrthoCamera: { id: "ortho-camera" },
		outputFrameController: null,
		sceneFramingController: {
			getAutoClipRange: () => null,
			getSceneFraming: () => null,
		},
		assetController: {
			getSceneRaycastTargets: () => [],
		},
	});

	assert.deepEqual(bindings.getViewportSize(), { width: 640, height: 360 });
}

console.log(
	"✅ CAMERA_FRAMES viewport projection controller bindings tests passed!",
);
