import { SPLAT_EXTENSIONS } from "../../constants.js";
import {
	PROJECT_RESOURCE_RAW_PACKED_SPLAT,
	getProjectMediaTypeFromFileName,
	isProjectFileEmbeddedFileSource,
	isProjectFilePackedSplatSource,
	normalizeProjectFileName,
	toUint8Array,
} from "../document.js";

const SOG_SERIALIZABLE_EXTENSIONS = new Set(["ply", "spz"]);

export function canCompressEmbeddedSplatSourceAsSog(source) {
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

export function getProjectSourceFileLabel(source) {
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

export function getReferenceImageSourceFileLabel(asset) {
	return (
		normalizeProjectFileName(
			asset?.sourceMeta?.filename ??
				asset?.source?.fileName ??
				asset?.source?.file?.name,
			"",
		) || "reference.png"
	);
}

export function getProjectResourceFileLabel(resource) {
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
			normalizeProjectFileName(resource.originalName, "") ||
			"derived.rawsplat"
		);
	}
	return "asset";
}

export function cloneFileResource(resource, assetKind) {
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

export function clonePackedSplatResource(resource) {
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

export function cloneRawPackedSplatResource(resource) {
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

export function createBinaryEntryBytes(value) {
	if (value instanceof Uint32Array) {
		return new Uint8Array(
			value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength),
		);
	}
	return toUint8Array(value);
}
