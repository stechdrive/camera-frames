import assert from "node:assert/strict";
import { renderOutputSnapshotSession } from "../src/controllers/export/output-snapshot.js";

{
	const phaseCalls = [];
	const helperCalls = [];
	const result = await renderOutputSnapshotSession(
		{
			scene: { id: "scene" },
			targetDocument: { id: "camera-a" },
			targetExportSettings: {
				exportFormat: "psd",
				exportGridOverlay: true,
				exportGridLayerMode: "bottom",
				exportModelLayers: true,
				exportSplatLayers: true,
			},
			outputCamera: { id: "camera" },
			width: 1280,
			height: 720,
			renderableSceneAssets: [{ id: "asset-a" }],
			sceneAssets: [{ id: "asset-a", kind: "model" }],
			backgroundCanvas: { id: "background" },
			passPlan: {
				masks: [{ assetIds: ["asset-a"] }],
			},
			referenceImageDocument: { id: "refs" },
			referenceImagesExportSessionEnabled: true,
			t: (key, values = {}) => `${key}:${JSON.stringify(values)}`,
		},
		{
			phaseTracker: {
				emitPhase: (id, detail = null) => phaseCalls.push(["emit", id, detail]),
				completePhase: (id) => phaseCalls.push(["complete", id]),
			},
			renderConfiguredSceneCapture: async (config) => {
				helperCalls.push(["beauty", config.width, config.height]);
				return {
					pixels: new Uint8Array([1, 2, 3, 4]),
					readiness: { state: "ready" },
				};
			},
			clonePixels: (pixels) => new Uint8Array(pixels),
			renderGuideLayerPixels: async (config) => {
				helperCalls.push([
					"guide",
					config.gridVisible,
					config.eyeLevelVisible,
					config.gridLayerMode,
				]);
				return new Uint8Array([9, 9, 9, 9]);
			},
			renderMaskPassSnapshots: async (config) => {
				assert.deepEqual(config.scene, { id: "scene" });
				helperCalls.push(["masks", config.maskPasses.length]);
				config.onProgress?.({ index: 1, count: 1, name: "Mask A" });
				return [{ id: "mask-a" }];
			},
			renderPsdBasePixels: async (config) => {
				helperCalls.push(["psd-base", config.exportSettings.exportFormat]);
				return new Uint8Array([8, 8, 8, 8]);
			},
			renderModelLayerDocuments: async (config) => {
				helperCalls.push(["models", config.sceneAssets.length]);
				config.onProgress?.({ index: 1, count: 1, name: "Model A" });
				return {
					layers: [{ id: "model-layer" }],
					debugGroups: [{ id: "debug-a" }],
				};
			},
			renderSplatLayerDocuments: async (config) => {
				helperCalls.push(["splats", config.sceneAssets.length]);
				config.onProgress?.({ index: 1, count: 1, name: "Splat A" });
				return {
					layers: [{ id: "splat-layer" }],
					debugGroups: [{ id: "debug-b" }],
				};
			},
			renderReferenceImageLayersForShotCamera: async (config) => {
				helperCalls.push(["references", config.applyOpacity]);
				config.onProgress?.({ index: 1, count: 1, name: "Ref A" });
				return { frontLayers: [{ id: "front-a" }], backLayers: [] };
			},
		},
	);

	assert.deepEqual(helperCalls, [
		["beauty", 1280, 720],
		["guide", true, false, "bottom"],
		["guide", false, true, "bottom"],
		["masks", 1],
		["psd-base", "psd"],
		["models", 1],
		["splats", 1],
		["references", false],
	]);
	assert.deepEqual(phaseCalls, [
		["emit", "prepare", null],
		["complete", "prepare"],
		["emit", "beauty", null],
		["complete", "beauty"],
		["emit", "guides", "overlay.exportPhaseDetailGuidesGrid:{}"],
		["emit", "guides", "overlay.exportPhaseDetailGuidesEyeLevel:{}"],
		["complete", "guides"],
		["emit", "masks", null],
		[
			"emit",
			"masks",
			'overlay.exportPhaseDetailMaskBatch:{"index":1,"count":1,"name":"Mask A"}',
		],
		["complete", "masks"],
		["emit", "psd-base", null],
		["complete", "psd-base"],
		["emit", "model-layers", null],
		[
			"emit",
			"model-layers",
			'overlay.exportPhaseDetailModelLayersBatch:{"index":1,"count":1,"name":"Model A"}',
		],
		["complete", "model-layers"],
		["emit", "splat-layers", null],
		[
			"emit",
			"splat-layers",
			'overlay.exportPhaseDetailSplatLayersBatch:{"index":1,"count":1,"name":"Splat A"}',
		],
		["complete", "splat-layers"],
		["emit", "reference-images", null],
		[
			"emit",
			"reference-images",
			'overlay.exportPhaseDetailReferenceImagesBatch:{"index":1,"count":1,"name":"Ref A"}',
		],
		["complete", "reference-images"],
	]);
	assert.deepEqual(Array.from(result.pixels), [1, 2, 3, 4]);
	assert.deepEqual(result.readiness, { state: "ready" });
	assert.deepEqual(result.maskPasses, [{ id: "mask-a" }]);
	assert.deepEqual(Array.from(result.gridGuidePixels), [9, 9, 9, 9]);
	assert.deepEqual(Array.from(result.eyeLevelPixels), [9, 9, 9, 9]);
	assert.deepEqual(result.referenceImageLayers, {
		frontLayers: [{ id: "front-a" }],
		backLayers: [],
	});
	assert.deepEqual(Array.from(result.psdBasePixels), [8, 8, 8, 8]);
	assert.deepEqual(result.modelLayers, [{ id: "model-layer" }]);
	assert.deepEqual(result.modelDebugGroups, [{ id: "debug-a" }]);
	assert.deepEqual(result.splatLayers, [{ id: "splat-layer" }]);
	assert.deepEqual(result.splatDebugGroups, [{ id: "debug-b" }]);
}

