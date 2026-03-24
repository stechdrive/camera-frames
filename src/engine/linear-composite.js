const SOURCE_OVER = "source-over";

const SRGB_TO_LINEAR = new Float32Array(256);
for (let index = 0; index < 256; index += 1) {
	const value = index / 255;
	SRGB_TO_LINEAR[index] =
		value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function linearToSrgbByte(value) {
	const clamped = Math.max(0, Math.min(1, value));
	const srgb =
		clamped <= 0.0031308
			? clamped * 12.92
			: 1.055 * clamped ** (1 / 2.4) - 0.055;
	return Math.max(0, Math.min(255, Math.round(srgb * 255)));
}

function createCanvas(width, height) {
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	return canvas;
}

function getCanvasPixels(canvas, canvasPixelsCache) {
	if (!canvas) {
		return null;
	}
	if (canvasPixelsCache.has(canvas)) {
		return canvasPixelsCache.get(canvas);
	}
	const context = canvas.getContext("2d");
	if (!context) {
		throw new Error("Failed to acquire the 2D context for raster compositing.");
	}
	const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
	canvasPixelsCache.set(canvas, pixels);
	return pixels;
}

function createLayerSource(layer, canvasPixelsCache) {
	if (Array.isArray(layer?.children) && layer.children.length > 0) {
		return null;
	}
	if (layer?.type === "pixels" && layer?.pixels) {
		return {
			pixels: layer.pixels,
			width: Math.max(1, Number(layer.width) || 1),
			height: Math.max(1, Number(layer.height) || 1),
		};
	}
	if (!layer?.canvas) {
		return null;
	}
	return {
		pixels: getCanvasPixels(layer.canvas, canvasPixelsCache),
		width: layer.canvas.width,
		height: layer.canvas.height,
	};
}

function blendSourceIntoBuffer({
	buffer,
	bundleWidth,
	bundleHeight,
	source,
	left = 0,
	top = 0,
	opacity = 1,
	mask = null,
	canvasPixelsCache,
}) {
	if (!source?.pixels) {
		return;
	}

	const sourceWidth = source.width;
	const sourceHeight = source.height;
	const sourcePixels = source.pixels;
	const maskSource = mask?.canvas
		? {
				pixels: getCanvasPixels(mask.canvas, canvasPixelsCache),
				width: mask.canvas.width,
				height: mask.canvas.height,
				left: mask.left ?? 0,
				top: mask.top ?? 0,
			}
		: null;
	const maxOpacity = Math.max(0, Math.min(1, opacity));
	if (maxOpacity <= 0) {
		return;
	}

	const startX = Math.max(0, left);
	const startY = Math.max(0, top);
	const endX = Math.min(bundleWidth, left + sourceWidth);
	const endY = Math.min(bundleHeight, top + sourceHeight);
	if (startX >= endX || startY >= endY) {
		return;
	}

	for (let y = startY; y < endY; y += 1) {
		const sourceY = y - top;
		for (let x = startX; x < endX; x += 1) {
			const sourceX = x - left;
			const sourceIndex = (sourceY * sourceWidth + sourceX) * 4;
			let sourceAlpha = (sourcePixels[sourceIndex + 3] / 255) * maxOpacity;
			if (sourceAlpha <= 0) {
				continue;
			}

			if (maskSource) {
				const maskX = x - maskSource.left;
				const maskY = y - maskSource.top;
				if (
					maskX < 0 ||
					maskY < 0 ||
					maskX >= maskSource.width ||
					maskY >= maskSource.height
				) {
					sourceAlpha = 0;
				} else {
					const maskIndex = (maskY * maskSource.width + maskX) * 4 + 3;
					sourceAlpha *= maskSource.pixels[maskIndex] / 255;
				}
				if (sourceAlpha <= 0) {
					continue;
				}
			}

			const destinationIndex = (y * bundleWidth + x) * 4;
			const destinationAlpha = buffer[destinationIndex + 3];
			const keepAlpha = 1 - sourceAlpha;
			buffer[destinationIndex + 0] =
				SRGB_TO_LINEAR[sourcePixels[sourceIndex + 0]] * sourceAlpha +
				buffer[destinationIndex + 0] * keepAlpha;
			buffer[destinationIndex + 1] =
				SRGB_TO_LINEAR[sourcePixels[sourceIndex + 1]] * sourceAlpha +
				buffer[destinationIndex + 1] * keepAlpha;
			buffer[destinationIndex + 2] =
				SRGB_TO_LINEAR[sourcePixels[sourceIndex + 2]] * sourceAlpha +
				buffer[destinationIndex + 2] * keepAlpha;
			buffer[destinationIndex + 3] = sourceAlpha + destinationAlpha * keepAlpha;
		}
	}
}

function renderLayerListToBuffer({
	width,
	height,
	layers,
	buffer,
	canvasPixelsCache,
}) {
	for (const layer of layers) {
		if (!layer || layer.hidden) {
			continue;
		}

		const layerOpacity = Math.max(
			0,
			Math.min(1, Number.isFinite(layer.opacity) ? layer.opacity : 1),
		);
		if (layerOpacity <= 0) {
			continue;
		}

		if ((layer.blendMode ?? SOURCE_OVER) !== SOURCE_OVER) {
			throw new Error(`Unsupported blend mode: ${layer.blendMode}`);
		}

		if (Array.isArray(layer.children) && layer.children.length > 0) {
			const groupBuffer = new Float32Array(width * height * 4);
			renderLayerListToBuffer({
				width,
				height,
				layers: layer.children,
				buffer: groupBuffer,
				canvasPixelsCache,
			});
			const groupPixels = convertBufferToPixels(groupBuffer, width, height);
			blendSourceIntoBuffer({
				buffer,
				bundleWidth: width,
				bundleHeight: height,
				source: {
					pixels: groupPixels,
					width,
					height,
				},
				opacity: layerOpacity,
				mask: layer.mask ?? null,
				canvasPixelsCache,
			});
			continue;
		}

		const source = createLayerSource(layer, canvasPixelsCache);
		blendSourceIntoBuffer({
			buffer,
			bundleWidth: width,
			bundleHeight: height,
			source,
			left: layer.left ?? 0,
			top: layer.top ?? 0,
			opacity: layerOpacity,
			mask: layer.mask ?? null,
			canvasPixelsCache,
		});
	}
}

export function convertBufferToPixels(buffer, width, height) {
	const pixels = new Uint8ClampedArray(width * height * 4);
	for (let index = 0; index < pixels.length; index += 4) {
		const alpha = Math.max(0, Math.min(1, buffer[index + 3]));
		pixels[index + 3] = Math.round(alpha * 255);
		if (alpha <= 0) {
			pixels[index + 0] = 0;
			pixels[index + 1] = 0;
			pixels[index + 2] = 0;
			continue;
		}
		pixels[index + 0] = linearToSrgbByte(buffer[index + 0] / alpha);
		pixels[index + 1] = linearToSrgbByte(buffer[index + 1] / alpha);
		pixels[index + 2] = linearToSrgbByte(buffer[index + 2] / alpha);
	}
	return pixels;
}

export function renderLayersToCanvas({ width, height, layers = [] }) {
	const buffer = new Float32Array(width * height * 4);
	const canvasPixelsCache = new WeakMap();
	renderLayerListToBuffer({
		width,
		height,
		layers,
		buffer,
		canvasPixelsCache,
	});
	const canvas = createCanvas(width, height);
	const context = canvas.getContext("2d");
	if (!context) {
		throw new Error("Failed to acquire the 2D context for raster compositing.");
	}
	const imageData = context.createImageData(width, height);
	imageData.data.set(convertBufferToPixels(buffer, width, height));
	context.putImageData(imageData, 0, 0);
	return canvas;
}
