import assert from "node:assert/strict";
import {
	renderModelLayerDocuments,
	renderSplatLayerDocuments,
} from "../src/controllers/export/layer-documents.js";

{
	const calls = [];
	const progressCalls = [];
	const sceneAssets = [
		{ id: "model-a", kind: "model", label: "Model A", exportRole: "normal" },
		{ id: "model-b", kind: "model", label: "Model B", exportRole: "normal" },
		{ id: "splat-a", kind: "splat", label: "Splat A", exportRole: "normal" },
	];
	const result = await renderModelLayerDocuments(
		{
			camera: { id: "camera" },
			width: 1,
			height: 1,
			sceneAssets,
			exportSettings: { exportModelLayers: true },
			onProgress: (entry) => progressCalls.push(entry),
		},
		{
			renderScenePixels: async (config) => {
				calls.push(config);
				return new Uint8Array([calls.length, 0, 0, 255]);
			},
			createCanvasFromPixels: (pixels, width, height) => ({
				pixels: Array.from(pixels),
				width,
				height,
			}),
			buildLayerMaskPixels: (
				sourcePixels,
				modelVisibilityPixels,
				splatPixels,
			) =>
				new Uint8Array([
					sourcePixels[0],
					modelVisibilityPixels[0],
					splatPixels[0],
					255,
				]),
			createAlphaPreviewPixels: (pixels) =>
				new Uint8Array([pixels[0], pixels[0], pixels[0], 255]),
			exportDebugLayersEnabled: true,
		},
	);

	assert.deepEqual(progressCalls, [
		{ index: 1, count: 2, name: "Model A" },
		{ index: 2, count: 2, name: "Model B" },
	]);
	assert.equal(calls.length, 6);
	assert.equal(calls[0].resolveAssetRole(sceneAssets[0]), "normal");
	assert.equal(calls[0].resolveAssetRole(sceneAssets[1]), "hide");
	assert.equal(calls[1].resolveAssetRole(sceneAssets[0]), "mask-target");
	assert.equal(calls[1].resolveAssetRole(sceneAssets[1]), "mask-occluder");
	assert.equal(calls[1].resolveAssetRole(sceneAssets[2]), "hide");
	assert.equal(calls[2].resolveAssetRole(sceneAssets[0]), "depth-occluder");
	assert.equal(
		calls[2].resolveAssetRole(sceneAssets[2]),
		"mask-alpha-occluder",
	);
	assert.equal(result.layers.length, 2);
	assert.deepEqual(result.layers[0].canvas, {
		pixels: [1, 0, 0, 255],
		width: 1,
		height: 1,
	});
	assert.deepEqual(result.layers[0].mask.canvas, {
		pixels: [1, 2, 3, 255],
		width: 1,
		height: 1,
	});
	assert.equal(result.debugGroups.length, 2);
	assert.equal(result.debugGroups[0].children.length, 4);
}

{
	const sceneAssets = [
		{ id: "splat-a", kind: "splat", label: "Splat A" },
		{ id: "splat-b", kind: "splat", label: "Splat B" },
		{ id: "model-a", kind: "model", label: "Model A" },
	];
	const calls = [];
	const progressCalls = [];
	const result = await renderSplatLayerDocuments(
		{
			camera: { id: "camera" },
			width: 1,
			height: 1,
			sceneAssets,
			exportSettings: { exportSplatLayers: true },
			onProgress: (entry) => progressCalls.push(entry),
		},
		{
			renderScenePixels: async (config) => {
				calls.push(config);
				return new Uint8Array([calls.length, 0, 0, 255]);
			},
			createCanvasFromPixels: (pixels, width, height) => ({
				pixels: Array.from(pixels),
				width,
				height,
			}),
			buildSplatLayerMaskPixels: (
				sourcePixels,
				compositePixels,
				lowerPixels,
				width,
				height,
			) =>
				new Uint8Array([
					sourcePixels[0],
					compositePixels[0],
					lowerPixels[0],
					width + height,
				]),
			createAlphaPreviewPixels: (pixels) =>
				new Uint8Array([pixels[0], pixels[0], pixels[0], 255]),
			exportDebugLayersEnabled: true,
		},
	);

	assert.deepEqual(progressCalls, [
		{ index: 1, count: 2, name: "Splat A" },
		{ index: 2, count: 2, name: "Splat B" },
	]);
	assert.equal(calls.length, 4);
	assert.equal(calls[0].resolveAssetRole(sceneAssets[0]), "normal");
	assert.equal(calls[0].resolveAssetRole(sceneAssets[2]), "hide");
	assert.equal(calls[1].resolveAssetRole(sceneAssets[1]), "normal");
	assert.equal(calls[2].resolveAssetRole(sceneAssets[0]), "normal");
	assert.equal(calls[2].resolveAssetRole(sceneAssets[1]), "normal");
	assert.equal(result.layers.length, 2);
	assert.deepEqual(result.layers[0].mask.canvas, {
		pixels: [1, 3, 2, 2],
		width: 1,
		height: 1,
	});
	assert.equal(result.debugGroups.length, 1);
	assert.equal(result.debugGroups[0].children.length, 4);
	assert.equal(result.layers[1].mask, undefined);
}

console.log("✅ CAMERA_FRAMES export layer document tests passed!");
