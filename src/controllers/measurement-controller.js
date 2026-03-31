import * as THREE from "three";
import {
	buildPointerRay,
	getProjectedAxisDirection,
	isClientPointInsideContext,
	isProjectedPointVisible,
	projectWorldToLocalScreen,
	resolveActiveViewInteractionContext,
} from "../engine/view-interaction-context.js";

const AXIS_PIXEL_DISTANCE = 82;
const DRAG_DISTANCE_EPSILON = 1e-5;
const WORLD_AXES = {
	x: new THREE.Vector3(1, 0, 0),
	y: new THREE.Vector3(0, 1, 0),
	z: new THREE.Vector3(0, 0, 1),
};

const EMPTY_OVERLAY = {
	contextKind: "viewport",
	start: { visible: false, x: 0, y: 0 },
	end: { visible: false, x: 0, y: 0 },
	draftEnd: { visible: false, x: 0, y: 0 },
	lineVisible: false,
	lineUsesDraft: false,
	chip: { visible: false, x: 0, y: 0, label: "" },
	gizmo: {
		visible: false,
		pointKey: null,
		x: 0,
		y: 0,
		handles: {
			x: { visible: false, x: 0, y: 0 },
			y: { visible: false, x: 0, y: 0 },
			z: { visible: false, x: 0, y: 0 },
		},
	},
};

function toPlainPoint(vector) {
	return vector
		? {
				x: Number(vector.x) || 0,
				y: Number(vector.y) || 0,
				z: Number(vector.z) || 0,
			}
		: null;
}

function toVector3(value) {
	if (!value || typeof value !== "object") {
		return null;
	}
	const x = Number(value.x);
	const y = Number(value.y);
	const z = Number(value.z);
	if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) {
		return null;
	}
	return new THREE.Vector3(x, y, z);
}

function formatMeasurementLength(value) {
	if (!Number.isFinite(value) || value <= 0) {
		return "";
	}
	return value.toFixed(value >= 10 ? 2 : 3).replace(/\.?0+$/u, "");
}

