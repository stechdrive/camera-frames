import assert from "node:assert/strict";
import {
	createExportBundle,
	createExportBundleManifest,
	createExportPass,
	createPixelLayer,
	createRasterLayer,
	flattenExportBundleLayers,
	getExportBundleLayers,
	getExportBundlePasses,
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

{
	const bundle = createExportBundle({
		width: 1,
		height: 1,
		sceneAssets: [{ id: 1, kind: "splat", label: "Main" }],
		readiness: { warmupPassesPlanned: 2 },
		passes: [
			createExportPass({
				id: "beauty",
				name: "Beauty",
				category: "render",
				layers: [
					createPixelLayer({
						name: "Render",
						pixels: renderPixels,
						width: 1,
						height: 1,
						category: "render",
					}),
				],
			}),
			createExportPass({
				id: "frame-overlay",
				name: "Frame Overlay",
				category: "overlay",
				layers: [
					createRasterLayer({
						name: "FRAME",
						canvas: overlayCanvas,
						category: "frame",
					}),
				],
			}),
		],
	});

	const passes = getExportBundlePasses(bundle);
	assert.equal(passes.length, 2);
	assert.equal(passes[0].id, "beauty");
	assert.equal(passes[1].id, "frame-overlay");

	const flattened = flattenExportBundleLayers(bundle);
	assert.equal(flattened.length, 2);
	assert.equal(flattened[0].name, "Render");
	assert.equal(flattened[1].name, "FRAME");

	const manifest = createExportBundleManifest(bundle);
	assert.equal(manifest.width, 1);
	assert.equal(manifest.height, 1);
	assert.equal(manifest.passes.length, 2);
	assert.deepEqual(manifest.passes[0], {
		id: "beauty",
		name: "Beauty",
		category: "render",
		enabled: true,
		metadata: null,
		layers: [
			{
				type: "pixels",
				name: "Render",
				category: "render",
				opacity: 1,
				blendMode: "source-over",
				left: 0,
				top: 0,
				width: 1,
				height: 1,
				metadata: null,
			},
		],
	});
}

console.log("✅ CAMERA_FRAMES export bundle tests passed!");
