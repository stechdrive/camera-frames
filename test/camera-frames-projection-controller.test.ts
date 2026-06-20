import assert from "node:assert/strict";
import * as THREE from "three";
import { createProjectionController } from "../src/controllers/projection-controller.js";
import { composeCameraQuaternionFromPoseAngles } from "../src/engine/camera-pose.js";
import {
	getBaseFrustumExtents,
	getFrustumCenterRayDirection,
	getTargetFrustumExtents,
} from "../src/engine/projection.js";

function almostEqual(actual: number, expected: number, message: string) {
	assert.ok(
		Math.abs(actual - expected) < 1e-6,
		`${message}: expected ${expected}, got ${actual}`,
	);
}

const shotCamera = new THREE.PerspectiveCamera();
shotCamera.near = 0.1;
shotCamera.far = 1000;

const shotCameraDocument = {
	lens: {
		baseFovX: 60,
		shiftX: 0.2,
		shiftY: -0.1,
	},
	outputFrame: {
		centerX: 0.62,
		centerY: 0.4,
	},
};
const state = {
	baseFovX: 60,
	outputFrame: {
		widthScale: 1.2,
		heightScale: 0.8,
	},
};
const outputFrameMetrics = {
	viewportWidth: 800,
	viewportHeight: 600,
	boxWidth: 400,
	boxHeight: 300,
	boxLeft: 100,
	boxTop: 50,
};

const controller = createProjectionController({
	state,
	renderer: { setSize() {} },
	getOutputSizeState: () => ({ width: 1754, height: 1240 }),
	getOutputFrameMetrics: () => outputFrameMetrics,
	getViewportSize: () => ({ width: 800, height: 600 }),
	handleOutputFrameResize: () => {},
	syncActiveShotCameraFromDocument: () => {},
	getActiveShotCamera: () => shotCamera,
	getActiveShotCameraDocument: () => shotCameraDocument,
	getActiveCameraViewCamera: () => new THREE.PerspectiveCamera(),
	getActiveOutputCamera: () => new THREE.PerspectiveCamera(),
});

const expectedBaseFrustum = getBaseFrustumExtents({
	near: shotCamera.near,
	horizontalFovDegrees: state.baseFovX,
});
const expectedLayoutFrustum = getTargetFrustumExtents({
	near: shotCamera.near,
	horizontalFovDegrees: state.baseFovX,
	widthScale: state.outputFrame.widthScale,
	heightScale: state.outputFrame.heightScale,
	centerX: shotCameraDocument.outputFrame.centerX,
	centerY: shotCameraDocument.outputFrame.centerY,
});
const projectionState = controller.getProjectionState();

almostEqual(
	projectionState.layoutFrustum.left,
	expectedLayoutFrustum.left,
	"layout frustum should preserve the output-frame projection before shift",
);
almostEqual(
	projectionState.layoutFrustum.top,
	expectedLayoutFrustum.top,
	"layout frustum should preserve the output-frame vertical projection before shift",
);
almostEqual(
	projectionState.targetFrustum.left - projectionState.layoutFrustum.left,
	expectedBaseFrustum.width * shotCameraDocument.lens.shiftX,
	"target frustum should include lens shift X",
);
almostEqual(
	projectionState.targetFrustum.top - projectionState.layoutFrustum.top,
	expectedBaseFrustum.height * shotCameraDocument.lens.shiftY,
	"target frustum should include lens shift Y",
);

const layoutCenterRay = getFrustumCenterRayDirection({
	near: shotCamera.near,
	frustum: expectedLayoutFrustum,
});
const axisLocal = new THREE.Vector3(
	layoutCenterRay.x,
	layoutCenterRay.y,
	layoutCenterRay.z,
).normalize();
shotCamera.quaternion.copy(
	composeCameraQuaternionFromPoseAngles({
		axisLocal,
		yawDeg: -23,
		pitchDeg: 11,
		rollDeg: 18,
	}),
);

const pose = controller.getShotCameraPoseAngles();
almostEqual(pose.yawDeg, -23, "lens shift should not change pose yaw axis");
almostEqual(pose.pitchDeg, 11, "lens shift should not change pose pitch axis");
almostEqual(pose.rollDeg, 18, "lens shift should not change pose roll axis");

console.log("✅ CAMERA_FRAMES projection controller tests passed!");
