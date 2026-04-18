import { fromHalf } from "@sparkjsdev/spark";
import * as THREE from "three";
import {
	debugSplatPerf,
	isSplatPerfDebugEnabled,
} from "../../debug/splat-perf-debug.js";
import {
	DEFAULT_BOX_SIZE,
	MIN_BRUSH_SIZE_PX,
	clampBrushDepth,
	clampBrushSizePx,
	updatePointerRay,
} from "./pure-utils.js";
import {
	getAssetIdKey,
	getSplatAssetWorldMatrix,
} from "./asset-accessors.js";

export function createSplatEditBrushTool({
	store,
	t,
	setStatus,
	updateUi,
	getAssetController,
	beginHistoryTransaction,
	commitHistoryTransaction,
	cancelHistoryTransaction,
	getPrimaryViewCamera,
	getPrimaryViewRect,
	getSplatEditScopeAssetIds,
	getSplatEditScopeAssets,
	selectedSplatsByAssetId,
	isSplatEditModeActive,
	ensureBrushSpatialIndex,
	applyBrushHitToSpatialIndex,
	brushPointMatchesCylinder,
	syncSelectionCount,
	syncSelectionHighlight,
	flushPendingSelectionHighlightSync,
}) {
	const raycaster = new THREE.Raycaster();
	const pointerNdc = new THREE.Vector2();
	const tempCameraPosition = new THREE.Vector3();
	const tempCameraDirection = new THREE.Vector3();
	const tempWorldPoint = new THREE.Vector3();
	const tempPlaneHitPoint = new THREE.Vector3();
	const brushDepthPlane = new THREE.Plane();
	let lastBrushRayDepth = 0;
	let activeBrushStroke = null;

	function getActiveBrushStroke() {
		return activeBrushStroke;
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
			camera.getWorldDirection(tempCameraDirection).normalize();
			lastBrushRayDepth = hitPoint.distanceTo(tempCameraPosition);
			brushDepthPlane.setFromNormalAndCoplanarPoint(
				tempCameraDirection,
				hitPoint,
			);
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
		const hitPoint = raycaster.ray.intersectPlane(
			brushDepthPlane,
			tempPlaneHitPoint,
		);
		if (!hitPoint) {
			return null;
		}
		return {
			camera,
			hitPoint: hitPoint.clone(),
			rayDirection: pointerRay.direction.clone().normalize(),
			viewRect,
		};
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

	function syncBrushPreviewFromPointer(
		clientX,
		clientY,
		{ subtract = false, painting = false } = {},
	) {
		const radiusPx = clampBrushSizePx(store.splatEdit.brushSize.value) * 0.5;
		store.splatEdit.brushPreview.value = {
			visible: true,
			x: clientX,
			y: clientY,
			radiusPx,
			depthBarPx: 0,
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
		return syncBrushPreviewFromPointer(clientX, clientY, {
			subtract,
			painting,
		});
	}

	function setSplatEditBrushSize(nextValue) {
		if (!Number.isFinite(nextValue)) {
			return false;
		}
		const previousSize = clampBrushSizePx(store.splatEdit.brushSize.value);
		const nextSizeClamped = clampBrushSizePx(nextValue);
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
		if (!brushHit?.hitPoint || !brushHit?.rayDirection || !brushHit?.camera) {
			if (announce) {
				setStatus?.(t("status.splatEditBrushHitMissing"));
			}
			return 0;
		}
		const perfEnabled = isSplatPerfDebugEnabled();
		const perfStart = perfEnabled ? performance.now() : 0;
		let perfSpatialAssets = 0;
		let perfFallbackAssets = 0;
		const touchedByAssetId = new Map();
		const brushSizePx = clampBrushSizePx(store.splatEdit.brushSize.value);
		const camera = brushHit.camera;
		const viewRect = brushHit.viewRect ?? getPrimaryViewRect();
		const viewHeight = Math.max(viewRect?.height ?? 1, 1);
		camera.getWorldPosition(tempCameraPosition);
		const hitDepth = brushHit.hitPoint.distanceTo(tempCameraPosition);
		const worldUnitsPerPx = camera.isOrthographicCamera
			? (camera.top - camera.bottom) / camera.zoom / viewHeight
			: (2 *
					Math.tan(THREE.MathUtils.degToRad(camera.fov) * 0.5) *
					Math.max(hitDepth, 0.01)) /
				viewHeight;
		const brushRadius = brushSizePx * 0.5 * worldUnitsPerPx;
		const brushRadiusSq = brushRadius ** 2;
		const brushDepthMode =
			store.splatEdit.brushDepthMode.value === "through" ? "through" : "depth";
		const brushDepth = clampBrushDepth(store.splatEdit.brushDepth.value);
		const maxAxialDistance =
			brushDepthMode === "through" ? Number.POSITIVE_INFINITY : brushDepth;
		let changedCount = 0;
		const isThrough = brushDepthMode === "through";
		const hitX = brushHit.hitPoint.x;
		const hitY = brushHit.hitPoint.y;
		const hitZ = brushHit.hitPoint.z;
		const dirX = brushHit.rayDirection.x;
		const dirY = brushHit.rayDirection.y;
		const dirZ = brushHit.rayDirection.z;
		const brushOptions = {
			hitX,
			hitY,
			hitZ,
			dirX,
			dirY,
			dirZ,
			brushRadius,
			brushRadiusSq,
			maxAxialDistance,
			isThrough,
		};
		for (const asset of getSplatEditScopeAssets()) {
			const splatMesh = asset.disposeTarget;
			const packedArray = splatMesh?.packedSplats?.packedArray;
			const numSplats = splatMesh?.packedSplats?.numSplats ?? 0;
			if (!packedArray || numSplats <= 0) {
				if (typeof splatMesh?.forEachSplat !== "function") {
					continue;
				}
			}
			const assetIdKey = getAssetIdKey(asset.id);
			const nextSelection =
				selectedSplatsByAssetId.get(assetIdKey) ?? new Set();
			const touched = new Set();
			const brushIndex = ensureBrushSpatialIndex(asset);
			if (brushIndex) {
				if (perfEnabled) {
					perfSpatialAssets += 1;
				}
				changedCount += applyBrushHitToSpatialIndex(
					brushIndex,
					nextSelection,
					brushOptions,
					subtract,
					touched,
				);
			} else if (packedArray && numSplats > 0) {
				if (perfEnabled) {
					perfFallbackAssets += 1;
				}
				const worldMatrix = getSplatAssetWorldMatrix(asset);
				const me = worldMatrix?.elements;
				if (!me) {
					continue;
				}
				for (let i = 0; i < numSplats; i++) {
					if (!subtract && nextSelection.has(i)) {
						continue;
					}
					const i4 = i * 4;
					const word1 = packedArray[i4 + 1];
					const word2 = packedArray[i4 + 2];
					const lx = fromHalf(word1 & 0xffff);
					const ly = fromHalf(word1 >>> 16);
					const lz = fromHalf(word2 & 0xffff);
					const wx = me[0] * lx + me[4] * ly + me[8] * lz + me[12];
					const wy = me[1] * lx + me[5] * ly + me[9] * lz + me[13];
					const wz = me[2] * lx + me[6] * ly + me[10] * lz + me[14];
					if (!brushPointMatchesCylinder(wx, wy, wz, brushOptions)) {
						continue;
					}
					if (subtract) {
						if (nextSelection.delete(i)) {
							changedCount += 1;
							touched.add(i);
						}
					} else {
						nextSelection.add(i);
						changedCount += 1;
						touched.add(i);
					}
				}
			} else {
				const worldMatrix = getSplatAssetWorldMatrix(asset);
				if (!worldMatrix) {
					continue;
				}
				if (perfEnabled) {
					perfFallbackAssets += 1;
				}
				splatMesh.forEachSplat((index, center) => {
					if (!subtract && nextSelection.has(index)) {
						return;
					}
					tempWorldPoint.copy(center);
					tempWorldPoint.applyMatrix4(worldMatrix);
					if (
						!brushPointMatchesCylinder(
							tempWorldPoint.x,
							tempWorldPoint.y,
							tempWorldPoint.z,
							brushOptions,
						)
					) {
						return;
					}
					if (subtract) {
						if (nextSelection.delete(index)) {
							changedCount += 1;
							touched.add(index);
						}
					} else {
						nextSelection.add(index);
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
		if (changedCount > 0) {
			syncSelectionCount();
			syncSelectionHighlight({ touchedByAssetId });
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
		if (perfEnabled) {
			debugSplatPerf("brush-hit", {
				subtract,
				changedCount,
				spatialAssets: perfSpatialAssets,
				fallbackAssets: perfFallbackAssets,
				elapsedMs: Number((performance.now() - perfStart).toFixed(2)),
			});
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
		const hasHistoryTransaction =
			beginHistoryTransaction?.("splat-edit.brush") === true;
		try {
			const changedCount = applySplatEditBrushHit(brushHit, {
				subtract,
				syncUi,
				announce,
			});
			if (hasHistoryTransaction) {
				if (changedCount > 0) {
					commitHistoryTransaction?.("splat-edit.brush");
				} else {
					cancelHistoryTransaction?.();
				}
			}
			return changedCount;
		} catch (error) {
			if (hasHistoryTransaction) {
				cancelHistoryTransaction?.();
			}
			throw error;
		}
	}

	function commitActiveBrushStrokeHistory() {
		if (!activeBrushStroke?.historyStarted) {
			return false;
		}
		if ((activeBrushStroke.changedCount ?? 0) <= 0) {
			cancelHistoryTransaction?.();
			return false;
		}
		return commitHistoryTransaction?.("splat-edit.brush") === true;
	}

	function cancelActiveBrushStrokeHistory() {
		if (!activeBrushStroke?.historyStarted) {
			return false;
		}
		cancelHistoryTransaction?.();
		return true;
	}

	function clearActiveBrushStroke({ commitHistory = false } = {}) {
		if (!activeBrushStroke) {
			return null;
		}
		const stroke = activeBrushStroke;
		if (commitHistory) {
			commitActiveBrushStrokeHistory();
		} else {
			cancelActiveBrushStrokeHistory();
		}
		activeBrushStroke = null;
		return stroke;
	}

	function startBrushStrokeHistory() {
		return beginHistoryTransaction?.("splat-edit.brush") === true;
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
			historyStarted: startBrushStrokeHistory(),
		};
		activeBrushStroke.changedCount += applySplatEditBrushHit(brushHit, {
			subtract,
			syncUi: false,
			announce: false,
		});
		syncBrushPreviewFromPointer(Number(event.clientX), Number(event.clientY), {
			subtract,
			painting: true,
		});
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

		syncBrushPreviewFromPointer(nextClientX, nextClientY, {
			subtract: activeBrushStroke.subtract,
			painting: true,
		});

		const deltaX = nextClientX - activeBrushStroke.lastClientX;
		const deltaY = nextClientY - activeBrushStroke.lastClientY;
		const distancePx = Math.hypot(deltaX, deltaY);
		const sampleDivisor = Math.max(activeBrushStroke.lastRadiusPx * 3, 12);
		const sampleCount = Math.max(1, Math.ceil(distancePx / sampleDivisor));
		for (let sampleIndex = 1; sampleIndex <= sampleCount; sampleIndex += 1) {
			const alpha = sampleIndex / sampleCount;
			const sampleClientX = activeBrushStroke.lastClientX + deltaX * alpha;
			const sampleClientY = activeBrushStroke.lastClientY + deltaY * alpha;
			const isLastSample = sampleIndex === sampleCount;
			const brushHit = isLastSample
				? getBrushHitFromClientPoint({
						clientX: sampleClientX,
						clientY: sampleClientY,
					})
				: getBrushHitFromClientPointFast({
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
		}
		activeBrushStroke.lastClientX = nextClientX;
		activeBrushStroke.lastClientY = nextClientY;
		activeBrushStroke.lastRadiusPx = Math.max(
			MIN_BRUSH_SIZE_PX * 0.5,
			clampBrushSizePx(store.splatEdit.brushSize.value) * 0.5,
		);
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
		const stroke = clearActiveBrushStroke({ commitHistory: true });
		flushPendingSelectionHighlightSync();
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

	return {
		getActiveBrushStroke,
		getBrushHitFromClientPoint,
		getBrushHitFromClientPointFast,
		clearBrushPreview,
		syncBrushPreviewFromPointer,
		updateBrushPreviewFromClientPoint,
		setSplatEditBrushSize,
		setSplatEditBrushDepthMode,
		setSplatEditBrushDepth,
		applySplatEditBrushHit,
		applySplatEditBrushAtClientPoint,
		commitActiveBrushStrokeHistory,
		cancelActiveBrushStrokeHistory,
		clearActiveBrushStroke,
		updateActiveBrushStrokeStatus,
		startSplatEditBrushStroke,
		handleSplatEditBrushStrokeMove,
		finishSplatEditBrushStroke,
	};
}
