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

export function createBatchSequenceIndexResolver(
	targetDocuments = [],
	resolveFormat = () => "png",
	buildFilename = buildShotCameraExportFilename,
) {
	const baseNameCounts = new Map();
	const documentKeys = new Map();

	for (const documentState of targetDocuments) {
		const format = resolveFormat(documentState);
		const filename = buildFilename(documentState, null, format, null);
		const collisionKey = `${format}:${filename}`;
		documentKeys.set(documentState.id, collisionKey);
		baseNameCounts.set(
			collisionKey,
			(baseNameCounts.get(collisionKey) ?? 0) + 1,
		);
	}

	const collisionIndices = new Map();
	const sequenceIndices = new Map();
	for (const documentState of targetDocuments) {
		const collisionKey = documentKeys.get(documentState.id);
		const collisionCount = baseNameCounts.get(collisionKey) ?? 0;
		if (collisionCount <= 1) {
			sequenceIndices.set(documentState.id, null);
			continue;
		}
		const nextIndex = (collisionIndices.get(collisionKey) ?? 0) + 1;
		collisionIndices.set(collisionKey, nextIndex);
		sequenceIndices.set(documentState.id, nextIndex);
	}

	return (documentState) => sequenceIndices.get(documentState.id) ?? null;
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
		const targetDocuments = getTargetDocuments();
		const resolveSequenceIndex = createBatchSequenceIndexResolver(
			targetDocuments,
			() => "png",
			buildFilename,
		);
		return runPngExportFn({
			targetDocuments,
			renderSnapshot: (documentState) => renderSnapshot(documentState.id),
			downloadSnapshot: (documentState, snapshot, index, targetDocuments) =>
				downloadPngFromSnapshot(
					documentState,
					snapshot,
					resolveSequenceIndex(documentState),
					{
						frames: documentState.frames ?? [],
						frameMaskSettings: documentState.frameMask ?? null,
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
		const targetDocuments = getTargetDocuments();
		const resolveSequenceIndex = createBatchSequenceIndexResolver(
			targetDocuments,
			() => "psd",
			buildFilename,
		);
		return runPsdExportFn({
			targetDocuments,
			renderSnapshot: (documentState) => renderSnapshot(documentState.id),
			downloadSnapshot: (documentState, snapshot, index, targetDocuments) =>
				downloadPsdFromSnapshot(
					documentState,
					snapshot,
					resolveSequenceIndex(documentState),
					{
						frames: documentState.frames ?? [],
						frameMaskSettings: documentState.frameMask ?? null,
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
		const targetDocuments = getTargetDocuments();
		const resolveSequenceIndex = createBatchSequenceIndexResolver(
			targetDocuments,
			(documentState) => getExportSettings(documentState).exportFormat,
			buildFilename,
		);
		return runOutputExportFn({
			targetDocuments,
			getExportSettings,
			renderSnapshot: (documentState, _index, _targets, onProgress) =>
				renderSnapshot(documentState.id, { onProgress }),
			downloadPngSnapshot: (documentState, snapshot) =>
				downloadPngFromSnapshot(
					documentState,
					snapshot,
					resolveSequenceIndex(documentState),
					{
						frames: documentState.frames ?? [],
						frameMaskSettings: documentState.frameMask ?? null,
						drawFramesToContext,
						previewContextError,
						buildFilename,
					},
				),
			downloadPsdSnapshot: (documentState, snapshot) =>
				downloadPsdFromSnapshot(
					documentState,
					snapshot,
					resolveSequenceIndex(documentState),
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
