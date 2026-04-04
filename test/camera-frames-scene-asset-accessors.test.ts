import assert from "node:assert/strict";
import { createSceneAssetAccessors } from "../src/app/scene-asset-accessors.js";

{
	const calls = [];
	const assetController = {
		getSceneAssetCounts: () => ({ model: 1, splat: 2 }),
		getTotalLoadedItems: () => 3,
		getSceneAssets: () => [{ id: "asset-a" }],
		getSceneBounds: () => ({ min: 0, max: 1 }),
	};
	const uiSyncController = {
		resetLocalizedCaches: () => calls.push(["reset-localized"]),
	};

	const accessors = createSceneAssetAccessors({
		getAssetController: () => assetController,
		getUiSyncController: () => uiSyncController,
	});

	accessors.resetLocalizedCaches();
	assert.deepEqual(accessors.getSceneAssetCounts(), { model: 1, splat: 2 });
	assert.equal(accessors.getTotalLoadedItems(), 3);
	assert.deepEqual(accessors.getSceneAssets(), [{ id: "asset-a" }]);
	assert.deepEqual(accessors.getSceneBounds(), { min: 0, max: 1 });
	assert.deepEqual(calls, [["reset-localized"]]);
}

console.log("✅ CAMERA_FRAMES scene asset accessors tests passed!");
