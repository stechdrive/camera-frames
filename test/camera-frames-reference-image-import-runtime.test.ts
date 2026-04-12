import assert from "node:assert/strict";
import { createReferenceImageImportRuntime } from "../src/controllers/reference-image/import-runtime.js";
import {
	createDefaultReferenceImageDocument,
	createReferenceImageAsset,
	createReferenceImageItem,
	getReferenceImageCompositeItems,
	getReferenceImageDisplayItems,
} from "../src/reference-image-model.js";

function createRuntime({ mode = "camera", previewSessionVisible = true } = {}) {
	const store = {
		mode: { value: mode },
		referenceImages: {
			previewLayers: { value: [] },
			previewSessionVisible: { value: previewSessionVisible },
			assetCount: { value: 6 },
			items: {
				value: Array.from({ length: 6 }, (_, index) => ({ id: index })),
			},
		},
	};
	let updateUiCount = 0;
	const runtime = createReferenceImageImportRuntime({
		store,
		t: () => "",
		setStatus: () => {},
		updateUi: () => {
			updateUiCount += 1;
		},
		ensureCameraMode: () => {},
		getActiveShotCameraDocument: () => null,
		getOutputSizeState: () => null,
		getDocument: () => ({ presets: [], assets: [] }),
		setDocument: () => {},
		syncUiState: () => {},
		setSelectionState: () => {},
		ensureActiveShotPresetBinding: () => {},
	});
	return { runtime, store, getUpdateUiCount: () => updateUiCount };
}

function createSourceMeta(filename) {
	return {
		filename,
		mime: "image/png",
		originalSize: { w: 64, h: 32 },
		appliedSize: { w: 64, h: 32 },
		pixelRatio: 1,
		usedOriginal: true,
	};
}

function createImportHarness({
	documentState = createDefaultReferenceImageDocument(),
	extractedLayers = [],
} = {}) {
	const store = {
		mode: { value: "camera" },
		referenceImages: {
			previewLayers: { value: [] },
			previewSessionVisible: { value: false },
			assetCount: { value: documentState.assets.length },
			items: { value: [] },
		},
	};
	let currentDocument = documentState;
	const selectionStates = [];
	const boundPresetIds = [];
	const statuses = [];
	const historyLabels = [];
	const runtime = createReferenceImageImportRuntime({
		store,
		t: (key) => key,
		setStatus: (value) => statuses.push(value),
		updateUi: () => {},
		ensureCameraMode: () => {},
		getActiveShotCameraDocument: () => null,
		getOutputSizeState: () => ({ width: 1000, height: 500 }),
		getDocument: () => currentDocument,
		setDocument: (nextDocument) => {
			currentDocument = nextDocument;
			store.referenceImages.assetCount.value = nextDocument.assets.length;
		},
		syncUiState: () => {
			const activePreset =
				currentDocument.presets.find(
					(preset) => preset.id === currentDocument.activePresetId,
				) ?? currentDocument.presets[0];
			store.referenceImages.items.value = (activePreset?.items ?? []).map(
				(item) => ({
					id: item.id,
					name: item.name,
					group: item.group,
					order: item.order,
					previewVisible: item.previewVisible,
					exportEnabled: item.exportEnabled,
				}),
			);
		},
		setSelectionState: (selectionState) => {
			selectionStates.push(selectionState);
		},
		ensureActiveShotPresetBinding: (presetId) => {
			boundPresetIds.push(presetId);
		},
		beginHistoryTransaction: (label) => {
			historyLabels.push(label);
			return true;
		},
		commitHistoryTransaction: () => true,
		cancelHistoryTransaction: () => {},
		decodeReferenceImageBlobImpl: async (_blob, filename) => ({
			sourceMeta: createSourceMeta(filename),
			previewCanvas: { width: 64, height: 32 },
		}),
		extractReferenceImagePsdLayersImpl: async () => extractedLayers,
	});
	return {
		runtime,
		store,
		selectionStates,
		boundPresetIds,
		statuses,
		historyLabels,
		getDocument: () => currentDocument,
	};
}

{
	const { runtime, getUpdateUiCount } = createRuntime({ mode: "viewport" });
	const originalWarn = console.warn;
	const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
	const warnings = [];
	console.warn = (...args) => {
		warnings.push(args);
	};
	globalThis.requestAnimationFrame = (callback) => {
		callback(0);
		return 1;
	};

	try {
		runtime.refreshUiAfterLayout({ expectedVisibleItems: 6 });
		assert.equal(warnings.length, 0);
		assert.equal(getUpdateUiCount(), 1);
	} finally {
		console.warn = originalWarn;
		if (originalRequestAnimationFrame) {
			globalThis.requestAnimationFrame = originalRequestAnimationFrame;
		} else {
			globalThis.requestAnimationFrame = undefined;
		}
	}
}

