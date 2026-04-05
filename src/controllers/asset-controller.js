import { PackedSplats, unpackSplats } from "@sparkjsdev/spark";
import * as THREE from "three";
import { applyLegacyAssetState } from "../importers/legacy-ssproj.js";
import {
	createProjectFileEmbeddedFileSource,
	createProjectFilePackedSplatSource,
	getProjectSourceStableKey,
	isProjectFileEmbeddedFileSource,
	isProjectFilePackedSplatSource,
} from "../project-document.js";
import {
	isProjectPackageFileSource,
	isProjectPackagePackedSplatSource,
} from "../project-package.js";
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
	}) {
		if ((packedArray?.length ?? 0) > 0) {
			const packedSplats = new PackedSplats({
				packedArray,
				numSplats,
				extra: extra ?? {},
				splatEncoding: splatEncoding ?? undefined,
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
			mesh.enableWorldToView = true;
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
		const asset = await loadSplatAssetFromSource(source);
		return asset?.object ?? null;
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

	async function loadModelFromSource(source) {
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
			return object;
		} finally {
			if (needsRevoke) {
				URL.revokeObjectURL(url);
			}
		}
	}

	function openFiles() {
		assetInput.click();
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
	};
}
