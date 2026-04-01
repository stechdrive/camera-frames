import * as THREE from "three";
import {
	createPlaneFromNormalAndPoint,
	getHandleAxisKey,
	getSignedAngleAroundAxis,
	scaleLocalPoint,
} from "./gizmo-geometry.js";

export const MOVE_AXIS_HANDLE_NAMES = ["move-x", "move-y", "move-z"];
export const MOVE_PLANE_HANDLE_NAMES = ["move-xy", "move-yz", "move-zx"];
export const ROTATE_AXIS_HANDLE_NAMES = ["rotate-x", "rotate-y", "rotate-z"];

export function createViewportToolDragOperations({
	assetController,
	getSelectedTransformPivotWorld,
	createTransformAssetSnapshot,
	getSelectedTransformAssets,
	getTransformBasisWorld,
	getMoveAxisPlaneNormal,
	getPointerRay,
	applySelectedAssetTransforms,
}) {
	const plane = new THREE.Plane();
	const planeIntersection = new THREE.Vector3();
	const tempVector = new THREE.Vector3();
	const tempVector2 = new THREE.Vector3();

	function getSelectedDragAssets(asset, pivotEditMode) {
		if (pivotEditMode) {
			return [];
		}

		const selectedSnapshots = getSelectedTransformAssets()
			.map((selectedAsset) => createTransformAssetSnapshot(selectedAsset))
			.filter(Boolean);
		if (selectedSnapshots.length > 0) {
			return selectedSnapshots;
		}
		const fallbackSnapshot = createTransformAssetSnapshot(asset);
		return fallbackSnapshot ? [fallbackSnapshot] : [];
	}

	function createBaseDragState({
		asset,
		event,
		startWorldPosition,
		startWorldQuaternion,
		startPivotLocal,
		startPivotWorld,
		selectedAssets,
		pivotEditMode,
	}) {
		return {
			pointerId: event.pointerId,
			assetId: asset.id,
			startWorldPosition,
			startWorldQuaternion,
			startWorldScale: asset.worldScale,
			startObjectScale: asset.object.scale.clone(),
			startPivotLocal: startPivotLocal.clone(),
			startPivotWorld: startPivotWorld.clone(),
			selectedAssets,
			pivotEditMode,
		};
	}

	function beginDragState({
		handleName,
		asset,
		camera,
		event,
		viewportRect,
		transformSpace,
		pivotEditMode,
	}) {
		const pointerRay = getPointerRay(event, camera, viewportRect);
		const startWorldPosition = asset.object.getWorldPosition(
			new THREE.Vector3(),
		);
		const startWorldQuaternion = asset.object.getWorldQuaternion(
			new THREE.Quaternion(),
		);
		const startPivotLocal =
			assetController.getAssetWorkingPivotLocal(asset) ??
			new THREE.Vector3(0, 0, 0);
		const startPivotWorld = getSelectedTransformPivotWorld(asset);
		const basisWorld = getTransformBasisWorld(
			startWorldQuaternion,
			transformSpace,
		);
		const axisKey = getHandleAxisKey(handleName);
		const selectedAssets = getSelectedDragAssets(asset, pivotEditMode);
		const baseDragState = createBaseDragState({
			asset,
			event,
			startWorldPosition,
			startWorldQuaternion,
			startPivotLocal,
			startPivotWorld,
			selectedAssets,
			pivotEditMode,
		});

		if (MOVE_AXIS_HANDLE_NAMES.includes(handleName) && axisKey) {
			const axisWorld = basisWorld[axisKey].clone();
			const planeNormal = getMoveAxisPlaneNormal(axisWorld, camera);
			if (!planeNormal) {
				return null;
			}
			createPlaneFromNormalAndPoint(planeNormal, startPivotWorld, plane);
			const startPoint = pointerRay.intersectPlane(plane, new THREE.Vector3());
			if (!startPoint) {
				return null;
			}
			return {
				...baseDragState,
				mode: "move-axis",
				axisWorld,
				planeNormal: planeNormal.clone(),
				startPoint: startPoint.clone(),
			};
		}

		if (MOVE_PLANE_HANDLE_NAMES.includes(handleName)) {
			const planeAxes =
				handleName === "move-xy"
					? [basisWorld.x, basisWorld.y]
					: handleName === "move-yz"
						? [basisWorld.y, basisWorld.z]
						: [basisWorld.z, basisWorld.x];
			const planeNormal = new THREE.Vector3()
				.crossVectors(planeAxes[0], planeAxes[1])
				.normalize();
			createPlaneFromNormalAndPoint(planeNormal, startPivotWorld, plane);
			const startPoint = pointerRay.intersectPlane(plane, new THREE.Vector3());
			if (!startPoint) {
				return null;
			}
			return {
				...baseDragState,
				mode: "move-plane",
				planeNormal: planeNormal.clone(),
				startPoint: startPoint.clone(),
			};
		}

		if (handleName === "scale-uniform" && !pivotEditMode) {
			return {
				...baseDragState,
				mode: "scale-uniform",
				startClientX: event.clientX,
				startClientY: event.clientY,
			};
		}

		if (
			ROTATE_AXIS_HANDLE_NAMES.includes(handleName) &&
			axisKey &&
			!pivotEditMode
		) {
			const axisWorld = basisWorld[axisKey].clone();
			createPlaneFromNormalAndPoint(axisWorld, startPivotWorld, plane);
			const startPoint = pointerRay.intersectPlane(plane, new THREE.Vector3());
			if (!startPoint) {
				return null;
			}
			const startVector = startPoint.sub(startPivotWorld).normalize();
			if (startVector.lengthSq() < 1e-6) {
				return null;
			}
			return {
				...baseDragState,
				mode: "rotate",
				axisWorld: axisWorld.clone(),
				startVector: startVector.clone(),
			};
		}

		return null;
	}

	function applyMoveAxisDrag(dragState, pointerRay) {
		createPlaneFromNormalAndPoint(
			dragState.planeNormal,
			dragState.startPivotWorld,
			plane,
		);
		const hitPoint = pointerRay.intersectPlane(plane, planeIntersection);
		if (!hitPoint) {
			return;
		}

		const projectedDistance = tempVector
			.copy(hitPoint)
			.sub(dragState.startPoint)
			.dot(dragState.axisWorld);
		const nextPivotWorld = tempVector2
			.copy(dragState.startPivotWorld)
			.addScaledVector(dragState.axisWorld, projectedDistance);
		if (dragState.pivotEditMode) {
			assetController.setAssetWorkingPivotWorld(
				dragState.assetId,
				nextPivotWorld,
				{
					historyLabel: "asset.pivot",
				},
			);
			return;
		}

		if ((dragState.selectedAssets?.length ?? 0) <= 1) {
			const nextWorldPosition = tempVector
				.copy(dragState.startWorldPosition)
				.add(nextPivotWorld.clone().sub(dragState.startPivotWorld));
			assetController.setAssetTransform(
				dragState.assetId,
				{
					worldPosition: nextWorldPosition,
				},
				{
					historyLabel: "asset.transform",
				},
			);
			return;
		}

		const worldDelta = nextPivotWorld.clone().sub(dragState.startPivotWorld);
		applySelectedAssetTransforms(
			dragState.selectedAssets,
			(selectedAsset) => ({
				worldPosition: selectedAsset.startWorldPosition.clone().add(worldDelta),
			}),
			"asset.transform",
		);
	}

	function applyMovePlaneDrag(dragState, pointerRay) {
		createPlaneFromNormalAndPoint(
			dragState.planeNormal,
			dragState.startPivotWorld,
			plane,
		);
		const hitPoint = pointerRay.intersectPlane(plane, planeIntersection);
		if (!hitPoint) {
			return;
		}

		const nextPivotWorld = tempVector2
			.copy(dragState.startPivotWorld)
			.add(tempVector.copy(hitPoint).sub(dragState.startPoint));
		if (dragState.pivotEditMode) {
			assetController.setAssetWorkingPivotWorld(
				dragState.assetId,
				nextPivotWorld,
				{
					historyLabel: "asset.pivot",
				},
			);
			return;
		}

		if ((dragState.selectedAssets?.length ?? 0) <= 1) {
			const nextWorldPosition = tempVector
				.copy(dragState.startWorldPosition)
				.add(nextPivotWorld.clone().sub(dragState.startPivotWorld));
			assetController.setAssetTransform(
				dragState.assetId,
				{
					worldPosition: nextWorldPosition,
				},
				{
					historyLabel: "asset.transform",
				},
			);
			return;
		}

		const worldDelta = nextPivotWorld.clone().sub(dragState.startPivotWorld);
		applySelectedAssetTransforms(
			dragState.selectedAssets,
			(selectedAsset) => ({
				worldPosition: selectedAsset.startWorldPosition.clone().add(worldDelta),
			}),
			"asset.transform",
		);
	}

	function applyRotateDrag(dragState, pointerRay) {
		createPlaneFromNormalAndPoint(
			dragState.axisWorld,
			dragState.startPivotWorld,
			plane,
		);
		const hitPoint = pointerRay.intersectPlane(plane, planeIntersection);
		if (!hitPoint) {
			return;
		}

		const nextVector = tempVector
			.copy(hitPoint)
			.sub(dragState.startPivotWorld)
			.normalize();
		if (nextVector.lengthSq() < 1e-6) {
			return;
		}

		const angle = getSignedAngleAroundAxis(
			dragState.startVector,
			nextVector,
			dragState.axisWorld,
		);
		const deltaQuaternion = new THREE.Quaternion().setFromAxisAngle(
			dragState.axisWorld,
			angle,
		);
		if ((dragState.selectedAssets?.length ?? 0) <= 1) {
			const nextWorldQuaternion = deltaQuaternion.multiply(
				dragState.startWorldQuaternion.clone(),
			);
			const nextWorldPosition = dragState.startPivotWorld
				.clone()
				.sub(
					scaleLocalPoint(
						dragState.startPivotLocal,
						dragState.startObjectScale,
					).applyQuaternion(nextWorldQuaternion),
				);
			assetController.setAssetTransform(
				dragState.assetId,
				{
					worldPosition: nextWorldPosition,
					worldQuaternion: nextWorldQuaternion,
				},
				{
					historyLabel: "asset.transform",
				},
			);
			return;
		}

		applySelectedAssetTransforms(
			dragState.selectedAssets,
			(selectedAsset) => {
				const nextWorldQuaternion = deltaQuaternion
					.clone()
					.multiply(selectedAsset.startWorldQuaternion.clone());
				const rotatedPivotWorld = selectedAsset.startPivotWorld
					.clone()
					.sub(dragState.startPivotWorld)
					.applyQuaternion(deltaQuaternion)
					.add(dragState.startPivotWorld);
				const nextWorldPosition = rotatedPivotWorld.sub(
					scaleLocalPoint(
						selectedAsset.startPivotLocal,
						selectedAsset.startObjectScale,
					).applyQuaternion(nextWorldQuaternion),
				);
				return {
					worldPosition: nextWorldPosition,
					worldQuaternion: nextWorldQuaternion,
				};
			},
			"asset.transform",
		);
	}

	function applyUniformScaleDrag(dragState, event) {
		const deltaPixels =
			event.clientX -
			dragState.startClientX -
			(event.clientY - dragState.startClientY);
		const nextWorldScale =
			dragState.startWorldScale * Math.exp(deltaPixels * 0.01);
		const scaleFactor =
			nextWorldScale / Math.max(dragState.startWorldScale, 0.000001);
		if ((dragState.selectedAssets?.length ?? 0) <= 1) {
			const nextObjectScale = dragState.startObjectScale
				.clone()
				.multiplyScalar(scaleFactor);
			const nextWorldPosition = dragState.startPivotWorld
				.clone()
				.sub(
					scaleLocalPoint(
						dragState.startPivotLocal,
						nextObjectScale,
					).applyQuaternion(dragState.startWorldQuaternion),
				);
			assetController.setAssetTransform(
				dragState.assetId,
				{
					worldPosition: nextWorldPosition,
					worldScale: nextWorldScale,
				},
				{
					historyLabel: "asset.transform",
				},
			);
			return;
		}

		applySelectedAssetTransforms(
			dragState.selectedAssets,
			(selectedAsset) => {
				const scaledPivotWorld = selectedAsset.startPivotWorld
					.clone()
					.sub(dragState.startPivotWorld)
					.multiplyScalar(scaleFactor)
					.add(dragState.startPivotWorld);
				const nextSelectedWorldScale =
					selectedAsset.startWorldScale * scaleFactor;
				const nextObjectScale = selectedAsset.startObjectScale
					.clone()
					.multiplyScalar(scaleFactor);
				const nextWorldPosition = scaledPivotWorld.sub(
					scaleLocalPoint(
						selectedAsset.startPivotLocal,
						nextObjectScale,
					).applyQuaternion(selectedAsset.startWorldQuaternion),
				);
				return {
					worldPosition: nextWorldPosition,
					worldScale: nextSelectedWorldScale,
				};
			},
			"asset.transform",
		);
	}

	function applyDrag(dragState, pointerRay, event) {
		switch (dragState.mode) {
			case "move-axis":
				applyMoveAxisDrag(dragState, pointerRay);
				return;
			case "move-plane":
				applyMovePlaneDrag(dragState, pointerRay);
				return;
			case "rotate":
				applyRotateDrag(dragState, pointerRay);
				return;
			case "scale-uniform":
				applyUniformScaleDrag(dragState, event);
				return;
			default:
				return;
		}
	}

	return {
		beginDragState,
		applyDrag,
	};
}
