import * as THREE from "three";
import { registerProjectRadBundle } from "../../engine/rad-bundle-service-worker-client.js";
import { refreshSparkPackedSplatMesh } from "../../engine/spark-integration/spark-packed-splats-adapter.js";
import { enableSparkSplatMeshWorldToView } from "../../engine/spark-integration/spark-splat-mesh-adapter.js";
import {
	PackedSplats,
	PagedSplats,
	SplatFileType,
	unpackSplats,
} from "../../engine/spark-integration/spark-symbols.js";
import { applyLegacyAssetState } from "../../importers/legacy-ssproj.js";
import {
	createProjectFileEmbeddedFileSource,
	createProjectFilePackedSplatSource,
	hasProjectFilePackedSplatDeferredFullData,
	isProjectFileEmbeddedFileSource,
	isProjectFilePackedSplatSource,
	loadProjectFilePackedSplatFullDataSource,
	materializeProjectFilePackedSplatFullData,
} from "../../project/document.js";
import {
	isProjectFileLazyResourceSource,
	materializeProjectFileLazyResourceSource,
} from "../../project/file/lazy-source.js";
import {
	isProjectPackageFileSource,
	isProjectPackagePackedSplatSource,
} from "../../project/package-legacy.js";

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

function createBox3FromSerializable(value) {
	if (!value || typeof value !== "object") {
		return null;
	}
	const min = value.min ?? value[0] ?? null;
	const max = value.max ?? value[1] ?? null;
	const box = new THREE.Box3(
		new THREE.Vector3(
			Number(min?.x ?? min?.[0] ?? 0),
			Number(min?.y ?? min?.[1] ?? 0),
			Number(min?.z ?? min?.[2] ?? 0),
		),
		new THREE.Vector3(
			Number(max?.x ?? max?.[0] ?? 0),
			Number(max?.y ?? max?.[1] ?? 0),
			Number(max?.z ?? max?.[2] ?? 0),
		),
	);
	return box.isEmpty() ? null : box;
}

function getRadBundleLocalBounds(radBundle, key) {
	return (
		createBox3FromSerializable(radBundle?.bounds?.[key]) ??
		createBox3FromSerializable(radBundle?.bounds)
	);
}

function attachRadBundleRuntimeCleanup(mesh, runtime) {
	if (!mesh || !runtime) {
		return;
	}
	const dispose = mesh.dispose?.bind(mesh);
	mesh.dispose = () => {
		runtime.unregister?.();
		dispose?.();
	};
}

