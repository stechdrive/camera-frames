export function createProjectOpenApply({
	getAssetController,
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
		} = {},
	) {
		const assetController = getAssetController?.();
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
		applySavedProjectState?.(parsedProject.project);
		getHistoryController?.()?.clearHistory?.();
		setStatus?.(loadedStatus);
		return true;
	};
}
