import assert from "node:assert/strict";
import { BlobReader, TextWriter, ZipReader } from "@zip.js/zip.js";
import {
	createStreamingZipBlob,
	createZipBlob,
} from "../src/controllers/export/archive-download.js";

async function readZipTextEntries(blob: Blob) {
	const reader = new ZipReader(new BlobReader(blob));
	try {
		const entries = await reader.getEntries();
		const result = new Map<string, string>();
		for (const entry of entries) {
			result.set(entry.filename, await entry.getData(new TextWriter()));
		}
		return result;
	} finally {
		await reader.close();
	}
}

{
	const result = await createStreamingZipBlob(async (addEntry) => {
		await addEntry({
			path: "first.txt",
			data: new TextEncoder().encode("first"),
		});
		await addEntry({
			path: "nested/second.txt",
			data: new Blob(["second"], { type: "text/plain" }),
		});
		return { count: 2 };
	});

	assert.deepEqual(result.value, { count: 2 });
	assert.deepEqual(
		await readZipTextEntries(result.blob),
		new Map([
			["first.txt", "first"],
			["nested/second.txt", "second"],
		]),
	);
}

{
	const blob = await createZipBlob([
		{
			path: "legacy.txt",
			data: new TextEncoder().encode("compatible"),
		},
	]);
	assert.deepEqual(
		await readZipTextEntries(blob),
		new Map([["legacy.txt", "compatible"]]),
	);
}

console.log("✅ CAMERA_FRAMES export archive download tests passed!");
