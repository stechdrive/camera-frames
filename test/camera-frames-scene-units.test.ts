import assert from "node:assert/strict";
import {
	buildAssetCountBadge,
	buildSceneScaleSummary,
	buildSceneSummary,
	formatAssetWorldScale,
	getDefaultAssetUnitMode,
} from "../src/engine/scene-units.js";

assert.equal(getDefaultAssetUnitMode("model"), "meters");
assert.equal(getDefaultAssetUnitMode("splat"), "raw");
assert.equal(formatAssetWorldScale(1.25), "1.25x");

assert.equal(
	buildAssetCountBadge("en", { splatCount: 1, modelCount: 2, totalCount: 3 }),
	"1 splat + 2 models",
);
assert.equal(
	buildAssetCountBadge("ja", { splatCount: 1, modelCount: 2, totalCount: 3 }),
	"3DGS 1件 + モデル 2件",
);

const summary = buildSceneSummary("ja", {
	totalCount: 2,
	badgeText: "3DGS 1件 + モデル 1件",
	boundsSize: { x: 10.25, y: 3.5, z: 7.75 },
});
assert.match(summary, /2 件を読込: 3DGS 1件 \+ モデル 1件。/);
assert.match(summary, /境界 10\.3 × 3\.50 × 7\.75 m。/);

const scaleSummary = buildSceneScaleSummary("en", {
	assets: [
		{ unitMode: "meters", worldScale: 1 },
		{ unitMode: "raw", worldScale: 1.25 },
	],
});
assert.match(scaleSummary, /1 calibrated scale adjustment\(s\)\./);

console.log("✅ CAMERA_FRAMES scene unit tests passed!");
