import * as THREE from "three";
import { AUTO_LOD_MIN_SPLATS } from "../constants.js";
import { prioritizeSceneAssetsWithinKinds } from "../engine/scene-asset-order.js";
import { bakeSparkPackedSplatsLod } from "../engine/spark-integration/spark-packed-splats-adapter.js";
import { enableSparkSplatMeshWorldToView } from "../engine/spark-integration/spark-splat-mesh-adapter.js";
import {
	PackedSplats,
	unpackSplats,
} from "../engine/spark-integration/spark-symbols.js";
import { applyLegacyAssetState } from "../importers/legacy-ssproj.js";
import {
	createProjectFileEmbeddedFileSource,
	createProjectFilePackedSplatSource,
	getProjectSourceStableKey,
	isProjectFileEmbeddedFileSource,
	isProjectFilePackedSplatSource,
	sanitizeProjectAssetLabel,
} from "../project/document.js";
import {
	isProjectPackageFileSource,
	isProjectPackagePackedSplatSource,
} from "../project/package-legacy.js";
import { createSceneAssetBoundsController } from "./scene-assets/bounds.js";
import { createSceneAssetDocumentMutationsController } from "./scene-assets/document-mutations.js";
import { createAssetImportRuntime } from "./scene-assets/import-runtime.js";
import { createSceneAssetLifecycle } from "./scene-assets/lifecycle.js";
import { createSceneAssetProjectStateHelpers } from "./scene-assets/project-state.js";
import { createSceneAssetSelectionOrderController } from "./scene-assets/selection-order.js";
import { createSceneAssetStatePersistence } from "./scene-assets/state-persistence.js";
import { createSceneAssetTransformController } from "./scene-assets/transform-ops.js";

function compensateWrapperForChildLocalTransform(wrapper, child) {
	if (!wrapper || !child) {
		return;
	}

	child.updateMatrix();
	const childMatrix = child.matrix.clone();
	const childMatrixInverse = childMatrix.clone().invert();
	const wrapperMatrix = new THREE.Matrix4().compose(
		wrapper.position,
		wrapper.quaternion,
		wrapper.scale,
	);
	const correctedWrapperMatrix = wrapperMatrix.multiply(childMatrixInverse);
	correctedWrapperMatrix.decompose(
		wrapper.position,
		wrapper.quaternion,
		wrapper.scale,
	);
	wrapper.updateMatrixWorld(true);
}

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

