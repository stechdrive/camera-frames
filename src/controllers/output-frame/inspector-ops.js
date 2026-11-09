import { BASE_RENDER_BOX } from "../../constants.js";
import {
	clampOutputFrameScaleFactor,
	clampViewZoom,
} from "../../engine/projection.js";

function getPixelScalePercent(nextValue, baseDimension) {
	if (typeof nextValue !== "string" && typeof nextValue !== "number") {
		return null;
	}
	const text = String(nextValue).normalize("NFKC").trim();
	if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text)) {
		return null;
	}
	const pixels = Number(text);
	if (!Number.isFinite(pixels)) {
		return null;
	}
	return (
		clampOutputFrameScaleFactor(
			Math.round(pixels) / baseDimension,
			baseDimension,
		) * 100
	);
}

export function createOutputFrameInspectorOps({
	runHistoryAction,
	updateUi,
	getActiveShotCameraDocument,
	updateActiveShotCameraDocument,
	getViewportSize,
	syncOutputFrameFitState,
	applyOutputFrameResize,
	selectOutputFrame,
	handleResize,
	invalidateAutoLayoutSignature,
	invalidateFitLayoutSignature,
	setOutputFrameAnchor = () => {},
}) {
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

	function setBoxWidthPixels(nextValue) {
		const percent = getPixelScalePercent(nextValue, BASE_RENDER_BOX.width);
		if (percent !== null) {
			setBoxWidthPercent(percent);
		}
	}

	function setBoxHeightPixels(nextValue) {
		const percent = getPixelScalePercent(nextValue, BASE_RENDER_BOX.height);
		if (percent !== null) {
			setBoxHeightPercent(percent);
		}
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
		invalidateAutoLayoutSignature();
		updateUi();
	}

	function setViewZoomPercent(nextValue) {
		setViewZoomFactor(Number(nextValue) / 100);
	}

	function canFitOutputFrameToSafeArea(
		documentState = getActiveShotCameraDocument(),
	) {
		const outputFrame = documentState?.outputFrame;
		return Boolean(
			outputFrame &&
				(outputFrame.viewZoomAuto === false ||
					outputFrame.viewportCenterAuto === false),
		);
	}

	function fitOutputFrameToSafeArea() {
		const activeDocument = getActiveShotCameraDocument();
		if (!activeDocument?.outputFrame) {
			return;
		}

		runHistoryAction?.("output-frame.fit-view", () => {
			updateActiveShotCameraDocument((documentState) => {
				documentState.outputFrame.viewZoomAuto = true;
				documentState.outputFrame.viewportCenterAuto = true;
				return documentState;
			});
		});
		invalidateAutoLayoutSignature();
		invalidateFitLayoutSignature();
		handleResize();
		updateUi();
	}

	function setAnchor(nextValue) {
		selectOutputFrame();
		runHistoryAction?.("output-frame.anchor-preset", () => {
			setOutputFrameAnchor(nextValue);
		});
		updateUi();
	}

	return {
		setBoxWidthPercent,
		setBoxHeightPercent,
		setBoxWidthPixels,
		setBoxHeightPixels,
		setViewZoomFactor,
		setViewZoomPercent,
		canFitOutputFrameToSafeArea,
		fitOutputFrameToSafeArea,
		setAnchor,
	};
}
