import assert from "node:assert/strict";
import { createExportOutputRuntime } from "../src/controllers/export/output-runtime.js";

{
	const calls = [];
	let runtime = null;
	const store = {
		referenceImages: {
			document: { value: { id: "refs" } },
			exportSessionEnabled: { value: true },
		},
	};

	runtime = createExportOutputRuntime(
		{
			scene: { id: "scene" },
			renderer: {},
			spark: {},
			guides: {},
			guideOverlay: {},
			shotCameraRegistry: new Map(),
			store,
			flipPixels: (pixels) => pixels,
			t: (key, values = {}) => `${key}:${JSON.stringify(values)}`,
			getSceneAssets: () => [],
			getShotCameraDocument: () => ({ id: "camera-a" }),
			getActiveOutputCamera: () => ({ id: "output-camera" }),
			getOutputSizeState: () => ({ width: 1280, height: 720 }),
			syncActiveShotCameraFromDocument: () => {},
			syncShotProjection: () => {},
			syncOutputCamera: () => {},
			updateShotCameraHelpers: () => {},
			exportDebugLayersEnabled: true,
		},
		{
			createSparkExportRendererManagerFn: () => ({
				dispose() {
					calls.push(["dispose"]);
				},
			}),
			withOutputSnapshotSessionFn: async (
				{ shotCameraId },
				dependencies,
				callback,
			) => {
				calls.push(["session", shotCameraId]);
				dependencies.setRenderLock(true);
				const result = await callback({
					targetDocument: { id: "camera-a" },
					targetExportSettings: { exportFormat: "png" },
					outputCamera: { id: "output-camera" },
					width: 1280,
					height: 720,
					renderableSceneAssets: [],
					sceneAssets: [],
					backgroundCanvas: null,
					passPlan: { masks: [] },
				});
				dependencies.setRenderLock(false);
				return result;
			},
			createSnapshotPhaseTrackerFn: () => ({
				id: "tracker",
			}),
			renderOutputSnapshotSessionFn: async (config, dependencies) => {
				calls.push([
					"render",
					config.scene.id,
					config.referenceImageDocument.id,
					config.referenceImagesExportSessionEnabled,
					dependencies.phaseTracker.id,
					runtime.isRenderLocked(),
				]);
				return { ok: true };
			},
		},
	);

	const result = await runtime.renderOutputSnapshotForShotCamera("camera-a", {
		onProgress: () => {},
	});
	assert.deepEqual(result, { ok: true });
	assert.deepEqual(calls[0], ["session", "camera-a"]);
	assert.deepEqual(calls[1], [
		"render",
		"scene",
		"refs",
		true,
		"tracker",
		true,
	]);
	assert.equal(runtime.isRenderLocked(), false);

	runtime.dispose();
	assert.deepEqual(calls[2], ["dispose"]);
}

console.log("✅ CAMERA_FRAMES export output runtime tests passed!");
