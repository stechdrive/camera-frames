import { isExportAbortError, throwIfExportAborted } from "./cancel.js";

function buildWritePhaseState(
	currentPhaseState,
	exportFormat,
	t,
	getPhaseDefaultDetail,
) {
	if (!currentPhaseState?.definitions?.length) {
		return currentPhaseState;
	}

	const completedIds = new Set(currentPhaseState.completedIds ?? []);
	const writePhaseIndex = currentPhaseState.definitions.findIndex(
		(phase) => phase.id === "write",
	);
	if (writePhaseIndex > 0) {
		for (const phase of currentPhaseState.definitions.slice(
			0,
			writePhaseIndex,
		)) {
			completedIds.add(phase.id);
		}
	}
	const activeId =
		writePhaseIndex >= 0
			? currentPhaseState.definitions[writePhaseIndex].id
			: null;
	return {
		...currentPhaseState,
		id: activeId,
		activeId,
		label:
			writePhaseIndex >= 0
				? currentPhaseState.definitions[writePhaseIndex].label
				: "",
		detail: getPhaseDefaultDetail("write", exportFormat, t),
		completedIds,
	};
}

function defaultWaitForWritePhasePaint() {
	return new Promise((resolve) => {
		let settled = false;
		let timeoutId = null;
		const finish = () => {
			if (settled) {
				return;
			}
			settled = true;
			if (timeoutId !== null) {
				globalThis.clearTimeout(timeoutId);
			}
			resolve();
		};
		const raf = globalThis.requestAnimationFrame;
		timeoutId = globalThis.setTimeout(finish, 120);
		if (typeof raf === "function") {
			raf(() => raf(finish));
			return;
		}
		globalThis.setTimeout(finish, 0);
	});
}

function applyExportError(
	error,
	{
		setSummary,
		setExportStatus,
		setStatus,
		showExportError = null,
		clearExportOverlay = null,
		updateUi = null,
		t = null,
	},
) {
	if (isExportAbortError(error)) {
		const summary = t?.("exportSummary.cancelled") ?? error.message;
		const status = t?.("status.exportCancelled") ?? error.message;
		setSummary(summary);
		setExportStatus("export.idle");
		setStatus(status);
		clearExportOverlay?.();
		updateUi?.();
		return;
	}
	console.error(error);
	setSummary(error.message);
	setExportStatus("export.idle");
	setStatus(error.message);
	showExportError?.(error);
}

function padFrameNumber(frame) {
	return String(Math.round(Number(frame) || 0)).padStart(4, "0");
}

function buildFrameProgressItems(targetDocuments = [], frames = []) {
	return targetDocuments.flatMap((documentState) =>
		frames.map((frame) => ({
			...documentState,
			id: `${documentState.id}:frame:${frame}`,
			name: `${documentState.name} / ${padFrameNumber(frame)}`,
			sourceDocument: documentState,
			timelineFrame: frame,
		})),
	);
}

export async function runPngExport({
	targetDocuments,
	renderSnapshot,
	downloadSnapshot,
	setExportStatus,
	setSummary,
	setStatus,
	updateUi,
	requireTargetsMessage,
	t,
	abortSignal = null,
} = {}) {
	setExportStatus("export.exporting", true);

	try {
		throwIfExportAborted(abortSignal);
		if (targetDocuments.length === 0) {
			throw new Error(requireTargetsMessage);
		}

		let lastSnapshot = null;

		for (const [index, documentState] of targetDocuments.entries()) {
			throwIfExportAborted(abortSignal);
			const snapshot = await renderSnapshot(
				documentState,
				index,
				targetDocuments,
			);
			throwIfExportAborted(abortSignal);
			downloadSnapshot(documentState, snapshot, index, targetDocuments);
			lastSnapshot = snapshot;
		}

		if (targetDocuments.length === 1 && lastSnapshot) {
			setSummary(
				t("exportSummary.exported", {
					width: lastSnapshot.width,
					height: lastSnapshot.height,
				}),
			);
			setStatus(t("status.pngExported"));
		} else {
			setSummary(
				t("exportSummary.exportedBatch", {
					count: targetDocuments.length,
				}),
			);
			setStatus(
				t("status.pngExportedBatch", {
					count: targetDocuments.length,
				}),
			);
		}
		setExportStatus("export.ready");
		updateUi();
	} catch (error) {
		applyExportError(error, {
			setSummary,
			setExportStatus,
			setStatus,
			updateUi,
			t,
		});
	}
}

