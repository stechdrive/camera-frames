import initRadEncoder, {
	encode_packed_rad_bundle,
} from "./rad-encoder-wasm/pkg/camera_frames_rad_encoder.js";

let encoderInitPromise = null;

function postProgress(stage, detail = {}) {
	self.postMessage({
		type: "progress",
		progress: {
			stage,
			...detail,
		},
	});
}

async function ensureEncoderReady() {
	if (!encoderInitPromise) {
		encoderInitPromise = initRadEncoder({
			module_or_path: new URL(
				"./rad-encoder-wasm/pkg/camera_frames_rad_encoder_bg.wasm",
				import.meta.url,
			),
		});
	}
	await encoderInitPromise;
}

function isNonEmptyUint32Array(value) {
	return value instanceof Uint32Array && value.length > 0;
}

function normalizeEncoding(value) {
	return value && typeof value === "object" ? value : {};
}

function hasUnsupportedShCodes(extra) {
	if (!extra || typeof extra !== "object") {
		return false;
	}
	return ["sh1Codes", "sh2Codes", "sh3Codes"].some((key) =>
		isNonEmptyUint32Array(extra[key]),
	);
}

function sanitizeBaseName(value) {
	const leaf = String(value ?? "")
		.replace(/\\/g, "/")
		.split("/")
		.filter(Boolean)
		.pop();
	const stem = (leaf || "asset").replace(/\.[^.]+$/, "");
	const sanitized = stem
		.normalize("NFKD")
		.replace(/[^\w.-]+/g, "-")
		.replace(/^-+|-+$/g, "");
	return sanitized || "asset";
}

function selectEncodeSource(input) {
	const lodSplats = input?.lodSplats;
	if (
		lodSplats &&
		isNonEmptyUint32Array(lodSplats.packedArray) &&
		Number.isFinite(lodSplats.numSplats)
	) {
		return {
			kind: "prebaked-lod",
			packedArray: lodSplats.packedArray,
			numSplats: Math.max(0, Math.floor(lodSplats.numSplats)),
			extra: lodSplats.extra ?? {},
			splatEncoding: normalizeEncoding(lodSplats.splatEncoding),
		};
	}
	return {
		kind: "root-packed",
		packedArray: input?.packedArray,
		numSplats: Math.max(0, Math.floor(input?.numSplats ?? 0)),
		extra: input?.extraArrays ?? {},
		splatEncoding: normalizeEncoding(input?.splatEncoding),
	};
}

function cloneTypedExtra(extra) {
	const cloned = {};
	for (const [key, value] of Object.entries(extra ?? {})) {
		cloned[key] =
			ArrayBuffer.isView(value) && typeof value.slice === "function"
				? value.slice()
				: value;
	}
	return cloned;
}

async function createLodSourceFromRoot(input) {
	const packedArray = input?.packedArray;
	const numSplats = Math.max(0, Math.floor(input?.numSplats ?? 0));
	if (!(packedArray instanceof Uint32Array) || numSplats <= 0) {
		throw new Error("RAD bundle encode requires a PackedSplats packedArray.");
	}
	postProgress("build-lod", {
		numSplats,
	});
	const { PackedSplats } = await import("@sparkjsdev/spark");
	const packedSplats = new PackedSplats({
		packedArray,
		numSplats,
		extra: input?.extraArrays ?? {},
		splatEncoding: normalizeEncoding(input?.splatEncoding),
	});
	try {
		await packedSplats.createLodSplats({ quality: Boolean(input?.quality) });
		const lodSplats = packedSplats.lodSplats;
		if (!(lodSplats?.packedArray instanceof Uint32Array)) {
			throw new Error("Spark LoD generation did not return PackedSplats data.");
		}
		return {
			kind: "generated-lod",
			packedArray: lodSplats.packedArray.slice(),
			numSplats: Math.max(
				0,
				Math.floor(lodSplats.getNumSplats?.() ?? lodSplats.numSplats ?? 0),
			),
			extra: cloneTypedExtra(lodSplats.extra),
			splatEncoding: normalizeEncoding(lodSplats.splatEncoding),
		};
	} finally {
		packedSplats.dispose?.();
	}
}

function collectTransfers(result) {
	const transfers = [];
	const rootBuffer = result?.root?.bytes?.buffer;
	if (rootBuffer instanceof ArrayBuffer) {
		transfers.push(rootBuffer);
	}
	for (const chunk of result?.chunks ?? []) {
		if (chunk?.bytes?.buffer instanceof ArrayBuffer) {
			transfers.push(chunk.bytes.buffer);
		}
	}
	return transfers;
}

function serializeError(error) {
	return {
		name: error?.name ?? "Error",
		message: error?.message ?? String(error),
		stack: error?.stack ?? "",
	};
}

async function buildRadBundle(input) {
	postProgress("load-wasm");
	await ensureEncoderReady();

	let source = selectEncodeSource(input);
	if (source.kind === "root-packed") {
		source = await createLodSourceFromRoot(input);
	}
	if (!(source.packedArray instanceof Uint32Array)) {
		throw new Error("RAD bundle encode requires a PackedSplats packedArray.");
	}
	if (source.numSplats <= 0) {
		throw new Error("RAD bundle encode requires numSplats > 0.");
	}
	if (hasUnsupportedShCodes(source.extra)) {
		throw new Error(
			"RAD bundle encoder does not yet support spherical harmonics codebook arrays.",
		);
	}

	const baseName = sanitizeBaseName(input?.fileName ?? "asset");
	const rootName = `${baseName}-lod.rad`;
	const chunkPrefix = `${baseName}-lod-`;
	const lodTree = isNonEmptyUint32Array(source.extra?.lodTree)
		? source.extra.lodTree
		: new Uint32Array();

	const encodeStage =
		source.kind === "prebaked-lod"
			? "encode-prebaked-lod"
			: source.kind === "generated-lod"
				? "encode-generated-lod"
				: "encode-root";
	postProgress(encodeStage, {
		numSplats: source.numSplats,
		hasLodTree: lodTree.length > 0,
	});
	const result = encode_packed_rad_bundle(
		source.packedArray,
		source.numSplats,
		lodTree,
		source.extra ?? {},
		source.splatEncoding,
		rootName,
		chunkPrefix,
		input?.bounds ?? null,
	);
	postProgress("write-chunks", {
		chunks: result?.chunks?.length ?? 0,
	});
	return result;
}

self.onmessage = async (event) => {
	const data = event.data ?? {};
	if (data.type !== "build") {
		return;
	}
	try {
		const result = await buildRadBundle(data.input ?? {});
		self.postMessage(
			{
				type: "result",
				result,
			},
			collectTransfers(result),
		);
	} catch (error) {
		self.postMessage({
			type: "error",
			error: serializeError(error),
		});
	}
};
