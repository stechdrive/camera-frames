import {
	buildZipArchiveBytes,
	createArchiveWritableStream,
} from "../../project-archive.js";
import { normalizeReferenceImageDocument } from "../../reference-image-model.js";
import {
	PROJECT_DOCUMENT_PATH,
	PROJECT_MANIFEST_PATH,
	buildProjectFingerprint,
	buildProjectManifest,
	createProjectAssetResourceRef,
	isProjectFileEmbeddedFileSource,
	isProjectFilePackedSplatSource,
	materializeProjectFilePackedSplatFullData,
	normalizeProjectDocument,
} from "../document.js";
import { notifyPackageProgress } from "./progress.js";
import {
	buildProjectArchiveEntryCompressionLevels,
	getProjectArchiveEntryCompressionLevel,
	getProjectResourceFileLabel,
} from "./resources.js";
import {
	serializeProjectAssetSource,
	serializeReferenceImageAssetSource,
} from "./serialize-sources.js";

const DEFAULT_SOG_ITERATIONS = 10;
const DEFAULT_SOG_MAX_SH_BANDS = 2;
const PROJECT_ZIP_LEVEL = 6;
const textEncoder = new TextEncoder();

export {
	createProjectFileEmbeddedFileSource,
	createProjectFilePackedSplatSource,
	getDefaultProjectFilename,
	isProjectFileEmbeddedFileSource,
	isProjectFilePackedSplatSource,
} from "../document.js";

export {
	createProjectFileLazyResourceSource,
	isProjectFileLazyResourceSource,
	materializeProjectFileLazyResourceSource,
} from "./lazy-source.js";

export {
	openCameraFramesProjectPackage,
	readCameraFramesProject,
} from "./package-read.js";

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
	await materializeDeferredPackedSplatSources(normalizedProject);
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

async function materializeDeferredPackedSplatSources(project) {
	for (const asset of project?.scene?.assets ?? []) {
		if (isProjectFilePackedSplatSource(asset?.source)) {
			await materializeProjectFilePackedSplatFullData(asset.source);
		}
	}
}

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
		entryLevels: buildProjectArchiveEntryCompressionLevels(
			packageContents.serializedProject.resources,
			{ defaultLevel: PROJECT_ZIP_LEVEL },
		),
	});
	return {
		archive,
		manifest: buildProjectManifest(),
		serializedProject: packageContents.serializedProject,
		packageFingerprint: packageContents.packageFingerprint,
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
					.length +
				(source.lodSplats?.packedArray?.length ? 1 : 0) +
				Object.keys(source.lodSplats?.extra ?? {}).length
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
	await materializeDeferredPackedSplatSources(normalizedProject);
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
	const writtenArchiveEntryPaths = new Set();
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
			if (writtenArchiveEntryPaths.has(path)) {
				continue;
			}
			writtenArchiveEntryPaths.add(path);
			await zipWriter.addEntry(path, bytes, {
				level: getProjectArchiveEntryCompressionLevel(
					serializedSource.resource,
					path,
					{ defaultLevel: PROJECT_ZIP_LEVEL },
				),
			});
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
			if (writtenArchiveEntryPaths.has(path)) {
				continue;
			}
			writtenArchiveEntryPaths.add(path);
			await zipWriter.addEntry(path, bytes, {
				level: getProjectArchiveEntryCompressionLevel(
					serializedSource.resource,
					path,
					{ defaultLevel: PROJECT_ZIP_LEVEL },
				),
			});
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
	await zipWriter.addEntry(PROJECT_MANIFEST_PATH, manifestBytes, {
		level: PROJECT_ZIP_LEVEL,
	});

	writtenEntries += 1;
	await notifyPackageProgress(onProgress, {
		phase: "write-package",
		stage: "zipEntries",
		index: writtenEntries,
		total: totalEntries,
		fileLabel: PROJECT_DOCUMENT_PATH,
	});
	await zipWriter.addEntry(PROJECT_DOCUMENT_PATH, projectBytes, {
		level: PROJECT_ZIP_LEVEL,
	});
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
