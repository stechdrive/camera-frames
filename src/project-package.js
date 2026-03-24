const EOCD_SIG = 0x06054b50;
const EOCD64_SIG = 0x06064b50;
const EOCD64_LOCATOR_SIG = 0x07064b50;
const CENTRAL_HEADER_SIG = 0x02014b50;
const LOCAL_HEADER_SIG = 0x04034b50;
const PROJECT_PACKAGE_PACKED_SPLAT_SOURCE = "project-package-packed-splat";
const PROJECT_PACKAGE_FILE_SOURCE = "project-package-file";

import {
	MODEL_EXTENSIONS,
	PROJECT_PACKAGE_EXTENSION,
	SPLAT_EXTENSIONS,
} from "./constants.js";

class ZipReader {
	constructor(source) {
		this.source = source;
		this.entries = new Map();
	}

	static async from(source) {
		const blob = source instanceof Blob ? source : new Blob([source]);
		const reader = new ZipReader(blob);
		await reader.readCentralDirectory();
		return reader;
	}

	listFilenames() {
		return Array.from(this.entries.keys());
	}

	async stream(name) {
		const entry = this.entries.get(name);
		if (!entry) {
			throw new Error(`Missing ${name} in archive`);
		}

		if (
			entry.offset > BigInt(Number.MAX_SAFE_INTEGER) ||
			entry.compressedSize > BigInt(Number.MAX_SAFE_INTEGER)
		) {
			throw new Error(
				`Entry ${name} is too large to stream in this environment`,
			);
		}

		const header = await this.readRange(
			Number(entry.offset),
			Number(entry.offset + 30n),
		);
		const headerView = new DataView(header);
		if (headerView.getUint32(0, true) !== LOCAL_HEADER_SIG) {
			throw new Error(`Invalid local file header for ${name}`);
		}

		const nameLength = headerView.getUint16(26, true);
		const extraLength = headerView.getUint16(28, true);
		const dataStart = entry.offset + BigInt(30 + nameLength + extraLength);
		const dataEnd = dataStart + entry.compressedSize;

		if (dataEnd > BigInt(this.source.size)) {
			throw new Error(`Corrupted entry ${name}: data extends past archive end`);
		}

		const dataStream = this.source
			.slice(Number(dataStart), Number(dataEnd))
			.stream();

		if (entry.compression === 0) {
			return dataStream;
		}

		if (entry.compression === 8) {
			const inflate = new DecompressionStream("deflate-raw");
			return dataStream.pipeThrough(inflate);
		}

		throw new Error(
			`Unsupported compression method ${entry.compression} for ${name}`,
		);
	}

	async blob(name) {
		const stream = await this.stream(name);
		return await new Response(stream).blob();
	}

	async text(name) {
		const stream = await this.stream(name);
		const reader = stream.getReader();
		const decoder = new TextDecoder();
		let result = "";

		while (true) {
			const { value, done } = await reader.read();
			if (done) {
				break;
			}
			if (value) {
				result += decoder.decode(value, { stream: true });
			}
		}

		result += decoder.decode();
		return result;
	}

	async readRange(start, end) {
		return await this.source.slice(start, end).arrayBuffer();
	}

