import * as THREE from "three";
import {
	getBaseHorizontalFovDegreesForStandardFrameHorizontalEquivalentMm,
	getStandardFrameHorizontalEquivalentMm,
	getStandardFrameHorizontalFovDegrees,
	snapStandardFrameHorizontalEquivalentMm,
} from "../engine/camera-lens.js";
import {
	buildPointerRay,
	isClientPointInsideContext,
	resolveActiveViewInteractionContext,
} from "../engine/view-interaction-context.js";
import {
	buildViewportPieActions,
	getViewportPieHoveredActionId,
	getViewportPieMetrics,
} from "../engine/viewport-pie.js";

export function createInteractionController({
	store,
	state,
	viewportShell,
	viewportCanvas,
	assetController,
	fpsMovement,
	pointerControls,
	getActiveCamera,
	getActiveViewportCamera,
	getActiveCameraViewCamera,
	getActiveOutputCamera,
	workspacePaneCamera,
	t,
	setStatus,
	updateUi,
	getViewZoomFactor,
	setViewZoomFactor,
	getShotCameraBaseFovX,
	setShotCameraBaseFovXLive,
	getViewportBaseFovX,
	setViewportBaseFovXLive,
	isViewportOrthographic = () => false,
	panViewportOrthographic = () => false,
	zoomViewportOrthographic = () => false,
	offsetViewportOrthographicDepth = () => false,
	ensurePerspectiveForViewportRotation = () => false,
	setViewportTransientReferencePoint = () => false,
	getShotCameraRollAxisWorld,
	getShotCameraRollAngleDegrees,
	applyActiveShotCameraRoll,
	beginHistoryTransaction,
	commitHistoryTransaction,
	cancelHistoryTransaction,
}) {
	const INTERACTION_MODE_NAVIGATE = "navigate";
	const INTERACTION_MODE_ZOOM = "zoom";
	const INTERACTION_MODE_PIE = "pie";
	const INTERACTION_MODE_LENS = "lens";
	const INTERACTION_MODE_ROLL = "roll";
	const orbitRaycaster = new THREE.Raycaster();
	const orbitPointerNdc = new THREE.Vector2();
	const orbitWorldUp = new THREE.Vector3(0, 1, 0);
	const orbitRightAxis = new THREE.Vector3();
	const orbitYawQuaternion = new THREE.Quaternion();
	const orbitPitchQuaternion = new THREE.Quaternion();
	let zoomToolDragState = null;
	let lensAdjustDragState = null;
	let rollAdjustDragState = null;
	let orbitAroundHitDragState = null;
	let viewportOrthoPanDragState = null;
	store.interactionMode.value = state.interactionMode;

	function formatNumber(value, digits = 2) {
		return Number(value).toFixed(digits);
	}

	function isZoomToolActive() {
		return state.interactionMode === INTERACTION_MODE_ZOOM;
	}

	function isZoomInteractionMode() {
		return state.interactionMode === INTERACTION_MODE_ZOOM;
	}

	function isPieInteractionMode() {
		return state.interactionMode === INTERACTION_MODE_PIE;
	}

	function isLensInteractionMode() {
		return state.interactionMode === INTERACTION_MODE_LENS;
	}

	function isRollInteractionMode() {
		return state.interactionMode === INTERACTION_MODE_ROLL;
	}

	function isViewportOrthographicActive() {
		return state.mode !== workspacePaneCamera && isViewportOrthographic?.();
	}

	function isSplatEditBrushNavigationSuppressed() {
		return (
			store.splatEdit?.active?.value === true &&
			store.splatEdit?.tool?.value === "brush"
		);
	}

	function isInteractiveTextTarget(target) {
		return (
			target instanceof Element &&
			target.closest(
				'input, textarea, select, option, [contenteditable="true"]',
			) !== null
		);
	}

	function clearZoomToolDrag({ cancel = false } = {}) {
		if (cancel && zoomToolDragState?.historyLabel) {
			cancelHistoryTransaction?.();
		}
		zoomToolDragState = null;
		viewportShell.classList.remove("is-zoom-dragging");
		hideLensHud();
	}

	function setViewportPieMenu(nextValue) {
		store.viewportPieMenu.value = nextValue;
	}

	function hideLensHud() {
		store.viewportLensHud.value = {
			visible: false,
			x: 0,
			y: 0,
			mmLabel: "",
			fovLabel: "",
		};
	}

	function hideRollHud() {
		store.viewportRollHud.value = {
			visible: false,
			x: 0,
			y: 0,
			angleLabel: "",
		};
	}

	function updateLensHud(x, y, baseFovX = getShotCameraBaseFovX()) {
		store.viewportLensHud.value = {
			visible: true,
			x,
			y,
			mmLabel: `${Math.round(getStandardFrameHorizontalEquivalentMm(baseFovX))}mm`,
			fovLabel: `${formatNumber(getStandardFrameHorizontalFovDegrees(baseFovX), 1)}°`,
		};
	}

	function updateRollHud(
		x,
		y,
		rollDegrees = getShotCameraRollAngleDegrees?.() ?? 0,
	) {
		const roundedRoll = Number.isFinite(rollDegrees) ? rollDegrees : 0;
		store.viewportRollHud.value = {
			visible: true,
			x,
			y,
			angleLabel: `${roundedRoll >= 0 ? "+" : ""}${formatNumber(roundedRoll, 1)}°`,
		};
	}

	function clearLensAdjustDrag() {
		lensAdjustDragState = null;
		viewportShell.classList.remove("is-lens-adjusting");
	}

	function clearRollAdjustDrag() {
		rollAdjustDragState = null;
		viewportShell.classList.remove("is-roll-adjusting");
	}

	function clearOrbitAroundHitDrag() {
		if (orbitAroundHitDragState?.pointerId !== undefined) {
			try {
				viewportShell.releasePointerCapture?.(
					orbitAroundHitDragState.pointerId,
				);
			} catch {
				// Ignore failed capture release.
			}
		}
		orbitAroundHitDragState = null;
		viewportShell.classList.remove("is-orbit-dragging");
		pointerControls.enable =
			state.interactionMode === INTERACTION_MODE_NAVIGATE &&
			!isViewportOrthographicActive() &&
			!isSplatEditBrushNavigationSuppressed();
	}

	function clearViewportOrthographicPanDrag({ cancel = false } = {}) {
		if (cancel && viewportOrthoPanDragState?.historyLabel) {
			cancelHistoryTransaction?.();
		}
		if (viewportOrthoPanDragState?.pointerId !== undefined) {
			try {
				viewportShell.releasePointerCapture?.(
					viewportOrthoPanDragState.pointerId,
				);
			} catch {
				// Ignore failed capture release.
			}
		}
		viewportOrthoPanDragState = null;
		viewportShell.classList.remove("is-ortho-panning");
	}

	function clearControlMomentum() {
		pointerControls.moveVelocity.set(0, 0, 0);
		pointerControls.rotateVelocity.set(0, 0, 0);
		pointerControls.scroll.set(0, 0, 0);
		if (fpsMovement?.keydown) {
			for (const key of Object.keys(fpsMovement.keydown)) {
				fpsMovement.keydown[key] = false;
			}
		}
		if (fpsMovement?.keycode) {
			for (const key of Object.keys(fpsMovement.keycode)) {
				fpsMovement.keycode[key] = false;
			}
		}
	}

	function closeViewportPieMenu({ silent = true } = {}) {
		const metrics = getViewportPieMetrics();
		setViewportPieMenu({
			open: false,
			x: 0,
			y: 0,
			hoveredActionId: null,
			coarse: false,
			scale: metrics.scale,
			radius: metrics.radius,
			innerRadius: metrics.innerRadius,
			outerRadius: metrics.outerRadius,
		});
		if (state.interactionMode === INTERACTION_MODE_PIE) {
			applyNavigateInteractionMode({ silent });
		}
	}

	function applyInteractionMode(nextMode, { silent = false } = {}) {
		if (state.interactionMode === nextMode) {
			return;
		}

		state.interactionMode = nextMode;
		store.interactionMode.value = nextMode;
		clearZoomToolDrag({ cancel: true });
		clearLensAdjustDrag();
		clearRollAdjustDrag();
		clearOrbitAroundHitDrag();
		clearViewportOrthographicPanDrag({ cancel: true });
		clearControlMomentum();
		if (nextMode !== INTERACTION_MODE_PIE) {
			setViewportPieMenu({
				open: false,
				x: 0,
				y: 0,
				hoveredActionId: null,
			});
		}
		if (nextMode !== INTERACTION_MODE_LENS) {
			hideLensHud();
		}
		if (nextMode !== INTERACTION_MODE_ROLL) {
			hideRollHud();
		}
		const navigationEnabled = nextMode === INTERACTION_MODE_NAVIGATE;
		const pointerNavigationEnabled =
			navigationEnabled &&
			!isViewportOrthographicActive() &&
			!isSplatEditBrushNavigationSuppressed();
		fpsMovement.enable = false;
		pointerControls.enable = pointerNavigationEnabled;
		if (!silent) {
			setStatus(
				navigationEnabled
					? ""
					: nextMode === INTERACTION_MODE_ZOOM
						? state.mode === workspacePaneCamera
							? t("status.zoomToolEnabled")
							: t("status.viewportZoomToolEnabled")
						: nextMode === INTERACTION_MODE_LENS
							? t("status.lensToolEnabled")
							: nextMode === INTERACTION_MODE_ROLL
								? t("status.rollToolEnabled")
								: "",
			);
		}
		updateUi({ syncProjectPresentation: false });
	}

	function applyNavigateInteractionMode(options) {
		applyInteractionMode(INTERACTION_MODE_NAVIGATE, options);
	}

	function toggleZoomTool() {
		if (isViewportOrthographicActive()) {
			return false;
		}
		if (state.mode === workspacePaneCamera || state.mode === "viewport") {
			applyInteractionMode(
				state.interactionMode === INTERACTION_MODE_ZOOM
					? INTERACTION_MODE_NAVIGATE
					: INTERACTION_MODE_ZOOM,
			);
			return;
		}
		setStatus(t("status.zoomToolUnavailable"));
	}

	function startZoomToolDrag(event) {
		if (isViewportOrthographicActive()) {
			return false;
		}
		if (!isZoomToolActive() || event.button !== 0) {
			return false;
		}

		event.preventDefault();
		event.stopPropagation();
		viewportShell.classList.add("is-zoom-dragging");
		if (state.mode === workspacePaneCamera) {
			zoomToolDragState = {
				pointerId: event.pointerId,
				startClientX: event.clientX,
				startViewZoom: getViewZoomFactor(),
			};
			return true;
		}

		beginHistoryTransaction?.("viewport.lens");
		zoomToolDragState = {
			pointerId: event.pointerId,
			startClientX: event.clientX,
			startEquivalentMm: getStandardFrameHorizontalEquivalentMm(
				getViewportBaseFovX(),
			),
			historyLabel: "viewport.lens",
		};
		updateLensHud(
			event.clientX - viewportShell.getBoundingClientRect().left,
			event.clientY - viewportShell.getBoundingClientRect().top,
			getViewportBaseFovX(),
		);
		return true;
	}

	function handleZoomToolDragMove(event) {
		if (!zoomToolDragState || event.pointerId !== zoomToolDragState.pointerId) {
			return;
		}

		if (state.mode === workspacePaneCamera) {
			const deltaX = event.clientX - zoomToolDragState.startClientX;
			const nextZoom =
				zoomToolDragState.startViewZoom * Math.exp(deltaX * 0.0045);
			setViewZoomFactor(nextZoom);
			return;
		}

		const sensitivity = event.shiftKey ? 0.03 : 0.12;
		const nextEquivalentMm = snapStandardFrameHorizontalEquivalentMm(
			zoomToolDragState.startEquivalentMm +
				(event.clientX - zoomToolDragState.startClientX) * sensitivity,
		);
		const nextBaseFovX =
			getBaseHorizontalFovDegreesForStandardFrameHorizontalEquivalentMm(
				nextEquivalentMm,
			);
		setViewportBaseFovXLive(nextBaseFovX);
		updateLensHud(
			event.clientX - viewportShell.getBoundingClientRect().left,
			event.clientY - viewportShell.getBoundingClientRect().top,
			nextBaseFovX,
		);
	}

	function handleZoomToolDragEnd(event) {
		if (!zoomToolDragState || event.pointerId !== zoomToolDragState.pointerId) {
			return;
		}

		if (zoomToolDragState.historyLabel) {
			commitHistoryTransaction?.(zoomToolDragState.historyLabel);
		}
		clearZoomToolDrag();
	}

	function getCurrentMobileUiScale() {
		if (!store.mobileUi?.active?.peek?.()) {
			return 1;
		}
		const scale = store.mobileUi?.effectiveScale?.peek?.();
		return Number.isFinite(scale) && scale > 0 ? scale : 1;
	}

	function openViewportPieMenu(event, { force = false, coarse = false } = {}) {
		if (!force && event.button !== 1) {
			return false;
		}

		const viewportRect = viewportShell.getBoundingClientRect();
		const metrics = getViewportPieMetrics({
			coarse,
			uiScale: getCurrentMobileUiScale(),
		});
		setViewportPieMenu({
			open: true,
			x: event.clientX - viewportRect.left,
			y: event.clientY - viewportRect.top,
			hoveredActionId: null,
			coarse: metrics.coarse,
			scale: metrics.scale,
			radius: metrics.radius,
			innerRadius: metrics.innerRadius,
			outerRadius: metrics.outerRadius,
		});
		applyInteractionMode(INTERACTION_MODE_PIE, { silent: true });
		return true;
	}

	function openViewportPieMenuAtCenter() {
		const viewportRect = viewportShell.getBoundingClientRect();
		const coarse = window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
		return openViewportPieMenu(
			{
				button: 0,
				clientX: viewportRect.left + viewportRect.width * 0.5,
				clientY: viewportRect.top + viewportRect.height * 0.5,
			},
			{ force: true, coarse },
		);
	}

	function updateViewportPiePointer(event) {
		if (!store.viewportPieMenu.value.open) {
			return;
		}

		const actions = buildViewportPieActions({
			mode: state.mode,
			t,
			viewportOrthographic: isViewportOrthographicActive(),
			frameMaskMode: store.frames.maskMode.value,
			hasRememberedFrameMaskSelection:
				(store.frames.maskSelectedIds.value?.length ?? 0) > 0,
		});
		const nextHoveredActionId = getViewportPieHoveredActionId({
			x: event.clientX - viewportShell.getBoundingClientRect().left,
			y: event.clientY - viewportShell.getBoundingClientRect().top,
			centerX: store.viewportPieMenu.value.x,
			centerY: store.viewportPieMenu.value.y,
			actions,
			innerRadius: store.viewportPieMenu.value.innerRadius,
			outerRadius: store.viewportPieMenu.value.outerRadius,
		});
		setViewportPieMenu({
			...store.viewportPieMenu.value,
			hoveredActionId: nextHoveredActionId,
		});
	}

	function finishViewportPieMenu(event) {
		if (!store.viewportPieMenu.value.open) {
			return null;
		}

		updateViewportPiePointer(event);
		return store.viewportPieMenu.value.hoveredActionId;
	}

	function activateLensAdjustMode(pointerEvent = null) {
		if (isViewportOrthographicActive()) {
			return false;
		}
		applyInteractionMode(INTERACTION_MODE_LENS, { silent: false });
		const viewportRect = viewportShell.getBoundingClientRect();
		const localX = pointerEvent
			? pointerEvent.clientX - viewportRect.left
			: viewportRect.width * 0.5;
		const localY = pointerEvent
			? pointerEvent.clientY - viewportRect.top
			: viewportRect.height * 0.5;
		updateLensHud(localX, localY);
		return true;
	}

	function activateShotCameraRollMode(pointerEvent = null) {
		if (state.mode !== workspacePaneCamera) {
			setStatus(t("status.rollToolUnavailable"));
			return false;
		}

		applyInteractionMode(INTERACTION_MODE_ROLL, { silent: false });
		const viewportRect = viewportShell.getBoundingClientRect();
		const localX = pointerEvent
			? pointerEvent.clientX - viewportRect.left
			: viewportRect.width * 0.5;
		const localY = pointerEvent
			? pointerEvent.clientY - viewportRect.top
			: viewportRect.height * 0.5;
		updateRollHud(localX, localY);
		return true;
	}

	function startLensAdjustDrag(event) {
		if (!isLensInteractionMode() || event.button !== 0) {
			return false;
		}

		event.preventDefault();
		event.stopPropagation();
		beginHistoryTransaction?.("camera.lens");
		viewportShell.classList.add("is-lens-adjusting");
		lensAdjustDragState = {
			pointerId: event.pointerId,
			startClientX: event.clientX,
			startEquivalentMm: getStandardFrameHorizontalEquivalentMm(
				getShotCameraBaseFovX(),
			),
		};
		updateLensHud(
			event.clientX - viewportShell.getBoundingClientRect().left,
			event.clientY - viewportShell.getBoundingClientRect().top,
		);
		return true;
	}

	function handleLensAdjustDragMove(event) {
		if (
			!lensAdjustDragState ||
			event.pointerId !== lensAdjustDragState.pointerId
		) {
			return;
		}

		const sensitivity = event.shiftKey ? 0.03 : 0.12;
		const nextEquivalentMm = snapStandardFrameHorizontalEquivalentMm(
			lensAdjustDragState.startEquivalentMm +
				(event.clientX - lensAdjustDragState.startClientX) * sensitivity,
		);
		const nextBaseFovX =
			getBaseHorizontalFovDegreesForStandardFrameHorizontalEquivalentMm(
				nextEquivalentMm,
			);
		setShotCameraBaseFovXLive(nextBaseFovX);
		updateLensHud(
			event.clientX - viewportShell.getBoundingClientRect().left,
			event.clientY - viewportShell.getBoundingClientRect().top,
			nextBaseFovX,
		);
	}

	function handleLensAdjustDragEnd(event) {
		if (
			!lensAdjustDragState ||
			event.pointerId !== lensAdjustDragState.pointerId
		) {
			return;
		}

		clearLensAdjustDrag();
		commitHistoryTransaction?.("camera.lens");
		applyNavigateInteractionMode({ silent: true });
	}

	function startShotCameraRollDrag(event) {
		if (!isRollInteractionMode() || event.button !== 0) {
			return false;
		}

		const axisWorld = getShotCameraRollAxisWorld?.();
		if (!(axisWorld instanceof THREE.Vector3) || axisWorld.lengthSq() <= 1e-6) {
			return false;
		}

		event.preventDefault();
		event.stopPropagation();
		beginHistoryTransaction?.("camera.roll");
		viewportShell.classList.add("is-roll-adjusting");
		rollAdjustDragState = {
			pointerId: event.pointerId,
			startClientX: event.clientX,
			axisWorld: axisWorld.clone(),
			appliedDeltaRadians: 0,
		};
		updateRollHud(
			event.clientX - viewportShell.getBoundingClientRect().left,
			event.clientY - viewportShell.getBoundingClientRect().top,
		);
		return true;
	}

	function getRollSensitivityDegrees(event) {
		if (event.altKey && event.shiftKey) {
			return 0.015;
		}
		if (event.altKey) {
			return 0.035;
		}
		if (event.shiftKey) {
			return 0.08;
		}
		return 0.18;
	}

	function handleShotCameraRollDragMove(event) {
		if (
			!rollAdjustDragState ||
			event.pointerId !== rollAdjustDragState.pointerId
		) {
			return;
		}

		const totalDeltaRadians = THREE.MathUtils.degToRad(
			(event.clientX - rollAdjustDragState.startClientX) *
				getRollSensitivityDegrees(event),
		);
		const nextDeltaRadians =
			totalDeltaRadians - rollAdjustDragState.appliedDeltaRadians;
		if (Math.abs(nextDeltaRadians) > 1e-7) {
			applyActiveShotCameraRoll?.(
				rollAdjustDragState.axisWorld,
				nextDeltaRadians,
			);
			rollAdjustDragState.appliedDeltaRadians = totalDeltaRadians;
		}

		updateRollHud(
			event.clientX - viewportShell.getBoundingClientRect().left,
			event.clientY - viewportShell.getBoundingClientRect().top,
		);
	}

	function handleShotCameraRollDragEnd(event) {
		if (
			!rollAdjustDragState ||
			event.pointerId !== rollAdjustDragState.pointerId
		) {
			return;
		}

		clearRollAdjustDrag();
		commitHistoryTransaction?.("camera.roll");
		applyNavigateInteractionMode({ silent: true });
	}

	function isOrbitAroundHitDragEligible(event) {
		if (state.interactionMode !== INTERACTION_MODE_NAVIGATE) {
			return false;
		}
		if (event.button === 0 && event.ctrlKey) {
			return true;
		}
		if (event.button === 2 && isSplatEditBrushNavigationSuppressed()) {
			return true;
		}
		return false;
	}

	function getOrbitAroundHitHistoryLabel() {
		return state.mode === workspacePaneCamera ? "camera.pose" : "viewport.pose";
	}

	function getOrbitAroundHitSensitivityDegrees(event) {
		if (event.altKey && event.shiftKey) {
			return 0.015;
		}
		if (event.altKey) {
			return 0.035;
		}
		if (event.shiftKey) {
			return 0.08;
		}
		return 0.18;
	}

	function resolveOrbitInteractionContext() {
		return resolveActiveViewInteractionContext({
			state,
			viewportShell,
			viewportCanvas,
			workspacePaneCamera,
			getActiveViewportCamera,
			getActiveCameraViewCamera,
			getActiveOutputCamera,
		});
	}

	function pickOrbitAroundHitPoint(event) {
		const context = resolveOrbitInteractionContext();
		if (
			!context ||
			!isClientPointInsideContext(event.clientX, event.clientY, context)
		) {
			return null;
		}

		const targets = assetController?.getSceneRaycastTargets?.() ?? [];
		if (targets.length === 0) {
			return null;
		}

		buildPointerRay(
			event.clientX,
			event.clientY,
			context,
			orbitRaycaster,
			orbitPointerNdc,
		);
		const intersections = orbitRaycaster.intersectObjects(targets, true);
		for (const intersection of intersections) {
			const asset = assetController?.getSceneAssetForObject?.(
				intersection.object,
			);
			if (!asset) {
				continue;
			}
			return intersection.point.clone();
		}

		const sceneBounds = assetController?.getSceneBounds?.();
		if (sceneBounds?.box && !sceneBounds.box.isEmpty()) {
			return sceneBounds.box.getCenter(new THREE.Vector3());
		}
		return null;
	}

	function applyPanAroundHitDelta(camera, dragState, deltaX, deltaY) {
		const pivotWorld = dragState.pivotWorld;
		const cameraPos = camera.position;
		const viewDepth = cameraPos.distanceTo(pivotWorld);
		if (viewDepth <= 0.001) {
			return;
		}
		const verticalFovRadians = THREE.MathUtils.degToRad(camera.fov ?? 60);
		const viewportRect = viewportShell.getBoundingClientRect();
		const pixelHeight = Math.max(viewportRect.height, 1);
		const worldPerPixel =
			(2 * Math.tan(verticalFovRadians * 0.5) * viewDepth) / pixelHeight;
		const right = new THREE.Vector3(1, 0, 0)
			.applyQuaternion(camera.quaternion)
			.normalize();
		const up = new THREE.Vector3(0, 1, 0)
			.applyQuaternion(camera.quaternion)
			.normalize();
		const offset = right
			.multiplyScalar(-deltaX * worldPerPixel)
			.addScaledVector(up, deltaY * worldPerPixel);
		camera.position.add(offset);
		dragState.pivotWorld.add(offset);
		camera.updateMatrixWorld(true);
	}

	function applyOrbitAroundHitDelta(camera, pivotWorld, deltaX, deltaY, event) {
		const sensitivityRadians = THREE.MathUtils.degToRad(
			getOrbitAroundHitSensitivityDegrees(event),
		);
		const yawRadians = -deltaX * sensitivityRadians;
		const pitchRadians = -deltaY * sensitivityRadians;

		if (Math.abs(yawRadians) > 1e-8) {
			orbitYawQuaternion.setFromAxisAngle(orbitWorldUp, yawRadians);
			camera.position.sub(pivotWorld).applyQuaternion(orbitYawQuaternion);
			camera.position.add(pivotWorld);
			camera.quaternion.premultiply(orbitYawQuaternion);
			camera.up.applyQuaternion(orbitYawQuaternion).normalize();
		}

		if (Math.abs(pitchRadians) > 1e-8) {
			orbitRightAxis
				.set(1, 0, 0)
				.applyQuaternion(camera.quaternion)
				.normalize();
			orbitPitchQuaternion.setFromAxisAngle(orbitRightAxis, pitchRadians);
			camera.position.sub(pivotWorld).applyQuaternion(orbitPitchQuaternion);
			camera.position.add(pivotWorld);
			camera.quaternion.premultiply(orbitPitchQuaternion);
			camera.up.applyQuaternion(orbitPitchQuaternion).normalize();
		}

		camera.quaternion.normalize();
		camera.updateMatrixWorld(true);
	}

	function startOrbitAroundHitDrag(event) {
		if (!isOrbitAroundHitDragEligible(event)) {
			return false;
		}

		const pivotWorld = pickOrbitAroundHitPoint(event);
		if (!pivotWorld) {
			return false;
		}

		event.preventDefault();
		event.stopPropagation();
		event.stopImmediatePropagation?.();
		clearControlMomentum();
		beginHistoryTransaction?.(getOrbitAroundHitHistoryLabel());
		orbitAroundHitDragState = {
			pointerId: event.pointerId,
			pivotWorld,
			lastClientX: event.clientX,
			lastClientY: event.clientY,
			historyLabel: getOrbitAroundHitHistoryLabel(),
			brushPan: isSplatEditBrushNavigationSuppressed(),
		};
		if (state.mode !== workspacePaneCamera) {
			setViewportTransientReferencePoint?.(pivotWorld);
		}
		viewportShell.classList.add("is-orbit-dragging");
		pointerControls.enable = false;
		try {
			viewportShell.setPointerCapture?.(event.pointerId);
		} catch {
			// Ignore failed pointer capture.
		}
		return true;
	}

	function handleOrbitAroundHitDragMove(event) {
		if (
			!orbitAroundHitDragState ||
			event.pointerId !== orbitAroundHitDragState.pointerId
		) {
			return;
		}

		const camera = getActiveCamera?.();
		if (!camera) {
			return;
		}

		const deltaX = event.clientX - orbitAroundHitDragState.lastClientX;
		const deltaY = event.clientY - orbitAroundHitDragState.lastClientY;
		orbitAroundHitDragState.lastClientX = event.clientX;
		orbitAroundHitDragState.lastClientY = event.clientY;
		if (Math.abs(deltaX) < 1e-6 && Math.abs(deltaY) < 1e-6) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();
		if (event.shiftKey && orbitAroundHitDragState.brushPan) {
			applyPanAroundHitDelta(camera, orbitAroundHitDragState, deltaX, deltaY);
		} else {
			applyOrbitAroundHitDelta(
				camera,
				orbitAroundHitDragState.pivotWorld,
				deltaX,
				deltaY,
				event,
			);
		}
	}

	function handleOrbitAroundHitDragEnd(event) {
		if (
			!orbitAroundHitDragState ||
			event.pointerId !== orbitAroundHitDragState.pointerId
		) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();
		const historyLabel = orbitAroundHitDragState.historyLabel;
		clearOrbitAroundHitDrag();
		commitHistoryTransaction?.(historyLabel);
		updateUi?.();
	}

	function syncControlsToMode() {
		clearControlMomentum();
		const navigationEnabled =
			state.interactionMode === INTERACTION_MODE_NAVIGATE;
		const pointerNavigationEnabled =
			navigationEnabled &&
			!isViewportOrthographicActive() &&
			!isSplatEditBrushNavigationSuppressed();
		fpsMovement.enable = false;
		pointerControls.enable = pointerNavigationEnabled;
		updateUi({ syncProjectPresentation: false });
	}

	function startViewportOrthographicPanDrag(event) {
		if (
			!isViewportOrthographicActive() ||
			state.interactionMode !== INTERACTION_MODE_NAVIGATE ||
			event.button !== 2
		) {
			return false;
		}

		event.preventDefault();
		event.stopPropagation();
		beginHistoryTransaction?.("viewport.pose");
		viewportOrthoPanDragState = {
			pointerId: event.pointerId,
			lastClientX: event.clientX,
			lastClientY: event.clientY,
			historyLabel: "viewport.pose",
		};
		viewportShell.classList.add("is-ortho-panning");
		pointerControls.enable = false;
		try {
			viewportShell.setPointerCapture?.(event.pointerId);
		} catch {
			// Ignore failed pointer capture.
		}
		return true;
	}

	function handleViewportOrthographicPanMove(event) {
		if (
			!viewportOrthoPanDragState ||
			event.pointerId !== viewportOrthoPanDragState.pointerId
		) {
			return;
		}

		const deltaX = event.clientX - viewportOrthoPanDragState.lastClientX;
		const deltaY = event.clientY - viewportOrthoPanDragState.lastClientY;
		viewportOrthoPanDragState.lastClientX = event.clientX;
		viewportOrthoPanDragState.lastClientY = event.clientY;
		if (Math.abs(deltaX) < 1e-6 && Math.abs(deltaY) < 1e-6) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();
		panViewportOrthographic?.(deltaX, deltaY);
	}

	function handleViewportOrthographicPanEnd(event) {
		if (
			!viewportOrthoPanDragState ||
			event.pointerId !== viewportOrthoPanDragState.pointerId
		) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();
		const historyLabel = viewportOrthoPanDragState.historyLabel;
		clearViewportOrthographicPanDrag();
		commitHistoryTransaction?.(historyLabel);
		updateUi?.();
	}

	function handleViewportOrthographicWheel(event) {
		if (!isViewportOrthographicActive()) {
			return false;
		}

		event.preventDefault();
		event.stopPropagation();
		const fine = Boolean(event.altKey);
		const historyLabel = event.shiftKey ? "viewport.pose" : "viewport.zoom";
		beginHistoryTransaction?.(historyLabel);
		const handled = event.shiftKey
			? offsetViewportOrthographicDepth?.(event.deltaY, {
					fine,
					deltaMode: event.deltaMode,
				})
			: zoomViewportOrthographic?.(event.deltaY, { fine });
		if (handled) {
			commitHistoryTransaction?.(historyLabel);
			updateUi?.();
			return true;
		}
		cancelHistoryTransaction?.();
		return false;
	}

	return {
		isZoomToolActive,
		isZoomInteractionMode,
		isPieInteractionMode,
		isLensInteractionMode,
		isRollInteractionMode,
		isInteractiveTextTarget,
		clearZoomToolDrag,
		clearControlMomentum,
		applyInteractionMode,
		applyNavigateInteractionMode,
		toggleZoomTool,
		startZoomToolDrag,
		handleZoomToolDragMove,
		handleZoomToolDragEnd,
		openViewportPieMenu,
		openViewportPieMenuAtCenter,
		updateViewportPiePointer,
		finishViewportPieMenu,
		closeViewportPieMenu,
		activateLensAdjustMode,
		activateShotCameraRollMode,
		startLensAdjustDrag,
		handleLensAdjustDragMove,
		handleLensAdjustDragEnd,
		startShotCameraRollDrag,
		handleShotCameraRollDragMove,
		handleShotCameraRollDragEnd,
		startViewportOrthographicPanDrag,
		handleViewportOrthographicPanMove,
		handleViewportOrthographicPanEnd,
		handleViewportOrthographicWheel,
		clearViewportOrthographicPanDrag,
		isViewportOrthographicActive,
		ensurePerspectiveForViewportRotation,
		startOrbitAroundHitDrag,
		handleOrbitAroundHitDragMove,
		handleOrbitAroundHitDragEnd,
		syncControlsToMode,
	};
}
