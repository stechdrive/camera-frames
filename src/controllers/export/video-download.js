import { throwIfExportAborted } from "./cancel.js";

const WEBM_ENCODER_CANDIDATES = [
	{
		codec: "vp8",
		codecId: "V_VP8",
		mimeType: "video/webm;codecs=vp8",
	},
	{
		codec: "vp09.00.10.08",
		codecId: "V_VP9",
		mimeType: "video/webm;codecs=vp9",
	},
];
const WEBM_TIMECODE_SCALE_NS = 1_000_000;
const WEBM_CLUSTER_DURATION_MS = 30_000;
const EBML_ID = {
	EBML: [0x1a, 0x45, 0xdf, 0xa3],
	EBML_VERSION: [0x42, 0x86],
	EBML_READ_VERSION: [0x42, 0xf7],
	EBML_MAX_ID_LENGTH: [0x42, 0xf2],
	EBML_MAX_SIZE_LENGTH: [0x42, 0xf3],
	DOC_TYPE: [0x42, 0x82],
	DOC_TYPE_VERSION: [0x42, 0x87],
	DOC_TYPE_READ_VERSION: [0x42, 0x85],
	SEGMENT: [0x18, 0x53, 0x80, 0x67],
	INFO: [0x15, 0x49, 0xa9, 0x66],
	TIMECODE_SCALE: [0x2a, 0xd7, 0xb1],
	DURATION: [0x44, 0x89],
	MUXING_APP: [0x4d, 0x80],
	WRITING_APP: [0x57, 0x41],
	TRACKS: [0x16, 0x54, 0xae, 0x6b],
	TRACK_ENTRY: [0xae],
	TRACK_NUMBER: [0xd7],
	TRACK_UID: [0x73, 0xc5],
	TRACK_TYPE: [0x83],
	DEFAULT_DURATION: [0x23, 0xe3, 0x83],
	CODEC_ID: [0x86],
	VIDEO: [0xe0],
	PIXEL_WIDTH: [0xb0],
	PIXEL_HEIGHT: [0xba],
	CLUSTER: [0x1f, 0x43, 0xb6, 0x75],
	TIMECODE: [0xe7],
	SIMPLE_BLOCK: [0xa3],
};

function toBytes(parts) {
	const totalLength = parts.reduce((sum, part) => sum + part.length, 0);
	const bytes = new Uint8Array(totalLength);
	let offset = 0;
	for (const part of parts) {
		bytes.set(part, offset);
		offset += part.length;
	}
	return bytes;
}

function asciiBytes(value) {
	return new TextEncoder().encode(String(value));
}

function encodeEbmlSize(size) {
	const numericSize = Number(size);
	if (!Number.isFinite(numericSize) || numericSize < 0) {
		throw new Error("Invalid WebM element size.");
	}
	for (let length = 1; length <= 8; length += 1) {
		const max = 2 ** (7 * length) - 2;
		if (numericSize <= max) {
			const bytes = new Uint8Array(length);
			let value = numericSize;
			for (let index = length - 1; index >= 0; index -= 1) {
				bytes[index] = value % 256;
				value = Math.floor(value / 256);
			}
			bytes[0] |= 1 << (8 - length);
			return bytes;
		}
	}
	throw new Error("WebM element is too large.");
}

function encodeUnsignedInteger(value) {
	const numericValue = Math.max(0, Math.round(Number(value) || 0));
	const bytes = [];
	let remaining = numericValue;
	do {
		bytes.unshift(remaining % 256);
		remaining = Math.floor(remaining / 256);
	} while (remaining > 0);
	return new Uint8Array(bytes);
}

function encodeFloat64(value) {
	const bytes = new Uint8Array(8);
	new DataView(bytes.buffer).setFloat64(0, Number(value) || 0, false);
	return bytes;
}

function element(id, data) {
	const dataBytes = data instanceof Uint8Array ? data : toBytes(data);
	return toBytes([
		new Uint8Array(id),
		encodeEbmlSize(dataBytes.length),
		dataBytes,
	]);
}

function unsignedElement(id, value) {
	return element(id, encodeUnsignedInteger(value));
}

function stringElement(id, value) {
	return element(id, asciiBytes(value));
}

function floatElement(id, value) {
	return element(id, encodeFloat64(value));
}

