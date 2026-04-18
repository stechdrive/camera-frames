import * as THREE from "three";

export function createCameraPropertiesController({
	runHistoryAction,
	updateUi,
	getActiveShotCamera,
	updateActiveShotCameraDocument,
	syncActiveShotCameraDocumentFromLiveCamera,
}) {
	function setShotCameraRollLock(nextValue) {
		runHistoryAction?.("camera.roll-lock", () => {
			updateActiveShotCameraDocument((documentState) => {
				documentState.navigation = {
					...documentState.navigation,
					rollLock: Boolean(nextValue),
				};
				return documentState;
			});
		});
		updateUi();
	}

	function setShotCameraName(nextValue) {
		runHistoryAction?.("camera.name", () => {
			updateActiveShotCameraDocument((documentState) => {
				const normalizedName = String(nextValue ?? "").trim();
				if (!normalizedName) {
					return documentState;
				}
				documentState.name = normalizedName;
				return documentState;
			});
		});
		updateUi();
	}

	function setActiveShotCameraPositionAxis(axis, nextValue) {
		const numericValue = Number(nextValue);
		if (!["x", "y", "z"].includes(axis) || !Number.isFinite(numericValue)) {
			return false;
		}

		return runHistoryAction?.(`camera.position.${axis}`, () => {
			const shotCamera = getActiveShotCamera();
			shotCamera.position[axis] = numericValue;
			shotCamera.updateMatrixWorld(true);
			syncActiveShotCameraDocumentFromLiveCamera();
			updateUi();
		});
	}

	function getActiveShotCameraLocalAxis(axis) {
		const shotCamera = getActiveShotCamera();
		if (!shotCamera) {
			return null;
		}
		const forward = shotCamera
			.getWorldDirection(new THREE.Vector3())
			.normalize();
		const right = new THREE.Vector3()
			.crossVectors(forward, shotCamera.up)
			.normalize();
		const up = new THREE.Vector3().crossVectors(right, forward).normalize();

		switch (axis) {
			case "right":
				return right;
			case "up":
				return up;
			case "forward":
				return forward;
			default:
				return null;
		}
	}

	function moveActiveShotCameraLocalAxis(axis, distance) {
		const numericDistance = Number(distance);
		if (
			!Number.isFinite(numericDistance) ||
			Math.abs(numericDistance) <= 1e-8
		) {
			return false;
		}

		const shotCamera = getActiveShotCamera();
		const axisVector = getActiveShotCameraLocalAxis(axis);
		if (!shotCamera || !(axisVector instanceof THREE.Vector3)) {
			return false;
		}

		shotCamera.position.addScaledVector(axisVector, numericDistance);
		shotCamera.updateMatrixWorld(true);
		syncActiveShotCameraDocumentFromLiveCamera();
		updateUi();
		return true;
	}

	return {
		setShotCameraRollLock,
		setShotCameraName,
		setActiveShotCameraPositionAxis,
		getActiveShotCameraLocalAxis,
		moveActiveShotCameraLocalAxis,
	};
}
