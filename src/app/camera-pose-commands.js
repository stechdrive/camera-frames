import * as THREE from "three";
import { WORKSPACE_PANE_CAMERA } from "../workspace-model.js";

export function createCameraPoseCommands({
	state,
	viewportCamera,
	getActiveShotCamera,
	getCameraController,
	getHistoryController,
	getProjectionController,
	getViewportProjectionController,
	updateUi,
}) {
	function getActiveViewportCamera() {
		return (
			getViewportProjectionController?.()?.getActiveViewportCamera?.() ??
			viewportCamera
		);
	}

	function getActiveCamera() {
		return state.mode === WORKSPACE_PANE_CAMERA
			? getActiveShotCamera()
			: getActiveViewportCamera();
	}

	function getActiveCameraHeadingDeg() {
		const camera = getActiveCamera();
		if (!camera) {
			return 0;
		}

		const forward = camera.getWorldDirection(new THREE.Vector3());
		forward.y = 0;
		if (forward.lengthSq() <= 1e-8) {
			return 0;
		}
		forward.normalize();
		return THREE.MathUtils.radToDeg(Math.atan2(forward.x, forward.z));
	}

	function getActiveShotCameraPoseState() {
		const shotCamera = getActiveShotCamera();
		const poseAngles =
			getProjectionController?.()?.getShotCameraPoseAngles?.() ?? {
				yawDeg: 0,
				pitchDeg: 0,
				rollDeg: 0,
			};

		return {
			position: {
				x: shotCamera.position.x,
				y: shotCamera.position.y,
				z: shotCamera.position.z,
			},
			rotation: poseAngles,
		};
	}

	function setActiveShotCameraPoseAngle(axis, nextValue) {
		const numericValue = Number(nextValue);
		if (
			!["yaw", "pitch", "roll"].includes(axis) ||
			!Number.isFinite(numericValue)
		) {
			return false;
		}

		return getHistoryController?.()?.runHistoryAction?.(
			`camera.rotation.${axis}`,
			() => {
				const nextAngles =
					axis === "yaw"
						? { yawDeg: numericValue }
						: axis === "pitch"
							? { pitchDeg: numericValue }
							: { rollDeg: numericValue };
				getProjectionController?.()?.setShotCameraPoseAngles?.(nextAngles);
				getCameraController?.()?.syncActiveShotCameraDocumentFromLiveCamera?.();
				updateUi?.();
			},
		);
	}

	function moveActiveShotCameraLocalAxis(axis, distance) {
		return getCameraController?.()?.moveActiveShotCameraLocalAxis?.(
			axis,
			distance,
		);
	}

	return {
		getActiveViewportCamera,
		getActiveCamera,
		getActiveCameraHeadingDeg,
		getActiveShotCameraPoseState,
		setActiveShotCameraPoseAngle,
		moveActiveShotCameraLocalAxis,
	};
}
