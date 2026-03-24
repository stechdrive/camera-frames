import assert from "node:assert/strict";
import {
	createPixelLayer,
	createRasterLayer,
	getExportBundleLayers,
} from "../src/engine/export-bundle.js";

const renderPixels = new Uint8Array([10, 20, 30, 255]);
const overlayCanvas = {
	width: 1,
	height: 1,
};

{
	const layers = getExportBundleLayers({
		width: 1,
		height: 1,
		basePixels: renderPixels,
		sceneAssets: [{ id: 1, kind: "splat", label: "Main" }],
		layers: [
			createRasterLayer({
				name: "FRAME",
				canvas: overlayCanvas,
				category: "frame",
			}),
		],
	});

	assert.equal(layers.length, 2);
	assert.equal(layers[0].type, "pixels");
	assert.equal(layers[0].name, "Render");
	assert.equal(layers[0].pixels, renderPixels);
	assert.deepEqual(layers[0].metadata, {
		sceneAssets: [{ id: 1, kind: "splat", label: "Main" }],
	});
	assert.equal(layers[1].type, "canvas");
	assert.equal(layers[1].name, "FRAME");
}

{
	const layer = createPixelLayer({
		name: "Scene",
		pixels: renderPixels,
		width: 2,
		height: 3,
		category: "render",
		metadata: { pass: "scene" },
	});
	assert.equal(layer.type, "pixels");
	assert.equal(layer.width, 2);
	assert.equal(layer.height, 3);
	assert.deepEqual(layer.metadata, { pass: "scene" });
}

console.log("✅ CAMERA_FRAMES export bundle tests passed!");
