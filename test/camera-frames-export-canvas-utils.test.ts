import assert from "node:assert/strict";
import {
	createCanvasFromPixels,
	createSolidColorCanvas,
} from "../src/controllers/export/canvas-utils.js";

const originalImageData = globalThis.ImageData;

class MockImageData {
	data: Uint8ClampedArray;
	width: number;
	height: number;

	constructor(data: Uint8ClampedArray, width: number, height: number) {
		this.data = data;
		this.width = width;
		this.height = height;
	}
}

globalThis.ImageData = MockImageData as typeof ImageData;

try {
	let capturedImageData = null;
	const pixelsCanvas = {
		width: 0,
		height: 0,
		getContext(kind: string) {
			if (kind !== "2d") {
				return null;
			}
			return {
				putImageData(imageData: MockImageData, x: number, y: number) {
					capturedImageData = { imageData, x, y };
				},
			};
		},
	};
	const pixelsResult = createCanvasFromPixels(
		new Uint8Array([1, 2, 3, 4]),
		1,
		1,
		{
			createCanvas: () => pixelsCanvas as HTMLCanvasElement,
		},
	);

	assert.equal(pixelsResult, pixelsCanvas);
	assert.equal(pixelsCanvas.width, 1);
	assert.equal(pixelsCanvas.height, 1);
	assert.deepEqual(Array.from(capturedImageData.imageData.data), [1, 2, 3, 4]);
	assert.equal(capturedImageData.imageData.width, 1);
	assert.equal(capturedImageData.imageData.height, 1);
	assert.equal(capturedImageData.x, 0);
	assert.equal(capturedImageData.y, 0);

	let fillStyleValue = "";
	let fillRectState = null;
	const solidCanvas = {
		width: 0,
		height: 0,
		getContext(kind: string) {
			if (kind !== "2d") {
				return null;
			}
			return {
				set fillStyle(value: string) {
					fillStyleValue = value;
				},
				fillRect(x: number, y: number, width: number, height: number) {
					fillRectState = { x, y, width, height };
				},
			};
		},
	};
	const solidResult = createSolidColorCanvas(320, 180, "#08111d", {
		createCanvas: () => solidCanvas as HTMLCanvasElement,
	});

	assert.equal(solidResult, solidCanvas);
	assert.equal(solidCanvas.width, 320);
	assert.equal(solidCanvas.height, 180);
	assert.equal(fillStyleValue, "#08111d");
	assert.deepEqual(fillRectState, {
		x: 0,
		y: 0,
		width: 320,
		height: 180,
	});
} finally {
	globalThis.ImageData = originalImageData;
}

console.log("✅ CAMERA_FRAMES export canvas utils tests passed!");
