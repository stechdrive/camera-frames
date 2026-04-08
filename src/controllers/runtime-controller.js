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

	function getCameraPoseSignature(camera) {
		if (!camera) {
			return "none";
		}

		return [
			camera.position.x.toFixed(6),
			camera.position.y.toFixed(6),
			camera.position.z.toFixed(6),
			camera.quaternion.x.toFixed(6),
			camera.quaternion.y.toFixed(6),
			camera.quaternion.z.toFixed(6),
			camera.quaternion.w.toFixed(6),
			camera.isOrthographicCamera
				? [
						"ortho",
						Number(camera.left).toFixed(6),
						Number(camera.right).toFixed(6),
						Number(camera.top).toFixed(6),
						Number(camera.bottom).toFixed(6),
						Number(camera.zoom).toFixed(6),
					].join("|")
				: "perspective",
		].join("|");
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

	function animate(timeMs) {
		handleResize();
		if (exportController.isRenderLocked()) {
			flushNavigationHistory();
			updateOutputFrameOverlay();
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
		const poseBefore = getCameraPoseSignature(activeCamera);
		const navigationActiveBeforeUpdate =
			hasKeyboardNavigationActivity() || hasPointerNavigationActivity();
		fpsMovement.update(deltaTime, activeCamera);
		pointerControls.update(deltaTime, activeCamera, activeCamera);
		if (Number.isFinite(lockedRollDegrees)) {
			setShotCameraRollAngleDegrees?.(lockedRollDegrees);
		}
		const poseAfter = getCameraPoseSignature(activeCamera);
		navigationHistory.noteFrame({
			targetKey: getActiveCameraHistoryTargetKey(),
			label: getActiveCameraHistoryLabel(),
			poseChanged: poseBefore !== poseAfter,
			navigationActive:
				navigationActiveBeforeUpdate ||
				hasKeyboardNavigationActivity() ||
				hasPointerNavigationActivity(),
			deltaMs: deltaTime * 1000,
		});
		if (poseBefore !== poseAfter) {
			syncProjectPresentation?.();
		}

		syncViewportProjection();
		syncShotProjection();
		applyCameraViewProjection();
		syncGuideOverlayState();
		syncMeasurementSceneHelpers?.();

		updateShotCameraHelpers();
		const renderCamera =
			state.mode === WORKSPACE_PANE_CAMERA
				? getActiveCameraViewCamera()
				: getActiveViewportCamera();
		renderer.getSize(renderViewportSize);
		syncPerSplatEditSceneHelper?.(renderCamera, renderViewportSize);
		const guideState = guideOverlay.captureState();
		const previousAutoClear = renderer.autoClear;
		const previousBackground = scene.background;
		const previousClearAlpha = renderer.getClearAlpha();
		const previousClearColor = renderer
			.getClearColor(new THREE.Color())
			.clone();
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
		guideOverlay.renderOverlay(renderer, renderCamera);
		guideOverlay.renderViewportOverlay?.(renderer, renderCamera);
		scene.background = previousBackground;
		renderer.setClearColor(previousClearColor, previousClearAlpha);
		renderer.autoClear = previousAutoClear;
		syncMeasurementOverlay?.();
		syncViewportTransformGizmo?.();
		syncViewportAxisGizmo?.();
		updateOutputFrameOverlay();
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
