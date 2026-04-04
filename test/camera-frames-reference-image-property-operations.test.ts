import assert from "node:assert/strict";
import { createReferenceImagePropertyOperations } from "../src/controllers/reference-image/property-operations.js";

function createReferenceImageItem(item) {
	return {
		...item,
	};
}

function createHarness({
	selectedItemIds = ["item-a"],
	items = [
		{
			id: "item-a",
			previewVisible: true,
			exportEnabled: true,
			opacity: 1,
			scalePct: 100,
			rotationDeg: 0,
			offsetPx: { x: 0, y: 0 },
		},
		{
			id: "item-b",
			previewVisible: true,
			exportEnabled: true,
			opacity: 1,
			scalePct: 100,
			rotationDeg: 0,
			offsetPx: { x: 0, y: 0 },
		},
	],
} = {}) {
	const calls = [];
	const documentState = { id: "document-a" };
	const resolved = {
		items: items.map((item) => ({ ...item })),
	};

	const operations = createReferenceImagePropertyOperations({
		createReferenceImageItem,
		getSelectedItemIds: () => selectedItemIds,
		getDocument: () => documentState,
		getResolvedShotItems: () => resolved,
		runReferenceImageHistoryAction: (label, applyChange) => {
			calls.push(["history", label]);
			applyChange?.();
			return true;
		},
		updateResolvedReferenceImageItem: (itemId, patchOrUpdater) => {
			calls.push(["update", itemId]);
			const item = resolved.items.find((entry) => entry.id === itemId);
			if (!item) {
				return;
			}
			const patch =
				typeof patchOrUpdater === "function"
					? patchOrUpdater(item)
					: patchOrUpdater;
			Object.assign(item, patch);
		},
		commitResolvedItems: (nextDocumentState, nextResolved, nextItems) => {
			calls.push(["commit", nextDocumentState.id, nextItems.length]);
			nextResolved.items = nextItems.map((item) => ({ ...item }));
		},
	});

	return {
		operations,
		resolved,
		calls,
	};
}

{
	const { operations, resolved, calls } = createHarness();
	operations.setReferenceImagePreviewVisible("item-a", false);
	assert.equal(resolved.items[0].previewVisible, false);
	assert.deepEqual(calls, [
		["history", "reference-image.preview-visible"],
		["update", "item-a"],
	]);
}

{
	const { operations, resolved, calls } = createHarness();
	assert.equal(operations.setSelectedReferenceImagesExportEnabled(false), true);
	assert.equal(resolved.items[0].exportEnabled, false);
	assert.equal(resolved.items[1].exportEnabled, true);
	assert.deepEqual(calls, [
		["history", "reference-image.export-enabled"],
		["commit", "document-a", 2],
	]);
}

{
	const { operations, resolved, calls } = createHarness();
	assert.equal(operations.setSelectedReferenceImagesOpacity(45), true);
	assert.equal(resolved.items[0].opacity, 0.45);
	assert.equal(resolved.items[1].opacity, 1);
	assert.deepEqual(calls, [
		["history", "reference-image.opacity"],
		["commit", "document-a", 2],
	]);
}

{
	const { operations, calls } = createHarness({ selectedItemIds: [] });
	assert.equal(
		operations.setSelectedReferenceImagesPreviewVisible(false),
		false,
	);
	assert.deepEqual(calls, []);
}

{
	const { operations, resolved, calls } = createHarness();
	operations.setReferenceImageScalePct("item-a", 125);
	operations.setReferenceImageRotationDeg("item-a", 15);
	operations.setReferenceImageOffsetPx("item-a", "y", 12.8);
	assert.equal(resolved.items[0].scalePct, 125);
	assert.equal(resolved.items[0].rotationDeg, 15);
	assert.deepEqual(resolved.items[0].offsetPx, { x: 0, y: 13 });
	assert.deepEqual(calls, [
		["history", "reference-image.scale"],
		["update", "item-a"],
		["history", "reference-image.rotation"],
		["update", "item-a"],
		["history", "reference-image.offset.y"],
		["update", "item-a"],
	]);
}

console.log(
	"✅ CAMERA_FRAMES reference image property operations tests passed!",
);
