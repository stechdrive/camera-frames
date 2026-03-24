const DEFAULT_BLEND_MODE = "source-over";

export function createRasterLayer({
	name,
	canvas,
	opacity = 1,
	blendMode = DEFAULT_BLEND_MODE,
	left = 0,
	top = 0,
	category = "overlay",
}) {
	return {
		name,
		canvas,
		opacity,
		blendMode,
		left,
		top,
		category,
	};
}

export function renderExportBundleToCanvas({
	width,
	height,
	basePixels,
	layers = [],
}) {
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;

	const context = canvas.getContext("2d");
	if (!context) {
		throw new Error("Failed to acquire the 2D context for export bundle.");
	}

	if (basePixels) {
		const imageData = context.createImageData(width, height);
		imageData.data.set(basePixels);
		context.putImageData(imageData, 0, 0);
	}

	for (const layer of layers) {
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
