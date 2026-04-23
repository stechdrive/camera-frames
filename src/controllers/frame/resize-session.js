import { ANCHORS } from "../../constants.js";
import {
	FRAME_MIN_SCALE,
	FRAME_RESIZE_HANDLES,
	getClampedFrameSelectionScaleRatio,
	getFrameAnchorLocalNormalized,
	getFrameAnchorWorldPoint,
	getFrameResizeAxisLocal,
	getFrameWorldPointFromLocal,
	getOppositeFrameResizeHandleKey,
	getPointFromRectLocal,
	getUniformFrameScaleFromHandle,
	inverseRotateVector,
	normalizeRotationDegrees,
} from "../../engine/frame-transform.js";
import { getFrameDocumentById } from "../../workspace-model.js";
import {
	clearGlobalFrameCursor,
	getEventCursor,
	setGlobalFrameCursor,
} from "./cursor-utils.js";
import {
	getFrameScreenSpec,
	resolveFrameAnchor,
	resolveFrameAxis,
	resolveFrameScale,
	updateFrameTransformFromWorldCenter,
} from "./geometry.js";
import { transformStoredFrameTrajectoryNodes } from "./trajectory.js";

export function createCameraFrameResizeSession({
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
	let frameResizeState = null;

	function clearFrameResize() {
		frameResizeState = null;
		clearGlobalFrameCursor();
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
			return startSelectedFramesResize(handleKey, event);
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

	function startSelectedFramesResize(handleKey, event) {
		if (state.mode !== workspacePaneCamera || isZoomToolActive()) {
			return false;
		}
		if (event.button !== 0) {
			return false;
		}
		const handle = FRAME_RESIZE_HANDLES[handleKey];
		const selectionState = buildFrameSelectionTransformState();
		if (!handle || !selectionState?.selectionBoxScreen) {
			return false;
		}

		event.preventDefault();
		event.stopPropagation();

		const rotationRadians =
			(selectionState.selectionBoxScreen.rotationDeg * Math.PI) / 180;
		const useSelectionAnchorPivot = event.altKey;
		const anchorLocal = useSelectionAnchorPivot
			? selectionState.anchorLocal
			: (FRAME_RESIZE_HANDLES[getOppositeFrameResizeHandleKey(handleKey)] ?? {
					x: 0.5,
					y: 0.5,
				});
		const anchorScreenLocal = getPointFromRectLocal({
			left: selectionState.selectionBoxScreen.left,
			top: selectionState.selectionBoxScreen.top,
			width: selectionState.selectionBoxScreen.width,
			height: selectionState.selectionBoxScreen.height,
			localX: anchorLocal.x,
			localY: anchorLocal.y,
			anchorAx: selectionState.selectionBoxScreen.anchorX,
			anchorAy: selectionState.selectionBoxScreen.anchorY,
			rotationDeg: selectionState.selectionBoxScreen.rotationDeg,
		});
		const anchorWorld = {
			x: selectionState.renderBoxContentLeft + anchorScreenLocal.x,
			y: selectionState.renderBoxContentTop + anchorScreenLocal.y,
		};
		const anchorLogical = getPointFromRectLocal({
			left: selectionState.selectionBoxLogical.left,
			top: selectionState.selectionBoxLogical.top,
			width: selectionState.selectionBoxLogical.width,
			height: selectionState.selectionBoxLogical.height,
			localX: anchorLocal.x,
			localY: anchorLocal.y,
			anchorAx: selectionState.selectionBoxLogical.anchorX,
			anchorAy: selectionState.selectionBoxLogical.anchorY,
			rotationDeg: selectionState.selectionBoxLogical.rotationDeg,
		});
		const resizeAxis = getFrameResizeAxisLocal(
			{
				width: selectionState.selectionBoxScreen.width,
				height: selectionState.selectionBoxScreen.height,
			},
			handleKey,
			anchorLocal,
		);
		if (!resizeAxis) {
			return false;
		}
		const startPointerLocal = inverseRotateVector(
			event.clientX - anchorWorld.x,
			event.clientY - anchorWorld.y,
			rotationRadians,
		);

		clearFrameInteraction();
		frameResizeState = {
			type: "multi",
			pointerId: event.pointerId,
			handleKey,
			selectionState,
			rotationRadians,
			anchorLocal,
			anchorWorld,
			anchorLogical,
			resizeAxisX: resizeAxis.x,
			resizeAxisY: resizeAxis.y,
			startProjectionDistance:
				startPointerLocal.x * resizeAxis.x + startPointerLocal.y * resizeAxis.y,
		};
		beginHistoryTransaction("frame.resize");
		setGlobalFrameCursor(getEventCursor(event, "ew-resize"));
		return true;
	}

	function handleFrameResizeMove(event) {
		if (!frameResizeState || event.pointerId !== frameResizeState.pointerId) {
			return;
		}

		if (frameResizeState.type === "multi") {
			const { selectionState } = frameResizeState;
			const currentPointerLocal = inverseRotateVector(
				event.clientX - frameResizeState.anchorWorld.x,
				event.clientY - frameResizeState.anchorWorld.y,
				frameResizeState.rotationRadians,
			);
			const currentProjection =
				currentPointerLocal.x * frameResizeState.resizeAxisX +
				currentPointerLocal.y * frameResizeState.resizeAxisY;
			const rawScaleRatio =
				currentProjection /
				Math.max(frameResizeState.startProjectionDistance, 1e-6);
			const scaleRatio = getClampedFrameSelectionScaleRatio(
				rawScaleRatio,
				selectionState.geometries.map((geometry) => geometry.scale),
			);
			const pivot = frameResizeState.anchorLogical;
			const nextWidth = Math.max(
				selectionState.selectionBoxLogical.width * scaleRatio,
				1e-6,
			);
			const nextHeight = Math.max(
				selectionState.selectionBoxLogical.height * scaleRatio,
				1e-6,
			);
			const nextSelectionPivot = {
				x: pivot.x + (selectionState.pivot.x - pivot.x) * scaleRatio,
				y: pivot.y + (selectionState.pivot.y - pivot.y) * scaleRatio,
			};
			setStoredFrameSelectionBox(
				{
					...selectionState.selectionBoxLogical,
					left: nextSelectionPivot.x - nextWidth * selectionState.anchorLocal.x,
					top: nextSelectionPivot.y - nextHeight * selectionState.anchorLocal.y,
					width: nextWidth,
					height: nextHeight,
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
					const nextCenterPoint = {
						x: pivot.x + (geometry.centerPoint.x - pivot.x) * scaleRatio,
						y: pivot.y + (geometry.centerPoint.y - pivot.y) * scaleRatio,
					};
					const nextAnchorPoint = {
						x: pivot.x + (geometry.anchorPoint.x - pivot.x) * scaleRatio,
						y: pivot.y + (geometry.anchorPoint.y - pivot.y) * scaleRatio,
					};
					frame.x = resolveFrameAxis(
						nextCenterPoint.x /
							Math.max(selectionState.metrics.exportWidth, 1e-6),
					);
					frame.y = resolveFrameAxis(
						nextCenterPoint.y /
							Math.max(selectionState.metrics.exportHeight, 1e-6),
					);
					frame.scale = resolveFrameScale(geometry.scale * scaleRatio);
					frame.rotation = normalizeRotationDegrees(geometry.rotationDeg);
					frame.anchor = resolveFrameAnchor(
						{
							x:
								nextAnchorPoint.x /
								Math.max(selectionState.metrics.exportWidth, 1e-6),
							y:
								nextAnchorPoint.y /
								Math.max(selectionState.metrics.exportHeight, 1e-6),
						},
						{
							x: frame.x,
							y: frame.y,
						},
					);
				}
				transformStoredFrameTrajectoryNodes(
					documentState,
					selectionState.geometries.map((geometry) => geometry.frame.id),
					new Map(
						selectionState.geometries.map((geometry) => [
							geometry.frame.id,
							{
								x:
									geometry.centerPoint.x /
									Math.max(selectionState.metrics.exportWidth, 1e-6),
								y:
									geometry.centerPoint.y /
									Math.max(selectionState.metrics.exportHeight, 1e-6),
							},
						]),
					),
					(point) => {
						const pointPx = {
							x: point.x * Math.max(selectionState.metrics.exportWidth, 1e-6),
							y: point.y * Math.max(selectionState.metrics.exportHeight, 1e-6),
						};
						return {
							x:
								(pivot.x + (pointPx.x - pivot.x) * scaleRatio) /
								Math.max(selectionState.metrics.exportWidth, 1e-6),
							y:
								(pivot.y + (pointPx.y - pivot.y) * scaleRatio) /
								Math.max(selectionState.metrics.exportHeight, 1e-6),
						};
					},
				);
				return documentState;
			});
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

	return {
		clearFrameResize,
		startFrameResize,
		startSelectedFramesResize,
		handleFrameResizeMove,
		handleFrameResizeEnd,
	};
}
