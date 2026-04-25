import { SPLAT_EXTENSIONS } from "../../constants.js";
import {
	PROJECT_RESOURCE_RAW_PACKED_SPLAT,
	getProjectMediaTypeFromFileName,
	getProjectPathExtension,
	isProjectFileEmbeddedFileSource,
	isProjectFilePackedSplatSource,
	normalizeProjectFileName,
	toUint8Array,
} from "../document.js";

const SOG_SERIALIZABLE_EXTENSIONS = new Set(["ply", "spz"]);
const DEFAULT_PROJECT_ARCHIVE_ENTRY_LEVEL = 6;
const STORED_FILE_EXTENSIONS = new Set([
	"glb",
	"jpg",
	"jpeg",
	"png",
	"rad",
	"sog",
	"spz",
	"webp",
	"zip",
]);

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
			normalizeProjectFileName(resource.originalName, "") || "derived.rawsplat"
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

function cloneRawPackedSplatLodResource(lodResource) {
	if (!lodResource || typeof lodResource !== "object") {
		return null;
	}
	const packedArrayPath = lodResource.packedArray?.path;
	const packedArraySha = lodResource.packedArray?.sha256;
	if (
		typeof packedArrayPath !== "string" ||
		typeof packedArraySha !== "string"
	) {
		return null;
	}
	return {
		numSplats: Number(lodResource.numSplats ?? 0),
		splatEncoding:
			lodResource.splatEncoding && typeof lodResource.splatEncoding === "object"
				? JSON.parse(JSON.stringify(lodResource.splatEncoding))
				: null,
		packedArray: {
			path: packedArrayPath,
			sha256: packedArraySha,
			size: Number(lodResource.packedArray?.size ?? 0),
		},
		extraArrays: (lodResource.extraArrays ?? []).map((entry) => ({
			name: entry.name,
			path: entry.path,
			sha256: entry.sha256,
			size: Number(entry.size ?? 0),
		})),
		bakedAt:
			typeof lodResource.bakedAt === "string" && lodResource.bakedAt
				? lodResource.bakedAt
				: null,
		bakedQuality:
			lodResource.bakedQuality === "quality" ||
			lodResource.bakedQuality === "quick"
				? lodResource.bakedQuality
				: null,
	};
}

function cloneRawPackedSplatRadBundleEntry(entry) {
	if (!entry || typeof entry !== "object") {
		return null;
	}
	const path = typeof entry.path === "string" && entry.path ? entry.path : null;
	const sha256 =
		typeof entry.sha256 === "string" && entry.sha256 ? entry.sha256 : null;
	if (!path || !sha256) {
		return null;
	}
	return {
		name:
			typeof entry.name === "string" && entry.name
				? entry.name
				: normalizeProjectFileName(path.split(/[\\/]/).pop(), "asset.rad"),
		path,
		sha256,
		size: Number(entry.size ?? 0),
	};
}

function cloneRawPackedSplatRadBundleResource(radBundle) {
	if (!radBundle || typeof radBundle !== "object") {
		return null;
	}
	const root = cloneRawPackedSplatRadBundleEntry(radBundle.root);
	if (!root) {
		return null;
	}
	return {
		kind: "spark-rad-bundle",
		version: Number.isFinite(radBundle.version)
			? Math.max(1, Math.floor(radBundle.version))
			: 1,
		root,
		chunks: (radBundle.chunks ?? [])
			.map(cloneRawPackedSplatRadBundleEntry)
			.filter(Boolean),
		sourceFingerprint:
			radBundle.sourceFingerprint &&
			typeof radBundle.sourceFingerprint === "object"
				? JSON.parse(JSON.stringify(radBundle.sourceFingerprint))
				: null,
		bounds:
			radBundle.bounds && typeof radBundle.bounds === "object"
				? JSON.parse(JSON.stringify(radBundle.bounds))
				: null,
		sparkVersion:
			typeof radBundle.sparkVersion === "string"
				? radBundle.sparkVersion
				: null,
		build:
			radBundle.build && typeof radBundle.build === "object"
				? JSON.parse(JSON.stringify(radBundle.build))
				: null,
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
		lodSplats: cloneRawPackedSplatLodResource(resource.lodSplats),
		radBundle: cloneRawPackedSplatRadBundleResource(resource.radBundle),
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

function getFileResourceArchiveEntryLevel(resource) {
	const extension = getProjectPathExtension(
		resource.originalName || resource.path || "",
	);
	return STORED_FILE_EXTENSIONS.has(extension)
		? 0
		: DEFAULT_PROJECT_ARCHIVE_ENTRY_LEVEL;
}

export function getProjectArchiveEntryCompressionLevel(
	resource,
	path,
	{ defaultLevel = DEFAULT_PROJECT_ARCHIVE_ENTRY_LEVEL } = {},
) {
	if (!resource || typeof resource !== "object") {
		return defaultLevel;
	}
	if (resource.type === "file" && resource.path === path) {
		return getFileResourceArchiveEntryLevel(resource);
	}
	if (resource.type === "packed-splat") {
		if ((resource.extraFiles ?? []).some((entry) => entry.path === path)) {
			return 0;
		}
		return defaultLevel;
	}
	if (resource.type === PROJECT_RESOURCE_RAW_PACKED_SPLAT) {
		if (resource.packedArray?.path === path) {
			return 0;
		}
		if ((resource.extraArrays ?? []).some((entry) => entry.path === path)) {
			return 0;
		}
		if (resource.lodSplats?.packedArray?.path === path) {
			return 0;
		}
		if (
			(resource.lodSplats?.extraArrays ?? []).some(
				(entry) => entry.path === path,
			)
		) {
			return 0;
		}
		if (resource.radBundle?.root?.path === path) {
			return 0;
		}
		if (
			(resource.radBundle?.chunks ?? []).some((entry) => entry.path === path)
		) {
			return 0;
		}
	}
	return defaultLevel;
}

export function buildProjectArchiveEntryCompressionLevels(
	resources,
	{ defaultLevel = DEFAULT_PROJECT_ARCHIVE_ENTRY_LEVEL } = {},
) {
	const levels = {};
	for (const resource of Object.values(resources ?? {})) {
		if (!resource || typeof resource !== "object") {
			continue;
		}
		const paths = [];
		if (resource.type === "file") {
			paths.push(resource.path);
		} else if (resource.type === "packed-splat") {
			paths.push(resource.manifest?.path);
			for (const extraFile of resource.extraFiles ?? []) {
				paths.push(extraFile.path);
			}
		} else if (resource.type === PROJECT_RESOURCE_RAW_PACKED_SPLAT) {
			paths.push(resource.packedArray?.path);
			for (const entry of resource.extraArrays ?? []) {
				paths.push(entry.path);
			}
			paths.push(resource.lodSplats?.packedArray?.path);
			for (const entry of resource.lodSplats?.extraArrays ?? []) {
				paths.push(entry.path);
			}
			paths.push(resource.radBundle?.root?.path);
			for (const entry of resource.radBundle?.chunks ?? []) {
				paths.push(entry.path);
			}
		}
		for (const path of paths.filter(Boolean)) {
			levels[path] = getProjectArchiveEntryCompressionLevel(resource, path, {
				defaultLevel,
			});
		}
	}
	return levels;
}
