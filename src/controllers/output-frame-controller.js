import {
	ANCHORS,
	AUTO_VIEW_ZOOM_MARGIN,
	AUTO_WORKBENCH_MIN_SAFE_ZOOM,
	BASE_RENDER_BOX,
	DEFAULT_CAMERA_NEAR,
	VIEWPORT_PIXEL_RATIO,
	WORKBENCH_SAFE_GUTTER_PX,
	WORKBENCH_STACK_BREAKPOINT_PX,
} from "../constants.js";
import { drawFramesToContext } from "../engine/frame-overlay.js";
import {
	clampOutputFrameCenterPx,
	clampViewZoom,
	getBaseFrustumExtents,
	getExportSize,
	getRenderBoxMetrics,
	getTargetFrustumExtents,
	remapPointBetweenRenderBoxes,
} from "../engine/projection.js";

export function computeWorkbenchLayoutState({
	viewportWidth,
	viewportHeight,
	shellRect,
	rightRect,
	workbenchCollapsed,
}) {
	const stackedLayout = viewportWidth <= WORKBENCH_STACK_BREAKPOINT_PX;
	let safeWidth = viewportWidth;
	if (!stackedLayout && !workbenchCollapsed) {
		const rightInset = rightRect
			? Math.max(
					0,
					Math.min(
						viewportWidth,
						shellRect.right - rightRect.left + WORKBENCH_SAFE_GUTTER_PX,
					),
				)
			: 0;
		safeWidth = Math.max(1, viewportWidth - rightInset);
	}

	return {
		viewportWidth,
		viewportHeight,
		stackedLayout,
		safeWidth,
		safeHeight: viewportHeight,
	};
}

