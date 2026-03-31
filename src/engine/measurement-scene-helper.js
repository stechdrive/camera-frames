import * as THREE from "three";

const SEGMENT_LENGTH_EPSILON = 1e-5;
const Y_AXIS = new THREE.Vector3(0, 1, 0);
const START_POINT_COLOR = new THREE.Color(0xffb067);
const END_POINT_COLOR = new THREE.Color(0xfff0c4);
const SELECTED_POINT_COLOR = new THREE.Color(0xffffff);
const DRAFT_POINT_COLOR = new THREE.Color(0xffcb86);
const FRONT_LINE_COLOR = new THREE.Color(0xffefcf);
const BACK_LINE_COLOR = new THREE.Color(0xffddaa);
const DRAFT_LINE_COLOR = new THREE.Color(0xffca79);

function createDotTexture(size = 32) {
	const pixelData = new Uint8Array(size * size * 4);
	const center = (size - 1) * 0.5;
	const radius = size * 0.32;
	const feather = size * 0.12;

	for (let y = 0; y < size; y += 1) {
		for (let x = 0; x < size; x += 1) {
			const dx = x - center;
			const dy = y - center;
			const distance = Math.hypot(dx, dy);
			const alpha = THREE.MathUtils.clamp(
				(radius + feather - distance) / Math.max(feather, 1e-6),
				0,
				1,
			);
			const index = (y * size + x) * 4;
			pixelData[index + 0] = 255;
			pixelData[index + 1] = 255;
			pixelData[index + 2] = 255;
			pixelData[index + 3] = Math.round(alpha * 255);
		}
	}

	const texture = new THREE.DataTexture(
		pixelData,
		size,
		size,
		THREE.RGBAFormat,
	);
	texture.needsUpdate = true;
	texture.colorSpace = THREE.SRGBColorSpace;
	texture.generateMipmaps = false;
	texture.magFilter = THREE.LinearFilter;
	texture.minFilter = THREE.LinearFilter;
	return texture;
}

function createPointMaterial(texture, color, opacity = 1) {
	const material = new THREE.SpriteMaterial({
		map: texture,
		color,
		transparent: true,
		opacity,
		depthTest: false,
		depthWrite: false,
	});
	material.toneMapped = false;
	return material;
}

function createLineMaterial({ color, opacity, depthTest, renderOrder }) {
	const material = new THREE.MeshBasicMaterial({
		color,
		transparent: true,
		opacity,
		depthTest,
		depthWrite: false,
	});
	material.toneMapped = false;
	material.polygonOffset = depthTest;
	material.polygonOffsetFactor = depthTest ? -1 : 0;
	material.polygonOffsetUnits = depthTest ? -1 : 0;
	material.userData.renderOrder = renderOrder;
	return material;
}

function updatePointSprite(sprite, point, sizeWorld, color, opacity = 1) {
	const visible =
		point instanceof THREE.Vector3 &&
		Number.isFinite(sizeWorld) &&
		sizeWorld > SEGMENT_LENGTH_EPSILON;
	sprite.visible = visible;
	if (!visible) {
		return;
	}

	sprite.position.copy(point);
	sprite.scale.set(sizeWorld, sizeWorld, 1);
	sprite.material.color.copy(color);
	sprite.material.opacity = opacity;
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
	mesh.material.opacity = opacity;
}

