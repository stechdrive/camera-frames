import * as THREE from "three";
import {
	composeCameraQuaternionFromPoseAngles,
	decomposeCameraPoseAngles,
} from "../engine/camera-pose.js";
import {
	getFrustumCenterRayDirection,
	getPreviewFrustumExtents,
	getTargetFrustumExtents,
	horizontalToVerticalFovDegrees,
} from "../engine/projection.js";

export function createProjectionController({
	state,
	renderer,
	getOutputSizeState,
	getOutputFrameMetrics,
	getViewportSize,
	handleOutputFrameResize,
	syncActiveShotCameraFromDocument,
	getActiveShotCamera,
	getActiveShotCameraDocument,
	getActiveCameraViewCamera,
	getActiveOutputCamera,
}) {
	function getProjectionState() {
		syncActiveShotCameraFromDocument();
		const shotCamera = getActiveShotCamera();
		const outputFrameDocument =
			getActiveShotCameraDocument()?.outputFrame ?? {};
		const exportSize = getOutputSizeState();
		const metrics = getOutputFrameMetrics();
		const targetFrustum = getTargetFrustumExtents({
			near: shotCamera.near,
			horizontalFovDegrees: state.baseFovX,
			widthScale: state.outputFrame.widthScale,
			heightScale: state.outputFrame.heightScale,
			centerX: outputFrameDocument.centerX,
			centerY: outputFrameDocument.centerY,
		});
		const previewFrustum = getPreviewFrustumExtents({
			targetFrustum,
			metrics,
		});

		return {
			exportSize,
			metrics,
			targetFrustum,
			previewFrustum,
		};
	}

	function setPerspectiveExtents(camera, left, right, top, bottom) {
		camera.projectionMatrix.makePerspective(
			left,
			right,
			top,
			bottom,
			camera.near,
			camera.far,
		);
		camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
	}

	function applyCustomProjection(camera, frustum) {
		setPerspectiveExtents(
			camera,
			frustum.left,
			frustum.right,
			frustum.top,
			frustum.bottom,
		);
	}

	function applySymmetricProjection(camera, aspect, horizontalFovDegrees) {
		camera.aspect = aspect;
		camera.fov = horizontalToVerticalFovDegrees(horizontalFovDegrees, aspect);
		camera.updateProjectionMatrix();
	}

	function syncShotProjection() {
		const shotCamera = getActiveShotCamera();
		const { targetFrustum } = getProjectionState();
		applyCustomProjection(shotCamera, targetFrustum);
	}

	function applyCameraViewProjection() {
		const shotCamera = getActiveShotCamera();
		const cameraViewCamera = getActiveCameraViewCamera();
		const { previewFrustum } = getProjectionState();

		cameraViewCamera.position.copy(shotCamera.position);
		cameraViewCamera.quaternion.copy(shotCamera.quaternion);
		cameraViewCamera.near = shotCamera.near;
		cameraViewCamera.far = shotCamera.far;
		cameraViewCamera.up.copy(shotCamera.up);
		cameraViewCamera.updateMatrixWorld();

		applyCustomProjection(cameraViewCamera, previewFrustum);
	}

	function syncOutputCamera() {
		const shotCamera = getActiveShotCamera();
		const outputCamera = getActiveOutputCamera();
		const { targetFrustum } = getProjectionState();
		outputCamera.position.copy(shotCamera.position);
		outputCamera.quaternion.copy(shotCamera.quaternion);
		outputCamera.near = shotCamera.near;
		outputCamera.far = shotCamera.far;
		outputCamera.up.copy(shotCamera.up);
		applyCustomProjection(outputCamera, targetFrustum);
		outputCamera.updateMatrixWorld();
	}

	function getShotCameraRollAxisWorld() {
		const shotCamera = getActiveShotCamera();
		if (!shotCamera) {
			return null;
		}

		const localDirection = getShotCameraCenterRayLocalDirection();
		if (!localDirection) {
			return null;
		}

		return localDirection.applyQuaternion(shotCamera.quaternion).normalize();
	}

	function getShotCameraCenterRayLocalDirection() {
		const shotCamera = getActiveShotCamera();
		if (!shotCamera) {
			return null;
		}

		const { targetFrustum } = getProjectionState();
		const centerRay = getFrustumCenterRayDirection({
			near: shotCamera.near,
			frustum: targetFrustum,
		});

		return new THREE.Vector3(centerRay.x, centerRay.y, centerRay.z).normalize();
	}

	function applyShotCameraQuaternion(nextQuaternion) {
		const shotCamera = getActiveShotCamera();
		if (!shotCamera || !(nextQuaternion instanceof THREE.Quaternion)) {
			return false;
		}

		shotCamera.quaternion.copy(nextQuaternion).normalize();
		shotCamera.up
			.set(0, 1, 0)
			.applyQuaternion(shotCamera.quaternion)
			.normalize();
		shotCamera.updateMatrixWorld(true);
		return true;
	}

	function getShotCameraPoseAngles() {
		const shotCamera = getActiveShotCamera();
		const axisLocal = getShotCameraCenterRayLocalDirection();
		if (!shotCamera || !axisLocal) {
			return {
				yawDeg: 0,
				pitchDeg: 0,
				rollDeg: 0,
			};
		}

		return decomposeCameraPoseAngles({
			quaternion: shotCamera.quaternion,
			axisLocal,
		});
	}

	function setShotCameraPoseAngles(nextAngles) {
		const shotCamera = getActiveShotCamera();
		const axisLocal = getShotCameraCenterRayLocalDirection();
		if (!shotCamera || !axisLocal) {
			return false;
		}

		const currentAngles = getShotCameraPoseAngles();
		const nextQuaternion = composeCameraQuaternionFromPoseAngles({
			axisLocal,
			yawDeg: Number.isFinite(nextAngles?.yawDeg)
				? nextAngles.yawDeg
				: currentAngles.yawDeg,
			pitchDeg: Number.isFinite(nextAngles?.pitchDeg)
				? nextAngles.pitchDeg
				: currentAngles.pitchDeg,
			rollDeg: Number.isFinite(nextAngles?.rollDeg)
				? nextAngles.rollDeg
				: currentAngles.rollDeg,
		});
		return applyShotCameraQuaternion(nextQuaternion);
	}

	function getShotCameraRollAngleDegrees() {
		return getShotCameraPoseAngles().rollDeg;
	}

	function setShotCameraRollAngleDegrees(nextRollDeg) {
		return setShotCameraPoseAngles({ rollDeg: nextRollDeg });
	}

	function handleResize() {
		const { width, height } = getViewportSize();
		renderer.setSize(width, height, false);
		handleOutputFrameResize();
	}

	return {
		getProjectionState,
		syncShotProjection,
		applyCameraViewProjection,
		syncOutputCamera,
		getShotCameraPoseAngles,
		setShotCameraPoseAngles,
		getShotCameraRollAxisWorld,
		getShotCameraRollAngleDegrees,
		setShotCameraRollAngleDegrees,
		handleResize,
	};
}
