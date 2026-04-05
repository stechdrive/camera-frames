import * as THREE from "three";
import { createSplatEditSceneHelper } from "../engine/splat-edit-scene-helper.js";

const WORLD_AXES = {
	x: new THREE.Vector3(1, 0, 0),
	y: new THREE.Vector3(0, 1, 0),
	z: new THREE.Vector3(0, 0, 1),
};

const MOVE_AXIS_HANDLE_NAMES = ["move-x", "move-y", "move-z"];
const MOVE_PLANE_HANDLE_NAMES = ["move-xy", "move-yz", "move-zx"];
const MIN_BOX_AXIS_SIZE = 0.01;
const DEFAULT_BOX_SIZE = 1;

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

export function createPerSplatEditController({
	store,
	state,
	t,
	guides,
	setStatus,
	updateUi,
	assetController,
	selectionHighlightController,
	setViewportSelectMode,
	setViewportReferenceImageEditMode,
	setViewportTransformMode,
	setViewportPivotEditMode,
	setMeasurementMode,
	applyNavigateInteractionMode,
	syncControlsToMode,
}) {
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

	function getSceneSplatAssets() {
		return (store.sceneAssets.value ?? []).filter(
			(asset) => asset?.kind === "splat",
		);
	}

	function normalizeScopeAssetIds(assetIds = []) {
		const validIds = new Set(getSceneSplatAssets().map((asset) => asset.id));
		return [...new Set(assetIds)].filter((assetId) => validIds.has(assetId));
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
		let totalCount = 0;
		for (const selectedSplats of selectedSplatsByAssetId.values()) {
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

	function clearSplatSelection() {
		selectedSplatsByAssetId.clear();
		syncSelectionCount();
		selectionHighlightController?.clear?.();
		updateUi?.();
	}

	function getSplatEditScopeAssetIds() {
		return [...(store.splatEdit.scopeAssetIds.value ?? [])];
	}

	function getSplatEditScopeAssets() {
		const scopeIds = new Set(getSplatEditScopeAssetIds());
		return getSceneSplatAssets().filter((asset) => scopeIds.has(asset.id));
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

	function fitSplatEditBoxToScope() {
		const scopeBounds = getScopeBounds();
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
			const nextSelection = new Set(
				selectedSplatsByAssetId.get(asset.id) ?? [],
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
				selectedSplatsByAssetId.set(asset.id, nextSelection);
			} else {
				selectedSplatsByAssetId.delete(asset.id);
			}
		}
		syncSelectionCount();
		syncSelectionHighlight();
		updateUi?.();
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
		fitSplatEditBoxToScope();
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
		setSplatEditTool,
		setSplatEditBoxCenterAxis,
		setSplatEditBoxSizeAxis,
		scaleSplatEditBoxUniform,
		fitSplatEditBoxToScope,
		applySplatEditBoxSelection,
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
