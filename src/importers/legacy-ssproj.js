import * as THREE from "three";
import {
	ANCHORS,
	BASE_RENDER_BOX,
	DEFAULT_CAMERA_FAR,
	DEFAULT_CAMERA_NEAR,
} from "../constants.js";
import { clampViewZoom } from "../engine/projection.js";
import {
	createFrameDocument,
	createShotCameraDocument,
	getFrameDocumentId,
	getShotCameraDocumentId,
} from "../workspace-model.js";

const EPSILON = 1e-6;
const DEFAULT_SCENE_RADIUS = 1;
const DEFAULT_CAMERA_FOV_X = 60;
const LEGACY_CAMERA_EULER_ORDER = "YXZ";

function isFiniteNumber(value) {
	return typeof value === "number" && Number.isFinite(value);
}

function toVector3(value, fallback = null) {
	if (Array.isArray(value) && value.length >= 3) {
		const x = Number(value[0]);
		const y = Number(value[1]);
		const z = Number(value[2]);
		if ([x, y, z].every(Number.isFinite)) {
			return new THREE.Vector3(x, y, z);
		}
	}

	if (value && typeof value === "object") {
		const x = Number(value.x);
		const y = Number(value.y);
		const z = Number(value.z);
		if ([x, y, z].every(Number.isFinite)) {
			return new THREE.Vector3(x, y, z);
		}
	}

	return fallback ? fallback.clone() : null;
}

function toQuaternion(value, fallback = null) {
	if (Array.isArray(value) && value.length >= 4) {
		const x = Number(value[0]);
		const y = Number(value[1]);
		const z = Number(value[2]);
		const w = Number(value[3]);
		if ([x, y, z, w].every(Number.isFinite)) {
			return new THREE.Quaternion(x, y, z, w);
		}
	}

	return fallback ? fallback.clone() : null;
}

function clampPitch(value) {
	const nextValue = Number(value);
	if (!Number.isFinite(nextValue)) {
		return 0;
	}

	return Math.max(-89.9, Math.min(89.9, nextValue));
}

function resolveAnchorKeyFromPoint(anchor, fallbackKey = "center") {
	if (!anchor || typeof anchor !== "object") {
		return fallbackKey;
	}

	let nearestKey = fallbackKey;
	let nearestDistance = Number.POSITIVE_INFINITY;
	for (const [anchorKey, preset] of Object.entries(ANCHORS)) {
		const dx = Number(anchor.ax ?? anchor.x) - preset.x;
		const dy = Number(anchor.ay ?? anchor.y) - preset.y;
		if (Math.abs(dx) <= EPSILON && Math.abs(dy) <= EPSILON) {
			return anchorKey;
		}

		const distance = dx * dx + dy * dy;
		if (distance < nearestDistance) {
			nearestDistance = distance;
			nearestKey = anchorKey;
		}
	}

	return nearestKey;
}

function getLegacyRenderBoxScale(renderBox, axis) {
	const component =
		axis === "x"
			? (renderBox?.scale?.kx ?? renderBox?.scalePct?.x / 100)
			: (renderBox?.scale?.ky ?? renderBox?.scalePct?.y / 100);
	return isFiniteNumber(component) && component > 0 ? component : 1;
}

