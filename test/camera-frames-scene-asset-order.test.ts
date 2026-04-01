import assert from "node:assert/strict";
import {
	groupSceneAssetsByKind,
	moveSceneAssetBlockWithinKind,
	moveSceneAssetWithinKind,
} from "../src/engine/scene-asset-order.js";

const assets = [
	{ id: 1, kind: "splat", label: "Splat A" },
	{ id: 2, kind: "model", label: "Model A" },
	{ id: 3, kind: "splat", label: "Splat B" },
	{ id: 4, kind: "model", label: "Model B" },
];

const grouped = groupSceneAssetsByKind(assets);
assert.deepEqual(
	grouped.map((section) => ({
		kind: section.kind,
		ids: section.assets.map((asset) => asset.id),
	})),
	[
		{ kind: "model", ids: [2, 4] },
		{ kind: "splat", ids: [1, 3] },
	],
);

const movedWithinSplat = moveSceneAssetWithinKind(assets, 3, 0);
assert.deepEqual(
	movedWithinSplat.map((asset) => asset.id),
	[3, 2, 1, 4],
);

const movedWithinModel = moveSceneAssetWithinKind(assets, 4, 0);
assert.deepEqual(
	movedWithinModel.map((asset) => asset.id),
	[1, 4, 3, 2],
);

const blockAssets = [
	{ id: 1, kind: "splat", label: "Splat A" },
	{ id: 2, kind: "splat", label: "Splat B" },
	{ id: 3, kind: "splat", label: "Splat C" },
	{ id: 4, kind: "splat", label: "Splat D" },
	{ id: 5, kind: "splat", label: "Splat E" },
];

const movedBlock = moveSceneAssetBlockWithinKind(blockAssets, [2, 4], 2);
assert.deepEqual(
	movedBlock.map((asset) => asset.id),
	[1, 3, 2, 4, 5],
);

const movedBlockToEnd = moveSceneAssetBlockWithinKind(blockAssets, [2, 3], 999);
assert.deepEqual(
	movedBlockToEnd.map((asset) => asset.id),
	[1, 4, 5, 2, 3],
);

console.log("✅ CAMERA_FRAMES scene asset order tests passed!");