export function createSceneAssetSourceLoadingController({
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
}) {
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

	function reportSplatLoadStage(onProgress, stage, details = {}) {
		onProgress?.({ stage, ...details });
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
		onProgress = null,
	}) {
		if ((packedArray?.length ?? 0) > 0) {
			reportSplatLoadStage(onProgress, "decode-source", {
				sourceKind: "raw-packed-splat",
			});
			if ((lodSplats?.packedArray?.length ?? 0) > 0) {
				reportSplatLoadStage(onProgress, "init-lod", {
					sourceKind: "raw-packed-splat",
				});
			}
			const prebuiltLodSplats =
				await createPrebuiltLodSplatsFromSource(lodSplats);
			reportSplatLoadStage(onProgress, "init-packed-splats", {
				sourceKind: "raw-packed-splat",
			});
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

		reportSplatLoadStage(onProgress, "decode-source", {
			sourceKind: "encoded-splat",
		});
		const unpacked = await unpackSplats({
			input: inputBytes,
			extraFiles,
			fileType,
			pathOrUrl,
		});
		reportSplatLoadStage(onProgress, "init-packed-splats", {
			sourceKind: "encoded-splat",
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

	async function loadSplatAssetFromSource(
		source,
		{ insertIndex = null, onProgress = null } = {},
	) {
		if (isProjectFileLazyResourceSource(source)) {
			reportSplatLoadStage(onProgress, "materialize", {
				sourceKind: source.resource?.type ?? source.kind ?? null,
			});
			return await loadSplatAssetFromSource(
				await materializeProjectFileLazyResourceSource(source),
				{ insertIndex, onProgress },
			);
		}

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
				onProgress,
			});
			reportSplatLoadStage(onProgress, "build-bounds");
			const localBoundsHint =
				buildSplatLocalBoundsFromSource(packedSplats, false) ??
				buildSplatLocalBoundsFromSource(packedSplats, true);
			const localCenterBoundsHint =
				buildSplatFramingBoundsFromSource(packedSplats) ??
				buildSplatLocalBoundsFromSource(packedSplats, true) ??
				localBoundsHint;
			reportSplatLoadStage(onProgress, "init-splat-mesh");
			const mesh = new SplatMesh({
				packedSplats,
				fileName,
				lod: true,
			});
			enableSparkSplatMeshWorldToView(mesh);
			await mesh.initialized;
			reportSplatLoadStage(onProgress, "register-scene");
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
			if (!hasProjectFilePackedSplatDeferredFullData(persistentSource)) {
				kickAutoLodBake(packedSplats, displayName, mesh);
			}
			return asset;
		};

		const createPagedRadSplatAsset = async (source) => {
			const radBundle = source?.radBundle ?? null;
			if (!radBundle?.root) {
				return null;
			}
			reportSplatLoadStage(onProgress, "decode-source", {
				sourceKind: "rad-bundle",
			});
			const runtime = await registerProjectRadBundle(radBundle);
			if (!runtime?.rootUrl) {
				return null;
			}
			try {
				reportSplatLoadStage(onProgress, "init-packed-splats", {
					sourceKind: "rad-bundle",
				});
				const pagedSplats = new PagedSplats({
					rootUrl: runtime.rootUrl,
					fileType: SplatFileType.RAD,
				});
				await pagedSplats.getRadMeta?.();
				reportSplatLoadStage(onProgress, "build-bounds");
				const localBoundsHint = getRadBundleLocalBounds(radBundle, "local");
				const localCenterBoundsHint =
					getRadBundleLocalBounds(radBundle, "center") ?? localBoundsHint;
				reportSplatLoadStage(onProgress, "init-splat-mesh");
				const mesh = new SplatMesh({
					paged: pagedSplats,
					fileName: source.fileName,
					lod: true,
				});
				attachRadBundleRuntimeCleanup(mesh, runtime);
				enableSparkSplatMeshWorldToView(mesh);
				await mesh.initialized;
				reportSplatLoadStage(onProgress, "register-scene");
				const asset = createSplatContainer({
					mesh,
					displayName,
					source,
					persistentSource: source,
					legacyState,
					projectAssetState,
					localBoundsHint,
					localCenterBoundsHint,
				});
				asset.radBundleRuntime = runtime;
				if (Number.isFinite(insertIndex)) {
					moveRegisteredAssetToIndex(asset, insertIndex);
				}
				return asset;
			} catch (error) {
				await runtime.unregister?.();
				throw error;
			}
		};

		if (isProjectFilePackedSplatSource(source)) {
			if (source.radBundle?.root) {
				try {
					const radAsset = await createPagedRadSplatAsset(source);
					if (radAsset) {
						return radAsset;
					}
				} catch (error) {
					console.warn(
						`[camera-frames] embedded RAD streaming failed for "${displayName}", falling back to FullData.`,
						error,
					);
					reportSplatLoadStage(onProgress, "materialize", {
						sourceKind: "raw-packed-splat",
					});
					return await loadSplatAssetFromSource(
						await materializeProjectFilePackedSplatFullData(source),
						{ insertIndex, onProgress },
					);
				}
			}
			if (hasProjectFilePackedSplatDeferredFullData(source)) {
				reportSplatLoadStage(onProgress, "materialize", {
					sourceKind: "raw-packed-splat",
				});
				return await loadSplatAssetFromSource(
					await materializeProjectFilePackedSplatFullData(source),
					{ insertIndex, onProgress },
				);
			}
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
			reportSplatLoadStage(onProgress, "read-bytes");
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
		reportSplatLoadStage(onProgress, "read-bytes");
		return createPackedSplatAsset({
			fileName: fetchedFile.name,
			inputBytes: new Uint8Array(await fetchedFile.arrayBuffer()),
			pathOrUrl: source,
			persistentSource,
		});
	}

	function getSplatAssetsNeedingFullData(assetIds = null) {
		const requestedIds =
			Array.isArray(assetIds) && assetIds.length > 0
				? new Set(assetIds.map(String))
				: null;
		return sceneState.assets.filter(
			(asset) =>
				asset?.kind === "splat" &&
				(!requestedIds || requestedIds.has(String(asset.id))) &&
				hasProjectFilePackedSplatDeferredFullData(asset.source),
		);
	}

	async function swapSplatAssetToFullDataSource(asset, fullSource) {
		if (!asset || !isProjectFilePackedSplatSource(fullSource)) {
			return false;
		}
		const mesh = asset.disposeTarget;
		if (!mesh) {
			return false;
		}
		const nextPackedSplats = await createPackedSplatsFromSourceData({
			fileName: fullSource.fileName,
			inputBytes: fullSource.inputBytes,
			extraFiles: fullSource.extraFiles,
			fileType: fullSource.fileType,
			pathOrUrl: fullSource.fileName,
			packedArray: fullSource.packedArray,
			numSplats: fullSource.numSplats,
			extra: fullSource.extra,
			splatEncoding: fullSource.splatEncoding,
			lodSplats: fullSource.lodSplats,
		});
		const previousPackedSplats = mesh.packedSplats;
		const previousPagedSplats = mesh.paged;
		try {
			mesh.paged = undefined;
			mesh.packedSplats = nextPackedSplats;
			refreshSparkPackedSplatMesh(mesh, nextPackedSplats, {
				updateVersion: typeof mesh.updateVersion === "function",
			});
		} catch (error) {
			mesh.packedSplats = previousPackedSplats;
			mesh.paged = previousPagedSplats;
			nextPackedSplats.dispose?.();
			throw error;
		}
		if (previousPackedSplats && previousPackedSplats !== nextPackedSplats) {
			previousPackedSplats.dispose?.();
		}
		if (previousPagedSplats && previousPagedSplats !== nextPackedSplats) {
			previousPagedSplats.dispose?.();
			await asset.radBundleRuntime?.unregister?.();
			asset.radBundleRuntime = null;
		}
		asset.source = fullSource;
		asset.persistentSourceDirty = false;
		asset.localBoundsHint =
			buildSplatLocalBoundsFromSource(nextPackedSplats, false) ??
			buildSplatLocalBoundsFromSource(nextPackedSplats, true);
		asset.localCenterBoundsHint =
			buildSplatFramingBoundsFromSource(nextPackedSplats) ??
			buildSplatLocalBoundsFromSource(nextPackedSplats, true) ??
			asset.localBoundsHint;
		return true;
	}

	async function ensureFullDataForSplatAssets(
		assetIds = null,
		{ silent = false } = {},
	) {
		const candidates = getSplatAssetsNeedingFullData(assetIds);
		if (candidates.length === 0) {
			return true;
		}
		if (!silent) {
			setStatus?.(t("status.loadingItems", { count: candidates.length }));
		}
		for (const asset of candidates) {
			const fullSource = await loadProjectFilePackedSplatFullDataSource(
				asset.source,
			);
			await swapSplatAssetToFullDataSource(asset, fullSource);
		}
		resetLocalizedCaches?.();
		updateCameraSummary?.();
		updateUi?.();
		if (!silent) {
			setStatus?.(t("status.loadedItems", { count: candidates.length }));
		}
		return true;
	}

	async function loadSplatFromSource(source, options = {}) {
		return await loadSplatAssetFromSource(source, options);
	}

	async function createSplatAssetFromSource(
		source,
		{ insertIndex = null, onProgress = null } = {},
	) {
		return await loadSplatAssetFromSource(source, { insertIndex, onProgress });
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

	async function loadModelFromSource(source, { insertIndex = null } = {}) {
		if (isProjectFileLazyResourceSource(source)) {
			return await loadModelFromSource(
				await materializeProjectFileLazyResourceSource(source),
				{ insertIndex },
			);
		}

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

	return {
		loadSplatFromSource,
		createSplatAssetFromSource,
		replaceSplatAssetFromSource,
		ensureFullDataForSplatAssets,
		loadModelFromSource,
	};
}
