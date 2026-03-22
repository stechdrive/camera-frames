import * as THREE from "three";

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

	function registerAsset({ kind, label, object }) {
		const asset = {
			id: sceneState.nextAssetId++,
			kind,
			label,
			object,
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
		const raw = typeof value === "string" ? value : value.name;
		const clean = raw.split("?")[0].split("#")[0].toLowerCase();
		const lastDot = clean.lastIndexOf(".");
		return lastDot >= 0 ? clean.slice(lastDot + 1) : "";
	}

	function getDisplayName(value) {
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
		const init =
			typeof source === "string"
				? { url: source, fileName: displayName, lod: true }
				: {
						fileBytes: new Uint8Array(await source.arrayBuffer()),
						fileName: source.name,
						lod: true,
					};

		const mesh = new SplatMesh(init);
		mesh.enableWorldToView = true;
		await mesh.initialized;
		splatRoot.add(mesh);
		registerAsset({
			kind: "splat",
			label: displayName,
			object: mesh,
		});
		return mesh;
	}

	async function loadModelFromSource(source) {
		let url = source;
		let needsRevoke = false;

		if (typeof source !== "string") {
			url = URL.createObjectURL(source);
			needsRevoke = true;
		}

		try {
			const gltf = await loader.loadAsync(url);
			const object = gltf.scene || gltf.scenes[0];
			if (!object) {
				throw new Error(t("error.emptyGltf"));
			}
			modelRoot.add(object);
			registerAsset({
				kind: "model",
				label: getDisplayName(source),
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

		for (const source of sources) {
			if (!isProjectPackageSource(source)) {
				expandedSources.push(source);
				continue;
			}

			const packageName = getDisplayName(source);
			setStatus(t("status.expandingProjectPackage", { name: packageName }));
			const { files } = await extractProjectPackageAssets(source);
			if (files.length === 0) {
				throw new Error(t("error.emptyProjectPackage", { name: packageName }));
			}
			expandedSources.push(...files);
			setStatus(
				t("status.expandedProjectPackage", {
					name: packageName,
					count: files.length,
				}),
			);
		}

		return expandedSources;
	}

	async function loadSource(source) {
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

		const expandedSources = await expandProjectPackageSources(sources);
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

		if (replace || !hadAssetsBeforeLoad) {
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
				asset.object.dispose();
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
