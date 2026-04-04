import assert from "node:assert/strict";
import { createReferenceImageStatePersistence } from "../src/controllers/reference-image/state-persistence.js";

{
	let documentState = { id: "doc-a" };
	let rememberedSelectionState = { selectedItemIds: [], activeItemId: "" };
	const calls = {
		clearSelection: 0,
		setSelectionState: [],
		setStoredSelectionBox: [],
		syncUiState: 0,
		updateUi: 0,
		refreshUiAfterLayout: [],
	};
	const store = {
		referenceImages: {
			selectedItemId: { value: "" },
			selectedAssetId: { value: "" },
			selectedItemIds: { value: [] },
			selectionAnchor: { value: null },
			selectionBoxLogical: { value: null },
			previewSessionVisible: { value: true },
			exportSessionEnabled: { value: false },
		},
	};
	const statePersistence = createReferenceImageStatePersistence({
		store,
		getDocument: () => documentState,
		setDocument: (nextDocument) => {
			documentState = nextDocument;
		},
		getSelectedItemIds: () => [],
		getTransformContext: () => "transform-context",
		getResolvedPreset: () => ({
			items: [
				{ id: "item-a", previewVisible: true },
				{ id: "item-b", previewVisible: false },
			],
		}),
		clearSelection: () => {
			calls.clearSelection += 1;
		},
		setSelectionState: (nextState) => {
			calls.setSelectionState.push(nextState);
		},
		setStoredSelectionBox: (...args) => {
			calls.setStoredSelectionBox.push(args);
		},
		syncUiState: () => {
			calls.syncUiState += 1;
		},
		updateUi: () => {
			calls.updateUi += 1;
		},
		refreshUiAfterLayout: (options) => {
			calls.refreshUiAfterLayout.push(options);
		},
		createEmptyDocument: () => ({ id: "empty-doc" }),
		cloneDocument: (nextDocument) => structuredClone(nextDocument),
		captureEditorStateSnapshot: (nextState) => nextState,
		normalizeEditorStateForRestore: (editorState) => editorState,
		getRememberedSelectionState: () => rememberedSelectionState,
		setRememberedSelectionState: (nextState) => {
			rememberedSelectionState = nextState;
		},
	});

	const nextEditorState = {
		shouldUpdatePreviewSessionVisible: true,
		previewSessionVisible: false,
		hasEditorState: true,
		selectedItemIds: ["item-a", "item-b"],
		selectedItemId: "item-b",
		selectedAssetId: "asset-a",
		selectionAnchor: { x: 0.25, y: 0.75 },
		selectionBoxLogical: { left: 10, top: 20, width: 30, height: 40 },
		rememberedSelectionState: {
			selectedItemIds: ["item-a", "item-b"],
			activeItemId: "item-b",
		},
	};

	statePersistence.applyProjectReferenceImagesState(
		{ id: "project-doc" },
		{ editorState: nextEditorState },
	);

	assert.deepEqual(documentState, { id: "project-doc" });
	assert.equal(store.referenceImages.previewSessionVisible.value, false);
	assert.equal(store.referenceImages.exportSessionEnabled.value, true);
	assert.equal(calls.clearSelection, 1);
	assert.equal(calls.syncUiState, 1);
	assert.equal(calls.updateUi, 1);
	assert.deepEqual(calls.setSelectionState, [
		{
			selectedItemIds: ["item-a", "item-b"],
			activeItemId: "item-b",
			activeAssetId: "asset-a",
		},
	]);
	assert.deepEqual(calls.setStoredSelectionBox, [
		[
			{ left: 10, top: 20, width: 30, height: 40 },
			"transform-context",
			{ x: 0.25, y: 0.75 },
		],
	]);
	assert.deepEqual(calls.refreshUiAfterLayout, [{ expectedVisibleItems: 1 }]);
	assert.deepEqual(rememberedSelectionState, {
		selectedItemIds: ["item-a", "item-b"],
		activeItemId: "item-b",
	});
}

{
	let documentState = { id: "doc-a" };
	let rememberedSelectionState = {
		selectedItemIds: ["item-a"],
		activeItemId: "item-a",
	};
	let clearSelectionCount = 0;
	let syncUiCount = 0;
	let updateUiCount = 0;
	const store = {
		referenceImages: {
			selectedItemId: { value: "" },
			selectedAssetId: { value: "" },
			selectedItemIds: { value: [] },
			selectionAnchor: { value: { x: 0.5, y: 0.5 } },
			selectionBoxLogical: { value: { left: 0, top: 0, width: 1, height: 1 } },
			previewSessionVisible: { value: false },
			exportSessionEnabled: { value: false },
		},
	};
	const statePersistence = createReferenceImageStatePersistence({
		store,
		getDocument: () => documentState,
		setDocument: (nextDocument) => {
			documentState = nextDocument;
		},
		getSelectedItemIds: () => [],
		getTransformContext: () => null,
		getResolvedPreset: () => ({ items: [] }),
		clearSelection: () => {
			clearSelectionCount += 1;
		},
		setSelectionState: () => {},
		setStoredSelectionBox: () => {},
		syncUiState: () => {
			syncUiCount += 1;
		},
		updateUi: () => {
			updateUiCount += 1;
		},
		refreshUiAfterLayout: () => {},
		createEmptyDocument: () => ({ id: "empty-doc" }),
		cloneDocument: (nextDocument) => structuredClone(nextDocument),
		captureEditorStateSnapshot: (nextState) => nextState,
		normalizeEditorStateForRestore: (editorState) => editorState,
		getRememberedSelectionState: () => rememberedSelectionState,
		setRememberedSelectionState: (nextState) => {
			rememberedSelectionState = nextState;
		},
	});

	statePersistence.clearReferenceImages();
	assert.deepEqual(documentState, { id: "empty-doc" });
	assert.equal(store.referenceImages.previewSessionVisible.value, true);
	assert.equal(store.referenceImages.exportSessionEnabled.value, true);
	assert.equal(clearSelectionCount, 1);
	assert.equal(syncUiCount, 1);
	assert.equal(updateUiCount, 1);

	statePersistence.restoreReferenceImageEditorState({
		shouldUpdatePreviewSessionVisible: true,
		previewSessionVisible: false,
		hasEditorState: false,
		rememberedSelectionState: {
			selectedItemIds: ["item-b"],
			activeItemId: "item-b",
		},
	});
	assert.equal(store.referenceImages.previewSessionVisible.value, false);
	assert.deepEqual(rememberedSelectionState, {
		selectedItemIds: ["item-b"],
		activeItemId: "item-b",
	});
	assert.equal(clearSelectionCount, 2);
}

console.log("✅ CAMERA_FRAMES reference image state persistence tests passed!");
