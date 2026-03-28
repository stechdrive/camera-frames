import assert from "node:assert/strict";
import { buildExportPassPlan } from "../src/engine/export-pass-plan.js";

{
	const emptyPlan = buildExportPassPlan([]);
	assert.deepEqual(emptyPlan, {
		beauty: {
			id: "beauty",
			name: "Beauty",
			category: "render",
			assetIds: [],
		},
		masks: [],
	});
}

{
	const plan = buildExportPassPlan([
		{ id: 1, label: "GLB A", exportRole: "beauty", maskGroup: "" },
		{ id: 2, label: "SPLAT B", exportRole: "beauty", maskGroup: "Characters" },
		{ id: 3, label: "Hidden C", exportRole: "omit", maskGroup: "Background" },
	]);

	assert.equal(plan.beauty.id, "beauty");
	assert.deepEqual(plan.beauty.assetIds, [1, 2]);
	assert.equal(plan.masks.length, 2);
	assert.deepEqual(plan.masks[0], {
		id: "mask:asset-1",
		name: "Mask GLB A",
		category: "mask",
		assetIds: [1],
		maskGroup: "",
		assetLabel: "GLB A",
	});
	assert.deepEqual(plan.masks[1], {
		id: "mask:asset-2",
		name: "Mask SPLAT B",
		category: "mask",
		assetIds: [2],
		maskGroup: "Characters",
		assetLabel: "SPLAT B",
	});
}

console.log("✅ CAMERA_FRAMES export pass plan tests passed!");