	async readCentralDirectory() {
		const searchWindow = Math.min(this.source.size, 0xffff + 22);
		const tail = await this.readRange(
			this.source.size - searchWindow,
			this.source.size,
		);
		const tailView = new DataView(tail);

		let eocdOffset = -1;
		for (let index = searchWindow - 22; index >= 0; index -= 1) {
			if (tailView.getUint32(index, true) === EOCD_SIG) {
				eocdOffset = index;
				break;
			}
		}

		if (eocdOffset < 0) {
			throw new Error("End of central directory not found");
		}

		const eocdAbsOffset = this.source.size - searchWindow + eocdOffset;
		const centralDirSize32 = tailView.getUint32(eocdOffset + 12, true);
		const centralDirOffset32 = tailView.getUint32(eocdOffset + 16, true);
		const entryCount32 = tailView.getUint16(eocdOffset + 10, true);
		const needsZip64 =
			centralDirSize32 === 0xffffffff ||
			centralDirOffset32 === 0xffffffff ||
			entryCount32 === 0xffff;

		let centralDirSize = BigInt(centralDirSize32);
		let centralDirOffset = BigInt(centralDirOffset32);
		let entryCount = BigInt(entryCount32);

		if (needsZip64) {
			const locatorOffset = eocdAbsOffset - 20;
			if (locatorOffset < 0) {
				throw new Error("ZIP64 locator not found");
			}

			const locatorBuffer = await this.readRange(
				locatorOffset,
				locatorOffset + 20,
			);
			const locatorView = new DataView(locatorBuffer);
			if (locatorView.getUint32(0, true) !== EOCD64_LOCATOR_SIG) {
				throw new Error("ZIP64 locator signature mismatch");
			}

			const eocd64Offset = Number(locatorView.getBigUint64(8, true));
			const eocd64Buffer = await this.readRange(
				eocd64Offset,
				eocd64Offset + 56,
			);
			const eocd64View = new DataView(eocd64Buffer);
			if (eocd64View.getUint32(0, true) !== EOCD64_SIG) {
				throw new Error("ZIP64 end of central directory not found");
			}

			entryCount = eocd64View.getBigUint64(32, true);
			centralDirSize = eocd64View.getBigUint64(40, true);
			centralDirOffset = eocd64View.getBigUint64(48, true);
		}

		if (
			centralDirOffset > BigInt(Number.MAX_SAFE_INTEGER) ||
			centralDirSize > BigInt(Number.MAX_SAFE_INTEGER)
		) {
			throw new Error(
				"Central directory is too large to parse in this environment",
			);
		}

		const cdBuffer = await this.readRange(
			Number(centralDirOffset),
			Number(centralDirOffset + centralDirSize),
		);
		const cdView = new DataView(cdBuffer);
		const decoder = new TextDecoder();

		let cursor = 0;
		let parsedEntries = 0n;
		while (cursor + 46 <= cdBuffer.byteLength) {
			if (cdView.getUint32(cursor, true) !== CENTRAL_HEADER_SIG) {
				throw new Error("Invalid central directory signature");
			}

			const flags = cdView.getUint16(cursor + 8, true);
			const compression = cdView.getUint16(cursor + 10, true);
			const compressedSize32 = cdView.getUint32(cursor + 20, true);
			const uncompressedSize32 = cdView.getUint32(cursor + 24, true);
			const filenameLength = cdView.getUint16(cursor + 28, true);
			const extraLength = cdView.getUint16(cursor + 30, true);
			const commentLength = cdView.getUint16(cursor + 32, true);
			const localHeaderOffset32 = cdView.getUint32(cursor + 42, true);

			const nameBytes = new Uint8Array(cdBuffer, cursor + 46, filenameLength);
			const filename = decoder.decode(nameBytes);

			let compressedSize = BigInt(compressedSize32);
			let uncompressedSize = BigInt(uncompressedSize32);
			let localHeaderOffset = BigInt(localHeaderOffset32);

			const extraStart = cursor + 46 + filenameLength;
			const extraEnd = extraStart + extraLength;
			let extraCursor = extraStart;
			while (extraCursor + 4 <= extraEnd) {
				const headerId = cdView.getUint16(extraCursor, true);
				const dataSize = cdView.getUint16(extraCursor + 2, true);
				const dataStart = extraCursor + 4;
				extraCursor += 4 + dataSize;

				if (headerId === 0x0001) {
					let offset = dataStart;
					if (uncompressedSize32 === 0xffffffff) {
						uncompressedSize = cdView.getBigUint64(offset, true);
						offset += 8;
					}
					if (compressedSize32 === 0xffffffff) {
						compressedSize = cdView.getBigUint64(offset, true);
						offset += 8;
					}
					if (localHeaderOffset32 === 0xffffffff) {
						localHeaderOffset = cdView.getBigUint64(offset, true);
					}
				}
			}

			if (compression !== 0 && compression !== 8) {
				throw new Error(
					`Unsupported compression method ${compression} for ${filename}`,
				);
			}

			this.entries.set(filename, {
				filename,
				offset: localHeaderOffset,
				compressedSize,
				uncompressedSize,
				compression,
				flags,
			});

			cursor += 46 + filenameLength + extraLength + commentLength;
			parsedEntries += 1n;
		}

		if (parsedEntries !== entryCount) {
			throw new Error("Central directory entry count mismatch");
		}
	}
}

