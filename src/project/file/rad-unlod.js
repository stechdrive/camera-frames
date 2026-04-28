const RAD_ROOT_MAGIC = "RAD0";
const RAD_CHUNK_MAGIC = "RADC";
const SPLAT_TEX_WIDTH = 2048;
const textDecoder = new TextDecoder();

function toUint8ArrayView(value) {
	if (value instanceof Uint8Array) {
		return value;
	}
	if (value instanceof ArrayBuffer) {
		return new Uint8Array(value);
	}
	if (ArrayBuffer.isView(value)) {
		return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
	}
	return new Uint8Array();
}

async function readRadBundleEntryBytes(entry, label) {
	if (!entry || typeof entry !== "object") {
		throw new Error(`RAD bundle is missing ${label}.`);
	}
	const bytes = toUint8ArrayView(entry.bytes);
	if (bytes.byteLength > 0) {
		return bytes;
	}
	if (entry.blob instanceof Blob) {
		return new Uint8Array(await entry.blob.arrayBuffer());
	}
	throw new Error(`RAD bundle ${label} has no readable bytes.`);
}

function align8(value) {
	return (value + 7) & ~7;
}

function readMagic(bytes, offset = 0) {
	return String.fromCharCode(
		bytes[offset] ?? 0,
		bytes[offset + 1] ?? 0,
		bytes[offset + 2] ?? 0,
		bytes[offset + 3] ?? 0,
	);
}

function readJsonMeta(bytes, offset, byteLength, label) {
	if (offset < 0 || byteLength < 0 || offset + byteLength > bytes.byteLength) {
		throw new Error(`RAD ${label} metadata is out of bounds.`);
	}
	const text = textDecoder.decode(bytes.slice(offset, offset + byteLength));
	return JSON.parse(text);
}

function parseRadRoot(bytes) {
	if (bytes.byteLength < 8 || readMagic(bytes) !== RAD_ROOT_MAGIC) {
		throw new Error("RAD root has an invalid header.");
	}
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	const metaLength = view.getUint32(4, true);
	const meta = readJsonMeta(bytes, 8, metaLength, "root");
	return {
		meta,
		chunkDataOffset: 8 + align8(metaLength),
	};
}

function parseRadChunk(bytes) {
	if (bytes.byteLength < 16 || readMagic(bytes) !== RAD_CHUNK_MAGIC) {
		throw new Error("RAD chunk has an invalid header.");
	}
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	const metaLength = view.getUint32(4, true);
	const meta = readJsonMeta(bytes, 8, metaLength, "chunk");
	const payloadSizeOffset = 8 + align8(metaLength);
	if (payloadSizeOffset + 8 > bytes.byteLength) {
		throw new Error("RAD chunk payload header is out of bounds.");
	}
	const payloadBytes = Number(view.getBigUint64(payloadSizeOffset, true));
	const payloadOffset = payloadSizeOffset + 8;
	if (payloadOffset + payloadBytes > bytes.byteLength) {
		throw new Error("RAD chunk payload is out of bounds.");
	}
	return {
		meta,
		payload: bytes.subarray(payloadOffset, payloadOffset + payloadBytes),
	};
}

function getFiniteCount(value, fallback = 0) {
	return Number.isFinite(value) && value >= 0 ? Math.floor(value) : fallback;
}

function getPropertySlice(parsedChunk, propertyName, expectedEncoding = null) {
	const property = (parsedChunk.meta.properties ?? []).find(
		(entry) => entry?.property === propertyName,
	);
	if (!property) {
		return null;
	}
	if (expectedEncoding && property.encoding !== expectedEncoding) {
		throw new Error(
			`RAD property "${propertyName}" uses unsupported encoding "${property.encoding}".`,
		);
	}
	const offset = getFiniteCount(property.offset);
	const byteLength = getFiniteCount(property.bytes);
	if (offset + byteLength > parsedChunk.payload.byteLength) {
		throw new Error(`RAD property "${propertyName}" is out of bounds.`);
	}
	return parsedChunk.payload.subarray(offset, offset + byteLength);
}

