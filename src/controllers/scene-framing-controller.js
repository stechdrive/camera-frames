import * as THREE from "three";
import { DEFAULT_CAMERA_FAR } from "../constants.js";
import { getAutoClipRangeFromBounds } from "../engine/clip-range.js";

export function createSceneFramingController({
	getSceneBounds,
	viewportCamera,
	shotCameraRegistry,
	syncShotCameraEntryFromDocument,
	syncControlsToMode,
}) {
	function getSceneFraming() {
		const bounds = getSceneBounds();
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
		const { radius } = getSceneFraming();
		return getAutoClipRangeFromBounds({
			box: bounds?.box ?? null,
			camera,
			cameraPosition: camera?.position ?? { x: 0, y: 0, z: 0 },
			framingRadius: radius,
		});
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
		for (const entry of shotCameraRegistry.values()) {
			frameCamera(entry.camera, "camera");
			syncShotCameraEntryFromDocument(entry);
		}
		frameCamera(viewportCamera, "viewport");
		syncControlsToMode();
	}

	return {
		getAutoClipRange,
		copyPose,
		frameCamera,
		frameAllCameras,
	};
}
