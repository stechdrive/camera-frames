import {
	generateProjectId,
	normalizeProjectDocument,
} from "../../project/document.js";

export function buildWorkingSaveRecord({
	projectId,
	projectName,
	packageRevision,
	packageFingerprint,
	projectSnapshot,
	workingSceneSnapshot,
	workingEditorSnapshot = null,
}) {
	const normalizedProject = normalizeProjectDocument(projectSnapshot);
	return {
		projectId,
		projectName,
		packageRevision,
		packageFingerprint,
		snapshot: {
			workspace: normalizedProject.workspace,
			shotCameras: normalizedProject.shotCameras,
			editorState: workingEditorSnapshot ?? null,
			scene: {
				assets: workingSceneSnapshot.assets,
				selectedAssetKeys: workingSceneSnapshot.selectedAssetKeys,
				activeAssetKey: workingSceneSnapshot.activeAssetKey,
				referenceImages: normalizedProject.scene.referenceImages,
			},
		},
	};
}

export function resolveProjectIdentity(project, fallbackFingerprint = "") {
	const normalizedProject = normalizeProjectDocument(project);
	return {
		projectId:
			normalizedProject.projectId || fallbackFingerprint || generateProjectId(),
		packageRevision: normalizedProject.packageRevision ?? 0,
	};
}

export function isWorkingStateCompatible(
	record,
	{ projectId, packageFingerprint, packageRevision },
) {
	if (!record || !projectId) {
		return false;
	}
	if (record.projectId !== projectId) {
		return false;
	}
	if (
		record.packageFingerprint &&
		packageFingerprint &&
		record.packageFingerprint !== packageFingerprint
	) {
		return false;
	}
	return Number(record.packageRevision ?? 0) === Number(packageRevision ?? 0);
}

export function isQuotaExceededError(error) {
	const name = String(error?.name ?? "");
	const message = String(error?.message ?? error ?? "");
	return (
		name === "QuotaExceededError" ||
		name === "NS_ERROR_DOM_QUOTA_REACHED" ||
		message.includes("QuotaExceededError") ||
		message.includes("NS_ERROR_DOM_QUOTA_REACHED")
	);
}
