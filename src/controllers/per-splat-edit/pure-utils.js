import * as THREE from "three";

export const WORLD_AXES = {
	x: new THREE.Vector3(1, 0, 0),
	y: new THREE.Vector3(0, 1, 0),
	z: new THREE.Vector3(0, 0, 1),
};

export const MOVE_AXIS_HANDLE_NAMES = ["move-x", "move-y", "move-z"];
export const MOVE_PLANE_HANDLE_NAMES = ["move-xy", "move-yz", "move-zx"];
export const ROTATE_AXIS_HANDLE_NAMES = ["rotate-x", "rotate-y", "rotate-z"];
export const SPLAT_SCALE_HANDLE_NAME = "scale-uniform";
export const MIN_BOX_AXIS_SIZE = 0.01;
export const MIN_BRUSH_SIZE_PX = 4;
export const MAX_BRUSH_SIZE_PX = 400;
export const MIN_BRUSH_DEPTH = 0.01;
export const DEFAULT_BOX_SIZE = 1;
export const DEFAULT_BRUSH_SIZE_PX = 30;
export const DEFAULT_BRUSH_DEPTH = 0.2;
export const DERIVED_SPLAT_FILE_EXTENSION = "rawsplat";
export const MIN_BRUSH_INDEX_SPLAT_COUNT = 256;
export const MIN_BRUSH_GRID_CELL_SIZE = 0.05;
export const MAX_BRUSH_GRID_CELL_SIZE = 4;
export const MAX_BRUSH_GRID_QUERY_CELLS = 4096;

export function toPlainPoint(vector) {
	return {
		x: vector.x,
		y: vector.y,
		z: vector.z,
	};
}

export function toPlainQuaternion(quaternion) {
	return {
		x: quaternion.x,
		y: quaternion.y,
		z: quaternion.z,
		w: quaternion.w,
	};
}

export function toVector3(point, fallback = 0) {
	return new THREE.Vector3(
		Number(point?.x ?? fallback),
		Number(point?.y ?? fallback),
		Number(point?.z ?? fallback),
	);
}

export function toQuaternion(value) {
	const quaternion = new THREE.Quaternion(
		Number(value?.x ?? 0),
		Number(value?.y ?? 0),
		Number(value?.z ?? 0),
		Number(value?.w ?? 1),
	);
	if (quaternion.lengthSq() < 1e-8) {
		quaternion.identity();
	} else {
		quaternion.normalize();
	}
	return quaternion;
}

export function clampBoxAxisSize(value) {
	return Math.max(MIN_BOX_AXIS_SIZE, Number(value) || DEFAULT_BOX_SIZE);
}

export function clampBrushSizePx(value) {
	return Math.min(
		MAX_BRUSH_SIZE_PX,
		Math.max(MIN_BRUSH_SIZE_PX, Number(value) || DEFAULT_BRUSH_SIZE_PX),
	);
}

export function clampBrushDepth(value) {
	return Math.max(MIN_BRUSH_DEPTH, Number(value) || DEFAULT_BRUSH_DEPTH);
}

export function clonePackedExtra(extra = null) {
	if (!extra || typeof extra !== "object") {
		return {};
	}

	const nextExtra = {};
	for (const key of ["sh1", "sh2", "sh3", "lodTree"]) {
		const value = extra[key];
		if (value instanceof Uint32Array) {
			nextExtra[key] = new Uint32Array(value);
		}
	}
	if (extra.radMeta && typeof extra.radMeta === "object") {
		nextExtra.radMeta = JSON.parse(JSON.stringify(extra.radMeta));
	}
	return nextExtra;
}

export function sanitizeFileStem(value, fallback = "splat-edit") {
	const normalized = String(value ?? "")
		.trim()
		.replace(/[\\/:*?"<>|]+/g, "-")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
	return normalized || fallback;
}

export function buildAxisPlaneNormal(axisWorld, camera, helperA, helperB) {
	const cameraDirection = helperA
		.set(0, 0, -1)
		.applyQuaternion(camera.quaternion);
	const cameraUp = helperB.set(0, 1, 0).applyQuaternion(camera.quaternion);
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

export function updatePointerRay(
	raycaster,
	pointerNdc,
	event,
	camera,
	viewportRect,
) {
	pointerNdc.set(
		((event.clientX - viewportRect.left) / viewportRect.width) * 2 - 1,
		-((event.clientY - viewportRect.top) / viewportRect.height) * 2 + 1,
	);
	raycaster.setFromCamera(pointerNdc, camera);
	return raycaster.ray;
}

export function resolveElementRect(target) {
	const element = target?.current ?? target ?? null;
	if (typeof element?.getBoundingClientRect !== "function") {
		return null;
	}
	const rect = element.getBoundingClientRect();
	if (!rect || rect.width <= 0 || rect.height <= 0) {
		return null;
	}
	return rect;
}
