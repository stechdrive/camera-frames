import { prewarmSogCompressionWorker } from "../engine/sog-compress-worker-client.js";
import {
	buildProjectFingerprint,
	generateProjectId,
	getProjectSourceStableKey,
	normalizeProjectDocument,
} from "../project/document.js";
import {
	getDefaultProjectFilename,
	readCameraFramesProject,
	writeCameraFramesProjectPackageToWritable,
} from "../project/file/index.js";
import { ZipReader } from "../project/package-legacy.js";
import {
	cleanupCameraFramesWorkingState,
	deleteCameraFramesWorkingState,
	readCameraFramesWorkingState,
	saveCameraFramesWorkingState,
	supportsWorkingProjectStateStorage,
} from "../project/working-state.js";
import { getProjectStatusDisplay } from "../ui/project-status.js";
import {
	buildImportProgressDetail,
	buildImportProgressOverlay,
	buildPackageErrorOverlay,
	buildPackageProgressDetail,
	buildPackageProgressOverlay,
	waitForOverlayFrame,
} from "./project/overlays.js";
import {
	createSogCompressionUnavailableError,
	ensureProjectFileName,
	getProjectBaseName,
	getProjectPickerTypes,
	isLegacyCameraFramesProjectSource,
	pickProjectSaveHandle,
	supportsProjectFileSave,
	supportsSogCompression,
	writeProjectFileHandle,
} from "./project/picker-options.js";
import {
	buildWorkingSaveRecord,
	isQuotaExceededError,
	isWorkingStateCompatible,
	resolveProjectIdentity,
} from "./project/working-save-record.js";

const DEFAULT_SOG_MAX_SH_BANDS = 2;
const DEFAULT_SOG_ITERATIONS = 10;
const PACKAGE_SOG_ITERATION_OPTIONS = [4, 8, 10, 12, 16];
const WORKING_SAVE_NOTICE_STORAGE_KEY = "camera-frames.workingSaveNoticeSeen";

