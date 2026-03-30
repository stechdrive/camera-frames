import { ANCHORS, BASE_RENDER_BOX } from "./constants.js";

export const REFERENCE_IMAGE_DOCUMENT_VERSION = 1;
export const REFERENCE_IMAGE_ASSET_KIND = "reference-image";
export const REFERENCE_IMAGE_GROUP_BACK = "back";
export const REFERENCE_IMAGE_GROUP_FRONT = "front";
export const REFERENCE_IMAGE_DEFAULT_PRESET_ID = "reference-preset-blank";
export const REFERENCE_IMAGE_DEFAULT_PRESET_NAME = "(blank)";
export const REFERENCE_IMAGE_MAX_APPLIED_DIM = 16000;
export const REFERENCE_IMAGE_MAX_PREVIEW_DIM = 4096;

function createRandomSuffix() {
	return Math.random().toString(36).slice(2, 10);
}

function createStableId(prefix, counterRef) {
	try {
		const uuid = globalThis.crypto?.randomUUID?.();
		if (typeof uuid === "string" && uuid) {
			return `${prefix}-${uuid}`;
		}
	} catch {
		// ignore
	}

	counterRef.count += 1;
	return `${prefix}-${Date.now().toString(36)}-${counterRef.count.toString(36)}-${createRandomSuffix()}`;
}

const referenceImageCounterRefs = {
	item: { count: 0 },
	preset: { count: 0 },
	asset: { count: 0 },
};

export function createReferenceImageItemId() {
	return createStableId("reference-image", referenceImageCounterRefs.item);
}

export function createReferenceImagePresetId() {
	return createStableId("reference-preset", referenceImageCounterRefs.preset);
}

export function createReferenceImageAssetId() {
	return createStableId("reference-asset", referenceImageCounterRefs.asset);
}

function isFiniteNumber(value) {
	return typeof value === "number" && Number.isFinite(value);
}

function clamp(value, min, max) {
	return Math.max(min, Math.min(max, value));
}

export function normalizeReferenceImageFileName(
	value,
	fallback = "reference.png",
) {
	const candidate = String(value ?? "")
		.trim()
		.replace(/\\/g, "/");
	const fileName = candidate.split("/").pop() ?? "";
	return fileName || fallback;
}

function normalizeReferenceImageSize(value, fallback) {
	const width = Number(value?.w ?? value?.width);
	const height = Number(value?.h ?? value?.height);
	return {
		w:
			isFiniteNumber(width) && width > 0
				? Math.max(1, Math.round(width))
				: fallback.w,
		h:
			isFiniteNumber(height) && height > 0
				? Math.max(1, Math.round(height))
				: fallback.h,
	};
}

function normalizeReferenceImageOpacity(value, fallback = 1) {
	return clamp(isFiniteNumber(value) ? value : fallback, 0, 1);
}

export function normalizeReferenceImageAnchor(
	value,
	fallback = { ax: 0.5, ay: 0.5 },
) {
	const ax = isFiniteNumber(value?.ax ?? value?.x)
		? Number(value.ax ?? value.x)
		: fallback.ax;
	const ay = isFiniteNumber(value?.ay ?? value?.y)
		? Number(value.ay ?? value.y)
		: fallback.ay;
	return { ax, ay };
}

export function getReferenceImageRenderBoxAnchor(anchorKey = "center") {
	const preset = ANCHORS[String(anchorKey ?? "center")] ?? ANCHORS.center;
	return { ax: preset.x, ay: preset.y };
}

export function normalizeReferenceImageOffset(
	value,
	fallback = { x: 0, y: 0 },
) {
	return {
		x: isFiniteNumber(value?.x) ? value.x : fallback.x,
		y: isFiniteNumber(value?.y) ? value.y : fallback.y,
	};
}

export function normalizeReferenceImageSourceMeta(
	value,
	fallbackFileName = "reference.png",
) {
	const originalSize = normalizeReferenceImageSize(value?.originalSize, {
		w: 1,
		h: 1,
	});
	const appliedSize = normalizeReferenceImageSize(
		value?.appliedSize,
		originalSize,
	);
	return {
		filename: normalizeReferenceImageFileName(
			value?.filename,
			fallbackFileName,
		),
		mime:
			typeof value?.mime === "string" && value.mime.trim()
				? value.mime.trim()
				: "application/octet-stream",
		originalSize,
		appliedSize,
		pixelRatio:
			isFiniteNumber(value?.pixelRatio) && value.pixelRatio > 0
				? value.pixelRatio
				: appliedSize.w / Math.max(1, originalSize.w),
		usedOriginal: value?.usedOriginal !== false,
	};
}

