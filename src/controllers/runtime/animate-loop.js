import * as THREE from "three";
import { GUIDE_GRID_LAYER_MODE_BOTTOM } from "../../engine/guide-overlays.js";
import { WORKSPACE_PANE_CAMERA } from "../../workspace-model.js";

export function createRuntimeAnimateLoop({
	renderer,
	scene,
	store,
	state,
	exportController,
	fpsMovement,
	pointerControls,
	getActiveCamera,
	getShotCameraRollLock,
	setShotCameraRollAngleDegrees,
	getActiveCameraViewCamera,
	getActiveViewportCamera,
	guideOverlay,
	handleResize,
	advanceProjectionFrame,
	finalizeProjectionFrame,
	syncViewportProjection,
	syncShotProjection,
	applyCameraViewProjection,
	syncGuideOverlayState,
	syncMeasurementSceneHelpers,
	updateShotCameraHelpers,
	syncPerSplatEditSceneHelper,
	syncMeasurementOverlay,
	syncViewportTransformGizmo,
	syncViewportAxisGizmo,
	updateOutputFrameOverlay,
	syncReferenceImagePreview,
	syncProjectPresentation,
	navigationHistory,
	isSplatEditModeActive,
	flushNavigationHistory,
	snapshotCameraPose,
	hasCameraPoseChanged,
	hasKeyboardNavigationActivity,
	hasPointerNavigationActivity,
	getActiveCameraHistoryTargetKey,
	getActiveCameraHistoryLabel,
}) {
	let lastFrameTime = 0;
	const renderViewportSize = new THREE.Vector2();
	const _tempClearColor = new THREE.Color();
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

	return function animate(timeMs) {
		const timing = window.__cameraFramesTiming;
		let t0;
		let t1;
		let t2;
		let t3;
		let t4;
		let t5;
		let t6;
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
						`total=${(t6 - t0).toFixed(2)}ms`,
				);
				_timingFrameCount = 0;
				for (const k in _timingAccum) _timingAccum[k] = 0;
			}
		}
	};
}
