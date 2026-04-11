import assert from "node:assert/strict";
import { initializeCanvas, readPsd, writePsd } from "ag-psd";
import {
	buildCompositeLayersForRender,
	buildPsdChildrenForWrite,
} from "../src/engine/psd-export.js";

initializeCanvas(
	(width, height) => ({
		width,
		height,
		getContext() {
			return {
				createImageData(nextWidth, nextHeight) {
					return {
						width: nextWidth,
						height: nextHeight,
						data: new Uint8ClampedArray(nextWidth * nextHeight * 4),
					};
				},
			};
		},
	}),
	(width, height) => ({
		width,
		height,
		data: new Uint8ClampedArray(width * height * 4),
	}),
);

{
	const layers = [
		{
			name: "Bottom",
		},
		{
			name: "Group",
			children: [
				{ name: "Group Bottom" },
				{ name: "Group Top" },
			],
		},
		{
			name: "Top",
		},
	];

	const psdChildren = buildPsdChildrenForWrite(layers);
	assert.deepEqual(psdChildren.map((layer) => layer.name), [
		"Bottom",
		"Group",
		"Top",
	]);
	assert.deepEqual(
		psdChildren[1].children.map((layer) => layer.name),
		["Group Bottom", "Group Top"],
	);
}

{
	const layers = [
		{
			name: "Bottom",
		},
		{
			name: "Group",
			children: [
				{ name: "Group Bottom" },
				{ name: "Group Top" },
			],
		},
		{
			name: "Top",
		},
	];

	const compositeLayers = buildCompositeLayersForRender(layers);
	assert.deepEqual(compositeLayers.map((layer) => layer.name), [
		"Bottom",
		"Group",
		"Top",
	]);
	assert.deepEqual(
		compositeLayers[1].children.map((layer) => layer.name),
		["Group Bottom", "Group Top"],
	);
}

{
	const pixel = (r, g, b, a = 255) => ({
		width: 1,
		height: 1,
		data: new Uint8ClampedArray([r, g, b, a]),
	});
	const psdBuffer = writePsd(
		{
			width: 1,
			height: 1,
			children: buildPsdChildrenForWrite([
				{
					name: "Bottom",
					imageData: pixel(255, 0, 0),
				},
				{
					name: "Masked Middle",
					imageData: pixel(0, 255, 0),
					mask: {
						imageData: pixel(0, 0, 0, 128),
						left: 0,
						top: 0,
					},
				},
				{
					name: "Top",
					imageData: pixel(0, 0, 255),
				},
				{
					name: "Group",
					children: [
						{
							name: "Group Bottom",
							imageData: pixel(10, 10, 10),
						},
						{
							name: "Group Top",
							imageData: pixel(20, 20, 20),
						},
					],
				},
			]),
		},
		{ compress: false },
	);
	const psd = readPsd(psdBuffer, {
		useImageData: true,
		skipCompositeImageData: true,
	});

	assert.deepEqual(
		psd.children.map((layer) => layer.name),
		["Bottom", "Masked Middle", "Top", "Group"],
	);
	assert.deepEqual(
		psd.children[3].children.map((layer) => layer.name),
		["Group Bottom", "Group Top"],
	);
	assert.equal(Boolean(psd.children[1].mask?.imageData), true);
}

console.log("✅ CAMERA_FRAMES psd export tests passed!");
