import { getFrameDocumentById } from "../../workspace-model.js";
import {
	getFrameAnchorWorldPoint,
	getFrameDocumentCenterFromWorld,
	getPointFromRectLocal,
	inverseRotateVector,
} from "../../engine/frame-transform.js";
import { resolveFrameAnchor } from "./geometry.js";

export function createCameraFrameAnchorSession({
	state,
	workspacePaneCamera,
	isZoomToolActive,
	updateUi,
	getActiveFrames,
	getActiveFrameDocument,
	updateActiveShotCameraDocument,
	getOutputFrameMetrics,
	isFrameSelected,
	activateFrameSelection,
	focusSelectedFrame,
	buildFrameSelectionTransformState,
	setStoredFrameSelectionBox,
	clearFrameInteraction,
	beginHistoryTransaction,
	commitHistoryTransaction,
}) {
	let frameAnchorDragState = null;

	function clearFrameAnchorDrag() {
		frameAnchorDragState = null;
	}

	function startFrameAnchorDrag(frameId, event) {
		if (state.mode !== workspacePaneCamera || isZoomToolActive()) {
			return;
		}

		const frame = getFrameDocumentById(getActiveFrames(), frameId);
		if (!frame) {
			return;
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
			return;
		}

		const selectionState = buildFrameSelectionTransformState();
		if (selectionState) {
			return startSelectedFramesAnchorDrag(event);
		}

		const metrics = getOutputFrameMetrics();
		const anchorWorld = getFrameAnchorWorldPoint(frame, metrics);

		clearFrameInteraction();
		frameAnchorDragState = {
			pointerId: event.pointerId,
			frameId: frame.id,
			metrics,
			pointerOffsetX: event.clientX - anchorWorld.x,
			pointerOffsetY: event.clientY - anchorWorld.y,
		};
		beginHistoryTransaction("frame.anchor");
	}

	function startSelectedFramesAnchorDrag(event) {
		if (state.mode !== workspacePaneCamera || isZoomToolActive()) {
			return false;
		}
		if (event.button !== 0) {
			return false;
		}
		const selectionState = buildFrameSelectionTransformState();
		if (!selectionState?.selectionBoxLogical) {
			return false;
		}

		event.preventDefault();
		event.stopPropagation();
		clearFrameInteraction();
		frameAnchorDragState = {
			type: "multi",
			pointerId: event.pointerId,
			selectionState,
		};
		return true;
	}

	function handleFrameAnchorDragMove(event) {
		if (
			!frameAnchorDragState ||
			event.pointerId !== frameAnchorDragState.pointerId
		) {
			return;
		}

		if (frameAnchorDragState.type === "multi") {
			const { selectionState } = frameAnchorDragState;
			const pointerLocalX =
				((event.clientX - selectionState.renderBoxContentLeft) /
					Math.max(selectionState.metrics.boxWidth, 1e-6)) *
				selectionState.metrics.exportWidth;
			const pointerLocalY =
				((event.clientY - selectionState.renderBoxContentTop) /
					Math.max(selectionState.metrics.boxHeight, 1e-6)) *
				selectionState.metrics.exportHeight;
			const rotationRadians =
				((selectionState.selectionBoxLogical.rotationDeg ?? 0) * Math.PI) / 180;
			const pointerLocal = inverseRotateVector(
				pointerLocalX - selectionState.pivot.x,
				pointerLocalY - selectionState.pivot.y,
				rotationRadians,
			);
			const nextSelectionAnchor = {
				x:
					(selectionState.pivot.x +
						pointerLocal.x -
						selectionState.selectionBoxLogical.left) /
					Math.max(selectionState.selectionBoxLogical.width, 1e-6),
				y:
					(selectionState.pivot.y +
						pointerLocal.y -
						selectionState.selectionBoxLogical.top) /
					Math.max(selectionState.selectionBoxLogical.height, 1e-6),
			};
			const nextAnchorPoint = getPointFromRectLocal({
				left: selectionState.selectionBoxLogical.left,
				top: selectionState.selectionBoxLogical.top,
				width: selectionState.selectionBoxLogical.width,
				height: selectionState.selectionBoxLogical.height,
				localX: nextSelectionAnchor.x,
				localY: nextSelectionAnchor.y,
				anchorAx: selectionState.selectionBoxLogical.anchorX,
				anchorAy: selectionState.selectionBoxLogical.anchorY,
				rotationDeg: selectionState.selectionBoxLogical.rotationDeg,
			});
			setStoredFrameSelectionBox(
				{
					...selectionState.selectionBoxLogical,
					left:
						nextAnchorPoint.x -
						selectionState.selectionBoxLogical.width * nextSelectionAnchor.x,
					top:
						nextAnchorPoint.y -
						selectionState.selectionBoxLogical.height * nextSelectionAnchor.y,
					anchorX: nextSelectionAnchor.x,
					anchorY: nextSelectionAnchor.y,
				},
				nextSelectionAnchor,
			);
			return;
		}

		updateActiveShotCameraDocument((documentState) => {
			const frame = getFrameDocumentById(
				documentState.frames,
				frameAnchorDragState.frameId,
			);
			if (!frame) {
				return documentState;
			}

			const nextAnchor = getFrameDocumentCenterFromWorld(
				event.clientX - frameAnchorDragState.pointerOffsetX,
				event.clientY - frameAnchorDragState.pointerOffsetY,
				frameAnchorDragState.metrics,
			);
			frame.anchor = resolveFrameAnchor(nextAnchor, {
				x: frame.x,
				y: frame.y,
			});
			documentState.activeFrameId = frame.id;
			return documentState;
		});
	}

	function handleFrameAnchorDragEnd(event) {
		if (
			!frameAnchorDragState ||
			event.pointerId !== frameAnchorDragState.pointerId
		) {
			return;
		}

		const shouldCommit = frameAnchorDragState.type !== "multi";
		clearFrameAnchorDrag();
		if (shouldCommit) {
			commitHistoryTransaction("frame.anchor");
		}
	}

	return {
		clearFrameAnchorDrag,
		startFrameAnchorDrag,
		startSelectedFramesAnchorDrag,
		handleFrameAnchorDragMove,
		handleFrameAnchorDragEnd,
	};
}
