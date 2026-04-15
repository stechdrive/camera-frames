import assert from "node:assert/strict";
import { buildPsdExportDocument } from "../src/controllers/export/psd-document.js";
import {
	createExportPass,
	createPixelLayer,
	createRasterLayer,
} from "../src/engine/export-bundle.js";
import {
	REFERENCE_IMAGE_GROUP_BACK,
	REFERENCE_IMAGE_GROUP_FRONT,
} from "../src/reference-image-model.js";

{
	let capturedMaskFrames = null;
	let capturedMaskOptions = null;
	const document = buildPsdExportDocument(
		{
			width: 4,
			height: 2,
			exportSettings: {
				exportGridLayerMode: "bottom",
				exportModelLayers: false,
				exportSplatLayers: false,
			},
			frameMaskSettings: {
				mode: "selected",
				selectedIds: ["frame-b"],
				shape: "trajectory",
				trajectoryMode: "spline",
			},
			passes: [
				createExportPass({
					id: "beauty",
					layers: [
						createPixelLayer({
							name: "Render",
							pixels: new Uint8Array(32),
							width: 4,
							height: 2,
						}),
					],
				}),
			],
		},
		[
			{ id: "frame-a", x: 0.25, y: 0.5, scale: 1, rotation: 0 },
			{ id: "frame-b", x: 0.75, y: 0.5, scale: 1, rotation: 0 },
		],
		{
			createCanvasFromPixels: () => ({ id: "render" }),
			createFrameMaskLayerDocument: (frames, _width, _height, options) => {
				capturedMaskFrames = frames;
				capturedMaskOptions = options;
				return { name: "Mask" };
			},
			renderExportPassToCanvas: () => ({ id: "pass" }),
		},
	);

	assert.equal(document.layers.at(-1)?.name, "Mask");
	assert.deepEqual(
		capturedMaskFrames?.map((frame) => frame.id),
		["frame-b"],
	);
	assert.deepEqual(capturedMaskOptions?.frameMaskSettings, {
		mode: "selected",
		selectedIds: ["frame-b"],
		shape: "trajectory",
		trajectoryMode: "spline",
	});
}

{
	let createMaskLayerCallCount = 0;
	const document = buildPsdExportDocument(
		{
			width: 4,
			height: 2,
			exportSettings: {
				exportGridLayerMode: "bottom",
				exportModelLayers: false,
				exportSplatLayers: false,
			},
			frameMaskSettings: {
				mode: "off",
			},
			passes: [
				createExportPass({
					id: "beauty",
					layers: [
						createPixelLayer({
							name: "Render",
							pixels: new Uint8Array(32),
							width: 4,
							height: 2,
						}),
					],
				}),
			],
		},
		[{ id: "frame-a", x: 0.5, y: 0.5, scale: 1, rotation: 0 }],
		{
			createCanvasFromPixels: () => ({ id: "render" }),
			createFrameMaskLayerDocument: () => {
				createMaskLayerCallCount += 1;
				return { name: "Mask" };
			},
			renderExportPassToCanvas: () => ({ id: "pass" }),
		},
	);

	assert.equal(createMaskLayerCallCount, 0);
	assert.equal(document.layers.some((layer) => layer.name === "Mask"), false);
}

