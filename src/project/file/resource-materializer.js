import { REFERENCE_IMAGE_ASSET_KIND } from "../../reference-image-model.js";
import {
	PROJECT_RESOURCE_RAW_PACKED_SPLAT,
	createProjectFileEmbeddedFileSource,
	createProjectFilePackedSplatSource,
	toUint32Array,
} from "../document.js";
import { ZipReader } from "../package-legacy.js";
import { notifyProjectReadProgress } from "./progress.js";
import {
	cloneFileResource,
	clonePackedSplatResource,
	cloneRawPackedSplatResource,
} from "./resources.js";

export function getResourceFileLabel(resource) {
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

export function cloneResourceForSource(resource, kind) {
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

async function readRawPackedSplatFullData(reader, resource) {
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
	return {
		packedArray: toUint32Array(packedArrayBytes.buffer),
		numSplats: resource.numSplats ?? 0,
		extra,
		splatEncoding: resource.splatEncoding ?? null,
	};
}

async function readRawPackedSplatLodBundle(reader, lodResource) {
	if (!lodResource?.packedArray?.path) {
		return null;
	}
	const [lodPackedBytes, ...lodExtraBytesArray] = await Promise.all([
		reader.bytes(lodResource.packedArray.path),
		...(lodResource.extraArrays ?? []).map((ea) => reader.bytes(ea.path)),
	]);
	const lodExtra = {};
	for (const [i, ea] of (lodResource.extraArrays ?? []).entries()) {
		lodExtra[ea.name] = toUint32Array(lodExtraBytesArray[i].buffer);
	}
	return {
		packedArray: toUint32Array(lodPackedBytes.buffer),
		numSplats: lodResource.numSplats ?? 0,
		extra: lodExtra,
		splatEncoding: lodResource.splatEncoding ?? null,
		bakedAt: lodResource.bakedAt ?? null,
		bakedQuality: lodResource.bakedQuality ?? null,
	};
}

function canDeferRawPackedSplatFullData({ packageSource, resource }) {
	return (
		typeof Blob !== "undefined" &&
		packageSource instanceof Blob &&
		Boolean(resource?.packedArray?.path) &&
		Boolean(resource?.lodSplats?.packedArray?.path)
	);
}

function createRawPackedSplatDeferredFullData({
	packageSource,
	resource,
	lodSplats,
	fileName,
	projectAssetState,
	legacyState,
}) {
	let fullDataPromise = null;
	return {
		async loadFullData() {
			if (!fullDataPromise) {
				fullDataPromise = (async () => {
					const fullReader = await ZipReader.from(packageSource);
					try {
						const fullData = await readRawPackedSplatFullData(
							fullReader,
							resource,
						);
						return createProjectFilePackedSplatSource({
							fileName,
							inputBytes: new Uint8Array(),
							extraFiles: {},
							fileType: null,
							packedArray: fullData.packedArray,
							numSplats: fullData.numSplats,
							extra: fullData.extra,
							splatEncoding: fullData.splatEncoding,
							lodSplats,
							projectAssetState,
							legacyState,
							resource: cloneRawPackedSplatResource(resource),
							skipClone: true,
						});
					} finally {
						await fullReader.close();
					}
				})().catch((error) => {
					fullDataPromise = null;
					throw error;
				});
			}
			return await fullDataPromise;
		},
	};
}

export async function materializeProjectAssetResource({
	reader,
	asset,
	index = 0,
	resource,
	onProgress = null,
	totalAssets = 0,
	packageSource = null,
	preferBakedLodPreview = false,
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
		const blob = await reader.blob(resource.path);
		await notifyAssetProgress("extract-project-asset-complete");
		return createProjectFileEmbeddedFileSource({
			kind: asset.kind,
			file: new File([blob], resource.originalName, {
				type: resource.mediaType || blob.type || undefined,
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
		const lodSplats = await readRawPackedSplatLodBundle(
			reader,
			resource.lodSplats,
		);
		const shouldDeferFullData =
			preferBakedLodPreview &&
			lodSplats &&
			canDeferRawPackedSplatFullData({ packageSource, resource });
		const fullData = shouldDeferFullData
			? {
					packedArray: new Uint32Array(),
					numSplats: resource.numSplats ?? 0,
					extra: {},
					splatEncoding: resource.splatEncoding ?? null,
				}
			: await readRawPackedSplatFullData(reader, resource);
		const previewPackedSplats = shouldDeferFullData ? lodSplats : null;
		const deferredFullData = shouldDeferFullData
			? createRawPackedSplatDeferredFullData({
					packageSource,
					resource,
					lodSplats,
					fileName: resource.originalName,
					projectAssetState: asset,
					legacyState: asset.legacyState ?? null,
				})
			: null;
		await notifyAssetProgress("extract-project-asset-complete");
		return createProjectFilePackedSplatSource({
			fileName: resource.originalName,
			packedArray: fullData.packedArray,
			numSplats: fullData.numSplats,
			extra: fullData.extra,
			splatEncoding: fullData.splatEncoding,
			lodSplats,
			projectAssetState: asset,
			legacyState: asset.legacyState ?? null,
			resource: cloneRawPackedSplatResource(resource),
			previewPackedSplats,
			deferredFullData,
			skipClone: true,
		});
	}

	throw new Error(`Unsupported project resource type "${resource.type}".`);
}

export async function materializeReferenceImageAsset({
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
