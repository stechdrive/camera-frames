import assert from "node:assert/strict";
import { createAllFrameMaskPsdLayerDocument } from "../src/engine/frame-mask-export.js";
import { getPsdReferenceImageGroupLayers } from "../src/engine/reference-image-export-order.js";
import {
	REFERENCE_IMAGE_GROUP_BACK,
	REFERENCE_IMAGE_GROUP_FRONT,
	getReferenceImageDisplayItems,
} from "../src/reference-image-model.js";

{
	const layers = [
		{
			id: "bottom",
			group: REFERENCE_IMAGE_GROUP_FRONT,
			order: 0,
		},
		{
			id: "middle",
			group: REFERENCE_IMAGE_GROUP_FRONT,
			order: 1,
		},
		{
			id: "top",
			group: REFERENCE_IMAGE_GROUP_FRONT,
			order: 2,
		},
		{
			id: "back-only",
			group: REFERENCE_IMAGE_GROUP_BACK,
			order: 0,
		},
	];

	const frontLayers = getPsdReferenceImageGroupLayers(
		layers,
		REFERENCE_IMAGE_GROUP_FRONT,
	);
	const frontDisplayLayers = getReferenceImageDisplayItems(
		layers,
		REFERENCE_IMAGE_GROUP_FRONT,
	);

	assert.deepEqual(
		frontLayers.map((layer) => layer.id),
		["bottom", "middle", "top"],
	);
	assert.deepEqual(
		frontDisplayLayers.map((layer) => layer.id),
		["top", "middle", "bottom"],
	);
	assert.equal(frontLayers[0].id, frontDisplayLayers.at(-1)?.id);

	const backLayers = getPsdReferenceImageGroupLayers(
		layers,
		REFERENCE_IMAGE_GROUP_BACK,
	);
	assert.deepEqual(
		backLayers.map((layer) => layer.id),
		["back-only"],
	);
}

{
	let fillRectCount = 0;
	let fillCount = 0;
	let beginPathCount = 0;
	const mockContext = {
		save() {},
		restore() {},
		translate() {},
		rotate() {},
		rect() {},
		moveTo() {},
		lineTo() {},
		closePath() {},
		clearRect() {},
		fillRect() {
			fillRectCount += 1;
		},
		beginPath() {
			beginPathCount += 1;
		},
		fill() {
			fillCount += 1;
		},
		set fillStyle(_value) {},
		set globalCompositeOperation(_value) {},
	};
	const mockCanvas = {
		width: 0,
		height: 0,
		getContext(kind) {
			return kind === "2d" ? mockContext : null;
		},
	};
	const layer = createAllFrameMaskPsdLayerDocument(
		[
			{
				id: "frame-a",
				x: 0.5,
				y: 0.5,
				scale: 1,
				rotation: 0,
			},
		],
		1536,
		864,
		{
			createCanvas(width, height) {
				mockCanvas.width = width;
				mockCanvas.height = height;
				return mockCanvas;
			},
		},
	);

	assert.ok(layer);
	assert.equal(layer.name, "Mask");
	assert.equal(layer.hidden, true);
	assert.equal(layer.opacity, 0.8);
	assert.equal(layer.canvas, mockCanvas);
	assert.equal(layer.canvas.width, 1536);
	assert.equal(layer.canvas.height, 864);
	assert.equal(fillRectCount, 1);
	assert.equal(beginPathCount, 1);
	assert.equal(fillCount, 1);
}

console.log("✅ CAMERA_FRAMES export controller tests passed!");
