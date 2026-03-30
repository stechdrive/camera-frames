export function getProjectStatusDisplay(store, t) {
	const projectDisplayNameRaw = store.project?.name?.value?.trim?.() ?? "";
	const projectDisplayName = projectDisplayNameRaw || t("project.untitled");
	const projectDirty = Boolean(store.project?.dirty?.value);
	const projectPackageDirty = Boolean(store.project?.packageDirty?.value);
	const hasSceneAssets = (store.sceneAssets?.value?.length ?? 0) > 0;
	const hasReferenceItems =
		(store.referenceImages?.items?.value?.length ?? 0) > 0;
	const hasMultipleShotCameras =
		(store.workspace?.shotCameras?.value?.length ?? 0) > 1;
	const showProjectPackageDirty =
		projectPackageDirty &&
		(projectDirty ||
			hasSceneAssets ||
			hasReferenceItems ||
			hasMultipleShotCameras ||
			Boolean(projectDisplayNameRaw));
	return {
		projectDisplayName,
		projectDirty,
		showProjectPackageDirty,
	};
}
