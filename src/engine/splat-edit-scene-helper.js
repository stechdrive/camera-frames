import * as THREE from "three";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";

const FRONT_COLOR = 0xc6fbff;
const MID_COLOR = 0x59c9ff;
const BACK_COLOR = 0xff9a62;
const BASE_COLOR = 0x2b586f;
const GRID_FRACTIONS = [1 / 3, 2 / 3];
const CAMERA_EPSILON = 1e-5;

function isFiniteVector3Like(value) {
	return (
		value &&
		Number.isFinite(value.x) &&
		Number.isFinite(value.y) &&
		Number.isFinite(value.z)
	);
}

function createLineLayer(name, color, opacity, lineWidth) {
	const geometry = new LineSegmentsGeometry();
	const material = new LineMaterial({
		color,
		transparent: true,
		opacity,
		linewidth: lineWidth,
		depthTest: false,
		depthWrite: false,
		toneMapped: false,
		worldUnits: false,
	});
	const lines = new LineSegments2(geometry, material);
	lines.name = name;
	lines.renderOrder = 80;
	lines.frustumCulled = false;
	lines.visible = false;
	return lines;
}

function buildBoxSegments(min, max) {
	const segments = [];
	const x0 = min.x;
	const y0 = min.y;
	const z0 = min.z;
	const x1 = max.x;
	const y1 = max.y;
	const z1 = max.z;
	const pushSegment = (ax, ay, az, bx, by, bz) => {
		segments.push([
			new THREE.Vector3(ax, ay, az),
			new THREE.Vector3(bx, by, bz),
		]);
	};

	pushSegment(x0, y0, z0, x1, y0, z0);
	pushSegment(x0, y1, z0, x1, y1, z0);
	pushSegment(x0, y0, z1, x1, y0, z1);
	pushSegment(x0, y1, z1, x1, y1, z1);
	pushSegment(x0, y0, z0, x0, y1, z0);
	pushSegment(x1, y0, z0, x1, y1, z0);
	pushSegment(x0, y0, z1, x0, y1, z1);
	pushSegment(x1, y0, z1, x1, y1, z1);
	pushSegment(x0, y0, z0, x0, y0, z1);
	pushSegment(x1, y0, z0, x1, y0, z1);
	pushSegment(x0, y1, z0, x0, y1, z1);
	pushSegment(x1, y1, z0, x1, y1, z1);

	for (const fraction of GRID_FRACTIONS) {
		const x = THREE.MathUtils.lerp(x0, x1, fraction);
		const y = THREE.MathUtils.lerp(y0, y1, fraction);
		const z = THREE.MathUtils.lerp(z0, z1, fraction);

		pushSegment(x0, y, z0, x0, y, z1);
		pushSegment(x0, y0, z, x0, y1, z);
		pushSegment(x1, y, z0, x1, y, z1);
		pushSegment(x1, y0, z, x1, y1, z);

		pushSegment(x, y0, z0, x, y0, z1);
		pushSegment(x0, y0, z, x1, y0, z);
		pushSegment(x, y1, z0, x, y1, z1);
		pushSegment(x0, y1, z, x1, y1, z);

		pushSegment(x, y0, z0, x, y1, z0);
		pushSegment(x0, y, z0, x1, y, z0);
		pushSegment(x, y0, z1, x, y1, z1);
		pushSegment(x0, y, z1, x1, y, z1);
	}

	return segments;
}

function updateGeometryPositions(geometry, positions) {
	geometry.setPositions(positions);
}

