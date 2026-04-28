const textEncoder = new TextEncoder();

function align8(value: number): number {
	return (value + 7) & ~7;
}

function writePaddedJson(meta: unknown): Uint8Array {
	const bytes = textEncoder.encode(`${JSON.stringify(meta)}\n`);
	const padded = new Uint8Array(align8(bytes.byteLength));
	padded.set(bytes);
	return padded;
}

function concatBytes(parts: Uint8Array[]): Uint8Array {
	const total = parts.reduce((sum, part) => sum + part.byteLength, 0);
	const result = new Uint8Array(total);
	let offset = 0;
	for (const part of parts) {
		result.set(part, offset);
		offset += part.byteLength;
	}
	return result;
}

function u32le(value: number): Uint8Array {
	const bytes = new Uint8Array(4);
	new DataView(bytes.buffer).setUint32(0, value, true);
	return bytes;
}

function u64le(value: number): Uint8Array {
	const bytes = new Uint8Array(8);
	new DataView(bytes.buffer).setBigUint64(0, BigInt(value), true);
	return bytes;
}

function centerBytes(packedArray: Uint32Array, numSplats: number): Uint8Array {
	const bytes = new Uint8Array(numSplats * 6);
	for (let byteIndex = 0; byteIndex < 2; byteIndex += 1) {
		for (let component = 0; component < 3; component += 1) {
			for (let i = 0; i < numSplats; i += 1) {
				const base = i * 4;
				const half =
					component === 0
						? packedArray[base + 1] & 0xffff
						: component === 1
							? packedArray[base + 1] >>> 16
							: packedArray[base + 2] & 0xffff;
				bytes[byteIndex * numSplats * 3 + component * numSplats + i] =
					(half >>> (byteIndex * 8)) & 0xff;
			}
		}
	}
	return bytes;
}

function componentMajorBytes(
	packedArray: Uint32Array,
	numSplats: number,
	wordOffset: number,
	shifts: number[],
): Uint8Array {
	const bytes = new Uint8Array(numSplats * shifts.length);
	for (const [component, shift] of shifts.entries()) {
		for (let i = 0; i < numSplats; i += 1) {
			bytes[component * numSplats + i] =
				(packedArray[i * 4 + wordOffset] >>> shift) & 0xff;
		}
	}
	return bytes;
}

function orientationBytes(
	packedArray: Uint32Array,
	numSplats: number,
): Uint8Array {
	const bytes = new Uint8Array(numSplats * 3);
	for (let i = 0; i < numSplats; i += 1) {
		const base = i * 4;
		bytes[i * 3] = (packedArray[base + 2] >>> 16) & 0xff;
		bytes[i * 3 + 1] = (packedArray[base + 2] >>> 24) & 0xff;
		bytes[i * 3 + 2] = (packedArray[base + 3] >>> 24) & 0xff;
	}
	return bytes;
}

function childCountBytes(childCounts: Uint16Array): Uint8Array {
	const bytes = new Uint8Array(childCounts.length * 2);
	const view = new DataView(bytes.buffer);
	for (let i = 0; i < childCounts.length; i += 1) {
		view.setUint16(i * 2, childCounts[i], true);
	}
	return bytes;
}

function childStartBytes(numSplats: number): Uint8Array {
	const bytes = new Uint8Array(numSplats * 4);
	const view = new DataView(bytes.buffer);
	for (let i = 0; i < numSplats; i += 1) {
		view.setUint32(i * 4, 0, true);
	}
	return bytes;
}

function signedByte(value: number): number {
	return value > 127 ? value - 256 : value;
}

function sh2Bytes(sh2: Uint32Array, numSplats: number): Uint8Array {
	const bytes = new Uint8Array(numSplats * 15);
	for (let component = 0; component < 15; component += 1) {
		for (let i = 0; i < numSplats; i += 1) {
			const word = sh2[i * 4 + Math.floor(component / 4)];
			const raw = (word >>> ((component % 4) * 8)) & 0xff;
			bytes[component * numSplats + i] = signedByte(raw) & 0xff;
		}
	}
	return bytes;
}

