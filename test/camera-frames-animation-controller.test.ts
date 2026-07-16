import assert from "node:assert/strict";
import * as THREE from "three";
import {
	ANIMATION_TARGET_SCENE_ASSET,
	createAnimationTimelineKeyId,
	getAnimationChannelDescriptor,
	isAnimationTrackPathAllowed,
	sanitizeAnimationDocument,
} from "../src/animation/animation-model.js";
import { createAnimationController } from "../src/controllers/animation-controller.js";

function signal<T>(value: T) {
	return { value };
}

function createStore(animationDocument: object) {
	return {
		workspace: {
			activeShotCameraId: signal("shot-camera-1"),
		},
		selectedSceneAssetIds: signal([]),
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

function timelineKeyId(bindingId: string, path: string, frame: number) {
	return createAnimationTimelineKeyId({ bindingId, path, frame });
}

assert.equal(
	getAnimationChannelDescriptor(
		{ kind: ANIMATION_TARGET_SCENE_ASSET },
		"transform.worldScale",
	)?.group,
	"transform",
);
assert.equal(
	getAnimationChannelDescriptor(
		{ kind: ANIMATION_TARGET_SCENE_ASSET },
		"assetPlayback.clipTime",
	),
	null,
);
assert.equal(
	getAnimationChannelDescriptor(
		{ kind: ANIMATION_TARGET_SCENE_ASSET },
		"assetPlayback.clipTime",
		{ includeReserved: true },
	)?.group,
	"assetPlayback",
);
assert.equal(
	isAnimationTrackPathAllowed(
		{ kind: ANIMATION_TARGET_SCENE_ASSET },
		"assetPlayback.clipTime",
	),
	false,
);
assert.deepEqual(
	sanitizeAnimationDocument({
		activeClipId: "clip-1",
		clips: [
			{
				id: "clip-1",
				bindings: [
					{
						target: { kind: ANIMATION_TARGET_SCENE_ASSET, id: 1 },
						tracks: [
							{
								path: "assetPlayback.clipTime",
								keys: [{ frame: 1, value: 0 }],
							},
						],
					},
				],
			},
		],
	}).clips[0].bindings[0].tracks,
	[],
);

const animationDocument = {
	version: 1,
	enabled: true,
	autoKeyTargetKeys: [],
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

camera.position.x = 3;
assert.equal(
	controller.releaseRuntimeEvaluationForManualEdit({
		targetKind: "shot-camera",
		targetId: "shot-camera-1",
	}),
	true,
);
controller.withBaseRuntimeStateForSnapshot(() => {
	assert.equal(camera.position.x, 3);
	assert.equal(asset.object.position.y, 2);
	assert.equal(controller.getEvaluatedLensForShotCamera("shot-camera-1"), null);
});
assert.equal(camera.position.x, 3);
assert.equal(asset.object.position.y, 4);
assert.equal(controller.applyCurrentFrame({ frame: 10 }), true);
assert.equal(camera.position.x, 9);

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
assert.equal(controller.getAnimationDocument().enabled, true);
assert.equal(controller.applyCurrentFrame({ frame: 10 }), true);
assert.equal(camera.position.x, 9);
assert.equal(asset.object.position.y, 4);
assert.equal(asset.worldScale, 2);

store.animation.timelineFrame.value = 12;
asset.object.position.set(7, 8, 9);
asset.object.updateMatrixWorld(true);
assert.equal(controller.autoKeySceneAssetTransforms([1]), false);
assert.equal(
	controller.setAutoKeyForTarget({ kind: "scene-asset", id: 1 }, true),
	true,
);
assert.equal(controller.shouldHandleSceneAssetAutoKey(1), true);
assert.equal(controller.shouldHandleShotCameraAutoKey("shot-camera-1"), false);
assert.equal(controller.autoKeySceneAssetTransforms([1]), true);
const assetAutoKeyTrack = store.animation.document.value.clips[0].bindings
	.find((binding) => binding.target.kind === "scene-asset")
	.tracks.find((track) => track.path === "transform.position.y");
assert.deepEqual(
	assetAutoKeyTrack.keys.map((key) => [key.frame, key.value]),
	[
		[10, 4],
		[12, 8],
	],
);

{
	const unboundStore = createStore({
		version: 1,
		enabled: true,
		autoKeyTargetKeys: [],
		activeClipId: "clip-1",
		clips: [
			{
				id: "clip-1",
				name: "No Bindings",
				fps: 24,
				startFrame: 1,
				durationFrames: 24,
				playbackStartFrame: 1,
				playbackEndFrame: 24,
				bindings: [],
			},
		],
	});
	const unboundAssetObject = new THREE.Object3D();
	const unboundAsset = {
		id: 7,
		kind: "model",
		worldScale: 1,
		object: unboundAssetObject,
	};
	const unboundController = createAnimationController({
		store: unboundStore,
		state: { baseFovX: 50 },
		shotCameraRegistry: new Map(),
		getAssetController: () => ({
			getSceneAssets: () => [unboundAsset],
			getSceneAsset: (assetId: number | string) =>
				String(assetId) === "7" ? unboundAsset : null,
			applyAssetWorldScale: () => {},
		}),
		updateUi: () => {},
	});
	assert.equal(unboundController.applyCurrentFrame({ frame: 1 }), true);
	unboundAssetObject.rotation.y = Math.PI / 2;
	unboundAssetObject.updateMatrixWorld(true);
	assert.equal(unboundController.applyCurrentFrame({ frame: 1 }), true);
	assert.ok(Math.abs(unboundAssetObject.rotation.y - Math.PI / 2) < 1e-8);
	unboundController.withBaseRuntimeStateForSnapshot(() => {
		assert.ok(Math.abs(unboundAssetObject.rotation.y - Math.PI / 2) < 1e-8);
	});
	assert.ok(Math.abs(unboundAssetObject.rotation.y - Math.PI / 2) < 1e-8);
}

{
	const removedBindingStore = createStore({
		version: 1,
		enabled: true,
		autoKeyTargetKeys: [],
		activeClipId: "clip-1",
		clips: [
			{
				id: "clip-1",
				name: "Removed Binding",
				fps: 24,
				startFrame: 1,
				durationFrames: 24,
				playbackStartFrame: 1,
				playbackEndFrame: 24,
				bindings: [
					{
						id: "asset-binding",
						target: { kind: "scene-asset", id: 8 },
						tracks: [
							{
								path: "transform.position.x",
								keys: [{ frame: 1, value: 3 }],
							},
						],
					},
				],
			},
		],
	});
	const removedBindingAssetObject = new THREE.Object3D();
	const removedBindingAsset = {
		id: 8,
		kind: "model",
		worldScale: 1,
		object: removedBindingAssetObject,
	};
	const removedBindingController = createAnimationController({
		store: removedBindingStore,
		state: { baseFovX: 50 },
		shotCameraRegistry: new Map(),
		getAssetController: () => ({
			getSceneAssets: () => [removedBindingAsset],
			getSceneAsset: (assetId: number | string) =>
				String(assetId) === "8" ? removedBindingAsset : null,
			applyAssetWorldScale: () => {},
		}),
		updateUi: () => {},
	});
	assert.equal(removedBindingController.applyCurrentFrame({ frame: 1 }), true);
	assert.equal(removedBindingAssetObject.position.x, 3);
	removedBindingStore.animation.document.value = {
		...removedBindingStore.animation.document.value,
		clips: removedBindingStore.animation.document.value.clips.map((clip) => ({
			...clip,
			bindings: [],
		})),
	};
	assert.equal(removedBindingController.applyCurrentFrame({ frame: 1 }), true);
	assert.equal(removedBindingAssetObject.position.x, 0);
	removedBindingAssetObject.position.x = 7;
	removedBindingAssetObject.updateMatrixWorld(true);
	assert.equal(removedBindingController.applyCurrentFrame({ frame: 1 }), true);
	assert.equal(removedBindingAssetObject.position.x, 7);
}

{
	const releaseOnlyStore = createStore({
		version: 1,
		enabled: true,
		autoKeyTargetKeys: ["scene-asset:1"],
		activeClipId: "clip-1",
		clips: [
			{
				id: "clip-1",
				name: "Release Only",
				fps: 24,
				startFrame: 1,
				durationFrames: 24,
				playbackStartFrame: 1,
				playbackEndFrame: 24,
				bindings: [
					{
						id: "asset-binding",
						target: { kind: "scene-asset", id: 1 },
						tracks: [
							{
								path: "transform.position.x",
								keys: [{ frame: 1, value: 0 }],
							},
						],
					},
				],
			},
		],
	});
	const releaseOnlyAssetObject = new THREE.Object3D();
	releaseOnlyAssetObject.position.set(0, 0, 0);
	const releaseOnlyAsset = {
		id: 1,
		kind: "model",
		worldScale: 1,
		object: releaseOnlyAssetObject,
	};
	const releaseOnlyController = createAnimationController({
		store: releaseOnlyStore,
		state: { baseFovX: 50 },
		shotCameraRegistry: new Map(),
		getAssetController: () => ({
			getSceneAssets: () => [releaseOnlyAsset],
			getSceneAsset: (assetId: number | string) =>
				String(assetId) === "1" ? releaseOnlyAsset : null,
			applyAssetWorldScale: () => {},
		}),
		updateUi: () => {},
	});
	assert.equal(releaseOnlyController.applyCurrentFrame({ frame: 1 }), true);
	releaseOnlyController.setTimelineFrame(12);
	assert.equal(
		releaseOnlyController.releaseRuntimeEvaluationForManualEdit({
			targetKind: "scene-asset",
			targetId: 1,
			insertAutoKey: false,
		}),
		true,
	);
	const releaseOnlyBinding =
		releaseOnlyStore.animation.document.value.clips[0].bindings[0];
	assert.deepEqual(
		releaseOnlyBinding.tracks
			.find((track) => track.path === "transform.position.x")
			.keys.map((key) => [key.frame, key.value]),
		[[1, 0]],
	);
	releaseOnlyAsset.object.position.x = 5;
	releaseOnlyAsset.object.updateMatrixWorld(true);
	releaseOnlyController.withBaseRuntimeStateForSnapshot(() => {
		assert.equal(releaseOnlyAsset.object.position.x, 0);
	});
	assert.equal(releaseOnlyAsset.object.position.x, 5);
	assert.equal(releaseOnlyController.autoKeySceneAssetTransforms([1]), true);
	const releaseOnlyUpdatedBinding =
		releaseOnlyStore.animation.document.value.clips[0].bindings[0];
	assert.deepEqual(
		releaseOnlyUpdatedBinding.tracks
			.find((track) => track.path === "transform.position.x")
			.keys.map((key) => [key.frame, key.value]),
		[
			[1, 0],
			[12, 5],
		],
	);
}

{
	const editStore = createStore({
		version: 1,
		enabled: true,
		autoKeyTargetKeys: [],
		activeClipId: "clip-1",
		clips: [
			{
				id: "clip-1",
				name: "Editable Keys",
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
	});
	const editCamera = new THREE.PerspectiveCamera();
	const editAssetObject = new THREE.Object3D();
	const editAsset = {
		id: 1,
		kind: "model",
		worldScale: 1,
		object: editAssetObject,
	};
	const editController = createAnimationController({
		store: editStore,
		state: { baseFovX: 50 },
		shotCameraRegistry: new Map([
			["shot-camera-1", { id: "shot-camera-1", camera: editCamera }],
		]),
		getShotCameraDocument: () => ({
			id: "shot-camera-1",
			lens: { baseFovX: 50, shiftX: 0, shiftY: 0 },
		}),
		getAssetController: () => ({
			getSceneAssets: () => [editAsset],
			getSceneAsset: (assetId: number | string) =>
				String(assetId) === "1" ? editAsset : null,
			applyAssetWorldScale: () => {},
		}),
		syncShotProjection: () => {},
		applyCameraViewProjection: () => {},
		syncOutputCamera: () => {},
		updateCameraSummary: () => {},
		updateUi: () => {},
	});
	assert.equal(
		editController.selectTimelineKeyFrame(
			{ kind: "shot-camera", id: "shot-camera-1" },
			10,
		),
		true,
	);
	assert.deepEqual(editStore.animation.selectedKeyIds.value, [
		timelineKeyId("camera-binding", "transform.position.x", 10),
		timelineKeyId("camera-binding", "lens.baseFovX", 10),
	]);
	assert.equal(editController.hasSelectedTimelineKeys(), true);
	assert.equal(editController.copySelectedTimelineKeys(), true);
	assert.equal(editController.hasTimelineKeyClipboard(), true);
	assert.equal(editController.pasteTimelineKeys({ frame: 12 }), true);
	const editableCameraBinding =
		editStore.animation.document.value.clips[0].bindings.find(
			(binding) => binding.id === "camera-binding",
		);
	assert.deepEqual(
		editableCameraBinding.tracks
			.find((track) => track.path === "transform.position.x")
			.keys.map((key) => [key.frame, key.value]),
		[
			[1, 0],
			[10, 9],
			[12, 9],
		],
	);
	assert.deepEqual(
		editableCameraBinding.tracks
			.find((track) => track.path === "lens.baseFovX")
			.keys.map((key) => [key.frame, key.value]),
		[
			[10, 70],
			[12, 70],
		],
	);
	assert.equal(editController.deleteSelectedTimelineKeys(), true);
	const deletedCameraBinding =
		editStore.animation.document.value.clips[0].bindings.find(
			(binding) => binding.id === "camera-binding",
		);
	assert.deepEqual(
		deletedCameraBinding.tracks
			.find((track) => track.path === "transform.position.x")
			.keys.map((key) => [key.frame, key.value]),
		[
			[1, 0],
			[10, 9],
		],
	);
	assert.equal(
		editController.selectTimelineKeyFrame(
			{ kind: "shot-camera", id: "shot-camera-1" },
			10,
		),
		true,
	);
	assert.equal(
		editController.selectTimelineKeyFrame({ kind: "scene-asset", id: 1 }, 10, {
			additive: true,
		}),
		true,
	);
	assert.equal(editController.moveSelectedTimelineKeysBy(2), true);
	const movedCameraBinding =
		editStore.animation.document.value.clips[0].bindings.find(
			(binding) => binding.id === "camera-binding",
		);
	const movedAssetBinding =
		editStore.animation.document.value.clips[0].bindings.find(
			(binding) => binding.id === "asset-binding",
		);
	assert.deepEqual(
		movedCameraBinding.tracks
			.find((track) => track.path === "transform.position.x")
			.keys.map((key) => [key.frame, key.value]),
		[
			[1, 0],
			[12, 9],
		],
	);
	assert.deepEqual(
		movedAssetBinding.tracks
			.find((track) => track.path === "transform.position.y")
			.keys.map((key) => [key.frame, key.value]),
		[[12, 4]],
	);
	assert.deepEqual(
		editStore.animation.selectedKeyIds.value.sort(),
		[
			timelineKeyId("asset-binding", "transform.position.y", 12),
			timelineKeyId("asset-binding", "transform.worldScale", 12),
			timelineKeyId("camera-binding", "lens.baseFovX", 12),
			timelineKeyId("camera-binding", "transform.position.x", 12),
		].sort(),
	);
	editStore.animation.selectedKeyIds.value = [
		"camera-binding:transform.position.x:12",
	];
	assert.equal(editController.hasSelectedTimelineKeys(), true);
	assert.deepEqual(
		editController.getTimelineKeyFrames({ selectedOnly: true }),
		[12],
	);
}

{
	const timingStore = createStore({
		version: 1,
		enabled: true,
		autoKeyTargetKeys: [],
		activeClipId: "clip-1",
		clips: [
			{
				id: "clip-1",
				name: "Timing Keys",
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
						],
					},
				],
			},
		],
	});
	const timingCamera = new THREE.PerspectiveCamera();
	const timingController = createAnimationController({
		store: timingStore,
		state: { baseFovX: 50 },
		shotCameraRegistry: new Map([
			["shot-camera-1", { id: "shot-camera-1", camera: timingCamera }],
		]),
		getShotCameraDocument: () => ({
			id: "shot-camera-1",
			lens: { baseFovX: 50, shiftX: 0, shiftY: 0 },
		}),
		getAssetController: () => ({
			getSceneAssets: () => [],
			getSceneAsset: () => null,
			applyAssetWorldScale: () => {},
		}),
		syncShotProjection: () => {},
		applyCameraViewProjection: () => {},
		syncOutputCamera: () => {},
		updateCameraSummary: () => {},
		updateUi: () => {},
	});
	assert.deepEqual(timingController.getTimelineKeyFrames(), [1, 10]);
	timingController.setTimelineFrame(5);
	assert.ok(timingCamera.position.x > 3 && timingCamera.position.x < 5);
	assert.equal(timingController.jumpTimelineToPreviousKey(), true);
	assert.equal(timingStore.animation.timelineFrame.value, 1);
	assert.equal(timingController.jumpTimelineToNextKey(), true);
	assert.equal(timingStore.animation.timelineFrame.value, 10);
	assert.equal(
		timingController.selectTimelineKeyFrame(
			{ kind: "shot-camera", id: "shot-camera-1" },
			1,
		),
		true,
	);
	assert.equal(
		timingController.getSelectedTimelineKeyInterpolation(),
		"linear",
	);
	assert.equal(
		timingController.setSelectedTimelineKeyInterpolation("hold"),
		true,
	);
	assert.equal(timingController.getSelectedTimelineKeyInterpolation(), "hold");
	timingController.setTimelineFrame(5);
	assert.equal(timingCamera.position.x, 0);
	assert.deepEqual(timingController.getCurrentTimelineKeyStatus(1), {
		frame: 1,
		hasKey: true,
		targetCount: 1,
		keyedTargetCount: 1,
		keyCount: 1,
		interpolation: "hold",
	});
	assert.equal(
		timingController.setSelectedTimelineKeyInterpolation("linear"),
		true,
	);
	timingController.setTimelineFrame(5);
	assert.ok(timingCamera.position.x > 3 && timingCamera.position.x < 5);
	assert.equal(
		timingController.selectTimelineKeyFrame(
			{ kind: "shot-camera", id: "shot-camera-1" },
			10,
			{ additive: true },
		),
		true,
	);
	assert.equal(timingController.scaleSelectedTimelineKeys(2), true);
	const timingTrack =
		timingStore.animation.document.value.clips[0].bindings[0].tracks[0];
	assert.deepEqual(
		timingTrack.keys.map((key) => [key.frame, key.value]),
		[
			[1, 0],
			[19, 9],
		],
	);
	assert.deepEqual(timingController.getTimelineKeyFrames(), [1, 19]);
}

const twoKeyStore = createStore({
	version: 1,
	enabled: true,
	autoKeyTargetKeys: [],
	activeClipId: "clip-1",
	clips: [
		{
			id: "clip-1",
			name: "Two Key Camera",
			fps: 24,
			startFrame: 1,
			durationFrames: 24,
			playbackStartFrame: 1,
			playbackEndFrame: 24,
			bindings: [],
		},
	],
});
const twoKeyCamera = new THREE.PerspectiveCamera();
twoKeyCamera.position.set(0, 0, 0);
const twoKeyController = createAnimationController({
	store: twoKeyStore,
	state: { baseFovX: 50 },
	shotCameraRegistry: new Map([
		["shot-camera-1", { id: "shot-camera-1", camera: twoKeyCamera }],
	]),
	getShotCameraDocument: () => ({
		id: "shot-camera-1",
		lens: { baseFovX: 50, shiftX: 0, shiftY: 0 },
	}),
	getAssetController: () => ({
		getSceneAssets: () => [],
		getSceneAsset: () => null,
		applyAssetWorldScale: () => {},
	}),
	syncShotProjection: () => {},
	applyCameraViewProjection: () => {},
	syncOutputCamera: () => {},
	updateCameraSummary: () => {},
	updateUi: () => {},
});

assert.equal(twoKeyController.insertKeyForSelection(), true);
assert.deepEqual(twoKeyController.getAutoKeyTargetKeys(), [
	"shot-camera:shot-camera-1",
]);
assert.equal(
	twoKeyController.shouldHandleShotCameraAutoKey("shot-camera-1"),
	true,
);
twoKeyController.setTimelineFrame(10);
twoKeyCamera.position.x = 10;
assert.equal(
	twoKeyController.releaseRuntimeEvaluationForManualEdit({
		targetKind: "shot-camera",
		targetId: "shot-camera-1",
	}),
	true,
);
const twoKeyBinding = twoKeyStore.animation.document.value.clips[0].bindings[0];
const twoKeyPositionXTrack = twoKeyBinding.tracks.find(
	(track) => track.path === "transform.position.x",
);
assert.deepEqual(
	twoKeyPositionXTrack.keys.map((key) => [key.frame, key.value]),
	[
		[1, 0],
		[10, 10],
	],
);
twoKeyController.setTimelineFrame(1);
assert.equal(twoKeyCamera.position.x, 0);
twoKeyController.setTimelineFrame(5);
assert.ok(twoKeyCamera.position.x > 4 && twoKeyCamera.position.x < 5);
twoKeyController.setTimelineFrame(10);
assert.equal(twoKeyCamera.position.x, 10);
twoKeyController.setTimelineFrame(1);
twoKeyController.playTimeline();
twoKeyController.advancePlayback(1 / 24);
assert.equal(twoKeyStore.animation.timelineFrame.value, 2);
assert.ok(twoKeyCamera.position.x > 1 && twoKeyCamera.position.x < 2);

console.log("✅ CAMERA_FRAMES animation controller tests passed!");