function getPathExtension(path) {
	const clean = String(path || "")
		.replace(/\\/g, "/")
		.split("?")[0]
		.split("#")[0]
		.toLowerCase();
	const lastDot = clean.lastIndexOf(".");
	return lastDot >= 0 ? clean.slice(lastDot + 1) : "";
}

function getLeafName(path) {
	const clean = String(path || "").replace(/\\/g, "/");
	const parts = clean.split("/").filter(Boolean);
	return parts.at(-1) || clean || "asset";
}

function getParentPath(path) {
	const clean = String(path || "").replace(/\\/g, "/");
	const lastSlash = clean.lastIndexOf("/");
	return lastSlash >= 0 ? clean.slice(0, lastSlash) : "";
}

function normalizeArchivePath(path) {
	return String(path || "")
		.replace(/\\/g, "/")
		.toLowerCase();
}

function buildArchiveLookup(paths) {
	const lookup = new Map();
	for (const path of paths) {
		lookup.set(normalizeArchivePath(path), path);
	}
	return lookup;
}

function resolveArchivePath(path, lookup) {
	if (typeof path !== "string" || !path) {
		return null;
	}
	return lookup.get(normalizeArchivePath(path)) || null;
}

function removePathExtension(path) {
	const normalizedPath = String(path || "").replace(/\\/g, "/");
	const lastSlash = normalizedPath.lastIndexOf("/");
	const lastDot = normalizedPath.lastIndexOf(".");
	return lastDot > lastSlash
		? normalizedPath.slice(0, lastDot)
		: normalizedPath;
}

function getSourceName(source) {
	if (typeof source === "string") {
		try {
			const url = new URL(source);
			return decodeURIComponent(url.pathname.split("/").pop() || source);
		} catch {
			return source;
		}
	}
	return source?.name || "project.ssproj";
}

function normalizeLegacyProjectPackageDocument(documentState) {
	if (!documentState || typeof documentState !== "object") {
		return null;
	}

	const normalizeEntries = (entries, kind) =>
		(Array.isArray(entries) ? entries : []).map((entry, index) => {
			const rawEntry = entry && typeof entry === "object" ? entry : {};
			const hasFilename =
				typeof rawEntry.filename === "string" && rawEntry.filename.length > 0;
			const hasAssetId =
				typeof rawEntry.assetId === "string" && rawEntry.assetId.length > 0;

			return {
				...rawEntry,
				assetId: hasAssetId ? rawEntry.assetId : `legacy-${kind}-${index}`,
				filename: hasFilename
					? rawEntry.filename
					: kind === "splat"
						? `splat_${index}.ply`
						: `models/model_${index}.glb`,
				legacyTransformBakedInAsset: kind === "splat" && !hasFilename,
			};
		});

	return {
		...documentState,
		splats: normalizeEntries(documentState.splats, "splat"),
		models: normalizeEntries(documentState.models, "model"),
	};
}

function isProjectPackageSource(source) {
	return (
		getPathExtension(typeof source === "string" ? source : source?.name) ===
		PROJECT_PACKAGE_EXTENSION
	);
}

