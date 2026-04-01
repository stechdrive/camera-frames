import * as THREE from "three";
import {
	getCameraWorldDirection,
	getCameraWorldUp,
	getNdcFromPointer,
} from "./gizmo-geometry.js";

export function createViewportToolTransformHelpers({
	store,
	assetController,
	raycaster,
	pointerNdc,
	tempVector,
	tempVector2,
}) {
	function getSelectedTransformAsset() {
		const selectedAssetId = store.selectedSceneAssetId.value;
		return selectedAssetId
			? assetController.getSceneAsset(selectedAssetId)
			: null;
	}

	function getSelectedTransformAssets() {
		const selectedAssetIds = store.selectedSceneAssetIds.value;
		const assets = selectedAssetIds
			.map((assetId) => assetController.getSceneAsset(assetId))
			.filter((asset) => asset && asset.object.visible !== false);
		if (assets.length > 0) {
			return assets;
		}

		const activeAsset = getSelectedTransformAsset();
		return activeAsset && activeAsset.object.visible !== false
			? [activeAsset]
			: [];
	}

	function getSelectedTransformPivotWorld(asset) {
		return (
			assetController.getAssetWorkingPivotWorld(asset) ??
			asset.object.getWorldPosition(new THREE.Vector3())
		);
	}

	function createTransformAssetSnapshot(asset) {
		if (!asset) {
			return null;
		}

		return {
			assetId: asset.id,
			startWorldPosition: asset.object.getWorldPosition(new THREE.Vector3()),
			startWorldQuaternion: asset.object.getWorldQuaternion(
				new THREE.Quaternion(),
			),
			startWorldScale: asset.worldScale,
			startObjectScale: asset.object.scale.clone(),
			startPivotLocal:
				assetController.getAssetWorkingPivotLocal(asset) ??
				new THREE.Vector3(0, 0, 0),
			startPivotWorld: getSelectedTransformPivotWorld(asset),
		};
	}

	function applySelectedAssetTransforms(
		selectedAssets,
		buildTransform,
		historyLabel = "asset.transform",
	) {
		for (const selectedAsset of selectedAssets) {
			const nextTransform = buildTransform(selectedAsset);
			if (!nextTransform) {
				continue;
			}
			assetController.setAssetTransform(selectedAsset.assetId, nextTransform, {
				historyLabel,
			});
		}
	}

	function getTransformBasisWorld(worldQuaternion, transformSpace) {
		if (transformSpace !== "local") {
			return {
				x: new THREE.Vector3(1, 0, 0),
				y: new THREE.Vector3(0, 1, 0),
				z: new THREE.Vector3(0, 0, 1),
			};
		}

		return {
			x: new THREE.Vector3(1, 0, 0)
				.applyQuaternion(worldQuaternion)
				.normalize(),
			y: new THREE.Vector3(0, 1, 0)
				.applyQuaternion(worldQuaternion)
				.normalize(),
			z: new THREE.Vector3(0, 0, 1)
				.applyQuaternion(worldQuaternion)
				.normalize(),
		};
	}

	function getMoveAxisPlaneNormal(axisWorld, camera) {
		const cameraDirection = getCameraWorldDirection(camera, tempVector);
		const cameraUp = getCameraWorldUp(camera, tempVector2);
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

	function getPointerRay(event, camera, viewportRect) {
		getNdcFromPointer(event, viewportRect, pointerNdc);
		raycaster.setFromCamera(pointerNdc, camera);
		return raycaster.ray;
	}

	return {
		getSelectedTransformAsset,
		getSelectedTransformAssets,
		getSelectedTransformPivotWorld,
		createTransformAssetSnapshot,
		applySelectedAssetTransforms,
		getTransformBasisWorld,
		getMoveAxisPlaneNormal,
		getPointerRay,
	};
}