function createSimpleBlock(chunk, clusterTimecodeMs) {
	const relativeTimecode = Math.round(chunk.timecodeMs - clusterTimecodeMs);
	if (relativeTimecode < -32768 || relativeTimecode > 32767) {
		throw new Error("WebM cluster timecode range exceeded.");
	}
	const header = new Uint8Array(4);
	header[0] = 0x81;
	new DataView(header.buffer).setInt16(1, relativeTimecode, false);
	header[3] = chunk.type === "key" ? 0x80 : 0x00;
	return element(EBML_ID.SIMPLE_BLOCK, toBytes([header, chunk.data]));
}

function createCluster(chunks, clusterTimecodeMs) {
	return element(EBML_ID.CLUSTER, [
		unsignedElement(EBML_ID.TIMECODE, clusterTimecodeMs),
		...chunks.map((chunk) => createSimpleBlock(chunk, clusterTimecodeMs)),
	]);
}

function groupChunksByCluster(chunks) {
	const clusters = [];
	let current = null;
	for (const chunk of chunks) {
		const clusterTimecodeMs =
			Math.floor(chunk.timecodeMs / WEBM_CLUSTER_DURATION_MS) *
			WEBM_CLUSTER_DURATION_MS;
		if (!current || current.timecodeMs !== clusterTimecodeMs) {
			current = { timecodeMs: clusterTimecodeMs, chunks: [] };
			clusters.push(current);
		}
		current.chunks.push(chunk);
	}
	return clusters;
}

function buildEbmlHeader() {
	return element(EBML_ID.EBML, [
		unsignedElement(EBML_ID.EBML_VERSION, 1),
		unsignedElement(EBML_ID.EBML_READ_VERSION, 1),
		unsignedElement(EBML_ID.EBML_MAX_ID_LENGTH, 4),
		unsignedElement(EBML_ID.EBML_MAX_SIZE_LENGTH, 8),
		stringElement(EBML_ID.DOC_TYPE, "webm"),
		unsignedElement(EBML_ID.DOC_TYPE_VERSION, 4),
		unsignedElement(EBML_ID.DOC_TYPE_READ_VERSION, 2),
	]);
}

function buildSegment({ chunks, codecId, width, height, fps, durationMs }) {
	const frameDurationNs = Math.max(1, Math.round(1_000_000_000 / fps));
	const info = element(EBML_ID.INFO, [
		unsignedElement(EBML_ID.TIMECODE_SCALE, WEBM_TIMECODE_SCALE_NS),
		floatElement(EBML_ID.DURATION, durationMs),
		stringElement(EBML_ID.MUXING_APP, "CAMERA_FRAMES"),
		stringElement(EBML_ID.WRITING_APP, "CAMERA_FRAMES"),
	]);
	const tracks = element(EBML_ID.TRACKS, [
		element(EBML_ID.TRACK_ENTRY, [
			unsignedElement(EBML_ID.TRACK_NUMBER, 1),
			unsignedElement(EBML_ID.TRACK_UID, 1),
			unsignedElement(EBML_ID.TRACK_TYPE, 1),
			unsignedElement(EBML_ID.DEFAULT_DURATION, frameDurationNs),
			stringElement(EBML_ID.CODEC_ID, codecId),
			element(EBML_ID.VIDEO, [
				unsignedElement(EBML_ID.PIXEL_WIDTH, width),
				unsignedElement(EBML_ID.PIXEL_HEIGHT, height),
			]),
		]),
	]);
	const clusters = groupChunksByCluster(chunks).map((cluster) =>
		createCluster(cluster.chunks, cluster.timecodeMs),
	);
	return element(EBML_ID.SEGMENT, [info, tracks, ...clusters]);
}

export function createWebmBlobFromEncodedChunks({
	chunks,
	codecId = "V_VP8",
	width,
	height,
	fps = 24,
	mimeType = "video/webm;codecs=vp8",
}) {
	const safeChunks = [...(Array.isArray(chunks) ? chunks : [])].sort(
		(left, right) => left.timestamp - right.timestamp,
	);
	if (safeChunks.length === 0) {
		throw new Error("Video export requires at least one frame.");
	}
	const safeFps = Math.max(1, Number(fps) || 24);
	const normalizedChunks = safeChunks.map((chunk, index) => ({
		data: chunk.data,
		type: chunk.type,
		timestamp: chunk.timestamp,
		timecodeMs: Math.round((Number(chunk.timestamp) || 0) / 1000),
		index,
	}));
	const durationMs = (normalizedChunks.length / safeFps) * 1000;
	return new Blob(
		[
			buildEbmlHeader(),
			buildSegment({
				chunks: normalizedChunks,
				codecId,
				width,
				height,
				fps: safeFps,
				durationMs,
			}),
		],
		{ type: mimeType },
	);
}

