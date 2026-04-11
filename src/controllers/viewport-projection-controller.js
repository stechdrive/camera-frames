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
	deriveViewportOrthoSizeFromPerspective,
	getViewportOrthoOppositeView,
	getViewportOrthoPreviewGridPlane,
	getViewportOrthoSideVector,
	getViewportOrthoUpVector,
	getViewportOrthoViewDefinition,
	getViewportOrthoViewForAxis,
} from "../engine/viewport-orthographic.js";

const MIN_VIEWPORT_ORTHO_SIZE = 0.02;
const MAX_VIEWPORT_ORTHO_SIZE = 1000000;
const MIN_VIEWPORT_ORTHO_DISTANCE = 0.05;
const TRANSIENT_VIEWPORT_REFERENCE_TTL_MS = 1500;
const VIEWPORT_REFERENCE_POINT_DISTANCE_RADIUS_FACTOR = 8;
const VIEWPORT_ORTHO_ENTRY_FALLBACK_DISTANCE_RADIUS_FACTOR = 4;
const VIEWPORT_ORTHO_ENTRY_MAX_DISTANCE_RADIUS_FACTOR = 16;
const VIEWPORT_ORTHO_DEPTH_STEP_FACTOR = 0.1;
const VIEWPORT_ORTHO_DEPTH_FINE_STEP_FACTOR = 0.025;
const VIEWPORT_ORTHO_DEPTH_MIN_STEP = 0.02;
const VIEWPORT_ORTHO_DEPTH_FINE_MIN_STEP = 0.005;
const VIEWPORT_ORTHO_DEPTH_MAX_STEP_RADIUS_FACTOR = 0.15;
const VIEWPORT_ORTHO_DEPTH_FINE_MAX_STEP_RADIUS_FACTOR = 0.04;
const VIEWPORT_WHEEL_DELTA_LINE_PX = 16;
const VIEWPORT_WHEEL_DELTA_PAGE_PX = 800;
const VIEWPORT_WHEEL_DELTA_NOTCH_PX = 100;

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

function cloneOptionalQuaternion(value = null) {
	return {
		x: Number(value?.x ?? 0),
		y: Number(value?.y ?? 0),
		z: Number(value?.z ?? 0),
		w: Number(value?.w ?? 1),
	};
}

function cloneFiniteQuaternion(value = null) {
	if (
		!value ||
		!Number.isFinite(value.x) ||
		!Number.isFinite(value.y) ||
		!Number.isFinite(value.z) ||
		!Number.isFinite(value.w)
	) {
		return null;
	}
	return new THREE.Quaternion(
		Number(value.x),
		Number(value.y),
		Number(value.z),
		Number(value.w),
	);
}

function approximatelyEqual(a, b, epsilon = 1e-6) {
	return Math.abs(Number(a) - Number(b)) <= epsilon;
}

function areViewportOrthoStatesEquivalent(a = null, b = null) {
	if (!a || !b) {
		return false;
	}
	return (
		a.viewId === b.viewId &&
		approximatelyEqual(a.size, b.size) &&
		approximatelyEqual(a.distance, b.distance) &&
		approximatelyEqual(a.focus?.x, b.focus?.x) &&
		approximatelyEqual(a.focus?.y, b.focus?.y) &&
		approximatelyEqual(a.focus?.z, b.focus?.z)
	);
}

