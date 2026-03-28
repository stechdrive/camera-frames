import assert from "node:assert/strict";
import { ensureWritableReferenceImageImportPreset } from "../src/controllers/reference-image-controller.js";
import {
	REFERENCE_IMAGE_DEFAULT_PRESET_ID,
	createDefaultReferenceImageDocument,
	createReferenceImagePreset,
} from "../src/reference-image-model.js";
import { createShotCameraDocument } from "../src/workspace-model.js";

{
	const documentState = createDefaultReferenceImageDocument();
	const shotCameraDocument = createShotCameraDocument({
		name: "Camera A",
	});
	documentState.activePresetId = REFERENCE_IMAGE_DEFAULT_PRESET_ID;

	const preset = ensureWritableReferenceImageImportPreset(
		documentState,
		shotCameraDocument,
		"board.png",
	);

	assert.notEqual(preset.id, REFERENCE_IMAGE_DEFAULT_PRESET_ID);
	assert.equal(preset.name, "board");
	assert.equal(documentState.activePresetId, preset.id);
	assert.equal(documentState.presets.length, 2);
	assert.equal(documentState.presets[0].id, REFERENCE_IMAGE_DEFAULT_PRESET_ID);
}

{
	const documentState = createDefaultReferenceImageDocument();
	const sharedPreset = createReferenceImagePreset({
		id: "reference-preset-camera-a",
		name: "Camera A",
	});
	documentState.presets.push(sharedPreset);
	documentState.activePresetId = sharedPreset.id;
	const shotCameraDocument = createShotCameraDocument({
		name: "Camera A",
	});
	shotCameraDocument.referenceImages.presetId = sharedPreset.id;

	const preset = ensureWritableReferenceImageImportPreset(
		documentState,
		shotCameraDocument,
		"board.png",
	);

	assert.equal(preset.id, sharedPreset.id);
	assert.equal(documentState.presets.length, 2);
	assert.equal(documentState.activePresetId, sharedPreset.id);
}

console.log("✅ reference image controller tests passed!");
