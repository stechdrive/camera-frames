import assert from "node:assert/strict";
import { createRuntimeControllerBindings } from "../src/app/runtime-controller-bindings.js";

{
	let suspended = false;
	const calls = [];
	const bindings = createRuntimeControllerBindings({
		renderer: { id: "renderer" },
		scene: { id: "scene" },
		store: { shotCamera: { rollLock: { value: true } } },
		state: { mode: "camera" },
		viewportShell: { id: "viewport-shell" },
		dropHint: { id: "drop-hint" },
		anchorDot: { id: "anchor-dot" },
		assetController: {
			loadStartupUrls: () => "loaded",
		},
		referenceImageController: {
			importReferenceImageFiles: (...args) => args.join("|"),
			supportsReferenceImageFile: (name) => name.endsWith(".png"),
			isReferenceImageSelectionActive: () => true,
			clearReferenceImageSelection: () => calls.push("clear-reference"),
		},
		projectController: {
			startNewProject: () => calls.push("new"),
			isProjectDirty: () => true,
			isPackageDirty: () => false,
			shouldWarnBeforeUnload: () => true,
			syncProjectPresentation: () => calls.push("sync-project"),
			establishProjectDirtyBaseline: () => calls.push("baseline"),
			saveProject: () => calls.push("save"),
			exportProject: () => calls.push("export"),
		},
		historyController: {
			undoHistory: () => calls.push("undo"),
			redoHistory: () => calls.push("redo"),
			beginHistoryTransaction: (label) => `begin:${label}`,
			commitHistoryTransaction: (label) => `commit:${label}`,
		},
		interactionController: {
			startOrbitAroundHitDrag: () => true,
			isZoomInteractionMode: () => true,
			isPieInteractionMode: () => false,
			isLensInteractionMode: () => true,
			isRollInteractionMode: () => false,
			isViewportOrthographicActive: () => true,
			applyNavigateInteractionMode: (options) => options ?? "nav",
			ensurePerspectiveForViewportRotation: () => true,
			openViewportPieMenu: () => true,
			openViewportPieMenuAtCenter: () => true,
			updateViewportPiePointer: (...args) =>
				calls.push(["pie-pointer", ...args]),
			finishViewportPieMenu: () => "finish",
			closeViewportPieMenu: () => calls.push("close-pie"),
			handleOrbitAroundHitDragMove: (...args) =>
				calls.push(["orbit-move", ...args]),
			handleOrbitAroundHitDragEnd: (...args) =>
				calls.push(["orbit-end", ...args]),
			handleLensAdjustDragMove: (...args) => calls.push(["lens-move", ...args]),
			handleLensAdjustDragEnd: (...args) => calls.push(["lens-end", ...args]),
			handleShotCameraRollDragMove: (...args) =>
				calls.push(["roll-move", ...args]),
			handleShotCameraRollDragEnd: (...args) =>
				calls.push(["roll-end", ...args]),
			handleViewportOrthographicPanMove: (...args) =>
				calls.push(["ortho-pan-move", ...args]),
			handleViewportOrthographicPanEnd: (...args) =>
				calls.push(["ortho-pan-end", ...args]),
			handleViewportOrthographicWheel: () => true,
		},
		projectionController: {
			setShotCameraRollAngleDegrees: (value) => calls.push(["roll-set", value]),
		},
		viewportProjectionController: {
			captureViewportProjectionState: () => ({ mode: "ortho" }),
			restoreViewportProjectionState: (snapshot) => snapshot.mode === "ortho",
		},
		outputFrameController: {
			clearOutputFrameSelection: () => calls.push("clear-output"),
			handleOutputFramePanMove: (...args) => calls.push(["pan-move", ...args]),
			handleOutputFramePanEnd: (...args) => calls.push(["pan-end", ...args]),
			handleOutputFrameResizeMove: (...args) =>
				calls.push(["resize-move", ...args]),
			handleOutputFrameResizeEnd: (...args) =>
				calls.push(["resize-end", ...args]),
			handleOutputFrameAnchorDragMove: (...args) =>
				calls.push(["anchor-move", ...args]),
			handleOutputFrameAnchorDragEnd: (...args) =>
				calls.push(["anchor-end", ...args]),
			startOutputFrameAnchorDrag: () => calls.push("start-anchor"),
		},
		frameController: {
			isFrameSelectionActive: () => true,
			clearFrameSelection: () => calls.push("clear-frame"),
			handleFrameDragMove: (...args) => calls.push(["frame-move", ...args]),
			handleFrameDragEnd: (...args) => calls.push(["frame-end", ...args]),
			handleFrameResizeMove: (...args) =>
				calls.push(["frame-resize-move", ...args]),
			handleFrameResizeEnd: (...args) =>
				calls.push(["frame-resize-end", ...args]),
			handleFrameRotateMove: (...args) =>
				calls.push(["frame-rotate-move", ...args]),
			handleFrameRotateEnd: (...args) =>
				calls.push(["frame-rotate-end", ...args]),
			handleFrameAnchorDragMove: (...args) =>
				calls.push(["frame-anchor-move", ...args]),
			handleFrameAnchorDragEnd: (...args) =>
				calls.push(["frame-anchor-end", ...args]),
			handleFrameTrajectoryHandleDragMove: (...args) =>
				calls.push(["frame-trajectory-move", ...args]),
			handleFrameTrajectoryHandleDragEnd: (...args) =>
				calls.push(["frame-trajectory-end", ...args]),
		},
		viewportToolController: {
			handleViewportTransformDragMove: (...args) =>
				calls.push(["transform-move", ...args]),
			handleViewportTransformDragEnd: (...args) =>
				calls.push(["transform-end", ...args]),
			pickViewportAssetAtPointer: (...args) => ({ args }),
			syncViewportTransformGizmo: () => calls.push("sync-gizmo"),
		},
		measurementController: {
			handleMeasurementPointerDown: () => true,
			handleMeasurementHoverMove: (...args) =>
				calls.push(["measure-hover", ...args]),
			clearSelectedMeasurementPoint: () => true,
			deleteSelectedMeasurement: () => true,
			syncMeasurementSceneHelpers: () => calls.push("sync-measure-scene"),
			syncMeasurementOverlay: () => calls.push("sync-measure-overlay"),
		},
		viewportAxisGizmoController: {
			syncViewportAxisGizmo: () => calls.push("sync-axis-gizmo"),
		},
		exportController: { id: "export" },
		updateDropHint: () => calls.push("drop-hint"),
		updateUi: () => calls.push("ui"),
		updateOutputFrameOverlay: () => calls.push("overlay"),
		setStatus: () => calls.push("status"),
		startZoomToolDrag: () => calls.push("zoom-start"),
		toggleMeasurementMode: () => calls.push("toggle-measure"),
		toggleZoomTool: () => calls.push("toggle-zoom"),
		toggleViewportSelectMode: () => calls.push("toggle-select"),
		toggleViewportReferenceImageEditMode: () => calls.push("toggle-reference"),
		toggleViewportTransformMode: () => calls.push("toggle-transform"),
		toggleViewportPivotEditMode: () => calls.push("toggle-pivot"),
		openFiles: () => calls.push("open-files"),
		clearSceneAssetSelection: () => calls.push("clear-assets"),
		isInteractiveTextTarget: () => false,
		executeViewportPieAction: (action) => calls.push(["pie-action", action]),
		handleZoomToolDragMove: () => calls.push("zoom-move"),
		handleZoomToolDragEnd: () => calls.push("zoom-end"),
		handleResize: () => calls.push("resize"),
		fpsMovement: { id: "fps" },
		pointerControls: { id: "pointer" },
		getActiveCamera: () => ({ id: "camera" }),
		guideOverlay: { id: "guide" },
		syncGuideOverlayState: () => calls.push("sync-guide"),
		syncViewportProjection: () => calls.push("sync-viewport"),
		syncShotProjection: () => calls.push("sync-shot"),
		applyCameraViewProjection: () => calls.push("apply-camera-view"),
		updateShotCameraHelpers: () => calls.push("shot-helpers"),
		getActiveCameraViewCamera: () => ({ id: "camera-view" }),
		getActiveViewportCamera: () => ({ id: "viewport-camera" }),
		updateCameraSummary: () => calls.push("camera-summary"),
		t: (value) => `t:${value}`,
		formatNumber: (value) => `n:${value}`,
		frameAllCameras: () => calls.push("frame-all"),
		placeAllCamerasAtHome: () => calls.push("home-all"),
		syncControlsToMode: () => calls.push("sync-controls"),
		setExportStatus: () => calls.push("export-status"),
		projectPresentationSyncSuspendedRef: {
			get value() {
				return suspended;
			},
			set value(nextValue) {
				suspended = nextValue;
			},
		},
	});

	assert.equal(bindings.renderer.id, "renderer");
	assert.equal(bindings.scene.id, "scene");
	assert.equal(bindings.importReferenceImageFiles("a", "b"), "a|b");
	assert.equal(bindings.supportsReferenceImageFile("foo.png"), true);
	assert.equal(bindings.isProjectDirty(), true);
	assert.equal(bindings.isPackageDirty(), false);
	assert.equal(bindings.shouldWarnBeforeUnload(), true);
	assert.deepEqual(bindings.captureViewportProjectionState(), {
		mode: "ortho",
	});
	assert.equal(
		bindings.restoreViewportProjectionState({ mode: "ortho" }),
		true,
	);
	assert.equal(bindings.startOrbitAroundHitDrag(), true);
	assert.equal(bindings.isZoomInteractionMode(), true);
	assert.equal(bindings.isReferenceImageSelectionActive(), true);
	assert.equal(bindings.isFrameSelectionActive(), true);
	assert.equal(bindings.handleMeasurementPointerDown(), true);
	assert.equal(bindings.clearSelectedMeasurementPoint(), true);
	assert.equal(bindings.deleteSelectedMeasurement(), true);
	assert.equal(bindings.getShotCameraRollLock(), true);
	assert.equal(bindings.beginHistoryTransaction("x"), "begin:x");
	assert.equal(bindings.commitHistoryTransaction("x"), "commit:x");
	bindings.handleFrameTrajectoryHandleDragMove("move");
	bindings.handleFrameTrajectoryHandleDragEnd("end");
	assert.deepEqual(calls.at(-2), ["frame-trajectory-move", "move"]);
	assert.deepEqual(calls.at(-1), ["frame-trajectory-end", "end"]);

	bindings.suspendProjectPresentationSync(true);
	assert.equal(suspended, true);
	bindings.setShotCameraRollAngleDegrees(12);
	assert.deepEqual(calls.at(-1), ["roll-set", 12]);
}

console.log("✅ CAMERA_FRAMES runtime controller bindings tests passed!");
