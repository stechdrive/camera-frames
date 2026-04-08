import { SPLAT_EXTENSIONS } from "./constants.js";
import { compressEmbeddedSplatSourceAsSogInWorker } from "./engine/sog-compress-worker-client.js";
import { readSerializedSogColumnsFromInput } from "./engine/sog-data-table.js";
import {
	buildZipArchiveBytes,
	createArchiveWritableStream,
} from "./project-archive.js";
import {
	PROJECT_DOCUMENT_PATH,
	PROJECT_FORMAT,
	PROJECT_MANIFEST_PATH,
	PROJECT_RESOURCE_RAW_PACKED_SPLAT,
	PROJECT_VERSION,
	buildProjectFingerprint,
	buildProjectManifest,
	buildProjectResourcePath,
	createProjectAssetResourceRef,
	createProjectFileEmbeddedFileSource,
	createProjectFilePackedSplatSource,
	getDefaultProjectFilename,
	getProjectMediaTypeFromFileName,
	isProjectFileEmbeddedFileSource,
	isProjectFilePackedSplatSource,
	normalizeProjectDocument,
	normalizeProjectFileName,
	sha256Hex,
	toUint8Array,
	toUint32Array,
} from "./project-document.js";
import { ZipReader } from "./project-package.js";
import {
	REFERENCE_IMAGE_ASSET_KIND,
	normalizeReferenceImageDocument,
} from "./reference-image-model.js";

const DEFAULT_SOG_ITERATIONS = 10;
const DEFAULT_SOG_MAX_SH_BANDS = 2;
const SOG_SERIALIZABLE_EXTENSIONS = new Set(["ply", "spz"]);
const PROJECT_ZIP_LEVEL = 6;
const textEncoder = new TextEncoder();

function getPackageSaveOptionValue(value, fallback) {
	return Number.isFinite(value) ? value : fallback;
}

async function notifyPackageProgress(onProgress, payload) {
	if (typeof onProgress !== "function") {
		return;
	}
	await onProgress(payload);
}

async function notifyProjectReadProgress(onProgress, payload) {
	if (typeof onProgress !== "function") {
		return;
	}
	await onProgress(payload);
}

function reportSplatTransformProgress(onProgress, progress, text, percent = 0) {
	if (!progress) {
		return;
	}
	void notifyPackageProgress(onProgress, {
		...progress,
		stage: "worker-progress",
		message: text,
		percent,
	});
}

function reportExplicitSplatStage(onProgress, progress, text, percent = 0) {
	reportSplatTransformProgress(onProgress, progress, text, percent);
}

function canCompressEmbeddedSplatSourceAsSog(source) {
	if (!isProjectFileEmbeddedFileSource(source)) {
		return false;
	}

	const sourceExtension = normalizeProjectFileName(source.fileName, "")
		.split(".")
		.pop()
		?.toLowerCase();
	return Boolean(
		sourceExtension &&
			SPLAT_EXTENSIONS.has(sourceExtension) &&
			SOG_SERIALIZABLE_EXTENSIONS.has(sourceExtension),
	);
}

function getProjectSourceFileLabel(source) {
	if (isProjectFileEmbeddedFileSource(source)) {
		return (
			normalizeProjectFileName(source.fileName ?? source.file?.name, "") ||
			"asset.bin"
		);
	}
	if (isProjectFilePackedSplatSource(source)) {
		return normalizeProjectFileName(source.fileName, "") || "meta.json";
	}
	return "asset";
}

function getReferenceImageSourceFileLabel(asset) {
	return (
		normalizeProjectFileName(
			asset?.sourceMeta?.filename ??
				asset?.source?.fileName ??
				asset?.source?.file?.name,
			"",
		) || "reference.png"
	);
}

function getProjectResourceFileLabel(resource) {
	if (resource?.type === "file") {
		return (
			normalizeProjectFileName(resource.originalName ?? resource.path, "") ||
			"asset.bin"
		);
	}
	if (resource?.type === "packed-splat") {
		return (
			normalizeProjectFileName(
				resource.originalName ?? resource.manifest?.path,
				"",
			) || "meta.json"
		);
	}
	if (resource?.type === PROJECT_RESOURCE_RAW_PACKED_SPLAT) {
		return (
			normalizeProjectFileName(resource.originalName, "") || "derived.rawsplat"
		);
	}
	return "asset";
}

