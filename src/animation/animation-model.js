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
export const ANIMATION_CHANNEL_GROUP_TRANSFORM = "transform";
export const ANIMATION_CHANNEL_GROUP_LENS = "lens";
export const ANIMATION_CHANNEL_GROUP_ASSET_PLAYBACK = "assetPlayback";
export const ANIMATION_CHANNEL_GROUP_POSE = "pose";
export const ANIMATION_VALUE_TYPE_NUMBER = "number";
export const ANIMATION_VALUE_TYPE_STRING = "string";

const ANIMATION_TIMELINE_KEY_ID_PREFIX = "k";

const ANIMATION_CHANNEL_REGISTRY = {
	[ANIMATION_TARGET_SHOT_CAMERA]: [
		{
			path: "transform.position.x",
			group: ANIMATION_CHANNEL_GROUP_TRANSFORM,
			channelPath: "position.x",
			valueType: ANIMATION_VALUE_TYPE_NUMBER,
			implemented: true,
		},
		{
			path: "transform.position.y",
			group: ANIMATION_CHANNEL_GROUP_TRANSFORM,
			channelPath: "position.y",
			valueType: ANIMATION_VALUE_TYPE_NUMBER,
			implemented: true,
		},
		{
			path: "transform.position.z",
			group: ANIMATION_CHANNEL_GROUP_TRANSFORM,
			channelPath: "position.z",
			valueType: ANIMATION_VALUE_TYPE_NUMBER,
			implemented: true,
		},
		{
			path: "transform.rotation.yawDeg",
			group: ANIMATION_CHANNEL_GROUP_TRANSFORM,
			channelPath: "rotation.yawDeg",
			valueType: ANIMATION_VALUE_TYPE_NUMBER,
			implemented: true,
		},
		{
			path: "transform.rotation.pitchDeg",
			group: ANIMATION_CHANNEL_GROUP_TRANSFORM,
			channelPath: "rotation.pitchDeg",
			valueType: ANIMATION_VALUE_TYPE_NUMBER,
			implemented: true,
		},
		{
			path: "transform.rotation.rollDeg",
			group: ANIMATION_CHANNEL_GROUP_TRANSFORM,
			channelPath: "rotation.rollDeg",
			valueType: ANIMATION_VALUE_TYPE_NUMBER,
			implemented: true,
		},
		{
			path: "lens.baseFovX",
			group: ANIMATION_CHANNEL_GROUP_LENS,
			channelPath: "baseFovX",
			valueType: ANIMATION_VALUE_TYPE_NUMBER,
			implemented: true,
		},
		{
			path: "lens.shiftX",
			group: ANIMATION_CHANNEL_GROUP_LENS,
			channelPath: "shiftX",
			valueType: ANIMATION_VALUE_TYPE_NUMBER,
			implemented: true,
		},
		{
			path: "lens.shiftY",
			group: ANIMATION_CHANNEL_GROUP_LENS,
			channelPath: "shiftY",
			valueType: ANIMATION_VALUE_TYPE_NUMBER,
			implemented: true,
		},
	],
	[ANIMATION_TARGET_SCENE_ASSET]: [
		{
			path: "transform.position.x",
			group: ANIMATION_CHANNEL_GROUP_TRANSFORM,
			channelPath: "position.x",
			valueType: ANIMATION_VALUE_TYPE_NUMBER,
			implemented: true,
		},
		{
			path: "transform.position.y",
			group: ANIMATION_CHANNEL_GROUP_TRANSFORM,
			channelPath: "position.y",
			valueType: ANIMATION_VALUE_TYPE_NUMBER,
			implemented: true,
		},
		{
			path: "transform.position.z",
			group: ANIMATION_CHANNEL_GROUP_TRANSFORM,
			channelPath: "position.z",
			valueType: ANIMATION_VALUE_TYPE_NUMBER,
			implemented: true,
		},
		{
			path: "transform.rotation.xDeg",
			group: ANIMATION_CHANNEL_GROUP_TRANSFORM,
			channelPath: "rotation.xDeg",
			valueType: ANIMATION_VALUE_TYPE_NUMBER,
			implemented: true,
		},
		{
			path: "transform.rotation.yDeg",
			group: ANIMATION_CHANNEL_GROUP_TRANSFORM,
			channelPath: "rotation.yDeg",
			valueType: ANIMATION_VALUE_TYPE_NUMBER,
			implemented: true,
		},
		{
			path: "transform.rotation.zDeg",
			group: ANIMATION_CHANNEL_GROUP_TRANSFORM,
			channelPath: "rotation.zDeg",
			valueType: ANIMATION_VALUE_TYPE_NUMBER,
			implemented: true,
		},
		{
			path: "transform.worldScale",
			group: ANIMATION_CHANNEL_GROUP_TRANSFORM,
			channelPath: "worldScale",
			valueType: ANIMATION_VALUE_TYPE_NUMBER,
			implemented: true,
		},
		{
			path: "assetPlayback.clipId",
			group: ANIMATION_CHANNEL_GROUP_ASSET_PLAYBACK,
			channelPath: "clipId",
			valueType: ANIMATION_VALUE_TYPE_STRING,
			implemented: false,
		},
		{
			path: "assetPlayback.clipTime",
			group: ANIMATION_CHANNEL_GROUP_ASSET_PLAYBACK,
			channelPath: "clipTime",
			valueType: ANIMATION_VALUE_TYPE_NUMBER,
			implemented: false,
		},
		{
			path: "assetPlayback.speed",
			group: ANIMATION_CHANNEL_GROUP_ASSET_PLAYBACK,
			channelPath: "speed",
			valueType: ANIMATION_VALUE_TYPE_NUMBER,
			implemented: false,
		},
		{
			path: "assetPlayback.weight",
			group: ANIMATION_CHANNEL_GROUP_ASSET_PLAYBACK,
			channelPath: "weight",
			valueType: ANIMATION_VALUE_TYPE_NUMBER,
			implemented: false,
		},
		{
			path: "pose.poseId",
			group: ANIMATION_CHANNEL_GROUP_POSE,
			channelPath: "poseId",
			valueType: ANIMATION_VALUE_TYPE_STRING,
			implemented: false,
		},
		{
			path: "pose.weight",
			group: ANIMATION_CHANNEL_GROUP_POSE,
			channelPath: "weight",
			valueType: ANIMATION_VALUE_TYPE_NUMBER,
			implemented: false,
		},
	],
};

