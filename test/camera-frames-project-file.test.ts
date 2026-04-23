import assert from "node:assert/strict";
import { buildImportProgressDetail } from "../src/controllers/project/overlays.js";
import { ZipReader } from "../src/project-archive.js";
import { PROJECT_DOCUMENT_PATH } from "../src/project/document.js";
import {
	buildCameraFramesProjectArchive,
	createProjectFileEmbeddedFileSource,
	createProjectFilePackedSplatSource,
	isProjectFileEmbeddedFileSource,
	isProjectFilePackedSplatSource,
	readCameraFramesProject,
} from "../src/project/file/index.js";
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
const projectReadProgress = [];
const result = await readCameraFramesProject(
	new File([archive], "scene.ssproj"),
	{
		onProgress: (progress) => {
			projectReadProgress.push(progress);
		},
	},
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
assert.equal(projectReadProgress[0]?.stage, "open-archive");
assert.ok(
	projectReadProgress.some(
		(progress) => progress.stage === "scan-project-assets",
	),
	"project package read must report the asset scan stage",
);
assert.ok(
	projectReadProgress.some(
		(progress) => progress.stage === "extract-project-asset-packed-splat",
	),
	"project package read must report packed-splat extraction detail",
);
assert.ok(
	projectReadProgress.some(
		(progress) => progress.stage === "extract-reference-image",
	),
	"project package read must report reference image extraction detail",
);
assert.equal(
	projectReadProgress.at(-1)?.stage,
	"expand-complete",
	"project package read should finish with a completion detail instead of leaving the last asset name visible",
);
assert.equal(projectReadProgress.at(-1)?.total, 2);

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

const t = (key, values = {}) =>
	`${key}:${Object.entries(values)
		.map(([name, value]) => `${name}=${value}`)
		.join(",")}`;
assert.match(
	buildImportProgressDetail(t, {
		stage: "extract-project-asset-packed-splat",
		index: 2,
		total: 3,
		assetLabel: "Packed Splat",
		fileLabel: "meta.json",
		fileCount: 4,
	}),
	/overlay\.importDetailExtractProjectAssetData:.*stage=overlay\.importProjectAssetExtractStage\.packedSplat/u,
);
assert.match(
	buildImportProgressDetail(t, {
		stage: "expand-complete",
		total: 3,
	}),
	/^overlay\.importDetailExpandComplete:/u,
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

assert.equal(
	rawPackedResult.assetEntries[0].source.lodSplats,
	null,
	"ssproj without baked LoD must round-trip with lodSplats === null",
);

const bakedLodProjectSnapshot = {
	workspace: projectSnapshot.workspace,
	shotCameras: projectSnapshot.shotCameras,
	scene: {
		assets: [
			{
				id: "asset-baked-lod",
				kind: "splat",
				label: "Baked LoD Splat",
				source: createProjectFilePackedSplatSource({
					fileName: "baked.rawsplat",
					packedArray: new Uint32Array([21, 22, 23, 24, 25, 26, 27, 28]),
					numSplats: 2,
					extra: {
						sh1: new Uint32Array([31, 32, 33, 34]),
					},
					splatEncoding: {
						rgbMin: 0,
						rgbMax: 1,
					},
					lodSplats: {
						packedArray: new Uint32Array([41, 42, 43, 44]),
						numSplats: 1,
						extra: {
							lodTree: new Uint32Array([51, 52]),
							sh1: new Uint32Array([61, 62]),
						},
						splatEncoding: {
							rgbMin: 0.1,
							rgbMax: 0.9,
						},
						bakedAt: "2026-04-23T12:00:00.000Z",
						bakedQuality: "quality",
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

const bakedLodArchive = await buildCameraFramesProjectArchive(
	bakedLodProjectSnapshot,
);
const bakedLodResult = await readCameraFramesProject(
	new File([bakedLodArchive], "baked-lod.ssproj"),
);

const bakedLodSource = bakedLodResult.assetEntries[0].source;
assert.equal(
	isProjectFilePackedSplatSource(bakedLodSource),
	true,
	"baked-LoD asset must restore as packed-splat source",
);
assert.deepEqual(
	Array.from(bakedLodSource.packedArray),
	[21, 22, 23, 24, 25, 26, 27, 28],
	"root packedArray must survive round-trip unchanged",
);
assert.equal(bakedLodSource.numSplats, 2);
assert.deepEqual(
	Array.from(bakedLodSource.extra.sh1),
	[31, 32, 33, 34],
	"root extra.sh1 must survive round-trip",
);
assert.ok(
	bakedLodSource.lodSplats,
	"lodSplats must be present after round-trip",
);
assert.deepEqual(
	Array.from(bakedLodSource.lodSplats.packedArray),
	[41, 42, 43, 44],
	"lodSplats.packedArray must survive round-trip",
);
assert.equal(bakedLodSource.lodSplats.numSplats, 1);
assert.deepEqual(
	Array.from(bakedLodSource.lodSplats.extra.lodTree),
	[51, 52],
	"lodSplats.extra.lodTree must survive round-trip",
);
assert.deepEqual(
	Array.from(bakedLodSource.lodSplats.extra.sh1),
	[61, 62],
	"lodSplats.extra.sh1 must survive round-trip",
);
assert.equal(
	bakedLodSource.lodSplats.splatEncoding.rgbMin,
	0.1,
	"lodSplats splatEncoding must survive round-trip",
);
assert.equal(bakedLodSource.lodSplats.splatEncoding.rgbMax, 0.9);
assert.equal(
	bakedLodSource.lodSplats.bakedAt,
	"2026-04-23T12:00:00.000Z",
	"bakedAt audit metadata must survive round-trip",
);
assert.equal(
	bakedLodSource.lodSplats.bakedQuality,
	"quality",
	"bakedQuality audit metadata must survive round-trip",
);

const viewportLodLeakArchive = await buildCameraFramesProjectArchive({
	...projectSnapshot,
	viewportLod: { userScale: 0.72, effectiveScale: 0.72 },
	workspace: {
		...projectSnapshot.workspace,
		viewportLod: { userScale: 0.72, effectiveScale: 0.72 },
	},
});
const viewportLodLeakReader = await ZipReader.from(
	new File([viewportLodLeakArchive], "viewport-lod-leak.ssproj"),
);
const viewportLodLeakDocumentText = await viewportLodLeakReader.text(
	PROJECT_DOCUMENT_PATH,
);
await viewportLodLeakReader.close();
const viewportLodLeakResult = await readCameraFramesProject(
	new File([viewportLodLeakArchive], "viewport-lod-leak.ssproj"),
);

assert.equal(
	viewportLodLeakDocumentText.includes("viewportLod"),
	false,
	"Viewport LoD local preference must not be serialized into project.json.",
);
assert.equal(
	viewportLodLeakDocumentText.includes("camera-frames.viewportLodScale"),
	false,
	"Viewport LoD localStorage key must never be serialized into .ssproj.",
);
assert.equal(
	JSON.stringify(viewportLodLeakResult.project).includes("viewportLod"),
	false,
	"Viewport LoD local preference must not round-trip through .ssproj.",
);

console.log("✅ CAMERA_FRAMES project file tests passed!");