function cloneFileResource(resource, assetKind) {
	return {
		type: "file",
		assetKind,
		path: resource.path,
		sha256: resource.sha256,
		mediaType: resource.mediaType,
		originalName: resource.originalName,
		size: Number(resource.size ?? 0),
	};
}

function clonePackedSplatResource(resource) {
	return {
		type: "packed-splat",
		assetKind: "splat",
		fileType: resource.fileType ?? null,
		originalName: resource.originalName,
		manifest: {
			path: resource.manifest?.path,
			sha256: resource.manifest?.sha256,
			size: Number(resource.manifest?.size ?? 0),
		},
		extraFiles: (resource.extraFiles ?? []).map((extraFile) => ({
			name: extraFile.name,
			path: extraFile.path,
			sha256: extraFile.sha256,
			size: Number(extraFile.size ?? 0),
		})),
	};
}

function cloneRawPackedSplatResource(resource) {
	return {
		type: PROJECT_RESOURCE_RAW_PACKED_SPLAT,
		assetKind: "splat",
		originalName: resource.originalName,
		numSplats: Number(resource.numSplats ?? 0),
		splatEncoding:
			resource.splatEncoding && typeof resource.splatEncoding === "object"
				? JSON.parse(JSON.stringify(resource.splatEncoding))
				: null,
		packedArray: {
			path: resource.packedArray?.path,
			sha256: resource.packedArray?.sha256,
			size: Number(resource.packedArray?.size ?? 0),
		},
		extraArrays: (resource.extraArrays ?? []).map((entry) => ({
			name: entry.name,
			path: entry.path,
			sha256: entry.sha256,
			size: Number(entry.size ?? 0),
		})),
		radMeta:
			resource.radMeta && typeof resource.radMeta === "object"
				? JSON.parse(JSON.stringify(resource.radMeta))
				: null,
	};
}

async function serializeEmbeddedProjectSource(
	source,
	assetKind,
	index,
	{ onProgress = null, progress = null } = {},
) {
	if (progress) {
		await notifyPackageProgress(onProgress, {
			...progress,
			stage: "copy-source",
		});
	}
	const file = source.file;
	const fileName = normalizeProjectFileName(
		source.fileName ?? file?.name,
		`${assetKind}-${index + 1}.bin`,
	);
	const bytes = new Uint8Array(await file.arrayBuffer());
	const hash = await sha256Hex(bytes);
	const resource = cloneFileResource(
		{
			type: "file",
			assetKind,
			path: buildProjectResourcePath(hash, fileName),
			sha256: hash,
			mediaType: file.type || getProjectMediaTypeFromFileName(fileName),
			originalName: fileName,
			size: bytes.byteLength,
		},
		assetKind,
	);

	source.resource = resource;
	return {
		resource,
		archiveEntries: {
			[resource.path]: bytes,
		},
		archiveEntryLabels: {
			[resource.path]: resource.originalName,
		},
	};
}

