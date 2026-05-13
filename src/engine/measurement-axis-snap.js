import * as THREE from "three";
import {
	buildPointerRay,
	getWorldUnitsPerPixel,
	isProjectedPointVisible,
	projectWorldToLocalScreen,
} from "./view-interaction-context.js";

const AXIS_KEYS = ["x", "y", "z"];
const DEFAULT_AXIS_PROJECTION_PIXELS = 80;
const MIN_POINTER_DISTANCE_PIXELS = 4;
const MIN_PROJECTED_AXIS_PIXELS = 8;

export const WORLD_MEASUREMENT_AXES = {
	x: new THREE.Vector3(1, 0, 0),
	y: new THREE.Vector3(0, 1, 0),
	z: new THREE.Vector3(0, 0, 1),
};

const _startScreen = new THREE.Vector3();
const _axisEndScreen = new THREE.Vector3();
const _axisWorldOffset = new THREE.Vector3();
const _pointerDelta = new THREE.Vector2();
const _axisScreenDelta = new THREE.Vector2();
const _pointerNdc = new THREE.Vector2();
const _dragPlane = new THREE.Plane();
const _rayHitPoint = new THREE.Vector3();
const _pointWorld = new THREE.Vector3();

export function getMeasurementAxisPlaneNormal(axisWorld, camera) {
	const cameraDirection = camera
		.getWorldDirection(new THREE.Vector3())
		.normalize();
	const cameraUp = new THREE.Vector3(0, 1, 0)
		.applyQuaternion(camera.getWorldQuaternion(new THREE.Quaternion()))
		.normalize();
	const helper = new THREE.Vector3().crossVectors(axisWorld, cameraDirection);
	if (helper.lengthSq() < 1e-6) {
		helper.crossVectors(axisWorld, cameraUp);
	}
	if (helper.lengthSq() < 1e-6) {
		return null;
	}
	return new THREE.Vector3()
		.crossVectors(helper.normalize(), axisWorld)
		.normalize();
}

function getAxisScreenCandidate({
	axisKey,
	axisWorld,
	startPointWorld,
	context,
	worldDistance,
}) {
	projectWorldToLocalScreen(
		_axisWorldOffset
			.copy(startPointWorld)
			.addScaledVector(axisWorld, worldDistance),
		context,
		_axisEndScreen,
	);
	_axisScreenDelta.set(
		_axisEndScreen.x - _startScreen.x,
		_axisEndScreen.y - _startScreen.y,
	);
	const length = _axisScreenDelta.length();
	if (!Number.isFinite(length) || length < MIN_PROJECTED_AXIS_PIXELS) {
		return null;
	}
	return {
		axisKey,
		axisWorld,
		score: Math.abs(_axisScreenDelta.normalize().dot(_pointerDelta)),
	};
}

export function resolveMeasurementAxisSnap({
	startPointWorld,
	clientX,
	clientY,
	context,
	raycaster = new THREE.Raycaster(),
	pixelDistance = DEFAULT_AXIS_PROJECTION_PIXELS,
} = {}) {
	if (
		!(startPointWorld instanceof THREE.Vector3) ||
		!context?.camera ||
		!context?.shellRect ||
		!context?.pageRect ||
		!Number.isFinite(clientX) ||
		!Number.isFinite(clientY)
	) {
		return null;
	}

	projectWorldToLocalScreen(startPointWorld, context, _startScreen);
	if (!isProjectedPointVisible(_startScreen)) {
		return null;
	}

	_pointerDelta.set(
		clientX - context.shellRect.left - _startScreen.x,
		clientY - context.shellRect.top - _startScreen.y,
	);
	const pointerDistance = _pointerDelta.length();
	if (
		!Number.isFinite(pointerDistance) ||
		pointerDistance < MIN_POINTER_DISTANCE_PIXELS
	) {
		return null;
	}
	_pointerDelta.divideScalar(pointerDistance);

	const worldUnitsPerPixel = getWorldUnitsPerPixel(context, startPointWorld);
	if (!Number.isFinite(worldUnitsPerPixel) || worldUnitsPerPixel <= 0) {
		return null;
	}
	const worldDistance = worldUnitsPerPixel * pixelDistance;

	let bestCandidate = null;
	for (const axisKey of AXIS_KEYS) {
		const axisWorld = WORLD_MEASUREMENT_AXES[axisKey];
		const candidate = getAxisScreenCandidate({
			axisKey,
			axisWorld,
			startPointWorld,
			context,
			worldDistance,
		});
		if (!candidate) {
			continue;
		}
		if (!bestCandidate || candidate.score > bestCandidate.score) {
			bestCandidate = candidate;
		}
	}
	if (!bestCandidate) {
		return null;
	}

	const planeNormal = getMeasurementAxisPlaneNormal(
		bestCandidate.axisWorld,
		context.camera,
	);
	if (!planeNormal) {
		return null;
	}

	buildPointerRay(clientX, clientY, context, raycaster, _pointerNdc);
	_dragPlane.setFromNormalAndCoplanarPoint(planeNormal, startPointWorld);
	const hitPoint = raycaster.ray.intersectPlane(_dragPlane, _rayHitPoint);
	if (!hitPoint) {
		return null;
	}

	const distance = hitPoint
		.clone()
		.sub(startPointWorld)
		.dot(bestCandidate.axisWorld);
	if (!Number.isFinite(distance)) {
		return null;
	}

	return {
		axisKey: bestCandidate.axisKey,
		axisWorld: bestCandidate.axisWorld.clone(),
		distance,
		pointWorld: _pointWorld
			.copy(startPointWorld)
			.addScaledVector(bestCandidate.axisWorld, distance)
			.clone(),
	};
}
