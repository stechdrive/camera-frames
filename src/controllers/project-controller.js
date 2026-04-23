import { prewarmSogCompressionWorker } from "../engine/sog-compress-worker-client.js";
import {
	bakeSparkPackedSplatsLod,
	captureSparkPackedSplatsLod,
} from "../engine/spark-integration/spark-packed-splats-adapter.js";
import {
	buildProjectFingerprint,
	createProjectFilePackedSplatSource,
	generateProjectId,
	getProjectSourceStableKey,
	isProjectFilePackedSplatSource,
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
		splatOptimization: "none",
		sogMaxShBands: DEFAULT_SOG_MAX_SH_BANDS,
		sogIterations: DEFAULT_SOG_ITERATIONS,
		lodQuality: "quick",
	};

	function normalizeSplatOptimization(value) {
		return value === "sog" || value === "bake-lod" ? value : "none";
	}

	function normalizeLodQuality(value) {
		return value === "quality" ? "quality" : "quick";
	}

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

	const dirtySignatureCache = new WeakMap();

	function getProjectDirtySignature(projectSnapshot = captureProjectState()) {
		const canCache =
			projectSnapshot !== null && typeof projectSnapshot === "object";
		if (canCache) {
			const cached = dirtySignatureCache.get(projectSnapshot);
			if (cached !== undefined) {
				return cached;
			}
		}
		const signature = JSON.stringify(buildProjectDirtyPayload(projectSnapshot));
		if (canCache) {
			dirtySignatureCache.set(projectSnapshot, signature);
		}
		return signature;
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

	function getSceneSplatAssetsForBake() {
		const assets = assetController?.getSceneAssets?.() ?? [];
		return assets.filter(
			(asset) =>
				asset?.kind === "splat" &&
				asset?.disposeTarget?.packedSplats != null,
		);
	}

	function attachBakedLodSplatsToAssetSource(asset, capture, metadata) {
		if (!asset || !capture) {
			return false;
		}
		const lodSplatsEntry = {
			...capture,
			bakedAt: metadata?.bakedAt ?? new Date().toISOString(),
			bakedQuality: metadata?.bakedQuality ?? "quick",
		};
		if (isProjectFilePackedSplatSource(asset.source)) {
			asset.source = createProjectFilePackedSplatSource({
				fileName: asset.source.fileName,
				inputBytes: asset.source.inputBytes ?? new Uint8Array(),
				extraFiles: asset.source.extraFiles ?? {},
				fileType: asset.source.fileType ?? null,
				packedArray: asset.source.packedArray ?? new Uint32Array(),
				numSplats: asset.source.numSplats ?? 0,
				extra: asset.source.extra ?? {},
				splatEncoding: asset.source.splatEncoding ?? null,
				lodSplats: lodSplatsEntry,
				projectAssetState: asset.source.projectAssetState ?? null,
				legacyState: asset.source.legacyState ?? null,
				resource: asset.source.resource ?? null,
				skipClone: true,
			});
			return true;
		}
		// untouched embedded file source (PLY/SPZ) — promote to packed-splat source
		// so the serializer writes the baked LoD alongside the runtime packedArray.
		const packedSplats = asset.disposeTarget?.packedSplats ?? null;
		if (!packedSplats) {
			return false;
		}
		asset.source = createProjectFilePackedSplatSource({
			fileName:
				asset.source?.fileName ??
				asset.source?.file?.name ??
				`${asset.label ?? "baked"}.rawsplat`,
			inputBytes: new Uint8Array(),
			extraFiles: {},
			fileType: asset.source?.fileType ?? null,
			packedArray: packedSplats.packedArray ?? new Uint32Array(),
			numSplats:
				packedSplats.getNumSplats?.() ?? packedSplats.numSplats ?? 0,
			extra: packedSplats.extra ?? {},
			splatEncoding: packedSplats.splatEncoding ?? null,
			lodSplats: lodSplatsEntry,
			projectAssetState: asset.source?.projectAssetState ?? null,
			legacyState: asset.source?.legacyState ?? null,
			resource: null,
			skipClone: true,
		});
		return true;
	}

	async function bakeAllSplatLodsForPackageSave({
		quality = false,
		startedAt = Date.now(),
	} = {}) {
		const assets = getSceneSplatAssetsForBake();
		const total = assets.length;
		if (total === 0) {
			return;
		}
		const bakedAt = new Date().toISOString();
		const bakedQuality = quality ? "quality" : "quick";
		for (let index = 0; index < total; index += 1) {
			const asset = assets[index];
			const assetLabel = asset.label || asset?.source?.fileName || "3DGS";
			setOverlay(
				buildPackageProgressOverlay(
					t,
					"collect-state",
					t("overlay.packageDetailBakeLod", {
						name: assetLabel,
						index: index + 1,
						total,
					}),
					{ startedAt },
				),
			);
			await waitForOverlayFrame();
			const packedSplats = asset?.disposeTarget?.packedSplats;
			if (!packedSplats) {
				continue;
			}
			await bakeSparkPackedSplatsLod(packedSplats, { quality });
			const capture = captureSparkPackedSplatsLod(packedSplats);
			if (capture) {
				attachBakedLodSplatsToAssetSource(asset, capture, {
					bakedAt,
					bakedQuality,
				});
			}
		}
	}

	async function performPackageSave(
		values,
		{ saveMode = "auto", saveTarget = null } = {},
	) {
		const progressStartedAt = Date.now();
		flushDirtySplatSources?.();
		const splatOptimization = normalizeSplatOptimization(
			values.splatOptimization,
		);
		const compressSplatsToSog = splatOptimization === "sog";
		const bakeLod = splatOptimization === "bake-lod";
		const lodQuality = normalizeLodQuality(values.lodQuality);
		const sogMaxShBands = Number.parseInt(values.sogMaxShBands ?? "", 10);
		const sogIterations = Number.parseInt(values.sogIterations ?? "", 10);
		preferredPackageSaveOptions = {
			splatOptimization,
			sogMaxShBands: [0, 1, 2, 3].includes(sogMaxShBands)
				? sogMaxShBands
				: DEFAULT_SOG_MAX_SH_BANDS,
			sogIterations: PACKAGE_SOG_ITERATION_OPTIONS.includes(sogIterations)
				? sogIterations
				: DEFAULT_SOG_ITERATIONS,
			lodQuality,
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

			if (bakeLod) {
				await bakeAllSplatLodsForPackageSave({
					quality: lodQuality === "quality",
					startedAt: progressStartedAt,
				});
			}

			const writable = await resolvedSaveTarget.fileHandle.createWritable();
			let packageResult = null;
			try {
				packageResult = await writeCameraFramesProjectPackageToWritable(
					normalizedProject,
					writable,
					{
						compressSplatsToSog:
							preferredPackageSaveOptions.splatOptimization === "sog",
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
		const preferredSplatOptimization = normalizeSplatOptimization(
			preferredPackageSaveOptions.splatOptimization,
		);
		const splatOptimizationDefault =
			preferredSplatOptimization === "sog" && !canCompressSplatsToSog
				? "none"
				: preferredSplatOptimization;
		const sogOptionLabel = canCompressSplatsToSog
			? t("overlay.packageSplatOptimization.sog")
			: t("overlay.packageSplatOptimization.sogDisabled");
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
					id: "splatOptimization",
					type: "radio",
					label: t("overlay.packageFieldSplatOptimization"),
					value: splatOptimizationDefault,
					options: [
						{
							value: "none",
							label: t("overlay.packageSplatOptimization.none"),
							hint: t("overlay.packageSplatOptimization.noneHint"),
						},
						{
							value: "sog",
							label: sogOptionLabel,
							hint: t("overlay.packageSplatOptimization.sogHint"),
							disabled: !canCompressSplatsToSog,
						},
						{
							value: "bake-lod",
							label: t("overlay.packageSplatOptimization.bakeLod"),
							hint: t("overlay.packageSplatOptimization.bakeLodHint"),
						},
					],
				},
				{
					id: "sogMaxShBands",
					type: "select",
					label: t("overlay.packageFieldSogShBands"),
					value: String(preferredPackageSaveOptions.sogMaxShBands),
					disabled: (values) => values.splatOptimization !== "sog",
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
					disabled: (values) => values.splatOptimization !== "sog",
					options: PACKAGE_SOG_ITERATION_OPTIONS.map((value) => ({
						value: String(value),
						label: t(`overlay.packageSogIterations.${value}`),
					})),
				},
				{
					id: "lodQuality",
					type: "select",
					label: t("overlay.packageFieldLodQuality"),
					value: normalizeLodQuality(preferredPackageSaveOptions.lodQuality),
					disabled: (values) => values.splatOptimization !== "bake-lod",
					options: [
						{
							value: "quick",
							label: t("overlay.packageLodQuality.quick"),
						},
						{
							value: "quality",
							label: t("overlay.packageLodQuality.quality"),
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
