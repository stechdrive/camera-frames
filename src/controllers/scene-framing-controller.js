import * as THREE from "three";
import { DEFAULT_CAMERA_FAR, DEFAULT_FPS_MOVE_SPEED } from "../constants.js";
import { getAutoClipRangeFromBounds } from "../engine/clip-range.js";

const VIEWPORT_HOME_POSITION = new THREE.Vector3(2.4, 1.8, 4.2);
const VIEWPORT_HOME_TARGET = new THREE.Vector3(0, 1.0, 0);
const SHOT_HOME_POSITION = new THREE.Vector3(1.2, 1.5, 3.0);
const SHOT_HOME_TARGET = new THREE.Vector3(0, 1.0, 0);

export function createSceneFramingController({
	getSceneBounds,
	getSceneFramingBounds,
	viewportCamera,
	shotCameraRegistry,
	syncShotCameraEntryFromDocument,
	syncControlsToMode,
	fpsMovement = null,
}) {
	function getFramingBounds() {
		return getSceneFramingBounds?.() ?? getSceneBounds();
	}

	function getSceneFraming() {
		const bounds = getFramingBounds();
		if (!bounds) {
			return {
				center: new THREE.Vector3(0, 0, 0),
				radius: 1,
			};
		}

		const center = bounds.box.getCenter(new THREE.Vector3());
		const size = bounds.size;
		return {
			center,
			radius: Math.max(size.length() * 0.35, 0.6),
		};
	}

	function getAutoClipRange(camera = viewportCamera) {
		const bounds = getSceneBounds();
		const framingBounds = getFramingBounds();
		const { radius } = getSceneFraming();
		return getAutoClipRangeFromBounds({
			box: bounds?.box ?? null,
			framingBox: framingBounds?.box ?? null,
			camera,
			cameraPosition: camera?.position ?? { x: 0, y: 0, z: 0 },
			framingRadius: radius,
		});
	}

	function updateViewportMoveSpeed(radius) {
		if (!fpsMovement) {
			return;
		}

		const nextMoveSpeed = THREE.MathUtils.clamp(
			Math.max(radius / 12, DEFAULT_FPS_MOVE_SPEED),
			DEFAULT_FPS_MOVE_SPEED,
			500,
		);
		fpsMovement.moveSpeed = nextMoveSpeed;
	}

	function getHomePose(variant) {
		return variant === "camera"
			? {
					position: SHOT_HOME_POSITION,
					target: SHOT_HOME_TARGET,
				}
			: {
					position: VIEWPORT_HOME_POSITION,
					target: VIEWPORT_HOME_TARGET,
				};
	}

	function placeCameraAtHome(camera, variant) {
		const { position, target } = getHomePose(variant);
		camera.position.copy(position);
		camera.lookAt(target);
		camera.updateMatrixWorld();
		if (variant === "viewport") {
			const autoClip = getAutoClipRange(camera);
			camera.near = autoClip.near;
			camera.far = Math.max(autoClip.far, DEFAULT_CAMERA_FAR);
		}
	}

	function copyPose(sourceCamera, destinationCamera) {
		destinationCamera.position.copy(sourceCamera.position);
		destinationCamera.quaternion.copy(sourceCamera.quaternion);
		destinationCamera.up.copy(sourceCamera.up);
		destinationCamera.updateMatrixWorld();
	}

	function frameCamera(camera, variant) {
		const { center, radius } = getSceneFraming();
		const offset =
			variant === "camera"
				? new THREE.Vector3(
						radius * 0.12,
						radius * 0.08,
						Math.max(radius * 2.3, 2),
					)
				: new THREE.Vector3(
						radius * 1.5,
						radius * 0.9,
						Math.max(radius * 2.6, 2.8),
					);

		camera.position.copy(center).add(offset);
		if (variant === "viewport") {
			const autoClip = getAutoClipRange(camera);
			camera.near = autoClip.near;
			camera.far = Math.max(autoClip.far, DEFAULT_CAMERA_FAR);
		}
		camera.lookAt(center);
		camera.updateMatrixWorld();
	}

	function frameAllCameras() {
		const { radius } = getSceneFraming();
		for (const entry of shotCameraRegistry.values()) {
			frameCamera(entry.camera, "camera");
			syncShotCameraEntryFromDocument(entry);
		}
		frameCamera(viewportCamera, "viewport");
		updateViewportMoveSpeed(radius);
		syncControlsToMode();
	}

	function placeAllCamerasAtHome() {
		for (const entry of shotCameraRegistry.values()) {
			placeCameraAtHome(entry.camera, "camera");
			syncShotCameraEntryFromDocument(entry);
		}
		placeCameraAtHome(viewportCamera, "viewport");
		if (fpsMovement) {
			fpsMovement.moveSpeed = DEFAULT_FPS_MOVE_SPEED;
		}
		syncControlsToMode();
	}

	return {
		getAutoClipRange,
		copyPose,
		placeCameraAtHome,
		placeAllCamerasAtHome,
		frameCamera,
		frameAllCameras,
	};
}
