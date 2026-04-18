import * as THREE from "three";
import { debugSplatHistory } from "../../debug/splat-history-debug.js";
import {
	getAssetIdKey,
	getSplatAssetTotalCount,
	getSplatPackedSource,
} from "./asset-accessors.js";

export function createSplatEditTransformTool({
	store,
	t,
	setStatus,
	updateUi,
	transformPreviewController,
	selectedSplatsByAssetId,
	getSplatEditScopeAssets,
	markSplatAssetPersistentSourceDirty,
	invalidateBrushSpatialIndex,
	updateSplatAssetBoundsHints,
	syncSelectionHighlight,
	syncSceneHelper,
}) {
	const tempTransformMatrix = new THREE.Matrix4();
	const tempTransformPivotMatrix = new THREE.Matrix4();
	const tempTransformRotateMatrix = new THREE.Matrix4();
	const tempTransformScaleMatrix = new THREE.Matrix4();
	const tempTransformInversePivotMatrix = new THREE.Matrix4();
	const tempVector = new THREE.Vector3();
	const tempVector2 = new THREE.Vector3();
	const tempWorldPoint = new THREE.Vector3();

	let activeTransformPreview = null;

	function getActiveTransformPreview() {
		return activeTransformPreview;
	}

	function getSelectedSplatTransformEntries() {
		const entries = [];
		const selectionBounds = new THREE.Box3();
		let hasSelection = false;
		const tempBoundsCenter = new THREE.Vector3();
		for (const asset of getSplatEditScopeAssets()) {
			const assetIdKey = getAssetIdKey(asset.id);
			const selectedSet = selectedSplatsByAssetId.get(assetIdKey);
			const splatMesh = asset?.disposeTarget;
			const packedSplats = getSplatPackedSource(asset);
			if (
				!selectedSet ||
				selectedSet.size === 0 ||
				typeof packedSplats?.getSplat !== "function" ||
				typeof packedSplats?.setSplat !== "function"
			) {
				continue;
			}
			asset.object?.updateMatrixWorld?.(true);
			splatMesh?.updateMatrixWorld?.(true);
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
			const validIndices = [];
			for (const index of selectedSet) {
				if (Number.isInteger(index) && index >= 0 && index < totalCount) {
					validIndices.push(index);
				}
			}
			if (validIndices.length === 0) {
				continue;
			}
			const selectedIndices = Uint32Array.from(validIndices);
			let entryHasBounds = false;
			for (let i = 0; i < selectedIndices.length; i += 1) {
				const splat = packedSplats.getSplat(selectedIndices[i]);
				tempBoundsCenter.copy(splat.center).applyMatrix4(worldMatrix);
				if (!Number.isFinite(tempBoundsCenter.x)) {
					continue;
				}
				selectionBounds.expandByPoint(tempBoundsCenter);
				entryHasBounds = true;
			}
			if (!entryHasBounds) {
				continue;
			}
			hasSelection = true;
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
				selectedIndices,
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
		const scaleFactor =
			Number.isFinite(uniformScale) && uniformScale > 0 ? uniformScale : 1;
		const worldTransformMatrix = composeSelectedSplatTransformMatrix(
			{ worldTranslation, worldRotation, uniformScale, pivotWorld },
			tempTransformMatrix,
		);
		const rotation =
			worldRotation instanceof THREE.Quaternion ? worldRotation : null;
		const tempCenter = tempVector;
		const tempScales = tempVector2;
		const tempWorldCenter = tempWorldPoint;
		const tempLocalDeltaQuat = new THREE.Quaternion();
		const tempSplatQuat = new THREE.Quaternion();
		const tempCombinedMatrix = tempTransformPivotMatrix;
		let changed = false;
		for (const entry of entries) {
			tempCombinedMatrix
				.copy(entry.worldMatrixInverse)
				.multiply(worldTransformMatrix);
			let hasRotation = false;
			if (rotation) {
				tempLocalDeltaQuat
					.copy(entry.inverseWorldQuaternion)
					.multiply(rotation)
					.multiply(entry.worldQuaternion)
					.normalize();
				hasRotation = true;
			}
			const selectedIndices = entry.selectedIndices;
			for (let i = 0; i < selectedIndices.length; i += 1) {
				const index = selectedIndices[i];
				const splat = entry.packedSplats.getSplat(index);
				tempWorldCenter.copy(splat.center).applyMatrix4(entry.worldMatrix);
				tempCenter.copy(tempWorldCenter).applyMatrix4(tempCombinedMatrix);
				if (scaleFactor !== 1) {
					tempScales.copy(splat.scales).multiplyScalar(scaleFactor);
				}
				if (hasRotation) {
					tempSplatQuat
						.copy(tempLocalDeltaQuat)
						.multiply(splat.quaternion)
						.normalize();
				}
				entry.packedSplats.setSplat(
					index,
					tempCenter,
					scaleFactor === 1 ? splat.scales : tempScales,
					hasRotation ? tempSplatQuat : splat.quaternion,
					splat.opacity,
					splat.color,
				);
			}
			entry.packedSplats.disposeLodSplats?.();
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
		const previewState = activeTransformPreview ?? {};
		const worldTranslation = previewState.worldTranslation;
		const worldRotation = previewState.worldRotation;
		const uniformScale = previewState.uniformScale;
		const hasTranslation =
			worldTranslation?.isVector3 === true &&
			worldTranslation.lengthSq() > 1e-12;
		const hasRotation =
			worldRotation?.isQuaternion === true &&
			(Math.abs(worldRotation.x) > 1e-6 ||
				Math.abs(worldRotation.y) > 1e-6 ||
				Math.abs(worldRotation.z) > 1e-6 ||
				Math.abs(worldRotation.w - 1) > 1e-6);
		const hasScale =
			Number.isFinite(uniformScale) && Math.abs(uniformScale - 1) > 1e-6;
		if (!hasTranslation && !hasRotation && !hasScale) {
			clearActiveTransformPreview();
			return false;
		}
		const t0 = performance.now();
		if (!applySelectedSplatTransform(entries, previewState)) {
			clearActiveTransformPreview();
			return false;
		}
		const t1 = performance.now();
		let changed = false;
		for (const entry of entries) {
			changed = markSplatAssetPersistentSourceDirty(entry.asset) || changed;
			invalidateBrushSpatialIndex(entry.asset);
		}
		const t2 = performance.now();
		clearActiveTransformPreview({ syncUi: false });
		syncSelectionHighlight();
		syncSceneHelper();
		updateUi?.();
		const t3 = performance.now();
		debugSplatHistory("finalize-transform", {
			selectedAssets: entries.map((entry) => entry.asset?.id ?? null),
			applyMs: Number((t1 - t0).toFixed(1)),
			persistMs: Number((t2 - t1).toFixed(1)),
			syncMs: Number((t3 - t2).toFixed(1)),
			totalMs: Number((t3 - t0).toFixed(1)),
		});
		return changed;
	}

	function setActiveTransformPreview(previewState) {
		activeTransformPreview = previewState;
	}

	function moveSelectedSplatsByWorldDelta(worldDelta) {
		const { entries } = getSelectedSplatTransformEntries();
		if (entries.length === 0 || !worldDelta?.isVector3) {
			return false;
		}
		setActiveTransformPreview({
			entries,
			selectionBounds: getSelectedSplatTransformBounds()?.clone?.() ?? null,
			pivotWorld:
				getSelectedSplatTransformPivotWorld()?.clone?.() ??
				new THREE.Vector3(),
			worldTranslation: worldDelta.clone(),
			worldRotation: new THREE.Quaternion(),
			uniformScale: 1,
		});
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
		setActiveTransformPreview({
			entries,
			selectionBounds: selectionBounds.clone(),
			pivotWorld: selectionBounds.getCenter(new THREE.Vector3()),
			worldTranslation: new THREE.Vector3(),
			worldRotation,
			uniformScale: 1,
		});
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
		setActiveTransformPreview({
			entries,
			selectionBounds: selectionBounds.clone(),
			pivotWorld: selectionBounds.getCenter(new THREE.Vector3()),
			worldTranslation: new THREE.Vector3(),
			worldRotation: new THREE.Quaternion(),
			uniformScale: scaleFactor,
		});
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

	return {
		getActiveTransformPreview,
		getSelectedSplatTransformEntries,
		composeSelectedSplatTransformMatrix,
		getSelectedSplatTransformBounds,
		getSelectedSplatTransformPivotWorld,
		clearActiveTransformPreview,
		ensureSelectedSplatTransformPreview,
		updateSelectedSplatTransformPreview,
		applySelectedSplatTransform,
		finalizeSelectedSplatTransform,
		moveSelectedSplatsByWorldDelta,
		rotateSelectedSplatsAroundSelection,
		scaleSelectedSplatsUniformAroundSelection,
	};
}