function mapLegacyOutputFrame(cameraFramesState) {
	const renderBox = cameraFramesState?.renderBox ?? {};
	const baseWidth = Number(renderBox.baseSize?.w) || BASE_RENDER_BOX.width;
	const baseHeight = Number(renderBox.baseSize?.h) || BASE_RENDER_BOX.height;
	const widthScale =
		(baseWidth * getLegacyRenderBoxScale(renderBox, "x")) /
		BASE_RENDER_BOX.width;
	const heightScale =
		(baseHeight * getLegacyRenderBoxScale(renderBox, "y")) /
		BASE_RENDER_BOX.height;
	const viewportWidth = Number(renderBox.lastViewport?.vw) || 0;
	const viewportHeight = Number(renderBox.lastViewport?.vh) || 0;
	const viewportCenterX =
		viewportWidth > 0 && isFiniteNumber(renderBox.center?.cx)
			? renderBox.center.cx / viewportWidth
			: 0.5;
	const viewportCenterY =
		viewportHeight > 0 && isFiniteNumber(renderBox.center?.cy)
			? renderBox.center.cy / viewportHeight
			: 0.5;

	return {
		widthScale: Math.max(0.01, widthScale),
		heightScale: Math.max(0.01, heightScale),
		viewZoom: clampViewZoom((Number(renderBox.viewZoomPct) || 100) / 100),
		anchor: resolveAnchorKeyFromPoint(renderBox.anchor, "center"),
		centerX: 0.5,
		centerY: 0.5,
		viewportCenterX,
		viewportCenterY,
		fitScale:
			isFiniteNumber(renderBox.fitScale) && renderBox.fitScale > 0
				? renderBox.fitScale
				: 0,
		fitViewportWidth: viewportWidth,
		fitViewportHeight: viewportHeight,
	};
}

function resolveLegacyFrameName(frame, index) {
	if (typeof frame?.name === "string" && frame.name.trim()) {
		return frame.name.trim();
	}
	if (typeof frame?.id === "string" && frame.id.trim()) {
		return frame.id.trim().toUpperCase();
	}
	return `FRAME ${String.fromCharCode(65 + index)}`;
}

function mapLegacyFrames(cameraFramesState) {
	const frames = Array.isArray(cameraFramesState?.frames)
		? cameraFramesState.frames
		: [];

	return frames.map((frame, index) =>
		createFrameDocument({
			id: getFrameDocumentId(index + 1),
			name: resolveLegacyFrameName(frame, index),
			source: {
				x: isFiniteNumber(frame?.pos?.x) ? frame.pos.x : 0.5,
				y: isFiniteNumber(frame?.pos?.y) ? frame.pos.y : 0.5,
				scale:
					(isFiniteNumber(frame?.scaleK) && frame.scaleK > 0
						? frame.scaleK
						: Number(frame?.scalePct) / 100) || 1,
				rotation: isFiniteNumber(frame?.rotationDeg) ? frame.rotationDeg : 0,
				order: Number.isFinite(frame?.order) ? frame.order : index,
				anchor:
					frame?.anchor && typeof frame.anchor === "object"
						? { x: Number(frame.anchor.x), y: Number(frame.anchor.y) }
						: {
								x: isFiniteNumber(frame?.pos?.x) ? frame.pos.x : 0.5,
								y: isFiniteNumber(frame?.pos?.y) ? frame.pos.y : 0.5,
							},
			},
		}),
	);
}

function resolveLegacyActiveFrameId(mappedFrames, cameraFramesState) {
	const selectedFrame = mappedFrames.find((frame, index) => {
		const sourceFrame = cameraFramesState?.frames?.[index];
		return sourceFrame?.selected;
	});
	return selectedFrame?.id ?? mappedFrames[0]?.id ?? null;
}

function resolveLegacyHorizontalFov(
	projection,
	fallback = DEFAULT_CAMERA_FOV_X,
) {
	if (
		projection?.type === "perspective" &&
		isFiniteNumber(projection.baseFov) &&
		projection.baseFov > 0
	) {
		return projection.baseFov;
	}

	return fallback;
}

function normalizeLegacyExportFormat(value) {
	return value === "png" ? "png" : "psd";
}

function calcLegacyOrbitForward(yawDegrees, pitchDegrees) {
	const yaw = THREE.MathUtils.degToRad(Number(yawDegrees) || 0);
	const pitch = THREE.MathUtils.degToRad(clampPitch(pitchDegrees));
	const sinPitch = Math.sin(-pitch);
	const cosPitch = Math.cos(-pitch);
	const sinYaw = Math.sin(-yaw);
	const cosYaw = Math.cos(-yaw);

	return new THREE.Vector3(-cosPitch * sinYaw, sinPitch, cosPitch * cosYaw);
}

