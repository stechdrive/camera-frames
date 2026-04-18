import { clampViewZoom } from "../../engine/projection.js";

export function createOutputFrameInspectorOps({
	state,
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
			state.outputFrame.anchor = nextValue;
		});
		updateUi();
	}

	return {
		setBoxWidthPercent,
		setBoxHeightPercent,
		setViewZoomFactor,
		setViewZoomPercent,
		canFitOutputFrameToSafeArea,
		fitOutputFrameToSafeArea,
		setAnchor,
	};
}
