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
	updateDropHint,
	updateUi,
	updateOutputFrameOverlay,
	setStatus,
	startZoomToolDrag,
	toggleZoomTool,
	toggleViewportSelectMode,
	undoHistory,
	redoHistory,
	beginHistoryTransaction,
	commitHistoryTransaction,
	isInteractiveTextTarget,
	isZoomInteractionMode,
	applyNavigateInteractionMode,
	isFrameSelectionActive,
	clearFrameSelection,
	clearOutputFrameSelection,
	handleZoomToolDragMove,
	handleZoomToolDragEnd,
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
	startOutputFrameAnchorDrag,
	exportController,
	handleResize,
	fpsMovement,
	pointerControls,
	getActiveCamera,
	guideOverlay,
	syncGuideOverlayState,
	syncViewportTransformGizmo,
	syncViewportProjection,
	syncShotProjection,
	applyCameraViewProjection,
	updateShotCameraHelpers,
	getActiveCameraViewCamera,
	viewportCamera,
	updateCameraSummary,
	t,
	formatNumber,
	frameAllCameras,
	placeAllCamerasAtHome,
	syncControlsToMode,
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

	function listen(target, eventName, handler) {
		target.addEventListener(eventName, handler);
		disposers.push(() => target.removeEventListener(eventName, handler));
	}

	function bindViewportInteractions() {
		bindInputRouter({
			listen,
			viewportShell,
			dropHint,
			anchorDot,
			assetController,
			updateDropHint,
			updateUi,
			updateOutputFrameOverlay,
			setStatus,
			startZoomToolDrag,
			toggleZoomTool,
			toggleViewportSelectMode,
			undoHistory,
			redoHistory,
			requestNavigationHistoryCommit,
			flushNavigationHistory,
			isInteractiveTextTarget,
			isViewportSelectMode: () =>
				state.mode !== WORKSPACE_PANE_CAMERA && store.viewportSelectMode.value,
			getActiveCamera,
			isZoomInteractionMode,
			applyNavigateInteractionMode,
			state,
			fpsMovement,
			pointerControls,
			isFrameSelectionActive,
			clearFrameSelection,
			clearOutputFrameSelection,
			handleZoomToolDragMove,
			handleZoomToolDragEnd,
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
			startOutputFrameAnchorDrag,
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
		const poseBefore = getCameraPoseSignature(activeCamera);
		const navigationActiveBeforeUpdate =
			hasKeyboardNavigationActivity() || hasPointerNavigationActivity();
		fpsMovement.update(deltaTime, activeCamera);
		pointerControls.update(deltaTime, activeCamera, activeCamera);
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

		syncViewportProjection();
		syncShotProjection();
		applyCameraViewProjection();
		syncGuideOverlayState();

		updateShotCameraHelpers();
		const renderCamera =
			state.mode === WORKSPACE_PANE_CAMERA
				? getActiveCameraViewCamera()
				: viewportCamera;
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
		scene.background = previousBackground;
		renderer.setClearColor(previousClearColor, previousClearAlpha);
		renderer.autoClear = previousAutoClear;
		syncViewportTransformGizmo?.();
		updateOutputFrameOverlay();
	}

	function init() {
		document.body.dataset.mode = state.mode;
		store.sceneSummary.value = "";
		store.sceneScaleSummary.value = "";
		store.exportSummary.value = t("exportSummary.empty");
		setStatus("");
		setExportStatus("export.idle");
		updateUi();
		placeAllCamerasAtHome();
		syncControlsToMode();
		applyInitialNavigateInteractionMode();
		handleResize();
		bindViewportInteractions();
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
