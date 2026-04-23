import {
	getFrameAnchorWorldPoint,
	normalizeRotationDegrees,
	rotateVector,
	snapRotationDeltaDegrees,
} from "../../engine/frame-transform.js";
import { getFrameDocumentById } from "../../workspace-model.js";
import {
	clearGlobalFrameCursor,
	setGlobalRotateCursor,
} from "./cursor-utils.js";
import {
	getFrameScreenSpec,
	normalizeAngleDeltaDegrees,
	resolveFrameAnchor,
	resolveFrameAxis,
	resolveFrameScale,
	updateFrameTransformFromWorldCenter,
} from "./geometry.js";
import { transformStoredFrameTrajectoryNodes } from "./trajectory.js";

export function createCameraFrameRotateSession({
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
	let frameRotateState = null;

	function clearFrameRotate() {
		frameRotateState = null;
		clearGlobalFrameCursor();
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
			return startSelectedFramesRotate(zoneKey, event);
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

	function startSelectedFramesRotate(zoneKey, event) {
		if (state.mode !== workspacePaneCamera || isZoomToolActive()) {
			return false;
		}
		if (event.button !== 0) {
			return false;
		}
		const selectionState = buildFrameSelectionTransformState();
		if (!selectionState?.screenPivot) {
			return false;
		}

		event.preventDefault();
		event.stopPropagation();
		clearFrameInteraction();
		frameRotateState = {
			type: "multi",
			pointerId: event.pointerId,
			zoneKey,
			selectionState,
			startPointerAngleDeg:
				(Math.atan2(
					event.clientY - selectionState.screenPivot.y,
					event.clientX - selectionState.screenPivot.x,
				) *
					180) /
				Math.PI,
		};
		beginHistoryTransaction("frame.rotate");
		setGlobalRotateCursor(
			selectionState.selectionBoxLogical.rotationDeg ?? 0,
			zoneKey,
		);
		return true;
	}

	function handleFrameRotateMove(event) {
		if (!frameRotateState || event.pointerId !== frameRotateState.pointerId) {
			return;
		}

		if (frameRotateState.type === "multi") {
			const { selectionState } = frameRotateState;
			const nextPointerAngleDeg =
				(Math.atan2(
					event.clientY - selectionState.screenPivot.y,
					event.clientX - selectionState.screenPivot.x,
				) *
					180) /
				Math.PI;
			const rawDeltaAngleDeg = normalizeAngleDeltaDegrees(
				nextPointerAngleDeg - frameRotateState.startPointerAngleDeg,
			);
			const deltaAngleDeg = event.shiftKey
				? snapRotationDeltaDegrees(rawDeltaAngleDeg)
				: rawDeltaAngleDeg;
			const deltaAngleRad = (deltaAngleDeg * Math.PI) / 180;
			const nextRotation = normalizeRotationDegrees(
				(selectionState.selectionBoxLogical.rotationDeg ?? 0) + deltaAngleDeg,
			);
			setGlobalRotateCursor(nextRotation, frameRotateState.zoneKey);
			setStoredFrameSelectionBox(
				{
					...selectionState.selectionBoxLogical,
					rotationDeg: nextRotation,
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
					const centerOffset = rotateVector(
						geometry.centerPoint.x - selectionState.pivot.x,
						geometry.centerPoint.y - selectionState.pivot.y,
						deltaAngleRad,
					);
					const anchorOffset = rotateVector(
						geometry.anchorPoint.x - selectionState.pivot.x,
						geometry.anchorPoint.y - selectionState.pivot.y,
						deltaAngleRad,
					);
					frame.x = resolveFrameAxis(
						(selectionState.pivot.x + centerOffset.x) /
							Math.max(selectionState.metrics.exportWidth, 1e-6),
					);
					frame.y = resolveFrameAxis(
						(selectionState.pivot.y + centerOffset.y) /
							Math.max(selectionState.metrics.exportHeight, 1e-6),
					);
					frame.scale = resolveFrameScale(geometry.scale);
					frame.rotation = normalizeRotationDegrees(
						geometry.rotationDeg + deltaAngleDeg,
					);
					frame.anchor = resolveFrameAnchor(
						{
							x:
								(selectionState.pivot.x + anchorOffset.x) /
								Math.max(selectionState.metrics.exportWidth, 1e-6),
							y:
								(selectionState.pivot.y + anchorOffset.y) /
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
						const rotatedPoint = rotateVector(
							pointPx.x - selectionState.pivot.x,
							pointPx.y - selectionState.pivot.y,
							deltaAngleRad,
						);
						return {
							x:
								(selectionState.pivot.x + rotatedPoint.x) /
								Math.max(selectionState.metrics.exportWidth, 1e-6),
							y:
								(selectionState.pivot.y + rotatedPoint.y) /
								Math.max(selectionState.metrics.exportHeight, 1e-6),
						};
					},
				);
				return documentState;
			});
			return;
		}

		const pointerAngle = Math.atan2(
			event.clientY - frameRotateState.anchorWorldY,
			event.clientX - frameRotateState.anchorWorldX,
		);
		const rawDeltaAngleDeg =
			((pointerAngle - frameRotateState.startAngle) * 180) / Math.PI;
		const deltaAngleDeg = event.shiftKey
			? snapRotationDeltaDegrees(rawDeltaAngleDeg)
			: rawDeltaAngleDeg;
		const nextRotation = normalizeRotationDegrees(
			frameRotateState.startRotation + deltaAngleDeg,
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

	return {
		clearFrameRotate,
		startFrameRotate,
		startSelectedFramesRotate,
		handleFrameRotateMove,
		handleFrameRotateEnd,
	};
}
