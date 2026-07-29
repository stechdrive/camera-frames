import {
	BlobReader,
	BlobWriter,
	Uint8ArrayReader,
	ZipWriter,
} from "@zip.js/zip.js";

function sanitizeArchivePath(path) {
	return String(path ?? "output")
		.replace(/\\/g, "/")
		.replace(/^\/+/, "")
		.replace(/\.\.(\/|$)/g, "")
		.trim();
}

function createZipReaderForEntry(data) {
	if (data instanceof Blob) {
		return new BlobReader(data);
	}
	return new Uint8ArrayReader(data);
}

async function addZipEntry(zipWriter, entry, level) {
	const path = sanitizeArchivePath(entry?.path);
	if (!path) {
		return false;
	}
	try {
		await zipWriter.add(path, createZipReaderForEntry(entry.data), {
			level,
			zip64: true,
		});
		return true;
	} catch (error) {
		const detail =
			error instanceof Error ? error.message : String(error ?? "unknown error");
		throw new Error(`Failed to write ZIP entry "${path}": ${detail}`, {
			cause: error,
		});
	}
}

export async function createStreamingZipBlob(writeEntries, { level = 0 } = {}) {
	const writer = new BlobWriter("application/zip");
	const zipWriter = new ZipWriter(writer, {
		level,
		zip64: true,
		useWebWorkers: true,
	});
	try {
		const value = await writeEntries((entry) =>
			addZipEntry(zipWriter, entry, level),
		);
		const blob = await zipWriter.close(undefined, { zip64: true });
		return { blob, value };
	} catch (error) {
		try {
			await zipWriter.close();
		} catch {
			// Ignore close failures after the original zip error.
		}
		throw error;
	}
}

export async function createZipBlob(entries = [], { level = 0 } = {}) {
	const result = await createStreamingZipBlob(
		async (addEntry) => {
			for (const entry of entries) {
				await addEntry(entry);
			}
		},
		{ level },
	);
	return result.blob;
}

export function downloadBlob(blob, filename, { createLink = null } = {}) {
	const link =
		typeof createLink === "function"
			? createLink()
			: globalThis.document?.createElement?.("a");
	if (!link) {
		throw new Error("Download links are not available in this environment.");
	}
	const url = URL.createObjectURL(blob);
	link.href = url;
	link.download = filename;
	link.click();
	setTimeout(() => URL.revokeObjectURL(url), 0);
	return link;
}
