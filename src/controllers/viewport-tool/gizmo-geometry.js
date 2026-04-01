import * as THREE from "three";

export const AXIS_KEYS = ["x", "y", "z"];

const RING_SCREEN_RADIUS = 94;
const RING_SEGMENT_COUNT = 48;
const PLANE_HANDLE_INNER_OFFSET = 8;
const PLANE_HANDLE_OUTER_OFFSET = 22;
const CAMERA_SPACE_POINT = new THREE.Vector3();

export function projectWorldToScreen(worldPoint, camera, viewportRect, target) {
	target.copy(worldPoint).project(camera);
	target.x = (target.x * 0.5 + 0.5) * viewportRect.width;
	target.y = (-target.y * 0.5 + 0.5) * viewportRect.height;
	return target;
}

export function isProjectedPointVisible(projectedPoint) {
	return (
		Number.isFinite(projectedPoint.x) &&
		Number.isFinite(projectedPoint.y) &&
		Number.isFinite(projectedPoint.z) &&
		projectedPoint.z >= -1 &&
		projectedPoint.z <= 1
	);
}

export function getCameraWorldDirection(camera, target) {
	return camera.getWorldDirection(target).normalize();
}

export function getCameraWorldUp(camera, target) {
	return target
		.set(0, 1, 0)
		.applyQuaternion(camera.getWorldQuaternion(new THREE.Quaternion()))
		.normalize();
}

export function getNdcFromPointer(event, viewportRect, target) {
	target.set(
		((event.clientX - viewportRect.left) / viewportRect.width) * 2 - 1,
		-(((event.clientY - viewportRect.top) / viewportRect.height) * 2 - 1),
	);
	return target;
}

export function createPlaneFromNormalAndPoint(normal, point, targetPlane) {
	return targetPlane.setFromNormalAndCoplanarPoint(
		normal.clone().normalize(),
		point,
	);
}

export function getSignedAngleAroundAxis(fromVector, toVector, axis) {
	const cross = new THREE.Vector3().crossVectors(fromVector, toVector);
	return Math.atan2(cross.dot(axis), fromVector.dot(toVector));
}

export function getHandleAxisKey(handleName) {
	if (
		handleName === "move-x" ||
		handleName === "move-y" ||
		handleName === "move-z" ||
		handleName === "rotate-x" ||
		handleName === "rotate-y" ||
		handleName === "rotate-z"
	) {
		return AXIS_KEYS.find((axisKey) => handleName.endsWith(axisKey)) ?? null;
	}
	return null;
}

export function getWorldUnitsPerPixel(camera, pivotWorld, viewportRect) {
	if (!camera || viewportRect.height <= 0) {
		return null;
	}

	if (camera.isOrthographicCamera) {
		const worldHeight = (camera.top - camera.bottom) / camera.zoom;
		return worldHeight / viewportRect.height;
	}

	const viewDepth = -CAMERA_SPACE_POINT.copy(pivotWorld).applyMatrix4(
		camera.matrixWorldInverse,
	).z;
	if (
		!Number.isFinite(viewDepth) ||
		viewDepth <= Math.max(camera.near, 0.001)
	) {
		return null;
	}
	const verticalFovRadians = THREE.MathUtils.degToRad(camera.fov);
	const worldHeight = 2 * Math.tan(verticalFovRadians * 0.5) * viewDepth;
	return worldHeight / viewportRect.height;
}

export function buildRotateArcPath({
	pivotWorld,
	camera,
	viewportRect,
	tangentU,
	tangentV,
	startAngle,
	endAngle,
}) {
	const worldUnitsPerPixel = getWorldUnitsPerPixel(
		camera,
		pivotWorld,
		viewportRect,
	);
	if (!Number.isFinite(worldUnitsPerPixel) || worldUnitsPerPixel <= 0) {
		return null;
	}

	if (tangentU.lengthSq() < 1e-6 || tangentV.lengthSq() < 1e-6) {
		return null;
	}

	const radiusWorld = worldUnitsPerPixel * RING_SCREEN_RADIUS;
	const projectedPoint = new THREE.Vector3();
	let pathData = "";

	for (let index = 0; index <= RING_SEGMENT_COUNT / 2; index += 1) {
		const alpha = index / (RING_SEGMENT_COUNT / 2);
		const angle = THREE.MathUtils.lerp(startAngle, endAngle, alpha);
		const worldPoint = new THREE.Vector3()
			.copy(pivotWorld)
			.addScaledVector(tangentU, Math.cos(angle) * radiusWorld)
			.addScaledVector(tangentV, Math.sin(angle) * radiusWorld);
		projectWorldToScreen(worldPoint, camera, viewportRect, projectedPoint);
		if (
			!Number.isFinite(projectedPoint.x) ||
			!Number.isFinite(projectedPoint.y)
		) {
			return null;
		}
		pathData += `${index === 0 ? "M" : "L"} ${projectedPoint.x.toFixed(2)} ${projectedPoint.y.toFixed(2)} `;
	}

	return pathData.trim();
}

