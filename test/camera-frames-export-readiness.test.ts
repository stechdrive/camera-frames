import assert from "node:assert/strict";
import {
	buildExportReadinessPlan,
	countExportSceneAssets,
	finalizeExportReadiness,
	normalizeExportReadinessPolicy,
} from "../src/engine/export-readiness.js";

assert.deepEqual(countExportSceneAssets([]), {
	splatCount: 0,
	modelCount: 0,
	totalCount: 0,
});

assert.deepEqual(
	countExportSceneAssets([
		{ kind: "splat" },
		{ kind: "model" },
		{ kind: "splat" },
		{ kind: "unknown" },
	]),
	{
		splatCount: 2,
		modelCount: 1,
		totalCount: 3,
	},
);

assert.deepEqual(
	normalizeExportReadinessPolicy({
		minWarmupPasses: -5,
		splatWarmupPasses: "4",
		maxWaitMs: 0,
	}),
	{
		minWarmupPasses: 0,
		splatWarmupPasses: 4,
		splatSettledPasses: 2,
		maxWaitMs: 1500,
	},
);

{
	const plan = buildExportReadinessPlan({
		sceneAssets: [{ kind: "model" }],
	});
	assert.equal(plan.requiresSplatWarmup, false);
	assert.equal(plan.warmupPasses, 0);
	assert.equal(plan.settledPasses, 0);
	assert.deepEqual(plan.assetCounts, {
		splatCount: 0,
		modelCount: 1,
		totalCount: 1,
	});
}

{
	const plan = buildExportReadinessPlan({
		sceneAssets: [{ kind: "splat" }, { kind: "model" }],
	});
	assert.equal(plan.requiresSplatWarmup, true);
	assert.equal(plan.warmupPasses, 2);
	assert.equal(plan.settledPasses, 2);
	assert.deepEqual(
		finalizeExportReadiness(plan, {
			completedWarmupPasses: 1,
			completedRenderPasses: 2,
			settledPassesPlanned: 2,
			completedSettledPasses: 0,
			probeSupported: true,
			lastReadinessProbe: {
				supported: true,
				pending: true,
				pendingCounts: { pagerFetchers: 1 },
				pendingReasons: ["pagerFetchers:1"],
			},
			timedOut: true,
		}),
		{
			maxWaitMs: 1500,
			warmupPassesPlanned: 2,
			completedWarmupPasses: 1,
			completedRenderPasses: 2,
			settledPassesPlanned: 2,
			completedSettledPasses: 0,
			timedOut: true,
			requiresSplatWarmup: true,
			assetCounts: {
				splatCount: 1,
				modelCount: 1,
				totalCount: 2,
			},
			sparkReadinessProbe: {
				supported: true,
				lastState: {
					supported: true,
					pending: true,
					pendingCounts: { pagerFetchers: 1 },
					pendingReasons: ["pagerFetchers:1"],
				},
			},
		},
	);
}

console.log("✅ CAMERA_FRAMES export readiness tests passed!");