export async function runFrameSequenceExport({
	targetDocuments,
	frames,
	getExportSettings,
	renderSnapshot,
	createSnapshotBlob,
	buildEntryPath,
	createArchiveBlob,
	downloadArchive,
	archiveFilename,
	setExportStatus,
	setSummary,
	setStatus,
	updateUi,
	clearExportOverlay,
	showExportErrorOverlay,
	setExportProgressOverlay,
	getPhaseDefaultDetail,
	requireTargetsMessage,
	requireFramesMessage,
	t,
	now = () => Date.now(),
	waitForWritePhasePaint = defaultWaitForWritePhasePaint,
	abortSignal = null,
} = {}) {
	setExportStatus("export.exporting", true);

	try {
		throwIfExportAborted(abortSignal);
		if (targetDocuments.length === 0) {
			throw new Error(requireTargetsMessage);
		}
		if (!Array.isArray(frames) || frames.length === 0) {
			throw new Error(requireFramesMessage);
		}

		const progressItems = buildFrameProgressItems(targetDocuments, frames);
		const progressStartedAt = now();
		const entries = [];
		let pngCount = 0;
		let psdCount = 0;

		for (const [index, progressItem] of progressItems.entries()) {
			throwIfExportAborted(abortSignal);
			const documentState = progressItem.sourceDocument;
			const timelineFrame = progressItem.timelineFrame;
			const exportSettings = getExportSettings(documentState);
			const exportFormat =
				exportSettings.exportFormat === "psd" ? "psd" : "png";
			let currentPhaseState = null;
			const pushOverlay = (phaseState = currentPhaseState) =>
				setExportProgressOverlay(
					progressItems,
					index,
					exportFormat,
					progressStartedAt,
					phaseState,
				);
			pushOverlay();
			const snapshot = await renderSnapshot(
				documentState,
				timelineFrame,
				index,
				progressItems,
				(phaseState) => {
					currentPhaseState = phaseState;
					pushOverlay();
				},
			);
			throwIfExportAborted(abortSignal);
			currentPhaseState = buildWritePhaseState(
				currentPhaseState,
				exportFormat,
				t,
				getPhaseDefaultDetail,
			);
			if (currentPhaseState?.definitions?.length) {
				pushOverlay();
				await waitForWritePhasePaint?.();
			}
			throwIfExportAborted(abortSignal);

			const blob = await createSnapshotBlob(
				documentState,
				snapshot,
				exportFormat,
				timelineFrame,
				index,
				progressItems,
			);
			throwIfExportAborted(abortSignal);
			entries.push({
				path: buildEntryPath(
					documentState,
					snapshot,
					exportFormat,
					timelineFrame,
					index,
					progressItems,
				),
				data: blob,
			});
			if (exportFormat === "psd") {
				psdCount += 1;
			} else {
				pngCount += 1;
			}
		}

		throwIfExportAborted(abortSignal);
		const archiveBlob = await createArchiveBlob(entries);
		throwIfExportAborted(abortSignal);
		downloadArchive(archiveBlob, archiveFilename);
		const exportCount = entries.length;
		setSummary(
			t("exportSummary.sequenceExported", {
				count: exportCount,
			}),
		);
		setStatus(
			pngCount > 0 && psdCount > 0
				? t("status.sequenceExportedMixed", { count: exportCount })
				: t("status.sequenceExported", {
						count: exportCount,
						format: pngCount > 0 ? "PNG" : "PSD",
					}),
		);
		clearExportOverlay();
		setExportStatus("export.ready");
		updateUi();
	} catch (error) {
		applyExportError(error, {
			setSummary,
			setExportStatus,
			setStatus,
			showExportError: showExportErrorOverlay,
			clearExportOverlay,
			updateUi,
			t,
		});
	}
}

