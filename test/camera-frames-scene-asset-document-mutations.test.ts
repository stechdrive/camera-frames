import assert from "node:assert/strict";
import { createSceneAssetDocumentMutationsController } from "../src/controllers/scene-assets/document-mutations.js";

function createAsset(id, label = `Asset ${id}`) {
	return {
		id,
		label,
		object: {
			name: label,
			visible: true,
		},
		exportRole: "beauty",
		maskGroup: "",
	};
}

function createHarness() {
	const sceneState = {
		assets: [createAsset(1), createAsset(2), createAsset(3)],
	};
	const store = {
		selectedSceneAssetIds: { value: [] as number[] },
		selectedSceneAssetId: { value: null as number | null },
	};
	let selectionAnchorId: number | null = null;
	let updateCount = 0;
	let cacheResetCount = 0;
	let cameraSummaryCount = 0;
	const detachedIds = [];
	const historyLabels = [];
	const statusEvents = [];
	const mutations = createSceneAssetDocumentMutationsController({
		sceneState,
		store,
		getSceneAsset: (assetId) =>
			sceneState.assets.find((asset) => asset.id === assetId) ?? null,
		getSelectedSceneAssets: () =>
			sceneState.assets.filter((asset) =>
				store.selectedSceneAssetIds.value.includes(asset.id),
			),
		runHistoryAction: (label, applyChange) => {
			historyLabels.push(label);
			applyChange?.();
			return false;
		},
		detachSceneAsset: (asset) => {
			detachedIds.push(asset.id);
		},
		setSelectionAnchorId: (nextAnchorId) => {
			selectionAnchorId = nextAnchorId;
		},
		resetLocalizedCaches: () => {
			cacheResetCount += 1;
		},
		updateCameraSummary: () => {
			cameraSummaryCount += 1;
		},
		updateUi: () => {
			updateCount += 1;
		},
		setStatus: (message) => {
			statusEvents.push(message);
		},
		t: (key, values = {}) => {
			switch (key) {
				case "assetVisibility.visible":
					return "visible";
				case "assetVisibility.hidden":
					return "hidden";
				case "status.assetVisibilityUpdated":
					return `${values.name}:${values.visibility}`;
				case "status.deletedSceneAsset":
					return `deleted:${values.name}`;
				case "status.deletedSceneAssets":
					return `deleted:${values.count}`;
				case "status.assetExportRoleUpdated":
					return `${values.name}:${values.role}`;
				case "exportRole.beauty":
					return "beauty";
				case "exportRole.omit":
					return "omit";
				case "status.assetMaskGroupUpdated":
					return `${values.name}:${values.group}`;
				default:
					return key;
			}
		},
	});

	return {
		sceneState,
		store,
		mutations,
		detachedIds,
		historyLabels,
		statusEvents,
		getSelectionAnchorId: () => selectionAnchorId,
		getUpdateCount: () => updateCount,
		getCacheResetCount: () => cacheResetCount,
		getCameraSummaryCount: () => cameraSummaryCount,
	};
}

{
	const harness = createHarness();

	harness.mutations.setAssetVisibility(1, false);
	harness.mutations.setAssetLabel(1, "  New\tName  ");

	assert.equal(harness.sceneState.assets[0].object.visible, false);
	assert.equal(harness.sceneState.assets[0].label, "New Name");
	assert.equal(harness.sceneState.assets[0].object.name, "New Name");
	assert.deepEqual(harness.historyLabels, ["asset.visibility", "asset.label"]);
	assert.deepEqual(harness.statusEvents, ["Asset 1:hidden"]);
	assert.equal(harness.getUpdateCount(), 2);
}

{
	const harness = createHarness();
	harness.store.selectedSceneAssetIds.value = [2, 3];
	harness.store.selectedSceneAssetId.value = 3;

	const deleted = harness.mutations.deleteSelectedSceneAssets();

	assert.equal(deleted, true);
	assert.deepEqual(
		harness.sceneState.assets.map((asset) => asset.id),
		[1],
	);
	assert.deepEqual(harness.detachedIds, [2, 3]);
	assert.deepEqual(harness.store.selectedSceneAssetIds.value, [1]);
	assert.equal(harness.store.selectedSceneAssetId.value, 1);
	assert.equal(harness.getSelectionAnchorId(), 1);
	assert.equal(harness.getCacheResetCount(), 1);
	assert.equal(harness.getCameraSummaryCount(), 1);
	assert.equal(harness.statusEvents.at(-1), "deleted:2");
}

{
	const harness = createHarness();
	harness.store.selectedSceneAssetIds.value = [1, 2];

	harness.mutations.setSelectedSceneAssetsVisibility(false);
	harness.mutations.setAssetExportRole(1, "omit");
	harness.mutations.setAssetExportRole(2, "invalid");
	harness.mutations.setAssetMaskGroup(1, "  fg  ");
	harness.mutations.setAssetMaskGroup(1, "   ");

	assert.equal(harness.sceneState.assets[0].object.visible, false);
	assert.equal(harness.sceneState.assets[1].object.visible, false);
	assert.equal(harness.sceneState.assets[0].exportRole, "omit");
	assert.equal(harness.sceneState.assets[1].exportRole, "beauty");
	assert.equal(harness.sceneState.assets[0].maskGroup, "");
	assert.deepEqual(harness.historyLabels, [
		"asset.visibility",
		"asset.export-role",
		"asset.export-role",
		"asset.mask-group",
		"asset.mask-group",
	]);
	assert.deepEqual(harness.statusEvents, [
		"Asset 1:omit",
		"Asset 2:beauty",
		"Asset 1:fg",
		"Asset 1:—",
	]);
}

console.log("✅ CAMERA_FRAMES scene asset document mutation tests passed!");
