import {
	REFERENCE_IMAGE_ASSET_KIND,
	normalizeReferenceImageDocument,
} from "../../reference-image-model.js";
import {
	PROJECT_DOCUMENT_PATH,
	PROJECT_FORMAT,
	PROJECT_MANIFEST_PATH,
	PROJECT_RESOURCE_RAW_PACKED_SPLAT,
	PROJECT_VERSION,
	buildProjectManifest,
	createProjectFileEmbeddedFileSource,
	createProjectFileLazyResourceSource,
	createProjectFilePackedSplatSource,
	normalizeProjectDocument,
	toUint32Array,
} from "../document.js";
import { ZipReader } from "../package-legacy.js";
import { notifyProjectReadProgress } from "./progress.js";
import {
	cloneFileResource,
	clonePackedSplatResource,
	cloneRawPackedSplatResource,
} from "./resources.js";

function getResourceFileLabel(resource) {
	if (resource.type === "packed-splat") {
		return resource.originalName || resource.manifest?.path || "meta.json";
	}
	if (resource.type === PROJECT_RESOURCE_RAW_PACKED_SPLAT) {
		return resource.originalName || resource.packedArray?.path || "rawsplat";
	}
	return resource.originalName || resource.path;
}

function getResourceFileCount(resource) {
	if (resource.type === "packed-splat") {
		return 1 + (resource.extraFiles?.length ?? 0);
	}
	if (resource.type === PROJECT_RESOURCE_RAW_PACKED_SPLAT) {
		return (
			1 +
			(resource.extraArrays?.length ?? 0) +
			(resource.lodSplats?.packedArray?.path ? 1 : 0) +
			(resource.lodSplats?.extraArrays?.length ?? 0)
		);
	}
	return 1;
}

function cloneResourceForSource(resource, kind) {
	if (resource.type === "file") {
		return cloneFileResource(resource, kind);
	}
	if (resource.type === "packed-splat") {
		return clonePackedSplatResource(resource);
	}
	if (resource.type === PROJECT_RESOURCE_RAW_PACKED_SPLAT) {
		return cloneRawPackedSplatResource(resource);
	}
	throw new Error(`Unsupported project resource type "${resource.type}".`);
}

