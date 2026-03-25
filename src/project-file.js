import { strToU8, zipSync } from "fflate";
import {
	PROJECT_DOCUMENT_PATH,
	PROJECT_FORMAT,
	PROJECT_MANIFEST_PATH,
	PROJECT_VERSION,
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

async function serializeEmbeddedProjectSource(source, assetKind, index) {
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

async function serializePackedSplatProjectSource(source) {
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

export async function buildCameraFramesProjectArchive(projectSnapshot) {
	const normalizedProject = normalizeProjectDocument(projectSnapshot);
	const archiveEntries = {};
	const resources = {};
	const serializedAssets = [];

	for (const [index, asset] of normalizedProject.scene.assets.entries()) {
		const resourceId = `resource-${index + 1}`;
		let serializedSource = null;
		if (isProjectFileEmbeddedFileSource(asset.source)) {
			serializedSource = await serializeEmbeddedProjectSource(
				asset.source,
				asset.kind,
				index,
			);
		} else if (isProjectFilePackedSplatSource(asset.source)) {
			serializedSource = await serializePackedSplatProjectSource(asset.source);
		} else {
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

	return zipSync(archiveEntries, {
		level: 6,
	});
}

export async function readCameraFramesProject(source) {
	const reader = await ZipReader.from(source);
	const manifest = JSON.parse(await reader.text(PROJECT_MANIFEST_PATH));
	if (
		manifest?.format !== PROJECT_FORMAT ||
		Number(manifest?.version) !== PROJECT_VERSION
	) {
		throw new Error("Unsupported CAMERA_FRAMES project format.");
	}

	const projectPath =
		typeof manifest.entries?.project === "string" && manifest.entries.project
			? manifest.entries.project
			: PROJECT_DOCUMENT_PATH;
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
	};
}
