import { getProjectStatusDisplay } from "../app/project-status.js";
import {
	buildSparkRadBundleFromPackedSplats,
	supportsSparkRadBundleBuild,
} from "../engine/rad-build-worker-client.js";
import { prewarmSogCompressionWorker } from "../engine/sog-compress-worker-client.js";
import {
	bakeSparkPackedSplatsLod,
	captureSparkPackedSplatsLod,
} from "../engine/spark-integration/spark-packed-splats-adapter.js";
import {
	generateProjectId,
	isProjectFileEmbeddedFileSource,
	normalizeProjectDocument,
} from "../project/document.js";
import {
	getDefaultProjectFilename,
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
import { createProjectDirtyStateController } from "./project/dirty-state.js";
import { createProjectOpenWorkflow } from "./project/open-workflow.js";
import {
	buildPackageErrorOverlay,
	buildPackageProgressDetail,
	buildPackageProgressOverlay,
	waitForOverlayFrame,
} from "./project/overlays.js";
import { createProjectPackageSaveAssetsController } from "./project/package-save-assets.js";
import {
	createSogCompressionUnavailableError,
	ensureProjectFileName,
	getProjectBaseName,
	getProjectPickerTypes,
	pickProjectSaveHandle,
	supportsProjectFileSave,
	supportsSogCompression,
	writeProjectFileHandle,
} from "./project/picker-options.js";
import { cleanupStaleProjectOpenSources } from "./project/source-staging.js";
import {
	buildWorkingSaveRecord,
	isQuotaExceededError,
	isWorkingStateCompatible,
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
	supportsSparkRadBundleBuildImpl = supportsSparkRadBundleBuild,
	buildSparkRadBundleFromPackedSplatsImpl = buildSparkRadBundleFromPackedSplats,
	cleanupStaleProjectOpenSourcesImpl = cleanupStaleProjectOpenSources,
}) {
	let projectFileHandle = null;
	let currentProjectId = "";
	let currentPackageRevision = 0;
	let currentPackageFingerprint = "";
	let currentProjectName = "";
	let currentProjectSourceStagingCleanup = null;
	let pendingAfterSuccessfulSave = null;
	let preferredPackageSaveOptions = {
		saveMode: "fast",
		sogCompress: false,
		sogMaxShBands: DEFAULT_SOG_MAX_SH_BANDS,
		sogIterations: DEFAULT_SOG_ITERATIONS,
	};
	const {
		clearDirtyBaselines,
		markCurrentProjectClean,
		markCurrentPackageClean,
		isProjectDirty,
		isPackageDirty,
		hasMeaningfulProjectContent,
		shouldWarnBeforeUnload,
	} = createProjectDirtyStateController({
		captureProjectState,
		getCurrentPackageFingerprint: () => currentPackageFingerprint,
		getCurrentProjectName: () => currentProjectName,
		getProjectFileHandle: () => projectFileHandle,
	});

	function normalizeSaveMode(value) {
		return value === "quality" ? "quality" : "fast";
	}

	function setOverlay(nextOverlay) {
		store.overlay.value = nextOverlay;
	}

	const { getSceneBakedLodState, bakeAllSplatLodsForPackageSave } =
		createProjectPackageSaveAssetsController({
			assetController,
			setOverlay,
			t,
			bakeSparkPackedSplatsLodImpl: bakeSparkPackedSplatsLod,
			captureSparkPackedSplatsLodImpl: captureSparkPackedSplatsLod,
			supportsSparkRadBundleBuildImpl,
			buildSparkRadBundleFromPackedSplatsImpl,
		});

	function scheduleProjectSourceStagingSweep() {
		if (typeof cleanupStaleProjectOpenSourcesImpl !== "function") {
			return;
		}
		void Promise.resolve()
			.then(() => cleanupStaleProjectOpenSourcesImpl())
			.catch((error) => {
				console.warn(
					"[camera-frames] failed to clean up stale staged project sources.",
					error,
				);
			});
	}

	scheduleProjectSourceStagingSweep();

	function clearOverlay() {
		store.overlay.value = null;
	}

	async function resolveSogCompressionAvailability({
		logFailure = false,
	} = {}) {
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
		clearDirtyBaselines();
		store.project.name.value = "";
		store.project.dirty.value = false;
		store.project.packageDirty.value = true;
	}

	async function cleanupProjectSourceStaging(cleanup) {
		if (typeof cleanup !== "function") {
			return;
		}
		try {
			await cleanup();
		} catch (error) {
			console.warn(
				"[camera-frames] failed to clean up staged project source.",
				error,
			);
		}
	}

	async function replaceProjectSourceStaging(cleanup = null) {
		const previousCleanup = currentProjectSourceStagingCleanup;
		currentProjectSourceStagingCleanup =
			typeof cleanup === "function" ? cleanup : null;
		if (
			previousCleanup &&
			previousCleanup !== currentProjectSourceStagingCleanup
		) {
			await cleanupProjectSourceStaging(previousCleanup);
		}
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

	async function probeCompatibleWorkingState(projectContext) {
		if (
			!supportsWorkingProjectStateStorage() ||
			!projectContext.projectId ||
			!projectContext.packageFingerprint
		) {
			return null;
		}

		const record = await readCameraFramesWorkingState(projectContext.projectId);
		return isWorkingStateCompatible(record, projectContext) ? record : null;
	}

	async function applyProbedWorkingState(record, projectContext) {
		await applyWorkingStateRecord(record);
		const restoredSnapshot = captureProjectState();
		markCurrentProjectClean(restoredSnapshot);
		syncProjectPresentation(restoredSnapshot);
		setStatus(
			t("status.workingStateRestored", {
				name: projectContext.projectName || "",
			}),
		);
	}

	async function tryApplyCompatibleWorkingState(projectContext) {
		const record = await probeCompatibleWorkingState(projectContext);
		if (!record) {
			return false;
		}
		await applyProbedWorkingState(record, projectContext);
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

	const { openProjectSource } = createProjectOpenWorkflow({
		t,
		setOverlay,
		clearOverlay,
		setStatus,
		confirmBeforeReplacingProject,
		assetController,
		applyOpenedProject,
		clearProjectSidecars,
		captureProjectState,
		getCurrentProjectId: () => currentProjectId,
		probeCompatibleWorkingState,
		applyProbedWorkingState,
		rememberProjectContext,
		replaceProjectSourceStaging,
		markCurrentPackageClean,
		markCurrentProjectClean,
		syncProjectPresentation,
	});

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
		const packageSaveMode = normalizeSaveMode(values.saveMode);
		const bakeLod = packageSaveMode === "quality";
		// SOG is only meaningful in Fast mode — Quality always promotes sources
		// to raw-packed-splat to carry the baked LoD, which bypasses SOG's
		// embedded-file code path.
		const sogCompress =
			packageSaveMode === "fast" && values.sogCompress === true;
		const sogMaxShBands = Number.parseInt(values.sogMaxShBands ?? "", 10);
		const sogIterations = Number.parseInt(values.sogIterations ?? "", 10);
		preferredPackageSaveOptions = {
			saveMode: packageSaveMode,
			sogCompress: values.sogCompress === true,
			sogMaxShBands: [0, 1, 2, 3].includes(sogMaxShBands)
				? sogMaxShBands
				: DEFAULT_SOG_MAX_SH_BANDS,
			sogIterations: PACKAGE_SOG_ITERATION_OPTIONS.includes(sogIterations)
				? sogIterations
				: DEFAULT_SOG_ITERATIONS,
		};

		currentProjectName =
			currentProjectName || getProjectBaseName(buildProjectFilename());
		const suggestedName = getSuggestedPackageFilename();
		try {
			if (sogCompress) {
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

			await assetController.ensureFullDataForSplatAssets?.(null, {
				silent: true,
			});

			// Must run before captureProjectState — the bake mutates
			// `asset.source.lodSplats`, and the snapshot pipeline below
			// freezes whatever state the sources are in at capture time.
			// Capturing first meant serialize saw the pre-bake sources and
			// silently dropped the LoD bundle, so the ssproj ended up the
			// same size as an unbaked one.
			if (bakeLod) {
				await bakeAllSplatLodsForPackageSave({
					quality: true,
					startedAt: progressStartedAt,
				});
			}

			const projectSnapshot = captureProjectState();
			const normalizedProject = normalizeProjectDocument(projectSnapshot);
			normalizedProject.projectId =
				currentProjectId || normalizedProject.projectId || generateProjectId();
			normalizedProject.packageRevision =
				Math.max(0, currentPackageRevision) + 1;

			const writable = await resolvedSaveTarget.fileHandle.createWritable();
			let packageResult = null;
			try {
				packageResult = await writeCameraFramesProjectPackageToWritable(
					normalizedProject,
					writable,
					{
						compressSplatsToSog: sogCompress,
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
		const bakedLodState = getSceneBakedLodState();
		// If the scene already carries Quality-baked LoD, save-as-Fast would
		// keep it pass-through, so the radio can either default to Quality
		// (preserve & signal intent explicitly) or Fast (same effective output
		// via pass-through). We default to Quality when anything is baked so
		// the UI mirrors the actual state the user is about to keep.
		const preferredSaveMode = normalizeSaveMode(
			preferredPackageSaveOptions.saveMode,
		);
		const saveModeDefault = bakedLodState.hasAnyBaked
			? "quality"
			: preferredSaveMode;
		const hasAnyEmbeddedFileSource = (
			assetController?.getSceneAssets?.() ?? []
		).some(
			(asset) =>
				asset?.kind === "splat" &&
				isProjectFileEmbeddedFileSource(asset?.source),
		);
		const sogToggleAvailable =
			canCompressSplatsToSog && hasAnyEmbeddedFileSource;
		// If SOG was previously preferred but is no longer available (webgpu
		// gone or no pure PLY in this scene), untick it so the disclosure
		// reflects reality.
		const sogCompressDefault =
			sogToggleAvailable && preferredPackageSaveOptions.sogCompress;
		const qualityHint = bakedLodState.hasAnyQuality
			? t("overlay.packageSaveMode.qualityHintPreserve")
			: bakedLodState.hasAnyQuick
				? t("overlay.packageSaveMode.qualityHintUpgrade")
				: t("overlay.packageSaveMode.qualityHint");
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
					id: "saveMode",
					type: "radio",
					label: t("overlay.packageFieldSaveMode"),
					value: saveModeDefault,
					options: [
						{
							value: "fast",
							label: t("overlay.packageSaveMode.fast"),
							hint: t("overlay.packageSaveMode.fastHint"),
						},
						{
							value: "quality",
							label: t("overlay.packageSaveMode.quality"),
							hint: qualityHint,
						},
					],
				},
				{
					id: "advanced",
					type: "group",
					label: t("overlay.packageAdvancedOptions"),
					open: false,
					hidden: (values) => values.saveMode !== "fast" || !sogToggleAvailable,
					fields: [
						{
							id: "sogCompress",
							type: "checkbox",
							label: sogToggleAvailable
								? t("overlay.packageFieldSogCompress")
								: t("overlay.packageFieldSogCompressDisabled"),
							value: sogCompressDefault,
							disabled: !sogToggleAvailable,
						},
						{
							id: "sogMaxShBands",
							type: "select",
							label: t("overlay.packageFieldSogShBands"),
							value: String(preferredPackageSaveOptions.sogMaxShBands),
							disabled: (values) => values.sogCompress !== true,
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
							disabled: (values) => values.sogCompress !== true,
							options: PACKAGE_SOG_ITERATION_OPTIONS.map((value) => ({
								value: String(value),
								label: t(`overlay.packageSogIterations.${value}`),
							})),
						},
					],
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
		await replaceProjectSourceStaging(null);
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