async function materializeProjectAssetResource({
	reader,
	asset,
	index = 0,
	resource,
	onProgress = null,
	totalAssets = 0,
}) {
	async function notifyAssetProgress(stage) {
		await notifyProjectReadProgress(onProgress, {
			phase: "expand",
			stage,
			index: index + 1,
			total: totalAssets,
			assetLabel: asset.label,
			fileLabel: getResourceFileLabel(resource),
			fileCount: getResourceFileCount(resource),
			resourceType: resource.type,
		});
	}

	await notifyAssetProgress("extract-project-asset");

	if (resource.type === "file") {
		await notifyAssetProgress("extract-project-asset-file");
		const bytes = await reader.bytes(resource.path);
		await notifyAssetProgress("extract-project-asset-complete");
		return createProjectFileEmbeddedFileSource({
			kind: asset.kind,
			file: new File([bytes], resource.originalName, {
				type: resource.mediaType || undefined,
			}),
			fileName: resource.originalName,
			projectAssetState: asset,
			legacyState: asset.legacyState ?? null,
			resource: cloneFileResource(resource, asset.kind),
		});
	}

	if (resource.type === "packed-splat") {
		await notifyAssetProgress("extract-project-asset-packed-splat");
		const [inputBytes, ...extraBytesArray] = await Promise.all([
			reader.bytes(resource.manifest?.path),
			...(resource.extraFiles ?? []).map((ef) => reader.bytes(ef.path)),
		]);
		const extraFiles = {};
		for (const [i, extraFile] of (resource.extraFiles ?? []).entries()) {
			extraFiles[extraFile.name] = extraBytesArray[i].buffer;
		}
		await notifyAssetProgress("extract-project-asset-complete");
		return createProjectFilePackedSplatSource({
			fileName: resource.originalName,
			inputBytes,
			extraFiles,
			fileType: resource.fileType ?? null,
			projectAssetState: asset,
			legacyState: asset.legacyState ?? null,
			resource: clonePackedSplatResource(resource),
			skipClone: true,
		});
	}

	if (resource.type === PROJECT_RESOURCE_RAW_PACKED_SPLAT) {
		await notifyAssetProgress("extract-project-asset-raw-splat");
		const [packedArrayBytes, ...extraBytesArray] = await Promise.all([
			reader.bytes(resource.packedArray?.path),
			...(resource.extraArrays ?? []).map((ea) => reader.bytes(ea.path)),
		]);
		const extra = {};
		for (const [i, extraArray] of (resource.extraArrays ?? []).entries()) {
			extra[extraArray.name] = toUint32Array(extraBytesArray[i].buffer);
		}
		if (resource.radMeta) {
			extra.radMeta = JSON.parse(JSON.stringify(resource.radMeta));
		}
		let lodSplats = null;
		if (resource.lodSplats?.packedArray?.path) {
			const [lodPackedBytes, ...lodExtraBytesArray] = await Promise.all([
				reader.bytes(resource.lodSplats.packedArray.path),
				...(resource.lodSplats.extraArrays ?? []).map((ea) =>
					reader.bytes(ea.path),
				),
			]);
			const lodExtra = {};
			for (const [i, ea] of (resource.lodSplats.extraArrays ?? []).entries()) {
				lodExtra[ea.name] = toUint32Array(lodExtraBytesArray[i].buffer);
			}
			lodSplats = {
				packedArray: toUint32Array(lodPackedBytes.buffer),
				numSplats: resource.lodSplats.numSplats ?? 0,
				extra: lodExtra,
				splatEncoding: resource.lodSplats.splatEncoding ?? null,
				bakedAt: resource.lodSplats.bakedAt ?? null,
				bakedQuality: resource.lodSplats.bakedQuality ?? null,
			};
		}
		await notifyAssetProgress("extract-project-asset-complete");
		return createProjectFilePackedSplatSource({
			fileName: resource.originalName,
			packedArray: toUint32Array(packedArrayBytes.buffer),
			numSplats: resource.numSplats ?? 0,
			extra,
			splatEncoding: resource.splatEncoding ?? null,
			lodSplats,
			projectAssetState: asset,
			legacyState: asset.legacyState ?? null,
			resource: cloneRawPackedSplatResource(resource),
			skipClone: true,
		});
	}

	throw new Error(`Unsupported project resource type "${resource.type}".`);
}

async function materializeReferenceImageAsset({
	reader,
	referenceAsset,
	index = 0,
	resource,
	onProgress = null,
	total = 0,
}) {
	if (resource.type !== "file") {
		throw new Error(
			`Unsupported project resource type "${resource.type}" for reference image "${referenceAsset.label}".`,
		);
	}
	await notifyProjectReadProgress(onProgress, {
		phase: "expand",
		stage: "extract-reference-image",
		index: index + 1,
		total,
		assetLabel: referenceAsset.label,
		fileLabel: resource.originalName || resource.path,
		fileCount: 1,
		resourceType: resource.type,
	});
	const blob = await reader.blob(resource.path);
	return {
		...referenceAsset,
		source: createProjectFileEmbeddedFileSource({
			kind: REFERENCE_IMAGE_ASSET_KIND,
			file: new File([blob], resource.originalName, {
				type: resource.mediaType || blob.type || undefined,
			}),
			fileName: resource.originalName,
			resource: cloneFileResource(resource, REFERENCE_IMAGE_ASSET_KIND),
		}),
	};
}

