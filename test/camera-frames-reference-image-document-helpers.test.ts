import assert from "node:assert/strict";
import {
	buildDuplicatePresetName,
	pruneUnusedReferenceImageAssetsInDocument,
	sanitizeReferenceImagePresetName,
	supportsReferenceImageFile,
} from "../src/controllers/reference-image/document-helpers.js";
import {
	createDefaultReferenceImageDocument,
	createReferenceImageAsset,
	createReferenceImageItem,
	createReferenceImagePreset,
} from "../src/reference-image-model.js";

assert.equal(supportsReferenceImageFile({ name: "board.PSD" }), true);
assert.equal(supportsReferenceImageFile({ fileName: "board.txt" }), false);

assert.equal(buildDuplicatePresetName("Reference"), "Reference Copy");
assert.equal(buildDuplicatePresetName("Board"), "Board Copy");

assert.equal(
	sanitizeReferenceImagePresetName(" \n  Hero\t Board  \r\n"),
	"Hero Board",
);
assert.equal(sanitizeReferenceImagePresetName(""), "Reference");

{
	const documentState = createDefaultReferenceImageDocument();
	const usedAsset = createReferenceImageAsset({
		id: "reference-asset-used",
		label: "Used",
		sourceMeta: {},
	});
	const unusedAsset = createReferenceImageAsset({
		id: "reference-asset-unused",
		label: "Unused",
		sourceMeta: {},
	});
	documentState.assets.push(usedAsset, unusedAsset);
	documentState.presets.push(
		createReferenceImagePreset({
			id: "reference-preset-a",
			name: "Preset A",
			items: [
				createReferenceImageItem({
					id: "reference-item-a",
					assetId: usedAsset.id,
					name: "Used Layer",
				}),
			],
		}),
	);

	pruneUnusedReferenceImageAssetsInDocument(documentState);

	assert.deepEqual(
		documentState.assets.map((asset) => asset.id),
		["reference-asset-used"],
	);
}

console.log("✅ CAMERA_FRAMES reference image document helper tests passed!");
