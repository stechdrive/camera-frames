import { WORKSPACE_PANE_CAMERA } from "../../workspace-model.js";

const POSE_EPSILON = 1e-7;

export function createRuntimeNavigationCommit({
	state,
	store,
	fpsMovement,
	pointerControls,
	navigationHistory,
}) {
	const lastPoseSnapshot = {
		px: Number.NaN,
		py: Number.NaN,
		pz: Number.NaN,
		qx: Number.NaN,
		qy: Number.NaN,
		qz: Number.NaN,
		qw: Number.NaN,
		isOrtho: false,
		left: Number.NaN,
		right: Number.NaN,
		top: Number.NaN,
		bottom: Number.NaN,
		zoom: Number.NaN,
	};

	function getActiveCameraHistoryTargetKey() {
		return state.mode === WORKSPACE_PANE_CAMERA
			? `shot:${store.workspace.activeShotCameraId.value}`
			: "viewport";
	}

	function getActiveCameraHistoryLabel() {
		return state.mode === WORKSPACE_PANE_CAMERA
			? "camera.pose"
			: "viewport.pose";
	}

	function snapshotCameraPose(camera) {
		if (!camera) {
			return;
		}
		lastPoseSnapshot.px = camera.position.x;
		lastPoseSnapshot.py = camera.position.y;
		lastPoseSnapshot.pz = camera.position.z;
		lastPoseSnapshot.qx = camera.quaternion.x;
		lastPoseSnapshot.qy = camera.quaternion.y;
		lastPoseSnapshot.qz = camera.quaternion.z;
		lastPoseSnapshot.qw = camera.quaternion.w;
		lastPoseSnapshot.isOrtho = Boolean(camera.isOrthographicCamera);
		if (camera.isOrthographicCamera) {
			lastPoseSnapshot.left = camera.left;
			lastPoseSnapshot.right = camera.right;
			lastPoseSnapshot.top = camera.top;
			lastPoseSnapshot.bottom = camera.bottom;
			lastPoseSnapshot.zoom = camera.zoom;
		}
	}

	function hasCameraPoseChanged(camera) {
		if (!camera) {
			return false;
		}
		const s = lastPoseSnapshot;
		const eps = POSE_EPSILON;
		if (
			Math.abs(camera.position.x - s.px) > eps ||
			Math.abs(camera.position.y - s.py) > eps ||
			Math.abs(camera.position.z - s.pz) > eps ||
			Math.abs(camera.quaternion.x - s.qx) > eps ||
			Math.abs(camera.quaternion.y - s.qy) > eps ||
			Math.abs(camera.quaternion.z - s.qz) > eps ||
			Math.abs(camera.quaternion.w - s.qw) > eps
		) {
			return true;
		}
		if (camera.isOrthographicCamera) {
			return (
				Math.abs(camera.left - s.left) > eps ||
				Math.abs(camera.right - s.right) > eps ||
				Math.abs(camera.top - s.top) > eps ||
				Math.abs(camera.bottom - s.bottom) > eps ||
				Math.abs(camera.zoom - s.zoom) > eps
			);
		}
		return s.isOrtho !== Boolean(camera.isOrthographicCamera);
	}

	function hasKeyboardNavigationActivity() {
		if (!fpsMovement.enable) {
			return false;
		}

		return (
			Object.values(fpsMovement.keydown ?? {}).some(Boolean) ||
			Object.values(fpsMovement.keycode ?? {}).some(Boolean)
		);
	}

	function hasPointerNavigationActivity() {
		const EPSILON = 1e-6;
		return (
			Boolean(pointerControls.rotating || pointerControls.sliding) ||
			pointerControls.moveVelocity.lengthSq() > EPSILON ||
			pointerControls.rotateVelocity.lengthSq() > EPSILON ||
			pointerControls.scroll.lengthSq() > EPSILON
		);
	}

	function requestNavigationHistoryCommit() {
		navigationHistory.requestCommit();
	}

	function flushNavigationHistory() {
		navigationHistory.flush();
	}

	return {
		getActiveCameraHistoryTargetKey,
		getActiveCameraHistoryLabel,
		snapshotCameraPose,
		hasCameraPoseChanged,
		hasKeyboardNavigationActivity,
		hasPointerNavigationActivity,
		requestNavigationHistoryCommit,
		flushNavigationHistory,
	};
}
