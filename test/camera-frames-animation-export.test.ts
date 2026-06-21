import assert from "node:assert/strict";
import {
	ANIMATION_EXPORT_FRAME_SOURCE_KEYFRAMES,
	collectAnimationKeyFrames,
	resolveAnimationExportFrames,
	sanitizeAnimationExportFrameSource,
	sanitizeAnimationExportMode,
} from "../src/animation/animation-export.js";

const animationDocument = {
	activeClipId: "clip-a",
	clips: [
		{
			id: "clip-a",
			startFrame: 10,
			durationFrames: 8,
			playbackStartFrame: 12,
			playbackEndFrame: 16,
			bindings: [
				{
					id: "binding-camera",
					target: { kind: "shot-camera", id: "camera-a" },
					tracks: [
						{
							path: "transform.position.x",
							keys: [
								{ frame: 10, value: 0 },
								{ frame: 12, value: 1 },
								{ frame: 14, value: 2 },
								{ frame: 18, value: 3 },
							],
						},
						{
							path: "lens.shiftX",
							keys: [
								{ frame: 14, value: 0.1 },
								{ frame: 16, value: 0.2 },
							],
						},
					],
				},
				{
					id: "binding-asset",
					target: { kind: "scene-asset", id: "asset-a" },
					tracks: [
						{
							path: "transform.position.y",
							keys: [
								{ frame: 13, value: 4 },
								{ frame: 16, value: 5 },
							],
						},
					],
				},
			],
		},
	],
};

assert.equal(sanitizeAnimationExportMode("unknown"), "current");
assert.equal(sanitizeAnimationExportFrameSource("unknown"), "duration");
assert.deepEqual(
	resolveAnimationExportFrames(animationDocument),
	[12, 13, 14, 15, 16],
);
assert.deepEqual(
	collectAnimationKeyFrames(animationDocument),
	[12, 13, 14, 16],
);
assert.deepEqual(
	resolveAnimationExportFrames(animationDocument, {
		frameSource: ANIMATION_EXPORT_FRAME_SOURCE_KEYFRAMES,
	}),
	[12, 13, 14, 16],
);

console.log("✅ CAMERA_FRAMES animation export tests passed!");
