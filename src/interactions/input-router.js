export function bindInputRouter({
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
	isViewportSelectMode,
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
}) {
	let viewportSelectClickCandidate = null;

	function isHistoryShortcut(event) {
		const hasHistoryModifier = event.ctrlKey || event.metaKey;
		return (
			hasHistoryModifier && (event.code === "KeyZ" || event.code === "KeyY")
		);
	}

	function isNativeHistoryTarget(target) {
		return (
			target instanceof Element &&
			target.closest(
				[
					"textarea",
					'[contenteditable="true"]',
					'input[type="text"]',
					'input[type="search"]',
					'input[type="url"]',
					'input[type="email"]',
					'input[type="password"]',
					'input[data-draft-editing="true"]',
				].join(", "),
			) !== null
		);
	}

	function syncInteractiveInputNavigationState(isInteractiveInputFocused) {
		if (isInteractiveInputFocused) {
			fpsMovement.enable = false;
			pointerControls.enable = false;
			return;
		}

		const navigationEnabled = state.interactionMode === "navigate";
		fpsMovement.enable = navigationEnabled;
		pointerControls.enable = navigationEnabled;
	}

	function getCameraPoseSignature() {
		const camera = getActiveCamera?.();
		if (!camera) {
			return "none";
		}

		return [
			camera.position.x.toFixed(5),
			camera.position.y.toFixed(5),
			camera.position.z.toFixed(5),
			camera.quaternion.x.toFixed(5),
			camera.quaternion.y.toFixed(5),
			camera.quaternion.z.toFixed(5),
			camera.quaternion.w.toFixed(5),
		].join("|");
	}

	listen(viewportShell, "dragover", (event) => {
		event.preventDefault();
		dropHint.classList.remove("is-hidden");
	});

	listen(viewportShell, "dragleave", (event) => {
		event.preventDefault();
		updateDropHint();
	});

	listen(viewportShell, "drop", async (event) => {
		event.preventDefault();
		const files = [...(event.dataTransfer?.files || [])];
		if (files.length === 0) {
			updateDropHint();
			return;
		}

		try {
			await assetController.importDroppedFiles(files);
		} catch (error) {
			console.error(error);
			setStatus(error.message);
		}
	});

	listen(window, "resize", () => {
		updateOutputFrameOverlay();
	});

	listen(window, "focusin", (event) => {
		if (!isInteractiveTextTarget(event.target)) {
			return;
		}
		syncInteractiveInputNavigationState(true);
		flushNavigationHistory?.();
	});

	listen(window, "focusout", (event) => {
		if (!isInteractiveTextTarget(event.target)) {
			return;
		}
		queueMicrotask(() => {
			syncInteractiveInputNavigationState(
				isInteractiveTextTarget(document.activeElement),
			);
		});
	});

	listen(viewportShell, "pointerdown", (event) => {
		if (startZoomToolDrag(event)) {
			return;
		}

		const target = event.target instanceof Element ? event.target : null;
		if (target?.closest(".frame-item")) {
			return;
		}
		if (target?.closest("#viewport-gizmo")) {
			return;
		}
		if (target?.closest("#render-box")) {
			if (!isFrameSelectionActive()) {
				return;
			}
			clearFrameSelection();
			updateUi();
			return;
		}

		const hadSelection = state.outputFrameSelected || isFrameSelectionActive();
		if (hadSelection) {
			clearFrameSelection();
			clearOutputFrameSelection();
			updateUi();
		}
		if (
			isViewportSelectMode?.() &&
			event.button === 0 &&
			target?.closest("#viewport") === null
		) {
			viewportSelectClickCandidate = null;
			return;
		}

		if (isViewportSelectMode?.() && event.button === 0) {
			viewportSelectClickCandidate = {
				pointerId: event.pointerId,
				startClientX: event.clientX,
				startClientY: event.clientY,
				startPose: getCameraPoseSignature(),
			};
		}
	});

	listen(window, "pointermove", handleZoomToolDragMove);
	listen(window, "pointerup", handleZoomToolDragEnd);
	listen(window, "pointercancel", handleZoomToolDragEnd);
	listen(window, "pointerup", (event) => {
		if (
			!viewportSelectClickCandidate ||
			event.pointerId !== viewportSelectClickCandidate.pointerId
		) {
			return;
		}
		const deltaX = event.clientX - viewportSelectClickCandidate.startClientX;
		const deltaY = event.clientY - viewportSelectClickCandidate.startClientY;
		const isClickLike = Math.hypot(deltaX, deltaY) <= 8;
		const cameraPoseChanged =
			viewportSelectClickCandidate.startPose !== getCameraPoseSignature();
		const shouldSelect = isClickLike && !cameraPoseChanged;
		viewportSelectClickCandidate = null;
		if (!shouldSelect) {
			return;
		}
		pickViewportAssetAtPointer?.(event);
	});
	listen(window, "pointercancel", (event) => {
		if (viewportSelectClickCandidate?.pointerId === event.pointerId) {
			viewportSelectClickCandidate = null;
		}
	});
	listen(window, "pointerup", () => {
		requestNavigationHistoryCommit?.();
	});
	listen(window, "pointercancel", () => {
		requestNavigationHistoryCommit?.();
	});
	listen(window, "keydown", (event) => {
		if (event.repeat) {
			return;
		}

		if (isHistoryShortcut(event) && !isNativeHistoryTarget(event.target)) {
			event.preventDefault();
			if (event.code === "KeyY" || event.shiftKey) {
				redoHistory?.();
			} else {
				undoHistory?.();
			}
			return;
		}

		if (isInteractiveTextTarget(event.target)) {
			return;
		}

		if (
			event.code === "KeyZ" &&
			!event.altKey &&
			!event.ctrlKey &&
			!event.metaKey &&
			!event.shiftKey
		) {
			event.preventDefault();
			toggleZoomTool();
			return;
		}

		if (
			event.code === "KeyV" &&
			(state.mode === "viewport" || state.mode === "camera") &&
			!event.altKey &&
			!event.ctrlKey &&
			!event.metaKey &&
			!event.shiftKey
		) {
			event.preventDefault();
			toggleViewportSelectMode?.();
			return;
		}

		if (event.code === "Escape" && isZoomInteractionMode()) {
			event.preventDefault();
			applyNavigateInteractionMode();
		}
	});
	listen(window, "keyup", (event) => {
		if (isInteractiveTextTarget(event.target)) {
			return;
		}
		requestNavigationHistoryCommit?.();
	});
	listen(window, "blur", () => {
		flushNavigationHistory?.();
	});

	listen(window, "pointermove", handleOutputFramePanMove);
	listen(window, "pointerup", handleOutputFramePanEnd);
	listen(window, "pointercancel", handleOutputFramePanEnd);
	listen(window, "pointermove", handleOutputFrameResizeMove);
	listen(window, "pointerup", handleOutputFrameResizeEnd);
	listen(window, "pointercancel", handleOutputFrameResizeEnd);
	listen(window, "pointermove", handleOutputFrameAnchorDragMove);
	listen(window, "pointerup", handleOutputFrameAnchorDragEnd);
	listen(window, "pointercancel", handleOutputFrameAnchorDragEnd);
	listen(window, "pointermove", handleFrameDragMove);
	listen(window, "pointerup", handleFrameDragEnd);
	listen(window, "pointercancel", handleFrameDragEnd);
	listen(window, "pointermove", handleFrameResizeMove);
	listen(window, "pointerup", handleFrameResizeEnd);
	listen(window, "pointercancel", handleFrameResizeEnd);
	listen(window, "pointermove", handleFrameRotateMove);
	listen(window, "pointerup", handleFrameRotateEnd);
	listen(window, "pointercancel", handleFrameRotateEnd);
	listen(window, "pointermove", handleFrameAnchorDragMove);
	listen(window, "pointerup", handleFrameAnchorDragEnd);
	listen(window, "pointercancel", handleFrameAnchorDragEnd);
	listen(window, "pointermove", handleViewportTransformDragMove);
	listen(window, "pointerup", handleViewportTransformDragEnd);
	listen(window, "pointercancel", handleViewportTransformDragEnd);
	listen(anchorDot, "pointerdown", startOutputFrameAnchorDrag);
}
