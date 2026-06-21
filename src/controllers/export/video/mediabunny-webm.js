import {
	BufferTarget,
	CanvasSource,
	Output,
	WebMOutputFormat,
	canEncodeVideo,
} from "mediabunny";
import { throwIfExportAborted } from "../cancel.js";
import {
	estimateVideoBitrate,
	getVideoFrameTiming,
	normalizeVideoFps,
	resolveWebmVideoCodec,
	shouldEncodeKeyFrame,
} from "./encoding-config.js";

const VIDEO_EXPORT_LOCK_NAME = "camera-frames-video-export";

function isOutputActive(output) {
	return output && output.state !== "canceled" && output.state !== "finalized";
}

async function cancelOutput(output) {
	if (!isOutputActive(output)) {
		return;
	}
	await output.cancel().catch(() => {});
}

async function withVideoExportLock(task) {
	const locks = globalThis.navigator?.locks;
	if (typeof locks?.request === "function") {
		return locks.request(VIDEO_EXPORT_LOCK_NAME, task);
	}
	return task();
}

function createVideoCanvas(width, height) {
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const context = canvas.getContext("2d", { alpha: false });
	if (!context) {
		throw new Error("Failed to acquire the video canvas context.");
	}
	return { canvas, context };
}

function copyFrameToVideoCanvas(context, sourceCanvas, width, height) {
	context.clearRect(0, 0, width, height);
	context.drawImage(sourceCanvas, 0, 0, width, height);
}

export function isMediabunnyWebmExportSupported() {
	return Boolean(
		typeof document !== "undefined" &&
			typeof HTMLCanvasElement !== "undefined" &&
			typeof VideoFrame !== "undefined" &&
			typeof VideoEncoder !== "undefined",
	);
}

export async function createMediabunnyWebmFromFrameRenderer(
	renderFrames,
	{ fps = 24, abortSignal = null } = {},
) {
	if (!isMediabunnyWebmExportSupported()) {
		throw new Error(
			"Frame-accurate WebM export is not supported in this browser.",
		);
	}

	throwIfExportAborted(abortSignal);

	const safeFps = normalizeVideoFps(fps);
	let frameIndex = 0;
	let width = 0;
	let height = 0;
	let videoCanvas = null;
	let videoContext = null;
	let output = null;
	let target = null;
	let source = null;
	let mimeType = "video/webm";

	const ensureOutput = async (sourceCanvas) => {
		if (output) {
			if (sourceCanvas.width !== width || sourceCanvas.height !== height) {
				throw new Error(
					"Video export requires all frames to have the same size.",
				);
			}
			return;
		}

		width = sourceCanvas.width;
		height = sourceCanvas.height;
		const codecInfo = await resolveWebmVideoCodec({
			width,
			height,
			fps: safeFps,
			canEncodeVideo,
		});
		if (!codecInfo) {
			throw new Error(
				"WebM VP9/VP8 encoding is not supported in this browser.",
			);
		}

		const canvasState = createVideoCanvas(width, height);
		videoCanvas = canvasState.canvas;
		videoContext = canvasState.context;
		target = new BufferTarget();
		output = new Output({
			format: new WebMOutputFormat({ minimumClusterDuration: 1 }),
			target,
		});
		source = new CanvasSource(videoCanvas, {
			codec: codecInfo.codec,
			bitrate:
				codecInfo.bitrate ?? estimateVideoBitrate(width, height, safeFps),
			keyFrameInterval: 2,
			latencyMode: "quality",
			alpha: "discard",
			...(codecInfo.fullCodecString
				? { fullCodecString: codecInfo.fullCodecString }
				: {}),
		});
		output.addVideoTrack(source, { frameRate: safeFps });
		await output.start();
		mimeType = output.format.mimeType || mimeType;
	};

	const drawFrame = async (sourceCanvas) => {
		throwIfExportAborted(abortSignal);
		await ensureOutput(sourceCanvas);
		copyFrameToVideoCanvas(videoContext, sourceCanvas, width, height);
		const timing = getVideoFrameTiming(frameIndex, safeFps);
		await source.add(timing.timestampSeconds, timing.durationSeconds, {
			keyFrame: shouldEncodeKeyFrame(frameIndex, safeFps),
		});
		frameIndex += 1;
		throwIfExportAborted(abortSignal);
	};

	try {
		return await withVideoExportLock(async () => {
			await renderFrames(drawFrame);
			throwIfExportAborted(abortSignal);
			if (!output || !source || frameIndex === 0) {
				throw new Error("Video export requires at least one frame.");
			}
			source.close();
			await output.finalize();
			mimeType = (await output.getMimeType().catch(() => mimeType)) || mimeType;
			if (!target?.buffer) {
				throw new Error("Video export failed to create a WebM file.");
			}
			return new Blob([target.buffer], { type: mimeType });
		});
	} catch (error) {
		await cancelOutput(output);
		throw error;
	}
}
