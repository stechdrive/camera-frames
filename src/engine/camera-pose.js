import * as THREE from "three";

const EPSILON = 1e-8;
const WORLD_UP_CANDIDATES = [
	new THREE.Vector3(0, 1, 0),
	new THREE.Vector3(0, 0, 1),
	new THREE.Vector3(1, 0, 0),
];
const LOCAL_UP_CANDIDATES = [
	new THREE.Vector3(0, 1, 0),
	new THREE.Vector3(0, 0, 1),
	new THREE.Vector3(1, 0, 0),
];

function clampUnit(value) {
	return Math.max(-1, Math.min(1, value));
}

export function normalizeDegrees(value) {
	const numericValue = Number(value);
	if (!Number.isFinite(numericValue)) {
		return 0;
	}
	const wrapped = ((((numericValue + 180) % 360) + 360) % 360) - 180;
	return wrapped === -180 ? 180 : wrapped;
}

function projectDirectionOntoPlane(direction, planeNormal) {
	const projected = direction
		.clone()
		.addScaledVector(planeNormal, -direction.dot(planeNormal));
	if (projected.lengthSq() <= EPSILON) {
		return null;
	}
	return projected.normalize();
}

function resolveReferenceUp(forward, candidates) {
	for (const candidate of candidates) {
		const projected = projectDirectionOntoPlane(candidate, forward);
		if (projected) {
			return projected;
		}
	}
	return new THREE.Vector3(0, 1, 0);
}

function buildBasis(forward, candidates) {
	const normalizedForward = forward.clone().normalize();
	const referenceUp = resolveReferenceUp(normalizedForward, candidates);
	const right = new THREE.Vector3()
		.crossVectors(normalizedForward, referenceUp)
		.normalize();
	const up = new THREE.Vector3()
		.crossVectors(right, normalizedForward)
		.normalize();
	return {
		right,
		up,
		forward: normalizedForward,
	};
}

export function getCenterRayWorldDirectionFromAngles(yawDeg, pitchDeg) {
	const yawRad = (Number(yawDeg) * Math.PI) / 180;
	const pitchRad = (Number(pitchDeg) * Math.PI) / 180;
	const cosPitch = Math.cos(pitchRad);
	return new THREE.Vector3(
		Math.sin(yawRad) * cosPitch,
		Math.sin(pitchRad),
		Math.cos(yawRad) * cosPitch,
	).normalize();
}

export function decomposeCameraPoseAngles({ quaternion, axisLocal }) {
	const normalizedAxisLocal = axisLocal.clone().normalize();
	const worldAxis = normalizedAxisLocal
		.clone()
		.applyQuaternion(quaternion)
		.normalize();
	const yawDeg = normalizeDegrees(
		THREE.MathUtils.radToDeg(Math.atan2(worldAxis.x, worldAxis.z)),
	);
	const pitchDeg = THREE.MathUtils.radToDeg(Math.asin(clampUnit(worldAxis.y)));
	const currentUp = new THREE.Vector3(0, 1, 0)
		.applyQuaternion(quaternion)
		.normalize();
	const projectedCurrentUp = projectDirectionOntoPlane(currentUp, worldAxis);
	if (!projectedCurrentUp) {
		return {
			yawDeg,
			pitchDeg,
			rollDeg: 0,
		};
	}

	const projectedReferenceUp = resolveReferenceUp(
		worldAxis,
		WORLD_UP_CANDIDATES,
	);
	const cross = new THREE.Vector3().crossVectors(
		projectedReferenceUp,
		projectedCurrentUp,
	);
	const dot = THREE.MathUtils.clamp(
		projectedReferenceUp.dot(projectedCurrentUp),
		-1,
		1,
	);
	return {
		yawDeg,
		pitchDeg,
		rollDeg: normalizeDegrees(
			THREE.MathUtils.radToDeg(Math.atan2(worldAxis.dot(cross), dot)),
		),
	};
}

export function composeCameraQuaternionFromPoseAngles({
	axisLocal,
	yawDeg,
	pitchDeg,
	rollDeg,
}) {
	const localBasis = buildBasis(axisLocal, LOCAL_UP_CANDIDATES);
	const worldAxis = getCenterRayWorldDirectionFromAngles(yawDeg, pitchDeg);
	const worldBasis = buildBasis(worldAxis, WORLD_UP_CANDIDATES);
	const localMatrix = new THREE.Matrix4().makeBasis(
		localBasis.right,
		localBasis.up,
		localBasis.forward,
	);
	const worldMatrix = new THREE.Matrix4().makeBasis(
		worldBasis.right,
		worldBasis.up,
		worldBasis.forward,
	);
	const baseRotationMatrix = new THREE.Matrix4().multiplyMatrices(
		worldMatrix,
		localMatrix.clone().invert(),
	);
	const baseQuaternion = new THREE.Quaternion().setFromRotationMatrix(
		baseRotationMatrix,
	);
	const rollQuaternion = new THREE.Quaternion().setFromAxisAngle(
		worldAxis,
		THREE.MathUtils.degToRad(Number(rollDeg) || 0),
	);
	return rollQuaternion.multiply(baseQuaternion).normalize();
}
