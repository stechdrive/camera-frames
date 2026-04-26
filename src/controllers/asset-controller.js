import { prioritizeSceneAssetsWithinKinds } from "../engine/scene-asset-order.js";
import {
	createProjectFileEmbeddedFileSource,
	createProjectFilePackedSplatSource,
	getProjectSourceStableKey,
	isProjectFileEmbeddedFileSource,
	isProjectFilePackedSplatSource,
	sanitizeProjectAssetLabel,
} from "../project/document.js";
import { isProjectFileLazyResourceSource } from "../project/file/lazy-source.js";
import {
	isProjectPackageFileSource,
	isProjectPackagePackedSplatSource,
} from "../project/package-legacy.js";
import { createSceneAssetBoundsController } from "./scene-assets/bounds.js";
import { createSceneAssetAutoLodController } from "./scene-assets/auto-lod.js";
import { createSceneAssetDocumentMutationsController } from "./scene-assets/document-mutations.js";
import { createAssetImportRuntime } from "./scene-assets/import-runtime.js";
import { createSceneAssetLifecycle } from "./scene-assets/lifecycle.js";
import { createSceneAssetProjectStateHelpers } from "./scene-assets/project-state.js";
import { createSceneAssetSelectionOrderController } from "./scene-assets/selection-order.js";
import { createSceneAssetSourceLoadingController } from "./scene-assets/source-loading.js";
import { createSceneAssetStatePersistence } from "./scene-assets/state-persistence.js";
import { createSceneAssetTransformController } from "./scene-assets/transform-ops.js";

function captureObjectLocalTransformState(object) {
	if (!object) {
		return null;
	}

	return {
		position: {
			x: object.position.x,
			y: object.position.y,
			z: object.position.z,
		},
		quaternion: {
			x: object.quaternion.x,
			y: object.quaternion.y,
			z: object.quaternion.z,
			w: object.quaternion.w,
		},
		scale: {
			x: object.scale.x,
			y: object.scale.y,
			z: object.scale.z,
		},
	};
}

function applyObjectLocalTransformState(object, state) {
	if (!object || !state) {
		return;
	}

	object.position.set(
		Number(state?.position?.x ?? object.position.x),
		Number(state?.position?.y ?? object.position.y),
		Number(state?.position?.z ?? object.position.z),
	);
	object.quaternion.set(
		Number(state?.quaternion?.x ?? object.quaternion.x),
		Number(state?.quaternion?.y ?? object.quaternion.y),
		Number(state?.quaternion?.z ?? object.quaternion.z),
		Number(state?.quaternion?.w ?? object.quaternion.w),
	);
	object.scale.set(
		Number(state?.scale?.x ?? object.scale.x),
		Number(state?.scale?.y ?? object.scale.y),
		Number(state?.scale?.z ?? object.scale.z),
	);
	object.updateMatrixWorld(true);
}

export function buildUniqueSceneAssetDuplicateLabel(
	baseLabel,
	sceneAssets = [],
) {
	const existingLabels = new Set(
		(sceneAssets ?? [])
			.map((asset) => String(asset?.label ?? "").trim())
			.filter(Boolean),
	);
	const normalizedBaseLabel = sanitizeProjectAssetLabel(baseLabel, "Asset");
	const base = `${normalizedBaseLabel} Copy`;
	if (!existingLabels.has(base)) {
		return base;
	}
	let index = 2;
	while (existingLabels.has(`${base} ${index}`)) {
		index += 1;
	}
	return `${base} ${index}`;
}

function createDuplicateProjectAssetState(projectAssetState, duplicateLabel) {
	const normalizedLabel = sanitizeProjectAssetLabel(
		duplicateLabel,
		"Asset Copy",
	);
	if (!projectAssetState || typeof projectAssetState !== "object") {
		return {
			label: normalizedLabel,
		};
	}
	return {
		...projectAssetState,
		id: null,
		label: normalizedLabel,
	};
}

