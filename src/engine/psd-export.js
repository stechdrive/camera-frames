import { writePsd } from "ag-psd";
import { renderLayersToCanvas } from "./linear-composite.js";

const PSD_RESOLUTION_PPI = 150;

function clampOpacity(opacity) {
	return Math.max(0, Math.min(1, Number.isFinite(opacity) ? opacity : 1));
}

function createCanvas(width, height) {
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	return canvas;
}

function createThumbnailCanvas(compositeCanvas) {
	const maxThumbnailSize = 256;
	const scale = Math.min(
		1,
		maxThumbnailSize /
			Math.max(compositeCanvas.width, compositeCanvas.height, 1),
	);
	const width = Math.max(1, Math.round(compositeCanvas.width * scale));
	const height = Math.max(1, Math.round(compositeCanvas.height * scale));
	const canvas = createCanvas(width, height);
	const context = canvas.getContext("2d");
	if (!context) {
		throw new Error("Failed to acquire the 2D context for PSD thumbnail.");
	}

	context.drawImage(compositeCanvas, 0, 0, width, height);
	return canvas;
}

function drawLayerToContext(context, width, height, layer) {
	if (!layer || layer.hidden) {
		return;
	}

	const opacity = clampOpacity(layer.opacity);
	if (opacity <= 0) {
		return;
	}

	if (Array.isArray(layer.children) && layer.children.length > 0) {
		const groupCanvas = createCanvas(width, height);
		const groupContext = groupCanvas.getContext("2d");
		if (!groupContext) {
			throw new Error("Failed to acquire the 2D context for PSD group.");
		}

		for (const child of layer.children) {
			drawLayerToContext(groupContext, width, height, child);
		}

		const previousAlpha = context.globalAlpha;
		const previousBlendMode = context.globalCompositeOperation;
		context.globalAlpha = opacity;
		context.globalCompositeOperation = layer.blendMode ?? "source-over";
		context.drawImage(groupCanvas, 0, 0);
		context.globalAlpha = previousAlpha;
		context.globalCompositeOperation = previousBlendMode;
		return;
	}

	if (!layer.canvas) {
		return;
	}

	const left = layer.left ?? 0;
	const top = layer.top ?? 0;
	const previousAlpha = context.globalAlpha;
	const previousBlendMode = context.globalCompositeOperation;
	if (layer.mask?.canvas && layer.mask.disabled !== true) {
		const maskedCanvas = createCanvas(width, height);
		const maskedContext = maskedCanvas.getContext("2d");
		if (!maskedContext) {
			throw new Error("Failed to acquire the 2D context for PSD masked layer.");
		}

		maskedContext.drawImage(layer.canvas, left, top);
		maskedContext.globalCompositeOperation = "destination-in";
		maskedContext.drawImage(
			layer.mask.canvas,
			layer.mask.left ?? 0,
			layer.mask.top ?? 0,
		);
		maskedContext.globalCompositeOperation = "source-over";

		context.globalAlpha = opacity;
		context.globalCompositeOperation = layer.blendMode ?? "source-over";
		context.drawImage(maskedCanvas, 0, 0);
		context.globalAlpha = previousAlpha;
		context.globalCompositeOperation = previousBlendMode;
		return;
	}

	context.globalAlpha = opacity;
	context.globalCompositeOperation = layer.blendMode ?? "source-over";
	context.drawImage(layer.canvas, left, top);
	context.globalAlpha = previousAlpha;
	context.globalCompositeOperation = previousBlendMode;
}

function toPsdLayer(layer) {
	return {
		name: layer.name,
		...(layer.canvas ? { canvas: layer.canvas } : {}),
		...(layer.imageData ? { imageData: layer.imageData } : {}),
		...(typeof layer.hidden === "boolean" ? { hidden: layer.hidden } : {}),
		...(typeof layer.opened === "boolean" ? { opened: layer.opened } : {}),
		...(layer.blendMode ? { blendMode: layer.blendMode } : {}),
		opacity: clampOpacity(layer.opacity),
		left: layer.left ?? 0,
		top: layer.top ?? 0,
		...(layer.mask
			? {
					mask: {
						...(layer.mask.canvas ? { canvas: layer.mask.canvas } : {}),
						...(layer.mask.imageData
							? { imageData: layer.mask.imageData }
							: {}),
						left: layer.mask.left ?? 0,
						top: layer.mask.top ?? 0,
						right:
							layer.mask.right ??
							layer.mask.left +
								(layer.mask.canvas?.width ?? layer.mask.imageData?.width ?? 0),
						bottom:
							layer.mask.bottom ??
							layer.mask.top +
								(layer.mask.canvas?.height ??
									layer.mask.imageData?.height ??
									0),
						defaultColor: layer.mask.defaultColor ?? 0,
						...(typeof layer.mask.disabled === "boolean"
							? { disabled: layer.mask.disabled }
							: {}),
					},
				}
			: {}),
		...(Array.isArray(layer.children)
			? { children: layer.children.map((child) => toPsdLayer(child)) }
			: {}),
	};
}

function toPsdLayerForWrite(layer) {
	return {
		...toPsdLayer(layer),
		...(Array.isArray(layer.children)
			? { children: buildPsdChildrenForWrite(layer.children) }
			: {}),
	};
}

export function buildPsdChildrenForWrite(layers = []) {
	// The export document already uses the canonical bottom-to-top stack order
	// expected by PSD layer serialization.
	return layers.map((layer) => toPsdLayerForWrite(layer));
}

export function buildCompositeLayersForRender(layers = []) {
	// Use the same canonical bottom-to-top stack order for the document
	// composite and thumbnail. Reversing here would move the background above
	// the rest of the stack and break the PSD thumbnail.
	return layers.map((layer) => ({
		...layer,
		...(Array.isArray(layer.children)
			? { children: buildCompositeLayersForRender(layer.children) }
			: {}),
	}));
}

function createCompositeCanvas({ width, height, layers = [] }) {
	return renderLayersToCanvas({
		width,
		height,
		layers: buildCompositeLayersForRender(layers),
	});
}

export function downloadPsdDocument({ width, height, filename, layers = [] }) {
	const compositeCanvas = createCompositeCanvas({
		width,
		height,
		layers,
	});
	const thumbnail = createThumbnailCanvas(compositeCanvas);
	const psdBuffer = writePsd(
		{
			width,
			height,
			canvas: compositeCanvas,
			imageResources: {
				resolutionInfo: {
					horizontalResolution: PSD_RESOLUTION_PPI,
					verticalResolution: PSD_RESOLUTION_PPI,
					horizontalResolutionUnit: "PPI",
					verticalResolutionUnit: "PPI",
					widthUnit: "Inches",
					heightUnit: "Inches",
				},
				thumbnail,
			},
			children: buildPsdChildrenForWrite(layers),
		},
		{ compress: false },
	);
	const blob = new Blob([psdBuffer], {
		type: "application/octet-stream",
	});
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = filename;
	anchor.click();
	setTimeout(() => URL.revokeObjectURL(url), 0);
}
