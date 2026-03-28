import {
	decodeReferenceImageBlob,
	extractReferenceImagePsdLayers,
} from "../engine/reference-image-loader.js";
import {
	createProjectFileEmbeddedFileSource,
	getProjectMediaTypeFromFileName,
} from "../project-document.js";
import {
	REFERENCE_IMAGE_ASSET_KIND,
	REFERENCE_IMAGE_DEFAULT_PRESET_ID,
	REFERENCE_IMAGE_GROUP_BACK,
	REFERENCE_IMAGE_GROUP_FRONT,
	cloneReferenceImageDocument,
	createDefaultReferenceImageDocument,
	createReferenceImageAsset,
	createReferenceImageCameraPresetOverride,
	createReferenceImageItem,
	createReferenceImagePreset,
	createShotCameraReferenceImagesState,
	findReferenceImagePreset,
	getShotReferenceImagePresetId,
	normalizeReferenceImageDocument,
	normalizeReferenceImageFileName,
	resolveReferenceImageItemsForShot,
} from "../reference-image-model.js";

const REFERENCE_IMAGE_EXTENSIONS = new Set([
	"png",
	"jpg",
	"jpeg",
	"webp",
	"psd",
]);

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
	for (const group of [
		REFERENCE_IMAGE_GROUP_BACK,
		REFERENCE_IMAGE_GROUP_FRONT,
	]) {
		items
			.filter((item) => item.group === group)
			.sort(
				(left, right) =>
					left.order - right.order ||
					left.name.localeCompare(right.name) ||
					left.id.localeCompare(right.id),
			)
			.forEach((item, index) => {
				item.order = index;
			});
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
	t,
	setStatus,
	updateUi,
	ensureCameraMode,
	getActiveShotCameraDocument,
	updateActiveShotCameraDocument,
	getOutputSizeState,
}) {
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

	function setSelection(assetId = "", itemId = "") {
		if (store.referenceImages.selectedAssetId.value !== assetId) {
			store.referenceImages.selectedAssetId.value = assetId;
		}
		if (store.referenceImages.selectedItemId.value !== itemId) {
			store.referenceImages.selectedItemId.value = itemId;
		}
	}

	function syncSelectionState(documentState, resolved) {
		const assetIds = new Set(
			(documentState?.assets ?? []).map((asset) => asset.id),
		);
		const itemsById = new Map(
			(resolved?.items ?? []).map((item) => [item.id, item]),
		);
		let nextSelectedAssetId = store.referenceImages.selectedAssetId.value;
		let nextSelectedItemId = store.referenceImages.selectedItemId.value;

		if (!assetIds.has(nextSelectedAssetId)) {
			nextSelectedAssetId = "";
		}
		if (nextSelectedItemId && !itemsById.has(nextSelectedItemId)) {
			nextSelectedItemId = "";
		}
		if (nextSelectedItemId) {
			nextSelectedAssetId =
				itemsById.get(nextSelectedItemId)?.assetId ?? nextSelectedAssetId;
		} else if (nextSelectedAssetId) {
			nextSelectedItemId =
				(resolved?.items ?? []).find(
					(item) => item.assetId === nextSelectedAssetId,
				)?.id ?? "";
		}

		setSelection(nextSelectedAssetId, nextSelectedItemId);
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
				fileName: asset?.sourceMeta?.filename ?? asset?.label ?? "",
				sizeLabel: buildReferenceImageSizeLabel(asset?.sourceMeta),
			};
		});
		syncSelectionState(documentState, resolved);
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
				order: existingGroupCount + (layers.length - index - 1),
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
		setSelection(
			lastImportedSelection?.asset?.id ?? "",
			lastImportedSelection?.item?.id ?? "",
		);
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

	function applyProjectReferenceImagesState(documentState) {
		setDocument(documentState ?? createDefaultReferenceImageDocument());
		store.referenceImages.previewSessionVisible.value = true;
		setSelection("", "");
		syncUiState();
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
		setSelection("", "");
		syncUiState();
		updateUi?.();
	}

	function setPreviewSessionVisible(nextVisible) {
		store.referenceImages.previewSessionVisible.value = nextVisible !== false;
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

	function selectReferenceImageAsset(assetId) {
		const nextAssetId = String(assetId ?? "").trim();
		if (!nextAssetId) {
			setSelection("", "");
			return;
		}
		const matchedItemId =
			store.referenceImages.items.value.find(
				(item) => item.assetId === nextAssetId,
			)?.id ?? "";
		setSelection(nextAssetId, matchedItemId);
	}

	function selectReferenceImageItem(itemId) {
		const nextItemId = String(itemId ?? "").trim();
		if (!nextItemId) {
			setSelection("", "");
			return;
		}
		const item =
			store.referenceImages.items.value.find(
				(entry) => entry.id === nextItemId,
			) ?? null;
		if (!item) {
			setSelection("", "");
			return;
		}
		setSelection(item.assetId, item.id);
	}

	function setReferenceImagePreviewVisible(itemId, nextVisible) {
		updateResolvedReferenceImageItem(itemId, {
			previewVisible: nextVisible !== false,
		});
	}

	function setReferenceImageExportEnabled(itemId, nextEnabled) {
		updateResolvedReferenceImageItem(itemId, {
			exportEnabled: nextEnabled !== false,
		});
	}

	function setReferenceImageOpacity(itemId, nextOpacityPercent) {
		const numericValue = Math.round(Number(nextOpacityPercent));
		if (!Number.isFinite(numericValue)) {
			return;
		}
		updateResolvedReferenceImageItem(itemId, {
			opacity: Math.max(0, Math.min(1, numericValue / 100)),
		});
	}

	function setReferenceImageScalePct(itemId, nextScalePct) {
		const numericValue = Number(nextScalePct);
		if (!Number.isFinite(numericValue) || numericValue <= 0) {
			return;
		}
		updateResolvedReferenceImageItem(itemId, {
			scalePct: numericValue,
		});
	}

	function setReferenceImageRotationDeg(itemId, nextRotationDeg) {
		const numericValue = Number(nextRotationDeg);
		if (!Number.isFinite(numericValue)) {
			return;
		}
		updateResolvedReferenceImageItem(itemId, {
			rotationDeg: numericValue,
		});
	}

	function setReferenceImageOffsetPx(itemId, axis, nextOffsetPx) {
		const normalizedAxis = axis === "y" ? "y" : "x";
		const numericValue = Math.round(Number(nextOffsetPx));
		if (!Number.isFinite(numericValue)) {
			return;
		}
		updateResolvedReferenceImageItem(itemId, (item) => ({
			offsetPx: {
				...item.offsetPx,
				[normalizedAxis]: numericValue,
			},
		}));
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
		commitResolvedItems(documentState, resolved, nextItems);
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
		commitResolvedItems(documentState, resolved, nextItems);
	}

	syncUiState();

	return {
		openReferenceImageFiles,
		handleReferenceImageInputChange,
		importReferenceImageFiles,
		supportsReferenceImageFile,
		captureProjectReferenceImagesState,
		applyProjectReferenceImagesState,
		clearReferenceImages,
		syncUiState,
		setPreviewSessionVisible,
		selectReferenceImageAsset,
		selectReferenceImageItem,
		setReferenceImagePreviewVisible,
		setReferenceImageExportEnabled,
		setReferenceImageOpacity,
		setReferenceImageScalePct,
		setReferenceImageRotationDeg,
		setReferenceImageOffsetPx,
		setReferenceImageGroup,
		setReferenceImageOrder,
	};
}
