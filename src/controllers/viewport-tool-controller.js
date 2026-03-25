import * as THREE from "three";
import { WORKSPACE_PANE_VIEWPORT } from "../workspace-model.js";

const MOVE_AXIS_HANDLE_NAMES = ["move-x", "move-y", "move-z"];
const MOVE_PLANE_HANDLE_NAMES = ["move-xy", "move-yz", "move-zx"];
const ROTATE_AXIS_HANDLE_NAMES = ["rotate-x", "rotate-y", "rotate-z"];
const AXIS_KEYS = ["x", "y", "z"];
const RING_SCREEN_RADIUS = 94;
const RING_SEGMENT_COUNT = 48;
const PLANE_HANDLE_INNER_OFFSET = 8;
const PLANE_HANDLE_OUTER_OFFSET = 22;
const HANDLE_OFFSETS = {
	move: 82,
	scale: { x: 0, y: -150 },
};

function projectWorldToScreen(worldPoint, camera, viewportRect, target) {
	target.copy(worldPoint).project(camera);
	target.x = (target.x * 0.5 + 0.5) * viewportRect.width;
	target.y = (-target.y * 0.5 + 0.5) * viewportRect.height;
	return target;
}

function isProjectedPointVisible(projectedPoint) {
	return (
		Number.isFinite(projectedPoint.x) &&
		Number.isFinite(projectedPoint.y) &&
		Number.isFinite(projectedPoint.z) &&
		projectedPoint.z >= -1 &&
		projectedPoint.z <= 1
	);
}

function getCameraWorldDirection(camera, target) {
	return camera.getWorldDirection(target).normalize();
}

function getCameraWorldUp(camera, target) {
	return target
		.set(0, 1, 0)
		.applyQuaternion(camera.getWorldQuaternion(new THREE.Quaternion()))
		.normalize();
}

function getNdcFromPointer(event, viewportRect, target) {
	target.set(
		((event.clientX - viewportRect.left) / viewportRect.width) * 2 - 1,
		-(((event.clientY - viewportRect.top) / viewportRect.height) * 2 - 1),
	);
	return target;
}

function createPlaneFromNormalAndPoint(normal, point, targetPlane) {
	return targetPlane.setFromNormalAndCoplanarPoint(
		normal.clone().normalize(),
		point,
	);
}

function getSignedAngleAroundAxis(fromVector, toVector, axis) {
	const cross = new THREE.Vector3().crossVectors(fromVector, toVector);
	return Math.atan2(cross.dot(axis), fromVector.dot(toVector));
}

