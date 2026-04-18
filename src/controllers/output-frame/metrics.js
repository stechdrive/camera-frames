import { getExportSize } from "../../engine/projection.js";
import { computeWorkbenchLayoutState } from "./layout-compute.js";

export function createOutputFrameMetricsController({
	store,
	viewportShell,
	workbenchRightColumn,
	renderBox,
	getActiveShotCameraDocument,
}) {
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

	function getWorkbenchContainerSize() {
		const containerElement = viewportShell.parentElement;
		return {
			width: Math.max(
				containerElement?.clientWidth ?? viewportShell.clientWidth,
				1,
			),
			height: Math.max(
				containerElement?.clientHeight ?? viewportShell.clientHeight,
				1,
			),
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

	return {
		getOutputFrameDocumentState,
		getFrameOverlayCanvasOffset,
		getOutputSizeState,
		getViewportSize,
		getWorkbenchContainerSize,
		getWorkbenchLayoutState,
		isPhoneLikeTouchViewport,
	};
}