function buildChunk({
	packedArray,
	numSplats,
	extra = {},
	splatEncoding = {},
	childCounts = null,
}: {
	packedArray: Uint32Array;
	numSplats: number;
	extra?: { sh2?: Uint32Array };
	splatEncoding?: Record<string, unknown>;
	childCounts?: Uint16Array | null;
}): Uint8Array {
	const rawProperties = [
		{
			meta: { property: "center", encoding: "f16_lebytes" },
			bytes: centerBytes(packedArray, numSplats),
		},
		{
			meta: {
				property: "alpha",
				encoding: "r8",
				min: 0,
				max: childCounts ? 2 : 1,
			},
			bytes: componentMajorBytes(packedArray, numSplats, 0, [24]),
		},
		{
			meta: { property: "rgb", encoding: "r8", min: 0, max: 1 },
			bytes: componentMajorBytes(packedArray, numSplats, 0, [0, 8, 16]),
		},
		{
			meta: { property: "scales", encoding: "ln_0r8", min: -12, max: 9 },
			bytes: componentMajorBytes(packedArray, numSplats, 3, [0, 8, 16]),
		},
		{
			meta: { property: "orientation", encoding: "oct88r8" },
			bytes: orientationBytes(packedArray, numSplats),
		},
	];
	if (extra.sh2) {
		rawProperties.push({
			meta: { property: "sh2", encoding: "s8", min: -1, max: 1 },
			bytes: sh2Bytes(extra.sh2, numSplats),
		});
	}
	if (childCounts) {
		rawProperties.push(
			{
				meta: { property: "child_count", encoding: "u16" },
				bytes: childCountBytes(childCounts),
			},
			{
				meta: { property: "child_start", encoding: "u32" },
				bytes: childStartBytes(numSplats),
			},
		);
	}
	let payloadOffset = 0;
	const payloadParts: Uint8Array[] = [];
	const properties = rawProperties.map((property) => {
		const offset = payloadOffset;
		const padded = new Uint8Array(align8(property.bytes.byteLength));
		padded.set(property.bytes);
		payloadParts.push(padded);
		payloadOffset += padded.byteLength;
		return {
			...property.meta,
			offset,
			bytes: property.bytes.byteLength,
		};
	});
	const meta = {
		version: 1,
		base: 0,
		count: numSplats,
		payloadBytes: payloadOffset,
		maxSh: extra.sh2 ? 2 : 0,
		splatEncoding,
		properties,
		...(childCounts ? { lodTree: true } : {}),
	};
	const metaBytes = writePaddedJson(meta);
	return concatBytes([
		textEncoder.encode("RADC"),
		u32le(textEncoder.encode(`${JSON.stringify(meta)}\n`).byteLength),
		metaBytes,
		u64le(payloadOffset),
		...payloadParts,
	]);
}

export function createSyntheticRadBundle({
	packedArray,
	numSplats,
	extra = {},
	splatEncoding = {},
	childCounts = null,
	rootName = "fixture-lod.rad",
	chunkName = "fixture-lod-0.radc",
}: {
	packedArray: Uint32Array;
	numSplats: number;
	extra?: { sh2?: Uint32Array };
	splatEncoding?: Record<string, unknown>;
	childCounts?: Uint16Array | null;
	rootName?: string;
	chunkName?: string;
}) {
	const chunkBytes = buildChunk({
		packedArray,
		numSplats,
		extra,
		splatEncoding,
		childCounts,
	});
	const rootMeta = {
		version: 1,
		type: "gsplat",
		count: numSplats,
		maxSh: extra.sh2 ? 2 : 0,
		chunkSize: numSplats,
		allChunkBytes: chunkBytes.byteLength,
		chunks: [{ offset: 0, bytes: chunkBytes.byteLength, filename: chunkName }],
		splatEncoding,
		...(childCounts ? { lodTree: true } : {}),
	};
	const rootMetaBytes = writePaddedJson(rootMeta);
	const rootBytes = concatBytes([
		textEncoder.encode("RAD0"),
		u32le(textEncoder.encode(`${JSON.stringify(rootMeta)}\n`).byteLength),
		rootMetaBytes,
	]);
	return {
		kind: "spark-rad-bundle",
		version: 1,
		root: {
			name: rootName,
			bytes: rootBytes,
		},
		chunks: [
			{
				name: chunkName,
				bytes: chunkBytes,
			},
		],
		sourceFingerprint: {
			numSplats,
		},
		bounds: null,
		sparkVersion: "2.0.0",
		build: {
			mode: "quality",
			chunked: true,
		},
	};
}
