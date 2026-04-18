import * as THREE from "three";
import {
	debugSplatPerf,
	isSplatPerfDebugEnabled,
} from "../../debug/splat-perf-debug.js";
import {
	DEFAULT_BOX_SIZE,
	WORLD_AXES,
	clampBoxAxisSize,
	toPlainPoint,
	toPlainQuaternion,
	toQuaternion,
	toVector3,
	updatePointerRay,
} from "./pure-utils.js";
import {
	getAssetIdKey,
	getSplatAssetWorldMatrix,
} from "./asset-accessors.js";

const tempBoxLocalPoint = new THREE.Vector3();

export function pointInSplatEditBox(point, boxVolume) {
	if (!boxVolume) {
		return false;
	}
	tempBoxLocalPoint
		.copy(point)
		.sub(boxVolume.center)
		.applyQuaternion(boxVolume.inverseRotation);
	return (
		Math.abs(tempBoxLocalPoint.x) <= boxVolume.halfSize.x + 1e-5 &&
		Math.abs(tempBoxLocalPoint.y) <= boxVolume.halfSize.y + 1e-5 &&
		Math.abs(tempBoxLocalPoint.z) <= boxVolume.halfSize.z + 1e-5
	);
}

export function createSplatEditBoxTool({
	store,
	state,
	t,
	isDevRuntime,
	setStatus,
	updateUi,
	getAssetController,
	getActiveCamera,
	getActiveCameraViewCamera,
	getViewportRect,
	getPrimaryViewRect,
	cancelHistoryTransaction,
	runSynchronousHistoryTransaction,
	getSplatEditScopeAssets,
	getSplatEditScopeAssetIds,
	getSceneSplatAssets,
	getScopeBounds,
	getPreciseScopeCenterBounds,
	selectedSplatsByAssetId,
	findReusableBrushSpatialIndex,
	applyBoxSelectionToSpatialIndex,
	syncSelectionCount,
	syncSelectionHighlight,
	syncSceneHelper,
}) {
	const raycaster = new THREE.Raycaster();
	const pointerNdc = new THREE.Vector2();
	const tempBox = new THREE.Box3();
	const tempBoxCorner = new THREE.Vector3();
	const tempWorldPoint = new THREE.Vector3();

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

	function getSplatEditBoxRotation() {
		return toQuaternion(store.splatEdit.boxRotation.value);
	}

	function getSplatEditBoxBasisWorld(rotation = getSplatEditBoxRotation()) {
		return {
			x: WORLD_AXES.x.clone().applyQuaternion(rotation).normalize(),
			y: WORLD_AXES.y.clone().applyQuaternion(rotation).normalize(),
			z: WORLD_AXES.z.clone().applyQuaternion(rotation).normalize(),
		};
	}

	function getSplatEditBoxVolume() {
		if (!store.splatEdit.boxPlaced.value) {
			return null;
		}
		const center = getSplatEditBoxCenter();
		const size = getSplatEditBoxSize();
		const rotation = getSplatEditBoxRotation();
		const inverseRotation = rotation.clone().invert();
		const halfSize = size.clone().multiplyScalar(0.5);
		const bounds = tempBox.makeEmpty();
		for (const xSign of [-1, 1]) {
			for (const ySign of [-1, 1]) {
				for (const zSign of [-1, 1]) {
					tempBoxCorner
						.set(halfSize.x * xSign, halfSize.y * ySign, halfSize.z * zSign)
						.applyQuaternion(rotation)
						.add(center);
					bounds.expandByPoint(tempBoxCorner);
				}
			}
		}
		return {
			center,
			size,
			halfSize,
			rotation,
			inverseRotation,
			bounds: bounds.clone(),
		};
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
		return runSynchronousHistoryTransaction("splat-edit.box-place", () => {
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
					const intersections = raycaster.intersectObjects(
						raycastTargets,
						true,
					);
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
			store.splatEdit.boxRotation.value = { x: 0, y: 0, z: 0, w: 1 };
			syncSceneHelper();
			updateUi?.();
			return true;
		});
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

	function setSplatEditBoxRotationAxis(axisKey, nextValue) {
		if (!["x", "y", "z"].includes(axisKey) || !Number.isFinite(nextValue)) {
			return false;
		}
		store.splatEdit.boxPlaced.value = true;
		const nextEuler = new THREE.Euler().setFromQuaternion(
			getSplatEditBoxRotation(),
			"XYZ",
		);
		nextEuler[axisKey] = THREE.MathUtils.degToRad(Number(nextValue));
		store.splatEdit.boxRotation.value = toPlainQuaternion(
			new THREE.Quaternion().setFromEuler(nextEuler),
		);
		syncSceneHelper();
		updateUi?.();
		return true;
	}

	function scaleSplatEditBoxUniform(scaleFactor) {
		if (!Number.isFinite(scaleFactor) || scaleFactor <= 0) {
			return false;
		}
		return runSynchronousHistoryTransaction("splat-edit.box-scale", () => {
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
		});
	}

	function fitSplatEditBoxToScope() {
		return runSynchronousHistoryTransaction("splat-edit.box-fit", () => {
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
			store.splatEdit.boxRotation.value = { x: 0, y: 0, z: 0, w: 1 };
			syncSceneHelper();
			updateUi?.();
			return true;
		});
	}

	function computeSplatSelectionDebugInfo(asset, selectionVolume) {
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
			if (pointInSplatEditBox(tempWorldPoint, selectionVolume)) {
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
				center: {
					x: selectionVolume.center.x,
					y: selectionVolume.center.y,
					z: selectionVolume.center.z,
				},
				size: {
					x: selectionVolume.size.x,
					y: selectionVolume.size.y,
					z: selectionVolume.size.z,
				},
				rotation: {
					x: selectionVolume.rotation.x,
					y: selectionVolume.rotation.y,
					z: selectionVolume.rotation.z,
					w: selectionVolume.rotation.w,
				},
				bounds: {
					min: {
						x: selectionVolume.bounds.min.x,
						y: selectionVolume.bounds.min.y,
						z: selectionVolume.bounds.min.z,
					},
					max: {
						x: selectionVolume.bounds.max.x,
						y: selectionVolume.bounds.max.y,
						z: selectionVolume.bounds.max.z,
					},
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

	function reportSelectionDebugIfEmpty(selectionVolume, changedCount, subtract) {
		if (!isDevRuntime || changedCount > 0) {
			return;
		}
		const scopeAssets = getSplatEditScopeAssets();
		const details = scopeAssets
			.map((asset) => computeSplatSelectionDebugInfo(asset, selectionVolume))
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

	function applySplatEditBoxSelection({ subtract = false } = {}) {
		const selectionVolume = getSplatEditBoxVolume();
		if (!selectionVolume) {
			return 0;
		}
		const perfEnabled = isSplatPerfDebugEnabled();
		const perfStart = perfEnabled ? performance.now() : 0;
		let perfSpatialAssets = 0;
		let perfFallbackAssets = 0;
		const touchedByAssetId = new Map();
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
			const touched = new Set();
			const reusableIndex = findReusableBrushSpatialIndex(asset, worldMatrix);
			const spatialChange = reusableIndex
				? applyBoxSelectionToSpatialIndex(
						reusableIndex,
						selectionVolume,
						nextSelection,
						subtract,
						touched,
					)
				: null;
			if (typeof spatialChange === "number") {
				changedCount += spatialChange;
				if (perfEnabled) {
					perfSpatialAssets += 1;
				}
			} else {
				if (perfEnabled) {
					perfFallbackAssets += 1;
				}
				splatMesh.forEachSplat((index, center) => {
					tempWorldPoint.copy(center);
					tempWorldPoint.applyMatrix4(worldMatrix);
					if (!pointInSplatEditBox(tempWorldPoint, selectionVolume)) {
						return;
					}
					if (subtract) {
						if (nextSelection.delete(index)) {
							changedCount += 1;
							touched.add(index);
						}
						return;
					}
					const sizeBefore = nextSelection.size;
					nextSelection.add(index);
					if (nextSelection.size !== sizeBefore) {
						changedCount += 1;
						touched.add(index);
					}
				});
			}
			if (touched.size > 0) {
				touchedByAssetId.set(assetIdKey, touched);
			}
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
		syncSelectionHighlight(
			touchedByAssetId.size > 0 ? { touchedByAssetId } : {},
		);
		syncSceneHelper();
		updateUi?.();
		reportSelectionDebugIfEmpty(selectionVolume, changedCount, subtract);
		setStatus?.(
			t(
				subtract
					? "status.splatEditSelectionRemoved"
					: "status.splatEditSelectionAdded",
				{ count: changedCount },
			),
		);
		if (perfEnabled) {
			debugSplatPerf("box-scan", {
				subtract,
				changedCount,
				spatialAssets: perfSpatialAssets,
				fallbackAssets: perfFallbackAssets,
				elapsedMs: Number((performance.now() - perfStart).toFixed(2)),
			});
		}
		return changedCount;
	}

	return {
		getSplatEditBoxCenter,
		getSplatEditBoxSize,
		getSplatEditBoxRotation,
		getSplatEditBoxBasisWorld,
		getSplatEditBoxVolume,
		placeSplatEditBoxAtViewCenter,
		placeSplatEditBoxAtClientPoint,
		setSplatEditBoxCenterAxis,
		setSplatEditBoxSizeAxis,
		setSplatEditBoxRotationAxis,
		scaleSplatEditBoxUniform,
		fitSplatEditBoxToScope,
		applySplatEditBoxSelection,
	};
}
