import {
	clampOutputFrameCenterPx,
	clampViewZoom,
	getRenderBoxMetrics,
} from "../../engine/projection.js";
import { AUTO_VIEW_ZOOM_MARGIN } from "../../constants.js";
import { computeWorkbenchAutoCollapseState } from "./layout-compute.js";

export function createOutputFrameFitStateController({
	store,
	getActiveShotCameraDocument,
	updateActiveShotCameraDocument,
	getOutputFrameDocumentState,
	getOutputSizeState,
	getViewportSize,
	getWorkbenchContainerSize,
	getWorkbenchLayoutState,
	isPhoneLikeTouchViewport,
}) {
	let lastAutoLayoutSignature = "";
	let lastFitLayoutSignature = "";

	function getFitLayoutSignature(documentState, width, height, layout) {
		return [
			documentState?.id ?? "active",
			width,
			height,
			layout.safeLeft,
			layout.safeRight,
			layout.safeTop,
			layout.safeBottom,
			layout.safeWidth,
			layout.safeHeight,
			store.workbenchCollapsed.value ? "collapsed" : "expanded",
		].join("|");
	}

	function resolveAutoLayout(documentState) {
		const exportSize = getOutputSizeState(documentState);
		const { width: containerWidth, height: containerHeight } =
			getWorkbenchContainerSize();
		const phoneLikeTouchViewport = isPhoneLikeTouchViewport(containerWidth);
		const autoCollapseState = computeWorkbenchAutoCollapseState({
			containerWidth,
			containerHeight,
			exportWidth: exportSize.width,
			exportHeight: exportSize.height,
			phoneLikeTouchViewport,
		});
		const { viewportWidth, viewportHeight, safeWidth, safeHeight } =
			getWorkbenchLayoutState();
		const fitScale = Math.min(
			viewportWidth / exportSize.width,
			viewportHeight / exportSize.height,
		);
		const shouldAutoCollapse = autoCollapseState.shouldAutoCollapse;

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
		const layout = getWorkbenchLayoutState();
		const fitLayoutSignature = getFitLayoutSignature(
			documentState,
			width,
			height,
			layout,
		);
		const needsFitSync =
			force ||
			fitLayoutSignature !== lastFitLayoutSignature ||
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
		const desiredCenter = {
			x:
				outputFrameDocument.viewportCenterAuto !== false
					? (layout.safeLeft + layout.safeRight) * 0.5
					: metrics.boxCenterX,
			y:
				outputFrameDocument.viewportCenterAuto !== false
					? (layout.safeTop + layout.safeBottom) * 0.5
					: metrics.boxCenterY,
		};
		const clampedCenter = clampOutputFrameCenterPx({
			centerX: desiredCenter.x,
			centerY: desiredCenter.y,
			viewportWidth: width,
			viewportHeight: height,
			boxWidth: metrics.boxWidth,
			boxHeight: metrics.boxHeight,
			safeLeft: layout.safeLeft,
			safeRight: layout.safeRight,
			safeTop: layout.safeTop,
			safeBottom: layout.safeBottom,
		});

		outputFrameDocument.fitScale = metrics.fitScale;
		outputFrameDocument.fitViewportWidth = width;
		outputFrameDocument.fitViewportHeight = height;
		outputFrameDocument.viewportCenterX = clampedCenter.x / width;
		outputFrameDocument.viewportCenterY = clampedCenter.y / height;
		outputFrameDocument.viewportCenterAuto =
			outputFrameDocument.viewportCenterAuto !== false;
		lastFitLayoutSignature = fitLayoutSignature;
		return outputFrameDocument;
	}

	function getOutputFrameMetrics(
		documentState = getActiveShotCameraDocument(),
	) {
		let nextDocumentState = documentState;
		const layout = syncAutoWorkbenchLayout(nextDocumentState);
		const zoomChanged = syncAutoViewZoom(nextDocumentState, layout);
		if (zoomChanged) {
			nextDocumentState = getActiveShotCameraDocument() ?? nextDocumentState;
		}
		const { width, height } = getViewportSize();
		const outputFrameDocument = syncOutputFrameFitState(
			nextDocumentState,
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

	function handleResize() {
		let documentState = getActiveShotCameraDocument();
		const layout = syncAutoWorkbenchLayout(documentState);
		const zoomChanged = syncAutoViewZoom(documentState, layout);
		if (zoomChanged) {
			documentState = getActiveShotCameraDocument() ?? documentState;
		}
		const { width, height } = getViewportSize();
		syncOutputFrameFitState(documentState, width, height);
	}

	function invalidateAutoLayoutSignature() {
		lastAutoLayoutSignature = "";
	}

	function invalidateFitLayoutSignature() {
		lastFitLayoutSignature = "";
	}

	return {
		resolveAutoLayout,
		syncAutoWorkbenchLayout,
		syncAutoViewZoom,
		syncOutputFrameFitState,
		getOutputFrameMetrics,
		handleResize,
		invalidateAutoLayoutSignature,
		invalidateFitLayoutSignature,
	};
}
