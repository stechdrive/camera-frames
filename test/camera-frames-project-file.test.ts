import assert from "node:assert/strict";
import {
	buildCameraFramesProjectArchive,
	createProjectFileEmbeddedFileSource,
	createProjectFilePackedSplatSource,
	isProjectFileEmbeddedFileSource,
	isProjectFilePackedSplatSource,
	readCameraFramesProject,
} from "../src/project-file.js";
import {
	createDefaultReferenceImageDocument,
	createReferenceImageAsset,
	createReferenceImageItem,
} from "../src/reference-image-model.js";

const referenceImageDocument = createDefaultReferenceImageDocument();
const referenceImageAsset = createReferenceImageAsset({
	id: "ref-asset-1",
	label: "rough",
	source: createProjectFileEmbeddedFileSource({
		kind: "reference-image",
		file: new File([new Uint8Array([9, 8, 7, 6])], "rough.png", {
			type: "image/png",
		}),
		fileName: "rough.png",
	}),
	sourceMeta: {
		filename: "rough.png",
		mime: "image/png",
		originalSize: { w: 1024, h: 512 },
		appliedSize: { w: 1024, h: 512 },
		pixelRatio: 1,
		usedOriginal: true,
	},
});
referenceImageDocument.assets.push(referenceImageAsset);
referenceImageDocument.presets[0].items.push(
	createReferenceImageItem({
		id: "ref-item-1",
		assetId: referenceImageAsset.id,
		name: "rough",
		group: "front",
		order: 0,
		previewVisible: true,
		exportEnabled: true,
		opacity: 0.8,
		scalePct: 100,
		rotationDeg: 12,
		offsetPx: { x: 24, y: -12 },
		anchor: { ax: 0.5, ay: 0.5 },
	}),
);

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
			referenceImages: {
				presetId: referenceImageDocument.presets[0].id,
				overridesByPresetId: {},
			},
		},
	],
	scene: {
		assets: [
			{
				id: "asset-model",
				kind: "model",
				label: "Layout",
				legacyState: {
					filename: "models/layout.glb",
					transform: {
						position: [10, 20, 30],
						rotation: [0, 0, 0, 1],
						scale: [1, 1, 1],
					},
				},
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
				contentTransform: {
					position: { x: 0.25, y: -0.5, z: 0.75 },
					quaternion: { x: 0, y: 0.382683, z: 0, w: 0.92388 },
					scale: { x: 1.2, y: 1.2, z: 1.2 },
				},
				baseScale: { x: 1, y: 1, z: 1 },
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
				legacyState: {
					filename: "splats/meta.json",
					position: [1, 2, 3],
					rotation: [0, 0, 0, 1],
					scale: [1, 1, 1],
				},
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
		lighting: {
			ambient: 0.42,
			modelLight: {
				enabled: false,
				intensity: 1.65,
				azimuthDeg: 72,
				elevationDeg: 28,
			},
		},
		referenceImages: referenceImageDocument,
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
assert.equal(result.project.scene.assets[0].contentTransform.position.x, 0.25);
assert.equal(result.project.scene.assets[0].contentTransform.scale.x, 1.2);
assert.equal(result.project.scene.assets[0].baseScale.x, 1);
assert.equal(result.project.scene.lighting.ambient, 0.42);
assert.equal(result.project.scene.lighting.modelLight.enabled, false);
assert.equal(result.project.scene.lighting.modelLight.intensity, 1.65);
assert.equal(result.project.scene.lighting.modelLight.azimuthDeg, 72);
assert.equal(result.project.scene.lighting.modelLight.elevationDeg, 28);
assert.equal(result.project.scene.referenceImages.assets.length, 1);
assert.equal(result.project.scene.referenceImages.presets[0].items.length, 1);
assert.equal(result.assetEntries.length, 2);

assert.equal(
	isProjectFileEmbeddedFileSource(result.assetEntries[0].source),
	true,
);
assert.equal(result.assetEntries[0].source.file.name, "layout.glb");
assert.equal(result.assetEntries[0].source.projectAssetState.label, "Layout");
assert.equal(
	result.assetEntries[0].source.legacyState.filename,
	"models/layout.glb",
);

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
assert.equal(
	result.assetEntries[1].source.legacyState.filename,
	"splats/meta.json",
);
assert.equal(
	result.project.scene.referenceImages.assets[0].source.file.name,
	"rough.png",
);
assert.equal(
	result.project.scene.referenceImages.assets[0].source.projectAssetState,
	null,
);
assert.equal(
	result.project.scene.referenceImages.presets[0].items[0].rotationDeg,
	12,
);

const rawPackedProjectSnapshot = {
	workspace: projectSnapshot.workspace,
	shotCameras: projectSnapshot.shotCameras,
	scene: {
		assets: [
			{
				id: "asset-raw-splat",
				kind: "splat",
				label: "Derived Splat",
				source: createProjectFilePackedSplatSource({
					fileName: "derived.rawsplat",
					packedArray: new Uint32Array([1, 2, 3, 4, 5, 6, 7, 8]),
					numSplats: 1,
					extra: {
						sh1: new Uint32Array([11, 12, 13, 14]),
					},
					splatEncoding: {
						rgbMin: 0,
						rgbMax: 1,
					},
				}),
				transform: {
					position: { x: 0, y: 0, z: 0 },
					quaternion: { x: 0, y: 0, z: 0, w: 1 },
				},
				worldScale: 1,
				unitMode: "meters",
				visible: true,
				exportRole: "beauty",
				maskGroup: "",
				workingPivotLocal: null,
			},
		],
		lighting: projectSnapshot.scene.lighting,
		referenceImages: createDefaultReferenceImageDocument(),
	},
};

const rawPackedArchive = await buildCameraFramesProjectArchive(
	rawPackedProjectSnapshot,
);
const rawPackedResult = await readCameraFramesProject(
	new File([rawPackedArchive], "raw-packed.ssproj"),
);

assert.equal(rawPackedResult.project.scene.assets.length, 1);
assert.equal(
	isProjectFilePackedSplatSource(rawPackedResult.assetEntries[0].source),
	true,
);
assert.equal(
	rawPackedResult.assetEntries[0].source.fileName,
	"derived.rawsplat",
);
assert.deepEqual(
	Array.from(rawPackedResult.assetEntries[0].source.packedArray),
	[1, 2, 3, 4, 5, 6, 7, 8],
);
assert.equal(rawPackedResult.assetEntries[0].source.numSplats, 1);
assert.deepEqual(
	Array.from(rawPackedResult.assetEntries[0].source.extra.sh1),
	[11, 12, 13, 14],
);
assert.equal(rawPackedResult.assetEntries[0].source.splatEncoding.rgbMax, 1);

console.log("✅ CAMERA_FRAMES project file tests passed!");
