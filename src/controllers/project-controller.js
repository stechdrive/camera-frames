import {
	buildProjectFingerprint,
	generateProjectId,
	normalizeProjectDocument,
} from "../project-document.js";
import {
	buildCameraFramesProjectPackage,
	getDefaultProjectFilename,
	readCameraFramesProject,
} from "../project-file.js";
import { ZipReader } from "../project-package.js";
import {
	pickWorkingProjectDirectory,
	readCameraFramesWorkingProject,
	supportsWorkingProjectStorage,
} from "../project-storage-working.js";
import {
	cleanupCameraFramesWorkingState,
	deleteCameraFramesWorkingState,
	readCameraFramesWorkingState,
	saveCameraFramesWorkingState,
	supportsWorkingProjectStateStorage,
} from "../project-working-state.js";

const DEFAULT_SOG_MAX_SH_BANDS = 2;
const DEFAULT_SOG_ITERATIONS = 10;
const PACKAGE_SOG_ITERATION_OPTIONS = [4, 8, 10, 12, 16];
const PROJECT_PICKER_MIME = "application/x-camera-frames-project";

function getProjectBaseName(value) {
	const fileName = String(value ?? "").trim();
	if (!fileName) {
		return "";
	}
	return fileName.replace(/\.ssproj$/i, "");
}

function ensureProjectFileName(
	value,
	fallback = "camera-frames-project.ssproj",
) {
	const baseName = getProjectBaseName(value);
	return baseName ? `${baseName}.ssproj` : fallback;
}

function supportsProjectFileOpen() {
	return typeof globalThis.showOpenFilePicker === "function";
}

function supportsProjectFileSave() {
	return typeof globalThis.showSaveFilePicker === "function";
}

function getProjectPickerTypes() {
	return [
		{
			description: "CAMERA_FRAMES Project",
			accept: {
				[PROJECT_PICKER_MIME]: [".ssproj"],
			},
		},
	];
}

async function pickProjectFileHandle() {
	if (!supportsProjectFileOpen()) {
		throw new Error("Project file picker is not supported in this browser.");
	}

	const [fileHandle] = await globalThis.showOpenFilePicker({
		multiple: false,
		types: getProjectPickerTypes(),
	});
	return fileHandle ?? null;
}

async function pickProjectSaveHandle(suggestedName) {
	if (!supportsProjectFileSave()) {
		return null;
	}

	return globalThis.showSaveFilePicker({
		suggestedName,
		types: getProjectPickerTypes(),
	});
}

async function writeProjectFileHandle(fileHandle, bytes) {
	const writable = await fileHandle.createWritable();
	await writable.write(bytes);
	await writable.close();
}

async function isLegacyCameraFramesProjectSource(source) {
	try {
		const reader = await ZipReader.from(source);
		const archivePaths = reader
			.listFilenames()
			.map((path) => path.toLowerCase());
		return (
			!archivePaths.includes("manifest.json") &&
			archivePaths.includes("document.json")
		);
	} catch {
		return false;
	}
}

function buildPackageProgressOverlay(t, phase, detail = "") {
	const steps = [
		{
			id: "collect-state",
			label: t("overlay.packagePhaseCollect"),
		},
		{
			id: "resolve-assets",
			label: t("overlay.packagePhaseResolve"),
		},
		{
			id: "compress-splats",
			label: t("overlay.packagePhaseCompress"),
		},
		{
			id: "write-package",
			label: t("overlay.packagePhaseWrite"),
		},
	];
	const phaseIndex = steps.findIndex((step) => step.id === phase);

	return {
		kind: "progress",
		title: t("overlay.packageSaveTitle"),
		message: t("overlay.packageSaveMessage"),
		detail,
		steps: steps.map((step, index) => ({
			label: step.label,
			status:
				index < phaseIndex
					? "done"
					: index === phaseIndex
						? "active"
						: "pending",
		})),
	};
}

