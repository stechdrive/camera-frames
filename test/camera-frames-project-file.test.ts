import assert from "node:assert/strict";
import {
	buildCameraFramesProjectArchive,
	createProjectFileEmbeddedFileSource,
	createProjectFilePackedSplatSource,
	isProjectFileEmbeddedFileSource,
	isProjectFilePackedSplatSource,
	readCameraFramesProject,
} from "../src/project-file.js";

const projectSnapshot = {
	workspace: {
		activeShotCameraId: "shot-camera-1",
		viewport: {
			baseFovX: 55,
			pose: {
				position: { x: 1, y: 2, z: 3 },
				quaternion: { x: 0, y: 0, z: 0, w: 1 },
				up: { x: 0, y: 1, z: 0 },
			},
		},
	},
	shotCameras: [
		{
			id: "shot-camera-1",
			name: "Camera 1",
			pose: {
				position: { x: 4, y: 5, z: 6 },
				quaternion: { x: 0, y: 0, z: 0, w: 1 },
				up: { x: 0, y: 1, z: 0 },
			},
			lens: { baseFovX: 48 },
			clipping: { mode: "manual", near: 0.2, far: 200 },
			outputFrame: {
				widthScale: 1.1,
				heightScale: 0.9,
				viewZoom: 1.2,
				viewZoomAuto: false,
				anchor: "top-right",
				centerX: 0.4,
				centerY: 0.6,
			},
			exportSettings: {
				exportName: "cut-a",
				exportFormat: "png",
				exportGridOverlay: true,
				exportGridLayerMode: "overlay",
				exportModelLayers: false,
				exportSplatLayers: false,
			},
			frames: [
				{
					id: "frame-1",
					name: "FRAME A",
					x: 0.5,
					y: 0.5,
					scale: 1,
					rotation: 0,
					order: 0,
					anchor: { x: 0.5, y: 0.5 },
				},
			],
			activeFrameId: "frame-1",
		},
	],
	scene: {
		assets: [
			{
				id: "asset-model",
				kind: "model",
				label: "Layout",
				source: createProjectFileEmbeddedFileSource({
					kind: "model",
					file: new File([new Uint8Array([1, 2, 3, 4])], "layout.glb", {
						type: "model/gltf-binary",
					}),
					fileName: "layout.glb",
				}),
				transform: {
					position: { x: 1, y: 0, z: 0 },
					quaternion: { x: 0, y: 0, z: 0, w: 1 },
				},
				worldScale: 1,
				unitMode: "meters",
				visible: true,
				exportRole: "beauty",
				maskGroup: "",
				workingPivotLocal: null,
			},
			{
				id: "asset-splat",
				kind: "splat",
				label: "Packed Splat",
				source: createProjectFilePackedSplatSource({
					fileName: "meta.json",
					inputBytes: new TextEncoder().encode('{"files":["means.bin"]}'),
					extraFiles: {
						"means.bin": new Uint8Array([5, 6, 7]).buffer,
					},
					fileType: "pcsogs",
				}),
				transform: {
					position: { x: 0, y: 1, z: 0 },
					quaternion: { x: 0, y: 0, z: 0, w: 1 },
				},
				worldScale: 2,
				unitMode: "meters",
				visible: false,
				exportRole: "omit",
				maskGroup: "mask-a",
				workingPivotLocal: { x: 0.1, y: 0.2, z: 0.3 },
			},
		],
		referenceImages: [
			{
				id: "ref-1",
				label: "rough",
				source: null,
				space: "shot-camera",
				shotCameraId: "shot-camera-1",
				placement: {
					x: 0.5,
					y: 0.5,
					scale: 1,
					rotation: 0,
				},
				opacity: 0.8,
				blendMode: "normal",
				visible: true,
				locked: false,
			},
		],
	},
};

const archive = await buildCameraFramesProjectArchive(projectSnapshot);
const result = await readCameraFramesProject(
	new File([archive], "scene.ssproj"),
);

assert.equal(result.manifest.format, "camera-frames-project");
assert.equal(result.project.workspace.activeShotCameraId, "shot-camera-1");
assert.equal(result.project.workspace.viewport.baseFovX, 55);
assert.equal(result.project.shotCameras.length, 1);
assert.equal(result.project.shotCameras[0].pose.position.x, 4);
assert.equal(result.project.scene.assets.length, 2);
assert.equal(result.project.scene.referenceImages.length, 1);
assert.equal(result.assetEntries.length, 2);

assert.equal(
	isProjectFileEmbeddedFileSource(result.assetEntries[0].source),
	true,
);
assert.equal(result.assetEntries[0].source.file.name, "layout.glb");
assert.equal(result.assetEntries[0].source.projectAssetState.label, "Layout");

assert.equal(
	isProjectFilePackedSplatSource(result.assetEntries[1].source),
	true,
);
assert.equal(result.assetEntries[1].source.fileType, "pcsogs");
assert.deepEqual(Object.keys(result.assetEntries[1].source.extraFiles), [
	"means.bin",
]);
assert.equal(
	result.assetEntries[1].source.projectAssetState.exportRole,
	"omit",
);

console.log("✅ CAMERA_FRAMES project file tests passed!");
