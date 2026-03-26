import {
	PROJECT_DOCUMENT_PATH,
	PROJECT_FORMAT,
	PROJECT_JOURNAL_PATH,
	PROJECT_MANIFEST_PATH,
	PROJECT_VERSION,
	buildProjectManifest,
	buildProjectResourcePath,
	createProjectAssetResourceRef,
	createProjectFileEmbeddedFileSource,
	createProjectFilePackedSplatSource,
	getProjectMediaTypeFromFileName,
	isProjectFileEmbeddedFileSource,
	isProjectFilePackedSplatSource,
	normalizeProjectDocument,
	normalizeProjectFileName,
	sha256Hex,
	toUint8Array,
} from "./project-document.js";

const fileHashCache = new WeakMap();
const binaryHashCache = new WeakMap();

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

function splitProjectPath(path) {
	return String(path ?? "")
		.split("/")
		.map((segment) => segment.trim())
		.filter(Boolean);
}

function isNotFoundError(error) {
	return error?.name === "NotFoundError";
}

async function getDirectoryHandleByPath(
	rootHandle,
	path,
	{ create = false } = {},
) {
	let currentHandle = rootHandle;
	for (const segment of splitProjectPath(path)) {
		currentHandle = await currentHandle.getDirectoryHandle(segment, {
			create,
		});
	}
	return currentHandle;
}

async function getFileHandleByPath(rootHandle, path, { create = false } = {}) {
	const segments = splitProjectPath(path);
	if (segments.length === 0) {
		throw new Error("Invalid project file path.");
	}

	const fileName = segments.pop();
	const directoryHandle =
		segments.length > 0
			? await getDirectoryHandleByPath(rootHandle, segments.join("/"), {
					create,
				})
			: rootHandle;
	return directoryHandle.getFileHandle(fileName, { create });
}

async function getFileHandleIfExists(rootHandle, path) {
	try {
		return await getFileHandleByPath(rootHandle, path);
	} catch (error) {
		if (isNotFoundError(error)) {
			return null;
		}
		throw error;
	}
}

async function writeFileByPath(rootHandle, path, data) {
	const fileHandle = await getFileHandleByPath(rootHandle, path, {
		create: true,
	});
	const writable = await fileHandle.createWritable();
	await writable.write(data);
	await writable.close();
	return fileHandle;
}

async function writeJsonByPath(rootHandle, path, value) {
	return writeFileByPath(rootHandle, path, JSON.stringify(value, null, 2));
}

async function readTextByPath(rootHandle, path) {
	const fileHandle = await getFileHandleByPath(rootHandle, path);
	const file = await fileHandle.getFile();
	return file.text();
}

async function readBytesByPath(rootHandle, path) {
	const fileHandle = await getFileHandleByPath(rootHandle, path);
	const file = await fileHandle.getFile();
	return new Uint8Array(await file.arrayBuffer());
}

async function ensureFileWritten(rootHandle, path, dataOrFactory) {
	const existingFileHandle = await getFileHandleIfExists(rootHandle, path);
	if (existingFileHandle) {
		return false;
	}
	const data =
		typeof dataOrFactory === "function" ? await dataOrFactory() : dataOrFactory;
	await writeFileByPath(rootHandle, path, data);
	return true;
}

async function getFileHash(file) {
	const cachedHash = fileHashCache.get(file);
	if (cachedHash) {
		return cachedHash;
	}
	const hash = await sha256Hex(new Uint8Array(await file.arrayBuffer()));
	fileHashCache.set(file, hash);
	return hash;
}

async function getBinaryHash(value) {
	const objectValue =
		value instanceof Uint8Array ||
		value instanceof ArrayBuffer ||
		ArrayBuffer.isView(value)
			? value
			: null;
	if (objectValue && binaryHashCache.has(objectValue)) {
		return binaryHashCache.get(objectValue);
	}
	const hash = await sha256Hex(toUint8Array(value));
	if (objectValue) {
		binaryHashCache.set(objectValue, hash);
	}
	return hash;
}

