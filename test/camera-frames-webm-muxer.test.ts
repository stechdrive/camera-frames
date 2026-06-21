import assert from "node:assert/strict";
import { createWebmBlobFromEncodedChunks } from "../src/controllers/export/video-download.js";

function includesAscii(bytes: Uint8Array, text: string) {
	const needle = new TextEncoder().encode(text);
	for (let offset = 0; offset <= bytes.length - needle.length; offset += 1) {
		let matched = true;
		for (let index = 0; index < needle.length; index += 1) {
			if (bytes[offset + index] !== needle[index]) {
				matched = false;
				break;
			}
		}
		if (matched) {
			return true;
		}
	}
	return false;
}

{
	const blob = createWebmBlobFromEncodedChunks({
		chunks: [
			{
				data: new Uint8Array([0x11, 0x22, 0x33]),
				timestamp: 0,
				type: "key",
			},
			{
				data: new Uint8Array([0x44, 0x55]),
				timestamp: 41_667,
				type: "delta",
			},
		],
		codecId: "V_VP8",
		width: 64,
		height: 36,
		fps: 24,
		mimeType: "video/webm;codecs=vp8",
	});
	const bytes = new Uint8Array(await blob.arrayBuffer());

	assert.equal(blob.type, "video/webm;codecs=vp8");
	assert.deepEqual([...bytes.slice(0, 4)], [0x1a, 0x45, 0xdf, 0xa3]);
	assert.equal(includesAscii(bytes, "webm"), true);
	assert.equal(includesAscii(bytes, "V_VP8"), true);
	assert.equal(includesAscii(bytes, "CAMERA_FRAMES"), true);
	assert.equal(bytes.includes(0xa3), true);
}

assert.throws(
	() =>
		createWebmBlobFromEncodedChunks({
			chunks: [],
			width: 64,
			height: 36,
			fps: 24,
		}),
	/at least one frame/,
);

console.log("✅ CAMERA_FRAMES WebM muxer tests passed!");