function setPackedBits(words, wordOffset, bitStart, bitCount, signedValue) {
	let value = signedValue & ((1 << bitCount) - 1);
	let remaining = bitCount;
	let wordIndex = wordOffset + Math.floor(bitStart / 32);
	let bitOffset = bitStart % 32;
	while (remaining > 0) {
		const writeBits = Math.min(remaining, 32 - bitOffset);
		const writeMask = (1 << writeBits) - 1;
		const shiftedMask = (writeMask << bitOffset) >>> 0;
		words[wordIndex] =
			(words[wordIndex] & ~shiftedMask) |
			(((value & writeMask) << bitOffset) >>> 0);
		value >>= writeBits;
		remaining -= writeBits;
		wordIndex += 1;
		bitOffset = 0;
	}
}

function signedByte(value) {
	return value > 127 ? value - 256 : value;
}

function decodeSignedShValue(byteValue, maxSigned) {
	return Math.max(
		-maxSigned,
		Math.min(maxSigned, Math.round((signedByte(byteValue) / 127) * maxSigned)),
	);
}

function ensureShArray(target, key, totalSplats, wordsPerSplat) {
	if (!target[key]) {
		target[key] = new Uint32Array(totalSplats * wordsPerSplat);
	}
	return target[key];
}

function decodeCenter(data, packedArray, base, count) {
	if (!data || data.byteLength < count * 6) {
		return;
	}
	for (let i = 0; i < count; i += 1) {
		const wordOffset = (base + i) * 4;
		const x = data[i] | (data[count * 3 + i] << 8);
		const y = data[count + i] | (data[count * 4 + i] << 8);
		const z = data[count * 2 + i] | (data[count * 5 + i] << 8);
		packedArray[wordOffset + 1] = x | (y << 16);
		packedArray[wordOffset + 2] =
			(packedArray[wordOffset + 2] & 0xffff0000) | z;
	}
}

function decodeComponentMajorBytes(
	data,
	packedArray,
	base,
	count,
	wordOffset,
	shifts,
) {
	if (!data || data.byteLength < count * shifts.length) {
		return;
	}
	for (let component = 0; component < shifts.length; component += 1) {
		const shift = shifts[component];
		const clearMask = ~(0xff << shift);
		for (let i = 0; i < count; i += 1) {
			const packedIndex = (base + i) * 4 + wordOffset;
			packedArray[packedIndex] =
				(packedArray[packedIndex] & clearMask) |
				((data[component * count + i] & 0xff) << shift);
		}
	}
}

function decodeOrientation(data, packedArray, base, count) {
	if (!data || data.byteLength < count * 3) {
		return;
	}
	for (let i = 0; i < count; i += 1) {
		const wordOffset = (base + i) * 4;
		packedArray[wordOffset + 2] =
			(packedArray[wordOffset + 2] & 0x0000ffff) |
			((data[i * 3] & 0xff) << 16) |
			((data[i * 3 + 1] & 0xff) << 24);
		packedArray[wordOffset + 3] =
			(packedArray[wordOffset + 3] & 0x00ffffff) |
			((data[i * 3 + 2] & 0xff) << 24);
	}
}

function decodeChildCounts(data, childCounts, base, count) {
	if (!data || data.byteLength < count * 2) {
		return;
	}
	const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
	for (let i = 0; i < count; i += 1) {
		childCounts[base + i] = view.getUint16(i * 2, true);
	}
}

function decodeSh1(data, extra, base, count, totalSplats) {
	if (!data || data.byteLength < count * 9) {
		return;
	}
	const sh1 = ensureShArray(extra, "sh1", totalSplats, 2);
	for (let component = 0; component < 9; component += 1) {
		for (let i = 0; i < count; i += 1) {
			const signed = decodeSignedShValue(data[component * count + i], 63);
			setPackedBits(sh1, (base + i) * 2, component * 7, 7, signed);
		}
	}
}

