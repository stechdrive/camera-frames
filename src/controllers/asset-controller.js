import { PackedSplats, unpackSplats } from "@sparkjsdev/spark";
import * as THREE from "three";
import { applyLegacyAssetState } from "../importers/legacy-ssproj.js";
import {
	isProjectPackageFileSource,
	isProjectPackagePackedSplatSource,
} from "../project-package.js";

const SPARK_SPLAT_CORRECTION_QUATERNION = new THREE.Quaternion(1, 0, 0, 0);

function getLegacySplatCorrectionEulerDegrees(fileName) {
	const extension = String(fileName || "")
		.split("?")[0]
		.split("#")[0]
		.toLowerCase()
		.split(".")
		.pop();

	switch (extension) {
		case "spz":
			return [0, 0, 0];
		case "lcc":
			return [90, 0, 180];
		default:
			return [0, 0, 180];
	}
}

function createQuaternionFromEulerDegrees([x, y, z], order = "XYZ") {
	return new THREE.Quaternion().setFromEuler(
		new THREE.Euler(
			THREE.MathUtils.degToRad(x),
			THREE.MathUtils.degToRad(y),
			THREE.MathUtils.degToRad(z),
			order,
		),
	);
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
	resetLocalizedCaches,
	setExportStatus,
	t,
	formatAssetWorldScale,
	getDefaultAssetUnitMode,
	getAssetFileURL,
	isProjectPackageSource,
	extractProjectPackageAssets,
	applyProjectPackageImport,
	disposeObject,
}) {
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

	function registerAsset({ kind, label, object, disposeTarget = null }) {
		const asset = {
			id: sceneState.nextAssetId++,
			kind,
			label,
			object,
			disposeTarget,
			baseScale: object.scale.clone(),
			unitMode: getDefaultAssetUnitMode(kind),
			worldScale: 1,
		};
		applyAssetWorldScale(asset);
		sceneState.assets.push(asset);
		return asset;
	}

	function applyAssetWorldScale(asset) {
		asset.object.scale.copy(asset.baseScale).multiplyScalar(asset.worldScale);
		asset.object.updateMatrixWorld(true);
	}

	function getSceneAsset(assetId) {
		return sceneState.assets.find((asset) => asset.id === assetId) ?? null;
	}

	function clampAssetWorldScale(value) {
		return Math.max(0.01, Number(value) || 1);
	}

	function getSceneBounds() {
		const box = new THREE.Box3().setFromObject(contentRoot);
		if (box.isEmpty()) {
			return null;
		}

		return {
			box,
			size: box.getSize(new THREE.Vector3()),
		};
	}

	function getExtension(value) {
		const raw =
			typeof value === "string"
				? value
				: isProjectPackageFileSource(value) ||
						isProjectPackagePackedSplatSource(value)
					? value.fileName
					: value.name;
		const clean = raw.split("?")[0].split("#")[0].toLowerCase();
		const lastDot = clean.lastIndexOf(".");
		return lastDot >= 0 ? clean.slice(lastDot + 1) : "";
	}

	function getLegacyState(value) {
		if (
			isProjectPackageFileSource(value) ||
			isProjectPackagePackedSplatSource(value)
		) {
			return value.legacyState ?? null;
		}

		return null;
	}

	function getLegacySplatCorrectionQuaternion(source) {
		const legacyState = getLegacyState(source);
		if (!legacyState) {
			return SPARK_SPLAT_CORRECTION_QUATERNION.clone();
		}

		const referenceName =
			legacyState.filename ||
			legacyState.packagePath ||
			legacyState.path ||
			source.path ||
			source.fileName;
		return createQuaternionFromEulerDegrees(
			getLegacySplatCorrectionEulerDegrees(referenceName),
		);
	}

	function getDisplayName(value) {
		if (isProjectPackagePackedSplatSource(value)) {
			return value.label || value.fileName || value.path || "meta.json";
		}
		if (isProjectPackageFileSource(value)) {
			return value.label || value.fileName || value.path || "asset";
		}

		if (typeof value !== "string") {
			return value.name;
		}

		try {
			const url = new URL(value);
			const name = url.pathname.split("/").pop() || value;
			return decodeURIComponent(name);
		} catch {
			return value;
		}
	}

	async function loadSplatFromSource(source) {
		const displayName = getDisplayName(source);
		const createSplatContainer = (mesh) => {
			const legacyState = getLegacyState(source);
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
			registerAsset({
				kind: "splat",
				label: displayName,
				object,
				disposeTarget: mesh,
			});
			return object;
		};

		if (isProjectPackagePackedSplatSource(source)) {
			const unpacked = await unpackSplats({
				input: source.inputBytes,
				extraFiles: source.extraFiles,
				fileType: source.fileType,
				pathOrUrl: source.path || source.fileName,
			});
			const packedSplats = new PackedSplats({
				packedArray: unpacked.packedArray,
				numSplats: unpacked.numSplats,
				extra: unpacked.extra ?? {},
				splatEncoding: unpacked.splatEncoding,
			});
			await packedSplats.initialized;

			const mesh = new SplatMesh({
				packedSplats,
				fileName: source.fileName,
				lod: true,
			});
			mesh.enableWorldToView = true;
			await mesh.initialized;
			return createSplatContainer(mesh);
		}

		const init =
			typeof source === "string"
				? { url: source, fileName: displayName, lod: true }
				: isProjectPackageFileSource(source)
					? {
							fileBytes: new Uint8Array(await source.file.arrayBuffer()),
							fileName: source.fileName,
							lod: true,
						}
					: {
							fileBytes: new Uint8Array(await source.arrayBuffer()),
							fileName: source.name,
							lod: true,
						};

		const mesh = new SplatMesh(init);
		mesh.enableWorldToView = true;
		await mesh.initialized;
		return createSplatContainer(mesh);
	}

	async function loadModelFromSource(source) {
		let url = source;
		let needsRevoke = false;
		const displayName = getDisplayName(source);

		if (typeof source !== "string") {
			const file = isProjectPackageFileSource(source) ? source.file : source;
			url = URL.createObjectURL(file);
			needsRevoke = true;
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
			applyLegacyAssetState(object, "model", getLegacyState(source));
			modelRoot.add(object);
			registerAsset({
				kind: "model",
				label: displayName,
				object,
			});
			return object;
		} finally {
			if (needsRevoke) {
				URL.revokeObjectURL(url);
			}
		}
	}

	async function expandProjectPackageSources(sources) {
		const expandedSources = [];
		const importStates = [];

		for (const source of sources) {
			if (!isProjectPackageSource(source)) {
				expandedSources.push(source);
				continue;
			}

			const packageName = getDisplayName(source);
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

	async function loadSources(sources, replace = false) {
		if (!sources.length) {
			return;
		}

		const { expandedSources, importStates } =
			await expandProjectPackageSources(sources);
		if (!expandedSources.length) {
			return;
		}

		const hadAssetsBeforeLoad = sceneState.assets.length > 0;

		if (replace) {
			clearScene();
		}

		setStatus(t("status.loadingItems", { count: expandedSources.length }));

		let loaded = 0;
		for (const source of expandedSources) {
			await loadSource(source);
			loaded += 1;
		}

		const importedProjectState =
			(replace || !hadAssetsBeforeLoad) &&
			importStates.length > 0 &&
			applyProjectPackageImport(importStates.at(-1));

		if (!importedProjectState && (replace || !hadAssetsBeforeLoad)) {
			frameAllCameras();
		} else {
			updateCameraSummary();
		}

		updateUi();
		setStatus(t("status.loadedItems", { count: loaded }));
	}

	function parseInputUrls(value) {
		return value
			.split(/[\r\n,\s]+/)
			.map((entry) => entry.trim())
			.filter((entry) => /^https?:\/\//i.test(entry));
	}

	async function loadSampleScene() {
		const butterflyUrl = await getAssetFileURL("butterfly.spz");
		if (!butterflyUrl) {
			throw new Error(t("error.sampleAsset"));
		}
		await loadSources([butterflyUrl], true);
	}

	function clearScene() {
		for (const asset of sceneState.assets) {
			asset.object.removeFromParent();
			if (asset.kind === "splat") {
				asset.disposeTarget?.dispose?.();
			} else {
				disposeObject(asset.object);
			}
		}

		sceneState.assets = [];
		frameAllCameras();
		resetLocalizedCaches();
		updateUi();
		store.exportSummary.value = t("exportSummary.empty");
		setExportStatus("export.idle");
		setStatus(t("status.sceneCleared"));
	}

	function setAssetWorldScale(assetId, nextValue) {
		const asset = getSceneAsset(assetId);
		if (!asset) {
			return;
		}

		asset.worldScale = clampAssetWorldScale(nextValue);
		applyAssetWorldScale(asset);
		updateUi();
		setStatus(
			t("status.assetScaleUpdated", {
				name: asset.label,
				scale: formatAssetWorldScale(asset.worldScale),
			}),
		);
	}

	function resetAssetWorldScale(assetId) {
		setAssetWorldScale(assetId, 1);
	}

	async function loadRemoteUrls() {
		const urls = parseInputUrls(store.remoteUrl.value);
		if (urls.length === 0) {
			setStatus(t("status.enterUrl"));
			return;
		}

		try {
			await loadSources(urls);
			store.remoteUrl.value = "";
		} catch (error) {
			console.error(error);
			setStatus(error.message);
		}
	}

	async function handleAssetInputChange(event) {
		const files = [...(event.currentTarget.files || [])];
		if (files.length === 0) {
			return;
		}

		try {
			await loadSources(files);
		} catch (error) {
			console.error(error);
			setStatus(error.message);
		} finally {
			event.currentTarget.value = "";
		}
	}

	async function loadSample() {
		try {
			await loadSampleScene();
		} catch (error) {
			console.error(error);
			setStatus(error.message);
		}
	}

	function openFiles() {
		assetInput.click();
	}

	async function loadStartupUrls() {
		const params = new URLSearchParams(window.location.search);
		const urls = params.getAll("url").filter(Boolean);
		if (urls.length === 0) {
			return;
		}

		try {
			await loadSources(urls);
		} catch (error) {
			console.error(error);
			setStatus(error.message);
		}
	}

	return {
		getSceneAssetCounts,
		getTotalLoadedItems,
		getSceneAssets,
		registerAsset,
		applyAssetWorldScale,
		getSceneAsset,
		clampAssetWorldScale,
		getSceneBounds,
		getExtension,
		getDisplayName,
		loadSplatFromSource,
		loadModelFromSource,
		expandProjectPackageSources,
		loadSource,
		loadSources,
		loadSampleScene,
		clearScene,
		setAssetWorldScale,
		resetAssetWorldScale,
		loadRemoteUrls,
		handleAssetInputChange,
		loadSample,
		openFiles,
		loadStartupUrls,
	};
}
