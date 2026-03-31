import * as THREE from "three";

export const VIEWPORT_PROJECTION_PERSPECTIVE = "perspective";
export const VIEWPORT_PROJECTION_ORTHOGRAPHIC = "orthographic";

export const VIEWPORT_ORTHO_VIEW_POS_X = "posX";
export const VIEWPORT_ORTHO_VIEW_NEG_X = "negX";
export const VIEWPORT_ORTHO_VIEW_POS_Y = "posY";
export const VIEWPORT_ORTHO_VIEW_NEG_Y = "negY";
export const VIEWPORT_ORTHO_VIEW_POS_Z = "posZ";
export const VIEWPORT_ORTHO_VIEW_NEG_Z = "negZ";

export const DEFAULT_VIEWPORT_ORTHO_VIEW = VIEWPORT_ORTHO_VIEW_POS_Z;
export const DEFAULT_VIEWPORT_ORTHO_SIZE = 3;
export const DEFAULT_VIEWPORT_ORTHO_DISTANCE = 6;
export const DEFAULT_VIEWPORT_ORTHO_FOCUS = Object.freeze({
	x: 0,
	y: 1,
	z: 0,
});

const VIEWPORT_ORTHO_VIEW_DEFINITIONS = Object.freeze({
	[VIEWPORT_ORTHO_VIEW_POS_X]: Object.freeze({
		id: VIEWPORT_ORTHO_VIEW_POS_X,
		axis: "x",
		sign: 1,
		position: Object.freeze([1, 0, 0]),
		up: Object.freeze([0, 1, 0]),
	}),
	[VIEWPORT_ORTHO_VIEW_NEG_X]: Object.freeze({
		id: VIEWPORT_ORTHO_VIEW_NEG_X,
		axis: "x",
		sign: -1,
		position: Object.freeze([-1, 0, 0]),
		up: Object.freeze([0, 1, 0]),
	}),
	[VIEWPORT_ORTHO_VIEW_POS_Y]: Object.freeze({
		id: VIEWPORT_ORTHO_VIEW_POS_Y,
		axis: "y",
		sign: 1,
		position: Object.freeze([0, 1, 0]),
		up: Object.freeze([0, 0, 1]),
	}),
	[VIEWPORT_ORTHO_VIEW_NEG_Y]: Object.freeze({
		id: VIEWPORT_ORTHO_VIEW_NEG_Y,
		axis: "y",
		sign: -1,
		position: Object.freeze([0, -1, 0]),
		up: Object.freeze([0, 0, 1]),
	}),
	[VIEWPORT_ORTHO_VIEW_POS_Z]: Object.freeze({
		id: VIEWPORT_ORTHO_VIEW_POS_Z,
		axis: "z",
		sign: 1,
		position: Object.freeze([0, 0, 1]),
		up: Object.freeze([0, 1, 0]),
	}),
	[VIEWPORT_ORTHO_VIEW_NEG_Z]: Object.freeze({
		id: VIEWPORT_ORTHO_VIEW_NEG_Z,
		axis: "z",
		sign: -1,
		position: Object.freeze([0, 0, -1]),
		up: Object.freeze([0, 1, 0]),
	}),
});

const ORTHO_OPPOSITES = Object.freeze({
	[VIEWPORT_ORTHO_VIEW_POS_X]: VIEWPORT_ORTHO_VIEW_NEG_X,
	[VIEWPORT_ORTHO_VIEW_NEG_X]: VIEWPORT_ORTHO_VIEW_POS_X,
	[VIEWPORT_ORTHO_VIEW_POS_Y]: VIEWPORT_ORTHO_VIEW_NEG_Y,
	[VIEWPORT_ORTHO_VIEW_NEG_Y]: VIEWPORT_ORTHO_VIEW_POS_Y,
	[VIEWPORT_ORTHO_VIEW_POS_Z]: VIEWPORT_ORTHO_VIEW_NEG_Z,
	[VIEWPORT_ORTHO_VIEW_NEG_Z]: VIEWPORT_ORTHO_VIEW_POS_Z,
});

export function createViewportOrthoFocusPoint(value = null) {
	return {
		x: Number.isFinite(value?.x)
			? Number(value.x)
			: DEFAULT_VIEWPORT_ORTHO_FOCUS.x,
		y: Number.isFinite(value?.y)
			? Number(value.y)
			: DEFAULT_VIEWPORT_ORTHO_FOCUS.y,
		z: Number.isFinite(value?.z)
			? Number(value.z)
			: DEFAULT_VIEWPORT_ORTHO_FOCUS.z,
	};
}

export function cloneViewportOrthoState(state = null) {
	return normalizeViewportOrthoState(state);
}

