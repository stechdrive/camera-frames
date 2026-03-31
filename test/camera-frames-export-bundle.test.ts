import assert from "node:assert/strict";
import { createPixelLayer } from "../src/engine/export-bundle.js";

{
	const pixels = new Uint8Array([255, 0, 0, 255]);
	const layer = createPixelLayer({
		name: "Render",
		pixels,
		width: 1,
		height: 1,
	});

	assert.equal(layer.pixels, pixels);
	assert.equal(layer.width, 1);
	assert.equal(layer.height, 1);
}

assert.throws(
	() =>
		createPixelLayer({
			name: "Broken",
			pixels: Promise.resolve(new Uint8Array([0, 0, 0, 0])),
			width: 1,
			height: 1,
		}),
	/typeerror/i,
);

console.log("✅ CAMERA_FRAMES export bundle tests passed!");