function isSupportedProjectPackageAssetPath(path) {
	const extension = getPathExtension(path);
	return SPLAT_EXTENSIONS.has(extension) || MODEL_EXTENSIONS.has(extension);
}

function isProjectPackagePackedSplatPath(path) {
	return normalizeArchivePath(getLeafName(path)) === "meta.json";
}

function isProjectPackagePackedSplatSource(source) {
	return source?.sourceType === PROJECT_PACKAGE_PACKED_SPLAT_SOURCE;
}

function isProjectPackageFileSource(source) {
	return source?.sourceType === PROJECT_PACKAGE_FILE_SOURCE;
}

function isImportableProjectPackageAssetPath(path) {
	return (
		isSupportedProjectPackageAssetPath(path) ||
		isProjectPackagePackedSplatPath(path)
	);
}

function getProjectPackageAssetKind(path) {
	const extension = getPathExtension(path);
	if (
		SPLAT_EXTENSIONS.has(extension) ||
		isProjectPackagePackedSplatPath(path)
	) {
		return "splat";
	}
	if (MODEL_EXTENSIONS.has(extension)) {
		return "model";
	}
	return null;
}

function getDocumentAssetEntryReference(entry) {
	if (!entry || typeof entry !== "object") {
		return "";
	}

	return (
		entry.filename ||
		entry.packagePath ||
		entry.path ||
		entry.source?.filename ||
		""
	);
}

function resolveProjectPackageDocumentAssetPath(entry, kind, lookup) {
	const referencePath = getDocumentAssetEntryReference(entry);
	if (!referencePath) {
		return null;
	}

	const candidates = [referencePath];
	if (kind === "splat") {
		const baseReferencePath = removePathExtension(referencePath);
		const siblingMetaPath = `${getParentPath(referencePath)}/meta.json`.replace(
			/^\/+/,
			"",
		);
		const nestedMetaPath = `${baseReferencePath}/meta.json`;
		candidates.push(nestedMetaPath);
		if (siblingMetaPath !== "meta.json") {
			candidates.push(siblingMetaPath);
		}
	}

	for (const candidate of candidates) {
		const resolvedPath = resolveArchivePath(candidate, lookup);
		if (resolvedPath && isImportableProjectPackageAssetPath(resolvedPath)) {
			return resolvedPath;
		}
	}

	return null;
}

function resolveProjectPackageAssetPaths(documentState, archivePaths) {
	const lookup = buildArchiveLookup(archivePaths);
	const orderedPaths = [];
	const seen = new Set();
	let unresolvedDocumentAssets = 0;

	const appendResolved = (resolvedPath) => {
		if (!resolvedPath || seen.has(resolvedPath)) {
			return;
		}
		if (!isImportableProjectPackageAssetPath(resolvedPath)) {
			return;
		}
		seen.add(resolvedPath);
		orderedPaths.push(resolvedPath);
	};

	const append = (path) => {
		appendResolved(resolveArchivePath(path, lookup));
	};

	const documentSplats = Array.isArray(documentState?.splats)
		? documentState.splats
		: [];
	const documentModels = Array.isArray(documentState?.models)
		? documentState.models
		: [];

	for (const entry of documentSplats) {
		const resolvedPath = resolveProjectPackageDocumentAssetPath(
			entry,
			"splat",
			lookup,
		);
		if (!resolvedPath) {
			unresolvedDocumentAssets += 1;
			continue;
		}
		appendResolved(resolvedPath);
	}
	for (const entry of documentModels) {
		const resolvedPath = resolveProjectPackageDocumentAssetPath(
			entry,
			"model",
			lookup,
		);
		if (!resolvedPath) {
			unresolvedDocumentAssets += 1;
			continue;
		}
		appendResolved(resolvedPath);
	}

	if (orderedPaths.length > 0 && unresolvedDocumentAssets === 0) {
		return orderedPaths;
	}

	for (const archivePath of archivePaths) {
		append(archivePath);
	}

	return orderedPaths;
}

