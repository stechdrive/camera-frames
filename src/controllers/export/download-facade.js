import {
	ANIMATION_EXPORT_FRAME_SOURCE_DURATION,
	ANIMATION_EXPORT_MODE_CURRENT,
	ANIMATION_EXPORT_MODE_SEQUENCE,
	ANIMATION_EXPORT_MODE_VIDEO,
	resolveAnimationExportFrames,
	sanitizeAnimationExportFrameSource,
	sanitizeAnimationExportMode,
} from "../../animation/animation-export.js";

function stripFileExtension(filename) {
	const value = String(filename ?? "camera-frames");
	const dotIndex = value.lastIndexOf(".");
	return dotIndex > 0 ? value.slice(0, dotIndex) : value;
}

function padFrameNumber(frame) {
	return String(Math.round(Number(frame) || 0)).padStart(4, "0");
}

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

export function buildShotCameraFrameExportFilename(
	documentState,
	snapshot,
	format,
	sequenceIndex,
	frame,
	{ buildFilename } = {},
) {
	const filename = buildFilename(
		documentState,
		snapshot,
		format,
		sequenceIndex,
	);
	return `${stripFileExtension(filename)}-f${padFrameNumber(frame)}.${format}`;
}

export function buildShotCameraVideoExportFilename(
	documentState,
	snapshot,
	sequenceIndex,
	{ buildFilename } = {},
) {
	const filename = buildFilename(
		documentState,
		snapshot,
		"webm",
		sequenceIndex,
	);
	return `${stripFileExtension(filename)}.webm`;
}