{
	const bundle = {
		width: 4,
		height: 2,
		exportSettings: {
			exportGridLayerMode: "bottom",
			exportModelLayers: true,
			exportSplatLayers: true,
		},
		frameMaskSettings: {
			trajectoryExportSource: "center",
		},
		psdBasePixels: new Uint8Array(32),
		referenceImageLayers: [
			{
				id: "ref-back",
				name: "Back Ref",
				group: REFERENCE_IMAGE_GROUP_BACK,
				order: 0,
				opacity: 1,
				canvas: { id: "ref-back-canvas" },
				bounds: { left: 1, top: 2 },
			},
			{
				id: "ref-front",
				name: "Front Ref",
				group: REFERENCE_IMAGE_GROUP_FRONT,
				order: 1,
				opacity: 0.5,
				canvas: { id: "ref-front-canvas" },
				bounds: { left: 3, top: 4 },
			},
		],
		modelLayers: [{ name: "Model A" }, { name: "Model B" }],
		modelDebugGroups: [{ name: "__DEBUG model" }],
		splatLayers: [{ name: "Splat A" }],
		splatDebugGroups: [{ name: "__DEBUG splat" }],
		passes: [
			createExportPass({
				id: "background",
				layers: [createRasterLayer({ name: "Background", canvas: {} })],
			}),
			createExportPass({
				id: "guide-grid",
				layers: [
					createPixelLayer({
						name: "Grid",
						pixels: new Uint8Array(32),
						width: 4,
						height: 2,
					}),
				],
			}),
			createExportPass({
				id: "beauty",
				layers: [
					createPixelLayer({
						name: "Render",
						pixels: new Uint8Array(32),
						width: 4,
						height: 2,
					}),
				],
			}),
			createExportPass({
				id: "guide-eye-level",
				layers: [
					createPixelLayer({
						name: "Eye Level",
						pixels: new Uint8Array(32),
						width: 4,
						height: 2,
					}),
				],
			}),
			createExportPass({
				id: "frame-overlay",
				layers: [
					createRasterLayer({
						name: "FRAME A",
						canvas: { id: "frame" },
						left: 8,
						top: 9,
						opacity: 1,
					}),
				],
			}),
		],
	};

	const document = buildPsdExportDocument(
		bundle,
		[{ id: "frame-a", x: 0.5, y: 0.5, scale: 1, rotation: 0 }],
		{
			groupLabel: "Reference Images",
			frameGroupLabel: "Frames",
			exportDebugLayersEnabled: true,
			createCanvasFromPixels: () => ({ id: "render-canvas" }),
			createFrameMaskLayerDocument: () => ({ name: "Mask" }),
			createFrameTrajectoryLayerDocument: () => ({ name: "Trajectory" }),
			renderExportPassToCanvas: (_bundle, pass) => ({ id: `pass:${pass.id}` }),
		},
	);

	assert.equal(document.width, 4);
	assert.equal(document.height, 2);
	assert.deepEqual(
		document.layers.map((layer) => layer.name),
		[
			"Background",
			"Reference Images",
			"Grid",
			"Render",
			"Splat A",
			"Model B",
			"Model A",
			"Eye Level",
			"Reference Images",
			"Frames",
			"__DEBUG splat",
			"__DEBUG model",
			"Mask",
		],
	);
	assert.equal(document.layers[1].children[0].name, "Back Ref");
	assert.equal(document.layers[8].children[0].name, "Front Ref");
	assert.equal(document.layers[9].children[0].left, 8);
	assert.deepEqual(
		document.layers[9].children.map((layer) => layer.name),
		["FRAME A", "Trajectory"],
	);
}

{
	const document = buildPsdExportDocument(
		{
			width: 2,
			height: 2,
			exportSettings: {
				exportGridLayerMode: "bottom",
				exportModelLayers: false,
				exportSplatLayers: false,
			},
			referenceImageLayers: [
				{
					id: "ref-back-bottom",
					name: "Back Bottom",
					group: REFERENCE_IMAGE_GROUP_BACK,
					order: 0,
					opacity: 1,
					canvas: { id: "ref-back-bottom" },
					bounds: { left: 0, top: 0 },
				},
				{
					id: "ref-back-top",
					name: "Back Top",
					group: REFERENCE_IMAGE_GROUP_BACK,
					order: 1,
					opacity: 1,
					canvas: { id: "ref-back-top" },
					bounds: { left: 0, top: 0 },
				},
			],
			passes: [
				createExportPass({
					id: "beauty",
					layers: [
						createPixelLayer({
							name: "Render",
							pixels: new Uint8Array(16),
							width: 2,
							height: 2,
						}),
					],
				}),
			],
		},
		[],
		{
			createCanvasFromPixels: () => ({ id: "render-only" }),
			createFrameMaskLayerDocument: () => null,
			renderExportPassToCanvas: () => ({ id: "pass" }),
		},
	);

	assert.deepEqual(
		document.layers[0].children.map((layer) => layer.name),
		["Back Bottom", "Back Top"],
	);
}

{
	const document = buildPsdExportDocument(
		{
			width: 2,
			height: 2,
			exportSettings: {
				exportGridLayerMode: "top",
				exportModelLayers: false,
				exportSplatLayers: false,
			},
			referenceImageLayers: [],
			modelLayers: [{ name: "Model Hidden" }],
			splatLayers: [{ name: "Splat Hidden" }],
			modelDebugGroups: [{ name: "__DEBUG model" }],
			splatDebugGroups: [{ name: "__DEBUG splat" }],
			passes: [
				createExportPass({
					id: "beauty",
					layers: [
						createPixelLayer({
							name: "Render",
							pixels: new Uint8Array(16),
							width: 2,
							height: 2,
						}),
					],
				}),
				createExportPass({
					id: "guide-grid",
					layers: [
						createPixelLayer({
							name: "Grid",
							pixels: new Uint8Array(16),
							width: 2,
							height: 2,
						}),
					],
				}),
			],
		},
		[],
		{
			exportDebugLayersEnabled: false,
			createCanvasFromPixels: () => ({ id: "render-only" }),
			createFrameMaskLayerDocument: () => null,
			renderExportPassToCanvas: (_bundle, pass) => ({ id: pass.id }),
		},
	);

	assert.deepEqual(
		document.layers.map((layer) => layer.name),
		["Render", "Grid"],
	);
}

console.log("✅ CAMERA_FRAMES export psd document tests passed!");
