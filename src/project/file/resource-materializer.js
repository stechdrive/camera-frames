import { REFERENCE_IMAGE_ASSET_KIND } from "../../reference-image-model.js";
import {
	PROJECT_RESOURCE_RAW_PACKED_SPLAT,
	createProjectFileEmbeddedFileSource,
	createProjectFilePackedSplatSource,
	toUint32Array,
} from "../document.js";
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
			(resource.lodSplats?.extraArrays?.length ?? 0) +
			(resource.radBundle?.root?.path ? 1 : 0) +
			(resource.radBundle?.chunks?.length ?? 0)
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

async function captureRawPackedSplatFullDataReader(reader, resource) {
	const packedArrayPath = resource.packedArray?.path;
	const extraEntries = [...(resource.extraArrays ?? [])];
	return {
		async read() {
			const [packedArrayBytes, ...extraBytesArray] = await Promise.all([
				reader.bytes(packedArrayPath),
				...extraEntries.map((entry) => reader.bytes(entry.path)),
			]);
			const extra = {};
			for (const [i, extraArray] of extraEntries.entries()) {
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
		},
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

async function captureRawPackedSplatLodBundleReader(reader, lodResource) {
	if (!lodResource?.packedArray?.path) {
		return null;
	}
	const packedArrayPath = lodResource.packedArray.path;
	const extraEntries = [...(lodResource.extraArrays ?? [])];
	return {
		async read() {
			const [lodPackedBytes, ...lodExtraBytesArray] = await Promise.all([
				reader.bytes(packedArrayPath),
				...extraEntries.map((entry) => reader.bytes(entry.path)),
			]);
			const lodExtra = {};
			for (const [i, ea] of extraEntries.entries()) {
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
		},
	};
}

function isRawPackedSplatRadBundleFingerprintCompatible(
	resource,
	radBundleResource,
) {
	const fingerprint = radBundleResource?.sourceFingerprint;
	if (!fingerprint || typeof fingerprint !== "object") {
		return true;
	}
	if (
		Number.isFinite(fingerprint.numSplats) &&
		Math.floor(fingerprint.numSplats) !== Math.floor(resource.numSplats ?? 0)
	) {
		return false;
	}
	if (
		typeof fingerprint.packedArraySha256 === "string" &&
		typeof resource.packedArray?.sha256 === "string" &&
		fingerprint.packedArraySha256 !== resource.packedArray.sha256
	) {
		return false;
	}
	const extraHashes = fingerprint.extraArraysSha256;
	if (extraHashes && typeof extraHashes === "object") {
		const resourceExtras = new Map(
			(resource.extraArrays ?? []).map((entry) => [entry.name, entry.sha256]),
		);
		for (const [name, sha256] of Object.entries(extraHashes)) {
			if (
				typeof sha256 === "string" &&
				resourceExtras.has(name) &&
				resourceExtras.get(name) !== sha256
			) {
				return false;
			}
		}
	}
	return true;
}

async function readRawPackedSplatRadBundle(reader, radBundleResource) {
	if (!radBundleResource?.root?.path) {
		return null;
	}
	const rootEntry = reader.getEntry(radBundleResource.root.path);
	const rootBlob = await reader.getStoredEntryBlob(
		radBundleResource.root.path,
		rootEntry,
	);
	if (!rootBlob) {
		return null;
	}
	const chunks = [];
	for (const entry of radBundleResource.chunks ?? []) {
		if (!entry?.path) {
			continue;
		}
		const zipEntry = reader.getEntry(entry.path);
		const blob = await reader.getStoredEntryBlob(entry.path, zipEntry);
		if (!blob) {
			return null;
		}
		chunks.push({
			...entry,
			blob,
		});
	}
	return {
		kind: "spark-rad-bundle",
		version: radBundleResource.version ?? 1,
		root: {
			...radBundleResource.root,
			blob: rootBlob,
		},
		chunks,
		sourceFingerprint: radBundleResource.sourceFingerprint ?? null,
		bounds: radBundleResource.bounds ?? null,
		sparkVersion: radBundleResource.sparkVersion ?? null,
		build: radBundleResource.build ?? null,
	};
}

export async function materializeProjectAssetResource({
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
		const radBundle = isRawPackedSplatRadBundleFingerprintCompatible(
			resource,
			resource.radBundle,
		)
			? await readRawPackedSplatRadBundle(reader, resource.radBundle)
			: null;
		if (radBundle) {
			const fullDataReader = await captureRawPackedSplatFullDataReader(
				reader,
				resource,
			);
			const lodBundleReader = await captureRawPackedSplatLodBundleReader(
				reader,
				resource.lodSplats,
			);
			await notifyAssetProgress("extract-project-asset-complete");
			return createProjectFilePackedSplatSource({
				fileName: resource.originalName,
				packedArray: new Uint32Array(),
				numSplats: resource.numSplats ?? 0,
				extra: resource.radMeta ? { radMeta: resource.radMeta } : {},
				splatEncoding: resource.splatEncoding ?? null,
				lodSplats: null,
				radBundle,
				projectAssetState: asset,
				legacyState: asset.legacyState ?? null,
				resource: cloneRawPackedSplatResource(resource),
				deferredFullData: {
					loadFullData: async () => {
						const [fullData, lodSplats] = await Promise.all([
							fullDataReader.read(),
							lodBundleReader?.read?.() ?? null,
						]);
						return {
							fileName: resource.originalName,
							packedArray: fullData.packedArray,
							numSplats: fullData.numSplats,
							extra: fullData.extra,
							splatEncoding: fullData.splatEncoding,
							lodSplats,
							projectAssetState: asset,
							legacyState: asset.legacyState ?? null,
							resource: cloneRawPackedSplatResource(resource),
						};
					},
				},
				skipClone: true,
			});
		}
		const lodSplats = await readRawPackedSplatLodBundle(
			reader,
			resource.lodSplats,
		);
		// Spark's baked LoD bundle is not a standalone replacement for the root
		// FullData. It must be attached to the full PackedSplats instance so the
		// renderer can refine back to the original splats.
		const fullData = await readRawPackedSplatFullData(reader, resource);
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
