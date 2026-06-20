import { createOutputFrameAnchorSession } from "./output-frame/anchor-session.js";
import { createApplyOutputFrameResize } from "./output-frame/apply-resize.js";
import { createOutputFrameFitStateController } from "./output-frame/fit-state.js";
import { createOutputFrameInspectorOps } from "./output-frame/inspector-ops.js";
import { createOutputFrameMetricsController } from "./output-frame/metrics.js";
import { createOutputFrameOverlayRenderer } from "./output-frame/overlay-render.js";
import { createOutputFramePanSession } from "./output-frame/pan-session.js";
import { createOutputFrameResizeSession } from "./output-frame/resize-session.js";

const OUTPUT_FRAME_EDGE_SELECT_HIT_RADIUS_PX = 5;

export {
	computeWorkbenchAutoCollapseState,
	computeWorkbenchLayoutState,
} from "./output-frame/layout-compute.js";

export function createOutputFrameController({
	store,
	state,
	viewportShell,
	workbenchRightColumn,
	renderBox,
	renderBoxMeta,
	anchorDot,
	frameOverlayCanvas,
	outputFrameResizeHandles,
	workspacePaneCamera,
	isZoomToolActive,
	t,
	getAnchorLabel,
	currentLocale,
	clearFrameSelection,
	isFrameSelectionActive,
	getActiveShotCameraDocument,
	getShotCameraDocument,
	getActiveShotCameraEntry,
	getReferenceImageController,
	shotCameraRegistry,
	getActiveFrames,
	getFrameAnchorDocument,
	resolveFrameAxis,
	resolveFrameAnchor,
	getBaseFovX,
	updateActiveShotCameraDocument,
	updateUi,
	runHistoryAction = (_label, applyChange) => {
		applyChange?.();
		return false;
	},
	beginHistoryTransaction = () => false,
	commitHistoryTransaction = () => false,
	cancelHistoryTransaction = () => {},
}) {
	const metrics = createOutputFrameMetricsController({
		store,
		viewportShell,
		workbenchRightColumn,
		renderBox,
		getActiveShotCameraDocument,
	});

	const fitState = createOutputFrameFitStateController({
		store,
		getActiveShotCameraDocument,
		updateActiveShotCameraDocument,
		getOutputFrameDocumentState: metrics.getOutputFrameDocumentState,
		getOutputSizeState: metrics.getOutputSizeState,
		getViewportSize: metrics.getViewportSize,
		getWorkbenchContainerSize: metrics.getWorkbenchContainerSize,
		getWorkbenchLayoutState: metrics.getWorkbenchLayoutState,
		isPhoneLikeTouchViewport: metrics.isPhoneLikeTouchViewport,
	});

	const applyOutputFrameResize = createApplyOutputFrameResize({
		store,
		state,
		shotCameraRegistry,
		getActiveShotCameraDocument,
		getShotCameraDocument,
		getActiveShotCameraEntry,
		getOutputFrameMetrics: fitState.getOutputFrameMetrics,
		getOutputFrameDocumentState: metrics.getOutputFrameDocumentState,
		getWorkbenchLayoutState: metrics.getWorkbenchLayoutState,
		getBaseFovX,
		getFrameAnchorDocument,
		resolveFrameAxis,
		resolveFrameAnchor,
	});

	const overlayRenderer = createOutputFrameOverlayRenderer({
		store,
		state,
		t,
		getAnchorLabel,
		currentLocale,
		viewportShell,
		frameOverlayCanvas,
		renderBox,
		renderBoxMeta,
		anchorDot,
		getActiveShotCameraDocument,
		getActiveFrames,
		isFrameSelectionActive,
		getOutputFrameMetrics: fitState.getOutputFrameMetrics,
		getFrameOverlayCanvasOffset: metrics.getFrameOverlayCanvasOffset,
	});

	const panSession = createOutputFramePanSession({
		state,
		workspacePaneCamera,
		isZoomToolActive,
		renderBox,
		updateUi,
		getActiveShotCameraDocument,
		updateActiveShotCameraDocument,
		getOutputFrameMetrics: fitState.getOutputFrameMetrics,
		getViewportSize: metrics.getViewportSize,
		getWorkbenchLayoutState: metrics.getWorkbenchLayoutState,
		getOutputSizeState: metrics.getOutputSizeState,
		syncOutputFrameFitState: fitState.syncOutputFrameFitState,
		selectOutputFrame,
		beginHistoryTransaction,
		commitHistoryTransaction,
	});

	const anchorSession = createOutputFrameAnchorSession({
		state,
		workspacePaneCamera,
		isZoomToolActive,
		renderBox,
		updateUi,
		getActiveShotCameraDocument,
		setOutputFrameAnchor,
		selectOutputFrame,
		clearOutputFramePan: panSession.clearOutputFramePan,
		beginHistoryTransaction,
		commitHistoryTransaction,
	});

	const resizeSession = createOutputFrameResizeSession({
		state,
		workspacePaneCamera,
		isZoomToolActive,
		renderBox,
		outputFrameResizeHandles,
		updateUi,
		getActiveShotCameraDocument,
		updateActiveShotCameraDocument,
		getOutputFrameMetrics: fitState.getOutputFrameMetrics,
		getOutputFrameDocumentState: metrics.getOutputFrameDocumentState,
		getViewportSize: metrics.getViewportSize,
		syncOutputFrameFitState: fitState.syncOutputFrameFitState,
		applyOutputFrameResize,
		selectOutputFrame,
		clearOutputFramePan: panSession.clearOutputFramePan,
		clearOutputFrameAnchorDrag: anchorSession.clearOutputFrameAnchorDrag,
		beginHistoryTransaction,
		commitHistoryTransaction,
	});

	const inspectorOps = createOutputFrameInspectorOps({
		runHistoryAction,
		updateUi,
		getActiveShotCameraDocument,
		updateActiveShotCameraDocument,
		getViewportSize: metrics.getViewportSize,
		syncOutputFrameFitState: fitState.syncOutputFrameFitState,
		applyOutputFrameResize,
		selectOutputFrame,
		handleResize: fitState.handleResize,
		invalidateAutoLayoutSignature: fitState.invalidateAutoLayoutSignature,
		invalidateFitLayoutSignature: fitState.invalidateFitLayoutSignature,
		setOutputFrameAnchor,
	});

	function selectOutputFrame() {
		clearFrameSelection();
		state.outputFrameSelected = true;
	}

	function setOutputFrameAnchor(nextAnchor) {
		updateActiveShotCameraDocument((documentState) => {
			const previousAnchor =
				documentState?.outputFrame?.anchor ?? state.outputFrame.anchor;
			if (!documentState?.outputFrame || previousAnchor === nextAnchor) {
				return documentState;
			}
			getReferenceImageController?.()?.preserveReferenceImagesForOutputFrameAnchorChange?.(
				documentState,
				{
					previousAnchorKey: previousAnchor,
					nextAnchorKey: nextAnchor,
					outputSize: metrics.getOutputSizeState(documentState),
				},
			);
			documentState.outputFrame.anchor = nextAnchor;
			return documentState;
		});
	}

	function clearOutputFrameSelection() {
		cancelHistoryTransaction();
		state.outputFrameSelected = false;
		panSession.clearOutputFramePan();
		anchorSession.clearOutputFrameAnchorDrag();
		resizeSession.clearOutputFrameResize();
	}

	function isOutputFrameSelectHitAtPointer(event) {
		if (state.outputFrameSelected) {
			return false;
		}
		if (state.mode !== workspacePaneCamera || isZoomToolActive()) {
			return false;
		}
		const clientX = Number(event?.clientX);
		const clientY = Number(event?.clientY);
		if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) {
			return false;
		}
		const bounds = renderBox.getBoundingClientRect();
		if (!(bounds.width > 0) || !(bounds.height > 0)) {
			return false;
		}
		const left = bounds.left;
		const top = bounds.top;
		const right = left + bounds.width;
		const bottom = top + bounds.height;
		const radius = OUTPUT_FRAME_EDGE_SELECT_HIT_RADIUS_PX;
		const withinX = clientX >= left - radius && clientX <= right + radius;
		const withinY = clientY >= top - radius && clientY <= bottom + radius;
		return (
			(withinX &&
				(Math.abs(clientY - top) <= radius ||
					Math.abs(clientY - bottom) <= radius)) ||
			(withinY &&
				(Math.abs(clientX - left) <= radius ||
					Math.abs(clientX - right) <= radius))
		);
	}

	return {
		clearOutputFramePan: panSession.clearOutputFramePan,
		clearOutputFrameAnchorDrag: anchorSession.clearOutputFrameAnchorDrag,
		clearOutputFrameResize: resizeSession.clearOutputFrameResize,
		clearOutputFrameSelection,
		selectOutputFrame,
		isOutputFrameSelectHitAtPointer,
		getOutputFrameDocumentState: metrics.getOutputFrameDocumentState,
		getOutputSizeState: metrics.getOutputSizeState,
		getViewportSize: metrics.getViewportSize,
		syncOutputFrameFitState: fitState.syncOutputFrameFitState,
		getOutputFrameMetrics: fitState.getOutputFrameMetrics,
		updateOutputFrameOverlay: overlayRenderer.updateOutputFrameOverlay,
		handleResize: fitState.handleResize,
		setViewZoomFactor: inspectorOps.setViewZoomFactor,
		setBoxWidthPercent: inspectorOps.setBoxWidthPercent,
		setBoxHeightPercent: inspectorOps.setBoxHeightPercent,
		setViewZoomPercent: inspectorOps.setViewZoomPercent,
		fitOutputFrameToSafeArea: inspectorOps.fitOutputFrameToSafeArea,
		canFitOutputFrameToSafeArea: inspectorOps.canFitOutputFrameToSafeArea,
		setAnchor: inspectorOps.setAnchor,
		startOutputFramePan: panSession.startOutputFramePan,
		handleOutputFramePanMove: panSession.handleOutputFramePanMove,
		handleOutputFramePanEnd: panSession.handleOutputFramePanEnd,
		startOutputFrameAnchorDrag: anchorSession.startOutputFrameAnchorDrag,
		handleOutputFrameAnchorDragMove:
			anchorSession.handleOutputFrameAnchorDragMove,
		handleOutputFrameAnchorDragEnd:
			anchorSession.handleOutputFrameAnchorDragEnd,
		startOutputFrameResize: resizeSession.startOutputFrameResize,
		handleOutputFrameResizeMove: resizeSession.handleOutputFrameResizeMove,
		handleOutputFrameResizeEnd: resizeSession.handleOutputFrameResizeEnd,
		applyOutputFrameResize,
	};
}
