import assert from "node:assert/strict";
import { createHistoryController } from "../src/controllers/history-controller.js";
import {
	createReferenceImageController,
	ensureWritableReferenceImageImportPreset,
} from "../src/controllers/reference-image-controller.js";
import {
	REFERENCE_IMAGE_DEFAULT_PRESET_ID,
	createDefaultReferenceImageDocument,
	createReferenceImageAsset,
	createReferenceImageItem,
	createReferenceImagePreset,
} from "../src/reference-image-model.js";
import { createCameraFramesStore } from "../src/store.js";
import {
	cloneShotCameraDocument,
	createShotCameraDocument,
} from "../src/workspace-model.js";

{
	const documentState = createDefaultReferenceImageDocument();
	const shotCameraDocument = createShotCameraDocument({
		name: "Camera A",
	});
	documentState.activePresetId = REFERENCE_IMAGE_DEFAULT_PRESET_ID;

	const preset = ensureWritableReferenceImageImportPreset(
		documentState,
		shotCameraDocument,
		"board.png",
	);

	assert.notEqual(preset.id, REFERENCE_IMAGE_DEFAULT_PRESET_ID);
	assert.equal(preset.name, "board");
	assert.equal(documentState.activePresetId, preset.id);
	assert.equal(documentState.presets.length, 2);
	assert.equal(documentState.presets[0].id, REFERENCE_IMAGE_DEFAULT_PRESET_ID);
}

{
	const documentState = createDefaultReferenceImageDocument();
	const sharedPreset = createReferenceImagePreset({
		id: "reference-preset-camera-a",
		name: "Camera A",
	});
	documentState.presets.push(sharedPreset);
	documentState.activePresetId = sharedPreset.id;
	const shotCameraDocument = createShotCameraDocument({
		name: "Camera A",
	});
	shotCameraDocument.referenceImages.presetId = sharedPreset.id;

	const preset = ensureWritableReferenceImageImportPreset(
		documentState,
		shotCameraDocument,
		"board.png",
	);

	assert.equal(preset.id, sharedPreset.id);
	assert.equal(documentState.presets.length, 2);
	assert.equal(documentState.activePresetId, sharedPreset.id);
}

function createSourceMeta(filename) {
	return {
		filename,
		mime: "image/png",
		originalSize: { w: 100, h: 100 },
		appliedSize: { w: 100, h: 100 },
		pixelRatio: 1,
		usedOriginal: true,
	};
}

function createTestController() {
	const store = createCameraFramesStore();
	let shotCameraDocument = createShotCameraDocument({
		name: "Camera A",
	});
	const controller = createReferenceImageController({
		store,
		referenceImageInput: null,
		renderBox: null,
		t: (key) => key,
		setStatus: () => {},
		updateUi: () => {},
		ensureCameraMode: () => {},
		getActiveShotCameraDocument: () => shotCameraDocument,
		updateActiveShotCameraDocument: (updater) => {
			shotCameraDocument = updater(shotCameraDocument);
			return shotCameraDocument;
		},
		getOutputSizeState: () => ({ width: 1536, height: 864 }),
		runHistoryAction: (_label, applyChange) => {
			applyChange?.();
			return true;
		},
		beginHistoryTransaction: () => true,
		commitHistoryTransaction: () => true,
		cancelHistoryTransaction: () => {},
	});
	return {
		store,
		controller,
		getShotCameraDocument() {
			return shotCameraDocument;
		},
	};
}

function createTestControllerWithHistory() {
	const store = createCameraFramesStore();
	let shotCameraDocument = createShotCameraDocument({
		name: "Camera A",
	});
	let controller = null;
	const historyController = createHistoryController({
		store,
		captureWorkspaceState: () => ({
			referenceImages: controller.captureProjectReferenceImagesState(),
			referenceImageEditor: controller.captureReferenceImageEditorState(),
			shotCameraDocument: cloneShotCameraDocument(shotCameraDocument),
		}),
		restoreWorkspaceState: (snapshot) => {
			shotCameraDocument = cloneShotCameraDocument(snapshot.shotCameraDocument);
			controller.applyProjectReferenceImagesState(snapshot.referenceImages, {
				editorState: snapshot.referenceImageEditor,
			});
			return true;
		},
		updateUi: () => {},
	});
	controller = createReferenceImageController({
		store,
		referenceImageInput: null,
		renderBox: null,
		t: (key) => key,
		setStatus: () => {},
		updateUi: () => {},
		ensureCameraMode: () => {},
		getActiveShotCameraDocument: () => shotCameraDocument,
		updateActiveShotCameraDocument: (updater) => {
			shotCameraDocument = updater(shotCameraDocument);
			return shotCameraDocument;
		},
		getOutputSizeState: () => ({ width: 1536, height: 864 }),
		runHistoryAction: historyController.runHistoryAction,
		beginHistoryTransaction: historyController.beginHistoryTransaction,
		commitHistoryTransaction: historyController.commitHistoryTransaction,
		cancelHistoryTransaction: historyController.cancelHistoryTransaction,
	});
	return {
		store,
		controller,
		historyController,
		getShotCameraDocument() {
			return shotCameraDocument;
		},
	};
}

