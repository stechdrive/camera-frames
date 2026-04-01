import assert from "node:assert/strict";
import * as THREE from "three";
import {
	AXIS_KEYS,
	buildPlaneHandlePath,
	buildRotateArcPath,
	createPlaneFromNormalAndPoint,
	getCameraWorldDirection,
	getCameraWorldUp,
	getHandleAxisKey,
	getNdcFromPointer,
	getProjectedAxisDirection,
	getRingFrontAngle,
	getSignedAngleAroundAxis,
	getWorldUnitsPerPixel,
	isProjectedPointVisible,
	projectWorldToScreen,
	scaleLocalPoint,
} from "../src/controllers/viewport-tool/gizmo-geometry.js";

const VIEWPORT_RECT = {
	left: 10,
	top: 20,
	width: 200,
	height: 100,
};

function createOrthographicCamera() {
	const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
	camera.position.set(0, 0, 10);
	camera.lookAt(0, 0, 0);
	camera.updateProjectionMatrix();
	camera.updateMatrixWorld(true);
	return camera;
}

function createPerspectiveCamera() {
	const camera = new THREE.PerspectiveCamera(90, 2, 0.1, 100);
	camera.position.set(0, 0, 10);
	camera.lookAt(0, 0, 0);
	camera.updateProjectionMatrix();
	camera.updateMatrixWorld(true);
	return camera;
}

assert.deepEqual(AXIS_KEYS, ["x", "y", "z"]);
assert.equal(getHandleAxisKey("move-x"), "x");
assert.equal(getHandleAxisKey("rotate-z"), "z");
assert.equal(getHandleAxisKey("move-xy"), null);

{
	const camera = createOrthographicCamera();
	const projected = projectWorldToScreen(
		new THREE.Vector3(0.5, 0.5, 0),
		camera,
		VIEWPORT_RECT,
		new THREE.Vector3(),
	);

	assert.equal(projected.x, 150);
	assert.equal(projected.y, 25);
	assert.ok(Math.abs(projected.z + 0.8018018018018018) < 1e-12);
	assert.equal(isProjectedPointVisible(new THREE.Vector3(0, 0, 0)), true);
	assert.equal(isProjectedPointVisible(new THREE.Vector3(0, 0, 2)), false);
}

{
	const camera = createPerspectiveCamera();
	const direction = getCameraWorldDirection(camera, new THREE.Vector3());
	const up = getCameraWorldUp(camera, new THREE.Vector3());

	assert.ok(direction.distanceTo(new THREE.Vector3(0, 0, -1)) < 1e-9);
	assert.ok(up.distanceTo(new THREE.Vector3(0, 1, 0)) < 1e-9);
	assert.ok(
		Math.abs(
			getSignedAngleAroundAxis(
				new THREE.Vector3(1, 0, 0),
				new THREE.Vector3(0, 1, 0),
				new THREE.Vector3(0, 0, 1),
			) -
				Math.PI / 2,
		) < 1e-9,
	);
}

{
	const ndc = getNdcFromPointer(
		{ clientX: 110, clientY: 70 },
		VIEWPORT_RECT,
		new THREE.Vector2(),
	);
	const plane = createPlaneFromNormalAndPoint(
		new THREE.Vector3(0, 0, 2),
		new THREE.Vector3(0, 0, 3),
		new THREE.Plane(),
	);

	assert.ok(Math.abs(ndc.x) < 1e-12);
	assert.ok(Math.abs(ndc.y) < 1e-12);
	assert.ok(plane.normal.distanceTo(new THREE.Vector3(0, 0, 1)) < 1e-9);
	assert.equal(Math.round(plane.constant), -3);
}

{
	const orthoCamera = createOrthographicCamera();
	const perspectiveCamera = createPerspectiveCamera();
	const pivotWorld = new THREE.Vector3(0, 0, 0);

	assert.equal(
		getWorldUnitsPerPixel(orthoCamera, pivotWorld, VIEWPORT_RECT),
		0.02,
	);
	assert.ok(
		Math.abs(
			getWorldUnitsPerPixel(perspectiveCamera, pivotWorld, VIEWPORT_RECT) - 0.2,
		) < 1e-9,
	);
}

{
	const camera = createOrthographicCamera();
	const pivotWorld = new THREE.Vector3(0, 0, 0);
	const axisDirection = getProjectedAxisDirection({
		axisWorld: new THREE.Vector3(1, 0, 0),
		pivotWorld,
		camera,
		viewportRect: VIEWPORT_RECT,
		pixelDistance: 20,
	});
	const frontAngle = getRingFrontAngle({
		pivotWorld,
		camera,
		axisWorld: new THREE.Vector3(1, 0, 0),
		tangentU: new THREE.Vector3(0, 1, 0),
		tangentV: new THREE.Vector3(0, 0, 1),
	});
	const rotatePath = buildRotateArcPath({
		pivotWorld,
		camera,
		viewportRect: VIEWPORT_RECT,
		tangentU: new THREE.Vector3(1, 0, 0),
		tangentV: new THREE.Vector3(0, 1, 0),
		startAngle: 0,
		endAngle: Math.PI / 2,
	});
	const planePath = buildPlaneHandlePath({
		pivotWorld,
		camera,
		viewportRect: VIEWPORT_RECT,
		axisA: new THREE.Vector3(1, 0, 0),
		axisB: new THREE.Vector3(0, 1, 0),
	});

	assert.ok(axisDirection);
	assert.ok(axisDirection.distanceTo(new THREE.Vector2(1, 0)) < 1e-9);
	assert.ok(Math.abs(frontAngle - Math.PI / 2) < 1e-9);
	assert.ok(rotatePath?.startsWith("M 288.00 50.00 L"));
	assert.equal(
		planePath,
		"M 116.00 42.00 L 144.00 42.00 L 144.00 28.00 L 116.00 28.00 Z",
	);
}

{
	const scaled = scaleLocalPoint(
		new THREE.Vector3(1, 2, 3),
		new THREE.Vector3(4, 5, 6),
	);
	assert.deepEqual(scaled.toArray(), [4, 10, 18]);
}

console.log("✅ CAMERA_FRAMES viewport tool gizmo geometry tests passed!");
