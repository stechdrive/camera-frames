import assert from "node:assert/strict";
import {
	ANIMATION_INTERPOLATION_HOLD,
	ANIMATION_INTERPOLATION_LINEAR,
	ANIMATION_TARGET_SCENE_ASSET,
	ANIMATION_TARGET_SHOT_CAMERA,
	DEFAULT_ANIMATION_CLIP_ID,
	DEFAULT_ANIMATION_DURATION_FRAMES,
	DEFAULT_ANIMATION_FPS,
	DEFAULT_ANIMATION_START_FRAME,
	createDefaultAnimationDocument,
	getActiveAnimationClip,
	isAnimationTrackPathAllowed,
	sampleNumberTrack,
	sanitizeAnimationDocument,
} from "../src/animation/animation-model.js";

const defaultDocument = createDefaultAnimationDocument();
assert.deepEqual(defaultDocument, {
	version: 1,
	enabled: true,
	activeClipId: DEFAULT_ANIMATION_CLIP_ID,
	clips: [
		{
			id: DEFAULT_ANIMATION_CLIP_ID,
			name: "Timeline",
			fps: DEFAULT_ANIMATION_FPS,
			startFrame: DEFAULT_ANIMATION_START_FRAME,
			durationFrames: DEFAULT_ANIMATION_DURATION_FRAMES,
			playbackStartFrame: DEFAULT_ANIMATION_START_FRAME,
			playbackEndFrame:
				DEFAULT_ANIMATION_START_FRAME + DEFAULT_ANIMATION_DURATION_FRAMES - 1,
			bindings: [],
		},
	],
});

assert.equal(
	isAnimationTrackPathAllowed(
		{ kind: ANIMATION_TARGET_SHOT_CAMERA, id: "shot-camera-1" },
		"lens.baseFovX",
	),
	true,
);
assert.equal(
	isAnimationTrackPathAllowed(
		{ kind: ANIMATION_TARGET_SCENE_ASSET, id: "asset-1" },
		"lens.baseFovX",
	),
	false,
);

const normalized = sanitizeAnimationDocument({
	enabled: true,
	activeClipId: "clip-a",
	clips: [
		{
			id: "clip-a",
			name: "  Camera move  ",
			fps: 240,
			startFrame: 10.4,
			durationFrames: -4,
			playbackStartFrame: 8,
			playbackEndFrame: 999,
			bindings: [
				{
					id: "camera-binding",
					target: { kind: "shot-camera", id: "shot-camera-1" },
					labelCache: "Camera 1",
					tracks: [
						{
							path: "transform.position.x",
							interpolation: ANIMATION_INTERPOLATION_LINEAR,
							keys: [
								{ frame: 12, value: 2 },
								{ frame: 11.6, value: 1 },
								{ frame: 12, value: 3 },
								{ frame: Number.NaN, value: 5 },
								{ frame: 14, value: Number.NaN },
							],
						},
						{
							path: "transform.worldScale",
							keys: [{ frame: 12, value: 1 }],
						},
					],
				},
				{
					target: { kind: "scene-asset", id: "asset-1" },
					tracks: [
						{
							path: "transform.worldScale",
							keys: [{ frame: 20, value: 1.25 }],
						},
					],
				},
				{
					target: { kind: "bad-kind", id: "bad" },
					tracks: [{ path: "transform.position.x", keys: [] }],
				},
			],
		},
	],
});

assert.equal(normalized.enabled, true);
assert.equal(normalized.activeClipId, "clip-a");
const clip = getActiveAnimationClip(normalized);
assert.equal(clip.name, "Camera move");
assert.equal(clip.fps, 120);
assert.equal(clip.startFrame, 10);
assert.equal(clip.durationFrames, 1);
assert.equal(clip.playbackStartFrame, 10);
assert.equal(clip.playbackEndFrame, 10);
assert.equal(clip.bindings.length, 2);
assert.equal(clip.bindings[0].tracks.length, 1);
assert.deepEqual(clip.bindings[0].tracks[0].keys, [{ frame: 12, value: 3 }]);
assert.deepEqual(clip.bindings[1].tracks[0].keys, [{ frame: 20, value: 1.25 }]);

const duplicateClips = sanitizeAnimationDocument({
	enabled: false,
	activeClipId: "dup",
	clips: [
		{ id: "dup", durationFrames: 10 },
		{ id: "dup", durationFrames: 12 },
	],
});
assert.equal(duplicateClips.enabled, true);
assert.equal(duplicateClips.clips[0].id, "dup");
assert.equal(duplicateClips.clips[1].id, "dup-2");
assert.equal(duplicateClips.activeClipId, "dup");

const linearTrack = {
	interpolation: ANIMATION_INTERPOLATION_LINEAR,
	keys: [
		{ frame: 1, value: 10 },
		{ frame: 5, value: 18 },
	],
};
assert.equal(sampleNumberTrack(linearTrack, 0, 4), 10);
assert.equal(sampleNumberTrack(linearTrack, 3, 4), 14);
assert.equal(sampleNumberTrack(linearTrack, 7, 4), 18);

const holdTrack = {
	interpolation: ANIMATION_INTERPOLATION_HOLD,
	keys: [
		{ frame: 1, value: 10 },
		{ frame: 5, value: 18 },
	],
};
assert.equal(sampleNumberTrack(holdTrack, 3, 4), 10);
assert.equal(sampleNumberTrack({ keys: [] }, 3, 4), 4);

const outOfRangeKeys = sanitizeAnimationDocument({
	clips: [
		{
			durationFrames: 2,
			bindings: [
				{
					target: { kind: "scene-asset", id: "asset-1" },
					tracks: [
						{
							path: "transform.worldScale",
							keys: [{ frame: 200, value: 2 }],
						},
					],
				},
			],
		},
	],
});
assert.equal(
	outOfRangeKeys.clips[0].bindings[0].tracks[0].keys[0].frame,
	200,
	"duration changes must not delete out-of-range keys",
);

console.log("✅ CAMERA_FRAMES animation model tests passed!");
