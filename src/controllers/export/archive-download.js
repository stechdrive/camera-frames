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

export async function createZipBlob(entries = [], { level = 0 } = {}) {
	const writer = new BlobWriter("application/zip");
	const zipWriter = new ZipWriter(writer, {
		level,
		zip64: true,
		useWebWorkers: true,
	});
	try {
		for (const entry of entries) {
			const path = sanitizeArchivePath(entry?.path);
			if (!path) {
				continue;
			}
			await zipWriter.add(path, createZipReaderForEntry(entry.data), {
				level,
				zip64: true,
			});
		}
		return await zipWriter.close(undefined, { zip64: true });
	} catch (error) {
		try {
			await zipWriter.close();
		} catch {
			// Ignore close failures after the original zip error.
		}
		throw error;
	}
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