export function createSplatEditSceneHelper() {
	const group = new THREE.Group();
	group.name = "splat-edit-helper";

	const currentCenter = new THREE.Vector3();
	const currentSize = new THREE.Vector3(1, 1, 1);
	const currentMin = new THREE.Vector3(-0.5, -0.5, -0.5);
	const currentMax = new THREE.Vector3(0.5, 0.5, 0.5);
	const tempHalfSize = new THREE.Vector3();
	const tempMidpoint = new THREE.Vector3();
	const tempCameraSpaceCenter = new THREE.Vector3();
	const tempCameraSpaceMidpoint = new THREE.Vector3();
	const cameraMatrixSnapshot = new Float32Array(16);
	let hasCameraSnapshot = false;
	let segmentDefinitions = [];
	let helperVisible = false;
	let geometryDirty = true;
	let flatPositions = [];
	const currentResolution = new THREE.Vector2(1, 1);

	function setResolution(viewportSize = null) {
		const width = Math.max(
			1,
			Math.round(
				Number(viewportSize?.x ?? viewportSize?.width ?? currentResolution.x) ||
					1,
			),
		);
		const height = Math.max(
			1,
			Math.round(
				Number(
					viewportSize?.y ?? viewportSize?.height ?? currentResolution.y,
				) || 1,
			),
		);
		if (currentResolution.x === width && currentResolution.y === height) {
			return;
		}
		currentResolution.set(width, height);
		for (const lineLayer of [frontLines, midLines, backLines, baseLines]) {
			lineLayer.material.resolution.set(width, height);
		}
	}

	function refreshGeometry(camera = null) {
		const frontPositions = [];
		const midPositions = [];
		const backPositions = [];
		let centerDepth = 0;
		let depthThreshold = 0.001;

		if (camera?.matrixWorldInverse) {
			tempCameraSpaceCenter
				.copy(currentCenter)
				.applyMatrix4(camera.matrixWorldInverse);
			centerDepth = tempCameraSpaceCenter.z;
			depthThreshold = Math.max(0.01, currentSize.length() * 0.02);
		}

		for (const [startPoint, endPoint] of segmentDefinitions) {
			let targetPositions = midPositions;
			if (camera?.matrixWorldInverse) {
				tempMidpoint.copy(startPoint).add(endPoint).multiplyScalar(0.5);
				tempCameraSpaceMidpoint
					.copy(tempMidpoint)
					.applyMatrix4(camera.matrixWorldInverse);
				const depthDelta = tempCameraSpaceMidpoint.z - centerDepth;
				if (depthDelta > depthThreshold) {
					targetPositions = frontPositions;
				} else if (depthDelta < -depthThreshold) {
					targetPositions = backPositions;
				}
			}
			targetPositions.push(
				startPoint.x,
				startPoint.y,
				startPoint.z,
				endPoint.x,
				endPoint.y,
				endPoint.z,
			);
		}

		updateGeometryPositions(baseLines.geometry, flatPositions);
		updateGeometryPositions(frontLines.geometry, frontPositions);
		updateGeometryPositions(midLines.geometry, midPositions);
		updateGeometryPositions(backLines.geometry, backPositions);
		baseLines.visible = helperVisible && flatPositions.length > 0;
		frontLines.visible = helperVisible && frontPositions.length > 0;
		midLines.visible = helperVisible && midPositions.length > 0;
		backLines.visible = helperVisible && backPositions.length > 0;
		geometryDirty = !camera?.matrixWorldInverse;
	}

	function hasCameraChanged(camera) {
		if (!camera?.matrixWorldInverse?.elements) {
			return hasCameraSnapshot;
		}
		const nextElements = camera.matrixWorldInverse.elements;
		if (!hasCameraSnapshot) {
			cameraMatrixSnapshot.set(nextElements);
			hasCameraSnapshot = true;
			return true;
		}
		for (let index = 0; index < nextElements.length; index += 1) {
			if (
				Math.abs(nextElements[index] - cameraMatrixSnapshot[index]) >
				CAMERA_EPSILON
			) {
				cameraMatrixSnapshot.set(nextElements);
				return true;
			}
		}
		return false;
	}

	function syncCamera(camera, viewportSize = null) {
		if (!helperVisible) {
			return;
		}
		setResolution(viewportSize);
		if (geometryDirty || hasCameraChanged(camera)) {
			refreshGeometry(camera);
		}
	}

	const backLines = createLineLayer(
		"splat-edit-helper-back",
		BACK_COLOR,
		0.9,
		2.1,
	);
	const midLines = createLineLayer(
		"splat-edit-helper-mid",
		MID_COLOR,
		0.86,
		1.8,
	);
	const baseLines = createLineLayer(
		"splat-edit-helper-base",
		BASE_COLOR,
		0.42,
		1.5,
	);
	const frontLines = createLineLayer(
		"splat-edit-helper-front",
		FRONT_COLOR,
		0.98,
		2.6,
	);
	group.add(backLines, baseLines, midLines, frontLines);

	function sync({ visible = false, center = null, size = null } = {}) {
		if (
			!visible ||
			!isFiniteVector3Like(center) ||
			!isFiniteVector3Like(size)
		) {
			helperVisible = false;
			baseLines.visible = false;
			frontLines.visible = false;
			midLines.visible = false;
			backLines.visible = false;
			return;
		}
		currentCenter.copy(center);
		currentSize.set(
			Math.max(Number(size.x) || 0, 0.001),
			Math.max(Number(size.y) || 0, 0.001),
			Math.max(Number(size.z) || 0, 0.001),
		);
		tempHalfSize.copy(currentSize).multiplyScalar(0.5);
		currentMin.copy(currentCenter).sub(tempHalfSize);
		currentMax.copy(currentCenter).add(tempHalfSize);
		segmentDefinitions = buildBoxSegments(currentMin, currentMax);
		flatPositions = [];
		for (const [startPoint, endPoint] of segmentDefinitions) {
			flatPositions.push(
				startPoint.x,
				startPoint.y,
				startPoint.z,
				endPoint.x,
				endPoint.y,
				endPoint.z,
			);
		}
		helperVisible = true;
		geometryDirty = true;
		refreshGeometry(null);
	}

	function clear() {
		helperVisible = false;
		baseLines.visible = false;
		frontLines.visible = false;
		midLines.visible = false;
		backLines.visible = false;
	}

	function dispose() {
		group.remove(frontLines, midLines, backLines, baseLines);
		for (const lineLayer of [frontLines, midLines, backLines, baseLines]) {
			lineLayer.geometry?.dispose?.();
			lineLayer.material?.dispose?.();
		}
	}

	return {
		group,
		sync,
		syncCamera,
		clear,
		dispose,
	};
}
