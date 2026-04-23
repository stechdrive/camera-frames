import { getFrameDocumentCenterFromWorld } from "../../engine/frame-transform.js";
import { getFrameDocumentById } from "../../workspace-model.js";

export function createCameraFrameTrajectorySession({
	state,
	workspacePaneCamera,
	isZoomToolActive,
	updateUi,
	getActiveFrames,
	getActiveFrameDocument,
	getOutputFrameMetrics,
	isFrameSelected,
	activateFrameSelection,
	focusSelectedFrame,
	setFrameTrajectoryHandlePoint,
	clearFrameInteraction,
	beginHistoryTransaction,
	commitHistoryTransaction,
}) {
	let frameTrajectoryHandleDragState = null;

	function clearFrameTrajectoryHandleDrag() {
		frameTrajectoryHandleDragState = null;
	}

	function startFrameTrajectoryHandleDrag(frameId, handleKey, event) {
		if (state.mode !== workspacePaneCamera || isZoomToolActive()) {
			return false;
		}
		if (event.button !== 0) {
			return false;
		}
		if (handleKey !== "in" && handleKey !== "out") {
			return false;
		}

		const frame = getFrameDocumentById(getActiveFrames(), frameId);
		if (!frame) {
			return false;
		}

		event.preventDefault();
		event.stopPropagation();
		if (isFrameSelected(frameId)) {
			if (getActiveFrameDocument()?.id !== frameId) {
				focusSelectedFrame(frameId);
				updateUi();
			}
		} else {
			activateFrameSelection(frameId);
			updateUi();
		}

		clearFrameInteraction();
		frameTrajectoryHandleDragState = {
			pointerId: event.pointerId,
			frameId,
			handleKey,
			metrics: getOutputFrameMetrics(),
		};
		beginHistoryTransaction("frame.trajectory-handle");
		return true;
	}

	function handleFrameTrajectoryHandleDragMove(event) {
		if (
			!frameTrajectoryHandleDragState ||
			event.pointerId !== frameTrajectoryHandleDragState.pointerId
		) {
			return;
		}

		const nextPoint = getFrameDocumentCenterFromWorld(
			event.clientX,
			event.clientY,
			frameTrajectoryHandleDragState.metrics,
		);
		setFrameTrajectoryHandlePoint(
			frameTrajectoryHandleDragState.frameId,
			frameTrajectoryHandleDragState.handleKey,
			nextPoint,
		);
	}

	function handleFrameTrajectoryHandleDragEnd(event) {
		if (
			!frameTrajectoryHandleDragState ||
			event.pointerId !== frameTrajectoryHandleDragState.pointerId
		) {
			return;
		}

		clearFrameTrajectoryHandleDrag();
		commitHistoryTransaction("frame.trajectory-handle");
	}

	return {
		clearFrameTrajectoryHandleDrag,
		startFrameTrajectoryHandleDrag,
		handleFrameTrajectoryHandleDragMove,
		handleFrameTrajectoryHandleDragEnd,
	};
}