function findProjectPackageDocumentAssetEntry(
	documentState,
	assetPath,
	lookup,
) {
	const assetKind = getProjectPackageAssetKind(assetPath);
	if (!documentState || !assetKind) {
		return null;
	}

	const entries =
		assetKind === "splat"
			? Array.isArray(documentState.splats)
				? documentState.splats
				: []
			: Array.isArray(documentState.models)
				? documentState.models
				: [];

	for (const entry of entries) {
		const resolvedPath = resolveProjectPackageDocumentAssetPath(
			entry,
			assetKind,
			lookup,
		);
		if (resolvedPath === assetPath) {
			return {
				kind: assetKind,
				entry,
			};
		}
	}

	const assetLeafName = getLeafName(assetPath).toLowerCase();
	if (!assetLeafName || assetLeafName === "meta.json") {
		return null;
	}

	const leafMatches = entries.filter((entry) => {
		const referencePath = getDocumentAssetEntryReference(entry);
		return (
			referencePath &&
			getLeafName(referencePath).toLowerCase() === assetLeafName
		);
	});
	if (leafMatches.length === 1) {
		return {
			kind: assetKind,
			entry: leafMatches[0],
		};
	}

	return null;
}

function collectProjectPackageFileReferences(value, results = new Set()) {
	if (Array.isArray(value)) {
		for (const item of value) {
			collectProjectPackageFileReferences(item, results);
		}
		return results;
	}

	if (!value || typeof value !== "object") {
		return results;
	}

	if (Array.isArray(value.files)) {
		for (const entry of value.files) {
			if (typeof entry === "string" && entry) {
				results.add(entry);
			}
		}
	}

	for (const nested of Object.values(value)) {
		collectProjectPackageFileReferences(nested, results);
	}

	return results;
}

function resolveProjectPackageReferencePath(referencePath, lookup, basePath) {
	if (typeof referencePath !== "string" || !referencePath) {
		return null;
	}

	const normalizedReferencePath = referencePath.replace(/\\/g, "/");
	if (basePath) {
		const nestedPath = `${basePath}/${normalizedReferencePath}`;
		const resolvedNestedPath = resolveArchivePath(nestedPath, lookup);
		if (resolvedNestedPath) {
			return resolvedNestedPath;
		}
	}

	return resolveArchivePath(normalizedReferencePath, lookup);
}

async function createPackedSplatSource({ reader, lookup, assetPath }) {
	const manifestText = await reader.text(assetPath);
	let manifest;
	try {
		manifest = JSON.parse(manifestText);
	} catch {
		throw new Error(`Invalid splat manifest in ${assetPath}`);
	}

	const basePath = getParentPath(assetPath);
	const extraFiles = {};
	const missingFiles = [];

	for (const referencePath of collectProjectPackageFileReferences(manifest)) {
		const resolvedPath = resolveProjectPackageReferencePath(
			referencePath,
			lookup,
			basePath,
		);
		if (!resolvedPath) {
			missingFiles.push(referencePath);
			continue;
		}

		const blob = await reader.blob(resolvedPath);
		const arrayBuffer = await blob.arrayBuffer();
		const aliases = new Set([
			referencePath.replace(/\\/g, "/"),
			resolvedPath.replace(/\\/g, "/"),
			getLeafName(referencePath),
			getLeafName(resolvedPath),
		]);

		for (const alias of aliases) {
			if (alias) {
				extraFiles[alias] = arrayBuffer;
			}
		}
	}

	if (missingFiles.length > 0) {
		throw new Error(
			`Missing companion files for ${assetPath}: ${missingFiles.join(", ")}`,
		);
	}

	return {
		sourceType: PROJECT_PACKAGE_PACKED_SPLAT_SOURCE,
		kind: "splat",
		label: getLeafName(assetPath),
		fileName: getLeafName(assetPath),
		path: assetPath,
		fileType: "pcsogs",
		inputBytes: new TextEncoder().encode(manifestText),
		extraFiles,
	};
}