function decodeSh2(data, extra, base, count, totalSplats) {
	if (!data || data.byteLength < count * 15) {
		return;
	}
	const sh2 = ensureShArray(extra, "sh2", totalSplats, 4);
	for (let component = 0; component < 15; component += 1) {
		for (let i = 0; i < count; i += 1) {
			const signed = decodeSignedShValue(data[component * count + i], 127);
			const splatOffset = (base + i) * 4 + Math.floor(component / 4);
			sh2[splatOffset] =
				(sh2[splatOffset] & ~(0xff << ((component % 4) * 8))) |
				((signed & 0xff) << ((component % 4) * 8));
		}
	}
}

function decodeSh3(data, extra, base, count, totalSplats) {
	if (!data || data.byteLength < count * 21) {
		return;
	}
	const sh3 = ensureShArray(extra, "sh3", totalSplats, 4);
	for (let component = 0; component < 21; component += 1) {
		for (let i = 0; i < count; i += 1) {
			const signed = decodeSignedShValue(data[component * count + i], 31);
			setPackedBits(sh3, (base + i) * 4, component * 6, 6, signed);
		}
	}
}

function decodeRadChunkIntoFullData(parsedChunk, target) {
	const base = getFiniteCount(parsedChunk.meta.base);
	const count = getFiniteCount(parsedChunk.meta.count);
	const totalSplats = target.totalSplats;
	if (base + count > totalSplats) {
		throw new Error("RAD chunk range exceeds root splat count.");
	}
	decodeCenter(
		getPropertySlice(parsedChunk, "center", "f16_lebytes"),
		target.packedArray,
		base,
		count,
	);
	decodeComponentMajorBytes(
		getPropertySlice(parsedChunk, "alpha", "r8"),
		target.packedArray,
		base,
		count,
		0,
		[24],
	);
	decodeComponentMajorBytes(
		getPropertySlice(parsedChunk, "rgb", "r8"),
		target.packedArray,
		base,
		count,
		0,
		[0, 8, 16],
	);
	decodeComponentMajorBytes(
		getPropertySlice(parsedChunk, "scales", "ln_0r8"),
		target.packedArray,
		base,
		count,
		3,
		[0, 8, 16],
	);
	decodeOrientation(
		getPropertySlice(parsedChunk, "orientation", "oct88r8"),
		target.packedArray,
		base,
		count,
	);
	decodeSh1(
		getPropertySlice(parsedChunk, "sh1", "s8"),
		target.extra,
		base,
		count,
		totalSplats,
	);
	decodeSh2(
		getPropertySlice(parsedChunk, "sh2", "s8"),
		target.extra,
		base,
		count,
		totalSplats,
	);
	decodeSh3(
		getPropertySlice(parsedChunk, "sh3", "s8"),
		target.extra,
		base,
		count,
		totalSplats,
	);
	const childCountData = getPropertySlice(parsedChunk, "child_count", "u16");
	if (childCountData) {
		if (!target.childCounts) {
			target.childCounts = new Uint16Array(totalSplats);
		}
		decodeChildCounts(childCountData, target.childCounts, base, count);
	}
}

function buildChunkEntryMap(radBundle) {
	const entries = new Map();
	for (const [index, entry] of (radBundle.chunks ?? []).entries()) {
		for (const key of [entry?.name, entry?.path?.split(/[\\/]/).pop()]) {
			if (typeof key === "string" && key) {
				entries.set(key, entry);
			}
		}
		if (!entries.has(String(index))) {
			entries.set(String(index), entry);
		}
	}
	return entries;
}

