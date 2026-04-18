import { BASE_RENDER_BOX } from "../../constants.js";

function resolveOutputFrameResizeScale({
	startDistance,
	pointerDelta,
	handleFactor,
	displayScale,
	baseDimension,
	fallbackScale,
}) {
	const factor = Math.abs(handleFactor);
	if (factor < 1e-6 || !(displayScale > 0)) {
		return fallbackScale;
	}

	const nextDistance = Math.max(
		1e-6,
		startDistance + pointerDelta * Math.sign(handleFactor),
	);
	return nextDistance / Math.max(baseDimension * displayScale * factor, 1e-6);
}

export function createOutputFrameResizeSession({
	state,
	workspacePaneCamera,
	isZoomToolActive,
	renderBox,
	outputFrameResizeHandles,
	updateUi,
	getActiveShotCameraDocument,
	updateActiveShotCameraDocument,
	getOutputFrameMetrics,
	getOutputFrameDocumentState,
	getViewportSize,
	syncOutputFrameFitState,
	applyOutputFrameResize,
	selectOutputFrame,
	clearOutputFramePan,
	clearOutputFrameAnchorDrag,
	beginHistoryTransaction,
	commitHistoryTransaction,
}) {
	let outputFrameResizeState = null;

	function clearOutputFrameResize() {
		outputFrameResizeState = null;
		renderBox.classList.remove("is-resize-active");
	}

	function startOutputFrameResize(handleKey, event) {
		if (state.mode !== workspacePaneCamera || isZoomToolActive()) {
			return;
		}

		const activeDocument = getActiveShotCameraDocument();
		if (!activeDocument) {
			return;
		}

		const handle = outputFrameResizeHandles[handleKey];
		if (!handle) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();

		if (!state.outputFrameSelected) {
			selectOutputFrame();
			updateUi();
			return;
		}

		clearOutputFramePan();
		clearOutputFrameAnchorDrag();
		renderBox.classList.add("is-resize-active");

		const metrics = getOutputFrameMetrics(activeDocument);
		const outputFrameDocument = getOutputFrameDocumentState(activeDocument);

		outputFrameResizeState = {
			pointerId: event.pointerId,
			startClientX: event.clientX,
			startClientY: event.clientY,
			handleFactorX: handle.affectsWidth ? handle.x - metrics.anchor.x : 0,
			handleFactorY: handle.affectsHeight ? handle.y - metrics.anchor.y : 0,
			displayScale: metrics.displayScale,
			startWidthScale: outputFrameDocument.widthScale ?? 1,
			startHeightScale: outputFrameDocument.heightScale ?? 1,
			startWidthDistance:
				metrics.boxWidth *
				Math.abs(handle.affectsWidth ? handle.x - metrics.anchor.x : 0),
			startHeightDistance:
				metrics.boxHeight *
				Math.abs(handle.affectsHeight ? handle.y - metrics.anchor.y : 0),
		};
		beginHistoryTransaction("output-frame.resize");
	}

	function handleOutputFrameResizeMove(event) {
		if (
			!outputFrameResizeState ||
			event.pointerId !== outputFrameResizeState.pointerId
		) {
			return;
		}

		const nextWidthScale = resolveOutputFrameResizeScale({
			startDistance: outputFrameResizeState.startWidthDistance,
			pointerDelta: event.clientX - outputFrameResizeState.startClientX,
			handleFactor: outputFrameResizeState.handleFactorX,
			displayScale: outputFrameResizeState.displayScale,
			baseDimension: BASE_RENDER_BOX.width,
			fallbackScale: outputFrameResizeState.startWidthScale,
		});
		const nextHeightScale = resolveOutputFrameResizeScale({
			startDistance: outputFrameResizeState.startHeightDistance,
			pointerDelta: event.clientY - outputFrameResizeState.startClientY,
			handleFactor: outputFrameResizeState.handleFactorY,
			displayScale: outputFrameResizeState.displayScale,
			baseDimension: BASE_RENDER_BOX.height,
			fallbackScale: outputFrameResizeState.startHeightScale,
		});

		updateActiveShotCameraDocument((documentState) => {
			applyOutputFrameResize(documentState, nextWidthScale, nextHeightScale);
			return documentState;
		});
		updateUi();
	}

	function handleOutputFrameResizeEnd(event) {
		if (
			!outputFrameResizeState ||
			event.pointerId !== outputFrameResizeState.pointerId
		) {
			return;
		}

		updateActiveShotCameraDocument((documentState) => {
			const { width, height } = getViewportSize();
			const metrics = getOutputFrameMetrics(documentState);
			const shouldAutoFit =
				metrics.boxWidth > width || metrics.boxHeight > height;
			if (shouldAutoFit) {
				syncOutputFrameFitState(documentState, width, height, true);
			}
			return documentState;
		});
		clearOutputFrameResize();
		commitHistoryTransaction("output-frame.resize");
		updateUi();
	}

	return {
		clearOutputFrameResize,
		startOutputFrameResize,
		handleOutputFrameResizeMove,
		handleOutputFrameResizeEnd,
	};
}
