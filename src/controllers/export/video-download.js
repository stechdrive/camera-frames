import { throwIfExportAborted } from "./cancel.js";

const WEBM_MIME_CANDIDATES = [
	"video/webm;codecs=vp9",
	"video/webm;codecs=vp8",
	"video/webm",
];

function resolveWebmMimeType() {
	if (typeof MediaRecorder === "undefined") {
		return "";
	}
	return (
		WEBM_MIME_CANDIDATES.find((candidate) =>
			MediaRecorder.isTypeSupported(candidate),
		) ?? ""
	);
}

function wait(durationMs) {
	return new Promise((resolve) => {
		setTimeout(resolve, Math.max(0, durationMs));
	});
}

function waitForRecorderEvent(recorder, eventName) {
	return new Promise((resolve, reject) => {
		const cleanup = () => {
			recorder.removeEventListener(eventName, handleEvent);
			recorder.removeEventListener("error", handleError);
		};
		const handleEvent = () => {
			cleanup();
			resolve();
		};
		const handleError = () => {
			cleanup();
			reject(recorder.error ?? new Error("Video recording failed."));
		};
		recorder.addEventListener(eventName, handleEvent, { once: true });
		recorder.addEventListener("error", handleError, { once: true });
	});
}

export function isWebmVideoExportSupported() {
	return Boolean(
		typeof document !== "undefined" &&
			typeof MediaRecorder !== "undefined" &&
			typeof HTMLCanvasElement !== "undefined" &&
			HTMLCanvasElement.prototype.captureStream &&
			resolveWebmMimeType(),
	);
}

export async function createWebmFromFrameRenderer(
	renderFrames,
	{ fps = 24, mimeType = resolveWebmMimeType(), abortSignal = null } = {},
) {
	if (!isWebmVideoExportSupported()) {
		throw new Error("WebM video export is not supported in this browser.");
	}
	throwIfExportAborted(abortSignal);
	const frameDurationMs = 1000 / Math.max(1, Number(fps) || 24);
	const videoCanvas = document.createElement("canvas");
	let context = null;
	let stream = null;
	let videoTrack = null;
	let recorder = null;
	const chunks = [];

	const startRecorder = (canvas) => {
		videoCanvas.width = canvas.width;
		videoCanvas.height = canvas.height;
		context = videoCanvas.getContext("2d");
		if (!context) {
			throw new Error("Failed to acquire the video canvas context.");
		}
		stream = videoCanvas.captureStream(0);
		videoTrack = stream.getVideoTracks()[0] ?? null;
		if (typeof videoTrack?.requestFrame !== "function") {
			for (const track of stream.getTracks()) {
				track.stop();
			}
			stream = videoCanvas.captureStream(Math.max(1, Number(fps) || 24));
			videoTrack = stream.getVideoTracks()[0] ?? null;
		}
		recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
		recorder.ondataavailable = (event) => {
			if (event.data?.size > 0) {
				chunks.push(event.data);
			}
		};
		recorder.start();
	};

	const pauseRecorder = async () => {
		if (recorder?.state !== "recording") {
			return;
		}
		const paused = waitForRecorderEvent(recorder, "pause");
		recorder.pause();
		await paused;
	};

	const resumeRecorder = async () => {
		if (recorder?.state !== "paused") {
			return;
		}
		const resumed = waitForRecorderEvent(recorder, "resume");
		recorder.resume();
		await resumed;
	};

	const stopRecorder = async () => {
		if (recorder && recorder.state !== "inactive") {
			const stopped = new Promise((resolve) => {
				recorder.onstop = resolve;
				recorder.onerror = resolve;
			});
			recorder.stop();
			await stopped;
		}
		if (stream) {
			for (const track of stream.getTracks()) {
				track.stop();
			}
		}
	};

	const drawFrame = async (canvas) => {
		throwIfExportAborted(abortSignal);
		if (!recorder) {
			startRecorder(canvas);
		} else {
			await resumeRecorder();
		}
		context.clearRect(0, 0, videoCanvas.width, videoCanvas.height);
		context.drawImage(canvas, 0, 0, videoCanvas.width, videoCanvas.height);
		videoTrack?.requestFrame?.();
		await wait(frameDurationMs);
		throwIfExportAborted(abortSignal);
		await pauseRecorder();
	};

	try {
		await renderFrames(drawFrame);
		throwIfExportAborted(abortSignal);
		if (!recorder) {
			throw new Error("Video export requires at least one frame.");
		}

		const stopped = new Promise((resolve, reject) => {
			recorder.onerror = () => {
				reject(recorder.error ?? new Error("Video recording failed."));
			};
			recorder.onstop = resolve;
		});
		recorder.stop();
		await stopped;
		if (stream) {
			for (const track of stream.getTracks()) {
				track.stop();
			}
		}
		return new Blob(chunks, { type: mimeType || "video/webm" });
	} catch (error) {
		await stopRecorder();
		throw error;
	}
}

export async function createWebmFromCanvases(
	canvases,
	{ fps = 24, mimeType = resolveWebmMimeType(), abortSignal = null } = {},
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
		{ fps, mimeType, abortSignal },
	);
}
