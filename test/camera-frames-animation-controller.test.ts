import assert from "node:assert/strict";
import * as THREE from "three";
import { createAnimationController } from "../src/controllers/animation-controller.js";

function signal<T>(value: T) {
	return { value };
}

function createStore(animationDocument: object) {
	return {
		workspace: {
			activeShotCameraId: signal("shot-camera-1"),
		},
		animation: {
			document: signal(animationDocument),
			enabled: signal(true),
			timelineFrame: signal(1),
			isPlaying: signal(false),
			autoKey: signal(false),
			panelOpen: signal(false),
			panelHeight: signal(220),
			selectedBindingId: signal(null),
			selectedKeyIds: signal([]),
			expandedRowIds: signal([]),
			zoom: signal(1),
			scrollFrame: signal(1),
			keyTargetMode: signal("camera"),
			evaluatedLens: signal(null),
		},
	};
}

const animationDocument = {
	version: 1,
	enabled: true,
	activeClipId: "clip-1",
	clips: [
		{
			id: "clip-1",
			name: "Move",
			fps: 24,
			startFrame: 1,
			durationFrames: 24,
			playbackStartFrame: 1,
			playbackEndFrame: 24,
			bindings: [
				{
					id: "camera-binding",
					target: { kind: "shot-camera", id: "shot-camera-1" },
					tracks: [
						{
							path: "transform.position.x",
							keys: [
								{ frame: 1, value: 0 },
								{ frame: 10, value: 9 },
							],
						},
						{
							path: "lens.baseFovX",
							keys: [{ frame: 10, value: 70 }],
						},
						{
							path: "lens.shiftX",
							keys: [{ frame: 10, value: 0.25 }],
						},
					],
				},
				{
					id: "asset-binding",
					target: { kind: "scene-asset", id: 1 },
					tracks: [
						{
							path: "transform.position.y",
							keys: [{ frame: 10, value: 4 }],
						},
						{
							path: "transform.worldScale",
							keys: [{ frame: 10, value: 2 }],
						},
					],
				},
			],
		},
	],
};

const store = createStore(animationDocument);
const state = { baseFovX: 50 };
const camera = new THREE.PerspectiveCamera();
camera.position.set(0, 0, 0);
const shotCameraRegistry = new Map([
	["shot-camera-1", { id: "shot-camera-1", camera }],
]);
const assetObject = new THREE.Object3D();
assetObject.position.set(1, 2, 3);
const asset = {
	id: 1,
	kind: "model",
	worldScale: 1,
	object: assetObject,
};
let applyWorldScaleCount = 0;
const assetController = {
	getSceneAssets: () => [asset],
	getSceneAsset: (assetId: number) => (assetId === 1 ? asset : null),
	applyAssetWorldScale: () => {
		applyWorldScaleCount += 1;
	},
};
let projectionSyncCount = 0;
const controller = createAnimationController({
	store,
	state,
	shotCameraRegistry,
	getShotCameraDocument: () => ({
		id: "shot-camera-1",
		lens: { baseFovX: 50, shiftX: 0, shiftY: 0 },
	}),
	getAssetController: () => assetController,
	syncShotProjection: () => {
		projectionSyncCount += 1;
	},
	applyCameraViewProjection: () => {},
	syncOutputCamera: () => {},
	updateCameraSummary: () => {},
	updateUi: () => {},
});

assert.equal(controller.applyCurrentFrame({ frame: 10 }), true);
assert.equal(camera.position.x, 9);
assert.equal(asset.object.position.y, 4);
assert.equal(asset.worldScale, 2);
assert.ok(applyWorldScaleCount > 0);
assert.equal(
	controller.getEvaluatedLensForShotCamera("shot-camera-1")?.baseFovX,
	70,
);
assert.equal(
	controller.getEvaluatedLensForShotCamera("shot-camera-1")?.shiftX,
	0.25,
);
assert.equal(store.animation.evaluatedLens.value?.baseFovX, 70);
assert.equal(state.baseFovX, 70);
assert.ok(projectionSyncCount > 0);

controller.withBaseRuntimeStateForSnapshot(() => {
	assert.equal(camera.position.x, 0);
	assert.equal(asset.object.position.y, 2);
	assert.equal(asset.worldScale, 1);
	assert.equal(controller.getEvaluatedLensForShotCamera("shot-camera-1"), null);
});
assert.equal(camera.position.x, 9);
assert.equal(asset.object.position.y, 4);
assert.equal(asset.worldScale, 2);

assert.equal(controller.zoomTimelineIn(), 2);
assert.equal(store.animation.zoom.value, 2);
assert.equal(controller.zoomTimelineOut(), 1);
assert.equal(store.animation.zoom.value, 1);
assert.equal(controller.setTimelineZoom(999), 8);
assert.equal(store.animation.zoom.value, 8);
assert.equal(controller.setTimelineZoom(0), 1);
assert.equal(store.animation.zoom.value, 1);
controller.setAnimationKeyTargetMode("objects");
assert.equal(store.animation.keyTargetMode.value, "objects");
assert.equal(controller.captureTimelineEditorState().keyTargetMode, "objects");
controller.restoreTimelineEditorState({ keyTargetMode: "both" });
assert.equal(store.animation.keyTargetMode.value, "both");
controller.restoreTimelineEditorState({ keyTargetMode: "invalid" });
assert.equal(store.animation.keyTargetMode.value, "camera");

store.animation.document.value = {
	...animationDocument,
	enabled: false,
};
assert.equal(controller.applyCurrentFrame({ frame: 10 }), true);
assert.equal(camera.position.x, 0);
assert.equal(asset.object.position.y, 2);
assert.equal(asset.worldScale, 1);

console.log("✅ CAMERA_FRAMES animation controller tests passed!");