function getHandleAxisKey(handleName) {
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

function getWorldUnitsPerPixel(camera, pivotWorld, viewportRect) {
	if (!camera || viewportRect.height <= 0) {
		return null;
	}

	if (camera.isOrthographicCamera) {
		const worldHeight = (camera.top - camera.bottom) / camera.zoom;
		return worldHeight / viewportRect.height;
	}

	const distance = camera
		.getWorldPosition(new THREE.Vector3())
		.distanceTo(pivotWorld);
	const verticalFovRadians = THREE.MathUtils.degToRad(camera.fov);
	const worldHeight =
		2 * Math.tan(verticalFovRadians * 0.5) * Math.max(distance, 0.001);
	return worldHeight / viewportRect.height;
}

function buildRotateArcPath({
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

function buildPlaneHandlePath({
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

function getRingFrontAngle({
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

function getProjectedAxisDirection({
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

function scaleLocalPoint(localPoint, scaleVector) {
	return new THREE.Vector3(
		localPoint.x * scaleVector.x,
		localPoint.y * scaleVector.y,
		localPoint.z * scaleVector.z,
	);
}

export function createViewportToolController({
	store,
	state,
	viewportShell,
	viewportGizmo,
	viewportGizmoSvg,
	getActiveCamera,
	assetController,
	beginHistoryTransaction,
	commitHistoryTransaction,
}) {
	const raycaster = new THREE.Raycaster();
	const pointerNdc = new THREE.Vector2();
	const projectedPivot = new THREE.Vector3();
	const worldPosition = new THREE.Vector3();
	const planeIntersection = new THREE.Vector3();
	const tempVector = new THREE.Vector3();
	const tempVector2 = new THREE.Vector3();
	const tempQuaternion = new THREE.Quaternion();
	const plane = new THREE.Plane();
	const handleElements = new Map();
	const ringElements = new Map();
	const planeElements = new Map();
	let activeDrag = null;

	function isPivotEditMode() {
		return store.viewportPivotEditMode.value === true;
	}

	function setHoveredHandle(handleName) {
		if (!viewportGizmo) {
			return;
		}

		if (handleName) {
			viewportGizmo.dataset.hoveredHandle = handleName;
			const axisKey = getHandleAxisKey(handleName);
			if (axisKey) {
				viewportGizmo.dataset.hoveredAxis = axisKey;
			} else {
				delete viewportGizmo.dataset.hoveredAxis;
			}
			return;
		}

		delete viewportGizmo.dataset.hoveredHandle;
		delete viewportGizmo.dataset.hoveredAxis;
	}

	function getHandleElement(handleName) {
		if (!viewportGizmo) {
			return null;
		}

		if (!handleElements.has(handleName)) {
			handleElements.set(
				handleName,
				viewportGizmo.querySelector(`[data-gizmo-handle="${handleName}"]`) ??
					null,
			);
		}

		return handleElements.get(handleName);
	}

	function getRingElement(handleName, segment = "front") {
		if (!viewportGizmoSvg) {
			return null;
		}

		const key = `${handleName}-${segment}`;
		if (!ringElements.has(key)) {
			ringElements.set(
				key,
				viewportGizmoSvg.querySelector(
					`[data-gizmo-ring="${handleName}-${segment}"]`,
				) ?? null,
			);
		}

		return ringElements.get(key);
	}

	function getPlaneElement(handleName) {
		if (!viewportGizmoSvg) {
			return null;
		}

		if (!planeElements.has(handleName)) {
			planeElements.set(
				handleName,
				viewportGizmoSvg.querySelector(`[data-gizmo-plane="${handleName}"]`) ??
					null,
			);
		}

		return planeElements.get(handleName);
	}

	function setHandleVisible(handleName, visible) {
		const element = getHandleElement(handleName);
		if (!element) {
			return;
		}
		element.classList.toggle("is-hidden", !visible);
	}

	function setHandlePosition(handleName, x, y) {
		const element = getHandleElement(handleName);
		if (!element) {
			return;
		}
		element.style.left = `${x}px`;
		element.style.top = `${y}px`;
	}

	function setHandleAngle(handleName, angleDegrees) {
		const element = getHandleElement(handleName);
		if (!element) {
			return;
		}
		element.style.setProperty("--gizmo-angle", `${angleDegrees}deg`);
	}

	function setRingVisible(handleName, segment, visible) {
		const element = getRingElement(handleName, segment);
		if (!element) {
			return;
		}
		element.classList.toggle("is-hidden", !visible);
	}

	function setRingPath(handleName, segment, pathData) {
		const element = getRingElement(handleName, segment);
		if (!element) {
			return;
		}
		element.setAttribute("d", pathData ?? "");
	}

	function setPlaneVisible(handleName, visible) {
		const element = getPlaneElement(handleName);
		if (!element) {
			return;
		}
		element.classList.toggle("is-hidden", !visible);
	}

	function setPlanePath(handleName, pathData) {
		const element = getPlaneElement(handleName);
		if (!element) {
			return;
		}
		element.setAttribute("d", pathData ?? "");
	}

	function hideGizmo() {
		if (!viewportGizmo) {
			return;
		}

		viewportGizmo.classList.add("is-hidden");
	}

	function showGizmo() {
		if (!viewportGizmo) {
			return;
		}

		viewportGizmo.classList.remove("is-hidden");
	}

	function getSelectedTransformAsset() {
		const selectedAssetId = store.selectedSceneAssetId.value;
		return selectedAssetId
			? assetController.getSceneAsset(selectedAssetId)
			: null;
	}

	function getSelectedTransformPivotWorld(asset) {
		return (
			assetController.getAssetWorkingPivotWorld(asset) ??
			asset.object.getWorldPosition(new THREE.Vector3())
		);
	}

	function getTransformBasisWorld(worldQuaternion, transformSpace) {
		if (transformSpace !== "local") {
			return {
				x: new THREE.Vector3(1, 0, 0),
				y: new THREE.Vector3(0, 1, 0),
				z: new THREE.Vector3(0, 0, 1),
			};
		}

		return {
			x: new THREE.Vector3(1, 0, 0)
				.applyQuaternion(worldQuaternion)
				.normalize(),
			y: new THREE.Vector3(0, 1, 0)
				.applyQuaternion(worldQuaternion)
				.normalize(),
			z: new THREE.Vector3(0, 0, 1)
				.applyQuaternion(worldQuaternion)
				.normalize(),
		};
	}

	function getMoveAxisPlaneNormal(axisWorld, camera) {
		const cameraDirection = getCameraWorldDirection(camera, tempVector);
		const cameraUp = getCameraWorldUp(camera, tempVector2);
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

	function getPointerRay(event, camera, viewportRect) {
		getNdcFromPointer(event, viewportRect, pointerNdc);
		raycaster.setFromCamera(pointerNdc, camera);
		return raycaster.ray;
	}

	function beginDragState(handleName, asset, camera, event) {
		const viewportRect = viewportShell.getBoundingClientRect();
		const pointerRay = getPointerRay(event, camera, viewportRect);
		const startWorldPosition = asset.object.getWorldPosition(
			new THREE.Vector3(),
		);
		const startWorldQuaternion = asset.object.getWorldQuaternion(
			new THREE.Quaternion(),
		);
		const startPivotLocal =
			assetController.getAssetWorkingPivotLocal(asset) ??
			new THREE.Vector3(0, 0, 0);
		const startPivotWorld = getSelectedTransformPivotWorld(asset);
		const transformSpace = store.viewportTransformSpace.value;
		const basisWorld = getTransformBasisWorld(
			startWorldQuaternion,
			transformSpace,
		);
		const axisKey = getHandleAxisKey(handleName);

		if (MOVE_AXIS_HANDLE_NAMES.includes(handleName) && axisKey) {
			const axisWorld = basisWorld[axisKey].clone();
			const planeNormal = getMoveAxisPlaneNormal(axisWorld, camera);
			if (!planeNormal) {
				return null;
			}
			createPlaneFromNormalAndPoint(planeNormal, startPivotWorld, plane);
			const startPoint = pointerRay.intersectPlane(plane, new THREE.Vector3());
			if (!startPoint) {
				return null;
			}
			return {
				mode: "move-axis",
				pointerId: event.pointerId,
				assetId: asset.id,
				startWorldPosition,
				startWorldQuaternion,
				startWorldScale: asset.worldScale,
				startObjectScale: asset.object.scale.clone(),
				startPivotLocal: startPivotLocal.clone(),
				startPivotWorld: startPivotWorld.clone(),
				pivotEditMode: isPivotEditMode(),
				axisWorld,
				planeNormal: planeNormal.clone(),
				startPoint: startPoint.clone(),
			};
		}

		if (MOVE_PLANE_HANDLE_NAMES.includes(handleName)) {
			const planeAxes =
				handleName === "move-xy"
					? [basisWorld.x, basisWorld.y]
					: handleName === "move-yz"
						? [basisWorld.y, basisWorld.z]
						: [basisWorld.z, basisWorld.x];
			const planeNormal = new THREE.Vector3()
				.crossVectors(planeAxes[0], planeAxes[1])
				.normalize();
			createPlaneFromNormalAndPoint(planeNormal, startPivotWorld, plane);
			const startPoint = pointerRay.intersectPlane(plane, new THREE.Vector3());
			if (!startPoint) {
				return null;
			}
			return {
				mode: "move-plane",
				pointerId: event.pointerId,
				assetId: asset.id,
				startWorldPosition,
				startWorldQuaternion,
				startWorldScale: asset.worldScale,
				startObjectScale: asset.object.scale.clone(),
				startPivotLocal: startPivotLocal.clone(),
				startPivotWorld: startPivotWorld.clone(),
				pivotEditMode: isPivotEditMode(),
				planeNormal: planeNormal.clone(),
				startPoint: startPoint.clone(),
			};
		}

		if (handleName === "scale-uniform" && !isPivotEditMode()) {
			return {
				mode: "scale-uniform",
				pointerId: event.pointerId,
				assetId: asset.id,
				startWorldPosition,
				startWorldQuaternion,
				startWorldScale: asset.worldScale,
				startObjectScale: asset.object.scale.clone(),
				startPivotLocal: startPivotLocal.clone(),
				startPivotWorld: startPivotWorld.clone(),
				startClientX: event.clientX,
				startClientY: event.clientY,
			};
		}

		if (
			ROTATE_AXIS_HANDLE_NAMES.includes(handleName) &&
			axisKey &&
			!isPivotEditMode()
		) {
			const axisWorld = basisWorld[axisKey].clone();
			createPlaneFromNormalAndPoint(axisWorld, startPivotWorld, plane);
			const startPoint = pointerRay.intersectPlane(plane, new THREE.Vector3());
			if (!startPoint) {
				return null;
			}
			const startVector = startPoint.sub(startPivotWorld).normalize();
			if (startVector.lengthSq() < 1e-6) {
				return null;
			}
			return {
				mode: "rotate",
				pointerId: event.pointerId,
				assetId: asset.id,
				startWorldPosition,
				startWorldQuaternion,
				startWorldScale: asset.worldScale,
				startObjectScale: asset.object.scale.clone(),
				startPivotLocal: startPivotLocal.clone(),
				startPivotWorld: startPivotWorld.clone(),
				axisWorld: axisWorld.clone(),
				startVector: startVector.clone(),
			};
		}

		return null;
	}

	function startViewportTransformDrag(handleName, event) {
		if (state.mode !== WORKSPACE_PANE_VIEWPORT) {
			return false;
		}

		if (
			isPivotEditMode() &&
			!MOVE_AXIS_HANDLE_NAMES.includes(handleName) &&
			!MOVE_PLANE_HANDLE_NAMES.includes(handleName)
		) {
			return false;
		}

		const asset = getSelectedTransformAsset();
		if (!asset || !asset.object.visible) {
			return false;
		}

		const camera = getActiveCamera();
		if (!camera) {
			return false;
		}

		const nextDragState = beginDragState(handleName, asset, camera, event);
		if (!nextDragState) {
			return false;
		}

		event.preventDefault();
		event.stopPropagation();
		beginHistoryTransaction?.(
			nextDragState.pivotEditMode ? "asset.pivot" : "asset.transform",
		);
		activeDrag = nextDragState;
		setHoveredHandle(handleName);
		viewportGizmo?.classList.add("is-dragging");
		return true;
	}

	function applyMoveAxisDrag(dragState, pointerRay) {
		createPlaneFromNormalAndPoint(
			dragState.planeNormal,
			dragState.startPivotWorld,
			plane,
		);
		const hitPoint = pointerRay.intersectPlane(plane, planeIntersection);
		if (!hitPoint) {
			return;
		}

		const projectedDistance = tempVector
			.copy(hitPoint)
			.sub(dragState.startPoint)
			.dot(dragState.axisWorld);
		const nextPivotWorld = tempVector2
			.copy(dragState.startPivotWorld)
			.addScaledVector(dragState.axisWorld, projectedDistance);
		if (dragState.pivotEditMode) {
			assetController.setAssetWorkingPivotWorld(
				dragState.assetId,
				nextPivotWorld,
				{
					historyLabel: "asset.pivot",
				},
			);
			return;
		}

		const nextWorldPosition = tempVector
			.copy(dragState.startWorldPosition)
			.add(nextPivotWorld.clone().sub(dragState.startPivotWorld));
		assetController.setAssetTransform(
			dragState.assetId,
			{
				worldPosition: nextWorldPosition,
			},
			{
				historyLabel: "asset.transform",
			},
		);
	}

	function applyMovePlaneDrag(dragState, pointerRay) {
		createPlaneFromNormalAndPoint(
			dragState.planeNormal,
			dragState.startPivotWorld,
			plane,
		);
		const hitPoint = pointerRay.intersectPlane(plane, planeIntersection);
		if (!hitPoint) {
			return;
		}

		const nextPivotWorld = tempVector2
			.copy(dragState.startPivotWorld)
			.add(tempVector.copy(hitPoint).sub(dragState.startPoint));
		if (dragState.pivotEditMode) {
			assetController.setAssetWorkingPivotWorld(
				dragState.assetId,
				nextPivotWorld,
				{
					historyLabel: "asset.pivot",
				},
			);
			return;
		}

		const nextWorldPosition = tempVector
			.copy(dragState.startWorldPosition)
			.add(nextPivotWorld.clone().sub(dragState.startPivotWorld));
		assetController.setAssetTransform(
			dragState.assetId,
			{
				worldPosition: nextWorldPosition,
			},
			{
				historyLabel: "asset.transform",
			},
		);
	}

	function applyRotateDrag(dragState, pointerRay) {
		createPlaneFromNormalAndPoint(
			dragState.axisWorld,
			dragState.startPivotWorld,
			plane,
		);
		const hitPoint = pointerRay.intersectPlane(plane, planeIntersection);
		if (!hitPoint) {
			return;
		}

		const nextVector = tempVector
			.copy(hitPoint)
			.sub(dragState.startPivotWorld)
			.normalize();
		if (nextVector.lengthSq() < 1e-6) {
			return;
		}

		const angle = getSignedAngleAroundAxis(
			dragState.startVector,
			nextVector,
			dragState.axisWorld,
		);
		const deltaQuaternion = new THREE.Quaternion().setFromAxisAngle(
			dragState.axisWorld,
			angle,
		);
		const nextWorldQuaternion = deltaQuaternion.multiply(
			dragState.startWorldQuaternion.clone(),
		);
		const nextWorldPosition = dragState.startPivotWorld
			.clone()
			.sub(
				scaleLocalPoint(
					dragState.startPivotLocal,
					dragState.startObjectScale,
				).applyQuaternion(nextWorldQuaternion),
			);
		assetController.setAssetTransform(
			dragState.assetId,
			{
				worldPosition: nextWorldPosition,
				worldQuaternion: nextWorldQuaternion,
			},
			{
				historyLabel: "asset.transform",
			},
		);
	}

	function applyUniformScaleDrag(dragState, event) {
		const deltaPixels =
			event.clientX -
			dragState.startClientX -
			(event.clientY - dragState.startClientY);
		const nextWorldScale =
			dragState.startWorldScale * Math.exp(deltaPixels * 0.01);
		const scaleFactor =
			nextWorldScale / Math.max(dragState.startWorldScale, 0.000001);
		const nextObjectScale = dragState.startObjectScale
			.clone()
			.multiplyScalar(scaleFactor);
		const nextWorldPosition = dragState.startPivotWorld
			.clone()
			.sub(
				scaleLocalPoint(
					dragState.startPivotLocal,
					nextObjectScale,
				).applyQuaternion(dragState.startWorldQuaternion),
			);
		assetController.setAssetTransform(
			dragState.assetId,
			{
				worldPosition: nextWorldPosition,
				worldScale: nextWorldScale,
			},
			{
				historyLabel: "asset.transform",
			},
		);
	}

	function handleViewportTransformDragMove(event) {
		if (!activeDrag || event.pointerId !== activeDrag.pointerId) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();
		const camera = getActiveCamera();
		if (!camera) {
			return;
		}
		const viewportRect = viewportShell.getBoundingClientRect();
		const pointerRay = getPointerRay(event, camera, viewportRect);

		switch (activeDrag.mode) {
			case "move-axis":
				applyMoveAxisDrag(activeDrag, pointerRay);
				break;
			case "move-plane":
				applyMovePlaneDrag(activeDrag, pointerRay);
				break;
			case "rotate":
				applyRotateDrag(activeDrag, pointerRay);
				break;
			case "scale-uniform":
				applyUniformScaleDrag(activeDrag, event);
				break;
			default:
				break;
		}
	}

	function handleViewportTransformDragEnd(event) {
		if (!activeDrag || event.pointerId !== activeDrag.pointerId) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();
		const historyLabel = activeDrag.pivotEditMode
			? "asset.pivot"
			: "asset.transform";
		activeDrag = null;
		setHoveredHandle(null);
		viewportGizmo?.classList.remove("is-dragging");
		commitHistoryTransaction?.(historyLabel);
	}

	function setViewportTransformHover(handleName) {
		if (activeDrag) {
			return;
		}
		setHoveredHandle(handleName);
	}

	function setViewportTransformSpace(nextSpace) {
		store.viewportTransformSpace.value =
			nextSpace === "local" ? "local" : "world";
	}

	function setViewportPivotEditMode(nextEnabled) {
		store.viewportPivotEditMode.value = Boolean(nextEnabled);
		setHoveredHandle(null);
	}

	function syncViewportTransformGizmo() {
		if (!viewportGizmo) {
			return;
		}

		const asset = getSelectedTransformAsset();
		if (
			state.mode !== WORKSPACE_PANE_VIEWPORT ||
			!asset ||
			asset.object.visible === false
		) {
			hideGizmo();
			return;
		}

		const camera = getActiveCamera();
		if (!camera) {
			hideGizmo();
			return;
		}

		const viewportRect = viewportShell.getBoundingClientRect();
		const pivotWorld = getSelectedTransformPivotWorld(asset);
		const projected = pivotWorld.clone().project(camera);
		if (!isProjectedPointVisible(projected)) {
			hideGizmo();
			return;
		}

		showGizmo();
		if (viewportGizmoSvg) {
			viewportGizmoSvg.setAttribute(
				"viewBox",
				`0 0 ${Math.max(viewportRect.width, 1)} ${Math.max(viewportRect.height, 1)}`,
			);
		}

		projectWorldToScreen(pivotWorld, camera, viewportRect, projectedPivot);
		viewportGizmo.dataset.pivotMode = isPivotEditMode() ? "true" : "false";
		if (isPivotEditMode()) {
			setHandleVisible("scale-uniform", false);
		} else {
			setHandlePosition(
				"scale-uniform",
				projectedPivot.x + HANDLE_OFFSETS.scale.x,
				projectedPivot.y + HANDLE_OFFSETS.scale.y,
			);
			setHandleVisible("scale-uniform", true);
		}

		const worldQuaternion = asset.object.getWorldQuaternion(
			new THREE.Quaternion(),
		);
		const basisWorld = getTransformBasisWorld(
			worldQuaternion,
			store.viewportTransformSpace.value,
		);
		const screenDirections = {
			x: getProjectedAxisDirection({
				axisWorld: basisWorld.x,
				pivotWorld,
				camera,
				viewportRect,
				pixelDistance: HANDLE_OFFSETS.move,
			}),
			y: getProjectedAxisDirection({
				axisWorld: basisWorld.y,
				pivotWorld,
				camera,
				viewportRect,
				pixelDistance: HANDLE_OFFSETS.move,
			}),
			z: getProjectedAxisDirection({
				axisWorld: basisWorld.z,
				pivotWorld,
				camera,
				viewportRect,
				pixelDistance: HANDLE_OFFSETS.move,
			}),
		};
		const ringBasisMap = {
			x: [basisWorld.y, basisWorld.z],
			y: [basisWorld.z, basisWorld.x],
			z: [basisWorld.x, basisWorld.y],
		};
		const planeBasisMap = {
			"move-xy": [basisWorld.x, basisWorld.y],
			"move-yz": [basisWorld.y, basisWorld.z],
			"move-zx": [basisWorld.z, basisWorld.x],
		};

		for (const axisKey of AXIS_KEYS) {
			const moveHandleName = `move-${axisKey}`;
			const rotateHandleName = `rotate-${axisKey}`;
			const screenDirection = screenDirections[axisKey];
			if (!screenDirection) {
				setHandleVisible(moveHandleName, false);
				setRingVisible(rotateHandleName, "front", false);
				setRingVisible(rotateHandleName, "back", false);
				continue;
			}

			const angleDegrees = THREE.MathUtils.radToDeg(
				Math.atan2(screenDirection.y, screenDirection.x),
			);
			setHandleAngle(moveHandleName, angleDegrees);
			setHandlePosition(
				moveHandleName,
				projectedPivot.x + screenDirection.x * HANDLE_OFFSETS.move,
				projectedPivot.y + screenDirection.y * HANDLE_OFFSETS.move,
			);
			setHandleVisible(moveHandleName, true);

			const tangentU = ringBasisMap[axisKey][0];
			const tangentV = ringBasisMap[axisKey][1];
			const frontAngle = getRingFrontAngle({
				pivotWorld,
				camera,
				axisWorld: basisWorld[axisKey],
				tangentU,
				tangentV,
			});
			const frontPath = buildRotateArcPath({
				pivotWorld,
				camera,
				viewportRect,
				tangentU,
				tangentV,
				startAngle: frontAngle - Math.PI * 0.5,
				endAngle: frontAngle + Math.PI * 0.5,
			});
			const backPath = buildRotateArcPath({
				pivotWorld,
				camera,
				viewportRect,
				tangentU,
				tangentV,
				startAngle: frontAngle + Math.PI * 0.5,
				endAngle: frontAngle + Math.PI * 1.5,
			});
			if (!frontPath || !backPath) {
				setRingVisible(rotateHandleName, "front", false);
				setRingVisible(rotateHandleName, "back", false);
				continue;
			}
			if (isPivotEditMode()) {
				setRingVisible(rotateHandleName, "front", false);
				setRingVisible(rotateHandleName, "back", false);
				continue;
			}
			setRingPath(rotateHandleName, "front", frontPath);
			setRingPath(rotateHandleName, "back", backPath);
			setRingVisible(rotateHandleName, "front", true);
			setRingVisible(rotateHandleName, "back", true);
		}

		for (const handleName of MOVE_PLANE_HANDLE_NAMES) {
			const [axisA, axisB] = planeBasisMap[handleName];
			const pathData = buildPlaneHandlePath({
				pivotWorld,
				camera,
				viewportRect,
				axisA,
				axisB,
			});
			if (!pathData) {
				setPlaneVisible(handleName, false);
				continue;
			}
			setPlanePath(handleName, pathData);
			setPlaneVisible(handleName, true);
		}
	}

	return {
		setViewportTransformSpace,
		setViewportPivotEditMode,
		setViewportTransformHover,
		startViewportTransformDrag,
		handleViewportTransformDragMove,
		handleViewportTransformDragEnd,
		syncViewportTransformGizmo,
	};
}
