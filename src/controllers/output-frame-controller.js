import { createOutputFrameAnchorSession } from "./output-frame/anchor-session.js";
import { createApplyOutputFrameResize } from "./output-frame/apply-resize.js";
import { createOutputFrameFitStateController } from "./output-frame/fit-state.js";
import { createOutputFrameInspectorOps } from "./output-frame/inspector-ops.js";
import { createOutputFrameMetricsController } from "./output-frame/metrics.js";
import { createOutputFrameOverlayRenderer } from "./output-frame/overlay-render.js";
import { createOutputFramePanSession } from "./output-frame/pan-session.js";
import { createOutputFrameResizeSession } from "./output-frame/resize-session.js";

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
		state,
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
	});

	function selectOutputFrame() {
		clearFrameSelection();
		state.outputFrameSelected = true;
	}

	function clearOutputFrameSelection() {
		cancelHistoryTransaction();
		state.outputFrameSelected = false;
		panSession.clearOutputFramePan();
		anchorSession.clearOutputFrameAnchorDrag();
		resizeSession.clearOutputFrameResize();
	}

	return {
		clearOutputFramePan: panSession.clearOutputFramePan,
		clearOutputFrameAnchorDrag: anchorSession.clearOutputFrameAnchorDrag,
		clearOutputFrameResize: resizeSession.clearOutputFrameResize,
		clearOutputFrameSelection,
		selectOutputFrame,
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
