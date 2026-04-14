import assert from "node:assert/strict";
import { createRuntimeController } from "../src/controllers/runtime-controller.js";

class FakeEventTarget {
	listeners = new Map();

	addEventListener(type: string, handler: unknown, options?: unknown) {
		if (!this.listeners.has(type)) {
			this.listeners.set(type, []);
		}
		this.listeners.get(type).push({ handler, options });
	}

	removeEventListener(type: string, handler: unknown) {
		const handlers = this.listeners.get(type) ?? [];
		this.listeners.set(
			type,
			handlers.filter((entry) => entry.handler !== handler),
		);
	}
}

{
	const originalWindow = globalThis.window;
	const originalDocument = globalThis.document;
	const calls: string[] = [];
	const windowRef = Object.assign(new FakeEventTarget(), {
		clearTimeout,
		setTimeout,
	});
	const documentRef = {
		body: { dataset: {} as Record<string, string> },
		activeElement: null,
	};
	globalThis.window = windowRef as typeof window;
	globalThis.document = documentRef as Document;

	try {
		const viewportShell = Object.assign(new FakeEventTarget(), {
			setPointerCapture() {},
			getBoundingClientRect() {
				return {
					left: 0,
					top: 0,
					width: 800,
					height: 600,
				};
			},
			clientWidth: 800,
			clientHeight: 600,
			parentElement: {
				clientWidth: 800,
				clientHeight: 600,
			},
		});
		const dropHint = new FakeEventTarget();
		const anchorDot = new FakeEventTarget();
		const renderer = {
			loop: undefined as ((timeMs?: number) => void) | null | undefined,
			setAnimationLoop(callback: ((timeMs?: number) => void) | null) {
				this.loop = callback;
				calls.push(callback ? "set-loop" : "clear-loop");
			},
			dispose() {
				calls.push("renderer-dispose");
			},
		};
		const controller = createRuntimeController({
			renderer,
			scene: {},
			store: {
				sceneSummary: { value: "" },
				sceneScaleSummary: { value: "" },
				exportSummary: { value: "" },
				viewportSelectMode: { value: false },
				viewportReferenceImageEditMode: { value: false },
				workspace: { activeShotCameraId: { value: "shot-camera-1" } },
				shotCamera: {
					rollDeg: { value: 0 },
				},
			},
			state: {
				mode: "camera",
				interactionMode: "navigate",
			},
			viewportShell,
			dropHint,
			anchorDot,
			assetController: {
				importDroppedFiles: async () => {},
				loadStartupUrls: () => calls.push("load-startup"),
			},
			updateDropHint: () => {},
			updateUi: () => calls.push("ui"),
			updateOutputFrameOverlay: () => calls.push("overlay"),
			syncReferenceImagePreview: () => calls.push("reference-preview"),
			setStatus: () => calls.push("status"),
			startOrbitAroundHitDrag: () => false,
			startZoomToolDrag: () => false,
			startLensAdjustDrag: () => false,
			startShotCameraRollDrag: () => false,
			startViewportOrthographicPanDrag: () => false,
			toggleMeasurementMode: () => {},
			toggleZoomTool: () => {},
			toggleViewportSelectMode: () => {},
			toggleSplatEditMode: () => {},
			isSplatEditModeActive: () => false,
			hasSplatSelection: () => false,
			clearSplatSelection: () => {},
			selectAllSplats: () => {},
			invertSplatSelection: () => {},
			isSplatEditBrushActive: () => false,
			needsSplatEditBoxPlacement: () => false,
			placeSplatEditBoxAtPointer: () => false,
			applySplatEditBrushAtPointer: () => false,
			startSplatEditBrushStroke: () => false,
			handleSplatEditBrushStrokeMove: () => false,
			finishSplatEditBrushStroke: () => false,
			updateSplatEditBrushPreview: () => false,
			clearSplatEditBrushPreview: () => false,
			toggleViewportReferenceImageEditMode: () => {},
			toggleViewportTransformMode: () => {},
			toggleViewportPivotEditMode: () => {},
			saveProject: () => {},
			exportProject: () => {},
			openFiles: () => {},
			startNewProject: () => {},
			isProjectDirty: () => false,
			isPackageDirty: () => false,
			shouldWarnBeforeUnload: () => false,
			syncProjectPresentation: () => {},
			suspendProjectPresentationSync: () => {},
			establishProjectDirtyBaseline: () => calls.push("baseline"),
			undoHistory: () => {},
			redoHistory: () => {},
			clearSceneAssetSelection: () => {},
			beginHistoryTransaction: () => {},
			commitHistoryTransaction: () => {},
			isInteractiveTextTarget: () => false,
			isZoomInteractionMode: () => false,
			isPieInteractionMode: () => false,
			isLensInteractionMode: () => false,
			isRollInteractionMode: () => false,
			isViewportOrthographicActive: () => false,
			applyNavigateInteractionMode: () => calls.push("apply-navigate"),
			syncControlsToMode: () => calls.push("sync-controls"),
			ensurePerspectiveForViewportRotation: () => false,
			captureViewportProjectionState: () => null,
			restoreViewportProjectionState: () => false,
			openViewportPieMenu: () => {},
			updateViewportPiePointer: () => {},
			finishViewportPieMenu: () => null,
			closeViewportPieMenu: () => {},
			handleViewportPieAction: () => {},
			isFrameSelectionActive: () => false,
			isReferenceImageSelectionActive: () => false,
			clearFrameSelection: () => {},
			clearReferenceImageSelection: () => {},
			clearOutputFrameSelection: () => {},
			handleOrbitAroundHitDragMove: () => {},
			handleOrbitAroundHitDragEnd: () => {},
			handleZoomToolDragMove: () => {},
			handleZoomToolDragEnd: () => {},
			handleLensAdjustDragMove: () => {},
			handleLensAdjustDragEnd: () => {},
			handleShotCameraRollDragMove: () => {},
			handleShotCameraRollDragEnd: () => {},
			handleViewportOrthographicPanMove: () => {},
			handleViewportOrthographicPanEnd: () => {},
			handleViewportOrthographicWheel: () => false,
			handleOutputFramePanMove: () => {},
			handleOutputFramePanEnd: () => {},
			handleOutputFrameResizeMove: () => {},
			handleOutputFrameResizeEnd: () => {},
			handleOutputFrameAnchorDragMove: () => {},
			handleOutputFrameAnchorDragEnd: () => {},
			handleFrameDragMove: () => {},
			handleFrameDragEnd: () => {},
			handleFrameResizeMove: () => {},
			handleFrameResizeEnd: () => {},
			handleFrameRotateMove: () => {},
			handleFrameRotateEnd: () => {},
			handleFrameAnchorDragMove: () => {},
			handleFrameAnchorDragEnd: () => {},
			handleFrameTrajectoryHandleDragMove: () => {},
			handleFrameTrajectoryHandleDragEnd: () => {},
			handleViewportTransformDragMove: () => {},
			handleViewportTransformDragEnd: () => {},
			pickViewportAssetAtPointer: () => false,
			handleMeasurementPointerDown: () => false,
			handleMeasurementHoverMove: () => {},
			clearSelectedMeasurementPoint: () => false,
			deleteSelectedMeasurement: () => false,
			syncMeasurementSceneHelpers: () => {},
			syncPerSplatEditSceneHelper: () => {},
			startOutputFrameAnchorDrag: () => {},
			exportController: {
				isRenderLocked: () => false,
				dispose: () => calls.push("export-dispose"),
			},
			handleResize: () => calls.push("resize"),
			fpsMovement: {
				enable: false,
			},
			pointerControls: {
				enable: false,
			},
			getActiveCamera: () => null,
			getShotCameraRollLock: () => false,
			setShotCameraRollAngleDegrees: () => {},
			guideOverlay: {
				captureState: () => ({
					gridVisible: true,
					gridLayerMode: "bottom",
				}),
				renderBackground: () => {},
				renderOverlay: () => {},
				renderViewportOverlay: () => {},
			},
			syncGuideOverlayState: () => {},
			syncMeasurementOverlay: () => {},
			syncViewportTransformGizmo: () => {},
			syncViewportAxisGizmo: () => {},
			syncViewportProjection: () => {},
			advanceProjectionFrame: () => {},
			finalizeProjectionFrame: () => {},
			syncShotProjection: () => {},
			applyCameraViewProjection: () => {},
			updateShotCameraHelpers: () => {},
			getActiveCameraViewCamera: () => null,
			getActiveViewportCamera: () => null,
			updateCameraSummary: () => {},
			t: (key: string) => key,
			formatNumber: (value: number) => String(value),
			frameAllCameras: () => {},
			placeAllCamerasAtHome: () => calls.push("home"),
			applyInitialNavigateInteractionMode: () => calls.push("initial-nav"),
			loadStartupUrls: () => calls.push("load-startup-direct"),
			setExportStatus: () => calls.push("export-status"),
		});

		controller.init();

		assert.equal(typeof renderer.loop, "function");
		assert.deepEqual(calls.slice(0, 8), [
			"status",
			"export-status",
			"home",
			"sync-controls",
			"initial-nav",
			"resize",
			"baseline",
			"ui",
		]);
		assert.ok(calls.includes("load-startup-direct"));

		controller.dispose();
		assert.deepEqual(calls.slice(-3), [
			"clear-loop",
			"export-dispose",
			"renderer-dispose",
		]);
	} finally {
		globalThis.window = originalWindow;
		globalThis.document = originalDocument;
	}
}

console.log("✅ CAMERA_FRAMES runtime controller tests passed!");
