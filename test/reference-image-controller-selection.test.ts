import assert from "node:assert/strict";
import { createReferenceImageController } from "../src/controllers/reference-image-controller.js";
import {
	createDefaultReferenceImageDocument,
	createReferenceImageAsset,
	createReferenceImageItem,
	createReferenceImagePreset,
} from "../src/reference-image-model.js";
import { createCameraFramesStore } from "../src/store.js";
import { createShotCameraDocument } from "../src/workspace-model.js";

const originalWindow = globalThis.window;
const originalDocument = globalThis.document;
if (!globalThis.window) {
	globalThis.window = {
		addEventListener() {},
		removeEventListener() {},
	};
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

function createTestController({
	onReferenceImageSelectionCleared = () => {},
	onReferenceImageSelectionActivated = () => {},
} = {}) {
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
		onReferenceImageSelectionCleared,
		onReferenceImageSelectionActivated,
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
		setShotPresetId(presetId) {
			shotCameraDocument.referenceImages.presetId = presetId;
		},
	};
}

{
	const { store, controller, setShotPresetId } = createTestController();
	const assetA = createReferenceImageAsset({
		id: "asset-a",
		label: "A",
		sourceMeta: createSourceMeta("a.png"),
	});
	const assetB = createReferenceImageAsset({
		id: "asset-b",
		label: "B",
		sourceMeta: createSourceMeta("b.png"),
	});
	const preset = createReferenceImagePreset({
		id: "preset-camera-a",
		name: "Camera A",
		items: [
			createReferenceImageItem({
				id: "item-a-1",
				assetId: assetA.id,
				name: "Layer A1",
				order: 0,
			}),
			createReferenceImageItem({
				id: "item-a-2",
				assetId: assetA.id,
				name: "Layer A2",
				order: 1,
			}),
			createReferenceImageItem({
				id: "item-b-1",
				assetId: assetB.id,
				name: "Layer B1",
				order: 2,
			}),
		],
	});
	const documentState = createDefaultReferenceImageDocument();
	documentState.presets.push(preset);
	documentState.assets.push(assetA, assetB);
	documentState.activePresetId = preset.id;
	setShotPresetId(preset.id);
	store.referenceImages.document.value = documentState;
	controller.syncUiState();

	controller.selectReferenceImageItem("item-a-1");
	assert.deepEqual(store.referenceImages.selectedItemIds.value, ["item-a-1"]);
	assert.equal(store.referenceImages.selectedItemId.value, "item-a-1");

	controller.selectReferenceImageItem("item-b-1", { additive: true });
	assert.deepEqual(store.referenceImages.selectedItemIds.value, [
		"item-a-1",
		"item-b-1",
	]);
	assert.equal(store.referenceImages.selectedItemId.value, "item-b-1");

	controller.selectReferenceImageItem("item-a-1", { toggle: true });
	assert.deepEqual(store.referenceImages.selectedItemIds.value, ["item-b-1"]);
	assert.equal(store.referenceImages.selectedItemId.value, "item-b-1");

	controller.selectReferenceImageAsset("asset-a");
	assert.deepEqual(store.referenceImages.selectedItemIds.value, [
		"item-a-1",
		"item-a-2",
	]);
	assert.equal(store.referenceImages.selectedItemId.value, "item-a-2");
}

{
	let clearedCount = 0;
	let activatedCount = 0;
	const { store, controller, setShotPresetId } = createTestController({
		onReferenceImageSelectionCleared: () => {
			clearedCount += 1;
		},
		onReferenceImageSelectionActivated: () => {
			activatedCount += 1;
		},
	});
	const asset = createReferenceImageAsset({
		id: "asset-single-reclick",
		label: "Single Reclick",
		sourceMeta: createSourceMeta("single-reclick.png"),
	});
	const preset = createReferenceImagePreset({
		id: "preset-single-reclick",
		name: "Single Reclick",
		items: [
			createReferenceImageItem({
				id: "item-single-reclick",
				assetId: asset.id,
				name: "Layer",
				order: 0,
			}),
		],
	});
	const documentState = createDefaultReferenceImageDocument();
	documentState.presets.push(preset);
	documentState.assets.push(asset);
	documentState.activePresetId = preset.id;
	setShotPresetId(preset.id);
	store.referenceImages.document.value = documentState;
	controller.syncUiState();

	controller.selectReferenceImageItem("item-single-reclick");
	assert.deepEqual(store.referenceImages.selectedItemIds.value, [
		"item-single-reclick",
	]);
	assert.equal(activatedCount, 1);

	controller.selectReferenceImageItem("item-single-reclick");
	assert.deepEqual(store.referenceImages.selectedItemIds.value, []);
	assert.equal(store.referenceImages.selectedItemId.value, "");
	assert.equal(clearedCount, 1);
}

