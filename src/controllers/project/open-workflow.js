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
	PROJECT_PICKER_MIME,
	ensureProjectFileName,
	getProjectBaseName,
	isLegacyCameraFramesProjectSource,
} from "./picker-options.js";
import { prepareStableProjectOpenSource } from "./source-staging.js";
import { resolveProjectIdentity } from "./working-save-record.js";

function getProjectSourceFileName(source, fileHandle = null) {
	if (fileHandle?.name) {
		return fileHandle.name;
	}
	if (source?.name) {
		return source.name;
	}
	if (typeof source !== "string") {
		return "";
	}
	try {
		const url = new URL(source);
		return decodeURIComponent(url.pathname.split("/").pop() || "");
	} catch {
		return source;
	}
}

async function materializeRemoteProjectSource(source, fileName) {
	if (typeof source !== "string") {
		return source;
	}
	const response = await fetch(source);
	if (!response.ok) {
		throw new Error(`Failed to fetch ${source}: ${response.status}`);
	}
	const blob = await response.blob();
	return new File([blob], ensureProjectFileName(fileName), {
		type: blob.type || PROJECT_PICKER_MIME,
	});
}

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
	replaceProjectSourceStaging = async (cleanup) => {
		try {
			await cleanup?.();
		} catch {
			// Best-effort fallback for tests or alternate hosts that do not
			// provide a project-lifetime staging owner.
		}
	},
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
			progressStartedAt = Date.now(),
		} = {},
	) {
		setOverlay(
			buildImportProgressOverlay(t, "verify", "", {
				startedAt: progressStartedAt,
			}),
		);
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
				onAssetProgress: (step, detail = "", progress = {}) => {
					setOverlay(
						buildImportProgressOverlay(t, step, detail, {
							startedAt: progressStartedAt,
							detailTiming: progress?.detailTiming ?? null,
						}),
					);
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
		const sourceFileName = getProjectSourceFileName(source, fileHandle);
		const projectName = getProjectBaseName(sourceFileName);
		const progressStartedAt = Date.now();
		let preparedProjectSource = null;
		let projectSource = null;
		let stagingAdopted = false;
		const cleanupUnadoptedStaging = async () => {
			if (!stagingAdopted) {
				await preparedProjectSource?.cleanup?.();
			}
		};
		const adoptPreparedStaging = async () => {
			await replaceProjectSourceStaging(preparedProjectSource?.cleanup ?? null);
			stagingAdopted = true;
		};
		try {
			setOverlay(
				buildImportProgressOverlay(t, "verify", "", {
					startedAt: progressStartedAt,
				}),
			);
			await waitForOverlayFrame();
			projectSource = await materializeRemoteProjectSource(
				source,
				sourceFileName,
			);
			preparedProjectSource =
				typeof source === "string"
					? {
							source: projectSource,
							mode: "none",
							cleanup: null,
							warning: null,
						}
					: await prepareStableProjectOpenSource(projectSource, {
							fileName: sourceFileName,
							onProgress: (progress) => {
								setOverlay(
									buildImportProgressOverlay(
										t,
										progress?.phase || "verify",
										buildImportProgressDetail(t, progress),
										{ startedAt: progressStartedAt },
									),
								);
							},
						});
			if (preparedProjectSource?.warning) {
				setStatus(t(preparedProjectSource.warning));
			}
			const refreshSource =
				preparedProjectSource?.mode === "none" &&
				fileHandle &&
				typeof fileHandle.getFile === "function"
					? async () => await fileHandle.getFile()
					: null;
			const parsedProject = await openCameraFramesProjectPackage(
				preparedProjectSource.source,
				{
					refreshSource,
					onProgress: (progress) => {
						setOverlay(
							buildImportProgressOverlay(
								t,
								progress?.phase || "verify",
								buildImportProgressDetail(t, progress),
								{ startedAt: progressStartedAt },
							),
						);
					},
				},
			);
			try {
				const opened = await openParsedProject(parsedProject, {
					projectName,
					fileHandle,
					progressStartedAt,
				});
				await adoptPreparedStaging();
				return opened;
			} finally {
				await parsedProject.close?.();
			}
		} catch (error) {
			const legacySource =
				preparedProjectSource?.source ??
				projectSource ??
				(typeof source === "string"
					? await materializeRemoteProjectSource(source, sourceFileName)
					: source);
			if (!(await isLegacyCameraFramesProjectSource(legacySource))) {
				clearOverlay();
				await cleanupUnadoptedStaging();
				throw error;
			}

			setOverlay(
				buildImportProgressOverlay(t, "verify", "", {
					startedAt: progressStartedAt,
				}),
			);
			await waitForOverlayFrame();
			try {
				await assetController.loadSources([legacySource], true, {
					onProgress: (step, detail = "", progress = {}) => {
						setOverlay(
							buildImportProgressOverlay(t, step, detail, {
								startedAt: progressStartedAt,
								detailTiming: progress?.detailTiming ?? null,
							}),
						);
					},
				});
				clearProjectSidecars?.();
				clearOverlay();
			} catch (legacyError) {
				clearOverlay();
				await cleanupUnadoptedStaging();
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
			await adoptPreparedStaging();
			setStatus(t("status.projectLoaded"));
			return true;
		}
	}

	return {
		openParsedProject,
		openProjectSource,
	};
}