async function serializeEmbeddedSplatProjectSourceAsSog(
	source,
	assetKind,
	index,
	{
		sogMaxShBands = DEFAULT_SOG_MAX_SH_BANDS,
		sogIterations = DEFAULT_SOG_ITERATIONS,
		onProgress = null,
		progress = null,
	} = {},
) {
	const file = source.file;
	const originalFileName = normalizeProjectFileName(
		source.fileName ?? file?.name,
		`${assetKind}-${index + 1}.bin`,
	);
	const baseName = originalFileName.replace(/\.[^./\\]+$/, "");
	const outputFileName = `${baseName || `splat-${index + 1}`}.sog`;
	if (progress) {
		await notifyPackageProgress(onProgress, {
			...progress,
			stage: "read-input",
		});
	}
	const inputBytes = new Uint8Array(await file.arrayBuffer());
	const readSerializedColumns = async () =>
		await readSerializedSogColumnsFromInput(
			{
				inputBytes,
				inputFileName: originalFileName,
				sogMaxShBands: getPackageSaveOptionValue(
					sogMaxShBands,
					DEFAULT_SOG_MAX_SH_BANDS,
				),
			},
			{
				onStage: (stage) => {
					switch (stage) {
						case "parse-header":
							reportExplicitSplatStage(
								onProgress,
								progress,
								"Inspecting splat source…",
								0,
							);
							break;
						case "parse-ply":
							reportExplicitSplatStage(
								onProgress,
								progress,
								"Extracting PLY columns…",
								0,
							);
							break;
						case "parse-spz":
							reportExplicitSplatStage(
								onProgress,
								progress,
								"Extracting SPZ columns…",
								0,
							);
							break;
						default:
							break;
					}
				},
			},
		);
	const serializedColumns = await readSerializedColumns();
	if (progress) {
		await notifyPackageProgress(onProgress, {
			...progress,
			stage: "start-worker",
		});
	}
	let outputBytes = null;
	try {
		outputBytes = await compressEmbeddedSplatSourceAsSogInWorker({
			serializedColumns,
			outputFileName,
			sogIterations: getPackageSaveOptionValue(
				sogIterations,
				DEFAULT_SOG_ITERATIONS,
			),
			onProgress: ({ text, progress: percent }) => {
				reportSplatTransformProgress(onProgress, progress, text, percent);
			},
		});
	} catch (error) {
		const workerError = String(error?.message ?? error ?? "unknown").trim();
		throw new Error(
			[
				`SOG worker compression failed for "${originalFileName}".`,
				`Worker error: ${workerError}`,
				"Retry package save with SOG compression disabled if you need an immediate save.",
			].join("\n"),
		);
	}
	if (!outputBytes) {
		throw new Error(`Failed to compress "${originalFileName}" as SOG.`);
	}

	if (progress) {
		await notifyPackageProgress(onProgress, {
			...progress,
			stage: "finalize",
		});
	}
	const hash = await sha256Hex(outputBytes);
	const resource = cloneFileResource(
		{
			type: "file",
			assetKind,
			path: buildProjectResourcePath(hash, outputFileName),
			sha256: hash,
			mediaType: "application/x-gaussian-splat",
			originalName: outputFileName,
			size: outputBytes.byteLength,
		},
		assetKind,
	);
	source.resource = resource;
	return {
		resource,
		archiveEntries: {
			[resource.path]: outputBytes,
		},
		archiveEntryLabels: {
			[resource.path]: resource.originalName,
		},
	};
}

async function serializePackedSplatProjectSource(
	source,
	{ onProgress = null, progress = null } = {},
) {
	if (progress) {
		await notifyPackageProgress(onProgress, {
			...progress,
			stage: "copy-packed-splat",
		});
	}
	const manifestBytes = toUint8Array(source.inputBytes);
	const manifestHash = await sha256Hex(manifestBytes);
	const manifestResource = {
		path: buildProjectResourcePath(manifestHash, source.fileName),
		sha256: manifestHash,
		size: manifestBytes.byteLength,
	};
	const archiveEntries = {
		[manifestResource.path]: manifestBytes,
	};
	const archiveEntryLabels = {
		[manifestResource.path]: source.fileName,
	};
	const extraFiles = [];

	for (const [name, value] of Object.entries(source.extraFiles ?? {})) {
		const bytes = toUint8Array(value);
		const hash = await sha256Hex(bytes);
		const path = buildProjectResourcePath(hash, name);
		archiveEntries[path] = bytes;
		archiveEntryLabels[path] = name;
		extraFiles.push({
			name,
			path,
			sha256: hash,
			size: bytes.byteLength,
		});
	}

	const resource = clonePackedSplatResource({
		type: "packed-splat",
		assetKind: "splat",
		fileType: source.fileType ?? null,
		originalName: source.fileName,
		manifest: manifestResource,
		extraFiles,
	});

	source.resource = resource;
	return {
		resource,
		archiveEntries,
		archiveEntryLabels,
	};
}

