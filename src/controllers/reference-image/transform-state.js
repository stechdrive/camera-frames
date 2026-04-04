import {
	getPointFromRectLocal,
	getPointsBounds,
	getRectCornersFromAnchor,
} from "../../engine/reference-image-selection.js";
import {
	applyRenderBoxOffsetCorrection,
	getReferenceImageRenderBoxAnchor,
} from "../../reference-image-model.js";
import { getReferenceImagePreviewRenderBoxMetrics } from "../reference-image-render-controller.js";
import {
	buildReferenceImageSelectionBoxLogicalFromGeometries,
	projectReferenceImageSelectionBoxLogicalToScreen,
} from "./selection-state.js";

export function createReferenceImageTransformState({
	store,
	renderBox,
	getDocument,
	getSelectedItemIds,
	getActiveShotCameraDocument,
	getOutputSizeState,
	getResolvedShotItems,
} = {}) {
	function getRenderableSelectionLayers() {
		const selectedIdSet = new Set(getSelectedItemIds());
		return store.referenceImages.previewLayers.value.filter((layer) =>
			selectedIdSet.has(layer.id),
		);
	}

	function getTransformPreviewMetrics() {
		const renderBoxElement = renderBox?.current ?? renderBox;
		const viewportShellElement =
			typeof document !== "undefined"
				? document.getElementById("viewport-shell")
				: null;
		if (!renderBoxElement || !viewportShellElement) {
			return null;
		}
		return getReferenceImagePreviewRenderBoxMetrics({
			renderBoxRect: renderBoxElement.getBoundingClientRect(),
			viewportShellRect: viewportShellElement.getBoundingClientRect(),
			clientWidth: renderBoxElement.clientWidth,
			clientHeight: renderBoxElement.clientHeight,
			clientLeft: renderBoxElement.clientLeft,
			clientTop: renderBoxElement.clientTop,
		});
	}

	function clampPointerToViewportShell(clientX, clientY, context) {
		return {
			x: Math.max(
				0,
				Math.min(context.viewportShellWidth, Number(clientX) || 0),
			),
			y: Math.max(
				0,
				Math.min(context.viewportShellHeight, Number(clientY) || 0),
			),
		};
	}

	function getLogicalTransformContext(documentState = getDocument()) {
		const outputSize = getOutputSizeState?.();
		const activeShotCameraDocument = getActiveShotCameraDocument?.() ?? null;
		const resolved = getResolvedShotItems(documentState);
		if (!outputSize?.width || !outputSize?.height || !resolved?.preset) {
			return null;
		}
		return {
			documentState,
			resolved,
			outputSize: {
				w: outputSize.width,
				h: outputSize.height,
			},
			renderBoxAnchor: getReferenceImageRenderBoxAnchor(
				activeShotCameraDocument?.outputFrame?.anchor ?? "center",
			),
		};
	}

	function getTransformContext(documentState = getDocument()) {
		const renderBoxElement = renderBox?.current ?? renderBox;
		const logicalContext = getLogicalTransformContext(documentState);
		if (!renderBoxElement || !logicalContext) {
			return null;
		}
		const renderBoxWidth = Math.max(renderBoxElement.clientWidth, 0);
		const renderBoxHeight = Math.max(renderBoxElement.clientHeight, 0);
		if (renderBoxWidth <= 0 || renderBoxHeight <= 0) {
			return null;
		}
		const previewMetrics = getTransformPreviewMetrics();
		if (!previewMetrics) {
			return null;
		}
		return {
			...logicalContext,
			renderScaleX: renderBoxWidth / logicalContext.outputSize.w,
			renderScaleY: renderBoxHeight / logicalContext.outputSize.h,
			renderBoxScreenLeft: previewMetrics.left,
			renderBoxScreenTop: previewMetrics.top,
			viewportShellWidth: previewMetrics.viewportShellWidth,
			viewportShellHeight: previewMetrics.viewportShellHeight,
		};
	}

	function buildLogicalItemGeometry(item, asset, context) {
		const effectiveOffset = applyRenderBoxOffsetCorrection(
			item.offsetPx,
			item.anchor,
			context.resolved.preset.baseRenderBox,
			context.outputSize,
			context.renderBoxAnchor,
			context.resolved.override?.renderBoxCorrection ?? null,
		);
		const logicalWidth = asset.sourceMeta.appliedSize.w * (item.scalePct / 100);
		const logicalHeight =
			asset.sourceMeta.appliedSize.h * (item.scalePct / 100);
		const itemAnchorPx = {
			x: context.outputSize.w * item.anchor.ax,
			y: context.outputSize.h * item.anchor.ay,
		};
		const anchorPoint = {
			x: itemAnchorPx.x - effectiveOffset.x,
			y: itemAnchorPx.y - effectiveOffset.y,
		};
		const left = anchorPoint.x - logicalWidth * item.anchor.ax;
		const top = anchorPoint.y - logicalHeight * item.anchor.ay;
		const corners = getRectCornersFromAnchor({
			left,
			top,
			width: logicalWidth,
			height: logicalHeight,
			anchorAx: item.anchor.ax,
			anchorAy: item.anchor.ay,
			rotationDeg: item.rotationDeg,
		});
		return {
			item,
			asset,
			logicalWidth,
			logicalHeight,
			itemAnchorPx,
			effectiveOffset,
			anchorPoint,
			left,
			top,
			corners,
			bounds: getPointsBounds(corners),
		};
	}

	function buildSelectionTransformState({ includeScreenState = true } = {}) {
		const context = includeScreenState
			? getTransformContext()
			: getLogicalTransformContext();
		if (!context) {
			return null;
		}
		const selectedItemIds = getSelectedItemIds();
		if (selectedItemIds.length === 0) {
			return null;
		}
		const selectedItems = context.resolved.items.filter((item) =>
			selectedItemIds.includes(item.id),
		);
		if (selectedItems.length === 0) {
			return null;
		}
		const geometries = selectedItems
			.map((item) => {
				const asset = context.resolved.assetsById.get(item.assetId) ?? null;
				if (!asset?.sourceMeta) {
					return null;
				}
				return buildLogicalItemGeometry(item, asset, context);
			})
			.filter(Boolean);
		if (geometries.length === 0) {
			return null;
		}
		const selectedLayers = includeScreenState
			? getRenderableSelectionLayers()
			: [];
		if (includeScreenState && selectedLayers.length === 0) {
			return null;
		}
		let pivot;
		let screenPivot;
		let anchorLocal;
		let selectionBoxLogical;
		let selectionBoxScreen;
		if (geometries.length === 1) {
			const geometry = geometries[0];
			anchorLocal = {
				x: geometry.item.anchor.ax,
				y: geometry.item.anchor.ay,
			};
			pivot = {
				x: geometry.anchorPoint.x,
				y: geometry.anchorPoint.y,
			};
			selectionBoxLogical = {
				left: geometry.left,
				top: geometry.top,
				width: geometry.logicalWidth,
				height: geometry.logicalHeight,
				rotationDeg: geometry.item.rotationDeg,
				anchorX: anchorLocal.x,
				anchorY: anchorLocal.y,
			};
			if (includeScreenState) {
				const layer =
					selectedLayers.find((entry) => entry.id === geometry.item.id) ?? null;
				if (!layer) {
					return null;
				}
				screenPivot = {
					x: layer.leftPx + layer.widthPx * anchorLocal.x,
					y: layer.topPx + layer.heightPx * anchorLocal.y,
				};
				selectionBoxScreen = {
					left: layer.leftPx,
					top: layer.topPx,
					width: layer.widthPx,
					height: layer.heightPx,
					rotationDeg: layer.rotationDeg,
					anchorX: anchorLocal.x,
					anchorY: anchorLocal.y,
				};
			}
		} else {
			const storedSelectionBox =
				store.referenceImages.selectionBoxLogical.value ??
				buildReferenceImageSelectionBoxLogicalFromGeometries(geometries);
			if (!storedSelectionBox) {
				return null;
			}
			const selectionAnchor =
				store.referenceImages.selectionAnchor.value &&
				Number.isFinite(store.referenceImages.selectionAnchor.value.x) &&
				Number.isFinite(store.referenceImages.selectionAnchor.value.y)
					? {
							x: store.referenceImages.selectionAnchor.value.x,
							y: store.referenceImages.selectionAnchor.value.y,
						}
					: {
							x: storedSelectionBox.anchorX ?? 0.5,
							y: storedSelectionBox.anchorY ?? 0.5,
						};
			anchorLocal = selectionAnchor;
			selectionBoxLogical = {
				left: storedSelectionBox.left,
				top: storedSelectionBox.top,
				width: storedSelectionBox.width,
				height: storedSelectionBox.height,
				rotationDeg: storedSelectionBox.rotationDeg ?? 0,
				anchorX: anchorLocal.x,
				anchorY: anchorLocal.y,
			};
			pivot = getPointFromRectLocal({
				left: selectionBoxLogical.left,
				top: selectionBoxLogical.top,
				width: selectionBoxLogical.width,
				height: selectionBoxLogical.height,
				localX: anchorLocal.x,
				localY: anchorLocal.y,
				anchorAx: selectionBoxLogical.anchorX,
				anchorAy: selectionBoxLogical.anchorY,
				rotationDeg: selectionBoxLogical.rotationDeg,
			});
			if (includeScreenState) {
				selectionBoxScreen = projectReferenceImageSelectionBoxLogicalToScreen(
					selectionBoxLogical,
					context,
					anchorLocal,
				);
				if (!selectionBoxScreen) {
					return null;
				}
				screenPivot = getPointFromRectLocal({
					left: selectionBoxScreen.left,
					top: selectionBoxScreen.top,
					width: selectionBoxScreen.width,
					height: selectionBoxScreen.height,
					localX: anchorLocal.x,
					localY: anchorLocal.y,
					anchorAx: selectionBoxScreen.anchorX,
					anchorAy: selectionBoxScreen.anchorY,
					rotationDeg: selectionBoxScreen.rotationDeg,
				});
			}
		}
		return {
			context,
			selectedItemIds: geometries.map((geometry) => geometry.item.id),
			geometries,
			pivot,
			screenPivot,
			anchorLocal,
			selectionBoxLogical,
			selectionBoxScreen,
		};
	}

	return {
		getRenderableSelectionLayers,
		getTransformPreviewMetrics,
		clampPointerToViewportShell,
		getLogicalTransformContext,
		getTransformContext,
		buildLogicalItemGeometry,
		buildSelectionTransformState,
	};
}
