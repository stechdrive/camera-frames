export const ANIMATION_DOCUMENT_VERSION = 1;
export const DEFAULT_ANIMATION_CLIP_ID = "clip-main";
export const DEFAULT_ANIMATION_CLIP_NAME = "Timeline";
export const DEFAULT_ANIMATION_FPS = 24;
export const DEFAULT_ANIMATION_START_FRAME = 1;
export const DEFAULT_ANIMATION_DURATION_FRAMES = 144;
export const MIN_ANIMATION_FPS = 1;
export const MAX_ANIMATION_FPS = 120;
export const MIN_ANIMATION_DURATION_FRAMES = 1;
export const ANIMATION_TARGET_SHOT_CAMERA = "shot-camera";
export const ANIMATION_TARGET_SCENE_ASSET = "scene-asset";
export const ANIMATION_INTERPOLATION_HOLD = "hold";
export const ANIMATION_INTERPOLATION_LINEAR = "linear";

const SHOT_CAMERA_TRACK_PATHS = new Set([
	"transform.position.x",
	"transform.position.y",
	"transform.position.z",
	"transform.rotation.yawDeg",
	"transform.rotation.pitchDeg",
	"transform.rotation.rollDeg",
	"lens.baseFovX",
	"lens.shiftX",
	"lens.shiftY",
]);

const SCENE_ASSET_TRACK_PATHS = new Set([
	"transform.position.x",
	"transform.position.y",
	"transform.position.z",
	"transform.rotation.xDeg",
	"transform.rotation.yDeg",
	"transform.rotation.zDeg",
	"transform.worldScale",
]);

function isObject(value) {
	return value !== null && typeof value === "object";
}

function clamp(value, min, max) {
	return Math.min(max, Math.max(min, value));
}

function toInteger(value, fallback) {
	const numericValue = Number(value);
	return Number.isFinite(numericValue) ? Math.round(numericValue) : fallback;
}

function sanitizeId(value, fallback) {
	const candidate = String(value ?? "").trim();
	return candidate || fallback;
}

function sanitizeInterpolation(
	value,
	fallback = ANIMATION_INTERPOLATION_LINEAR,
) {
	return value === ANIMATION_INTERPOLATION_HOLD ||
		value === ANIMATION_INTERPOLATION_LINEAR
		? value
		: fallback;
}

function sanitizeFps(value) {
	const numericValue = Number(value);
	return Number.isFinite(numericValue)
		? clamp(numericValue, MIN_ANIMATION_FPS, MAX_ANIMATION_FPS)
		: DEFAULT_ANIMATION_FPS;
}

function sanitizeDurationFrames(value) {
	return Math.max(
		MIN_ANIMATION_DURATION_FRAMES,
		toInteger(value, DEFAULT_ANIMATION_DURATION_FRAMES),
	);
}

function getTrackPathSetForTarget(target) {
	if (target?.kind === ANIMATION_TARGET_SHOT_CAMERA) {
		return SHOT_CAMERA_TRACK_PATHS;
	}
	if (target?.kind === ANIMATION_TARGET_SCENE_ASSET) {
		return SCENE_ASSET_TRACK_PATHS;
	}
	return new Set();
}

function sanitizeAnimationTarget(target) {
	const kind =
		target?.kind === ANIMATION_TARGET_SCENE_ASSET
			? ANIMATION_TARGET_SCENE_ASSET
			: target?.kind === ANIMATION_TARGET_SHOT_CAMERA
				? ANIMATION_TARGET_SHOT_CAMERA
				: null;
	const id = String(target?.id ?? "").trim();
	if (!kind || !id) {
		return null;
	}
	return { kind, id };
}

function sanitizeAnimationKey(key) {
	if (!isObject(key) || !Number.isFinite(Number(key.frame))) {
		return null;
	}
	const value = Number(key.value);
	if (!Number.isFinite(value)) {
		return null;
	}
	const interpolation = sanitizeInterpolation(key.interpolation, null);
	const normalized = {
		frame: Math.round(Number(key.frame)),
		value,
	};
	if (interpolation) {
		normalized.interpolation = interpolation;
	}
	return normalized;
}

function sanitizeAnimationTrack(track, target) {
	if (!isObject(track)) {
		return null;
	}
	const path = String(track.path ?? "").trim();
	if (!getTrackPathSetForTarget(target).has(path)) {
		return null;
	}
	const keysByFrame = new Map();
	for (const key of Array.isArray(track.keys) ? track.keys : []) {
		const normalizedKey = sanitizeAnimationKey(key);
		if (normalizedKey) {
			keysByFrame.set(normalizedKey.frame, normalizedKey);
		}
	}
	const keys = Array.from(keysByFrame.values()).sort(
		(left, right) => left.frame - right.frame,
	);
	return {
		path,
		valueType: "number",
		interpolation: sanitizeInterpolation(track.interpolation),
		keys,
	};
}

function sanitizeAnimationBinding(binding, index) {
	if (!isObject(binding)) {
		return null;
	}
	const target = sanitizeAnimationTarget(binding.target);
	if (!target) {
		return null;
	}
	const tracks = (Array.isArray(binding.tracks) ? binding.tracks : [])
		.map((track) => sanitizeAnimationTrack(track, target))
		.filter(Boolean);
	return {
		id: sanitizeId(binding.id, `binding-${index + 1}`),
		target,
		labelCache: String(binding.labelCache ?? ""),
		tracks,
	};
}

