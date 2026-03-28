import {
	applyRenderBoxOffsetCorrection,
	getReferenceImageRenderBoxAnchor,
	resolveReferenceImageItemsForShot,
} from "../reference-image-model.js";

function isFinitePositive(value) {
	return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function revokeObjectUrl(url) {
	if (typeof url === "string" && url) {
		URL.revokeObjectURL(url);
	}
}

export function getReferenceImagePreviewRenderBoxMetrics({
	renderBoxRect,
	viewportShellRect,
	clientWidth,
	clientHeight,
	clientLeft = 0,
	clientTop = 0,
}) {
	return {
		width: Math.max(clientWidth, 0),
		height: Math.max(clientHeight, 0),
		left: renderBoxRect.left - viewportShellRect.left + Math.max(clientLeft, 0),
		top: renderBoxRect.top - viewportShellRect.top + Math.max(clientTop, 0),
	};
}

export function createReferenceImageRenderController({
	store,
	renderBox,
	viewportShell,
	getActiveShotCameraDocument,
	getOutputSizeState,
}) {
	const assetUrlCache = new Map();
	let lastPreviewSignature = "";

	function setPreviewLayers(nextLayers, nextSignature) {
		if (lastPreviewSignature === nextSignature) {
			return;
		}
		lastPreviewSignature = nextSignature;
		store.referenceImages.previewLayers.value = nextLayers;
	}

	function getAssetObjectUrl(asset) {
		const sourceFile = asset?.source?.file ?? null;
		if (!(sourceFile instanceof Blob)) {
			return "";
		}

		const cacheEntry = assetUrlCache.get(asset.id) ?? null;
		if (cacheEntry?.file === sourceFile && cacheEntry.url) {
			return cacheEntry.url;
		}

		revokeObjectUrl(cacheEntry?.url);
		const url = URL.createObjectURL(sourceFile);
		assetUrlCache.set(asset.id, {
			file: sourceFile,
			url,
		});
		return url;
	}

	function pruneAssetObjectUrls(keepAssetIds) {
		for (const [assetId, cacheEntry] of assetUrlCache.entries()) {
			if (keepAssetIds.has(assetId)) {
				continue;
			}
			revokeObjectUrl(cacheEntry?.url);
			assetUrlCache.delete(assetId);
		}
	}

	function clearPreviewLayers() {
		setPreviewLayers([], "empty");
	}

	function syncPreviewLayers() {
		const renderBoxElement = renderBox?.current ?? renderBox;
		const viewportShellElement = viewportShell?.current ?? viewportShell;
		const previewSessionVisible =
			store.referenceImages.previewSessionVisible.value !== false;
		if (!previewSessionVisible || !renderBoxElement || !viewportShellElement) {
			clearPreviewLayers();
			return;
		}

		const outputSize = getOutputSizeState?.();
		const previewMetrics = getReferenceImagePreviewRenderBoxMetrics({
			renderBoxRect: renderBoxElement.getBoundingClientRect(),
			viewportShellRect: viewportShellElement.getBoundingClientRect(),
			clientWidth: renderBoxElement.clientWidth,
			clientHeight: renderBoxElement.clientHeight,
			clientLeft: renderBoxElement.clientLeft,
			clientTop: renderBoxElement.clientTop,
		});
		const renderBoxWidth = previewMetrics.width;
		const renderBoxHeight = previewMetrics.height;
		const renderBoxLeft = previewMetrics.left;
		const renderBoxTop = previewMetrics.top;
		if (
			!isFinitePositive(outputSize?.width) ||
			!isFinitePositive(outputSize?.height) ||
			renderBoxWidth <= 0 ||
			renderBoxHeight <= 0
		) {
			clearPreviewLayers();
			return;
		}

		const activeShotCameraDocument = getActiveShotCameraDocument?.() ?? null;
		const resolved = resolveReferenceImageItemsForShot(
			store.referenceImages.document.value,
			activeShotCameraDocument?.referenceImages ?? null,
		);
		const preset = resolved.preset;
		if (!preset) {
			clearPreviewLayers();
			return;
		}

		const currentRenderBoxSize = {
			w: outputSize.width,
			h: outputSize.height,
		};
		const renderBoxAnchor = getReferenceImageRenderBoxAnchor(
			activeShotCameraDocument?.outputFrame?.anchor ?? "center",
		);
		const renderScaleX = renderBoxWidth / currentRenderBoxSize.w;
		const renderScaleY = renderBoxHeight / currentRenderBoxSize.h;
		const keepAssetIds = new Set();
		const layers = [];
		const signatureParts = [
			preset.id,
			currentRenderBoxSize.w,
			currentRenderBoxSize.h,
			renderBoxWidth,
			renderBoxHeight,
			renderBoxLeft,
			renderBoxTop,
			renderBoxAnchor.ax,
			renderBoxAnchor.ay,
			resolved.override?.renderBoxCorrection?.x ?? 0,
			resolved.override?.renderBoxCorrection?.y ?? 0,
		];

		for (const item of resolved.items) {
			if (item.previewVisible === false) {
				continue;
			}

			const asset = resolved.assetsById.get(item.assetId) ?? null;
			if (!asset?.sourceMeta || !asset?.source?.file) {
				continue;
			}

			keepAssetIds.add(asset.id);
			const effectiveOffset = applyRenderBoxOffsetCorrection(
				item.offsetPx,
				item.anchor,
				preset.baseRenderBox,
				currentRenderBoxSize,
				renderBoxAnchor,
				resolved.override?.renderBoxCorrection ?? null,
			);
			const logicalWidth =
				asset.sourceMeta.appliedSize.w * (item.scalePct / 100);
			const logicalHeight =
				asset.sourceMeta.appliedSize.h * (item.scalePct / 100);
			const itemAnchorPx = {
				x: currentRenderBoxSize.w * item.anchor.ax,
				y: currentRenderBoxSize.h * item.anchor.ay,
			};
			const anchorPoint = {
				x: itemAnchorPx.x - effectiveOffset.x,
				y: itemAnchorPx.y - effectiveOffset.y,
			};
			const logicalLeft = anchorPoint.x - logicalWidth * item.anchor.ax;
			const logicalTop = anchorPoint.y - logicalHeight * item.anchor.ay;

			layers.push({
				id: item.id,
				assetId: asset.id,
				name: item.name,
				group: item.group,
				order: item.order,
				opacity: item.opacity,
				rotationDeg: item.rotationDeg,
				pixelPerfect: Math.abs(item.scalePct - 100) < 1e-6,
				sourceUrl: getAssetObjectUrl(asset),
				fileName: asset.sourceMeta.filename,
				style: {
					left: `${renderBoxLeft + logicalLeft * renderScaleX}px`,
					top: `${renderBoxTop + logicalTop * renderScaleY}px`,
					width: `${logicalWidth * renderScaleX}px`,
					height: `${logicalHeight * renderScaleY}px`,
					opacity: item.opacity,
					transform: `rotate(${item.rotationDeg}deg)`,
					transformOrigin: `${item.anchor.ax * 100}% ${item.anchor.ay * 100}%`,
					imageRendering:
						Math.abs(item.scalePct - 100) < 1e-6 ? "pixelated" : "auto",
				},
			});
			signatureParts.push(
				item.id,
				item.assetId,
				item.group,
				item.order,
				item.previewVisible ? 1 : 0,
				item.opacity,
				item.scalePct,
				item.rotationDeg,
				item.offsetPx.x,
				item.offsetPx.y,
				item.anchor.ax,
				item.anchor.ay,
				asset.sourceMeta.filename,
				renderBoxWidth,
				renderBoxHeight,
				logicalLeft,
				logicalTop,
				logicalWidth,
				logicalHeight,
			);
		}

		pruneAssetObjectUrls(keepAssetIds);
		setPreviewLayers(layers, signatureParts.join("|"));
	}

	function dispose() {
		clearPreviewLayers();
		pruneAssetObjectUrls(new Set());
	}

	return {
		syncPreviewLayers,
		clearPreviewLayers,
		dispose,
	};
}
