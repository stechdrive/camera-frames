import {
	REFERENCE_IMAGE_GROUP_BACK,
	applyRenderBoxOffsetCorrection,
	getReferenceImageRenderBoxAnchor,
	resolveReferenceImageItemsForShot,
} from "../../reference-image-model.js";

export async function loadReferenceImageDrawable(
	blob,
	{
		createImageBitmapFn = globalThis.createImageBitmap,
		createObjectUrl = (value) => URL.createObjectURL(value),
		revokeObjectUrl = (value) => URL.revokeObjectURL(value),
		createImageElement = () => new Image(),
	} = {},
) {
	try {
		if (typeof createImageBitmapFn !== "function") {
			throw new Error("createImageBitmap unavailable");
		}
		const imageBitmap = await createImageBitmapFn(blob);
		return {
			drawable: imageBitmap,
			cleanup: () => {
				try {
					imageBitmap.close?.();
				} catch {
					// ignore
				}
			},
		};
	} catch {
		const objectUrl = createObjectUrl(blob);
		const image = await new Promise((resolve, reject) => {
			const element = createImageElement();
			element.onload = () => resolve(element);
			element.onerror = (error) => reject(error);
			element.src = objectUrl;
		});
		return {
			drawable: image,
			cleanup: () => {
				revokeObjectUrl(objectUrl);
			},
		};
	}
}

function rotateReferencePoint(point, angleRad) {
	const cos = Math.cos(angleRad);
	const sin = Math.sin(angleRad);
	return {
		x: point.x * cos - point.y * sin,
		y: point.x * sin + point.y * cos,
	};
}

export function buildReferenceImageExportCanvas(
	{
		drawable,
		width,
		height,
		anchor,
		anchorPoint,
		rotationDeg,
		pixelPerfect,
		opacity,
		applyOpacity = true,
	},
	{
		createCanvas = () => document.createElement("canvas"),
		previewContextError = "error.previewContext",
	} = {},
) {
	const angleRad = (rotationDeg * Math.PI) / 180;
	const localCorners = [
		{ x: -anchor.ax * width, y: -anchor.ay * height },
		{ x: (1 - anchor.ax) * width, y: -anchor.ay * height },
		{ x: (1 - anchor.ax) * width, y: (1 - anchor.ay) * height },
		{ x: -anchor.ax * width, y: (1 - anchor.ay) * height },
	];
	const worldCorners = localCorners.map((corner) => {
		const rotated = rotateReferencePoint(corner, angleRad);
		return {
			x: rotated.x + anchorPoint.x,
			y: rotated.y + anchorPoint.y,
		};
	});
	const minX = Math.min(...worldCorners.map((corner) => corner.x));
	const maxX = Math.max(...worldCorners.map((corner) => corner.x));
	const minY = Math.min(...worldCorners.map((corner) => corner.y));
	const maxY = Math.max(...worldCorners.map((corner) => corner.y));
	const left = Math.floor(minX);
	const top = Math.floor(minY);
	const right = Math.ceil(maxX);
	const bottom = Math.ceil(maxY);
	const canvas = createCanvas();
	canvas.width = Math.max(1, right - left);
	canvas.height = Math.max(1, bottom - top);
	const context = canvas.getContext("2d");
	if (!context) {
		throw new Error(previewContextError);
	}
	context.imageSmoothingEnabled = !pixelPerfect;
	context.translate(-left, -top);
	context.translate(anchorPoint.x, anchorPoint.y);
	context.rotate(angleRad);
	if (applyOpacity) {
		context.globalAlpha = opacity;
	}
	context.drawImage(
		drawable,
		-anchor.ax * width,
		-anchor.ay * height,
		width,
		height,
	);
	return {
		canvas,
		opacity: applyOpacity ? 1 : opacity,
		bounds: {
			left,
			top,
			right,
			bottom,
		},
	};
}

export async function renderReferenceImageLayersForShotCamera({
	referenceImageDocument,
	exportSessionEnabled = true,
	documentState,
	width,
	height,
	previewContextError = "error.previewContext",
	applyOpacity = true,
	onProgress = null,
	loadDrawable = loadReferenceImageDrawable,
	renderLayerCanvas = (options) =>
		buildReferenceImageExportCanvas(options, { previewContextError }),
}) {
	if (exportSessionEnabled === false) {
		return [];
	}

	const resolved = resolveReferenceImageItemsForShot(
		referenceImageDocument,
		documentState?.referenceImages ?? null,
	);
	if (!resolved.preset) {
		return [];
	}

	const renderBoxAnchor = getReferenceImageRenderBoxAnchor(
		documentState?.outputFrame?.anchor ?? "center",
	);
	const assetDrawableCache = new Map();
	const layers = [];
	const candidates = resolved.items
		.filter((item) => item.exportEnabled !== false)
		.sort((left, right) => {
			if (left.group !== right.group) {
				return left.group === REFERENCE_IMAGE_GROUP_BACK ? -1 : 1;
			}
			return left.order - right.order || left.id.localeCompare(right.id);
		});

	try {
		for (const [index, item] of candidates.entries()) {
			onProgress?.({
				index: index + 1,
				count: candidates.length,
				name: item.name,
			});
			const asset = resolved.assetsById.get(item.assetId) ?? null;
			const sourceFile = asset?.source?.file ?? null;
			if (!(sourceFile instanceof Blob) || !asset?.sourceMeta) {
				continue;
			}

			let cacheEntry = assetDrawableCache.get(asset.id) ?? null;
			if (!cacheEntry) {
				cacheEntry = await loadDrawable(sourceFile);
				assetDrawableCache.set(asset.id, cacheEntry);
			}

			const effectiveOffset = applyRenderBoxOffsetCorrection(
				item.offsetPx,
				item.anchor,
				resolved.preset.baseRenderBox,
				{ w: width, h: height },
				renderBoxAnchor,
				resolved.override?.renderBoxCorrection ?? null,
			);
			const logicalWidth =
				asset.sourceMeta.appliedSize.w * (item.scalePct / 100);
			const logicalHeight =
				asset.sourceMeta.appliedSize.h * (item.scalePct / 100);
			const itemAnchorPx = {
				x: width * item.anchor.ax,
				y: height * item.anchor.ay,
			};
			const anchorPoint = {
				x: itemAnchorPx.x - effectiveOffset.x,
				y: itemAnchorPx.y - effectiveOffset.y,
			};
			const renderedLayer = renderLayerCanvas({
				drawable: cacheEntry.drawable,
				width: logicalWidth,
				height: logicalHeight,
				anchor: item.anchor,
				anchorPoint,
				rotationDeg: item.rotationDeg,
				pixelPerfect: Math.abs(item.scalePct - 100) < 1e-6,
				opacity: item.opacity,
				applyOpacity,
			});

			layers.push({
				id: item.id,
				assetId: asset.id,
				name: item.name,
				group: item.group,
				order: item.order,
				opacity: renderedLayer.opacity,
				canvas: renderedLayer.canvas,
				bounds: renderedLayer.bounds,
			});
		}
	} finally {
		for (const cacheEntry of assetDrawableCache.values()) {
			cacheEntry.cleanup?.();
		}
	}

	return layers;
}