export function createDuplicateSceneAssetSource(
	asset,
	projectAssetState = null,
) {
	const source = asset?.source ?? null;
	const legacyState =
		source?.legacyState ?? projectAssetState?.legacyState ?? null;
	if (asset?.kind === "splat") {
		const packedSplats = asset?.disposeTarget?.packedSplats ?? null;
		if (packedSplats) {
			return createProjectFilePackedSplatSource({
				fileName:
					source?.fileName ??
					`${projectAssetState?.label ?? asset?.label ?? "3DGS"}.rawsplat`,
				inputBytes: source?.inputBytes ?? new Uint8Array(),
				extraFiles: source?.extraFiles ?? {},
				fileType: source?.fileType ?? null,
				packedArray: packedSplats.packedArray ?? new Uint32Array(),
				numSplats: packedSplats.getNumSplats?.() ?? packedSplats.numSplats ?? 0,
				extra: packedSplats.extra ?? {},
				splatEncoding: packedSplats.splatEncoding ?? null,
				projectAssetState,
				legacyState,
				resource: source?.resource ?? null,
			});
		}
		if (isProjectFilePackedSplatSource(source)) {
			return createProjectFilePackedSplatSource({
				fileName: source.fileName,
				inputBytes: source.inputBytes,
				extraFiles: source.extraFiles,
				fileType: source.fileType,
				packedArray: source.packedArray,
				numSplats: source.numSplats,
				extra: source.extra,
				splatEncoding: source.splatEncoding,
				projectAssetState,
				legacyState,
				resource: source.resource ?? null,
			});
		}
	}
	if (
		isProjectFileEmbeddedFileSource(source) ||
		isProjectPackageFileSource(source)
	) {
		return createProjectFileEmbeddedFileSource({
			kind: asset?.kind,
			file: source.file,
			fileName: source.fileName,
			projectAssetState,
			legacyState,
			resource: source.resource ?? null,
		});
	}
	return null;
}