function clampWithMinimum(value, minimumValue) {
	return Math.max(Number(value) || 0, Number(minimumValue) || 0);
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
	let savedViewportPerspectivePose = null;
	let savedViewportOrthoEntryState = null;

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

	function getViewportReferenceDistanceLimit() {
		const { radius } = getSceneFramingState();
		return Math.max(
			radius * VIEWPORT_REFERENCE_POINT_DISTANCE_RADIUS_FACTOR,
			DEFAULT_VIEWPORT_ORTHO_DISTANCE * 2,
		);
	}

	function isViewportReferencePointReasonable(point) {
		const candidate = cloneFiniteVector3(point);
		if (!candidate) {
			return false;
		}
		const { center } = getSceneFramingState();
		return candidate.distanceTo(center) <= getViewportReferenceDistanceLimit();
	}

	function getViewportOrthoEntryDistanceRange() {
		const { radius } = getSceneFramingState();
		const fallbackDistance = Math.max(
			radius * VIEWPORT_ORTHO_ENTRY_FALLBACK_DISTANCE_RADIUS_FACTOR,
			DEFAULT_VIEWPORT_ORTHO_DISTANCE,
		);
		return {
			fallbackDistance,
			maxDistance: Math.max(
				radius * VIEWPORT_ORTHO_ENTRY_MAX_DISTANCE_RADIUS_FACTOR,
				fallbackDistance,
			),
		};
	}

	function clampViewportOrthoEntryDepth(depth) {
		const { fallbackDistance, maxDistance } =
			getViewportOrthoEntryDistanceRange();
		if (!(depth > 1e-4)) {
			return fallbackDistance;
		}
		return THREE.MathUtils.clamp(
			depth,
			MIN_VIEWPORT_ORTHO_DISTANCE,
			maxDistance,
		);
	}

	function normalizeViewportWheelDeltaToNotches(deltaY, deltaMode = 0) {
		let pixels = Number(deltaY);
		if (!Number.isFinite(pixels)) {
			return 0;
		}
		if (Number(deltaMode) === 1) {
			pixels *= VIEWPORT_WHEEL_DELTA_LINE_PX;
		} else if (Number(deltaMode) === 2) {
			pixels *= VIEWPORT_WHEEL_DELTA_PAGE_PX;
		}
		return pixels / VIEWPORT_WHEEL_DELTA_NOTCH_PX;
	}

	function getViewportOrthographicDepthStep(state, { fine = false } = {}) {
		const { radius } = getSceneFramingState();
		const baseStep =
			(Number(state?.size) || DEFAULT_VIEWPORT_ORTHO_SIZE) *
			(fine
				? VIEWPORT_ORTHO_DEPTH_FINE_STEP_FACTOR
				: VIEWPORT_ORTHO_DEPTH_STEP_FACTOR);
		const minimumStep = fine
			? VIEWPORT_ORTHO_DEPTH_FINE_MIN_STEP
			: VIEWPORT_ORTHO_DEPTH_MIN_STEP;
		const maximumStep = Math.max(
			radius *
				(fine
					? VIEWPORT_ORTHO_DEPTH_FINE_MAX_STEP_RADIUS_FACTOR
					: VIEWPORT_ORTHO_DEPTH_MAX_STEP_RADIUS_FACTOR),
			fine ? 0.025 : 0.1,
		);
		return THREE.MathUtils.clamp(baseStep, minimumStep, maximumStep);
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

	function captureViewportPerspectivePose() {
		if (!viewportPerspectiveCamera) {
			return null;
		}
		return {
			position: cloneOptionalVector3(viewportPerspectiveCamera.position),
			quaternion: cloneOptionalQuaternion(viewportPerspectiveCamera.quaternion),
			up: cloneOptionalVector3(viewportPerspectiveCamera.up),
		};
	}

	function rememberViewportPerspectivePose() {
		savedViewportPerspectivePose = captureViewportPerspectivePose();
		return Boolean(savedViewportPerspectivePose);
	}

	function restoreViewportPerspectivePose(snapshot = null) {
		if (!viewportPerspectiveCamera) {
			return false;
		}
		const position = cloneFiniteVector3(snapshot?.position);
		const quaternion = cloneFiniteQuaternion(snapshot?.quaternion);
		const up = cloneFiniteVector3(snapshot?.up);
		if (!position || !quaternion || !up) {
			return false;
		}
		viewportPerspectiveCamera.position.copy(position);
		viewportPerspectiveCamera.quaternion.copy(quaternion).normalize();
		viewportPerspectiveCamera.up.copy(up).normalize();
		viewportPerspectiveCamera.updateMatrixWorld(true);
		return true;
	}

	function rememberViewportOrthoEntryState(state) {
		savedViewportOrthoEntryState = cloneViewportOrthoState(state);
		return savedViewportOrthoEntryState;
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
		if (isViewportReferencePointReasonable(transientReferencePoint)) {
			clearViewportTransientReferencePoint();
			return transientReferencePoint;
		}

		if (isViewportReferencePointReasonable(lastViewportReferencePoint)) {
			return lastViewportReferencePoint.clone();
		}
		return null;
	}

	function resolveViewportEntryDepth(currentState, referencePoint = null) {
		const camera = viewportPerspectiveCamera;
		if (!camera?.isPerspectiveCamera) {
			return clampWithMinimum(
				Number(currentState?.distance) || 0,
				DEFAULT_VIEWPORT_ORTHO_DISTANCE,
			);
		}

		const { center } = getSceneFramingState();
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
		return clampViewportOrthoEntryDepth(depth);
	}

	function resolveViewportEntryFocusPoint(currentState, referencePoint = null) {
		const nextReferencePoint = cloneFiniteVector3(referencePoint);
		if (nextReferencePoint) {
			return nextReferencePoint;
		}
		return getSceneFramingState().center.clone();
	}

	function deriveViewportOrthoEntrySize(currentState, referencePoint = null) {
		const camera = viewportPerspectiveCamera;
		if (!camera?.isPerspectiveCamera) {
			return Math.max(
				Number(currentState?.size) || 0,
				DEFAULT_VIEWPORT_ORTHO_SIZE,
			);
		}
		const depth = resolveViewportEntryDepth(currentState, referencePoint);
		return deriveViewportOrthoSizeFromPerspective({
			depth,
			verticalFovDegrees: camera.fov,
			minSize: MIN_VIEWPORT_ORTHO_SIZE,
		});
	}

	function applyPerspectivePoseFromOrthographicState() {
		if (!viewportPerspectiveCamera) {
			return false;
		}
		const state = getViewportOrthoState();
		const focus = cloneFiniteVector3(state.focus);
		if (!focus) {
			return false;
		}
		const aspect = getViewportAspect();
		const verticalFovDegrees = horizontalToVerticalFovDegrees(
			store.viewportBaseFovX.value,
			aspect,
		);
		const tangent = Math.tan(
			THREE.MathUtils.degToRad(
				THREE.MathUtils.clamp(verticalFovDegrees, 1e-3, 179.999) * 0.5,
			),
		);
		if (!(tangent > 1e-6)) {
			return false;
		}
		const side = getViewportOrthoSideVector(
			state.viewId,
			new THREE.Vector3(),
		).normalize();
		const up = getViewportOrthoUpVector(
			state.viewId,
			new THREE.Vector3(),
		).normalize();
		const depth = Math.max(
			MIN_VIEWPORT_ORTHO_DISTANCE,
			(Number(state.size) || DEFAULT_VIEWPORT_ORTHO_SIZE) / tangent,
		);
		viewportPerspectiveCamera.position.copy(focus).addScaledVector(side, depth);
		viewportPerspectiveCamera.up.copy(up);
		viewportPerspectiveCamera.lookAt(focus);
		viewportPerspectiveCamera.updateMatrixWorld(true);
		return true;
	}

	function setViewportProjectionMode(
		mode,
		{
			copyActivePose = true,
			restoreSavedPerspective = copyActivePose,
			matchOrthographicFraming = copyActivePose,
		} = {},
	) {
		const nextMode =
			mode === VIEWPORT_PROJECTION_ORTHOGRAPHIC
				? VIEWPORT_PROJECTION_ORTHOGRAPHIC
				: VIEWPORT_PROJECTION_PERSPECTIVE;
		if (nextMode === store.viewportProjectionMode.value) {
			syncActiveViewportProjection();
			return false;
		}

		const previousMode = store.viewportProjectionMode.value;
		if (
			nextMode === VIEWPORT_PROJECTION_ORTHOGRAPHIC &&
			previousMode === VIEWPORT_PROJECTION_PERSPECTIVE
		) {
			rememberViewportPerspectivePose();
			savedViewportOrthoEntryState = null;
		}

		if (
			nextMode === VIEWPORT_PROJECTION_PERSPECTIVE &&
			previousMode === VIEWPORT_PROJECTION_ORTHOGRAPHIC
		) {
			const shouldRestoreSavedPerspective =
				restoreSavedPerspective &&
				areViewportOrthoStatesEquivalent(
					getViewportOrthoState(),
					savedViewportOrthoEntryState,
				);
			const restoredPerspective =
				shouldRestoreSavedPerspective &&
				restoreViewportPerspectivePose(savedViewportPerspectivePose);
			const matchedOrthographicFraming =
				!restoredPerspective &&
				matchOrthographicFraming &&
				applyPerspectivePoseFromOrthographicState();
			if (
				!restoredPerspective &&
				!matchedOrthographicFraming &&
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
		}

		store.viewportProjectionMode.value = nextMode;
		if (nextMode === VIEWPORT_PROJECTION_ORTHOGRAPHIC) {
			ensureOrthoStateInitialized();
			if (!savedViewportOrthoEntryState) {
				rememberViewportOrthoEntryState(getViewportOrthoState());
			}
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
		const wasOrthographic = isViewportOrthographic();
		const shouldToggle =
			toggleOppositeOnRepeat &&
			wasOrthographic &&
			currentState.viewId === resolvedViewId;
		const nextViewId = shouldToggle
			? getViewportOrthoOppositeView(resolvedViewId)
			: resolvedViewId;
		const nextState = wasOrthographic
			? {
					...currentState,
					viewId: nextViewId,
				}
			: (() => {
					const referencePoint = resolveViewportEntryReferencePoint();
					const focusPoint = resolveViewportEntryFocusPoint(
						currentState,
						referencePoint,
					);
					const distance = resolveViewportEntryDepth(
						currentState,
						referencePoint ?? focusPoint,
					);
					return {
						...currentState,
						viewId: nextViewId,
						size: deriveViewportOrthoEntrySize(
							currentState,
							referencePoint ?? focusPoint,
						),
						distance,
						focus: cloneOptionalVector3(focusPoint),
					};
				})();
		setViewportProjectionMode(VIEWPORT_PROJECTION_ORTHOGRAPHIC, {
			copyActivePose: false,
		});
		const normalizedState = setViewportOrthoState(nextState);
		if (!wasOrthographic) {
			rememberViewportOrthoEntryState(normalizedState);
		}
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
			restoreSavedPerspective: false,
			matchOrthographicFraming: false,
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

	function offsetViewportOrthographicDepth(
		deltaY,
		{ fine = false, deltaMode = 0 } = {},
	) {
		if (!isViewportOrthographic() || !Number.isFinite(deltaY)) {
			return false;
		}
		const state = getViewportOrthoState();
		const wheelNotches = normalizeViewportWheelDeltaToNotches(
			deltaY,
			deltaMode,
		);
		if (Math.abs(wheelNotches) < 1e-6) {
			return false;
		}
		const depthStep = getViewportOrthographicDepthStep(state, { fine });
		const nextDistance = Math.max(
			MIN_VIEWPORT_ORTHO_DISTANCE,
			state.distance + wheelNotches * depthStep,
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
