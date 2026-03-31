import * as THREE from "three";

const SEGMENT_LENGTH_EPSILON = 1e-5;
const Y_AXIS = new THREE.Vector3(0, 1, 0);
const START_POINT_COLOR = new THREE.Color(0xffa85a);
const END_POINT_COLOR = new THREE.Color(0xffe2a8);
const SELECTED_POINT_COLOR = new THREE.Color(0xfff3d4);
const DRAFT_POINT_COLOR = new THREE.Color(0xffc57f);
const LINE_COLOR = new THREE.Color(0xffedc5);
const DRAFT_LINE_COLOR = new THREE.Color(0xffcb7d);

function createPointMaterial(color, opacity = 0.94) {
	const material = new THREE.MeshPhongMaterial({
		color,
		emissive: new THREE.Color(color).multiplyScalar(0.18),
		shininess: 48,
		specular: new THREE.Color(0xffffff),
		transparent: true,
		opacity,
		depthTest: true,
		depthWrite: false,
	});
	material.toneMapped = false;
	return material;
}

function createLineMaterial(color, opacity = 0.82) {
	const material = new THREE.MeshPhongMaterial({
		color,
		emissive: new THREE.Color(color).multiplyScalar(0.12),
		shininess: 32,
		specular: new THREE.Color(0xffffff),
		transparent: true,
		opacity,
		depthTest: true,
		depthWrite: false,
	});
	material.toneMapped = false;
	return material;
}

function updatePointMesh(mesh, point, radius, color, opacity = 0.94) {
	const visible =
		point instanceof THREE.Vector3 &&
		Number.isFinite(radius) &&
		radius > SEGMENT_LENGTH_EPSILON;
	mesh.visible = visible;
	if (!visible) {
		return;
	}

	mesh.position.copy(point);
	mesh.scale.setScalar(radius);
	mesh.material.color.copy(color);
	if (mesh.material.emissive) {
		mesh.material.emissive.copy(color).multiplyScalar(0.18);
	}
	mesh.material.opacity = opacity;
}

function updateSegmentMesh(mesh, startPoint, endPoint, radius, color, opacity) {
	const axis = new THREE.Vector3();
	const midpoint = new THREE.Vector3();

	const visible =
		startPoint instanceof THREE.Vector3 &&
		endPoint instanceof THREE.Vector3 &&
		Number.isFinite(radius) &&
		radius > SEGMENT_LENGTH_EPSILON;
	if (!visible) {
		mesh.visible = false;
		return;
	}

	axis.copy(endPoint).sub(startPoint);
	const length = axis.length();
	if (!Number.isFinite(length) || length <= SEGMENT_LENGTH_EPSILON) {
		mesh.visible = false;
		return;
	}

	axis.divideScalar(length);
	midpoint.copy(startPoint).lerp(endPoint, 0.5);
	mesh.visible = true;
	mesh.position.copy(midpoint);
	mesh.quaternion.setFromUnitVectors(Y_AXIS, axis);
	mesh.scale.set(radius, length, radius);
	mesh.material.color.copy(color);
	if (mesh.material.emissive) {
		mesh.material.emissive.copy(color).multiplyScalar(0.12);
	}
	mesh.material.opacity = opacity;
}

export function createMeasurementSceneHelper() {
	const group = new THREE.Group();
	group.name = "MeasurementHelper";

	const pointGeometry = new THREE.SphereGeometry(1, 22, 16);
	const segmentGeometry = new THREE.CylinderGeometry(1, 1, 1, 16, 1, false);

	const startPoint = new THREE.Mesh(
		pointGeometry,
		createPointMaterial(START_POINT_COLOR, 0.94),
	);
	startPoint.name = "MeasurementStartPoint";

	const endPoint = new THREE.Mesh(
		pointGeometry,
		createPointMaterial(END_POINT_COLOR, 0.94),
	);
	endPoint.name = "MeasurementEndPoint";

	const draftPoint = new THREE.Mesh(
		pointGeometry,
		createPointMaterial(DRAFT_POINT_COLOR, 0.42),
	);
	draftPoint.name = "MeasurementDraftPoint";

	const segment = new THREE.Mesh(
		segmentGeometry,
		createLineMaterial(LINE_COLOR, 0.82),
	);
	segment.name = "MeasurementSegment";

	const draftSegment = new THREE.Mesh(
		segmentGeometry,
		createLineMaterial(DRAFT_LINE_COLOR, 0.36),
	);
	draftSegment.name = "MeasurementDraftSegment";

	for (const entry of [
		startPoint,
		endPoint,
		draftPoint,
		segment,
		draftSegment,
	]) {
		entry.visible = false;
	}

	group.add(draftSegment, segment, startPoint, endPoint, draftPoint);

	function clear() {
		group.visible = false;
		for (const entry of [
			startPoint,
			endPoint,
			draftPoint,
			segment,
			draftSegment,
		]) {
			entry.visible = false;
		}
	}

	function sync({
		startPointWorld = null,
		endPointWorld = null,
		draftEndPointWorld = null,
		selectedPointKey = null,
		pointRadiusWorld = 0,
		lineRadiusWorld = 0,
	} = {}) {
		const startSelected = selectedPointKey === "start";
		const endSelected = selectedPointKey === "end";
		const startRadius = pointRadiusWorld * (startSelected ? 1.26 : 1);
		const endRadius = pointRadiusWorld * (endSelected ? 1.26 : 1);

		updatePointMesh(
			startPoint,
			startPointWorld,
			startRadius,
			startSelected ? SELECTED_POINT_COLOR : START_POINT_COLOR,
			startSelected ? 0.98 : 0.94,
		);
		updatePointMesh(
			endPoint,
			endPointWorld,
			endRadius,
			endSelected ? SELECTED_POINT_COLOR : END_POINT_COLOR,
			endSelected ? 0.98 : 0.94,
		);
		updatePointMesh(
			draftPoint,
			endPointWorld ? null : draftEndPointWorld,
			pointRadiusWorld,
			DRAFT_POINT_COLOR,
			0.42,
		);
		updateSegmentMesh(
			segment,
			startPointWorld,
			endPointWorld,
			lineRadiusWorld,
			LINE_COLOR,
			0.82,
		);
		updateSegmentMesh(
			draftSegment,
			endPointWorld ? null : startPointWorld,
			endPointWorld ? null : draftEndPointWorld,
			lineRadiusWorld,
			DRAFT_LINE_COLOR,
			0.36,
		);

		group.visible =
			startPoint.visible ||
			endPoint.visible ||
			draftPoint.visible ||
			segment.visible ||
			draftSegment.visible;
	}

	return {
		group,
		clear,
		sync,
		dispose() {
			group.removeFromParent();
			pointGeometry.dispose();
			segmentGeometry.dispose();
			startPoint.material.dispose();
			endPoint.material.dispose();
			draftPoint.material.dispose();
			segment.material.dispose();
			draftSegment.material.dispose();
		},
	};
}
