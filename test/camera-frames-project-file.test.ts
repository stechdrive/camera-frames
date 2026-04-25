import assert from "node:assert/strict";
import {
	buildImportProgressDetail,
	buildImportProgressOverlay,
} from "../src/controllers/project/overlays.js";
import { ZipReader, buildZipArchiveBytes } from "../src/project-archive.js";
import {
	PROJECT_DOCUMENT_PATH,
	PROJECT_MANIFEST_PATH,
	materializeProjectFilePackedSplatFullData,
} from "../src/project/document.js";
import {
	buildCameraFramesProjectArchive,
	createProjectFileEmbeddedFileSource,
	createProjectFilePackedSplatSource,
	isProjectFileEmbeddedFileSource,
	isProjectFileLazyResourceSource,
	isProjectFilePackedSplatSource,
	openCameraFramesProjectPackage,
	readCameraFramesProject,
	writeCameraFramesProjectPackageToWritable,
} from "../src/project/file/index.js";
import {
	createDefaultReferenceImageDocument,
	createReferenceImageAsset,
	createReferenceImageItem,
} from "../src/reference-image-model.js";

function createCollectingWritable() {
	const chunks = [];
	return {
		chunks,
		writable: {
			writable: new WritableStream({
				write(chunk) {
					chunks.push(chunk);
				},
			}),
		},
	};
}

class VolatileArchiveBlob extends Blob {
	constructor(parts, state, options) {
		super(parts, options);
		this.state = state;
	}

	slice(start, end, contentType) {
		return new VolatileArchiveSliceBlob(
			super.slice(start, end, contentType),
			this.state,
		);
	}
}

class VolatileArchiveSliceBlob extends Blob {
	constructor(blob, state) {
		super([blob], { type: blob.type });
		this.state = state;
	}

	async arrayBuffer() {
		if (this.state?.failReads) {
			throw new DOMException(
				"A requested file or directory could not be found at the time an operation was processed.",
				"NotFoundError",
			);
		}
		return await super.arrayBuffer();
	}

	slice(start, end, contentType) {
		return new VolatileArchiveSliceBlob(
			super.slice(start, end, contentType),
			this.state,
		);
	}
}

async function collectWritableChunks(chunks) {
	const parts = [];
	let totalLength = 0;
	for (const chunk of chunks) {
		let bytes = null;
		if (chunk instanceof Blob) {
			bytes = new Uint8Array(await chunk.arrayBuffer());
		} else if (chunk instanceof ArrayBuffer) {
			bytes = new Uint8Array(chunk);
		} else if (ArrayBuffer.isView(chunk)) {
			bytes = new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength);
		} else if (typeof chunk === "string") {
			bytes = new TextEncoder().encode(chunk);
		} else {
			throw new Error(`Unsupported writable chunk type: ${typeof chunk}`);
		}
		parts.push(bytes);
		totalLength += bytes.byteLength;
	}
	const result = new Uint8Array(totalLength);
	let offset = 0;
	for (const part of parts) {
		result.set(part, offset);
		offset += part.byteLength;
	}
	return result;
}

