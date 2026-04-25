import { compressEmbeddedSplatSourceAsSogInWorker } from "../../engine/sog-compress-worker-client.js";
import { readSerializedSogColumnsFromInput } from "../../engine/sog-data-table.js";
import { REFERENCE_IMAGE_ASSET_KIND } from "../../reference-image-model.js";
import {
	buildProjectResourcePath,
	getProjectMediaTypeFromFileName,
	isProjectFileEmbeddedFileSource,
	isProjectFilePackedSplatSource,
	materializeProjectFilePackedSplatFullData,
	normalizeProjectFileName,
	sha256Hex,
	toUint8Array,
} from "../document.js";
import {
	getPackageSaveOptionValue,
	notifyPackageProgress,
	reportExplicitSplatStage,
	reportSplatTransformProgress,
} from "./progress.js";
import {
	canCompressEmbeddedSplatSourceAsSog,
	cloneFileResource,
	clonePackedSplatResource,
	cloneRawPackedSplatResource,
	createBinaryEntryBytes,
	getProjectSourceFileLabel,
	getReferenceImageSourceFileLabel,
} from "./resources.js";

const DEFAULT_SOG_ITERATIONS = 10;
const DEFAULT_SOG_MAX_SH_BANDS = 2;

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

async function serializeRawPackedSplatLodBundle(
	lodSplats,
	originalName,
	archiveEntries,
	archiveEntryLabels,
) {
	if (!lodSplats || !(lodSplats.packedArray instanceof Uint32Array)) {
		return null;
	}
	if (lodSplats.packedArray.length === 0) {
		return null;
	}
	const lodPackedBytes = createBinaryEntryBytes(lodSplats.packedArray);
	const lodPackedHash = await sha256Hex(lodPackedBytes);
	const lodPackedPath = buildProjectResourcePath(
		lodPackedHash,
		`${originalName}.lod.packed.u32`,
	);
	archiveEntries[lodPackedPath] = lodPackedBytes;
	archiveEntryLabels[lodPackedPath] = `${originalName} lodSplats packedArray`;

	const lodExtraArrays = [];
	for (const [name, value] of Object.entries(lodSplats.extra ?? {})) {
		if (!(value instanceof Uint32Array) || value.length === 0) {
			continue;
		}
		const bytes = createBinaryEntryBytes(value);
		if (bytes.byteLength === 0) {
			continue;
		}
		const hash = await sha256Hex(bytes);
		const path = buildProjectResourcePath(
			hash,
			`${originalName}.lod.${name}.u32`,
		);
		archiveEntries[path] = bytes;
		archiveEntryLabels[path] = `${originalName} lodSplats ${name}`;
		lodExtraArrays.push({
			name,
			path,
			sha256: hash,
			size: bytes.byteLength,
		});
	}

	return {
		numSplats: Number.isFinite(lodSplats.numSplats)
			? Math.max(0, Math.floor(lodSplats.numSplats))
			: 0,
		splatEncoding:
			lodSplats.splatEncoding && typeof lodSplats.splatEncoding === "object"
				? lodSplats.splatEncoding
				: null,
		packedArray: {
			path: lodPackedPath,
			sha256: lodPackedHash,
			size: lodPackedBytes.byteLength,
		},
		extraArrays: lodExtraArrays,
		bakedAt:
			typeof lodSplats.bakedAt === "string" && lodSplats.bakedAt
				? lodSplats.bakedAt
				: null,
		bakedQuality:
			lodSplats.bakedQuality === "quality" || lodSplats.bakedQuality === "quick"
				? lodSplats.bakedQuality
				: null,
	};
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
	const lodSplatsResource = await serializeRawPackedSplatLodBundle(
		source.lodSplats,
		originalName,
		archiveEntries,
		archiveEntryLabels,
	);
	const resource = cloneRawPackedSplatResource({
		type: "raw-packed-splat",
		assetKind: "splat",
		originalName,
		numSplats: source.numSplats ?? 0,
		splatEncoding: source.splatEncoding ?? null,
		packedArray: packedArrayResource,
		extraArrays,
		radMeta: source.extra?.radMeta ?? null,
		lodSplats: lodSplatsResource,
	});
	source.resource = resource;
	return {
		resource,
		archiveEntries,
		archiveEntryLabels,
	};
}

export async function serializeProjectAssetSource(
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
	let source = asset.source;
	if (isProjectFilePackedSplatSource(source)) {
		source = await materializeProjectFilePackedSplatFullData(source);
	}
	const progress = {
		phase:
			compressSplatsToSog &&
			asset.kind === "splat" &&
			canCompressEmbeddedSplatSourceAsSog(source)
				? "compress-splats"
				: "resolve-assets",
		index: index + 1,
		total: totalAssets,
		assetLabel: asset.label,
		fileLabel: getProjectSourceFileLabel(source),
	};

	if (
		compressSplatsToSog &&
		asset.kind === "splat" &&
		canCompressEmbeddedSplatSourceAsSog(source)
	) {
		return await serializeEmbeddedSplatProjectSourceAsSog(
			source,
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

	if (isProjectFileEmbeddedFileSource(source)) {
		return await serializeEmbeddedProjectSource(
			source,
			asset.kind,
			index,
			{
				onProgress,
				progress,
			},
		);
	}

	if (isProjectFilePackedSplatSource(source)) {
		if ((source.packedArray?.length ?? 0) > 0) {
			return await serializeRawPackedSplatProjectSource(source, {
				onProgress,
				progress,
			});
		}
		return await serializePackedSplatProjectSource(source, {
			onProgress,
			progress,
		});
	}

	throw new Error(`Asset "${asset.label}" is missing a serializable source.`);
}

export async function serializeReferenceImageAssetSource(
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
