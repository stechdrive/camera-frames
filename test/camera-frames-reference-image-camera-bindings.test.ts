import assert from "node:assert/strict";
import { createReferenceImageCameraBindings } from "../src/controllers/reference-image/camera-bindings.js";

function clone(value) {
	return structuredClone(value);
}

{
	const store = {
		workspace: {
			shotCameras: {
				value: [
					{
						id: "camera-a",
						referenceImages: {
							presetId: "preset-a",
							overridesByPresetId: {
								"preset-a": {
									activeItemId: "item-a",
									items: { "item-a": { opacity: 0.5 } },
								},
							},
						},
					},
					{
						id: "camera-b",
						referenceImages: {
							presetId: "preset-b",
							overridesByPresetId: {
								"preset-b": {
									activeItemId: "item-b",
									items: { "item-b": { opacity: 0.8 } },
								},
							},
						},
					},
				],
			},
		},
	};
	let activeShotCamera = {
		id: "camera-a",
		referenceImages: {
			presetId: "preset-a",
			overridesByPresetId: {},
		},
	};
	const bindings = createReferenceImageCameraBindings({
		store,
		getActiveShotCameraDocument: () => activeShotCamera,
		updateActiveShotCameraDocument: (updater) => {
			activeShotCamera = updater(activeShotCamera);
			return activeShotCamera;
		},
		cloneShotCameraDocument: clone,
		createShotCameraReferenceImagesState: (state) =>
			clone(state ?? { presetId: null, overridesByPresetId: {} }),
		createReferenceImageCameraPresetOverride: (state) =>
			clone(state ?? { activeItemId: null, items: {} }),
		isReferenceImageOverrideEmpty: (override) =>
			!override?.activeItemId &&
			Object.keys(override?.items ?? {}).length === 0,
	});

	bindings.ensureActiveShotPresetBinding("preset-c");
	assert.equal(activeShotCamera.referenceImages.presetId, "preset-c");

	bindings.dropReferencePresetFromAllShotCameras("preset-a", "default");
	assert.equal(
		store.workspace.shotCameras.value[0].referenceImages.presetId,
		"default",
	);
	assert.equal(
		store.workspace.shotCameras.value[0].referenceImages.overridesByPresetId[
			"preset-a"
		],
		undefined,
	);

	bindings.removeReferenceItemsFromAllShotCameras("preset-b", ["item-b"]);
	assert.equal(
		store.workspace.shotCameras.value[1].referenceImages.overridesByPresetId[
			"preset-b"
		],
		undefined,
	);
}

console.log("✅ CAMERA_FRAMES reference image camera bindings tests passed!");
