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
					readinessPolicy: { splatWarmupPasses: 3, maxWaitMs: 2000 },
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
				const captureConfig = {
					camera: { id: "camera" },
					width: 2,
					height: 1,
					sceneAssets: [],
					resolveAssetRole: () => "normal",
				};
				await dependencies.renderConfiguredSceneCapture(captureConfig);
				await dependencies.renderMaskPassSnapshots({
					scene: { id: "scene" },
					camera: { id: "camera" },
					width: 2,
					height: 1,
					sceneAssets: [],
					maskPasses: [{ id: "mask", name: "Mask", assetIds: ["asset-a"] }],
				});
				await dependencies.renderPsdBasePixels({
					camera: { id: "camera" },
					width: 2,
					height: 1,
					sceneAssets: [],
					exportSettings: { exportModelLayers: true },
				});
				await dependencies.renderModelLayerDocuments({
					camera: { id: "camera" },
					width: 2,
					height: 1,
					sceneAssets: [],
					exportSettings: { exportModelLayers: true },
				});
				await dependencies.renderSplatLayerDocuments({
					camera: { id: "camera" },
					width: 2,
					height: 1,
					sceneAssets: [],
					exportSettings: { exportSplatLayers: true },
				});
				return { ok: true };
			},
			renderScenePixelsWithReadinessFn: async (config) => {
				calls.push(["readiness", config.readinessPolicy]);
				return { pixels: new Uint8Array([1, 2, 3, 4]) };
			},
			renderConfiguredSceneCaptureFn: async (config, dependencies) =>
				dependencies.renderScenePixelsWithReadiness({
					scene: { id: "scene" },
					camera: config.camera,
					width: config.width,
					height: config.height,
					sceneAssets: config.sceneAssets,
				}),
			renderMaskPassSnapshotsFn: async (config, dependencies) => {
				await dependencies.renderScenePixelsWithReadiness({
					scene: config.scene,
					camera: config.camera,
					width: config.width,
					height: config.height,
					sceneAssets: config.sceneAssets,
				});
				return [];
			},
			renderPsdBasePixelsFn: async (config, dependencies) =>
				dependencies.renderScenePixels(config),
			renderModelLayerDocumentsFn: async (config, dependencies) => {
				await dependencies.renderScenePixels(config);
				return { layers: [], debugGroups: [] };
			},
			renderSplatLayerDocumentsFn: async (config, dependencies) => {
				await dependencies.renderScenePixels(config);
				return { layers: [], debugGroups: [] };
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
	assert.deepEqual(
		calls.filter((entry) => entry[0] === "readiness").map((entry) => entry[1]),
		Array.from({ length: 5 }, () => ({
			splatWarmupPasses: 3,
			maxWaitMs: 2000,
		})),
	);

	runtime.dispose();
	assert.deepEqual(calls.at(-1), ["dispose"]);
}

console.log("✅ CAMERA_FRAMES export output runtime tests passed!");