function buildWorkingSaveRecord({
	projectId,
	projectName,
	packageRevision,
	packageFingerprint,
	projectSnapshot,
	workingSceneSnapshot,
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
			scene: {
				assets: workingSceneSnapshot.assets,
				selectedAssetKeys: workingSceneSnapshot.selectedAssetKeys,
				activeAssetKey: workingSceneSnapshot.activeAssetKey,
				referenceImages: normalizedProject.scene.referenceImages,
			},
		},
	};
}

function resolveProjectIdentity(project, fallbackFingerprint = "") {
	const normalizedProject = normalizeProjectDocument(project);
	return {
		projectId:
			normalizedProject.projectId || fallbackFingerprint || generateProjectId(),
		packageRevision: normalizedProject.packageRevision ?? 0,
	};
}

function isWorkingStateCompatible(
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

function isQuotaExceededError(error) {
	const name = String(error?.name ?? "");
	const message = String(error?.message ?? error ?? "");
	return (
		name === "QuotaExceededError" ||
		name === "NS_ERROR_DOM_QUOTA_REACHED" ||
		message.includes("QuotaExceededError") ||
		message.includes("NS_ERROR_DOM_QUOTA_REACHED")
	);
}

export function createProjectController({
	store,
	projectInput,
	assetController,
	applySavedProjectState,
	applyOpenedProject,
	buildProjectFilename = () => getDefaultProjectFilename(),
	captureProjectState,
	clearHistory,
	updateUi,
	setStatus,
	t,
}) {
	let projectFileHandle = null;
	let currentProjectId = "";
	let currentPackageRevision = 0;
	let currentPackageFingerprint = "";
	let currentProjectName = "";
	let preferredPackageSaveOptions = {
		compressSplatsToSog: false,
		sogMaxShBands: DEFAULT_SOG_MAX_SH_BANDS,
		sogIterations: DEFAULT_SOG_ITERATIONS,
	};

	function setOverlay(nextOverlay) {
		store.overlay.value = nextOverlay;
	}

	function clearOverlay() {
		store.overlay.value = null;
	}

	function rememberProjectContext({
		projectId = "",
		packageRevision = 0,
		packageFingerprint = "",
		projectName = "",
		fileHandle = null,
	} = {}) {
		currentProjectId = String(projectId ?? "").trim();
		currentPackageRevision =
			Number.isFinite(packageRevision) && packageRevision >= 0
				? Math.floor(packageRevision)
				: 0;
		currentPackageFingerprint = String(packageFingerprint ?? "").trim();
		currentProjectName = String(projectName ?? "").trim();
		projectFileHandle = fileHandle ?? projectFileHandle;
	}

	function clearProjectContext() {
		projectFileHandle = null;
		currentProjectId = "";
		currentPackageRevision = 0;
		currentPackageFingerprint = "";
		currentProjectName = "";
	}

	function getSuggestedPackageFilename() {
		if (projectFileHandle?.name) {
			return ensureProjectFileName(
				projectFileHandle.name,
				buildProjectFilename(),
			);
		}
		if (currentProjectName) {
			return ensureProjectFileName(currentProjectName, buildProjectFilename());
		}
		return ensureProjectFileName(buildProjectFilename());
	}

	async function applyWorkingStateRecord(record) {
		if (!record?.snapshot) {
			return false;
		}

		applySavedProjectState({
			workspace: record.snapshot.workspace,
			shotCameras: record.snapshot.shotCameras,
		});
		await assetController.applyWorkingProjectSceneState(record.snapshot.scene);
		updateUi?.();
		clearHistory?.();
		return true;
	}

	async function tryApplyCompatibleWorkingState(projectContext) {
		if (
			!supportsWorkingProjectStateStorage() ||
			!projectContext.projectId ||
			!projectContext.packageFingerprint
		) {
			return false;
		}

		const record = await readCameraFramesWorkingState(projectContext.projectId);
		if (!isWorkingStateCompatible(record, projectContext)) {
			return false;
		}

		await applyWorkingStateRecord(record);
		setStatus(
			t("status.workingStateRestored", {
				name: projectContext.projectName || "",
			}),
		);
		return true;
	}

	async function runWorkingStateCleanup(
		keepProjectId = currentProjectId,
		{ maxProjects, maxBytes } = {},
	) {
		if (!supportsWorkingProjectStateStorage()) {
			return null;
		}
		return await cleanupCameraFramesWorkingState({
			keepProjectId,
			maxProjects,
			maxBytes,
		});
	}

	async function openParsedProject(
		parsedProject,
		{
			projectName = "",
			fileHandle = null,
			loadedStatus = t("status.projectLoaded"),
		} = {},
	) {
		const packageFingerprint = await buildProjectFingerprint(
			parsedProject.project,
		);
		const projectIdentity = resolveProjectIdentity(
			parsedProject.project,
			packageFingerprint,
		);
		await applyOpenedProject(parsedProject, {
			projectName,
			loadedStatus,
		});
		rememberProjectContext({
			projectId: projectIdentity.projectId,
			packageRevision: projectIdentity.packageRevision,
			packageFingerprint,
			projectName,
			fileHandle,
		});
		await tryApplyCompatibleWorkingState({
			projectId: projectIdentity.projectId,
			packageRevision: projectIdentity.packageRevision,
			packageFingerprint,
			projectName,
		});
		return true;
	}

	async function openProjectSource(source, { fileHandle = null } = {}) {
		const projectName = getProjectBaseName(source?.name || fileHandle?.name);
		try {
			const parsedProject = await readCameraFramesProject(source);
			return openParsedProject(parsedProject, {
				projectName,
				fileHandle,
			});
		} catch (error) {
			if (!(await isLegacyCameraFramesProjectSource(source))) {
				throw error;
			}

			await assetController.loadSources([source], true);
			const projectSnapshot = captureProjectState();
			const normalizedProject = normalizeProjectDocument(projectSnapshot);
			const projectId =
				currentProjectId || normalizedProject.projectId || generateProjectId();
			normalizedProject.projectId = projectId;
			normalizedProject.packageRevision = 0;
			const packageFingerprint =
				await buildProjectFingerprint(normalizedProject);
			rememberProjectContext({
				projectId,
				packageRevision: 0,
				packageFingerprint,
				projectName,
				fileHandle,
			});
			await tryApplyCompatibleWorkingState({
				projectId,
				packageRevision: 0,
				packageFingerprint,
				projectName,
			});
			setStatus(t("status.projectLoaded"));
			return true;
		}
	}

	async function saveWorkingState() {
		if (
			!supportsWorkingProjectStateStorage() ||
			!currentProjectId ||
			!currentPackageFingerprint
		) {
			return exportProject();
		}

		const projectSnapshot = captureProjectState();
		const record = buildWorkingSaveRecord({
			projectId: currentProjectId,
			projectName:
				currentProjectName || getProjectBaseName(buildProjectFilename()),
			packageRevision: currentPackageRevision,
			packageFingerprint: currentPackageFingerprint,
			projectSnapshot,
			workingSceneSnapshot: assetController.captureWorkingProjectSceneState(),
		});
		const commitWorkingSave = async () => {
			await saveCameraFramesWorkingState(record);
			await runWorkingStateCleanup(currentProjectId);
		};
		try {
			await commitWorkingSave();
		} catch (error) {
			if (!isQuotaExceededError(error)) {
				throw error;
			}
			await runWorkingStateCleanup(currentProjectId, {
				maxProjects: 1,
				maxBytes: 0,
			});
			await commitWorkingSave();
		}
		setStatus(
			t("status.workingStateSaved", {
				name: record.projectName || "",
			}),
		);
	}

	async function resolvePackageSaveTarget(
		suggestedName,
		{ saveMode = "auto" } = {},
	) {
		if (saveMode === "overwrite") {
			if (!projectFileHandle) {
				throw new Error(t("error.projectPackageOverwriteUnavailable"));
			}
			return {
				fileHandle: projectFileHandle,
				fileName: projectFileHandle.name || suggestedName,
				saveMode: "overwrite",
			};
		}

		if (!supportsProjectFileSave()) {
			throw new Error(t("error.projectPackageSaveUnsupported"));
		}

		const nextFileHandle = await pickProjectSaveHandle(suggestedName);
		if (!nextFileHandle) {
			throw new Error(t("error.projectPackageSaveUnavailable"));
		}
		return {
			fileHandle: nextFileHandle,
			fileName: nextFileHandle.name || suggestedName,
			saveMode: "picker",
		};
	}

	async function writePackageArchive(archiveBytes, saveTarget) {
		await writeProjectFileHandle(saveTarget.fileHandle, archiveBytes);
		projectFileHandle = saveTarget.fileHandle;
		return saveTarget;
	}

	async function performPackageSave(
		values,
		{ saveMode = "auto", saveTarget = null } = {},
	) {
		const compressSplatsToSog = values.compressSplatsToSog === true;
		const sogMaxShBands = Number.parseInt(values.sogMaxShBands ?? "", 10);
		const sogIterations = Number.parseInt(values.sogIterations ?? "", 10);
		preferredPackageSaveOptions = {
			compressSplatsToSog,
			sogMaxShBands: [0, 1, 2, 3].includes(sogMaxShBands)
				? sogMaxShBands
				: DEFAULT_SOG_MAX_SH_BANDS,
			sogIterations: PACKAGE_SOG_ITERATION_OPTIONS.includes(sogIterations)
				? sogIterations
				: DEFAULT_SOG_ITERATIONS,
		};

		const projectSnapshot = captureProjectState();
		const normalizedProject = normalizeProjectDocument(projectSnapshot);
		normalizedProject.projectId =
			currentProjectId || normalizedProject.projectId || generateProjectId();
		normalizedProject.packageRevision = Math.max(0, currentPackageRevision) + 1;
		currentProjectName =
			currentProjectName || getProjectBaseName(buildProjectFilename());
		const suggestedName = getSuggestedPackageFilename();
		const resolvedSaveTarget =
			saveTarget ??
			(await resolvePackageSaveTarget(suggestedName, {
				saveMode,
			}));

		setOverlay(
			buildPackageProgressOverlay(
				t,
				"collect-state",
				t("overlay.packageDetailCollect"),
			),
		);
		await new Promise((resolve) => requestAnimationFrame(resolve));

		try {
			const packageResult = await buildCameraFramesProjectPackage(
				normalizedProject,
				{
					compressSplatsToSog: preferredPackageSaveOptions.compressSplatsToSog,
					sogMaxShBands: preferredPackageSaveOptions.sogMaxShBands,
					sogIterations: preferredPackageSaveOptions.sogIterations,
					onProgress: ({ phase, index, total, assetLabel }) => {
						const detail =
							assetLabel && total
								? t("overlay.packageDetailAsset", {
										index,
										total,
										name: assetLabel,
									})
								: "";
						setOverlay(buildPackageProgressOverlay(t, phase, detail));
					},
				},
			);

			setOverlay(
				buildPackageProgressOverlay(
					t,
					"write-package",
					t("overlay.packageDetailWrite"),
				),
			);
			const saveResult = await writePackageArchive(
				packageResult.archive,
				resolvedSaveTarget,
			);
			await deleteCameraFramesWorkingState(normalizedProject.projectId);
			await runWorkingStateCleanup();
			clearOverlay();
			rememberProjectContext({
				projectId: normalizedProject.projectId,
				packageRevision: normalizedProject.packageRevision,
				packageFingerprint: packageResult.packageFingerprint,
				projectName: getProjectBaseName(saveResult.fileName),
				fileHandle: saveResult.fileHandle,
			});
			setStatus(
				t("status.packageSaved", {
					name: saveResult.fileName || suggestedName,
				}),
			);
		} catch (error) {
			clearOverlay();
			if (error?.name === "AbortError") {
				return;
			}
			console.error(error);
			setStatus(error.message);
		}
	}

	async function exportProject() {
		const showOverwriteActions = Boolean(projectFileHandle);
		const suggestedName = getSuggestedPackageFilename();
		setOverlay({
			kind: "confirm",
			title: t("overlay.packageSaveTitle"),
			message: showOverwriteActions
				? t("overlay.packageSaveMessageWithOverwrite", {
						name: projectFileHandle?.name || getSuggestedPackageFilename(),
					})
				: t("overlay.packageSaveMessage"),
			fields: [
				{
					id: "compressSplatsToSog",
					type: "checkbox",
					label: t("overlay.packageFieldCompressSplats"),
					value: preferredPackageSaveOptions.compressSplatsToSog,
				},
				{
					id: "sogMaxShBands",
					type: "select",
					label: t("overlay.packageFieldSogShBands"),
					value: String(preferredPackageSaveOptions.sogMaxShBands),
					disabled: (values) => values.compressSplatsToSog !== true,
					options: [0, 1, 2, 3].map((value) => ({
						value: String(value),
						label: t(`overlay.packageSogShBands.${value}`),
					})),
				},
				{
					id: "sogIterations",
					type: "select",
					label: t("overlay.packageFieldSogIterations"),
					value: String(preferredPackageSaveOptions.sogIterations),
					disabled: (values) => values.compressSplatsToSog !== true,
					options: PACKAGE_SOG_ITERATION_OPTIONS.map((value) => ({
						value: String(value),
						label: t(`overlay.packageSogIterations.${value}`),
					})),
				},
			],
			actions: [
				{
					label: t("action.cancel"),
					onClick: () => clearOverlay(),
				},
				...(showOverwriteActions
					? [
							{
								label: t("action.savePackageAs"),
								onClick: async (values) => {
									clearOverlay();
									await performPackageSave(values, {
										saveMode: "save-as",
									});
								},
							},
							{
								label: t("action.overwritePackage"),
								primary: true,
								onClick: async (values) => {
									clearOverlay();
									await performPackageSave(values, {
										saveMode: "overwrite",
									});
								},
							},
						]
					: [
							{
								label: t("action.exportProject"),
								primary: true,
								submit: true,
							},
						]),
			],
			onSubmit: async (values) => {
				await performPackageSave(values);
			},
		});
	}

	async function openProject() {
		if (supportsProjectFileOpen()) {
			try {
				const fileHandle = await pickProjectFileHandle();
				if (!fileHandle) {
					return;
				}
				const file = await fileHandle.getFile();
				await openProjectSource(file, { fileHandle });
				return;
			} catch (error) {
				if (error?.name === "AbortError") {
					return;
				}
				console.error(error);
				setStatus(error.message);
				return;
			}
		}

		projectInput?.click?.();
	}

	async function openWorkingProject() {
		if (!supportsWorkingProjectStorage()) {
			setStatus(t("error.projectWorkingFolderUnsupported"));
			return;
		}

		try {
			const directoryHandle = await pickWorkingProjectDirectory();
			const parsedProject =
				await readCameraFramesWorkingProject(directoryHandle);
			await openParsedProject(parsedProject, {
				projectName: parsedProject.projectName,
				fileHandle: null,
				loadedStatus: t("status.projectLoadedFromFolder", {
					name: parsedProject.projectName || directoryHandle?.name || "",
				}),
			});
		} catch (error) {
			if (error?.name === "AbortError") {
				return;
			}
			console.error(error);
			setStatus(error.message);
		}
	}

	async function handleProjectInputChange(event) {
		const files = [...(event.currentTarget.files ?? [])];
		const projectFile = files[0] ?? null;
		if (!projectFile) {
			return;
		}

		try {
			await openProjectSource(projectFile);
		} catch (error) {
			console.error(error);
			setStatus(error.message);
		} finally {
			event.currentTarget.value = "";
		}
	}

	return {
		openProjectSource,
		saveProject: saveWorkingState,
		exportProject,
		openProject,
		openWorkingProject,
		handleProjectInputChange,
		clearProjectContext,
	};
}