export function createMeasurementSceneHelper() {
	const group = new THREE.Group();
	group.name = "MeasurementHelper";

	const pointTexture = createDotTexture();
	const segmentGeometry = new THREE.CylinderGeometry(1, 1, 1, 14, 1, false);

	const startPoint = new THREE.Sprite(
		createPointMaterial(pointTexture, START_POINT_COLOR, 0.96),
	);
	startPoint.name = "MeasurementStartPoint";
	startPoint.renderOrder = 1012;

	const endPoint = new THREE.Sprite(
		createPointMaterial(pointTexture, END_POINT_COLOR, 0.96),
	);
	endPoint.name = "MeasurementEndPoint";
	endPoint.renderOrder = 1012;

	const draftPoint = new THREE.Sprite(
		createPointMaterial(pointTexture, DRAFT_POINT_COLOR, 0.52),
	);
	draftPoint.name = "MeasurementDraftPoint";
	draftPoint.renderOrder = 1011;

	const lineBack = new THREE.Mesh(
		segmentGeometry,
		createLineMaterial({
			color: BACK_LINE_COLOR,
			opacity: 0.22,
			depthTest: false,
			renderOrder: 1000,
		}),
	);
	lineBack.name = "MeasurementSegmentBack";
	lineBack.renderOrder = 1000;

	const lineFront = new THREE.Mesh(
		segmentGeometry,
		createLineMaterial({
			color: FRONT_LINE_COLOR,
			opacity: 0.92,
			depthTest: true,
			renderOrder: 1001,
		}),
	);
	lineFront.name = "MeasurementSegmentFront";
	lineFront.renderOrder = 1001;

	const draftLine = new THREE.Mesh(
		segmentGeometry,
		createLineMaterial({
			color: DRAFT_LINE_COLOR,
			opacity: 0.55,
			depthTest: false,
			renderOrder: 1000,
		}),
	);
	draftLine.name = "MeasurementDraftSegment";
	draftLine.renderOrder = 1000;

	for (const entry of [
		startPoint,
		endPoint,
		draftPoint,
		lineBack,
		lineFront,
		draftLine,
	]) {
		entry.visible = false;
	}

	group.add(lineBack, lineFront, draftLine, startPoint, endPoint, draftPoint);

	function clear() {
		group.visible = false;
		for (const entry of [
			startPoint,
			endPoint,
			draftPoint,
			lineBack,
			lineFront,
			draftLine,
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
		const pointSizeWorld = pointRadiusWorld * 2;
		const selectedPointSizeWorld = pointSizeWorld * 1.22;

		updatePointSprite(
			startPoint,
			startPointWorld,
			startSelected ? selectedPointSizeWorld : pointSizeWorld,
			startSelected ? SELECTED_POINT_COLOR : START_POINT_COLOR,
			startSelected ? 1 : 0.96,
		);
		updatePointSprite(
			endPoint,
			endPointWorld,
			endSelected ? selectedPointSizeWorld : pointSizeWorld,
			endSelected ? SELECTED_POINT_COLOR : END_POINT_COLOR,
			endSelected ? 1 : 0.96,
		);
		updatePointSprite(
			draftPoint,
			endPointWorld ? null : draftEndPointWorld,
			pointSizeWorld,
			DRAFT_POINT_COLOR,
			0.52,
		);
		updateSegmentMesh(
			lineBack,
			startPointWorld,
			endPointWorld,
			lineRadiusWorld * 0.56,
			BACK_LINE_COLOR,
			0.22,
		);
		updateSegmentMesh(
			lineFront,
			startPointWorld,
			endPointWorld,
			lineRadiusWorld,
			FRONT_LINE_COLOR,
			0.92,
		);
		updateSegmentMesh(
			draftLine,
			endPointWorld ? null : startPointWorld,
			endPointWorld ? null : draftEndPointWorld,
			lineRadiusWorld * 0.68,
			DRAFT_LINE_COLOR,
			0.55,
		);

		group.visible =
			startPoint.visible ||
			endPoint.visible ||
			draftPoint.visible ||
			lineBack.visible ||
			lineFront.visible ||
			draftLine.visible;
	}

	return {
		group,
		clear,
		sync,
		dispose() {
			group.removeFromParent();
			pointTexture.dispose();
			segmentGeometry.dispose();
			startPoint.material.dispose();
			endPoint.material.dispose();
			draftPoint.material.dispose();
			lineBack.material.dispose();
			lineFront.material.dispose();
			draftLine.material.dispose();
		},
	};
}
