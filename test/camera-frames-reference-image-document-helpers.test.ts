import assert from "node:assert/strict";
import {
	buildDuplicatePresetName,
	ensureWritableReferenceImageImportPreset,
	pruneUnusedReferenceImageAssetsInDocument,
	sanitizeReferenceImagePresetName,
	supportsReferenceImageFile,
} from "../src/controllers/reference-image/document-helpers.js";
import {
	REFERENCE_IMAGE_DEFAULT_PRESET_ID,
	createDefaultReferenceImageDocument,
	createReferenceImageAsset,
	createReferenceImageItem,
	createReferenceImagePreset,
} from "../src/reference-image-model.js";
import { createShotCameraDocument } from "../src/workspace-model.js";

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

{
	const documentState = createDefaultReferenceImageDocument();
	const shotCameraDocument = createShotCameraDocument({
		name: "Camera A",
	});
	shotCameraDocument.referenceImages.presetId =
		REFERENCE_IMAGE_DEFAULT_PRESET_ID;

	const preset = ensureWritableReferenceImageImportPreset(
		documentState,
		shotCameraDocument,
		"board.png",
	);

	assert.notEqual(preset.id, REFERENCE_IMAGE_DEFAULT_PRESET_ID);
	assert.equal(preset.name, "board");
	assert.equal(documentState.activePresetId, preset.id);
	assert.equal(
		shotCameraDocument.referenceImages.presetId,
		REFERENCE_IMAGE_DEFAULT_PRESET_ID,
	);
}

{
	const documentState = createDefaultReferenceImageDocument();

	const preset = ensureWritableReferenceImageImportPreset(
		documentState,
		null,
		"board.png",
	);

	assert.notEqual(preset.id, REFERENCE_IMAGE_DEFAULT_PRESET_ID);
	assert.equal(preset.name, "board");
	assert.equal(documentState.presets[0].id, REFERENCE_IMAGE_DEFAULT_PRESET_ID);
	assert.equal(documentState.presets[0].items.length, 0);
	assert.equal(documentState.activePresetId, preset.id);
}

console.log("✅ CAMERA_FRAMES reference image document helper tests passed!");
