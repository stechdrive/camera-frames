const DEFAULT_BLEND_MODE = "source-over";
const DEFAULT_RENDER_LAYER_NAME = "Render";
const DEFAULT_RENDER_PASS_NAME = "Beauty";

export function createPixelLayer({
	name = DEFAULT_RENDER_LAYER_NAME,
	pixels,
	width,
	height,
	opacity = 1,
	blendMode = DEFAULT_BLEND_MODE,
	left = 0,
	top = 0,
	category = "render",
	metadata = null,
}) {
	return {
		type: "pixels",
		name,
		pixels,
		width,
		height,
		opacity,
		blendMode,
		left,
		top,
		category,
		metadata,
	};
}

export function createRasterLayer({
	name,
	canvas,
	opacity = 1,
	blendMode = DEFAULT_BLEND_MODE,
	left = 0,
	top = 0,
	category = "overlay",
	metadata = null,
}) {
	return {
		type: "canvas",
		name,
		canvas,
		opacity,
		blendMode,
		left,
		top,
		category,
		metadata,
	};
}

export function createExportPass({
	id,
	name = DEFAULT_RENDER_PASS_NAME,
	category = "render",
	layers = [],
	metadata = null,
	enabled = true,
}) {
	return {
		id,
		name,
		category,
		layers: layers.filter(Boolean),
		metadata,
		enabled,
	};
}

export function createExportBundle({
	width,
	height,
	sceneAssets = [],
	readiness = null,
	passes = [],
	basePixels = null,
	layers = [],
}) {
	if (passes.length > 0) {
		return {
			width,
			height,
			sceneAssets,
			readiness,
			passes: passes.filter(Boolean),
		};
	}

	return {
		width,
		height,
		sceneAssets,
		readiness,
		passes: [
			createExportPass({
				id: "beauty",
				name: DEFAULT_RENDER_PASS_NAME,
				category: "render",
				metadata: {
					sceneAssets,
					readiness,
					role: "beauty",
				},
				layers: getExportBundleLayers({
					width,
					height,
					basePixels,
					sceneAssets,
					layers,
				}),
			}),
		],
	};
}

export function getExportBundlePasses(bundle = {}) {
	if (Array.isArray(bundle.passes) && bundle.passes.length > 0) {
		return bundle.passes.filter((pass) => pass?.enabled !== false);
	}

	return createExportBundle(bundle).passes;
}

export function getExportBundleLayers({
	width,
	height,
	basePixels = null,
	sceneAssets = [],
	layers = [],
}) {
	const resolvedLayers = [];
	if (basePixels) {
		resolvedLayers.push(
			createPixelLayer({
				name: DEFAULT_RENDER_LAYER_NAME,
				pixels: basePixels,
				width,
				height,
				category: "render",
				metadata: {
					sceneAssets,
				},
			}),
		);
	}

	for (const layer of layers) {
		if (layer) {
			resolvedLayers.push(layer);
		}
	}

	return resolvedLayers;
}

export function flattenExportBundleLayers(bundle = {}) {
	return getExportBundlePasses(bundle).flatMap((pass) =>
		Array.isArray(pass.layers) ? pass.layers.filter(Boolean) : [],
	);
}

function drawPixelLayer(context, layer, bundleWidth, bundleHeight) {
	if (!layer?.pixels) {
		return;
	}

	const layerWidth = Math.max(1, Number(layer.width) || bundleWidth);
	const layerHeight = Math.max(1, Number(layer.height) || bundleHeight);
	const previousAlpha = context.globalAlpha;
	const previousBlendMode = context.globalCompositeOperation;
	context.globalAlpha = Number.isFinite(layer.opacity) ? layer.opacity : 1;
	context.globalCompositeOperation = layer.blendMode ?? DEFAULT_BLEND_MODE;

	if (
		layer.left === 0 &&
		layer.top === 0 &&
		layerWidth === bundleWidth &&
		layerHeight === bundleHeight &&
		context.globalAlpha === 1 &&
		context.globalCompositeOperation === DEFAULT_BLEND_MODE
	) {
		const imageData = context.createImageData(layerWidth, layerHeight);
		imageData.data.set(layer.pixels);
		context.putImageData(imageData, 0, 0);
	} else {
		const layerCanvas = document.createElement("canvas");
		layerCanvas.width = layerWidth;
		layerCanvas.height = layerHeight;
		const layerContext = layerCanvas.getContext("2d");
		if (!layerContext) {
			throw new Error("Failed to acquire the 2D context for pixel layer.");
		}

		const imageData = layerContext.createImageData(layerWidth, layerHeight);
		imageData.data.set(layer.pixels);
		layerContext.putImageData(imageData, 0, 0);
		context.drawImage(layerCanvas, layer.left ?? 0, layer.top ?? 0);
	}

	context.globalAlpha = previousAlpha;
	context.globalCompositeOperation = previousBlendMode;
}

export function renderExportBundleToCanvas({
	width,
	height,
	basePixels = null,
	sceneAssets = [],
	layers = [],
	passes = [],
}) {
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;

	const context = canvas.getContext("2d");
	if (!context) {
		throw new Error("Failed to acquire the 2D context for export bundle.");
	}

	for (const layer of flattenExportBundleLayers(
		createExportBundle({
			width,
			height,
			sceneAssets,
			passes,
			basePixels,
			layers,
		}),
	)) {
		if (layer.type === "pixels") {
			drawPixelLayer(context, layer, width, height);
			continue;
		}

		if (!layer?.canvas) {
			continue;
		}

		const previousAlpha = context.globalAlpha;
		const previousBlendMode = context.globalCompositeOperation;
		context.globalAlpha = Number.isFinite(layer.opacity) ? layer.opacity : 1;
		context.globalCompositeOperation = layer.blendMode ?? DEFAULT_BLEND_MODE;
		context.drawImage(layer.canvas, layer.left ?? 0, layer.top ?? 0);
		context.globalAlpha = previousAlpha;
		context.globalCompositeOperation = previousBlendMode;
	}

	return canvas;
}
