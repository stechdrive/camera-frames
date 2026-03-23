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

		updateShotCameraHelpers();

		renderer.render(
			scene,
			state.mode === WORKSPACE_PANE_CAMERA
				? getActiveCameraViewCamera()
				: viewportCamera,
		);
		updateOutputFrameOverlay();
		updateCameraSummary();
	}

	function init() {
		document.body.dataset.mode = state.mode;
		store.sceneSummary.value = t("scene.summaryEmpty");
		store.sceneScaleSummary.value = t("scene.scaleDefault");
		store.exportSummary.value = t("exportSummary.empty");
		setStatus(t("status.ready"));
		setExportStatus("export.idle");
		updateUi();
		frameAllCameras();
		syncControlsToMode();
		applyInitialNavigateInteractionMode();
		setStatus(
			t("status.navigationActive", {
				speed: formatNumber(fpsMovement.moveSpeed, 1),
			}),
		);
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
