import * as THREE from "three";
import { createSplatEditSceneHelper } from "../engine/splat-edit-scene-helper.js";
import { createProjectFilePackedSplatSource } from "../project-document.js";

const WORLD_AXES = {
	x: new THREE.Vector3(1, 0, 0),
	y: new THREE.Vector3(0, 1, 0),
	z: new THREE.Vector3(0, 0, 1),
};

const MOVE_AXIS_HANDLE_NAMES = ["move-x", "move-y", "move-z"];
const MOVE_PLANE_HANDLE_NAMES = ["move-xy", "move-yz", "move-zx"];
const MIN_BOX_AXIS_SIZE = 0.01;
const DEFAULT_BOX_SIZE = 1;
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
	renderBox,
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
	const defaultBrushSize = Number(store.splatEdit.brushSize.value) || 24;
	const defaultBrushDepthMode =
		store.splatEdit.brushDepthMode.value === "depth" ? "depth" : "through";
	const defaultBrushDepth = Number(store.splatEdit.brushDepth.value) || 0.5;
	const selectedSplatsByAssetId = new Map();
	const sceneHelper = createSplatEditSceneHelper();
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
	let activeBoxDrag = null;

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
		});
	}

	function captureEditState() {
		return {
			tool: store.splatEdit.tool.value === "brush" ? "brush" : "box",
			scopeAssetIds: getSplatEditScopeAssetIds(),
			rememberedScopeAssetIds: normalizeScopeAssetIds(
				store.splatEdit.rememberedScopeAssetIds.value,
			),
			brushSize: Number.isFinite(store.splatEdit.brushSize.value)
				? Number(store.splatEdit.brushSize.value)
				: defaultBrushSize,
			brushDepthMode:
				store.splatEdit.brushDepthMode.value === "depth" ? "depth" : "through",
			brushDepth: Number.isFinite(store.splatEdit.brushDepth.value)
				? Number(store.splatEdit.brushDepth.value)
				: defaultBrushDepth,
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
		if (!snapshot || typeof snapshot !== "object") {
			store.splatEdit.tool.value = "box";
			store.splatEdit.scopeAssetIds.value = [];
			store.splatEdit.rememberedScopeAssetIds.value = [];
			store.splatEdit.brushSize.value = defaultBrushSize;
			store.splatEdit.brushDepthMode.value = defaultBrushDepthMode;
			store.splatEdit.brushDepth.value = defaultBrushDepth;
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

		store.splatEdit.tool.value = snapshot.tool === "brush" ? "brush" : "box";
		store.splatEdit.scopeAssetIds.value = normalizeScopeAssetIds(
			snapshot.scopeAssetIds,
		);
		store.splatEdit.rememberedScopeAssetIds.value = normalizeScopeAssetIds(
			snapshot.rememberedScopeAssetIds,
		);
		store.splatEdit.brushSize.value = Number.isFinite(snapshot.brushSize)
			? Number(snapshot.brushSize)
			: defaultBrushSize;
		store.splatEdit.brushDepthMode.value =
			snapshot.brushDepthMode === "depth" ? "depth" : "through";
		store.splatEdit.brushDepth.value = Number.isFinite(snapshot.brushDepth)
			? Number(snapshot.brushDepth)
			: defaultBrushDepth;
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
		selectedSplatsByAssetId.clear();
		syncSelectionCount();
		store.splatEdit.lastOperation.value = {
			mode: "clear",
			hitCount: 0,
		};
		selectionHighlightController?.clear?.();
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

	function getViewportRect() {
		return resolveElementRect(viewportShell);
	}

	function getPrimaryViewRect() {
		if (state.mode === "camera") {
			const renderRect = resolveElementRect(renderBox);
			if (renderRect) {
				return renderRect;
			}
		}
		return getViewportRect();
	}

	function placeSplatEditBoxAtViewCenter() {
		const camera =
			state.mode === "camera"
				? (getActiveCameraViewCamera?.() ?? getActiveCamera?.() ?? null)
				: (getActiveCamera?.() ?? null);
		const viewportRect = getViewportRect();
		const viewRect = getPrimaryViewRect();
		let nextCenter = null;

		if (camera && viewportRect && viewRect) {
			const pointerRay = updatePointerRay(
				raycaster,
				pointerNdc,
				{
					clientX: viewRect.left + viewRect.width * 0.5,
					clientY: viewRect.top + viewRect.height * 0.5,
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
		sceneHelper.sync({
			visible:
				isSplatEditModeActive() &&
				store.splatEdit.tool.value === "box" &&
				getSplatEditScopeAssetIds().length > 0,
			center: getSplatEditBoxCenter(),
			size: getSplatEditBoxSize(),
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

	function setSplatEditTool(nextTool) {
		store.splatEdit.tool.value = nextTool === "brush" ? "brush" : "box";
		syncSceneHelper();
		updateUi?.();
		return store.splatEdit.tool.value;
	}

	function setSplatEditBoxCenterAxis(axisKey, nextValue) {
		if (!["x", "y", "z"].includes(axisKey) || !Number.isFinite(nextValue)) {
			return false;
		}
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
		clearSplatSelection();
		store.splatEdit.scopeAssetIds.value = [];
		syncSceneHelper();
		return true;
	}

	function resetForSceneChange() {
		clearSplatSelection();
		store.splatEdit.scopeAssetIds.value = [];
		store.splatEdit.rememberedScopeAssetIds.value = [];
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
			clearSplatSelection();
			store.splatEdit.scopeAssetIds.value = [];
			store.splatEdit.lastOperation.value = {
				mode: "",
				hitCount: 0,
			};
			if (store.viewportToolMode.value === "splat-edit") {
				store.viewportToolMode.value = "none";
			}
			activeBoxDrag = null;
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
		store.splatEdit.scopeAssetIds.value = [...scopeAssetIds];
		store.splatEdit.rememberedScopeAssetIds.value = [...scopeAssetIds];
		store.splatEdit.tool.value = "box";
		store.splatEdit.lastOperation.value = {
			mode: "",
			hitCount: 0,
		};
		placeSplatEditBoxAtViewCenter();
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
		if (!isSplatEditModeActive() || store.splatEdit.tool.value !== "box") {
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

	function startViewportGizmoDrag(
		handleName,
		{ camera, viewportRect, event, config },
	) {
		if (
			!isSplatEditModeActive() ||
			store.splatEdit.tool.value !== "box" ||
			!camera ||
			!viewportRect ||
			!config?.pivotWorld
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
		selectionHighlightController?.dispose?.();
		sceneHelper.clear();
		guides?.remove?.(sceneHelper.group);
		sceneHelper.dispose();
	}

	return {
		isSplatEditModeActive,
		setSplatEditMode,
		toggleSplatEditMode,
		syncScopeToSceneSelection,
		setSplatEditTool,
		setSplatEditBoxCenterAxis,
		setSplatEditBoxSizeAxis,
		scaleSplatEditBoxUniform,
		placeSplatEditBoxAtViewCenter,
		fitSplatEditBoxToScope,
		applySplatEditBoxSelection,
		deleteSelectedSplats,
		separateSelectedSplats,
		captureEditState,
		restoreEditState,
		clearSplatSelection,
		getSplatEditScopeAssetIds,
		getSplatEditScopeAssets,
		getViewportGizmoConfig,
		startViewportGizmoDrag,
		handleViewportGizmoDragMove,
		handleViewportGizmoDragEnd,
		syncSceneHelperForCamera,
		handleToolModeDeactivated,
		resetForSceneChange,
		dispose,
	};
}
