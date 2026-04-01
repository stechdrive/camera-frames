export function getExportPhaseDefinitions({
	exportFormat,
	exportGridOverlay = false,
	hasMasks = false,
	exportModelLayers = false,
	exportSplatLayers = false,
	includeReferenceImages = false,
	t,
}) {
	const phases = [
		{ id: "prepare", label: t("overlay.exportPhasePrepare") },
		{ id: "beauty", label: t("overlay.exportPhaseBeauty") },
	];
	if (exportGridOverlay) {
		phases.push({ id: "guides", label: t("overlay.exportPhaseGuides") });
	}
	if (hasMasks) {
		phases.push({ id: "masks", label: t("overlay.exportPhaseMasks") });
	}
	if (exportFormat === "psd" && exportModelLayers) {
		phases.push({ id: "psd-base", label: t("overlay.exportPhasePsdBase") });
		phases.push({
			id: "model-layers",
			label: t("overlay.exportPhaseModelLayers"),
		});
	}
	if (exportFormat === "psd" && exportSplatLayers) {
		phases.push({
			id: "splat-layers",
			label: t("overlay.exportPhaseSplatLayers"),
		});
	}
	if (includeReferenceImages) {
		phases.push({
			id: "reference-images",
			label: t("overlay.exportPhaseReferenceImages"),
		});
	}
	phases.push({ id: "write", label: t("overlay.exportPhaseWrite") });
	return phases;
}

export function getExportPhaseDefaultDetail(phaseId, exportFormat, t) {
	switch (phaseId) {
		case "prepare":
			return t("overlay.exportPhaseDetailPrepare");
		case "beauty":
			return t("overlay.exportPhaseDetailBeauty");
		case "guides":
			return t("overlay.exportPhaseDetailGuides");
		case "masks":
			return t("overlay.exportPhaseDetailMasks");
		case "psd-base":
			return t("overlay.exportPhaseDetailPsdBase");
		case "model-layers":
			return t("overlay.exportPhaseDetailModelLayers");
		case "splat-layers":
			return t("overlay.exportPhaseDetailSplatLayers");
		case "reference-images":
			return t("overlay.exportPhaseDetailReferenceImages");
		case "write":
			return exportFormat === "psd"
				? t("overlay.exportPhaseDetailWritePsd")
				: t("overlay.exportPhaseDetailWritePng");
		default:
			return "";
	}
}

export function buildExportProgressOverlay({
	targetDocuments,
	currentIndex,
	exportFormat,
	startedAt,
	phaseState = null,
	t,
}) {
	const safeDocuments = Array.isArray(targetDocuments) ? targetDocuments : [];
	const activeDocument = safeDocuments[currentIndex] ?? null;
	const formatLabel = t(
		`exportFormat.${exportFormat === "psd" ? "psd" : "png"}`,
	);
	const detail =
		safeDocuments.length > 1
			? t("overlay.exportDetailBatch", {
					index: currentIndex + 1,
					count: safeDocuments.length,
					camera: activeDocument?.name ?? "Camera",
					format: formatLabel,
				})
			: t("overlay.exportDetailSingle", {
					camera: activeDocument?.name ?? "Camera",
					format: formatLabel,
				});

	return {
		source: "export",
		kind: "progress",
		title: t("overlay.exportTitle"),
		message: t("overlay.exportMessage"),
		detail,
		phaseLabel: phaseState?.label ?? "",
		phaseDetail:
			phaseState?.detail ??
			(phaseState?.id
				? getExportPhaseDefaultDetail(phaseState.id, exportFormat, t)
				: ""),
		startedAt,
		phases: (phaseState?.definitions ?? []).map((phase) => ({
			label: phase.label,
			status:
				phaseState?.activeId == null
					? "todo"
					: phase.id === phaseState.activeId
						? "active"
						: phaseState.completedIds?.has?.(phase.id)
							? "done"
							: "todo",
		})),
		steps: safeDocuments.map((documentState, index) => ({
			label: documentState.name,
			status:
				index < currentIndex
					? "done"
					: index === currentIndex
						? "active"
						: "todo",
		})),
	};
}
