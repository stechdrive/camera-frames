export function resolveExportTargetShotCameras({
	store,
	getActiveShotCameraDocument,
}) {
	const target = store.exportOptions.target.value;
	if (target === "all") {
		return [...store.workspace.shotCameras.value];
	}

	if (target === "selected") {
		const selectedIds = new Set(store.exportOptions.presetIds.value);
		return store.workspace.shotCameras.value.filter((documentState) =>
			selectedIds.has(documentState.id),
		);
	}

	const activeDocument = getActiveShotCameraDocument();
	return activeDocument ? [activeDocument] : [];
}

export function getShotCameraExportSettings(documentState) {
	const exportSettings = documentState?.exportSettings ?? {};
	const exportFormat = exportSettings.exportFormat === "png" ? "png" : "psd";
	const exportModelLayers =
		exportFormat === "psd" && exportSettings.exportModelLayers !== false;
	return {
		exportName: String(exportSettings.exportName ?? ""),
		exportFormat,
		exportGridOverlay: Boolean(exportSettings.exportGridOverlay),
		exportGridLayerMode:
			exportSettings.exportGridLayerMode === "overlay" ? "overlay" : "bottom",
		exportModelLayers,
		exportSplatLayers:
			exportModelLayers && Boolean(exportSettings.exportSplatLayers),
	};
}

export function buildSceneAssetExportMetadata(sceneAssets = []) {
	return sceneAssets.map((asset) => ({
		id: asset.id,
		kind: asset.kind,
		label: asset.label,
		exportRole: asset.exportRole ?? "beauty",
		maskGroup: asset.maskGroup ?? "",
	}));
}