export function createProjectController({
	store,
	assetController,
	applySavedProjectState,
	applyOpenedProject,
	captureWorkingEditorState = () => null,
	applyWorkingEditorState = () => {},
	clearProjectSidecars = () => {},
	resetProjectWorkspace = () => {},
	flushDirtySplatSources = () => false,
	buildProjectFilename = () => getDefaultProjectFilename(),
	captureProjectState,
	clearHistory,
	updateUi,
	setStatus,
	t,
	prewarmSogCompressionWorkerImpl = prewarmSogCompressionWorker,
	supportsSogCompressionImpl = supportsSogCompression,
}) {
	let projectFileHandle = null;
	let currentProjectId = "";
	let currentPackageRevision = 0;
	let currentPackageFingerprint = "";
	let currentProjectName = "";
	let currentDirtySignature = "";
	let currentPackageDirtySignature = "";
	let pendingAfterSuccessfulSave = null;
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

	async function resolveSogCompressionAvailability({ logFailure = false } = {}) {
		if (!supportsSogCompressionImpl()) {
			return {
				available: false,
				reason: "webgpu-unavailable",
				error: null,
			};
		}
		try {
			await prewarmSogCompressionWorkerImpl();
			return {
				available: true,
				reason: "ready",
				error: null,
			};
		} catch (error) {
			if (logFailure) {
				console.warn(
					"[CAMERA_FRAMES] SOG worker warmup failed while checking package save availability.",
					error,
				);
			}
			return {
				available: false,
				reason: "worker-unavailable",
				error,
			};
		}
	}

	function getCompressSplatsFieldLabel(sogCompressionAvailability) {
		if (sogCompressionAvailability.available) {
			return t("overlay.packageFieldCompressSplats");
		}
		if (sogCompressionAvailability.reason === "worker-unavailable") {
			return t("overlay.packageFieldCompressSplatsWorkerUnavailable");
		}
		return t("overlay.packageFieldCompressSplatsDisabled");
	}

	function syncProjectPresentation(projectSnapshot = captureProjectState()) {
		store.project.name.value = currentProjectName;
		store.project.dirty.value = isProjectDirty(projectSnapshot);
		store.project.packageDirty.value = isPackageDirty(projectSnapshot);
	}

	function establishProjectDirtyBaseline(
		projectSnapshot = captureProjectState(),
	) {
		markCurrentProjectClean(projectSnapshot);
		syncProjectPresentation(projectSnapshot);
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
		currentDirtySignature = "";
		currentPackageDirtySignature = "";
		store.project.name.value = "";
		store.project.dirty.value = false;
		store.project.packageDirty.value = true;
	}

	function clearPendingAfterSuccessfulSave() {
		pendingAfterSuccessfulSave = null;
	}

	function getVisibleProjectSaveState() {
		const status = getProjectStatusDisplay(store, t);
		return {
			hasWorkingChanges: Boolean(status.projectDirty),
			hasPortableChanges:
				!status.projectDirty && Boolean(status.showProjectPackageDirty),
		};
	}

	async function confirmBeforeReplacingProject(proceed) {
		const { hasWorkingChanges, hasPortableChanges } =
			getVisibleProjectSaveState();
		if (!hasWorkingChanges && !hasPortableChanges) {
			await proceed?.();
			return true;
		}

		const canSaveWorkingStateDirectly =
			supportsWorkingProjectStateStorage() &&
			Boolean(currentProjectId) &&
			Boolean(currentPackageFingerprint) &&
			!hasPortableChanges;

		setOverlay({
			kind: "confirm",
			title: t("overlay.openProjectTitle"),
			message: hasPortableChanges
				? t("overlay.openProjectMessageWithPackage")
				: canSaveWorkingStateDirectly
					? t("overlay.openProjectMessage")
					: t("overlay.openProjectMessageWithPackage"),
			actions: [
				{
					label: t("action.cancel"),
					onClick: () => {
						clearPendingAfterSuccessfulSave();
						clearOverlay();
					},
				},
				{
					label: t("action.discardAndOpenProject"),
					onClick: async () => {
						clearPendingAfterSuccessfulSave();
						clearOverlay();
						await proceed?.();
					},
				},
				{
					label: canSaveWorkingStateDirectly
						? t("action.saveAndOpenProject")
						: t("action.savePackageAndOpenProject"),
					primary: true,
					onClick: async () => {
						clearOverlay();
						pendingAfterSuccessfulSave = async () => {
							await proceed?.();
						};
						if (canSaveWorkingStateDirectly) {
							await saveWorkingState();
							return;
						}
						await exportProject();
					},
				},
			],
		});
		return false;
	}

	function serializeProjectSourceForDirty(source) {
		if (!source || typeof source !== "object") {
			return null;
		}

		return {
			sourceType: source.sourceType ?? null,
			kind: source.kind ?? null,
			fileName: source.fileName ?? source.file?.name ?? source.name ?? null,
			path: source.path ?? null,
			url: source.url ?? null,
			resourceId: source.resource?.id ?? source.resourceId ?? null,
			resourcePath: source.resource?.path ?? null,
			stableKey: getProjectSourceStableKey(source) ?? null,
		};
	}

	function buildProjectDirtyPayload(projectSnapshot) {
		const normalizedProject = normalizeProjectDocument(projectSnapshot);
		return {
			workspace: normalizedProject.workspace,
			shotCameras: normalizedProject.shotCameras,
			scene: {
				assets: normalizedProject.scene.assets.map((asset) => ({
					...asset,
					source: serializeProjectSourceForDirty(asset.source),
				})),
				lighting: normalizedProject.scene.lighting,
				referenceImages: normalizedProject.scene.referenceImages,
			},
		};
	}

	function getProjectDirtySignature(projectSnapshot = captureProjectState()) {
		return JSON.stringify(buildProjectDirtyPayload(projectSnapshot));
	}

	function markCurrentProjectClean(projectSnapshot = captureProjectState()) {
		currentDirtySignature = getProjectDirtySignature(projectSnapshot);
	}

	function markCurrentPackageClean(projectSnapshot = captureProjectState()) {
		currentPackageDirtySignature = getProjectDirtySignature(projectSnapshot);
	}

	function isProjectDirty(projectSnapshot = captureProjectState()) {
		const nextSignature = getProjectDirtySignature(projectSnapshot);
		if (!currentDirtySignature) {
			currentDirtySignature = nextSignature;
			return false;
		}
		return nextSignature !== currentDirtySignature;
	}

	function isPackageDirty(projectSnapshot = captureProjectState()) {
		if (!currentPackageFingerprint) {
			return true;
		}
		const nextSignature = getProjectDirtySignature(projectSnapshot);
		if (!currentPackageDirtySignature) {
			currentPackageDirtySignature = nextSignature;
			return false;
		}
		return nextSignature !== currentPackageDirtySignature;
	}

	function hasMeaningfulProjectContent(
		projectSnapshot = captureProjectState(),
	) {
		const normalizedProject = normalizeProjectDocument(projectSnapshot);
		const referenceImages = normalizedProject.scene?.referenceImages ?? null;
		const referenceImageCount =
			(referenceImages?.assets?.length ?? 0) +
			(referenceImages?.presets?.reduce(
				(total, preset) => total + (preset?.items?.length ?? 0),
				0,
			) ?? 0);
		return (
			normalizedProject.scene.assets.length > 0 ||
			referenceImageCount > 0 ||
			normalizedProject.shotCameras.length > 1 ||
			Boolean(currentProjectName) ||
			Boolean(projectFileHandle)
		);
	}

	function shouldWarnBeforeUnload(projectSnapshot = captureProjectState()) {
		if (isProjectDirty(projectSnapshot)) {
			return true;
		}
		return (
			hasMeaningfulProjectContent(projectSnapshot) &&
			isPackageDirty(projectSnapshot)
		);
	}

	function hasSeenWorkingSaveNotice() {
		if (typeof window === "undefined" || !window.localStorage) {
			return false;
		}
		return window.localStorage.getItem(WORKING_SAVE_NOTICE_STORAGE_KEY) === "1";
	}

	function markWorkingSaveNoticeSeen() {
		if (typeof window === "undefined" || !window.localStorage) {
			return;
		}
		window.localStorage.setItem(WORKING_SAVE_NOTICE_STORAGE_KEY, "1");
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
			scene: {
				referenceImages: record.snapshot.scene?.referenceImages ?? null,
			},
		});
		await assetController.applyWorkingProjectSceneState(record.snapshot.scene);
		applyWorkingEditorState(record.snapshot.editorState ?? null);
		updateUi?.();
		clearHistory?.();
		syncProjectPresentation(captureProjectState());
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
		markCurrentProjectClean(captureProjectState());
		syncProjectPresentation(captureProjectState());
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
		try {
			await applyOpenedProject(parsedProject, {
				projectName,
				loadedStatus,
				onAssetProgress: (step, detail = "") => {
					setOverlay(buildImportProgressOverlay(t, step, detail));
				},
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
			await tryApplyCompatibleWorkingState({
				projectId: projectIdentity.projectId,
				packageRevision: projectIdentity.packageRevision,
				packageFingerprint,
				projectName,
			});
			markCurrentProjectClean(captureProjectState());
			syncProjectPresentation(captureProjectState());
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
			const parsedProject = await readCameraFramesProject(source, {
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
			return openParsedProject(parsedProject, {
				projectName,
				fileHandle,
			});
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
				currentProjectId || normalizedProject.projectId || generateProjectId();
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
			await tryApplyCompatibleWorkingState({
				projectId,
				packageRevision: 0,
				packageFingerprint,
				projectName,
			});
			markCurrentProjectClean(captureProjectState());
			syncProjectPresentation(captureProjectState());
			setStatus(t("status.projectLoaded"));
			return true;
		}
	}

	async function saveWorkingState() {
		flushDirtySplatSources?.();
		const projectSnapshot = captureProjectState();
		const canUseWorkingSaveDirectly =
			supportsWorkingProjectStateStorage() &&
			Boolean(currentProjectId) &&
			Boolean(currentPackageFingerprint);
		if (canUseWorkingSaveDirectly && !hasSeenWorkingSaveNotice()) {
			setOverlay({
				kind: "confirm",
				title: t("overlay.workingSaveNoticeTitle"),
				message: t("overlay.workingSaveNoticeMessage"),
				actions: [
					{
						label: t("action.cancel"),
						onClick: () => {
							clearPendingAfterSuccessfulSave();
							clearOverlay();
						},
					},
					{
						label: t("action.continueSave"),
						primary: true,
						onClick: async () => {
							markWorkingSaveNoticeSeen();
							clearOverlay();
							await saveWorkingState();
						},
					},
				],
			});
			return;
		}

		if (
			!supportsWorkingProjectStateStorage() ||
			!currentProjectId ||
			!currentPackageFingerprint
		) {
			return exportProject();
		}
		const record = buildWorkingSaveRecord({
			projectId: currentProjectId,
			projectName:
				currentProjectName || getProjectBaseName(buildProjectFilename()),
			packageRevision: currentPackageRevision,
			packageFingerprint: currentPackageFingerprint,
			projectSnapshot,
			workingSceneSnapshot: assetController.captureWorkingProjectSceneState(),
			workingEditorSnapshot: captureWorkingEditorState(),
		});
		const commitWorkingSave = async () => {
			await saveCameraFramesWorkingState(record);
			await runWorkingStateCleanup(currentProjectId);
		};
		try {
			await commitWorkingSave();
		} catch (error) {
			clearPendingAfterSuccessfulSave();
			if (!isQuotaExceededError(error)) {
				throw error;
			}
			await runWorkingStateCleanup(currentProjectId, {
				maxProjects: 1,
				maxBytes: 0,
			});
			await commitWorkingSave();
		}
		markCurrentProjectClean(projectSnapshot);
		syncProjectPresentation(projectSnapshot);
		setStatus(
			t("status.workingStateSaved", {
				name: record.projectName || "",
			}),
		);
		const nextAction = pendingAfterSuccessfulSave;
		clearPendingAfterSuccessfulSave();
		if (typeof nextAction === "function") {
			await nextAction();
		}
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

	async function performPackageSave(
		values,
		{ saveMode = "auto", saveTarget = null } = {},
	) {
		const progressStartedAt = Date.now();
		flushDirtySplatSources?.();
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
		try {
			if (compressSplatsToSog) {
				const sogCompressionAvailability =
					await resolveSogCompressionAvailability({
						logFailure: true,
					});
				if (!sogCompressionAvailability.available) {
					throw sogCompressionAvailability.reason === "webgpu-unavailable"
						? new Error(t("error.sogCompressionRequiresWebGpu"))
						: createSogCompressionUnavailableError(t);
				}
			}
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
					{ startedAt: progressStartedAt },
				),
			);
			await new Promise((resolve) => requestAnimationFrame(resolve));

			const writable = await resolvedSaveTarget.fileHandle.createWritable();
			let packageResult = null;
			try {
				packageResult = await writeCameraFramesProjectPackageToWritable(
					normalizedProject,
					writable,
					{
						compressSplatsToSog:
							preferredPackageSaveOptions.compressSplatsToSog,
						sogMaxShBands: preferredPackageSaveOptions.sogMaxShBands,
						sogIterations: preferredPackageSaveOptions.sogIterations,
						onProgress: async (progress) => {
							const detail = buildPackageProgressDetail(t, progress);
							setOverlay(
								buildPackageProgressOverlay(t, progress.phase, detail, {
									startedAt: progressStartedAt,
								}),
							);
							await waitForOverlayFrame();
						},
					},
				);
				await writable.close();
			} catch (error) {
				try {
					await writable.abort?.();
				} catch {}
				throw error;
			}

			projectFileHandle = resolvedSaveTarget.fileHandle;
			await deleteCameraFramesWorkingState(normalizedProject.projectId);
			await runWorkingStateCleanup();
			clearOverlay();
			rememberProjectContext({
				projectId: normalizedProject.projectId,
				packageRevision: normalizedProject.packageRevision,
				packageFingerprint: packageResult.packageFingerprint,
				projectName: getProjectBaseName(resolvedSaveTarget.fileName),
				fileHandle: resolvedSaveTarget.fileHandle,
			});
			markCurrentProjectClean(normalizedProject);
			markCurrentPackageClean(normalizedProject);
			syncProjectPresentation(normalizedProject);
			setStatus(
				t("status.packageSaved", {
					name: resolvedSaveTarget.fileName || suggestedName,
				}),
			);
			const nextAction = pendingAfterSuccessfulSave;
			clearPendingAfterSuccessfulSave();
			if (typeof nextAction === "function") {
				await nextAction();
			}
		} catch (error) {
			clearPendingAfterSuccessfulSave();
			if (error?.name === "AbortError") {
				clearOverlay();
				return;
			}
			console.error(error);
			const overlay = buildPackageErrorOverlay(t, error);
			overlay.actions[0].onClick = () => clearOverlay();
			setOverlay(overlay);
			setStatus(error.message);
		}
	}

	async function exportProject() {
		const showOverwriteActions = Boolean(projectFileHandle);
		const sogCompressionAvailability = await resolveSogCompressionAvailability({
			logFailure: true,
		});
		const canCompressSplatsToSog = sogCompressionAvailability.available;
		const compressSplatsDefault = canCompressSplatsToSog
			? preferredPackageSaveOptions.compressSplatsToSog
			: false;
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
					label: getCompressSplatsFieldLabel(sogCompressionAvailability),
					value: compressSplatsDefault,
					disabled: !canCompressSplatsToSog,
				},
				{
					id: "sogMaxShBands",
					type: "select",
					label: t("overlay.packageFieldSogShBands"),
					value: String(preferredPackageSaveOptions.sogMaxShBands),
					disabled: (values) =>
						!canCompressSplatsToSog || values.compressSplatsToSog !== true,
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
					disabled: (values) =>
						!canCompressSplatsToSog || values.compressSplatsToSog !== true,
					options: PACKAGE_SOG_ITERATION_OPTIONS.map((value) => ({
						value: String(value),
						label: t(`overlay.packageSogIterations.${value}`),
					})),
				},
			],
			actions: [
				{
					label: t("action.cancel"),
					onClick: () => {
						clearPendingAfterSuccessfulSave();
						clearOverlay();
					},
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

	async function performNewProjectReset() {
		clearProjectContext();
		resetProjectWorkspace?.();
		const projectSnapshot = captureProjectState();
		markCurrentProjectClean(projectSnapshot);
		syncProjectPresentation(projectSnapshot);
		setStatus(t("status.newProjectReady"));
	}

	async function startNewProject() {
		const { hasWorkingChanges, hasPortableChanges } =
			getVisibleProjectSaveState();
		if (!hasWorkingChanges && !hasPortableChanges) {
			await performNewProjectReset();
			return;
		}

		const canSaveWorkingStateDirectly =
			supportsWorkingProjectStateStorage() &&
			Boolean(currentProjectId) &&
			Boolean(currentPackageFingerprint) &&
			!hasPortableChanges;
		setOverlay({
			kind: "confirm",
			title: t("overlay.newProjectTitle"),
			message: hasPortableChanges
				? t("overlay.newProjectMessageWithPackage")
				: canSaveWorkingStateDirectly
					? t("overlay.newProjectMessage")
					: t("overlay.newProjectMessageWithPackage"),
			actions: [
				{
					label: t("action.cancel"),
					onClick: () => {
						clearPendingAfterSuccessfulSave();
						clearOverlay();
					},
				},
				{
					label: t("action.discardAndNewProject"),
					onClick: async () => {
						clearPendingAfterSuccessfulSave();
						clearOverlay();
						await performNewProjectReset();
					},
				},
				{
					label: canSaveWorkingStateDirectly
						? t("action.saveAndNewProject")
						: t("action.savePackageAndNewProject"),
					primary: true,
					onClick: async () => {
						clearOverlay();
						pendingAfterSuccessfulSave = async () => {
							await performNewProjectReset();
						};
						if (canSaveWorkingStateDirectly) {
							await saveWorkingState();
							return;
						}
						await exportProject();
					},
				},
			],
		});
	}

	return {
		openProjectSource,
		saveProject: saveWorkingState,
		exportProject,
		startNewProject,
		isProjectDirty,
		isPackageDirty,
		shouldWarnBeforeUnload,
		syncProjectPresentation,
		clearProjectContext,
		establishProjectDirtyBaseline,
	};
}
