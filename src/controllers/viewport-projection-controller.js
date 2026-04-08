import * as THREE from "three";
import { horizontalToVerticalFovDegrees } from "../engine/projection.js";
import {
	DEFAULT_VIEWPORT_ORTHO_DISTANCE,
	DEFAULT_VIEWPORT_ORTHO_SIZE,
	DEFAULT_VIEWPORT_ORTHO_VIEW,
	VIEWPORT_PROJECTION_ORTHOGRAPHIC,
	VIEWPORT_PROJECTION_PERSPECTIVE,
	cloneViewportOrthoState,
	configureViewportOrthographicCamera,
	deriveViewportOrthoEntryStateFromCamera,
	deriveViewportOrthoSizeFromPerspective,
	getViewportOrthoOppositeView,
	getViewportOrthoPreviewGridPlane,
	getViewportOrthoViewDefinition,
	getViewportOrthoViewForAxis,
} from "../engine/viewport-orthographic.js";

const MIN_VIEWPORT_ORTHO_SIZE = 0.02;
const MAX_VIEWPORT_ORTHO_SIZE = 1000000;
const MIN_VIEWPORT_ORTHO_DISTANCE = 0.05;
const TRANSIENT_VIEWPORT_REFERENCE_TTL_MS = 1500;

function cloneOptionalVector3(value = null) {
	return {
		x: Number(value?.x ?? 0),
		y: Number(value?.y ?? 0),
		z: Number(value?.z ?? 0),
	};
}

function cloneFiniteVector3(value = null) {
	if (
		!value ||
		!Number.isFinite(value.x) ||
		!Number.isFinite(value.y) ||
		!Number.isFinite(value.z)
	) {
		return null;
	}
	return new THREE.Vector3(Number(value.x), Number(value.y), Number(value.z));
}

