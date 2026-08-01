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

function createSplitPaneHarness({
	visibleRole = null,
	hasBackReferenceImage = false,
} = {}) {
	const calls: string[] = [];
	const clearStates: Array<{
		color: number;
		alpha: number;
		scissorTest: boolean;
	}> = [];
	const renderRoles: string[] = [];
	const cameraView = new THREE.PerspectiveCamera();
	const viewportCamera = new THREE.PerspectiveCamera();
	const originalBackground = new THREE.Color(0x182230);
	const scene = { background: originalBackground };
	let viewport = new THREE.Vector4(7, 8, 900, 700);
	let scissor = new THREE.Vector4(9, 10, 800, 600);
	let scissorTest = false;
	let clearColor = new THREE.Color(0x123456);
	let clearAlpha = 0.4;
	const originalGetDrawingBufferSize = (target: THREE.Vector2) =>
		target.set(1600, 1200);
	const renderer = {
		autoClear: false,
		getSize(target: THREE.Vector2) {
			target.set(800, 600);
			return target;
		},
		getViewport(target: THREE.Vector4) {
			return target.copy(viewport);
		},
		setViewport(
			x: number | THREE.Vector4,
			y?: number,
			width?: number,
			height?: number,
		) {
			viewport =
				x instanceof THREE.Vector4
					? x.clone()
					: new THREE.Vector4(x, y, width, height);
		},
		getScissor(target: THREE.Vector4) {
			return target.copy(scissor);
		},
		setScissor(
			x: number | THREE.Vector4,
			y?: number,
			width?: number,
			height?: number,
		) {
			scissor =
				x instanceof THREE.Vector4
					? x.clone()
					: new THREE.Vector4(x, y, width, height);
		},
		getScissorTest() {
			return scissorTest;
		},
		setScissorTest(value: boolean) {
			scissorTest = Boolean(value);
		},
		getPixelRatio() {
			return 2;
		},
		getDrawingBufferSize: originalGetDrawingBufferSize,
		getClearAlpha() {
			return clearAlpha;
		},
		getClearColor(target: THREE.Color) {
			return target.copy(clearColor);
		},
		setClearColor(color: THREE.Color | number, alpha: number) {
			clearColor =
				color instanceof THREE.Color ? color.clone() : new THREE.Color(color);
			clearAlpha = alpha;
		},
		clear() {
			calls.push("clear");
			clearStates.push({
				color: clearColor.getHex(),
				alpha: clearAlpha,
				scissorTest,
			});
		},
		render() {
			calls.push("renderer-render");
		},
	};
	const primarySparkCameras: THREE.Camera[] = [];
	const secondarySparkCameras: THREE.Camera[] = [];
	const paneRenderStates: Array<{
		kind: string;
		viewport: number[];
		scissor: number[];
		scissorTest: boolean;
		drawingBufferSize: number[];
	}> = [];
	function capturePaneRenderState(kind: string) {
		paneRenderStates.push({
			kind,
			viewport: renderer.getViewport(new THREE.Vector4()).toArray(),
			scissor: renderer.getScissor(new THREE.Vector4()).toArray(),
			scissorTest: renderer.getScissorTest(),
			drawingBufferSize: renderer
				.getDrawingBufferSize(new THREE.Vector2())
				.toArray(),
		});
	}
	const primarySpark = {
		render(_scene: unknown, camera: THREE.Camera) {
			primarySparkCameras.push(camera);
			capturePaneRenderState("primary");
		},
	};
	const secondarySpark = {
		lodSplatScale: 0,
		render(_scene: unknown, camera: THREE.Camera) {
			secondarySparkCameras.push(camera);
			capturePaneRenderState("secondary");
		},
	};
	const ensuredPaneIds: string[] = [];
	const syncedLodPaneIds: string[] = [];
	const workspaceSparkRendererManager = {
		ensure(paneId: string) {
			ensuredPaneIds.push(paneId);
			return secondarySpark;
		},
		syncPrimaryLodInstances(paneId: string) {
			syncedLodPaneIds.push(paneId);
			return secondarySpark;
		},
	};
	const canvasRect = {
		left: 0,
		top: 0,
		right: 800,
		bottom: 600,
		width: 800,
		height: 600,
	};
	const workspacePanes = visibleRole
		? [
				{
					id: visibleRole === "camera" ? "pane-camera" : "pane-viewport",
					role: visibleRole,
					rect: canvasRect,
				},
			]
		: [
				{
					id: "pane-camera",
					role: "camera",
					rect: { ...canvasRect, right: 396, width: 396 },
				},
				{
					id: "pane-viewport",
					role: "viewport",
					rect: { ...canvasRect, left: 404, width: 396 },
				},
			];
	const activeCamera = visibleRole === "viewport" ? viewportCamera : cameraView;
	const animate = createRuntimeAnimateLoop({
		renderer,
		scene,
		spark: primarySpark,
		workspaceSparkRendererManager,
		getWorkspaceRenderState: () => ({
			canvasRect,
			shellRect: canvasRect,
			panes: workspacePanes,
		}),
		store: {
			shotCamera: { rollDeg: { value: 0 } },
			workspace: { activeShotCameraId: { value: "shot-camera-1" } },
			referenceImages: {
				previewLayers: {
					value: hasBackReferenceImage ? [{ group: "back" }] : [],
				},
			},
			viewportLod: { effectiveScale: { value: 0.75 } },
		},
		state: { mode: visibleRole ?? "camera" },
		exportController: { isRenderLocked: () => false },
		fpsMovement: { update: () => {} },
		pointerControls: { update: () => {} },
		getActiveCamera: () => activeCamera,
		getShotCameraRollLock: () => false,
		setShotCameraRollAngleDegrees: () => {},
		getActiveCameraViewCamera: () => cameraView,
		getActiveViewportCamera: () => viewportCamera,
		guideOverlay: {
			captureState: () => ({ gridVisible: false, gridLayerMode: "bottom" }),
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
		syncGuideOverlayState: (_state, options) =>
			renderRoles.push(options.viewMode),
		syncMeasurementSceneHelpers: () => {},
		updateShotCameraHelpers: () => {},
		syncPerSplatEditSceneHelper: () => {},
		syncMeasurementOverlay: () => {},
		syncViewportTransformGizmo: () => {},
		syncViewportAxisGizmo: () => {},
		updateOutputFrameOverlay: () => {},
		updateCameraSummary: () => {},
		syncReferenceImagePreview: () => {},
		syncProjectPresentation: () => {},
		navigationHistory: { noteFrame: () => {} },
		isSplatEditModeActive: () => false,
		flushNavigationHistory: () => {},
		snapshotCameraPose: () => {},
		hasCameraPoseChanged: () => false,
		hasKeyboardNavigationActivity: () => false,
		hasPointerNavigationActivity: () => false,
		getActiveCameraHistoryTargetKey: () => "shot:camera-1",
		getActiveCameraHistoryLabel: () => "camera.pose",
	});

	return {
		animate,
		cameraView,
		viewportCamera,
		calls,
		clearStates,
		ensuredPaneIds,
		originalBackground,
		originalGetDrawingBufferSize,
		paneRenderStates,
		primarySparkCameras,
		renderRoles,
		renderer,
		scene,
		secondarySpark,
		secondarySparkCameras,
		syncedLodPaneIds,
	};
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

{
	const originalWindow = globalThis.window;
	globalThis.window = { __cameraFramesTiming: false } as typeof window;
	const {
		animate,
		cameraView,
		viewportCamera,
		calls,
		clearStates,
		ensuredPaneIds,
		originalBackground,
		originalGetDrawingBufferSize,
		paneRenderStates,
		primarySparkCameras,
		renderRoles,
		renderer,
		scene,
		secondarySpark,
		secondarySparkCameras,
		syncedLodPaneIds,
	} = createSplitPaneHarness({ hasBackReferenceImage: true });
	try {
		animate(16);

		assert.deepEqual(primarySparkCameras, [cameraView]);
		assert.deepEqual(secondarySparkCameras, [viewportCamera]);
		assert.deepEqual(renderRoles, ["camera", "viewport"]);
		assert.deepEqual(ensuredPaneIds, ["pane-viewport"]);
		assert.deepEqual(syncedLodPaneIds, ["pane-viewport"]);
		assert.equal(secondarySpark.lodSplatScale, 0.75);
		assert.equal(calls.includes("renderer-render"), false);
		assert.deepEqual(clearStates[0], {
			color: originalBackground.getHex(),
			alpha: 1,
			scissorTest: false,
		});
		assert.equal(clearStates.length, 3);
		assert.deepEqual(
			clearStates.map((entry) => entry.alpha),
			[1, 0, 1],
		);
		assert.ok(clearStates.slice(1).every((entry) => entry.scissorTest));
		assert.deepEqual(paneRenderStates, [
			{
				kind: "primary",
				viewport: [0, 0, 396, 600],
				scissor: [0, 0, 396, 600],
				scissorTest: true,
				drawingBufferSize: [792, 1200],
			},
			{
				kind: "secondary",
				viewport: [404, 0, 396, 600],
				scissor: [404, 0, 396, 600],
				scissorTest: true,
				drawingBufferSize: [792, 1200],
			},
		]);

		assert.deepEqual(
			renderer.getViewport(new THREE.Vector4()).toArray(),
			[7, 8, 900, 700],
		);
		assert.deepEqual(
			renderer.getScissor(new THREE.Vector4()).toArray(),
			[9, 10, 800, 600],
		);
		assert.equal(renderer.getScissorTest(), false);
		assert.equal(renderer.getDrawingBufferSize, originalGetDrawingBufferSize);
		assert.deepEqual(
			renderer.getDrawingBufferSize(new THREE.Vector2()).toArray(),
			[1600, 1200],
		);
		assert.equal(renderer.autoClear, false);
		assert.equal(renderer.getClearAlpha(), 0.4);
		assert.equal(renderer.getClearColor(new THREE.Color()).getHex(), 0x123456);
		assert.equal(scene.background, originalBackground);
	} finally {
		globalThis.window = originalWindow;
	}
}

{
	const originalWindow = globalThis.window;
	globalThis.window = { __cameraFramesTiming: false } as typeof window;
	try {
		for (const role of ["camera", "viewport"] as const) {
			const harness = createSplitPaneHarness({
				visibleRole: role,
				hasBackReferenceImage: true,
			});
			harness.animate(16);

			const expectedCamera =
				role === "camera" ? harness.cameraView : harness.viewportCamera;
			assert.deepEqual(harness.primarySparkCameras, [expectedCamera]);
			assert.deepEqual(harness.secondarySparkCameras, []);
			assert.deepEqual(harness.ensuredPaneIds, []);
			assert.deepEqual(harness.syncedLodPaneIds, []);
			assert.deepEqual(harness.renderRoles, [role]);
			assert.equal(harness.calls.includes("renderer-render"), false);
			assert.deepEqual(harness.clearStates, [
				{
					color: harness.originalBackground.getHex(),
					alpha: 0,
					scissorTest: true,
				},
			]);
			assert.deepEqual(harness.paneRenderStates, [
				{
					kind: "primary",
					viewport: [0, 0, 800, 600],
					scissor: [0, 0, 800, 600],
					scissorTest: true,
					drawingBufferSize: [1600, 1200],
				},
			]);

			assert.deepEqual(
				harness.renderer.getViewport(new THREE.Vector4()).toArray(),
				[7, 8, 900, 700],
			);
			assert.deepEqual(
				harness.renderer.getScissor(new THREE.Vector4()).toArray(),
				[9, 10, 800, 600],
			);
			assert.equal(harness.renderer.getScissorTest(), false);
			assert.equal(
				harness.renderer.getDrawingBufferSize,
				harness.originalGetDrawingBufferSize,
			);
			assert.deepEqual(
				harness.renderer.getDrawingBufferSize(new THREE.Vector2()).toArray(),
				[1600, 1200],
			);
			assert.equal(harness.renderer.autoClear, false);
			assert.equal(harness.renderer.getClearAlpha(), 0.4);
			assert.equal(
				harness.renderer.getClearColor(new THREE.Color()).getHex(),
				0x123456,
			);
			assert.equal(harness.scene.background, harness.originalBackground);
		}
	} finally {
		globalThis.window = originalWindow;
	}
}

console.log("✅ CAMERA_FRAMES runtime animate loop tests passed!");