export function buildAnimationArchiveFilename(
	targetDocuments = [],
	archiveKind = "sequence",
	buildFilename = buildShotCameraExportFilename,
) {
	if (targetDocuments.length === 1) {
		return `${stripFileExtension(
			buildFilename(targetDocuments[0], null, "zip", null),
		)}-${archiveKind}.zip`;
	}
	return `camera-frames-${archiveKind}.zip`;
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
	getExportMode = () => ANIMATION_EXPORT_MODE_CURRENT,
	getExportFrameSource = () => ANIMATION_EXPORT_FRAME_SOURCE_DURATION,
	getAnimationDocument = () => null,
	getVideoExportFps = () => 24,
	isVideoExportSupported = () => false,
	renderSnapshot,
	downloadPngFromSnapshot,
	downloadPsdFromSnapshot,
	createPngBlobFromSnapshot,
	createPsdBlobFromSnapshot,
	createZipBlob,
	downloadBlob,
	createWebmFromFrameRenderer,
	renderCompositeOutputCanvas,
	drawFramesToContext,
	previewContextError,
	buildFilename,
	buildPsdExportDocument,
	setExportStatus,
	setSummary,
	setStatus,
	updateUi,
	beginExportRun = () => null,
	finishExportRun = () => {},
	clearExportOverlay,
	showExportErrorOverlay,
	setExportProgressOverlay,
	getPhaseDefaultDetail,
	requireTargetsMessage,
	t,
	runPngExportFn,
	runPsdExportFn,
	runOutputExportFn,
	runFrameSequenceExportFn,
	runVideoExportFn,
} = {}) {
	async function withExportRun(callback) {
		const abortSignal = beginExportRun?.() ?? null;
		try {
			return await callback(abortSignal);
		} finally {
			finishExportRun?.(abortSignal);
		}
	}

	async function downloadPng() {
		return withExportRun((abortSignal) => {
			const targetDocuments = getTargetDocuments();
			const resolveSequenceIndex = createBatchSequenceIndexResolver(
				targetDocuments,
				() => "png",
				buildFilename,
			);
			return runPngExportFn({
				targetDocuments,
				renderSnapshot: (documentState) => renderSnapshot(documentState.id),
				downloadSnapshot: (documentState, snapshot) =>
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
				abortSignal,
			});
		});
	}

	async function downloadPsd() {
		return withExportRun((abortSignal) => {
			const targetDocuments = getTargetDocuments();
			const resolveSequenceIndex = createBatchSequenceIndexResolver(
				targetDocuments,
				() => "psd",
				buildFilename,
			);
			return runPsdExportFn({
				targetDocuments,
				renderSnapshot: (documentState) => renderSnapshot(documentState.id),
				downloadSnapshot: (documentState, snapshot) =>
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
				abortSignal,
			});
		});
	}

	async function downloadOutput() {
		return withExportRun((abortSignal) => {
			const targetDocuments = getTargetDocuments();
			const exportMode = sanitizeAnimationExportMode(getExportMode());
			const exportFrameSource = sanitizeAnimationExportFrameSource(
				getExportFrameSource(),
			);
			if (exportMode === ANIMATION_EXPORT_MODE_SEQUENCE) {
				const animationFrames = resolveAnimationExportFrames(
					getAnimationDocument(),
					{ frameSource: exportFrameSource },
				);
				const resolveSequenceIndex = createBatchSequenceIndexResolver(
					targetDocuments,
					(documentState) => getExportSettings(documentState).exportFormat,
					buildFilename,
				);
				return runFrameSequenceExportFn({
					targetDocuments,
					frames: animationFrames,
					getExportSettings,
					renderSnapshot: (
						documentState,
						timelineFrame,
						_index,
						_targets,
						onProgress,
					) => renderSnapshot(documentState.id, { timelineFrame, onProgress }),
					createSnapshotBlob: (documentState, snapshot, exportFormat) =>
						exportFormat === "png"
							? createPngBlobFromSnapshot(
									snapshot,
									documentState.frames ?? [],
									{
										drawFramesToContext,
										previewContextError,
									},
								)
							: createPsdBlobFromSnapshot(documentState, snapshot, {
									frames: documentState.frames ?? [],
									drawFramesToContext,
									previewContextError,
									buildPsdExportDocument,
								}),
					buildEntryPath: (
						documentState,
						snapshot,
						exportFormat,
						timelineFrame,
					) =>
						buildShotCameraFrameExportFilename(
							documentState,
							snapshot,
							exportFormat,
							resolveSequenceIndex(documentState),
							timelineFrame,
							{ buildFilename },
						),
					createArchiveBlob: createZipBlob,
					downloadArchive: (archiveBlob, filename) =>
						downloadBlob(archiveBlob, filename),
					archiveFilename: buildAnimationArchiveFilename(
						targetDocuments,
						"sequence",
						buildFilename,
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
					requireFramesMessage: t("error.exportRequiresAnimationFrames"),
					t,
					abortSignal,
				});
			}
			if (exportMode === ANIMATION_EXPORT_MODE_VIDEO) {
				const animationFrames = resolveAnimationExportFrames(
					getAnimationDocument(),
					{ frameSource: exportFrameSource },
				);
				const resolveSequenceIndex = createBatchSequenceIndexResolver(
					targetDocuments,
					() => "webm",
					buildFilename,
				);
				return runVideoExportFn({
					targetDocuments,
					frames: animationFrames,
					fps: getVideoExportFps(),
					isVideoSupported: isVideoExportSupported,
					renderSnapshot: (
						documentState,
						timelineFrame,
						_index,
						_targets,
						onProgress,
					) =>
						renderSnapshot(documentState.id, {
							timelineFrame,
							onProgress,
							exportSettingsOverride: {
								exportFormat: "png",
								exportModelLayers: false,
								exportSplatLayers: false,
							},
						}),
					renderVideoFrame: (documentState, snapshot) =>
						renderCompositeOutputCanvas(snapshot, documentState.frames ?? [], {
							drawFramesToContext,
							previewContextError,
						}),
					createVideoBlob: createWebmFromFrameRenderer,
					buildVideoFilename: (documentState, _snapshot, sequenceIndex) =>
						buildShotCameraVideoExportFilename(
							documentState,
							null,
							sequenceIndex ?? resolveSequenceIndex(documentState),
							{ buildFilename },
						),
					createArchiveBlob: createZipBlob,
					downloadArchive: (archiveBlob, filename) =>
						downloadBlob(archiveBlob, filename),
					downloadVideo: (videoBlob, filename) =>
						downloadBlob(videoBlob, filename),
					archiveFilename: buildAnimationArchiveFilename(
						targetDocuments,
						"video",
						buildFilename,
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
					requireFramesMessage: t("error.exportRequiresAnimationFrames"),
					videoUnsupportedMessage: t("error.videoExportUnsupported"),
					t,
					abortSignal,
				});
			}
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
				abortSignal,
			});
		});
	}

	return {
		downloadPng,
		downloadPsd,
		downloadOutput,
	};
}
