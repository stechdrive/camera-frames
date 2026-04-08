import * as THREE from "three";
import { GUIDE_GRID_LAYER_MODE_BOTTOM } from "../engine/guide-overlays.js";
import { bindInputRouter } from "../interactions/input-router.js";
import { WORKSPACE_PANE_CAMERA } from "../workspace-model.js";
import { createNavigationHistoryController } from "./navigation-history.js";

export function createRuntimeController({
	renderer,
	scene,
	store,
	state,
	viewportShell,
	dropHint,
	anchorDot,
	assetController,
	importOpenedFiles,
	importReferenceImageFiles,
	supportsReferenceImageFile,
	updateDropHint,
	updateUi,
	updateOutputFrameOverlay,
	syncReferenceImagePreview,
	setStatus,
	startOrbitAroundHitDrag,
	startZoomToolDrag,
	startLensAdjustDrag,
	startShotCameraRollDrag,
	startViewportOrthographicPanDrag,
	toggleMeasurementMode,
	toggleZoomTool,
	toggleViewportSelectMode,
	toggleSplatEditMode,
	isSplatEditModeActive,
	hasSplatSelection,
	clearSplatSelection,
	selectAllSplats,
	invertSplatSelection,
	isSplatEditBrushActive,
	needsSplatEditBoxPlacement,
	placeSplatEditBoxAtPointer,
	applySplatEditBrushAtPointer,
	startSplatEditBrushStroke,
	handleSplatEditBrushStrokeMove,
	finishSplatEditBrushStroke,
	updateSplatEditBrushPreview,
	clearSplatEditBrushPreview,
	toggleViewportReferenceImageEditMode,
	toggleViewportTransformMode,
	toggleViewportPivotEditMode,
	saveProject,
	exportProject,
	openFiles,
	startNewProject,
	isProjectDirty,
	isPackageDirty,
	shouldWarnBeforeUnload,
	syncProjectPresentation,
	suspendProjectPresentationSync,
	establishProjectDirtyBaseline,
	undoHistory,
	redoHistory,
	clearSceneAssetSelection,
	beginHistoryTransaction,
	commitHistoryTransaction,
	isInteractiveTextTarget,
	isZoomInteractionMode,
	isPieInteractionMode,
	isLensInteractionMode,
	isRollInteractionMode,
	isViewportOrthographicActive,
	applyNavigateInteractionMode,
	syncControlsToMode,
	ensurePerspectiveForViewportRotation,
	captureViewportProjectionState,
	restoreViewportProjectionState,
	openViewportPieMenu,
	updateViewportPiePointer,
	finishViewportPieMenu,
	closeViewportPieMenu,
	handleViewportPieAction,
	isFrameSelectionActive,
	isReferenceImageSelectionActive,
	clearFrameSelection,
	clearReferenceImageSelection,
	clearOutputFrameSelection,
	handleOrbitAroundHitDragMove,
	handleOrbitAroundHitDragEnd,
	handleZoomToolDragMove,
	handleZoomToolDragEnd,
	handleLensAdjustDragMove,
	handleLensAdjustDragEnd,
	handleShotCameraRollDragMove,
	handleShotCameraRollDragEnd,
	handleViewportOrthographicPanMove,
	handleViewportOrthographicPanEnd,
	handleViewportOrthographicWheel,
	handleOutputFramePanMove,
	handleOutputFramePanEnd,
	handleOutputFrameResizeMove,
	handleOutputFrameResizeEnd,
	handleOutputFrameAnchorDragMove,
	handleOutputFrameAnchorDragEnd,
	handleFrameDragMove,
	handleFrameDragEnd,
	handleFrameResizeMove,
	handleFrameResizeEnd,
	handleFrameRotateMove,
	handleFrameRotateEnd,
	handleFrameAnchorDragMove,
	handleFrameAnchorDragEnd,
	handleViewportTransformDragMove,
	handleViewportTransformDragEnd,
	pickViewportAssetAtPointer,
	handleMeasurementPointerDown,
	handleMeasurementHoverMove,
	clearSelectedMeasurementPoint,
	deleteSelectedMeasurement,
	syncMeasurementSceneHelpers,
	syncPerSplatEditSceneHelper,
	startOutputFrameAnchorDrag,
	exportController,
	handleResize,
	fpsMovement,
	pointerControls,
	getActiveCamera,
	getShotCameraRollLock,
	setShotCameraRollAngleDegrees,
	guideOverlay,
	syncGuideOverlayState,
	syncMeasurementOverlay,
	syncViewportTransformGizmo,
	syncViewportAxisGizmo,
	syncViewportProjection,
	advanceProjectionFrame,
	finalizeProjectionFrame,
	syncShotProjection,
	applyCameraViewProjection,
	updateShotCameraHelpers,
	getActiveCameraViewCamera,
	getActiveViewportCamera,
	updateCameraSummary,
	t,
	formatNumber,
	frameAllCameras,
	placeAllCamerasAtHome,
	applyInitialNavigateInteractionMode,
	loadStartupUrls,
	setExportStatus,
}) {
	let lastFrameTime = 0;
	const disposers = [];
	const navigationHistory = createNavigationHistoryController({
		beginHistoryTransaction,
		commitHistoryTransaction,
	});
	const renderViewportSize = new THREE.Vector2();
	const _tempClearColor = new THREE.Color();

	function getActiveCameraHistoryTargetKey() {
		return state.mode === WORKSPACE_PANE_CAMERA
			? `shot:${store.workspace.activeShotCameraId.value}`
			: "viewport";
	}

	function getActiveCameraHistoryLabel() {
		return state.mode === WORKSPACE_PANE_CAMERA
			? "camera.pose"
			: "viewport.pose";
	}

	const POSE_EPSILON = 1e-7;
	const lastPoseSnapshot = {
		px: Number.NaN,
		py: Number.NaN,
		pz: Number.NaN,
		qx: Number.NaN,
		qy: Number.NaN,
		qz: Number.NaN,
		qw: Number.NaN,
		isOrtho: false,
		left: Number.NaN,
		right: Number.NaN,
		top: Number.NaN,
		bottom: Number.NaN,
		zoom: Number.NaN,
	};

	function snapshotCameraPose(camera) {
		if (!camera) {
			return;
		}
		lastPoseSnapshot.px = camera.position.x;
		lastPoseSnapshot.py = camera.position.y;
		lastPoseSnapshot.pz = camera.position.z;
		lastPoseSnapshot.qx = camera.quaternion.x;
		lastPoseSnapshot.qy = camera.quaternion.y;
		lastPoseSnapshot.qz = camera.quaternion.z;
		lastPoseSnapshot.qw = camera.quaternion.w;
		lastPoseSnapshot.isOrtho = Boolean(camera.isOrthographicCamera);
		if (camera.isOrthographicCamera) {
			lastPoseSnapshot.left = camera.left;
			lastPoseSnapshot.right = camera.right;
			lastPoseSnapshot.top = camera.top;
			lastPoseSnapshot.bottom = camera.bottom;
			lastPoseSnapshot.zoom = camera.zoom;
		}
	}

	function hasCameraPoseChanged(camera) {
		if (!camera) {
			return false;
		}
		const s = lastPoseSnapshot;
		const eps = POSE_EPSILON;
		if (
			Math.abs(camera.position.x - s.px) > eps ||
			Math.abs(camera.position.y - s.py) > eps ||
			Math.abs(camera.position.z - s.pz) > eps ||
			Math.abs(camera.quaternion.x - s.qx) > eps ||
			Math.abs(camera.quaternion.y - s.qy) > eps ||
			Math.abs(camera.quaternion.z - s.qz) > eps ||
			Math.abs(camera.quaternion.w - s.qw) > eps
		) {
			return true;
		}
		if (camera.isOrthographicCamera) {
			return (
				Math.abs(camera.left - s.left) > eps ||
				Math.abs(camera.right - s.right) > eps ||
				Math.abs(camera.top - s.top) > eps ||
				Math.abs(camera.bottom - s.bottom) > eps ||
				Math.abs(camera.zoom - s.zoom) > eps
			);
		}
		return s.isOrtho !== Boolean(camera.isOrthographicCamera);
	}

	function hasKeyboardNavigationActivity() {
		if (!fpsMovement.enable) {
			return false;
		}

		return (
			Object.values(fpsMovement.keydown ?? {}).some(Boolean) ||
			Object.values(fpsMovement.keycode ?? {}).some(Boolean)
		);
	}

	function hasPointerNavigationActivity() {
		const EPSILON = 1e-6;
		return (
			Boolean(pointerControls.rotating || pointerControls.sliding) ||
			pointerControls.moveVelocity.lengthSq() > EPSILON ||
			pointerControls.rotateVelocity.lengthSq() > EPSILON ||
			pointerControls.scroll.lengthSq() > EPSILON
		);
	}

	function requestNavigationHistoryCommit() {
		navigationHistory.requestCommit();
	}

	function flushNavigationHistory() {
		navigationHistory.flush();
	}

	function listen(target, eventName, handler, options = false) {
		target.addEventListener(eventName, handler, options);
		disposers.push(() =>
			target.removeEventListener(eventName, handler, options),
		);
	}

	function bindViewportInteractions() {
		bindInputRouter({
			listen,
			viewportShell,
			dropHint,
			anchorDot,
			importOpenedFiles,
			assetController,
			importReferenceImageFiles,
			supportsReferenceImageFile,
			updateDropHint,
			updateUi,
			updateOutputFrameOverlay,
			setStatus,
			startOrbitAroundHitDrag,
			startZoomToolDrag,
			startLensAdjustDrag,
			startShotCameraRollDrag,
			startViewportOrthographicPanDrag,
			toggleMeasurementMode,
			toggleZoomTool,
			toggleViewportSelectMode,
			toggleSplatEditMode,
			isSplatEditModeActive,
			hasSplatSelection,
			clearSplatSelection,
			selectAllSplats,
			invertSplatSelection,
			isSplatEditBrushActive,
			needsSplatEditBoxPlacement,
			placeSplatEditBoxAtPointer,
			applySplatEditBrushAtPointer,
			startSplatEditBrushStroke,
			handleSplatEditBrushStrokeMove,
			finishSplatEditBrushStroke,
			updateSplatEditBrushPreview,
			clearSplatEditBrushPreview,
			toggleViewportReferenceImageEditMode,
			toggleViewportTransformMode,
			toggleViewportPivotEditMode,
			saveProject,
			exportProject,
			openFiles,
			startNewProject,
			undoHistory,
			redoHistory,
			clearSceneAssetSelection,
			requestNavigationHistoryCommit,
			flushNavigationHistory,
			isInteractiveTextTarget,
			isViewportSelectMode: () => store.viewportSelectMode.value,
			isViewportReferenceImageEditMode: () =>
				store.viewportReferenceImageEditMode.value,
			getActiveCamera,
			isZoomInteractionMode,
			isPieInteractionMode,
			isLensInteractionMode,
			isRollInteractionMode,
			isViewportOrthographicActive,
			applyNavigateInteractionMode,
			syncControlsToMode,
			ensurePerspectiveForViewportRotation,
			captureViewportProjectionState,
			restoreViewportProjectionState,
			openViewportPieMenu,
			updateViewportPiePointer,
			finishViewportPieMenu,
			closeViewportPieMenu,
			handleViewportPieAction,
			state,
			fpsMovement,
			pointerControls,
			isFrameSelectionActive,
			isReferenceImageSelectionActive,
			clearFrameSelection,
			clearReferenceImageSelection,
			clearOutputFrameSelection,
			handleOrbitAroundHitDragMove,
			handleOrbitAroundHitDragEnd,
			handleZoomToolDragMove,
			handleZoomToolDragEnd,
			handleLensAdjustDragMove,
			handleLensAdjustDragEnd,
			handleShotCameraRollDragMove,
			handleShotCameraRollDragEnd,
			handleViewportOrthographicPanMove,
			handleViewportOrthographicPanEnd,
			handleViewportOrthographicWheel,
			handleOutputFramePanMove,
			handleOutputFramePanEnd,
			handleOutputFrameResizeMove,
			handleOutputFrameResizeEnd,
			handleOutputFrameAnchorDragMove,
			handleOutputFrameAnchorDragEnd,
			handleFrameDragMove,
			handleFrameDragEnd,
			handleFrameResizeMove,
			handleFrameResizeEnd,
			handleFrameRotateMove,
			handleFrameRotateEnd,
			handleFrameAnchorDragMove,
			handleFrameAnchorDragEnd,
			handleViewportTransformDragMove,
			handleViewportTransformDragEnd,
			pickViewportAssetAtPointer,
			handleMeasurementPointerDown,
			handleMeasurementHoverMove,
			clearSelectedMeasurementPoint,
			deleteSelectedMeasurement,
			startOutputFrameAnchorDrag,
			isInteractionBlocked: () => exportController.isRenderLocked(),
		});

		listen(window, "beforeunload", (event) => {
			const shouldWarn =
				typeof shouldWarnBeforeUnload === "function"
					? shouldWarnBeforeUnload()
					: (isProjectDirty?.() ?? false) || (isPackageDirty?.() ?? false);
			if (!shouldWarn) {
				return;
			}
			event.preventDefault();
			event.returnValue = "";
		});
	}

	let _timingFrameCount = 0;
	const _timingAccum = {
		setup: 0,
		input: 0,
		projection: 0,
		helpers: 0,
		render: 0,
		overlays: 0,
		ui: 0,
	};

	function animate(timeMs) {
		const timing = window.__cameraFramesTiming;
		let t0, t1, t2, t3, t4, t5, t6;
		if (timing) t0 = performance.now();

		advanceProjectionFrame?.();
		handleResize();
		if (exportController.isRenderLocked()) {
			flushNavigationHistory();
			updateOutputFrameOverlay();
			syncReferenceImagePreview?.();
			return;
		}

		const deltaTime =
			lastFrameTime > 0 ? Math.min((timeMs - lastFrameTime) / 1000, 0.1) : 0;
		lastFrameTime = timeMs;
		const activeCamera = getActiveCamera();
		const lockedRollDegrees =
			state.mode === WORKSPACE_PANE_CAMERA && getShotCameraRollLock?.()
				? Number(store.shotCamera.rollDeg.value)
				: null;
		snapshotCameraPose(activeCamera);
		const navigationActiveBeforeUpdate =
			hasKeyboardNavigationActivity() || hasPointerNavigationActivity();
		fpsMovement.update(deltaTime, activeCamera);
		pointerControls.update(deltaTime, activeCamera, activeCamera);
		if (Number.isFinite(lockedRollDegrees)) {
			setShotCameraRollAngleDegrees?.(lockedRollDegrees);
		}
		const poseChanged = hasCameraPoseChanged(activeCamera);
		snapshotCameraPose(activeCamera);
		navigationHistory.noteFrame({
			targetKey: getActiveCameraHistoryTargetKey(),
			label: getActiveCameraHistoryLabel(),
			poseChanged,
			navigationActive:
				navigationActiveBeforeUpdate ||
				hasKeyboardNavigationActivity() ||
				hasPointerNavigationActivity(),
			deltaMs: deltaTime * 1000,
		});
		if (poseChanged) {
			syncProjectPresentation?.();
		}

		if (timing) t1 = performance.now();

		syncViewportProjection();
		syncShotProjection();
		applyCameraViewProjection();

		if (timing) t2 = performance.now();

		syncGuideOverlayState();
		syncMeasurementSceneHelpers?.();
		updateShotCameraHelpers();

		if (timing) t3 = performance.now();

		const renderCamera =
			state.mode === WORKSPACE_PANE_CAMERA
				? getActiveCameraViewCamera()
				: getActiveViewportCamera();
		renderer.getSize(renderViewportSize);
		if (isSplatEditModeActive?.()) {
			syncPerSplatEditSceneHelper?.(renderCamera, renderViewportSize);
		}
		const guideState = guideOverlay.captureState();
		const previousAutoClear = renderer.autoClear;
		const previousBackground = scene.background;
		const previousClearAlpha = renderer.getClearAlpha();
		renderer.getClearColor(_tempClearColor);
		const clearColor = previousBackground?.isColor ? previousBackground : null;
		renderer.autoClear = true;
		renderer.setClearColor(clearColor ?? 0x08111d, 1);
		renderer.clear();
		if (
			guideState.gridVisible &&
			guideState.gridLayerMode === GUIDE_GRID_LAYER_MODE_BOTTOM
		) {
			guideOverlay.renderBackground(renderer, renderCamera);
			renderer.autoClear = false;
			scene.background = null;
			renderer.render(scene, renderCamera);
		} else {
			scene.background = previousBackground;
			renderer.autoClear = false;
			renderer.render(scene, renderCamera);
		}

		if (timing) t4 = performance.now();

		guideOverlay.renderOverlay(renderer, renderCamera);
		guideOverlay.renderViewportOverlay?.(renderer, renderCamera);
		scene.background = previousBackground;
		renderer.setClearColor(_tempClearColor, previousClearAlpha);
		renderer.autoClear = previousAutoClear;

		if (timing) t5 = performance.now();

		syncMeasurementOverlay?.();
		syncViewportTransformGizmo?.();
		syncViewportAxisGizmo?.();
		updateOutputFrameOverlay();
		syncReferenceImagePreview?.();

		if (timing) t6 = performance.now();

		finalizeProjectionFrame?.();

		if (timing) {
			_timingAccum.setup += t1 - t0;
			_timingAccum.projection += t2 - t1;
			_timingAccum.helpers += t3 - t2;
			_timingAccum.render += t4 - t3;
			_timingAccum.overlays += t5 - t4;
			_timingAccum.ui += t6 - t5;
			_timingFrameCount++;
			if (_timingFrameCount >= 60) {
				const n = _timingFrameCount;
				console.log(
					`[frame-timing] avg over ${n} frames: ` +
						`setup=${(_timingAccum.setup / n).toFixed(2)}ms ` +
						`proj=${(_timingAccum.projection / n).toFixed(2)}ms ` +
						`helpers=${(_timingAccum.helpers / n).toFixed(2)}ms ` +
						`render=${(_timingAccum.render / n).toFixed(2)}ms ` +
						`overlays=${(_timingAccum.overlays / n).toFixed(2)}ms ` +
						`ui=${(_timingAccum.ui / n).toFixed(2)}ms ` +
						`total=${((t6 - t0)).toFixed(2)}ms`,
				);
				_timingFrameCount = 0;
				for (const k in _timingAccum) _timingAccum[k] = 0;
			}
		}
	}

	function init() {
		suspendProjectPresentationSync?.(true);
		document.body.dataset.mode = state.mode;
		store.sceneSummary.value = "";
		store.sceneScaleSummary.value = "";
		store.exportSummary.value = t("exportSummary.empty");
		setStatus("");
		setExportStatus("export.idle");
		placeAllCamerasAtHome();
		syncControlsToMode();
		applyInitialNavigateInteractionMode();
		handleResize();
		bindViewportInteractions();
		suspendProjectPresentationSync?.(false);
		establishProjectDirtyBaseline?.();
		updateUi();
		renderer.setAnimationLoop(animate);
		loadStartupUrls();
	}

	function dispose() {
		renderer.setAnimationLoop(null);
		while (disposers.length > 0) {
			const dispose = disposers.pop();
			dispose();
		}
		fpsMovement.enable = false;
		pointerControls.enable = false;
		flushNavigationHistory();
		exportController.dispose();
		renderer.dispose();
	}

	return {
		init,
		dispose,
	};
}
