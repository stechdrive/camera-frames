export function createProjectOpenApply({
	getAssetController,
	getPerSplatEditController,
	applySavedProjectState,
	getHistoryController,
	setStatus,
	t,
}) {
	return async function applyOpenedProject(
		parsedProject,
		{
			projectName = "",
			loadedStatus = t("status.projectLoaded"),
			onAssetProgress = null,
			skipApplyState = false,
		} = {},
	) {
		const assetController = getAssetController?.();
		getPerSplatEditController?.()?.resetForSceneChange?.();
		assetController?.clearScene?.();
		const projectSources = parsedProject.assetEntries.map(
			(entry) => entry.source,
		);
		if (projectSources.length > 0) {
			await assetController?.loadSources?.(projectSources, false, {
				onProgress: onAssetProgress,
			});
		}
		onAssetProgress?.("apply", t("overlay.importDetailApply", { projectName }));
		if (!skipApplyState) {
			applySavedProjectState?.(parsedProject.project);
			getHistoryController?.()?.clearHistory?.();
		}
		setStatus?.(loadedStatus);
		return true;
	};
}
