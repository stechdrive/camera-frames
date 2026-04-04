import assert from "node:assert/strict";
import { createReferenceImageUiStateSync } from "../src/controllers/reference-image/ui-state-sync.js";

{
	const store = {
		referenceImages: {
			selectedAssetId: { value: "asset-a" },
			selectedItemId: { value: "" },
			selectedItemIds: { value: [] },
			assetCount: { value: 0 },
			assets: { value: [] },
			presets: { value: [] },
			panelPresetId: { value: "" },
			panelPresetName: { value: "" },
			items: { value: [] },
			selectionAnchor: { value: null },
			selectionBoxLogical: { value: null },
		},
	};
	const calls = {
		setSelectionState: [],
	};
	const documentState = {
		assets: [
			{
				id: "asset-a",
				label: "Board",
				sourceMeta: { filename: "board.png" },
			},
		],
		presets: [{ id: "preset-a", name: "Preset A", items: [{ id: "item-a" }] }],
	};
	const resolved = {
		preset: { id: "preset-a", name: "Preset A" },
		assetsById: new Map([
			[
				"asset-a",
				{
					id: "asset-a",
					label: "Board",
					sourceMeta: { filename: "board.png" },
				},
			],
		]),
		items: [
			{
				id: "item-a",
				assetId: "asset-a",
				name: "Board Layer",
				group: "front",
				order: 0,
				previewVisible: true,
				exportEnabled: true,
				opacity: 1,
				scalePct: 100,
				rotationDeg: 0,
				offsetPx: { x: 0, y: 0 },
				anchor: { ax: 0.5, ay: 0.5 },
			},
		],
	};

	const sync = createReferenceImageUiStateSync({
		store,
		referenceImageDefaultPresetId: "blank",
		buildReferenceImageSizeLabel: () => "100 x 100",
		getDocument: () => documentState,
		getResolvedShotItems: () => resolved,
		getSelectedItemIds: () => [],
		getValidSelectionState: () => ({
			selectedItemIds: [],
			activeItemId: "",
			activeAssetId: "",
		}),
		setSelectionState: (nextState) => {
			calls.setSelectionState.push(nextState);
		},
		isReferenceImageDragActive: () => false,
		getTransformContext: () => null,
		buildLogicalItemGeometry: () => null,
		doesReferenceImageSelectionBoxMatchGeometries: () => true,
		buildReferenceImageSelectionBoxLogicalFromGeometries: () => null,
		setStoredSelectionBox: () => {},
		initializeMultiSelectionTransformBox: () => {},
	});

	sync.syncUiState();

	assert.equal(store.referenceImages.assetCount.value, 1);
	assert.deepEqual(store.referenceImages.assets.value, [
		{
			id: "asset-a",
			label: "Board",
			fileName: "board.png",
			sizeLabel: "100 x 100",
			currentCameraCount: 1,
		},
	]);
	assert.deepEqual(store.referenceImages.presets.value, [
		{
			id: "preset-a",
			name: "Preset A",
			itemCount: 1,
			isBlank: false,
		},
	]);
	assert.equal(store.referenceImages.panelPresetId.value, "preset-a");
	assert.equal(store.referenceImages.panelPresetName.value, "Preset A");
	assert.deepEqual(store.referenceImages.items.value, [
		{
			id: "item-a",
			assetId: "asset-a",
			name: "Board Layer",
			group: "front",
			order: 0,
			previewVisible: true,
			exportEnabled: true,
			opacity: 1,
			scalePct: 100,
			rotationDeg: 0,
			offsetPx: { x: 0, y: 0 },
			anchor: { ax: 0.5, ay: 0.5 },
			fileName: "board.png",
			sizeLabel: "100 x 100",
		},
	]);
	assert.deepEqual(calls.setSelectionState, [
		{
			selectedItemIds: ["item-a"],
			activeItemId: "item-a",
			activeAssetId: "asset-a",
		},
	]);
}

console.log("✅ CAMERA_FRAMES reference image ui state sync tests passed!");
