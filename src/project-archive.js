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

export class ZipReader {
	constructor(source, reader, entries) {
		this.source = source;
		this.reader = reader;
		this.entries = entries;
	}

	static async from(source) {
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
		return new ZipReader(blob, reader, entries);
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

	async stream(name) {
		const blob = await this.blob(name);
		return blob.stream();
	}

	async blob(name) {
		const entry = this.getEntry(name);
		return await entry.getData(new BlobWriter());
	}

	async bytes(name) {
		const entry = this.getEntry(name);
		return await entry.getData(new Uint8ArrayWriter());
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
