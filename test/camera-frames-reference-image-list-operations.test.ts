import assert from "node:assert/strict";
import { createReferenceImageListOperations } from "../src/controllers/reference-image/list-operations.js";
import {
	REFERENCE_IMAGE_GROUP_BACK,
	REFERENCE_IMAGE_GROUP_FRONT,
	createReferenceImageItem,
	getReferenceImageDisplayItems,
} from "../src/reference-image-model.js";

function createHarness({ items = [], selectedItemIds = [] } = {}) {
	let currentItems = items.map((item) => createReferenceImageItem(item));
	const historyLabels = [];
	let committedItems = null;

	const operations = createReferenceImageListOperations({
		createReferenceImageItem,
		getSelectedItemIds: () => [...selectedItemIds],
		getDocument: () => ({ id: "document" }),
		getResolvedShotItems: () => ({
			preset: { id: "preset-list" },
			items: currentItems.map((item) => createReferenceImageItem(item)),
		}),
		commitResolvedItems: (_documentState, _resolved, nextItems) => {
			committedItems = nextItems.map((item) => createReferenceImageItem(item));
			currentItems = committedItems.map((item) =>
				createReferenceImageItem(item),
			);
			return true;
		},
		runReferenceImageHistoryAction: (label, applyChange) => {
			historyLabels.push(label);
			applyChange?.();
			return true;
		},
	});

	return {
		operations,
		getHistoryLabels: () => [...historyLabels],
		getCommittedItems: () =>
			(committedItems ?? currentItems).map((item) =>
				createReferenceImageItem(item),
			),
	};
}

function createItems() {
	return [
		createReferenceImageItem({
			id: "back-0",
			assetId: "asset",
			name: "Back 0",
			group: REFERENCE_IMAGE_GROUP_BACK,
			order: 0,
		}),
		createReferenceImageItem({
			id: "front-0",
			assetId: "asset",
			name: "Front 0",
			group: REFERENCE_IMAGE_GROUP_FRONT,
			order: 0,
		}),
		createReferenceImageItem({
			id: "front-1",
			assetId: "asset",
			name: "Front 1",
			group: REFERENCE_IMAGE_GROUP_FRONT,
			order: 1,
		}),
		createReferenceImageItem({
			id: "front-2",
			assetId: "asset",
			name: "Front 2",
			group: REFERENCE_IMAGE_GROUP_FRONT,
			order: 2,
		}),
		createReferenceImageItem({
			id: "front-3",
			assetId: "asset",
			name: "Front 3",
			group: REFERENCE_IMAGE_GROUP_FRONT,
			order: 3,
		}),
	];
}

{
	const harness = createHarness({
		items: createItems(),
	});

	harness.operations.setReferenceImageGroup(
		"front-1",
		REFERENCE_IMAGE_GROUP_BACK,
	);

	assert.equal(harness.getHistoryLabels().at(-1), "reference-image.group");
	const itemsById = new Map(
		harness.getCommittedItems().map((item) => [item.id, item]),
	);
	assert.equal(itemsById.get("front-1")?.group, REFERENCE_IMAGE_GROUP_BACK);
	assert.equal(itemsById.get("front-1")?.order, 1);
	assert.equal(itemsById.get("front-0")?.group, REFERENCE_IMAGE_GROUP_FRONT);
	assert.equal(itemsById.get("front-0")?.order, 0);
}

{
	const harness = createHarness({
		items: createItems(),
	});

	harness.operations.setReferenceImageOrder("front-2", 0);

	assert.equal(harness.getHistoryLabels().at(-1), "reference-image.order");
	const frontIds = harness
		.getCommittedItems()
		.filter((item) => item.group === REFERENCE_IMAGE_GROUP_FRONT)
		.map((item) => item.id);
	assert.deepEqual(frontIds, ["front-2", "front-0", "front-1", "front-3"]);
}

{
	const harness = createHarness({
		items: createItems(),
		selectedItemIds: ["front-1", "front-0"],
	});

	const moved = harness.operations.moveReferenceImageToDisplayTarget(
		"front-0",
		"front-3",
		"before",
		["front-3", "front-2", "front-1", "front-0", "back-0"],
	);

	assert.equal(moved, true);
	assert.equal(harness.getHistoryLabels().at(-1), "reference-image.order");
	const displayIds = getReferenceImageDisplayItems(
		harness.getCommittedItems(),
	).map((item) => item.id);
	assert.deepEqual(displayIds, [
		"front-1",
		"front-0",
		"front-3",
		"front-2",
		"back-0",
	]);
}

console.log("✅ CAMERA_FRAMES reference image list operations tests passed!");