const ANIMATION_CHANNELS_BY_TARGET = new Map(
	Object.entries(ANIMATION_CHANNEL_REGISTRY).map(([targetKind, channels]) => [
		targetKind,
		new Map(channels.map((channel) => [channel.path, channel])),
	]),
);

const ANIMATION_TARGET_KEY_PREFIXES = [
	`${ANIMATION_TARGET_SHOT_CAMERA}:`,
	`${ANIMATION_TARGET_SCENE_ASSET}:`,
];

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

function sanitizeAutoKeyTargetKey(value) {
	const candidate = String(value ?? "").trim();
	if (!candidate) {
		return null;
	}
	for (const prefix of ANIMATION_TARGET_KEY_PREFIXES) {
		if (candidate.startsWith(prefix) && candidate.length > prefix.length) {
			return candidate;
		}
	}
	return null;
}

function sanitizeAutoKeyTargetKeys(value) {
	const keys = new Set();
	for (const entry of Array.isArray(value) ? value : []) {
		const key = sanitizeAutoKeyTargetKey(entry);
		if (key) {
			keys.add(key);
		}
	}
	return [...keys];
}

function sanitizeAnimationKey(key, valueType = ANIMATION_VALUE_TYPE_NUMBER) {
	if (!isObject(key) || !Number.isFinite(Number(key.frame))) {
		return null;
	}
	if (valueType !== ANIMATION_VALUE_TYPE_NUMBER) {
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
	const descriptor = getAnimationChannelDescriptor(target, path);
	if (!descriptor) {
		return null;
	}
	const keysByFrame = new Map();
	for (const key of Array.isArray(track.keys) ? track.keys : []) {
		const normalizedKey = sanitizeAnimationKey(key, descriptor.valueType);
		if (normalizedKey) {
			keysByFrame.set(normalizedKey.frame, normalizedKey);
		}
	}
	const keys = Array.from(keysByFrame.values()).sort(
		(left, right) => left.frame - right.frame,
	);
	return {
		path,
		valueType: descriptor.valueType,
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
		autoKeyTargetKeys: [],
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
		autoKeyTargetKeys: sanitizeAutoKeyTargetKeys(animation?.autoKeyTargetKeys),
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
	return Boolean(getAnimationChannelDescriptor(target, path));
}

export function getAnimationChannelDescriptor(
	target,
	path,
	{ includeReserved = false } = {},
) {
	const targetKind = target?.kind;
	const trackPath = String(path ?? "").trim();
	const descriptor =
		ANIMATION_CHANNELS_BY_TARGET.get(targetKind)?.get(trackPath);
	if (!descriptor || (!includeReserved && descriptor.implemented !== true)) {
		return null;
	}
	return { ...descriptor };
}

export function getAnimationChannelDescriptors(
	targetKind,
	{ includeReserved = false } = {},
) {
	return (ANIMATION_CHANNEL_REGISTRY[targetKind] ?? [])
		.filter((descriptor) => includeReserved || descriptor.implemented === true)
		.map((descriptor) => ({ ...descriptor }));
}

export function inferAnimationChannelGroupFromPath(path) {
	const value = String(path ?? "").trim();
	if (!value) {
		return "";
	}
	const separatorIndex = value.indexOf(".");
	return separatorIndex > 0 ? value.slice(0, separatorIndex) : value;
}

export function getAnimationTrackChannelGroup(target, path) {
	return (
		getAnimationChannelDescriptor(target, path, { includeReserved: true })
			?.group ?? inferAnimationChannelGroupFromPath(path)
	);
}

export function createAnimationTimelineKeyId({
	bindingId,
	channelGroup,
	path,
	frame,
} = {}) {
	const keyFrame = Math.round(Number(frame));
	return [
		ANIMATION_TIMELINE_KEY_ID_PREFIX,
		encodeURIComponent(String(bindingId ?? "")),
		encodeURIComponent(
			String(channelGroup || inferAnimationChannelGroupFromPath(path)),
		),
		encodeURIComponent(String(path ?? "")),
		String(Number.isFinite(keyFrame) ? keyFrame : 0),
	].join("|");
}

function parseLegacyAnimationTimelineKeyId(value) {
	const frameSeparatorIndex = value.lastIndexOf(":");
	if (frameSeparatorIndex <= 0 || frameSeparatorIndex >= value.length - 1) {
		return null;
	}
	const frame = Number(value.slice(frameSeparatorIndex + 1));
	if (!Number.isFinite(frame)) {
		return null;
	}
	const bindingAndPath = value.slice(0, frameSeparatorIndex);
	const pathSeparatorIndex = bindingAndPath.lastIndexOf(":");
	if (
		pathSeparatorIndex <= 0 ||
		pathSeparatorIndex >= bindingAndPath.length - 1
	) {
		return null;
	}
	const path = bindingAndPath.slice(pathSeparatorIndex + 1);
	return {
		bindingId: bindingAndPath.slice(0, pathSeparatorIndex),
		channelGroup: inferAnimationChannelGroupFromPath(path),
		path,
		frame: Math.round(frame),
		legacy: true,
	};
}

export function parseAnimationTimelineKeyId(keyId) {
	const value = String(keyId ?? "");
	if (!value.startsWith(`${ANIMATION_TIMELINE_KEY_ID_PREFIX}|`)) {
		return parseLegacyAnimationTimelineKeyId(value);
	}
	const parts = value.split("|");
	if (parts.length !== 5) {
		return null;
	}
	const frame = Number(parts[4]);
	if (!Number.isFinite(frame)) {
		return null;
	}
	try {
		const path = decodeURIComponent(parts[3]);
		return {
			bindingId: decodeURIComponent(parts[1]),
			channelGroup:
				decodeURIComponent(parts[2]) ||
				inferAnimationChannelGroupFromPath(path),
			path,
			frame: Math.round(frame),
			legacy: false,
		};
	} catch {
		return null;
	}
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
