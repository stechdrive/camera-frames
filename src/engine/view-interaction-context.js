import * as THREE from "three";

function toFiniteRect(rect) {
	if (!rect || rect.width <= 0 || rect.height <= 0) {
		return null;
	}
	return {
		left: rect.left,
		top: rect.top,
		width: rect.width,
		height: rect.height,
		right: rect.left + rect.width,
		bottom: rect.top + rect.height,
	};
}

function toLocalRect(pageRect, shellRect) {
	return {
		left: pageRect.left - shellRect.left,
		top: pageRect.top - shellRect.top,
		width: pageRect.width,
		height: pageRect.height,
		right: pageRect.left - shellRect.left + pageRect.width,
		bottom: pageRect.top - shellRect.top + pageRect.height,
	};
}

export function resolveActiveViewInteractionContext({
	state,
	viewportShell,
	viewportCanvas,
	workspacePaneCamera,
	getActiveViewportCamera,
	getActiveCameraViewCamera,
	getActiveOutputCamera,
}) {
	const shellRect = toFiniteRect(viewportShell?.getBoundingClientRect?.());
	if (!shellRect) {
		return null;
	}

	const isCameraView = state.mode === workspacePaneCamera;
	const sourceRect = toFiniteRect(viewportCanvas?.getBoundingClientRect?.());
	const camera = isCameraView
		? (getActiveCameraViewCamera?.() ?? getActiveOutputCamera?.() ?? null)
		: (getActiveViewportCamera?.() ?? null);
	if (!sourceRect || !camera) {
		return null;
	}

	return {
		kind: isCameraView ? "camera" : "viewport",
		camera,
		shellRect,
		pageRect: sourceRect,
		localRect: toLocalRect(sourceRect, shellRect),
	};
}

export function isClientPointInsideContext(clientX, clientY, context) {
	if (!context) {
		return false;
	}
	return (
		clientX >= context.pageRect.left &&
		clientX <= context.pageRect.right &&
		clientY >= context.pageRect.top &&
		clientY <= context.pageRect.bottom
	);
}

export function getPointerNdcFromClient(clientX, clientY, context, target) {
	target.set(
		((clientX - context.pageRect.left) / context.pageRect.width) * 2 - 1,
		-(((clientY - context.pageRect.top) / context.pageRect.height) * 2 - 1),
	);
	return target;
}

export function buildPointerRay(
	clientX,
	clientY,
	context,
	raycaster,
	ndcTarget,
) {
	getPointerNdcFromClient(clientX, clientY, context, ndcTarget);
	raycaster.setFromCamera(ndcTarget, context.camera);
	return raycaster.ray;
}

export function projectWorldToLocalScreen(worldPoint, context, target) {
	target.copy(worldPoint).project(context.camera);
	target.x =
		(target.x * 0.5 + 0.5) * context.localRect.width + context.localRect.left;
	target.y =
		(-target.y * 0.5 + 0.5) * context.localRect.height + context.localRect.top;
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

export function getWorldUnitsPerPixel(context, pivotWorld) {
	if (!context?.camera || context.localRect.height <= 0) {
		return null;
	}

	const camera = context.camera;
	if (camera.isOrthographicCamera) {
		const worldHeight = (camera.top - camera.bottom) / camera.zoom;
		return worldHeight / context.localRect.height;
	}

	const distance = camera
		.getWorldPosition(new THREE.Vector3())
		.distanceTo(pivotWorld);
	const verticalFovRadians = THREE.MathUtils.degToRad(camera.fov);
	const worldHeight =
		2 * Math.tan(verticalFovRadians * 0.5) * Math.max(distance, 0.001);
	return worldHeight / context.localRect.height;
}

export function getProjectedAxisDirection({
	axisWorld,
	pivotWorld,
	context,
	pixelDistance,
	target = new THREE.Vector2(),
}) {
	const worldUnitsPerPixel = getWorldUnitsPerPixel(context, pivotWorld);
	if (!Number.isFinite(worldUnitsPerPixel) || worldUnitsPerPixel <= 0) {
		return null;
	}

	const pivotScreen = new THREE.Vector3();
	const endpointScreen = new THREE.Vector3();
	projectWorldToLocalScreen(pivotWorld, context, pivotScreen);
	projectWorldToLocalScreen(
		new THREE.Vector3()
			.copy(pivotWorld)
			.addScaledVector(axisWorld, worldUnitsPerPixel * pixelDistance),
		context,
		endpointScreen,
	);

	target.set(
		endpointScreen.x - pivotScreen.x,
		endpointScreen.y - pivotScreen.y,
	);
	const length = target.length();
	if (length < 1e-4) {
		return null;
	}
	return target.divideScalar(length);
}