{
	const { store, controller, getShotCameraDocument } = createTestController();
	const asset = createReferenceImageAsset({
		id: "reference-asset-a",
		label: "Board",
		sourceMeta: createSourceMeta("board.png"),
	});
	const preset = createReferenceImagePreset({
		id: "reference-preset-board",
		name: "Board",
		items: [
			createReferenceImageItem({
				id: "reference-item-a",
				assetId: asset.id,
				name: "Board Layer",
				group: "front",
				order: 0,
				scalePct: 120,
			}),
		],
	});
	const documentState = createDefaultReferenceImageDocument();
	documentState.assets.push(asset);
	documentState.presets.push(preset);
	documentState.activePresetId = preset.id;
	getShotCameraDocument().referenceImages.presetId = preset.id;
	store.referenceImages.document.value = documentState;
	controller.syncUiState();

	const duplicated = controller.duplicateActiveReferenceImagePreset();

	assert.equal(duplicated, true);
	assert.equal(store.referenceImages.presets.value.length, 3);
	assert.equal(store.referenceImages.panelPresetName.value, "Board Copy");
	assert.notEqual(
		store.referenceImages.panelPresetId.value,
		"reference-preset-board",
	);
	assert.equal(
		getShotCameraDocument().referenceImages.presetId,
		store.referenceImages.panelPresetId.value,
	);
	assert.equal(store.referenceImages.items.value.length, 1);
	assert.equal(store.referenceImages.items.value[0].name, "Board Layer");
	assert.equal(store.referenceImages.items.value[0].assetId, asset.id);
	assert.notEqual(store.referenceImages.items.value[0].id, "reference-item-a");
}

{
	const originalCreateImageBitmap = globalThis.createImageBitmap;
	const originalDocument = globalThis.document;
	const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
	globalThis.createImageBitmap = async () => ({
		width: 100,
		height: 50,
		close() {},
	});
	globalThis.requestAnimationFrame = () => 0;
	globalThis.document = {
		createElement(tagName) {
			assert.equal(tagName, "canvas");
			return {
				width: 0,
				height: 0,
				getContext(kind) {
					assert.equal(kind, "2d");
					return {
						drawImage() {},
					};
				},
			};
		},
	};

	try {
		const { store, controller, getShotCameraDocument } = createTestController();
		const imported = await controller.importReferenceImageFiles([
			new File([new Uint8Array([1, 2, 3])], "board.png", {
				type: "image/png",
			}),
		]);

		assert.equal(imported, true);
		assert.equal(store.referenceImages.assets.value.length, 1);
		assert.equal(store.referenceImages.items.value.length, 1);
		assert.equal(store.referenceImages.items.value[0].name, "board");
		assert.equal(
			getShotCameraDocument().referenceImages.presetId,
			store.referenceImages.panelPresetId.value,
		);
	} finally {
		globalThis.createImageBitmap = originalCreateImageBitmap;
		globalThis.document = originalDocument;
		globalThis.requestAnimationFrame = originalRequestAnimationFrame;
	}
}

{
	const originalCreateImageBitmap = globalThis.createImageBitmap;
	const originalDocument = globalThis.document;
	const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
	globalThis.createImageBitmap = async () => ({
		width: 100,
		height: 50,
		close() {},
	});
	globalThis.requestAnimationFrame = () => 0;
	globalThis.document = {
		createElement(tagName) {
			assert.equal(tagName, "canvas");
			return {
				width: 0,
				height: 0,
				getContext(kind) {
					assert.equal(kind, "2d");
					return {
						drawImage() {},
					};
				},
			};
		},
	};

	try {
		const { store, controller, historyController, getShotCameraDocument } =
			createTestControllerWithHistory();
		const initialPresetId =
			getShotCameraDocument().referenceImages.presetId ?? null;
		const imported = await controller.importReferenceImageFiles([
			new File([new Uint8Array([1, 2, 3])], "undo-target.png", {
				type: "image/png",
			}),
		]);

		assert.equal(imported, true);
		assert.equal(store.referenceImages.assets.value.length, 1);
		assert.equal(historyController.undoHistory(), true);
		assert.equal(store.referenceImages.assets.value.length, 0);
		assert.equal(store.referenceImages.items.value.length, 0);
		assert.equal(
			getShotCameraDocument().referenceImages.presetId ?? null,
			initialPresetId,
		);
		assert.equal(historyController.redoHistory(), true);
		assert.equal(store.referenceImages.assets.value.length, 1);
		assert.equal(store.referenceImages.items.value.length, 1);
		assert.equal(
			getShotCameraDocument().referenceImages.presetId,
			store.referenceImages.panelPresetId.value,
		);
	} finally {
		globalThis.createImageBitmap = originalCreateImageBitmap;
		globalThis.document = originalDocument;
		globalThis.requestAnimationFrame = originalRequestAnimationFrame;
	}
}

console.log("✅ reference image controller tests passed!");