{
	const { store, controller, setShotPresetId } = createTestController();
	const asset = createReferenceImageAsset({
		id: "asset-inspector-delta",
		label: "Inspector Delta",
		sourceMeta: createSourceMeta("inspector-delta.png"),
	});
	const preset = createReferenceImagePreset({
		id: "preset-inspector-delta",
		name: "Inspector Delta",
		items: [
			createReferenceImageItem({
				id: "item-delta-a",
				assetId: asset.id,
				name: "Layer A",
				order: 0,
				offsetPx: { x: 0, y: 0 },
			}),
			createReferenceImageItem({
				id: "item-delta-b",
				assetId: asset.id,
				name: "Layer B",
				order: 1,
				offsetPx: { x: -200, y: 0 },
			}),
		],
	});
	const documentState = createDefaultReferenceImageDocument();
	documentState.presets.push(preset);
	documentState.assets.push(asset);
	documentState.activePresetId = preset.id;
	setShotPresetId(preset.id);
	store.referenceImages.document.value = documentState;
	controller.syncUiState();

	controller.selectReferenceImageItem("item-delta-a");
	controller.selectReferenceImageItem("item-delta-b", { additive: true });

	assert.deepEqual(store.referenceImages.selectedItemIds.value, [
		"item-delta-a",
		"item-delta-b",
	]);

	const initialInspectorState =
		controller.getSelectedReferenceImageInspectorState();
	assert.ok(initialInspectorState);
	assert.equal(initialInspectorState.offsetXDelta, 0);
	assert.equal(initialInspectorState.offsetYDelta, 0);
	assert.equal(initialInspectorState.rotationDeltaDeg, 0);
	assert.equal(initialInspectorState.scaleDeltaPercent, 0);

	assert.equal(controller.offsetSelectedReferenceImagesPosition("x", 10), true);
	controller.syncUiState();
	const afterMoveInspectorState =
		controller.getSelectedReferenceImageInspectorState();
	assert.ok(afterMoveInspectorState);
	assert.equal(afterMoveInspectorState.offsetXDelta, 10);
	assert.equal(afterMoveInspectorState.offsetYDelta, 0);

	assert.equal(controller.offsetSelectedReferenceImagesRotationDeg(15), true);
	controller.syncUiState();
	const afterRotateInspectorState =
		controller.getSelectedReferenceImageInspectorState();
	assert.ok(afterRotateInspectorState);
	assert.equal(afterRotateInspectorState.offsetXDelta, 10);
	assert.equal(afterRotateInspectorState.offsetYDelta, 0);
	assert.equal(afterRotateInspectorState.rotationDeltaDeg, 15);

	assert.equal(controller.offsetSelectedReferenceImagesPosition("x", 5), true);
	controller.syncUiState();
	const afterSecondMoveInspectorState =
		controller.getSelectedReferenceImageInspectorState();
	assert.ok(afterSecondMoveInspectorState);
	assert.equal(afterSecondMoveInspectorState.offsetXDelta, 15);
	assert.equal(afterSecondMoveInspectorState.offsetYDelta, 0);
	assert.equal(afterSecondMoveInspectorState.rotationDeltaDeg, 15);

	assert.equal(controller.scaleSelectedReferenceImagesByFactor(1.2), true);
	controller.syncUiState();
	const afterScaleInspectorState =
		controller.getSelectedReferenceImageInspectorState();
	assert.ok(afterScaleInspectorState);
	assert.ok(
		Math.abs((afterScaleInspectorState.scaleDeltaPercent ?? 0) - 20) <= 1e-8,
	);
}

{
	const { store, controller, setShotPresetId } = createTestController();
	const asset = createReferenceImageAsset({
		id: "asset-locked-inspector-delta",
		label: "Locked Inspector Delta",
		sourceMeta: createSourceMeta("locked-inspector-delta.png"),
	});
	const preset = createReferenceImagePreset({
		id: "preset-locked-inspector-delta",
		name: "Locked Inspector Delta",
		items: [
			createReferenceImageItem({
				id: "item-locked-a",
				assetId: asset.id,
				name: "Layer A",
				order: 0,
				offsetPx: { x: 0, y: 0 },
			}),
			createReferenceImageItem({
				id: "item-locked-b",
				assetId: asset.id,
				name: "Layer B",
				order: 1,
				offsetPx: { x: -200, y: 0 },
			}),
		],
	});
	const documentState = createDefaultReferenceImageDocument();
	documentState.presets.push(preset);
	documentState.assets.push(asset);
	documentState.activePresetId = preset.id;
	setShotPresetId(preset.id);
	store.referenceImages.document.value = documentState;
	controller.syncUiState();

	controller.selectReferenceImageItem("item-locked-a");
	controller.selectReferenceImageItem("item-locked-b", { additive: true });
	assert.equal(
		controller.beginSelectedReferenceImageInspectorTransformSession(),
		true,
	);
	assert.equal(controller.offsetSelectedReferenceImagesPosition("x", 10), true);
	controller.syncUiState();
	const lockedInspectorState =
		controller.getSelectedReferenceImageInspectorState();
	assert.ok(lockedInspectorState);
	assert.equal(lockedInspectorState.offsetXDelta, 10);
	assert.equal(lockedInspectorState.offsetYDelta, 0);
	assert.equal(
		controller.endSelectedReferenceImageInspectorTransformSession(),
		true,
	);
}