export function buildPlaneHandlePath({
	pivotWorld,
	camera,
	viewportRect,
	axisA,
	axisB,
}) {
	const worldUnitsPerPixel = getWorldUnitsPerPixel(
		camera,
		pivotWorld,
		viewportRect,
	);
	if (!Number.isFinite(worldUnitsPerPixel) || worldUnitsPerPixel <= 0) {
		return null;
	}

	const inner = worldUnitsPerPixel * PLANE_HANDLE_INNER_OFFSET;
	const outer = worldUnitsPerPixel * PLANE_HANDLE_OUTER_OFFSET;
	const corners = [
		new THREE.Vector3()
			.copy(pivotWorld)
			.addScaledVector(axisA, inner)
			.addScaledVector(axisB, inner),
		new THREE.Vector3()
			.copy(pivotWorld)
			.addScaledVector(axisA, outer)
			.addScaledVector(axisB, inner),
		new THREE.Vector3()
			.copy(pivotWorld)
			.addScaledVector(axisA, outer)
			.addScaledVector(axisB, outer),
		new THREE.Vector3()
			.copy(pivotWorld)
			.addScaledVector(axisA, inner)
			.addScaledVector(axisB, outer),
	];
	const projectedPoint = new THREE.Vector3();
	let pathData = "";

	for (let index = 0; index < corners.length; index += 1) {
		projectWorldToScreen(corners[index], camera, viewportRect, projectedPoint);
		if (
			!Number.isFinite(projectedPoint.x) ||
			!Number.isFinite(projectedPoint.y)
		) {
			return null;
		}
		pathData += `${index === 0 ? "M" : "L"} ${projectedPoint.x.toFixed(2)} ${projectedPoint.y.toFixed(2)} `;
	}

	return `${pathData}Z`.trim();
}

export function getRingFrontAngle({
	pivotWorld,
	camera,
	axisWorld,
	tangentU,
	tangentV,
}) {
	const cameraOffset = camera
		.getWorldPosition(new THREE.Vector3())
		.sub(pivotWorld);
	const projectedView = cameraOffset.addScaledVector(
		axisWorld,
		-cameraOffset.dot(axisWorld),
	);
	if (projectedView.lengthSq() < 1e-6) {
		return 0;
	}
	projectedView.normalize();
	return Math.atan2(projectedView.dot(tangentV), projectedView.dot(tangentU));
}

export function getProjectedAxisDirection({
	axisWorld,
	pivotWorld,
	camera,
	viewportRect,
	pixelDistance,
}) {
	const worldUnitsPerPixel = getWorldUnitsPerPixel(
		camera,
		pivotWorld,
		viewportRect,
	);
	if (!Number.isFinite(worldUnitsPerPixel) || worldUnitsPerPixel <= 0) {
		return null;
	}

	const pivotScreen = new THREE.Vector3();
	const endpointScreen = new THREE.Vector3();
	projectWorldToScreen(pivotWorld, camera, viewportRect, pivotScreen);
	projectWorldToScreen(
		new THREE.Vector3()
			.copy(pivotWorld)
			.addScaledVector(axisWorld, worldUnitsPerPixel * pixelDistance),
		camera,
		viewportRect,
		endpointScreen,
	);

	const screenDirection = new THREE.Vector2(
		endpointScreen.x - pivotScreen.x,
		endpointScreen.y - pivotScreen.y,
	);
	const length = screenDirection.length();
	if (length < 1e-4) {
		return null;
	}

	return screenDirection.divideScalar(length);
}

export function scaleLocalPoint(localPoint, scaleVector) {
	return new THREE.Vector3(
		localPoint.x * scaleVector.x,
		localPoint.y * scaleVector.y,
		localPoint.z * scaleVector.z,
	);
}
