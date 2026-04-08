import { validateStartupUrls } from "../../engine/import-link-policy.js";

function createImportSteps(activeStep, t) {
	const steps = [
		{ key: "verify", label: t("overlay.importPhaseVerify") },
		{ key: "expand", label: t("overlay.importPhaseExpand") },
		{ key: "load", label: t("overlay.importPhaseLoad") },
		{ key: "apply", label: t("overlay.importPhaseApply") },
	];
	const activeIndex = steps.findIndex((step) => step.key === activeStep);
	return steps.map((step, index) => ({
		...step,
		status:
			index < activeIndex
				? "done"
				: index === activeIndex
					? "active"
					: "pending",
	}));
}

export function parseAssetImportInputUrls(value) {
	return String(value ?? "")
		.split(/[\r\n,\s]+/)
		.map((entry) => entry.trim())
		.filter((entry) => /^https?:\/\//i.test(entry));
}

export function getStandaloneProjectAssetSource(
	sources,
	{ openProjectSource = null, getExtension } = {},
) {
	if (typeof openProjectSource !== "function" || !Array.isArray(sources)) {
		return null;
	}
	if (sources.length !== 1) {
		return null;
	}
	const source = sources[0];
	if (typeof source === "string") {
		return null;
	}
	return getExtension(source) === "ssproj" ? source : null;
}

export function createAssetImportRuntime({
	store,
	t,
	setStatus,
	setOverlay,
	clearOverlay,
	openFiles,
	isProjectPackageSource,
	isProjectPackagePackedSplatSource,
	isProjectFilePackedSplatSource,
	extractProjectPackageAssets,
	openProjectSource = null,
	getExtension,
	getDisplayName,
	loadSplatFromSource,
	loadModelFromSource,
	getSceneAssetCount,
	clearScene,
	disposeDetachedSceneAssets,
	clearHistory,
	applyProjectPackageImport,
	placeAllCamerasAtHome,
	updateCameraSummary,
	updateUi,
	beginHistoryTransaction = () => false,
	commitHistoryTransaction = () => false,
	cancelHistoryTransaction = () => {},
}) {
	function showImportProgress(step, detail = "") {
		setOverlay({
			kind: "progress",
			title: t("overlay.importTitle"),
			message: t("overlay.importMessage"),
			detail,
			steps: createImportSteps(step, t),
		});
	}

	function showImportError(
		error,
		{
			title = t("overlay.importErrorTitle"),
			message = t("overlay.importErrorMessageGeneric"),
			urls = [],
		} = {},
	) {
		setOverlay({
			kind: "error",
			title,
			message,
			detail: error?.message || String(error),
			detailLabel: t("overlay.errorDetails"),
			urls,
			actions: [
				{
					label: t("action.openFiles"),
					onClick: () => {
						clearOverlay();
						openFiles();
					},
				},
				{
					label: t("action.close"),
					primary: true,
					onClick: () => clearOverlay(),
				},
			],
		});
	}

	function getBlockedStartupReasonLabel(reason) {
		switch (reason) {
			case "https-only":
				return t("overlay.blockedStartupReasonHttps");
			case "private-host":
				return t("overlay.blockedStartupReasonPrivate");
			default:
				return t("overlay.blockedStartupReasonInvalid");
		}
	}

	function showBlockedStartupUrls(blockedUrls) {
		const detail = blockedUrls
			.map(
				(entry) =>
					`${entry.url}\n${getBlockedStartupReasonLabel(entry.reason)}`,
			)
			.join("\n\n");

		setOverlay({
			kind: "error",
			title: t("overlay.blockedStartupTitle"),
			message: t("overlay.blockedStartupMessage"),
			detail,
			detailLabel: t("overlay.errorDetails"),
			actions: [
				{
					label: t("action.openFiles"),
					onClick: () => {
						clearOverlay();
						openFiles();
					},
				},
				{
					label: t("action.close"),
					primary: true,
					onClick: () => clearOverlay(),
				},
			],
		});
	}

	async function expandProjectPackageSources(sources, onProgress = null) {
		const expandedSources = [];
		const importStates = [];
		const packageSources = sources.filter((source) =>
			isProjectPackageSource(source),
		);
		let expandedPackageCount = 0;

		for (const source of sources) {
			if (!isProjectPackageSource(source)) {
				expandedSources.push(source);
				continue;
			}

			const packageName = getDisplayName(source);
			expandedPackageCount += 1;
			onProgress?.(
				"expand",
				t("overlay.importDetailExpandPackage", {
					index: expandedPackageCount,
					count: packageSources.length,
					name: packageName,
				}),
			);
			setStatus(t("status.expandingProjectPackage", { name: packageName }));
			const { files, importState } = await extractProjectPackageAssets(source);
			if (files.length === 0) {
				throw new Error(t("error.emptyProjectPackage", { name: packageName }));
			}
			expandedSources.push(...files);
			if (importState) {
				importStates.push(importState);
			}
			setStatus(
				t("status.expandedProjectPackage", {
					name: packageName,
					count: files.length,
				}),
			);
		}

		return {
			expandedSources,
			importStates,
		};
	}

	async function loadSource(source) {
		if (isProjectFilePackedSplatSource?.(source)) {
			return loadSplatFromSource(source);
		}
		if (isProjectPackagePackedSplatSource(source)) {
			return loadSplatFromSource(source);
		}

		const extension = getExtension(source);
		if (extension === "") {
			throw new Error(
				t("error.unsupportedFileType", { name: getDisplayName(source) }),
			);
		}
		if (
			["ply", "spz", "splat", "ksplat", "zip", "sog", "rad"].includes(extension)
		) {
			return loadSplatFromSource(source);
		}
		if (["glb", "gltf"].includes(extension)) {
			return loadModelFromSource(source);
		}
		throw new Error(
			t("error.unsupportedFileType", { name: getDisplayName(source) }),
		);
	}

	async function loadSources(
		sources,
		replace = false,
		{ onProgress = null, resetHistory = true } = {},
	) {
		if (!sources.length) {
			return;
		}

		onProgress?.("verify");
		const { expandedSources, importStates } = await expandProjectPackageSources(
			sources,
			onProgress,
		);
		if (!expandedSources.length) {
			return;
		}

		const hadAssetsBeforeLoad = getSceneAssetCount() > 0;

		if (replace) {
			clearScene();
		}

		setStatus(t("status.loadingItems", { count: expandedSources.length }));

		const CONCURRENCY = 3;
		let loaded = 0;
		let running = 0;
		let nextIndex = 0;
		const total = expandedSources.length;

		await new Promise((resolve, reject) => {
			function kick() {
				while (running < CONCURRENCY && nextIndex < total) {
					const index = nextIndex++;
					const source = expandedSources[index];
					running += 1;
					onProgress?.(
						"load",
						t("overlay.importDetailLoadAsset", {
							index: index + 1,
							count: total,
							name: getDisplayName(source),
						}),
					);
					loadSource(source).then(
						() => {
							loaded += 1;
							running -= 1;
							if (loaded === total) {
								resolve();
							} else {
								kick();
							}
						},
						(error) => reject(error),
					);
				}
			}
			if (total === 0) {
				resolve();
			} else {
				kick();
			}
		});

		onProgress?.("apply", t("overlay.importDetailApply"));
		const importedProjectState =
			(replace || !hadAssetsBeforeLoad) &&
			importStates.length > 0 &&
			applyProjectPackageImport(importStates.at(-1));
		disposeDetachedSceneAssets();
		if (resetHistory) {
			clearHistory();
		}

		if (!importedProjectState && (replace || !hadAssetsBeforeLoad)) {
			placeAllCamerasAtHome();
		} else {
			updateCameraSummary();
		}

		updateUi();
		setStatus(t("status.loadedItems", { count: loaded }));
	}

	async function runImportTask(
		sources,
		{ replace = false, clearRemoteInput = false } = {},
	) {
		const remoteUrls = sources.filter((source) => typeof source === "string");
		const standaloneProjectSource = getStandaloneProjectAssetSource(sources, {
			openProjectSource,
			getExtension,
		});
		try {
			if (standaloneProjectSource) {
				await openProjectSource(standaloneProjectSource);
				if (clearRemoteInput) {
					store.remoteUrl.value = "";
				}
				return true;
			}

			const historyLabel = "asset.import";
			const hasHistoryTransaction =
				beginHistoryTransaction?.(historyLabel) === true;
			showImportProgress("verify");
			try {
				await loadSources(sources, replace, {
					onProgress: (step, detail) => showImportProgress(step, detail),
					resetHistory: false,
				});
				if (hasHistoryTransaction) {
					commitHistoryTransaction?.(historyLabel);
				}
			} catch (error) {
				if (hasHistoryTransaction) {
					cancelHistoryTransaction?.();
				}
				throw error;
			}
			clearOverlay();
			if (clearRemoteInput) {
				store.remoteUrl.value = "";
			}
			return true;
		} catch (error) {
			console.error(error);
			setStatus(error.message);
			showImportError(error, {
				message:
					remoteUrls.length > 0
						? t("overlay.importErrorMessageRemote")
						: t("overlay.importErrorMessageGeneric"),
				urls: remoteUrls,
			});
			return false;
		}
	}

	async function loadRemoteUrls() {
		const urls = parseAssetImportInputUrls(store.remoteUrl.value);
		if (urls.length === 0) {
			setStatus(t("status.enterUrl"));
			return;
		}

		await runImportTask(urls, { clearRemoteInput: true });
	}

	async function importDroppedFiles(files) {
		if (!files?.length) {
			return false;
		}
		return runImportTask(files);
	}

	async function handleAssetInputChange(event) {
		const files = [...(event.currentTarget.files || [])];
		if (files.length === 0) {
			return;
		}

		try {
			await runImportTask(files);
		} finally {
			event.currentTarget.value = "";
		}
	}

	async function loadStartupUrls() {
		const params = new URLSearchParams(window.location.search);
		const urls = params.getAll("load").filter(Boolean);
		if (urls.length === 0) {
			return;
		}

		const validation = validateStartupUrls(urls);
		if (validation.blocked.length > 0) {
			showBlockedStartupUrls(validation.blocked);
			return;
		}

		setOverlay({
			kind: "confirm",
			title: t("overlay.startupImportTitle"),
			message: t("overlay.startupImportMessage"),
			urls: validation.allowed,
			actions: [
				{
					label: t("action.cancel"),
					onClick: () => clearOverlay(),
				},
				{
					label: t("action.continueLoad"),
					primary: true,
					onClick: async () => {
						await runImportTask(validation.allowed);
					},
				},
			],
		});
	}

	return {
		expandProjectPackageSources,
		loadSource,
		loadSources,
		loadRemoteUrls,
		importDroppedFiles,
		handleAssetInputChange,
		loadStartupUrls,
	};
}
