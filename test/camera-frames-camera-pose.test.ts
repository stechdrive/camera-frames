import assert from "node:assert/strict";
import * as THREE from "three";
import {
	composeCameraQuaternionFromPoseAngles,
	decomposeCameraPoseAngles,
} from "../src/engine/camera-pose.js";
import {
	getFrustumCenterRayDirection,
	getTargetFrustumExtents,
} from "../src/engine/projection.js";

function almostEqual(actual, expected, message) {
	assert.ok(
		Math.abs(actual - expected) < 1e-6,
		`${message}: expected ${expected}, got ${actual}`,
	);
}

{
	const axisLocal = new THREE.Vector3(0, 0, -1);
	const quaternion = composeCameraQuaternionFromPoseAngles({
		axisLocal,
		yawDeg: 24,
		pitchDeg: -18,
		rollDeg: 32,
	});
	const pose = decomposeCameraPoseAngles({ quaternion, axisLocal });
	almostEqual(pose.yawDeg, 24, "centered pose should preserve yaw");
	almostEqual(pose.pitchDeg, -18, "centered pose should preserve pitch");
	almostEqual(pose.rollDeg, 32, "centered pose should preserve roll");
}

{
	const frustum = getTargetFrustumExtents({
		near: 0.1,
		horizontalFovDegrees: 60,
		widthScale: 1.2,
		heightScale: 0.85,
		centerX: 0.72,
		centerY: 0.38,
	});
	const centerRay = getFrustumCenterRayDirection({
		near: 0.1,
		frustum,
	});
	const axisLocal = new THREE.Vector3(centerRay.x, centerRay.y, centerRay.z);
	const quaternion = composeCameraQuaternionFromPoseAngles({
		axisLocal,
		yawDeg: -41,
		pitchDeg: 27,
		rollDeg: -14,
	});
	const pose = decomposeCameraPoseAngles({ quaternion, axisLocal });
	almostEqual(pose.yawDeg, -41, "off-axis pose should preserve yaw");
	almostEqual(pose.pitchDeg, 27, "off-axis pose should preserve pitch");
	almostEqual(pose.rollDeg, -14, "off-axis pose should preserve roll");
}

console.log("✅ CAMERA_FRAMES camera pose tests passed!");
