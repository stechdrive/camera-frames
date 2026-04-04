import {
	FRAME_RESIZE_HANDLES,
	getFrameResizeAxisLocal,
	getOppositeFrameResizeHandleKey,
	inverseRotateVector,
} from "../../engine/frame-transform.js";
import {
	getPointFromRectLocal,
	normalizeAngleDeltaDeg,
} from "../../engine/reference-image-selection.js";
import { removeRenderBoxOffsetCorrection } from "../../reference-image-model.js";

const REFERENCE_IMAGE_DRAG_START_THRESHOLD_PX = 4;

export function createReferenceImageViewportInteraction({
	store,
	updateUi,
	getSelectedItemIds,
	parseSelectionOptions,
	selectReferenceImageItem,
	setSelectionState,
	buildSelectionTransformState,
	beginHistoryTransaction,
	commitHistoryTransaction,
	cancelHistoryTransaction,
	applyReferenceImageSelectionMoveDelta,
	applyReferenceImageSelectionRotationDelta,
	applyReferenceImageSelectionScaleRatio,
	applyGeometryUpdates,
	setStoredSelectionBox,
	clampPointerToViewportShell,
} = {}) {
	let referenceImageDragState = null;

	function stopReferenceImageDrag({
		shouldCommit = false,
		label = referenceImageDragState?.historyLabel,
	} = {}) {
		if (!referenceImageDragState) {
			return false;
		}
		window.removeEventListener("pointermove", handleReferenceImagePointerMove);
		window.removeEventListener("pointerup", handleReferenceImagePointerUp);
		window.removeEventListener("pointercancel", handleReferenceImagePointerUp);
		if (shouldCommit) {
			commitHistoryTransaction(label);
		} else {
			cancelHistoryTransaction();
		}
		referenceImageDragState = null;
		return true;
	}

	function startReferenceImageMove(itemId, event) {
		if (!store.viewportReferenceImageEditMode.value) {
			return false;
		}
		const item =
			store.referenceImages.items.value.find((entry) => entry.id === itemId) ??
			null;
		if (!item || event.button !== 0) {
			return false;
		}
		event.preventDefault();
		event.stopPropagation();

		const selectionOptions = parseSelectionOptions?.(event) ?? {
			additive: false,
			toggle: false,
		};
		if (selectionOptions.additive || selectionOptions.toggle) {
			const currentSelectedItemIds = getSelectedItemIds();
			const nextSelectionOptions =
				selectionOptions.additive &&
				!selectionOptions.toggle &&
				currentSelectedItemIds.includes(item.id)
					? {
							...selectionOptions,
							toggle: true,
						}
					: selectionOptions;
			selectReferenceImageItem(itemId, nextSelectionOptions);
			updateUi?.();
			return true;
		}

		const selectedItemIds = getSelectedItemIds();
		if (!selectedItemIds.includes(item.id)) {
			setSelectionState({
				selectedItemIds: [item.id],
				activeItemId: item.id,
				activeAssetId: item.assetId,
			});
			updateUi?.();
			return true;
		}

		const transformState = buildSelectionTransformState();
		if (!transformState) {
			return false;
		}
		referenceImageDragState = {
			type: "move",
			pointerId: event.pointerId,
			startClientX: event.clientX,
			startClientY: event.clientY,
			selectionState: transformState,
			dragActivated: false,
			historyLabel: "reference-image.move",
		};
		window.addEventListener("pointermove", handleReferenceImagePointerMove);
		window.addEventListener("pointerup", handleReferenceImagePointerUp);
		window.addEventListener("pointercancel", handleReferenceImagePointerUp);
		return true;
	}

	function startReferenceImageResize(handleKey, event) {
		if (!store.viewportReferenceImageEditMode.value) {
			return false;
		}
		if (event.button !== 0) {
			return false;
		}
		const handle = FRAME_RESIZE_HANDLES[handleKey];
		if (!handle) {
			return false;
		}
		event.preventDefault();
		event.stopPropagation();
		const selectionState = buildSelectionTransformState();
		if (
			!selectionState?.selectionBoxScreen ||
			!selectionState.selectionBoxLogical
		) {
			return false;
		}
		const rotationRadians =
			(selectionState.selectionBoxScreen.rotationDeg * Math.PI) / 180;
		const frameAnchorLocal = selectionState.anchorLocal;
		const useSelectionAnchorPivot = event.altKey;
		const anchorLocal = useSelectionAnchorPivot
			? frameAnchorLocal
			: (FRAME_RESIZE_HANDLES[getOppositeFrameResizeHandleKey(handleKey)] ?? {
					x: 0.5,
					y: 0.5,
				});
		const anchorWorld = getPointFromRectLocal({
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
		beginHistoryTransaction("reference-image.resize");
		referenceImageDragState = {
			type: "resize",
			pointerId: event.pointerId,
			handleKey,
			selectionState,
			selectionBoxScreen: selectionState.selectionBoxScreen,
			rotationRadians,
			anchorLocal,
			anchorWorld,
			anchorLogical,
			resizeAxisX: resizeAxis.x,
			resizeAxisY: resizeAxis.y,
			startProjectionDistance:
				startPointerLocal.x * resizeAxis.x + startPointerLocal.y * resizeAxis.y,
			historyLabel: "reference-image.resize",
		};
		window.addEventListener("pointermove", handleReferenceImagePointerMove);
		window.addEventListener("pointerup", handleReferenceImagePointerUp);
		window.addEventListener("pointercancel", handleReferenceImagePointerUp);
		return true;
	}

	function startReferenceImageRotate(zoneKey, event) {
		if (!store.viewportReferenceImageEditMode.value) {
			return false;
		}
		if (event.button !== 0) {
			return false;
		}
		event.preventDefault();
		event.stopPropagation();
		const selectionState = buildSelectionTransformState();
		if (!selectionState?.screenPivot) {
			return false;
		}
		beginHistoryTransaction("reference-image.rotate");
		referenceImageDragState = {
			type: "rotate",
			pointerId: event.pointerId,
			zoneKey,
			selectionState,
			screenPivot: selectionState.screenPivot,
			startPointerAngleDeg:
				(Math.atan2(
					event.clientY - selectionState.screenPivot.y,
					event.clientX - selectionState.screenPivot.x,
				) *
					180) /
				Math.PI,
			historyLabel: "reference-image.rotate",
		};
		window.addEventListener("pointermove", handleReferenceImagePointerMove);
		window.addEventListener("pointerup", handleReferenceImagePointerUp);
		window.addEventListener("pointercancel", handleReferenceImagePointerUp);
		return true;
	}

	function startReferenceImageAnchorDrag(event) {
		if (!store.viewportReferenceImageEditMode.value) {
			return false;
		}
		if (event.button !== 0) {
			return false;
		}
		event.preventDefault();
		event.stopPropagation();
		const selectionState = buildSelectionTransformState();
		if (
			!selectionState?.selectionBoxScreen ||
			!selectionState.selectionBoxLogical
		) {
			return false;
		}
		if (selectionState.geometries.length === 1) {
			beginHistoryTransaction("reference-image.anchor");
		}
		referenceImageDragState = {
			type: "anchor",
			pointerId: event.pointerId,
			selectionState,
			historyLabel:
				selectionState.geometries.length === 1
					? "reference-image.anchor"
					: null,
		};
		window.addEventListener("pointermove", handleReferenceImagePointerMove);
		window.addEventListener("pointerup", handleReferenceImagePointerUp);
		window.addEventListener("pointercancel", handleReferenceImagePointerUp);
		return true;
	}

	function handleReferenceImagePointerMove(event) {
		if (
			!referenceImageDragState ||
			event.pointerId !== referenceImageDragState.pointerId
		) {
			return;
		}
		event.preventDefault();
		const { selectionState } = referenceImageDragState;
		if (!selectionState) {
			return;
		}
		if (referenceImageDragState.type === "move") {
			const deltaLogicalX =
				(event.clientX - referenceImageDragState.startClientX) /
				selectionState.context.renderScaleX;
			const deltaLogicalY =
				(event.clientY - referenceImageDragState.startClientY) /
				selectionState.context.renderScaleY;
			if (!referenceImageDragState.dragActivated) {
				if (
					Math.hypot(
						event.clientX - referenceImageDragState.startClientX,
						event.clientY - referenceImageDragState.startClientY,
					) < REFERENCE_IMAGE_DRAG_START_THRESHOLD_PX
				) {
					return;
				}
				referenceImageDragState.dragActivated = true;
				beginHistoryTransaction("reference-image.move");
			}
			applyReferenceImageSelectionMoveDelta(
				selectionState,
				deltaLogicalX,
				deltaLogicalY,
			);
			return;
		}

		if (referenceImageDragState.type === "rotate") {
			const nextPointerAngleDeg =
				(Math.atan2(
					event.clientY - referenceImageDragState.screenPivot.y,
					event.clientX - referenceImageDragState.screenPivot.x,
				) *
					180) /
				Math.PI;
			const deltaAngleDeg = normalizeAngleDeltaDeg(
				nextPointerAngleDeg - referenceImageDragState.startPointerAngleDeg,
			);
			applyReferenceImageSelectionRotationDelta(selectionState, deltaAngleDeg);
			return;
		}

		if (referenceImageDragState.type === "resize") {
			const currentPointerLocal = inverseRotateVector(
				event.clientX - referenceImageDragState.anchorWorld.x,
				event.clientY - referenceImageDragState.anchorWorld.y,
				referenceImageDragState.rotationRadians,
			);
			const currentProjection =
				currentPointerLocal.x * referenceImageDragState.resizeAxisX +
				currentPointerLocal.y * referenceImageDragState.resizeAxisY;
			const scaleRatio = Math.max(
				0.01,
				currentProjection /
					Math.max(referenceImageDragState.startProjectionDistance, 1e-6),
			);
			applyReferenceImageSelectionScaleRatio(
				selectionState,
				scaleRatio,
				referenceImageDragState.anchorLogical,
			);
			return;
		}

		if (referenceImageDragState.type !== "anchor") {
			return;
		}
		const singleGeometry =
			selectionState.geometries.length === 1
				? selectionState.geometries[0]
				: null;
		if (singleGeometry) {
			const clampedPointer = clampPointerToViewportShell(
				event.clientX,
				event.clientY,
				selectionState.context,
			);
			const pointerLogicalX =
				(clampedPointer.x - selectionState.context.renderBoxScreenLeft) /
				selectionState.context.renderScaleX;
			const pointerLogicalY =
				(clampedPointer.y - selectionState.context.renderBoxScreenTop) /
				selectionState.context.renderScaleY;
			const rotationRadians =
				(selectionState.selectionBoxLogical.rotationDeg * Math.PI) / 180;
			const pointerLocal = inverseRotateVector(
				pointerLogicalX - singleGeometry.anchorPoint.x,
				pointerLogicalY - singleGeometry.anchorPoint.y,
				rotationRadians,
			);
			const normalizedAnchor = {
				ax:
					(singleGeometry.anchorPoint.x +
						pointerLocal.x -
						singleGeometry.left) /
					Math.max(singleGeometry.logicalWidth, 1e-6),
				ay:
					(singleGeometry.anchorPoint.y + pointerLocal.y - singleGeometry.top) /
					Math.max(singleGeometry.logicalHeight, 1e-6),
			};
			applyGeometryUpdates([singleGeometry], (geometry, context) => {
				const nextAnchorPoint = getPointFromRectLocal({
					left: geometry.left,
					top: geometry.top,
					width: geometry.logicalWidth,
					height: geometry.logicalHeight,
					localX: normalizedAnchor.ax,
					localY: normalizedAnchor.ay,
					anchorAx: geometry.item.anchor.ax,
					anchorAy: geometry.item.anchor.ay,
					rotationDeg: geometry.item.rotationDeg,
				});
				const nextItemAnchorPx = {
					x: context.outputSize.w * normalizedAnchor.ax,
					y: context.outputSize.h * normalizedAnchor.ay,
				};
				const nextEffectiveOffset = {
					x: nextItemAnchorPx.x - nextAnchorPoint.x,
					y: nextItemAnchorPx.y - nextAnchorPoint.y,
				};
				const nextOffset = removeRenderBoxOffsetCorrection(
					nextEffectiveOffset,
					normalizedAnchor,
					context.resolved.preset.baseRenderBox,
					context.outputSize,
					context.renderBoxAnchor,
					context.resolved.override?.renderBoxCorrection ?? null,
				);
				return {
					anchor: normalizedAnchor,
					offsetPx: {
						x: nextOffset.x,
						y: nextOffset.y,
					},
				};
			});
			return;
		}
		const { selectionBoxLogical } = selectionState;
		const clampedPointer = clampPointerToViewportShell(
			event.clientX,
			event.clientY,
			selectionState.context,
		);
		const pointerLogicalX =
			(clampedPointer.x - selectionState.context.renderBoxScreenLeft) /
			selectionState.context.renderScaleX;
		const pointerLogicalY =
			(clampedPointer.y - selectionState.context.renderBoxScreenTop) /
			selectionState.context.renderScaleY;
		const rotationRadians =
			((selectionBoxLogical.rotationDeg ?? 0) * Math.PI) / 180;
		const pointerLocal = inverseRotateVector(
			pointerLogicalX - selectionState.pivot.x,
			pointerLogicalY - selectionState.pivot.y,
			rotationRadians,
		);
		const nextSelectionAnchor = {
			x:
				(selectionState.pivot.x + pointerLocal.x - selectionBoxLogical.left) /
				Math.max(selectionBoxLogical.width, 1e-6),
			y:
				(selectionState.pivot.y + pointerLocal.y - selectionBoxLogical.top) /
				Math.max(selectionBoxLogical.height, 1e-6),
		};
		const nextAnchorPoint = getPointFromRectLocal({
			left: selectionBoxLogical.left,
			top: selectionBoxLogical.top,
			width: selectionBoxLogical.width,
			height: selectionBoxLogical.height,
			localX: nextSelectionAnchor.x,
			localY: nextSelectionAnchor.y,
			anchorAx: selectionBoxLogical.anchorX,
			anchorAy: selectionBoxLogical.anchorY,
			rotationDeg: selectionBoxLogical.rotationDeg,
		});
		store.referenceImages.selectionAnchor.value = nextSelectionAnchor;
		setStoredSelectionBox(
			{
				...selectionBoxLogical,
				left:
					nextAnchorPoint.x - selectionBoxLogical.width * nextSelectionAnchor.x,
				top:
					nextAnchorPoint.y -
					selectionBoxLogical.height * nextSelectionAnchor.y,
				anchorX: nextSelectionAnchor.x,
				anchorY: nextSelectionAnchor.y,
			},
			selectionState.context,
			nextSelectionAnchor,
		);
		updateUi?.();
	}

	function handleReferenceImagePointerUp(event) {
		if (
			!referenceImageDragState ||
			event.pointerId !== referenceImageDragState.pointerId
		) {
			return;
		}
		event.preventDefault();
		stopReferenceImageDrag({
			shouldCommit:
				referenceImageDragState.type !== "move" ||
				referenceImageDragState.dragActivated,
		});
	}

	return {
		isReferenceImageDragActive: () => referenceImageDragState !== null,
		stopReferenceImageDrag,
		startReferenceImageMove,
		startReferenceImageResize,
		startReferenceImageRotate,
		startReferenceImageAnchorDrag,
		handleReferenceImagePointerMove,
		handleReferenceImagePointerUp,
	};
}
