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
	{ setSummary, setExportStatus, setStatus, showExportError = null },
) {
	console.error(error);
	setSummary(error.message);
	setExportStatus("export.idle");
	setStatus(error.message);
	showExportError?.(error);
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
} = {}) {
	setExportStatus("export.exporting", true);

	try {
		if (targetDocuments.length === 0) {
			throw new Error(requireTargetsMessage);
		}

		let lastSnapshot = null;

		for (const [index, documentState] of targetDocuments.entries()) {
			const snapshot = await renderSnapshot(
				documentState,
				index,
				targetDocuments,
			);
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
} = {}) {
	setExportStatus("export.exporting", true);

	try {
		if (targetDocuments.length === 0) {
			throw new Error(requireTargetsMessage);
		}

		let exportCount = 0;

		for (const [index, documentState] of targetDocuments.entries()) {
			const snapshot = await renderSnapshot(
				documentState,
				index,
				targetDocuments,
			);
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
} = {}) {
	setExportStatus("export.exporting", true);

	try {
		if (targetDocuments.length === 0) {
			throw new Error(requireTargetsMessage);
		}
		const progressStartedAt = now();

		let pngCount = 0;
		let psdCount = 0;
		let lastSnapshot = null;
		let lastFormat = "png";

		for (const [index, documentState] of targetDocuments.entries()) {
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
		});
	}
}
