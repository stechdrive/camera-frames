export function createInteractionControllerBindings({
	store,
	state,
	viewportShell,
	viewportCanvas,
	assetController,
	fpsMovement,
	pointerControls,
	getActiveCamera,
	getActiveViewportCamera,
	getActiveCameraViewCamera,
	getActiveOutputCamera,
	workspacePaneCamera,
	t,
	setStatus,
	updateUi,
	outputFrameController,
	viewportProjectionController,
	projectionController,
	cameraController,
	historyController,
} = {}) {
	return {
		store,
		state,
		viewportShell,
		viewportCanvas,
		assetController,
		fpsMovement,
		pointerControls,
		getActiveCamera,
		getActiveViewportCamera,
		getActiveCameraViewCamera,
		getActiveOutputCamera,
		workspacePaneCamera,
		t,
		setStatus,
		updateUi,
		getViewZoomFactor: () => state.outputFrame.viewZoom,
		setViewZoomFactor: (nextZoom) =>
			outputFrameController.setViewZoomFactor(nextZoom),
		getShotCameraBaseFovX: () => state.baseFovX,
		setShotCameraBaseFovXLive: (nextValue) => {
			state.baseFovX = Number(nextValue);
			updateUi();
		},
		getViewportBaseFovX: () => state.viewportBaseFovX,
		setViewportBaseFovXLive: (nextValue) => {
			state.viewportBaseFovX = Number(nextValue);
			state.viewportBaseFovXDirty = true;
			updateUi();
		},
		isViewportOrthographic: () =>
			viewportProjectionController?.isViewportOrthographic?.() ?? false,
		panViewportOrthographic: (deltaPxX, deltaPxY) =>
			viewportProjectionController?.panViewportOrthographic?.(
				deltaPxX,
				deltaPxY,
			) ?? false,
		zoomViewportOrthographic: (deltaY, options) =>
			viewportProjectionController?.zoomViewportOrthographic?.(
				deltaY,
				options,
			) ?? false,
		offsetViewportOrthographicDepth: (deltaY, options) =>
			viewportProjectionController?.offsetViewportOrthographicDepth?.(
				deltaY,
				options,
			) ?? false,
		ensurePerspectiveForViewportRotation: () =>
			viewportProjectionController?.ensurePerspectiveForViewportRotation?.() ??
			false,
		setViewportTransientReferencePoint: (point, options) =>
			viewportProjectionController?.setViewportTransientReferencePoint?.(
				point,
				options,
			) ?? false,
		getShotCameraRollAxisWorld: () =>
			projectionController?.getShotCameraRollAxisWorld?.() ?? null,
		getShotCameraRollAngleDegrees: () =>
			projectionController?.getShotCameraRollAngleDegrees?.() ?? 0,
		applyActiveShotCameraRoll: (...args) =>
			cameraController?.applyActiveShotCameraRoll?.(...args),
		beginHistoryTransaction: (label) =>
			historyController?.beginHistoryTransaction(label),
		commitHistoryTransaction: (label) =>
			historyController?.commitHistoryTransaction(label),
		cancelHistoryTransaction: () =>
			historyController?.cancelHistoryTransaction(),
	};
}
