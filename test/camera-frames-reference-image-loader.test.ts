import assert from "node:assert/strict";
import { getPsdLeafLayersInStackOrder } from "../src/engine/reference-image-loader.js";

{
	const flattened = getPsdLeafLayersInStackOrder([
		{ name: "Bottom" },
		{
			name: "Group",
			children: [{ name: "Group Bottom" }, { name: "Group Top" }],
		},
		{ name: "Top" },
	]);

	assert.deepEqual(
		flattened.map((layer) => layer.name),
		["Bottom", "Group Bottom", "Group Top", "Top"],
	);
}

console.log("✅ CAMERA_FRAMES reference image loader tests passed!");