function estimateBitrate(width, height, fps) {
	return Math.max(1_000_000, Math.round(width * height * fps * 0.12));
}

async function resolveEncoderConfig({ width, height, fps }) {
	for (const candidate of WEBM_ENCODER_CANDIDATES) {
		const config = {
			codec: candidate.codec,
			width,
			height,
			displayWidth: width,
			displayHeight: height,
			bitrate: estimateBitrate(width, height, fps),
			framerate: fps,
			latencyMode: "quality",
		};
		const supported =
			typeof VideoEncoder.isConfigSupported === "function"
				? await VideoEncoder.isConfigSupported(config).catch(() => null)
				: { supported: true, config };
		if (supported?.supported) {
			return {
				...candidate,
				config: supported.config ?? config,
			};
		}
	}
	return null;
}

export function isWebmVideoExportSupported() {
	return Boolean(
		typeof document !== "undefined" &&
			typeof HTMLCanvasElement !== "undefined" &&
			typeof VideoFrame !== "undefined" &&
			typeof VideoEncoder !== "undefined",
	);
}

export async function createWebmFromFrameRenderer(
	renderFrames,
	{ fps = 24, abortSignal = null } = {},
) {
	if (!isWebmVideoExportSupported()) {
		throw new Error(
			"Frame-accurate WebM export is not supported in this browser.",
		);
	}
	throwIfExportAborted(abortSignal);
	const safeFps = Math.max(1, Number(fps) || 24);
	const encodedChunks = [];
	let encoder = null;
	let encoderInfo = null;
	let frameIndex = 0;
	let width = 0;
	let height = 0;
	let encodeError = null;

	const closeEncoder = () => {
		if (encoder?.state !== "closed") {
			encoder?.close?.();
		}
		encoder = null;
	};

	const ensureEncoder = async (canvas) => {
		if (encoder) {
			if (canvas.width !== width || canvas.height !== height) {
				throw new Error(
					"Video export requires all frames to have the same size.",
				);
			}
			return;
		}
		width = canvas.width;
		height = canvas.height;
		encoderInfo = await resolveEncoderConfig({ width, height, fps: safeFps });
		if (!encoderInfo) {
			throw new Error(
				"WebM VP8/VP9 encoding is not supported in this browser.",
			);
		}
		encoder = new VideoEncoder({
			output: (chunk) => {
				const data = new Uint8Array(chunk.byteLength);
				chunk.copyTo(data);
				encodedChunks.push({
					data,
					timestamp: chunk.timestamp,
					type: chunk.type,
				});
			},
			error: (error) => {
				encodeError = error;
			},
		});
		encoder.configure(encoderInfo.config);
	};

	const drawFrame = async (canvas) => {
		throwIfExportAborted(abortSignal);
		await ensureEncoder(canvas);
		const timestamp = Math.round((frameIndex * 1_000_000) / safeFps);
		const duration = Math.round(1_000_000 / safeFps);
		const videoFrame = new VideoFrame(canvas, { timestamp, duration });
		try {
			encoder.encode(videoFrame, {
				keyFrame:
					frameIndex === 0 || frameIndex % Math.round(safeFps * 2) === 0,
			});
		} finally {
			videoFrame.close();
		}
		frameIndex += 1;
		if (encoder.encodeQueueSize > 8) {
			await encoder.flush();
		}
		if (encodeError) {
			throw encodeError;
		}
		throwIfExportAborted(abortSignal);
	};

	try {
		await renderFrames(drawFrame);
		throwIfExportAborted(abortSignal);
		if (!encoder || frameIndex === 0) {
			throw new Error("Video export requires at least one frame.");
		}
		await encoder.flush();
		if (encodeError) {
			throw encodeError;
		}
		return createWebmBlobFromEncodedChunks({
			chunks: encodedChunks,
			codecId: encoderInfo.codecId,
			width,
			height,
			fps: safeFps,
			mimeType: encoderInfo.mimeType,
		});
	} finally {
		closeEncoder();
	}
}

export async function createWebmFromCanvases(
	canvases,
	{ fps = 24, abortSignal = null } = {},
) {
	if (!Array.isArray(canvases) || canvases.length === 0) {
		throw new Error("Video export requires at least one frame.");
	}
	return createWebmFromFrameRenderer(
		async (drawFrame) => {
			for (const canvas of canvases) {
				await drawFrame(canvas);
			}
		},
		{ fps, abortSignal },
	);
}