function buildLegacyCameraQuaternion(rotation) {
	const yawDegrees = Number(rotation?.yaw) || 0;
	const pitchDegrees = clampPitch(rotation?.pitch);
	const rollDegrees = Number(rotation?.roll) || 0;
	const yawPitch = new THREE.Quaternion().setFromEuler(
		new THREE.Euler(
			THREE.MathUtils.degToRad(pitchDegrees),
			THREE.MathUtils.degToRad(yawDegrees),
			0,
			LEGACY_CAMERA_EULER_ORDER,
		),
	);
	const rollAxis = new THREE.Vector3(0, 0, -1).applyQuaternion(yawPitch);
	if (rollAxis.lengthSq() <= EPSILON) {
		return yawPitch;
	}

	const roll = new THREE.Quaternion().setFromAxisAngle(
		rollAxis.normalize(),
		THREE.MathUtils.degToRad(rollDegrees),
	);
	return roll.multiply(yawPitch).normalize();
}

function buildLegacyCameraTransform(position, rotation) {
	const worldPosition = toVector3(position);
	if (!worldPosition) {
		return null;
	}

	return {
		position: worldPosition,
		quaternion: buildLegacyCameraQuaternion(rotation),
	};
}

function buildLegacyTransformFromPose(
	pose,
	sceneRadius = DEFAULT_SCENE_RADIUS,
) {
	if (!pose || typeof pose !== "object") {
		return null;
	}

	const focalPoint = toVector3(pose.focalPoint, new THREE.Vector3());
	const yaw = Number(pose.azim) || 0;
	const pitch = clampPitch(pose.elev);
	const roll = Number(pose.roll) || 0;
	const rotation = { yaw, pitch, roll };

	if (pose.navMode === "fpv" && pose.fpvPosition) {
		return buildLegacyCameraTransform(pose.fpvPosition, rotation);
	}

	const orbitForward = calcLegacyOrbitForward(yaw, pitch);
	const normalizedDistance = Number(pose.distance);
	const worldDistance =
		Number.isFinite(normalizedDistance) && normalizedDistance > 0
			? normalizedDistance * Math.max(sceneRadius, DEFAULT_SCENE_RADIUS)
			: Math.max(sceneRadius, DEFAULT_SCENE_RADIUS);
	const position = focalPoint.add(orbitForward.multiplyScalar(worldDistance));
	return buildLegacyCameraTransform(position, rotation);
}

function buildShotCameraImport({
	id,
	name,
	cameraFramesState,
	baseFov,
	nearClip,
	transform,
}) {
	const mappedFrames = mapLegacyFrames(cameraFramesState);
	const activeFrameId = resolveLegacyActiveFrameId(
		mappedFrames,
		cameraFramesState,
	);
	const outputFrame = mapLegacyOutputFrame(cameraFramesState);

	return {
		document: createShotCameraDocument({
			id,
			name,
			source: {
				lens: {
					baseFovX: resolveLegacyHorizontalFov(
						cameraFramesState?.renderBox?.projection,
						baseFov,
					),
				},
				clipping: {
					mode: "auto",
					near:
						isFiniteNumber(nearClip) && nearClip > 0
							? Math.max(DEFAULT_CAMERA_NEAR, nearClip)
							: DEFAULT_CAMERA_NEAR,
					far: DEFAULT_CAMERA_FAR,
				},
				outputFrame,
				exportSettings: {
					exportName:
						typeof cameraFramesState?.exportName === "string"
							? cameraFramesState.exportName
							: "",
					exportFormat: normalizeLegacyExportFormat(
						cameraFramesState?.exportFormat,
					),
					exportGridOverlay: Boolean(cameraFramesState?.exportGridOverlay),
					exportModelLayers: cameraFramesState?.exportModelLayers !== false,
					exportSplatLayers: Boolean(cameraFramesState?.exportSplatLayers),
				},
				frames: mappedFrames,
				activeFrameId,
			},
		}),
		transform,
	};
}

