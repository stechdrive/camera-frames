import * as THREE from "three";
import { DEFAULT_CAMERA_NEAR } from "../constants.js";

const AUTO_NEAR_FACTOR = 0.05;

function distance3(a, b) {
	const dx = Number(a?.x ?? 0) - Number(b?.x ?? 0);
	const dy = Number(a?.y ?? 0) - Number(b?.y ?? 0);
	const dz = Number(a?.z ?? 0) - Number(b?.z ?? 0);
	return Math.hypot(dx, dy, dz);
}

export function getBoundingBoxCorners(box) {
	if (!box?.min || !box?.max) {
		return [];
	}

	const { min, max } = box;
	return [
		{ x: min.x, y: min.y, z: min.z },
		{ x: max.x, y: min.y, z: min.z },
		{ x: min.x, y: max.y, z: min.z },
		{ x: max.x, y: max.y, z: min.z },
		{ x: min.x, y: min.y, z: max.z },
		{ x: max.x, y: min.y, z: max.z },
		{ x: min.x, y: max.y, z: max.z },
		{ x: max.x, y: max.y, z: max.z },
	];
}

export function getCameraSpaceDepthRange(box, camera) {
	if (!box?.clone || !camera?.matrixWorld || !camera?.matrixWorldInverse) {
		return null;
	}

	camera.updateMatrixWorld?.(true);
	camera.matrixWorldInverse.copy(camera.matrixWorld).invert();

	const cameraSpaceBox = box.clone().applyMatrix4(camera.matrixWorldInverse);
	const nearestDepth =
		cameraSpaceBox.max.z < 0 ? Math.max(0, -cameraSpaceBox.max.z) : null;
	const farthestDepth =
		cameraSpaceBox.min.z < 0 ? Math.max(0, -cameraSpaceBox.min.z) : null;

	if (nearestDepth == null && farthestDepth == null) {
		return null;
	}

	return {
		nearestDepth,
		farthestDepth,
	};
}

export function getAutoClipRangeFromBounds({
	box,
	framingBox = null,
	camera = null,
	cameraPosition,
	framingRadius,
	defaultNear = DEFAULT_CAMERA_NEAR,
	minFar = 60,
	farPaddingFactor = 1.15,
}) {
	const safeRadius = Math.max(Number(framingRadius) || 0, 0.6);
	const defaultAutoNear = Math.max(safeRadius / 200, defaultNear);
	const corners = getBoundingBoxCorners(box);

	if (corners.length === 0) {
		return {
			near: defaultAutoNear,
			far: Math.max(safeRadius * 40, minFar),
		};
	}

	const depthRange = getCameraSpaceDepthRange(box, camera);
	const center = {
		x: (Number(box.min.x) + Number(box.max.x)) * 0.5,
		y: (Number(box.min.y) + Number(box.max.y)) * 0.5,
		z: (Number(box.min.z) + Number(box.max.z)) * 0.5,
	};
	const framingDepthRange = getCameraSpaceDepthRange(framingBox ?? box, camera);
	const farthestCornerDistance = corners.reduce((maxDistance, corner) => {
		return Math.max(maxDistance, distance3(cameraPosition, corner));
	}, 0);
	const centerDistance = distance3(cameraPosition, center);
	const fallbackFar = Math.max(
		centerDistance + safeRadius * 2.5,
		safeRadius * 40,
		minFar,
	);
	const farFromDepth = depthRange?.farthestDepth
		? depthRange.farthestDepth * farPaddingFactor
		: 0;
	const far = Math.max(
		farFromDepth,
		farthestCornerDistance * farPaddingFactor,
		fallbackFar,
	);
	const nearestFramingDepth = framingDepthRange?.nearestDepth ?? 0;
	const nearFloorFromFramingRadius = safeRadius / 150;
	const nearFloorFromFar = far / 20000;
	const nearUpperBound =
		nearestFramingDepth > 0
			? Math.max(defaultNear, nearestFramingDepth * 0.5)
			: Number.POSITIVE_INFINITY;
	const near = Math.min(
		nearUpperBound,
		Math.max(
			defaultAutoNear,
			nearestFramingDepth * AUTO_NEAR_FACTOR,
			nearFloorFromFramingRadius,
			nearFloorFromFar,
		),
	);

	return {
		near,
		far,
	};
}
