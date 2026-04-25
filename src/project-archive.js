import {
	BlobReader,
	BlobWriter,
	TextWriter,
	Uint8ArrayReader,
	Uint8ArrayWriter,
	ZipReader as ZipJsReader,
	ZipWriter as ZipJsWriter,
} from "@zip.js/zip.js";

const DEFAULT_ARCHIVE_ZIP_LEVEL = 6;
const COMPRESSION_METHOD_STORE = 0;
const LOCAL_FILE_HEADER_SIGNATURE = 0x04034b50;
const LOCAL_FILE_HEADER_SIZE = 30;
const BITFLAG_ENCRYPTED = 0b1;

function canSliceStoredEntry(source, entry) {
	if (!(source instanceof Blob)) {
		return false;
	}
	if (!entry || entry.directory || entry.encrypted) {
		return false;
	}
	if (entry.compressionMethod !== COMPRESSION_METHOD_STORE) {
		return false;
	}
	if (
		!Number.isFinite(entry.offset) ||
		entry.offset < 0 ||
		!Number.isFinite(entry.compressedSize) ||
		entry.compressedSize < 0 ||
		!Number.isFinite(entry.uncompressedSize) ||
		entry.uncompressedSize < 0
	) {
		return false;
	}
	if (entry.compressedSize !== entry.uncompressedSize) {
		return false;
	}
	if (Number.isFinite(entry.diskNumberStart) && entry.diskNumberStart !== 0) {
		return false;
	}
	return entry.offset + LOCAL_FILE_HEADER_SIZE <= source.size;
}

async function resolveStoredEntryDataRange(source, entry) {
	if (!canSliceStoredEntry(source, entry)) {
		return null;
	}
	const headerBlob = source.slice(
		entry.offset,
		entry.offset + LOCAL_FILE_HEADER_SIZE,
	);
	if (headerBlob.size !== LOCAL_FILE_HEADER_SIZE) {
		return null;
	}
	const headerBytes = new Uint8Array(await headerBlob.arrayBuffer());
	const headerView = new DataView(
		headerBytes.buffer,
		headerBytes.byteOffset,
		headerBytes.byteLength,
	);
	if (headerView.getUint32(0, true) !== LOCAL_FILE_HEADER_SIGNATURE) {
		return null;
	}
	const rawBitFlag = headerView.getUint16(6, true);
	if ((rawBitFlag & BITFLAG_ENCRYPTED) === BITFLAG_ENCRYPTED) {
		return null;
	}
	if (headerView.getUint16(8, true) !== COMPRESSION_METHOD_STORE) {
		return null;
	}
	const filenameLength = headerView.getUint16(26, true);
	const extraFieldLength = headerView.getUint16(28, true);
	const dataOffset =
		entry.offset + LOCAL_FILE_HEADER_SIZE + filenameLength + extraFieldLength;
	const dataEnd = dataOffset + entry.compressedSize;
	if (
		!Number.isFinite(dataOffset) ||
		!Number.isFinite(dataEnd) ||
		dataOffset < 0 ||
		dataEnd < dataOffset ||
		dataEnd > source.size
	) {
		return null;
	}
	return {
		start: dataOffset,
		end: dataEnd,
	};
}

export class ZipReader {
	constructor(source, reader, entries, { refreshSource = null } = {}) {
		this.source = source;
		this.reader = reader;
		this.entries = entries;
		this.storedEntryRanges = new Map();
		this.refreshSource =
			typeof refreshSource === "function" ? refreshSource : null;
	}

	static async from(source, { refreshSource = null } = {}) {
		const blob = source instanceof Blob ? source : new Blob([source]);
		const reader = new ZipJsReader(new BlobReader(blob), {
			useWebWorkers: true,
		});
		const entries = new Map();
		for (const entry of await reader.getEntries()) {
			if (!entry.directory) {
				entries.set(entry.filename, entry);
			}
		}
		return new ZipReader(blob, reader, entries, { refreshSource });
	}

	listFilenames() {
		return Array.from(this.entries.keys());
	}

	getEntry(name) {
		const entry = this.entries.get(name);
		if (!entry) {
			throw new Error(`Missing ${name} in archive`);
		}
		return entry;
	}

	async getStoredEntryRange(name, entry) {
		if (this.storedEntryRanges.has(name)) {
			return this.storedEntryRanges.get(name);
		}
		let range = null;
		try {
			range = await resolveStoredEntryDataRange(this.source, entry);
		} catch {
			range = null;
		}
		this.storedEntryRanges.set(name, range);
		return range;
	}

	async getStoredEntryBlob(name, entry) {
		const range = await this.getStoredEntryRange(name, entry);
		if (!range) {
			return null;
		}
		return this.source.slice(range.start, range.end);
	}

	async stream(name) {
		const blob = await this.blob(name);
		return blob.stream();
	}

	async blob(name) {
		const entry = this.getEntry(name);
		const storedBlob = await this.getStoredEntryBlob(name, entry);
		if (storedBlob) {
			return storedBlob;
		}
		return await entry.getData(new BlobWriter());
	}

	async bytes(name, { allowRefresh = true } = {}) {
		const entry = this.getEntry(name);
		try {
			const storedBlob = await this.getStoredEntryBlob(name, entry);
			if (storedBlob) {
				return new Uint8Array(await storedBlob.arrayBuffer());
			}
			return await entry.getData(new Uint8ArrayWriter());
		} catch (error) {
			if (!allowRefresh || typeof this.refreshSource !== "function") {
				throw error;
			}
			const refreshedSource = await this.refreshSource();
			const refreshedReader = await ZipReader.from(refreshedSource);
			try {
				return await refreshedReader.bytes(name, { allowRefresh: false });
			} finally {
				await refreshedReader.close();
			}
		}
	}

	async text(name) {
		const entry = this.getEntry(name);
		return await entry.getData(new TextWriter());
	}

	async close() {
		await this.reader.close();
	}
}

export async function buildZipArchiveBytes(
	archiveEntries,
	{ level = DEFAULT_ARCHIVE_ZIP_LEVEL, entryLevels = {} } = {},
) {
	const writer = new Uint8ArrayWriter();
	const zipWriter = new ZipJsWriter(writer, {
		level,
		zip64: true,
		useWebWorkers: true,
	});
	for (const [path, bytes] of Object.entries(archiveEntries)) {
		const entryLevel = Number.isFinite(entryLevels?.[path])
			? entryLevels[path]
			: level;
		await zipWriter.add(path, new Uint8ArrayReader(bytes), {
			level: entryLevel,
			zip64: true,
		});
	}
	return await zipWriter.close(undefined, {
		zip64: true,
	});
}

export function createArchiveWritableStream(
	writable,
	{ level = DEFAULT_ARCHIVE_ZIP_LEVEL } = {},
) {
	const zipWriter = new ZipJsWriter(writable, {
		level,
		zip64: true,
		useWebWorkers: true,
	});
	let closed = false;

	return {
		async addEntry(path, bytes, options = {}) {
			const entryLevel = Number.isFinite(options.level) ? options.level : level;
			await zipWriter.add(path, new Uint8ArrayReader(bytes), {
				level: entryLevel,
				zip64: true,
			});
		},
		async close() {
			if (closed) {
				return;
			}
			closed = true;
			await zipWriter.close(undefined, {
				zip64: true,
				preventClose: true,
			});
		},
	};
}