export function createReferenceImageAsset(value = null) {
	const {
		id,
		label = "Reference",
		source = null,
		sourceMeta = null,
	} = value ?? {};
	const fileName =
		sourceMeta?.filename ??
		source?.fileName ??
		source?.file?.name ??
		"reference.png";
	return {
		id: id ?? createReferenceImageAssetId(),
		label: String(label ?? fileName).trim() || fileName,
		source,
		sourceMeta: normalizeReferenceImageSourceMeta(sourceMeta, fileName),
	};
}

export function cloneReferenceImageAsset(asset) {
	return {
		...asset,
		source: asset?.source ?? null,
		sourceMeta: normalizeReferenceImageSourceMeta(
			asset?.sourceMeta,
			asset?.label ?? "reference.png",
		),
	};
}

export function normalizeReferenceImageItemGroup(
	value,
	fallback = REFERENCE_IMAGE_GROUP_FRONT,
) {
	return value === REFERENCE_IMAGE_GROUP_BACK
		? REFERENCE_IMAGE_GROUP_BACK
		: fallback;
}

export function createReferenceImageItem(value = null) {
	const {
		id,
		assetId = "",
		name = "Reference",
		group = REFERENCE_IMAGE_GROUP_FRONT,
		order = 0,
		previewVisible = true,
		exportEnabled = true,
		opacity = 1,
		scalePct = 100,
		rotationDeg = 0,
		offsetPx = { x: 0, y: 0 },
		anchor = { ax: 0.5, ay: 0.5 },
	} = value ?? {};
	return {
		id: id ?? createReferenceImageItemId(),
		assetId: String(assetId ?? "").trim(),
		name: String(name ?? "").trim() || "Reference",
		group: normalizeReferenceImageItemGroup(group),
		order: isFiniteNumber(order) ? Math.max(0, Math.floor(order)) : 0,
		previewVisible: previewVisible !== false,
		exportEnabled: exportEnabled !== false,
		opacity: normalizeReferenceImageOpacity(opacity, 1),
		scalePct:
			isFiniteNumber(scalePct) && scalePct > 0
				? clamp(scalePct, 0.1, 100000)
				: 100,
		rotationDeg: isFiniteNumber(rotationDeg) ? rotationDeg : 0,
		offsetPx: normalizeReferenceImageOffset(offsetPx),
		anchor: normalizeReferenceImageAnchor(anchor),
	};
}

export function cloneReferenceImageItem(item) {
	return createReferenceImageItem(item);
}

function compareReferenceImageEntriesForCompositeOrder(left, right) {
	const leftName = String(left?.name ?? "");
	const rightName = String(right?.name ?? "");
	return (
		Number(left?.order ?? 0) - Number(right?.order ?? 0) ||
		leftName.localeCompare(rightName) ||
		String(left?.id ?? "").localeCompare(String(right?.id ?? ""))
	);
}

function getReferenceImageEntriesForCompositeOrder(items = [], group = null) {
	const normalizedGroup =
		group === REFERENCE_IMAGE_GROUP_BACK ||
		group === REFERENCE_IMAGE_GROUP_FRONT
			? group
			: null;
	const sourceItems = Array.isArray(items) ? items : [];
	const grouped = normalizedGroup
		? [normalizedGroup]
		: [REFERENCE_IMAGE_GROUP_BACK, REFERENCE_IMAGE_GROUP_FRONT];
	return grouped.flatMap((currentGroup) =>
		sourceItems
			.filter((item) => item.group === currentGroup)
			.sort(compareReferenceImageEntriesForCompositeOrder),
	);
}

export function getReferenceImageCompositeItems(items = [], group = null) {
	return getReferenceImageEntriesForCompositeOrder(items, group);
}

export function getReferenceImageDisplayItems(items = [], group = null) {
	return [...getReferenceImageEntriesForCompositeOrder(items, group)].reverse();
}

export function getReferenceImageOrderForImportIndex(
	importIndex,
	existingGroupCount = 0,
) {
	const normalizedIndex = Math.max(0, Math.floor(Number(importIndex) || 0));
	const normalizedExistingCount = Math.max(
		0,
		Math.floor(Number(existingGroupCount) || 0),
	);
	return normalizedExistingCount + normalizedIndex;
}