export async function readCameraFramesProject(
	source,
	{ onProgress = null } = {},
) {
	await notifyProjectReadProgress(onProgress, {
		phase: "verify",
		stage: "open-archive",
	});
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
		await notifyProjectReadProgress(onProgress, {
			phase: "expand",
			stage: "scan-project-assets",
			total: totalAssets,
			referenceTotal: normalizedReferenceImages.assets.length,
		});

		const assetExtractors = project.scene.assets.map(
			(asset, index) => async () => {
				const resourceId = asset.source?.resourceId;
				const resource = project.resources?.[resourceId];
				if (!resource) {
					throw new Error(
						`Missing project resource for asset "${asset.label}".`,
					);
				}
				return {
					...asset,
					source: await materializeProjectAssetResource({
						reader,
						asset,
						index,
						resource,
						onProgress,
						totalAssets,
					}),
				};
			},
		);

		const referenceImageExtractors = normalizedReferenceImages.assets.map(
			(referenceAsset, index) => async () => {
				const resourceId = referenceAsset.source?.resourceId;
				const resource = project.resources?.[resourceId];
				if (!resource) {
					throw new Error(
						`Missing project resource for reference image "${referenceAsset.label}".`,
					);
				}
				return await materializeReferenceImageAsset({
					reader,
					referenceAsset,
					index,
					resource,
					onProgress,
					total: normalizedReferenceImages.assets.length,
				});
			},
		);

		const [assetEntries, reconstructedReferenceImageAssets] = await Promise.all(
			[
				Promise.all(assetExtractors.map((extract) => extract())),
				Promise.all(referenceImageExtractors.map((extract) => extract())),
			],
		);

		await notifyProjectReadProgress(onProgress, {
			phase: "expand",
			stage: "expand-complete",
			total: totalAssets,
			referenceTotal: normalizedReferenceImages.assets.length,
		});

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

export async function openCameraFramesProjectPackage(
	source,
	{ onProgress = null } = {},
) {
	await notifyProjectReadProgress(onProgress, {
		phase: "verify",
		stage: "open-archive",
	});
	const reader = await ZipReader.from(source);
	let closed = false;
	async function close() {
		if (closed) {
			return;
		}
		closed = true;
		await reader.close();
	}

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
		project.scene.referenceImages = normalizedReferenceImages;
		const totalAssets = project.scene.assets.length;
		await notifyProjectReadProgress(onProgress, {
			phase: "expand",
			stage: "scan-project-assets",
			total: totalAssets,
			referenceTotal: normalizedReferenceImages.assets.length,
		});

		const assetEntries = project.scene.assets.map((asset, index) => {
			const resourceId = asset.source?.resourceId;
			const resource = project.resources?.[resourceId];
			if (!resource) {
				throw new Error(`Missing project resource for asset "${asset.label}".`);
			}
			const clonedResource = cloneResourceForSource(resource, asset.kind);
			return {
				...asset,
				source: createProjectFileLazyResourceSource({
					kind: asset.kind,
					fileName: getResourceFileLabel(resource),
					projectAssetState: asset,
					legacyState: asset.legacyState ?? null,
					resource: clonedResource,
					materialize: async () =>
						await materializeProjectAssetResource({
							reader,
							asset,
							index,
							resource,
							totalAssets,
						}),
				}),
			};
		});

		let referenceImageAssets = null;
		async function materializeReferenceImages({
			onMaterializeProgress = null,
		} = {}) {
			if (referenceImageAssets) {
				return project.scene.referenceImages;
			}
			const total = normalizedReferenceImages.assets.length;
			referenceImageAssets = [];
			for (const [
				index,
				referenceAsset,
			] of normalizedReferenceImages.assets.entries()) {
				const resourceId = referenceAsset.source?.resourceId;
				const resource = project.resources?.[resourceId];
				if (!resource) {
					throw new Error(
						`Missing project resource for reference image "${referenceAsset.label}".`,
					);
				}
				referenceImageAssets.push(
					await materializeReferenceImageAsset({
						reader,
						referenceAsset,
						index,
						resource,
						onProgress: onMaterializeProgress,
						total,
					}),
				);
			}
			project.scene.referenceImages = {
				...normalizedReferenceImages,
				assets: referenceImageAssets,
			};
			return project.scene.referenceImages;
		}

		await notifyProjectReadProgress(onProgress, {
			phase: "expand",
			stage: "expand-complete",
			total: totalAssets,
			referenceTotal: normalizedReferenceImages.assets.length,
		});

		return {
			manifest:
				manifest ||
				buildProjectManifest({
					storageMode: "portable",
					projectPath,
				}),
			project,
			assetEntries,
			assetLoadConcurrency: 1,
			materializeReferenceImages,
			close,
		};
	} catch (error) {
		await close();
		throw error;
	}
}
