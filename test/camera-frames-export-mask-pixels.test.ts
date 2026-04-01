import assert from "node:assert/strict";
import {
	buildLayerMaskPixels,
	buildSplatLayerMaskPixels,
	createAlphaPreviewPixels,
	extractAlphaChannel,
	fillSplatMaskDarkSpeckles,
} from "../src/controllers/export/mask-pixels.js";

{
	const pixels = new Uint8Array([10, 20, 30, 40, 1, 2, 3, 0]);
	assert.deepEqual(
		Array.from(createAlphaPreviewPixels(pixels)),
		[40, 40, 40, 40, 0, 0, 0, 0],
	);
	assert.deepEqual(Array.from(extractAlphaChannel(pixels)), [40, 0]);
}

{
	const sourcePixels = new Uint8Array([255, 0, 0, 255, 255, 0, 0, 128]);
	const modelVisibilityPixels = new Uint8Array([
		255, 255, 255, 255, 0, 0, 0, 255,
	]);
	const splatOccluderPixels = new Uint8Array([0, 0, 0, 128, 0, 0, 0, 0]);

	assert.deepEqual(
		Array.from(
			buildLayerMaskPixels(
				sourcePixels,
				modelVisibilityPixels,
				splatOccluderPixels,
			),
		),
		[127, 127, 127, 127, 0, 0, 0, 0],
	);
}

{
	const sourcePixels = new Uint8Array([255, 255, 255, 128]);
	const modelVisibilityPixels = new Uint8Array([255, 255, 255, 128]);

	assert.deepEqual(
		Array.from(buildLayerMaskPixels(sourcePixels, modelVisibilityPixels, null)),
		[128, 128, 128, 128],
	);
}

{
	const pixels = new Uint8ClampedArray(9 * 4).fill(255);
	const sourceAlpha = new Uint8ClampedArray(9).fill(255);
	const centerOffset = (1 * 3 + 1) * 4;
	pixels[centerOffset + 0] = 0;
	pixels[centerOffset + 1] = 0;
	pixels[centerOffset + 2] = 0;
	pixels[centerOffset + 3] = 0;

	assert.equal(
		fillSplatMaskDarkSpeckles(pixels, 3, 3, sourceAlpha)[centerOffset + 3],
		255,
	);
}

{
	const sourcePixels = new Uint8Array([255, 255, 255, 255]);
	const compositePixels = new Uint8Array([255, 255, 255, 255]);
	const lowerPixels = new Uint8Array([0, 0, 0, 0]);

	assert.deepEqual(
		Array.from(
			buildSplatLayerMaskPixels(
				sourcePixels,
				compositePixels,
				lowerPixels,
				1,
				1,
			),
		),
		[255, 255, 255, 255],
	);
}

{
	const sourcePixels = new Uint8Array([255, 255, 255, 255]);
	const compositePixels = new Uint8Array([0, 0, 0, 0]);
	const lowerPixels = new Uint8Array([0, 0, 0, 0]);

	assert.deepEqual(
		Array.from(
			buildSplatLayerMaskPixels(
				sourcePixels,
				compositePixels,
				lowerPixels,
				1,
				1,
			),
		),
		[0, 0, 0, 0],
	);
}

console.log("✅ CAMERA_FRAMES export mask pixel tests passed!");
