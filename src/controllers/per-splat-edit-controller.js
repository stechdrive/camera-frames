import * as THREE from "three";
import { createSplatEditSceneHelper } from "../engine/splat-edit-scene-helper.js";
import { createSplatTransformPreviewController } from "../engine/splat-transform-preview.js";
import { createProjectFilePackedSplatSource } from "../project-document.js";

const WORLD_AXES = {
	x: new THREE.Vector3(1, 0, 0),
	y: new THREE.Vector3(0, 1, 0),
	z: new THREE.Vector3(0, 0, 1),
};

const MOVE_AXIS_HANDLE_NAMES = ["move-x", "move-y", "move-z"];
const MOVE_PLANE_HANDLE_NAMES = ["move-xy", "move-yz", "move-zx"];
const ROTATE_AXIS_HANDLE_NAMES = ["rotate-x", "rotate-y", "rotate-z"];
const SPLAT_SCALE_HANDLE_NAME = "scale-uniform";
const MIN_BOX_AXIS_SIZE = 0.01;
const MIN_BRUSH_SIZE = 0.01;
const MIN_BRUSH_DEPTH = 0.01;
const DEFAULT_BOX_SIZE = 1;
const DEFAULT_BRUSH_SIZE = 0.2;
const DEFAULT_BRUSH_DEPTH = 0.2;
const DERIVED_SPLAT_FILE_EXTENSION = "rawsplat";

function toPlainPoint(vector) {
	return {
		x: vector.x,
		y: vector.y,
		z: vector.z,
	};
}

function toVector3(point, fallback = 0) {
	return new THREE.Vector3(
		Number(point?.x ?? fallback),
		Number(point?.y ?? fallback),
		Number(point?.z ?? fallback),
	);
}

function clampBoxAxisSize(value) {
	return Math.max(MIN_BOX_AXIS_SIZE, Number(value) || DEFAULT_BOX_SIZE);
}

function clampBrushSize(value) {
	return Math.max(MIN_BRUSH_SIZE, Number(value) || DEFAULT_BRUSH_SIZE);
}

function clampBrushDepth(value) {
	return Math.max(MIN_BRUSH_DEPTH, Number(value) || DEFAULT_BRUSH_DEPTH);
}

function clonePackedExtra(extra = null) {
	if (!extra || typeof extra !== "object") {
		return {};
	}

	const nextExtra = {};
	for (const key of ["sh1", "sh2", "sh3", "lodTree"]) {
		const value = extra[key];
		if (value instanceof Uint32Array) {
			nextExtra[key] = new Uint32Array(value);
		}
	}
	if (extra.radMeta && typeof extra.radMeta === "object") {
		nextExtra.radMeta = JSON.parse(JSON.stringify(extra.radMeta));
	}
	return nextExtra;
}

