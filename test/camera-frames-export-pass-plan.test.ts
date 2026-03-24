import assert from "node:assert/strict";
import { buildExportPassPlan } from "../src/engine/export-pass-plan.js";

{
	const plan = buildExportPassPlan([
		{ id: 1, exportRole: "beauty", maskGroup: "" },
		{ id: 2, exportRole: "beauty", maskGroup: "Characters" },
		{ id: 3, exportRole: "omit", maskGroup: "Background" },
	]);

	assert.equal(plan.beauty.id, "beauty");
	assert.deepEqual(plan.beauty.assetIds, [1, 2]);
	assert.equal(plan.masks.length, 2);
	assert.deepEqual(plan.masks[0], {
		id: "mask:Characters",
		name: "Mask Characters",
		category: "mask",
		assetIds: [2],
		maskGroup: "Characters",
	});
	assert.deepEqual(plan.masks[1], {
		id: "mask:Background",
		name: "Mask Background",
		category: "mask",
		assetIds: [3],
		maskGroup: "Background",
	});
}

console.log("✅ CAMERA_FRAMES export pass plan tests passed!");
