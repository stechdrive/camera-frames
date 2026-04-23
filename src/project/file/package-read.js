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
					let lodSplats = null;
					if (resource.lodSplats?.packedArray?.path) {
						const [lodPackedBytes, ...lodExtraBytesArray] = await Promise.all([
							reader.bytes(resource.lodSplats.packedArray.path),
							...(resource.lodSplats.extraArrays ?? []).map((ea) =>
								reader.bytes(ea.path),
							),
						]);
						const lodExtra = {};
						for (const [i, ea] of (
							resource.lodSplats.extraArrays ?? []
						).entries()) {
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
					return {
						...asset,
						source: createProjectFilePackedSplatSource({
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
						}),
					};
				}

				throw new Error(
					`Unsupported project resource type "${resource.type}".`,
				);
			},
		);

		const referenceImageExtractors = normalizedReferenceImages.assets.map(
			(referenceAsset) => async () => {
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
			},
		);

		const [assetEntries, reconstructedReferenceImageAssets] = await Promise.all(
			[
				Promise.all(assetExtractors.map((extract) => extract())),
				Promise.all(referenceImageExtractors.map((extract) => extract())),
			],
		);

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
