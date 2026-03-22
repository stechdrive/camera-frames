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
}) {
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
			await assetController.loadSources(files);
		} catch (error) {
			console.error(error);
			setStatus(error.message);
		}
	});

	listen(window, "resize", () => {
		updateOutputFrameOverlay();
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
		if (event.repeat || isInteractiveTextTarget(event.target)) {
			return;
		}

		if (event.code === "KeyZ") {
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
