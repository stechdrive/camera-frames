import assert from "node:assert/strict";
import { createSceneAssetSelectionOrderController } from "../src/controllers/scene-assets/selection-order.js";

function createHarness(assetIds = [1, 2, 3, 4]) {
	const sceneState = {
		assets: assetIds.map((id) => ({
			id,
			kind: "model",
			label: `Asset ${id}`,
		})),
	};
	const store = {
		selectedSceneAssetIds: { value: [] as number[] },
		selectedSceneAssetId: { value: null as number | null },
	};
	let selectionAnchorId: number | null = null;
	let updateCount = 0;
	const statusEvents: string[] = [];
	const selectionOrder = createSceneAssetSelectionOrderController({
		sceneState,
		store,
		updateUi: () => {
			updateCount += 1;
		},
		setStatus: (message) => {
			statusEvents.push(message);
		},
		t: (key, values = {}) => {
			if (key === "status.assetOrderUpdated") {
				return `${values.name ?? "Asset"}:${values.index ?? "?"}`;
			}
			return key;
		},
		runHistoryAction: (_label, applyChange) => {
			applyChange?.();
			return false;
		},
		getSceneAsset: (assetId) =>
			sceneState.assets.find((asset) => asset.id === assetId) ?? null,
		getSelectionAnchorId: () => selectionAnchorId,
		setSelectionAnchorId: (nextAnchorId) => {
			selectionAnchorId = nextAnchorId;
		},
	});

	return {
		sceneState,
		store,
		selectionOrder,
		getSelectionAnchorId: () => selectionAnchorId,
		getUpdateCount: () => updateCount,
		statusEvents,
	};
}

{
	const harness = createHarness();
	harness.selectionOrder.selectSceneAsset(2);
	harness.selectionOrder.selectSceneAsset(4, {
		range: true,
		orderedIds: [1, 2, 3, 4],
	});

	assert.deepEqual(harness.store.selectedSceneAssetIds.value, [2, 3, 4]);
	assert.equal(harness.store.selectedSceneAssetId.value, 4);
	assert.equal(harness.getSelectionAnchorId(), 2);
	assert.equal(harness.getUpdateCount(), 2);
}

{
	const harness = createHarness();
	harness.store.selectedSceneAssetIds.value = [2, 3];
	harness.store.selectedSceneAssetId.value = 3;
	harness.selectionOrder.moveAssetToIndex(3, 0);

	assert.deepEqual(
		harness.sceneState.assets.map((asset) => asset.id),
		[2, 3, 1, 4],
	);
	assert.equal(harness.statusEvents.at(-1), "Asset 3:2");
}

{
	const harness = createHarness();
	harness.store.selectedSceneAssetIds.value = [2, 3];
	harness.store.selectedSceneAssetId.value = 3;
	harness.selectionOrder.moveAssetToIndex(4, 0);

	assert.deepEqual(
		harness.sceneState.assets.map((asset) => asset.id),
		[4, 1, 2, 3],
	);
	assert.equal(harness.statusEvents.at(-1), "Asset 4:1");
}

console.log("✅ CAMERA_FRAMES scene asset selection/order tests passed!");
