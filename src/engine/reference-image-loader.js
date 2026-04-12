import { readPsd } from "ag-psd";
import {
	REFERENCE_IMAGE_MAX_APPLIED_DIM,
	REFERENCE_IMAGE_MAX_PREVIEW_DIM,
	normalizeReferenceImageFileName,
	normalizeReferenceImageSourceMeta,
} from "../reference-image-model.js";

function isFiniteNumber(value) {
	return typeof value === "number" && Number.isFinite(value);
}

function clamp(value, min, max) {
	return Math.max(min, Math.min(max, value));
}

function createCanvas(width, height) {
	const canvas = document.createElement("canvas");
	canvas.width = Math.max(1, Math.round(width));
	canvas.height = Math.max(1, Math.round(height));
	return canvas;
}

async function loadImageElement(url) {
	return await new Promise((resolve, reject) => {
		const image = new Image();
		image.onload = () => resolve(image);
		image.onerror = (error) => reject(error);
		image.src = url;
	});
}

async function loadDrawableFromBlob(blob) {
	let drawable = null;
	let cleanup = null;
	try {
		drawable = await createImageBitmap(blob);
		cleanup = () => {
			try {
				drawable?.close?.();
			} catch {
				// ignore
			}
		};
		return { drawable, cleanup };
	} catch {
		const objectUrl = URL.createObjectURL(blob);
		drawable = await loadImageElement(objectUrl);
		cleanup = () => {
			URL.revokeObjectURL(objectUrl);
		};
		return { drawable, cleanup };
	}
}

export function createCanvasBlob(canvas, type = "image/png") {
	return new Promise((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (blob) {
				resolve(blob);
				return;
			}
			reject(new Error("Failed to create blob from canvas."));
		}, type);
	});
}

export async function decodeReferenceImageBlob(
	blob,
	filename,
	{
		maxAppliedDim = REFERENCE_IMAGE_MAX_APPLIED_DIM,
		maxPreviewDim = REFERENCE_IMAGE_MAX_PREVIEW_DIM,
	} = {},
) {
	const normalizedFilename = normalizeReferenceImageFileName(filename);
	const { drawable, cleanup } = await loadDrawableFromBlob(blob);
	try {
		const originalSize = {
			w: Math.max(1, Math.round(drawable.width)),
			h: Math.max(1, Math.round(drawable.height)),
		};
		const maxOriginalDim = Math.max(originalSize.w, originalSize.h);
		const appliedScale =
			maxOriginalDim > maxAppliedDim ? maxAppliedDim / maxOriginalDim : 1;
		const appliedSize = {
			w: Math.max(1, Math.round(originalSize.w * appliedScale)),
			h: Math.max(1, Math.round(originalSize.h * appliedScale)),
		};
		const maxAppliedSize = Math.max(appliedSize.w, appliedSize.h);
		const previewLimit =
			isFiniteNumber(maxPreviewDim) && maxPreviewDim > 0
				? maxPreviewDim
				: maxAppliedSize;
		const previewScale =
			maxAppliedSize > previewLimit ? previewLimit / maxAppliedSize : 1;
		const canvas = createCanvas(
			Math.max(1, Math.round(appliedSize.w * previewScale)),
			Math.max(1, Math.round(appliedSize.h * previewScale)),
		);
		const context = canvas.getContext("2d");
		if (!context) {
			throw new Error("Failed to acquire 2D context for reference image.");
		}
		context.drawImage(drawable, 0, 0, canvas.width, canvas.height);
		return {
			sourceMeta: normalizeReferenceImageSourceMeta({
				filename: normalizedFilename,
				mime: blob.type || "application/octet-stream",
				originalSize,
				appliedSize,
				pixelRatio: appliedSize.w / Math.max(1, originalSize.w),
				usedOriginal: appliedScale >= 0.999,
			}),
			previewCanvas: canvas,
		};
	} finally {
		cleanup?.();
	}
}

export async function decodeReferenceImageCanvas(
	canvas,
	filename,
	{
		type = "image/png",
		maxAppliedDim = REFERENCE_IMAGE_MAX_APPLIED_DIM,
		maxPreviewDim = REFERENCE_IMAGE_MAX_PREVIEW_DIM,
	} = {},
) {
	const blob = await createCanvasBlob(canvas, type);
	const decoded = await decodeReferenceImageBlob(blob, filename, {
		maxAppliedDim,
		maxPreviewDim,
	});
	return {
		...decoded,
		blob,
	};
}

export function getPsdLeafLayersInStackOrder(children = []) {
	const layers = [];
	const walk = (entries = []) => {
		for (const layer of entries) {
			const nestedChildren = Array.isArray(layer?.children)
				? layer.children
				: [];
			if (nestedChildren.length > 0) {
				walk(nestedChildren);
				continue;
			}
			layers.push(layer);
		}
	};
	walk(children);
	return layers;
}

export async function extractReferenceImagePsdLayers(
	blob,
	filename,
	options = {},
) {
	const psd = readPsd(await blob.arrayBuffer(), {
		skipCompositeImageData: true,
		skipThumbnail: true,
	});
	const width = Number(psd?.width ?? 0);
	const height = Number(psd?.height ?? 0);
	if (
		!isFiniteNumber(width) ||
		!isFiniteNumber(height) ||
		width <= 0 ||
		height <= 0
	) {
		throw new Error("Invalid PSD dimensions.");
	}

	const layers = getPsdLeafLayersInStackOrder(
		Array.isArray(psd?.children) ? psd.children : [],
	);

	const documentCenter = { x: width * 0.5, y: height * 0.5 };
	const entries = [];
	for (const [index, layer] of layers.entries()) {
		const canvas = layer?.canvas;
		const left = Number(layer?.left);
		const top = Number(layer?.top);
		const right = Number(layer?.right);
		const bottom = Number(layer?.bottom);
		if (
			!canvas ||
			!isFiniteNumber(left) ||
			!isFiniteNumber(top) ||
			!isFiniteNumber(right) ||
			!isFiniteNumber(bottom)
		) {
			continue;
		}
		const widthPx = right - left;
		const heightPx = bottom - top;
		if (
			!isFiniteNumber(widthPx) ||
			!isFiniteNumber(heightPx) ||
			widthPx <= 0 ||
			heightPx <= 0
		) {
			continue;
		}
		const layerName =
			typeof layer?.name === "string" && layer.name.trim()
				? layer.name.trim()
				: `Layer ${index + 1}`;
		const baseFileName = normalizeReferenceImageFileName(
			filename ?? "reference.psd",
		);
		const layerFileName = `${baseFileName.replace(/\.[^./\\]+$/, "")}-${layerName}.png`;
		const layerCenter = {
			x: (left + right) * 0.5,
			y: (top + bottom) * 0.5,
		};
		const decoded = await decodeReferenceImageCanvas(
			canvas,
			layerFileName,
			options,
		);
		entries.push({
			name: layerName,
			visible: layer?.hidden !== true,
			opacity: clamp(isFiniteNumber(layer?.opacity) ? layer.opacity : 1, 0, 1),
			offsetPx: {
				x: documentCenter.x - layerCenter.x,
				y: documentCenter.y - layerCenter.y,
			},
			decoded,
		});
	}

	return entries;
}