{
	const { runtime, getUpdateUiCount } = createRuntime({ mode: "camera" });
	const originalWarn = console.warn;
	const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
	const warnings = [];
	console.warn = (...args) => {
		warnings.push(args);
	};
	globalThis.requestAnimationFrame = (callback) => {
		callback(0);
		return 1;
	};

	try {
		runtime.refreshUiAfterLayout({ expectedVisibleItems: 6 });
		assert.equal(warnings.length, 1);
		assert.equal(
			warnings[0][0],
			"[CAMERA_FRAMES] reference-image preview remained empty after import",
		);
		assert.equal(getUpdateUiCount(), 5);
	} finally {
		console.warn = originalWarn;
		if (originalRequestAnimationFrame) {
			globalThis.requestAnimationFrame = originalRequestAnimationFrame;
		} else {
			globalThis.requestAnimationFrame = undefined;
		}
	}
}

{
	const documentState = createDefaultReferenceImageDocument();
	const existingAsset = createReferenceImageAsset({
		id: "asset-existing",
		label: "Existing",
		source: {
			file: new File([new Uint8Array([1])], "existing.png", {
				type: "image/png",
			}),
		},
		sourceMeta: createSourceMeta("existing.png"),
	});
	documentState.assets.push(existingAsset);
	documentState.presets[0].items.push(
		createReferenceImageItem({
			id: "item-existing",
			assetId: existingAsset.id,
			name: "Existing",
			order: 0,
		}),
	);
	const harness = createImportHarness({ documentState });
	const imported = await harness.runtime.importReferenceImageFiles([
		new File([new Uint8Array([2])], "new-board.png", {
			type: "image/png",
		}),
	]);
	assert.equal(imported, true);
	const items = harness.getDocument().presets[0].items;
	assert.deepEqual(
		getReferenceImageCompositeItems(items, "front").map((item) => item.name),
		["Existing", "new-board"],
	);
	assert.deepEqual(
		getReferenceImageDisplayItems(items, "front").map((item) => item.name),
		["new-board", "Existing"],
	);
	assert.equal(items.find((item) => item.name === "new-board")?.order, 1);
	assert.deepEqual(harness.historyLabels, ["reference-image.import"]);
	assert.equal(harness.boundPresetIds[0], harness.getDocument().activePresetId);
}

{
	const harness = createImportHarness({
		extractedLayers: [
			{
				name: "Bottom",
				visible: false,
				opacity: 0.4,
				offsetPx: { x: 0, y: 0 },
				decoded: {
					blob: new Blob([new Uint8Array([1])], { type: "image/png" }),
					sourceMeta: createSourceMeta("bottom.png"),
				},
			},
			{
				name: "Top",
				visible: true,
				opacity: 1,
				offsetPx: { x: 0, y: 0 },
				decoded: {
					blob: new Blob([new Uint8Array([2])], { type: "image/png" }),
					sourceMeta: createSourceMeta("top.png"),
				},
			},
		],
	});
	const imported = await harness.runtime.importReferenceImageFiles([
		new File([new Uint8Array([3])], "board.psd", {
			type: "image/vnd.adobe.photoshop",
		}),
	]);
	assert.equal(imported, true);
	const items = harness.getDocument().presets[0].items;
	assert.deepEqual(
		getReferenceImageCompositeItems(items, "front").map((item) => item.name),
		["Bottom", "Top"],
	);
	assert.deepEqual(
		getReferenceImageDisplayItems(items, "front").map((item) => item.name),
		["Top", "Bottom"],
	);
	assert.deepEqual(
		items.map((item) => ({
			name: item.name,
			previewVisible: item.previewVisible,
			exportEnabled: item.exportEnabled,
		})),
		[
			{
				name: "Bottom",
				previewVisible: false,
				exportEnabled: false,
			},
			{
				name: "Top",
				previewVisible: true,
				exportEnabled: true,
			},
		],
	);
	assert.equal(harness.selectionStates.at(-1)?.selectedItemIds.length, 1);
	const activeSelectedItemId =
		harness.selectionStates.at(-1)?.selectedItemIds[0];
	assert.equal(
		items.find((item) => item.id === activeSelectedItemId)?.name,
		"Top",
	);
}

console.log("✅ CAMERA_FRAMES reference image import runtime tests passed!");
