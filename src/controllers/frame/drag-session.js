import { getFrameDocumentById } from "../../workspace-model.js";
import {
	clearGlobalFrameCursor,
	getEventCursor,
	setGlobalFrameCursor,
} from "./cursor-utils.js";
import {
	getFrameAnchorDocument,
	resolveFrameAnchor,
	resolveFrameAxis,
} from "./geometry.js";

const FRAME_DRAG_START_THRESHOLD_PX = 4;

export function createCameraFrameDragSession({
	state,
	renderBox,
	workspacePaneCamera,
	isZoomToolActive,
	updateUi,
	getActiveFrames,
	getActiveFrameDocument,
	updateActiveShotCameraDocument,
	isFrameSelected,
	activateFrameSelection,
	focusSelectedFrame,
	buildFrameSelectionTransformState,
	setStoredFrameSelectionBox,
	clearFrameInteraction,
	beginHistoryTransaction,
	commitHistoryTransaction,
}) {
	let frameDragState = null;

	function clearFrameDrag() {
		frameDragState = null;
		clearGlobalFrameCursor();
	}

	function startFrameDrag(frameId, event) {
		if (state.mode !== workspacePaneCamera || isZoomToolActive()) {
			return;
		}

		const frame = getFrameDocumentById(getActiveFrames(), frameId);
		if (!frame) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();

		let dragFrame = frame;
		if (isFrameSelected(frameId)) {
			if (getActiveFrameDocument()?.id !== frameId) {
				dragFrame = focusSelectedFrame(frameId) ?? frame;
				updateUi();
			}
		} else {
			dragFrame = activateFrameSelection(frameId, event) ?? frame;
			updateUi();
			if (event.shiftKey || event.metaKey || event.ctrlKey) {
				return;
			}
		}

		const selectionState = buildFrameSelectionTransformState();
		if (selectionState) {
			clearFrameInteraction();
			frameDragState = {
				type: "multi",
				pointerId: event.pointerId,
				startClientX: event.clientX,
				startClientY: event.clientY,
				selectionState,
				dragActivated: false,
				cursorValue: getEventCursor(event, "move"),
			};
			return;
		}

		const bounds = renderBox.getBoundingClientRect();
		if (bounds.width <= 0 || bounds.height <= 0) {
			return;
		}

		clearFrameInteraction();
		const anchor = getFrameAnchorDocument(dragFrame);
		frameDragState = {
			pointerId: event.pointerId,
			frameId: dragFrame.id,
			startClientX: event.clientX,
			startClientY: event.clientY,
			startX: dragFrame.x,
			startY: dragFrame.y,
			startAnchorX: anchor.x,
			startAnchorY: anchor.y,
			dragActivated: false,
			cursorValue: getEventCursor(event, "move"),
		};
	}

	function startSelectedFramesDrag(event) {
		if (state.mode !== workspacePaneCamera || isZoomToolActive()) {
			return false;
		}
		if (event.button !== 0) {
			return false;
		}
		const selectionState = buildFrameSelectionTransformState();
		if (!selectionState) {
			return false;
		}

		event.preventDefault();
		event.stopPropagation();
		clearFrameInteraction();
		frameDragState = {
			type: "multi",
			pointerId: event.pointerId,
			startClientX: event.clientX,
			startClientY: event.clientY,
			selectionState,
			dragActivated: false,
			cursorValue: getEventCursor(event, "move"),
		};
		return true;
	}

	function handleFrameDragMove(event) {
		if (!frameDragState || event.pointerId !== frameDragState.pointerId) {
			return;
		}

		const bounds = renderBox.getBoundingClientRect();
		if (bounds.width <= 0 || bounds.height <= 0) {
			return;
		}

		const deltaClientX = event.clientX - frameDragState.startClientX;
		const deltaClientY = event.clientY - frameDragState.startClientY;
		if (!frameDragState.dragActivated) {
			if (
				Math.hypot(deltaClientX, deltaClientY) < FRAME_DRAG_START_THRESHOLD_PX
			) {
				return;
			}
			frameDragState.dragActivated = true;
			beginHistoryTransaction("frame.drag");
			setGlobalFrameCursor(frameDragState.cursorValue);
		}

		let deltaX = deltaClientX / bounds.width;
		let deltaY = deltaClientY / bounds.height;

		if (event.shiftKey) {
			if (Math.abs(deltaX) >= Math.abs(deltaY)) {
				deltaY = 0;
			} else {
				deltaX = 0;
			}
		}

		if (frameDragState.type === "multi") {
			const selectionState = frameDragState.selectionState;
			const deltaPxX = deltaX * selectionState.metrics.exportWidth;
			const deltaPxY = deltaY * selectionState.metrics.exportHeight;
			setStoredFrameSelectionBox(
				{
					...selectionState.selectionBoxLogical,
					left: selectionState.selectionBoxLogical.left + deltaPxX,
					top: selectionState.selectionBoxLogical.top + deltaPxY,
				},
				selectionState.anchorLocal,
			);
			updateActiveShotCameraDocument((documentState) => {
				for (const geometry of selectionState.geometries) {
					const frame = getFrameDocumentById(
						documentState.frames,
						geometry.frame.id,
					);
					if (!frame) {
						continue;
					}
					frame.x = resolveFrameAxis(
						(geometry.centerPoint.x + deltaPxX) /
							Math.max(selectionState.metrics.exportWidth, 1e-6),
					);
					frame.y = resolveFrameAxis(
						(geometry.centerPoint.y + deltaPxY) /
							Math.max(selectionState.metrics.exportHeight, 1e-6),
					);
					frame.anchor = resolveFrameAnchor(
						{
							x:
								(geometry.anchorPoint.x + deltaPxX) /
								Math.max(selectionState.metrics.exportWidth, 1e-6),
							y:
								(geometry.anchorPoint.y + deltaPxY) /
								Math.max(selectionState.metrics.exportHeight, 1e-6),
						},
						{
							x: frame.x,
							y: frame.y,
						},
					);
				}
				return documentState;
			});
			return;
		}

		updateActiveShotCameraDocument((documentState) => {
			const frame = getFrameDocumentById(
				documentState.frames,
				frameDragState.frameId,
			);
			if (!frame) {
				return documentState;
			}

			frame.x = resolveFrameAxis(frameDragState.startX + deltaX);
			frame.y = resolveFrameAxis(frameDragState.startY + deltaY);
			frame.anchor = resolveFrameAnchor(
				{
					x: frameDragState.startAnchorX + deltaX,
					y: frameDragState.startAnchorY + deltaY,
				},
				{
					x: frame.x,
					y: frame.y,
				},
			);
			documentState.activeFrameId = frame.id;
			return documentState;
		});
	}

	function handleFrameDragEnd(event) {
		if (!frameDragState || event.pointerId !== frameDragState.pointerId) {
			return;
		}

		const shouldCommit = frameDragState.dragActivated;
		clearFrameDrag();
		if (shouldCommit) {
			commitHistoryTransaction("frame.drag");
		}
	}

	return {
		clearFrameDrag,
		startFrameDrag,
		startSelectedFramesDrag,
		handleFrameDragMove,
		handleFrameDragEnd,
	};
}