export function createAssetController({
	sceneState,
	assetInput,
	store,
	loader,
	splatRoot,
	modelRoot,
	contentRoot,
	SplatMesh,
	setStatus,
	updateUi,
	updateCameraSummary,
	frameAllCameras,
	placeAllCamerasAtHome,
	resetLocalizedCaches,
	setExportStatus,
	t,
	formatAssetWorldScale,
	getDefaultAssetUnitMode,
	isProjectPackageSource,
	extractProjectPackageAssets,
	applyProjectPackageImport,
	openProjectSource = null,
	onSceneAssetSelectionChanged = null,
	disposeObject,
	runHistoryAction = (_label, applyChange) => {
		applyChange?.();
		return false;
	},
	beginHistoryTransaction = () => false,
	commitHistoryTransaction = () => false,
	cancelHistoryTransaction = () => {},
	clearHistory = () => {},
}) {
	const reportedSplatBoundsWarnings = new Set();
	const detachedSceneAssets = new Map();
	let sceneAssetSelectionAnchorId = null;

	function setOverlay(nextOverlay) {
		store.overlay.value = nextOverlay;
	}

	function clearOverlay() {
		store.overlay.value = null;
	}

	function reportSplatBoundsWarningOnce(asset, message, details) {
		if (!import.meta.env.DEV || !asset) {
			return;
		}

		const key = `${asset.id}:${message}`;
		if (reportedSplatBoundsWarnings.has(key)) {
			return;
		}

		reportedSplatBoundsWarnings.add(key);
		console.warn(`[CAMERA_FRAMES] ${message}`, {
			label: asset.label,
			...details,
		});
	}

	const {
		buildSplatLocalBoundsFromSource,
		buildSplatFramingBoundsFromSource,
		getSceneBounds,
		getSceneFramingBounds,
	} = createSceneAssetBoundsController({
		sceneState,
		reportSplatBoundsWarningOnce,
	});

	function getSceneAssetCounts() {
		let splatCount = 0;
		let modelCount = 0;

		for (const asset of sceneState.assets) {
			if (asset.kind === "splat") {
				splatCount += 1;
			} else if (asset.kind === "model") {
				modelCount += 1;
			}
		}

		return {
			splatCount,
			modelCount,
			totalCount: sceneState.assets.length,
		};
	}

	function getTotalLoadedItems() {
		return sceneState.assets.length;
	}

	function getSceneAssets() {
		return sceneState.assets;
	}

	const {
		registerAsset,
		applyAssetWorldScale,
		getSceneAsset,
		getSceneAssetForObject,
		getSceneRaycastTargets,
		clearScene,
		attachSceneAsset,
		detachSceneAsset,
		restoreSceneAsset,
		disposeSceneAsset,
		disposeDetachedSceneAssets,
	} = createSceneAssetLifecycle({
		sceneState,
		store,
		splatRoot,
		modelRoot,
		detachedSceneAssets,
		getDefaultAssetUnitMode,
		disposeObject,
		clearHistory,
		placeAllCamerasAtHome,
		resetLocalizedCaches,
		updateUi,
		setExportStatus,
		t,
		setStatus,
	});

	const {
		getSelectedSceneAssets,
		selectSceneAsset,
		clearSceneAssetSelection,
		moveAssetUp,
		moveAssetDown,
		moveAssetToIndex,
	} = createSceneAssetSelectionOrderController({
		sceneState,
		store,
		updateUi,
		onSelectionChanged: onSceneAssetSelectionChanged,
		setStatus,
		t,
		runHistoryAction,
		getSceneAsset,
		getSelectionAnchorId: () => sceneAssetSelectionAnchorId,
		setSelectionAnchorId: (nextAnchorId) => {
			sceneAssetSelectionAnchorId = nextAnchorId;
		},
	});

	const {
		clampAssetWorldScale,
		clampAssetTransformValue,
		normalizeWorkingPivotLocal,
		getAssetWorkingPivotLocal,
		getAssetWorkingPivotWorld,
		setAssetWorkingPivotWorld,
		resetAssetWorkingPivot,
		setAssetWorldScale,
		setAssetTransform,
		applyAssetTransformWorld,
		setAssetsTransformBulk,
		resetAssetWorldScale,
		resetSelectedSceneAssetsWorldScale,
		setAssetPosition,
		offsetSelectedSceneAssetsPosition,
		setAssetRotationDegrees,
		offsetSelectedSceneAssetsRotationDegrees,
		applyAssetTransform,
		scaleSelectedSceneAssetsByFactor,
	} = createSceneAssetTransformController({
		getSceneAsset,
		getSelectedSceneAssets,
		runHistoryAction,
		updateUi,
		setStatus,
		t,
		formatAssetWorldScale,
		applyAssetWorldScale,
		applyObjectLocalTransformState,
	});

	const {
		setAssetVisibility,
		setAssetLabel,
		deleteSelectedSceneAssets,
		setSelectedSceneAssetsVisibility,
		setAssetExportRole,
		setAssetMaskGroup,
	} = createSceneAssetDocumentMutationsController({
		sceneState,
		store,
		getSceneAsset,
		getSelectedSceneAssets,
		runHistoryAction,
		detachSceneAsset,
		setSelectionAnchorId: (nextAnchorId) => {
			sceneAssetSelectionAnchorId = nextAnchorId;
		},
		resetLocalizedCaches,
		updateCameraSummary,
		updateUi,
		setStatus,
		t,
	});

	const {
		getExtension,
		getLegacyState,
		getProjectAssetState,
		getLegacySplatCorrectionQuaternion,
		getDisplayName,
		fetchUrlAsFile,
		applyProjectAssetState,
		captureProjectSceneState,
	} = createSceneAssetProjectStateHelpers({
		sceneState,
		captureObjectLocalTransformState,
		applyObjectLocalTransformState,
		clampAssetWorldScale,
		clampAssetTransformValue,
		normalizeWorkingPivotLocal,
		applyAssetWorldScale,
	});

	function moveRegisteredAssetToIndex(asset, targetIndex) {
		if (!asset || !Number.isFinite(targetIndex)) {
			return;
		}
		const currentIndex = sceneState.assets.indexOf(asset);
		if (currentIndex === -1) {
			return;
		}
		const clampedIndex = Math.max(
			0,
			Math.min(sceneState.assets.length - 1, Math.floor(targetIndex)),
		);
		if (currentIndex === clampedIndex) {
			return;
		}
		sceneState.assets.splice(currentIndex, 1);
		sceneState.assets.splice(clampedIndex, 0, asset);
	}

	function getCapturedProjectAssetState(assetId) {
		return (
			captureProjectSceneState().find(
				(asset) => String(asset.id) === String(assetId),
			) ?? null
		);
	}

	function applySelectedSceneAssets(
		selectedAssetIds = [],
		activeAssetId = null,
	) {
		const normalizedSelectedIds = Array.from(
			new Set(
				(selectedAssetIds ?? []).filter((assetId) =>
					Boolean(getSceneAsset(assetId)),
				),
			),
		);
		const nextActiveAssetId = normalizedSelectedIds.includes(activeAssetId)
			? activeAssetId
			: (normalizedSelectedIds.at(-1) ?? null);
		sceneAssetSelectionAnchorId = nextActiveAssetId;
		store.selectedSceneAssetIds.value = normalizedSelectedIds;
		store.selectedSceneAssetId.value = nextActiveAssetId;
		onSceneAssetSelectionChanged?.({
			selectedAssetIds: [...normalizedSelectedIds],
			activeAssetId: nextActiveAssetId,
		});
	}

	const { kickAutoLodBake } = createSceneAssetAutoLodController({
		store,
		setStatus,
		t,
	});

	const {
		loadSplatFromSource,
		createSplatAssetFromSource,
		replaceSplatAssetFromSource,
		ensureFullDataForSplatAssets,
		loadModelFromSource,
	} = createSceneAssetSourceLoadingController({
		sceneState,
		loader,
		splatRoot,
		modelRoot,
		SplatMesh,
		registerAsset,
		getSceneAsset,
		disposeSceneAsset,
		getDisplayName,
		getLegacyState,
		getProjectAssetState,
		getLegacySplatCorrectionQuaternion,
		fetchUrlAsFile,
		applyProjectAssetState,
		buildSplatLocalBoundsFromSource,
		buildSplatFramingBoundsFromSource,
		moveRegisteredAssetToIndex,
		resetLocalizedCaches,
		updateCameraSummary,
		updateUi,
		setStatus,
		t,
		kickAutoLodBake,
	});

	function removeSceneAssets(assetIds = []) {
		const deleteIdSet = new Set(
			(assetIds ?? [])
				.map((assetId) => Number(assetId))
				.filter(Number.isFinite),
		);
		if (deleteIdSet.size === 0) {
			return false;
		}
		const deletedAssets = sceneState.assets.filter((asset) =>
			deleteIdSet.has(asset.id),
		);
		if (deletedAssets.length === 0) {
			return false;
		}
		sceneState.assets = sceneState.assets.filter(
			(asset) => !deleteIdSet.has(asset.id),
		);
		for (const asset of deletedAssets) {
			disposeSceneAsset(asset);
		}
		store.selectedSceneAssetIds.value =
			store.selectedSceneAssetIds.value.filter(
				(assetId) => !deleteIdSet.has(assetId),
			);
		store.selectedSceneAssetId.value =
			store.selectedSceneAssetIds.value.includes(
				store.selectedSceneAssetId.value,
			)
				? store.selectedSceneAssetId.value
				: (store.selectedSceneAssetIds.value[0] ?? null);
		resetLocalizedCaches();
		updateCameraSummary();
		updateUi();
		return true;
	}

	function prioritizeImportedSceneAssets(importedAssets = []) {
		const prioritizedAssetIds = importedAssets
			.map((asset) => asset?.id)
			.filter((assetId) => assetId !== null && assetId !== undefined);
		if (prioritizedAssetIds.length === 0) {
			return;
		}
		const nextSceneAssets = prioritizeSceneAssetsWithinKinds(
			sceneState.assets,
			prioritizedAssetIds,
		);
		if (nextSceneAssets !== sceneState.assets) {
			sceneState.assets = nextSceneAssets;
		}
	}

	function openFiles() {
		assetInput.click();
	}

	async function duplicateSelectedSceneAssets(assetIds = null) {
		const selectedIdSet = new Set(
			(Array.isArray(assetIds)
				? assetIds
				: (store.selectedSceneAssetIds.value ?? [])
			).filter((assetId) => Number.isFinite(assetId)),
		);
		const sourceAssets = sceneState.assets.filter(
			(asset) =>
				selectedIdSet.has(asset.id) &&
				(asset.kind === "model" || asset.kind === "splat"),
		);
		if (sourceAssets.length === 0) {
			return 0;
		}
		const splatAssetIds = sourceAssets
			.filter((asset) => asset.kind === "splat")
			.map((asset) => asset.id);
		const previousSelectionIds = [...(store.selectedSceneAssetIds.value ?? [])];
		const previousActiveSelectionId = store.selectedSceneAssetId.value ?? null;
		const previousSelectionAnchorId = sceneAssetSelectionAnchorId;
		const historyLabel = "asset.duplicate";
		const hasHistoryTransaction =
			beginHistoryTransaction?.(historyLabel) === true;
		const createdAssets = [];
		try {
			if (splatAssetIds.length > 0) {
				await ensureFullDataForSplatAssets(splatAssetIds);
			}
			for (const asset of sourceAssets) {
				const projectAssetState = getCapturedProjectAssetState(asset.id);
				const duplicateLabel = buildUniqueSceneAssetDuplicateLabel(
					asset.label,
					sceneState.assets,
				);
				const duplicateSource = createDuplicateSceneAssetSource(
					asset,
					createDuplicateProjectAssetState(projectAssetState, duplicateLabel),
				);
				if (!duplicateSource) {
					continue;
				}
				const sourceIndex = sceneState.assets.findIndex(
					(candidate) => candidate.id === asset.id,
				);
				const createdAsset =
					asset.kind === "splat"
						? await loadSplatAssetFromSource(duplicateSource, {
								insertIndex: sourceIndex >= 0 ? sourceIndex + 1 : null,
							})
						: await loadModelFromSource(duplicateSource, {
								insertIndex: sourceIndex >= 0 ? sourceIndex + 1 : null,
							});
				if (createdAsset) {
					createdAssets.push(createdAsset);
				}
			}
			if (createdAssets.length === 0) {
				if (hasHistoryTransaction) {
					cancelHistoryTransaction?.();
				}
				return 0;
			}
			applySelectedSceneAssets(
				createdAssets.map((asset) => asset.id),
				createdAssets.at(-1)?.id ?? null,
			);
			updateCameraSummary();
			updateUi();
			if (hasHistoryTransaction) {
				commitHistoryTransaction?.(historyLabel);
			}
			setStatus(
				createdAssets.length === 1
					? t("status.duplicatedSceneAsset", {
							name: createdAssets[0].label,
						})
					: t("status.duplicatedSceneAssets", {
							count: createdAssets.length,
						}),
			);
			return createdAssets.length;
		} catch (error) {
			if (hasHistoryTransaction) {
				cancelHistoryTransaction?.();
			}
			const createdAssetIds = new Set(createdAssets.map((asset) => asset.id));
			if (createdAssetIds.size > 0) {
				sceneState.assets = sceneState.assets.filter(
					(asset) => !createdAssetIds.has(asset.id),
				);
				for (const asset of createdAssets) {
					disposeSceneAsset(asset);
				}
			}
			sceneAssetSelectionAnchorId = previousSelectionAnchorId;
			applySelectedSceneAssets(previousSelectionIds, previousActiveSelectionId);
			updateCameraSummary();
			updateUi();
			console.error(error);
			setStatus(error?.message ?? String(error));
			return 0;
		}
	}

	const {
		expandProjectPackageSources,
		loadSource,
		loadSources,
		loadRemoteUrls,
		importDroppedFiles,
		handleAssetInputChange,
		loadStartupUrls,
	} = createAssetImportRuntime({
		store,
		t,
		setStatus,
		setOverlay,
		clearOverlay,
		openFiles,
		isProjectPackageSource,
		isProjectPackagePackedSplatSource,
		isProjectFilePackedSplatSource,
		isProjectFileLazyResourceSource,
		extractProjectPackageAssets,
		openProjectSource,
		getExtension,
		getDisplayName,
		loadSplatFromSource,
		createSplatAssetFromSource,
		replaceSplatAssetFromSource,
		removeSceneAssets,
		loadModelFromSource,
		getSceneAssetCount: () => sceneState.assets.length,
		clearScene,
		disposeDetachedSceneAssets,
		clearHistory,
		applyProjectPackageImport,
		placeAllCamerasAtHome,
		updateCameraSummary,
		updateUi,
		prioritizeImportedSceneAssets,
		beginHistoryTransaction,
		commitHistoryTransaction,
		cancelHistoryTransaction,
	});

	const {
		captureSceneAssetEditState,
		restoreSceneAssetEditState,
		captureWorkingProjectSceneState,
		applyWorkingProjectSceneState,
	} = createSceneAssetStatePersistence({
		sceneState,
		store,
		detachedSceneAssets,
		getProjectSourceStableKey,
		isProjectFileEmbeddedFileSource,
		isProjectFilePackedSplatSource,
		captureObjectLocalTransformState,
		applyObjectLocalTransformState,
		clampAssetWorldScale,
		clampAssetTransformValue,
		normalizeWorkingPivotLocal,
		applyAssetWorldScale,
		restoreSceneAsset,
		detachSceneAsset,
		captureProjectSceneState,
		applyProjectAssetState,
		loadSources,
	});

	return {
		getSceneAssetCounts,
		getTotalLoadedItems,
		getSceneAssets,
		registerAsset,
		applyAssetWorldScale,
		getSceneAsset,
		getSceneAssetForObject,
		getSceneRaycastTargets,
		selectSceneAsset,
		clearSceneAssetSelection,
		clampAssetWorldScale,
		getSceneBounds,
		getSceneFramingBounds,
		getExtension,
		getDisplayName,
		loadSplatFromSource,
		createSplatAssetFromSource,
		replaceSplatAssetFromSource,
		removeSceneAssets,
		loadModelFromSource,
		expandProjectPackageSources,
		loadSource,
		loadSources,
		captureSceneAssetEditState,
		captureProjectSceneState,
		captureWorkingProjectSceneState,
		applyWorkingProjectSceneState,
		restoreSceneAssetEditState,
		clearScene,
		setAssetWorldScale,
		setAssetTransform,
		setAssetsTransformBulk,
		getAssetWorkingPivotLocal,
		getAssetWorkingPivotWorld,
		setAssetWorkingPivotWorld,
		resetAssetWorkingPivot,
		resetAssetWorldScale,
		resetSelectedSceneAssetsWorldScale,
		setAssetPosition,
		offsetSelectedSceneAssetsPosition,
		setAssetRotationDegrees,
		offsetSelectedSceneAssetsRotationDegrees,
		setAssetVisibility,
		setAssetLabel,
		duplicateSelectedSceneAssets,
		ensureFullDataForSplatAssets,
		deleteSelectedSceneAssets,
		setSelectedSceneAssetsVisibility,
		applyAssetTransform,
		scaleSelectedSceneAssetsByFactor,
		moveAssetUp,
		moveAssetDown,
		moveAssetToIndex,
		setAssetExportRole,
		setAssetMaskGroup,
		loadRemoteUrls,
		importDroppedFiles,
		handleAssetInputChange,
		openFiles,
		loadStartupUrls,
		kickAutoLodBake,
	};
}