export async function runVideoExport({
	targetDocuments,
	frames,
	fps = 24,
	isVideoSupported = () => false,
	renderSnapshot,
	renderVideoFrame,
	createVideoBlob,
	buildVideoFilename,
	createArchiveBlob,
	downloadArchive,
	downloadVideo,
	archiveFilename,
	setExportStatus,
	setSummary,
	setStatus,
	updateUi,
	clearExportOverlay,
	showExportErrorOverlay,
	setExportProgressOverlay,
	getPhaseDefaultDetail,
	requireTargetsMessage,
	requireFramesMessage,
	videoUnsupportedMessage,
	t,
	now = () => Date.now(),
	waitForWritePhasePaint = defaultWaitForWritePhasePaint,
	abortSignal = null,
} = {}) {
	setExportStatus("export.exporting", true);

	try {
		throwIfExportAborted(abortSignal);
		if (targetDocuments.length === 0) {
			throw new Error(requireTargetsMessage);
		}
		if (!Array.isArray(frames) || frames.length === 0) {
			throw new Error(requireFramesMessage);
		}
		if (!isVideoSupported()) {
			throw new Error(videoUnsupportedMessage);
		}

		const progressItems = buildFrameProgressItems(targetDocuments, frames);
		const progressStartedAt = now();
		const videoEntries = [];
		let progressIndex = 0;

		for (const [cameraIndex, documentState] of targetDocuments.entries()) {
			throwIfExportAborted(abortSignal);
			const videoBlob = await createVideoBlob(
				async (drawFrame) => {
					for (const timelineFrame of frames) {
						throwIfExportAborted(abortSignal);
						const currentProgressIndex = progressIndex;
						const progressItem = progressItems[currentProgressIndex];
						let currentPhaseState = null;
						const pushOverlay = (phaseState = currentPhaseState) =>
							setExportProgressOverlay(
								progressItems,
								currentProgressIndex,
								"webm",
								progressStartedAt,
								phaseState,
							);
						pushOverlay();
						const snapshot = await renderSnapshot(
							documentState,
							timelineFrame,
							currentProgressIndex,
							progressItems,
							(phaseState) => {
								currentPhaseState = phaseState;
								pushOverlay();
							},
						);
						throwIfExportAborted(abortSignal);
						currentPhaseState = buildWritePhaseState(
							currentPhaseState,
							"webm",
							t,
							getPhaseDefaultDetail,
						);
						if (currentPhaseState?.definitions?.length) {
							pushOverlay();
							await waitForWritePhasePaint?.();
						}
						throwIfExportAborted(abortSignal);
						await drawFrame(
							renderVideoFrame(documentState, snapshot, progressItem),
						);
						throwIfExportAborted(abortSignal);
						progressIndex += 1;
					}
				},
				{ fps, abortSignal },
			);
			throwIfExportAborted(abortSignal);
			const filename = buildVideoFilename(
				documentState,
				videoBlob,
				null,
				cameraIndex,
				targetDocuments,
			);
			if (targetDocuments.length === 1) {
				downloadVideo(videoBlob, filename);
			} else {
				videoEntries.push({
					path: filename,
					data: videoBlob,
				});
			}
		}

		if (videoEntries.length > 0) {
			throwIfExportAborted(abortSignal);
			const archiveBlob = await createArchiveBlob(videoEntries);
			throwIfExportAborted(abortSignal);
			downloadArchive(archiveBlob, archiveFilename);
		}
		setSummary(
			t("exportSummary.videoExported", {
				count: targetDocuments.length,
				frames: frames.length,
			}),
		);
		setStatus(
			t("status.videoExported", {
				count: targetDocuments.length,
				frames: frames.length,
			}),
		);
		clearExportOverlay();
		setExportStatus("export.ready");
		updateUi();
	} catch (error) {
		applyExportError(error, {
			setSummary,
			setExportStatus,
			setStatus,
			showExportError: showExportErrorOverlay,
			clearExportOverlay,
			updateUi,
			t,
		});
	}
}

export async function runPsdExport({
	targetDocuments,
	renderSnapshot,
	downloadSnapshot,
	setExportStatus,
	setSummary,
	setStatus,
	updateUi,
	requireTargetsMessage,
	t,
	abortSignal = null,
} = {}) {
	setExportStatus("export.exporting", true);

	try {
		throwIfExportAborted(abortSignal);
		if (targetDocuments.length === 0) {
			throw new Error(requireTargetsMessage);
		}

		let exportCount = 0;

		for (const [index, documentState] of targetDocuments.entries()) {
			throwIfExportAborted(abortSignal);
			const snapshot = await renderSnapshot(
				documentState,
				index,
				targetDocuments,
			);
			throwIfExportAborted(abortSignal);
			downloadSnapshot(documentState, snapshot, index, targetDocuments);
			exportCount += 1;
		}

		setSummary(
			t("exportSummary.psdExported", {
				count: exportCount,
			}),
		);
		setExportStatus("export.ready");
		setStatus(
			t("status.psdExported", {
				count: exportCount,
			}),
		);
		updateUi();
	} catch (error) {
		applyExportError(error, {
			setSummary,
			setExportStatus,
			setStatus,
			updateUi,
			t,
		});
	}
}