function createBinaryEntryBytes(value) {
	if (value instanceof Uint32Array) {
		return new Uint8Array(
			value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength),
		);
	}
	return toUint8Array(value);
}

async function serializeRawPackedSplatProjectSource(
	source,
	{ onProgress = null, progress = null } = {},
) {
	if (progress) {
		await notifyPackageProgress(onProgress, {
			...progress,
			stage: "copy-packed-splat",
		});
	}
	const originalName = normalizeProjectFileName(
		source.fileName,
		"derived.rawsplat",
	);
	const packedArrayBytes = createBinaryEntryBytes(source.packedArray);
	const packedArrayHash = await sha256Hex(packedArrayBytes);
	const packedArrayResource = {
		path: buildProjectResourcePath(
			packedArrayHash,
			`${originalName}.packed.u32`,
		),
		sha256: packedArrayHash,
		size: packedArrayBytes.byteLength,
	};
	const archiveEntries = {
		[packedArrayResource.path]: packedArrayBytes,
	};
	const archiveEntryLabels = {
		[packedArrayResource.path]: `${originalName} packedArray`,
	};
	const extraArrays = [];
	for (const [name, value] of Object.entries(source.extra ?? {})) {
		if (name === "radMeta") {
			continue;
		}
		const bytes = createBinaryEntryBytes(value);
		if (bytes.byteLength === 0) {
			continue;
		}
		const hash = await sha256Hex(bytes);
		const path = buildProjectResourcePath(hash, `${originalName}.${name}.u32`);
		archiveEntries[path] = bytes;
		archiveEntryLabels[path] = `${originalName} ${name}`;
		extraArrays.push({
			name,
			path,
			sha256: hash,
			size: bytes.byteLength,
		});
	}
	const resource = cloneRawPackedSplatResource({
		type: PROJECT_RESOURCE_RAW_PACKED_SPLAT,
		assetKind: "splat",
		originalName,
		numSplats: source.numSplats ?? 0,
		splatEncoding: source.splatEncoding ?? null,
		packedArray: packedArrayResource,
		extraArrays,
		radMeta: source.extra?.radMeta ?? null,
	});
	source.resource = resource;
	return {
		resource,
		archiveEntries,
		archiveEntryLabels,
	};
}

export {
	createProjectFileEmbeddedFileSource,
	createProjectFilePackedSplatSource,
	getDefaultProjectFilename,
	isProjectFileEmbeddedFileSource,
	isProjectFilePackedSplatSource,
};

export async function buildCameraFramesProjectPackage(
	projectSnapshot,
	{
		compressSplatsToSog = false,
		sogMaxShBands = DEFAULT_SOG_MAX_SH_BANDS,
		sogIterations = DEFAULT_SOG_ITERATIONS,
		onProgress = null,
	} = {},
) {
	const packageContents = await serializeCameraFramesProjectPackageContents(
		projectSnapshot,
		{
			compressSplatsToSog,
			sogMaxShBands,
			sogIterations,
			onProgress,
		},
	);
	const archive = await buildZipArchiveBytes(packageContents.archiveEntries, {
		level: PROJECT_ZIP_LEVEL,
	});
	return {
		archive,
		manifest: buildProjectManifest(),
		serializedProject: packageContents.serializedProject,
		packageFingerprint: packageContents.packageFingerprint,
	};
}

