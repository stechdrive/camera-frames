export function createInteractionController({
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
}) {
	const INTERACTION_MODE_NAVIGATE = "navigate";
	const INTERACTION_MODE_ZOOM = "zoom";
	let zoomToolDragState = null;

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

	function applyInteractionMode(nextMode, { silent = false } = {}) {
		if (state.interactionMode === nextMode) {
			return;
		}

		state.interactionMode = nextMode;
		clearZoomToolDrag();
		clearControlMomentum();
		const navigationEnabled = nextMode === INTERACTION_MODE_NAVIGATE;
		fpsMovement.enable = false;
		pointerControls.enable = navigationEnabled;
		if (!silent) {
			setStatus(navigationEnabled ? "" : t("status.zoomToolEnabled"));
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
		isInteractiveTextTarget,
		clearZoomToolDrag,
		clearControlMomentum,
		applyInteractionMode,
		applyNavigateInteractionMode,
		toggleZoomTool,
		startZoomToolDrag,
		handleZoomToolDragMove,
		handleZoomToolDragEnd,
		syncControlsToMode,
	};
}