export function createOutputFrameController({
	store,
	state,
	viewportShell,
	workbenchRightColumn,
	renderBox,
	renderBoxMeta,
	anchorDot,
	frameOverlayCanvas,
	outputFrameResizeHandles,
	workspacePaneCamera,
	isZoomToolActive,
	t,
	getAnchorLabel,
	currentLocale,
	clearFrameSelection,
	isFrameSelectionActive,
	getActiveShotCameraDocument,
	getShotCameraDocument,
	getActiveShotCameraEntry,
	shotCameraRegistry,
	getActiveFrames,
	getFrameAnchorDocument,
	resolveFrameAxis,
	resolveFrameAnchor,
	getBaseFovX,
	updateActiveShotCameraDocument,
	updateUi,
	runHistoryAction = (_label, applyChange) => {
		applyChange?.();
		return false;
	},
	beginHistoryTransaction = () => false,
	commitHistoryTransaction = () => false,
	cancelHistoryTransaction = () => {},
}) {
	let outputFramePanState = null;
	let outputFrameAnchorDragState = null;
	let outputFrameResizeState = null;
	let lastAutoLayoutSignature = "";

	function clearOutputFramePan() {
		outputFramePanState = null;
		renderBox.classList.remove("is-pan-active");
	}

	function clearOutputFrameAnchorDrag() {
		outputFrameAnchorDragState = null;
		renderBox.classList.remove("is-anchor-active");
	}

	function clearOutputFrameResize() {
		outputFrameResizeState = null;
		renderBox.classList.remove("is-resize-active");
	}

	function selectOutputFrame() {
		clearFrameSelection();
		state.outputFrameSelected = true;
	}

	function clearOutputFrameSelection() {
		cancelHistoryTransaction();
		state.outputFrameSelected = false;
		clearOutputFramePan();
		clearOutputFrameAnchorDrag();
		clearOutputFrameResize();
	}

	function getOutputFrameDocumentState(
		documentState = getActiveShotCameraDocument(),
	) {
		return documentState?.outputFrame ?? {};
	}

	function getFrameOverlayCanvasOffset(metrics) {
		return {
			left: -(metrics.boxLeft + Math.max(renderBox?.clientLeft ?? 0, 0)),
			top: -(metrics.boxTop + Math.max(renderBox?.clientTop ?? 0, 0)),
		};
	}

	function getOutputSizeState(documentState = getActiveShotCameraDocument()) {
		const outputFrameDocument = getOutputFrameDocumentState(documentState);
		return getExportSize({
			widthScale: outputFrameDocument.widthScale ?? 1,
			heightScale: outputFrameDocument.heightScale ?? 1,
		});
	}

	function getViewportSize() {
		return {
			width: Math.max(viewportShell.clientWidth, 1),
			height: Math.max(viewportShell.clientHeight, 1),
		};
	}

	function getWorkbenchLayoutState() {
		const viewportWidth = Math.max(viewportShell.clientWidth, 1);
		const viewportHeight = Math.max(viewportShell.clientHeight, 1);
		const shellRect = viewportShell.getBoundingClientRect();
		const rightColumnElement =
			workbenchRightColumn?.current ?? workbenchRightColumn;
		const rightRect = rightColumnElement?.getBoundingClientRect?.() ?? null;
		return computeWorkbenchLayoutState({
			viewportWidth,
			viewportHeight,
			shellRect,
			rightRect,
			workbenchCollapsed: store.workbenchCollapsed.value,
		});
	}

	function isPhoneLikeTouchViewport(viewportWidth) {
		if (
			typeof window === "undefined" ||
			typeof window.matchMedia !== "function"
		) {
			return false;
		}

		const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
		const noHover = window.matchMedia("(hover: none)").matches;
		return coarsePointer && noHover && viewportWidth <= 900;
	}

	function resolveAutoLayout(documentState) {
		const exportSize = getOutputSizeState(documentState);
		const {
			viewportWidth,
			viewportHeight,
			stackedLayout,
			safeWidth,
			safeHeight,
		} = getWorkbenchLayoutState();
		const fitScale = Math.min(
			viewportWidth / exportSize.width,
			viewportHeight / exportSize.height,
		);
		const safeFitScale = Math.min(
			safeWidth / exportSize.width,
			safeHeight / exportSize.height,
		);
		const expandedSafeZoom = clampViewZoom(
			(safeFitScale / Math.max(fitScale, 1e-6)) * AUTO_VIEW_ZOOM_MARGIN,
		);
		const phoneLikeTouchViewport = isPhoneLikeTouchViewport(viewportWidth);
		const shouldAutoCollapse =
			phoneLikeTouchViewport ||
			stackedLayout ||
			expandedSafeZoom < AUTO_WORKBENCH_MIN_SAFE_ZOOM;

		if (store.workbenchAutoCollapsed.value !== shouldAutoCollapse) {
			store.workbenchAutoCollapsed.value = shouldAutoCollapse;
			if (!shouldAutoCollapse) {
				store.workbenchManualExpanded.value = false;
			}
		}

		const actualCollapsed = store.workbenchCollapsed.value;
		const actualSafeWidth = actualCollapsed ? viewportWidth : safeWidth;
		const actualSafeHeight = actualCollapsed ? viewportHeight : safeHeight;
		const recommendedZoom = clampViewZoom(
			(Math.min(
				actualSafeWidth / exportSize.width,
				actualSafeHeight / exportSize.height,
			) /
				Math.max(fitScale, 1e-6)) *
				AUTO_VIEW_ZOOM_MARGIN,
		);

		return {
			viewportWidth,
			viewportHeight,
			exportWidth: exportSize.width,
			exportHeight: exportSize.height,
			actualCollapsed,
			recommendedZoom,
		};
	}

	function syncAutoWorkbenchLayout(
		documentState = getActiveShotCameraDocument(),
	) {
		if (!documentState) {
			store.workbenchAutoCollapsed.value = false;
			store.workbenchManualExpanded.value = false;
			lastAutoLayoutSignature = "";
			return null;
		}

		return resolveAutoLayout(documentState);
	}

	function syncAutoViewZoom(
		documentState = getActiveShotCameraDocument(),
		layout = syncAutoWorkbenchLayout(documentState),
	) {
		if (!documentState?.outputFrame?.viewZoomAuto || !layout) {
			lastAutoLayoutSignature = "";
			return false;
		}

		const signature = [
			documentState.id ?? "active",
			layout.viewportWidth,
			layout.viewportHeight,
			layout.exportWidth,
			layout.exportHeight,
			layout.actualCollapsed ? "collapsed" : "expanded",
			layout.recommendedZoom.toFixed(4),
		].join("|");

		if (signature === lastAutoLayoutSignature) {
			return false;
		}
		lastAutoLayoutSignature = signature;

		if (
			Math.abs(
				(documentState.outputFrame.viewZoom ?? 1) - layout.recommendedZoom,
			) < 1e-4
		) {
			return false;
		}

		updateActiveShotCameraDocument((nextDocumentState) => {
			nextDocumentState.outputFrame.viewZoom = layout.recommendedZoom;
			nextDocumentState.outputFrame.viewZoomAuto = true;
			return nextDocumentState;
		});
		return true;
	}

	function syncOutputFrameFitState(
		documentState = getActiveShotCameraDocument(),
		viewportWidth = getViewportSize().width,
		viewportHeight = getViewportSize().height,
		force = false,
	) {
		const outputFrameDocument = getOutputFrameDocumentState(documentState);
		if (!documentState?.outputFrame) {
			return outputFrameDocument;
		}

		const width = Math.max(viewportWidth, 1);
		const height = Math.max(viewportHeight, 1);
		const needsFitSync =
			force ||
			!(
				Number.isFinite(outputFrameDocument.fitScale) &&
				outputFrameDocument.fitScale > 0
			) ||
			outputFrameDocument.fitViewportWidth !== width ||
			outputFrameDocument.fitViewportHeight !== height;

		if (!needsFitSync) {
			return outputFrameDocument;
		}

		const exportSize = getOutputSizeState(documentState);
		const metrics = getRenderBoxMetrics({
			viewportWidth: width,
			viewportHeight: height,
			exportWidth: exportSize.width,
			exportHeight: exportSize.height,
			viewZoom: outputFrameDocument.viewZoom ?? 1,
			viewportCenterX: outputFrameDocument.viewportCenterX,
			viewportCenterY: outputFrameDocument.viewportCenterY,
			anchorKey: outputFrameDocument.anchor ?? "center",
		});
		const clampedCenter = clampOutputFrameCenterPx({
			centerX: metrics.boxCenterX,
			centerY: metrics.boxCenterY,
			viewportWidth: width,
			viewportHeight: height,
			boxWidth: metrics.boxWidth,
			boxHeight: metrics.boxHeight,
		});

		outputFrameDocument.fitScale = metrics.fitScale;
		outputFrameDocument.fitViewportWidth = width;
		outputFrameDocument.fitViewportHeight = height;
		outputFrameDocument.viewportCenterX = clampedCenter.x / width;
		outputFrameDocument.viewportCenterY = clampedCenter.y / height;
		return outputFrameDocument;
	}

	function getOutputFrameMetrics(
		documentState = getActiveShotCameraDocument(),
	) {
		const layout = syncAutoWorkbenchLayout(documentState);
		syncAutoViewZoom(documentState, layout);
		const { width, height } = getViewportSize();
		const outputFrameDocument = syncOutputFrameFitState(
			documentState,
			width,
			height,
		);
		const exportSize = getOutputSizeState(documentState);
		return getRenderBoxMetrics({
			viewportWidth: width,
			viewportHeight: height,
			exportWidth: exportSize.width,
			exportHeight: exportSize.height,
			viewZoom: outputFrameDocument.viewZoom ?? 1,
			fitScale: outputFrameDocument.fitScale,
			viewportCenterX: outputFrameDocument.viewportCenterX,
			viewportCenterY: outputFrameDocument.viewportCenterY,
			anchorKey: outputFrameDocument.anchor ?? "center",
		});
	}

	function renderViewportFrameOverlay(metrics) {
		const context = frameOverlayCanvas?.getContext("2d");
		if (!context) {
			return;
		}

		const shellWidth = Math.max(1, viewportShell.clientWidth);
		const shellHeight = Math.max(1, viewportShell.clientHeight);
		const dpr = VIEWPORT_PIXEL_RATIO;
		const canvasWidth = Math.max(1, Math.round(shellWidth * dpr));
		const canvasHeight = Math.max(1, Math.round(shellHeight * dpr));

		if (frameOverlayCanvas.width !== canvasWidth) {
			frameOverlayCanvas.width = canvasWidth;
		}
		if (frameOverlayCanvas.height !== canvasHeight) {
			frameOverlayCanvas.height = canvasHeight;
		}

		const overlayCanvasOffset = getFrameOverlayCanvasOffset(metrics);
		frameOverlayCanvas.style.left = `${overlayCanvasOffset.left}px`;
		frameOverlayCanvas.style.top = `${overlayCanvasOffset.top}px`;
		frameOverlayCanvas.style.width = `${shellWidth}px`;
		frameOverlayCanvas.style.height = `${shellHeight}px`;

		context.setTransform(1, 0, 0, 1, 0, 0);
		context.clearRect(
			0,
			0,
			frameOverlayCanvas.width,
			frameOverlayCanvas.height,
		);
		context.scale(dpr, dpr);
		drawFramesToContext(
			context,
			metrics.boxWidth,
			metrics.boxHeight,
			getActiveFrames(),
			{
				logicalSpaceWidth: metrics.exportWidth,
				logicalSpaceHeight: metrics.exportHeight,
				offsetX: metrics.boxLeft,
				offsetY: metrics.boxTop,
				pixelSnapAxisAligned: false,
				strokeStyle: "rgba(255, 87, 72, 0.92)",
				selectedFrameId: isFrameSelectionActive()
					? (getActiveShotCameraDocument()?.activeFrameId ?? null)
					: null,
				selectedFrameIds: isFrameSelectionActive()
					? (store.frames.selectedIds.value ?? [])
					: [],
				selectedStrokeStyle: "rgba(255, 214, 120, 0.96)",
			},
		);
		context.setTransform(1, 0, 0, 1, 0, 0);
	}

	function updateOutputFrameOverlay() {
		const metrics = getOutputFrameMetrics();
		const anchorX = metrics.boxLeft + metrics.boxWidth * metrics.anchor.x;
		const anchorY = metrics.boxTop + metrics.boxHeight * metrics.anchor.y;

		const anchorHandleKey =
			{
				"top-left": "top-left",
				"top-center": "top",
				"top-right": "top-right",
				"middle-left": "left",
				center: "",
				"middle-right": "right",
				"bottom-left": "bottom-left",
				"bottom-center": "bottom",
				"bottom-right": "bottom-right",
			}[state.outputFrame.anchor] ?? "";

		renderBox.style.left = `${metrics.boxLeft}px`;
		renderBox.style.top = `${metrics.boxTop}px`;
		renderBox.style.width = `${metrics.boxWidth}px`;
		renderBox.style.height = `${metrics.boxHeight}px`;
		renderBox.dataset.anchorHandle = anchorHandleKey;
		renderBoxMeta.textContent = t("outputFrame.meta", {
			size: `${metrics.exportWidth} × ${metrics.exportHeight}`,
			anchor: getAnchorLabel(currentLocale(), state.outputFrame.anchor),
		});
		anchorDot.style.left = `${anchorX - metrics.boxLeft}px`;
		anchorDot.style.top = `${anchorY - metrics.boxTop}px`;
		renderViewportFrameOverlay(metrics);
	}

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

	function resolveOutputFrameResizeScale({
		startDistance,
		pointerDelta,
		handleFactor,
		displayScale,
		baseDimension,
		fallbackScale,
	}) {
		const factor = Math.abs(handleFactor);
		if (factor < 1e-6 || !(displayScale > 0)) {
			return fallbackScale;
		}

		const nextDistance = Math.max(
			1e-6,
			startDistance + pointerDelta * Math.sign(handleFactor),
		);
		return nextDistance / Math.max(baseDimension * displayScale * factor, 1e-6);
	}

	function startOutputFramePan(event) {
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

		const metrics = getOutputFrameMetrics(activeDocument);

		outputFramePanState = {
			pointerId: event.pointerId,
			startClientX: event.clientX,
			startClientY: event.clientY,
			startCenterX: metrics.boxCenterX,
			startCenterY: metrics.boxCenterY,
		};
		beginHistoryTransaction("output-frame.pan");
		renderBox.classList.add("is-pan-active");
	}

	function handleOutputFramePanMove(event) {
		if (
			!outputFramePanState ||
			event.pointerId !== outputFramePanState.pointerId
		) {
			return;
		}

		const activeDocument = getActiveShotCameraDocument();
		if (!activeDocument) {
			return;
		}

		const { width: viewportWidth, height: viewportHeight } = getViewportSize();
		const outputFrameDocument = syncOutputFrameFitState(
			activeDocument,
			viewportWidth,
			viewportHeight,
		);
		const exportSize = getOutputSizeState(activeDocument);
		const desiredCenterX =
			outputFramePanState.startCenterX +
			(event.clientX - outputFramePanState.startClientX);
		const desiredCenterY =
			outputFramePanState.startCenterY +
			(event.clientY - outputFramePanState.startClientY);
		const panMetrics = getRenderBoxMetrics({
			viewportWidth,
			viewportHeight,
			exportWidth: exportSize.width,
			exportHeight: exportSize.height,
			viewZoom: outputFrameDocument.viewZoom ?? 1,
			fitScale: outputFrameDocument.fitScale,
			viewportCenterX: desiredCenterX / viewportWidth,
			viewportCenterY: desiredCenterY / viewportHeight,
			anchorKey: outputFrameDocument.anchor ?? "center",
		});
		const clampedCenter = clampOutputFrameCenterPx({
			centerX: desiredCenterX,
			centerY: desiredCenterY,
			viewportWidth,
			viewportHeight,
			boxWidth: panMetrics.boxWidth,
			boxHeight: panMetrics.boxHeight,
		});

		updateActiveShotCameraDocument((documentState) => {
			documentState.outputFrame.fitScale = outputFrameDocument.fitScale;
			documentState.outputFrame.fitViewportWidth = viewportWidth;
			documentState.outputFrame.fitViewportHeight = viewportHeight;
			documentState.outputFrame.viewportCenterX =
				clampedCenter.x / viewportWidth;
			documentState.outputFrame.viewportCenterY =
				clampedCenter.y / viewportHeight;
			return documentState;
		});
		updateUi();
	}

	function handleOutputFramePanEnd(event) {
		if (
			!outputFramePanState ||
			event.pointerId !== outputFramePanState.pointerId
		) {
			return;
		}

		clearOutputFramePan();
		commitHistoryTransaction("output-frame.pan");
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

	function startOutputFrameResize(handleKey, event) {
		if (state.mode !== workspacePaneCamera || isZoomToolActive()) {
			return;
		}

		const activeDocument = getActiveShotCameraDocument();
		if (!activeDocument) {
			return;
		}

		const handle = outputFrameResizeHandles[handleKey];
		if (!handle) {
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
		clearOutputFrameAnchorDrag();
		renderBox.classList.add("is-resize-active");

		const metrics = getOutputFrameMetrics(activeDocument);
		const outputFrameDocument = getOutputFrameDocumentState(activeDocument);

		outputFrameResizeState = {
			pointerId: event.pointerId,
			startClientX: event.clientX,
			startClientY: event.clientY,
			handleFactorX: handle.affectsWidth ? handle.x - metrics.anchor.x : 0,
			handleFactorY: handle.affectsHeight ? handle.y - metrics.anchor.y : 0,
			displayScale: metrics.displayScale,
			startWidthScale: outputFrameDocument.widthScale ?? 1,
			startHeightScale: outputFrameDocument.heightScale ?? 1,
			startWidthDistance:
				metrics.boxWidth *
				Math.abs(handle.affectsWidth ? handle.x - metrics.anchor.x : 0),
			startHeightDistance:
				metrics.boxHeight *
				Math.abs(handle.affectsHeight ? handle.y - metrics.anchor.y : 0),
		};
		beginHistoryTransaction("output-frame.resize");
	}

	function handleOutputFrameResizeMove(event) {
		if (
			!outputFrameResizeState ||
			event.pointerId !== outputFrameResizeState.pointerId
		) {
			return;
		}

		const nextWidthScale = resolveOutputFrameResizeScale({
			startDistance: outputFrameResizeState.startWidthDistance,
			pointerDelta: event.clientX - outputFrameResizeState.startClientX,
			handleFactor: outputFrameResizeState.handleFactorX,
			displayScale: outputFrameResizeState.displayScale,
			baseDimension: BASE_RENDER_BOX.width,
			fallbackScale: outputFrameResizeState.startWidthScale,
		});
		const nextHeightScale = resolveOutputFrameResizeScale({
			startDistance: outputFrameResizeState.startHeightDistance,
			pointerDelta: event.clientY - outputFrameResizeState.startClientY,
			handleFactor: outputFrameResizeState.handleFactorY,
			displayScale: outputFrameResizeState.displayScale,
			baseDimension: BASE_RENDER_BOX.height,
			fallbackScale: outputFrameResizeState.startHeightScale,
		});

		updateActiveShotCameraDocument((documentState) => {
			applyOutputFrameResize(documentState, nextWidthScale, nextHeightScale);
			return documentState;
		});
		updateUi();
	}

	function handleOutputFrameResizeEnd(event) {
		if (
			!outputFrameResizeState ||
			event.pointerId !== outputFrameResizeState.pointerId
		) {
			return;
		}

		updateActiveShotCameraDocument((documentState) => {
			const { width, height } = getViewportSize();
			const metrics = getOutputFrameMetrics(documentState);
			const shouldAutoFit =
				metrics.boxWidth > width || metrics.boxHeight > height;
			if (shouldAutoFit) {
				syncOutputFrameFitState(documentState, width, height, true);
			}
			return documentState;
		});
		clearOutputFrameResize();
		commitHistoryTransaction("output-frame.resize");
		updateUi();
	}

	function applyOutputFrameResize(
		documentState,
		nextWidthScale,
		nextHeightScale,
	) {
		const shotCameraId =
			documentState?.id ?? store.workspace.activeShotCameraId.value;
		const shotCameraDocument =
			shotCameraId === store.workspace.activeShotCameraId.value
				? getActiveShotCameraDocument()
				: getShotCameraDocument(shotCameraId);
		const shotCameraEntry =
			shotCameraId === store.workspace.activeShotCameraId.value
				? getActiveShotCameraEntry()
				: shotCameraRegistry.get(shotCameraId);
		const currentMetrics = getOutputFrameMetrics(shotCameraDocument);
		const outputFrameDocument = {
			...getOutputFrameDocumentState(shotCameraDocument),
		};
		const frameCenters = new Map(
			(documentState.frames ?? []).map((frame) => [
				frame.id,
				{
					x: frame.x,
					y: frame.y,
				},
			]),
		);
		const exportSize = getExportSize({
			widthScale: nextWidthScale,
			heightScale: nextHeightScale,
		});
		const clampedWidthScale = exportSize.width / BASE_RENDER_BOX.width;
		const clampedHeightScale = exportSize.height / BASE_RENDER_BOX.height;
		const anchor =
			ANCHORS[outputFrameDocument.anchor ?? state.outputFrame.anchor] ??
			ANCHORS.center;
		const anchorX = currentMetrics.boxLeft + currentMetrics.boxWidth * anchor.x;
		const anchorY = currentMetrics.boxTop + currentMetrics.boxHeight * anchor.y;
		const nextMetricsSeed = getRenderBoxMetrics({
			viewportWidth: currentMetrics.viewportWidth,
			viewportHeight: currentMetrics.viewportHeight,
			exportWidth: exportSize.width,
			exportHeight: exportSize.height,
			viewZoom: outputFrameDocument.viewZoom ?? 1,
			fitScale: outputFrameDocument.fitScale,
			viewportCenterX: outputFrameDocument.viewportCenterX,
			viewportCenterY: outputFrameDocument.viewportCenterY,
			anchorKey: outputFrameDocument.anchor ?? state.outputFrame.anchor,
		});
		const nextMetrics = getRenderBoxMetrics({
			viewportWidth: currentMetrics.viewportWidth,
			viewportHeight: currentMetrics.viewportHeight,
			exportWidth: exportSize.width,
			exportHeight: exportSize.height,
			viewZoom: outputFrameDocument.viewZoom ?? 1,
			fitScale: outputFrameDocument.fitScale,
			viewportCenterX:
				(anchorX + nextMetricsSeed.boxWidth * (0.5 - anchor.x)) /
				currentMetrics.viewportWidth,
			viewportCenterY:
				(anchorY + nextMetricsSeed.boxHeight * (0.5 - anchor.y)) /
				currentMetrics.viewportHeight,
			anchorKey: outputFrameDocument.anchor ?? state.outputFrame.anchor,
		});
		const near = shotCameraEntry?.camera?.near ?? DEFAULT_CAMERA_NEAR;
		const horizontalFovDegrees =
			shotCameraDocument?.lens?.baseFovX ?? getBaseFovX();
		const baseFrustum = getBaseFrustumExtents({
			near,
			horizontalFovDegrees,
		});
		const currentTargetFrustum = getTargetFrustumExtents({
			near,
			horizontalFovDegrees,
			widthScale: outputFrameDocument.widthScale ?? 1,
			heightScale: outputFrameDocument.heightScale ?? 1,
			centerX: outputFrameDocument.centerX,
			centerY: outputFrameDocument.centerY,
		});
		const fixedX =
			currentTargetFrustum.left + currentTargetFrustum.width * anchor.x;
		const fixedY =
			currentTargetFrustum.top - currentTargetFrustum.height * anchor.y;
		const nextWidth = baseFrustum.width * clampedWidthScale;
		const nextHeight = baseFrustum.height * clampedHeightScale;
		const nextCenterXFrustum = fixedX + nextWidth * (0.5 - anchor.x);
		const nextCenterYFrustum = fixedY + nextHeight * (anchor.y - 0.5);

		documentState.outputFrame.widthScale = clampedWidthScale;
		documentState.outputFrame.heightScale = clampedHeightScale;
		documentState.outputFrame.centerX =
			(nextCenterXFrustum - baseFrustum.left) /
			Math.max(baseFrustum.width, 1e-6);
		documentState.outputFrame.centerY =
			(baseFrustum.top - nextCenterYFrustum) /
			Math.max(baseFrustum.height, 1e-6);
		const revealedCenter = clampOutputFrameCenterPx({
			centerX: nextMetrics.boxCenterX,
			centerY: nextMetrics.boxCenterY,
			viewportWidth: currentMetrics.viewportWidth,
			viewportHeight: currentMetrics.viewportHeight,
			boxWidth: nextMetrics.boxWidth,
			boxHeight: nextMetrics.boxHeight,
		});

		documentState.outputFrame.fitScale = outputFrameDocument.fitScale;
		documentState.outputFrame.fitViewportWidth = currentMetrics.viewportWidth;
		documentState.outputFrame.fitViewportHeight = currentMetrics.viewportHeight;
		documentState.outputFrame.viewportCenterX =
			revealedCenter.x / currentMetrics.viewportWidth;
		documentState.outputFrame.viewportCenterY =
			revealedCenter.y / currentMetrics.viewportHeight;

		for (const frame of documentState.frames ?? []) {
			const center = frameCenters.get(frame.id);
			if (!center) {
				continue;
			}

			const remapped = remapPointBetweenRenderBoxes({
				x: center.x,
				y: center.y,
				fromMetrics: currentMetrics,
				toMetrics: nextMetrics,
			});
			const frameAnchor = getFrameAnchorDocument(frame);
			frame.x = resolveFrameAxis(remapped.x);
			frame.y = resolveFrameAxis(remapped.y);

			const remappedAnchor = remapPointBetweenRenderBoxes({
				x: frameAnchor.x,
				y: frameAnchor.y,
				fromMetrics: currentMetrics,
				toMetrics: nextMetrics,
			});
			frame.anchor = resolveFrameAnchor(remappedAnchor, {
				x: frame.x,
				y: frame.y,
			});
		}
	}

	function setBoxWidthPercent(nextValue) {
		runHistoryAction?.("output-frame.width", () => {
			updateActiveShotCameraDocument((documentState) => {
				applyOutputFrameResize(
					documentState,
					Number(nextValue) / 100,
					documentState.outputFrame.heightScale,
				);
				return documentState;
			});
		});
		updateUi();
	}

	function setBoxHeightPercent(nextValue) {
		runHistoryAction?.("output-frame.height", () => {
			updateActiveShotCameraDocument((documentState) => {
				applyOutputFrameResize(
					documentState,
					documentState.outputFrame.widthScale,
					Number(nextValue) / 100,
				);
				return documentState;
			});
		});
		updateUi();
	}

	function setViewZoomFactor(nextZoom) {
		runHistoryAction?.("output-frame.zoom", () => {
			updateActiveShotCameraDocument((documentState) => {
				const { width: viewportWidth, height: viewportHeight } =
					getViewportSize();
				syncOutputFrameFitState(documentState, viewportWidth, viewportHeight);
				documentState.outputFrame.viewZoom = clampViewZoom(nextZoom);
				documentState.outputFrame.viewZoomAuto = false;
				return documentState;
			});
		});
		lastAutoLayoutSignature = "";
		updateUi();
	}

	function setViewZoomPercent(nextValue) {
		setViewZoomFactor(Number(nextValue) / 100);
	}

	function setAnchor(nextValue) {
		selectOutputFrame();
		runHistoryAction?.("output-frame.anchor-preset", () => {
			state.outputFrame.anchor = nextValue;
		});
		updateUi();
	}

	function handleResize() {
		const documentState = getActiveShotCameraDocument();
		const layout = syncAutoWorkbenchLayout(documentState);
		syncAutoViewZoom(documentState, layout);
		const { width, height } = getViewportSize();
		syncOutputFrameFitState(documentState, width, height);
	}

	return {
		clearOutputFramePan,
		clearOutputFrameAnchorDrag,
		clearOutputFrameResize,
		clearOutputFrameSelection,
		selectOutputFrame,
		getOutputFrameDocumentState,
		getOutputSizeState,
		getViewportSize,
		syncOutputFrameFitState,
		getOutputFrameMetrics,
		updateOutputFrameOverlay,
		handleResize,
		setViewZoomFactor,
		setBoxWidthPercent,
		setBoxHeightPercent,
		setViewZoomPercent,
		setAnchor,
		startOutputFramePan,
		handleOutputFramePanMove,
		handleOutputFramePanEnd,
		startOutputFrameAnchorDrag,
		handleOutputFrameAnchorDragMove,
		handleOutputFrameAnchorDragEnd,
		startOutputFrameResize,
		handleOutputFrameResizeMove,
		handleOutputFrameResizeEnd,
		applyOutputFrameResize,
	};
}
