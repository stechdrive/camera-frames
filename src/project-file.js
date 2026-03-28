import { Zip, ZipDeflate, strToU8, zipSync } from "fflate";
import { SPLAT_EXTENSIONS } from "./constants.js";
import { compressEmbeddedSplatSourceAsSogInWorker } from "./engine/sog-compress-worker-client.js";
import { readSerializedSogColumnsFromInput } from "./engine/sog-data-table.js";
import {
	PROJECT_DOCUMENT_PATH,
	PROJECT_FORMAT,
	PROJECT_MANIFEST_PATH,
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
} from "./project-document.js";
import { ZipReader } from "./project-package.js";

const DEFAULT_SOG_ITERATIONS = 10;
const DEFAULT_SOG_MAX_SH_BANDS = 2;
const SOG_SERIALIZABLE_EXTENSIONS = new Set(["ply", "spz"]);
const PROJECT_ZIP_LEVEL = 6;

function getPackageSaveOptionValue(value, fallback) {
	return Number.isFinite(value) ? value : fallback;
}

async function notifyPackageProgress(onProgress, payload) {
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
	let serializedColumns = await readSerializedColumns();
	if (progress) {
		await notifyPackageProgress(onProgress, {
			...progress,
			stage: "start-worker",
		});
	}
	let outputBytes = null;
	let workerError = null;
	let cpuWorkerError = null;
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
		workerError = error;
		console.warn(
			`SOG worker compression failed for "${originalFileName}", retrying on CPU worker.`,
			error,
		);
		try {
			if (progress) {
				await notifyPackageProgress(onProgress, {
					...progress,
					stage: "retry-cpu-worker",
				});
			}
			serializedColumns = await readSerializedColumns();
			outputBytes = await compressEmbeddedSplatSourceAsSogInWorker({
				serializedColumns,
				outputFileName,
				sogIterations: getPackageSaveOptionValue(
					sogIterations,
					DEFAULT_SOG_ITERATIONS,
				),
				forceCpu: true,
				onProgress: ({ text, progress: percent }) => {
					reportSplatTransformProgress(onProgress, progress, text, percent);
				},
			});
		} catch (retryError) {
			cpuWorkerError = retryError;
			throw new Error(
				[
					`SOG worker compression failed for "${originalFileName}".`,
					`Worker error: ${String(workerError?.message ?? workerError ?? "unknown")}`,
					`CPU worker retry error: ${String(cpuWorkerError?.message ?? cpuWorkerError ?? "unknown")}`,
					"Retry package save with SOG compression disabled if you need an immediate save.",
				].join("\n"),
			);
		}
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
	const extraFiles = [];

	for (const [name, value] of Object.entries(source.extraFiles ?? {})) {
		const bytes = toUint8Array(value);
		const hash = await sha256Hex(bytes);
		const path = buildProjectResourcePath(hash, name);
		archiveEntries[path] = bytes;
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
	const archive = zipSync(packageContents.archiveEntries, {
		level: PROJECT_ZIP_LEVEL,
	});
	return {
		archive,
		manifest: buildProjectManifest(),
		serializedProject: packageContents.serializedProject,
		packageFingerprint: packageContents.packageFingerprint,
	};
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

	for (const [index, asset] of normalizedProject.scene.assets.entries()) {
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
		};

		const resourceId = `resource-${index + 1}`;
		let serializedSource = null;
		if (
			compressSplatsToSog &&
			asset.kind === "splat" &&
			canCompressEmbeddedSplatSourceAsSog(asset.source)
		) {
			serializedSource = await serializeEmbeddedSplatProjectSourceAsSog(
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

		if (!serializedSource && isProjectFileEmbeddedFileSource(asset.source)) {
			serializedSource = await serializeEmbeddedProjectSource(
				asset.source,
				asset.kind,
				index,
				{
					onProgress,
					progress,
				},
			);
		} else if (isProjectFilePackedSplatSource(asset.source)) {
			serializedSource = await serializePackedSplatProjectSource(asset.source, {
				onProgress,
				progress,
			});
		}

		if (!serializedSource) {
			throw new Error(
				`Asset "${asset.label}" is missing a serializable source.`,
			);
		}

		Object.assign(archiveEntries, serializedSource.archiveEntries);
		resources[resourceId] = serializedSource.resource;
		serializedAssets.push({
			...asset,
			source: createProjectAssetResourceRef(resourceId),
		});
	}

	const serializedProject = {
		...normalizedProject,
		resources,
		scene: {
			...normalizedProject.scene,
			assets: serializedAssets,
		},
	};

	archiveEntries[PROJECT_MANIFEST_PATH] = strToU8(
		JSON.stringify(buildProjectManifest(), null, 2),
	);
	archiveEntries[PROJECT_DOCUMENT_PATH] = strToU8(
		JSON.stringify(serializedProject, null, 2),
	);
	const packageFingerprint = await buildProjectFingerprint(serializedProject);

	return {
		archiveEntries,
		serializedProject,
		packageFingerprint,
	};
}

async function streamArchiveEntriesToWritable(
	archiveEntries,
	writable,
	{ onProgress = null } = {},
) {
	const entries = Object.entries(archiveEntries);
	let pendingWrite = Promise.resolve();

	await new Promise((resolve, reject) => {
		let finished = false;
		const fail = (error) => {
			if (finished) {
				return;
			}
			finished = true;
			reject(error);
		};
		const finish = () => {
			if (finished) {
				return;
			}
			finished = true;
			resolve();
		};

		const zip = new Zip((error, chunk, final) => {
			if (error) {
				fail(error);
				return;
			}
			if (chunk?.length) {
				pendingWrite = pendingWrite.then(() => writable.write(chunk));
			}
			if (final) {
				pendingWrite.then(finish).catch(fail);
			}
		});

		(async () => {
			try {
				for (const [index, [path, bytes]] of entries.entries()) {
					await notifyPackageProgress(onProgress, {
						phase: "write-package",
						stage: "zipEntries",
						index: index + 1,
						total: entries.length,
						assetLabel: path,
					});
					const entry = new ZipDeflate(path, {
						level: PROJECT_ZIP_LEVEL,
					});
					zip.add(entry);
					entry.push(bytes, true);
				}
				zip.end();
			} catch (error) {
				fail(error);
			}
		})().catch(fail);
	});
}

export async function writeCameraFramesProjectPackageToWritable(
	projectSnapshot,
	writable,
	options,
) {
	const packageContents = await serializeCameraFramesProjectPackageContents(
		projectSnapshot,
		options,
	);
	await streamArchiveEntriesToWritable(
		packageContents.archiveEntries,
		writable,
		{
			onProgress: options?.onProgress ?? null,
		},
	);
	return {
		manifest: buildProjectManifest(),
		serializedProject: packageContents.serializedProject,
		packageFingerprint: packageContents.packageFingerprint,
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

export async function readCameraFramesProject(source) {
	const reader = await ZipReader.from(source);
	const archivePaths = reader.listFilenames();
	const hasManifest = archivePaths.includes(PROJECT_MANIFEST_PATH);
	const manifest = hasManifest
		? JSON.parse(await reader.text(PROJECT_MANIFEST_PATH))
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
	const project = normalizeProjectDocument(
		JSON.parse(await reader.text(projectPath)),
	);
	const assetEntries = [];

	for (const asset of project.scene.assets) {
		const resourceId = asset.source?.resourceId;
		const resource = project.resources?.[resourceId];
		if (!resource) {
			throw new Error(`Missing project resource for asset "${asset.label}".`);
		}

		if (resource.type === "file") {
			const blob = await reader.blob(resource.path);
			assetEntries.push({
				...asset,
				source: createProjectFileEmbeddedFileSource({
					kind: asset.kind,
					file: new File([blob], resource.originalName, {
						type: resource.mediaType || blob.type || undefined,
					}),
					fileName: resource.originalName,
					projectAssetState: asset,
					legacyState: asset.legacyState ?? null,
					resource: cloneFileResource(resource, asset.kind),
				}),
			});
			continue;
		}

		if (resource.type === "packed-splat") {
			const manifestBlob = await reader.blob(resource.manifest?.path);
			const extraFiles = {};
			for (const extraFile of resource.extraFiles ?? []) {
				const extraBlob = await reader.blob(extraFile.path);
				extraFiles[extraFile.name] = await extraBlob.arrayBuffer();
			}
			assetEntries.push({
				...asset,
				source: createProjectFilePackedSplatSource({
					fileName: resource.originalName,
					inputBytes: new Uint8Array(await manifestBlob.arrayBuffer()),
					extraFiles,
					fileType: resource.fileType ?? null,
					projectAssetState: asset,
					legacyState: asset.legacyState ?? null,
					resource: clonePackedSplatResource(resource),
				}),
			});
			continue;
		}

		throw new Error(`Unsupported project resource type "${resource.type}".`);
	}

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
}
