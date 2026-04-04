import assert from "node:assert/strict";
import { createReferenceImageDocumentOperations } from "../src/controllers/reference-image/document-operations.js";

function clone(value) {
	return structuredClone(value);
}

{
	let documentState = {
		activePresetId: "preset-a",
		presets: [
			{ id: "default", name: "Default", items: [] },
			{ id: "preset-a", name: "Preset A", items: [] },
			{ id: "preset-b", name: "Preset B", items: [] },
		],
	};
	let shotCameraReferenceImages = {
		presetId: "preset-a",
		overridesByPresetId: {},
	};
	let cleared = 0;
	let synced = 0;
	let updated = 0;
	const operations = createReferenceImageDocumentOperations({
		createReferenceImageItem: (item) => ({ ...item }),
		createReferenceImagePreset: (preset) => preset,
		createShotCameraReferenceImagesState: (state) => clone(state),
		createReferenceImageCameraPresetOverride: (state) => ({
			...(state ?? {}),
			items: { ...(state?.items ?? {}) },
		}),
		isReferenceImageOverrideEmpty: () => true,
		buildDuplicatePresetName: (name) => `${name} Copy`,
		buildReferenceImageOverridePatch: () => ({}),
		findMutablePresetInDocument: (nextDocument, presetId) =>
			nextDocument.presets.find((preset) => preset.id === presetId) ?? null,
		sanitizeReferenceImagePresetName: (value) => String(value ?? "").trim(),
		normalizeReferenceImageItemOrderInPlace: (items) => items,
		pruneUnusedReferenceImageAssetsInDocument: () => {},
		referenceImageDefaultPresetId: "default",
		cloneDocument: clone,
		getSelectedItemIds: () => [],
		getDocument: () => documentState,
		getResolvedShotItems: () => ({ preset: null, items: [] }),
		setDocument: (nextDocument) => {
			documentState = nextDocument;
		},
		clearSelection: () => {
			cleared += 1;
		},
		syncUiState: () => {
			synced += 1;
		},
		updateUi: () => {
			updated += 1;
		},
		updateActiveShotCameraDocument: (updater) => {
			const nextDocument = updater({
				referenceImages: shotCameraReferenceImages,
			});
			shotCameraReferenceImages = nextDocument.referenceImages;
			return nextDocument;
		},
		dropReferencePresetFromAllShotCameras: () => {},
		removeReferenceItemsFromAllShotCameras: () => {},
		runHistoryAction: (_label, applyChange) => {
			applyChange();
			return true;
		},
	});

	assert.equal(operations.setActiveReferenceImagePreset("preset-b"), true);
	assert.equal(documentState.activePresetId, "preset-b");
	assert.equal(shotCameraReferenceImages.presetId, "preset-b");
	assert.equal(cleared, 1);
	assert.equal(synced, 1);
	assert.equal(updated, 1);
}

{
	let documentState = {
		activePresetId: "preset-a",
		presets: [
			{
				id: "preset-a",
				name: "Preset A",
				items: [
					{ id: "item-a", assetId: "asset-a", order: 0 },
					{ id: "item-b", assetId: "asset-b", order: 1 },
				],
			},
		],
	};
	let removedPresetId = null;
	let removedItemIds = null;
	const operations = createReferenceImageDocumentOperations({
		createReferenceImageItem: (item) => ({ ...item }),
		createReferenceImagePreset: (preset) => preset,
		createShotCameraReferenceImagesState: (state) => clone(state),
		createReferenceImageCameraPresetOverride: (state) => ({
			...(state ?? {}),
			items: { ...(state?.items ?? {}) },
		}),
		isReferenceImageOverrideEmpty: () => true,
		buildDuplicatePresetName: (name) => `${name} Copy`,
		buildReferenceImageOverridePatch: () => ({}),
		findMutablePresetInDocument: (nextDocument, presetId) =>
			nextDocument.presets.find((preset) => preset.id === presetId) ?? null,
		sanitizeReferenceImagePresetName: (value) => String(value ?? "").trim(),
		normalizeReferenceImageItemOrderInPlace: (items) =>
			items.map((item, index) => ({ ...item, order: index })),
		pruneUnusedReferenceImageAssetsInDocument: () => {},
		referenceImageDefaultPresetId: "default",
		cloneDocument: clone,
		getSelectedItemIds: () => ["item-b"],
		getDocument: () => documentState,
		getResolvedShotItems: (nextDocument) => ({
			preset: nextDocument.presets[0],
			items: nextDocument.presets[0].items,
		}),
		setDocument: (nextDocument) => {
			documentState = nextDocument;
		},
		clearSelection: () => {},
		syncUiState: () => {},
		updateUi: () => {},
		updateActiveShotCameraDocument: (updater) =>
			updater({
				referenceImages: { presetId: "preset-a", overridesByPresetId: {} },
			}),
		dropReferencePresetFromAllShotCameras: () => {},
		removeReferenceItemsFromAllShotCameras: (presetId, itemIds) => {
			removedPresetId = presetId;
			removedItemIds = itemIds;
		},
		runHistoryAction: (_label, applyChange) => {
			applyChange();
			return true;
		},
	});

	assert.equal(operations.deleteSelectedReferenceImageItems(), true);
	assert.deepEqual(documentState.presets[0].items, [
		{ id: "item-a", assetId: "asset-a", order: 0 },
	]);
	assert.equal(removedPresetId, "preset-a");
	assert.deepEqual(removedItemIds, ["item-b"]);
}

console.log(
	"✅ CAMERA_FRAMES reference image document operations tests passed!",
);
