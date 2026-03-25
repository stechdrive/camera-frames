import { ANCHORS, FRAME_MAX_COUNT } from "../constants.js";
import { getFrameOutlineSpec } from "../engine/frame-overlay.js";
import {
	FRAME_MAX_SCALE,
	FRAME_MIN_SCALE,
	FRAME_RESIZE_HANDLES,
	getFrameAnchorLocalNormalized,
	getFrameAnchorWorldPoint,
	getFrameDocumentCenterFromWorld,
	getFrameResizeAxisLocal,
	getFrameWorldPointFromLocal,
	getOppositeFrameResizeHandleKey,
	getUniformFrameScaleFromHandle,
	inverseRotateVector,
	normalizeRotationDegrees,
	rotateVector,
} from "../engine/frame-transform.js";
import { getFrameRotateCursorCss } from "../engine/rotate-cursor.js";
import {
	createFrameDocument,
	getFrameDisplayLabel,
	getFrameDocumentById,
	getFrameDocumentId,
	getNextFrameNumber,
	getActiveFrameDocument as resolveActiveFrameDocument,
} from "../workspace-model.js";

const FRAME_DRAG_START_THRESHOLD_PX = 4;

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
	let frameDragState = null;
	let frameResizeState = null;
	let frameRotateState = null;
	let frameAnchorDragState = null;

	function setGlobalFrameCursor(cursorValue) {
		if (typeof document === "undefined") {
			return;
		}

		document.body.style.cursor = cursorValue;
	}

	function setGlobalRotateCursor(rotationDegrees, zoneKey) {
		setGlobalFrameCursor(getFrameRotateCursorCss(rotationDegrees, zoneKey));
	}

	function clearGlobalFrameCursor() {
		if (typeof document === "undefined") {
			return;
		}

		document.body.style.removeProperty("cursor");
	}

	function getEventCursor(event, fallback) {
		const target = event?.currentTarget;
		if (!(target instanceof Element)) {
			return fallback;
		}

		return getComputedStyle(target).cursor || fallback;
	}

	function buildFrameDocumentName(nextNumber) {
		return t("frame.defaultName", { index: getFrameDisplayLabel(nextNumber) });
	}

	function getActiveFrames() {
		return getActiveShotCameraDocument()?.frames ?? [];
	}

	function getActiveFrameDocument() {
		return resolveActiveFrameDocument(
			getActiveFrames(),
			getActiveShotCameraDocument()?.activeFrameId ?? null,
		);
	}

	function createWorkspaceFrameDocument(sourceFrame = null) {
		const nextNumber = getNextFrameNumber(getActiveFrames());
		return createFrameDocument({
			id: getFrameDocumentId(nextNumber),
			name: buildFrameDocumentName(nextNumber),
			source: sourceFrame,
		});
	}

	function hasReachedFrameLimit() {
		return getActiveFrames().length >= FRAME_MAX_COUNT;
	}

	function resolveFrameAxis(value) {
		return Number.isFinite(value) ? value : 0;
	}

	function resolveFrameScale(value) {
		const nextValue = Number(value);
		return Number.isFinite(nextValue) && nextValue > 0
			? Math.min(FRAME_MAX_SCALE, Math.max(FRAME_MIN_SCALE, nextValue))
			: 1;
	}

	function resolveFrameAnchor(value, fallback = null) {
		const fallbackAnchor = fallback ?? { x: 0.5, y: 0.5 };
		const nextAnchor =
			value && typeof value === "object"
				? value
				: typeof value === "string" && ANCHORS[value]
					? ANCHORS[value]
					: fallbackAnchor;

		return {
			x: resolveFrameAxis(nextAnchor.x ?? fallbackAnchor.x),
			y: resolveFrameAxis(nextAnchor.y ?? fallbackAnchor.y),
		};
	}

	function getFrameAnchorDocument(frame) {
		return resolveFrameAnchor(frame?.anchor, {
			x: resolveFrameAxis(frame?.x ?? 0.5),
			y: resolveFrameAxis(frame?.y ?? 0.5),
		});
	}

	function offsetFrameDocument(frame, xOffset, yOffset) {
		const nextFrame = {
			...frame,
			x: resolveFrameAxis(frame.x + xOffset),
			y: resolveFrameAxis(frame.y + yOffset),
		};

		const anchor = getFrameAnchorDocument(frame);
		nextFrame.anchor = resolveFrameAnchor(
			{
				x: anchor.x + xOffset,
				y: anchor.y + yOffset,
			},
			{
				x: nextFrame.x,
				y: nextFrame.y,
			},
		);

		return nextFrame;
	}

	function getFrameScreenSpec(frame, metrics = getOutputFrameMetrics()) {
		return getFrameOutlineSpec(
			frame,
			metrics.boxWidth,
			metrics.boxHeight,
			metrics.exportWidth,
			metrics.exportHeight,
			metrics.boxLeft,
			metrics.boxTop,
		);
	}

	function updateFrameCenterFromWorldPoint(frame, centerX, centerY, metrics) {
		const center = getFrameDocumentCenterFromWorld(centerX, centerY, metrics);
		frame.x = resolveFrameAxis(center.x);
		frame.y = resolveFrameAxis(center.y);
		return frame;
	}

	function updateFrameTransformFromWorldCenter(
		frame,
		metrics,
		{
			centerWorldX,
			centerWorldY,
			scale = frame.scale,
			rotation = frame.rotation,
		},
	) {
		updateFrameCenterFromWorldPoint(frame, centerWorldX, centerWorldY, metrics);
		frame.scale = resolveFrameScale(scale);
		frame.rotation = normalizeRotationDegrees(rotation);
		frame.anchor = resolveFrameAnchor(frame.anchor, {
			x: frame.x,
			y: frame.y,
		});
		return frame;
	}

	function isFrameSelectionActive() {
		return store.frames.selectionActive.value;
	}

	function isFrameSelected(frameId) {
		return isFrameSelectionActive() && store.frames.activeId.value === frameId;
	}

	function clearFrameDrag() {
		frameDragState = null;
		clearGlobalFrameCursor();
	}

	function clearFrameResize() {
		frameResizeState = null;
		clearGlobalFrameCursor();
	}

	function clearFrameRotate() {
		frameRotateState = null;
		clearGlobalFrameCursor();
	}

	function clearFrameAnchorDrag() {
		frameAnchorDragState = null;
	}

	function clearFrameInteraction() {
		cancelHistoryTransaction();
		clearFrameDrag();
		clearFrameResize();
		clearFrameRotate();
		clearFrameAnchorDrag();
	}

	function clearFrameSelection() {
		store.frames.selectionActive.value = false;
		clearFrameInteraction();
	}

	function activateFrameSelection(frameId) {
		const frame = getFrameDocumentById(getActiveFrames(), frameId);
		if (!frame) {
			return null;
		}

		clearOutputFrameSelection();
		clearFrameInteraction();
		let selectedFrame = frame;
		updateActiveShotCameraDocument((documentState) => {
			const nextFrame = getFrameDocumentById(documentState.frames, frame.id);
			if (!nextFrame) {
				return documentState;
			}

			documentState.activeFrameId = nextFrame.id;
			nextFrame.anchor = {
				x: nextFrame.x,
				y: nextFrame.y,
			};
			selectedFrame = nextFrame;
			return documentState;
		});
		store.frames.selectionActive.value = true;
		return selectedFrame;
	}

	function selectFrame(frameId) {
		const frame = activateFrameSelection(frameId);
		if (!frame) {
			return;
		}

		updateUi();
		setStatus(
			t("status.selectedFrame", {
				name: frame.name,
			}),
		);
	}

	function createFrame() {
		if (hasReachedFrameLimit()) {
			setStatus(
				t("status.frameLimitReached", {
					limit: FRAME_MAX_COUNT,
				}),
			);
			return;
		}

		const nextFrame = createWorkspaceFrameDocument();
		clearOutputFrameSelection();
		clearFrameInteraction();
		runHistoryAction?.("frame.create", () => {
			updateActiveShotCameraDocument((documentState) => {
				documentState.frames = [...documentState.frames, nextFrame];
				documentState.activeFrameId = nextFrame.id;
				return documentState;
			});
		});
		store.frames.selectionActive.value = true;
		updateUi();
		setStatus(
			t("status.createdFrame", {
				name: nextFrame.name,
			}),
		);
	}

	function duplicateActiveFrame() {
		const activeFrame = getActiveFrameDocument();
		if (!activeFrame) {
			createFrame();
			return;
		}

		if (hasReachedFrameLimit()) {
			setStatus(
				t("status.frameLimitReached", {
					limit: FRAME_MAX_COUNT,
				}),
			);
			return;
		}

		const nextFrame = offsetFrameDocument(
			createWorkspaceFrameDocument(activeFrame),
			0.04,
			0.04,
		);
		clearOutputFrameSelection();
		clearFrameInteraction();
		runHistoryAction?.("frame.duplicate", () => {
			updateActiveShotCameraDocument((documentState) => {
				documentState.frames = [...documentState.frames, nextFrame];
				documentState.activeFrameId = nextFrame.id;
				return documentState;
			});
		});
		store.frames.selectionActive.value = true;
		updateUi();
		setStatus(
			t("status.duplicatedFrame", {
				name: nextFrame.name,
			}),
		);
	}

	function deleteActiveFrame() {
		const activeFrame = getActiveFrameDocument();
		if (!activeFrame) {
			return;
		}

		clearFrameInteraction();
		clearOutputFramePan();
		runHistoryAction?.("frame.delete", () => {
			updateActiveShotCameraDocument((documentState) => {
				const remainingFrames = documentState.frames.filter(
					(frame) => frame.id !== activeFrame.id,
				);
				documentState.frames = remainingFrames;
				documentState.activeFrameId = remainingFrames[0]?.id ?? null;
				return documentState;
			});
		});
		store.frames.selectionActive.value = getActiveFrames().length > 0;
		updateUi();
		setStatus(
			t("status.deletedFrame", {
				name: activeFrame.name,
			}),
		);
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
		if (!isFrameSelected(frameId)) {
			dragFrame = activateFrameSelection(frameId) ?? frame;
			updateUi();
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

	function startFrameResize(frameId, handleKey, event) {
		if (state.mode !== workspacePaneCamera || isZoomToolActive()) {
			return;
		}

		const frame = getFrameDocumentById(getActiveFrames(), frameId);
		const handle = FRAME_RESIZE_HANDLES[handleKey];
		if (!frame || !handle) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();

		if (!isFrameSelected(frameId)) {
			activateFrameSelection(frameId);
			updateUi();
			return;
		}

		const metrics = getOutputFrameMetrics();
		const spec = getFrameScreenSpec(frame, metrics);
		const frameAnchorLocal = getFrameAnchorLocalNormalized(frame, spec, {
			boxWidth: metrics.boxWidth,
			boxHeight: metrics.boxHeight,
		});
		const useFrameAnchorPivot = event.altKey;
		const anchorLocal = useFrameAnchorPivot
			? frameAnchorLocal
			: (FRAME_RESIZE_HANDLES[getOppositeFrameResizeHandleKey(handleKey)] ??
				ANCHORS.center);
		const anchorWorld = useFrameAnchorPivot
			? getFrameAnchorWorldPoint(frame, metrics)
			: getFrameWorldPointFromLocal(spec, anchorLocal);
		const resizeAxis = getFrameResizeAxisLocal(spec, handleKey, anchorLocal);
		const startPointerLocal = inverseRotateVector(
			event.clientX - anchorWorld.x,
			event.clientY - anchorWorld.y,
			spec.rotationRadians,
		);

		clearFrameInteraction();
		frameResizeState = {
			pointerId: event.pointerId,
			frameId: frame.id,
			metrics,
			anchorWorldX: anchorWorld.x,
			anchorWorldY: anchorWorld.y,
			startCenterWorldX: spec.centerX,
			startCenterWorldY: spec.centerY,
			rotationRadians: spec.rotationRadians,
			resizeAxisX: resizeAxis?.x ?? 0,
			resizeAxisY: resizeAxis?.y ?? 0,
			startProjectionDistance: resizeAxis
				? startPointerLocal.x * resizeAxis.x +
					startPointerLocal.y * resizeAxis.y
				: 0,
			startScale: resolveFrameScale(frame.scale ?? 1),
			startRotation: frame.rotation ?? 0,
			fallbackScale: frame.scale ?? 1,
			frameAnchorLocalX: frameAnchorLocal.x,
			frameAnchorLocalY: frameAnchorLocal.y,
			useFrameAnchorPivot,
		};
		beginHistoryTransaction("frame.resize");
		setGlobalFrameCursor(getEventCursor(event, "ew-resize"));
	}

	function handleFrameResizeMove(event) {
		if (!frameResizeState || event.pointerId !== frameResizeState.pointerId) {
			return;
		}

		updateActiveShotCameraDocument((documentState) => {
			const frame = getFrameDocumentById(
				documentState.frames,
				frameResizeState.frameId,
			);
			if (!frame) {
				return documentState;
			}

			const nextScale = getUniformFrameScaleFromHandle({
				pointerWorldX: event.clientX,
				pointerWorldY: event.clientY,
				anchorWorldX: frameResizeState.anchorWorldX,
				anchorWorldY: frameResizeState.anchorWorldY,
				rotationRadians: frameResizeState.rotationRadians,
				axisX: frameResizeState.resizeAxisX,
				axisY: frameResizeState.resizeAxisY,
				startProjectionDistance: frameResizeState.startProjectionDistance,
				startScale: frameResizeState.startScale,
				fallbackScale: frameResizeState.fallbackScale,
			});
			const scaleFactor =
				nextScale / Math.max(frameResizeState.startScale, FRAME_MIN_SCALE);
			const nextCenterWorldX =
				frameResizeState.anchorWorldX +
				(frameResizeState.startCenterWorldX - frameResizeState.anchorWorldX) *
					scaleFactor;
			const nextCenterWorldY =
				frameResizeState.anchorWorldY +
				(frameResizeState.startCenterWorldY - frameResizeState.anchorWorldY) *
					scaleFactor;

			updateFrameTransformFromWorldCenter(frame, frameResizeState.metrics, {
				centerWorldX: nextCenterWorldX,
				centerWorldY: nextCenterWorldY,
				scale: nextScale,
				rotation: frameResizeState.startRotation,
			});
			if (!frameResizeState.useFrameAnchorPivot) {
				const nextSpec = getFrameScreenSpec(frame, frameResizeState.metrics);
				const nextAnchorWorld = getFrameWorldPointFromLocal(nextSpec, {
					x: frameResizeState.frameAnchorLocalX,
					y: frameResizeState.frameAnchorLocalY,
				});
				frame.anchor = resolveFrameAnchor(
					{
						x:
							(nextAnchorWorld.x - frameResizeState.metrics.boxLeft) /
							Math.max(frameResizeState.metrics.boxWidth, 1e-6),
						y:
							(nextAnchorWorld.y - frameResizeState.metrics.boxTop) /
							Math.max(frameResizeState.metrics.boxHeight, 1e-6),
					},
					{
						x: frame.x,
						y: frame.y,
					},
				);
			}
			documentState.activeFrameId = frame.id;
			return documentState;
		});
	}

	function handleFrameResizeEnd(event) {
		if (!frameResizeState || event.pointerId !== frameResizeState.pointerId) {
			return;
		}

		clearFrameResize();
		commitHistoryTransaction("frame.resize");
	}

	function startFrameRotate(frameId, zoneKey, event) {
		if (state.mode !== workspacePaneCamera || isZoomToolActive()) {
			return;
		}

		const frame = getFrameDocumentById(getActiveFrames(), frameId);
		if (!frame) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();

		if (!isFrameSelected(frameId)) {
			activateFrameSelection(frameId);
			updateUi();
			return;
		}

		const metrics = getOutputFrameMetrics();
		const spec = getFrameScreenSpec(frame, metrics);
		const anchorWorld = getFrameAnchorWorldPoint(frame, metrics);

		clearFrameInteraction();
		frameRotateState = {
			pointerId: event.pointerId,
			frameId: frame.id,
			zoneKey,
			metrics,
			anchorWorldX: anchorWorld.x,
			anchorWorldY: anchorWorld.y,
			startCenterWorldX: spec.centerX,
			startCenterWorldY: spec.centerY,
			startAngle: Math.atan2(
				event.clientY - anchorWorld.y,
				event.clientX - anchorWorld.x,
			),
			startRotation: frame.rotation ?? 0,
			startScale: resolveFrameScale(frame.scale ?? 1),
		};
		beginHistoryTransaction("frame.rotate");
		setGlobalRotateCursor(frame.rotation ?? 0, zoneKey);
	}

	function handleFrameRotateMove(event) {
		if (!frameRotateState || event.pointerId !== frameRotateState.pointerId) {
			return;
		}

		const pointerAngle = Math.atan2(
			event.clientY - frameRotateState.anchorWorldY,
			event.clientX - frameRotateState.anchorWorldX,
		);
		const nextRotation = normalizeRotationDegrees(
			frameRotateState.startRotation +
				((pointerAngle - frameRotateState.startAngle) * 180) / Math.PI,
		);
		setGlobalRotateCursor(nextRotation, frameRotateState.zoneKey);

		updateActiveShotCameraDocument((documentState) => {
			const frame = getFrameDocumentById(
				documentState.frames,
				frameRotateState.frameId,
			);
			if (!frame) {
				return documentState;
			}

			const deltaRadians =
				((nextRotation - frameRotateState.startRotation) * Math.PI) / 180;
			const rotatedOffset = rotateVector(
				frameRotateState.startCenterWorldX - frameRotateState.anchorWorldX,
				frameRotateState.startCenterWorldY - frameRotateState.anchorWorldY,
				deltaRadians,
			);

			updateFrameTransformFromWorldCenter(frame, frameRotateState.metrics, {
				centerWorldX: frameRotateState.anchorWorldX + rotatedOffset.x,
				centerWorldY: frameRotateState.anchorWorldY + rotatedOffset.y,
				scale: frameRotateState.startScale,
				rotation: nextRotation,
			});
			documentState.activeFrameId = frame.id;
			return documentState;
		});
	}

	function handleFrameRotateEnd(event) {
		if (!frameRotateState || event.pointerId !== frameRotateState.pointerId) {
			return;
		}

		clearFrameRotate();
		commitHistoryTransaction("frame.rotate");
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

		if (!isFrameSelected(frameId)) {
			activateFrameSelection(frameId);
			updateUi();
			return;
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

	function handleFrameAnchorDragMove(event) {
		if (
			!frameAnchorDragState ||
			event.pointerId !== frameAnchorDragState.pointerId
		) {
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

		clearFrameAnchorDrag();
		commitHistoryTransaction("frame.anchor");
	}

	return {
		getActiveFrames,
		getActiveFrameDocument,
		resolveFrameAxis,
		resolveFrameAnchor,
		getFrameAnchorDocument,
		isFrameSelectionActive,
		clearFrameDrag,
		clearFrameInteraction,
		clearFrameSelection,
		selectFrame,
		createFrame,
		duplicateActiveFrame,
		deleteActiveFrame,
		startFrameDrag,
		handleFrameDragMove,
		handleFrameDragEnd,
		startFrameResize,
		handleFrameResizeMove,
		handleFrameResizeEnd,
		startFrameRotate,
		handleFrameRotateMove,
		handleFrameRotateEnd,
		startFrameAnchorDrag,
		handleFrameAnchorDragMove,
		handleFrameAnchorDragEnd,
	};
}
