import { ANCHORS } from "../../constants.js";

function getNearestAnchorKey(normalizedX, normalizedY) {
	let nearestKey = "center";
	let nearestDistance = Number.POSITIVE_INFINITY;

	for (const [anchorKey, anchor] of Object.entries(ANCHORS)) {
		const dx = normalizedX - anchor.x;
		const dy = normalizedY - anchor.y;
		const distance = dx * dx + dy * dy;

		if (distance < nearestDistance) {
			nearestDistance = distance;
			nearestKey = anchorKey;
		}
	}

	return nearestKey;
}

export function createOutputFrameAnchorSession({
	state,
	workspacePaneCamera,
	isZoomToolActive,
	renderBox,
	updateUi,
	getActiveShotCameraDocument,
	selectOutputFrame,
	clearOutputFramePan,
	beginHistoryTransaction,
	commitHistoryTransaction,
}) {
	let outputFrameAnchorDragState = null;

	function clearOutputFrameAnchorDrag() {
		outputFrameAnchorDragState = null;
		renderBox.classList.remove("is-anchor-active");
	}

	function startOutputFrameAnchorDrag(event) {
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
			return;
		}

		clearOutputFramePan();
		renderBox.classList.add("is-anchor-active");
		outputFrameAnchorDragState = {
			pointerId: event.pointerId,
		};
		beginHistoryTransaction("output-frame.anchor");
	}

	function handleOutputFrameAnchorDragMove(event) {
		if (
			!outputFrameAnchorDragState ||
			event.pointerId !== outputFrameAnchorDragState.pointerId
		) {
			return;
		}

		const bounds = renderBox.getBoundingClientRect();
		if (bounds.width <= 0 || bounds.height <= 0) {
			return;
		}

		const normalizedX = Math.min(
			1,
			Math.max(0, (event.clientX - bounds.left) / bounds.width),
		);
		const normalizedY = Math.min(
			1,
			Math.max(0, (event.clientY - bounds.top) / bounds.height),
		);
		const nextAnchor = getNearestAnchorKey(normalizedX, normalizedY);

		if (nextAnchor === state.outputFrame.anchor) {
			return;
		}

		state.outputFrame.anchor = nextAnchor;
		updateUi();
	}

	function handleOutputFrameAnchorDragEnd(event) {
		if (
			!outputFrameAnchorDragState ||
			event.pointerId !== outputFrameAnchorDragState.pointerId
		) {
			return;
		}

		clearOutputFrameAnchorDrag();
		commitHistoryTransaction("output-frame.anchor");
	}

	return {
		clearOutputFrameAnchorDrag,
		startOutputFrameAnchorDrag,
		handleOutputFrameAnchorDragMove,
		handleOutputFrameAnchorDragEnd,
	};
}
