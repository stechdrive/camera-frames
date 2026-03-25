import { PackedSplats, unpackSplats } from "@sparkjsdev/spark";
import * as THREE from "three";
import { validateStartupUrls } from "../engine/import-link-policy.js";
import { moveSceneAssetWithinKind } from "../engine/scene-asset-order.js";
import { applyLegacyAssetState } from "../importers/legacy-ssproj.js";
import {
	createProjectFileEmbeddedFileSource,
	createProjectFilePackedSplatSource,
	isProjectFileEmbeddedFileSource,
	isProjectFilePackedSplatSource,
} from "../project-file.js";
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
	disposeObject,
	runHistoryAction = (_label, applyChange) => {
		applyChange?.();
		return false;
	},
	clearHistory = () => {},
}) {
	const reportedSplatBoundsWarnings = new Set();

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

	function captureSceneAssetEditState() {
		return {
			selectedSceneAssetIds: [...store.selectedSceneAssetIds.value],
			selectedSceneAssetId: store.selectedSceneAssetId.value,
			assets: sceneState.assets.map((asset) => ({
				id: asset.id,
				kind: asset.kind,
				worldScale: asset.worldScale,
				unitMode: asset.unitMode,
				exportRole: asset.exportRole ?? "beauty",
				maskGroup: asset.maskGroup ?? "",
				workingPivotLocal: asset.workingPivotLocal
					? {
							x: asset.workingPivotLocal.x,
							y: asset.workingPivotLocal.y,
							z: asset.workingPivotLocal.z,
						}
					: null,
				visible: asset.object.visible !== false,
				position: {
					x: asset.object.position.x,
					y: asset.object.position.y,
					z: asset.object.position.z,
				},
				rotationDegrees: {
					x: THREE.MathUtils.radToDeg(asset.object.rotation.x),
					y: THREE.MathUtils.radToDeg(asset.object.rotation.y),
					z: THREE.MathUtils.radToDeg(asset.object.rotation.z),
				},
			})),
		};
	}

	function restoreSceneAssetEditState(snapshot) {
		if (!snapshot || !Array.isArray(snapshot.assets)) {
			return false;
		}

		if (snapshot.assets.length !== sceneState.assets.length) {
			return false;
		}

		const currentAssetsById = new Map(
			sceneState.assets.map((asset) => [asset.id, asset]),
		);
		const restoredAssets = [];

		for (const item of snapshot.assets) {
			const asset = currentAssetsById.get(item.id);
			if (!asset || asset.kind !== item.kind) {
				return false;
			}
			restoredAssets.push(asset);
		}

		sceneState.assets = restoredAssets;
		for (const item of snapshot.assets) {
			const asset = currentAssetsById.get(item.id);
			asset.worldScale = clampAssetWorldScale(item.worldScale);
			asset.unitMode = item.unitMode ?? asset.unitMode;
			asset.exportRole = item.exportRole === "omit" ? "omit" : "beauty";
			asset.maskGroup = String(item.maskGroup ?? "").trim();
			asset.workingPivotLocal = normalizeWorkingPivotLocal(
				item.workingPivotLocal,
			);
			asset.object.visible = item.visible !== false;
			asset.object.position.set(
				clampAssetTransformValue(item.position?.x, asset.object.position.x),
				clampAssetTransformValue(item.position?.y, asset.object.position.y),
				clampAssetTransformValue(item.position?.z, asset.object.position.z),
			);
			asset.object.rotation.set(
				THREE.MathUtils.degToRad(
					clampAssetTransformValue(
						item.rotationDegrees?.x,
						THREE.MathUtils.radToDeg(asset.object.rotation.x),
					),
				),
				THREE.MathUtils.degToRad(
					clampAssetTransformValue(
						item.rotationDegrees?.y,
						THREE.MathUtils.radToDeg(asset.object.rotation.y),
					),
				),
				THREE.MathUtils.degToRad(
					clampAssetTransformValue(
						item.rotationDegrees?.z,
						THREE.MathUtils.radToDeg(asset.object.rotation.z),
					),
				),
			);
			applyAssetWorldScale(asset);
			asset.object.updateMatrixWorld(true);
		}

		const restoredSelectedIds = Array.isArray(snapshot.selectedSceneAssetIds)
			? snapshot.selectedSceneAssetIds.filter((assetId) =>
					snapshot.assets.some((asset) => asset.id === assetId),
				)
			: [];
		store.selectedSceneAssetIds.value = [...new Set(restoredSelectedIds)];
		store.selectedSceneAssetId.value =
			snapshot.assets.some(
				(asset) => asset.id === snapshot.selectedSceneAssetId,
			) &&
			store.selectedSceneAssetIds.value.includes(snapshot.selectedSceneAssetId)
				? snapshot.selectedSceneAssetId
				: (store.selectedSceneAssetIds.value[0] ?? null);
		return true;
	}

	function registerAsset({
		kind,
		label,
		object,
		disposeTarget = null,
		source = null,
	}) {
		const asset = {
			id: sceneState.nextAssetId++,
			kind,
			label,
			object,
			disposeTarget,
			source,
			localBoundsHint: null,
			localCenterBoundsHint: null,
			baseScale: object.scale.clone(),
			unitMode: getDefaultAssetUnitMode(kind),
			worldScale: 1,
			exportRole: "beauty",
			maskGroup: "",
			workingPivotLocal: null,
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

	function getSceneAssetForObject(object3d) {
		let current = object3d;
		while (current) {
			const asset = sceneState.assets.find((entry) => entry.object === current);
			if (asset) {
				return asset;
			}
			current = current.parent;
		}
		return null;
	}

	function getSceneRaycastTargets() {
		return sceneState.assets
			.filter((asset) => asset.object.visible !== false)
			.map((asset) => asset.object);
	}

	function selectSceneAsset(
		assetId,
		{ additive = false, toggle = false } = {},
	) {
		const asset = getSceneAsset(assetId);
		if (!asset) {
			return;
		}

		const currentSelectedIds = store.selectedSceneAssetIds.value.filter((id) =>
			Boolean(getSceneAsset(id)),
		);
		const alreadySelected = currentSelectedIds.includes(asset.id);
		let nextSelectedIds = [asset.id];
		let nextSelectedId = asset.id;

		if (additive || toggle) {
			if (alreadySelected) {
				nextSelectedIds = currentSelectedIds.filter((id) => id !== asset.id);
				nextSelectedId =
					store.selectedSceneAssetId.value === asset.id
						? (nextSelectedIds.at(-1) ?? null)
						: (store.selectedSceneAssetId.value ??
							nextSelectedIds.at(-1) ??
							null);
			} else {
				nextSelectedIds = [...currentSelectedIds, asset.id];
				nextSelectedId = asset.id;
			}
		} else if (alreadySelected && currentSelectedIds.length === 1) {
			nextSelectedIds = [];
			nextSelectedId = null;
		} else if (alreadySelected && currentSelectedIds.length > 1) {
			nextSelectedIds = [asset.id];
			nextSelectedId = asset.id;
		}

		store.selectedSceneAssetIds.value = [...new Set(nextSelectedIds)];
		store.selectedSceneAssetId.value = nextSelectedId;
		updateUi();
	}

	function clearSceneAssetSelection() {
		store.selectedSceneAssetIds.value = [];
		store.selectedSceneAssetId.value = null;
		updateUi();
	}

	function clampAssetWorldScale(value) {
		return Math.max(0.01, Number(value) || 1);
	}

	function clampAssetTransformValue(value, fallback = 0) {
		const nextValue = Number(value);
		return Number.isFinite(nextValue) ? nextValue : fallback;
	}

	function normalizeWorkingPivotLocal(value) {
		if (!value || typeof value !== "object") {
			return null;
		}

		const nextPivot = new THREE.Vector3(
			clampAssetTransformValue(value.x, 0),
			clampAssetTransformValue(value.y, 0),
			clampAssetTransformValue(value.z, 0),
		);
		return nextPivot.lengthSq() <= 1e-8 ? null : nextPivot;
	}

	function getAssetWorkingPivotLocal(assetIdOrAsset) {
		const asset =
			typeof assetIdOrAsset === "object" && assetIdOrAsset
				? assetIdOrAsset
				: getSceneAsset(assetIdOrAsset);
		if (!asset) {
			return null;
		}
		return asset.workingPivotLocal?.clone() ?? new THREE.Vector3(0, 0, 0);
	}

	function getAssetWorkingPivotWorld(assetIdOrAsset) {
		const asset =
			typeof assetIdOrAsset === "object" && assetIdOrAsset
				? assetIdOrAsset
				: getSceneAsset(assetIdOrAsset);
		if (!asset) {
			return null;
		}

		const pivotLocal = getAssetWorkingPivotLocal(asset);
		return asset.object.localToWorld(pivotLocal);
	}

	function setAssetWorkingPivotWorld(
		assetId,
		nextWorldPosition,
		{ historyLabel = "asset.pivot" } = {},
	) {
		const asset = getSceneAsset(assetId);
		if (!asset || !nextWorldPosition) {
			return;
		}

		runHistoryAction?.(historyLabel, () => {
			const nextLocalPivot = asset.object.worldToLocal(
				nextWorldPosition.clone(),
			);
			asset.workingPivotLocal = normalizeWorkingPivotLocal(nextLocalPivot);
		});
		updateUi();
	}

	function resetAssetWorkingPivot(assetId) {
		const asset = getSceneAsset(assetId);
		if (!asset || !asset.workingPivotLocal) {
			return;
		}

		runHistoryAction?.("asset.pivot", () => {
			asset.workingPivotLocal = null;
		});
		updateUi();
	}

	function isFiniteBox(box) {
		if (!box || box.isEmpty()) {
			return false;
		}

		return [
			box.min.x,
			box.min.y,
			box.min.z,
			box.max.x,
			box.max.y,
			box.max.z,
		].every(Number.isFinite);
	}

	function isFiniteVector3(vector) {
		return (
			vector &&
			Number.isFinite(vector.x) &&
			Number.isFinite(vector.y) &&
			Number.isFinite(vector.z)
		);
	}

	function isFiniteQuaternion(quaternion) {
		return (
			quaternion &&
			Number.isFinite(quaternion.x) &&
			Number.isFinite(quaternion.y) &&
			Number.isFinite(quaternion.z) &&
			Number.isFinite(quaternion.w)
		);
	}

	function transformBoxToWorld(box, matrixWorld) {
		if (!isFiniteBox(box)) {
			return null;
		}

		const worldBox = box.clone();
		worldBox.applyMatrix4(matrixWorld);
		return isFiniteBox(worldBox) ? worldBox : null;
	}

	function describeBox(box) {
		if (!box) {
			return null;
		}

		return {
			empty: box.isEmpty(),
			min: {
				x: box.min.x,
				y: box.min.y,
				z: box.min.z,
			},
			max: {
				x: box.max.x,
				y: box.max.y,
				z: box.max.z,
			},
		};
	}

	function getModelAssetBounds(asset) {
		const box = new THREE.Box3().setFromObject(asset.object);
		return isFiniteBox(box) ? box : null;
	}

	function buildSplatLocalBoundsFromIterator(splatMesh, centersOnly = false) {
		if (typeof splatMesh?.forEachSplat !== "function") {
			return null;
		}

		const box = new THREE.Box3();
		const corner = new THREE.Vector3();
		let hasSplats = false;
		const signs = [-1, 1];

		splatMesh.forEachSplat((_index, center, scales, quaternion) => {
			if (!isFiniteVector3(center)) {
				return;
			}

			hasSplats = true;
			if (centersOnly) {
				box.expandByPoint(center);
				return;
			}

			if (!isFiniteVector3(scales) || !isFiniteQuaternion(quaternion)) {
				box.expandByPoint(center);
				return;
			}

			for (const x of signs) {
				for (const y of signs) {
					for (const z of signs) {
						corner.set(x * scales.x, y * scales.y, z * scales.z);
						corner.applyQuaternion(quaternion);
						corner.add(center);
						if (isFiniteVector3(corner)) {
							box.expandByPoint(corner);
						}
					}
				}
			}
		});

		return hasSplats && isFiniteBox(box) ? box : null;
	}

	function buildSplatLocalBoundsFromSource(splatSource, centersOnly = false) {
		return buildSplatLocalBoundsFromIterator(splatSource, centersOnly);
	}

	function computeTrimmedRange(sortedValues, trimFraction = 0.01) {
		if (!Array.isArray(sortedValues) || sortedValues.length === 0) {
			return null;
		}

		const trimCount =
			sortedValues.length >= 256
				? Math.min(
						Math.floor(sortedValues.length * trimFraction),
						Math.floor((sortedValues.length - 1) / 2),
					)
				: 0;
		return {
			min: sortedValues[trimCount],
			max: sortedValues[sortedValues.length - 1 - trimCount],
		};
	}

	function expandBoxByPadding(box, paddingFactor = 0.05) {
		if (!isFiniteBox(box)) {
			return null;
		}

		const size = box.getSize(new THREE.Vector3());
		const padding = new THREE.Vector3(
			Math.max(size.x * paddingFactor, 0.05),
			Math.max(size.y * paddingFactor, 0.05),
			Math.max(size.z * paddingFactor, 0.05),
		);
		return box.clone().expandByVector(padding);
	}

	function buildSplatFramingBoundsFromSource(
		splatSource,
		{ maxSamples = 32768, trimFraction = 0.01 } = {},
	) {
		if (typeof splatSource?.forEachSplat !== "function") {
			return null;
		}

		const sampleStep = Math.max(
			1,
			Math.ceil((Number(splatSource?.numSplats) || 0) / maxSamples),
		);
		const xs = [];
		const ys = [];
		const zs = [];

		splatSource.forEachSplat((index, center) => {
			if (index % sampleStep !== 0 || !isFiniteVector3(center)) {
				return;
			}
			xs.push(center.x);
			ys.push(center.y);
			zs.push(center.z);
		});

		if (xs.length === 0) {
			return null;
		}

		xs.sort((a, b) => a - b);
		ys.sort((a, b) => a - b);
		zs.sort((a, b) => a - b);

		const xRange = computeTrimmedRange(xs, trimFraction);
		const yRange = computeTrimmedRange(ys, trimFraction);
		const zRange = computeTrimmedRange(zs, trimFraction);
		if (!xRange || !yRange || !zRange) {
			return null;
		}

		const trimmedBox = new THREE.Box3(
			new THREE.Vector3(xRange.min, yRange.min, zRange.min),
			new THREE.Vector3(xRange.max, yRange.max, zRange.max),
		);
		return expandBoxByPadding(trimmedBox);
	}

	function getSplatAssetBounds(asset, centersOnly = false) {
		const splatMesh = asset.disposeTarget;
		const hintedWorldBox = transformBoxToWorld(
			centersOnly ? asset.localCenterBoundsHint : asset.localBoundsHint,
			splatMesh?.matrixWorld ?? asset.object.matrixWorld,
		);
		if (hintedWorldBox) {
			return hintedWorldBox;
		}

		if (typeof splatMesh?.getBoundingBox !== "function") {
			return getModelAssetBounds(asset);
		}

		try {
			asset.object.updateMatrixWorld(true);
			const worldMatrix = splatMesh.matrixWorld;
			if (centersOnly && !asset.localCenterBoundsHint) {
				const framingLocalBox = buildSplatFramingBoundsFromSource(splatMesh);
				const framingWorldBox = transformBoxToWorld(
					framingLocalBox,
					worldMatrix,
				);
				if (framingWorldBox) {
					asset.localCenterBoundsHint = framingLocalBox.clone();
					return framingWorldBox;
				}
			}

			const directLocalBox = splatMesh.getBoundingBox(centersOnly);
			const directWorldBox = transformBoxToWorld(directLocalBox, worldMatrix);
			if (directWorldBox) {
				return directWorldBox;
			}

			const centerLocalBox = centersOnly
				? directLocalBox
				: splatMesh.getBoundingBox(true);
			const directCenterWorldBox = transformBoxToWorld(
				centerLocalBox,
				worldMatrix,
			);
			if (directCenterWorldBox) {
				return directCenterWorldBox;
			}

			const iteratedLocalBox = buildSplatLocalBoundsFromIterator(
				splatMesh,
				centersOnly,
			);
			const iteratedWorldBox = transformBoxToWorld(
				iteratedLocalBox,
				worldMatrix,
			);
			if (iteratedWorldBox) {
				return iteratedWorldBox;
			}

			const iteratedCenterLocalBox = centersOnly
				? iteratedLocalBox
				: buildSplatLocalBoundsFromIterator(splatMesh, true);
			const iteratedCenterWorldBox = transformBoxToWorld(
				iteratedCenterLocalBox,
				worldMatrix,
			);
			if (iteratedCenterWorldBox) {
				return iteratedCenterWorldBox;
			}

			reportSplatBoundsWarningOnce(asset, "splat bounds unavailable", {
				numSplats: splatMesh.numSplats,
				hasPackedSplats: Boolean(splatMesh.packedSplats),
				packedNumSplats: splatMesh.packedSplats?.numSplats ?? null,
				hasExtSplats: Boolean(splatMesh.extSplats),
				extNumSplats: splatMesh.extSplats?.numSplats ?? null,
				directLocalBox: describeBox(directLocalBox),
				centerLocalBox: describeBox(centerLocalBox),
				iteratedLocalBox: describeBox(iteratedLocalBox),
				iteratedCenterLocalBox: describeBox(iteratedCenterLocalBox),
			});

			return getModelAssetBounds(asset);
		} catch {
			reportSplatBoundsWarningOnce(asset, "splat bounds threw", {
				numSplats: splatMesh?.numSplats ?? null,
				hasPackedSplats: Boolean(splatMesh?.packedSplats),
				hasExtSplats: Boolean(splatMesh?.extSplats),
			});
			return getModelAssetBounds(asset);
		}
	}

	function getAssetBounds(asset, { centersOnlyForSplats = false } = {}) {
		if (!asset?.object || asset.object.visible === false) {
			return null;
		}

		return asset.kind === "splat"
			? getSplatAssetBounds(asset, centersOnlyForSplats)
			: getModelAssetBounds(asset);
	}

	function getSceneBounds() {
		const box = new THREE.Box3();
		let hasBounds = false;

		for (const asset of sceneState.assets) {
			const assetBounds = getAssetBounds(asset);
			if (!assetBounds) {
				continue;
			}
			box.union(assetBounds);
			hasBounds = true;
		}

		if (!hasBounds || box.isEmpty()) {
			return null;
		}

		return {
			box,
			size: box.getSize(new THREE.Vector3()),
		};
	}

	function getSceneFramingBounds() {
		const box = new THREE.Box3();
		let hasBounds = false;

		for (const asset of sceneState.assets) {
			const assetBounds = getAssetBounds(asset, {
				centersOnlyForSplats: true,
			});
			if (!assetBounds) {
				continue;
			}
			box.union(assetBounds);
			hasBounds = true;
		}

		if (!hasBounds || box.isEmpty()) {
			return getSceneBounds();
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
				: isProjectFileEmbeddedFileSource(value) ||
						isProjectFilePackedSplatSource(value)
					? value.fileName
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

	function getProjectAssetState(value) {
		if (
			isProjectFileEmbeddedFileSource(value) ||
			isProjectFilePackedSplatSource(value)
		) {
			return value.projectAssetState ?? null;
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
		if (isProjectFilePackedSplatSource(value)) {
			return value.fileName || "meta.json";
		}
		if (isProjectFileEmbeddedFileSource(value)) {
			return value.fileName || value.file?.name || "asset";
		}
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

	async function fetchUrlAsFile(url, fallbackName = "asset.bin") {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Failed to fetch ${url}: ${response.status}`);
		}

		const blob = await response.blob();
		let fileName = fallbackName;
		try {
			const parsedUrl = new URL(url);
			fileName = decodeURIComponent(
				parsedUrl.pathname.split("/").pop() || fallbackName,
			);
		} catch {
			fileName = fallbackName;
		}
		return new File([blob], fileName, {
			type: blob.type || undefined,
		});
	}

	function applyProjectAssetState(asset, projectAssetState) {
		if (!asset || !projectAssetState) {
			return;
		}

		asset.label = String(projectAssetState.label ?? asset.label);
		asset.object.name = asset.label;
		asset.worldScale = clampAssetWorldScale(projectAssetState.worldScale);
		asset.unitMode = projectAssetState.unitMode ?? asset.unitMode;
		asset.exportRole =
			projectAssetState.exportRole === "omit" ? "omit" : "beauty";
		asset.maskGroup = String(projectAssetState.maskGroup ?? "").trim();
		asset.workingPivotLocal = normalizeWorkingPivotLocal(
			projectAssetState.workingPivotLocal,
		);
		asset.object.visible = projectAssetState.visible !== false;
		asset.object.position.set(
			clampAssetTransformValue(
				projectAssetState.transform?.position?.x,
				asset.object.position.x,
			),
			clampAssetTransformValue(
				projectAssetState.transform?.position?.y,
				asset.object.position.y,
			),
			clampAssetTransformValue(
				projectAssetState.transform?.position?.z,
				asset.object.position.z,
			),
		);
		asset.object.quaternion.set(
			clampAssetTransformValue(
				projectAssetState.transform?.quaternion?.x,
				asset.object.quaternion.x,
			),
			clampAssetTransformValue(
				projectAssetState.transform?.quaternion?.y,
				asset.object.quaternion.y,
			),
			clampAssetTransformValue(
				projectAssetState.transform?.quaternion?.z,
				asset.object.quaternion.z,
			),
			clampAssetTransformValue(
				projectAssetState.transform?.quaternion?.w,
				asset.object.quaternion.w,
			),
		);
		applyAssetWorldScale(asset);
		asset.object.updateMatrixWorld(true);
	}

	function captureProjectSceneState() {
		return sceneState.assets.map((asset) => ({
			id: String(asset.id),
			kind: asset.kind,
			label: asset.label,
			source: asset.source,
			transform: {
				position: {
					x: asset.object.position.x,
					y: asset.object.position.y,
					z: asset.object.position.z,
				},
				quaternion: {
					x: asset.object.quaternion.x,
					y: asset.object.quaternion.y,
					z: asset.object.quaternion.z,
					w: asset.object.quaternion.w,
				},
			},
			worldScale: asset.worldScale,
			unitMode: asset.unitMode,
			visible: asset.object.visible !== false,
			exportRole: asset.exportRole ?? "beauty",
			maskGroup: asset.maskGroup ?? "",
			workingPivotLocal: asset.workingPivotLocal
				? {
						x: asset.workingPivotLocal.x,
						y: asset.workingPivotLocal.y,
						z: asset.workingPivotLocal.z,
					}
				: null,
			order: index,
		}));
	}

	async function loadSplatFromSource(source) {
		const displayName = getDisplayName(source);
		const createSplatContainer = (
			mesh,
			localBoundsHint = null,
			localCenterBoundsHint = null,
			persistentSource = null,
		) => {
			const legacyState = getLegacyState(source);
			const projectAssetState = getProjectAssetState(source);
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
				disposeTarget: mesh,
				source: persistentSource,
			});
			asset.localBoundsHint = localBoundsHint?.clone?.() ?? localBoundsHint;
			asset.localCenterBoundsHint =
				localCenterBoundsHint?.clone?.() ?? localCenterBoundsHint;
			applyProjectAssetState(asset, projectAssetState);
			return object;
		};

		const createPackedSplatMesh = async ({
			fileName,
			inputBytes,
			extraFiles = undefined,
			fileType = undefined,
			pathOrUrl = undefined,
			persistentSource = null,
		}) => {
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
			return createSplatContainer(
				mesh,
				localBoundsHint,
				localCenterBoundsHint,
				persistentSource,
			);
		};

		if (isProjectFilePackedSplatSource(source)) {
			return createPackedSplatMesh({
				fileName: source.fileName,
				inputBytes: source.inputBytes,
				extraFiles: source.extraFiles,
				fileType: source.fileType,
				pathOrUrl: source.fileName,
				persistentSource: source,
			});
		}

		if (isProjectPackagePackedSplatSource(source)) {
			return createPackedSplatMesh({
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
					projectAssetState: getProjectAssetState(source),
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
						projectAssetState: getProjectAssetState(source),
					});
			return createPackedSplatMesh({
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
		return createPackedSplatMesh({
			fileName: fetchedFile.name,
			inputBytes: new Uint8Array(await fetchedFile.arrayBuffer()),
			pathOrUrl: source,
			persistentSource,
		});
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
			});
		} else {
			const file = await fetchUrlAsFile(source, displayName);
			url = URL.createObjectURL(file);
			needsRevoke = true;
			persistentSource = createProjectFileEmbeddedFileSource({
				kind: "model",
				file,
				fileName: file.name,
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
		clearHistory();

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
		const standaloneProjectSource = getStandaloneProjectSource(sources);
		try {
			if (standaloneProjectSource) {
				await openProjectSource(standaloneProjectSource);
				if (clearRemoteInput) {
					store.remoteUrl.value = "";
				}
				return true;
			}

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

	function getStandaloneProjectSource(sources) {
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

	function clearScene() {
		clearHistory();
		for (const asset of sceneState.assets) {
			asset.object.removeFromParent();
			if (asset.kind === "splat") {
				asset.disposeTarget?.dispose?.();
			} else {
				disposeObject(asset.object);
			}
		}

		sceneState.assets = [];
		store.selectedSceneAssetIds.value = [];
		store.selectedSceneAssetId.value = null;
		placeAllCamerasAtHome();
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

		runHistoryAction?.("asset.scale", () => {
			asset.worldScale = clampAssetWorldScale(nextValue);
			applyAssetWorldScale(asset);
		});
		updateUi();
		setStatus(
			t("status.assetScaleUpdated", {
				name: asset.label,
				scale: formatAssetWorldScale(asset.worldScale),
			}),
		);
	}

	function setAssetTransform(
		assetId,
		{ worldPosition = null, worldQuaternion = null, worldScale = null } = {},
		{ historyLabel = "asset.transform", updateStatus = false } = {},
	) {
		const asset = getSceneAsset(assetId);
		if (!asset) {
			return;
		}

		runHistoryAction?.(historyLabel, () => {
			applyAssetTransformWorld(asset, {
				worldPosition,
				worldQuaternion,
				worldScale,
			});
		});

		updateUi();
		if (updateStatus) {
			setStatus(
				t("status.assetTransformUpdated", {
					name: asset.label,
				}),
			);
		}
	}

	function applyAssetTransformWorld(
		asset,
		{ worldPosition = null, worldQuaternion = null, worldScale = null } = {},
	) {
		if (!asset) {
			return;
		}

		if (worldScale !== null && worldScale !== undefined) {
			asset.worldScale = clampAssetWorldScale(worldScale);
			applyAssetWorldScale(asset);
		}

		if (worldPosition) {
			const nextLocalPosition = worldPosition.clone();
			asset.object.parent?.worldToLocal(nextLocalPosition);
			asset.object.position.copy(nextLocalPosition);
		}

		if (worldQuaternion) {
			const nextLocalQuaternion = worldQuaternion.clone();
			if (asset.object.parent) {
				const parentWorldQuaternion = asset.object.parent.getWorldQuaternion(
					new THREE.Quaternion(),
				);
				nextLocalQuaternion.premultiply(parentWorldQuaternion.invert());
			}
			asset.object.quaternion.copy(nextLocalQuaternion);
		}

		asset.object.updateMatrixWorld(true);
	}

	function setAssetsTransformBulk(
		entries,
		{ historyLabel = "asset.transform", updateStatus = false } = {},
	) {
		if (!Array.isArray(entries) || entries.length === 0) {
			return;
		}

		const normalizedEntries = entries
			.map((entry) => {
				const asset = getSceneAsset(entry?.assetId);
				if (!asset) {
					return null;
				}
				return {
					asset,
					worldPosition: entry.worldPosition ?? null,
					worldQuaternion: entry.worldQuaternion ?? null,
					worldScale: entry.worldScale ?? null,
				};
			})
			.filter(Boolean);

		if (normalizedEntries.length === 0) {
			return;
		}

		runHistoryAction?.(historyLabel, () => {
			for (const entry of normalizedEntries) {
				applyAssetTransformWorld(entry.asset, entry);
			}
		});

		updateUi();
		if (updateStatus) {
			setStatus(
				t("status.assetTransformUpdated", {
					name:
						normalizedEntries.length === 1
							? normalizedEntries[0].asset.label
							: `${normalizedEntries.length} assets`,
				}),
			);
		}
	}

	function resetAssetWorldScale(assetId) {
		setAssetWorldScale(assetId, 1);
	}

	function setAssetPosition(assetId, axis, nextValue) {
		const asset = getSceneAsset(assetId);
		if (!asset || !["x", "y", "z"].includes(axis)) {
			return;
		}

		runHistoryAction?.("asset.position", () => {
			asset.object.position[axis] = clampAssetTransformValue(
				nextValue,
				asset.object.position[axis],
			);
			asset.object.updateMatrixWorld(true);
		});
		updateUi();
	}

	function setAssetRotationDegrees(assetId, axis, nextValue) {
		const asset = getSceneAsset(assetId);
		if (!asset || !["x", "y", "z"].includes(axis)) {
			return;
		}

		runHistoryAction?.("asset.rotation", () => {
			asset.object.rotation[axis] = THREE.MathUtils.degToRad(
				clampAssetTransformValue(
					nextValue,
					THREE.MathUtils.radToDeg(asset.object.rotation[axis]),
				),
			);
			asset.object.updateMatrixWorld(true);
		});
		updateUi();
	}

	function setAssetVisibility(assetId, nextVisible) {
		const asset = getSceneAsset(assetId);
		if (!asset) {
			return;
		}

		runHistoryAction?.("asset.visibility", () => {
			asset.object.visible = Boolean(nextVisible);
		});
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

		runHistoryAction?.("asset.order", () => {
			sceneState.assets = moveSceneAssetWithinKind(
				sceneState.assets,
				assetId,
				targetKindIndex,
			);
		});
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

		runHistoryAction?.("asset.order", () => {
			sceneState.assets = moveSceneAssetWithinKind(
				sceneState.assets,
				assetId,
				targetKindIndex,
			);
		});
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

		runHistoryAction?.("asset.export-role", () => {
			asset.exportRole = nextRole === "omit" ? "omit" : "beauty";
		});
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

		runHistoryAction?.("asset.mask-group", () => {
			asset.maskGroup = String(nextValue ?? "").trim();
		});
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
