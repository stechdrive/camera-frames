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
	undoHistory,
	redoHistory,
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
}) {
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
		if (target?.closest("#render-box")) {
			if (!isFrameSelectionActive()) {
				return;
			}
			clearFrameSelection();
			updateUi();
			return;
		}

		const hadSelection = state.outputFrameSelected || isFrameSelectionActive();
		if (!hadSelection) {
			return;
		}

		clearFrameSelection();
		clearOutputFrameSelection();
		updateUi();
	});

	listen(window, "pointermove", handleZoomToolDragMove);
	listen(window, "pointerup", handleZoomToolDragEnd);
	listen(window, "pointercancel", handleZoomToolDragEnd);
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

		if (event.code === "Escape" && isZoomInteractionMode()) {
			event.preventDefault();
			applyNavigateInteractionMode();
		}
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
	listen(anchorDot, "pointerdown", startOutputFrameAnchorDrag);
}
