import assert from "node:assert/strict";
import { materializeRadBundleToPackedSplatData } from "../src/project/file/rad-unlod.js";
import { createSyntheticRadBundle } from "./helpers/rad-bundle-fixture.ts";

function splatWords(array: Uint32Array, index: number): number[] {
	return Array.from(array.slice(index * 4, index * 4 + 4));
}

{
	const packedArray = new Uint32Array([
		0x01020304, 0x05060708, 0x090a0b0c, 0x0d0e0f10, 0x11121314, 0x15161718,
		0x191a1b1c, 0x1d1e1f20, 0x21222324, 0x25262728, 0x292a2b2c, 0x2d2e2f30,
	]);
	const sh2 = new Uint32Array([
		0x00010203, 0x04050607, 0x08090a0b, 0x00000c0d, 0x10111213, 0x14151617,
		0x18191a1b, 0x00001c1d, 0x20212223, 0x24252627, 0x28292a2b, 0x00002c2d,
	]);
	const radBundle = createSyntheticRadBundle({
		packedArray,
		numSplats: 3,
		extra: { sh2 },
		splatEncoding: { rgbMin: 0, rgbMax: 1, sh2Max: 1 },
		childCounts: new Uint16Array([2, 0, 0]),
	});
	const fullData = await materializeRadBundleToPackedSplatData(radBundle);

	assert.equal(fullData.numSplats, 2);
	assert.deepEqual(
		splatWords(fullData.packedArray, 0),
		splatWords(packedArray, 1),
	);
	assert.deepEqual(
		splatWords(fullData.packedArray, 1),
		splatWords(packedArray, 2),
	);
	assert.equal(fullData.packedArray.length, 2048 * 4);
	assert.deepEqual(
		Array.from(fullData.extra.sh2.slice(0, 4)),
		Array.from(sh2.slice(4, 8)),
		"SH extras must follow the leaf splat index remap.",
	);
	assert.deepEqual(
		Array.from(fullData.extra.sh2.slice(4, 8)),
		Array.from(sh2.slice(8, 12)),
	);
	assert.equal(fullData.extra.lodTree, undefined);
	assert.equal(fullData.extra.radMeta, undefined);
}

{
	const packedArray = new Uint32Array([
		0xa1020304, 0xa5060708, 0xa90a0b0c, 0xad0e0f10, 0xb1121314, 0xb5161718,
		0xb91a1b1c, 0xbd1e1f20,
	]);
	const radBundle = createSyntheticRadBundle({
		packedArray,
		numSplats: 2,
		splatEncoding: { rgbMin: 0.2, rgbMax: 0.8 },
	});
	const fullData = await materializeRadBundleToPackedSplatData(radBundle);

	assert.equal(fullData.numSplats, 2);
	assert.deepEqual(
		splatWords(fullData.packedArray, 0),
		splatWords(packedArray, 0),
	);
	assert.deepEqual(
		splatWords(fullData.packedArray, 1),
		splatWords(packedArray, 1),
	);
	assert.deepEqual(fullData.splatEncoding, { rgbMin: 0.2, rgbMax: 0.8 });
}

console.log("✅ CAMERA_FRAMES RAD unlod tests passed!");