function getMoveAxisPlaneNormal(axisWorld, camera) {
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

function createPlaneFromNormalAndPoint(normal, point, targetPlane) {
	return targetPlane.setFromNormalAndCoplanarPoint(
		normal.clone().normalize(),
		point,
	);
}

function buildOverlayPointState(worldPoint, context, projectTarget) {
	if (!worldPoint) {
		return { visible: false, x: 0, y: 0, z: 0 };
	}
	const projected = projectWorldToLocalScreen(
		worldPoint,
		context,
		projectTarget,
	);
	return isProjectedPointVisible(projected)
		? {
				visible: true,
				x: projected.x,
				y: projected.y,
				z: projected.z,
			}
		: { visible: false, x: projected.x, y: projected.y, z: projected.z };
}

function overlayEntryEquals(a, b, epsilon = 0.25) {
	if (a?.visible !== b?.visible) {
		return false;
	}
	if (!a?.visible && !b?.visible) {
		return true;
	}
	return (
		Math.abs((a?.x ?? 0) - (b?.x ?? 0)) <= epsilon &&
		Math.abs((a?.y ?? 0) - (b?.y ?? 0)) <= epsilon
	);
}

function overlayStateEquals(a, b) {
	if (!a || !b) {
		return false;
	}
	return (
		a.contextKind === b.contextKind &&
		overlayEntryEquals(a.start, b.start) &&
		overlayEntryEquals(a.end, b.end) &&
		overlayEntryEquals(a.draftEnd, b.draftEnd) &&
		a.lineVisible === b.lineVisible &&
		a.lineUsesDraft === b.lineUsesDraft &&
		overlayEntryEquals(a.chip, b.chip) &&
		a.chip.label === b.chip.label &&
		a.gizmo.visible === b.gizmo.visible &&
		a.gizmo.pointKey === b.gizmo.pointKey &&
		overlayEntryEquals(a.gizmo, b.gizmo) &&
		overlayEntryEquals(a.gizmo.handles?.x, b.gizmo.handles?.x) &&
		overlayEntryEquals(a.gizmo.handles?.y, b.gizmo.handles?.y) &&
		overlayEntryEquals(a.gizmo.handles?.z, b.gizmo.handles?.z)
	);
}

export function createMeasurementController({
	store,
	state,
	viewportShell,
	viewportCanvas,
	renderBox,
	workspacePaneCamera,
	getActiveViewportCamera,
	getActiveOutputCamera,
	assetController,
	setStatus,
	t,
}) {
	const raycaster = new THREE.Raycaster();
	const pointerNdc = new THREE.Vector2();
	const dragPlane = new THREE.Plane();
	const dragHitPoint = new THREE.Vector3();
	const dragDelta = new THREE.Vector3();
	const projectedPoint = new THREE.Vector3();
	let activeAxisDrag = null;

	function getStartPointWorld() {
		return toVector3(store.measurement.startPointWorld.value);
	}

	function getEndPointWorld() {
		return toVector3(store.measurement.endPointWorld.value);
	}

	function getDraftEndPointWorld() {
		return toVector3(store.measurement.draftEndPointWorld.value);
	}

	function setStartPointWorld(nextPoint) {
		store.measurement.startPointWorld.value = toPlainPoint(nextPoint);
	}

	function setEndPointWorld(nextPoint) {
		store.measurement.endPointWorld.value = toPlainPoint(nextPoint);
	}

	function setDraftEndPointWorld(nextPoint) {
		store.measurement.draftEndPointWorld.value = toPlainPoint(nextPoint);
	}

	function getSelectedPointKey() {
		return store.measurement.selectedPointKey.value ?? null;
	}

	function setSelectedPointKey(nextKey) {
		store.measurement.selectedPointKey.value =
			nextKey === "start" || nextKey === "end" ? nextKey : null;
	}

	function updateLengthInputFromCurrentLine() {
		const startPoint = getStartPointWorld();
		const endPoint = getEndPointWorld();
		if (!startPoint || !endPoint) {
			store.measurement.lengthInputText.value = "";
			return;
		}
		store.measurement.lengthInputText.value = formatMeasurementLength(
			startPoint.distanceTo(endPoint),
		);
	}

	function clearOverlay() {
		store.measurement.overlay.value = EMPTY_OVERLAY;
	}

	function clearMeasurementSession({ keepActive = false } = {}) {
		activeAxisDrag = null;
		store.measurement.active.value = Boolean(keepActive);
		store.measurement.startPointWorld.value = null;
		store.measurement.endPointWorld.value = null;
		store.measurement.draftEndPointWorld.value = null;
		store.measurement.selectedPointKey.value = null;
		store.measurement.lengthInputText.value = "";
		clearOverlay();
	}

	function isMeasurementModeActive() {
		return store.measurement.active.value === true;
	}

	function setMeasurementMode(nextEnabled, { silent = false } = {}) {
		const nextActive = nextEnabled === true;
		if (nextActive) {
			clearMeasurementSession({ keepActive: true });
			store.viewportToolMode.value = "none";
			if (!silent) {
				setStatus?.(t("status.measurementEnabled"));
			}
			return true;
		}

		if (
			!isMeasurementModeActive() &&
			!getStartPointWorld() &&
			!getEndPointWorld() &&
			!getDraftEndPointWorld()
		) {
			return false;
		}
		clearMeasurementSession({ keepActive: false });
		if (!silent) {
			setStatus?.(t("status.measurementDisabled"));
		}
		return true;
	}

	function toggleMeasurementMode() {
		return setMeasurementMode(!isMeasurementModeActive());
	}

	function resolveInteractionContext() {
		return resolveActiveViewInteractionContext({
			state,
			viewportShell,
			viewportCanvas,
			renderBox,
			workspacePaneCamera,
			getActiveViewportCamera,
			getActiveOutputCamera,
		});
	}

	function pickScenePoint(event, context) {
		const targets = assetController.getSceneRaycastTargets?.() ?? [];
		if (targets.length === 0) {
			return null;
		}

		buildPointerRay(
			event.clientX,
			event.clientY,
			context,
			raycaster,
			pointerNdc,
		);
		const intersections = raycaster.intersectObjects(targets, true);
		for (const intersection of intersections) {
			const asset = assetController.getSceneAssetForObject?.(
				intersection.object,
			);
			if (!asset) {
				continue;
			}
			return intersection.point.clone();
		}
		return null;
	}

	function commitMeasurementEndPoint(nextPoint) {
		setEndPointWorld(nextPoint);
		setDraftEndPointWorld(null);
		setSelectedPointKey("end");
		updateLengthInputFromCurrentLine();
	}

	function handleMeasurementPointerDown(event) {
		if (!isMeasurementModeActive() || event.button !== 0) {
			return false;
		}

		const target = event.target instanceof Element ? event.target : null;
		if (
			target?.closest(
				".measurement-overlay__point, .measurement-overlay__chip, .measurement-overlay__gizmo-handle",
			)
		) {
			return false;
		}

		const context = resolveInteractionContext();
		if (
			!context ||
			!isClientPointInsideContext(event.clientX, event.clientY, context)
		) {
			return false;
		}

		event.preventDefault();
		event.stopPropagation();
		event.stopImmediatePropagation?.();

		const startPoint = getStartPointWorld();
		const endPoint = getEndPointWorld();
		if (!startPoint) {
			const hitPoint = pickScenePoint(event, context);
			if (!hitPoint) {
				return true;
			}
			setStartPointWorld(hitPoint);
			setEndPointWorld(null);
			setDraftEndPointWorld(null);
			setSelectedPointKey("start");
			store.measurement.lengthInputText.value = "";
			return true;
		}

		if (!endPoint) {
			const hitPoint = pickScenePoint(event, context);
			if (!hitPoint) {
				return true;
			}
			commitMeasurementEndPoint(hitPoint);
			return true;
		}

		return true;
	}

	function handleMeasurementHoverMove(event) {
		if (!isMeasurementModeActive() || activeAxisDrag) {
			return;
		}

		const startPoint = getStartPointWorld();
		if (!startPoint || getEndPointWorld()) {
			return;
		}

		const context = resolveInteractionContext();
		if (
			!context ||
			!isClientPointInsideContext(event.clientX, event.clientY, context)
		) {
			setDraftEndPointWorld(null);
			return;
		}

		const hitPoint = pickScenePoint(event, context);
		setDraftEndPointWorld(hitPoint);
	}

	function selectMeasurementPoint(pointKey, event = null) {
		if (!isMeasurementModeActive()) {
			return false;
		}
		event?.preventDefault?.();
		event?.stopPropagation?.();
		event?.stopImmediatePropagation?.();
		setSelectedPointKey(pointKey);
		return true;
	}

	function startMeasurementAxisDrag(axisKey, event) {
		if (!isMeasurementModeActive() || event.button !== 0) {
			return false;
		}

		const axisWorld = WORLD_AXES[axisKey]?.clone();
		if (!axisWorld) {
			return false;
		}

		const context = resolveInteractionContext();
		if (!context) {
			return false;
		}

		const startPoint = getStartPointWorld();
		const endPoint = getEndPointWorld();
		if (!startPoint) {
			return false;
		}

		const pointKey = endPoint ? getSelectedPointKey() || "end" : "start";
		const anchorWorld = pointKey === "end" && endPoint ? endPoint : startPoint;
		const planeNormal = getMoveAxisPlaneNormal(axisWorld, context.camera);
		if (!planeNormal) {
			return false;
		}

		buildPointerRay(
			event.clientX,
			event.clientY,
			context,
			raycaster,
			pointerNdc,
		);
		createPlaneFromNormalAndPoint(planeNormal, anchorWorld, dragPlane);
		const planePoint = raycaster.ray.intersectPlane(
			dragPlane,
			new THREE.Vector3(),
		);
		if (!planePoint) {
			return false;
		}

		event.preventDefault();
		event.stopPropagation();
		event.stopImmediatePropagation?.();
		activeAxisDrag = {
			pointerId: event.pointerId,
			axisKey,
			axisWorld,
			planeNormal: planeNormal.clone(),
			anchorWorld: anchorWorld.clone(),
			planePoint: planePoint.clone(),
			mode: endPoint ? "move-point-axis" : "create-end-axis",
			pointKey,
		};
		return true;
	}

	function handleMeasurementAxisDragMove(event) {
		if (
			!activeAxisDrag ||
			event.pointerId !== activeAxisDrag.pointerId ||
			!isMeasurementModeActive()
		) {
			return;
		}

		const context = resolveInteractionContext();
		if (!context) {
			return;
		}

		buildPointerRay(
			event.clientX,
			event.clientY,
			context,
			raycaster,
			pointerNdc,
		);
		createPlaneFromNormalAndPoint(
			activeAxisDrag.planeNormal,
			activeAxisDrag.anchorWorld,
			dragPlane,
		);
		const hitPoint = raycaster.ray.intersectPlane(dragPlane, dragHitPoint);
		if (!hitPoint) {
			return;
		}

		const projectedDistance = dragDelta
			.copy(hitPoint)
			.sub(activeAxisDrag.planePoint)
			.dot(activeAxisDrag.axisWorld);
		const nextPoint = activeAxisDrag.anchorWorld
			.clone()
			.addScaledVector(activeAxisDrag.axisWorld, projectedDistance);

		if (activeAxisDrag.mode === "create-end-axis") {
			setDraftEndPointWorld(nextPoint);
			return;
		}

		if (activeAxisDrag.pointKey === "start") {
			setStartPointWorld(nextPoint);
		} else {
			setEndPointWorld(nextPoint);
		}
		updateLengthInputFromCurrentLine();
	}

	function handleMeasurementAxisDragEnd(event) {
		if (
			!activeAxisDrag ||
			event.pointerId !== activeAxisDrag.pointerId ||
			!isMeasurementModeActive()
		) {
			return false;
		}

		if (activeAxisDrag.mode === "create-end-axis") {
			const startPoint = getStartPointWorld();
			const draftEnd = getDraftEndPointWorld();
			if (
				startPoint &&
				draftEnd &&
				startPoint.distanceTo(draftEnd) > DRAG_DISTANCE_EPSILON
			) {
				commitMeasurementEndPoint(draftEnd);
			} else {
				setDraftEndPointWorld(null);
			}
		}

		activeAxisDrag = null;
		return true;
	}

	function deleteSelectedMeasurement() {
		if (!isMeasurementModeActive() || !getSelectedPointKey()) {
			return false;
		}
		clearMeasurementSession({ keepActive: true });
		return true;
	}

	function setMeasurementLengthInputText(nextValue) {
		store.measurement.lengthInputText.value = String(nextValue ?? "");
	}

	function applyMeasurementScale() {
		const startPoint = getStartPointWorld();
		const endPoint = getEndPointWorld();
		if (!startPoint || !endPoint) {
			return false;
		}

		const measuredLength = startPoint.distanceTo(endPoint);
		const desiredLength = Number(store.measurement.lengthInputText.value);
		if (
			!Number.isFinite(measuredLength) ||
			measuredLength <= DRAG_DISTANCE_EPSILON ||
			!Number.isFinite(desiredLength) ||
			desiredLength <= 0 ||
			(store.selectedSceneAssetIds.value?.length ?? 0) === 0
		) {
			return false;
		}

		const scaleFactor = desiredLength / measuredLength;
		if (
			!Number.isFinite(scaleFactor) ||
			scaleFactor <= 0 ||
			Math.abs(scaleFactor - 1) <= 1e-8
		) {
			return false;
		}
		assetController.scaleSelectedSceneAssetsByFactor?.(scaleFactor);
		setStatus?.(
			t("status.measurementScaleApplied", {
				scale: formatMeasurementLength(scaleFactor),
			}),
		);
		return true;
	}

	function syncMeasurementOverlay() {
		if (!isMeasurementModeActive()) {
			if (!overlayStateEquals(store.measurement.overlay.value, EMPTY_OVERLAY)) {
				clearOverlay();
			}
			return;
		}

		const context = resolveInteractionContext();
		const startPoint = getStartPointWorld();
		if (!context || !startPoint) {
			if (!overlayStateEquals(store.measurement.overlay.value, EMPTY_OVERLAY)) {
				clearOverlay();
			}
			return;
		}

		const endPoint = getEndPointWorld();
		const draftEnd = endPoint ? null : getDraftEndPointWorld();
		const startScreen = buildOverlayPointState(
			startPoint,
			context,
			projectedPoint.clone(),
		);
		const endScreen = buildOverlayPointState(
			endPoint,
			context,
			projectedPoint.clone(),
		);
		const draftEndScreen = buildOverlayPointState(
			draftEnd,
			context,
			projectedPoint.clone(),
		);
		const lineTarget = endPoint ?? draftEnd;
		const lineTargetScreen = endPoint ? endScreen : draftEndScreen;
		const lineVisible = startScreen.visible && lineTargetScreen.visible;
		const selectedPointKey = endPoint
			? getSelectedPointKey() || "end"
			: "start";
		const gizmoWorld =
			selectedPointKey === "end" && endPoint ? endPoint : startPoint;
		const gizmoScreen = buildOverlayPointState(
			gizmoWorld,
			context,
			projectedPoint.clone(),
		);
		const gizmoHandles = {};
		for (const axisKey of ["x", "y", "z"]) {
			const direction = gizmoScreen.visible
				? getProjectedAxisDirection({
						axisWorld: WORLD_AXES[axisKey],
						pivotWorld: gizmoWorld,
						context,
						pixelDistance: AXIS_PIXEL_DISTANCE,
					})
				: null;
			gizmoHandles[axisKey] = direction
				? {
						visible: true,
						x: gizmoScreen.x + direction.x * AXIS_PIXEL_DISTANCE,
						y: gizmoScreen.y + direction.y * AXIS_PIXEL_DISTANCE,
					}
				: { visible: false, x: gizmoScreen.x, y: gizmoScreen.y };
		}

		const midpointWorld =
			startPoint && endPoint ? startPoint.clone().lerp(endPoint, 0.5) : null;
		const chipScreen = midpointWorld
			? buildOverlayPointState(midpointWorld, context, projectedPoint.clone())
			: { visible: false, x: 0, y: 0 };

		const nextOverlay = {
			contextKind: context.kind,
			start: startScreen,
			end: endScreen,
			draftEnd: draftEndScreen,
			lineVisible,
			lineUsesDraft: Boolean(!endPoint && draftEnd),
			chip: {
				visible: Boolean(endPoint) && chipScreen.visible,
				x: chipScreen.x,
				y: chipScreen.y,
				label:
					startPoint && endPoint
						? `${formatMeasurementLength(startPoint.distanceTo(endPoint))} m`
						: "",
			},
			gizmo: {
				visible: gizmoScreen.visible,
				pointKey: selectedPointKey,
				x: gizmoScreen.x,
				y: gizmoScreen.y,
				handles: gizmoHandles,
			},
		};

		if (!overlayStateEquals(store.measurement.overlay.value, nextOverlay)) {
			store.measurement.overlay.value = nextOverlay;
		}
	}

	return {
		isMeasurementModeActive,
		setMeasurementMode,
		toggleMeasurementMode,
		clearMeasurementSession,
		handleMeasurementPointerDown,
		handleMeasurementHoverMove,
		startMeasurementAxisDrag,
		handleMeasurementAxisDragMove,
		handleMeasurementAxisDragEnd,
		selectMeasurementPoint,
		deleteSelectedMeasurement,
		setMeasurementLengthInputText,
		applyMeasurementScale,
		syncMeasurementOverlay,
	};
}
