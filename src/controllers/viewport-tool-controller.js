import * as THREE from "three";
import {
	WORKSPACE_PANE_CAMERA,
	WORKSPACE_PANE_VIEWPORT,
} from "../workspace-model.js";
import {
	MOVE_AXIS_HANDLE_NAMES,
	MOVE_PLANE_HANDLE_NAMES,
	createViewportToolDragOperations,
} from "./viewport-tool/drag-operations.js";
import {
	AXIS_KEYS,
	buildPlaneHandlePath,
	buildRotateArcPath,
	getHandleAxisKey,
	getProjectedAxisDirection,
	getRingFrontAngle,
	isProjectedPointVisible,
	projectWorldToScreen,
} from "./viewport-tool/gizmo-geometry.js";
import { createViewportToolTransformHelpers } from "./viewport-tool/transform-helpers.js";

const HANDLE_OFFSETS = {
	move: 82,
	scale: { x: 0, y: -150 },
};

export function createViewportToolController({
	store,
	state,
	viewportShell,
	viewportGizmo,
	viewportGizmoSvg,
	getActiveToolCamera,
	assetController,
	beginHistoryTransaction,
	commitHistoryTransaction,
}) {
	const raycaster = new THREE.Raycaster();
	const pointerNdc = new THREE.Vector2();
	const projectedPivot = new THREE.Vector3();
	const tempVector = new THREE.Vector3();
	const tempVector2 = new THREE.Vector3();
	const handleElements = new Map();
	const ringElements = new Map();
	const planeElements = new Map();
	let activeDrag = null;
	let customGizmoDelegate = null;

	function isPivotEditMode() {
		return store.viewportToolMode.value === "pivot";
	}

	function isSelectMode() {
		return store.viewportToolMode.value === "select";
	}

	function isTransformMode() {
		return store.viewportToolMode.value === "transform";
	}

	function isReferenceImageEditMode() {
		return store.viewportToolMode.value === "reference";
	}

	function isViewportToolMode() {
		return (
			state.mode === WORKSPACE_PANE_VIEWPORT ||
			state.mode === WORKSPACE_PANE_CAMERA
		);
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

	function setCustomGizmoDelegate(nextDelegate) {
		customGizmoDelegate = nextDelegate ?? null;
	}

	function getCustomGizmoConfig(camera, viewportRect) {
		return (
			customGizmoDelegate?.getViewportGizmoConfig?.({
				camera,
				viewportRect,
			}) ?? null
		);
	}

	const {
		getSelectedTransformAsset,
		getSelectedTransformAssets,
		getSelectedTransformPivotWorld,
		createTransformAssetSnapshot,
		applySelectedAssetTransforms,
		getTransformBasisWorld,
		getMoveAxisPlaneNormal,
		getPointerRay,
	} = createViewportToolTransformHelpers({
		store,
		assetController,
		raycaster,
		pointerNdc,
		tempVector,
		tempVector2,
	});

	const { beginDragState, applyDrag } = createViewportToolDragOperations({
		assetController,
		getSelectedTransformPivotWorld,
		createTransformAssetSnapshot,
		getSelectedTransformAssets,
		getTransformBasisWorld,
		getMoveAxisPlaneNormal,
		getPointerRay,
		applySelectedAssetTransforms,
	});

	function startViewportTransformDrag(handleName, event) {
		if (!isViewportToolMode()) {
			return false;
		}
		const camera = getActiveToolCamera();
		if (!camera) {
			return false;
		}
		const viewportRect = viewportShell.getBoundingClientRect();
		const customConfig = getCustomGizmoConfig(camera, viewportRect);
		if (customConfig) {
			const started =
				customGizmoDelegate?.startViewportGizmoDrag?.(handleName, {
					camera,
					viewportRect,
					event,
					config: customConfig,
				}) ?? false;
			if (!started) {
				return false;
			}
			setHoveredHandle(handleName);
			viewportGizmo?.classList.add("is-dragging");
			return true;
		}
		if (isSelectMode()) {
			return false;
		}
		if (!isTransformMode() && !isPivotEditMode()) {
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

		const nextDragState = beginDragState({
			handleName,
			asset,
			camera,
			event,
			viewportRect,
			transformSpace: store.viewportTransformSpace.value,
			pivotEditMode: isPivotEditMode(),
		});
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

	function handleViewportTransformDragMove(event) {
		const camera = getActiveToolCamera();
		const viewportRect = viewportShell.getBoundingClientRect();
		if (
			customGizmoDelegate?.handleViewportGizmoDragMove?.(event, {
				camera,
				viewportRect,
			})
		) {
			event.preventDefault();
			event.stopPropagation();
			return;
		}

		if (!activeDrag || event.pointerId !== activeDrag.pointerId) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();
		if (!camera) {
			return;
		}
		const pointerRay = getPointerRay(event, camera, viewportRect);
		applyDrag(activeDrag, pointerRay, event);
	}

	function handleViewportTransformDragEnd(event) {
		if (customGizmoDelegate?.handleViewportGizmoDragEnd?.(event)) {
			event.preventDefault();
			event.stopPropagation();
			setHoveredHandle(null);
			viewportGizmo?.classList.remove("is-dragging");
			return;
		}

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

	function pickViewportAssetAtPointer(event) {
		if (!isViewportToolMode() || !isSelectMode()) {
			return false;
		}

		const camera = getActiveToolCamera();
		if (!camera) {
			return false;
		}

		const viewportRect = viewportShell.getBoundingClientRect();
		const targets = assetController.getSceneRaycastTargets?.() ?? [];
		event.preventDefault();
		event.stopPropagation();
		if (targets.length === 0) {
			return true;
		}

		getPointerRay(event, camera, viewportRect);
		const intersections = raycaster.intersectObjects(targets, true);
		const hitAsset = intersections
			.map((intersection) =>
				assetController.getSceneAssetForObject?.(intersection.object),
			)
			.find(Boolean);
		if (!hitAsset) {
			return true;
		}

		const additive = event.shiftKey || event.ctrlKey || event.metaKey;
		assetController.selectSceneAsset(hitAsset.id, {
			additive,
			toggle: additive,
		});
		return true;
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
		store.viewportToolMode.value = nextEnabled ? "pivot" : "none";
		setHoveredHandle(null);
	}

	function setViewportSelectMode(nextEnabled) {
		store.viewportToolMode.value = nextEnabled ? "select" : "none";
		setHoveredHandle(null);
	}

	function setViewportTransformMode(nextEnabled) {
		store.viewportToolMode.value = nextEnabled ? "transform" : "none";
		setHoveredHandle(null);
	}

	function setViewportReferenceImageEditMode(nextEnabled) {
		store.viewportToolMode.value = nextEnabled ? "reference" : "none";
		setHoveredHandle(null);
	}

	function syncViewportGizmoFromConfig({
		camera,
		viewportRect,
		pivotWorld,
		basisWorld,
		pivotMode = false,
		showMoveAxes = true,
		showMovePlanes = true,
		showRotate = false,
		showScale = false,
	}) {
		const projected = pivotWorld.clone().project(camera);
		if (!isProjectedPointVisible(projected)) {
			hideGizmo();
			return false;
		}

		showGizmo();
		if (viewportGizmoSvg) {
			viewportGizmoSvg.setAttribute(
				"viewBox",
				`0 0 ${Math.max(viewportRect.width, 1)} ${Math.max(viewportRect.height, 1)}`,
			);
		}

		projectWorldToScreen(pivotWorld, camera, viewportRect, projectedPivot);
		viewportGizmo.dataset.pivotMode = pivotMode ? "true" : "false";
		if (!showScale) {
			setHandleVisible("scale-uniform", false);
		} else {
			setHandlePosition(
				"scale-uniform",
				projectedPivot.x + HANDLE_OFFSETS.scale.x,
				projectedPivot.y + HANDLE_OFFSETS.scale.y,
			);
			setHandleVisible("scale-uniform", true);
		}

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
			if (!screenDirection || !showMoveAxes) {
				setHandleVisible(moveHandleName, false);
			} else {
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
			}

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
			if (!frontPath || !backPath || !showRotate) {
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
			if (!showMovePlanes) {
				setPlaneVisible(handleName, false);
				continue;
			}
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

		return true;
	}

	function syncViewportTransformGizmo() {
		if (!viewportGizmo) {
			return;
		}

		if (!isViewportToolMode()) {
			hideGizmo();
			return;
		}
		const camera = getActiveToolCamera();
		if (!camera) {
			hideGizmo();
			return;
		}
		const viewportRect = viewportShell.getBoundingClientRect();
		const customConfig = getCustomGizmoConfig(camera, viewportRect);
		if (customConfig) {
			syncViewportGizmoFromConfig({
				camera,
				viewportRect,
				...customConfig,
			});
			return;
		}

		const asset = getSelectedTransformAsset();
		if (
			!asset ||
			asset.object.visible === false ||
			(!isTransformMode() && !isPivotEditMode()) ||
			isSelectMode()
		) {
			hideGizmo();
			return;
		}

		const worldQuaternion = asset.object.getWorldQuaternion(
			new THREE.Quaternion(),
		);
		syncViewportGizmoFromConfig({
			camera,
			viewportRect,
			pivotWorld: getSelectedTransformPivotWorld(asset),
			basisWorld: getTransformBasisWorld(
				worldQuaternion,
				store.viewportTransformSpace.value,
			),
			pivotMode: isPivotEditMode(),
			showMoveAxes: true,
			showMovePlanes: true,
			showRotate: !isPivotEditMode(),
			showScale: !isPivotEditMode(),
		});
	}

	return {
		setViewportTransformSpace,
		setViewportSelectMode,
		setViewportReferenceImageEditMode,
		setViewportPivotEditMode,
		setViewportTransformMode,
		setViewportTransformHover,
		pickViewportAssetAtPointer,
		startViewportTransformDrag,
		handleViewportTransformDragMove,
		handleViewportTransformDragEnd,
		syncViewportTransformGizmo,
		setCustomGizmoDelegate,
	};
}
