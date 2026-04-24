import {
	buildProjectFingerprint,
	generateProjectId,
	normalizeProjectDocument,
} from "../../project/document.js";
import { openCameraFramesProjectPackage } from "../../project/file/index.js";
import {
	buildImportProgressDetail,
	buildImportProgressOverlay,
	waitForOverlayFrame,
} from "./overlays.js";
import {
	getProjectBaseName,
	isLegacyCameraFramesProjectSource,
} from "./picker-options.js";
import { resolveProjectIdentity } from "./working-save-record.js";

export function createProjectOpenWorkflow({
	t,
	setOverlay,
	clearOverlay,
	setStatus,
	confirmBeforeReplacingProject,
	assetController,
	applyOpenedProject,
	clearProjectSidecars = () => {},
	captureProjectState,
	getCurrentProjectId,
	probeCompatibleWorkingState,
	applyProbedWorkingState,
	rememberProjectContext,
	markCurrentPackageClean,
	markCurrentProjectClean,
	syncProjectPresentation,
}) {
	async function openParsedProject(
		parsedProject,
		{
			projectName = "",
			fileHandle = null,
			loadedStatus = t("status.projectLoaded"),
		} = {},
	) {
		setOverlay(buildImportProgressOverlay(t, "verify"));
		await waitForOverlayFrame();
		const packageFingerprint = await buildProjectFingerprint(
			parsedProject.project,
			{ assumeNormalized: true },
		);
		const projectIdentity = resolveProjectIdentity(
			parsedProject.project,
			packageFingerprint,
		);
		const workingStateContext = {
			projectId: projectIdentity.projectId,
			packageRevision: projectIdentity.packageRevision,
			packageFingerprint,
			projectName,
		};
		const compatibleWorkingStateRecord =
			await probeCompatibleWorkingState(workingStateContext);
		try {
			await applyOpenedProject(parsedProject, {
				projectName,
				loadedStatus,
				onAssetProgress: (step, detail = "") => {
					setOverlay(buildImportProgressOverlay(t, step, detail));
				},
				skipApplyState: compatibleWorkingStateRecord !== null,
			});
			clearOverlay();
			rememberProjectContext({
				projectId: projectIdentity.projectId,
				packageRevision: projectIdentity.packageRevision,
				packageFingerprint,
				projectName,
				fileHandle,
			});
			markCurrentPackageClean(parsedProject.project);
			if (compatibleWorkingStateRecord) {
				await applyProbedWorkingState(
					compatibleWorkingStateRecord,
					workingStateContext,
				);
			} else {
				const finalSnapshot = captureProjectState();
				markCurrentProjectClean(finalSnapshot);
				syncProjectPresentation(finalSnapshot);
			}
		} catch (error) {
			clearOverlay();
			throw error;
		}
		return true;
	}

	async function openProjectSource(
		source,
		{ fileHandle = null, skipReplaceConfirm = false } = {},
	) {
		if (!skipReplaceConfirm) {
			return confirmBeforeReplacingProject(async () => {
				await openProjectSource(source, {
					fileHandle,
					skipReplaceConfirm: true,
				});
			});
		}
		const projectName = getProjectBaseName(source?.name || fileHandle?.name);
		try {
			setOverlay(buildImportProgressOverlay(t, "verify"));
			await waitForOverlayFrame();
			const parsedProject = await openCameraFramesProjectPackage(source, {
				onProgress: (progress) => {
					setOverlay(
						buildImportProgressOverlay(
							t,
							progress?.phase || "verify",
							buildImportProgressDetail(t, progress),
						),
					);
				},
			});
			try {
				return await openParsedProject(parsedProject, {
					projectName,
					fileHandle,
				});
			} finally {
				await parsedProject.close?.();
			}
		} catch (error) {
			if (!(await isLegacyCameraFramesProjectSource(source))) {
				clearOverlay();
				throw error;
			}

			setOverlay(buildImportProgressOverlay(t, "verify"));
			await waitForOverlayFrame();
			try {
				await assetController.loadSources([source], true, {
					onProgress: (step, detail = "") => {
						setOverlay(buildImportProgressOverlay(t, step, detail));
					},
				});
				clearProjectSidecars?.();
				clearOverlay();
			} catch (legacyError) {
				clearOverlay();
				throw legacyError;
			}
			const projectSnapshot = captureProjectState();
			const normalizedProject = normalizeProjectDocument(projectSnapshot);
			const projectId =
				getCurrentProjectId() ||
				normalizedProject.projectId ||
				generateProjectId();
			normalizedProject.projectId = projectId;
			normalizedProject.packageRevision = 0;
			const packageFingerprint = await buildProjectFingerprint(
				normalizedProject,
				{ assumeNormalized: true },
			);
			rememberProjectContext({
				projectId,
				packageRevision: 0,
				packageFingerprint,
				projectName,
				fileHandle,
			});
			markCurrentPackageClean(normalizedProject);
			const legacyWorkingStateContext = {
				projectId,
				packageRevision: 0,
				packageFingerprint,
				projectName,
			};
			const legacyWorkingStateRecord = await probeCompatibleWorkingState(
				legacyWorkingStateContext,
			);
			if (legacyWorkingStateRecord) {
				await applyProbedWorkingState(
					legacyWorkingStateRecord,
					legacyWorkingStateContext,
				);
			} else {
				const finalSnapshot = captureProjectState();
				markCurrentProjectClean(finalSnapshot);
				syncProjectPresentation(finalSnapshot);
			}
			setStatus(t("status.projectLoaded"));
			return true;
		}
	}

	return {
		openParsedProject,
		openProjectSource,
	};
}
