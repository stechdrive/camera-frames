import assert from "node:assert/strict";
import {
	buildReferenceImageSelectionBoxLogicalFromGeometries,
	captureReferenceImageEditorStateSnapshot,
	doesReferenceImageSelectionBoxMatchGeometries,
	getSelectedReferenceImageItemIds,
	getValidReferenceImageSelectionState,
	normalizeReferenceImageEditorStateForRestore,
	projectReferenceImageSelectionBoxLogicalToScreen,
} from "../src/controllers/reference-image/selection-state.js";

{
	assert.deepEqual(getSelectedReferenceImageItemIds(undefined), []);
	const ids = ["item-a"];
	assert.equal(getSelectedReferenceImageItemIds(ids), ids);
}

{
	const normalized = getValidReferenceImageSelectionState({
		items: [
			{ id: "item-a", assetId: "asset-a" },
			{ id: "item-b", assetId: "asset-b" },
		],
		selectedItemIds: ["item-a", "item-a", "missing"],
		activeItemId: "item-b",
	});
	assert.deepEqual(normalized.selectedItemIds, ["item-a", "item-b"]);
	assert.equal(normalized.activeItemId, "item-b");
	assert.equal(normalized.activeAssetId, "asset-b");
}

{
	const logicalBox = buildReferenceImageSelectionBoxLogicalFromGeometries([
		{
			corners: [
				{ x: 10, y: 20 },
				{ x: 30, y: 20 },
				{ x: 30, y: 60 },
				{ x: 10, y: 60 },
			],
		},
		{
			corners: [
				{ x: 40, y: 25 },
				{ x: 50, y: 25 },
				{ x: 50, y: 45 },
				{ x: 40, y: 45 },
			],
		},
	]);
	assert.deepEqual(logicalBox, {
		left: 10,
		top: 20,
		width: 40,
		height: 40,
		rotationDeg: 0,
		anchorX: 0.5,
		anchorY: 0.5,
	});
	assert.equal(
		doesReferenceImageSelectionBoxMatchGeometries(logicalBox, [
			{
				corners: [
					{ x: 10, y: 20 },
					{ x: 50, y: 20 },
					{ x: 50, y: 60 },
					{ x: 10, y: 60 },
				],
			},
		]),
		true,
	);
}

{
	const projected = projectReferenceImageSelectionBoxLogicalToScreen(
		{
			left: 10,
			top: 20,
			width: 40,
			height: 30,
			rotationDeg: 15,
			anchorX: 0.5,
			anchorY: 0.5,
		},
		{
			renderBoxScreenLeft: 100,
			renderBoxScreenTop: 200,
			renderScaleX: 2,
			renderScaleY: 3,
		},
		{ x: 0.2, y: 0.8 },
	);
	assert.deepEqual(projected, {
		left: 120,
		top: 260,
		width: 80,
		height: 90,
		rotationDeg: 15,
		anchorX: 0.2,
		anchorY: 0.8,
	});
}

{
	const editorState = captureReferenceImageEditorStateSnapshot({
		selectedItemIds: ["item-a"],
		selectedItemId: "item-a",
		selectedAssetId: "asset-a",
		selectionAnchor: { x: 0.25, y: 0.75 },
		selectionBoxLogical: { left: 1, top: 2, width: 3, height: 4 },
		rememberedSelectedItemIds: ["item-a", "item-b"],
		rememberedActiveItemId: "item-b",
		previewSessionVisible: false,
	});
	assert.deepEqual(editorState, {
		selectedItemIds: ["item-a"],
		selectedItemId: "item-a",
		selectedAssetId: "asset-a",
		selectionAnchor: { x: 0.25, y: 0.75 },
		selectionBoxLogical: { left: 1, top: 2, width: 3, height: 4 },
		rememberedSelectedItemIds: ["item-a", "item-b"],
		rememberedActiveItemId: "item-b",
		previewSessionVisible: false,
	});
}

{
	const restored = normalizeReferenceImageEditorStateForRestore({
		selectedItemIds: [" item-a ", null],
		selectedItemId: "item-a",
		selectedAssetId: "asset-a",
		selectionAnchor: { x: 0.5, y: 0.5 },
		selectionBoxLogical: { left: 5, top: 6, width: 7, height: 8 },
		rememberedSelectedItemIds: [" item-b "],
		rememberedActiveItemId: "item-b",
		previewSessionVisible: false,
	});
	assert.equal(restored.hasEditorState, true);
	assert.equal(restored.shouldUpdatePreviewSessionVisible, true);
	assert.equal(restored.previewSessionVisible, false);
	assert.deepEqual(restored.selectedItemIds, ["item-a", ""]);
	assert.deepEqual(restored.rememberedSelectionState, {
		selectedItemIds: ["item-b"],
		activeItemId: "item-b",
	});
	assert.deepEqual(restored.selectionAnchor, { x: 0.5, y: 0.5 });
	assert.deepEqual(restored.selectionBoxLogical, {
		left: 5,
		top: 6,
		width: 7,
		height: 8,
	});
}

{
	const restored = normalizeReferenceImageEditorStateForRestore(null, {
		preservePreviewSessionVisible: true,
	});
	assert.equal(restored.hasEditorState, false);
	assert.equal(restored.shouldUpdatePreviewSessionVisible, false);
	assert.equal(restored.previewSessionVisible, true);
	assert.deepEqual(restored.rememberedSelectionState, {
		selectedItemIds: [],
		activeItemId: "",
	});
}

console.log("✅ CAMERA_FRAMES reference image selection state tests passed!");
