import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import initRadEncoder, {
	encode_packed_rad_bundle,
} from "../src/engine/rad-encoder-wasm/pkg/camera_frames_rad_encoder.js";

await initRadEncoder({
	module_or_path: readFileSync(
		"src/engine/rad-encoder-wasm/pkg/camera_frames_rad_encoder_bg.wasm",
	),
});

function readJsonHeader(bytes: Uint8Array, offset = 0) {
	const view = new DataView(bytes.buffer, bytes.byteOffset + offset);
	const length = view.getUint32(4, true);
	const jsonBytes = bytes.slice(offset + 8, offset + 8 + length);
	return JSON.parse(new TextDecoder().decode(jsonBytes));
}

{
	const packed = new Uint32Array([
		0xff_ff_40_20, 0, 0x8080_0000, 0x8080_8080, 0xff_20_80_ff, 0, 0x7f7f_0000,
		0x4080_8040,
	]);
	const lodTree = new Uint32Array([0, 0, 1, 1, 0, 0, 0, 0]);
	const result = encode_packed_rad_bundle(
		packed,
		2,
		lodTree,
		{},
		{},
		"tiny-lod.rad",
		"tiny-lod-",
		null,
	);

	assert.equal(result.root.name, "tiny-lod.rad");
	assert.equal(result.chunks.length, 1);
	assert.equal(result.chunks[0].name, "tiny-lod-0.radc");
	assert.deepEqual(Array.from(result.root.bytes.slice(0, 4)), [
		0x52, 0x41, 0x44, 0x30,
	]);
	const rootMeta = readJsonHeader(result.root.bytes);
	assert.equal(rootMeta.count, 2);
	assert.equal(rootMeta.lodTree, true);
	assert.equal(rootMeta.chunks[0].filename, result.chunks[0].name);
	assert.equal(rootMeta.splatEncoding.lodOpacity, true);

	assert.deepEqual(Array.from(result.chunks[0].bytes.slice(0, 4)), [
		0x52, 0x41, 0x44, 0x43,
	]);
	const chunkMeta = readJsonHeader(result.chunks[0].bytes);
	assert.equal(chunkMeta.count, 2);
	assert.ok(
		chunkMeta.properties.some(
			(property: { property: string }) => property.property === "child_count",
		),
	);
	assert.ok(
		chunkMeta.properties.some(
			(property: { property: string }) => property.property === "child_start",
		),
	);
}

{
	const packed = new Uint32Array([
		0xff_ff_40_20, 0, 0x8080_0000, 0x8080_8080, 0xff_20_80_ff, 0,
		0x7f7f_0000, 0x4080_8040,
	]);
	const sh1 = new Uint32Array(4);
	const sh2 = new Uint32Array(8);
	const sh3 = new Uint32Array(8);
	const result = encode_packed_rad_bundle(
		packed,
		2,
		new Uint32Array(),
		{ sh1, sh2, sh3 },
		{ sh1Max: 1, sh2Max: 1, sh3Max: 1 },
		"tiny-sh-lod.rad",
		"tiny-sh-lod-",
		null,
	);
	const rootMeta = readJsonHeader(result.root.bytes);
	assert.equal(rootMeta.maxSh, 3);
	const chunkMeta = readJsonHeader(result.chunks[0].bytes);
	assert.equal(chunkMeta.maxSh, 3);
	for (const propertyName of ["sh1", "sh2", "sh3"]) {
		assert.ok(
			chunkMeta.properties.some(
				(property: { property: string; encoding: string }) =>
					property.property === propertyName && property.encoding === "s8",
			),
			`${propertyName} must be encoded as RAD s8 property.`,
		);
	}
}