function sortReferenceImageItemsInPlace(items) {
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
	items.splice(0, items.length, ...nextItems);
}

function normalizeReferenceImageOverride(value = {}) {
	const patch = {};
	if (typeof value.name === "string") {
		patch.name = value.name.trim();
	}
	if (
		value.group === REFERENCE_IMAGE_GROUP_BACK ||
		value.group === REFERENCE_IMAGE_GROUP_FRONT
	) {
		patch.group = value.group;
	}
	if (isFiniteNumber(value.order)) {
		patch.order = Math.max(0, Math.floor(value.order));
	}
	if (typeof value.previewVisible === "boolean") {
		patch.previewVisible = value.previewVisible;
	}
	if (typeof value.exportEnabled === "boolean") {
		patch.exportEnabled = value.exportEnabled;
	}
	if (isFiniteNumber(value.opacity)) {
		patch.opacity = normalizeReferenceImageOpacity(value.opacity, 1);
	}
	if (isFiniteNumber(value.scalePct) && value.scalePct > 0) {
		patch.scalePct = clamp(value.scalePct, 0.1, 100000);
	}
	if (isFiniteNumber(value.rotationDeg)) {
		patch.rotationDeg = value.rotationDeg;
	}
	if (value.offsetPx && typeof value.offsetPx === "object") {
		patch.offsetPx = normalizeReferenceImageOffset(value.offsetPx);
	}
	if (value.anchor && typeof value.anchor === "object") {
		patch.anchor = normalizeReferenceImageAnchor(value.anchor);
	}
	return patch;
}

function cloneReferenceImageOverrideMap(items = {}) {
	return Object.fromEntries(
		Object.entries(items)
			.filter(([itemId]) => String(itemId ?? "").trim())
			.map(([itemId, override]) => [
				itemId,
				normalizeReferenceImageOverride(override),
			]),
	);
}

export function createReferenceImagePreset(value = null) {
	const {
		id,
		name = REFERENCE_IMAGE_DEFAULT_PRESET_NAME,
		baseRenderBox = BASE_RENDER_BOX,
		items = [],
	} = value ?? {};
	const normalizedItems = items
		.map((item) => createReferenceImageItem(item))
		.filter((item) => item.assetId);
	sortReferenceImageItemsInPlace(normalizedItems);
	return {
		id:
			id ??
			(name === REFERENCE_IMAGE_DEFAULT_PRESET_NAME
				? REFERENCE_IMAGE_DEFAULT_PRESET_ID
				: createReferenceImagePresetId()),
		name: String(name ?? "").trim() || REFERENCE_IMAGE_DEFAULT_PRESET_NAME,
		baseRenderBox: normalizeReferenceImageSize(baseRenderBox, BASE_RENDER_BOX),
		items: normalizedItems,
	};
}

export function cloneReferenceImagePreset(preset) {
	return createReferenceImagePreset({
		...preset,
		items: (preset?.items ?? []).map(cloneReferenceImageItem),
	});
}

export function createReferenceImageCameraPresetOverride(value = null) {
	const {
		activeItemId = null,
		renderBoxCorrection = { x: 0, y: 0 },
		items = {},
	} = value ?? {};
	return {
		activeItemId:
			typeof activeItemId === "string" && activeItemId ? activeItemId : null,
		renderBoxCorrection: normalizeReferenceImageOffset(renderBoxCorrection),
		items: cloneReferenceImageOverrideMap(items),
	};
}

export function cloneReferenceImageCameraPresetOverride(override) {
	return createReferenceImageCameraPresetOverride(override);
}

export function createShotCameraReferenceImagesState(value = null) {
	const { presetId = null, overridesByPresetId = {} } = value ?? {};
	const normalizedOverrides = Object.fromEntries(
		Object.entries(overridesByPresetId ?? {})
			.filter(([presetIdKey]) => String(presetIdKey ?? "").trim())
			.map(([presetIdKey, override]) => [
				presetIdKey,
				createReferenceImageCameraPresetOverride(override),
			]),
	);
	return {
		presetId: typeof presetId === "string" && presetId ? presetId : null,
		overridesByPresetId: normalizedOverrides,
	};
}

export function cloneShotCameraReferenceImagesState(state) {
	return createShotCameraReferenceImagesState(state);
}