export async function runOutputExport({
	targetDocuments,
	getExportSettings,
	renderSnapshot,
	downloadPngSnapshot,
	downloadPsdSnapshot,
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
	now = () => Date.now(),
	waitForWritePhasePaint = defaultWaitForWritePhasePaint,
	abortSignal = null,
} = {}) {
	setExportStatus("export.exporting", true);

	try {
		throwIfExportAborted(abortSignal);
		if (targetDocuments.length === 0) {
			throw new Error(requireTargetsMessage);
		}
		const progressStartedAt = now();

		let pngCount = 0;
		let psdCount = 0;
		let lastSnapshot = null;
		let lastFormat = "png";

		for (const [index, documentState] of targetDocuments.entries()) {
			throwIfExportAborted(abortSignal);
			const exportSettings = getExportSettings(documentState);
			let currentPhaseState = null;
			const pushOverlay = (phaseState = currentPhaseState) =>
				setExportProgressOverlay(
					targetDocuments,
					index,
					exportSettings.exportFormat,
					progressStartedAt,
					phaseState,
				);
			pushOverlay();
			const snapshot = await renderSnapshot(
				documentState,
				index,
				targetDocuments,
				(phaseState) => {
					currentPhaseState = phaseState;
					pushOverlay();
				},
			);
			throwIfExportAborted(abortSignal);
			const sequenceIndex = targetDocuments.length > 1 ? index + 1 : null;
			currentPhaseState = buildWritePhaseState(
				currentPhaseState,
				exportSettings.exportFormat,
				t,
				getPhaseDefaultDetail,
			);
			if (currentPhaseState?.definitions?.length) {
				pushOverlay();
				await waitForWritePhasePaint?.();
			}
			throwIfExportAborted(abortSignal);
			if (exportSettings.exportFormat === "png") {
				downloadPngSnapshot(
					documentState,
					snapshot,
					sequenceIndex,
					index,
					targetDocuments,
				);
				pngCount += 1;
			} else {
				downloadPsdSnapshot(
					documentState,
					snapshot,
					sequenceIndex,
					index,
					targetDocuments,
				);
				psdCount += 1;
			}
			lastSnapshot = snapshot;
			lastFormat = exportSettings.exportFormat;
		}

		const exportCount = pngCount + psdCount;
		if (exportCount === 1 && lastSnapshot) {
			setSummary(
				lastFormat === "png"
					? t("exportSummary.exported", {
							width: lastSnapshot.width,
							height: lastSnapshot.height,
						})
					: t("exportSummary.psdExported", { count: 1 }),
			);
			setStatus(
				lastFormat === "png"
					? t("status.pngExported")
					: t("status.psdExported", { count: 1 }),
			);
		} else if (pngCount > 0 && psdCount > 0) {
			setSummary(
				t("exportSummary.exportedMixed", {
					count: exportCount,
				}),
			);
			setStatus(
				t("status.exportedMixed", {
					count: exportCount,
				}),
			);
		} else if (pngCount > 0) {
			setSummary(
				t("exportSummary.exportedBatch", {
					count: pngCount,
				}),
			);
			setStatus(
				t("status.pngExportedBatch", {
					count: pngCount,
				}),
			);
		} else {
			setSummary(
				t("exportSummary.psdExported", {
					count: psdCount,
				}),
			);
			setStatus(
				t("status.psdExported", {
					count: psdCount,
				}),
			);
		}
		clearExportOverlay();
		setExportStatus("export.ready");
		updateUi();
	} catch (error) {
		applyExportError(error, {
			setSummary,
			setExportStatus,
			setStatus,
			showExportError: showExportErrorOverlay,
			clearExportOverlay,
			updateUi,
			t,
		});
	}
}
