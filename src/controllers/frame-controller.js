import { ANCHORS, BASE_FRAME, FRAME_MAX_COUNT } from "../constants.js";
import { getFrameOutlineSpec } from "../engine/frame-overlay.js";
import {
	FRAME_MASK_SHAPE_TRAJECTORY,
	FRAME_TRAJECTORY_NODE_MODE_AUTO,
	FRAME_TRAJECTORY_NODE_MODE_CORNER,
	FRAME_TRAJECTORY_NODE_MODE_FREE,
	FRAME_TRAJECTORY_NODE_MODE_MIRRORED,
	cloneFrameTrajectoryNodesByFrameId,
	getFrameTrajectoryHandleVectorNormalized,
	getFrameTrajectoryNodeMode,
	normalizeFrameMaskShape,
	normalizeFrameTrajectoryExportSource,
	normalizeFrameTrajectoryMode,
	normalizeFrameTrajectoryNodeMode,
} from "../engine/frame-trajectory.js";
import {
	FRAME_MAX_SCALE,
	FRAME_MIN_SCALE,
	FRAME_RESIZE_HANDLES,
	getClampedFrameSelectionScaleRatio,
	getFrameAnchorLocalNormalized,
	getFrameAnchorWorldPoint,
	getFrameDocumentCenterFromWorld,
	getFrameResizeAxisLocal,
	getFrameWorldPointFromLocal,
	getOppositeFrameResizeHandleKey,
	getPointFromRectLocal,
	getPointsBounds,
	getRectCornersFromAnchor,
	getUniformFrameScaleFromHandle,
	inverseRotateVector,
	normalizeRotationDegrees,
	rotateVector,
	snapRotationDeltaDegrees,
} from "../engine/frame-transform.js";
import { getFrameRotateCursorCss } from "../engine/rotate-cursor.js";
import {
	createFrameDocument,
	getFrameDisplayLabel,
	getFrameDocumentById,
	getFrameDocumentId,
	getNextFrameNumber,
	getActiveFrameDocument as resolveActiveFrameDocument,
	resolveFrameMaskPreferredMode,
	resolveFrameMaskSelectedIds,
	resolveFrameMaskToggleMode,
	sanitizeFrameName,
} from "../workspace-model.js";

const FRAME_DRAG_START_THRESHOLD_PX = 4;

