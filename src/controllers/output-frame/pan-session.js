import { clampOutputFrameCenterPx, getRenderBoxMetrics } from "../../engine/projection.js";

export function createOutputFramePanSession({
	state,
	workspacePaneCamera,
	isZoomToolActive,
	renderBox,
	updateUi,
	getActiveShotCameraDocument,
	updateActiveShotCameraDocument,
	getOutputFrameMetrics,
	getViewportSize,
	getWorkbenchLayoutState,
	getOutputSizeState,
	syncOutputFrameFitState,
	selectOutputFrame,
	beginHistoryTransaction,
	commitHistoryTransaction,
}) {
	let outputFramePanState = null;

	function clearOutputFramePan() {
		outputFramePanState = null;
		renderBox.classList.remove("is-pan-active");
	}

	function startOutputFramePan(event) {
		if (state.mode !== workspacePaneCamera || isZoomToolActive()) {
			return;
		}

		const activeDocument = getActiveShotCameraDocument();
		if (!activeDocument) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();

		if (!state.outputFrameSelected) {
			selectOutputFrame();
			updateUi();
		}

		const metrics = getOutputFrameMetrics(activeDocument);

		outputFramePanState = {
			pointerId: event.pointerId,
			startClientX: event.clientX,
			startClientY: event.clientY,
			startCenterX: metrics.boxCenterX,
			startCenterY: metrics.boxCenterY,
		};
		beginHistoryTransaction("output-frame.pan");
		renderBox.classList.add("is-pan-active");
	}

	function handleOutputFramePanMove(event) {
		if (
			!outputFramePanState ||
			event.pointerId !== outputFramePanState.pointerId
		) {
			return;
		}

		const activeDocument = getActiveShotCameraDocument();
		if (!activeDocument) {
			return;
		}

		const { width: viewportWidth, height: viewportHeight } = getViewportSize();
		const layout = getWorkbenchLayoutState();
		const outputFrameDocument = syncOutputFrameFitState(
			activeDocument,
			viewportWidth,
			viewportHeight,
		);
		const exportSize = getOutputSizeState(activeDocument);
		const desiredCenterX =
			outputFramePanState.startCenterX +
			(event.clientX - outputFramePanState.startClientX);
		const desiredCenterY =
			outputFramePanState.startCenterY +
			(event.clientY - outputFramePanState.startClientY);
		const panMetrics = getRenderBoxMetrics({
			viewportWidth,
			viewportHeight,
			exportWidth: exportSize.width,
			exportHeight: exportSize.height,
			viewZoom: outputFrameDocument.viewZoom ?? 1,
			fitScale: outputFrameDocument.fitScale,
			viewportCenterX: desiredCenterX / viewportWidth,
			viewportCenterY: desiredCenterY / viewportHeight,
			anchorKey: outputFrameDocument.anchor ?? "center",
		});
		const clampedCenter = clampOutputFrameCenterPx({
			centerX: desiredCenterX,
			centerY: desiredCenterY,
			viewportWidth,
			viewportHeight,
			boxWidth: panMetrics.boxWidth,
			boxHeight: panMetrics.boxHeight,
			safeLeft: layout.safeLeft,
			safeRight: layout.safeRight,
			safeTop: layout.safeTop,
			safeBottom: layout.safeBottom,
		});

		updateActiveShotCameraDocument((documentState) => {
			documentState.outputFrame.fitScale = outputFrameDocument.fitScale;
			documentState.outputFrame.fitViewportWidth = viewportWidth;
			documentState.outputFrame.fitViewportHeight = viewportHeight;
			documentState.outputFrame.viewportCenterX =
				clampedCenter.x / viewportWidth;
			documentState.outputFrame.viewportCenterY =
				clampedCenter.y / viewportHeight;
			documentState.outputFrame.viewportCenterAuto = false;
			return documentState;
		});
		updateUi();
	}

	function handleOutputFramePanEnd(event) {
		if (
			!outputFramePanState ||
			event.pointerId !== outputFramePanState.pointerId
		) {
			return;
		}

		clearOutputFramePan();
		commitHistoryTransaction("output-frame.pan");
	}

	return {
		clearOutputFramePan,
		startOutputFramePan,
		handleOutputFramePanMove,
		handleOutputFramePanEnd,
	};
}
