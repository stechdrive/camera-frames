import assert from "node:assert/strict";
import {
	buildReferenceImageExportCanvas,
	renderReferenceImageLayersForShotCamera,
} from "../src/controllers/export/reference-images.js";
import {
	REFERENCE_IMAGE_GROUP_BACK,
	REFERENCE_IMAGE_GROUP_FRONT,
	createDefaultReferenceImageDocument,
	createReferenceImageAsset,
	createReferenceImageItem,
	createReferenceImagePreset,
} from "../src/reference-image-model.js";
import { createShotCameraDocument } from "../src/workspace-model.js";

{
	let smoothingEnabled = null;
	let alphaValue = null;
	let drawImageArgs = null;
	const mockContext = {
		translate() {},
		rotate() {},
		set imageSmoothingEnabled(value) {
			smoothingEnabled = value;
		},
		set globalAlpha(value) {
			alphaValue = value;
		},
		drawImage(...args) {
			drawImageArgs = args;
		},
	};
	const mockCanvas = {
		width: 0,
		height: 0,
		getContext(kind) {
			assert.equal(kind, "2d");
			return mockContext;
		},
	};

	const rendered = buildReferenceImageExportCanvas(
		{
			drawable: { id: "drawable" },
			width: 100,
			height: 50,
			anchor: { ax: 0.5, ay: 0.5 },
			anchorPoint: { x: 200, y: 100 },
			rotationDeg: 0,
			pixelPerfect: false,
			opacity: 0.4,
		},
		{
			createCanvas: () => mockCanvas,
			previewContextError: "preview-context",
		},
	);

	assert.equal(mockCanvas.width, 100);
	assert.equal(mockCanvas.height, 50);
	assert.equal(smoothingEnabled, true);
	assert.equal(alphaValue, 0.4);
	assert.equal(drawImageArgs?.[1], -50);
	assert.equal(drawImageArgs?.[2], -25);
	assert.equal(rendered.opacity, 1);
	assert.deepEqual(rendered.bounds, {
		left: 150,
		top: 75,
		right: 250,
		bottom: 125,
	});
}

{
	const documentState = createDefaultReferenceImageDocument();
	const sharedBlob = new Blob([new Uint8Array([1])], { type: "image/png" });
	const uniqueBlob = new Blob([new Uint8Array([2])], { type: "image/png" });
	const sharedAsset = createReferenceImageAsset({
		id: "asset-shared",
		label: "Shared",
		source: { file: sharedBlob },
		sourceMeta: {
			filename: "shared.png",
			mime: "image/png",
			originalSize: { w: 200, h: 100 },
			appliedSize: { w: 200, h: 100 },
			pixelRatio: 1,
			usedOriginal: true,
		},
	});
	const uniqueAsset = createReferenceImageAsset({
		id: "asset-unique",
		label: "Unique",
		source: { file: uniqueBlob },
		sourceMeta: {
			filename: "unique.png",
			mime: "image/png",
			originalSize: { w: 80, h: 40 },
			appliedSize: { w: 80, h: 40 },
			pixelRatio: 1,
			usedOriginal: true,
		},
	});
	const preset = createReferenceImagePreset({
		id: "preset-test",
		name: "Test",
		baseRenderBox: { w: 1000, h: 500 },
		items: [
			createReferenceImageItem({
				id: "front-a",
				assetId: sharedAsset.id,
				name: "Front A",
				group: REFERENCE_IMAGE_GROUP_FRONT,
				order: 0,
				offsetPx: { x: 10, y: 20 },
				opacity: 0.3,
			}),
			createReferenceImageItem({
				id: "back-a",
				assetId: uniqueAsset.id,
				name: "Back A",
				group: REFERENCE_IMAGE_GROUP_BACK,
				order: 1,
				scalePct: 150,
				opacity: 0.6,
			}),
			createReferenceImageItem({
				id: "front-b",
				assetId: sharedAsset.id,
				name: "Front B",
				group: REFERENCE_IMAGE_GROUP_FRONT,
				order: 2,
				opacity: 0.8,
			}),
		],
	});
	documentState.assets.push(sharedAsset, uniqueAsset);
	documentState.presets.push(preset);
	documentState.activePresetId = preset.id;

	const shotCameraDocument = createShotCameraDocument({
		name: "Camera Export",
	});
	shotCameraDocument.outputFrame.anchor = "center";
	shotCameraDocument.referenceImages.presetId = preset.id;
	let loadCount = 0;
	let cleanupCount = 0;
	const renderCalls = [];

	const layers = await renderReferenceImageLayersForShotCamera({
		referenceImageDocument: documentState,
		exportSessionEnabled: true,
		documentState: shotCameraDocument,
		width: 1000,
		height: 500,
		applyOpacity: false,
		loadDrawable: async (blob) => {
			loadCount += 1;
			return {
				drawable: { id: blob === sharedBlob ? "shared" : "unique" },
				cleanup: () => {
					cleanupCount += 1;
				},
			};
		},
		renderLayerCanvas: (options) => {
			renderCalls.push(options);
			return {
				canvas: { id: options.drawable.id },
				opacity: options.applyOpacity ? 1 : options.opacity,
				bounds: {
					left: 1,
					top: 2,
					right: 3,
					bottom: 4,
				},
			};
		},
	});

	assert.equal(loadCount, 2);
	assert.equal(cleanupCount, 2);
	assert.deepEqual(
		layers.map((layer) => layer.id),
		["back-a", "front-a", "front-b"],
	);
	assert.deepEqual(
		layers.map((layer) => layer.group),
		[
			REFERENCE_IMAGE_GROUP_BACK,
			REFERENCE_IMAGE_GROUP_FRONT,
			REFERENCE_IMAGE_GROUP_FRONT,
		],
	);
	assert.deepEqual(
		layers.map((layer) => layer.opacity),
		[0.6, 0.3, 0.8],
	);
	assert.equal(renderCalls.length, 3);
	assert.deepEqual(renderCalls[1].anchorPoint, { x: 490, y: 230 });
	assert.equal(renderCalls[1].width, 200);
	assert.equal(renderCalls[1].height, 100);
	assert.equal(renderCalls[1].applyOpacity, false);
}

{
	let loadCount = 0;
	const layers = await renderReferenceImageLayersForShotCamera({
		referenceImageDocument: createDefaultReferenceImageDocument(),
		exportSessionEnabled: false,
		documentState: createShotCameraDocument(),
		width: 100,
		height: 100,
		loadDrawable: async () => {
			loadCount += 1;
			return { drawable: null, cleanup() {} };
		},
	});

	assert.deepEqual(layers, []);
	assert.equal(loadCount, 0);
}

console.log("✅ CAMERA_FRAMES export reference images tests passed!");