export function buildLegacyProjectImport({
	cameraFramesState,
	sceneRadius = DEFAULT_SCENE_RADIUS,
}) {
	if (!cameraFramesState || typeof cameraFramesState !== "object") {
		return null;
	}

	const presets = Array.isArray(cameraFramesState.cameraPresets)
		? cameraFramesState.cameraPresets
		: [];
	const shots = [];
	const presetIdToShotId = new Map();

	for (let index = 0; index < presets.length; index += 1) {
		const preset = presets[index];
		const transform = buildLegacyCameraTransform(
			preset?.mainCamera?.transform?.position,
			preset?.mainCamera?.transform?.rotation,
		);
		if (!transform) {
			continue;
		}

		const presetState =
			preset?.cameraFramesState && typeof preset.cameraFramesState === "object"
				? preset.cameraFramesState
				: cameraFramesState;
		shots.push(
			buildShotCameraImport({
				id: getShotCameraDocumentId(shots.length + 1),
				name:
					typeof preset?.name === "string" && preset.name.trim()
						? preset.name.trim()
						: `Camera ${shots.length + 1}`,
				cameraFramesState: presetState,
				baseFov: preset?.mainCamera?.projection?.baseFov,
				nearClip: preset?.mainCamera?.nearClip ?? presetState?.nearClip ?? null,
				transform,
			}),
		);
		if (typeof preset?.id === "string" && preset.id) {
			presetIdToShotId.set(preset.id, shots.at(-1).document.id);
		}
	}

	if (shots.length === 0) {
		const fallbackTransform = buildLegacyTransformFromPose(
			cameraFramesState.mainCameraPose,
			sceneRadius,
		);
		if (fallbackTransform) {
			shots.push(
				buildShotCameraImport({
					id: getShotCameraDocumentId(1),
					name: "Camera 1",
					cameraFramesState,
					baseFov: cameraFramesState?.renderBox?.projection?.baseFov,
					nearClip: cameraFramesState?.nearClip ?? null,
					transform: fallbackTransform,
				}),
			);
		}
	}

	if (shots.length === 0) {
		return null;
	}

	let activeShotCameraId = shots[0].document.id;
	if (typeof cameraFramesState.selectedPresetId === "string") {
		const resolvedShotId = presetIdToShotId.get(
			cameraFramesState.selectedPresetId,
		);
		if (resolvedShotId) {
			activeShotCameraId = resolvedShotId;
		}
	}

	return {
		shots,
		activeShotCameraId,
	};
}

function getLegacyAssetTransform(kind, legacyState) {
	if (!legacyState || typeof legacyState !== "object") {
		return null;
	}

	if (kind === "model") {
		return {
			position: toVector3(legacyState.transform?.position, new THREE.Vector3()),
			quaternion: toQuaternion(
				legacyState.transform?.rotation,
				new THREE.Quaternion(),
			),
			scale: toVector3(
				legacyState.transform?.scale,
				new THREE.Vector3(1, 1, 1),
			),
		};
	}

	return {
		position: toVector3(legacyState.position, new THREE.Vector3()),
		quaternion: toQuaternion(legacyState.rotation, new THREE.Quaternion()),
		scale: toVector3(legacyState.scale, new THREE.Vector3(1, 1, 1)),
	};
}

export function applyLegacyAssetState(object, kind, legacyState) {
	const transform = getLegacyAssetTransform(kind, legacyState);
	if (!object || !transform) {
		return false;
	}

	object.position.copy(transform.position);
	object.quaternion.copy(transform.quaternion);
	object.scale.copy(transform.scale);
	if (typeof legacyState.visible === "boolean") {
		object.visible = legacyState.visible;
	}
	if (typeof legacyState.name === "string" && legacyState.name.trim()) {
		object.name = legacyState.name.trim();
	}
	object.updateMatrixWorld(true);
	return true;
}

export function applyLegacyCameraTransform(camera, transform) {
	if (!camera || !transform) {
		return false;
	}

	camera.position.copy(transform.position);
	camera.quaternion.copy(transform.quaternion);
	camera.up.set(0, 1, 0);
	camera.updateMatrixWorld();
	return true;
}
