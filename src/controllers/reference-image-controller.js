import {
	FRAME_RESIZE_HANDLES,
	getFrameResizeAxisLocal,
	getOppositeFrameResizeHandleKey,
	inverseRotateVector,
} from "../engine/frame-transform.js";
import {
	decodeReferenceImageBlob,
	extractReferenceImagePsdLayers,
} from "../engine/reference-image-loader.js";
import {
	getPointFromRectLocal,
	getPointsBounds,
	getRectCornersFromAnchor,
	normalizeAngleDeltaDeg,
} from "../engine/reference-image-selection.js";
import {
	createProjectFileEmbeddedFileSource,
	getProjectMediaTypeFromFileName,
} from "../project-document.js";
import {
	REFERENCE_IMAGE_ASSET_KIND,
	REFERENCE_IMAGE_DEFAULT_PRESET_ID,
	REFERENCE_IMAGE_GROUP_BACK,
	REFERENCE_IMAGE_GROUP_FRONT,
	applyRenderBoxOffsetCorrection,
	cloneReferenceImageDocument,
	createDefaultReferenceImageDocument,
	createReferenceImageAsset,
	createReferenceImageCameraPresetOverride,
	createReferenceImageItem,
	createReferenceImagePreset,
	createShotCameraReferenceImagesState,
	findReferenceImagePreset,
	getReferenceImageCompositeItems,
	getReferenceImageDisplayItems,
	getReferenceImageOrderForImportIndex,
	getReferenceImageRenderBoxAnchor,
	getShotReferenceImagePresetId,
	normalizeReferenceImageDocument,
	normalizeReferenceImageFileName,
	removeRenderBoxOffsetCorrection,
	resolveReferenceImageItemsForShot,
} from "../reference-image-model.js";
import { cloneShotCameraDocument } from "../workspace-model.js";
import { getReferenceImagePreviewRenderBoxMetrics } from "./reference-image-render-controller.js";

const REFERENCE_IMAGE_EXTENSIONS = new Set([
	"png",
	"jpg",
	"jpeg",
	"webp",
	"psd",
]);
const REFERENCE_IMAGE_DRAG_START_THRESHOLD_PX = 4;

function getFileExtension(fileName) {
	const normalized = String(fileName ?? "")
		.trim()
		.toLowerCase();
	const lastDot = normalized.lastIndexOf(".");
	return lastDot >= 0 ? normalized.slice(lastDot + 1) : "";
}

export function supportsReferenceImageFile(file) {
	return REFERENCE_IMAGE_EXTENSIONS.has(
		getFileExtension(file?.name ?? file?.fileName ?? ""),
	);
}

function buildReferenceImageSizeLabel(sourceMeta) {
	const size = sourceMeta?.appliedSize ?? sourceMeta?.originalSize ?? null;
	if (!size) {
		return "";
	}
	return `${size.w} × ${size.h}`;
}

function ensurePresetBaseRenderBox(preset, outputSize) {
	if ((preset.items?.length ?? 0) > 0) {
		return;
	}
	if (!outputSize?.width || !outputSize?.height) {
		return;
	}
	preset.baseRenderBox = {
		w: Math.max(1, Math.round(outputSize.width)),
		h: Math.max(1, Math.round(outputSize.height)),
	};
}

function normalizeReferenceImageItemOrderInPlace(items) {
	const nextItems = getReferenceImageCompositeItems(items);
	let backIndex = 0;
	let frontIndex = 0;
	for (const item of nextItems) {
		if (item.group === REFERENCE_IMAGE_GROUP_BACK) {
			item.order = backIndex;
			backIndex += 1;
			continue;
		}
		item.order = frontIndex;
		frontIndex += 1;
	}
	return items;
}

function buildReferenceImageOverridePatch(baseItem, nextItem) {
	const patch = {};

	if (nextItem.name !== baseItem.name) {
		patch.name = nextItem.name;
	}
	if (nextItem.group !== baseItem.group) {
		patch.group = nextItem.group;
	}
	if (nextItem.order !== baseItem.order) {
		patch.order = nextItem.order;
	}
	if (nextItem.previewVisible !== baseItem.previewVisible) {
		patch.previewVisible = nextItem.previewVisible;
	}
	if (nextItem.exportEnabled !== baseItem.exportEnabled) {
		patch.exportEnabled = nextItem.exportEnabled;
	}
	if (nextItem.opacity !== baseItem.opacity) {
		patch.opacity = nextItem.opacity;
	}
	if (nextItem.scalePct !== baseItem.scalePct) {
		patch.scalePct = nextItem.scalePct;
	}
	if (nextItem.rotationDeg !== baseItem.rotationDeg) {
		patch.rotationDeg = nextItem.rotationDeg;
	}
	if (
		nextItem.offsetPx.x !== baseItem.offsetPx.x ||
		nextItem.offsetPx.y !== baseItem.offsetPx.y
	) {
		patch.offsetPx = {
			x: nextItem.offsetPx.x,
			y: nextItem.offsetPx.y,
		};
	}
	if (
		nextItem.anchor.ax !== baseItem.anchor.ax ||
		nextItem.anchor.ay !== baseItem.anchor.ay
	) {
		patch.anchor = {
			ax: nextItem.anchor.ax,
			ay: nextItem.anchor.ay,
		};
	}

	return patch;
}

function isReferenceImageOverrideEmpty(override) {
	return (
		!override?.activeItemId &&
		!Object.keys(override?.items ?? {}).length &&
		(override?.renderBoxCorrection?.x ?? 0) === 0 &&
		(override?.renderBoxCorrection?.y ?? 0) === 0
	);
}

function findMutablePresetInDocument(documentState, presetId = null) {
	const presets = Array.isArray(documentState?.presets)
		? documentState.presets
		: [];
	if (presets.length === 0) {
		return null;
	}
	if (typeof presetId === "string" && presetId) {
		return presets.find((preset) => preset.id === presetId) ?? null;
	}
	return null;
}

function buildReferenceImagePresetNameHint(fileNameHint = "", cameraName = "") {
	const normalizedFileName = normalizeReferenceImageFileName(
		fileNameHint,
		"Reference",
	);
	const baseFileName = normalizedFileName.replace(/\.[^./\\]+$/, "").trim();
	const normalizedCameraName = String(cameraName ?? "").trim();
	return baseFileName || normalizedCameraName || "Reference";
}

function buildDuplicatePresetName(presetName = "Reference") {
	const normalized = String(presetName ?? "").trim() || "Reference";
	return normalized === REFERENCE_IMAGE_DEFAULT_PRESET_NAME
		? "Reference Copy"
		: `${normalized} Copy`;
}

function sanitizeReferenceImagePresetName(value, fallback = "Reference") {
	const normalized = String(value ?? "")
		.replace(/[\r\n\t]+/g, " ")
		.replace(/\s+/g, " ")
		.trim();
	return normalized || fallback;
}

function pruneUnusedReferenceImageAssetsInDocument(documentState) {
	const usedAssetIds = new Set(
		(documentState?.presets ?? []).flatMap((preset) =>
			(preset?.items ?? []).map((item) => item.assetId),
		),
	);
	documentState.assets = (documentState?.assets ?? []).filter((asset) =>
		usedAssetIds.has(asset.id),
	);
}

export function ensureWritableReferenceImageImportPreset(
	documentState,
	shotCameraDocument = null,
	presetNameHint = "",
) {
	const explicitShotPresetId =
		typeof shotCameraDocument?.referenceImages?.presetId === "string" &&
		shotCameraDocument.referenceImages.presetId
			? shotCameraDocument.referenceImages.presetId
			: null;
	const explicitShotPreset = explicitShotPresetId
		? findMutablePresetInDocument(documentState, explicitShotPresetId)
		: null;
	if (explicitShotPreset) {
		documentState.activePresetId = explicitShotPreset.id;
		return explicitShotPreset;
	}

	if (!shotCameraDocument) {
		const fallbackPreset =
			findMutablePresetInDocument(
				documentState,
				documentState.activePresetId,
			) ??
			findMutablePresetInDocument(
				documentState,
				REFERENCE_IMAGE_DEFAULT_PRESET_ID,
			) ??
			documentState?.presets?.[0] ??
			null;
		if (fallbackPreset) {
			documentState.activePresetId = fallbackPreset.id;
			return fallbackPreset;
		}
	}

	const nextPreset = createReferenceImagePreset({
		name: buildReferenceImagePresetNameHint(
			presetNameHint,
			shotCameraDocument?.name ?? "",
		),
	});
	documentState.presets.push(nextPreset);
	documentState.activePresetId = nextPreset.id;
	return nextPreset;
}

