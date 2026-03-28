import assert from "node:assert/strict";
import { getPsdReferenceImageGroupLayers } from "../src/engine/reference-image-export-order.js";
import {
	REFERENCE_IMAGE_GROUP_BACK,
	REFERENCE_IMAGE_GROUP_FRONT,
} from "../src/reference-image-model.js";

{
	const layers = [
		{
			id: "bottom",
			group: REFERENCE_IMAGE_GROUP_FRONT,
			order: 0,
		},
		{
			id: "middle",
			group: REFERENCE_IMAGE_GROUP_FRONT,
			order: 1,
		},
		{
			id: "top",
			group: REFERENCE_IMAGE_GROUP_FRONT,
			order: 2,
		},
		{
			id: "back-only",
			group: REFERENCE_IMAGE_GROUP_BACK,
			order: 0,
		},
	];

	const frontLayers = getPsdReferenceImageGroupLayers(
		layers,
		REFERENCE_IMAGE_GROUP_FRONT,
	);

	assert.deepEqual(
		frontLayers.map((layer) => layer.id),
		["top", "middle", "bottom"],
	);

	const backLayers = getPsdReferenceImageGroupLayers(
		layers,
		REFERENCE_IMAGE_GROUP_BACK,
	);
	assert.deepEqual(
		backLayers.map((layer) => layer.id),
		["back-only"],
	);
}

console.log("✅ CAMERA_FRAMES export controller tests passed!");
