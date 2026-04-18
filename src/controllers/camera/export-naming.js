export function sanitizeExportName(value) {
	return String(value ?? "")
		.trim()
		.replace(/[\\/:*?"<>|]+/g, "-")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
}

export function resolveShotCameraExportNameTemplate(
	templateValue,
	shotCameraName = "",
) {
	const template = String(templateValue ?? "").trim();
	if (!template) {
		return "";
	}
	const replacement = String(shotCameraName ?? "").trim() || "Camera";
	return template.replace(/%cam/g, replacement);
}

export function getShotCameraExportBaseNameForDocument(
	documentState,
	fallbackIndex = 1,
	buildShotCameraDocumentName = (nextNumber) => `Camera ${nextNumber}`,
) {
	const shotCameraName =
		documentState?.name || buildShotCameraDocumentName(fallbackIndex);
	const candidate =
		resolveShotCameraExportNameTemplate(
			documentState?.exportSettings?.exportName,
			shotCameraName,
		) ||
		documentState?.name ||
		buildShotCameraDocumentName(fallbackIndex);

	return sanitizeExportName(candidate) || `camera-${fallbackIndex}`;
}

export function normalizeShotCameraExportFormat(value) {
	return value === "png" ? "png" : "psd";
}

export function createCameraExportSettingsController({
	runHistoryAction,
	updateUi,
	setStatus,
	t,
	updateActiveShotCameraDocument,
}) {
	function buildShotCameraDocumentName(nextNumber) {
		return t("shotCamera.defaultName", { index: nextNumber });
	}

	function getShotCameraExportBaseName(documentState, fallbackIndex = 1) {
		return getShotCameraExportBaseNameForDocument(
			documentState,
			fallbackIndex,
			buildShotCameraDocumentName,
		);
	}

	function setShotCameraExportName(nextValue) {
		runHistoryAction?.("camera.export-name", () => {
			updateActiveShotCameraDocument((documentState) => {
				documentState.exportSettings = {
					...documentState.exportSettings,
					exportName: String(nextValue ?? ""),
				};
				return documentState;
			});
		});
	}

	function setShotCameraExportFormat(nextValue) {
		const exportFormat = normalizeShotCameraExportFormat(nextValue);
		runHistoryAction?.("camera.export-format", () => {
			updateActiveShotCameraDocument((documentState) => {
				documentState.exportSettings = {
					...documentState.exportSettings,
					exportFormat,
				};
				return documentState;
			});
		});
		updateUi();
		setStatus(
			t("status.shotCameraExportFormat", {
				format: t(`exportFormat.${exportFormat}`),
			}),
		);
	}

	function setShotCameraExportGridOverlay(nextValue) {
		const exportGridOverlay = Boolean(nextValue);
		runHistoryAction?.("camera.export-grid", () => {
			updateActiveShotCameraDocument((documentState) => {
				documentState.exportSettings = {
					...documentState.exportSettings,
					exportGridOverlay,
				};
				return documentState;
			});
		});
		updateUi();
	}

	function setShotCameraExportGridLayerMode(nextValue) {
		const exportGridLayerMode =
			nextValue === "overlay" ? "overlay" : "bottom";
		runHistoryAction?.("camera.export-grid-layer", () => {
			updateActiveShotCameraDocument((documentState) => {
				documentState.exportSettings = {
					...documentState.exportSettings,
					exportGridLayerMode,
				};
				return documentState;
			});
		});
		updateUi();
	}

	function setShotCameraExportModelLayers(nextValue) {
		const exportModelLayers = Boolean(nextValue);
		runHistoryAction?.("camera.export-model-layers", () => {
			updateActiveShotCameraDocument((documentState) => {
				documentState.exportSettings = {
					...documentState.exportSettings,
					exportModelLayers,
					exportSplatLayers:
						exportModelLayers &&
						documentState.exportSettings?.exportFormat === "psd" &&
						Boolean(documentState.exportSettings?.exportSplatLayers),
				};
				return documentState;
			});
		});
		updateUi();
	}

	function setShotCameraExportSplatLayers(nextValue) {
		const exportSplatLayers = Boolean(nextValue);
		runHistoryAction?.("camera.export-splat-layers", () => {
			updateActiveShotCameraDocument((documentState) => {
				documentState.exportSettings = {
					...documentState.exportSettings,
					exportSplatLayers:
						documentState.exportSettings?.exportFormat === "psd" &&
						Boolean(documentState.exportSettings?.exportModelLayers) &&
						exportSplatLayers,
				};
				return documentState;
			});
		});
		updateUi();
	}

	return {
		getShotCameraExportBaseName,
		setShotCameraExportName,
		setShotCameraExportFormat,
		setShotCameraExportGridOverlay,
		setShotCameraExportGridLayerMode,
		setShotCameraExportModelLayers,
		setShotCameraExportSplatLayers,
	};
}
