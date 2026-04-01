import assert from "node:assert/strict";
import {
	buildSceneAssetExportMetadata,
	getShotCameraExportSettings,
	resolveExportTargetShotCameras,
} from "../src/controllers/export/targets.js";

const SHOT_CAMERAS = [
	{ id: "shot-a", name: "Camera A" },
	{ id: "shot-b", name: "Camera B" },
	{ id: "shot-c", name: "Camera C" },
];

{
	const targetDocuments = resolveExportTargetShotCameras({
		store: {
			exportOptions: {
				target: { value: "current" },
				presetIds: { value: ["shot-c"] },
			},
			workspace: {
				shotCameras: { value: SHOT_CAMERAS },
			},
		},
		getActiveShotCameraDocument: () => SHOT_CAMERAS[1],
	});

	assert.deepEqual(
		targetDocuments.map((documentState) => documentState.id),
		["shot-b"],
	);
}

{
	const targetDocuments = resolveExportTargetShotCameras({
		store: {
			exportOptions: {
				target: { value: "all" },
				presetIds: { value: ["shot-c"] },
			},
			workspace: {
				shotCameras: { value: SHOT_CAMERAS },
			},
		},
		getActiveShotCameraDocument: () => SHOT_CAMERAS[1],
	});

	assert.deepEqual(
		targetDocuments.map((documentState) => documentState.id),
		["shot-a", "shot-b", "shot-c"],
	);
}

{
	const targetDocuments = resolveExportTargetShotCameras({
		store: {
			exportOptions: {
				target: { value: "selected" },
				presetIds: { value: ["shot-c", "shot-a", "missing"] },
			},
			workspace: {
				shotCameras: { value: SHOT_CAMERAS },
			},
		},
		getActiveShotCameraDocument: () => SHOT_CAMERAS[1],
	});

	assert.deepEqual(
		targetDocuments.map((documentState) => documentState.id),
		["shot-a", "shot-c"],
	);
}

{
	const settings = getShotCameraExportSettings({
		exportSettings: {
			exportName: 1234,
			exportFormat: "png",
			exportGridOverlay: 1,
			exportGridLayerMode: "overlay",
			exportModelLayers: false,
			exportSplatLayers: true,
		},
	});

	assert.deepEqual(settings, {
		exportName: "1234",
		exportFormat: "png",
		exportGridOverlay: true,
		exportGridLayerMode: "overlay",
		exportModelLayers: false,
		exportSplatLayers: false,
	});
}

{
	const settings = getShotCameraExportSettings({
		exportSettings: {
			exportFormat: "psd",
			exportModelLayers: true,
			exportSplatLayers: true,
		},
	});

	assert.deepEqual(settings, {
		exportName: "",
		exportFormat: "psd",
		exportGridOverlay: false,
		exportGridLayerMode: "bottom",
		exportModelLayers: true,
		exportSplatLayers: true,
	});
}

{
	const metadata = buildSceneAssetExportMetadata([
		{ id: 1, kind: "model", label: "Robot", exportRole: "beauty" },
		{ id: 2, kind: "splat", label: "Dust", maskGroup: "fx" },
	]);

	assert.deepEqual(metadata, [
		{
			id: 1,
			kind: "model",
			label: "Robot",
			exportRole: "beauty",
			maskGroup: "",
		},
		{
			id: 2,
			kind: "splat",
			label: "Dust",
			exportRole: "beauty",
			maskGroup: "fx",
		},
	]);
}

console.log("✅ CAMERA_FRAMES export target tests passed!");
