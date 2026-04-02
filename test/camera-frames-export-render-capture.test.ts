import assert from "node:assert/strict";
import {
	renderConfiguredSceneCapture,
	renderConfiguredScenePixels,
	renderMaskPassSnapshots,
	renderPsdBasePixels,
} from "../src/controllers/export/render-capture.js";

{
	const calls = [];
	const sceneAssets = [{ id: "asset-a" }, { id: "asset-b" }];
	const result = await renderConfiguredSceneCapture(
		{
			camera: { id: "camera" },
			width: 2,
			height: 1,
			sceneAssets,
			guidesVisible: true,
			sceneBackground: "#000",
			clearAlpha: 0.5,
			resolveAssetRole: (asset) => (asset.id === "asset-a" ? "normal" : "hide"),
		},
		{
			scene: { id: "scene" },
			withAssetRenderState: async (state, callback) => {
				calls.push({
					type: "withAssetRenderState",
					assetA: state.resolveAssetRole({ id: "asset-a" }),
					assetB: state.resolveAssetRole({ id: "asset-b" }),
					assetC: state.resolveAssetRole({ id: "asset-c" }),
					guidesVisible: state.guidesVisible,
					sceneBackground: state.sceneBackground,
					clearAlpha: state.clearAlpha,
				});
				return callback();
			},
			renderScenePixelsWithReadiness: async (config) => {
				calls.push({ type: "renderScenePixelsWithReadiness", config });
				return {
					pixels: new Uint8Array([1, 2, 3, 4]),
					readiness: { pending: false },
				};
			},
			buildSceneAssetExportMetadata: (assets) => {
				calls.push({ type: "buildSceneAssetExportMetadata", assets });
				return [{ id: "meta-a" }];
			},
			flipPixels: (pixels, width, height) => {
				calls.push({
					type: "flipPixels",
					width,
					height,
					pixels: Array.from(pixels),
				});
				return new Uint8Array([4, 3, 2, 1]);
			},
			clonePixels: (pixels) => new Uint8Array(pixels),
		},
	);

	assert.deepEqual(Array.from(result.pixels), [4, 3, 2, 1]);
	assert.deepEqual(result.readiness, { pending: false });
	assert.deepEqual(calls[0], {
		type: "withAssetRenderState",
		assetA: "normal",
		assetB: "hide",
		assetC: "hide",
		guidesVisible: true,
		sceneBackground: "#000",
		clearAlpha: 0.5,
	});
	assert.equal(calls[1].type, "buildSceneAssetExportMetadata");
	assert.equal(calls[1].assets, sceneAssets);
	assert.equal(calls[2].type, "renderScenePixelsWithReadiness");
	assert.deepEqual(calls[2].config, {
		scene: { id: "scene" },
		camera: { id: "camera" },
		width: 2,
		height: 1,
		sceneAssets: [{ id: "meta-a" }],
	});
	assert.deepEqual(calls[3], {
		type: "flipPixels",
		width: 2,
		height: 1,
		pixels: [1, 2, 3, 4],
	});
}

{
	const pixels = new Uint8Array([9, 8, 7, 6]);
	const result = await renderConfiguredScenePixels(
		{ id: "config" },
		{
			renderCapture: async (config) => {
				assert.deepEqual(config, { id: "config" });
				return { pixels };
			},
		},
	);
	assert.equal(result, pixels);
}

{
	assert.equal(
		await renderPsdBasePixels(
			{
				camera: null,
				width: 1,
				height: 1,
				sceneAssets: [],
				exportSettings: { exportModelLayers: false },
			},
			{},
		),
		null,
	);

	let capturedConfig = null;
	const basePixels = await renderPsdBasePixels(
		{
			camera: { id: "camera" },
			width: 10,
			height: 20,
			sceneAssets: [
				{ id: "omit", exportRole: "omit", kind: "model" },
				{ id: "model", exportRole: "normal", kind: "model" },
				{ id: "splat", exportRole: "normal", kind: "splat" },
				{ id: "guide", exportRole: "normal", kind: "other" },
			],
			exportSettings: { exportModelLayers: true, exportSplatLayers: true },
		},
		{
			renderScenePixels: async (config) => {
				capturedConfig = config;
				return new Uint8Array([5, 6, 7, 8]);
			},
		},
	);

	assert.deepEqual(Array.from(basePixels), [5, 6, 7, 8]);
	assert.equal(capturedConfig.camera.id, "camera");
	assert.equal(capturedConfig.width, 10);
	assert.equal(capturedConfig.height, 20);
	assert.equal(capturedConfig.guidesVisible, false);
	assert.equal(capturedConfig.sceneBackground, null);
	assert.equal(capturedConfig.clearAlpha, 0);
	assert.equal(
		capturedConfig.resolveAssetRole({ exportRole: "omit", kind: "model" }),
		"hide",
	);
	assert.equal(
		capturedConfig.resolveAssetRole({ exportRole: "normal", kind: "model" }),
		"hide",
	);
	assert.equal(
		capturedConfig.resolveAssetRole({ exportRole: "normal", kind: "splat" }),
		"hide",
	);
	assert.equal(
		capturedConfig.resolveAssetRole({ exportRole: "normal", kind: "other" }),
		"normal",
	);
}

{
	const progressCalls = [];
	const rendered = await renderMaskPassSnapshots(
		{
			scene: { id: "scene" },
			camera: { id: "camera" },
			width: 2,
			height: 1,
			sceneAssets: [{ id: "asset-a" }, { id: "asset-b" }],
			maskPasses: [
				{ id: "skip", name: "Skip", assetIds: [] },
				{ id: "mask-a", name: "Mask A", assetIds: ["asset-a"] },
			],
			onProgress: (entry) => {
				progressCalls.push(entry);
			},
		},
		{
			withMaskSceneState: async (maskPass, allowedAssetIds, callback) => {
				assert.equal(maskPass.id, "mask-a");
				assert.deepEqual(Array.from(allowedAssetIds), ["asset-a", "asset-b"]);
				return callback();
			},
			renderScenePixelsWithReadiness: async (config) => {
				assert.deepEqual(config, {
					scene: { id: "scene" },
					camera: { id: "camera" },
					width: 2,
					height: 1,
					sceneAssets: [{ id: "meta-current" }],
				});
				return { pixels: new Uint8Array([1, 2, 3, 4]) };
			},
			buildSceneAssetExportMetadata: (assets) => {
				assert.deepEqual(assets, [{ id: "current-scene-asset" }]);
				return [{ id: "meta-current" }];
			},
			getSceneAssets: () => [{ id: "current-scene-asset" }],
			flipPixels: (pixels, width, height) => {
				assert.equal(width, 2);
				assert.equal(height, 1);
				assert.deepEqual(Array.from(pixels), [1, 2, 3, 4]);
				return new Uint8Array([4, 3, 2, 1]);
			},
			clonePixels: (pixels) => new Uint8Array(pixels),
		},
	);

	assert.deepEqual(progressCalls, [{ index: 2, count: 2, name: "Mask A" }]);
	assert.deepEqual(rendered, [
		{
			id: "mask-a",
			name: "Mask A",
			assetIds: ["asset-a"],
			pixels: new Uint8Array([4, 3, 2, 1]),
		},
	]);
}

console.log("✅ CAMERA_FRAMES export render capture tests passed!");
