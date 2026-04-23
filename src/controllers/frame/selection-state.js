import { getPointFromRectLocal } from "../../engine/frame-transform.js";
import { getFrameDocumentById } from "../../workspace-model.js";
import {
	buildFrameGeometry,
	buildSelectionBoxLogicalFromGeometries,
	projectSelectionBoxLogicalToScreen,
} from "./geometry.js";

export function createCameraFrameSelectionController({
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
	setFrameMaskSelectedIds,
	clearFrameInteraction,
}) {
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

	function getSelectedFrames() {
		const selectedFrameIdSet = new Set(getSelectedFrameIds());
		return getActiveFrames().filter((frame) =>
			selectedFrameIdSet.has(frame.id),
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

	function focusSelectedFrame(frameId) {
		const frame = getFrameDocumentById(getActiveFrames(), frameId);
		if (!frame) {
			return null;
		}

		clearOutputFrameSelection();
		clearFrameInteraction();
		let focusedFrame = frame;
		updateActiveShotCameraDocument((documentState) => {
			const nextFrame = getFrameDocumentById(documentState.frames, frame.id);
			if (!nextFrame) {
				return documentState;
			}

			documentState.activeFrameId = nextFrame.id;
			focusedFrame = nextFrame;
			return documentState;
		});
		store.frames.selectionActive.value = true;
		if (getSelectedFrameIds().length === 0) {
			setSelectedFrameIds([focusedFrame.id]);
			setFrameMaskSelectedIds([focusedFrame.id]);
		}
		syncFrameSelectionTransformState();
		return focusedFrame;
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

	return {
		isFrameSelectionActive,
		getSelectedFrameIds,
		setSelectedFrameIds,
		isFrameSelected,
		getSelectedFrames,
		clearStoredFrameSelectionTransformState,
		setStoredFrameSelectionBox,
		buildFrameSelectionTransformState,
		syncFrameSelectionTransformState,
		clearFrameSelection,
		activateFrameSelection,
		focusSelectedFrame,
		selectFrame,
	};
}