{
	const storedPayload = new Uint8Array([1, 2, 3, 4, 5]);
	const deflatedPayload = new TextEncoder().encode('{"kind":"deflated-entry"}');
	const fastPathArchive = await buildZipArchiveBytes(
		{
			"stored.bin": storedPayload,
			"deflated.json": deflatedPayload,
		},
		{
			level: 6,
			entryLevels: {
				"stored.bin": 0,
				"deflated.json": 6,
			},
		},
	);
	const fastPathBlob = new Blob([fastPathArchive]);
	const fastPathReader = await ZipReader.from(
		new File([fastPathBlob], "stored-fast-path.ssproj"),
	);

	const storedEntry = fastPathReader.entries.get("stored.bin");
	assert.equal(storedEntry?.compressionMethod, 0);
	const storedHeader = new Uint8Array(
		await fastPathBlob
			.slice(storedEntry.offset, storedEntry.offset + 30)
			.arrayBuffer(),
	);
	assert.ok(
		new DataView(storedHeader.buffer).getUint16(28, true) > 0,
		"stored-entry fast path test must exercise local extra-field offset handling",
	);
	let storedGetDataCalls = 0;
	const originalStoredGetData = storedEntry.getData;
	storedEntry.getData = async (...args) => {
		storedGetDataCalls += 1;
		return await originalStoredGetData(...args);
	};

	const storedBytes = await fastPathReader.bytes("stored.bin");
	assert.deepEqual(Array.from(storedBytes), Array.from(storedPayload));
	const storedBlob = await fastPathReader.blob("stored.bin");
	assert.deepEqual(
		Array.from(new Uint8Array(await storedBlob.arrayBuffer())),
		Array.from(storedPayload),
	);
	assert.equal(
		storedGetDataCalls,
		0,
		"stored entries should be sliced from the package blob without zip.js getData()",
	);

	const deflatedEntry = fastPathReader.entries.get("deflated.json");
	assert.equal(deflatedEntry?.compressionMethod, 8);
	let deflatedGetDataCalls = 0;
	const originalDeflatedGetData = deflatedEntry.getData;
	deflatedEntry.getData = async (...args) => {
		deflatedGetDataCalls += 1;
		return await originalDeflatedGetData(...args);
	};
	const deflatedBytes = await fastPathReader.bytes("deflated.json");
	assert.deepEqual(Array.from(deflatedBytes), Array.from(deflatedPayload));
	assert.equal(
		deflatedGetDataCalls,
		1,
		"deflated entries must keep using zip.js getData()",
	);
	await fastPathReader.close();
}

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

const lazyProjectReadProgress = [];
const lazyResult = await openCameraFramesProjectPackage(
	new File([archive], "scene-lazy.ssproj"),
	{
		onProgress: (progress) => {
			lazyProjectReadProgress.push(progress);
		},
	},
);
try {
	assert.equal(lazyResult.assetLoadConcurrency, 1);
	assert.equal(lazyResult.assetEntries.length, 2);
	assert.equal(
		isProjectFileLazyResourceSource(lazyResult.assetEntries[0].source),
		true,
	);
	assert.equal(
		isProjectFileLazyResourceSource(lazyResult.assetEntries[1].source),
		true,
	);
	assert.equal(
		lazyProjectReadProgress.some((progress) =>
			String(progress.stage).startsWith("extract-project-asset"),
		),
		false,
		"lazy package open must not extract scene asset resources during the package expand phase",
	);
	assert.equal(
		lazyProjectReadProgress.some(
			(progress) => progress.stage === "extract-reference-image",
		),
		false,
		"lazy package open must not extract reference image files before project state apply",
	);
	assert.equal(lazyProjectReadProgress.at(-1)?.stage, "expand-complete");
	assert.equal(
		lazyResult.project.scene.referenceImages.assets[0].source.resourceId,
		"reference-image-resource-1",
		"reference image sources remain package resource refs until materialized for state apply",
	);

	const lazyModelSource = await lazyResult.assetEntries[0].source.materialize();
	assert.equal(isProjectFileEmbeddedFileSource(lazyModelSource), true);
	assert.equal(lazyModelSource.file.name, "layout.glb");
	assert.equal(
		await lazyResult.assetEntries[0].source.materialize(),
		lazyModelSource,
		"lazy scene asset sources should cache materialized resources",
	);

	const lazyPackedSource =
		await lazyResult.assetEntries[1].source.materialize();
	assert.equal(isProjectFilePackedSplatSource(lazyPackedSource), true);
	assert.deepEqual(Object.keys(lazyPackedSource.extraFiles), ["means.bin"]);

	await lazyResult.materializeReferenceImages();
	assert.equal(
		lazyResult.project.scene.referenceImages.assets[0].source.file.name,
		"rough.png",
	);
} finally {
	await lazyResult.close();
}

const compressedEntryReader = await ZipReader.from(
	new File([archive], "compression-levels.ssproj"),
);
const compressedEntryProject = JSON.parse(
	await compressedEntryReader.text(PROJECT_DOCUMENT_PATH),
);
const modelResource = compressedEntryProject.resources["resource-1"];
const packedResource = compressedEntryProject.resources["resource-2"];
const referenceResource =
	compressedEntryProject.resources["reference-image-resource-1"];