async function serializeProjectAssetSource(
	asset,
	index,
	totalAssets,
	{
		compressSplatsToSog = false,
		sogMaxShBands = DEFAULT_SOG_MAX_SH_BANDS,
		sogIterations = DEFAULT_SOG_ITERATIONS,
		onProgress = null,
	} = {},
) {
	const progress = {
		phase:
			compressSplatsToSog &&
			asset.kind === "splat" &&
			canCompressEmbeddedSplatSourceAsSog(asset.source)
				? "compress-splats"
				: "resolve-assets",
		index: index + 1,
		total: totalAssets,
		assetLabel: asset.label,
		fileLabel: getProjectSourceFileLabel(asset.source),
	};

	if (
		compressSplatsToSog &&
		asset.kind === "splat" &&
		canCompressEmbeddedSplatSourceAsSog(asset.source)
	) {
		return await serializeEmbeddedSplatProjectSourceAsSog(
			asset.source,
			asset.kind,
			index,
			{
				sogMaxShBands,
				sogIterations,
				onProgress,
				progress,
			},
		);
	}

	if (isProjectFileEmbeddedFileSource(asset.source)) {
		return await serializeEmbeddedProjectSource(
			asset.source,
			asset.kind,
			index,
			{
				onProgress,
				progress,
			},
		);
	}

	if (isProjectFilePackedSplatSource(asset.source)) {
		if ((asset.source.packedArray?.length ?? 0) > 0) {
			return await serializeRawPackedSplatProjectSource(asset.source, {
				onProgress,
				progress,
			});
		}
		return await serializePackedSplatProjectSource(asset.source, {
			onProgress,
			progress,
		});
	}

	throw new Error(`Asset "${asset.label}" is missing a serializable source.`);
}

async function serializeReferenceImageAssetSource(
	referenceAsset,
	index,
	totalAssets,
	{ onProgress = null } = {},
) {
	if (!isProjectFileEmbeddedFileSource(referenceAsset.source)) {
		throw new Error(
			`Reference image "${referenceAsset.label}" is missing a serializable source.`,
		);
	}

	return await serializeEmbeddedProjectSource(
		referenceAsset.source,
		REFERENCE_IMAGE_ASSET_KIND,
		index,
		{
			onProgress,
			progress: {
				phase: "resolve-assets",
				index: index + 1,
				total: totalAssets,
				assetLabel: referenceAsset.label,
				fileLabel: getReferenceImageSourceFileLabel(referenceAsset),
			},
		},
	);
}

async function serializeCameraFramesProjectPackageContents(
	projectSnapshot,
	{
		compressSplatsToSog = false,
		sogMaxShBands = DEFAULT_SOG_MAX_SH_BANDS,
		sogIterations = DEFAULT_SOG_ITERATIONS,
		onProgress = null,
	} = {},
) {
	const normalizedProject = normalizeProjectDocument(projectSnapshot);
	const archiveEntries = {};
	const resources = {};
	const serializedAssets = [];
	const totalAssets = normalizedProject.scene.assets.length;
	const serializedReferenceImageAssets = [];
	const normalizedReferenceImages = normalizeReferenceImageDocument(
		normalizedProject.scene.referenceImages,
	);
	const totalReferenceImageAssets = normalizedReferenceImages.assets.length;

	for (const [index, asset] of normalizedProject.scene.assets.entries()) {
		const resourceId = `resource-${index + 1}`;
		const serializedSource = await serializeProjectAssetSource(
			asset,
			index,
			totalAssets,
			{
				compressSplatsToSog,
				sogMaxShBands,
				sogIterations,
				onProgress,
			},
		);

		Object.assign(archiveEntries, serializedSource.archiveEntries);
		resources[resourceId] = serializedSource.resource;
		serializedAssets.push({
			...asset,
			source: createProjectAssetResourceRef(resourceId),
		});
	}

	for (const [
		index,
		referenceAsset,
	] of normalizedReferenceImages.assets.entries()) {
		const resourceId = `reference-image-resource-${index + 1}`;
		const serializedSource = await serializeReferenceImageAssetSource(
			referenceAsset,
			index,
			totalReferenceImageAssets,
			{
				onProgress,
			},
		);
		Object.assign(archiveEntries, serializedSource.archiveEntries);
		resources[resourceId] = serializedSource.resource;
		serializedReferenceImageAssets.push({
			...referenceAsset,
			source: createProjectAssetResourceRef(resourceId),
		});
	}

	const serializedProject = {
		...normalizedProject,
		resources,
		scene: {
			...normalizedProject.scene,
			assets: serializedAssets,
			referenceImages: {
				...normalizedReferenceImages,
				assets: serializedReferenceImageAssets,
			},
		},
	};

	archiveEntries[PROJECT_MANIFEST_PATH] = textEncoder.encode(
		JSON.stringify(buildProjectManifest(), null, 2),
	);
	archiveEntries[PROJECT_DOCUMENT_PATH] = textEncoder.encode(
		JSON.stringify(serializedProject, null, 2),
	);
	const packageFingerprint = await buildProjectFingerprint(serializedProject);

	return {
		archiveEntries,
		serializedProject,
		packageFingerprint,
	};
}

