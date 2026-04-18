import { VIEWPORT_PIXEL_RATIO } from "../../constants.js";
import { drawFramesToContext } from "../../engine/frame-overlay.js";

export function createOutputFrameOverlayRenderer({
	store,
	state,
	t,
	getAnchorLabel,
	currentLocale,
	viewportShell,
	frameOverlayCanvas,
	renderBox,
	renderBoxMeta,
	anchorDot,
	getActiveShotCameraDocument,
	getActiveFrames,
	isFrameSelectionActive,
	getOutputFrameMetrics,
	getFrameOverlayCanvasOffset,
}) {
	let lastOverlaySignature = "";
	let lastOverlayFrames = null;

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
				selectedStrokeStyle: "rgba(255, 182, 170, 0.98)",
			},
		);
		context.setTransform(1, 0, 0, 1, 0, 0);
	}

	function updateOutputFrameOverlay() {
		const metrics = getOutputFrameMetrics();
		const frames = getActiveFrames();
		const frameSelectionActive = isFrameSelectionActive();
		const selectedIds = frameSelectionActive
			? (store.frames.selectedIds.value ?? [])
			: [];
		const activeFrameId = frameSelectionActive
			? (getActiveShotCameraDocument()?.activeFrameId ?? null)
			: null;

		const signature = `${metrics.boxLeft}|${metrics.boxTop}|${metrics.boxWidth}|${metrics.boxHeight}|${metrics.exportWidth}|${metrics.exportHeight}|${state.outputFrame.anchor}|${frameSelectionActive}|${activeFrameId}|${selectedIds.join(",")}`;
		if (signature === lastOverlaySignature && frames === lastOverlayFrames) {
			return;
		}
		lastOverlaySignature = signature;
		lastOverlayFrames = frames;

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

	return {
		renderViewportFrameOverlay,
		updateOutputFrameOverlay,
	};
}
