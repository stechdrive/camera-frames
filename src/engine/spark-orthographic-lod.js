import * as THREE from "three";
import { VIEWPORT_ORTHO_REFERENCE_DISTANCE_USER_DATA_KEY } from "./viewport-orthographic.js";

const MIN_EQUIVALENT_HALF_EXTENT = 1e-6;
const MIN_EQUIVALENT_DISTANCE = 0.05;

function getOrthographicHalfExtent(valueA, valueB, zoom) {
	return Math.max(
		Math.abs((Number(valueA) - Number(valueB)) * 0.5) /
			Math.max(Number(zoom) || 0, 1e-6),
		MIN_EQUIVALENT_HALF_EXTENT,
	);
}

function getOrthographicReferenceDistance(camera) {
	return Math.max(
		Number(
			camera?.userData?.[VIEWPORT_ORTHO_REFERENCE_DISTANCE_USER_DATA_KEY],
		) || 0,
		MIN_EQUIVALENT_DISTANCE,
	);
}

export function createSparkOrthographicLodCamera(
	inputCamera,
	reusableCamera = null,
) {
	if (!inputCamera?.isOrthographicCamera) {
		return inputCamera ?? null;
	}
	const halfHeight = getOrthographicHalfExtent(
		inputCamera.top,
		inputCamera.bottom,
		inputCamera.zoom,
	);
	const halfWidth = getOrthographicHalfExtent(
		inputCamera.right,
		inputCamera.left,
		inputCamera.zoom,
	);
	const referenceDistance = getOrthographicReferenceDistance(inputCamera);
	const camera = reusableCamera?.isPerspectiveCamera
		? reusableCamera
		: new THREE.PerspectiveCamera();
	camera.near = inputCamera.near;
	camera.far = inputCamera.far;
	camera.aspect = Math.max(halfWidth / halfHeight, 1e-6);
	camera.fov = THREE.MathUtils.clamp(
		THREE.MathUtils.radToDeg(Math.atan2(halfHeight, referenceDistance) * 2),
		1e-3,
		179.999,
	);
	camera.zoom = 1;
	camera.position.copy(inputCamera.position);
	camera.quaternion.copy(inputCamera.quaternion);
	camera.scale.copy(inputCamera.scale);
	camera.up.copy(inputCamera.up);
	camera.updateProjectionMatrix();
	camera.updateMatrixWorld(true);
	return camera;
}

export function patchSparkOrthographicLod(spark) {
	if (
		!spark ||
		typeof spark.driveLod !== "function" ||
		spark.__cameraFramesOrthoLodPatched
	) {
		return spark;
	}
	const originalDriveLod = spark.driveLod;
	const reusableCamera = new THREE.PerspectiveCamera();
	spark.driveLod = function patchedSparkDriveLod(options = {}) {
		const camera = createSparkOrthographicLodCamera(
			options.camera,
			reusableCamera,
		);
		return originalDriveLod.call(this, {
			...options,
			camera,
		});
	};
	Object.defineProperty(spark, "__cameraFramesOrthoLodPatched", {
		value: true,
		configurable: false,
		enumerable: false,
		writable: false,
	});
	return spark;
}
