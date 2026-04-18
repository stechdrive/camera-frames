import * as THREE from "three";
import { WORKSPACE_PANE_CAMERA } from "../../workspace-model.js";

export function captureCameraPose(camera) {
	return {
		position: {
			x: camera.position.x,
			y: camera.position.y,
			z: camera.position.z,
		},
		quaternion: {
			x: camera.quaternion.x,
			y: camera.quaternion.y,
			z: camera.quaternion.z,
			w: camera.quaternion.w,
		},
		up: {
			x: camera.up.x,
			y: camera.up.y,
			z: camera.up.z,
		},
	};
}

export function createCameraPoseController({
	state,
	getActiveShotCamera,
	updateActiveShotCameraDocument,
}) {
	function syncActiveShotCameraDocumentFromLiveCamera({
		includeLens = false,
		baseFovX = state.baseFovX,
	} = {}) {
		const shotCamera = getActiveShotCamera();
		if (!shotCamera) {
			return;
		}

		updateActiveShotCameraDocument((documentState) => {
			documentState.pose = captureCameraPose(shotCamera);
			if (includeLens) {
				documentState.lens = {
					...documentState.lens,
					baseFovX: Number(baseFovX),
				};
			}
			return documentState;
		});
	}

	function applyActiveShotCameraRoll(axisWorld, deltaRadians) {
		if (state.mode !== WORKSPACE_PANE_CAMERA) {
			return false;
		}

		const shotCamera = getActiveShotCamera();
		if (
			!shotCamera ||
			!(axisWorld instanceof THREE.Vector3) ||
			axisWorld.lengthSq() <= 1e-6 ||
			!Number.isFinite(deltaRadians) ||
			Math.abs(deltaRadians) <= 1e-7
		) {
			return false;
		}

		const deltaQuaternion = new THREE.Quaternion().setFromAxisAngle(
			axisWorld.clone().normalize(),
			deltaRadians,
		);
		shotCamera.quaternion.premultiply(deltaQuaternion);
		shotCamera.up.applyQuaternion(deltaQuaternion).normalize();
		shotCamera.updateMatrixWorld(true);
		return true;
	}

	return {
		syncActiveShotCameraDocumentFromLiveCamera,
		applyActiveShotCameraRoll,
	};
}
