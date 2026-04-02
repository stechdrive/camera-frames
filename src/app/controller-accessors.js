export function createControllerAccessors({
	getCameraController,
	getFrameController,
	getOutputFrameController,
	getSceneFramingController,
} = {}) {
	return {
		registerShotCameraDocuments() {
			return getCameraController().registerShotCameraDocuments();
		},
		getActiveShotCameraEntry() {
			return getCameraController().getActiveShotCameraEntry();
		},
		getShotCameraDocument(shotCameraId) {
			return getCameraController().getShotCameraDocument(shotCameraId);
		},
		getActiveShotCameraDocument() {
			return getCameraController().getActiveShotCameraDocument();
		},
		updateActiveShotCameraDocument(updateDocument) {
			return getCameraController().updateActiveShotCameraDocument(
				updateDocument,
			);
		},
		setShotCameraDocuments(nextDocuments) {
			return getCameraController().setShotCameraDocuments(nextDocuments);
		},
		getShotCameraExportBaseName(documentState, fallbackIndex = 1) {
			return getCameraController().getShotCameraExportBaseName(
				documentState,
				fallbackIndex,
			);
		},
		getActiveFrames() {
			return getFrameController().getActiveFrames();
		},
		resolveFrameAxis(value) {
			return getFrameController().resolveFrameAxis(value);
		},
		resolveFrameAnchor(value, fallback = null) {
			return getFrameController().resolveFrameAnchor(value, fallback);
		},
		getFrameAnchorDocument(frame) {
			return getFrameController().getFrameAnchorDocument(frame);
		},
		isFrameSelectionActive() {
			return getFrameController().isFrameSelectionActive();
		},
		clearFrameDrag() {
			return getFrameController().clearFrameDrag();
		},
		clearFrameSelection() {
			return getFrameController().clearFrameSelection();
		},
		clearOutputFramePan() {
			return getOutputFrameController().clearOutputFramePan();
		},
		clearOutputFrameAnchorDrag() {
			return getOutputFrameController().clearOutputFrameAnchorDrag();
		},
		clearOutputFrameResize() {
			return getOutputFrameController().clearOutputFrameResize();
		},
		selectOutputFrame() {
			return getOutputFrameController().selectOutputFrame();
		},
		clearOutputFrameSelection() {
			return getOutputFrameController().clearOutputFrameSelection();
		},
		getActiveShotCamera() {
			return getCameraController().getActiveShotCamera();
		},
		getActiveCameraViewCamera() {
			return getCameraController().getActiveCameraViewCamera();
		},
		getActiveOutputCamera() {
			return getCameraController().getActiveOutputCamera();
		},
		getAutoClipRange(camera) {
			return getSceneFramingController().getAutoClipRange(camera);
		},
		updateShotCameraHelpers() {
			return getCameraController().updateShotCameraHelpers();
		},
		syncShotCameraEntryFromDocument(entry) {
			return getCameraController().syncShotCameraEntryFromDocument(entry);
		},
		syncActiveShotCameraFromDocument() {
			return getCameraController().syncActiveShotCameraFromDocument();
		},
	};
}

export function createShotCameraEditorStateAccessors({
	getShotCameraEditorStateController,
} = {}) {
	return {
		captureActiveShotCameraEditorState() {
			return getShotCameraEditorStateController().captureActiveShotCameraEditorState();
		},
		storeShotCameraEditorState(shotCameraId = null) {
			return getShotCameraEditorStateController().storeShotCameraEditorState(
				shotCameraId,
			);
		},
		clearActiveShotCameraEditorState() {
			return getShotCameraEditorStateController().clearActiveShotCameraEditorState();
		},
		restoreShotCameraEditorState(
			shotCameraId,
			{ fallbackSnapshot = null } = {},
		) {
			return getShotCameraEditorStateController().restoreShotCameraEditorState(
				shotCameraId,
				{
					fallbackSnapshot,
				},
			);
		},
		captureShotCameraEditorStates() {
			return getShotCameraEditorStateController().captureShotCameraEditorStates();
		},
		restoreShotCameraEditorStates(editorStates = null) {
			return getShotCameraEditorStateController().restoreShotCameraEditorStates(
				editorStates,
			);
		},
		pruneShotCameraEditorStates() {
			return getShotCameraEditorStateController().pruneShotCameraEditorStates();
		},
		prepareForShotCameraSwitch(currentShotCameraId) {
			return getShotCameraEditorStateController().prepareForShotCameraSwitch(
				currentShotCameraId,
			);
		},
		restoreAfterShotCameraSwitch(nextShotCameraId) {
			return getShotCameraEditorStateController().restoreAfterShotCameraSwitch(
				nextShotCameraId,
			);
		},
	};
}