function createProjectPackageFileSource({
	kind,
	fileName,
	path,
	blob,
	legacyState = null,
}) {
	return {
		sourceType: PROJECT_PACKAGE_FILE_SOURCE,
		kind,
		label: fileName,
		fileName,
		path,
		file: new File([blob], fileName, { type: blob.type || undefined }),
		legacyState,
	};
}

function createFileNameFromArchivePath(path, takenNames) {
	const leafName = getLeafName(path);
	const loweredLeafName = leafName.toLowerCase();
	if (!takenNames.has(loweredLeafName)) {
		takenNames.add(loweredLeafName);
		return leafName;
	}

	const flattened = path.replace(/[\\/]+/g, "__");
	const loweredFlattened = flattened.toLowerCase();
	if (!takenNames.has(loweredFlattened)) {
		takenNames.add(loweredFlattened);
		return flattened;
	}

	let counter = 2;
	while (true) {
		const candidate = `${flattened}__${counter}`;
		const loweredCandidate = candidate.toLowerCase();
		if (!takenNames.has(loweredCandidate)) {
			takenNames.add(loweredCandidate);
			return candidate;
		}
		counter += 1;
	}
}

async function loadProjectPackageArchive(source) {
	if (typeof source === "string") {
		const response = await fetch(source);
		if (!response.ok) {
			throw new Error(`Failed to fetch ${source}: ${response.status}`);
		}
		return await response.blob();
	}
	return source;
}

async function extractProjectPackageAssets(source) {
	const archive = await loadProjectPackageArchive(source);
	const reader = await ZipReader.from(archive);
	const archivePaths = reader.listFilenames();
	const archiveLookup = buildArchiveLookup(archivePaths);

	let documentState = null;
	const documentPath = resolveArchivePath("document.json", archiveLookup);
	if (documentPath) {
		try {
			documentState = JSON.parse(await reader.text(documentPath));
		} catch {
			documentState = null;
		}
	}
	const normalizedDocumentState =
		normalizeLegacyProjectPackageDocument(documentState);

	const assetPaths = resolveProjectPackageAssetPaths(
		normalizedDocumentState,
		archivePaths,
	);
	const packageName = getSourceName(source);

	if (assetPaths.length === 0) {
		return {
			packageName,
			assetPaths: [],
			files: [],
			importState: null,
		};
	}

	const takenNames = new Set();
	const files = [];
	for (const assetPath of assetPaths) {
		const documentAsset = findProjectPackageDocumentAssetEntry(
			normalizedDocumentState,
			assetPath,
			archiveLookup,
		);
		const legacyState = documentAsset?.entry ?? null;
		if (isProjectPackagePackedSplatPath(assetPath)) {
			const packedSource = await createPackedSplatSource({
				reader,
				lookup: archiveLookup,
				assetPath,
			});
			packedSource.legacyState = legacyState;
			files.push(packedSource);
			continue;
		}

		const blob = await reader.blob(assetPath);
		const fileName = createFileNameFromArchivePath(assetPath, takenNames);
		files.push(
			createProjectPackageFileSource({
				kind: getProjectPackageAssetKind(assetPath),
				fileName,
				path: assetPath,
				blob,
				legacyState,
			}),
		);
	}

	return {
		packageName,
		assetPaths,
		files,
		importState: documentState
			? {
					camera: documentState.camera ?? null,
					cameraFrames: documentState.cameraFrames ?? null,
				}
			: null,
	};
}

export {
	ZipReader,
	extractProjectPackageAssets,
	isImportableProjectPackageAssetPath,
	isProjectPackagePackedSplatPath,
	isProjectPackagePackedSplatSource,
	isProjectPackageFileSource,
	isProjectPackageSource,
	isSupportedProjectPackageAssetPath,
	resolveProjectPackageAssetPaths,
};
