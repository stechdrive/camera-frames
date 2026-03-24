const DEFAULT_BLEND_MODE = "source-over";
const DEFAULT_RENDER_LAYER_NAME = "Render";

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
	basePixels,
	sceneAssets,
	layers = [],
}) {
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;

	const context = canvas.getContext("2d");
	if (!context) {
		throw new Error("Failed to acquire the 2D context for export bundle.");
	}

	for (const layer of getExportBundleLayers({
		width,
		height,
		basePixels,
		sceneAssets,
		layers,
	})) {
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