function countSerializedSourceEntries(source) {
	if (isProjectFileEmbeddedFileSource(source)) {
		return 1;
	}
	if (isProjectFilePackedSplatSource(source)) {
		if ((source.packedArray?.length ?? 0) > 0) {
			return (
				1 +
				Object.keys(source.extra ?? {}).filter((key) => key !== "radMeta")
					.length
			);
		}
		return 1 + Object.keys(source.extraFiles ?? {}).length;
	}
	return 0;
}

function countProjectArchiveEntries(project) {
	return (
		project.scene.assets.reduce(
			(total, asset) => total + countSerializedSourceEntries(asset.source),
			0,
		) +
		normalizeReferenceImageDocument(
			project.scene.referenceImages,
		).assets.reduce(
			(total, asset) => total + countSerializedSourceEntries(asset.source),
			0,
		) +
		2
	);
}

export async function writeCameraFramesProjectPackageToWritable(
	projectSnapshot,
	writable,
	options,
) {
	const {
		compressSplatsToSog = false,
		sogMaxShBands = DEFAULT_SOG_MAX_SH_BANDS,
		sogIterations = DEFAULT_SOG_ITERATIONS,
		onProgress = null,
	} = options ?? {};
	const normalizedProject = normalizeProjectDocument(projectSnapshot);
	const resources = {};
	const serializedAssets = [];
	const normalizedReferenceImages = normalizeReferenceImageDocument(
		normalizedProject.scene.referenceImages,
	);
	const serializedReferenceImageAssets = [];
	const totalAssets = normalizedProject.scene.assets.length;
	const totalReferenceImageAssets = normalizedReferenceImages.assets.length;
	const totalEntries = countProjectArchiveEntries(normalizedProject);
	let writtenEntries = 0;
	const zipWriter = createArchiveWritableStream(writable, {
		level: PROJECT_ZIP_LEVEL,
	});

	for (const [index, asset] of normalizedProject.scene.assets.entries()) {
		const resourceId = `resource-${index + 1}`;
		const serializedSource = await serializeProjectAssetSource(
			asset,
			index,
			totalAssets,
			{
				compressSplatsToSog,
				sogMaxShBands,
				sogIterations,
				onProgress,
			},
		);
		for (const [path, bytes] of Object.entries(
			serializedSource.archiveEntries,
		)) {
			writtenEntries += 1;
			await notifyPackageProgress(onProgress, {
				phase: "write-package",
				stage: "zipEntries",
				index: writtenEntries,
				total: totalEntries,
				assetLabel: asset.label,
				fileLabel:
					serializedSource.archiveEntryLabels?.[path] ??
					getProjectResourceFileLabel(serializedSource.resource),
			});
			zipWriter.addEntry(path, bytes);
		}
		resources[resourceId] = serializedSource.resource;
		serializedAssets.push({
			...asset,
			source: createProjectAssetResourceRef(resourceId),
		});
	}

	for (const [
		index,
		referenceAsset,
	] of normalizedReferenceImages.assets.entries()) {
		const resourceId = `reference-image-resource-${index + 1}`;
		const serializedSource = await serializeReferenceImageAssetSource(
			referenceAsset,
			index,
			totalReferenceImageAssets,
			{
				onProgress,
			},
		);
		for (const [path, bytes] of Object.entries(
			serializedSource.archiveEntries,
		)) {
			writtenEntries += 1;
			await notifyPackageProgress(onProgress, {
				phase: "write-package",
				stage: "zipEntries",
				index: writtenEntries,
				total: totalEntries,
				assetLabel: referenceAsset.label,
				fileLabel:
					serializedSource.archiveEntryLabels?.[path] ??
					getProjectResourceFileLabel(serializedSource.resource),
			});
			zipWriter.addEntry(path, bytes);
		}
		resources[resourceId] = serializedSource.resource;
		serializedReferenceImageAssets.push({
			...referenceAsset,
			source: createProjectAssetResourceRef(resourceId),
		});
	}

	const serializedProject = {
		...normalizedProject,
		resources,
		scene: {
			...normalizedProject.scene,
			assets: serializedAssets,
			referenceImages: {
				...normalizedReferenceImages,
				assets: serializedReferenceImageAssets,
			},
		},
	};
	const manifest = buildProjectManifest();
	const packageFingerprint = await buildProjectFingerprint(serializedProject);
	const manifestBytes = textEncoder.encode(JSON.stringify(manifest, null, 2));
	const projectBytes = textEncoder.encode(
		JSON.stringify(serializedProject, null, 2),
	);

	writtenEntries += 1;
	await notifyPackageProgress(onProgress, {
		phase: "write-package",
		stage: "zipEntries",
		index: writtenEntries,
		total: totalEntries,
		fileLabel: PROJECT_MANIFEST_PATH,
	});
	zipWriter.addEntry(PROJECT_MANIFEST_PATH, manifestBytes);

	writtenEntries += 1;
	await notifyPackageProgress(onProgress, {
		phase: "write-package",
		stage: "zipEntries",
		index: writtenEntries,
		total: totalEntries,
		fileLabel: PROJECT_DOCUMENT_PATH,
	});
	zipWriter.addEntry(PROJECT_DOCUMENT_PATH, projectBytes);
	await zipWriter.close();

	return {
		manifest,
		serializedProject,
		packageFingerprint,
	};
}

