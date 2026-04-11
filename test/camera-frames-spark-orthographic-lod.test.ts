import assert from "node:assert/strict";
import * as THREE from "three";
import {
	createSparkOrthographicLodCamera,
	patchSparkOrthographicLod,
} from "../src/engine/spark-orthographic-lod.js";
import { VIEWPORT_ORTHO_REFERENCE_DISTANCE_USER_DATA_KEY } from "../src/engine/viewport-orthographic.js";

{
	const orthographicCamera = new THREE.OrthographicCamera(
		-4,
		4,
		2,
		-2,
		0.1,
		1000,
	);
	orthographicCamera.position.set(10, 20, 30);
	orthographicCamera.quaternion.setFromEuler(new THREE.Euler(0.2, 0.3, 0.4));
	orthographicCamera.userData[VIEWPORT_ORTHO_REFERENCE_DISTANCE_USER_DATA_KEY] =
		8;
	orthographicCamera.updateMatrixWorld(true);

	const lodCamera = createSparkOrthographicLodCamera(orthographicCamera);
	const expectedFov = THREE.MathUtils.radToDeg(Math.atan2(2, 8) * 2);

	assert.ok(lodCamera?.isPerspectiveCamera);
	assert.equal(lodCamera.aspect, 2);
	assert.ok(Math.abs(lodCamera.fov - expectedFov) < 1e-9);
	assert.deepEqual(lodCamera.position.toArray(), [10, 20, 30]);
	assert.ok(
		Math.abs(
			Math.abs(lodCamera.quaternion.dot(orthographicCamera.quaternion)) - 1,
		) < 1e-9,
	);
}

{
	const perspectiveCamera = new THREE.PerspectiveCamera(50, 1.5, 0.1, 100);
	assert.equal(
		createSparkOrthographicLodCamera(perspectiveCamera),
		perspectiveCamera,
	);
}

{
	let receivedCamera = null;
	const spark = {
		driveLod({ camera }) {
			receivedCamera = camera;
			return camera;
		},
	};
	patchSparkOrthographicLod(spark);

	const orthographicCamera = new THREE.OrthographicCamera(
		-3,
		3,
		1.5,
		-1.5,
		0.1,
		500,
	);
	orthographicCamera.userData[VIEWPORT_ORTHO_REFERENCE_DISTANCE_USER_DATA_KEY] =
		6;
	orthographicCamera.updateMatrixWorld(true);
	spark.driveLod({
		camera: orthographicCamera,
		visibleGenerators: [],
		scene: null,
	});

	assert.ok(receivedCamera?.isPerspectiveCamera);
	assert.notEqual(receivedCamera, orthographicCamera);

	const perspectiveCamera = new THREE.PerspectiveCamera(40, 1.2, 0.1, 200);
	spark.driveLod({
		camera: perspectiveCamera,
		visibleGenerators: [],
		scene: null,
	});
	assert.equal(receivedCamera, perspectiveCamera);
}

console.log("✅ CAMERA_FRAMES spark orthographic LOD tests passed!");
