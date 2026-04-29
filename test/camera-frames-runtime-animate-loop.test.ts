import assert from "node:assert/strict";
import * as THREE from "three";
import { createRuntimeAnimateLoop } from "../src/controllers/runtime/animate-loop.js";

function createHarness() {
	const calls: string[] = [];
	const camera = new THREE.PerspectiveCamera();
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
		setClearColor() {},
		clear() {},
		render() {},
	};
	const animate = createRuntimeAnimateLoop({
		renderer,
		scene: { background: null },
		store: {
			shotCamera: {
				rollDeg: { value: 0 },
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
				gridVisible: false,
				gridLayerMode: "bottom",
			}),
			renderBackground: () => {},
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

	return { animate, camera, calls };
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

console.log("✅ CAMERA_FRAMES runtime animate loop tests passed!");
