export const WEBM_VIDEO_CODEC_CANDIDATES = [
	{
		codec: "vp9",
		fullCodecString: "vp09.00.10.08",
	},
	{
		codec: "vp8",
		fullCodecString: null,
	},
];

export function normalizeVideoFps(fps) {
	return Math.max(1, Number(fps) || 24);
}

export function estimateVideoBitrate(width, height, fps) {
	return Math.max(
		1_000_000,
		Math.round(
			Math.max(1, Number(width) || 0) *
				Math.max(1, Number(height) || 0) *
				normalizeVideoFps(fps) *
				0.12,
		),
	);
}

export function getVideoFrameTiming(frameIndex, fps) {
	const safeFps = normalizeVideoFps(fps);
	const safeFrameIndex = Math.max(0, Math.round(Number(frameIndex) || 0));
	return {
		timestampSeconds: safeFrameIndex / safeFps,
		durationSeconds: 1 / safeFps,
	};
}

export function shouldEncodeKeyFrame(frameIndex, fps) {
	const safeFps = normalizeVideoFps(fps);
	const interval = Math.max(1, Math.round(safeFps * 2));
	return frameIndex === 0 || frameIndex % interval === 0;
}

export async function resolveWebmVideoCodec({
	width,
	height,
	fps = 24,
	canEncodeVideo,
	candidates = WEBM_VIDEO_CODEC_CANDIDATES,
}) {
	if (typeof canEncodeVideo !== "function") {
		return null;
	}
	const bitrate = estimateVideoBitrate(width, height, fps);
	for (const candidate of candidates) {
		const options = {
			width,
			height,
			bitrate,
			latencyMode: "quality",
			alpha: "discard",
		};
		if (candidate.fullCodecString) {
			options.fullCodecString = candidate.fullCodecString;
		}
		const supported = await canEncodeVideo(candidate.codec, options).catch(
			() => false,
		);
		if (supported) {
			return {
				...candidate,
				bitrate,
			};
		}
	}
	return null;
}
