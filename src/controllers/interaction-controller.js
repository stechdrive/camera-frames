import {
	getBaseHorizontalFovDegreesForStandardFrameEquivalentMm,
	getStandardFrameEquivalentMm,
	getStandardFrameHorizontalFovDegrees,
	snapStandardFrameEquivalentMm,
} from "../engine/camera-lens.js";
import {
	buildViewportPieActions,
	getViewportPieHoveredActionId,
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
	beginHistoryTransaction,
	commitHistoryTransaction,
}) {
	const INTERACTION_MODE_NAVIGATE = "navigate";
	const INTERACTION_MODE_ZOOM = "zoom";
	const INTERACTION_MODE_PIE = "pie";
	const INTERACTION_MODE_LENS = "lens";
	let zoomToolDragState = null;
	let lensAdjustDragState = null;

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

	function updateLensHud(x, y, baseFovX = getShotCameraBaseFovX()) {
		store.viewportLensHud.value = {
			visible: true,
			x,
			y,
			mmLabel: `${Math.round(getStandardFrameEquivalentMm(baseFovX))}mm`,
			fovLabel: `${formatNumber(getStandardFrameHorizontalFovDegrees(baseFovX), 1)}°`,
		};
	}

	function clearLensAdjustDrag() {
		lensAdjustDragState = null;
		viewportShell.classList.remove("is-lens-adjusting");
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

	function openViewportPieMenu(event, { force = false } = {}) {
		if (!force && event.button !== 1) {
			return false;
		}

		const viewportRect = viewportShell.getBoundingClientRect();
		setViewportPieMenu({
			open: true,
			x: event.clientX - viewportRect.left,
			y: event.clientY - viewportRect.top,
			hoveredActionId: null,
		});
		applyInteractionMode(INTERACTION_MODE_PIE, { silent: true });
		return true;
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
		updateViewportPiePointer,
		finishViewportPieMenu,
		closeViewportPieMenu,
		activateLensAdjustMode,
		startLensAdjustDrag,
		handleLensAdjustDragMove,
		handleLensAdjustDragEnd,
		syncControlsToMode,
	};
}
