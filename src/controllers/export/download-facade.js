export function buildShotCameraExportFilename(
	documentState,
	_snapshot,
	format = "png",
	sequenceIndex = null,
	{ shotCameras, getShotCameraExportBaseName } = {},
) {
	const fallbackIndex =
		shotCameras.findIndex((shotCamera) => shotCamera.id === documentState?.id) +
		1;
	const baseName = getShotCameraExportBaseName(documentState, fallbackIndex);
	const sequenceSuffix =
		Number.isFinite(sequenceIndex) && sequenceIndex > 0
			? `-${String(sequenceIndex).padStart(2, "0")}`
			: "";
	return `${baseName}${sequenceSuffix}.${format}`;
}

export function createPsdExportDocumentBuilder({
	getFrames,
	t,
	exportDebugLayersEnabled,
	createCanvasFromPixels,
	renderExportPassToCanvas,
	buildPsdDocument,
} = {}) {
	return function buildPsdExportDocument(bundle, frames = getFrames()) {
		return buildPsdDocument(bundle, frames, {
			groupLabel: t("section.referenceImages"),
			frameGroupLabel: t("section.frames"),
			exportDebugLayersEnabled,
			createCanvasFromPixels,
			renderExportPassToCanvas,
		});
	};
}

export function createExportBundleFacade({
	getFrames,
	drawFramesToContext,
	previewContextError,
	buildSnapshotExportBundle: buildSnapshotExportBundleFn,
	renderCompositeOutputCanvas: renderCompositeOutputCanvasFn,
} = {}) {
	return {
		buildExportBundle(snapshot, frames = getFrames()) {
			return buildSnapshotExportBundleFn(snapshot, frames, {
				drawFramesToContext,
				previewContextError,
			});
		},
		renderCompositeOutputCanvas(snapshot, frames = getFrames()) {
			return renderCompositeOutputCanvasFn(snapshot, frames, {
				drawFramesToContext,
				previewContextError,
			});
		},
	};
}

export function createExportDownloadFacade({
	getTargetDocuments,
	getExportSettings,
	renderSnapshot,
	downloadPngFromSnapshot,
	downloadPsdFromSnapshot,
	drawFramesToContext,
	previewContextError,
	buildFilename,
	buildPsdExportDocument,
	setExportStatus,
	setSummary,
	setStatus,
	updateUi,
	clearExportOverlay,
	showExportErrorOverlay,
	setExportProgressOverlay,
	getPhaseDefaultDetail,
	requireTargetsMessage,
	t,
	runPngExportFn,
	runPsdExportFn,
	runOutputExportFn,
} = {}) {
	async function downloadPng() {
		return runPngExportFn({
			targetDocuments: getTargetDocuments(),
			renderSnapshot: (documentState) => renderSnapshot(documentState.id),
			downloadSnapshot: (documentState, snapshot, index, targetDocuments) =>
				downloadPngFromSnapshot(
					documentState,
					snapshot,
					targetDocuments.length > 1 ? index + 1 : null,
					{
						frames: documentState.frames ?? [],
						drawFramesToContext,
						previewContextError,
						buildFilename,
					},
				),
			setExportStatus,
			setSummary,
			setStatus,
			updateUi,
			requireTargetsMessage,
			t,
		});
	}

	async function downloadPsd() {
		return runPsdExportFn({
			targetDocuments: getTargetDocuments(),
			renderSnapshot: (documentState) => renderSnapshot(documentState.id),
			downloadSnapshot: (documentState, snapshot, index, targetDocuments) =>
				downloadPsdFromSnapshot(
					documentState,
					snapshot,
					targetDocuments.length > 1 ? index + 1 : null,
					{
						frames: documentState.frames ?? [],
						drawFramesToContext,
						previewContextError,
						buildFilename,
						buildPsdExportDocument,
					},
				),
			setExportStatus,
			setSummary,
			setStatus,
			updateUi,
			requireTargetsMessage,
			t,
		});
	}

	async function downloadOutput() {
		return runOutputExportFn({
			targetDocuments: getTargetDocuments(),
			getExportSettings,
			renderSnapshot: (documentState, _index, _targets, onProgress) =>
				renderSnapshot(documentState.id, { onProgress }),
			downloadPngSnapshot: (documentState, snapshot, sequenceIndex) =>
				downloadPngFromSnapshot(documentState, snapshot, sequenceIndex, {
					frames: documentState.frames ?? [],
					drawFramesToContext,
					previewContextError,
					buildFilename,
				}),
			downloadPsdSnapshot: (documentState, snapshot, sequenceIndex) =>
				downloadPsdFromSnapshot(documentState, snapshot, sequenceIndex, {
					frames: documentState.frames ?? [],
					drawFramesToContext,
					previewContextError,
					buildFilename,
					buildPsdExportDocument,
				}),
			setExportStatus,
			setSummary,
			setStatus,
			updateUi,
			clearExportOverlay,
			showExportErrorOverlay,
			setExportProgressOverlay,
			getPhaseDefaultDetail,
			requireTargetsMessage,
			t,
		});
	}

	return {
		downloadPng,
		downloadPsd,
		downloadOutput,
	};
}