function sanitizeClipName(value) {
	const candidate = String(value ?? "")
		.replace(/\s+/g, " ")
		.trim();
	return candidate || DEFAULT_ANIMATION_CLIP_NAME;
}

function sanitizeAnimationClip(clip, index) {
	const fallbackId =
		index === 0 ? DEFAULT_ANIMATION_CLIP_ID : `clip-${index + 1}`;
	const startFrame = toInteger(clip?.startFrame, DEFAULT_ANIMATION_START_FRAME);
	const durationFrames = sanitizeDurationFrames(clip?.durationFrames);
	const endFrame = startFrame + durationFrames - 1;
	const playbackStartFrame = clamp(
		toInteger(clip?.playbackStartFrame, startFrame),
		startFrame,
		endFrame,
	);
	const playbackEndFrame = clamp(
		toInteger(clip?.playbackEndFrame, endFrame),
		playbackStartFrame,
		endFrame,
	);
	const bindings = (Array.isArray(clip?.bindings) ? clip.bindings : [])
		.map((binding, bindingIndex) =>
			sanitizeAnimationBinding(binding, bindingIndex),
		)
		.filter(Boolean);
	return {
		id: sanitizeId(clip?.id, fallbackId),
		name: sanitizeClipName(clip?.name),
		fps: sanitizeFps(clip?.fps),
		startFrame,
		durationFrames,
		playbackStartFrame,
		playbackEndFrame,
		bindings,
	};
}

function dedupeClipIds(clips) {
	const usedIds = new Set();
	return clips.map((clip, index) => {
		let id = clip.id;
		if (!usedIds.has(id)) {
			usedIds.add(id);
			return clip;
		}
		const baseId = id || `clip-${index + 1}`;
		let suffix = 2;
		while (usedIds.has(`${baseId}-${suffix}`)) {
			suffix += 1;
		}
		id = `${baseId}-${suffix}`;
		usedIds.add(id);
		return { ...clip, id };
	});
}

export function createDefaultAnimationClip() {
	return {
		id: DEFAULT_ANIMATION_CLIP_ID,
		name: DEFAULT_ANIMATION_CLIP_NAME,
		fps: DEFAULT_ANIMATION_FPS,
		startFrame: DEFAULT_ANIMATION_START_FRAME,
		durationFrames: DEFAULT_ANIMATION_DURATION_FRAMES,
		playbackStartFrame: DEFAULT_ANIMATION_START_FRAME,
		playbackEndFrame:
			DEFAULT_ANIMATION_START_FRAME + DEFAULT_ANIMATION_DURATION_FRAMES - 1,
		bindings: [],
	};
}

export function createDefaultAnimationDocument() {
	return {
		version: ANIMATION_DOCUMENT_VERSION,
		enabled: true,
		activeClipId: DEFAULT_ANIMATION_CLIP_ID,
		clips: [createDefaultAnimationClip()],
	};
}

export function sanitizeAnimationDocument(animation = null) {
	const rawClips = Array.isArray(animation?.clips) ? animation.clips : [];
	const clips = dedupeClipIds(
		(rawClips.length > 0 ? rawClips : [createDefaultAnimationClip()]).map(
			(clip, index) => sanitizeAnimationClip(clip, index),
		),
	);
	const activeClipId =
		typeof animation?.activeClipId === "string" &&
		clips.some((clip) => clip.id === animation.activeClipId)
			? animation.activeClipId
			: clips[0].id;
	return {
		version: ANIMATION_DOCUMENT_VERSION,
		enabled: true,
		activeClipId,
		clips,
	};
}

export function getActiveAnimationClip(animation = null) {
	const normalized = sanitizeAnimationDocument(animation);
	return (
		normalized.clips.find((clip) => clip.id === normalized.activeClipId) ??
		normalized.clips[0] ??
		createDefaultAnimationClip()
	);
}

export function isAnimationTrackPathAllowed(target, path) {
	return getTrackPathSetForTarget(target).has(path);
}

export function sampleNumberTrack(track, timelineFrame, baseValue = 0) {
	const keys = Array.isArray(track?.keys) ? track.keys : [];
	if (keys.length === 0) {
		return Number(baseValue) || 0;
	}
	const frame = Number(timelineFrame);
	if (!Number.isFinite(frame)) {
		return Number(baseValue) || 0;
	}
	if (frame <= keys[0].frame) {
		return keys[0].value;
	}
	const lastKey = keys[keys.length - 1];
	if (frame >= lastKey.frame) {
		return lastKey.value;
	}
	for (let index = 0; index < keys.length - 1; index += 1) {
		const left = keys[index];
		const right = keys[index + 1];
		if (frame < left.frame || frame > right.frame) {
			continue;
		}
		const interpolation = sanitizeInterpolation(
			left.interpolation ?? track.interpolation,
		);
		if (
			interpolation === ANIMATION_INTERPOLATION_HOLD ||
			left.frame === right.frame
		) {
			return left.value;
		}
		const alpha = (frame - left.frame) / (right.frame - left.frame);
		return left.value + (right.value - left.value) * alpha;
	}
	return Number(baseValue) || 0;
}
