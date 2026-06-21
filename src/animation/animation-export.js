import { getActiveAnimationClip } from "./animation-model.js";

export const ANIMATION_EXPORT_MODE_CURRENT = "current";
export const ANIMATION_EXPORT_MODE_SEQUENCE = "sequence";
export const ANIMATION_EXPORT_MODE_VIDEO = "video";
export const ANIMATION_EXPORT_FRAME_SOURCE_DURATION = "duration";
export const ANIMATION_EXPORT_FRAME_SOURCE_KEYFRAMES = "keyframes";

const ANIMATION_EXPORT_MODES = new Set([
	ANIMATION_EXPORT_MODE_CURRENT,
	ANIMATION_EXPORT_MODE_SEQUENCE,
	ANIMATION_EXPORT_MODE_VIDEO,
]);

const ANIMATION_EXPORT_FRAME_SOURCES = new Set([
	ANIMATION_EXPORT_FRAME_SOURCE_DURATION,
	ANIMATION_EXPORT_FRAME_SOURCE_KEYFRAMES,
]);

function toInteger(value, fallback) {
	const numericValue = Number(value);
	return Number.isFinite(numericValue) ? Math.round(numericValue) : fallback;
}

function getClipStartFrame(clip) {
	return toInteger(clip?.playbackStartFrame, toInteger(clip?.startFrame, 1));
}

function getClipEndFrame(clip) {
	const startFrame = toInteger(clip?.startFrame, 1);
	const durationFrames = Math.max(1, toInteger(clip?.durationFrames, 1));
	const fallbackEndFrame = startFrame + durationFrames - 1;
	return toInteger(clip?.playbackEndFrame, fallbackEndFrame);
}

export function sanitizeAnimationExportMode(value) {
	return ANIMATION_EXPORT_MODES.has(value)
		? value
		: ANIMATION_EXPORT_MODE_CURRENT;
}

export function sanitizeAnimationExportFrameSource(value) {
	return ANIMATION_EXPORT_FRAME_SOURCES.has(value)
		? value
		: ANIMATION_EXPORT_FRAME_SOURCE_DURATION;
}

export function collectAnimationKeyFrames(animation = null) {
	const clip = getActiveAnimationClip(animation);
	const startFrame = getClipStartFrame(clip);
	const endFrame = Math.max(startFrame, getClipEndFrame(clip));
	const frames = new Set();

	for (const binding of clip.bindings ?? []) {
		for (const track of binding.tracks ?? []) {
			for (const key of track.keys ?? []) {
				const frame = toInteger(key?.frame, Number.NaN);
				if (!Number.isFinite(frame) || frame < startFrame || frame > endFrame) {
					continue;
				}
				frames.add(frame);
			}
		}
	}

	return [...frames].sort((left, right) => left - right);
}

export function resolveAnimationExportFrames(
	animation = null,
	{ frameSource = ANIMATION_EXPORT_FRAME_SOURCE_DURATION } = {},
) {
	const clip = getActiveAnimationClip(animation);
	const source = sanitizeAnimationExportFrameSource(frameSource);
	if (source === ANIMATION_EXPORT_FRAME_SOURCE_KEYFRAMES) {
		return collectAnimationKeyFrames(animation);
	}

	const startFrame = getClipStartFrame(clip);
	const endFrame = Math.max(startFrame, getClipEndFrame(clip));
	const frames = [];
	for (let frame = startFrame; frame <= endFrame; frame += 1) {
		frames.push(frame);
	}
	return frames;
}
