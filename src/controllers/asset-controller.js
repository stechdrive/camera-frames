import { PackedSplats, unpackSplats } from "@sparkjsdev/spark";
import * as THREE from "three";
import { validateStartupUrls } from "../engine/import-link-policy.js";
import { moveSceneAssetWithinKind } from "../engine/scene-asset-order.js";
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
	isProjectPackageSource,
	extractProjectPackageAssets,
	applyProjectPackageImport,
	disposeObject,
}) {
	function setOverlay(nextOverlay) {
		store.overlay.value = nextOverlay;
	}

	function clearOverlay() {
		store.overlay.value = null;
	}

	function createImportSteps(activeStep) {
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

	function showImportProgress(step, detail = "") {
		setOverlay({
			kind: "progress",
			title: t("overlay.importTitle"),
			message: t("overlay.importMessage"),
			detail,
			steps: createImportSteps(step),
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
			exportRole: "beauty",
			maskGroup: "",
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

	function selectSceneAsset(assetId) {
		const asset = getSceneAsset(assetId);
		if (!asset) {
			return;
		}

		store.selectedSceneAssetId.value = asset.id;
		updateUi();
	}

	function clampAssetWorldScale(value) {
		return Math.max(0.01, Number(value) || 1);
	}

	function clampAssetTransformValue(value, fallback = 0) {
		const nextValue = Number(value);
		return Number.isFinite(nextValue) ? nextValue : fallback;
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
			const legacyState = getLegacyState(source);
			applyLegacyAssetState(object, "model", legacyState);
			if (legacyState) {
				const compensationTarget =
					findLegacyModelCompensationTarget(modelScene) ?? modelScene;
				compensateWrapperForChildLocalTransform(object, compensationTarget);
			}
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
		{ onProgress = null } = {},
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

		const hadAssetsBeforeLoad = sceneState.assets.length > 0;

		if (replace) {
			clearScene();
		}

		setStatus(t("status.loadingItems", { count: expandedSources.length }));

		let loaded = 0;
		for (const source of expandedSources) {
			onProgress?.(
				"load",
				t("overlay.importDetailLoadAsset", {
					index: loaded + 1,
					count: expandedSources.length,
					name: getDisplayName(source),
				}),
			);
			await loadSource(source);
			loaded += 1;
		}

		onProgress?.("apply", t("overlay.importDetailApply"));
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

	async function runImportTask(
		sources,
		{ replace = false, clearRemoteInput = false } = {},
	) {
		const remoteUrls = sources.filter((source) => typeof source === "string");
		try {
			showImportProgress("verify");
			await loadSources(sources, replace, {
				onProgress: (step, detail) => showImportProgress(step, detail),
			});
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

	function parseInputUrls(value) {
		return value
			.split(/[\r\n,\s]+/)
			.map((entry) => entry.trim())
			.filter((entry) => /^https?:\/\//i.test(entry));
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
		store.selectedSceneAssetId.value = null;
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

	function setAssetPosition(assetId, axis, nextValue) {
		const asset = getSceneAsset(assetId);
		if (!asset || !["x", "y", "z"].includes(axis)) {
			return;
		}

		asset.object.position[axis] = clampAssetTransformValue(
			nextValue,
			asset.object.position[axis],
		);
		asset.object.updateMatrixWorld(true);
		updateUi();
	}

	function setAssetRotationDegrees(assetId, axis, nextValue) {
		const asset = getSceneAsset(assetId);
		if (!asset || !["x", "y", "z"].includes(axis)) {
			return;
		}

		asset.object.rotation[axis] = THREE.MathUtils.degToRad(
			clampAssetTransformValue(
				nextValue,
				THREE.MathUtils.radToDeg(asset.object.rotation[axis]),
			),
		);
		asset.object.updateMatrixWorld(true);
		updateUi();
	}

	function setAssetVisibility(assetId, nextVisible) {
		const asset = getSceneAsset(assetId);
		if (!asset) {
			return;
		}

		asset.object.visible = Boolean(nextVisible);
		updateUi();
		setStatus(
			t("status.assetVisibilityUpdated", {
				name: asset.label,
				visibility: asset.object.visible
					? t("assetVisibility.visible")
					: t("assetVisibility.hidden"),
			}),
		);
	}

	function moveAsset(assetId, direction) {
		const asset = getSceneAsset(assetId);
		if (!asset) {
			return;
		}

		const kindAssets = sceneState.assets.filter(
			(candidate) => candidate.kind === asset.kind,
		);
		const currentKindIndex = kindAssets.findIndex(
			(candidate) => candidate.id === asset.id,
		);
		if (currentKindIndex === -1) {
			return;
		}

		const targetKindIndex = Math.max(
			0,
			Math.min(kindAssets.length - 1, currentKindIndex + direction),
		);
		if (targetKindIndex === currentKindIndex) {
			return;
		}

		sceneState.assets = moveSceneAssetWithinKind(
			sceneState.assets,
			assetId,
			targetKindIndex,
		);
		updateUi();
		setStatus(
			t("status.assetOrderUpdated", {
				name: asset.label,
				index: targetKindIndex + 1,
			}),
		);
	}

	function moveAssetUp(assetId) {
		moveAsset(assetId, -1);
	}

	function moveAssetDown(assetId) {
		moveAsset(assetId, 1);
	}

	function moveAssetToIndex(assetId, nextIndex) {
		const asset = getSceneAsset(assetId);
		if (!asset) {
			return;
		}

		const kindAssets = sceneState.assets.filter(
			(candidate) => candidate.kind === asset.kind,
		);
		const currentKindIndex = kindAssets.findIndex(
			(candidate) => candidate.id === asset.id,
		);
		if (currentKindIndex === -1) {
			return;
		}

		const targetKindIndex = Math.max(
			0,
			Math.min(kindAssets.length - 1, Number(nextIndex) || 0),
		);
		if (targetKindIndex === currentKindIndex) {
			return;
		}

		sceneState.assets = moveSceneAssetWithinKind(
			sceneState.assets,
			assetId,
			targetKindIndex,
		);
		updateUi();
		setStatus(
			t("status.assetOrderUpdated", {
				name: asset.label,
				index: targetKindIndex + 1,
			}),
		);
	}

	function setAssetExportRole(assetId, nextRole) {
		const asset = getSceneAsset(assetId);
		if (!asset) {
			return;
		}

		asset.exportRole = nextRole === "omit" ? "omit" : "beauty";
		updateUi();
		setStatus(
			t("status.assetExportRoleUpdated", {
				name: asset.label,
				role: t(`exportRole.${asset.exportRole}`),
			}),
		);
	}

	function setAssetMaskGroup(assetId, nextValue) {
		const asset = getSceneAsset(assetId);
		if (!asset) {
			return;
		}

		asset.maskGroup = String(nextValue ?? "").trim();
		updateUi();
		setStatus(
			t("status.assetMaskGroupUpdated", {
				name: asset.label,
				group: asset.maskGroup || "—",
			}),
		);
	}

	async function loadRemoteUrls() {
		const urls = parseInputUrls(store.remoteUrl.value);
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

	function openFiles() {
		assetInput.click();
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
		getSceneAssetCounts,
		getTotalLoadedItems,
		getSceneAssets,
		registerAsset,
		applyAssetWorldScale,
		getSceneAsset,
		selectSceneAsset,
		clampAssetWorldScale,
		getSceneBounds,
		getExtension,
		getDisplayName,
		loadSplatFromSource,
		loadModelFromSource,
		expandProjectPackageSources,
		loadSource,
		loadSources,
		clearScene,
		setAssetWorldScale,
		resetAssetWorldScale,
		setAssetPosition,
		setAssetRotationDegrees,
		setAssetVisibility,
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
