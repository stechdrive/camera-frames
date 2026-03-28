import assert from "node:assert/strict";
import {
	cloneReferenceImageDocument,
	createReferenceImageAsset,
	createReferenceImageCameraPresetOverride,
	createReferenceImageItem,
	createReferenceImagePreset,
	createShotCameraReferenceImagesState,
} from "../src/reference-image-model.js";

{
	const asset = createReferenceImageAsset(null);
	assert.equal(asset.label, "Reference");
	assert.equal(asset.source, null);
}

{
	const item = createReferenceImageItem(null);
	assert.equal(item.name, "Reference");
	assert.equal(item.group, "front");
	assert.equal(item.rotationDeg, 0);
}

{
	const item = createReferenceImageItem({
		anchor: { ax: -0.25, ay: 1.75 },
	});
	assert.equal(item.anchor.ax, -0.25);
	assert.equal(item.anchor.ay, 1.75);
}

{
	const preset = createReferenceImagePreset(null);
	assert.equal(preset.items.length, 0);
	assert.equal(preset.baseRenderBox.w > 0, true);
}

{
	const override = createReferenceImageCameraPresetOverride(null);
	assert.equal(override.activeItemId, null);
	assert.deepEqual(override.renderBoxCorrection, { x: 0, y: 0 });
	assert.deepEqual(override.items, {});
}

{
	const shotState = createShotCameraReferenceImagesState(null);
	assert.equal(shotState.presetId, null);
	assert.deepEqual(shotState.overridesByPresetId, {});
}

{
	const file = new File([new Uint8Array([1, 2, 3])], "rough.png", {
		type: "image/png",
	});
	const documentState = {
		version: 1,
		activePresetId: "reference-preset-blank",
		assets: [
			createReferenceImageAsset({
				id: "asset-1",
				label: "rough",
				source: {
					type: "project-file-embedded-file",
					kind: "reference-image",
					file,
					fileName: "rough.png",
				},
				sourceMeta: {
					filename: "rough.png",
					mime: "image/png",
					originalSize: { w: 256, h: 128 },
					appliedSize: { w: 256, h: 128 },
					pixelRatio: 1,
					usedOriginal: true,
				},
			}),
		],
		presets: [
			createReferenceImagePreset({
				id: "reference-preset-blank",
				items: [
					createReferenceImageItem({
						id: "item-1",
						assetId: "asset-1",
						name: "rough",
					}),
				],
			}),
		],
	};
	const clone = cloneReferenceImageDocument(documentState);
	assert.equal(clone.assets.length, 1);
	assert.equal(clone.assets[0].source.file instanceof File, true);
	assert.notEqual(clone.assets[0].source.file, null);
}

console.log("✅ reference image model tests passed!");
