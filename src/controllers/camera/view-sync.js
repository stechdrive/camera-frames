import * as THREE from "three";
import { WORKSPACE_PANE_CAMERA, WORKSPACE_PANE_VIEWPORT } from "../../workspace-model.js";

export function createCameraViewSyncController({
	state,
	viewportCamera,
	runHistoryAction,
	updateUi,
	setStatus,
	t,
	getActiveShotCamera,
	getViewportCameraForShotCopy = () => viewportCamera,
	getViewportPerspectiveCamera = () => viewportCamera,
	prepareViewportPerspectiveMode = () => false,
	resetViewportView = () => false,
	placeCameraAtHome,
	copyPose,
	syncControlsToMode,
	clearControlMomentum,
	syncActiveShotCameraDocumentFromLiveCamera,
	syncActiveShotCameraFromDocument,
}) {
	function copyViewportToShotCamera() {
		const shotCamera = getActiveShotCamera();
		runHistoryAction?.("camera.copy-viewport", () => {
			copyPose(
				getViewportCameraForShotCopy?.() ?? viewportCamera,
				shotCamera,
			);
			state.baseFovX = state.viewportBaseFovX;
			syncActiveShotCameraDocumentFromLiveCamera({
				includeLens: true,
				baseFovX: state.viewportBaseFovX,
			});
			if (state.mode === WORKSPACE_PANE_CAMERA) {
				syncControlsToMode();
			} else {
				clearControlMomentum();
			}
			updateUi();
		});
		setStatus(t("status.copiedViewportToShot"));
	}

	function copyShotCameraToViewport() {
		const shotCamera = getActiveShotCamera();
		runHistoryAction?.("viewport.copy-shot", () => {
			prepareViewportPerspectiveMode?.();
			const targetViewportCamera =
				getViewportPerspectiveCamera?.() ?? viewportCamera;
			const forward = shotCamera
				.getWorldDirection(new THREE.Vector3())
				.normalize();
			const target = shotCamera.position.clone().add(forward);
			targetViewportCamera.position.copy(shotCamera.position);
			targetViewportCamera.up.set(0, 1, 0);
			targetViewportCamera.lookAt(target);
			targetViewportCamera.updateMatrixWorld();
			if (state.mode === WORKSPACE_PANE_VIEWPORT) {
				syncControlsToMode();
			} else {
				clearControlMomentum();
			}
			updateUi();
		});
		setStatus(t("status.copiedShotToViewport"));
	}

	function resetActiveView() {
		runHistoryAction?.("camera.reset-view", () => {
			if (state.mode === WORKSPACE_PANE_CAMERA) {
				const shotCamera = getActiveShotCamera();
				placeCameraAtHome(shotCamera, "camera");
				syncActiveShotCameraDocumentFromLiveCamera();
				syncActiveShotCameraFromDocument();
				setStatus(t("status.resetCamera"));
			} else {
				if (!resetViewportView?.()) {
					placeCameraAtHome(viewportCamera, "viewport");
				}
				setStatus(t("status.resetViewport"));
			}
			syncControlsToMode();
			updateUi();
		});
	}

	return {
		copyViewportToShotCamera,
		copyShotCameraToViewport,
		resetActiveView,
	};
}