function findLegacyModelCompensationTarget(root) {
	if (!root) {
		return null;
	}

	let current = root;
	while (
		current &&
		!current.isMesh &&
		!current.isSkinnedMesh &&
		Array.isArray(current.children) &&
		current.children.length === 1
	) {
		const child = current.children[0];
		if (!child) {
			return null;
		}
		const hasNonIdentityTransform =
			child.position.lengthSq() > 0 ||
			Math.abs(child.quaternion.x) > 1e-8 ||
			Math.abs(child.quaternion.y) > 1e-8 ||
			Math.abs(child.quaternion.z) > 1e-8 ||
			Math.abs(child.quaternion.w - 1) > 1e-8 ||
			Math.abs(child.scale.x - 1) > 1e-8 ||
			Math.abs(child.scale.y - 1) > 1e-8 ||
			Math.abs(child.scale.z - 1) > 1e-8;
		if (hasNonIdentityTransform) {
			return child;
		}
		current = child;
	}

	return null;
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

	function createSplatContainer({
		mesh,
		displayName,
		source,
		persistentSource = null,
		legacyState = null,
		projectAssetState = null,
		localBoundsHint = null,
		localCenterBoundsHint = null,
	}) {
		const object = new THREE.Group();
		object.name = displayName;
		const correctionGroup = new THREE.Group();
		const correctionQuaternion = getLegacySplatCorrectionQuaternion(source);
		correctionGroup.quaternion.copy(correctionQuaternion);
		correctionGroup.add(mesh);
		object.add(correctionGroup);
		applyLegacyAssetState(object, "splat", legacyState);
		if (legacyState) {
			object.quaternion.multiply(correctionQuaternion.clone().invert());
			object.updateMatrixWorld(true);
		}
		splatRoot.add(object);
		const asset = registerAsset({
			kind: "splat",
			label: displayName,
			object,
			contentObject: correctionGroup,
			disposeTarget: mesh,
			source: persistentSource,
		});
		asset.localBoundsHint = localBoundsHint?.clone?.() ?? localBoundsHint;
		asset.localCenterBoundsHint =
			localCenterBoundsHint?.clone?.() ?? localCenterBoundsHint;
		applyProjectAssetState(asset, projectAssetState);
		return asset;
	}

	function updateBackgroundTaskSignal(mutation) {
		const current = store.backgroundTask?.value ?? null;
		const next = mutation(current);
		if (store.backgroundTask && next !== current) {
			store.backgroundTask.value = next;
		}
	}

	function scheduleBackgroundTaskClear(targetStatus, delayMs) {
		if (!store.backgroundTask) {
			return;
		}
		const captured = store.backgroundTask.value;
		setTimeout(() => {
			// Only clear if state hasn't moved on (e.g. another asset started).
			const now = store.backgroundTask.value;
			if (now === captured && now?.status === targetStatus) {
				store.backgroundTask.value = null;
			}
		}, delayMs);
	}

	function beginAutoLodBakeTask(label) {
		updateBackgroundTaskSignal((current) => {
			if (current?.kind === "auto-lod" && current.status === "running") {
				return {
					...current,
					total: current.total + 1,
					label,
				};
			}
			return {
				kind: "auto-lod",
				status: "running",
				current: 0,
				total: 1,
				label,
			};
		});
	}

	function finishAutoLodBakeTask(label, { failed = false } = {}) {
		updateBackgroundTaskSignal((current) => {
			if (current?.kind !== "auto-lod") {
				return current;
			}
			const nextCurrent = Math.min(current.total, current.current + 1);
			const allDone = nextCurrent >= current.total;
			if (!allDone) {
				return {
					...current,
					current: nextCurrent,
					label,
				};
			}
			return {
				...current,
				current: nextCurrent,
				label,
				status: failed ? "failed" : "done",
			};
		});
		// Auto-clear the final state after a short grace period so the
		// "done" / "failed" badge stays visible briefly, then fades out.
		if (store.backgroundTask?.value?.status === "done") {
			scheduleBackgroundTaskClear("done", 2000);
		} else if (store.backgroundTask?.value?.status === "failed") {
			scheduleBackgroundTaskClear("failed", 5000);
		}
	}

	function kickAutoLodBake(packedSplats, displayName) {
		if (!packedSplats || typeof packedSplats !== "object") {
			return;
		}
		if (packedSplats.lodSplats) {
			// Already baked (either prebuilt from source.lodSplats or attached
			// by a prior bake). Renderer will use it directly.
			return;
		}
		const numSplats =
			packedSplats.getNumSplats?.() ?? packedSplats.numSplats ?? 0;
		if (numSplats < AUTO_LOD_MIN_SPLATS) {
			// Small enough that raw rendering is fine; LoD overhead isn't worth it.
			return;
		}
		const label = displayName ?? "3DGS";
		beginAutoLodBakeTask(label);
		// Non-blocking background build. Renderer picks up the lodSplats on
		// next frame via needsUpdate flag set by bakeSparkPackedSplatsLod.
		void bakeSparkPackedSplatsLod(packedSplats, { quality: false })
			.then(() => {
				finishAutoLodBakeTask(label);
				setStatus?.(t("status.autoLodReady", { name: label }));
			})
			.catch((error) => {
				console.error(
					`[camera-frames] auto-LoD bake failed for "${label}":`,
					error,
				);
				finishAutoLodBakeTask(label, { failed: true });
				setStatus?.(t("status.autoLodFailed", { name: label }));
			});
	}

	async function createPrebuiltLodSplatsFromSource(lodSplatsSource) {
		if (
			!lodSplatsSource ||
			!(lodSplatsSource.packedArray instanceof Uint32Array) ||
			lodSplatsSource.packedArray.length === 0
		) {
			return null;
		}
		const lodSplats = new PackedSplats({
			packedArray: lodSplatsSource.packedArray,
			numSplats: lodSplatsSource.numSplats ?? 0,
			extra: lodSplatsSource.extra ?? {},
			splatEncoding: lodSplatsSource.splatEncoding ?? undefined,
		});
		await lodSplats.initialized;
		return lodSplats;
	}

	async function createPackedSplatsFromSourceData({
		fileName,
		inputBytes,
		extraFiles = undefined,
		fileType = undefined,
		pathOrUrl = undefined,
		packedArray = undefined,
		numSplats = undefined,
		extra = undefined,
		splatEncoding = undefined,
		lodSplats = undefined,
	}) {
		if ((packedArray?.length ?? 0) > 0) {
			const prebuiltLodSplats =
				await createPrebuiltLodSplatsFromSource(lodSplats);
			const packedSplats = new PackedSplats({
				packedArray,
				numSplats,
				extra: extra ?? {},
				splatEncoding: splatEncoding ?? undefined,
				lodSplats: prebuiltLodSplats ?? undefined,
			});
			await packedSplats.initialized;
			return packedSplats;
		}

		const unpacked = await unpackSplats({
			input: inputBytes,
			extraFiles,
			fileType,
			pathOrUrl,
		});
		const packedSplats = new PackedSplats({
			packedArray: unpacked.packedArray,
			numSplats: unpacked.numSplats,
			extra: unpacked.extra ?? {},
			splatEncoding: unpacked.splatEncoding,
		});
		await packedSplats.initialized;
		return packedSplats;
	}

	async function loadSplatAssetFromSource(source, { insertIndex = null } = {}) {
		const displayName = getDisplayName(source);
		const legacyState = getLegacyState(source);
		const projectAssetState = getProjectAssetState(source);
		const createPackedSplatAsset = async ({
			fileName,
			inputBytes,
			extraFiles = undefined,
			fileType = undefined,
			pathOrUrl = undefined,
			persistentSource = null,
			packedArray = undefined,
			numSplats = undefined,
			extra = undefined,
			splatEncoding = undefined,
			lodSplats = undefined,
		}) => {
			const packedSplats = await createPackedSplatsFromSourceData({
				fileName,
				inputBytes,
				extraFiles,
				fileType,
				pathOrUrl,
				packedArray,
				numSplats,
				extra,
				splatEncoding,
				lodSplats,
			});
			const localBoundsHint =
				buildSplatLocalBoundsFromSource(packedSplats, false) ??
				buildSplatLocalBoundsFromSource(packedSplats, true);
			const localCenterBoundsHint =
				buildSplatFramingBoundsFromSource(packedSplats) ??
				buildSplatLocalBoundsFromSource(packedSplats, true) ??
				localBoundsHint;
			const mesh = new SplatMesh({
				packedSplats,
				fileName,
				lod: true,
			});
			enableSparkSplatMeshWorldToView(mesh);
			await mesh.initialized;
			const asset = createSplatContainer({
				mesh,
				displayName,
				source,
				persistentSource,
				legacyState,
				projectAssetState,
				localBoundsHint,
				localCenterBoundsHint,
			});
			if (Number.isFinite(insertIndex)) {
				moveRegisteredAssetToIndex(asset, insertIndex);
			}
			kickAutoLodBake(packedSplats, displayName);
			return asset;
		};

		if (isProjectFilePackedSplatSource(source)) {
			return createPackedSplatAsset({
				fileName: source.fileName,
				inputBytes: source.inputBytes,
				extraFiles: source.extraFiles,
				fileType: source.fileType,
				pathOrUrl: source.fileName,
				persistentSource: source,
				packedArray: source.packedArray,
				numSplats: source.numSplats,
				extra: source.extra,
				splatEncoding: source.splatEncoding,
				lodSplats: source.lodSplats,
			});
		}

		if (isProjectPackagePackedSplatSource(source)) {
			return createPackedSplatAsset({
				fileName: source.fileName,
				inputBytes: source.inputBytes,
				extraFiles: source.extraFiles,
				fileType: source.fileType,
				pathOrUrl: source.path || source.fileName,
				persistentSource: createProjectFilePackedSplatSource({
					fileName: source.fileName,
					inputBytes: source.inputBytes,
					extraFiles: source.extraFiles,
					fileType: source.fileType,
					projectAssetState,
					legacyState,
				}),
			});
		}

		if (typeof source !== "string") {
			const file = isProjectFileEmbeddedFileSource(source)
				? source.file
				: isProjectPackageFileSource(source)
					? source.file
					: source;
			const fileName = isProjectFileEmbeddedFileSource(source)
				? source.fileName
				: isProjectPackageFileSource(source)
					? source.fileName
					: source.name;
			const persistentSource = isProjectFileEmbeddedFileSource(source)
				? source
				: createProjectFileEmbeddedFileSource({
						kind: "splat",
						file,
						fileName,
						projectAssetState,
						legacyState,
					});
			return createPackedSplatAsset({
				fileName,
				inputBytes: new Uint8Array(await file.arrayBuffer()),
				pathOrUrl: fileName,
				persistentSource,
			});
		}

		const fetchedFile = await fetchUrlAsFile(source, displayName);
		const persistentSource = createProjectFileEmbeddedFileSource({
			kind: "splat",
			file: fetchedFile,
			fileName: fetchedFile.name,
		});
		return createPackedSplatAsset({
			fileName: fetchedFile.name,
			inputBytes: new Uint8Array(await fetchedFile.arrayBuffer()),
			pathOrUrl: source,
			persistentSource,
		});
	}

	async function loadSplatFromSource(source) {
		return await loadSplatAssetFromSource(source);
	}

	async function createSplatAssetFromSource(
		source,
		{ insertIndex = null } = {},
	) {
		return await loadSplatAssetFromSource(source, { insertIndex });
	}

	async function replaceSplatAssetFromSource(assetId, source) {
		const existingAsset = getSceneAsset(assetId);
		if (!existingAsset || existingAsset.kind !== "splat") {
			return null;
		}
		const existingIndex = sceneState.assets.findIndex(
			(asset) => asset.id === existingAsset.id,
		);
		if (existingIndex === -1) {
			return null;
		}
		const replacementAsset = await loadSplatAssetFromSource(source, {
			insertIndex: existingIndex,
		});
		if (!replacementAsset) {
			return null;
		}
		const replacementIndex = sceneState.assets.indexOf(replacementAsset);
		if (replacementIndex !== -1) {
			sceneState.assets.splice(replacementIndex, 1);
		}
		sceneState.assets[existingIndex] = replacementAsset;
		replacementAsset.id = existingAsset.id;
		disposeSceneAsset(existingAsset);
		return replacementAsset;
	}

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

	async function loadModelFromSource(source, { insertIndex = null } = {}) {
		let url = source;
		let needsRevoke = false;
		const displayName = getDisplayName(source);
		const projectAssetState = getProjectAssetState(source);
		let persistentSource = null;

		if (isProjectFileEmbeddedFileSource(source)) {
			url = URL.createObjectURL(source.file);
			needsRevoke = true;
			persistentSource = source;
		} else if (typeof source !== "string") {
			const file = isProjectPackageFileSource(source) ? source.file : source;
			url = URL.createObjectURL(file);
			needsRevoke = true;
			persistentSource = createProjectFileEmbeddedFileSource({
				kind: "model",
				file,
				fileName: isProjectPackageFileSource(source)
					? source.fileName
					: source.name,
				projectAssetState,
				legacyState: getLegacyState(source),
			});
		} else {
			const file = await fetchUrlAsFile(source, displayName);
			url = URL.createObjectURL(file);
			needsRevoke = true;
			persistentSource = createProjectFileEmbeddedFileSource({
				kind: "model",
				file,
				fileName: file.name,
				legacyState: getLegacyState(source),
			});
		}

		try {
			const gltf = await loader.loadAsync(url);
			const modelScene = gltf.scene || gltf.scenes[0];
			if (!modelScene) {
				throw new Error(t("error.emptyGltf"));
			}

			const object = new THREE.Group();
			object.name = displayName;
			object.add(modelScene);
			const legacyState = getLegacyState(source);
			applyLegacyAssetState(object, "model", legacyState);
			if (legacyState) {
				const compensationTarget =
					findLegacyModelCompensationTarget(modelScene) ?? modelScene;
				compensateWrapperForChildLocalTransform(object, compensationTarget);
			}
			modelRoot.add(object);
			const asset = registerAsset({
				kind: "model",
				label: displayName,
				object,
				contentObject: modelScene,
				source: persistentSource,
			});
			applyProjectAssetState(asset, projectAssetState);
			if (Number.isFinite(insertIndex)) {
				moveRegisteredAssetToIndex(asset, insertIndex);
			}
			return asset;
		} finally {
			if (needsRevoke) {
				URL.revokeObjectURL(url);
			}
		}
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
		const previousSelectionIds = [...(store.selectedSceneAssetIds.value ?? [])];
		const previousActiveSelectionId = store.selectedSceneAssetId.value ?? null;
		const previousSelectionAnchorId = sceneAssetSelectionAnchorId;
		const historyLabel = "asset.duplicate";
		const hasHistoryTransaction =
			beginHistoryTransaction?.(historyLabel) === true;
		const createdAssets = [];
		try {
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