function sanitizeFileStem(value, fallback = "splat-edit") {
	const normalized = String(value ?? "")
		.trim()
		.replace(/[\\/:*?"<>|]+/g, "-")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
	return normalized || fallback;
}

function buildAxisPlaneNormal(axisWorld, camera, helperA, helperB) {
	const cameraDirection = helperA
		.set(0, 0, -1)
		.applyQuaternion(camera.quaternion);
	const cameraUp = helperB.set(0, 1, 0).applyQuaternion(camera.quaternion);
	const helper = new THREE.Vector3().crossVectors(axisWorld, cameraDirection);
	if (helper.lengthSq() < 1e-6) {
		helper.crossVectors(axisWorld, cameraUp);
	}
	if (helper.lengthSq() < 1e-6) {
		return null;
	}
	return new THREE.Vector3()
		.crossVectors(helper.normalize(), axisWorld)
		.normalize();
}

function updatePointerRay(raycaster, pointerNdc, event, camera, viewportRect) {
	pointerNdc.set(
		((event.clientX - viewportRect.left) / viewportRect.width) * 2 - 1,
		-((event.clientY - viewportRect.top) / viewportRect.height) * 2 + 1,
	);
	raycaster.setFromCamera(pointerNdc, camera);
	return raycaster.ray;
}

function resolveElementRect(target) {
	const element = target?.current ?? target ?? null;
	if (typeof element?.getBoundingClientRect !== "function") {
		return null;
	}
	const rect = element.getBoundingClientRect();
	if (!rect || rect.width <= 0 || rect.height <= 0) {
		return null;
	}
	return rect;
}

export function createPerSplatEditController({
	store,
	state,
	t,
	guides,
	viewportShell,
	setStatus,
	updateUi,
	getAssetController,
	getActiveCamera,
	getActiveCameraViewCamera,
	selectionHighlightController,
	setViewportSelectMode,
	setViewportReferenceImageEditMode,
	setViewportTransformMode,
	setViewportPivotEditMode,
	setMeasurementMode,
	applyNavigateInteractionMode,
	syncControlsToMode,
	beginHistoryTransaction = () => false,
	commitHistoryTransaction = () => false,
	cancelHistoryTransaction = () => {},
}) {
	const isDevRuntime = Boolean(import.meta?.env?.DEV);
	const defaultBrushSize = clampBrushSize(store.splatEdit.brushSize.value);
	const defaultBrushDepthMode =
		store.splatEdit.brushDepthMode.value === "through" ? "through" : "depth";
	const defaultBrushDepth = clampBrushDepth(store.splatEdit.brushDepth.value);
	const selectedSplatsByAssetId = new Map();
	const sceneHelper = createSplatEditSceneHelper();
	const transformPreviewController = createSplatTransformPreviewController({
		guides,
	});
	guides?.add?.(sceneHelper.group);
	const raycaster = new THREE.Raycaster();
	const pointerNdc = new THREE.Vector2();
	const dragPlane = new THREE.Plane();
	const dragHitPoint = new THREE.Vector3();
	const dragDelta = new THREE.Vector3();
	const tempVector = new THREE.Vector3();
	const tempVector2 = new THREE.Vector3();
	const tempWorldPoint = new THREE.Vector3();
	const tempHalfSize = new THREE.Vector3();
	const tempBox = new THREE.Box3();
	const tempTransformMatrix = new THREE.Matrix4();
	const tempTransformPivotMatrix = new THREE.Matrix4();
	const tempTransformRotateMatrix = new THREE.Matrix4();
	const tempTransformScaleMatrix = new THREE.Matrix4();
	const tempTransformInversePivotMatrix = new THREE.Matrix4();
	const tempScreenPoint = new THREE.Vector3();
	const tempScreenPoint2 = new THREE.Vector3();
	const tempBrushRightVector = new THREE.Vector3();
	const tempCameraPosition = new THREE.Vector3();
	const tempCameraDirection = new THREE.Vector3();
	let lastBrushRayDepth = 0;
	const tempBrushUpVector = new THREE.Vector3();
	let activeBoxDrag = null;
	let activeBrushStroke = null;
	let activeTransformDrag = null;
	let activeTransformPreview = null;

	function getAssetIdKey(assetId) {
		return String(assetId);
	}

	function getSceneSplatAssets() {
		const runtimeAssets =
			getAssetController?.()?.getSceneAssets?.() ??
			store.sceneAssets.value ??
			[];
		return runtimeAssets.filter((asset) => asset?.kind === "splat");
	}

	function getSplatPackedSource(asset) {
		return asset?.disposeTarget?.packedSplats ?? null;
	}

	function getSplatAssetTotalCount(asset) {
		const packedSplats = getSplatPackedSource(asset);
		if (Number.isFinite(packedSplats?.numSplats)) {
			return packedSplats.numSplats;
		}
		let totalCount = 0;
		asset?.disposeTarget?.forEachSplat?.(() => {
			totalCount += 1;
		});
		return totalCount;
	}

	function buildRemainingIndices(totalCount, selectedIndexSet) {
		const remaining = [];
		for (let index = 0; index < totalCount; index += 1) {
			if (!selectedIndexSet.has(index)) {
				remaining.push(index);
			}
		}
		return new Uint32Array(remaining);
	}

	function buildSelectedSplatOperations() {
		const operations = [];
		for (const asset of getSplatEditScopeAssets()) {
			const assetIdKey = getAssetIdKey(asset.id);
			const selectedSet = selectedSplatsByAssetId.get(assetIdKey);
			if (!selectedSet || selectedSet.size === 0) {
				continue;
			}
			const totalCount = getSplatAssetTotalCount(asset);
			if (totalCount <= 0) {
				continue;
			}
			const selectedIndices = new Uint32Array(
				[...selectedSet]
					.filter(
						(index) =>
							Number.isInteger(index) && index >= 0 && index < totalCount,
					)
					.sort((left, right) => left - right),
			);
			if (selectedIndices.length === 0) {
				continue;
			}
			const selectedIndexSet = new Set(selectedIndices);
			operations.push({
				asset,
				assetIdKey,
				totalCount,
				selectedIndices,
				selectedIndexSet,
				remainingIndices: buildRemainingIndices(totalCount, selectedIndexSet),
			});
		}
		return operations;
	}

	function getCapturedProjectAssetState(asset, { label = asset?.label } = {}) {
		const snapshot =
			getAssetController?.()
				?.captureProjectSceneState?.()
				?.find((entry) => String(entry.id) === String(asset?.id)) ?? null;
		if (!snapshot) {
			return null;
		}
		return {
			...snapshot,
			label: String(label ?? snapshot.label ?? asset?.label ?? "3DGS"),
		};
	}

	function buildDerivedSplatFileName(asset, suffix = "derived") {
		const sourceFileName =
			asset?.source?.fileName ?? asset?.label ?? `${asset?.id ?? "splat"}`;
		const baseName = String(sourceFileName).replace(/\.[^./\\]+$/, "");
		return `${sanitizeFileStem(baseName)}-${suffix}.${DERIVED_SPLAT_FILE_EXTENSION}`;
	}

	function buildUniqueSplitLabel(baseLabel) {
		const existingLabels = new Set(
			getSceneSplatAssets().map((asset) => String(asset.label ?? "").trim()),
		);
		const base = `${String(baseLabel ?? "3DGS").trim() || "3DGS"} Split`;
		if (!existingLabels.has(base)) {
			return base;
		}
		let index = 2;
		while (existingLabels.has(`${base} ${index}`)) {
			index += 1;
		}
		return `${base} ${index}`;
	}

	function updateSplatAssetBoundsHints(asset) {
		const splatMesh = asset?.disposeTarget;
		if (!splatMesh || typeof splatMesh.getBoundingBox !== "function") {
			return false;
		}
		const localBoundsHint =
			splatMesh.getBoundingBox(false)?.clone?.() ??
			splatMesh.getBoundingBox()?.clone?.() ??
			null;
		const localCenterBoundsHint =
			splatMesh.getBoundingBox(true)?.clone?.() ??
			localBoundsHint?.clone?.() ??
			null;
		asset.localBoundsHint = localBoundsHint;
		asset.localCenterBoundsHint = localCenterBoundsHint;
		return true;
	}

	function syncSplatAssetPersistentSource(asset) {
		const packedSplats = getSplatPackedSource(asset);
		if (!asset || !packedSplats) {
			return false;
		}
		asset.source = createProjectFilePackedSplatSource({
			fileName:
				asset?.source?.fileName ?? buildDerivedSplatFileName(asset, "edited"),
			inputBytes: asset?.source?.inputBytes ?? new Uint8Array(),
			extraFiles: asset?.source?.extraFiles ?? {},
			fileType: asset?.source?.fileType ?? null,
			packedArray: packedSplats.packedArray ?? new Uint32Array(),
			numSplats: packedSplats.getNumSplats?.() ?? packedSplats.numSplats ?? 0,
			extra: clonePackedExtra(packedSplats.extra),
			splatEncoding: packedSplats.splatEncoding ?? null,
			projectAssetState: getCapturedProjectAssetState(asset.id, {
				label: asset.label,
			}),
			legacyState: asset?.source?.legacyState ?? null,
			resource: asset?.source?.resource ?? null,
		});
		updateSplatAssetBoundsHints(asset);
		return true;
	}

	function createDerivedPackedSplatSource(
		asset,
		indices,
		{ label, fileName } = {},
	) {
		const packedSplats = getSplatPackedSource(asset);
		if (
			!packedSplats ||
			!(indices instanceof Uint32Array) ||
			indices.length === 0
		) {
			return null;
		}
		const extracted = packedSplats.extractSplats(indices, false);
		return createProjectFilePackedSplatSource({
			fileName:
				fileName ??
				asset?.source?.fileName ??
				buildDerivedSplatFileName(asset, "selection"),
			packedArray: extracted.packedArray,
			numSplats: extracted.numSplats,
			extra: clonePackedExtra(extracted.extra),
			splatEncoding:
				extracted.splatEncoding && typeof extracted.splatEncoding === "object"
					? JSON.parse(JSON.stringify(extracted.splatEncoding))
					: null,
			projectAssetState: getCapturedProjectAssetState(asset, { label }),
			legacyState: asset?.source?.legacyState ?? null,
		});
	}

	function normalizeScopeAssetIds(assetIds = []) {
		const validIds = new Set(
			getSceneSplatAssets().map((asset) => getAssetIdKey(asset.id)),
		);
		return [...new Set((assetIds ?? []).map(getAssetIdKey))].filter((assetId) =>
			validIds.has(assetId),
		);
	}

	function resolveEntryScopeAssetIds() {
		const selectedScopeAssetIds = normalizeScopeAssetIds(
			store.selectedSceneAssetIds.value,
		);
		if (selectedScopeAssetIds.length > 0) {
			return selectedScopeAssetIds;
		}
		return normalizeScopeAssetIds(
			store.splatEdit.rememberedScopeAssetIds.value,
		);
	}

	function syncSelectionCount() {
		const scopeAssetIds = new Set(getSplatEditScopeAssetIds());
		let totalCount = 0;
		for (const [assetId, selectedSplats] of selectedSplatsByAssetId.entries()) {
			if (!scopeAssetIds.has(assetId)) {
				continue;
			}
			totalCount += selectedSplats?.size ?? 0;
		}
		store.splatEdit.selectionCount.value = totalCount;
	}

	function syncSelectionHighlight() {
		selectionHighlightController?.sync?.({
			scopeAssets: getSplatEditScopeAssets(),
			selectedSplatsByAssetId,
			hiddenSelectedSplatsByAssetId:
				transformPreviewController.getHiddenSelectedSplatsByAssetId?.() ??
				new Map(),
		});
	}

	function captureEditState() {
		return {
			tool:
				store.splatEdit.tool.value === "brush"
					? "brush"
					: store.splatEdit.tool.value === "transform"
						? "transform"
						: "box",
			scopeAssetIds: getSplatEditScopeAssetIds(),
			rememberedScopeAssetIds: normalizeScopeAssetIds(
				store.splatEdit.rememberedScopeAssetIds.value,
			),
			brushSize: clampBrushSize(store.splatEdit.brushSize.value),
			brushDepthMode:
				store.splatEdit.brushDepthMode.value === "through"
					? "through"
					: "depth",
			brushDepth: clampBrushDepth(store.splatEdit.brushDepth.value),
			boxPlaced: store.splatEdit.boxPlaced.value === true,
			boxCenter: {
				...store.splatEdit.boxCenter.value,
			},
			boxSize: {
				x: clampBoxAxisSize(store.splatEdit.boxSize.value?.x),
				y: clampBoxAxisSize(store.splatEdit.boxSize.value?.y),
				z: clampBoxAxisSize(store.splatEdit.boxSize.value?.z),
			},
			hudPosition: {
				x: Number.isFinite(store.splatEdit.hudPosition.value?.x)
					? Number(store.splatEdit.hudPosition.value.x)
					: null,
				y: Number.isFinite(store.splatEdit.hudPosition.value?.y)
					? Number(store.splatEdit.hudPosition.value.y)
					: null,
			},
			lastOperation: {
				mode: String(store.splatEdit.lastOperation.value?.mode ?? ""),
				hitCount: Number.isFinite(store.splatEdit.lastOperation.value?.hitCount)
					? Number(store.splatEdit.lastOperation.value.hitCount)
					: 0,
			},
			selectedSplatsByAssetId: Array.from(
				selectedSplatsByAssetId.entries(),
			).map(([assetId, selectedSplats]) => ({
				assetId,
				indices: [...selectedSplats]
					.filter((index) => Number.isInteger(index) && index >= 0)
					.sort((left, right) => left - right),
			})),
		};
	}

	function restoreEditState(snapshot = null) {
		selectedSplatsByAssetId.clear();
		activeBrushStroke = null;
		clearBrushPreview({ syncUi: false });
		if (!snapshot || typeof snapshot !== "object") {
			store.splatEdit.tool.value = "box";
			store.splatEdit.scopeAssetIds.value = [];
			store.splatEdit.rememberedScopeAssetIds.value = [];
			store.splatEdit.brushSize.value = defaultBrushSize;
			store.splatEdit.brushDepthMode.value = defaultBrushDepthMode;
			store.splatEdit.brushDepth.value = defaultBrushDepth;
			store.splatEdit.boxPlaced.value = false;
			store.splatEdit.boxCenter.value = { x: 0, y: 0, z: 0 };
			store.splatEdit.boxSize.value = { x: 1, y: 1, z: 1 };
			store.splatEdit.hudPosition.value = { x: null, y: null };
			store.splatEdit.lastOperation.value = { mode: "", hitCount: 0 };
			syncSelectionCount();
			syncSelectionHighlight();
			syncSceneHelper();
			updateUi?.();
			return true;
		}

		store.splatEdit.tool.value =
			snapshot.tool === "brush"
				? "brush"
				: snapshot.tool === "transform"
					? "transform"
					: "box";
		store.splatEdit.scopeAssetIds.value = normalizeScopeAssetIds(
			snapshot.scopeAssetIds,
		);
		store.splatEdit.rememberedScopeAssetIds.value = normalizeScopeAssetIds(
			snapshot.rememberedScopeAssetIds,
		);
		store.splatEdit.brushSize.value = clampBrushSize(snapshot.brushSize);
		store.splatEdit.brushDepthMode.value =
			snapshot.brushDepthMode === "through" ? "through" : "depth";
		store.splatEdit.brushDepth.value = clampBrushDepth(snapshot.brushDepth);
		store.splatEdit.boxPlaced.value =
			typeof snapshot.boxPlaced === "boolean" ? snapshot.boxPlaced : true;
		store.splatEdit.boxCenter.value = {
			x: Number(snapshot.boxCenter?.x ?? 0),
			y: Number(snapshot.boxCenter?.y ?? 0),
			z: Number(snapshot.boxCenter?.z ?? 0),
		};
		store.splatEdit.boxSize.value = {
			x: clampBoxAxisSize(snapshot.boxSize?.x),
			y: clampBoxAxisSize(snapshot.boxSize?.y),
			z: clampBoxAxisSize(snapshot.boxSize?.z),
		};
		store.splatEdit.hudPosition.value = {
			x: Number.isFinite(snapshot.hudPosition?.x)
				? Number(snapshot.hudPosition.x)
				: null,
			y: Number.isFinite(snapshot.hudPosition?.y)
				? Number(snapshot.hudPosition.y)
				: null,
		};
		store.splatEdit.lastOperation.value = {
			mode: String(snapshot.lastOperation?.mode ?? ""),
			hitCount: Number.isFinite(snapshot.lastOperation?.hitCount)
				? Number(snapshot.lastOperation.hitCount)
				: 0,
		};

		const validAssetIds = new Set(
			getSceneSplatAssets().map((asset) => getAssetIdKey(asset.id)),
		);
		for (const entry of snapshot.selectedSplatsByAssetId ?? []) {
			const assetIdKey = getAssetIdKey(entry?.assetId);
			if (!validAssetIds.has(assetIdKey)) {
				continue;
			}
			const asset = getSceneSplatAssets().find(
				(sceneAsset) => getAssetIdKey(sceneAsset.id) === assetIdKey,
			);
			if (!asset) {
				continue;
			}
			const totalCount = getSplatAssetTotalCount(asset);
			const selectedSet = new Set(
				(entry?.indices ?? []).filter(
					(index) =>
						Number.isInteger(index) && index >= 0 && index < totalCount,
				),
			);
			if (selectedSet.size > 0) {
				selectedSplatsByAssetId.set(assetIdKey, selectedSet);
			}
		}

		syncSelectionCount();
		syncSelectionHighlight();
		syncSceneHelper();
		updateUi?.();
		return true;
	}

	async function runHistoryTransaction(label, applyChange) {
		const hasHistoryTransaction = beginHistoryTransaction?.(label) === true;
		try {
			const result = await applyChange();
			if (hasHistoryTransaction) {
				commitHistoryTransaction?.(label);
			}
			return result;
		} catch (error) {
			if (hasHistoryTransaction) {
				cancelHistoryTransaction?.();
			}
			throw error;
		}
	}

	function clearSplatSelection() {
		clearActiveTransformPreview({ syncUi: false });
		selectedSplatsByAssetId.clear();
		syncSelectionCount();
		store.splatEdit.lastOperation.value = {
			mode: "clear",
			hitCount: 0,
		};
		selectionHighlightController?.clear?.();
		syncSceneHelper();
		updateUi?.();
	}

	function syncScopeToSceneSelection() {
		if (!isSplatEditModeActive()) {
			return false;
		}
		const nextScopeAssetIds = normalizeScopeAssetIds(
			store.selectedSceneAssetIds.value,
		);
		const currentScopeAssetIds = getSplatEditScopeAssetIds();
		if (
			nextScopeAssetIds.length === currentScopeAssetIds.length &&
			nextScopeAssetIds.every(
				(assetId, index) => assetId === currentScopeAssetIds[index],
			)
		) {
			return false;
		}
		clearActiveTransformPreview({ syncUi: false });
		store.splatEdit.scopeAssetIds.value = [...nextScopeAssetIds];
		if (nextScopeAssetIds.length > 0) {
			store.splatEdit.rememberedScopeAssetIds.value = [...nextScopeAssetIds];
		}
		syncSelectionCount();
		syncSelectionHighlight();
		syncSceneHelper();
		updateUi?.();
		return true;
	}

	function getSplatEditScopeAssetIds() {
		return [...(store.splatEdit.scopeAssetIds.value ?? [])];
	}

	function getSplatEditScopeAssets() {
		const scopeIds = new Set(getSplatEditScopeAssetIds());
		return getSceneSplatAssets().filter((asset) =>
			scopeIds.has(getAssetIdKey(asset.id)),
		);
	}

	function getSplatEditBoxCenter() {
		return toVector3(store.splatEdit.boxCenter.value, 0);
	}

	function getSplatEditBoxSize() {
		const size = store.splatEdit.boxSize.value ?? {};
		return new THREE.Vector3(
			clampBoxAxisSize(size.x),
			clampBoxAxisSize(size.y),
			clampBoxAxisSize(size.z),
		);
	}

	function getSplatEditBoxBounds() {
		if (!store.splatEdit.boxPlaced.value) {
			return null;
		}
		const center = getSplatEditBoxCenter();
		const size = getSplatEditBoxSize();
		tempHalfSize.copy(size).multiplyScalar(0.5);
		return tempBox.copy(
			new THREE.Box3(
				center.clone().sub(tempHalfSize),
				center.clone().add(tempHalfSize),
			),
		);
	}

	function getSelectedSplatTransformEntries() {
		const entries = [];
		const selectionBounds = new THREE.Box3();
		let hasSelection = false;
		for (const asset of getSplatEditScopeAssets()) {
			const assetIdKey = getAssetIdKey(asset.id);
			const selectedSet = selectedSplatsByAssetId.get(assetIdKey);
			const splatMesh = asset?.disposeTarget;
			const packedSplats = getSplatPackedSource(asset);
			if (
				!selectedSet ||
				selectedSet.size === 0 ||
				typeof splatMesh?.forEachSplat !== "function" ||
				typeof packedSplats?.setSplat !== "function"
			) {
				continue;
			}
			asset.object?.updateMatrixWorld?.(true);
			splatMesh.updateMatrixWorld?.(true);
			const worldMatrix = (
				splatMesh?.matrixWorld ??
				asset.contentObject?.matrixWorld ??
				asset.object?.matrixWorld ??
				new THREE.Matrix4()
			).clone();
			const worldMatrixInverse = worldMatrix.clone().invert();
			const worldQuaternion = new THREE.Quaternion();
			const worldPosition = new THREE.Vector3();
			const worldScale = new THREE.Vector3();
			worldMatrix.decompose(worldPosition, worldQuaternion, worldScale);
			const inverseWorldQuaternion = worldQuaternion.clone().invert();
			const totalCount = getSplatAssetTotalCount(asset);
			const splats = [];
			splatMesh.forEachSplat(
				(index, center, scales, quaternion, opacity, color) => {
					if (!selectedSet.has(index)) {
						return;
					}
					const worldCenter = center.clone().applyMatrix4(worldMatrix);
					if (!Number.isFinite(worldCenter.x)) {
						return;
					}
					selectionBounds.expandByPoint(worldCenter);
					hasSelection = true;
					splats.push({
						index,
						center: center.clone(),
						worldCenter,
						scales: scales.clone(),
						quaternion: quaternion.clone(),
						opacity: Number(opacity ?? 1),
						color:
							typeof color?.clone === "function"
								? color.clone()
								: new THREE.Color(
										Number(color?.r ?? 1),
										Number(color?.g ?? 1),
										Number(color?.b ?? 1),
									),
					});
				},
			);
			if (splats.length === 0) {
				continue;
			}
			entries.push({
				asset,
				assetIdKey,
				splatMesh,
				packedSplats,
				worldMatrix,
				worldMatrixInverse,
				worldQuaternion,
				inverseWorldQuaternion,
				totalCount,
				splats,
			});
		}
		return {
			entries,
			selectionBounds:
				hasSelection && !selectionBounds.isEmpty() ? selectionBounds : null,
		};
	}

	function composeSelectedSplatTransformMatrix(
		transformState,
		target = new THREE.Matrix4(),
	) {
		const translation = transformState?.worldTranslation ?? new THREE.Vector3();
		const rotation =
			transformState?.worldRotation instanceof THREE.Quaternion
				? transformState.worldRotation
				: new THREE.Quaternion();
		const pivot = transformState?.pivotWorld ?? new THREE.Vector3();
		const uniformScale =
			Number.isFinite(transformState?.uniformScale) &&
			transformState.uniformScale > 0
				? Number(transformState.uniformScale)
				: 1;
		target.makeTranslation(translation.x, translation.y, translation.z);
		target.multiply(
			tempTransformPivotMatrix.makeTranslation(pivot.x, pivot.y, pivot.z),
		);
		target.multiply(
			tempTransformRotateMatrix.makeRotationFromQuaternion(rotation),
		);
		target.multiply(
			tempTransformScaleMatrix.makeScale(
				uniformScale,
				uniformScale,
				uniformScale,
			),
		);
		target.multiply(
			tempTransformInversePivotMatrix.makeTranslation(
				-pivot.x,
				-pivot.y,
				-pivot.z,
			),
		);
		return target;
	}

	function getSelectedSplatTransformBounds() {
		if (activeTransformPreview?.selectionBounds) {
			return activeTransformPreview.selectionBounds
				.clone()
				.applyMatrix4(
					composeSelectedSplatTransformMatrix(
						activeTransformPreview,
						tempTransformMatrix,
					),
				);
		}
		return getSelectedSplatTransformEntries().selectionBounds;
	}

	function getSelectedSplatTransformPivotWorld() {
		const selectionBounds = getSelectedSplatTransformBounds();
		return selectionBounds?.getCenter?.(new THREE.Vector3()) ?? null;
	}

	function clearActiveTransformPreview({ syncUi = true } = {}) {
		activeTransformPreview = null;
		transformPreviewController.clear();
		if (syncUi) {
			syncSelectionHighlight();
			syncSceneHelper();
			updateUi?.();
		}
	}

	function ensureSelectedSplatTransformPreview(
		entries,
		selectionBounds,
		pivotWorld = null,
	) {
		if (!Array.isArray(entries) || entries.length === 0 || !selectionBounds) {
			return null;
		}
		clearActiveTransformPreview({ syncUi: false });
		const previewState = {
			entries,
			selectionBounds: selectionBounds.clone(),
			pivotWorld:
				pivotWorld?.clone?.() ?? selectionBounds.getCenter(new THREE.Vector3()),
			worldTranslation: new THREE.Vector3(),
			worldRotation: new THREE.Quaternion(),
			uniformScale: 1,
		};
		activeTransformPreview = previewState;
		syncSelectionHighlight();
		syncSceneHelper();
		updateUi?.();
		transformPreviewController
			.start(previewState)
			.then((preview) => {
				if (!preview || activeTransformPreview !== previewState) {
					return;
				}
				transformPreviewController.updateTransform(previewState);
				syncSelectionHighlight();
				syncSceneHelper();
				updateUi?.();
			})
			.catch(() => {});
		return previewState;
	}

	function updateSelectedSplatTransformPreview(
		previewState,
		{
			worldTranslation = null,
			worldRotation = null,
			uniformScale = 1,
			pivotWorld = null,
		} = {},
	) {
		if (!previewState) {
			return false;
		}
		previewState.worldTranslation.copy(
			worldTranslation?.clone?.() ?? new THREE.Vector3(),
		);
		previewState.worldRotation.copy(
			worldRotation instanceof THREE.Quaternion
				? worldRotation
				: new THREE.Quaternion(),
		);
		previewState.uniformScale =
			Number.isFinite(uniformScale) && uniformScale > 0
				? Number(uniformScale)
				: 1;
		if (pivotWorld?.clone) {
			previewState.pivotWorld.copy(pivotWorld);
		}
		transformPreviewController.updateTransform(previewState);
		syncSceneHelper();
		updateUi?.();
		return true;
	}

	function applySelectedSplatTransform(
		entries,
		{
			worldTranslation = null,
			worldRotation = null,
			uniformScale = 1,
			pivotWorld = null,
		} = {},
	) {
		if (!Array.isArray(entries) || entries.length === 0) {
			return false;
		}
		const translation = worldTranslation?.clone?.() ?? new THREE.Vector3();
		const rotation =
			worldRotation instanceof THREE.Quaternion ? worldRotation.clone() : null;
		const scaleFactor =
			Number.isFinite(uniformScale) && uniformScale > 0 ? uniformScale : 1;
		const pivot = pivotWorld?.clone?.() ?? new THREE.Vector3();
		let changed = false;
		for (const entry of entries) {
			const localDeltaQuaternion = rotation
				? entry.inverseWorldQuaternion
						.clone()
						.multiply(rotation)
						.multiply(entry.worldQuaternion)
						.normalize()
				: null;
			for (const splat of entry.splats) {
				let nextWorldCenter = splat.worldCenter.clone().add(translation);
				if (rotation) {
					nextWorldCenter = nextWorldCenter
						.sub(pivot)
						.applyQuaternion(rotation)
						.add(pivot);
				}
				if (scaleFactor !== 1) {
					nextWorldCenter = nextWorldCenter
						.sub(pivot)
						.multiplyScalar(scaleFactor)
						.add(pivot);
				}
				const nextLocalCenter = nextWorldCenter.applyMatrix4(
					entry.worldMatrixInverse,
				);
				const nextScales =
					scaleFactor === 1
						? splat.scales
						: splat.scales.clone().multiplyScalar(scaleFactor);
				const nextQuaternion = localDeltaQuaternion
					? localDeltaQuaternion.clone().multiply(splat.quaternion).normalize()
					: splat.quaternion;
				entry.packedSplats.setSplat(
					splat.index,
					nextLocalCenter,
					nextScales,
					nextQuaternion,
					splat.opacity,
					splat.color,
				);
			}
			entry.packedSplats.needsUpdate = true;
			entry.splatMesh.updateGenerator?.();
			updateSplatAssetBoundsHints(entry.asset);
			changed = true;
		}
		return changed;
	}

	function finalizeSelectedSplatTransform(entries) {
		if (!Array.isArray(entries) || entries.length === 0) {
			clearActiveTransformPreview();
			return false;
		}
		if (!applySelectedSplatTransform(entries, activeTransformPreview ?? {})) {
			clearActiveTransformPreview();
			return false;
		}
		let changed = false;
		for (const entry of entries) {
			changed = syncSplatAssetPersistentSource(entry.asset) || changed;
		}
		clearActiveTransformPreview({ syncUi: false });
		syncSelectionHighlight();
		syncSceneHelper();
		updateUi?.();
		return changed;
	}

	function moveSelectedSplatsByWorldDelta(worldDelta) {
		const { entries } = getSelectedSplatTransformEntries();
		if (entries.length === 0 || !worldDelta?.isVector3) {
			return false;
		}
		activeTransformPreview = {
			entries,
			selectionBounds: getSelectedSplatTransformBounds()?.clone?.() ?? null,
			pivotWorld:
				getSelectedSplatTransformPivotWorld()?.clone?.() ?? new THREE.Vector3(),
			worldTranslation: worldDelta.clone(),
			worldRotation: new THREE.Quaternion(),
			uniformScale: 1,
		};
		finalizeSelectedSplatTransform(entries);
		store.splatEdit.lastOperation.value = {
			mode: "transform-move",
			hitCount: store.splatEdit.selectionCount.value,
		};
		setStatus?.(
			t("status.splatEditTransformedMove", {
				count: store.splatEdit.selectionCount.value,
			}),
		);
		return true;
	}

	function rotateSelectedSplatsAroundSelection(axisWorld, angleRadians) {
		const { entries, selectionBounds } = getSelectedSplatTransformEntries();
		if (
			entries.length === 0 ||
			!axisWorld?.isVector3 ||
			!Number.isFinite(angleRadians) ||
			!selectionBounds
		) {
			return false;
		}
		const worldRotation = new THREE.Quaternion().setFromAxisAngle(
			axisWorld.clone().normalize(),
			angleRadians,
		);
		if (!selectionBounds) {
			return false;
		}
		activeTransformPreview = {
			entries,
			selectionBounds: selectionBounds.clone(),
			pivotWorld: selectionBounds.getCenter(new THREE.Vector3()),
			worldTranslation: new THREE.Vector3(),
			worldRotation,
			uniformScale: 1,
		};
		finalizeSelectedSplatTransform(entries);
		store.splatEdit.lastOperation.value = {
			mode: "transform-rotate",
			hitCount: store.splatEdit.selectionCount.value,
		};
		setStatus?.(
			t("status.splatEditTransformedRotate", {
				count: store.splatEdit.selectionCount.value,
			}),
		);
		return true;
	}

	function scaleSelectedSplatsUniformAroundSelection(scaleFactor) {
		const { entries, selectionBounds } = getSelectedSplatTransformEntries();
		if (
			entries.length === 0 ||
			!selectionBounds ||
			!Number.isFinite(scaleFactor) ||
			scaleFactor <= 0
		) {
			return false;
		}
		activeTransformPreview = {
			entries,
			selectionBounds: selectionBounds.clone(),
			pivotWorld: selectionBounds.getCenter(new THREE.Vector3()),
			worldTranslation: new THREE.Vector3(),
			worldRotation: new THREE.Quaternion(),
			uniformScale: scaleFactor,
		};
		finalizeSelectedSplatTransform(entries);
		store.splatEdit.lastOperation.value = {
			mode: "transform-scale",
			hitCount: store.splatEdit.selectionCount.value,
		};
		setStatus?.(
			t("status.splatEditTransformedScale", {
				count: store.splatEdit.selectionCount.value,
			}),
		);
		return true;
	}

	function getViewportRect() {
		return resolveElementRect(viewportShell);
	}

	function getPrimaryViewRect() {
		// Camera View uses the preview camera with an off-axis projection that
		// already bakes the render-box offset into the camera frustum.
		return getViewportRect();
	}

	function getPrimaryViewCamera() {
		return state.mode === "camera"
			? (getActiveCameraViewCamera?.() ?? getActiveCamera?.() ?? null)
			: (getActiveCamera?.() ?? null);
	}

	function getBrushHitFromClientPoint({ clientX, clientY } = {}) {
		if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) {
			return null;
		}
		const camera = getPrimaryViewCamera();
		const viewRect = getPrimaryViewRect();
		if (!camera || !viewRect) {
			return null;
		}
		const pointerRay = updatePointerRay(
			raycaster,
			pointerNdc,
			{ clientX, clientY },
			camera,
			viewRect,
		);
		const raycastTargets =
			getAssetController?.()?.getSceneRaycastTargets?.() ?? [];
		if (raycastTargets.length <= 0) {
			return null;
		}
		const intersections = raycaster.intersectObjects(raycastTargets, true);
		let hitPoint = intersections[0]?.point?.clone?.() ?? null;
		if (hitPoint) {
			camera.getWorldPosition(tempCameraPosition);
			lastBrushRayDepth = hitPoint.distanceTo(tempCameraPosition);
		} else {
			hitPoint = resolveBrushFallbackHitPoint(camera, pointerRay);
		}
		if (!hitPoint) {
			return null;
		}
		return {
			camera,
			hitPoint,
			rayDirection: pointerRay.direction.clone().normalize(),
			viewRect,
		};
	}

	function getBrushHitFromClientPointFast({ clientX, clientY } = {}) {
		if (
			!Number.isFinite(clientX) ||
			!Number.isFinite(clientY) ||
			lastBrushRayDepth <= 0.01
		) {
			return null;
		}
		const camera = getPrimaryViewCamera();
		const viewRect = getPrimaryViewRect();
		if (!camera || !viewRect) {
			return null;
		}
		const pointerRay = updatePointerRay(
			raycaster,
			pointerNdc,
			{ clientX, clientY },
			camera,
			viewRect,
		);
		return {
			camera,
			hitPoint: pointerRay.at(lastBrushRayDepth, new THREE.Vector3()),
			rayDirection: pointerRay.direction.clone().normalize(),
			viewRect,
		};
	}

	function resolveBrushFallbackHitPoint(camera, pointerRay) {
		if (lastBrushRayDepth > 0.01) {
			return pointerRay.at(lastBrushRayDepth, new THREE.Vector3());
		}
		const sceneBounds = getAssetController?.()?.getSceneBounds?.();
		if (sceneBounds?.box && !sceneBounds.box.isEmpty()) {
			const sceneCenter = sceneBounds.box.getCenter(new THREE.Vector3());
			camera.getWorldPosition(tempCameraPosition);
			camera.getWorldDirection(tempCameraDirection).normalize();
			const depth = sceneCenter
				.sub(tempCameraPosition)
				.dot(tempCameraDirection);
			if (depth > 0.01) {
				lastBrushRayDepth = depth;
				return pointerRay.at(depth, new THREE.Vector3());
			}
		}
		return pointerRay.at(DEFAULT_BOX_SIZE, new THREE.Vector3());
	}

	function clearBrushPreview({ syncUi = true } = {}) {
		const currentPreview = store.splatEdit.brushPreview.value;
		if (!currentPreview?.visible && currentPreview?.painting !== true) {
			return false;
		}
		store.splatEdit.brushPreview.value = {
			visible: false,
			x: 0,
			y: 0,
			radiusPx: 0,
			depthBarPx: 0,
			painting: false,
			subtract: false,
		};
		if (syncUi) {
			updateUi?.();
		}
		return true;
	}

	function syncBrushPreviewFromHit(
		brushHit,
		{ subtract = false, painting = false } = {},
	) {
		if (!brushHit?.hitPoint || !brushHit?.camera || !brushHit?.viewRect) {
			return clearBrushPreview();
		}
		const brushRadius = clampBrushSize(store.splatEdit.brushSize.value) * 0.5;
		tempScreenPoint.copy(brushHit.hitPoint).project(brushHit.camera);
		if (
			!Number.isFinite(tempScreenPoint.x) ||
			!Number.isFinite(tempScreenPoint.y) ||
			tempScreenPoint.z < -1 ||
			tempScreenPoint.z > 1
		) {
			return clearBrushPreview();
		}
		tempBrushUpVector.set(0, 1, 0).applyQuaternion(brushHit.camera.quaternion);
		tempBrushRightVector
			.copy(brushHit.rayDirection)
			.cross(tempBrushUpVector)
			.normalize();
		if (tempBrushRightVector.lengthSq() <= 1e-6) {
			tempBrushRightVector
				.set(1, 0, 0)
				.applyQuaternion(brushHit.camera.quaternion)
				.normalize();
		}
		tempScreenPoint2
			.copy(brushHit.hitPoint)
			.addScaledVector(tempBrushRightVector, brushRadius)
			.project(brushHit.camera);
		const centerX =
			brushHit.viewRect.left +
			(tempScreenPoint.x + 1) * 0.5 * brushHit.viewRect.width;
		const centerY =
			brushHit.viewRect.top +
			(1 - tempScreenPoint.y) * 0.5 * brushHit.viewRect.height;
		const edgeX =
			brushHit.viewRect.left +
			(tempScreenPoint2.x + 1) * 0.5 * brushHit.viewRect.width;
		const edgeY =
			brushHit.viewRect.top +
			(1 - tempScreenPoint2.y) * 0.5 * brushHit.viewRect.height;
		const radiusPx = Math.max(6, Math.hypot(edgeX - centerX, edgeY - centerY));
		const brushDepthMode =
			store.splatEdit.brushDepthMode.value === "through" ? "through" : "depth";
		const brushDepth = clampBrushDepth(store.splatEdit.brushDepth.value);
		let depthBarPx = 0;
		if (brushDepthMode === "depth") {
			tempScreenPoint2
				.copy(brushHit.hitPoint)
				.addScaledVector(brushHit.rayDirection, brushDepth)
				.project(brushHit.camera);
			const farX =
				brushHit.viewRect.left +
				(tempScreenPoint2.x + 1) * 0.5 * brushHit.viewRect.width;
			const farY =
				brushHit.viewRect.top +
				(1 - tempScreenPoint2.y) * 0.5 * brushHit.viewRect.height;
			depthBarPx = Math.max(0, Math.hypot(farX - centerX, farY - centerY));
		}
		store.splatEdit.brushPreview.value = {
			visible: true,
			x: centerX,
			y: centerY,
			radiusPx,
			depthBarPx,
			painting,
			subtract,
		};
		updateUi?.();
		return true;
	}

	function updateBrushPreviewFromClientPoint({
		clientX,
		clientY,
		subtract = false,
		painting = false,
	} = {}) {
		if (
			!isSplatEditModeActive() ||
			store.splatEdit.tool.value !== "brush" ||
			getSplatEditScopeAssetIds().length <= 0
		) {
			return clearBrushPreview();
		}
		const brushHit = getBrushHitFromClientPoint({ clientX, clientY });
		if (!brushHit) {
			return clearBrushPreview();
		}
		return syncBrushPreviewFromHit(brushHit, { subtract, painting });
	}

	function placeSplatEditBoxAtViewCenter() {
		const viewRect = getPrimaryViewRect();
		if (!viewRect) {
			return false;
		}
		return placeSplatEditBoxAtClientPoint({
			clientX: viewRect.left + viewRect.width * 0.5,
			clientY: viewRect.top + viewRect.height * 0.5,
		});
	}

	function placeSplatEditBoxAtClientPoint({ clientX, clientY } = {}) {
		const camera =
			state.mode === "camera"
				? (getActiveCameraViewCamera?.() ?? getActiveCamera?.() ?? null)
				: (getActiveCamera?.() ?? null);
		const viewportRect = getViewportRect();
		let nextCenter = null;

		if (camera && viewportRect) {
			const pointerRay = updatePointerRay(
				raycaster,
				pointerNdc,
				{
					clientX,
					clientY,
				},
				camera,
				viewportRect,
			);
			const raycastTargets =
				getAssetController?.()?.getSceneRaycastTargets?.() ?? [];
			if (raycastTargets.length > 0) {
				const intersections = raycaster.intersectObjects(raycastTargets, true);
				nextCenter = intersections[0]?.point?.clone?.() ?? null;
			}
			nextCenter ??= pointerRay.at(DEFAULT_BOX_SIZE, new THREE.Vector3());
		}

		if (!nextCenter) {
			nextCenter = new THREE.Vector3();
		}

		store.splatEdit.boxPlaced.value = true;
		store.splatEdit.boxCenter.value = toPlainPoint(nextCenter);
		store.splatEdit.boxSize.value = {
			x: DEFAULT_BOX_SIZE,
			y: DEFAULT_BOX_SIZE,
			z: DEFAULT_BOX_SIZE,
		};
		syncSceneHelper();
		updateUi?.();
		return true;
	}

	function syncSceneHelper() {
		let helperVisible = false;
		let helperCenter = null;
		let helperSize = null;
		if (
			isSplatEditModeActive() &&
			store.splatEdit.tool.value === "box" &&
			store.splatEdit.boxPlaced.value &&
			getSplatEditScopeAssetIds().length > 0
		) {
			helperVisible = true;
			helperCenter = getSplatEditBoxCenter();
			helperSize = getSplatEditBoxSize();
		} else if (
			isSplatEditModeActive() &&
			store.splatEdit.tool.value === "transform" &&
			store.splatEdit.selectionCount.value > 0
		) {
			const selectionBounds = getSelectedSplatTransformBounds();
			if (selectionBounds && !selectionBounds.isEmpty()) {
				helperVisible = true;
				helperCenter = selectionBounds.getCenter(new THREE.Vector3());
				helperSize = selectionBounds.getSize(new THREE.Vector3());
			}
		}
		sceneHelper.sync({
			visible: helperVisible,
			center: helperCenter,
			size: helperSize,
		});
	}

	function syncSceneHelperForCamera(camera, viewportSize = null) {
		sceneHelper.syncCamera?.(camera, viewportSize);
	}

	function getSplatAssetCenterBounds(asset) {
		if (!asset?.object || asset.object.visible === false) {
			return null;
		}
		const splatMesh = asset.disposeTarget;
		asset.object.updateMatrixWorld(true);
		splatMesh?.updateMatrixWorld?.(true);
		const worldMatrix =
			splatMesh?.matrixWorld ??
			asset.contentObject?.matrixWorld ??
			asset.object.matrixWorld;
		const hintedBox =
			asset.localCenterBoundsHint?.clone?.() ??
			asset.localBoundsHint?.clone?.() ??
			null;
		if (hintedBox?.applyMatrix4) {
			hintedBox.applyMatrix4(worldMatrix);
			return hintedBox.isEmpty() ? null : hintedBox;
		}
		if (typeof splatMesh?.getBoundingBox !== "function") {
			return null;
		}
		const localBox =
			splatMesh.getBoundingBox(true) ?? splatMesh.getBoundingBox(false) ?? null;
		if (!localBox?.applyMatrix4) {
			return null;
		}
		const worldBox = localBox.clone();
		worldBox.applyMatrix4(worldMatrix);
		return worldBox.isEmpty() ? null : worldBox;
	}

	function getScopeBounds() {
		const scopeAssets = getSplatEditScopeAssets();
		const scopeBox = new THREE.Box3();
		let hasBounds = false;
		for (const asset of scopeAssets) {
			const assetBounds = getSplatAssetCenterBounds(asset);
			if (!assetBounds) {
				continue;
			}
			scopeBox.union(assetBounds);
			hasBounds = true;
		}
		return hasBounds && !scopeBox.isEmpty() ? scopeBox : null;
	}

	function getPreciseScopeCenterBounds() {
		const scopeAssets = getSplatEditScopeAssets();
		const scopeBox = new THREE.Box3();
		let hasBounds = false;
		for (const asset of scopeAssets) {
			const splatMesh = asset?.disposeTarget;
			if (typeof splatMesh?.forEachSplat !== "function") {
				continue;
			}
			asset.object?.updateMatrixWorld?.(true);
			splatMesh.updateMatrixWorld?.(true);
			const worldMatrix =
				splatMesh?.matrixWorld ??
				asset.contentObject?.matrixWorld ??
				asset.object?.matrixWorld ??
				null;
			if (!worldMatrix) {
				continue;
			}
			splatMesh.forEachSplat((_index, center) => {
				tempWorldPoint.copy(center);
				tempWorldPoint.applyMatrix4(worldMatrix);
				if (!Number.isFinite(tempWorldPoint.x)) {
					return;
				}
				scopeBox.expandByPoint(tempWorldPoint);
				hasBounds = true;
			});
		}
		if (!hasBounds || scopeBox.isEmpty()) {
			return null;
		}
		// Tiny padding avoids float-boundary misses when the fitted box is reused
		// immediately for point-in-box selection.
		scopeBox.expandByScalar(1e-4);
		return scopeBox;
	}

	function computeSplatSelectionDebugInfo(asset, selectionBox) {
		const splatMesh = asset?.disposeTarget;
		if (!asset?.object || typeof splatMesh?.forEachSplat !== "function") {
			return null;
		}
		asset.object.updateMatrixWorld(true);
		splatMesh.updateMatrixWorld?.(true);
		const worldMatrix =
			splatMesh?.matrixWorld ??
			asset.contentObject?.matrixWorld ??
			asset.object.matrixWorld;
		const iteratedBounds = new THREE.Box3();
		const sampleCenters = [];
		let totalSplats = 0;
		let hitSplats = 0;
		splatMesh.forEachSplat((index, center) => {
			tempWorldPoint.copy(center);
			tempWorldPoint.applyMatrix4(worldMatrix);
			iteratedBounds.expandByPoint(tempWorldPoint);
			if (sampleCenters.length < 8) {
				sampleCenters.push({
					index,
					world: {
						x: tempWorldPoint.x,
						y: tempWorldPoint.y,
						z: tempWorldPoint.z,
					},
				});
			}
			if (selectionBox.containsPoint(tempWorldPoint)) {
				hitSplats += 1;
			}
			totalSplats += 1;
		});
		return {
			assetId: getAssetIdKey(asset.id),
			label: asset.label,
			totalSplats,
			hitSplats,
			selectionBox: {
				min: {
					x: selectionBox.min.x,
					y: selectionBox.min.y,
					z: selectionBox.min.z,
				},
				max: {
					x: selectionBox.max.x,
					y: selectionBox.max.y,
					z: selectionBox.max.z,
				},
			},
			worldBounds:
				!iteratedBounds.isEmpty() && Number.isFinite(iteratedBounds.min.x)
					? {
							min: {
								x: iteratedBounds.min.x,
								y: iteratedBounds.min.y,
								z: iteratedBounds.min.z,
							},
							max: {
								x: iteratedBounds.max.x,
								y: iteratedBounds.max.y,
								z: iteratedBounds.max.z,
							},
						}
					: null,
			sampleCenters,
		};
	}

	function reportSelectionDebugIfEmpty(selectionBox, changedCount, subtract) {
		if (!isDevRuntime || changedCount > 0) {
			return;
		}
		const scopeAssets = getSplatEditScopeAssets();
		const details = scopeAssets
			.map((asset) => computeSplatSelectionDebugInfo(asset, selectionBox))
			.filter(Boolean);
		const sceneAssets = getSceneSplatAssets().map((asset) => ({
			assetId: getAssetIdKey(asset.id),
			label: asset.label,
			hasDisposeTarget: Boolean(asset.disposeTarget),
			hasForEachSplat: typeof asset.disposeTarget?.forEachSplat === "function",
		}));
		console.warn("[CAMERA_FRAMES] splat edit selection matched 0 splats", {
			mode: subtract ? "subtract" : "add",
			scopeAssetIds: getSplatEditScopeAssetIds(),
			sceneAssets,
			details,
		});
	}

	function fitSplatEditBoxToScope() {
		const scopeBounds = getPreciseScopeCenterBounds() ?? getScopeBounds();
		if (!scopeBounds) {
			return false;
		}
		const nextCenter = scopeBounds.getCenter(new THREE.Vector3());
		const nextSize = scopeBounds.getSize(new THREE.Vector3());
		store.splatEdit.boxPlaced.value = true;
		store.splatEdit.boxCenter.value = toPlainPoint(nextCenter);
		store.splatEdit.boxSize.value = {
			x: clampBoxAxisSize(nextSize.x),
			y: clampBoxAxisSize(nextSize.y),
			z: clampBoxAxisSize(nextSize.z),
		};
		syncSceneHelper();
		updateUi?.();
		return true;
	}

	function isSplatEditModeAvailable() {
		return state.mode === "viewport" || state.mode === "camera";
	}

	function isSplatEditModeActive() {
		return store.splatEdit.active.value === true;
	}

	function isSplatEditBrushActive() {
		return (
			isSplatEditModeActive() &&
			store.splatEdit.tool.value === "brush" &&
			getSplatEditScopeAssetIds().length > 0
		);
	}

	function setSplatEditTool(nextTool) {
		const previousTool = store.splatEdit.tool.value;
		store.splatEdit.tool.value =
			nextTool === "brush"
				? "brush"
				: nextTool === "transform"
					? "transform"
					: "box";
		if (previousTool === "brush" && store.splatEdit.tool.value !== "brush") {
			activeBrushStroke = null;
			clearBrushPreview({ syncUi: false });
		}
		if (store.splatEdit.tool.value !== "transform") {
			clearActiveTransformPreview({ syncUi: false });
		}
		syncSceneHelper();
		if (
			(previousTool === "brush") !==
			(store.splatEdit.tool.value === "brush")
		) {
			syncControlsToMode?.();
		}
		updateUi?.();
		return store.splatEdit.tool.value;
	}

	function setSplatEditBoxCenterAxis(axisKey, nextValue) {
		if (!["x", "y", "z"].includes(axisKey) || !Number.isFinite(nextValue)) {
			return false;
		}
		store.splatEdit.boxPlaced.value = true;
		const nextCenter = {
			...store.splatEdit.boxCenter.value,
			[axisKey]: Number(nextValue),
		};
		store.splatEdit.boxCenter.value = nextCenter;
		syncSceneHelper();
		updateUi?.();
		return true;
	}

	function setSplatEditBoxSizeAxis(axisKey, nextValue) {
		if (!["x", "y", "z"].includes(axisKey) || !Number.isFinite(nextValue)) {
			return false;
		}
		store.splatEdit.boxPlaced.value = true;
		const nextSize = {
			...store.splatEdit.boxSize.value,
			[axisKey]: clampBoxAxisSize(nextValue),
		};
		store.splatEdit.boxSize.value = nextSize;
		syncSceneHelper();
		updateUi?.();
		return true;
	}

	function scaleSplatEditBoxUniform(scaleFactor) {
		if (!Number.isFinite(scaleFactor) || scaleFactor <= 0) {
			return false;
		}
		store.splatEdit.boxPlaced.value = true;
		const currentSize = getSplatEditBoxSize();
		store.splatEdit.boxSize.value = {
			x: clampBoxAxisSize(currentSize.x * scaleFactor),
			y: clampBoxAxisSize(currentSize.y * scaleFactor),
			z: clampBoxAxisSize(currentSize.z * scaleFactor),
		};
		syncSceneHelper();
		updateUi?.();
		return true;
	}

	function applySplatEditBoxSelection({ subtract = false } = {}) {
		const selectionBox = getSplatEditBoxBounds();
		if (!selectionBox) {
			return 0;
		}
		let changedCount = 0;
		for (const asset of getSplatEditScopeAssets()) {
			const splatMesh = asset.disposeTarget;
			if (typeof splatMesh?.forEachSplat !== "function") {
				continue;
			}
			asset.object.updateMatrixWorld(true);
			splatMesh?.updateMatrixWorld?.(true);
			const worldMatrix =
				splatMesh?.matrixWorld ??
				asset.contentObject?.matrixWorld ??
				asset.object.matrixWorld;
			const assetIdKey = getAssetIdKey(asset.id);
			const nextSelection = new Set(
				selectedSplatsByAssetId.get(assetIdKey) ?? [],
			);
			splatMesh.forEachSplat((index, center) => {
				tempWorldPoint.copy(center);
				tempWorldPoint.applyMatrix4(worldMatrix);
				if (!selectionBox.containsPoint(tempWorldPoint)) {
					return;
				}
				if (subtract) {
					if (nextSelection.delete(index)) {
						changedCount += 1;
					}
					return;
				}
				const sizeBefore = nextSelection.size;
				nextSelection.add(index);
				if (nextSelection.size !== sizeBefore) {
					changedCount += 1;
				}
			});
			if (nextSelection.size > 0) {
				selectedSplatsByAssetId.set(assetIdKey, nextSelection);
			} else {
				selectedSplatsByAssetId.delete(assetIdKey);
			}
		}
		syncSelectionCount();
		store.splatEdit.lastOperation.value = {
			mode: subtract ? "subtract" : "add",
			hitCount: changedCount,
		};
		syncSelectionHighlight();
		syncSceneHelper();
		updateUi?.();
		reportSelectionDebugIfEmpty(selectionBox, changedCount, subtract);
		setStatus?.(
			t(
				subtract
					? "status.splatEditSelectionRemoved"
					: "status.splatEditSelectionAdded",
				{ count: changedCount },
			),
		);
		return changedCount;
	}

	function setSplatEditBrushSize(nextValue) {
		if (!Number.isFinite(nextValue)) {
			return false;
		}
		const previousSize = clampBrushSize(store.splatEdit.brushSize.value);
		const nextSizeClamped = clampBrushSize(nextValue);
		store.splatEdit.brushSize.value = nextSizeClamped;
		const currentPreview = store.splatEdit.brushPreview.value;
		if (currentPreview?.visible && previousSize > 0) {
			store.splatEdit.brushPreview.value = {
				...currentPreview,
				radiusPx: Math.max(
					6,
					(currentPreview.radiusPx * nextSizeClamped) / previousSize,
				),
			};
		}
		updateUi?.();
		return true;
	}

	function setSplatEditBrushDepthMode(nextMode) {
		store.splatEdit.brushDepthMode.value =
			nextMode === "through" ? "through" : "depth";
		updateUi?.();
		return store.splatEdit.brushDepthMode.value;
	}

	function setSplatEditBrushDepth(nextValue) {
		if (!Number.isFinite(nextValue)) {
			return false;
		}
		store.splatEdit.brushDepth.value = clampBrushDepth(nextValue);
		updateUi?.();
		return true;
	}

	function applySplatEditBrushHit(
		brushHit,
		{ subtract = false, syncUi = true, announce = true } = {},
	) {
		if (!brushHit?.hitPoint || !brushHit?.rayDirection) {
			if (announce) {
				setStatus?.(t("status.splatEditBrushHitMissing"));
			}
			return 0;
		}
		const brushRadiusSq =
			(clampBrushSize(store.splatEdit.brushSize.value) * 0.5) ** 2;
		const brushDepthMode =
			store.splatEdit.brushDepthMode.value === "through" ? "through" : "depth";
		const brushDepth = clampBrushDepth(store.splatEdit.brushDepth.value);
		const maxAxialDistance =
			brushDepthMode === "through" ? Number.POSITIVE_INFINITY : brushDepth;
		let changedCount = 0;
		for (const asset of getSplatEditScopeAssets()) {
			const splatMesh = asset.disposeTarget;
			if (typeof splatMesh?.forEachSplat !== "function") {
				continue;
			}
			asset.object.updateMatrixWorld(true);
			splatMesh?.updateMatrixWorld?.(true);
			const worldMatrix =
				splatMesh?.matrixWorld ??
				asset.contentObject?.matrixWorld ??
				asset.object.matrixWorld;
			const assetIdKey = getAssetIdKey(asset.id);
			const nextSelection =
				selectedSplatsByAssetId.get(assetIdKey) ?? new Set();
			splatMesh.forEachSplat((index, center) => {
				tempWorldPoint.copy(center);
				tempWorldPoint.applyMatrix4(worldMatrix);
				tempVector.copy(tempWorldPoint).sub(brushHit.hitPoint);
				const axialDistance = tempVector.dot(brushHit.rayDirection);
				if (axialDistance < -1e-4 || axialDistance > maxAxialDistance) {
					return;
				}
				tempVector2
					.copy(tempVector)
					.addScaledVector(brushHit.rayDirection, -axialDistance);
				if (tempVector2.lengthSq() > brushRadiusSq) {
					return;
				}
				if (subtract) {
					if (nextSelection.delete(index)) {
						changedCount += 1;
					}
					return;
				}
				const sizeBefore = nextSelection.size;
				nextSelection.add(index);
				if (nextSelection.size !== sizeBefore) {
					changedCount += 1;
				}
			});
			if (nextSelection.size > 0) {
				selectedSplatsByAssetId.set(assetIdKey, nextSelection);
			} else {
				selectedSplatsByAssetId.delete(assetIdKey);
			}
		}
		if (changedCount > 0) {
			syncSelectionCount();
			syncSelectionHighlight();
		}
		store.splatEdit.lastOperation.value = {
			mode: subtract ? "subtract" : "add",
			hitCount: changedCount,
		};
		if (syncUi) {
			updateUi?.();
		}
		if (announce) {
			setStatus?.(
				t(
					subtract
						? "status.splatEditSelectionRemoved"
						: "status.splatEditSelectionAdded",
					{ count: changedCount },
				),
			);
		}
		return changedCount;
	}

	function applySplatEditBrushAtClientPoint({
		clientX,
		clientY,
		subtract = false,
		syncUi = true,
		announce = true,
	} = {}) {
		if (
			!isSplatEditModeActive() ||
			store.splatEdit.tool.value !== "brush" ||
			getSplatEditScopeAssetIds().length <= 0
		) {
			return 0;
		}
		const brushHit = getBrushHitFromClientPoint({ clientX, clientY });
		if (!brushHit) {
			if (announce) {
				setStatus?.(t("status.splatEditBrushHitMissing"));
			}
			return 0;
		}
		return applySplatEditBrushHit(brushHit, {
			subtract,
			syncUi,
			announce,
		});
	}

	function updateActiveBrushStrokeStatus() {
		if (!activeBrushStroke) {
			return false;
		}
		store.splatEdit.lastOperation.value = {
			mode: activeBrushStroke.subtract ? "subtract" : "add",
			hitCount: activeBrushStroke.changedCount,
		};
		updateUi?.();
		return true;
	}

	function startSplatEditBrushStroke(event) {
		if (
			!isSplatEditModeActive() ||
			store.splatEdit.tool.value !== "brush" ||
			event?.button !== 0 ||
			!Number.isFinite(event?.clientX) ||
			!Number.isFinite(event?.clientY)
		) {
			return false;
		}
		const subtract = event.altKey === true;
		const brushHit = getBrushHitFromClientPoint({
			clientX: Number(event.clientX),
			clientY: Number(event.clientY),
		});
		if (!brushHit) {
			clearBrushPreview();
			return false;
		}
		activeBrushStroke = {
			pointerId: event.pointerId,
			subtract,
			changedCount: 0,
			lastClientX: Number(event.clientX),
			lastClientY: Number(event.clientY),
			lastRadiusPx:
				Number(store.splatEdit.brushPreview.value?.radiusPx) > 0
					? Number(store.splatEdit.brushPreview.value.radiusPx)
					: 18,
		};
		activeBrushStroke.changedCount += applySplatEditBrushHit(brushHit, {
			subtract,
			syncUi: false,
			announce: false,
		});
		syncBrushPreviewFromHit(brushHit, { subtract, painting: true });
		updateActiveBrushStrokeStatus();
		return true;
	}

	function handleSplatEditBrushStrokeMove(event) {
		if (
			!activeBrushStroke ||
			event?.pointerId !== activeBrushStroke.pointerId ||
			!Number.isFinite(event?.clientX) ||
			!Number.isFinite(event?.clientY)
		) {
			return false;
		}
		const nextClientX = Number(event.clientX);
		const nextClientY = Number(event.clientY);
		const deltaX = nextClientX - activeBrushStroke.lastClientX;
		const deltaY = nextClientY - activeBrushStroke.lastClientY;
		const distancePx = Math.hypot(deltaX, deltaY);
		const sampleDivisor = Math.min(
			Math.max(activeBrushStroke.lastRadiusPx * 0.5, 6),
			36,
		);
		const sampleCount = Math.max(1, Math.ceil(distancePx / sampleDivisor));
		let lastBrushHit = null;
		for (let sampleIndex = 1; sampleIndex <= sampleCount; sampleIndex += 1) {
			const alpha = sampleIndex / sampleCount;
			const sampleClientX = activeBrushStroke.lastClientX + deltaX * alpha;
			const sampleClientY = activeBrushStroke.lastClientY + deltaY * alpha;
			const brushHit = getBrushHitFromClientPointFast({
				clientX: sampleClientX,
				clientY: sampleClientY,
			});
			if (!brushHit) {
				continue;
			}
			activeBrushStroke.changedCount += applySplatEditBrushHit(brushHit, {
				subtract: activeBrushStroke.subtract,
				syncUi: false,
				announce: false,
			});
			lastBrushHit = brushHit;
		}
		activeBrushStroke.lastClientX = nextClientX;
		activeBrushStroke.lastClientY = nextClientY;
		if (lastBrushHit) {
			syncBrushPreviewFromHit(lastBrushHit, {
				subtract: activeBrushStroke.subtract,
				painting: true,
			});
			activeBrushStroke.lastRadiusPx = Math.max(
				6,
				Number(store.splatEdit.brushPreview.value?.radiusPx) || 6,
			);
		} else {
			clearBrushPreview({ syncUi: false });
			updateUi?.();
		}
		updateActiveBrushStrokeStatus();
		return true;
	}

	function finishSplatEditBrushStroke(event, { cancel = false } = {}) {
		if (
			!activeBrushStroke ||
			(event?.pointerId !== undefined &&
				event.pointerId !== activeBrushStroke.pointerId)
		) {
			return false;
		}
		const stroke = activeBrushStroke;
		activeBrushStroke = null;
		if (
			cancel !== true &&
			Number.isFinite(event?.clientX) &&
			Number.isFinite(event?.clientY)
		) {
			updateBrushPreviewFromClientPoint({
				clientX: Number(event.clientX),
				clientY: Number(event.clientY),
				subtract: event?.altKey === true,
				painting: false,
			});
		} else {
			clearBrushPreview();
		}
		if (cancel !== true) {
			setStatus?.(
				t(
					stroke.subtract
						? "status.splatEditSelectionRemoved"
						: "status.splatEditSelectionAdded",
					{ count: stroke.changedCount },
				),
			);
		}
		return true;
	}

	async function deleteSelectedSplats() {
		const operations = buildSelectedSplatOperations();
		if (operations.length === 0) {
			setStatus?.(t("status.splatEditSelectionMissing"));
			return false;
		}
		const assetController = getAssetController?.();
		if (!assetController) {
			return false;
		}
		return runHistoryTransaction("splat-edit.delete", async () => {
			let deletedCount = 0;
			for (const operation of operations) {
				if (operation.remainingIndices.length > 0) {
					const remainderSource = createDerivedPackedSplatSource(
						operation.asset,
						operation.remainingIndices,
						{
							label: operation.asset.label,
							fileName:
								operation.asset?.source?.fileName ??
								buildDerivedSplatFileName(operation.asset, "remainder"),
						},
					);
					if (remainderSource) {
						await assetController.replaceSplatAssetFromSource?.(
							operation.asset.id,
							remainderSource,
						);
					}
				} else {
					assetController.removeSceneAssets?.([operation.asset.id]);
				}
				selectedSplatsByAssetId.delete(operation.assetIdKey);
				deletedCount += operation.selectedIndices.length;
			}
			store.splatEdit.lastOperation.value = {
				mode: "delete",
				hitCount: deletedCount,
			};
			syncSelectionCount();
			syncSelectionHighlight();
			syncScopeToSceneSelection();
			syncSceneHelper();
			updateUi?.();
			setStatus?.(t("status.splatEditDeleted", { count: deletedCount }));
			return deletedCount;
		});
	}

	async function separateSelectedSplats() {
		const operations = buildSelectedSplatOperations();
		if (operations.length === 0) {
			setStatus?.(t("status.splatEditSelectionMissing"));
			return false;
		}
		const assetController = getAssetController?.();
		if (!assetController) {
			return false;
		}
		return runHistoryTransaction("splat-edit.separate", async () => {
			const createdAssets = [];
			let separatedCount = 0;
			for (const operation of operations) {
				const currentAssets = assetController.getSceneAssets?.() ?? [];
				const sourceIndex = currentAssets.findIndex(
					(asset) => String(asset.id) === String(operation.asset.id),
				);
				const splitLabel = buildUniqueSplitLabel(operation.asset.label);
				const selectedSource = createDerivedPackedSplatSource(
					operation.asset,
					operation.selectedIndices,
					{
						label: splitLabel,
						fileName: buildDerivedSplatFileName(operation.asset, "split"),
					},
				);
				const createdAsset = selectedSource
					? await assetController.createSplatAssetFromSource?.(selectedSource, {
							insertIndex: sourceIndex >= 0 ? sourceIndex + 1 : null,
						})
					: null;
				if (createdAsset) {
					createdAssets.push(createdAsset);
				}
				if (operation.remainingIndices.length > 0) {
					const remainderSource = createDerivedPackedSplatSource(
						operation.asset,
						operation.remainingIndices,
						{
							label: operation.asset.label,
							fileName:
								operation.asset?.source?.fileName ??
								buildDerivedSplatFileName(operation.asset, "remainder"),
						},
					);
					if (remainderSource) {
						await assetController.replaceSplatAssetFromSource?.(
							operation.asset.id,
							remainderSource,
						);
					}
				} else {
					assetController.removeSceneAssets?.([operation.asset.id]);
				}
				selectedSplatsByAssetId.delete(operation.assetIdKey);
				separatedCount += operation.selectedIndices.length;
			}
			if (createdAssets.length > 0) {
				assetController.clearSceneAssetSelection?.();
				const [firstAsset, ...restAssets] = createdAssets;
				assetController.selectSceneAsset?.(firstAsset.id);
				for (const asset of restAssets) {
					assetController.selectSceneAsset?.(asset.id, { additive: true });
				}
			}
			store.splatEdit.lastOperation.value = {
				mode: "separate",
				hitCount: separatedCount,
			};
			syncSelectionCount();
			syncSelectionHighlight();
			syncScopeToSceneSelection();
			syncSceneHelper();
			updateUi?.();
			setStatus?.(
				t("status.splatEditSeparated", {
					count: separatedCount,
					assets: createdAssets.length,
				}),
			);
			return createdAssets.length;
		});
	}

	function handleToolModeDeactivated() {
		if (!isSplatEditModeActive()) {
			return false;
		}
		activeBoxDrag = null;
		activeBrushStroke = null;
		clearBrushPreview({ syncUi: false });
		if (activeTransformDrag?.historyStarted) {
			cancelHistoryTransaction?.();
		}
		activeTransformDrag = null;
		clearActiveTransformPreview({ syncUi: false });
		syncSceneHelper();
		selectionHighlightController?.clear?.();
		updateUi?.();
		return true;
	}

	function resetForSceneChange() {
		clearSplatSelection();
		activeBrushStroke = null;
		clearBrushPreview({ syncUi: false });
		store.splatEdit.scopeAssetIds.value = [];
		store.splatEdit.rememberedScopeAssetIds.value = [];
		store.splatEdit.boxPlaced.value = false;
		store.splatEdit.boxCenter.value = { x: 0, y: 0, z: 0 };
		store.splatEdit.boxSize.value = { x: 1, y: 1, z: 1 };
		store.splatEdit.lastOperation.value = {
			mode: "",
			hitCount: 0,
		};
		if (store.viewportToolMode.value === "splat-edit") {
			store.viewportToolMode.value = "none";
		}
		activeBoxDrag = null;
		if (activeTransformDrag?.historyStarted) {
			cancelHistoryTransaction?.();
		}
		activeTransformDrag = null;
		clearActiveTransformPreview({ syncUi: false });
		syncSceneHelper();
		syncControlsToMode?.();
		selectionHighlightController?.clear?.();
		updateUi?.();
	}

	function setSplatEditMode(nextEnabled, { silent = false } = {}) {
		if (!isSplatEditModeAvailable()) {
			return false;
		}

		if (!nextEnabled) {
			const wasActive = isSplatEditModeActive();
			if (store.viewportToolMode.value === "splat-edit") {
				store.viewportToolMode.value = "none";
			}
			activeBoxDrag = null;
			activeBrushStroke = null;
			if (activeTransformDrag?.historyStarted) {
				cancelHistoryTransaction?.();
			}
			activeTransformDrag = null;
			clearBrushPreview({ syncUi: false });
			clearActiveTransformPreview({ syncUi: false });
			syncSceneHelper();
			syncControlsToMode?.();
			selectionHighlightController?.clear?.();
			updateUi?.();
			if (wasActive && !silent) {
				setStatus?.(t("status.splatEditDisabled"));
			}
			return wasActive;
		}

		const scopeAssetIds = resolveEntryScopeAssetIds();
		if (scopeAssetIds.length === 0) {
			if (!silent) {
				setStatus?.(t("status.splatEditRequiresScope"));
			}
			return false;
		}

		setMeasurementMode?.(false, { silent: true });
		setViewportSelectMode?.(false);
		setViewportReferenceImageEditMode?.(false);
		setViewportTransformMode?.(false);
		setViewportPivotEditMode?.(false);
		applyNavigateInteractionMode?.({ silent: true });
		store.viewportToolMode.value = "splat-edit";
		const previousScopeAssetIds = getSplatEditScopeAssetIds();
		store.splatEdit.scopeAssetIds.value = [...scopeAssetIds];
		store.splatEdit.rememberedScopeAssetIds.value = [...scopeAssetIds];
		if (
			previousScopeAssetIds.length !== scopeAssetIds.length ||
			previousScopeAssetIds.some(
				(assetId, index) => assetId !== scopeAssetIds[index],
			)
		) {
			store.splatEdit.lastOperation.value = {
				mode: "",
				hitCount: 0,
			};
		}
		syncSelectionCount();
		syncSceneHelper();
		syncSelectionHighlight();
		syncControlsToMode?.();
		updateUi?.();
		if (!silent) {
			setStatus?.(
				t("status.splatEditEnabled", { count: scopeAssetIds.length }),
			);
		}
		return true;
	}

	function toggleSplatEditMode() {
		return setSplatEditMode(!isSplatEditModeActive());
	}

	function getViewportGizmoConfig() {
		if (!isSplatEditModeActive()) {
			return null;
		}
		if (store.splatEdit.tool.value === "box") {
			if (!store.splatEdit.boxPlaced.value) {
				return null;
			}
			return {
				pivotWorld: getSplatEditBoxCenter(),
				basisWorld: {
					x: WORLD_AXES.x.clone(),
					y: WORLD_AXES.y.clone(),
					z: WORLD_AXES.z.clone(),
				},
				pivotMode: true,
				showMoveAxes: true,
				showMovePlanes: true,
				showRotate: false,
				showScale: false,
			};
		}
		if (store.splatEdit.tool.value !== "transform") {
			return null;
		}
		const pivotWorld = getSelectedSplatTransformPivotWorld();
		if (!pivotWorld) {
			return null;
		}
		return {
			pivotWorld,
			basisWorld: {
				x: WORLD_AXES.x.clone(),
				y: WORLD_AXES.y.clone(),
				z: WORLD_AXES.z.clone(),
			},
			pivotMode: false,
			showMoveAxes: true,
			showMovePlanes: true,
			showRotate: true,
			showScale: true,
		};
	}

	function startViewportGizmoDrag(
		handleName,
		{ camera, viewportRect, event, config },
	) {
		if (
			!isSplatEditModeActive() ||
			!camera ||
			!viewportRect ||
			!config?.pivotWorld
		) {
			return false;
		}

		if (store.splatEdit.tool.value === "transform") {
			const selection = getSelectedSplatTransformEntries();
			if (selection.entries.length === 0 || !selection.selectionBounds) {
				return false;
			}

			const pointerRay = updatePointerRay(
				raycaster,
				pointerNdc,
				event,
				camera,
				viewportRect,
			);
			const anchorWorld = selection.selectionBounds.getCenter(
				new THREE.Vector3(),
			);
			const previewState = ensureSelectedSplatTransformPreview(
				selection.entries,
				selection.selectionBounds,
				anchorWorld,
			);

			if (MOVE_AXIS_HANDLE_NAMES.includes(handleName)) {
				const axisKey = handleName.split("-")[1];
				const axisWorld = WORLD_AXES[axisKey];
				const planeNormal = buildAxisPlaneNormal(
					axisWorld,
					camera,
					tempVector,
					tempVector2,
				);
				if (!planeNormal) {
					return false;
				}
				dragPlane.setFromNormalAndCoplanarPoint(planeNormal, anchorWorld);
				const planePoint = pointerRay.intersectPlane(
					dragPlane,
					new THREE.Vector3(),
				);
				if (!planePoint) {
					return false;
				}
				event.preventDefault();
				event.stopPropagation();
				event.stopImmediatePropagation?.();
				activeTransformDrag = {
					pointerId: event.pointerId,
					mode: "move-axis",
					anchorWorld,
					axisWorld: axisWorld.clone(),
					planeNormal: planeNormal.clone(),
					planePoint: planePoint.clone(),
					entries: selection.entries,
					preview: previewState,
					historyStarted:
						beginHistoryTransaction?.("splat-edit.transform") === true,
				};
				return true;
			}

			if (MOVE_PLANE_HANDLE_NAMES.includes(handleName)) {
				const planeAxes =
					handleName === "move-xy"
						? [WORLD_AXES.x, WORLD_AXES.y]
						: handleName === "move-yz"
							? [WORLD_AXES.y, WORLD_AXES.z]
							: [WORLD_AXES.z, WORLD_AXES.x];
				const planeNormal = new THREE.Vector3()
					.crossVectors(planeAxes[0], planeAxes[1])
					.normalize();
				dragPlane.setFromNormalAndCoplanarPoint(planeNormal, anchorWorld);
				const planePoint = pointerRay.intersectPlane(
					dragPlane,
					new THREE.Vector3(),
				);
				if (!planePoint) {
					return false;
				}
				event.preventDefault();
				event.stopPropagation();
				event.stopImmediatePropagation?.();
				activeTransformDrag = {
					pointerId: event.pointerId,
					mode: "move-plane",
					anchorWorld,
					planeNormal: planeNormal.clone(),
					planePoint: planePoint.clone(),
					entries: selection.entries,
					preview: previewState,
					historyStarted:
						beginHistoryTransaction?.("splat-edit.transform") === true,
				};
				return true;
			}

			if (ROTATE_AXIS_HANDLE_NAMES.includes(handleName)) {
				const axisKey = handleName.split("-")[1];
				const axisWorld = WORLD_AXES[axisKey];
				dragPlane.setFromNormalAndCoplanarPoint(axisWorld, anchorWorld);
				const planePoint = pointerRay.intersectPlane(
					dragPlane,
					new THREE.Vector3(),
				);
				if (!planePoint) {
					return false;
				}
				const startVector = planePoint.sub(anchorWorld).normalize();
				if (startVector.lengthSq() < 1e-6) {
					return false;
				}
				event.preventDefault();
				event.stopPropagation();
				event.stopImmediatePropagation?.();
				activeTransformDrag = {
					pointerId: event.pointerId,
					mode: "rotate",
					anchorWorld,
					axisWorld: axisWorld.clone(),
					startVector: startVector.clone(),
					entries: selection.entries,
					preview: previewState,
					historyStarted:
						beginHistoryTransaction?.("splat-edit.transform") === true,
				};
				return true;
			}

			if (handleName === SPLAT_SCALE_HANDLE_NAME) {
				event.preventDefault();
				event.stopPropagation();
				event.stopImmediatePropagation?.();
				activeTransformDrag = {
					pointerId: event.pointerId,
					mode: "scale-uniform",
					anchorWorld,
					startClientX: event.clientX,
					startClientY: event.clientY,
					entries: selection.entries,
					preview: previewState,
					historyStarted:
						beginHistoryTransaction?.("splat-edit.transform") === true,
				};
				return true;
			}

			return false;
		}

		if (store.splatEdit.tool.value !== "box") {
			return false;
		}

		const pointerRay = updatePointerRay(
			raycaster,
			pointerNdc,
			event,
			camera,
			viewportRect,
		);
		const anchorWorld = config.pivotWorld.clone();

		if (MOVE_AXIS_HANDLE_NAMES.includes(handleName)) {
			const axisKey = handleName.split("-")[1];
			const axisWorld = WORLD_AXES[axisKey];
			const planeNormal = buildAxisPlaneNormal(
				axisWorld,
				camera,
				tempVector,
				tempVector2,
			);
			if (!planeNormal) {
				return false;
			}
			dragPlane.setFromNormalAndCoplanarPoint(planeNormal, anchorWorld);
			const planePoint = pointerRay.intersectPlane(
				dragPlane,
				new THREE.Vector3(),
			);
			if (!planePoint) {
				return false;
			}
			event.preventDefault();
			event.stopPropagation();
			event.stopImmediatePropagation?.();
			activeBoxDrag = {
				pointerId: event.pointerId,
				mode: "axis",
				handleName,
				anchorWorld,
				axisWorld: axisWorld.clone(),
				planeNormal: planeNormal.clone(),
				planePoint: planePoint.clone(),
			};
			return true;
		}

		if (MOVE_PLANE_HANDLE_NAMES.includes(handleName)) {
			const planeAxes =
				handleName === "move-xy"
					? [WORLD_AXES.x, WORLD_AXES.y]
					: handleName === "move-yz"
						? [WORLD_AXES.y, WORLD_AXES.z]
						: [WORLD_AXES.z, WORLD_AXES.x];
			const planeNormal = new THREE.Vector3()
				.crossVectors(planeAxes[0], planeAxes[1])
				.normalize();
			dragPlane.setFromNormalAndCoplanarPoint(planeNormal, anchorWorld);
			const planePoint = pointerRay.intersectPlane(
				dragPlane,
				new THREE.Vector3(),
			);
			if (!planePoint) {
				return false;
			}
			event.preventDefault();
			event.stopPropagation();
			event.stopImmediatePropagation?.();
			activeBoxDrag = {
				pointerId: event.pointerId,
				mode: "plane",
				handleName,
				anchorWorld,
				planeNormal: planeNormal.clone(),
				planePoint: planePoint.clone(),
			};
			return true;
		}

		return false;
	}

	function handleViewportGizmoDragMove(event, { camera, viewportRect }) {
		if (
			activeTransformDrag &&
			event.pointerId === activeTransformDrag.pointerId &&
			isSplatEditModeActive() &&
			store.splatEdit.tool.value === "transform" &&
			camera &&
			viewportRect
		) {
			const pointerRay = updatePointerRay(
				raycaster,
				pointerNdc,
				event,
				camera,
				viewportRect,
			);
			if (activeTransformDrag.mode === "move-axis") {
				dragPlane.setFromNormalAndCoplanarPoint(
					activeTransformDrag.planeNormal,
					activeTransformDrag.anchorWorld,
				);
				const hitPoint = pointerRay.intersectPlane(dragPlane, dragHitPoint);
				if (!hitPoint) {
					return true;
				}
				const worldDelta = dragDelta
					.copy(hitPoint)
					.sub(activeTransformDrag.planePoint)
					.projectOnVector(activeTransformDrag.axisWorld);
				updateSelectedSplatTransformPreview(activeTransformDrag.preview, {
					worldTranslation: worldDelta,
				});
				return true;
			}

			if (activeTransformDrag.mode === "move-plane") {
				dragPlane.setFromNormalAndCoplanarPoint(
					activeTransformDrag.planeNormal,
					activeTransformDrag.anchorWorld,
				);
				const hitPoint = pointerRay.intersectPlane(dragPlane, dragHitPoint);
				if (!hitPoint) {
					return true;
				}
				const worldDelta = dragDelta
					.copy(hitPoint)
					.sub(activeTransformDrag.planePoint);
				updateSelectedSplatTransformPreview(activeTransformDrag.preview, {
					worldTranslation: worldDelta,
				});
				return true;
			}

			if (activeTransformDrag.mode === "rotate") {
				dragPlane.setFromNormalAndCoplanarPoint(
					activeTransformDrag.axisWorld,
					activeTransformDrag.anchorWorld,
				);
				const hitPoint = pointerRay.intersectPlane(dragPlane, dragHitPoint);
				if (!hitPoint) {
					return true;
				}
				const nextVector = dragDelta
					.copy(hitPoint)
					.sub(activeTransformDrag.anchorWorld)
					.normalize();
				if (nextVector.lengthSq() < 1e-6) {
					return true;
				}
				const cross = tempVector
					.copy(activeTransformDrag.startVector)
					.cross(nextVector);
				const angle = Math.atan2(
					cross.dot(activeTransformDrag.axisWorld),
					activeTransformDrag.startVector.dot(nextVector),
				);
				const worldRotation = new THREE.Quaternion().setFromAxisAngle(
					activeTransformDrag.axisWorld,
					angle,
				);
				updateSelectedSplatTransformPreview(activeTransformDrag.preview, {
					worldRotation,
					pivotWorld: activeTransformDrag.anchorWorld,
				});
				return true;
			}

			if (activeTransformDrag.mode === "scale-uniform") {
				const deltaPixels =
					event.clientX -
					activeTransformDrag.startClientX -
					(event.clientY - activeTransformDrag.startClientY);
				const uniformScale = Math.exp(deltaPixels * 0.01);
				updateSelectedSplatTransformPreview(activeTransformDrag.preview, {
					uniformScale,
					pivotWorld: activeTransformDrag.anchorWorld,
				});
				return true;
			}
		}

		if (
			!activeBoxDrag ||
			event.pointerId !== activeBoxDrag.pointerId ||
			!isSplatEditModeActive() ||
			store.splatEdit.tool.value !== "box" ||
			!camera ||
			!viewportRect
		) {
			return false;
		}

		const pointerRay = updatePointerRay(
			raycaster,
			pointerNdc,
			event,
			camera,
			viewportRect,
		);
		dragPlane.setFromNormalAndCoplanarPoint(
			activeBoxDrag.planeNormal,
			activeBoxDrag.anchorWorld,
		);
		const hitPoint = pointerRay.intersectPlane(dragPlane, dragHitPoint);
		if (!hitPoint) {
			return true;
		}

		let nextCenter = activeBoxDrag.anchorWorld.clone();
		if (activeBoxDrag.mode === "axis") {
			const projectedDistance = dragDelta
				.copy(hitPoint)
				.sub(activeBoxDrag.planePoint)
				.dot(activeBoxDrag.axisWorld);
			nextCenter = nextCenter.addScaledVector(
				activeBoxDrag.axisWorld,
				projectedDistance,
			);
		} else {
			nextCenter = nextCenter.add(
				dragDelta.copy(hitPoint).sub(activeBoxDrag.planePoint),
			);
		}
		store.splatEdit.boxCenter.value = toPlainPoint(nextCenter);
		syncSceneHelper();
		updateUi?.();
		return true;
	}

	function handleViewportGizmoDragEnd(event) {
		if (
			activeTransformDrag &&
			event.pointerId === activeTransformDrag.pointerId &&
			isSplatEditModeActive()
		) {
			const completedDrag = activeTransformDrag;
			activeTransformDrag = null;
			finalizeSelectedSplatTransform(completedDrag.entries);
			store.splatEdit.lastOperation.value = {
				mode:
					completedDrag.mode === "rotate"
						? "transform-rotate"
						: completedDrag.mode === "scale-uniform"
							? "transform-scale"
							: "transform-move",
				hitCount: store.splatEdit.selectionCount.value,
			};
			if (completedDrag.historyStarted) {
				commitHistoryTransaction?.("splat-edit.transform");
			}
			setStatus?.(
				t(
					completedDrag.mode === "rotate"
						? "status.splatEditTransformedRotate"
						: completedDrag.mode === "scale-uniform"
							? "status.splatEditTransformedScale"
							: "status.splatEditTransformedMove",
					{ count: store.splatEdit.selectionCount.value },
				),
			);
			return true;
		}

		if (
			!activeBoxDrag ||
			event.pointerId !== activeBoxDrag.pointerId ||
			!isSplatEditModeActive()
		) {
			return false;
		}
		activeBoxDrag = null;
		return true;
	}

	function dispose() {
		activeBrushStroke = null;
		clearBrushPreview({ syncUi: false });
		clearActiveTransformPreview({ syncUi: false });
		transformPreviewController.dispose();
		selectionHighlightController?.dispose?.();
		sceneHelper.clear();
		guides?.remove?.(sceneHelper.group);
		sceneHelper.dispose();
	}

	return {
		isSplatEditModeActive,
		isSplatEditBrushActive,
		setSplatEditMode,
		toggleSplatEditMode,
		syncScopeToSceneSelection,
		setSplatEditTool,
		setSplatEditBrushSize,
		setSplatEditBrushDepthMode,
		setSplatEditBrushDepth,
		setSplatEditBoxCenterAxis,
		setSplatEditBoxSizeAxis,
		scaleSplatEditBoxUniform,
		placeSplatEditBoxAtViewCenter,
		fitSplatEditBoxToScope,
		applySplatEditBoxSelection,
		applySplatEditBrushAtClientPoint,
		updateBrushPreviewFromClientPoint,
		moveSelectedSplatsByWorldDelta,
		rotateSelectedSplatsAroundSelection,
		scaleSelectedSplatsUniformAroundSelection,
		deleteSelectedSplats,
		separateSelectedSplats,
		captureEditState,
		restoreEditState,
		clearSplatSelection,
		getSplatEditScopeAssetIds,
		getSplatEditScopeAssets,
		needsSplatEditBoxPlacement() {
			return (
				isSplatEditModeActive() &&
				store.splatEdit.tool.value === "box" &&
				!store.splatEdit.boxPlaced.value &&
				getSplatEditScopeAssetIds().length > 0
			);
		},
		getViewportGizmoConfig,
		placeSplatEditBoxAtPointer(event, { camera, viewportRect } = {}) {
			if (
				!isSplatEditModeActive() ||
				store.splatEdit.tool.value !== "box" ||
				!camera ||
				!viewportRect ||
				!Number.isFinite(event?.clientX) ||
				!Number.isFinite(event?.clientY)
			) {
				return false;
			}
			return placeSplatEditBoxAtClientPoint({
				clientX: Number(event.clientX),
				clientY: Number(event.clientY),
			});
		},
		applySplatEditBrushAtPointer(event) {
			if (
				!isSplatEditModeActive() ||
				store.splatEdit.tool.value !== "brush" ||
				!Number.isFinite(event?.clientX) ||
				!Number.isFinite(event?.clientY)
			) {
				return false;
			}
			return (
				applySplatEditBrushAtClientPoint({
					clientX: Number(event.clientX),
					clientY: Number(event.clientY),
					subtract: event?.altKey === true,
				}) > 0
			);
		},
		startSplatEditBrushStroke,
		handleSplatEditBrushStrokeMove,
		finishSplatEditBrushStroke,
		clearBrushPreview,
		startViewportGizmoDrag,
		handleViewportGizmoDragMove,
		handleViewportGizmoDragEnd,
		syncSceneHelperForCamera,
		handleToolModeDeactivated,
		resetForSceneChange,
		dispose,
	};
}
