import assert from "node:assert/strict";
import {
	buildFrameOverlayLayers,
	buildSnapshotExportBundle,
} from "../src/controllers/export/bundle-build.js";
import {
	REFERENCE_IMAGE_GROUP_BACK,
	REFERENCE_IMAGE_GROUP_FRONT,
} from "../src/reference-image-model.js";

{
	const drawCalls = [];
	const createCanvas = () => ({
		width: 0,
		height: 0,
		getContext(kind) {
			assert.equal(kind, "2d");
			return {
				clearRect() {},
			};
		},
	});

	const layers = buildFrameOverlayLayers(
		640,
		480,
		[
			{ id: "frame-b", name: "", order: 2 },
			{ id: "frame-a", name: "Frame A", order: 1 },
		],
		{
			createCanvas,
			drawFramesToContext: (_context, width, height, frames, options) => {
				drawCalls.push({ width, height, frameId: frames[0]?.id, options });
			},
		},
	);

	assert.deepEqual(
		layers.map((layer) => layer.metadata?.frameId),
		["frame-a", "frame-b"],
	);
	assert.deepEqual(
		drawCalls.map((call) => call.frameId),
		["frame-a", "frame-b"],
	);
	assert.equal(drawCalls[0].options.strokeStyle, "#ff0000");
	assert.equal(layers[0].name, "Frame A");
	assert.equal(layers[1].name, "FRAME 2");
}

{
	const createCanvas = () => ({
		width: 0,
		height: 0,
		getContext(kind) {
			assert.equal(kind, "2d");
			return {
				clearRect() {},
			};
		},
	});
	const bundle = buildSnapshotExportBundle(
		{
			width: 2,
			height: 1,
			pixels: new Uint8Array(8),
			exportSettings: {
				exportGridOverlay: true,
				exportGridLayerMode: "bottom",
			},
			sceneAssets: [
				{
					id: "model-a",
					label: "Model A",
					exportRole: "beauty",
					maskGroup: "hero",
				},
			],
			readiness: { pending: [] },
			maskPasses: [
				{
					id: "mask:asset-model-a",
					pixels: new Uint8Array(8),
				},
			],
			gridGuidePixels: new Uint8Array(8),
			eyeLevelPixels: new Uint8Array(8),
			referenceImageLayers: [
				{
					id: "back-1",
					assetId: "asset-back",
					name: "Back",
					group: REFERENCE_IMAGE_GROUP_BACK,
					order: 0,
					opacity: 1,
					canvas: { id: "canvas-back" },
					bounds: { left: 1, top: 2 },
				},
				{
					id: "front-1",
					assetId: "asset-front",
					name: "Front",
					group: REFERENCE_IMAGE_GROUP_FRONT,
					order: 1,
					opacity: 0.5,
					canvas: { id: "canvas-front" },
					bounds: { left: 3, top: 4 },
				},
			],
			psdBasePixels: new Uint8Array(8),
			backgroundCanvas: { id: "background" },
			modelLayers: [{ name: "Model Layer" }],
			modelDebugGroups: [{ name: "Model Debug" }],
			splatLayers: [{ name: "Splat Layer" }],
			splatDebugGroups: [{ name: "Splat Debug" }],
		},
		[{ id: "frame-a", name: "FRAME A", order: 0 }],
		{
			createCanvas,
			drawFramesToContext() {},
			frameMaskSettings: {
				mode: "selected",
				selectedIds: ["frame-a"],
				shape: "trajectory",
				trajectoryMode: "spline",
			},
		},
	);

	assert.deepEqual(
		bundle.passes.map((pass) => pass.id),
		[
			"background",
			"reference-images-back",
			"guide-grid",
			"beauty",
			"reference-images-front",
			"guide-eye-level",
			"frame-overlay",
			"mask:asset-model-a",
		],
	);
	assert.equal(bundle.passes.at(-1)?.enabled, false);
	assert.equal(bundle.passes.at(-1)?.metadata?.maskGroup, "hero");
	assert.equal(bundle.passes[3]?.layers?.[0]?.metadata?.passId, "beauty");
	assert.equal(bundle.passes[6]?.layers?.[0]?.metadata?.frameId, "frame-a");
	assert.deepEqual(bundle.frameMaskSettings, {
		mode: "selected",
		selectedIds: ["frame-a"],
		shape: "trajectory",
		trajectoryMode: "spline",
	});
	assert.equal(bundle.referenceImageLayers.length, 2);
	assert.equal(bundle.modelLayers.length, 1);
	assert.equal(bundle.splatLayers.length, 1);
}

console.log("✅ CAMERA_FRAMES export bundle build tests passed!");
