import assert from "node:assert/strict";
import {
	createDefaultAnimationDocument,
	sanitizeAnimationDocument,
} from "../src/animation/animation-model.js";
import {
	COMPOSITION_GUIDE_PATTERN_GOLDEN,
	COMPOSITION_GUIDE_PATTERN_THIRDS,
	COMPOSITION_GUIDE_SCOPE_ALL_FRAMES,
	COMPOSITION_GUIDE_SCOPE_SELECTED_FRAME,
} from "../src/engine/composition-guides.js";
import {
	PROJECT_VERSION,
	getProjectMediaTypeFromFileName,
	normalizeProjectDocument,
	sanitizeProjectAssetLabel,
} from "../src/project/document.js";

assert.equal(
	sanitizeProjectAssetLabel("  Layout\tModel\nA  ", "Asset 1"),
	"Layout Model A",
);
assert.equal(sanitizeProjectAssetLabel("", "Asset 1"), "Asset 1");

const normalized = normalizeProjectDocument({
	workspace: {
		viewport: {
			projectionMode: "orthographic",
			orthographic: {
				viewId: "negY",
				size: 14,
				distance: 28,
				focus: {
					x: 3,
					y: 4,
					z: 5,
				},
			},
		},
	},
	scene: {
		assets: [
			{
				id: "asset-model",
				kind: "model",
				label: "  Hero\tModel\n",
			},
		],
	},
});

assert.equal(normalized.version, PROJECT_VERSION);
assert.deepEqual(normalized.animation, createDefaultAnimationDocument());
assert.equal(normalized.scene.assets[0].label, "Hero Model");
assert.equal(normalized.workspace.viewport.projectionMode, "orthographic");
assert.equal(normalized.shotCameras[0].lens.shiftX, 0);
assert.equal(normalized.shotCameras[0].lens.shiftY, 0);
assert.deepEqual(normalized.workspace.viewport.orthographic, {
	viewId: "negY",
	size: 14,
	distance: 28,
	focus: {
		x: 3,
		y: 4,
		z: 5,
	},
});

const normalizedWithCompositionGuide = normalizeProjectDocument({
	shotCameras: [
		{
			id: "shot-camera-1",
			name: "Camera 1",
			lens: {
				baseFovX: 55,
				shiftX: 0.125,
				shiftY: -0.25,
			},
			compositionGuide: {
				enabled: true,
				scope: COMPOSITION_GUIDE_SCOPE_ALL_FRAMES,
				pattern: COMPOSITION_GUIDE_PATTERN_GOLDEN,
			},
		},
		{
			id: "shot-camera-2",
			name: "Camera 2",
			lens: {
				baseFovX: 48,
				shiftX: 4,
				shiftY: Number.NaN,
			},
			compositionGuide: {
				enabled: true,
				scope: "bad-scope",
				pattern: "bad-pattern",
			},
		},
	],
});
assert.deepEqual(
	normalizedWithCompositionGuide.shotCameras[0].compositionGuide,
	{
		enabled: true,
		scope: COMPOSITION_GUIDE_SCOPE_ALL_FRAMES,
		pattern: COMPOSITION_GUIDE_PATTERN_GOLDEN,
	},
);
assert.deepEqual(
	normalizedWithCompositionGuide.shotCameras[1].compositionGuide,
	{
		enabled: true,
		scope: COMPOSITION_GUIDE_SCOPE_SELECTED_FRAME,
		pattern: COMPOSITION_GUIDE_PATTERN_THIRDS,
	},
);
assert.deepEqual(normalizedWithCompositionGuide.shotCameras[0].lens, {
	baseFovX: 55,
	shiftX: 0.125,
	shiftY: -0.25,
});
assert.deepEqual(normalizedWithCompositionGuide.shotCameras[1].lens, {
	baseFovX: 48,
	shiftX: 1,
	shiftY: 0,
});

const normalizedWithAnimation = normalizeProjectDocument({
	animation: {
		enabled: true,
		activeClipId: "clip-1",
		clips: [
			{
				id: "clip-1",
				fps: 12,
				durationFrames: 48,
				bindings: [
					{
						target: { kind: "scene-asset", id: "missing-asset" },
						tracks: [
							{
								path: "transform.worldScale",
								keys: [{ frame: 80, value: 1.5 }],
							},
						],
					},
				],
			},
		],
	},
});
assert.deepEqual(
	normalizedWithAnimation.animation,
	sanitizeAnimationDocument({
		enabled: true,
		activeClipId: "clip-1",
		clips: [
			{
				id: "clip-1",
				fps: 12,
				durationFrames: 48,
				bindings: [
					{
						target: { kind: "scene-asset", id: "missing-asset" },
						tracks: [
							{
								path: "transform.worldScale",
								keys: [{ frame: 80, value: 1.5 }],
							},
						],
					},
				],
			},
		],
	}),
);

assert.equal(getProjectMediaTypeFromFileName("layout.fbx"), "model/fbx");
assert.equal(
	getProjectMediaTypeFromFileName("layout.glb"),
	"model/gltf-binary",
);

console.log("✅ CAMERA_FRAMES project document tests passed!");
