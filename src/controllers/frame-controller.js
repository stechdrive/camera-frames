import { createCameraFrameAnchorSession } from "./frame/anchor-session.js";
import { createFrameDocumentHelpers } from "./frame/document-helpers.js";
import { createCameraFrameDocumentOpsController } from "./frame/document-ops.js";
import { createCameraFrameDragSession } from "./frame/drag-session.js";
import {
	getFrameAnchorDocument,
	resolveFrameAnchor,
	resolveFrameAxis,
} from "./frame/geometry.js";
import { createCameraFrameMaskController } from "./frame/mask.js";
import { createCameraFrameResizeSession } from "./frame/resize-session.js";
import { createCameraFrameRotateSession } from "./frame/rotate-session.js";
import { createCameraFrameSelectionController } from "./frame/selection-state.js";
import { createCameraFrameTrajectoryController } from "./frame/trajectory.js";
import { createCameraFrameTrajectorySession } from "./frame/trajectory-session.js";

export function createFrameController({
	store,
	state,
	renderBox,
	workspacePaneCamera,
	isZoomToolActive,
	t,
	setStatus,
	updateUi,
	clearOutputFrameSelection,
	clearOutputFramePan,
	getActiveShotCameraDocument,
	updateActiveShotCameraDocument,
	getOutputFrameMetrics,
	runHistoryAction = (_label, applyChange) => {
		applyChange?.();
		return false;
	},
	beginHistoryTransaction = () => false,
	commitHistoryTransaction = () => false,
	cancelHistoryTransaction = () => {},
}) {
	const {
		buildFrameDocumentName,
		getActiveFrames,
		getActiveFrameDocument,
		createWorkspaceFrameDocument,
		hasReachedFrameLimit,
		promoteFrameMaskShapeForMultipleFrames,
	} = createFrameDocumentHelpers({
		t,
		getActiveShotCameraDocument,
	});

	const mask = createCameraFrameMaskController({
		runHistoryAction,
		updateUi,
		getActiveShotCameraDocument,
		updateActiveShotCameraDocument,
		getActiveFrames,
	});

	const trajectory = createCameraFrameTrajectoryController({
		store,
		runHistoryAction,
		updateUi,
		getActiveShotCameraDocument,
		updateActiveShotCameraDocument,
		getActiveFrames,
		getOutputFrameMetrics,
	});

	const selection = createCameraFrameSelectionController({
		store,
		renderBox,
		t,
		setStatus,
		updateUi,
		clearOutputFrameSelection,
		getActiveFrames,
		getActiveShotCameraDocument,
		updateActiveShotCameraDocument,
		getOutputFrameMetrics,
		setFrameMaskSelectedIds: mask.setFrameMaskSelectedIds,
		clearFrameInteraction,
	});

	const documentOps = createCameraFrameDocumentOpsController({
		store,
		t,
		setStatus,
		updateUi,
		runHistoryAction,
		clearOutputFrameSelection,
		clearOutputFramePan,
		clearFrameInteraction,
		getActiveFrames,
		getActiveFrameDocument,
		updateActiveShotCameraDocument,
		buildFrameDocumentName,
		createWorkspaceFrameDocument,
		hasReachedFrameLimit,
		promoteFrameMaskShapeForMultipleFrames,
		getSelectedFrameIds: selection.getSelectedFrameIds,
		setSelectedFrameIds: selection.setSelectedFrameIds,
		setFrameMaskSelectedIds: mask.setFrameMaskSelectedIds,
		getRememberedFrameMaskSelectedIds: mask.getRememberedFrameMaskSelectedIds,
		syncFrameSelectionTransformState: selection.syncFrameSelectionTransformState,
	});

	const dragSession = createCameraFrameDragSession({
		state,
		renderBox,
		workspacePaneCamera,
		isZoomToolActive,
		updateUi,
		getActiveFrames,
		getActiveFrameDocument,
		updateActiveShotCameraDocument,
		isFrameSelected: selection.isFrameSelected,
		activateFrameSelection: selection.activateFrameSelection,
		focusSelectedFrame: selection.focusSelectedFrame,
		buildFrameSelectionTransformState: selection.buildFrameSelectionTransformState,
		setStoredFrameSelectionBox: selection.setStoredFrameSelectionBox,
		clearFrameInteraction,
		beginHistoryTransaction,
		commitHistoryTransaction,
	});

	const resizeSession = createCameraFrameResizeSession({
		state,
		workspacePaneCamera,
		isZoomToolActive,
		updateUi,
		getActiveFrames,
		getActiveFrameDocument,
		updateActiveShotCameraDocument,
		getOutputFrameMetrics,
		isFrameSelected: selection.isFrameSelected,
		activateFrameSelection: selection.activateFrameSelection,
		focusSelectedFrame: selection.focusSelectedFrame,
		buildFrameSelectionTransformState: selection.buildFrameSelectionTransformState,
		setStoredFrameSelectionBox: selection.setStoredFrameSelectionBox,
		clearFrameInteraction,
		beginHistoryTransaction,
		commitHistoryTransaction,
	});

	const rotateSession = createCameraFrameRotateSession({
		state,
		workspacePaneCamera,
		isZoomToolActive,
		updateUi,
		getActiveFrames,
		getActiveFrameDocument,
		updateActiveShotCameraDocument,
		getOutputFrameMetrics,
		isFrameSelected: selection.isFrameSelected,
		activateFrameSelection: selection.activateFrameSelection,
		focusSelectedFrame: selection.focusSelectedFrame,
		buildFrameSelectionTransformState: selection.buildFrameSelectionTransformState,
		setStoredFrameSelectionBox: selection.setStoredFrameSelectionBox,
		clearFrameInteraction,
		beginHistoryTransaction,
		commitHistoryTransaction,
	});

	const anchorSession = createCameraFrameAnchorSession({
		state,
		workspacePaneCamera,
		isZoomToolActive,
		updateUi,
		getActiveFrames,
		getActiveFrameDocument,
		updateActiveShotCameraDocument,
		getOutputFrameMetrics,
		isFrameSelected: selection.isFrameSelected,
		activateFrameSelection: selection.activateFrameSelection,
		focusSelectedFrame: selection.focusSelectedFrame,
		buildFrameSelectionTransformState: selection.buildFrameSelectionTransformState,
		setStoredFrameSelectionBox: selection.setStoredFrameSelectionBox,
		clearFrameInteraction,
		beginHistoryTransaction,
		commitHistoryTransaction,
	});

	const trajectorySession = createCameraFrameTrajectorySession({
		state,
		workspacePaneCamera,
		isZoomToolActive,
		updateUi,
		getActiveFrames,
		getActiveFrameDocument,
		getOutputFrameMetrics,
		isFrameSelected: selection.isFrameSelected,
		activateFrameSelection: selection.activateFrameSelection,
		focusSelectedFrame: selection.focusSelectedFrame,
		setFrameTrajectoryHandlePoint: trajectory.setFrameTrajectoryHandlePoint,
		clearFrameInteraction,
		beginHistoryTransaction,
		commitHistoryTransaction,
	});

	function clearFrameInteraction() {
		cancelHistoryTransaction();
		dragSession.clearFrameDrag();
		resizeSession.clearFrameResize();
		rotateSession.clearFrameRotate();
		anchorSession.clearFrameAnchorDrag();
		trajectorySession.clearFrameTrajectoryHandleDrag();
	}

	return {
		getActiveFrames,
		getActiveFrameDocument,
		resolveFrameAxis,
		resolveFrameAnchor,
		getFrameAnchorDocument,
		isFrameSelectionActive: selection.isFrameSelectionActive,
		getFrameMaskMode: mask.getFrameMaskMode,
		setFrameMaskMode: mask.setFrameMaskMode,
		getFrameMaskPreferredMode: mask.getFrameMaskPreferredMode,
		toggleFrameMaskMode: mask.toggleFrameMaskMode,
		togglePreferredFrameMaskMode: mask.togglePreferredFrameMaskMode,
		setFrameMaskOpacity: mask.setFrameMaskOpacity,
		getFrameMaskShape: mask.getFrameMaskShape,
		setFrameMaskShape: mask.setFrameMaskShape,
		getFrameTrajectoryMode: trajectory.getFrameTrajectoryMode,
		setFrameTrajectoryMode: trajectory.setFrameTrajectoryMode,
		setFrameTrajectoryNodeMode: trajectory.setFrameTrajectoryNodeMode,
		getFrameTrajectoryExportSource: trajectory.getFrameTrajectoryExportSource,
		setFrameTrajectoryExportSource: trajectory.setFrameTrajectoryExportSource,
		setFrameTrajectoryEditMode: trajectory.setFrameTrajectoryEditMode,
		toggleFrameTrajectoryEditMode: trajectory.toggleFrameTrajectoryEditMode,
		setFrameTrajectoryHandlePoint: trajectory.setFrameTrajectoryHandlePoint,
		clearFrameTrajectoryHandlePoint: trajectory.clearFrameTrajectoryHandlePoint,
		syncFrameSelectionTransformState: selection.syncFrameSelectionTransformState,
		clearFrameDrag: dragSession.clearFrameDrag,
		clearFrameInteraction,
		clearFrameSelection: selection.clearFrameSelection,
		selectFrame: selection.selectFrame,
		createFrame: documentOps.createFrame,
		duplicateActiveFrame: documentOps.duplicateActiveFrame,
		duplicateSelectedFrames: documentOps.duplicateSelectedFrames,
		setFrameName: documentOps.setFrameName,
		deleteSelectedFrames: documentOps.deleteSelectedFrames,
		deleteFrame: documentOps.deleteFrame,
		deleteActiveFrame: documentOps.deleteActiveFrame,
		startFrameDrag: dragSession.startFrameDrag,
		startSelectedFramesDrag: dragSession.startSelectedFramesDrag,
		handleFrameDragMove: dragSession.handleFrameDragMove,
		handleFrameDragEnd: dragSession.handleFrameDragEnd,
		startFrameResize: resizeSession.startFrameResize,
		startSelectedFramesResize: resizeSession.startSelectedFramesResize,
		handleFrameResizeMove: resizeSession.handleFrameResizeMove,
		handleFrameResizeEnd: resizeSession.handleFrameResizeEnd,
		startFrameRotate: rotateSession.startFrameRotate,
		startSelectedFramesRotate: rotateSession.startSelectedFramesRotate,
		handleFrameRotateMove: rotateSession.handleFrameRotateMove,
		handleFrameRotateEnd: rotateSession.handleFrameRotateEnd,
		startFrameAnchorDrag: anchorSession.startFrameAnchorDrag,
		startSelectedFramesAnchorDrag: anchorSession.startSelectedFramesAnchorDrag,
		handleFrameAnchorDragMove: anchorSession.handleFrameAnchorDragMove,
		handleFrameAnchorDragEnd: anchorSession.handleFrameAnchorDragEnd,
		startFrameTrajectoryHandleDrag: trajectorySession.startFrameTrajectoryHandleDrag,
		handleFrameTrajectoryHandleDragMove: trajectorySession.handleFrameTrajectoryHandleDragMove,
		handleFrameTrajectoryHandleDragEnd: trajectorySession.handleFrameTrajectoryHandleDragEnd,
	};
}