{
	const store = createCameraFramesStore();
	let shotCameraDocument = createShotCameraDocument({
		name: "Camera A",
	});
	const renderBoxElement = {
		clientWidth: 1536,
		clientHeight: 864,
		clientLeft: 0,
		clientTop: 0,
		getBoundingClientRect() {
			return {
				left: 0,
				top: 0,
				width: 1536,
				height: 864,
			};
		},
	};
	globalThis.document = {
		getElementById(id) {
			if (id !== "viewport-shell") {
				return null;
			}
			return {
				getBoundingClientRect() {
					return {
						left: 0,
						top: 0,
						width: 1536,
						height: 864,
					};
				},
			};
		},
	};
	const controller = createReferenceImageController({
		store,
		referenceImageInput: null,
		renderBox: renderBoxElement,
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
	const asset = createReferenceImageAsset({
		id: "asset-late-inspector",
		label: "Late Inspector",
		sourceMeta: createSourceMeta("late-inspector.png"),
	});
	const preset = createReferenceImagePreset({
		id: "preset-late-inspector",
		name: "Late Inspector",
		items: [
			createReferenceImageItem({
				id: "item-late-a",
				assetId: asset.id,
				name: "Layer A",
				order: 0,
				offsetPx: { x: 0, y: 0 },
			}),
			createReferenceImageItem({
				id: "item-late-b",
				assetId: asset.id,
				name: "Layer B",
				order: 1,
				offsetPx: { x: -200, y: 0 },
			}),
		],
	});
	const documentState = createDefaultReferenceImageDocument();
	documentState.assets.push(asset);
	documentState.presets.push(preset);
	documentState.activePresetId = preset.id;
	shotCameraDocument.referenceImages.presetId = preset.id;
	store.referenceImages.document.value = documentState;
	store.viewportToolMode.value = "reference";
	controller.syncUiState();
	store.referenceImages.previewLayers.value = [
		{
			id: "item-late-a",
			leftPx: 718,
			topPx: 382,
			widthPx: 100,
			heightPx: 100,
			anchorAx: 0.5,
			anchorAy: 0.5,
			rotationDeg: 0,
		},
		{
			id: "item-late-b",
			leftPx: 918,
			topPx: 382,
			widthPx: 100,
			heightPx: 100,
			anchorAx: 0.5,
			anchorAy: 0.5,
			rotationDeg: 0,
		},
	];
	controller.selectReferenceImageItem("item-late-a");
	controller.selectReferenceImageItem("item-late-b", { additive: true });

	assert.equal(controller.offsetSelectedReferenceImagesPosition("x", 10), true);
	controller.syncUiState();
	const inspectorState = controller.getSelectedReferenceImageInspectorState();
	assert.ok(inspectorState);
	assert.equal(inspectorState.offsetXDelta, 10);
	assert.equal(inspectorState.offsetYDelta, 0);
}

{
	const store = createCameraFramesStore();
	let shotCameraDocument = createShotCameraDocument({
		name: "Camera A",
	});
	const renderBoxElement = {
		clientWidth: 1536,
		clientHeight: 864,
		clientLeft: 0,
		clientTop: 0,
		getBoundingClientRect() {
			return {
				left: 0,
				top: 0,
				width: 1536,
				height: 864,
			};
		},
	};
	globalThis.document = {
		getElementById(id) {
			if (id !== "viewport-shell") {
				return null;
			}
			return {
				getBoundingClientRect() {
					return {
						left: 0,
						top: 0,
						width: 1536,
						height: 864,
					};
				},
			};
		},
	};
	const controller = createReferenceImageController({
		store,
		referenceImageInput: null,
		renderBox: renderBoxElement,
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
	const asset = createReferenceImageAsset({
		id: "asset-anchor-inspector",
		label: "Anchor Inspector",
		sourceMeta: createSourceMeta("anchor-inspector.png"),
	});
	const preset = createReferenceImagePreset({
		id: "preset-anchor-inspector",
		name: "Anchor Inspector",
		items: [
			createReferenceImageItem({
				id: "item-anchor-a",
				assetId: asset.id,
				name: "Layer A",
				order: 0,
			}),
			createReferenceImageItem({
				id: "item-anchor-b",
				assetId: asset.id,
				name: "Layer B",
				order: 1,
				offsetPx: { x: -200, y: 0 },
			}),
		],
	});
	const documentState = createDefaultReferenceImageDocument();
	documentState.assets.push(asset);
	documentState.presets.push(preset);
	documentState.activePresetId = preset.id;
	shotCameraDocument.referenceImages.presetId = preset.id;
	store.referenceImages.document.value = documentState;
	store.viewportToolMode.value = "reference";
	controller.syncUiState();
	store.referenceImages.previewLayers.value = [
		{
			id: "item-anchor-a",
			leftPx: 718,
			topPx: 382,
			widthPx: 100,
			heightPx: 100,
			anchorAx: 0.5,
			anchorAy: 0.5,
			rotationDeg: 0,
		},
		{
			id: "item-anchor-b",
			leftPx: 918,
			topPx: 382,
			widthPx: 100,
			heightPx: 100,
			anchorAx: 0.5,
			anchorAy: 0.5,
			rotationDeg: 0,
		},
	];
	controller.selectReferenceImageItem("item-anchor-a");
	controller.selectReferenceImageItem("item-anchor-b", { additive: true });

	assert.equal(
		controller.startReferenceImageAnchorDrag({
			button: 0,
			pointerId: 1,
			clientX: 868,
			clientY: 432,
			preventDefault() {},
			stopPropagation() {},
		}),
		true,
	);
	controller.handleReferenceImagePointerMove({
		pointerId: 1,
		clientX: 900,
		clientY: 450,
		preventDefault() {},
	});
	controller.handleReferenceImagePointerUp({
		pointerId: 1,
		preventDefault() {},
	});
	controller.syncUiState();

	const anchoredSelection = {
		selectionAnchor: store.referenceImages.selectionAnchor.value,
		selectionBox: store.referenceImages.selectionBoxLogical.value,
	};
	assert.ok(anchoredSelection.selectionAnchor);
	assert.ok(
		Math.abs(anchoredSelection.selectionAnchor.x - 0.6066666666666667) <= 1e-8,
	);
	assert.ok(Math.abs(anchoredSelection.selectionAnchor.y - 0.68) <= 1e-8);

	controller.beginSelectedReferenceImageInspectorTransformSession();
	assert.equal(controller.offsetSelectedReferenceImagesRotationDeg(15), true);
	controller.syncUiState();
	controller.endSelectedReferenceImageInspectorTransformSession();
	controller.syncUiState();

	assert.deepEqual(
		store.referenceImages.selectionAnchor.value,
		anchoredSelection.selectionAnchor,
	);
	assert.ok(
		Math.abs(
			Number(store.referenceImages.selectionBoxLogical.value?.anchorX ?? 0) -
				anchoredSelection.selectionAnchor.x,
		) <= 1e-8,
	);
	assert.ok(
		Math.abs(
			Number(store.referenceImages.selectionBoxLogical.value?.anchorY ?? 0) -
				anchoredSelection.selectionAnchor.y,
		) <= 1e-8,
	);

	controller.beginSelectedReferenceImageInspectorTransformSession();
	assert.equal(controller.scaleSelectedReferenceImagesByFactor(1.2), true);
	controller.syncUiState();
	controller.endSelectedReferenceImageInspectorTransformSession();
	controller.syncUiState();

	assert.deepEqual(
		store.referenceImages.selectionAnchor.value,
		anchoredSelection.selectionAnchor,
	);
	assert.ok(
		Math.abs(
			Number(store.referenceImages.selectionBoxLogical.value?.anchorX ?? 0) -
				anchoredSelection.selectionAnchor.x,
		) <= 1e-8,
	);
	assert.ok(
		Math.abs(
			Number(store.referenceImages.selectionBoxLogical.value?.anchorY ?? 0) -
				anchoredSelection.selectionAnchor.y,
		) <= 1e-8,
	);

	const rotationSession =
		controller.getSelectedReferenceImageInspectorState()?.session ?? null;
	assert.ok(rotationSession);
	controller.beginSelectedReferenceImageInspectorTransformSession();
	for (let index = 1; index <= 10; index += 1) {
		assert.equal(
			controller.applySelectedReferenceImagesRotationFromSession(
				rotationSession,
				index * 0.5,
			),
			true,
		);
		controller.syncUiState();
	}
	controller.endSelectedReferenceImageInspectorTransformSession();
	controller.syncUiState();

	assert.deepEqual(
		store.referenceImages.selectionAnchor.value,
		anchoredSelection.selectionAnchor,
	);
	assert.ok(
		Math.abs(
			Number(store.referenceImages.selectionBoxLogical.value?.anchorX ?? 0) -
				anchoredSelection.selectionAnchor.x,
		) <= 1e-8,
	);
	assert.ok(
		Math.abs(
			Number(store.referenceImages.selectionBoxLogical.value?.anchorY ?? 0) -
				anchoredSelection.selectionAnchor.y,
		) <= 1e-8,
	);

	const scaleSession =
		controller.getSelectedReferenceImageInspectorState()?.session ?? null;
	assert.ok(scaleSession);
	controller.beginSelectedReferenceImageInspectorTransformSession();
	for (let index = 1; index <= 5; index += 1) {
		assert.equal(
			controller.applySelectedReferenceImagesScaleFromSession(
				scaleSession,
				1 + index * 0.05,
			),
			true,
		);
		controller.syncUiState();
	}
	controller.endSelectedReferenceImageInspectorTransformSession();
	controller.syncUiState();

	assert.deepEqual(
		store.referenceImages.selectionAnchor.value,
		anchoredSelection.selectionAnchor,
	);
	assert.ok(
		Math.abs(
			Number(store.referenceImages.selectionBoxLogical.value?.anchorX ?? 0) -
				anchoredSelection.selectionAnchor.x,
		) <= 1e-8,
	);
	assert.ok(
		Math.abs(
			Number(store.referenceImages.selectionBoxLogical.value?.anchorY ?? 0) -
				anchoredSelection.selectionAnchor.y,
		) <= 1e-8,
	);
}

{
	const store = createCameraFramesStore();
	let shotCameraDocument = createShotCameraDocument({
		name: "Camera A",
	});
	const renderBoxElement = {
		clientWidth: 1536,
		clientHeight: 864,
		clientLeft: 0,
		clientTop: 0,
		getBoundingClientRect() {
			return {
				left: 0,
				top: 0,
				width: 1536,
				height: 864,
			};
		},
	};
	globalThis.document = {
		getElementById(id) {
			if (id !== "viewport-shell") {
				return null;
			}
			return {
				getBoundingClientRect() {
					return {
						left: 0,
						top: 0,
						width: 1536,
						height: 864,
					};
				},
			};
		},
	};
	const controller = createReferenceImageController({
		store,
		referenceImageInput: null,
		renderBox: renderBoxElement,
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
	const asset = createReferenceImageAsset({
		id: "asset-move",
		label: "Move",
		sourceMeta: createSourceMeta("move.png"),
	});
	const preset = createReferenceImagePreset({
		id: "preset-move",
		name: "Move",
		items: [
			createReferenceImageItem({
				id: "item-move",
				assetId: asset.id,
				name: "Move Layer",
				order: 0,
			}),
		],
	});
	const documentState = createDefaultReferenceImageDocument();
	documentState.assets.push(asset);
	documentState.presets.push(preset);
	documentState.activePresetId = preset.id;
	shotCameraDocument.referenceImages.presetId = preset.id;
	store.referenceImages.document.value = documentState;
	store.viewportToolMode.value = "reference";
	controller.syncUiState();
	store.referenceImages.previewLayers.value = [
		{
			id: "item-move",
			leftPx: 718,
			topPx: 382,
			widthPx: 100,
			heightPx: 100,
			anchorAx: 0.5,
			anchorAy: 0.5,
			rotationDeg: 0,
		},
	];
	controller.selectReferenceImageItem("item-move");

	const startResult = controller.startReferenceImageMove("item-move", {
		button: 0,
		pointerId: 1,
		clientX: 768,
		clientY: 432,
		preventDefault() {},
		stopPropagation() {},
	});
	assert.equal(startResult, true);

	controller.handleReferenceImagePointerMove({
		pointerId: 1,
		clientX: 788,
		clientY: 452,
		preventDefault() {},
	});
	controller.handleReferenceImagePointerUp({
		pointerId: 1,
		preventDefault() {},
	});
	controller.syncUiState();

	assert.equal(store.referenceImages.items.value[0].offsetPx.x, -20);
	assert.equal(store.referenceImages.items.value[0].offsetPx.y, -20);
}

{
	const store = createCameraFramesStore();
	let shotCameraDocument = createShotCameraDocument({
		name: "Camera A",
	});
	const renderBoxElement = {
		clientWidth: 1536,
		clientHeight: 864,
		clientLeft: 0,
		clientTop: 0,
		getBoundingClientRect() {
			return {
				left: 0,
				top: 0,
				width: 1536,
				height: 864,
			};
		},
	};
	globalThis.document = {
		getElementById(id) {
			if (id !== "viewport-shell") {
				return null;
			}
			return {
				getBoundingClientRect() {
					return {
						left: 0,
						top: 0,
						width: 1536,
						height: 864,
					};
				},
			};
		},
	};
	const controller = createReferenceImageController({
		store,
		referenceImageInput: null,
		renderBox: renderBoxElement,
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
	const asset = createReferenceImageAsset({
		id: "asset-shift-additive",
		label: "Shift Additive",
		sourceMeta: createSourceMeta("shift-additive.png"),
	});
	const preset = createReferenceImagePreset({
		id: "preset-shift-additive",
		name: "Shift Additive",
		items: [
			createReferenceImageItem({
				id: "item-shift-a",
				assetId: asset.id,
				name: "Layer A",
				order: 0,
			}),
			createReferenceImageItem({
				id: "item-shift-b",
				assetId: asset.id,
				name: "Layer B",
				order: 1,
				offsetPx: { x: 100, y: 0 },
			}),
		],
	});
	const documentState = createDefaultReferenceImageDocument();
	documentState.assets.push(asset);
	documentState.presets.push(preset);
	documentState.activePresetId = preset.id;
	shotCameraDocument.referenceImages.presetId = preset.id;
	store.referenceImages.document.value = documentState;
	store.viewportToolMode.value = "reference";
	controller.syncUiState();
	store.referenceImages.previewLayers.value = [
		{
			id: "item-shift-a",
			leftPx: 718,
			topPx: 382,
			widthPx: 100,
			heightPx: 100,
			anchorAx: 0.5,
			anchorAy: 0.5,
			rotationDeg: 0,
		},
		{
			id: "item-shift-b",
			leftPx: 818,
			topPx: 382,
			widthPx: 100,
			heightPx: 100,
			anchorAx: 0.5,
			anchorAy: 0.5,
			rotationDeg: 0,
		},
	];
	controller.selectReferenceImageItem("item-shift-a");

	const startResult = controller.startReferenceImageMove("item-shift-b", {
		button: 0,
		pointerId: 2,
		clientX: 868,
		clientY: 432,
		shiftKey: true,
		ctrlKey: false,
		metaKey: false,
		preventDefault() {},
		stopPropagation() {},
	});
	assert.equal(startResult, true);
	assert.deepEqual(store.referenceImages.selectedItemIds.value, [
		"item-shift-a",
		"item-shift-b",
	]);
	assert.equal(store.referenceImages.selectedItemId.value, "item-shift-b");

	const toggleResult = controller.startReferenceImageMove("item-shift-b", {
		button: 0,
		pointerId: 3,
		clientX: 868,
		clientY: 432,
		shiftKey: true,
		ctrlKey: false,
		metaKey: false,
		preventDefault() {},
		stopPropagation() {},
	});
	assert.equal(toggleResult, true);
	assert.deepEqual(store.referenceImages.selectedItemIds.value, [
		"item-shift-a",
	]);
	assert.equal(store.referenceImages.selectedItemId.value, "item-shift-a");
}

{
	const store = createCameraFramesStore();
	let shotCameraDocument = createShotCameraDocument({
		name: "Camera A",
	});
	const renderBoxElement = {
		clientWidth: 1536,
		clientHeight: 864,
		clientLeft: 0,
		clientTop: 0,
		getBoundingClientRect() {
			return {
				left: 0,
				top: 0,
				width: 1536,
				height: 864,
			};
		},
	};
	globalThis.document = {
		getElementById(id) {
			if (id !== "viewport-shell") {
				return null;
			}
			return {
				getBoundingClientRect() {
					return {
						left: 0,
						top: 0,
						width: 1536,
						height: 864,
					};
				},
			};
		},
	};
	const controller = createReferenceImageController({
		store,
		referenceImageInput: null,
		renderBox: renderBoxElement,
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
	const asset = createReferenceImageAsset({
		id: "asset-bounds",
		label: "Bounds",
		sourceMeta: createSourceMeta("bounds.png"),
	});
	const preset = createReferenceImagePreset({
		id: "preset-bounds",
		name: "Bounds",
		items: [
			createReferenceImageItem({
				id: "item-bounds",
				assetId: asset.id,
				name: "Bounds Layer",
				order: 0,
				offsetPx: { x: -120, y: -60 },
			}),
		],
	});
	const documentState = createDefaultReferenceImageDocument();
	documentState.assets.push(asset);
	documentState.presets.push(preset);
	documentState.activePresetId = preset.id;
	shotCameraDocument.referenceImages.presetId = preset.id;
	store.referenceImages.document.value = documentState;
	store.viewportToolMode.value = "reference";
	controller.syncUiState();

	const initialBounds =
		controller.getReferenceImageLogicalBounds("item-bounds");
	assert.ok(initialBounds);
	assert.notEqual(initialBounds.left, 0);
	assert.notEqual(initialBounds.top, 0);

	assert.equal(
		controller.setReferenceImageBoundsPosition("item-bounds", "x", 0),
		true,
	);
	assert.equal(
		controller.setReferenceImageBoundsPosition("item-bounds", "y", 0),
		true,
	);

	const nextBounds = controller.getReferenceImageLogicalBounds("item-bounds");
	assert.ok(nextBounds);
	assert.equal(nextBounds.left, 0);
	assert.equal(nextBounds.top, 0);
}

{
	const store = createCameraFramesStore();
	let shotCameraDocument = createShotCameraDocument({
		name: "Camera A",
	});
	const renderBoxElement = {
		clientWidth: 1536,
		clientHeight: 864,
		clientLeft: 0,
		clientTop: 0,
		getBoundingClientRect() {
			return {
				left: 0,
				top: 0,
				width: 1536,
				height: 864,
			};
		},
	};
	globalThis.document = {
		getElementById(id) {
			if (id !== "viewport-shell") {
				return null;
			}
			return {
				getBoundingClientRect() {
					return {
						left: 0,
						top: 0,
						width: 1536,
						height: 864,
					};
				},
			};
		},
	};
	const controller = createReferenceImageController({
		store,
		referenceImageInput: null,
		renderBox: renderBoxElement,
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
	const assetA = createReferenceImageAsset({
		id: "asset-session-a",
		label: "Session A",
		sourceMeta: createSourceMeta("session-a.png"),
	});
	const assetB = createReferenceImageAsset({
		id: "asset-session-b",
		label: "Session B",
		sourceMeta: createSourceMeta("session-b.png"),
	});
	const preset = createReferenceImagePreset({
		id: "preset-session",
		name: "Session",
		items: [
			createReferenceImageItem({
				id: "item-session-a",
				assetId: assetA.id,
				name: "Session A",
				order: 0,
			}),
			createReferenceImageItem({
				id: "item-session-b",
				assetId: assetB.id,
				name: "Session B",
				order: 1,
				offsetPx: { x: -20, y: -10 },
			}),
		],
	});
	const documentState = createDefaultReferenceImageDocument();
	documentState.assets.push(assetA, assetB);
	documentState.presets.push(preset);
	documentState.activePresetId = preset.id;
	shotCameraDocument.referenceImages.presetId = preset.id;
	store.referenceImages.document.value = documentState;
	controller.syncUiState();
	controller.selectReferenceImageItem("item-session-a");
	controller.selectReferenceImageItem("item-session-b", { additive: true });

	assert.notEqual(
		controller.getSelectedReferenceImageInspectorState()?.session ?? null,
		null,
	);
}

{
	const store = createCameraFramesStore();
	let shotCameraDocument = createShotCameraDocument({
		name: "Camera A",
	});
	const renderBoxElement = {
		clientWidth: 1536,
		clientHeight: 864,
		clientLeft: 0,
		clientTop: 0,
		getBoundingClientRect() {
			return {
				left: 0,
				top: 0,
				width: 1536,
				height: 864,
			};
		},
	};
	globalThis.document = {
		getElementById(id) {
			if (id !== "viewport-shell") {
				return null;
			}
			return {
				getBoundingClientRect() {
					return {
						left: 0,
						top: 0,
						width: 1536,
						height: 864,
					};
				},
			};
		},
	};
	const controller = createReferenceImageController({
		store,
		referenceImageInput: null,
		renderBox: renderBoxElement,
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
	const asset = createReferenceImageAsset({
		id: "asset-anchor",
		label: "Anchor",
		sourceMeta: createSourceMeta("anchor.png"),
	});
	const preset = createReferenceImagePreset({
		id: "preset-anchor",
		name: "Anchor",
		items: [
			createReferenceImageItem({
				id: "item-anchor",
				assetId: asset.id,
				name: "Anchor Layer",
				order: 0,
			}),
		],
	});
	const documentState = createDefaultReferenceImageDocument();
	documentState.assets.push(asset);
	documentState.presets.push(preset);
	documentState.activePresetId = preset.id;
	shotCameraDocument.referenceImages.presetId = preset.id;
	store.referenceImages.document.value = documentState;
	store.viewportToolMode.value = "reference";
	controller.syncUiState();
	store.referenceImages.previewLayers.value = [
		{
			id: "item-anchor",
			leftPx: 718,
			topPx: 382,
			widthPx: 100,
			heightPx: 100,
			anchorAx: 0.5,
			anchorAy: 0.5,
			rotationDeg: 0,
		},
	];
	controller.selectReferenceImageItem("item-anchor");

	const startResult = controller.startReferenceImageAnchorDrag({
		button: 0,
		pointerId: 2,
		clientX: 768,
		clientY: 432,
		preventDefault() {},
		stopPropagation() {},
	});
	assert.equal(startResult, true);

	controller.handleReferenceImagePointerMove({
		pointerId: 2,
		clientX: 791,
		clientY: 432,
		preventDefault() {},
	});
	controller.handleReferenceImagePointerUp({
		pointerId: 2,
		preventDefault() {},
	});
	controller.syncUiState();

	const nextItem = store.referenceImages.items.value[0];
	assert.ok(Math.abs(nextItem.anchor.ax - 0.73) < 1e-9);
	assert.equal(nextItem.anchor.ay, 0.5);
	assert.ok(
		Math.abs(nextItem.offsetPx.x - Math.round(nextItem.offsetPx.x)) > 1e-6,
	);

	const nextLayer = store.referenceImages.previewLayers.value[0];
	assert.equal(nextLayer.leftPx, 718);
	assert.equal(nextLayer.topPx, 382);
	assert.equal(nextLayer.widthPx, 100);
	assert.equal(nextLayer.heightPx, 100);

	controller.selectReferenceImageItem("");
	controller.selectReferenceImageItem("item-anchor");
	controller.syncUiState();

	const resetItem = store.referenceImages.items.value[0];
	assert.equal(resetItem.anchor.ax, 0.5);
	assert.equal(resetItem.anchor.ay, 0.5);

	const resetLayer = store.referenceImages.previewLayers.value[0];
	assert.equal(resetLayer.leftPx, 718);
	assert.equal(resetLayer.topPx, 382);
	assert.equal(resetLayer.widthPx, 100);
	assert.equal(resetLayer.heightPx, 100);
}

{
	const store = createCameraFramesStore();
	let shotCameraDocument = createShotCameraDocument({
		name: "Camera A",
	});
	const renderBoxElement = {
		clientWidth: 1536,
		clientHeight: 864,
		clientLeft: 0,
		clientTop: 0,
		getBoundingClientRect() {
			return {
				left: 0,
				top: 0,
				width: 1536,
				height: 864,
			};
		},
	};
	globalThis.document = {
		getElementById(id) {
			if (id !== "viewport-shell") {
				return null;
			}
			return {
				getBoundingClientRect() {
					return {
						left: 0,
						top: 0,
						width: 1536,
						height: 864,
					};
				},
			};
		},
	};
	const controller = createReferenceImageController({
		store,
		referenceImageInput: null,
		renderBox: renderBoxElement,
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
	const asset = createReferenceImageAsset({
		id: "asset-multi",
		label: "Multi",
		sourceMeta: createSourceMeta("multi.png"),
	});
	const preset = createReferenceImagePreset({
		id: "preset-multi",
		name: "Multi",
		items: [
			createReferenceImageItem({
				id: "item-multi-a",
				assetId: asset.id,
				name: "Layer A",
				order: 0,
				offsetPx: { x: 0, y: 0 },
			}),
			createReferenceImageItem({
				id: "item-multi-b",
				assetId: asset.id,
				name: "Layer B",
				order: 1,
				offsetPx: { x: -200, y: 0 },
			}),
		],
	});
	const documentState = createDefaultReferenceImageDocument();
	documentState.assets.push(asset);
	documentState.presets.push(preset);
	documentState.activePresetId = preset.id;
	shotCameraDocument.referenceImages.presetId = preset.id;
	store.referenceImages.document.value = documentState;
	store.viewportToolMode.value = "reference";
	controller.syncUiState();
	store.referenceImages.previewLayers.value = [
		{
			id: "item-multi-a",
			leftPx: 718,
			topPx: 382,
			widthPx: 100,
			heightPx: 100,
			anchorAx: 0.5,
			anchorAy: 0.5,
			rotationDeg: 0,
		},
		{
			id: "item-multi-b",
			leftPx: 918,
			topPx: 382,
			widthPx: 100,
			heightPx: 100,
			anchorAx: 0.5,
			anchorAy: 0.5,
			rotationDeg: 0,
		},
	];
	controller.selectReferenceImageItem("item-multi-a");
	controller.selectReferenceImageItem("item-multi-b", { additive: true });

	const startBox = store.referenceImages.selectionBoxLogical.value;
	assert.ok(startBox);
	assert.equal(startBox.left, 718);
	assert.equal(startBox.top, 382);
	assert.equal(startBox.width, 300);
	assert.equal(startBox.height, 100);
	assert.equal(startBox.rotationDeg, 0);

	const startResult = controller.startReferenceImageRotate("top", {
		button: 0,
		pointerId: 3,
		clientX: 868,
		clientY: 332,
		preventDefault() {},
		stopPropagation() {},
	});
	assert.equal(startResult, true);

	controller.handleReferenceImagePointerMove({
		pointerId: 3,
		clientX: 968,
		clientY: 432,
		preventDefault() {},
	});
	controller.handleReferenceImagePointerUp({
		pointerId: 3,
		preventDefault() {},
	});
	controller.syncUiState();

	const rotatedBox = store.referenceImages.selectionBoxLogical.value;
	assert.ok(rotatedBox);
	assert.equal(rotatedBox.width, 300);
	assert.equal(rotatedBox.height, 100);
	assert.ok(Math.abs(rotatedBox.rotationDeg - 90) < 1e-6);

	const preRotateEditorState = controller.captureReferenceImageEditorState();
	const revertedDocument = createDefaultReferenceImageDocument();
	revertedDocument.assets.push(asset);
	revertedDocument.presets.push(
		createReferenceImagePreset({
			id: preset.id,
			name: preset.name,
			items: [
				createReferenceImageItem({
					id: "item-multi-a",
					assetId: asset.id,
					name: "Layer A",
					order: 0,
					offsetPx: { x: 0, y: 0 },
				}),
				createReferenceImageItem({
					id: "item-multi-b",
					assetId: asset.id,
					name: "Layer B",
					order: 1,
					offsetPx: { x: -200, y: 0 },
				}),
			],
		}),
	);
	revertedDocument.activePresetId = preset.id;
	controller.applyProjectReferenceImagesState(revertedDocument, {
		editorState: {
			...preRotateEditorState,
			selectionAnchor: null,
			selectionBoxLogical: { ...startBox },
		},
	});

	const rebuiltBox = store.referenceImages.selectionBoxLogical.value;
	assert.ok(rebuiltBox);
	assert.equal(rebuiltBox.left, 718);
	assert.equal(rebuiltBox.top, 382);
	assert.equal(rebuiltBox.width, 300);
	assert.equal(rebuiltBox.height, 100);
	assert.equal(rebuiltBox.rotationDeg, 0);
	assert.equal(store.referenceImages.selectionAnchor.value, null);
}

if (originalWindow === undefined) {
	globalThis.window = undefined;
} else {
	globalThis.window = originalWindow;
}
if (originalDocument === undefined) {
	globalThis.document = undefined;
} else {
	globalThis.document = originalDocument;
}

console.log("✅ reference image controller selection tests passed!");