export function createDefaultReferenceImageDocument() {
	return {
		version: REFERENCE_IMAGE_DOCUMENT_VERSION,
		activePresetId: REFERENCE_IMAGE_DEFAULT_PRESET_ID,
		assets: [],
		presets: [createReferenceImagePreset()],
	};
}

function ensureBlankPreset(presets) {
	const blankPreset =
		presets.find((preset) => preset.id === REFERENCE_IMAGE_DEFAULT_PRESET_ID) ??
		null;
	if (blankPreset) {
		blankPreset.name = REFERENCE_IMAGE_DEFAULT_PRESET_NAME;
		return;
	}
	presets.unshift(
		createReferenceImagePreset({
			id: REFERENCE_IMAGE_DEFAULT_PRESET_ID,
			name: REFERENCE_IMAGE_DEFAULT_PRESET_NAME,
		}),
	);
}

export function normalizeReferenceImageDocument(value = {}) {
	const assets = (Array.isArray(value?.assets) ? value.assets : [])
		.map((asset) =>
			createReferenceImageAsset({
				id: asset?.id,
				label: asset?.label,
				source: asset?.source ?? null,
				sourceMeta: asset?.sourceMeta,
			}),
		)
		.filter((asset) => asset.sourceMeta);
	const assetIds = new Set(assets.map((asset) => asset.id));
	const presets = (Array.isArray(value?.presets) ? value.presets : [])
		.map((preset) => cloneReferenceImagePreset(preset))
		.filter(Boolean);
	if (presets.length === 0) {
		presets.push(createReferenceImagePreset());
	}
	ensureBlankPreset(presets);
	for (const preset of presets) {
		preset.items = preset.items.filter((item) => assetIds.has(item.assetId));
		sortReferenceImageItemsInPlace(preset.items);
	}
	const activePresetId =
		typeof value?.activePresetId === "string" &&
		presets.some((preset) => preset.id === value.activePresetId)
			? value.activePresetId
			: presets[0].id;
	return {
		version:
			isFiniteNumber(value?.version) && value.version > 0
				? Math.floor(value.version)
				: REFERENCE_IMAGE_DOCUMENT_VERSION,
		activePresetId,
		assets,
		presets,
	};
}

export function cloneReferenceImageDocument(documentState) {
	const normalizedDocument = normalizeReferenceImageDocument(documentState);
	return {
		version: normalizedDocument.version,
		activePresetId: normalizedDocument.activePresetId,
		assets: normalizedDocument.assets.map(cloneReferenceImageAsset),
		presets: normalizedDocument.presets.map(cloneReferenceImagePreset),
	};
}

export function sanitizeShotCameraReferenceImagesState(
	state = null,
	{ availablePresetIds = [] } = {},
) {
	const normalized = createShotCameraReferenceImagesState(state);
	const allowedPresetIds = new Set(availablePresetIds);
	const filteredOverrides = Object.fromEntries(
		Object.entries(normalized.overridesByPresetId).filter(([presetId]) =>
			allowedPresetIds.size > 0 ? allowedPresetIds.has(presetId) : true,
		),
	);
	return {
		presetId:
			normalized.presetId && allowedPresetIds.has(normalized.presetId)
				? normalized.presetId
				: null,
		overridesByPresetId: filteredOverrides,
	};
}

export function findReferenceImagePreset(documentState, presetId = null) {
	const normalizedDocument = normalizeReferenceImageDocument(documentState);
	const resolvedPresetId =
		typeof presetId === "string" && presetId
			? presetId
			: normalizedDocument.activePresetId;
	return (
		normalizedDocument.presets.find(
			(preset) => preset.id === resolvedPresetId,
		) ??
		normalizedDocument.presets[0] ??
		null
	);
}

export function getShotReferenceImagePresetId(documentState, shotState = null) {
	const preset = findReferenceImagePreset(
		documentState,
		shotState?.presetId ?? REFERENCE_IMAGE_DEFAULT_PRESET_ID,
	);
	return preset?.id ?? null;
}

export function getShotReferenceImagePresetOverride(
	documentState,
	shotState = null,
	presetId = null,
) {
	const resolvedPresetId =
		presetId ?? getShotReferenceImagePresetId(documentState, shotState);
	if (!resolvedPresetId) {
		return createReferenceImageCameraPresetOverride();
	}
	return cloneReferenceImageCameraPresetOverride(
		shotState?.overridesByPresetId?.[resolvedPresetId] ?? null,
	);
}

