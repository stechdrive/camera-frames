import {
	getPreviewFrustumExtents,
	getTargetFrustumExtents,
	horizontalToVerticalFovDegrees,
} from "../engine/projection.js";

export function createProjectionController({
	state,
	viewportShell,
	viewportCamera,
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

	function syncViewportProjection() {
		applySymmetricProjection(
			viewportCamera,
			Math.max(viewportShell.clientWidth, 1) /
				Math.max(viewportShell.clientHeight, 1),
			state.viewportBaseFovX,
		);
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

	function handleResize() {
		const { width, height } = getViewportSize();
		renderer.setSize(width, height, false);
		handleOutputFrameResize();
	}

	return {
		getProjectionState,
		syncViewportProjection,
		syncShotProjection,
		applyCameraViewProjection,
		syncOutputCamera,
		handleResize,
	};
}