export async function buildCameraFramesProjectArchive(
	projectSnapshot,
	options,
) {
	const result = await buildCameraFramesProjectPackage(
		projectSnapshot,
		options,
	);
	return result.archive;
}

export async function readCameraFramesProject(
	source,
	{ onProgress = null } = {},
) {
	const reader = await ZipReader.from(source);
	try {
		const archivePaths = reader.listFilenames();
		await notifyProjectReadProgress(onProgress, {
			phase: "verify",
			stage: "inspect-archive",
		});
		const hasManifest = archivePaths.includes(PROJECT_MANIFEST_PATH);
		const manifest = hasManifest
			? JSON.parse(
					await (async () => {
						await notifyProjectReadProgress(onProgress, {
							phase: "verify",
							stage: "read-manifest",
							fileLabel: PROJECT_MANIFEST_PATH,
						});
						return reader.text(PROJECT_MANIFEST_PATH);
					})(),
				)
			: null;
		if (
			manifest &&
			(manifest?.format !== PROJECT_FORMAT ||
				Number(manifest?.version) !== PROJECT_VERSION)
		) {
			throw new Error("Unsupported CAMERA_FRAMES project format.");
		}

		const projectPath =
			(typeof manifest?.entries?.project === "string" &&
				manifest.entries.project) ||
			archivePaths.find((path) => path === PROJECT_DOCUMENT_PATH) ||
			PROJECT_DOCUMENT_PATH;
		await notifyProjectReadProgress(onProgress, {
			phase: "expand",
			stage: "read-project-document",
			fileLabel: projectPath,
		});
		const project = normalizeProjectDocument(
			JSON.parse(await reader.text(projectPath)),
		);
		const normalizedReferenceImages = normalizeReferenceImageDocument(
			project.scene.referenceImages,
		);
		const totalAssets = project.scene.assets.length;

		const assetExtractors = project.scene.assets.map(
			(asset, index) => async () => {
				const resourceId = asset.source?.resourceId;
				const resource = project.resources?.[resourceId];
				if (!resource) {
					throw new Error(
						`Missing project resource for asset "${asset.label}".`,
					);
				}
				await notifyProjectReadProgress(onProgress, {
					phase: "expand",
					stage: "extract-project-asset",
					index: index + 1,
					total: totalAssets,
					assetLabel: asset.label,
					fileLabel:
						resource.type === "packed-splat"
							? resource.originalName || resource.manifest?.path || "meta.json"
							: resource.originalName || resource.path,
				});

				if (resource.type === "file") {
					const bytes = await reader.bytes(resource.path);
					return {
						...asset,
						source: createProjectFileEmbeddedFileSource({
							kind: asset.kind,
							file: new File([bytes], resource.originalName, {
								type: resource.mediaType || undefined,
							}),
							fileName: resource.originalName,
							projectAssetState: asset,
							legacyState: asset.legacyState ?? null,
							resource: cloneFileResource(resource, asset.kind),
						}),
					};
				}

				if (resource.type === "packed-splat") {
					const [inputBytes, ...extraBytesArray] = await Promise.all([
						reader.bytes(resource.manifest?.path),
						...(resource.extraFiles ?? []).map((ef) => reader.bytes(ef.path)),
					]);
					const extraFiles = {};
					for (const [i, extraFile] of (resource.extraFiles ?? []).entries()) {
						extraFiles[extraFile.name] = extraBytesArray[i].buffer;
					}
					return {
						...asset,
						source: createProjectFilePackedSplatSource({
							fileName: resource.originalName,
							inputBytes,
							extraFiles,
							fileType: resource.fileType ?? null,
							projectAssetState: asset,
							legacyState: asset.legacyState ?? null,
							resource: clonePackedSplatResource(resource),
							skipClone: true,
						}),
					};
				}

				if (resource.type === PROJECT_RESOURCE_RAW_PACKED_SPLAT) {
					const [packedArrayBytes, ...extraBytesArray] = await Promise.all([
						reader.bytes(resource.packedArray?.path),
						...(resource.extraArrays ?? []).map((ea) => reader.bytes(ea.path)),
					]);
					const extra = {};
					for (const [i, extraArray] of (
						resource.extraArrays ?? []
					).entries()) {
						extra[extraArray.name] = toUint32Array(extraBytesArray[i].buffer);
					}
					if (resource.radMeta) {
						extra.radMeta = JSON.parse(JSON.stringify(resource.radMeta));
					}
					return {
						...asset,
						source: createProjectFilePackedSplatSource({
							fileName: resource.originalName,
							packedArray: toUint32Array(packedArrayBytes.buffer),
							numSplats: resource.numSplats ?? 0,
							extra,
							splatEncoding: resource.splatEncoding ?? null,
							projectAssetState: asset,
							legacyState: asset.legacyState ?? null,
							resource: cloneRawPackedSplatResource(resource),
							skipClone: true,
						}),
					};
				}

				throw new Error(
					`Unsupported project resource type "${resource.type}".`,
				);
			},
		);

		const assetEntries = await Promise.all(
			assetExtractors.map((extract) => extract()),
		);

		const reconstructedReferenceImageAssets = [];
		for (const referenceAsset of normalizedReferenceImages.assets) {
			const resourceId = referenceAsset.source?.resourceId;
			const resource = project.resources?.[resourceId];
			if (!resource) {
				throw new Error(
					`Missing project resource for reference image "${referenceAsset.label}".`,
				);
			}
			if (resource.type !== "file") {
				throw new Error(
					`Unsupported project resource type "${resource.type}" for reference image "${referenceAsset.label}".`,
				);
			}
			const blob = await reader.blob(resource.path);
			reconstructedReferenceImageAssets.push({
				...referenceAsset,
				source: createProjectFileEmbeddedFileSource({
					kind: REFERENCE_IMAGE_ASSET_KIND,
					file: new File([blob], resource.originalName, {
						type: resource.mediaType || blob.type || undefined,
					}),
					fileName: resource.originalName,
					resource: cloneFileResource(resource, REFERENCE_IMAGE_ASSET_KIND),
				}),
			});
		}
		project.scene.referenceImages = {
			...normalizedReferenceImages,
			assets: reconstructedReferenceImageAssets,
		};

		return {
			manifest:
				manifest ||
				buildProjectManifest({
					storageMode: "portable",
					projectPath,
				}),
			project,
			assetEntries,
		};
	} finally {
		await reader.close();
	}
}