export function applyRenderBoxOffsetCorrection(
	offsetPx,
	anchor,
	baseRenderBox,
	currentSize,
	renderBoxAnchor,
	renderBoxCorrection,
) {
	const normalizedAnchor = normalizeReferenceImageAnchor(anchor);
	const normalizedBaseRenderBox = normalizeReferenceImageSize(
		baseRenderBox,
		BASE_RENDER_BOX,
	);
	const normalizedCurrentSize = normalizeReferenceImageSize(
		currentSize,
		normalizedBaseRenderBox,
	);
	const normalizedRenderBoxAnchor = normalizeReferenceImageAnchor(
		renderBoxAnchor,
		getReferenceImageRenderBoxAnchor("center"),
	);
	const normalizedCorrection =
		normalizeReferenceImageOffset(renderBoxCorrection);
	const normalizedOffset = normalizeReferenceImageOffset(offsetPx);
	const deltaX =
		(normalizedAnchor.ax - normalizedRenderBoxAnchor.ax) *
		(normalizedCurrentSize.w - normalizedBaseRenderBox.w);
	const deltaY =
		(normalizedAnchor.ay - normalizedRenderBoxAnchor.ay) *
		(normalizedCurrentSize.h - normalizedBaseRenderBox.h);
	return {
		x: normalizedOffset.x + deltaX + normalizedCorrection.x,
		y: normalizedOffset.y + deltaY + normalizedCorrection.y,
	};
}

export function removeRenderBoxOffsetCorrection(
	offsetPx,
	anchor,
	baseRenderBox,
	currentSize,
	renderBoxAnchor,
	renderBoxCorrection,
) {
	const normalizedAnchor = normalizeReferenceImageAnchor(anchor);
	const normalizedBaseRenderBox = normalizeReferenceImageSize(
		baseRenderBox,
		BASE_RENDER_BOX,
	);
	const normalizedCurrentSize = normalizeReferenceImageSize(
		currentSize,
		normalizedBaseRenderBox,
	);
	const normalizedRenderBoxAnchor = normalizeReferenceImageAnchor(
		renderBoxAnchor,
		getReferenceImageRenderBoxAnchor("center"),
	);
	const normalizedCorrection =
		normalizeReferenceImageOffset(renderBoxCorrection);
	const normalizedOffset = normalizeReferenceImageOffset(offsetPx);
	const deltaX =
		(normalizedAnchor.ax - normalizedRenderBoxAnchor.ax) *
		(normalizedCurrentSize.w - normalizedBaseRenderBox.w);
	const deltaY =
		(normalizedAnchor.ay - normalizedRenderBoxAnchor.ay) *
		(normalizedCurrentSize.h - normalizedBaseRenderBox.h);
	return {
		x: normalizedOffset.x - deltaX - normalizedCorrection.x,
		y: normalizedOffset.y - deltaY - normalizedCorrection.y,
	};
}

export function resolveReferenceImageItemsForShot(
	documentState,
	shotState = null,
) {
	const preset = findReferenceImagePreset(
		documentState,
		getShotReferenceImagePresetId(documentState, shotState),
	);
	if (!preset) {
		return {
			preset: null,
			override: createReferenceImageCameraPresetOverride(),
			items: [],
			assetsById: new Map(),
		};
	}
	const normalizedDocument = normalizeReferenceImageDocument(documentState);
	const assetsById = new Map(
		normalizedDocument.assets.map((asset) => [
			asset.id,
			cloneReferenceImageAsset(asset),
		]),
	);
	const override = getShotReferenceImagePresetOverride(
		normalizedDocument,
		shotState,
		preset.id,
	);
	const items = preset.items
		.map((item) => {
			const patch = override.items?.[item.id] ?? null;
			const merged = {
				...cloneReferenceImageItem(item),
				...patch,
				offsetPx: patch?.offsetPx
					? normalizeReferenceImageOffset(patch.offsetPx, item.offsetPx)
					: normalizeReferenceImageOffset(item.offsetPx),
				anchor: patch?.anchor
					? normalizeReferenceImageAnchor(patch.anchor, item.anchor)
					: normalizeReferenceImageAnchor(item.anchor),
			};
			return createReferenceImageItem(merged);
		})
		.filter((item) => assetsById.has(item.assetId));
	sortReferenceImageItemsInPlace(items);
	return {
		preset: cloneReferenceImagePreset(preset),
		override,
		items,
		assetsById,
	};
}
