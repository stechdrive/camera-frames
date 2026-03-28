import * as THREE from "three";
import {
	getBaseHorizontalFovDegreesForStandardFrameEquivalentMm,
	getStandardFrameEquivalentMm,
	getStandardFrameHorizontalFovDegrees,
	snapStandardFrameEquivalentMm,
} from "../engine/camera-lens.js";
import {
	buildViewportPieActions,
	getViewportPieHoveredActionId,
	getViewportPieMetrics,
} from "../engine/viewport-pie.js";

export function createInteractionController({
	store,
	state,
	viewportShell,
	fpsMovement,
	pointerControls,
	workspacePaneCamera,
	t,
	setStatus,
	updateUi,
	getViewZoomFactor,
	setViewZoomFactor,
	getShotCameraBaseFovX,
	setShotCameraBaseFovXLive,
	getShotCameraRollAxisWorld,
	getShotCameraRollAngleDegrees,
	applyActiveShotCameraRoll,
	beginHistoryTransaction,
	commitHistoryTransaction,
}) {
	const INTERACTION_MODE_NAVIGATE = "navigate";
	const INTERACTION_MODE_ZOOM = "zoom";
	const INTERACTION_MODE_PIE = "pie";
	const INTERACTION_MODE_LENS = "lens";
	const INTERACTION_MODE_ROLL = "roll";
	let zoomToolDragState = null;
	let lensAdjustDragState = null;
	let rollAdjustDragState = null;

	function formatNumber(value, digits = 2) {
		return Number(value).toFixed(digits);
	}

	function isZoomToolActive() {
		return (
			state.mode === workspacePaneCamera &&
			state.interactionMode === INTERACTION_MODE_ZOOM
		);
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

	function isInteractiveTextTarget(target) {
		return (
			target instanceof Element &&
			target.closest(
				'input, textarea, select, option, [contenteditable="true"]',
			) !== null
		);
	}

	function clearZoomToolDrag() {
		zoomToolDragState = null;
		viewportShell.classList.remove("is-zoom-dragging");
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
			mmLabel: `${Math.round(getStandardFrameEquivalentMm(baseFovX))}mm`,
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
		setViewportPieMenu({
			open: false,
			x: 0,
			y: 0,
			hoveredActionId: null,
			coarse: false,
			radius: getViewportPieMetrics().radius,
			innerRadius: getViewportPieMetrics().innerRadius,
			outerRadius: getViewportPieMetrics().outerRadius,
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
		clearZoomToolDrag();
		clearLensAdjustDrag();
		clearRollAdjustDrag();
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
		fpsMovement.enable = false;
		pointerControls.enable = navigationEnabled;
		if (!silent) {
			setStatus(
				navigationEnabled
					? ""
					: nextMode === INTERACTION_MODE_ZOOM
						? t("status.zoomToolEnabled")
						: nextMode === INTERACTION_MODE_LENS
							? t("status.lensToolEnabled")
							: nextMode === INTERACTION_MODE_ROLL
								? t("status.rollToolEnabled")
								: "",
			);
		}
		updateUi();
	}

	function applyNavigateInteractionMode(options) {
		applyInteractionMode(INTERACTION_MODE_NAVIGATE, options);
	}

	function toggleZoomTool() {
		if (state.mode !== workspacePaneCamera) {
			setStatus(t("status.zoomToolUnavailable"));
			return;
		}

		applyInteractionMode(
			state.interactionMode === INTERACTION_MODE_ZOOM
				? INTERACTION_MODE_NAVIGATE
				: INTERACTION_MODE_ZOOM,
		);
	}

	function startZoomToolDrag(event) {
		if (!isZoomToolActive() || event.button !== 0) {
			return false;
		}

		event.preventDefault();
		event.stopPropagation();
		viewportShell.classList.add("is-zoom-dragging");
		zoomToolDragState = {
			pointerId: event.pointerId,
			startClientX: event.clientX,
			startViewZoom: getViewZoomFactor(),
		};
		return true;
	}

	function handleZoomToolDragMove(event) {
		if (!zoomToolDragState || event.pointerId !== zoomToolDragState.pointerId) {
			return;
		}

		const deltaX = event.clientX - zoomToolDragState.startClientX;
		const nextZoom =
			zoomToolDragState.startViewZoom * Math.exp(deltaX * 0.0045);
		setViewZoomFactor(nextZoom);
	}

	function handleZoomToolDragEnd(event) {
		if (!zoomToolDragState || event.pointerId !== zoomToolDragState.pointerId) {
			return;
		}

		clearZoomToolDrag();
	}

	function openViewportPieMenu(event, { force = false, coarse = false } = {}) {
		if (!force && event.button !== 1) {
			return false;
		}

		const viewportRect = viewportShell.getBoundingClientRect();
		const metrics = getViewportPieMetrics({ coarse });
		setViewportPieMenu({
			open: true,
			x: event.clientX - viewportRect.left,
			y: event.clientY - viewportRect.top,
			hoveredActionId: null,
			coarse: metrics.coarse,
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
		applyInteractionMode(INTERACTION_MODE_LENS, { silent: false });
		const viewportRect = viewportShell.getBoundingClientRect();
		const localX = pointerEvent
			? pointerEvent.clientX - viewportRect.left
			: viewportRect.width * 0.5;
		const localY = pointerEvent
			? pointerEvent.clientY - viewportRect.top
			: viewportRect.height * 0.5;
		updateLensHud(localX, localY);
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
			startEquivalentMm: getStandardFrameEquivalentMm(getShotCameraBaseFovX()),
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
		const nextEquivalentMm = snapStandardFrameEquivalentMm(
			lensAdjustDragState.startEquivalentMm +
				(event.clientX - lensAdjustDragState.startClientX) * sensitivity,
		);
		const nextBaseFovX =
			getBaseHorizontalFovDegreesForStandardFrameEquivalentMm(nextEquivalentMm);
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

	function syncControlsToMode() {
		clearControlMomentum();
		const navigationEnabled =
			state.interactionMode === INTERACTION_MODE_NAVIGATE;
		fpsMovement.enable = false;
		pointerControls.enable = navigationEnabled;
		updateUi();
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
		syncControlsToMode,
	};
}