export function createViewportProjectionController({
	store,
	viewportShell,
	viewportPerspectiveCamera,
	viewportOrthographicCamera,
	getViewportSize,
	getAutoClipRange,
	getSceneFraming,
	getSceneRaycastTargets = null,
}) {
	const centerRaycaster = new THREE.Raycaster();
	const centerRayNdc = new THREE.Vector2(0, 0);
	const referenceCameraPosition = new THREE.Vector3();
	const referenceCameraForward = new THREE.Vector3();
	const referenceOffset = new THREE.Vector3();
	let lastViewportReferencePoint = null;
	let transientViewportReferencePoint = null;
	let transientViewportReferenceExpiresAt = 0;

	function getViewportAspect() {
		const { width, height } = getViewportSize();
		return Math.max(width, 1) / Math.max(height, 1);
	}

	function getViewportProjectionMode() {
		return store.viewportProjectionMode.value;
	}

	function isViewportOrthographic() {
		return getViewportProjectionMode() === VIEWPORT_PROJECTION_ORTHOGRAPHIC;
	}

	function getViewportPerspectiveCamera() {
		return viewportPerspectiveCamera;
	}

	function getViewportOrthographicCamera() {
		return viewportOrthographicCamera;
	}

	function getActiveViewportCamera() {
		return isViewportOrthographic()
			? viewportOrthographicCamera
			: viewportPerspectiveCamera;
	}

	function getViewportOrthoState() {
		return cloneViewportOrthoState({
			viewId: store.viewportOrthoView.value,
			size: store.viewportOrthoSize.value,
			distance: store.viewportOrthoDistance.value,
			focus: store.viewportOrthoFocus.value,
		});
	}

	function setViewportOrthoState(nextState) {
		const normalizedState = cloneViewportOrthoState(nextState);
		store.viewportOrthoView.value = normalizedState.viewId;
		store.viewportOrthoSize.value = normalizedState.size;
		store.viewportOrthoDistance.value = normalizedState.distance;
		store.viewportOrthoFocus.value = cloneOptionalVector3(
			normalizedState.focus,
		);
		return normalizedState;
	}

	function getSceneFramingState() {
		const framing = getSceneFraming?.() ?? null;
		const center = framing?.center ?? new THREE.Vector3(0, 1, 0);
		const radius = Math.max(Number(framing?.radius) || 0, 0.6);
		return {
			center,
			radius,
		};
	}

	function syncPerspectiveViewportProjection() {
		const aspect = getViewportAspect();
		viewportPerspectiveCamera.aspect = aspect;
		viewportPerspectiveCamera.fov = horizontalToVerticalFovDegrees(
			store.viewportBaseFovX.value,
			aspect,
		);
		viewportPerspectiveCamera.updateProjectionMatrix();
		viewportPerspectiveCamera.updateMatrixWorld(true);
	}

	function syncOrthographicViewportProjection() {
		const state = getViewportOrthoState();
		configureViewportOrthographicCamera(viewportOrthographicCamera, {
			aspect: getViewportAspect(),
			viewId: state.viewId,
			size: state.size,
			distance: state.distance,
			focus: state.focus,
		});
		const autoClip = getAutoClipRange?.(viewportOrthographicCamera);
		if (autoClip) {
			viewportOrthographicCamera.near = autoClip.near;
			viewportOrthographicCamera.far = autoClip.far;
			viewportOrthographicCamera.updateProjectionMatrix();
			viewportOrthographicCamera.updateMatrixWorld(true);
		}
	}

	function syncActiveViewportProjection() {
		if (isViewportOrthographic()) {
			syncOrthographicViewportProjection();
		} else {
			syncPerspectiveViewportProjection();
		}
	}

	function ensureOrthoStateInitialized() {
		const currentState = getViewportOrthoState();
		const { center, radius } = getSceneFramingState();
		const nextSize = Math.max(
			Number(currentState.size) || 0,
			Math.max(radius * 1.2, DEFAULT_VIEWPORT_ORTHO_SIZE),
		);
		const nextDistance = Math.max(
			Number(currentState.distance) || 0,
			Math.max(radius * 4, DEFAULT_VIEWPORT_ORTHO_DISTANCE),
		);
		return setViewportOrthoState({
			...currentState,
			size: nextSize,
			distance: nextDistance,
			focus:
				Number.isFinite(currentState.focus?.x) &&
				Number.isFinite(currentState.focus?.y) &&
				Number.isFinite(currentState.focus?.z)
					? currentState.focus
					: center,
		});
	}

	function rememberViewportReferencePoint(point) {
		lastViewportReferencePoint = cloneFiniteVector3(point);
		return Boolean(lastViewportReferencePoint);
	}

	function clearViewportTransientReferencePoint() {
		transientViewportReferencePoint = null;
		transientViewportReferenceExpiresAt = 0;
	}

	function setViewportTransientReferencePoint(
		point,
		{ ttlMs = TRANSIENT_VIEWPORT_REFERENCE_TTL_MS } = {},
	) {
		const nextPoint = cloneFiniteVector3(point);
		if (!nextPoint) {
			clearViewportTransientReferencePoint();
			return false;
		}
		transientViewportReferencePoint = nextPoint;
		transientViewportReferenceExpiresAt =
			Date.now() + Math.max(Number(ttlMs) || 0, 0);
		return true;
	}

	function getViewportTransientReferencePoint() {
		if (!transientViewportReferencePoint) {
			return null;
		}
		if (
			Number.isFinite(transientViewportReferenceExpiresAt) &&
			transientViewportReferenceExpiresAt > 0 &&
			Date.now() > transientViewportReferenceExpiresAt
		) {
			clearViewportTransientReferencePoint();
			return null;
		}
		return transientViewportReferencePoint.clone();
	}

	function pickViewportCenterReferencePoint() {
		const targets = getSceneRaycastTargets?.() ?? [];
		if (!viewportPerspectiveCamera || targets.length === 0) {
			return null;
		}
		centerRaycaster.setFromCamera(centerRayNdc, viewportPerspectiveCamera);
		const intersections = centerRaycaster.intersectObjects(targets, true);
		return intersections[0]?.point?.clone?.() ?? null;
	}

	function resolveViewportEntryReferencePoint() {
		const centerReferencePoint = pickViewportCenterReferencePoint();
		if (centerReferencePoint) {
			rememberViewportReferencePoint(centerReferencePoint);
			clearViewportTransientReferencePoint();
			return centerReferencePoint;
		}

		const transientReferencePoint = getViewportTransientReferencePoint();
		if (transientReferencePoint) {
			clearViewportTransientReferencePoint();
			return transientReferencePoint;
		}

		return lastViewportReferencePoint?.clone?.() ?? null;
	}

	function deriveViewportOrthoEntrySize(currentState, referencePoint = null) {
		const camera = viewportPerspectiveCamera;
		if (!camera?.isPerspectiveCamera) {
			return Math.max(
				Number(currentState?.size) || 0,
				DEFAULT_VIEWPORT_ORTHO_SIZE,
			);
		}

		const { center, radius } = getSceneFramingState();
		camera.getWorldPosition(referenceCameraPosition);
		camera.getWorldDirection(referenceCameraForward).normalize();

		let depth = 0;
		if (referencePoint) {
			depth = referenceOffset
				.copy(referencePoint)
				.sub(referenceCameraPosition)
				.dot(referenceCameraForward);
		}
		if (!(depth > 1e-4)) {
			depth = referenceOffset
				.copy(center)
				.sub(referenceCameraPosition)
				.dot(referenceCameraForward);
		}
		if (!(depth > 1e-4)) {
			depth = Math.max(
				referenceCameraPosition.distanceTo(center),
				radius * 2,
				Number(currentState?.distance) || 0,
				DEFAULT_VIEWPORT_ORTHO_DISTANCE,
			);
		}

		return deriveViewportOrthoSizeFromPerspective({
			depth,
			verticalFovDegrees: camera.fov,
			minSize: MIN_VIEWPORT_ORTHO_SIZE,
		});
	}

	function setViewportProjectionMode(mode, { copyActivePose = true } = {}) {
		const nextMode =
			mode === VIEWPORT_PROJECTION_ORTHOGRAPHIC
				? VIEWPORT_PROJECTION_ORTHOGRAPHIC
				: VIEWPORT_PROJECTION_PERSPECTIVE;
		if (nextMode === store.viewportProjectionMode.value) {
			syncActiveViewportProjection();
			return false;
		}

		if (
			nextMode === VIEWPORT_PROJECTION_PERSPECTIVE &&
			copyActivePose &&
			viewportOrthographicCamera
		) {
			viewportPerspectiveCamera.position.copy(
				viewportOrthographicCamera.position,
			);
			viewportPerspectiveCamera.quaternion.copy(
				viewportOrthographicCamera.quaternion,
			);
			viewportPerspectiveCamera.up.copy(viewportOrthographicCamera.up);
			viewportPerspectiveCamera.updateMatrixWorld(true);
		}

		store.viewportProjectionMode.value = nextMode;
		if (nextMode === VIEWPORT_PROJECTION_ORTHOGRAPHIC) {
			ensureOrthoStateInitialized();
		}
		syncActiveViewportProjection();
		return true;
	}

	function alignViewportToOrthographicView(
		viewId,
		{ toggleOppositeOnRepeat = false } = {},
	) {
		const resolvedViewId = getViewportOrthoViewDefinition(viewId).id;
		const currentState = ensureOrthoStateInitialized();
		const shouldToggle =
			toggleOppositeOnRepeat &&
			isViewportOrthographic() &&
			currentState.viewId === resolvedViewId;
		const nextViewId = shouldToggle
			? getViewportOrthoOppositeView(resolvedViewId)
			: resolvedViewId;
		const referencePoint = isViewportOrthographic()
			? null
			: resolveViewportEntryReferencePoint();
		const entryState = isViewportOrthographic()
			? currentState
			: {
					...currentState,
					size: deriveViewportOrthoEntrySize(currentState, referencePoint),
				};
		const nextState = isViewportOrthographic()
			? {
					...entryState,
					viewId: nextViewId,
				}
			: deriveViewportOrthoEntryStateFromCamera({
					currentState: entryState,
					viewId: nextViewId,
					cameraPosition: viewportPerspectiveCamera?.position ?? null,
				});
		setViewportProjectionMode(VIEWPORT_PROJECTION_ORTHOGRAPHIC, {
			copyActivePose: false,
		});
		setViewportOrthoState(nextState);
		syncActiveViewportProjection();
		return true;
	}

	function toggleOrthographicAxis(axisKey) {
		const currentState = ensureOrthoStateInitialized();
		const currentView = getViewportOrthoViewDefinition(currentState.viewId);
		if (isViewportOrthographic() && currentView.axis === axisKey) {
			return alignViewportToOrthographicView(
				getViewportOrthoOppositeView(currentView.id),
			);
		}
		const activeCamera = getActiveViewportCamera();
		const axisVector =
			axisKey === "x"
				? new THREE.Vector3(1, 0, 0)
				: axisKey === "y"
					? new THREE.Vector3(0, 1, 0)
					: new THREE.Vector3(0, 0, 1);
		const forward =
			activeCamera?.getWorldDirection(new THREE.Vector3()) ??
			new THREE.Vector3(0, 0, -1);
		const sign = forward.dot(axisVector) <= 0 ? 1 : -1;
		return alignViewportToOrthographicView(
			getViewportOrthoViewForAxis(axisKey, sign),
		);
	}

	function ensurePerspectiveForViewportRotation() {
		if (!isViewportOrthographic()) {
			return false;
		}
		return setViewportProjectionMode(VIEWPORT_PROJECTION_PERSPECTIVE, {
			copyActivePose: true,
		});
	}

	function resetViewportOrthographicView() {
		const currentState = getViewportOrthoState();
		const { center, radius } = getSceneFramingState();
		setViewportOrthoState({
			viewId: currentState.viewId || DEFAULT_VIEWPORT_ORTHO_VIEW,
			size: Math.max(radius * 1.2, DEFAULT_VIEWPORT_ORTHO_SIZE),
			distance: Math.max(radius * 4, DEFAULT_VIEWPORT_ORTHO_DISTANCE),
			focus: center,
		});
		syncActiveViewportProjection();
	}

	function panViewportOrthographic(deltaPxX, deltaPxY) {
		if (!isViewportOrthographic()) {
			return false;
		}
		const viewportRect = viewportShell?.getBoundingClientRect?.();
		if (!viewportRect || viewportRect.height <= 0) {
			return false;
		}
		const camera = viewportOrthographicCamera;
		const unitsPerPixel =
			(camera.top - camera.bottom) /
			Math.max(camera.zoom, 1e-6) /
			Math.max(viewportRect.height, 1);
		const right = new THREE.Vector3(1, 0, 0)
			.applyQuaternion(camera.quaternion)
			.normalize();
		const up = new THREE.Vector3(0, 1, 0)
			.applyQuaternion(camera.quaternion)
			.normalize();
		const state = getViewportOrthoState();
		const focus = new THREE.Vector3(state.focus.x, state.focus.y, state.focus.z)
			.addScaledVector(right, -deltaPxX * unitsPerPixel)
			.addScaledVector(up, deltaPxY * unitsPerPixel);
		setViewportOrthoState({
			...state,
			focus,
		});
		syncActiveViewportProjection();
		return true;
	}

	function zoomViewportOrthographic(deltaY, { fine = false } = {}) {
		if (!isViewportOrthographic() || !Number.isFinite(deltaY)) {
			return false;
		}
		const state = getViewportOrthoState();
		const scale = Math.exp(Number(deltaY) * (fine ? 0.0005 : 0.0012));
		setViewportOrthoState({
			...state,
			size: THREE.MathUtils.clamp(
				state.size * scale,
				MIN_VIEWPORT_ORTHO_SIZE,
				MAX_VIEWPORT_ORTHO_SIZE,
			),
		});
		syncActiveViewportProjection();
		return true;
	}

	function offsetViewportOrthographicDepth(deltaY, { fine = false } = {}) {
		if (!isViewportOrthographic() || !Number.isFinite(deltaY)) {
			return false;
		}
		const state = getViewportOrthoState();
		const nextDistance = Math.max(
			MIN_VIEWPORT_ORTHO_DISTANCE,
			state.distance + Number(deltaY) * state.size * (fine ? 0.002 : 0.006),
		);
		setViewportOrthoState({
			...state,
			distance: nextDistance,
		});
		syncActiveViewportProjection();
		return true;
	}

	function captureViewportProjectionState() {
		return {
			projectionMode: getViewportProjectionMode(),
			orthographic: getViewportOrthoState(),
		};
	}

	function getViewportOrthographicPreviewGridPlane() {
		if (!isViewportOrthographic()) {
			return null;
		}
		return getViewportOrthoPreviewGridPlane(getViewportOrthoState().viewId);
	}

	function restoreViewportProjectionState(snapshot = null) {
		const projectionMode =
			snapshot?.projectionMode === VIEWPORT_PROJECTION_ORTHOGRAPHIC
				? VIEWPORT_PROJECTION_ORTHOGRAPHIC
				: VIEWPORT_PROJECTION_PERSPECTIVE;
		const orthoState = setViewportOrthoState(
			snapshot?.orthographic ?? getViewportOrthoState(),
		);
		store.viewportProjectionMode.value = projectionMode;
		store.viewportOrthoView.value = orthoState.viewId;
		store.viewportOrthoSize.value = orthoState.size;
		store.viewportOrthoDistance.value = orthoState.distance;
		store.viewportOrthoFocus.value = cloneOptionalVector3(orthoState.focus);
		syncActiveViewportProjection();
		return true;
	}

	return {
		getViewportProjectionMode,
		isViewportOrthographic,
		getViewportPerspectiveCamera,
		getViewportOrthographicCamera,
		getActiveViewportCamera,
		getViewportOrthoState,
		getViewportOrthographicPreviewGridPlane,
		captureViewportProjectionState,
		restoreViewportProjectionState,
		syncActiveViewportProjection,
		syncPerspectiveViewportProjection,
		setViewportProjectionMode,
		alignViewportToOrthographicView,
		toggleOrthographicAxis,
		ensurePerspectiveForViewportRotation,
		resetViewportOrthographicView,
		panViewportOrthographic,
		zoomViewportOrthographic,
		offsetViewportOrthographicDepth,
		rememberViewportReferencePoint,
		setViewportTransientReferencePoint,
	};
}
