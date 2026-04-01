import {
	decodeReferenceImageBlob,
	extractReferenceImagePsdLayers,
} from "../../engine/reference-image-loader.js";
import {
	createProjectFileEmbeddedFileSource,
	getProjectMediaTypeFromFileName,
} from "../../project-document.js";
import {
	REFERENCE_IMAGE_ASSET_KIND,
	REFERENCE_IMAGE_GROUP_FRONT,
	cloneReferenceImageDocument,
	createReferenceImageAsset,
	createReferenceImageItem,
	getReferenceImageOrderForImportIndex,
	normalizeReferenceImageFileName,
} from "../../reference-image-model.js";
import {
	ensurePresetBaseRenderBox,
	ensureWritableReferenceImageImportPreset,
	getFileExtension,
	normalizeReferenceImageItemOrderInPlace,
	supportsReferenceImageFile,
} from "./document-helpers.js";

export function createReferenceImageImportRuntime({
	store,
	t,
	setStatus,
	updateUi,
	ensureCameraMode,
	getActiveShotCameraDocument,
	getOutputSizeState,
	getDocument,
	setDocument,
	syncUiState,
	setSelectionState,
	ensureActiveShotPresetBinding,
	beginHistoryTransaction = () => false,
	commitHistoryTransaction = () => false,
	cancelHistoryTransaction = () => {},
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
		const hasHistoryTransaction =
			beginHistoryTransaction("reference-image.import") === true;
		const nextDocument = cloneReferenceImageDocument(getDocument());
		const preset = ensureWritableReferenceImageImportPreset(
			nextDocument,
			getActiveShotCameraDocument?.() ?? null,
			files[0]?.name ?? "",
		);
		if (!preset) {
			if (hasHistoryTransaction) {
				cancelHistoryTransaction();
			}
			return false;
		}
		ensurePresetBaseRenderBox(preset, getOutputSizeState?.());
		try {
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
			ensureActiveShotPresetBinding(preset.id);
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
			if (hasHistoryTransaction) {
				commitHistoryTransaction("reference-image.import");
			}
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
		} catch (error) {
			if (hasHistoryTransaction) {
				cancelHistoryTransaction();
			}
			throw error;
		}
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

	return {
		refreshUiAfterLayout,
		handleReferenceImageInputChange,
		importReferenceImageFiles,
	};
}