assert.equal(
	compressedEntryReader.entries.get(modelResource.path)?.compressionMethod,
	0,
	"GLB resources should be stored without deflate in .ssproj archives",
);
assert.equal(
	compressedEntryReader.entries.get(packedResource.manifest.path)
		?.compressionMethod,
	8,
	"packed-splat JSON manifests should remain deflated",
);
assert.equal(
	compressedEntryReader.entries.get(packedResource.extraFiles[0].path)
		?.compressionMethod,
	0,
	"packed-splat companion binaries should be stored without deflate",
);
assert.equal(
	compressedEntryReader.entries.get(referenceResource.path)?.compressionMethod,
	0,
	"image resources should be stored without deflate",
);
assert.equal(
	compressedEntryReader.entries.get(PROJECT_MANIFEST_PATH)?.compressionMethod,
	8,
	"manifest.json should remain deflated",
);
assert.equal(
	compressedEntryReader.entries.get(PROJECT_DOCUMENT_PATH)?.compressionMethod,
	8,
	"project.json should remain deflated",
);
await compressedEntryReader.close();

const duplicateGlbProjectSnapshot = {
	workspace: projectSnapshot.workspace,
	shotCameras: projectSnapshot.shotCameras,
	scene: {
		assets: [
			{
				id: "asset-model-a",
				kind: "model",
				label: "Layout A",
				source: createProjectFileEmbeddedFileSource({
					kind: "model",
					file: new File([new Uint8Array([1, 2, 3, 4])], "layout.glb", {
						type: "model/gltf-binary",
					}),
					fileName: "layout.glb",
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
			{
				id: "asset-model-b",
				kind: "model",
				label: "Layout B",
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
		],
		lighting: projectSnapshot.scene.lighting,
		referenceImages: createDefaultReferenceImageDocument(),
	},
};
const duplicateGlbWritable = createCollectingWritable();
await writeCameraFramesProjectPackageToWritable(
	duplicateGlbProjectSnapshot,
	duplicateGlbWritable.writable,
);
const duplicateGlbArchive = await collectWritableChunks(
	duplicateGlbWritable.chunks,
);
const duplicateGlbReader = await ZipReader.from(
	new File([duplicateGlbArchive], "duplicate-glb.ssproj"),
);
const duplicateGlbDocument = JSON.parse(
	await duplicateGlbReader.text(PROJECT_DOCUMENT_PATH),
);
const duplicateGlbPathA = duplicateGlbDocument.resources["resource-1"].path;
const duplicateGlbPathB = duplicateGlbDocument.resources["resource-2"].path;
assert.equal(
	duplicateGlbPathA,
	duplicateGlbPathB,
	"identical GLB resources should share one content-hash path",
);
assert.ok(
	duplicateGlbReader.entries.has(duplicateGlbPathA),
	"streaming package save should write the shared GLB resource once",
);
await duplicateGlbReader.close();
const duplicateGlbResult = await readCameraFramesProject(
	new File([duplicateGlbArchive], "duplicate-glb.ssproj"),
);
assert.equal(
	duplicateGlbResult.assetEntries.length,
	2,
	"multiple placements of the same GLB must survive streaming package save",
);

const duplicateBaked3dgsProjectSnapshot = {
	workspace: projectSnapshot.workspace,
	shotCameras: projectSnapshot.shotCameras,
	scene: {
		assets: [
			{
				id: "asset-splat-a",
				kind: "splat",
				label: "3DGS A",
				source: createProjectFilePackedSplatSource({
					fileName: "scene.rawsplat",
					packedArray: new Uint32Array([1, 2, 3, 4]),
					numSplats: 1,
					extra: {
						sh1: new Uint32Array([5, 6]),
					},
					splatEncoding: {
						rgbMin: 0,
						rgbMax: 1,
					},
					lodSplats: {
						packedArray: new Uint32Array([7, 8, 9, 10]),
						numSplats: 1,
						extra: {
							lodTree: new Uint32Array([11, 12]),
						},
						splatEncoding: {
							rgbMin: 0,
							rgbMax: 1,
						},
						bakedAt: "2026-04-24T00:00:00.000Z",
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
			{
				id: "asset-splat-b",
				kind: "splat",
				label: "3DGS B",
				source: createProjectFilePackedSplatSource({
					fileName: "scene.rawsplat",
					packedArray: new Uint32Array([1, 2, 3, 4]),
					numSplats: 1,
					extra: {
						sh1: new Uint32Array([5, 6]),
					},
					splatEncoding: {
						rgbMin: 0,
						rgbMax: 1,
					},
					lodSplats: {
						packedArray: new Uint32Array([7, 8, 9, 10]),
						numSplats: 1,
						extra: {
							lodTree: new Uint32Array([11, 12]),
						},
						splatEncoding: {
							rgbMin: 0,
							rgbMax: 1,
						},
						bakedAt: "2026-04-24T00:00:00.000Z",
						bakedQuality: "quality",
					},
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
		],
		lighting: projectSnapshot.scene.lighting,
		referenceImages: createDefaultReferenceImageDocument(),
	},
};
const duplicateBaked3dgsWritable = createCollectingWritable();
await writeCameraFramesProjectPackageToWritable(
	duplicateBaked3dgsProjectSnapshot,
	duplicateBaked3dgsWritable.writable,
);
const duplicateBaked3dgsArchive = await collectWritableChunks(
	duplicateBaked3dgsWritable.chunks,
);
const duplicateBaked3dgsReader = await ZipReader.from(
	new File([duplicateBaked3dgsArchive], "duplicate-baked-3dgs.ssproj"),
);
const duplicateBaked3dgsDocument = JSON.parse(
	await duplicateBaked3dgsReader.text(PROJECT_DOCUMENT_PATH),
);
const duplicateBaked3dgsResourceA =
	duplicateBaked3dgsDocument.resources["resource-1"];
const duplicateBaked3dgsResourceB =
	duplicateBaked3dgsDocument.resources["resource-2"];
assert.equal(
	duplicateBaked3dgsResourceA.packedArray.path,
	duplicateBaked3dgsResourceB.packedArray.path,
	"identical 3DGS packed arrays should share one content-hash path",
);
assert.equal(
	duplicateBaked3dgsResourceA.lodSplats.packedArray.path,
	duplicateBaked3dgsResourceB.lodSplats.packedArray.path,
	"identical baked LoD packed arrays should share one content-hash path",
);
assert.ok(
	duplicateBaked3dgsReader.entries.has(
		duplicateBaked3dgsResourceA.packedArray.path,
	),
	"streaming package save should write the shared 3DGS packed array once",
);
assert.ok(
	duplicateBaked3dgsReader.entries.has(
		duplicateBaked3dgsResourceA.lodSplats.packedArray.path,
	),
	"streaming package save should write the shared baked LoD packed array once",
);
await duplicateBaked3dgsReader.close();
const duplicateBaked3dgsResult = await readCameraFramesProject(
	new File([duplicateBaked3dgsArchive], "duplicate-baked-3dgs.ssproj"),
);
assert.equal(
	duplicateBaked3dgsResult.assetEntries.length,
	2,
	"multiple placements of the same baked 3DGS must survive streaming package save",
);
assert.ok(
	duplicateBaked3dgsResult.assetEntries[0].source.lodSplats,
	"baked LoD must survive the duplicate 3DGS round-trip",
);

const duplicateReferenceImageDocument = createDefaultReferenceImageDocument();
const duplicateReferenceAssetA = createReferenceImageAsset({
	id: "ref-duplicate-a",
	label: "Reference A",
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
const duplicateReferenceAssetB = createReferenceImageAsset({
	id: "ref-duplicate-b",
	label: "Reference B",
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
duplicateReferenceImageDocument.assets.push(
	duplicateReferenceAssetA,
	duplicateReferenceAssetB,
);
duplicateReferenceImageDocument.presets[0].items.push(
	createReferenceImageItem({
		id: "ref-duplicate-item-a",
		assetId: duplicateReferenceAssetA.id,
		name: "Reference A",
		group: "front",
		order: 0,
		previewVisible: true,
		exportEnabled: true,
	}),
	createReferenceImageItem({
		id: "ref-duplicate-item-b",
		assetId: duplicateReferenceAssetB.id,
		name: "Reference B",
		group: "front",
		order: 1,
		previewVisible: true,
		exportEnabled: true,
	}),
);
const duplicateReferenceWritable = createCollectingWritable();
await writeCameraFramesProjectPackageToWritable(
	{
		workspace: projectSnapshot.workspace,
		shotCameras: projectSnapshot.shotCameras,
		scene: {
			assets: [],
			lighting: projectSnapshot.scene.lighting,
			referenceImages: duplicateReferenceImageDocument,
		},
	},
	duplicateReferenceWritable.writable,
);
const duplicateReferenceArchive = await collectWritableChunks(
	duplicateReferenceWritable.chunks,
);
const duplicateReferenceReader = await ZipReader.from(
	new File([duplicateReferenceArchive], "duplicate-reference.ssproj"),
);
const duplicateReferenceDocument = JSON.parse(
	await duplicateReferenceReader.text(PROJECT_DOCUMENT_PATH),
);
const duplicateReferencePathA =
	duplicateReferenceDocument.resources["reference-image-resource-1"].path;
const duplicateReferencePathB =
	duplicateReferenceDocument.resources["reference-image-resource-2"].path;
assert.equal(
	duplicateReferencePathA,
	duplicateReferencePathB,
	"identical reference images should share one content-hash path",
);
assert.ok(
	duplicateReferenceReader.entries.has(duplicateReferencePathA),
	"streaming package save should write the shared reference image resource once",
);
await duplicateReferenceReader.close();
const duplicateReferenceResult = await readCameraFramesProject(
	new File([duplicateReferenceArchive], "duplicate-reference.ssproj"),
);
assert.equal(
	duplicateReferenceResult.project.scene.referenceImages.assets.length,
	2,
	"multiple reference image assets with the same file must survive streaming package save",
);
assert.equal(
	duplicateReferenceResult.project.scene.referenceImages.presets[0].items
		.length,
	2,
	"multiple reference image items with the same file must survive streaming package save",
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
{
	const timing = {
		stageStartedAt: 100,
		totalStartedAt: 50,
		stageLabel: "stage",
		totalLabel: "total",
	};
	const overlay = buildImportProgressOverlay(t, "load", "Loading", {
		startedAt: 25,
		detailTiming: timing,
	});
	assert.equal(overlay.startedAt, 25);
	assert.equal(overlay.detailTiming, timing);
	assert.equal(overlay.steps[2].status, "active");
}

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

const rawPackedCompressionReader = await ZipReader.from(
	new File([rawPackedArchive], "raw-packed-compression.ssproj"),
);
const rawPackedCompressionProject = JSON.parse(
	await rawPackedCompressionReader.text(PROJECT_DOCUMENT_PATH),
);
const rawPackedResource = rawPackedCompressionProject.resources["resource-1"];
assert.equal(
	rawPackedCompressionReader.entries.get(rawPackedResource.packedArray.path)
		?.compressionMethod,
	0,
	"raw-packed-splat packedArray entries should be stored without deflate",
);
assert.equal(
	rawPackedCompressionReader.entries.get(rawPackedResource.extraArrays[0].path)
		?.compressionMethod,
	0,
	"raw-packed-splat extra array entries should be stored without deflate",
);
await rawPackedCompressionReader.close();

const embeddedPlyArchive = await buildCameraFramesProjectArchive({
	workspace: projectSnapshot.workspace,
	shotCameras: projectSnapshot.shotCameras,
	scene: {
		assets: [
			{
				id: "asset-ply",
				kind: "splat",
				label: "Raw PLY",
				source: createProjectFileEmbeddedFileSource({
					kind: "splat",
					file: new File(
						[
							new TextEncoder().encode(
								"ply\nformat ascii 1.0\nelement vertex 0\nend_header\n",
							),
						],
						"cloud.ply",
						{ type: "application/octet-stream" },
					),
					fileName: "cloud.ply",
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
});
const embeddedPlyCompressionReader = await ZipReader.from(
	new File([embeddedPlyArchive], "embedded-ply-compression.ssproj"),
);
const embeddedPlyCompressionProject = JSON.parse(
	await embeddedPlyCompressionReader.text(PROJECT_DOCUMENT_PATH),
);
const embeddedPlyResource =
	embeddedPlyCompressionProject.resources["resource-1"];
assert.equal(
	embeddedPlyCompressionReader.entries.get(embeddedPlyResource.path)
		?.compressionMethod,
	8,
	"embedded raw PLY resources should keep deflate compression for the 2GB package-size guard",
);
await embeddedPlyCompressionReader.close();

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

const lazyBakedLodResult = await openCameraFramesProjectPackage(
	new File([bakedLodArchive], "baked-lod-lazy.ssproj"),
);
let lazyBakedLodSource = null;
try {
	lazyBakedLodSource =
		await lazyBakedLodResult.assetEntries[0].source.materialize();
	assert.equal(
		isProjectFilePackedSplatSource(lazyBakedLodSource),
		true,
		"lazy package open must still expose a packed-splat source",
	);
	assert.deepEqual(
		Array.from(lazyBakedLodSource.packedArray),
		[21, 22, 23, 24, 25, 26, 27, 28],
		"lazy materialize must load root FullData for the runtime packed splats",
	);
	assert.equal(
		lazyBakedLodSource.previewPackedSplats,
		null,
		"baked LoD must not be exposed as a standalone preview source",
	);
	assert.deepEqual(
		Array.from(lazyBakedLodSource.lodSplats.extra.lodTree),
		[51, 52],
		"lazy materialize must keep the baked lodTree attached to FullData for Spark LoD rendering",
	);
} finally {
	await lazyBakedLodResult.close();
}

const ensuredBakedLodSource =
	await materializeProjectFilePackedSplatFullData(lazyBakedLodSource);
assert.deepEqual(
	Array.from(ensuredBakedLodSource.packedArray),
	[21, 22, 23, 24, 25, 26, 27, 28],
	"FullData materialization must keep the exact root packedArray after the package reader is closed",
);
assert.deepEqual(
	Array.from(ensuredBakedLodSource.extra.sh1),
	[31, 32, 33, 34],
	"FullData materialization must keep root companion arrays",
);
assert.equal(
	ensuredBakedLodSource.previewPackedSplats,
	null,
	"deferred preview state must be cleared once FullData has been materialized",
);
await materializeProjectFilePackedSplatFullData(ensuredBakedLodSource);
assert.deepEqual(
	Array.from(ensuredBakedLodSource.packedArray),
	[21, 22, 23, 24, 25, 26, 27, 28],
	"FullData materialization must be safe to call repeatedly",
);

let manualDeferredFullDataLoads = 0;
const manualDeferredSource = createProjectFilePackedSplatSource({
	fileName: "manual-deferred.rawsplat",
	packedArray: new Uint32Array(),
	numSplats: 2,
	lodSplats: bakedLodSource.lodSplats,
	previewPackedSplats: bakedLodSource.lodSplats,
	deferredFullData: {
		async loadFullData() {
			manualDeferredFullDataLoads += 1;
			return {
				packedArray: new Uint32Array([91, 92, 93, 94]),
				numSplats: 1,
				extra: {},
				splatEncoding: null,
				lodSplats: bakedLodSource.lodSplats,
			};
		},
	},
	skipClone: true,
});
await materializeProjectFilePackedSplatFullData(manualDeferredSource);
await materializeProjectFilePackedSplatFullData(manualDeferredSource);
assert.equal(
	manualDeferredFullDataLoads,
	1,
	"deferred FullData ensure must not invoke the loader again after a successful materialization",
);

const radBundleProjectSnapshot = {
	workspace: projectSnapshot.workspace,
	shotCameras: projectSnapshot.shotCameras,
	scene: {
		assets: [
			{
				...bakedLodProjectSnapshot.scene.assets[0],
				id: "asset-rad-bundle",
				label: "RAD Bundle Splat",
				source: createProjectFilePackedSplatSource({
					fileName: "rad-bundle.rawsplat",
					packedArray: new Uint32Array([101, 102, 103, 104]),
					numSplats: 1,
					extra: {
						sh1: new Uint32Array([105, 106]),
					},
					splatEncoding: {
						rgbMin: 0,
						rgbMax: 1,
					},
					radBundle: {
						kind: "spark-rad-bundle",
						version: 1,
						root: {
							name: "rad-bundle-lod-0.rad",
							bytes: new Uint8Array([0x52, 0x41, 0x44, 0x30, 1, 2]),
						},
						chunks: [
							{
								name: "rad-bundle-lod-1.radc",
								bytes: new Uint8Array([0x52, 0x41, 0x44, 0x43, 3, 4]),
							},
						],
						sourceFingerprint: {
							numSplats: 1,
							packedArraySha256:
								"5427c4a0393a3ec58718aa557f372b4c04862133ed419340c7f68daf464d2c12",
							extraArraysSha256: {
								sh1: "223c9173c6d8fedf244b70bbb6a074dbc93ccebb4914deff21a7058773f1866c",
							},
						},
						bounds: {
							local: {
								min: { x: -1, y: -2, z: -3 },
								max: { x: 1, y: 2, z: 3 },
							},
							center: {
								min: { x: -0.5, y: -0.5, z: -0.5 },
								max: { x: 0.5, y: 0.5, z: 0.5 },
							},
						},
						sparkVersion: "2.0.0",
						build: {
							mode: "quality",
							chunked: true,
						},
					},
					skipClone: true,
				}),
			},
		],
		lighting: projectSnapshot.scene.lighting,
		referenceImages: createDefaultReferenceImageDocument(),
	},
};

const radBundleArchive = await buildCameraFramesProjectArchive(
	radBundleProjectSnapshot,
);
const radBundleReader = await ZipReader.from(
	new File([radBundleArchive], "rad-bundle.ssproj"),
);
const radBundleProjectJson = JSON.parse(
	await radBundleReader.text(PROJECT_DOCUMENT_PATH),
);
const radBundleResource = radBundleProjectJson.resources["resource-1"];
assert.equal(radBundleResource.radBundle.kind, "spark-rad-bundle");
assert.equal(radBundleResource.radBundle.root.name, "rad-bundle-lod-0.rad");
assert.equal(
	radBundleResource.radBundle.chunks[0].name,
	"rad-bundle-lod-1.radc",
);
assert.equal(
	radBundleReader.entries.get(radBundleResource.radBundle.root.path)
		?.compressionMethod,
	0,
	"RAD root entries must be stored so Range requests can slice the package blob",
);
assert.equal(
	radBundleReader.entries.get(radBundleResource.radBundle.chunks[0].path)
		?.compressionMethod,
	0,
	"RAD chunk entries must be stored so Range requests can slice the package blob",
);
await radBundleReader.close();

const radBundleResult = await readCameraFramesProject(
	new File([radBundleArchive], "rad-bundle-read.ssproj"),
);
const radBundleSource = radBundleResult.assetEntries[0].source;
assert.equal(
	isProjectFilePackedSplatSource(radBundleSource),
	true,
	"RAD-backed raw-packed splat must restore as packed-splat source",
);
assert.equal(
	radBundleSource.packedArray.length,
	0,
	"RAD-backed open should not materialize root FullData before the FullData gate",
);
assert.ok(radBundleSource.radBundle?.root?.blob instanceof Blob);
assert.equal(radBundleSource.radBundle.chunks.length, 1);
assert.deepEqual(
	radBundleSource.radBundle.bounds.local.min,
	{ x: -1, y: -2, z: -3 },
	"RAD bounds metadata must survive package round-trip",
);
const radBundleFullSource =
	await materializeProjectFilePackedSplatFullData(radBundleSource);
assert.deepEqual(
	Array.from(radBundleFullSource.packedArray),
	[101, 102, 103, 104],
	"RAD-backed FullData materialization must work after the package reader has closed",
);
assert.equal(
	radBundleFullSource.radBundle,
	null,
	"FullData materialization clears the streaming cache so edits do not reuse stale RAD",
);

const volatileArchiveState = { failReads: false };
const volatileArchive = new VolatileArchiveBlob(
	[radBundleArchive],
	volatileArchiveState,
);
let refreshedArchiveReads = 0;
const volatileParsedProject = await openCameraFramesProjectPackage(
	volatileArchive,
	{
		refreshSource: async () => {
			refreshedArchiveReads += 1;
			return new Blob([radBundleArchive]);
		},
	},
);
const volatileLazySource = volatileParsedProject.assetEntries[0].source;
assert.equal(isProjectFileLazyResourceSource(volatileLazySource), true);
const volatileRadSource = await volatileLazySource.materialize();
assert.equal(volatileRadSource.packedArray.length, 0);
await volatileParsedProject.close();
volatileArchiveState.failReads = true;
const volatileFullSource =
	await materializeProjectFilePackedSplatFullData(volatileRadSource);
assert.deepEqual(
	Array.from(volatileFullSource.packedArray),
	[101, 102, 103, 104],
	"RAD-backed deferred FullData should reopen the project file when a stale file-backed Blob fails",
);
assert.equal(refreshedArchiveReads > 0, true);

const radBundleMismatchProjectSnapshot = structuredClone(
	radBundleProjectSnapshot,
);
radBundleMismatchProjectSnapshot.scene.assets[0].source.radBundle.sourceFingerprint.packedArraySha256 =
	"mismatched-packed-array";
const radBundleMismatchArchive = await buildCameraFramesProjectArchive(
	radBundleMismatchProjectSnapshot,
);
const radBundleMismatchResult = await readCameraFramesProject(
	new File([radBundleMismatchArchive], "rad-bundle-mismatch.ssproj"),
);
const radBundleMismatchSource = radBundleMismatchResult.assetEntries[0].source;
assert.deepEqual(
	Array.from(radBundleMismatchSource.packedArray),
	[101, 102, 103, 104],
	"RAD sourceFingerprint mismatch must fall back to eager FullData instead of streaming",
);
assert.equal(radBundleMismatchSource.radBundle, null);

const deferredSaveLazyResult = await openCameraFramesProjectPackage(
	new File([bakedLodArchive], "baked-lod-deferred-save.ssproj"),
);
let deferredSaveSource = null;
try {
	deferredSaveSource =
		await deferredSaveLazyResult.assetEntries[0].source.materialize();
} finally {
	await deferredSaveLazyResult.close();
}
const deferredSaveWritable = createCollectingWritable();
await writeCameraFramesProjectPackageToWritable(
	{
		workspace: projectSnapshot.workspace,
		shotCameras: projectSnapshot.shotCameras,
		scene: {
			assets: [
				{
					...bakedLodProjectSnapshot.scene.assets[0],
					source: deferredSaveSource,
				},
			],
			lighting: projectSnapshot.scene.lighting,
			referenceImages: createDefaultReferenceImageDocument(),
		},
	},
	deferredSaveWritable.writable,
);
const deferredSaveArchive = await collectWritableChunks(
	deferredSaveWritable.chunks,
);
const deferredSaveResult = await readCameraFramesProject(
	new File([deferredSaveArchive], "baked-lod-deferred-save-roundtrip.ssproj"),
);
const deferredSaveRoundTripSource = deferredSaveResult.assetEntries[0].source;
assert.deepEqual(
	Array.from(deferredSaveRoundTripSource.packedArray),
	[21, 22, 23, 24, 25, 26, 27, 28],
	"package save must write root FullData from a lazy materialized source",
);
assert.deepEqual(
	Array.from(deferredSaveRoundTripSource.lodSplats.packedArray),
	[41, 42, 43, 44],
	"package save must preserve the baked LoD bundle attached to FullData",
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