async function readChunkBytes(
	radBundle,
	rootBytes,
	rootInfo,
	chunkMeta,
	index,
) {
	const entries = buildChunkEntryMap(radBundle);
	const entry =
		entries.get(chunkMeta?.filename) ??
		entries.get(chunkMeta?.name) ??
		entries.get(String(index)) ??
		null;
	if (entry) {
		return await readRadBundleEntryBytes(entry, `chunk ${index + 1}`);
	}
	const offset = rootInfo.chunkDataOffset + getFiniteCount(chunkMeta?.offset);
	const byteLength = getFiniteCount(chunkMeta?.bytes);
	if (byteLength > 0 && offset + byteLength <= rootBytes.byteLength) {
		return rootBytes.subarray(offset, offset + byteLength);
	}
	throw new Error(`RAD bundle is missing chunk ${index + 1}.`);
}

function paddedSplatCapacity(numSplats) {
	if (numSplats <= 0) {
		return 0;
	}
	return Math.ceil(numSplats / SPLAT_TEX_WIDTH) * SPLAT_TEX_WIDTH;
}

function copyLeafPackedData(fullData) {
	const leafIndices = [];
	for (let index = 0; index < fullData.totalSplats; index += 1) {
		if (!fullData.childCounts || fullData.childCounts[index] === 0) {
			leafIndices.push(index);
		}
	}
	const numSplats = leafIndices.length;
	const capacity = paddedSplatCapacity(numSplats);
	const packedArray = new Uint32Array(capacity * 4);
	const extra = {};
	for (let outIndex = 0; outIndex < numSplats; outIndex += 1) {
		const sourceIndex = leafIndices[outIndex];
		packedArray.set(
			fullData.packedArray.subarray(sourceIndex * 4, sourceIndex * 4 + 4),
			outIndex * 4,
		);
	}
	for (const [key, wordsPerSplat] of [
		["sh1", 2],
		["sh2", 4],
		["sh3", 4],
	]) {
		const sourceArray = fullData.extra[key];
		if (!(sourceArray instanceof Uint32Array) || sourceArray.length === 0) {
			continue;
		}
		const nextArray = new Uint32Array(capacity * wordsPerSplat);
		for (let outIndex = 0; outIndex < numSplats; outIndex += 1) {
			const sourceIndex = leafIndices[outIndex];
			nextArray.set(
				sourceArray.subarray(
					sourceIndex * wordsPerSplat,
					sourceIndex * wordsPerSplat + wordsPerSplat,
				),
				outIndex * wordsPerSplat,
			);
		}
		extra[key] = nextArray;
	}
	return {
		packedArray,
		numSplats,
		extra,
		splatEncoding:
			fullData.splatEncoding && typeof fullData.splatEncoding === "object"
				? JSON.parse(JSON.stringify(fullData.splatEncoding))
				: null,
	};
}

export async function materializeRadBundleToPackedSplatData(radBundle) {
	const rootBytes = await readRadBundleEntryBytes(radBundle?.root, "root");
	const rootInfo = parseRadRoot(rootBytes);
	const totalSplats = getFiniteCount(rootInfo.meta.count);
	if (totalSplats <= 0) {
		throw new Error("RAD bundle contains no splats.");
	}
	const fullData = {
		totalSplats,
		packedArray: new Uint32Array(totalSplats * 4),
		extra: {},
		childCounts: null,
		splatEncoding: rootInfo.meta.splatEncoding ?? null,
	};
	const chunks = Array.isArray(rootInfo.meta.chunks)
		? rootInfo.meta.chunks
		: [];
	if (chunks.length === 0) {
		throw new Error("RAD bundle contains no chunks.");
	}
	for (const [index, chunkMeta] of chunks.entries()) {
		const chunkBytes = await readChunkBytes(
			radBundle,
			rootBytes,
			rootInfo,
			chunkMeta,
			index,
		);
		const parsedChunk = parseRadChunk(chunkBytes);
		if (!fullData.splatEncoding && parsedChunk.meta.splatEncoding) {
			fullData.splatEncoding = parsedChunk.meta.splatEncoding;
		}
		decodeRadChunkIntoFullData(parsedChunk, fullData);
	}
	return copyLeafPackedData(fullData);
}