{
	const helperCalls = [];
	const result = await renderOutputSnapshotSession(
		{
			scene: { id: "scene" },
			targetDocument: { id: "camera-b" },
			targetExportSettings: {
				exportFormat: "png",
				exportGridOverlay: false,
				exportGridLayerMode: "top",
				exportModelLayers: true,
				exportSplatLayers: true,
			},
			outputCamera: { id: "camera" },
			width: 320,
			height: 240,
			renderableSceneAssets: [{ id: "asset-a" }],
			sceneAssets: [{ id: "asset-a", kind: "model" }],
			backgroundCanvas: null,
			passPlan: {
				masks: [],
			},
			referenceImageDocument: { id: "refs" },
			referenceImagesExportSessionEnabled: false,
			t: (key, values = {}) => `${key}:${JSON.stringify(values)}`,
		},
		{
			phaseTracker: {
				emitPhase: () => {},
				completePhase: () => {},
			},
			renderConfiguredSceneCapture: async () => ({
				pixels: new Uint8Array([7, 7, 7, 7]),
				readiness: { state: "ready" },
			}),
			clonePixels: (pixels) => new Uint8Array(pixels),
			renderGuideLayerPixels: async () => {
				throw new Error("guides should not run");
			},
			renderMaskPassSnapshots: async () => {
				helperCalls.push("masks");
				return [];
			},
			renderPsdBasePixels: async () => {
				throw new Error("psd base should not run");
			},
			renderModelLayerDocuments: async () => {
				throw new Error("model layers should not run");
			},
			renderSplatLayerDocuments: async () => {
				throw new Error("splat layers should not run");
			},
			renderReferenceImageLayersForShotCamera: async (config) => {
				helperCalls.push(["references", config.applyOpacity]);
				return { frontLayers: [], backLayers: [] };
			},
		},
	);

	assert.deepEqual(helperCalls, ["masks", ["references", true]]);
	assert.equal(result.gridGuidePixels, null);
	assert.equal(result.eyeLevelPixels, null);
	assert.equal(result.psdBasePixels, null);
	assert.deepEqual(result.modelLayers, []);
	assert.deepEqual(result.splatLayers, []);
}

console.log("✅ CAMERA_FRAMES export output snapshot tests passed!");
