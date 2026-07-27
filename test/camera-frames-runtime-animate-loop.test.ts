import assert from "node:assert/strict";
import * as THREE from "three";
import { createRuntimeAnimateLoop } from "../src/controllers/runtime/animate-loop.js";

function createHarness({
	hasBackReferenceImage = false,
	gridVisible = false,
	gridLayerMode = "bottom",
	sceneBackground = null,
} = {}) {
	const calls: string[] = [];
	const camera = new THREE.PerspectiveCamera();
	const scene = { background: sceneBackground };
	let snapshotX = 0;
	const renderer = {
		autoClear: true,
		getSize(target: THREE.Vector2) {
			target.set(800, 600);
			return target;
		},
		getClearAlpha() {
			return 1;
		},
		getClearColor(target: THREE.Color) {
			target.set(0x000000);
			return target;
		},
		setClearColor(_color: unknown, alpha: number) {
			calls.push(`clear-alpha:${alpha}`);
		},
		clear() {
			calls.push("clear");
		},
		render() {
			calls.push(
				scene.background === null ? "render:bg-null" : "render:bg-color",
			);
		},
	};
	const animate = createRuntimeAnimateLoop({
		renderer,
		scene,
		store: {
			shotCamera: {
				rollDeg: { value: 0 },
			},
			referenceImages: {
				previewLayers: {
					value: hasBackReferenceImage ? [{ group: "back" }] : [],
				},
			},
		},
		state: { mode: "camera" },
		exportController: {
			isRenderLocked: () => false,
		},
		fpsMovement: {
			update: () => {},
		},
		pointerControls: {
			update: () => {},
		},
		getActiveCamera: () => camera,
		getShotCameraRollLock: () => false,
		setShotCameraRollAngleDegrees: () => {},
		getActiveCameraViewCamera: () => camera,
		getActiveViewportCamera: () => camera,
		guideOverlay: {
			captureState: () => ({
				gridVisible,
				gridLayerMode,
			}),
			renderBackground: () => calls.push("grid-background"),
			renderOverlay: () => {},
			renderViewportOverlay: () => {},
		},
		handleResize: () => {},
		advanceProjectionFrame: () => {},
		finalizeProjectionFrame: () => {},
		syncViewportProjection: () => {},
		syncShotProjection: () => {},
		applyCameraViewProjection: () => {},
		syncGuideOverlayState: () => {},
		syncMeasurementSceneHelpers: () => {},
		updateShotCameraHelpers: () => {},
		syncPerSplatEditSceneHelper: () => {},
		syncMeasurementOverlay: () => {},
		syncViewportTransformGizmo: () => {},
		syncViewportAxisGizmo: () => {},
		updateOutputFrameOverlay: () => {},
		updateCameraSummary: () => calls.push("camera-summary"),
		syncReferenceImagePreview: () => {},
		syncProjectPresentation: () => calls.push("project-presentation"),
		navigationHistory: {
			noteFrame: (entry: { poseChanged: boolean }) =>
				calls.push(`note:${entry.poseChanged}`),
		},
		isSplatEditModeActive: () => false,
		flushNavigationHistory: () => {},
		snapshotCameraPose: (nextCamera: THREE.PerspectiveCamera) => {
			snapshotX = nextCamera.position.x;
		},
		hasCameraPoseChanged: (nextCamera: THREE.PerspectiveCamera) =>
			nextCamera.position.x !== snapshotX,
		hasKeyboardNavigationActivity: () => false,
		hasPointerNavigationActivity: () => false,
		getActiveCameraHistoryTargetKey: () => "shot:camera-1",
		getActiveCameraHistoryLabel: () => "camera.pose",
	});

	return { animate, camera, calls, scene };
}

{
	const originalWindow = globalThis.window;
	globalThis.window = { __cameraFramesTiming: false } as typeof window;
	const { animate, camera, calls } = createHarness();
	try {
		camera.position.x = 1;

		animate(16);

		assert.ok(calls.includes("project-presentation"));
		assert.ok(calls.includes("camera-summary"));
		assert.ok(calls.includes("note:true"));

		calls.length = 0;
		animate(32);

		assert.ok(!calls.includes("project-presentation"));
		assert.ok(!calls.includes("camera-summary"));
		assert.ok(calls.includes("note:false"));
	} finally {
		globalThis.window = originalWindow;
	}
}

{
	const originalWindow = globalThis.window;
	globalThis.window = { __cameraFramesTiming: false } as typeof window;
	const background = new THREE.Color(0x08111d);
	const { animate, calls, scene } = createHarness({
		hasBackReferenceImage: true,
		gridVisible: true,
		gridLayerMode: "bottom",
		sceneBackground: background,
	});
	try {
		animate(16);

		assert.ok(calls.includes("clear-alpha:0"));
		assert.ok(
			calls.indexOf("grid-background") < calls.indexOf("render:bg-null"),
		);
		assert.equal(scene.background, background);
	} finally {
		globalThis.window = originalWindow;
	}
}

{
	const originalWindow = globalThis.window;
	globalThis.window = { __cameraFramesTiming: false } as typeof window;
	const background = new THREE.Color(0x08111d);
	const { animate, calls } = createHarness({
		hasBackReferenceImage: false,
		sceneBackground: background,
	});
	try {
		animate(16);

		assert.ok(calls.includes("clear-alpha:1"));
		assert.ok(calls.includes("render:bg-color"));
	} finally {
		globalThis.window = originalWindow;
	}
}

console.log("✅ CAMERA_FRAMES runtime animate loop tests passed!");