export function createReferenceImageController({
	store,
	referenceImageInput,
	renderBox,
	t,
	setStatus,
	updateUi,
	ensureCameraMode,
	getActiveShotCameraDocument,
	updateActiveShotCameraDocument,
	getOutputSizeState,
	runHistoryAction = (_label, applyChange) => {
		applyChange?.();
		return false;
	},
	beginHistoryTransaction = () => false,
	commitHistoryTransaction = () => false,
	cancelHistoryTransaction = () => {},
}) {
	let referenceListSelectionAnchorId = "";

	function refreshUiAfterLayout({ expectedVisibleItems = 0 } = {}) {
		const maxAttempts = 4;
		const runAttempt = (attempt) => {
			updateUi?.();
			if (
				store.referenceImages.previewLayers.value.length > 0 ||
				expectedVisibleItems <= 0
			) {
				return;
			}
			if (attempt >= maxAttempts) {
				console.warn(
					"[CAMERA_FRAMES] reference-image preview remained empty after import",
					{
						expectedVisibleItems,
						assetCount: store.referenceImages.assetCount.value,
						itemCount: store.referenceImages.items.value.length,
						previewLayerCount: store.referenceImages.previewLayers.value.length,
						mode: store.mode.value,
					},
				);
				return;
			}
			requestAnimationFrame(() => {
				runAttempt(attempt + 1);
			});
		};

		if (typeof requestAnimationFrame === "function") {
			requestAnimationFrame(() => {
				runAttempt(1);
			});
			return;
		}
		queueMicrotask(() => {
			runAttempt(maxAttempts);
		});
	}

	let referenceImageDragState = null;
	let lastNonEmptyReferenceSelectionState = {
		selectedItemIds: [],
		activeItemId: "",
	};

	function getSelectedItemIds() {
		return Array.isArray(store.referenceImages.selectedItemIds.value)
			? store.referenceImages.selectedItemIds.value
			: [];
	}

	function getValidSelectionState({
		items = store.referenceImages.items.value,
		selectedItemIds = getSelectedItemIds(),
		activeItemId = store.referenceImages.selectedItemId.value,
	} = {}) {
		const validIds = new Set(items.map((item) => item.id));
		const normalizedSelectedItemIds = [];
		for (const itemId of selectedItemIds ?? []) {
			if (!validIds.has(itemId) || normalizedSelectedItemIds.includes(itemId)) {
				continue;
			}
			normalizedSelectedItemIds.push(itemId);
		}
		let nextActiveItemId =
			typeof activeItemId === "string" && validIds.has(activeItemId)
				? activeItemId
				: "";
		if (
			nextActiveItemId &&
			!normalizedSelectedItemIds.includes(nextActiveItemId)
		) {
			normalizedSelectedItemIds.push(nextActiveItemId);
		}
		if (!nextActiveItemId && normalizedSelectedItemIds.length > 0) {
			nextActiveItemId =
				normalizedSelectedItemIds[normalizedSelectedItemIds.length - 1];
		}
		const activeItem =
			items.find((item) => item.id === nextActiveItemId) ?? null;
		return {
			selectedItemIds: normalizedSelectedItemIds,
			activeItemId: nextActiveItemId,
			activeAssetId: activeItem?.assetId ?? "",
		};
	}

	function buildSelectionBoxLogicalFromGeometries(geometries) {
		const bounds = getPointsBounds(
			(geometries ?? []).flatMap((geometry) => geometry.corners ?? []),
		);
		if (!bounds) {
			return null;
		}
		return {
			left: bounds.left,
			top: bounds.top,
			width: bounds.width,
			height: bounds.height,
			rotationDeg: 0,
			anchorX: 0.5,
			anchorY: 0.5,
		};
	}

	function doesSelectionBoxMatchGeometries(logicalBox, geometries) {
		if (!logicalBox || !Array.isArray(geometries) || geometries.length === 0) {
			return false;
		}
		const anchorPoint = {
			x: logicalBox.left + logicalBox.width * 0.5,
			y: logicalBox.top + logicalBox.height * 0.5,
		};
		const rotationRadians = ((logicalBox.rotationDeg ?? 0) * Math.PI) / 180;
		const unrotatedCorners = geometries.flatMap((geometry) =>
			(geometry.corners ?? []).map((corner) => {
				const local = inverseRotateVector(
					corner.x - anchorPoint.x,
					corner.y - anchorPoint.y,
					rotationRadians,
				);
				return {
					x: anchorPoint.x + local.x,
					y: anchorPoint.y + local.y,
				};
			}),
		);
		const bounds = getPointsBounds(unrotatedCorners);
		if (!bounds) {
			return false;
		}
		const epsilon = 1e-3;
		return (
			Math.abs(bounds.left - logicalBox.left) <= epsilon &&
			Math.abs(bounds.top - logicalBox.top) <= epsilon &&
			Math.abs(bounds.width - logicalBox.width) <= epsilon &&
			Math.abs(bounds.height - logicalBox.height) <= epsilon
		);
	}

	function projectSelectionBoxLogicalToScreen(
		logicalBox,
		context,
		anchorLocal = null,
	) {
		if (!logicalBox || !context) {
			return null;
		}
		const nextAnchorLocal = {
			x: Number.isFinite(anchorLocal?.x)
				? anchorLocal.x
				: (logicalBox.anchorX ?? 0.5),
			y: Number.isFinite(anchorLocal?.y)
				? anchorLocal.y
				: (logicalBox.anchorY ?? 0.5),
		};
		return {
			left:
				context.renderBoxScreenLeft + logicalBox.left * context.renderScaleX,
			top: context.renderBoxScreenTop + logicalBox.top * context.renderScaleY,
			width: logicalBox.width * context.renderScaleX,
			height: logicalBox.height * context.renderScaleY,
			rotationDeg: logicalBox.rotationDeg ?? 0,
			anchorX: nextAnchorLocal.x,
			anchorY: nextAnchorLocal.y,
		};
	}

	function setStoredSelectionBox(
		logicalBox,
		context = null,
		anchorLocal = null,
	) {
		store.referenceImages.selectionBoxLogical.value = logicalBox ?? null;
		store.referenceImages.selectionBoxScreen.value =
			logicalBox && context
				? projectSelectionBoxLogicalToScreen(logicalBox, context, anchorLocal)
				: null;
	}

	function initializeMultiSelectionTransformBox(
		items = store.referenceImages.items.value,
	) {
		const context = getTransformContext();
		if (!context) {
			setStoredSelectionBox(null);
			return false;
		}
		const selectedItemIds = getSelectedItemIds();
		if (selectedItemIds.length <= 1) {
			setStoredSelectionBox(null);
			return false;
		}
		const geometries = context.resolved.items
			.filter((item) => selectedItemIds.includes(item.id))
			.map((item) => {
				const asset = context.resolved.assetsById.get(item.assetId) ?? null;
				if (!asset?.sourceMeta) {
					return null;
				}
				return buildLogicalItemGeometry(item, asset, context);
			})
			.filter(Boolean);
		const logicalBox = buildSelectionBoxLogicalFromGeometries(geometries);
		if (!logicalBox) {
			setStoredSelectionBox(null);
			return false;
		}
		setStoredSelectionBox(logicalBox, context, { x: 0.5, y: 0.5 });
		return true;
	}

	function setSelectionState({
		selectedItemIds = [],
		activeItemId = "",
		activeAssetId = "",
		items = store.referenceImages.items.value,
	} = {}) {
		const previousSelectedItemIds = getSelectedItemIds();
		const previousSelectionKey = previousSelectedItemIds.join("|");
		const normalized = getValidSelectionState({
			items,
			selectedItemIds,
			activeItemId,
		});
		recenterDeselectedSingleReferenceImageAnchor(
			previousSelectedItemIds,
			normalized.selectedItemIds,
		);
		const nextSelectionKey = normalized.selectedItemIds.join("|");
		if (previousSelectionKey !== nextSelectionKey) {
			store.referenceImages.selectionAnchor.value = null;
		}
		const nextActiveAssetId =
			activeAssetId ||
			normalized.activeAssetId ||
			(normalized.selectedItemIds.length === 1
				? (store.referenceImages.items.value.find(
						(item) => item.id === normalized.selectedItemIds[0],
					)?.assetId ?? "")
				: "");
		store.referenceImages.selectedItemIds.value = normalized.selectedItemIds;
		store.referenceImages.selectedItemId.value = normalized.activeItemId;
		store.referenceImages.selectedAssetId.value = nextActiveAssetId;
		if (normalized.selectedItemIds.length > 0) {
			lastNonEmptyReferenceSelectionState = {
				selectedItemIds: [...normalized.selectedItemIds],
				activeItemId: normalized.activeItemId,
			};
		}
		if (previousSelectionKey !== nextSelectionKey) {
			if (normalized.selectedItemIds.length > 1) {
				initializeMultiSelectionTransformBox(items);
			} else {
				setStoredSelectionBox(null);
			}
		} else if (normalized.selectedItemIds.length <= 1) {
			setStoredSelectionBox(null);
		}
	}

	function recenterDeselectedSingleReferenceImageAnchor(
		previousSelectedItemIds,
		nextSelectedItemIds,
	) {
		if (
			!Array.isArray(previousSelectedItemIds) ||
			previousSelectedItemIds.length !== 1
		) {
			return false;
		}
		const previousItemId = String(previousSelectedItemIds[0] ?? "").trim();
		if (!previousItemId) {
			return false;
		}
		if (
			Array.isArray(nextSelectedItemIds) &&
			nextSelectedItemIds.length === 1 &&
			String(nextSelectedItemIds[0] ?? "").trim() === previousItemId
		) {
			return false;
		}
		const context = getTransformContext();
		if (!context) {
			return false;
		}
		const item =
			context.resolved.items.find((entry) => entry.id === previousItemId) ??
			null;
		if (!item) {
			return false;
		}
		if (
			Math.abs((item.anchor?.ax ?? 0.5) - 0.5) < 1e-6 &&
			Math.abs((item.anchor?.ay ?? 0.5) - 0.5) < 1e-6
		) {
			return false;
		}
		const asset = context.resolved.assetsById.get(item.assetId) ?? null;
		if (!asset?.sourceMeta) {
			return false;
		}
		const geometry = buildLogicalItemGeometry(item, asset, context);
		const centeredAnchor = { ax: 0.5, ay: 0.5 };
		const nextAnchorPoint = getPointFromRectLocal({
			left: geometry.left,
			top: geometry.top,
			width: geometry.logicalWidth,
			height: geometry.logicalHeight,
			localX: centeredAnchor.ax,
			localY: centeredAnchor.ay,
			anchorAx: geometry.item.anchor.ax,
			anchorAy: geometry.item.anchor.ay,
			rotationDeg: geometry.item.rotationDeg,
		});
		const nextItemAnchorPx = {
			x: context.outputSize.w * centeredAnchor.ax,
			y: context.outputSize.h * centeredAnchor.ay,
		};
		const nextEffectiveOffset = {
			x: nextItemAnchorPx.x - nextAnchorPoint.x,
			y: nextItemAnchorPx.y - nextAnchorPoint.y,
		};
		const nextOffset = removeRenderBoxOffsetCorrection(
			nextEffectiveOffset,
			centeredAnchor,
			context.resolved.preset.baseRenderBox,
			context.outputSize,
			context.renderBoxAnchor,
			context.resolved.override?.renderBoxCorrection ?? null,
		);
		return updateResolvedReferenceImageItem(previousItemId, {
			anchor: centeredAnchor,
			offsetPx: {
				x: nextOffset.x,
				y: nextOffset.y,
			},
		});
	}

	function clearSelection() {
		referenceListSelectionAnchorId = "";
		store.referenceImages.selectionAnchor.value = null;
		setStoredSelectionBox(null);
		setSelectionState({
			selectedItemIds: [],
			activeItemId: "",
			activeAssetId: "",
		});
	}

	function ensureEditingSelection() {
		const items = store.referenceImages.items.value;
		if (!Array.isArray(items) || items.length === 0) {
			return false;
		}
		const currentSelectedItemIds = getSelectedItemIds().filter((itemId) =>
			items.some((item) => item.id === itemId),
		);
		if (currentSelectedItemIds.length > 0) {
			return false;
		}
		const rememberedSelectedItemIds = (
			lastNonEmptyReferenceSelectionState.selectedItemIds ?? []
		).filter((itemId) => items.some((item) => item.id === itemId));
		if (rememberedSelectedItemIds.length > 0) {
			const activeItemId = rememberedSelectedItemIds.includes(
				lastNonEmptyReferenceSelectionState.activeItemId,
			)
				? lastNonEmptyReferenceSelectionState.activeItemId
				: rememberedSelectedItemIds[rememberedSelectedItemIds.length - 1];
			setSelectionState({
				items,
				selectedItemIds: rememberedSelectedItemIds,
				activeItemId,
			});
			return true;
		}
		const fallbackItem = items[0] ?? null;
		if (!fallbackItem) {
			return false;
		}
		setSelectionState({
			items,
			selectedItemIds: [fallbackItem.id],
			activeItemId: fallbackItem.id,
			activeAssetId: fallbackItem.assetId,
		});
		return true;
	}

	function parseSelectionOptions(optionsOrEvent = null) {
		if (!optionsOrEvent) {
			return { additive: false, toggle: false, range: false, orderedIds: null };
		}
		if (
			"additive" in optionsOrEvent ||
			"toggle" in optionsOrEvent ||
			"range" in optionsOrEvent ||
			"orderedIds" in optionsOrEvent
		) {
			return {
				additive: Boolean(optionsOrEvent.additive),
				toggle: Boolean(optionsOrEvent.toggle),
				range: Boolean(optionsOrEvent.range),
				orderedIds: Array.isArray(optionsOrEvent.orderedIds)
					? optionsOrEvent.orderedIds
					: null,
			};
		}
		return {
			additive:
				Boolean(optionsOrEvent.shiftKey) ||
				Boolean(optionsOrEvent.metaKey) ||
				Boolean(optionsOrEvent.ctrlKey),
			toggle:
				Boolean(optionsOrEvent.metaKey) || Boolean(optionsOrEvent.ctrlKey),
			range: false,
			orderedIds: null,
		};
	}

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

	function getTransformContext(documentState = getDocument()) {
		const renderBoxElement = renderBox?.current ?? renderBox;
		const outputSize = getOutputSizeState?.();
		const activeShotCameraDocument = getActiveShotCameraDocument?.() ?? null;
		const resolved = getResolvedShotItems(documentState);
		if (
			!renderBoxElement ||
			!outputSize?.width ||
			!outputSize?.height ||
			!resolved?.preset
		) {
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
			documentState,
			resolved,
			outputSize: {
				w: outputSize.width,
				h: outputSize.height,
			},
			renderScaleX: renderBoxWidth / outputSize.width,
			renderScaleY: renderBoxHeight / outputSize.height,
			renderBoxScreenLeft: previewMetrics.left,
			renderBoxScreenTop: previewMetrics.top,
			viewportShellWidth: previewMetrics.viewportShellWidth,
			viewportShellHeight: previewMetrics.viewportShellHeight,
			renderBoxAnchor: getReferenceImageRenderBoxAnchor(
				activeShotCameraDocument?.outputFrame?.anchor ?? "center",
			),
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

	function buildSelectionTransformState() {
		const context = getTransformContext();
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
		const selectedLayers = getRenderableSelectionLayers();
		if (selectedLayers.length === 0) {
			return null;
		}
		let pivot;
		let screenPivot;
		let anchorLocal;
		let selectionBoxLogical;
		let selectionBoxScreen;
		if (geometries.length === 1) {
			const geometry = geometries[0];
			const layer =
				selectedLayers.find((entry) => entry.id === geometry.item.id) ?? null;
			if (!layer) {
				return null;
			}
			anchorLocal = {
				x: geometry.item.anchor.ax,
				y: geometry.item.anchor.ay,
			};
			pivot = {
				x: geometry.anchorPoint.x,
				y: geometry.anchorPoint.y,
			};
			screenPivot = {
				x: layer.leftPx + layer.widthPx * anchorLocal.x,
				y: layer.topPx + layer.heightPx * anchorLocal.y,
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
			selectionBoxScreen = {
				left: layer.leftPx,
				top: layer.topPx,
				width: layer.widthPx,
				height: layer.heightPx,
				rotationDeg: layer.rotationDeg,
				anchorX: anchorLocal.x,
				anchorY: anchorLocal.y,
			};
		} else {
			const storedSelectionBox =
				store.referenceImages.selectionBoxLogical.value ??
				buildSelectionBoxLogicalFromGeometries(geometries);
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
			selectionBoxScreen = projectSelectionBoxLogicalToScreen(
				selectionBoxLogical,
				context,
				anchorLocal,
			);
			if (!selectionBoxScreen) {
				return null;
			}
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

	function applyGeometryUpdates(geometries, updater) {
		const context = getTransformContext();
		if (!context) {
			return false;
		}
		const nextById = new Map();
		for (const geometry of geometries) {
			const nextPatch = updater(geometry, context);
			if (!nextPatch) {
				continue;
			}
			const currentItem =
				context.resolved.items.find((item) => item.id === geometry.item.id) ??
				geometry.item;
			nextById.set(
				geometry.item.id,
				createReferenceImageItem({
					...currentItem,
					...nextPatch,
				}),
			);
		}
		if (nextById.size === 0) {
			return false;
		}
		const nextItems = context.resolved.items.map(
			(item) => nextById.get(item.id) ?? item,
		);
		return commitResolvedItems(
			context.documentState,
			context.resolved,
			nextItems,
		);
	}

	function applyReferenceImageSelectionMoveDelta(
		selectionState,
		deltaLogicalX,
		deltaLogicalY,
	) {
		if (!selectionState) {
			return false;
		}
		if (selectionState.geometries.length > 1) {
			setStoredSelectionBox(
				{
					...selectionState.selectionBoxLogical,
					left: selectionState.selectionBoxLogical.left + deltaLogicalX,
					top: selectionState.selectionBoxLogical.top + deltaLogicalY,
				},
				selectionState.context,
				selectionState.anchorLocal,
			);
		}
		return applyGeometryUpdates(
			selectionState.geometries,
			(geometry, context) => {
				const nextEffectiveOffset = {
					x: geometry.effectiveOffset.x - deltaLogicalX,
					y: geometry.effectiveOffset.y - deltaLogicalY,
				};
				const nextOffset = removeRenderBoxOffsetCorrection(
					nextEffectiveOffset,
					geometry.item.anchor,
					context.resolved.preset.baseRenderBox,
					context.outputSize,
					context.renderBoxAnchor,
					context.resolved.override?.renderBoxCorrection ?? null,
				);
				return {
					offsetPx: {
						x: Math.round(nextOffset.x),
						y: Math.round(nextOffset.y),
					},
				};
			},
		);
	}

	function applyReferenceImageSelectionRotationDelta(
		selectionState,
		deltaAngleDeg,
	) {
		if (!selectionState) {
			return false;
		}
		const deltaAngleRad = (deltaAngleDeg * Math.PI) / 180;
		const pivot = selectionState.pivot;
		if (selectionState.geometries.length > 1) {
			setStoredSelectionBox(
				{
					...selectionState.selectionBoxLogical,
					rotationDeg:
						(selectionState.selectionBoxLogical.rotationDeg ?? 0) +
						deltaAngleDeg,
				},
				selectionState.context,
				selectionState.anchorLocal,
			);
		}
		return applyGeometryUpdates(
			selectionState.geometries,
			(geometry, context) => {
				const deltaX = geometry.anchorPoint.x - pivot.x;
				const deltaY = geometry.anchorPoint.y - pivot.y;
				const cosine = Math.cos(deltaAngleRad);
				const sine = Math.sin(deltaAngleRad);
				const nextAnchorPoint = {
					x: pivot.x + deltaX * cosine - deltaY * sine,
					y: pivot.y + deltaX * sine + deltaY * cosine,
				};
				const nextEffectiveOffset = {
					x: geometry.itemAnchorPx.x - nextAnchorPoint.x,
					y: geometry.itemAnchorPx.y - nextAnchorPoint.y,
				};
				const nextOffset = removeRenderBoxOffsetCorrection(
					nextEffectiveOffset,
					geometry.item.anchor,
					context.resolved.preset.baseRenderBox,
					context.outputSize,
					context.renderBoxAnchor,
					context.resolved.override?.renderBoxCorrection ?? null,
				);
				return {
					rotationDeg: geometry.item.rotationDeg + deltaAngleDeg,
					offsetPx: {
						x: Math.round(nextOffset.x),
						y: Math.round(nextOffset.y),
					},
				};
			},
		);
	}

	function applyReferenceImageSelectionScaleRatio(
		selectionState,
		scaleRatio,
		pivotOverride = null,
	) {
		if (!selectionState) {
			return false;
		}
		const pivot = pivotOverride ?? selectionState.pivot;
		if (selectionState.geometries.length > 1) {
			const nextWidth = Math.max(
				selectionState.selectionBoxLogical.width * scaleRatio,
				1e-6,
			);
			const nextHeight = Math.max(
				selectionState.selectionBoxLogical.height * scaleRatio,
				1e-6,
			);
			const nextSelectionPivot = {
				x: pivot.x + (selectionState.pivot.x - pivot.x) * scaleRatio,
				y: pivot.y + (selectionState.pivot.y - pivot.y) * scaleRatio,
			};
			setStoredSelectionBox(
				{
					...selectionState.selectionBoxLogical,
					left: nextSelectionPivot.x - nextWidth * selectionState.anchorLocal.x,
					top: nextSelectionPivot.y - nextHeight * selectionState.anchorLocal.y,
					width: nextWidth,
					height: nextHeight,
				},
				selectionState.context,
				selectionState.anchorLocal,
			);
		}
		return applyGeometryUpdates(
			selectionState.geometries,
			(geometry, context) => {
				const nextAnchorPoint = {
					x: pivot.x + (geometry.anchorPoint.x - pivot.x) * scaleRatio,
					y: pivot.y + (geometry.anchorPoint.y - pivot.y) * scaleRatio,
				};
				const nextEffectiveOffset = {
					x: geometry.itemAnchorPx.x - nextAnchorPoint.x,
					y: geometry.itemAnchorPx.y - nextAnchorPoint.y,
				};
				const nextOffset = removeRenderBoxOffsetCorrection(
					nextEffectiveOffset,
					geometry.item.anchor,
					context.resolved.preset.baseRenderBox,
					context.outputSize,
					context.renderBoxAnchor,
					context.resolved.override?.renderBoxCorrection ?? null,
				);
				return {
					scalePct: geometry.item.scalePct * scaleRatio,
					offsetPx: {
						x: Math.round(nextOffset.x),
						y: Math.round(nextOffset.y),
					},
				};
			},
		);
	}

	function stopReferenceImageDrag({
		shouldCommit = false,
		label = referenceImageDragState?.historyLabel,
	} = {}) {
		if (!referenceImageDragState) {
			return false;
		}
		window.removeEventListener("pointermove", handleReferenceImagePointerMove);
		window.removeEventListener("pointerup", handleReferenceImagePointerUp);
		window.removeEventListener("pointercancel", handleReferenceImagePointerUp);
		if (shouldCommit) {
			commitHistoryTransaction(label);
		} else {
			cancelHistoryTransaction();
		}
		referenceImageDragState = null;
		return true;
	}

	function getDocument() {
		return normalizeReferenceImageDocument(
			store.referenceImages.document.value,
		);
	}

	function setDocument(nextDocument) {
		store.referenceImages.document.value = normalizeReferenceImageDocument(
			nextDocument ?? createDefaultReferenceImageDocument(),
		);
	}

	function getResolvedPreset(documentState = getDocument()) {
		const shotCameraDocument = getActiveShotCameraDocument();
		const presetId = getShotReferenceImagePresetId(
			documentState,
			shotCameraDocument?.referenceImages ?? null,
		);
		return (
			findMutablePresetInDocument(documentState, presetId) ??
			findReferenceImagePreset(documentState, presetId) ??
			findMutablePresetInDocument(
				documentState,
				REFERENCE_IMAGE_DEFAULT_PRESET_ID,
			) ??
			findReferenceImagePreset(
				documentState,
				REFERENCE_IMAGE_DEFAULT_PRESET_ID,
			) ??
			documentState?.presets?.[0] ??
			null
		);
	}

	function getResolvedShotItems(documentState = getDocument()) {
		const activeShotCameraDocument = getActiveShotCameraDocument?.() ?? null;
		return resolveReferenceImageItemsForShot(
			documentState,
			activeShotCameraDocument?.referenceImages ?? null,
		);
	}

	function ensureActiveShotPresetBinding(presetId) {
		const activeShotCameraDocument = getActiveShotCameraDocument();
		if (
			!activeShotCameraDocument ||
			activeShotCameraDocument.referenceImages?.presetId === presetId
		) {
			return;
		}
		updateActiveShotCameraDocument((documentState) => {
			documentState.referenceImages = {
				...(documentState.referenceImages ?? {}),
				presetId,
				overridesByPresetId:
					documentState.referenceImages?.overridesByPresetId ?? {},
			};
			return documentState;
		});
	}

	function updateAllShotCameraReferenceImages(updateState) {
		const currentShotCameras = Array.isArray(store.workspace.shotCameras.value)
			? store.workspace.shotCameras.value
			: [];
		store.workspace.shotCameras.value = currentShotCameras.map(
			(documentState) => {
				const nextDocument = cloneShotCameraDocument(documentState);
				const nextReferenceImages = updateState(
					createShotCameraReferenceImagesState(nextDocument.referenceImages),
					nextDocument,
				);
				nextDocument.referenceImages =
					createShotCameraReferenceImagesState(nextReferenceImages);
				return nextDocument;
			},
		);
	}

	function dropReferencePresetFromAllShotCameras(
		deletedPresetId,
		fallbackPresetId,
	) {
		updateAllShotCameraReferenceImages((referenceImagesState) => {
			const nextState =
				createShotCameraReferenceImagesState(referenceImagesState);
			if (nextState.presetId === deletedPresetId) {
				nextState.presetId = fallbackPresetId ?? null;
			}
			const nextOverrides = {
				...(nextState.overridesByPresetId ?? {}),
			};
			delete nextOverrides[deletedPresetId];
			nextState.overridesByPresetId = nextOverrides;
			return nextState;
		});
	}

	function removeReferenceItemsFromAllShotCameras(presetId, deletedItemIds) {
		if (
			!presetId ||
			!Array.isArray(deletedItemIds) ||
			deletedItemIds.length === 0
		) {
			return;
		}
		const deletedItemIdSet = new Set(
			deletedItemIds
				.map((itemId) => String(itemId ?? "").trim())
				.filter(Boolean),
		);
		if (deletedItemIdSet.size === 0) {
			return;
		}
		updateAllShotCameraReferenceImages((referenceImagesState) => {
			const nextState =
				createShotCameraReferenceImagesState(referenceImagesState);
			const existingOverride =
				nextState.overridesByPresetId?.[presetId] ?? null;
			if (!existingOverride) {
				return nextState;
			}
			const nextOverride =
				createReferenceImageCameraPresetOverride(existingOverride);
			for (const deletedItemId of deletedItemIdSet) {
				delete nextOverride.items[deletedItemId];
				if (nextOverride.activeItemId === deletedItemId) {
					nextOverride.activeItemId = null;
				}
			}
			const nextOverrides = {
				...(nextState.overridesByPresetId ?? {}),
			};
			if (isReferenceImageOverrideEmpty(nextOverride)) {
				delete nextOverrides[presetId];
			} else {
				nextOverrides[presetId] = nextOverride;
			}
			nextState.overridesByPresetId = nextOverrides;
			return nextState;
		});
	}

	function syncSelectionState(documentState, resolved) {
		const assetIds = new Set(
			(documentState?.assets ?? []).map((asset) => asset.id),
		);
		let nextSelectedAssetId = store.referenceImages.selectedAssetId.value;
		if (!assetIds.has(nextSelectedAssetId)) {
			nextSelectedAssetId = "";
		}
		const normalized = getValidSelectionState({
			items: resolved?.items ?? [],
			selectedItemIds: getSelectedItemIds(),
			activeItemId: store.referenceImages.selectedItemId.value,
		});
		if (!normalized.activeItemId && nextSelectedAssetId) {
			const matchingItems = (resolved?.items ?? []).filter(
				(item) => item.assetId === nextSelectedAssetId,
			);
			normalized.selectedItemIds = matchingItems.map((item) => item.id);
			normalized.activeItemId =
				matchingItems[matchingItems.length - 1]?.id ?? "";
			normalized.activeAssetId = nextSelectedAssetId;
		}
		setSelectionState({
			selectedItemIds: normalized.selectedItemIds,
			activeItemId: normalized.activeItemId,
			activeAssetId: normalized.activeAssetId || nextSelectedAssetId,
		});
	}

	function syncUiState() {
		const documentState = getDocument();
		const resolved = getResolvedShotItems(documentState);
		const resolvedPreset = resolved.preset;
		const assetsById = resolved.assetsById;
		const usageCounts = new Map();
		for (const item of resolved.items) {
			usageCounts.set(item.assetId, (usageCounts.get(item.assetId) ?? 0) + 1);
		}

		store.referenceImages.assetCount.value = documentState.assets.length;
		store.referenceImages.assets.value = documentState.assets.map((asset) => ({
			id: asset.id,
			label: asset.label,
			fileName: asset.sourceMeta?.filename ?? asset.label ?? "",
			sizeLabel: buildReferenceImageSizeLabel(asset.sourceMeta),
			currentCameraCount: usageCounts.get(asset.id) ?? 0,
		}));
		store.referenceImages.presets.value = (documentState.presets ?? []).map(
			(preset) => ({
				id: preset.id,
				name: preset.name,
				itemCount: preset.items.length,
				isBlank: preset.id === REFERENCE_IMAGE_DEFAULT_PRESET_ID,
			}),
		);
		store.referenceImages.panelPresetId.value = resolvedPreset?.id ?? "";
		store.referenceImages.panelPresetName.value = resolvedPreset?.name ?? "";
		store.referenceImages.items.value = resolved.items.map((item) => {
			const asset = assetsById.get(item.assetId) ?? null;
			return {
				id: item.id,
				assetId: item.assetId,
				name: item.name,
				group: item.group,
				order: item.order,
				previewVisible: item.previewVisible,
				exportEnabled: item.exportEnabled,
				opacity: item.opacity,
				scalePct: item.scalePct,
				rotationDeg: item.rotationDeg,
				offsetPx: {
					x: item.offsetPx.x,
					y: item.offsetPx.y,
				},
				anchor: {
					ax: item.anchor.ax,
					ay: item.anchor.ay,
				},
				fileName: asset?.sourceMeta?.filename ?? asset?.label ?? "",
				sizeLabel: buildReferenceImageSizeLabel(asset?.sourceMeta),
			};
		});
		syncSelectionState(documentState, resolved);
		if (!referenceImageDragState && getSelectedItemIds().length > 1) {
			const context = getTransformContext(documentState);
			if (context) {
				const geometries = resolved.items
					.filter((item) => getSelectedItemIds().includes(item.id))
					.map((item) => {
						const asset = resolved.assetsById.get(item.assetId) ?? null;
						if (!asset?.sourceMeta) {
							return null;
						}
						return buildLogicalItemGeometry(item, asset, context);
					})
					.filter(Boolean);
				const storedSelectionBox =
					store.referenceImages.selectionBoxLogical.value ?? null;
				if (
					!storedSelectionBox ||
					!doesSelectionBoxMatchGeometries(storedSelectionBox, geometries)
				) {
					store.referenceImages.selectionAnchor.value = null;
					initializeMultiSelectionTransformBox(
						store.referenceImages.items.value,
					);
				}
			}
		}
	}

	function openReferenceImageFiles() {
		referenceImageInput?.click?.();
	}

	async function appendDecodedReferenceImage({
		documentState,
		preset,
		name,
		group = REFERENCE_IMAGE_GROUP_FRONT,
		order = null,
		previewVisible = true,
		exportEnabled = true,
		opacity = 1,
		scalePct = 100,
		rotationDeg = 0,
		offsetPx = { x: 0, y: 0 },
		anchor = { ax: 0.5, ay: 0.5 },
		sourceFile,
		sourceMeta,
	}) {
		const asset = createReferenceImageAsset({
			label: name,
			source: createProjectFileEmbeddedFileSource({
				kind: REFERENCE_IMAGE_ASSET_KIND,
				file: sourceFile,
				fileName: sourceMeta.filename,
			}),
			sourceMeta,
		});
		documentState.assets.push(asset);
		const item = createReferenceImageItem({
			assetId: asset.id,
			name,
			group,
			order:
				typeof order === "number" && Number.isFinite(order)
					? order
					: preset.items.filter((entry) => entry.group === group).length,
			previewVisible,
			exportEnabled,
			opacity,
			scalePct,
			rotationDeg,
			offsetPx,
			anchor,
		});
		preset.items.push(item);
		return { asset, item };
	}

	async function importStandardReferenceImage(file, documentState, preset) {
		const normalizedFileName = normalizeReferenceImageFileName(file.name);
		const decoded = await decodeReferenceImageBlob(file, normalizedFileName);
		const sourceFile = new File([file], normalizedFileName, {
			type: file.type || getProjectMediaTypeFromFileName(normalizedFileName),
		});
		return appendDecodedReferenceImage({
			documentState,
			preset,
			name: normalizedFileName.replace(/\.[^./\\]+$/, ""),
			sourceFile,
			sourceMeta: decoded.sourceMeta,
		});
	}

	async function importPsdReferenceImage(file, documentState, preset) {
		const layers = await extractReferenceImagePsdLayers(file, file.name);
		const existingGroupCount = preset.items.filter(
			(entry) => entry.group === REFERENCE_IMAGE_GROUP_FRONT,
		).length;
		let lastImported = null;
		for (const [index, layer] of layers.entries()) {
			const layerFileName = normalizeReferenceImageFileName(
				layer.decoded.sourceMeta.filename,
			);
			const sourceFile = new File([layer.decoded.blob], layerFileName, {
				type: layer.decoded.blob.type || "image/png",
			});
			lastImported = await appendDecodedReferenceImage({
				documentState,
				preset,
				name: layer.name,
				group: REFERENCE_IMAGE_GROUP_FRONT,
				order: getReferenceImageOrderForImportIndex(index, existingGroupCount),
				previewVisible: layer.visible,
				exportEnabled: layer.visible,
				opacity: layer.opacity,
				scalePct: 100,
				rotationDeg: 0,
				offsetPx: layer.offsetPx,
				anchor: { ax: 0.5, ay: 0.5 },
				sourceFile,
				sourceMeta: layer.decoded.sourceMeta,
			});
		}
		return lastImported;
	}

	async function importReferenceImageFiles(fileList) {
		const files = Array.from(fileList ?? []).filter(supportsReferenceImageFile);
		if (files.length === 0) {
			return false;
		}
		const nextDocument = cloneReferenceImageDocument(getDocument());
		const preset = ensureWritableReferenceImageImportPreset(
			nextDocument,
			getActiveShotCameraDocument?.() ?? null,
			files[0]?.name ?? "",
		);
		if (!preset) {
			return false;
		}
		ensurePresetBaseRenderBox(preset, getOutputSizeState?.());
		ensureActiveShotPresetBinding(preset.id);
		let lastImportedSelection = null;
		for (const file of files) {
			if (getFileExtension(file.name) === "psd") {
				lastImportedSelection = await importPsdReferenceImage(
					file,
					nextDocument,
					preset,
				);
				continue;
			}
			lastImportedSelection = await importStandardReferenceImage(
				file,
				nextDocument,
				preset,
			);
		}
		normalizeReferenceImageItemOrderInPlace(preset.items);
		setDocument(nextDocument);
		setSelectionState({
			selectedItemIds: lastImportedSelection?.item?.id
				? [lastImportedSelection.item.id]
				: [],
			activeItemId: lastImportedSelection?.item?.id ?? "",
			activeAssetId: lastImportedSelection?.asset?.id ?? "",
			items: preset.items,
		});
		ensureCameraMode?.();
		syncUiState();
		setStatus?.(
			t("status.referenceImagesImported", {
				count: files.length,
			}),
		);
		updateUi?.();
		refreshUiAfterLayout({
			expectedVisibleItems: preset.items.filter(
				(item) => item.previewVisible !== false,
			).length,
		});
		return true;
	}

	function handleReferenceImageInputChange(event) {
		const input = event?.currentTarget ?? event?.target ?? null;
		const files = input?.files;
		if (!files || files.length === 0) {
			return;
		}
		void importReferenceImageFiles(files).finally(() => {
			input.value = "";
		});
	}

	function captureProjectReferenceImagesState() {
		return cloneReferenceImageDocument(getDocument());
	}

	function captureReferenceImageEditorState(options = {}) {
		const includePreviewSessionVisible =
			options?.includePreviewSessionVisible !== false;
		const editorState = {
			selectedItemIds: [...getSelectedItemIds()],
			selectedItemId: String(store.referenceImages.selectedItemId.value ?? ""),
			selectedAssetId: String(
				store.referenceImages.selectedAssetId.value ?? "",
			),
			selectionAnchor:
				store.referenceImages.selectionAnchor.value &&
				Number.isFinite(store.referenceImages.selectionAnchor.value.x) &&
				Number.isFinite(store.referenceImages.selectionAnchor.value.y)
					? {
							x: store.referenceImages.selectionAnchor.value.x,
							y: store.referenceImages.selectionAnchor.value.y,
						}
					: null,
			selectionBoxLogical: store.referenceImages.selectionBoxLogical.value
				? { ...store.referenceImages.selectionBoxLogical.value }
				: null,
			rememberedSelectedItemIds: Array.isArray(
				lastNonEmptyReferenceSelectionState.selectedItemIds,
			)
				? [...lastNonEmptyReferenceSelectionState.selectedItemIds]
				: [],
			rememberedActiveItemId: String(
				lastNonEmptyReferenceSelectionState.activeItemId ?? "",
			),
		};
		if (includePreviewSessionVisible) {
			editorState.previewSessionVisible =
				store.referenceImages.previewSessionVisible.value !== false;
		}
		return editorState;
	}

	function restoreReferenceImageEditorState(editorState = null, options = {}) {
		const preservePreviewSessionVisible =
			options?.preservePreviewSessionVisible === true;
		if (!editorState) {
			if (!preservePreviewSessionVisible) {
				store.referenceImages.previewSessionVisible.value = true;
			}
			clearSelection();
			lastNonEmptyReferenceSelectionState = {
				selectedItemIds: [],
				activeItemId: "",
			};
			return;
		}
		if (!preservePreviewSessionVisible) {
			store.referenceImages.previewSessionVisible.value =
				editorState.previewSessionVisible !== false;
		}
		const selectedItemIds = Array.isArray(editorState.selectedItemIds)
			? editorState.selectedItemIds.map((itemId) => String(itemId ?? "").trim())
			: [];
		const rememberedSelectedItemIds = Array.isArray(
			editorState.rememberedSelectedItemIds,
		)
			? editorState.rememberedSelectedItemIds.map((itemId) =>
					String(itemId ?? "").trim(),
				)
			: [];
		const rememberedActiveItemId = String(
			editorState.rememberedActiveItemId ?? "",
		);
		setSelectionState({
			selectedItemIds,
			activeItemId: editorState.selectedItemId ?? "",
			activeAssetId: editorState.selectedAssetId ?? "",
		});
		lastNonEmptyReferenceSelectionState =
			rememberedSelectedItemIds.length > 0
				? {
						selectedItemIds: rememberedSelectedItemIds,
						activeItemId: rememberedActiveItemId,
					}
				: selectedItemIds.length > 0
					? {
							selectedItemIds: [...selectedItemIds],
							activeItemId: String(editorState.selectedItemId ?? ""),
						}
					: {
							selectedItemIds: [],
							activeItemId: "",
						};
		if (selectedItemIds.length > 1 && editorState.selectionBoxLogical) {
			const nextSelectionAnchor =
				editorState.selectionAnchor &&
				Number.isFinite(editorState.selectionAnchor.x) &&
				Number.isFinite(editorState.selectionAnchor.y)
					? {
							x: editorState.selectionAnchor.x,
							y: editorState.selectionAnchor.y,
						}
					: null;
			store.referenceImages.selectionAnchor.value = nextSelectionAnchor;
			setStoredSelectionBox(
				{ ...editorState.selectionBoxLogical },
				getTransformContext(),
				nextSelectionAnchor,
			);
			return;
		}
		store.referenceImages.selectionAnchor.value = null;
		setStoredSelectionBox(null);
	}

	function applyProjectReferenceImagesState(documentState, options = {}) {
		const editorState = options?.editorState ?? null;
		setDocument(documentState ?? createDefaultReferenceImageDocument());
		store.referenceImages.previewSessionVisible.value =
			editorState?.previewSessionVisible !== false;
		store.referenceImages.exportSessionEnabled.value = true;
		clearSelection();
		syncUiState();
		restoreReferenceImageEditorState(editorState);
		updateUi?.();
		refreshUiAfterLayout({
			expectedVisibleItems: getResolvedPreset()?.items.filter(
				(item) => item.previewVisible !== false,
			).length,
		});
	}

	function clearReferenceImages() {
		setDocument(createDefaultReferenceImageDocument());
		store.referenceImages.previewSessionVisible.value = true;
		store.referenceImages.exportSessionEnabled.value = true;
		clearSelection();
		syncUiState();
		updateUi?.();
	}

	function setPreviewSessionVisible(nextVisible) {
		store.referenceImages.previewSessionVisible.value = nextVisible !== false;
	}

	function setActiveReferenceImagePreset(presetId) {
		const nextPresetId = String(presetId ?? "").trim();
		const documentState = getDocument();
		const nextPreset =
			findMutablePresetInDocument(documentState, nextPresetId) ??
			findMutablePresetInDocument(
				documentState,
				REFERENCE_IMAGE_DEFAULT_PRESET_ID,
			) ??
			null;
		if (!nextPreset) {
			return false;
		}
		documentState.activePresetId = nextPreset.id;
		setDocument(documentState);
		updateActiveShotCameraDocument((shotCameraDocument) => {
			const nextReferenceImages = createShotCameraReferenceImagesState(
				shotCameraDocument.referenceImages,
			);
			nextReferenceImages.presetId = nextPreset.id;
			shotCameraDocument.referenceImages = nextReferenceImages;
			return shotCameraDocument;
		});
		clearSelection();
		syncUiState();
		updateUi?.();
		return true;
	}

	function setActiveReferenceImagePresetName(nextValue) {
		const documentState = cloneReferenceImageDocument(getDocument());
		const activePreset =
			findMutablePresetInDocument(
				documentState,
				documentState.activePresetId,
			) ?? null;
		if (
			!activePreset ||
			activePreset.id === REFERENCE_IMAGE_DEFAULT_PRESET_ID
		) {
			return false;
		}
		const nextName = sanitizeReferenceImagePresetName(
			nextValue,
			activePreset.name || "Reference",
		);
		if (!nextName || nextName === activePreset.name) {
			return false;
		}
		runReferenceImageHistoryAction("reference-image.preset.rename", () => {
			activePreset.name = nextName;
			setDocument(documentState);
			syncUiState();
			updateUi?.();
		});
		return true;
	}

	function deleteActiveReferenceImagePreset() {
		const documentState = cloneReferenceImageDocument(getDocument());
		const activePreset =
			findMutablePresetInDocument(
				documentState,
				documentState.activePresetId,
			) ?? null;
		if (
			!activePreset ||
			activePreset.id === REFERENCE_IMAGE_DEFAULT_PRESET_ID
		) {
			return false;
		}
		const nextPreset =
			findMutablePresetInDocument(
				documentState,
				REFERENCE_IMAGE_DEFAULT_PRESET_ID,
			) ??
			documentState.presets.find((preset) => preset.id !== activePreset.id) ??
			null;
		if (!nextPreset) {
			return false;
		}
		runReferenceImageHistoryAction("reference-image.preset.delete", () => {
			documentState.presets = documentState.presets.filter(
				(preset) => preset.id !== activePreset.id,
			);
			documentState.activePresetId = nextPreset.id;
			pruneUnusedReferenceImageAssetsInDocument(documentState);
			setDocument(documentState);
			dropReferencePresetFromAllShotCameras(activePreset.id, nextPreset.id);
			clearSelection();
			syncUiState();
			updateUi?.();
		});
		return true;
	}

	function duplicateActiveReferenceImagePreset() {
		const documentState = getDocument();
		const resolved = getResolvedShotItems(documentState);
		if (!resolved.preset) {
			return false;
		}
		const nextPreset = createReferenceImagePreset({
			name: buildDuplicatePresetName(resolved.preset.name),
			baseRenderBox: resolved.preset.baseRenderBox,
			items: resolved.items.map((item) => ({
				assetId: item.assetId,
				name: item.name,
				group: item.group,
				order: item.order,
				previewVisible: item.previewVisible,
				exportEnabled: item.exportEnabled,
				opacity: item.opacity,
				scalePct: item.scalePct,
				rotationDeg: item.rotationDeg,
				offsetPx: item.offsetPx,
				anchor: item.anchor,
			})),
		});
		runReferenceImageHistoryAction("reference-image.preset.duplicate", () => {
			const nextDocument = cloneReferenceImageDocument(documentState);
			nextDocument.presets.push(nextPreset);
			nextDocument.activePresetId = nextPreset.id;
			setDocument(nextDocument);
			updateActiveShotCameraDocument((shotCameraDocument) => {
				const nextReferenceImages = createShotCameraReferenceImagesState(
					shotCameraDocument.referenceImages,
				);
				nextReferenceImages.presetId = nextPreset.id;
				shotCameraDocument.referenceImages = nextReferenceImages;
				return shotCameraDocument;
			});
			clearSelection();
			syncUiState();
			updateUi?.();
		});
		return true;
	}

	function deleteSelectedReferenceImageItems(itemIds = null) {
		const documentState = cloneReferenceImageDocument(getDocument());
		const resolved = getResolvedShotItems(documentState);
		const presetId = resolved?.preset?.id ?? null;
		if (!presetId) {
			return false;
		}
		const nextSelectedItemIds =
			Array.isArray(itemIds) && itemIds.length > 0
				? itemIds
				: getSelectedItemIds();
		const deletedItemIdSet = new Set(
			nextSelectedItemIds
				.map((itemId) => String(itemId ?? "").trim())
				.filter(Boolean),
		);
		if (deletedItemIdSet.size === 0) {
			return false;
		}
		const preset = findMutablePresetInDocument(documentState, presetId);
		if (!preset) {
			return false;
		}
		const nextItems = preset.items.filter(
			(item) => !deletedItemIdSet.has(item.id),
		);
		if (nextItems.length === preset.items.length) {
			return false;
		}
		runReferenceImageHistoryAction("reference-image.delete", () => {
			preset.items = nextItems;
			normalizeReferenceImageItemOrderInPlace(preset.items);
			pruneUnusedReferenceImageAssetsInDocument(documentState);
			setDocument(documentState);
			removeReferenceItemsFromAllShotCameras(
				presetId,
				Array.from(deletedItemIdSet),
			);
			clearSelection();
			syncUiState();
			updateUi?.();
		});
		return true;
	}

	function commitResolvedItems(documentState, resolved, nextItems) {
		const presetId = resolved?.preset?.id ?? null;
		if (!presetId) {
			return false;
		}
		const preset = findMutablePresetInDocument(documentState, presetId);
		if (!preset) {
			return false;
		}

		const normalizedItems = normalizeReferenceImageItemOrderInPlace(
			nextItems.map((item) => createReferenceImageItem(item)),
		);
		const baseItemsById = new Map(
			preset.items.map((item) => [item.id, createReferenceImageItem(item)]),
		);
		const nextOverrideItems = {};
		for (const item of normalizedItems) {
			const baseItem = baseItemsById.get(item.id) ?? null;
			if (!baseItem) {
				continue;
			}
			const patch = buildReferenceImageOverridePatch(baseItem, item);
			if (Object.keys(patch).length > 0) {
				nextOverrideItems[item.id] = patch;
			}
		}

		updateActiveShotCameraDocument((shotCameraDocument) => {
			const nextReferenceImages = createShotCameraReferenceImagesState(
				shotCameraDocument.referenceImages,
			);
			nextReferenceImages.presetId = presetId;
			const nextOverride = createReferenceImageCameraPresetOverride(
				nextReferenceImages.overridesByPresetId?.[presetId] ?? null,
			);
			nextOverride.items = nextOverrideItems;
			const nextOverridesByPresetId = {
				...nextReferenceImages.overridesByPresetId,
			};
			if (isReferenceImageOverrideEmpty(nextOverride)) {
				delete nextOverridesByPresetId[presetId];
			} else {
				nextOverridesByPresetId[presetId] = nextOverride;
			}
			nextReferenceImages.overridesByPresetId = nextOverridesByPresetId;
			shotCameraDocument.referenceImages = nextReferenceImages;
			return shotCameraDocument;
		});
		syncUiState();
		updateUi?.();
		return true;
	}

	function updateResolvedReferenceImageItem(itemId, patchOrUpdater) {
		const documentState = getDocument();
		const resolved = getResolvedShotItems(documentState);
		const existingItem =
			resolved.items.find((item) => item.id === itemId) ?? null;
		if (!existingItem || !resolved.preset) {
			return false;
		}
		const nextItems = resolved.items.map((item) => {
			if (item.id !== itemId) {
				return item;
			}
			const patch =
				typeof patchOrUpdater === "function"
					? patchOrUpdater(item)
					: patchOrUpdater;
			return createReferenceImageItem({
				...item,
				...(patch ?? {}),
			});
		});
		return commitResolvedItems(documentState, resolved, nextItems);
	}

	function runReferenceImageHistoryAction(label, applyChange) {
		return runHistoryAction?.(label, applyChange) ?? false;
	}

	function selectReferenceImageAsset(assetId) {
		const nextAssetId = String(assetId ?? "").trim();
		if (!nextAssetId) {
			clearSelection();
			return;
		}
		const matchingItems = store.referenceImages.items.value.filter(
			(item) => item.assetId === nextAssetId,
		);
		setSelectionState({
			selectedItemIds: matchingItems.map((item) => item.id),
			activeItemId: matchingItems[matchingItems.length - 1]?.id ?? "",
			activeAssetId: nextAssetId,
		});
	}

	function selectReferenceImageItem(itemId, optionsOrEvent = null) {
		const nextItemId = String(itemId ?? "").trim();
		if (!nextItemId) {
			clearSelection();
			return;
		}
		const item =
			store.referenceImages.items.value.find(
				(entry) => entry.id === nextItemId,
			) ?? null;
		if (!item) {
			clearSelection();
			return;
		}
		const { additive, toggle, range, orderedIds } =
			parseSelectionOptions(optionsOrEvent);
		if (range) {
			const resolvedOrderedIds = (
				Array.isArray(orderedIds) && orderedIds.length > 0
					? orderedIds
					: store.referenceImages.items.value.map((entry) => entry.id)
			).filter((entryId, index, sourceIds) => {
				return (
					store.referenceImages.items.value.some(
						(entry) => entry.id === entryId,
					) && sourceIds.indexOf(entryId) === index
				);
			});
			const currentSelectedIds = getSelectedItemIds();
			const currentSelectedIdSet = new Set(currentSelectedIds);
			const anchorId =
				referenceListSelectionAnchorId ||
				store.referenceImages.selectedItemId.value ||
				currentSelectedIds.at(-1) ||
				item.id;
			const anchorIndex = resolvedOrderedIds.indexOf(anchorId);
			const targetIndex = resolvedOrderedIds.indexOf(item.id);
			if (anchorIndex === -1 || targetIndex === -1) {
				referenceListSelectionAnchorId = item.id;
				setSelectionState({
					selectedItemIds: [item.id],
					activeItemId: item.id,
					activeAssetId: item.assetId,
				});
				return;
			}

			const rangeStart = Math.min(anchorIndex, targetIndex);
			const rangeEnd = Math.max(anchorIndex, targetIndex);
			const rangeIds = resolvedOrderedIds.slice(rangeStart, rangeEnd + 1);
			const removeRange = currentSelectedIdSet.has(item.id);
			const nextSelectedIds = removeRange
				? currentSelectedIds.filter(
						(selectedId) => !rangeIds.includes(selectedId),
					)
				: Array.from(new Set([...currentSelectedIds, ...rangeIds]));
			const nextActiveItemId = nextSelectedIds.includes(item.id)
				? item.id
				: (nextSelectedIds.at(-1) ?? "");
			const nextActiveAssetId =
				store.referenceImages.items.value.find(
					(entry) => entry.id === nextActiveItemId,
				)?.assetId ?? "";
			setSelectionState({
				selectedItemIds: nextSelectedIds,
				activeItemId: nextActiveItemId,
				activeAssetId: nextActiveAssetId,
			});
			return;
		}
		if (!additive && !toggle) {
			referenceListSelectionAnchorId = item.id;
			setSelectionState({
				selectedItemIds: [item.id],
				activeItemId: item.id,
				activeAssetId: item.assetId,
			});
			return;
		}
		const nextSelectedIds = [...getSelectedItemIds()];
		const existingIndex = nextSelectedIds.indexOf(item.id);
		if (toggle && existingIndex >= 0) {
			nextSelectedIds.splice(existingIndex, 1);
		} else if (existingIndex < 0) {
			nextSelectedIds.push(item.id);
		}
		referenceListSelectionAnchorId =
			nextSelectedIds.length === 0 ? "" : item.id;
		setSelectionState({
			selectedItemIds: nextSelectedIds,
			activeItemId:
				nextSelectedIds.length === 0
					? ""
					: existingIndex >= 0 && toggle
						? (nextSelectedIds[nextSelectedIds.length - 1] ?? "")
						: item.id,
			activeAssetId:
				nextSelectedIds.length === 0
					? ""
					: existingIndex >= 0 && toggle
						? (store.referenceImages.items.value.find(
								(entry) =>
									entry.id === nextSelectedIds[nextSelectedIds.length - 1],
							)?.assetId ?? "")
						: item.assetId,
		});
	}

	function setReferenceImagePreviewVisible(itemId, nextVisible) {
		runReferenceImageHistoryAction("reference-image.preview-visible", () => {
			updateResolvedReferenceImageItem(itemId, {
				previewVisible: nextVisible !== false,
			});
		});
	}

	function setSelectedReferenceImagesPreviewVisible(nextVisible) {
		const selectedItemIdSet = new Set(getSelectedItemIds());
		if (selectedItemIdSet.size === 0) {
			return false;
		}
		const documentState = getDocument();
		const resolved = getResolvedShotItems(documentState);
		runReferenceImageHistoryAction("reference-image.preview-visible", () => {
			const nextItems = resolved.items.map((item) =>
				selectedItemIdSet.has(item.id)
					? createReferenceImageItem({
							...item,
							previewVisible: nextVisible !== false,
						})
					: item,
			);
			commitResolvedItems(documentState, resolved, nextItems);
		});
		return true;
	}

	function setReferenceImageExportEnabled(itemId, nextEnabled) {
		runReferenceImageHistoryAction("reference-image.export-enabled", () => {
			updateResolvedReferenceImageItem(itemId, {
				exportEnabled: nextEnabled !== false,
			});
		});
	}

	function setSelectedReferenceImagesExportEnabled(nextEnabled) {
		const selectedItemIdSet = new Set(getSelectedItemIds());
		if (selectedItemIdSet.size === 0) {
			return false;
		}
		const documentState = getDocument();
		const resolved = getResolvedShotItems(documentState);
		runReferenceImageHistoryAction("reference-image.export-enabled", () => {
			const nextItems = resolved.items.map((item) =>
				selectedItemIdSet.has(item.id)
					? createReferenceImageItem({
							...item,
							exportEnabled: nextEnabled !== false,
						})
					: item,
			);
			commitResolvedItems(documentState, resolved, nextItems);
		});
		return true;
	}

	function setSelectedReferenceImagesOpacity(nextOpacityPercent) {
		const selectedItemIdSet = new Set(getSelectedItemIds());
		if (selectedItemIdSet.size === 0) {
			return false;
		}
		const numericValue = Math.round(Number(nextOpacityPercent));
		if (!Number.isFinite(numericValue)) {
			return false;
		}
		const clampedOpacity = Math.max(0, Math.min(1, numericValue / 100));
		const documentState = getDocument();
		const resolved = getResolvedShotItems(documentState);
		runReferenceImageHistoryAction("reference-image.opacity", () => {
			const nextItems = resolved.items.map((item) =>
				selectedItemIdSet.has(item.id)
					? createReferenceImageItem({
							...item,
							opacity: clampedOpacity,
						})
					: item,
			);
			commitResolvedItems(documentState, resolved, nextItems);
		});
		return true;
	}

	function setReferenceImageOpacity(itemId, nextOpacityPercent) {
		const numericValue = Math.round(Number(nextOpacityPercent));
		if (!Number.isFinite(numericValue)) {
			return;
		}
		runReferenceImageHistoryAction("reference-image.opacity", () => {
			updateResolvedReferenceImageItem(itemId, {
				opacity: Math.max(0, Math.min(1, numericValue / 100)),
			});
		});
	}

	function setReferenceImageScalePct(itemId, nextScalePct) {
		const numericValue = Number(nextScalePct);
		if (!Number.isFinite(numericValue) || numericValue <= 0) {
			return;
		}
		runReferenceImageHistoryAction("reference-image.scale", () => {
			updateResolvedReferenceImageItem(itemId, {
				scalePct: numericValue,
			});
		});
	}

	function setReferenceImageRotationDeg(itemId, nextRotationDeg) {
		const numericValue = Number(nextRotationDeg);
		if (!Number.isFinite(numericValue)) {
			return;
		}
		runReferenceImageHistoryAction("reference-image.rotation", () => {
			updateResolvedReferenceImageItem(itemId, {
				rotationDeg: numericValue,
			});
		});
	}

	function setReferenceImageOffsetPx(itemId, axis, nextOffsetPx) {
		const normalizedAxis = axis === "y" ? "y" : "x";
		const numericValue = Math.round(Number(nextOffsetPx));
		if (!Number.isFinite(numericValue)) {
			return;
		}
		runReferenceImageHistoryAction(
			`reference-image.offset.${normalizedAxis}`,
			() => {
				updateResolvedReferenceImageItem(itemId, (item) => ({
					offsetPx: {
						...item.offsetPx,
						[normalizedAxis]: numericValue,
					},
				}));
			},
		);
	}

	function getReferenceImageLogicalBounds(itemId) {
		const context = getTransformContext();
		if (!context) {
			return null;
		}
		const item =
			context.resolved.items.find((entry) => entry.id === itemId) ?? null;
		if (!item) {
			return null;
		}
		const asset = context.resolved.assetsById.get(item.assetId) ?? null;
		if (!asset?.sourceMeta) {
			return null;
		}
		const geometry = buildLogicalItemGeometry(item, asset, context);
		return {
			left: Number(geometry.bounds?.left ?? geometry.left ?? 0),
			top: Number(geometry.bounds?.top ?? geometry.top ?? 0),
		};
	}

	function offsetReferenceImageBoundsPosition(itemId, axis, deltaValue) {
		const normalizedAxis = axis === "y" ? "y" : "x";
		const numericDelta = Number(deltaValue);
		if (!Number.isFinite(numericDelta) || Math.abs(numericDelta) <= 1e-8) {
			return false;
		}
		const context = getTransformContext();
		if (!context) {
			return false;
		}
		const item =
			context.resolved.items.find((entry) => entry.id === itemId) ?? null;
		if (!item) {
			return false;
		}
		const asset = context.resolved.assetsById.get(item.assetId) ?? null;
		if (!asset?.sourceMeta) {
			return false;
		}
		const geometry = buildLogicalItemGeometry(item, asset, context);
		return (
			runReferenceImageHistoryAction(
				`reference-image.offset.${normalizedAxis}`,
				() => {
					const nextEffectiveOffset = {
						x:
							geometry.effectiveOffset.x -
							(normalizedAxis === "x" ? numericDelta : 0),
						y:
							geometry.effectiveOffset.y -
							(normalizedAxis === "y" ? numericDelta : 0),
					};
					const nextOffset = removeRenderBoxOffsetCorrection(
						nextEffectiveOffset,
						geometry.item.anchor,
						context.resolved.preset.baseRenderBox,
						context.outputSize,
						context.renderBoxAnchor,
						context.resolved.override?.renderBoxCorrection ?? null,
					);
					updateResolvedReferenceImageItem(itemId, {
						offsetPx: {
							x: Math.round(nextOffset.x),
							y: Math.round(nextOffset.y),
						},
					});
				},
			) ?? false
		);
	}

	function setReferenceImageBoundsPosition(itemId, axis, nextBoundValue) {
		const normalizedAxis = axis === "y" ? "y" : "x";
		const numericTarget = Number(nextBoundValue);
		if (!Number.isFinite(numericTarget)) {
			return false;
		}
		const currentBounds = getReferenceImageLogicalBounds(itemId);
		if (!currentBounds) {
			return false;
		}
		const boundsKey = normalizedAxis === "x" ? "left" : "top";
		return offsetReferenceImageBoundsPosition(
			itemId,
			normalizedAxis,
			numericTarget - Number(currentBounds[boundsKey] ?? 0),
		);
	}

	function offsetSelectedReferenceImagesPosition(axis, deltaValue) {
		const normalizedAxis = axis === "y" ? "y" : "x";
		const numericDelta = Number(deltaValue);
		if (!Number.isFinite(numericDelta) || Math.abs(numericDelta) <= 1e-8) {
			return false;
		}
		const selectionState = buildSelectionTransformState();
		if (!selectionState) {
			return false;
		}
		return (
			runReferenceImageHistoryAction(
				`reference-image.offset.${normalizedAxis}`,
				() =>
					applyReferenceImageSelectionMoveDelta(
						selectionState,
						normalizedAxis === "x" ? numericDelta : 0,
						normalizedAxis === "y" ? numericDelta : 0,
					),
			) ?? false
		);
	}

	function offsetSelectedReferenceImagesRotationDeg(deltaAngleDeg) {
		const numericDelta = Number(deltaAngleDeg);
		if (!Number.isFinite(numericDelta) || Math.abs(numericDelta) <= 1e-8) {
			return false;
		}
		const selectionState = buildSelectionTransformState();
		if (!selectionState) {
			return false;
		}
		return (
			runReferenceImageHistoryAction("reference-image.rotation", () =>
				applyReferenceImageSelectionRotationDelta(selectionState, numericDelta),
			) ?? false
		);
	}

	function scaleSelectedReferenceImagesByFactor(scaleFactor) {
		const numericScaleFactor = Number(scaleFactor);
		if (
			!Number.isFinite(numericScaleFactor) ||
			numericScaleFactor <= 0 ||
			Math.abs(numericScaleFactor - 1) <= 1e-8
		) {
			return false;
		}
		const selectionState = buildSelectionTransformState();
		if (!selectionState) {
			return false;
		}
		return (
			runReferenceImageHistoryAction("reference-image.scale", () =>
				applyReferenceImageSelectionScaleRatio(
					selectionState,
					numericScaleFactor,
				),
			) ?? false
		);
	}

	function getSelectedReferenceImageTransformSession() {
		return buildSelectionTransformState();
	}

	function applySelectedReferenceImagesRotationFromSession(
		selectionState,
		totalDeltaAngleDeg,
	) {
		const numericDelta = Number(totalDeltaAngleDeg);
		if (!selectionState || !Number.isFinite(numericDelta)) {
			return false;
		}
		return (
			runReferenceImageHistoryAction("reference-image.rotation", () =>
				applyReferenceImageSelectionRotationDelta(selectionState, numericDelta),
			) ?? false
		);
	}

	function applySelectedReferenceImagesScaleFromSession(
		selectionState,
		totalScaleFactor,
	) {
		const numericScaleFactor = Number(totalScaleFactor);
		if (
			!selectionState ||
			!Number.isFinite(numericScaleFactor) ||
			numericScaleFactor <= 0
		) {
			return false;
		}
		return (
			runReferenceImageHistoryAction("reference-image.scale", () =>
				applyReferenceImageSelectionScaleRatio(
					selectionState,
					numericScaleFactor,
				),
			) ?? false
		);
	}

	function setReferenceImageGroup(itemId, nextGroup) {
		const normalizedGroup =
			nextGroup === REFERENCE_IMAGE_GROUP_BACK
				? REFERENCE_IMAGE_GROUP_BACK
				: REFERENCE_IMAGE_GROUP_FRONT;
		const documentState = getDocument();
		const resolved = getResolvedShotItems(documentState);
		const existingItem =
			resolved.items.find((item) => item.id === itemId) ?? null;
		if (!existingItem) {
			return;
		}
		const nextGroupOrder = resolved.items.filter(
			(item) => item.id !== itemId && item.group === normalizedGroup,
		).length;
		const nextItems = resolved.items.map((item) =>
			item.id === itemId
				? createReferenceImageItem({
						...item,
						group: normalizedGroup,
						order: nextGroupOrder,
					})
				: item,
		);
		runReferenceImageHistoryAction("reference-image.group", () => {
			commitResolvedItems(documentState, resolved, nextItems);
		});
	}

	function setReferenceImageOrder(itemId, nextOrderNumber) {
		const numericValue = Number(nextOrderNumber);
		if (!Number.isFinite(numericValue)) {
			return;
		}
		const targetIndex = Math.max(0, Math.floor(numericValue));
		const documentState = getDocument();
		const resolved = getResolvedShotItems(documentState);
		const existingItem =
			resolved.items.find((item) => item.id === itemId) ?? null;
		if (!existingItem) {
			return;
		}
		const currentGroupItems = resolved.items
			.filter((item) => item.group === existingItem.group && item.id !== itemId)
			.sort((left, right) => left.order - right.order);
		const insertIndex = Math.min(targetIndex, currentGroupItems.length);
		const reorderedGroupItems = [
			...currentGroupItems.slice(0, insertIndex),
			existingItem,
			...currentGroupItems.slice(insertIndex),
		];
		const nextItems = [
			...resolved.items.filter((item) => item.group !== existingItem.group),
			...reorderedGroupItems,
		];
		runReferenceImageHistoryAction("reference-image.order", () => {
			commitResolvedItems(documentState, resolved, nextItems);
		});
	}

	function moveReferenceImageToDisplayTarget(
		itemId,
		targetItemId,
		position = "before",
		orderedIds = null,
	) {
		const draggedItemId = String(itemId ?? "").trim();
		const nextTargetItemId = String(targetItemId ?? "").trim();
		if (
			!draggedItemId ||
			!nextTargetItemId ||
			draggedItemId === nextTargetItemId
		) {
			return false;
		}
		const documentState = getDocument();
		const resolved = getResolvedShotItems(documentState);
		const itemsById = new Map(resolved.items.map((item) => [item.id, item]));
		const draggedItem = itemsById.get(draggedItemId) ?? null;
		const targetItem = itemsById.get(nextTargetItemId) ?? null;
		if (!draggedItem || !targetItem) {
			return false;
		}
		const currentSelectedIds = getSelectedItemIds().filter((selectedId) =>
			itemsById.has(selectedId),
		);
		const movedItemIdSet = new Set(
			currentSelectedIds.includes(draggedItemId)
				? currentSelectedIds
				: [draggedItemId],
		);
		if (movedItemIdSet.has(nextTargetItemId)) {
			return false;
		}
		const displayItems = (
			Array.isArray(orderedIds) && orderedIds.length > 0
				? orderedIds
						.map(
							(entryId) => itemsById.get(String(entryId ?? "").trim()) ?? null,
						)
						.filter(Boolean)
				: getReferenceImageDisplayItems(resolved.items)
		).filter((item, index, source) => source.indexOf(item) === index);
		const movedItems = displayItems
			.filter((item) => movedItemIdSet.has(item.id))
			.map((item) =>
				createReferenceImageItem({
					...item,
					group: targetItem.group,
				}),
			);
		if (movedItems.length === 0) {
			return false;
		}
		const remainingItems = displayItems.filter(
			(item) => !movedItemIdSet.has(item.id),
		);
		const targetIndex = remainingItems.findIndex(
			(item) => item.id === nextTargetItemId,
		);
		if (targetIndex < 0) {
			return false;
		}
		const insertionIndex = position === "after" ? targetIndex + 1 : targetIndex;
		const nextDisplayItems = [
			...remainingItems.slice(0, insertionIndex),
			...movedItems,
			...remainingItems.slice(insertionIndex),
		];
		const rebuildGroupItems = (group) =>
			nextDisplayItems
				.filter((item) => item.group === group)
				.reverse()
				.map((item, index) =>
					createReferenceImageItem({
						...item,
						order: index,
					}),
				);
		const nextItems = [
			...rebuildGroupItems(REFERENCE_IMAGE_GROUP_BACK),
			...rebuildGroupItems(REFERENCE_IMAGE_GROUP_FRONT),
		];
		runReferenceImageHistoryAction("reference-image.order", () => {
			commitResolvedItems(documentState, resolved, nextItems);
		});
		return true;
	}

	function startReferenceImageMove(itemId, event) {
		if (!store.viewportReferenceImageEditMode.value) {
			return false;
		}
		const item =
			store.referenceImages.items.value.find((entry) => entry.id === itemId) ??
			null;
		if (!item || event.button !== 0) {
			return false;
		}
		event.preventDefault();
		event.stopPropagation();

		const selectionOptions = parseSelectionOptions(event);
		if (selectionOptions.additive || selectionOptions.toggle) {
			selectReferenceImageItem(itemId, selectionOptions);
			updateUi?.();
			return true;
		}

		const selectedItemIds = getSelectedItemIds();
		if (!selectedItemIds.includes(item.id)) {
			setSelectionState({
				selectedItemIds: [item.id],
				activeItemId: item.id,
				activeAssetId: item.assetId,
			});
			updateUi?.();
			return true;
		}

		const transformState = buildSelectionTransformState();
		if (!transformState) {
			return false;
		}
		referenceImageDragState = {
			type: "move",
			pointerId: event.pointerId,
			startClientX: event.clientX,
			startClientY: event.clientY,
			selectionState: transformState,
			dragActivated: false,
			historyLabel: "reference-image.move",
		};
		window.addEventListener("pointermove", handleReferenceImagePointerMove);
		window.addEventListener("pointerup", handleReferenceImagePointerUp);
		window.addEventListener("pointercancel", handleReferenceImagePointerUp);
		return true;
	}

	function startReferenceImageResize(handleKey, event) {
		if (!store.viewportReferenceImageEditMode.value) {
			return false;
		}
		if (event.button !== 0) {
			return false;
		}
		const handle = FRAME_RESIZE_HANDLES[handleKey];
		if (!handle) {
			return false;
		}
		event.preventDefault();
		event.stopPropagation();
		const selectionState = buildSelectionTransformState();
		if (
			!selectionState?.selectionBoxScreen ||
			!selectionState.selectionBoxLogical
		) {
			return false;
		}
		const rotationRadians =
			(selectionState.selectionBoxScreen.rotationDeg * Math.PI) / 180;
		const frameAnchorLocal = selectionState.anchorLocal;
		const useSelectionAnchorPivot = event.altKey;
		const anchorLocal = useSelectionAnchorPivot
			? frameAnchorLocal
			: (FRAME_RESIZE_HANDLES[getOppositeFrameResizeHandleKey(handleKey)] ?? {
					x: 0.5,
					y: 0.5,
				});
		const anchorWorld = getPointFromRectLocal({
			left: selectionState.selectionBoxScreen.left,
			top: selectionState.selectionBoxScreen.top,
			width: selectionState.selectionBoxScreen.width,
			height: selectionState.selectionBoxScreen.height,
			localX: anchorLocal.x,
			localY: anchorLocal.y,
			anchorAx: selectionState.selectionBoxScreen.anchorX,
			anchorAy: selectionState.selectionBoxScreen.anchorY,
			rotationDeg: selectionState.selectionBoxScreen.rotationDeg,
		});
		const anchorLogical = getPointFromRectLocal({
			left: selectionState.selectionBoxLogical.left,
			top: selectionState.selectionBoxLogical.top,
			width: selectionState.selectionBoxLogical.width,
			height: selectionState.selectionBoxLogical.height,
			localX: anchorLocal.x,
			localY: anchorLocal.y,
			anchorAx: selectionState.selectionBoxLogical.anchorX,
			anchorAy: selectionState.selectionBoxLogical.anchorY,
			rotationDeg: selectionState.selectionBoxLogical.rotationDeg,
		});
		const resizeAxis = getFrameResizeAxisLocal(
			{
				width: selectionState.selectionBoxScreen.width,
				height: selectionState.selectionBoxScreen.height,
			},
			handleKey,
			anchorLocal,
		);
		if (!resizeAxis) {
			return false;
		}
		const startPointerLocal = inverseRotateVector(
			event.clientX - anchorWorld.x,
			event.clientY - anchorWorld.y,
			rotationRadians,
		);
		beginHistoryTransaction("reference-image.resize");
		referenceImageDragState = {
			type: "resize",
			pointerId: event.pointerId,
			handleKey,
			selectionState,
			selectionBoxScreen: selectionState.selectionBoxScreen,
			rotationRadians,
			anchorLocal,
			anchorWorld,
			anchorLogical,
			resizeAxisX: resizeAxis.x,
			resizeAxisY: resizeAxis.y,
			startProjectionDistance:
				startPointerLocal.x * resizeAxis.x + startPointerLocal.y * resizeAxis.y,
			historyLabel: "reference-image.resize",
		};
		window.addEventListener("pointermove", handleReferenceImagePointerMove);
		window.addEventListener("pointerup", handleReferenceImagePointerUp);
		window.addEventListener("pointercancel", handleReferenceImagePointerUp);
		return true;
	}

	function startReferenceImageRotate(zoneKey, event) {
		if (!store.viewportReferenceImageEditMode.value) {
			return false;
		}
		if (event.button !== 0) {
			return false;
		}
		event.preventDefault();
		event.stopPropagation();
		const selectionState = buildSelectionTransformState();
		if (!selectionState?.screenPivot) {
			return false;
		}
		beginHistoryTransaction("reference-image.rotate");
		referenceImageDragState = {
			type: "rotate",
			pointerId: event.pointerId,
			zoneKey,
			selectionState,
			screenPivot: selectionState.screenPivot,
			startPointerAngleDeg:
				(Math.atan2(
					event.clientY - selectionState.screenPivot.y,
					event.clientX - selectionState.screenPivot.x,
				) *
					180) /
				Math.PI,
			historyLabel: "reference-image.rotate",
		};
		window.addEventListener("pointermove", handleReferenceImagePointerMove);
		window.addEventListener("pointerup", handleReferenceImagePointerUp);
		window.addEventListener("pointercancel", handleReferenceImagePointerUp);
		return true;
	}

	function startReferenceImageAnchorDrag(event) {
		if (!store.viewportReferenceImageEditMode.value) {
			return false;
		}
		if (event.button !== 0) {
			return false;
		}
		event.preventDefault();
		event.stopPropagation();
		const selectionState = buildSelectionTransformState();
		if (
			!selectionState?.selectionBoxScreen ||
			!selectionState.selectionBoxLogical
		) {
			return false;
		}
		if (selectionState.geometries.length === 1) {
			beginHistoryTransaction("reference-image.anchor");
		}
		referenceImageDragState = {
			type: "anchor",
			pointerId: event.pointerId,
			selectionState,
			historyLabel:
				selectionState.geometries.length === 1
					? "reference-image.anchor"
					: null,
		};
		window.addEventListener("pointermove", handleReferenceImagePointerMove);
		window.addEventListener("pointerup", handleReferenceImagePointerUp);
		window.addEventListener("pointercancel", handleReferenceImagePointerUp);
		return true;
	}

	function handleReferenceImagePointerMove(event) {
		if (
			!referenceImageDragState ||
			event.pointerId !== referenceImageDragState.pointerId
		) {
			return;
		}
		event.preventDefault();
		const { selectionState } = referenceImageDragState;
		if (!selectionState) {
			return;
		}
		if (referenceImageDragState.type === "move") {
			const deltaLogicalX =
				(event.clientX - referenceImageDragState.startClientX) /
				selectionState.context.renderScaleX;
			const deltaLogicalY =
				(event.clientY - referenceImageDragState.startClientY) /
				selectionState.context.renderScaleY;
			if (!referenceImageDragState.dragActivated) {
				if (
					Math.hypot(
						event.clientX - referenceImageDragState.startClientX,
						event.clientY - referenceImageDragState.startClientY,
					) < REFERENCE_IMAGE_DRAG_START_THRESHOLD_PX
				) {
					return;
				}
				referenceImageDragState.dragActivated = true;
				beginHistoryTransaction("reference-image.move");
			}
			applyReferenceImageSelectionMoveDelta(
				selectionState,
				deltaLogicalX,
				deltaLogicalY,
			);
			return;
		}

		if (referenceImageDragState.type === "rotate") {
			const nextPointerAngleDeg =
				(Math.atan2(
					event.clientY - referenceImageDragState.screenPivot.y,
					event.clientX - referenceImageDragState.screenPivot.x,
				) *
					180) /
				Math.PI;
			const deltaAngleDeg = normalizeAngleDeltaDeg(
				nextPointerAngleDeg - referenceImageDragState.startPointerAngleDeg,
			);
			applyReferenceImageSelectionRotationDelta(selectionState, deltaAngleDeg);
			return;
		}

		if (referenceImageDragState.type === "resize") {
			const currentPointerLocal = inverseRotateVector(
				event.clientX - referenceImageDragState.anchorWorld.x,
				event.clientY - referenceImageDragState.anchorWorld.y,
				referenceImageDragState.rotationRadians,
			);
			const currentProjection =
				currentPointerLocal.x * referenceImageDragState.resizeAxisX +
				currentPointerLocal.y * referenceImageDragState.resizeAxisY;
			const scaleRatio = Math.max(
				0.01,
				currentProjection /
					Math.max(referenceImageDragState.startProjectionDistance, 1e-6),
			);
			applyReferenceImageSelectionScaleRatio(
				selectionState,
				scaleRatio,
				referenceImageDragState.anchorLogical,
			);
			return;
		}

		if (referenceImageDragState.type === "anchor") {
			const singleGeometry =
				selectionState.geometries.length === 1
					? selectionState.geometries[0]
					: null;
			if (singleGeometry) {
				const clampedPointer = clampPointerToViewportShell(
					event.clientX,
					event.clientY,
					selectionState.context,
				);
				const pointerLogicalX =
					(clampedPointer.x - selectionState.context.renderBoxScreenLeft) /
					selectionState.context.renderScaleX;
				const pointerLogicalY =
					(clampedPointer.y - selectionState.context.renderBoxScreenTop) /
					selectionState.context.renderScaleY;
				const rotationRadians =
					(selectionState.selectionBoxLogical.rotationDeg * Math.PI) / 180;
				const pointerLocal = inverseRotateVector(
					pointerLogicalX - singleGeometry.anchorPoint.x,
					pointerLogicalY - singleGeometry.anchorPoint.y,
					rotationRadians,
				);
				const normalizedAnchor = {
					ax:
						(singleGeometry.anchorPoint.x +
							pointerLocal.x -
							singleGeometry.left) /
						Math.max(singleGeometry.logicalWidth, 1e-6),
					ay:
						(singleGeometry.anchorPoint.y +
							pointerLocal.y -
							singleGeometry.top) /
						Math.max(singleGeometry.logicalHeight, 1e-6),
				};
				applyGeometryUpdates([singleGeometry], (geometry, context) => {
					const nextAnchorPoint = getPointFromRectLocal({
						left: geometry.left,
						top: geometry.top,
						width: geometry.logicalWidth,
						height: geometry.logicalHeight,
						localX: normalizedAnchor.ax,
						localY: normalizedAnchor.ay,
						anchorAx: geometry.item.anchor.ax,
						anchorAy: geometry.item.anchor.ay,
						rotationDeg: geometry.item.rotationDeg,
					});
					const nextItemAnchorPx = {
						x: context.outputSize.w * normalizedAnchor.ax,
						y: context.outputSize.h * normalizedAnchor.ay,
					};
					const nextEffectiveOffset = {
						x: nextItemAnchorPx.x - nextAnchorPoint.x,
						y: nextItemAnchorPx.y - nextAnchorPoint.y,
					};
					const nextOffset = removeRenderBoxOffsetCorrection(
						nextEffectiveOffset,
						normalizedAnchor,
						context.resolved.preset.baseRenderBox,
						context.outputSize,
						context.renderBoxAnchor,
						context.resolved.override?.renderBoxCorrection ?? null,
					);
					return {
						anchor: normalizedAnchor,
						offsetPx: {
							x: nextOffset.x,
							y: nextOffset.y,
						},
					};
				});
				return;
			}
			const { selectionBoxLogical } = selectionState;
			const clampedPointer = clampPointerToViewportShell(
				event.clientX,
				event.clientY,
				selectionState.context,
			);
			const pointerLogicalX =
				(clampedPointer.x - selectionState.context.renderBoxScreenLeft) /
				selectionState.context.renderScaleX;
			const pointerLogicalY =
				(clampedPointer.y - selectionState.context.renderBoxScreenTop) /
				selectionState.context.renderScaleY;
			const rotationRadians =
				((selectionBoxLogical.rotationDeg ?? 0) * Math.PI) / 180;
			const pointerLocal = inverseRotateVector(
				pointerLogicalX - selectionState.pivot.x,
				pointerLogicalY - selectionState.pivot.y,
				rotationRadians,
			);
			const nextSelectionAnchor = {
				x:
					(selectionState.pivot.x + pointerLocal.x - selectionBoxLogical.left) /
					Math.max(selectionBoxLogical.width, 1e-6),
				y:
					(selectionState.pivot.y + pointerLocal.y - selectionBoxLogical.top) /
					Math.max(selectionBoxLogical.height, 1e-6),
			};
			const nextAnchorPoint = getPointFromRectLocal({
				left: selectionBoxLogical.left,
				top: selectionBoxLogical.top,
				width: selectionBoxLogical.width,
				height: selectionBoxLogical.height,
				localX: nextSelectionAnchor.x,
				localY: nextSelectionAnchor.y,
				anchorAx: selectionBoxLogical.anchorX,
				anchorAy: selectionBoxLogical.anchorY,
				rotationDeg: selectionBoxLogical.rotationDeg,
			});
			store.referenceImages.selectionAnchor.value = nextSelectionAnchor;
			setStoredSelectionBox(
				{
					...selectionBoxLogical,
					left:
						nextAnchorPoint.x -
						selectionBoxLogical.width * nextSelectionAnchor.x,
					top:
						nextAnchorPoint.y -
						selectionBoxLogical.height * nextSelectionAnchor.y,
					anchorX: nextSelectionAnchor.x,
					anchorY: nextSelectionAnchor.y,
				},
				selectionState.context,
				nextSelectionAnchor,
			);
			updateUi?.();
		}
	}

	function handleReferenceImagePointerUp(event) {
		if (
			!referenceImageDragState ||
			event.pointerId !== referenceImageDragState.pointerId
		) {
			return;
		}
		event.preventDefault();
		stopReferenceImageDrag({
			shouldCommit:
				referenceImageDragState.type !== "move" ||
				referenceImageDragState.dragActivated,
		});
	}

	syncUiState();

	return {
		openReferenceImageFiles,
		handleReferenceImageInputChange,
		importReferenceImageFiles,
		supportsReferenceImageFile,
		captureProjectReferenceImagesState,
		captureReferenceImageEditorState,
		applyProjectReferenceImagesState,
		clearReferenceImages,
		syncUiState,
		isReferenceImageSelectionActive: () => getSelectedItemIds().length > 0,
		restoreReferenceImageEditorState,
		setPreviewSessionVisible,
		setActiveReferenceImagePreset,
		setActiveReferenceImagePresetName,
		duplicateActiveReferenceImagePreset,
		deleteActiveReferenceImagePreset,
		deleteSelectedReferenceImageItems,
		clearReferenceImageSelection: clearSelection,
		ensureReferenceImageEditingSelection: ensureEditingSelection,
		selectReferenceImageAsset,
		selectReferenceImageItem,
		setReferenceImagePreviewVisible,
		setSelectedReferenceImagesPreviewVisible,
		setReferenceImageExportEnabled,
		setSelectedReferenceImagesExportEnabled,
		setSelectedReferenceImagesOpacity,
		setReferenceImageOpacity,
		scaleSelectedReferenceImagesByFactor,
		applySelectedReferenceImagesScaleFromSession,
		setReferenceImageScalePct,
		offsetSelectedReferenceImagesRotationDeg,
		applySelectedReferenceImagesRotationFromSession,
		setReferenceImageRotationDeg,
		offsetSelectedReferenceImagesPosition,
		offsetReferenceImageBoundsPosition,
		getReferenceImageLogicalBounds,
		getSelectedReferenceImageTransformSession,
		setReferenceImageOffsetPx,
		setReferenceImageBoundsPosition,
		setReferenceImageGroup,
		setReferenceImageOrder,
		moveReferenceImageToDisplayTarget,
		startReferenceImageMove,
		startReferenceImageResize,
		startReferenceImageRotate,
		startReferenceImageAnchorDrag,
		handleReferenceImagePointerMove,
		handleReferenceImagePointerUp,
	};
}