function normalizeAngleDeltaDegrees(value) {
	let rotation = Number(value) || 0;
	while (rotation <= -180) {
		rotation += 360;
	}
	while (rotation > 180) {
		rotation -= 360;
	}
	return rotation;
}

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
	let frameTrajectoryHandleDragState = null;

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

	function clearStoredFrameSelectionTransformState() {
		store.frames.selectionAnchor.value = null;
		store.frames.selectionBoxLogical.value = null;
	}

	function setStoredFrameSelectionBox(
		selectionBoxLogical,
		selectionAnchor = null,
	) {
		store.frames.selectionBoxLogical.value = selectionBoxLogical
			? { ...selectionBoxLogical }
			: null;
		store.frames.selectionAnchor.value =
			selectionAnchor &&
			Number.isFinite(selectionAnchor.x) &&
			Number.isFinite(selectionAnchor.y)
				? {
						x: selectionAnchor.x,
						y: selectionAnchor.y,
					}
				: null;
	}

	function getSelectedFrames() {
		const selectedFrameIdSet = new Set(getSelectedFrameIds());
		return getActiveFrames().filter((frame) =>
			selectedFrameIdSet.has(frame.id),
		);
	}

	function buildFrameGeometry(frame, metrics) {
		const scale = resolveFrameScale(frame.scale ?? 1);
		const rotationDeg = normalizeRotationDegrees(frame.rotation ?? 0);
		const rotationRadians = (rotationDeg * Math.PI) / 180;
		const width = BASE_FRAME.width * scale;
		const height = BASE_FRAME.height * scale;
		const anchorPointNormalized = getFrameAnchorDocument(frame);
		const anchorPoint = {
			x: anchorPointNormalized.x * metrics.exportWidth,
			y: anchorPointNormalized.y * metrics.exportHeight,
		};
		const anchorLocal = getFrameAnchorLocalNormalized(
			frame,
			{
				width: BASE_FRAME.width * scale,
				height: BASE_FRAME.height * scale,
				rotationRadians,
			},
			{
				boxWidth: metrics.exportWidth,
				boxHeight: metrics.exportHeight,
			},
		);
		const left = anchorPoint.x - width * anchorLocal.x;
		const top = anchorPoint.y - height * anchorLocal.y;
		const corners = getRectCornersFromAnchor({
			left,
			top,
			width,
			height,
			anchorAx: anchorLocal.x,
			anchorAy: anchorLocal.y,
			rotationDeg,
		});
		return {
			frame,
			scale,
			rotationDeg,
			width,
			height,
			left,
			top,
			centerPoint: {
				x: resolveFrameAxis(frame.x) * metrics.exportWidth,
				y: resolveFrameAxis(frame.y) * metrics.exportHeight,
			},
			anchorPoint,
			anchorLocal,
			corners,
			bounds: getPointsBounds(corners),
		};
	}

	function buildSelectionBoxLogicalFromGeometries(geometries) {
		const bounds = getPointsBounds(
			geometries.flatMap((geometry) => geometry.corners ?? []),
		);
		if (!bounds) {
			return null;
		}
		return {
			left: bounds.left,
			top: bounds.top,
			width: bounds.width,
			height: bounds.height,
			rotationDeg: 0,
			anchorX: 0.5,
			anchorY: 0.5,
		};
	}

	function projectSelectionBoxLogicalToScreen(
		selectionBoxLogical,
		metrics,
		anchor,
	) {
		if (!selectionBoxLogical || !metrics) {
			return null;
		}
		return {
			left:
				(selectionBoxLogical.left / Math.max(metrics.exportWidth, 1e-6)) *
				metrics.boxWidth,
			top:
				(selectionBoxLogical.top / Math.max(metrics.exportHeight, 1e-6)) *
				metrics.boxHeight,
			width:
				(selectionBoxLogical.width / Math.max(metrics.exportWidth, 1e-6)) *
				metrics.boxWidth,
			height:
				(selectionBoxLogical.height / Math.max(metrics.exportHeight, 1e-6)) *
				metrics.boxHeight,
			rotationDeg: selectionBoxLogical.rotationDeg ?? 0,
			anchorX: anchor?.x ?? selectionBoxLogical.anchorX ?? 0.5,
			anchorY: anchor?.y ?? selectionBoxLogical.anchorY ?? 0.5,
		};
	}

	function buildFrameSelectionTransformState() {
		const selectedFrames = getSelectedFrames();
		if (selectedFrames.length <= 1) {
			return null;
		}

		const metrics = getOutputFrameMetrics();
		const geometries = selectedFrames
			.map((frame) => buildFrameGeometry(frame, metrics))
			.filter(Boolean);
		if (geometries.length <= 1) {
			return null;
		}

		const storedSelectionBox =
			store.frames.selectionBoxLogical.value ??
			buildSelectionBoxLogicalFromGeometries(geometries);
		if (!storedSelectionBox) {
			return null;
		}

		const selectionAnchor =
			store.frames.selectionAnchor.value &&
			Number.isFinite(store.frames.selectionAnchor.value.x) &&
			Number.isFinite(store.frames.selectionAnchor.value.y)
				? {
						x: store.frames.selectionAnchor.value.x,
						y: store.frames.selectionAnchor.value.y,
					}
				: {
						x: storedSelectionBox.anchorX ?? 0.5,
						y: storedSelectionBox.anchorY ?? 0.5,
					};

		const selectionBoxLogical = {
			left: storedSelectionBox.left,
			top: storedSelectionBox.top,
			width: storedSelectionBox.width,
			height: storedSelectionBox.height,
			rotationDeg: storedSelectionBox.rotationDeg ?? 0,
			anchorX: selectionAnchor.x,
			anchorY: selectionAnchor.y,
		};
		const selectionBoxScreen = projectSelectionBoxLogicalToScreen(
			selectionBoxLogical,
			metrics,
			selectionAnchor,
		);
		if (!selectionBoxScreen) {
			return null;
		}

		const pivot = getPointFromRectLocal({
			left: selectionBoxLogical.left,
			top: selectionBoxLogical.top,
			width: selectionBoxLogical.width,
			height: selectionBoxLogical.height,
			localX: selectionAnchor.x,
			localY: selectionAnchor.y,
			anchorAx: selectionBoxLogical.anchorX,
			anchorAy: selectionBoxLogical.anchorY,
			rotationDeg: selectionBoxLogical.rotationDeg,
		});
		const renderBounds = renderBox.getBoundingClientRect();
		const renderBoxContentLeft = renderBounds.left + renderBox.clientLeft;
		const renderBoxContentTop = renderBounds.top + renderBox.clientTop;
		const screenPivotLocal = getPointFromRectLocal({
			left: selectionBoxScreen.left,
			top: selectionBoxScreen.top,
			width: selectionBoxScreen.width,
			height: selectionBoxScreen.height,
			localX: selectionAnchor.x,
			localY: selectionAnchor.y,
			anchorAx: selectionBoxScreen.anchorX,
			anchorAy: selectionBoxScreen.anchorY,
			rotationDeg: selectionBoxScreen.rotationDeg,
		});

		return {
			metrics,
			selectedFrameIds: geometries.map((geometry) => geometry.frame.id),
			geometries,
			anchorLocal: selectionAnchor,
			selectionBoxLogical,
			selectionBoxScreen,
			pivot,
			screenPivot: {
				x: renderBoxContentLeft + screenPivotLocal.x,
				y: renderBoxContentTop + screenPivotLocal.y,
			},
			renderBoxContentLeft,
			renderBoxContentTop,
		};
	}

	function syncFrameSelectionTransformState() {
		if (!isFrameSelectionActive()) {
			clearStoredFrameSelectionTransformState();
			return;
		}

		const selectedFrames = getSelectedFrames();
		if (selectedFrames.length <= 1) {
			clearStoredFrameSelectionTransformState();
			return;
		}

		const metrics = getOutputFrameMetrics();
		const geometries = selectedFrames
			.map((frame) => buildFrameGeometry(frame, metrics))
			.filter(Boolean);
		const selectionBoxLogical =
			buildSelectionBoxLogicalFromGeometries(geometries);
		setStoredFrameSelectionBox(selectionBoxLogical, null);
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

	function getSelectedFrameIds() {
		return Array.isArray(store.frames.selectedIds.value)
			? store.frames.selectedIds.value
			: [];
	}

	function setSelectedFrameIds(frameIds) {
		store.frames.selectedIds.value = Array.from(
			new Set(
				(frameIds ?? []).filter(
					(frameId) => typeof frameId === "string" && frameId.length > 0,
				),
			),
		);
	}

	function isFrameSelected(frameId) {
		return (
			isFrameSelectionActive() &&
			getSelectedFrameIds().includes(String(frameId))
		);
	}

	function setFrameMaskSelectedIds(frameIds) {
		const nextSelectedIds = Array.from(
			new Set(
				(frameIds ?? []).filter((frameId) =>
					getActiveFrames().some((frame) => frame.id === frameId),
				),
			),
		);
		updateActiveShotCameraDocument((documentState) => {
			documentState.frameMask = {
				...documentState.frameMask,
				selectedIds: nextSelectedIds,
			};
			return documentState;
		});
	}

	function getFrameMaskMode() {
		return getActiveShotCameraDocument()?.frameMask?.mode ?? "off";
	}

	function getFrameMaskPreferredMode() {
		return resolveFrameMaskPreferredMode(
			getActiveShotCameraDocument()?.frameMask?.mode,
			getActiveShotCameraDocument()?.frameMask?.preferredMode,
		);
	}

	function setFrameMaskMode(nextValue) {
		const mode =
			nextValue === "selected" || nextValue === "all" ? nextValue : "off";
		runHistoryAction?.("frame.mask-mode", () => {
			updateActiveShotCameraDocument((documentState) => {
				documentState.frameMask = {
					...documentState.frameMask,
					mode,
					preferredMode:
						mode === "selected" || mode === "all"
							? mode
							: (documentState.frameMask?.preferredMode ?? "all"),
				};
				return documentState;
			});
		});
		updateUi();
	}

	function toggleFrameMaskMode(targetMode) {
		const mode =
			targetMode === "selected" || targetMode === "all" ? targetMode : "off";
		setFrameMaskMode(getFrameMaskMode() === mode ? "off" : mode);
	}

	function togglePreferredFrameMaskMode() {
		setFrameMaskMode(
			resolveFrameMaskToggleMode({
				mode: getFrameMaskMode(),
				preferredMode: getFrameMaskPreferredMode(),
				hasRememberedSelection: getRememberedFrameMaskSelectedIds().length > 0,
			}),
		);
	}

	function getRememberedFrameMaskSelectedIds() {
		return resolveFrameMaskSelectedIds(
			getActiveFrames(),
			getActiveShotCameraDocument()?.frameMask?.selectedIds ?? [],
		);
	}

	function setFrameMaskOpacity(nextValue) {
		const opacityPct = Math.min(
			100,
			Math.max(0, Math.round(Number(nextValue) || 0)),
		);
		runHistoryAction?.("frame.mask-opacity", () => {
			updateActiveShotCameraDocument((documentState) => {
				documentState.frameMask = {
					...documentState.frameMask,
					opacityPct,
				};
				return documentState;
			});
		});
		updateUi();
	}

	function getFrameMaskShape() {
		return normalizeFrameMaskShape(
			getActiveShotCameraDocument()?.frameMask?.shape,
		);
	}

	function setFrameMaskShape(nextValue) {
		const shape = normalizeFrameMaskShape(nextValue);
		runHistoryAction?.("frame.mask-shape", () => {
			updateActiveShotCameraDocument((documentState) => {
				documentState.frameMask = {
					...documentState.frameMask,
					shape,
				};
				return documentState;
			});
		});
		updateUi();
	}

	function getFrameTrajectoryMode() {
		return normalizeFrameTrajectoryMode(
			getActiveShotCameraDocument()?.frameMask?.trajectoryMode,
		);
	}

	function setFrameTrajectoryMode(nextValue) {
		const trajectoryMode = normalizeFrameTrajectoryMode(nextValue);
		runHistoryAction?.("frame.trajectory-mode", () => {
			updateActiveShotCameraDocument((documentState) => {
				documentState.frameMask = {
					...documentState.frameMask,
					trajectoryMode,
					shape: documentState.frameMask?.shape ?? FRAME_MASK_SHAPE_TRAJECTORY,
				};
				return documentState;
			});
		});
		updateUi();
	}

	function getFrameTrajectoryExportSource() {
		return normalizeFrameTrajectoryExportSource(
			getActiveShotCameraDocument()?.frameMask?.trajectoryExportSource,
		);
	}

	function setFrameTrajectoryExportSource(nextValue) {
		const trajectoryExportSource =
			normalizeFrameTrajectoryExportSource(nextValue);
		runHistoryAction?.("frame.trajectory-export-source", () => {
			updateActiveShotCameraDocument((documentState) => {
				documentState.frameMask = {
					...documentState.frameMask,
					trajectoryExportSource,
				};
				return documentState;
			});
		});
		updateUi();
	}

	function setFrameTrajectoryEditMode(nextValue) {
		store.frames.trajectoryEditMode.value = Boolean(nextValue);
		updateUi();
	}

	function toggleFrameTrajectoryEditMode() {
		setFrameTrajectoryEditMode(!store.frames.trajectoryEditMode.value);
	}

	function getTrajectoryLogicalSize(metrics = getOutputFrameMetrics()) {
		return {
			logicalWidth: Math.max(metrics?.exportWidth ?? 1, 1e-6),
			logicalHeight: Math.max(metrics?.exportHeight ?? 1, 1e-6),
		};
	}

	function invertTrajectoryVector(vector) {
		return vector && Number.isFinite(vector.x) && Number.isFinite(vector.y)
			? {
					x: -vector.x,
					y: -vector.y,
				}
			: null;
	}

	function getTrajectoryNodesByFrameId(documentState) {
		return cloneFrameTrajectoryNodesByFrameId(
			documentState?.frameMask?.trajectory?.nodesByFrameId,
		);
	}

	function updateTrajectoryNodesByFrameId(documentState, nodesByFrameId) {
		documentState.frameMask = {
			...documentState.frameMask,
			trajectory: {
				...(documentState.frameMask?.trajectory ?? {}),
				nodesByFrameId,
			},
		};
	}

	function getFrameTrajectoryHandleVector(
		documentState,
		frameId,
		handleKey,
		nodesByFrameId = null,
	) {
		const { logicalWidth, logicalHeight } = getTrajectoryLogicalSize();
		const frameMaskState =
			nodesByFrameId === null
				? documentState.frameMask
				: {
						...documentState.frameMask,
						trajectory: {
							...(documentState.frameMask?.trajectory ?? {}),
							nodesByFrameId,
						},
					};
		return (
			getFrameTrajectoryHandleVectorNormalized(
				documentState.frames,
				frameMaskState,
				frameId,
				handleKey,
				logicalWidth,
				logicalHeight,
			) ?? { x: 0, y: 0 }
		);
	}

	function setFrameTrajectoryNodeMode(frameId, nextValue) {
		const frame = getFrameDocumentById(getActiveFrames(), frameId);
		if (!frame) {
			return;
		}
		const nodeMode = normalizeFrameTrajectoryNodeMode(nextValue);
		runHistoryAction?.("frame.trajectory-node-mode", () => {
			updateActiveShotCameraDocument((documentState) => {
				const nodesByFrameId = getTrajectoryNodesByFrameId(documentState);
				if (nodeMode === FRAME_TRAJECTORY_NODE_MODE_AUTO) {
					delete nodesByFrameId[frameId];
				} else if (nodeMode === FRAME_TRAJECTORY_NODE_MODE_CORNER) {
					nodesByFrameId[frameId] = {
						mode: FRAME_TRAJECTORY_NODE_MODE_CORNER,
					};
				} else {
					const effectiveIn = getFrameTrajectoryHandleVector(
						documentState,
						frameId,
						"in",
						nodesByFrameId,
					);
					const effectiveOut = getFrameTrajectoryHandleVector(
						documentState,
						frameId,
						"out",
						nodesByFrameId,
					);
					if (nodeMode === FRAME_TRAJECTORY_NODE_MODE_MIRRORED) {
						const baseVector = (nodesByFrameId[frameId]?.out &&
						Number.isFinite(nodesByFrameId[frameId].out.x) &&
						Number.isFinite(nodesByFrameId[frameId].out.y)
							? { ...nodesByFrameId[frameId].out }
							: effectiveOut && (effectiveOut.x !== 0 || effectiveOut.y !== 0)
								? effectiveOut
								: invertTrajectoryVector(effectiveIn)) ?? {
							x: 0,
							y: 0,
						};
						nodesByFrameId[frameId] = {
							mode: FRAME_TRAJECTORY_NODE_MODE_MIRRORED,
							in: invertTrajectoryVector(baseVector),
							out: baseVector,
						};
					} else {
						nodesByFrameId[frameId] = {
							mode: FRAME_TRAJECTORY_NODE_MODE_FREE,
							in: effectiveIn,
							out: effectiveOut,
						};
					}
				}
				updateTrajectoryNodesByFrameId(documentState, nodesByFrameId);
				documentState.activeFrameId = frameId;
				return documentState;
			});
		});
		updateUi();
	}

	function setFrameTrajectoryHandlePoint(frameId, handleKey, nextPoint) {
		if (handleKey !== "in" && handleKey !== "out") {
			return;
		}
		const frame = getFrameDocumentById(getActiveFrames(), frameId);
		if (!frame) {
			return;
		}

		const nextHandlePoint =
			nextPoint && Number.isFinite(nextPoint.x) && Number.isFinite(nextPoint.y)
				? {
						x: nextPoint.x,
						y: nextPoint.y,
					}
				: null;
		updateActiveShotCameraDocument((documentState) => {
			const documentFrame = getFrameDocumentById(documentState.frames, frameId);
			if (!documentFrame) {
				return documentState;
			}
			const nodesByFrameId = getTrajectoryNodesByFrameId(documentState);
			if (!nextHandlePoint) {
				delete nodesByFrameId[frameId];
				updateTrajectoryNodesByFrameId(documentState, nodesByFrameId);
				documentState.activeFrameId = frameId;
				return documentState;
			}

			const currentNodeMode = getFrameTrajectoryNodeMode(
				{
					trajectory: {
						nodesByFrameId,
					},
				},
				frameId,
			);
			const resolvedNodeMode =
				currentNodeMode === FRAME_TRAJECTORY_NODE_MODE_FREE
					? FRAME_TRAJECTORY_NODE_MODE_FREE
					: FRAME_TRAJECTORY_NODE_MODE_MIRRORED;
			const nextVector = {
				x: nextHandlePoint.x - documentFrame.x,
				y: nextHandlePoint.y - documentFrame.y,
			};
			if (resolvedNodeMode === FRAME_TRAJECTORY_NODE_MODE_MIRRORED) {
				nodesByFrameId[frameId] = {
					mode: FRAME_TRAJECTORY_NODE_MODE_MIRRORED,
					...(handleKey === "in"
						? {
								in: nextVector,
								out: invertTrajectoryVector(nextVector),
							}
						: {
								in: invertTrajectoryVector(nextVector),
								out: nextVector,
							}),
				};
			} else {
				const effectiveIn = getFrameTrajectoryHandleVector(
					documentState,
					frameId,
					"in",
					nodesByFrameId,
				);
				const effectiveOut = getFrameTrajectoryHandleVector(
					documentState,
					frameId,
					"out",
					nodesByFrameId,
				);
				nodesByFrameId[frameId] = {
					mode: FRAME_TRAJECTORY_NODE_MODE_FREE,
					in: handleKey === "in" ? nextVector : effectiveIn,
					out: handleKey === "out" ? nextVector : effectiveOut,
				};
			}
			updateTrajectoryNodesByFrameId(documentState, nodesByFrameId);
			documentState.activeFrameId = frameId;
			return documentState;
		});
	}

	function clearFrameTrajectoryHandlePoint(frameId, handleKey) {
		if (handleKey !== "in" && handleKey !== "out") {
			return;
		}
		setFrameTrajectoryNodeMode(frameId, FRAME_TRAJECTORY_NODE_MODE_AUTO);
	}

	function transformStoredFrameTrajectoryNodes(
		documentState,
		frameIds,
		previousCentersByFrameId,
		transformPoint,
	) {
		if (typeof transformPoint !== "function") {
			return;
		}
		const frameIdSet = new Set(frameIds ?? []);
		if (frameIdSet.size === 0) {
			return;
		}
		const nodesByFrameId = getTrajectoryNodesByFrameId(documentState);
		let changed = false;
		for (const frameId of frameIdSet) {
			const frameNode = nodesByFrameId[frameId];
			if (!frameNode) {
				continue;
			}
			const previousCenter = previousCentersByFrameId?.get?.(frameId) ?? null;
			const nextFrame = getFrameDocumentById(documentState.frames, frameId);
			if (!previousCenter || !nextFrame) {
				continue;
			}
			const nextCenter = {
				x: nextFrame.x,
				y: nextFrame.y,
			};
			for (const handleKey of ["in", "out"]) {
				const vector = frameNode[handleKey];
				if (
					!vector ||
					!Number.isFinite(vector.x) ||
					!Number.isFinite(vector.y)
				) {
					continue;
				}
				const nextPoint = transformPoint(
					{
						x: previousCenter.x + vector.x,
						y: previousCenter.y + vector.y,
					},
					frameId,
					handleKey,
				);
				if (!nextPoint) {
					continue;
				}
				frameNode[handleKey] = {
					x: nextPoint.x - nextCenter.x,
					y: nextPoint.y - nextCenter.y,
				};
				changed = true;
			}
		}
		if (changed) {
			updateTrajectoryNodesByFrameId(documentState, nodesByFrameId);
		}
	}

	function copyStoredFrameTrajectoryNodes(documentState, frameIdMappings = []) {
		const nodesByFrameId = getTrajectoryNodesByFrameId(documentState);
		let changed = false;
		for (const mapping of frameIdMappings) {
			const sourceFrameId = mapping?.sourceFrameId;
			const targetFrameId = mapping?.targetFrameId;
			if (
				typeof sourceFrameId !== "string" ||
				typeof targetFrameId !== "string"
			) {
				continue;
			}
			const sourceNode = nodesByFrameId[sourceFrameId];
			if (!sourceNode) {
				continue;
			}
			nodesByFrameId[targetFrameId] = {
				...(sourceNode.mode ? { mode: sourceNode.mode } : {}),
				...(sourceNode.in &&
				Number.isFinite(sourceNode.in.x) &&
				Number.isFinite(sourceNode.in.y)
					? { in: { ...sourceNode.in } }
					: {}),
				...(sourceNode.out &&
				Number.isFinite(sourceNode.out.x) &&
				Number.isFinite(sourceNode.out.y)
					? { out: { ...sourceNode.out } }
					: {}),
			};
			changed = true;
		}
		if (changed) {
			updateTrajectoryNodesByFrameId(documentState, nodesByFrameId);
		}
	}

	function deleteStoredFrameTrajectoryNodes(documentState, frameIds) {
		const frameIdSet = new Set(frameIds ?? []);
		if (frameIdSet.size === 0) {
			return;
		}
		const nodesByFrameId = getTrajectoryNodesByFrameId(documentState);
		let changed = false;
		for (const frameId of frameIdSet) {
			if (nodesByFrameId[frameId]) {
				delete nodesByFrameId[frameId];
				changed = true;
			}
		}
		if (changed) {
			updateTrajectoryNodesByFrameId(documentState, nodesByFrameId);
		}
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

	function clearFrameTrajectoryHandleDrag() {
		frameTrajectoryHandleDragState = null;
	}

	function clearFrameInteraction() {
		cancelHistoryTransaction();
		clearFrameDrag();
		clearFrameResize();
		clearFrameRotate();
		clearFrameAnchorDrag();
		clearFrameTrajectoryHandleDrag();
	}

	function clearFrameSelection() {
		store.frames.selectionActive.value = false;
		setSelectedFrameIds([]);
		clearStoredFrameSelectionTransformState();
		clearFrameInteraction();
	}

	function activateFrameSelection(frameId, options = null) {
		const frame = getFrameDocumentById(getActiveFrames(), frameId);
		if (!frame) {
			return null;
		}

		const additive =
			Boolean(options?.additive) ||
			Boolean(options?.shiftKey) ||
			Boolean(options?.metaKey) ||
			Boolean(options?.ctrlKey);

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
		if (additive && getSelectedFrameIds().length > 0) {
			const nextSelectedIds = [...getSelectedFrameIds(), selectedFrame.id];
			setSelectedFrameIds(nextSelectedIds);
			setFrameMaskSelectedIds(nextSelectedIds);
		} else {
			setSelectedFrameIds([selectedFrame.id]);
			setFrameMaskSelectedIds([selectedFrame.id]);
		}
		syncFrameSelectionTransformState();
		return selectedFrame;
	}

	function selectFrame(frameId, options = null) {
		const frame = activateFrameSelection(frameId, options);
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
		setSelectedFrameIds([nextFrame.id]);
		setFrameMaskSelectedIds([nextFrame.id]);
		syncFrameSelectionTransformState();
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

		const nextFrame = createWorkspaceFrameDocument(activeFrame);
		clearOutputFrameSelection();
		clearFrameInteraction();
		runHistoryAction?.("frame.duplicate", () => {
			updateActiveShotCameraDocument((documentState) => {
				documentState.frames = [...documentState.frames, nextFrame];
				documentState.activeFrameId = nextFrame.id;
				copyStoredFrameTrajectoryNodes(documentState, [
					{
						sourceFrameId: activeFrame.id,
						targetFrameId: nextFrame.id,
					},
				]);
				return documentState;
			});
		});
		store.frames.selectionActive.value = true;
		setSelectedFrameIds([nextFrame.id]);
		setFrameMaskSelectedIds([nextFrame.id]);
		syncFrameSelectionTransformState();
		updateUi();
		setStatus(
			t("status.duplicatedFrame", {
				name: nextFrame.name,
			}),
		);
	}

	function duplicateSelectedFrames(frameIds = null) {
		const selectedFrameIds = Array.isArray(frameIds)
			? Array.from(
					new Set(
						frameIds.filter((frameId) =>
							getActiveFrames().some((frame) => frame.id === frameId),
						),
					),
				)
			: getSelectedFrameIds();
		const sourceFrames = getActiveFrames().filter((frame) =>
			selectedFrameIds.includes(frame.id),
		);
		if (sourceFrames.length === 0) {
			duplicateActiveFrame();
			return;
		}

		const remainingCapacity = FRAME_MAX_COUNT - getActiveFrames().length;
		if (remainingCapacity <= 0 || sourceFrames.length > remainingCapacity) {
			setStatus(
				t("status.frameLimitReached", {
					limit: FRAME_MAX_COUNT,
				}),
			);
			return;
		}

		const nextFrameNumberStart = getNextFrameNumber(getActiveFrames());
		const duplicatedFrames = sourceFrames.map((sourceFrame, index) =>
			createFrameDocument({
				id: getFrameDocumentId(nextFrameNumberStart + index),
				name: buildFrameDocumentName(nextFrameNumberStart + index),
				source: sourceFrame,
			}),
		);
		clearOutputFrameSelection();
		clearFrameInteraction();
		runHistoryAction?.("frame.duplicate", () => {
			updateActiveShotCameraDocument((documentState) => {
				documentState.frames = [...documentState.frames, ...duplicatedFrames];
				documentState.activeFrameId =
					duplicatedFrames[duplicatedFrames.length - 1]?.id ?? null;
				copyStoredFrameTrajectoryNodes(
					documentState,
					duplicatedFrames.map((frame, index) => ({
						sourceFrameId: sourceFrames[index]?.id,
						targetFrameId: frame.id,
					})),
				);
				return documentState;
			});
		});
		const duplicatedFrameIds = duplicatedFrames.map((frame) => frame.id);
		store.frames.selectionActive.value = duplicatedFrameIds.length > 0;
		setSelectedFrameIds(duplicatedFrameIds);
		setFrameMaskSelectedIds(duplicatedFrameIds);
		syncFrameSelectionTransformState();
		updateUi();
		setStatus(
			duplicatedFrames.length === 1
				? t("status.duplicatedFrame", {
						name: duplicatedFrames[0].name,
					})
				: t("status.duplicatedFrames", {
						count: duplicatedFrames.length,
					}),
		);
	}

	function setFrameName(frameId, nextValue) {
		const targetFrame = getFrameDocumentById(getActiveFrames(), frameId);
		if (!targetFrame) {
			return;
		}

		runHistoryAction?.("frame.name", () => {
			updateActiveShotCameraDocument((documentState) => {
				const frame = getFrameDocumentById(documentState.frames, frameId);
				const normalizedName = sanitizeFrameName(nextValue, targetFrame.name);
				if (!frame) {
					return documentState;
				}
				frame.name = normalizedName;
				documentState.activeFrameId = frame.id;
				return documentState;
			});
		});
		updateUi();
	}

	function deleteActiveFrame() {
		const activeFrame = getActiveFrameDocument();
		if (!activeFrame) {
			return;
		}

		deleteFrame(activeFrame.id);
	}

	function deleteSelectedFrames(frameIds = null) {
		const selectedFrameIds = Array.isArray(frameIds)
			? Array.from(
					new Set(
						frameIds.filter((frameId) =>
							getActiveFrames().some((frame) => frame.id === frameId),
						),
					),
				)
			: getSelectedFrameIds().filter((frameId) =>
					getActiveFrames().some((frame) => frame.id === frameId),
				);
		if (selectedFrameIds.length === 0) {
			return;
		}

		const selectedFrameIdSet = new Set(selectedFrameIds);
		const selectedFrames = getActiveFrames().filter((frame) =>
			selectedFrameIdSet.has(frame.id),
		);
		const selectedFrameNames = selectedFrames.map((frame) => frame.name);
		const rememberedMaskSelectedIds = getRememberedFrameMaskSelectedIds();
		let nextActiveFrameId = null;
		let nextRememberedMaskSelectedIds = [];

		clearFrameInteraction();
		clearOutputFramePan();
		runHistoryAction?.("frame.delete", () => {
			updateActiveShotCameraDocument((documentState) => {
				const remainingFrames = documentState.frames.filter(
					(frame) => !selectedFrameIdSet.has(frame.id),
				);
				const remainingFrameIdSet = new Set(
					remainingFrames.map((frame) => frame.id),
				);
				nextActiveFrameId =
					documentState.activeFrameId &&
					remainingFrameIdSet.has(documentState.activeFrameId)
						? documentState.activeFrameId
						: (remainingFrames[0]?.id ?? null);
				nextRememberedMaskSelectedIds = rememberedMaskSelectedIds.filter(
					(selectedFrameId) => remainingFrameIdSet.has(selectedFrameId),
				);
				documentState.frames = remainingFrames;
				documentState.activeFrameId = nextActiveFrameId;
				documentState.frameMask = {
					...documentState.frameMask,
					selectedIds: nextRememberedMaskSelectedIds,
				};
				deleteStoredFrameTrajectoryNodes(documentState, selectedFrameIds);
				return documentState;
			});
		});
		const remainingFrames = getActiveFrames();
		const remainingFrameIdSet = new Set(
			remainingFrames.map((frame) => frame.id),
		);
		let nextSelectedIds = getSelectedFrameIds().filter((selectedFrameId) =>
			remainingFrameIdSet.has(selectedFrameId),
		);
		if (nextSelectedIds.length === 0 && nextActiveFrameId) {
			nextSelectedIds = [nextActiveFrameId];
		}
		store.frames.selectionActive.value = nextSelectedIds.length > 0;
		setSelectedFrameIds(nextSelectedIds);
		setFrameMaskSelectedIds(nextRememberedMaskSelectedIds);
		syncFrameSelectionTransformState();
		updateUi();
		setStatus(
			selectedFrameNames.length === 1
				? t("status.deletedFrame", {
						name: selectedFrameNames[0],
					})
				: t("status.deletedFrames", {
						count: selectedFrameNames.length,
					}),
		);
	}

	function deleteFrame(frameId) {
		const targetFrame = getFrameDocumentById(getActiveFrames(), frameId);
		if (!targetFrame) {
			return;
		}

		const selectedFrameIds = getSelectedFrameIds();
		const rememberedMaskSelectedIds = getRememberedFrameMaskSelectedIds();
		let nextActiveFrameId = null;
		let nextRememberedMaskSelectedIds = [];

		clearFrameInteraction();
		clearOutputFramePan();
		runHistoryAction?.("frame.delete", () => {
			updateActiveShotCameraDocument((documentState) => {
				const remainingFrames = documentState.frames.filter(
					(frame) => frame.id !== targetFrame.id,
				);
				const remainingFrameIdSet = new Set(
					remainingFrames.map((frame) => frame.id),
				);
				const survivingSelectedIds = selectedFrameIds.filter(
					(selectedFrameId) =>
						selectedFrameId !== targetFrame.id &&
						remainingFrameIdSet.has(selectedFrameId),
				);
				nextActiveFrameId =
					survivingSelectedIds[0] ??
					(documentState.activeFrameId &&
					documentState.activeFrameId !== targetFrame.id &&
					remainingFrameIdSet.has(documentState.activeFrameId)
						? documentState.activeFrameId
						: (remainingFrames[0]?.id ?? null));
				nextRememberedMaskSelectedIds = rememberedMaskSelectedIds.filter(
					(selectedFrameId) =>
						selectedFrameId !== targetFrame.id &&
						remainingFrameIdSet.has(selectedFrameId),
				);
				documentState.frames = remainingFrames;
				documentState.activeFrameId = nextActiveFrameId;
				documentState.frameMask = {
					...documentState.frameMask,
					selectedIds: nextRememberedMaskSelectedIds,
				};
				deleteStoredFrameTrajectoryNodes(documentState, [targetFrame.id]);
				return documentState;
			});
		});
		const remainingFrames = getActiveFrames();
		const remainingFrameIdSet = new Set(
			remainingFrames.map((frame) => frame.id),
		);
		let nextSelectedIds = selectedFrameIds.filter(
			(selectedFrameId) =>
				selectedFrameId !== targetFrame.id &&
				remainingFrameIdSet.has(selectedFrameId),
		);
		if (nextSelectedIds.length === 0 && nextActiveFrameId) {
			nextSelectedIds = [nextActiveFrameId];
		}
		store.frames.selectionActive.value = nextSelectedIds.length > 0;
		setSelectedFrameIds(nextSelectedIds);
		setFrameMaskSelectedIds(nextRememberedMaskSelectedIds);
		syncFrameSelectionTransformState();
		updateUi();
		setStatus(
			t("status.deletedFrame", {
				name: targetFrame.name,
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
		if (!isFrameSelected(frameId)) {
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
		getActiveFrames,
		getActiveFrameDocument,
		resolveFrameAxis,
		resolveFrameAnchor,
		getFrameAnchorDocument,
		isFrameSelectionActive,
		getFrameMaskMode,
		setFrameMaskMode,
		getFrameMaskPreferredMode,
		toggleFrameMaskMode,
		togglePreferredFrameMaskMode,
		setFrameMaskOpacity,
		getFrameMaskShape,
		setFrameMaskShape,
		getFrameTrajectoryMode,
		setFrameTrajectoryMode,
		setFrameTrajectoryNodeMode,
		getFrameTrajectoryExportSource,
		setFrameTrajectoryExportSource,
		setFrameTrajectoryEditMode,
		toggleFrameTrajectoryEditMode,
		setFrameTrajectoryHandlePoint,
		clearFrameTrajectoryHandlePoint,
		syncFrameSelectionTransformState,
		clearFrameDrag,
		clearFrameInteraction,
		clearFrameSelection,
		selectFrame,
		createFrame,
		duplicateActiveFrame,
		duplicateSelectedFrames,
		setFrameName,
		deleteSelectedFrames,
		deleteFrame,
		deleteActiveFrame,
		startFrameDrag,
		startSelectedFramesDrag,
		handleFrameDragMove,
		handleFrameDragEnd,
		startFrameResize,
		startSelectedFramesResize,
		handleFrameResizeMove,
		handleFrameResizeEnd,
		startFrameRotate,
		startSelectedFramesRotate,
		handleFrameRotateMove,
		handleFrameRotateEnd,
		startFrameAnchorDrag,
		startSelectedFramesAnchorDrag,
		handleFrameAnchorDragMove,
		handleFrameAnchorDragEnd,
		startFrameTrajectoryHandleDrag,
		handleFrameTrajectoryHandleDragMove,
		handleFrameTrajectoryHandleDragEnd,
	};
}