async function resolveEmbeddedResource(source, assetKind, index) {
	const file = source.file;
	const fileName = normalizeProjectFileName(
		source.fileName ?? file?.name,
		`${assetKind}-${index + 1}.bin`,
	);
	const existingResource =
		source.resource?.type === "file" ? source.resource : null;
	const hash = existingResource?.sha256 || (await getFileHash(file));
	const resource = cloneFileResource(
		{
			type: "file",
			assetKind,
			path:
				existingResource?.originalName === fileName
					? existingResource.path
					: buildProjectResourcePath(hash, fileName),
			sha256: hash,
			mediaType:
				file.type ||
				existingResource?.mediaType ||
				getProjectMediaTypeFromFileName(fileName),
			originalName: fileName,
			size: Number(file.size ?? existingResource?.size ?? 0),
		},
		assetKind,
	);
	source.resource = resource;
	return resource;
}

async function resolvePackedSplatResource(source) {
	const existingResource =
		source.resource?.type === "packed-splat" ? source.resource : null;
	const manifestHash =
		existingResource?.manifest?.sha256 ||
		(await getBinaryHash(source.inputBytes));
	const manifest = {
		path:
			existingResource?.originalName === source.fileName
				? existingResource.manifest.path
				: buildProjectResourcePath(manifestHash, source.fileName),
		sha256: manifestHash,
		size: toUint8Array(source.inputBytes).byteLength,
	};
	const existingExtraFiles = new Map(
		(existingResource?.extraFiles ?? []).map((entry) => [entry.name, entry]),
	);
	const extraFiles = [];

	for (const [name, value] of Object.entries(source.extraFiles ?? {})) {
		const existingEntry = existingExtraFiles.get(name) ?? null;
		const hash = existingEntry?.sha256 || (await getBinaryHash(value));
		extraFiles.push({
			name,
			path: existingEntry?.path || buildProjectResourcePath(hash, name),
			sha256: hash,
			size: toUint8Array(value).byteLength,
		});
	}

	const resource = clonePackedSplatResource({
		type: "packed-splat",
		assetKind: "splat",
		fileType: source.fileType ?? null,
		originalName: source.fileName,
		manifest,
		extraFiles,
	});
	source.resource = resource;
	return resource;
}

async function writeProjectResource(rootHandle, source, resource) {
	if (resource.type === "file") {
		return ensureFileWritten(
			rootHandle,
			resource.path,
			async () => new Uint8Array(await source.file.arrayBuffer()),
		);
	}

	if (resource.type === "packed-splat") {
		let wroteAnyFile = false;
		if (
			await ensureFileWritten(rootHandle, resource.manifest.path, () =>
				toUint8Array(source.inputBytes),
			)
		) {
			wroteAnyFile = true;
		}
		for (const extraFile of resource.extraFiles ?? []) {
			if (
				await ensureFileWritten(rootHandle, extraFile.path, () =>
					toUint8Array(source.extraFiles?.[extraFile.name]),
				)
			) {
				wroteAnyFile = true;
			}
		}
		return wroteAnyFile;
	}

	throw new Error(
		`Unsupported working project resource type "${resource.type}".`,
	);
}

async function writeWorkingProjectJournal(
	directoryHandle,
	{
		state = "ready",
		projectName = directoryHandle?.name ?? "",
		savedAt = new Date().toISOString(),
	} = {},
) {
	await writeJsonByPath(directoryHandle, PROJECT_JOURNAL_PATH, {
		format: PROJECT_FORMAT,
		version: PROJECT_VERSION,
		storageMode: "working",
		state,
		projectName,
		savedAt,
	});
}

export function supportsWorkingProjectStorage() {
	return typeof globalThis.showDirectoryPicker === "function";
}

export async function pickWorkingProjectDirectory({ writable = false } = {}) {
	if (!supportsWorkingProjectStorage()) {
		throw new Error(
			"Working project folders are not supported in this browser.",
		);
	}

	return globalThis.showDirectoryPicker({
		mode: writable ? "readwrite" : "read",
	});
}