export function normalizeViewportProjectionMode(value) {
	return value === VIEWPORT_PROJECTION_ORTHOGRAPHIC
		? VIEWPORT_PROJECTION_ORTHOGRAPHIC
		: VIEWPORT_PROJECTION_PERSPECTIVE;
}

export function getViewportOrthoViewDefinition(viewId) {
	return (
		VIEWPORT_ORTHO_VIEW_DEFINITIONS[viewId] ??
		VIEWPORT_ORTHO_VIEW_DEFINITIONS[DEFAULT_VIEWPORT_ORTHO_VIEW]
	);
}

export function getViewportOrthoAxisKey(viewId) {
	return getViewportOrthoViewDefinition(viewId).axis;
}

export function getViewportOrthoOppositeView(viewId) {
	return ORTHO_OPPOSITES[viewId] ?? DEFAULT_VIEWPORT_ORTHO_VIEW;
}

export function getViewportOrthoViewForAxis(axisKey, sign = 1) {
	if (axisKey === "x") {
		return sign < 0 ? VIEWPORT_ORTHO_VIEW_NEG_X : VIEWPORT_ORTHO_VIEW_POS_X;
	}
	if (axisKey === "y") {
		return sign < 0 ? VIEWPORT_ORTHO_VIEW_NEG_Y : VIEWPORT_ORTHO_VIEW_POS_Y;
	}
	if (axisKey === "z") {
		return sign < 0 ? VIEWPORT_ORTHO_VIEW_NEG_Z : VIEWPORT_ORTHO_VIEW_POS_Z;
	}
	return DEFAULT_VIEWPORT_ORTHO_VIEW;
}

export function getViewportOrthoPreviewGridPlane(viewId) {
	const axisKey = getViewportOrthoAxisKey(viewId);
	if (axisKey === "x") {
		return "zy";
	}
	if (axisKey === "z") {
		return "xy";
	}
	return null;
}

export function getViewportOrthoSideVector(
	viewId,
	target = new THREE.Vector3(),
) {
	const definition = getViewportOrthoViewDefinition(viewId);
	return target.set(
		definition.position[0],
		definition.position[1],
		definition.position[2],
	);
}

export function getViewportOrthoUpVector(viewId, target = new THREE.Vector3()) {
	const definition = getViewportOrthoViewDefinition(viewId);
	return target.set(definition.up[0], definition.up[1], definition.up[2]);
}

export function normalizeViewportOrthoState(value = null) {
	const focus = createViewportOrthoFocusPoint(value?.focus);
	const size = Number.isFinite(value?.size)
		? Math.max(0.05, Number(value.size))
		: DEFAULT_VIEWPORT_ORTHO_SIZE;
	const distance = Number.isFinite(value?.distance)
		? Math.max(0.05, Number(value.distance))
		: DEFAULT_VIEWPORT_ORTHO_DISTANCE;
	return {
		viewId: getViewportOrthoViewDefinition(value?.viewId).id,
		size,
		distance,
		focus,
	};
}

export function configureViewportOrthographicCamera(
	camera,
	{
		aspect = 1,
		viewId = DEFAULT_VIEWPORT_ORTHO_VIEW,
		size = DEFAULT_VIEWPORT_ORTHO_SIZE,
		distance = DEFAULT_VIEWPORT_ORTHO_DISTANCE,
		focus = DEFAULT_VIEWPORT_ORTHO_FOCUS,
	} = {},
) {
	if (!camera?.isOrthographicCamera) {
		return false;
	}

	const safeAspect = Math.max(Number(aspect) || 1, 1e-6);
	const safeState = normalizeViewportOrthoState({
		viewId,
		size,
		distance,
		focus,
	});
	const focusVector = new THREE.Vector3(
		safeState.focus.x,
		safeState.focus.y,
		safeState.focus.z,
	);
	const sideVector = getViewportOrthoSideVector(
		safeState.viewId,
		new THREE.Vector3(),
	).normalize();
	const upVector = getViewportOrthoUpVector(
		safeState.viewId,
		new THREE.Vector3(),
	).normalize();
	const halfHeight = safeState.size;
	const halfWidth = halfHeight * safeAspect;

	camera.position
		.copy(focusVector)
		.addScaledVector(sideVector, safeState.distance);
	camera.up.copy(upVector);
	camera.left = -halfWidth;
	camera.right = halfWidth;
	camera.top = halfHeight;
	camera.bottom = -halfHeight;
	camera.zoom = 1;
	camera.lookAt(focusVector);
	camera.updateProjectionMatrix();
	camera.updateMatrixWorld(true);
	return true;
}
