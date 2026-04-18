import {
	AUTO_VIEW_ZOOM_MARGIN,
	AUTO_WORKBENCH_MIN_SAFE_ZOOM,
	WORKBENCH_GAP_PX,
	WORKBENCH_PANEL_MAX_WIDTH_PX,
	WORKBENCH_RAIL_WIDTH_PX,
	WORKBENCH_SAFE_GUTTER_PX,
	WORKBENCH_STACK_BREAKPOINT_PX,
} from "../../constants.js";
import { clampViewZoom } from "../../engine/projection.js";

export function computeWorkbenchLayoutState({
	viewportWidth,
	viewportHeight,
	shellRect,
	rightRect,
	workbenchCollapsed,
}) {
	const stackedLayout = viewportWidth <= WORKBENCH_STACK_BREAKPOINT_PX;
	let safeWidth = viewportWidth;
	const safeLeft = 0;
	let safeRight = viewportWidth;
	if (!stackedLayout && !workbenchCollapsed) {
		const overlapWidth = rightRect
			? Math.max(0, Number(shellRect?.right ?? 0) - Number(rightRect.left ?? 0))
			: 0;
		const rightInset =
			overlapWidth > 0
				? Math.max(
						0,
						Math.min(viewportWidth, overlapWidth + WORKBENCH_SAFE_GUTTER_PX),
					)
				: 0;
		safeWidth = Math.max(1, viewportWidth - rightInset);
		safeRight = safeWidth;
	}

	return {
		viewportWidth,
		viewportHeight,
		stackedLayout,
		safeWidth,
		safeLeft,
		safeRight,
		safeTop: 0,
		safeBottom: viewportHeight,
		safeHeight: viewportHeight,
	};
}

export function computeWorkbenchAutoCollapseState({
	containerWidth,
	containerHeight,
	exportWidth,
	exportHeight,
	phoneLikeTouchViewport = false,
}) {
	const stableContainerWidth = Math.max(1, Number(containerWidth) || 0);
	const stableContainerHeight = Math.max(1, Number(containerHeight) || 0);
	const panelWidth = Math.min(
		WORKBENCH_PANEL_MAX_WIDTH_PX,
		Math.max(0, stableContainerWidth - WORKBENCH_GAP_PX * 2),
	);
	const expandedViewportWidth =
		stableContainerWidth <= WORKBENCH_STACK_BREAKPOINT_PX
			? stableContainerWidth
			: Math.max(1, stableContainerWidth - panelWidth - WORKBENCH_GAP_PX);
	const collapsedViewportWidth =
		stableContainerWidth <= WORKBENCH_STACK_BREAKPOINT_PX
			? stableContainerWidth
			: Math.max(
					1,
					stableContainerWidth - WORKBENCH_RAIL_WIDTH_PX - WORKBENCH_GAP_PX,
				);
	const expandedFitScale = Math.min(
		expandedViewportWidth / Math.max(exportWidth, 1),
		stableContainerHeight / Math.max(exportHeight, 1),
	);
	const collapsedFitScale = Math.min(
		collapsedViewportWidth / Math.max(exportWidth, 1),
		stableContainerHeight / Math.max(exportHeight, 1),
	);
	const expandedSafeZoom = clampViewZoom(
		(expandedFitScale / Math.max(collapsedFitScale, 1e-6)) *
			AUTO_VIEW_ZOOM_MARGIN,
	);
	const expandedStackedLayout =
		expandedViewportWidth <= WORKBENCH_STACK_BREAKPOINT_PX;

	return {
		panelWidth,
		expandedViewportWidth,
		collapsedViewportWidth,
		expandedStackedLayout,
		expandedSafeZoom,
		shouldAutoCollapse:
			phoneLikeTouchViewport ||
			expandedStackedLayout ||
			expandedSafeZoom < AUTO_WORKBENCH_MIN_SAFE_ZOOM,
	};
}