export async function saveCameraFramesWorkingProject({
	directoryHandle,
	projectSnapshot,
	projectName = directoryHandle?.name ?? "",
} = {}) {
	if (!directoryHandle) {
		throw new Error("A writable project folder is required.");
	}

	const normalizedProject = normalizeProjectDocument(projectSnapshot);
	const resources = {};
	const serializedAssets = [];
	let writtenResourceCount = 0;
	let reusedResourceCount = 0;

	await writeWorkingProjectJournal(directoryHandle, {
		state: "saving",
		projectName,
	});

	for (const [index, asset] of normalizedProject.scene.assets.entries()) {
		const resourceId = `resource-${index + 1}`;
		let resource = null;
		if (isProjectFileEmbeddedFileSource(asset.source)) {
			resource = await resolveEmbeddedResource(asset.source, asset.kind, index);
		} else if (isProjectFilePackedSplatSource(asset.source)) {
			resource = await resolvePackedSplatResource(asset.source);
		} else {
			throw new Error(
				`Asset "${asset.label}" is missing a serializable source.`,
			);
		}

		if (await writeProjectResource(directoryHandle, asset.source, resource)) {
			writtenResourceCount += 1;
		} else {
			reusedResourceCount += 1;
		}

		resources[resourceId] = resource;
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
	const manifest = buildProjectManifest({
		storageMode: "working",
		projectName,
	});

	await writeJsonByPath(
		directoryHandle,
		PROJECT_DOCUMENT_PATH,
		serializedProject,
	);
	await writeJsonByPath(directoryHandle, PROJECT_MANIFEST_PATH, manifest);
	await writeWorkingProjectJournal(directoryHandle, {
		state: "ready",
		projectName,
	});

	return {
		manifest,
		project: serializedProject,
		directoryHandle,
		projectName,
		writtenResourceCount,
		reusedResourceCount,
	};
}

export async function readCameraFramesWorkingProject(directoryHandle) {
	if (!directoryHandle) {
		throw new Error("A project folder is required.");
	}

	const manifest = JSON.parse(
		await readTextByPath(directoryHandle, PROJECT_MANIFEST_PATH),
	);
	if (
		manifest?.format !== PROJECT_FORMAT ||
		Number(manifest?.version) !== PROJECT_VERSION
	) {
		throw new Error("Unsupported CAMERA_FRAMES working project format.");
	}

	const projectPath =
		typeof manifest.entries?.project === "string" && manifest.entries.project
			? manifest.entries.project
			: PROJECT_DOCUMENT_PATH;
	const project = normalizeProjectDocument(
		JSON.parse(await readTextByPath(directoryHandle, projectPath)),
	);
	const assetEntries = [];

	for (const asset of project.scene.assets) {
		const resourceId = asset.source?.resourceId;
		const resource = project.resources?.[resourceId];
		if (!resource) {
			throw new Error(`Missing project resource for asset "${asset.label}".`);
		}

		if (resource.type === "file") {
			const fileHandle = await getFileHandleByPath(
				directoryHandle,
				resource.path,
			);
			const file = await fileHandle.getFile();
			assetEntries.push({
				...asset,
				source: createProjectFileEmbeddedFileSource({
					kind: asset.kind,
					file,
					fileName: resource.originalName,
					projectAssetState: asset,
					resource: cloneFileResource(resource, asset.kind),
				}),
			});
			continue;
		}

		if (resource.type === "packed-splat") {
			const inputBytes = await readBytesByPath(
				directoryHandle,
				resource.manifest.path,
			);
			const extraFiles = {};
			for (const extraFile of resource.extraFiles ?? []) {
				extraFiles[extraFile.name] = (
					await readBytesByPath(directoryHandle, extraFile.path)
				).buffer;
			}
			assetEntries.push({
				...asset,
				source: createProjectFilePackedSplatSource({
					fileName: resource.originalName,
					inputBytes,
					extraFiles,
					fileType: resource.fileType ?? null,
					projectAssetState: asset,
					resource: clonePackedSplatResource(resource),
				}),
			});
			continue;
		}

		throw new Error(`Unsupported project resource type "${resource.type}".`);
	}

	return {
		manifest,
		project,
		assetEntries,
		directoryHandle,
		projectName:
			typeof manifest.projectName === "string" && manifest.projectName
				? manifest.projectName
				: (directoryHandle.name ?? ""),
	};
}
