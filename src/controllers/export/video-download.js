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
	{ fps = 24, mimeType = resolveWebmMimeType() } = {},
) {
	if (!isWebmVideoExportSupported()) {
		throw new Error("WebM video export is not supported in this browser.");
	}
	const frameDurationMs = 1000 / Math.max(1, Number(fps) || 24);
	const videoCanvas = document.createElement("canvas");
	let context = null;
	let stream = null;
	let recorder = null;
	const chunks = [];

	const startRecorder = (canvas) => {
		videoCanvas.width = canvas.width;
		videoCanvas.height = canvas.height;
		context = videoCanvas.getContext("2d");
		if (!context) {
			throw new Error("Failed to acquire the video canvas context.");
		}
		stream = videoCanvas.captureStream(Math.max(1, Number(fps) || 24));
		recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
		recorder.ondataavailable = (event) => {
			if (event.data?.size > 0) {
				chunks.push(event.data);
			}
		};
		recorder.start();
	};

	const drawFrame = async (canvas) => {
		if (!recorder) {
			startRecorder(canvas);
		}
		context.clearRect(0, 0, videoCanvas.width, videoCanvas.height);
		context.drawImage(canvas, 0, 0, videoCanvas.width, videoCanvas.height);
		await wait(frameDurationMs);
	};

	await renderFrames(drawFrame);
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
	for (const track of stream.getTracks()) {
		track.stop();
	}
	return new Blob(chunks, { type: mimeType || "video/webm" });
}

export async function createWebmFromCanvases(
	canvases,
	{ fps = 24, mimeType = resolveWebmMimeType() } = {},
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
		{ fps, mimeType },
	);
}
