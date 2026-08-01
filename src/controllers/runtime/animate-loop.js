import * as THREE from "three";
import { GUIDE_GRID_LAYER_MODE_BOTTOM } from "../../engine/guide-overlays.js";
import {
	computeWorkspacePaneViewportScissor,
	withWorkspacePaneRendererState,
} from "../../engine/workspace-multi-view.js";
import {
	WORKSPACE_PANE_CAMERA,
	WORKSPACE_PANE_VIEWPORT,
} from "../../workspace-model.js";

export function createRuntimeAnimateLoop({
	renderer,
	scene,
	spark = null,
	workspaceSparkRendererManager = null,
	getWorkspaceRenderState = null,
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
	advanceTimelinePlayback = null,
	releaseTimelineRuntimeEvaluation = null,
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
	updateCameraSummary,
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

	function renderSceneWithSpark(sparkRenderer, camera) {
		if (typeof sparkRenderer?.render === "function") {
			sparkRenderer.render(scene, camera);
			return;
		}
		renderer.render(scene, camera);
	}

	function renderScenePass({
		camera,
		role,
		sparkRenderer,
		hasBackReferenceImagePreview,
		viewportSize,
		background,
	}) {
		scene.background = background;
		updateShotCameraHelpers(role === WORKSPACE_PANE_VIEWPORT);
		syncGuideOverlayState(undefined, { viewMode: role });
		if (isSplatEditModeActive?.()) {
			syncPerSplatEditSceneHelper?.(camera, viewportSize);
		}
		const guideState = guideOverlay.captureState();
		const clearColor = background?.isColor ? background : null;
		renderer.autoClear = true;
		renderer.setClearColor(
			clearColor ?? 0x08111d,
			hasBackReferenceImagePreview ? 0 : 1,
		);
		renderer.clear();
		if (hasBackReferenceImagePreview) {
			scene.background = null;
		}
		if (
			guideState.gridVisible &&
			guideState.gridLayerMode === GUIDE_GRID_LAYER_MODE_BOTTOM
		) {
			guideOverlay.renderBackground(renderer, camera);
			renderer.autoClear = false;
			scene.background = null;
			renderSceneWithSpark(sparkRenderer, camera);
		} else {
			renderer.autoClear = false;
			renderSceneWithSpark(sparkRenderer, camera);
		}
		guideOverlay.renderOverlay(renderer, camera);
		guideOverlay.renderViewportOverlay?.(renderer, camera);
	}

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
		const poseChangedBeforeUpdate = hasCameraPoseChanged(activeCamera);
		snapshotCameraPose(activeCamera);
		const navigationActiveBeforeUpdate =
			hasKeyboardNavigationActivity() || hasPointerNavigationActivity();
		fpsMovement.update(deltaTime, activeCamera);
		pointerControls.update(deltaTime, activeCamera, activeCamera);
		if (Number.isFinite(lockedRollDegrees)) {
			setShotCameraRollAngleDegrees?.(lockedRollDegrees);
		}
		const poseChanged =
			poseChangedBeforeUpdate || hasCameraPoseChanged(activeCamera);
		snapshotCameraPose(activeCamera);
		const navigationActiveAfterUpdate =
			hasKeyboardNavigationActivity() || hasPointerNavigationActivity();
		const navigationActive =
			navigationActiveBeforeUpdate || navigationActiveAfterUpdate;
		navigationHistory.noteFrame({
			targetKey: getActiveCameraHistoryTargetKey(),
			label: getActiveCameraHistoryLabel(),
			poseChanged,
			navigationActive,
			deltaMs: deltaTime * 1000,
		});
		if (poseChanged) {
			if (state.mode === WORKSPACE_PANE_CAMERA && navigationActive) {
				releaseTimelineRuntimeEvaluation?.({
					targetKind: "shot-camera",
					targetId: store.workspace.activeShotCameraId.value,
				});
			}
			syncProjectPresentation?.();
			updateCameraSummary?.();
		}

		if (timing) t1 = performance.now();

		advanceTimelinePlayback?.(deltaTime);
		syncViewportProjection();
		syncShotProjection();
		applyCameraViewProjection();

		if (timing) t2 = performance.now();

		syncMeasurementSceneHelpers?.();

		if (timing) t3 = performance.now();

		const previousAutoClear = renderer.autoClear;
		const previousBackground = scene.background;
		const previousClearAlpha = renderer.getClearAlpha();
		renderer.getClearColor(_tempClearColor);
		const hasBackReferenceImagePreview =
			store.referenceImages?.previewLayers?.value?.some(
				(layer) => layer?.group === "back",
			) === true;
		try {
			const workspaceRenderState = getWorkspaceRenderState?.() ?? null;
			const workspacePanes = Array.isArray(workspaceRenderState?.panes)
				? workspaceRenderState.panes
				: [];
			if (workspacePanes.length > 0) {
				if (workspacePanes.length > 1) {
					// Pane scissor rectangles intentionally leave the splitter gap out of
					// every view. Clear the complete drawing buffer first so resizing the
					// split can never leave pixels from the previous frame in that gap.
					const previousScissorTest = renderer.getScissorTest();
					renderer.setScissorTest(false);
					renderer.setClearColor(
						previousBackground?.isColor ? previousBackground : 0x08111d,
						1,
					);
					renderer.clear();
					renderer.setScissorTest(previousScissorTest);
				}
				let renderedViewCount = 0;
				for (const pane of workspacePanes) {
					const renderRect = computeWorkspacePaneViewportScissor({
						canvasRect: workspaceRenderState.canvasRect,
						shellRect: workspaceRenderState.shellRect,
						paneRect: pane.rect,
					});
					if (!renderRect.visible) {
						continue;
					}
					const camera =
						pane.role === WORKSPACE_PANE_CAMERA
							? getActiveCameraViewCamera()
							: getActiveViewportCamera();
					let paneSpark = spark;
					if (renderedViewCount > 0) {
						paneSpark =
							workspaceSparkRendererManager?.ensure?.(pane.id) ?? spark;
						workspaceSparkRendererManager?.syncPrimaryLodInstances?.(pane.id);
						if (paneSpark && store.viewportLod?.effectiveScale) {
							paneSpark.lodSplatScale = store.viewportLod.effectiveScale.value;
						}
					}
					withWorkspacePaneRendererState({ renderer, renderRect }, () => {
						renderViewportSize.set(
							renderRect.viewport.width,
							renderRect.viewport.height,
						);
						renderScenePass({
							camera,
							role: pane.role,
							sparkRenderer: paneSpark,
							hasBackReferenceImagePreview:
								(workspacePanes.length === 1 ||
									pane.role === WORKSPACE_PANE_CAMERA) &&
								hasBackReferenceImagePreview,
							viewportSize: renderViewportSize,
							background: previousBackground,
						});
					});
					renderedViewCount += 1;
				}
			} else {
				const renderCamera =
					state.mode === WORKSPACE_PANE_CAMERA
						? getActiveCameraViewCamera()
						: getActiveViewportCamera();
				renderer.getSize(renderViewportSize);
				renderScenePass({
					camera: renderCamera,
					role: state.mode,
					sparkRenderer: spark,
					hasBackReferenceImagePreview,
					viewportSize: renderViewportSize,
					background: previousBackground,
				});
			}
		} finally {
			updateShotCameraHelpers(false);
			scene.background = previousBackground;
			renderer.setClearColor(_tempClearColor, previousClearAlpha);
			renderer.autoClear = previousAutoClear;
		}

		if (timing) t4 = performance.now();

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
