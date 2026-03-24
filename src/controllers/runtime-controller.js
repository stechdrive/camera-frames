import * as THREE from "three";
import { GUIDE_GRID_LAYER_MODE_BOTTOM } from "../engine/guide-overlays.js";
import { bindInputRouter } from "../interactions/input-router.js";
import {
	WORKSPACE_PANE_CAMERA,
	WORKSPACE_PANE_VIEWPORT,
} from "../workspace-model.js";

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
	startOutputFrameAnchorDrag,
	exportController,
	handleResize,
	fpsMovement,
	pointerControls,
	getActiveCamera,
	guideOverlay,
	syncGuideOverlayState,
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
	syncControlsToMode,
	applyInitialNavigateInteractionMode,
	loadStartupUrls,
	setExportStatus,
}) {
	let lastFrameTime = 0;
	const disposers = [];

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
			isInteractiveTextTarget,
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
			startOutputFrameAnchorDrag,
		});
	}

	function animate(timeMs) {
		handleResize();
		if (exportController.isRenderLocked()) {
			updateOutputFrameOverlay();
			return;
		}

		const deltaTime =
			lastFrameTime > 0 ? Math.min((timeMs - lastFrameTime) / 1000, 0.1) : 0;
		lastFrameTime = timeMs;
		const activeCamera = getActiveCamera();
		fpsMovement.update(deltaTime, activeCamera);
		pointerControls.update(deltaTime, activeCamera, activeCamera);

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
		updateOutputFrameOverlay();
		updateCameraSummary();
	}

	function init() {
		document.body.dataset.mode = state.mode;
		store.sceneSummary.value = "";
		store.sceneScaleSummary.value = "";
		store.exportSummary.value = t("exportSummary.empty");
		setStatus("");
		setExportStatus("export.idle");
		updateUi();
		frameAllCameras();
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
		exportController.dispose();
		renderer.dispose();
	}

	return {
		init,
		dispose,
	};
}
