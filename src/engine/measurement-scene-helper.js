import * as THREE from "three";

const SEGMENT_LENGTH_EPSILON = 1e-5;
const Y_AXIS = new THREE.Vector3(0, 1, 0);
const START_POINT_COLOR = new THREE.Color(0xffa86a);
const END_POINT_COLOR = new THREE.Color(0xfff1cf);
const SELECTED_POINT_COLOR = new THREE.Color(0xffffff);
const XRAY_POINT_COLOR = new THREE.Color(0x6fdcff);
const XRAY_SELECTED_POINT_COLOR = new THREE.Color(0xc6f6ff);
const DRAFT_POINT_COLOR = new THREE.Color(0xffcc8a);
const DRAFT_XRAY_POINT_COLOR = new THREE.Color(0x89e4ff);
const FRONT_LINE_COLOR = new THREE.Color(0xffe6bf);
const BACK_LINE_COLOR = new THREE.Color(0x6edcff);
const DRAFT_LINE_COLOR = new THREE.Color(0x97e7ff);

function createCircleTexture(
	size = 32,
	{
		outerRadiusFactor = 0.32,
		innerRadiusFactor = 0,
		featherFactor = 0.12,
	} = {},
) {
	const pixelData = new Uint8Array(size * size * 4);
	const center = (size - 1) * 0.5;
	const outerRadius = size * outerRadiusFactor;
	const innerRadius = Math.max(0, size * innerRadiusFactor);
	const feather = Math.max(size * featherFactor, 1e-6);

	for (let y = 0; y < size; y += 1) {
		for (let x = 0; x < size; x += 1) {
			const dx = x - center;
			const dy = y - center;
			const distance = Math.hypot(dx, dy);
			const outerAlpha = THREE.MathUtils.clamp(
				(outerRadius + feather - distance) / feather,
				0,
				1,
			);
			const innerAlpha =
				innerRadius > 0
					? THREE.MathUtils.clamp(
							(distance - innerRadius + feather) / feather,
							0,
							1,
						)
					: 1;
			const alpha = outerAlpha * innerAlpha;
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

function createPointMaterial(
	texture,
	color,
	opacity = 1,
	{ depthTest = false, polygonOffset = false } = {},
) {
	const material = new THREE.SpriteMaterial({
		map: texture,
		color,
		transparent: true,
		opacity,
		depthTest,
		depthWrite: false,
	});
	material.toneMapped = false;
	material.polygonOffset = polygonOffset;
	material.polygonOffsetFactor = polygonOffset ? -2 : 0;
	material.polygonOffsetUnits = polygonOffset ? -2 : 0;
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

	const pointTexture = createCircleTexture();
	const pointRingTexture = createCircleTexture(32, {
		outerRadiusFactor: 0.44,
		innerRadiusFactor: 0.24,
		featherFactor: 0.08,
	});
	const segmentGeometry = new THREE.CylinderGeometry(1, 1, 1, 14, 1, false);

	const startPointXray = new THREE.Sprite(
		createPointMaterial(pointRingTexture, XRAY_POINT_COLOR, 0.88),
	);
	startPointXray.name = "MeasurementStartPointXray";
	startPointXray.renderOrder = 1011;

	const startPointFront = new THREE.Sprite(
		createPointMaterial(pointTexture, START_POINT_COLOR, 0.98, {
			depthTest: true,
			polygonOffset: true,
		}),
	);
	startPointFront.name = "MeasurementStartPointFront";
	startPointFront.renderOrder = 1013;

	const endPointXray = new THREE.Sprite(
		createPointMaterial(pointRingTexture, XRAY_POINT_COLOR, 0.88),
	);
	endPointXray.name = "MeasurementEndPointXray";
	endPointXray.renderOrder = 1011;

	const endPointFront = new THREE.Sprite(
		createPointMaterial(pointTexture, END_POINT_COLOR, 0.98, {
			depthTest: true,
			polygonOffset: true,
		}),
	);
	endPointFront.name = "MeasurementEndPointFront";
	endPointFront.renderOrder = 1013;

	const draftPointXray = new THREE.Sprite(
		createPointMaterial(pointRingTexture, DRAFT_XRAY_POINT_COLOR, 0.66),
	);
	draftPointXray.name = "MeasurementDraftPointXray";
	draftPointXray.renderOrder = 1010;

	const draftPointFront = new THREE.Sprite(
		createPointMaterial(pointTexture, DRAFT_POINT_COLOR, 0.72, {
			depthTest: true,
			polygonOffset: true,
		}),
	);
	draftPointFront.name = "MeasurementDraftPointFront";
	draftPointFront.renderOrder = 1012;

	const lineBack = new THREE.Mesh(
		segmentGeometry,
		createLineMaterial({
			color: BACK_LINE_COLOR,
			opacity: 0.7,
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
			opacity: 0.96,
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
			opacity: 0.56,
			depthTest: false,
			renderOrder: 1000,
		}),
	);
	draftLine.name = "MeasurementDraftSegment";
	draftLine.renderOrder = 1000;

	for (const entry of [
		startPointXray,
		startPointFront,
		endPointXray,
		endPointFront,
		draftPointXray,
		draftPointFront,
		lineBack,
		lineFront,
		draftLine,
	]) {
		entry.visible = false;
	}

	group.add(
		lineBack,
		lineFront,
		draftLine,
		startPointXray,
		startPointFront,
		endPointXray,
		endPointFront,
		draftPointXray,
		draftPointFront,
	);

	function clear() {
		group.visible = false;
		for (const entry of [
			startPointXray,
			startPointFront,
			endPointXray,
			endPointFront,
			draftPointXray,
			draftPointFront,
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
		const pointSizeWorld = pointRadiusWorld * 1.72;
		const selectedPointSizeWorld = pointSizeWorld * 1.18;
		const pointRingSizeWorld = pointSizeWorld * 1.62;
		const selectedPointRingSizeWorld = pointRingSizeWorld * 1.08;

		updatePointSprite(
			startPointXray,
			startPointWorld,
			startSelected ? selectedPointRingSizeWorld : pointRingSizeWorld,
			startSelected ? XRAY_SELECTED_POINT_COLOR : XRAY_POINT_COLOR,
			startSelected ? 0.96 : 0.88,
		);
		updatePointSprite(
			startPointFront,
			startPointWorld,
			startSelected ? selectedPointSizeWorld : pointSizeWorld,
			startSelected ? SELECTED_POINT_COLOR : START_POINT_COLOR,
			startSelected ? 1 : 0.98,
		);
		updatePointSprite(
			endPointXray,
			endPointWorld,
			endSelected ? selectedPointRingSizeWorld : pointRingSizeWorld,
			endSelected ? XRAY_SELECTED_POINT_COLOR : XRAY_POINT_COLOR,
			endSelected ? 0.96 : 0.88,
		);
		updatePointSprite(
			endPointFront,
			endPointWorld,
			endSelected ? selectedPointSizeWorld : pointSizeWorld,
			endSelected ? SELECTED_POINT_COLOR : END_POINT_COLOR,
			endSelected ? 1 : 0.98,
		);
		updatePointSprite(
			draftPointXray,
			endPointWorld ? null : draftEndPointWorld,
			pointRingSizeWorld,
			DRAFT_XRAY_POINT_COLOR,
			0.66,
		);
		updatePointSprite(
			draftPointFront,
			endPointWorld ? null : draftEndPointWorld,
			pointSizeWorld,
			DRAFT_POINT_COLOR,
			0.72,
		);
		updateSegmentMesh(
			lineBack,
			startPointWorld,
			endPointWorld,
			lineRadiusWorld * 0.42,
			BACK_LINE_COLOR,
			0.7,
		);
		updateSegmentMesh(
			lineFront,
			startPointWorld,
			endPointWorld,
			lineRadiusWorld,
			FRONT_LINE_COLOR,
			0.96,
		);
		updateSegmentMesh(
			draftLine,
			endPointWorld ? null : startPointWorld,
			endPointWorld ? null : draftEndPointWorld,
			lineRadiusWorld * 0.44,
			DRAFT_LINE_COLOR,
			0.56,
		);

		group.visible =
			startPointXray.visible ||
			startPointFront.visible ||
			endPointXray.visible ||
			endPointFront.visible ||
			draftPointXray.visible ||
			draftPointFront.visible ||
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
			pointRingTexture.dispose();
			segmentGeometry.dispose();
			startPointXray.material.dispose();
			startPointFront.material.dispose();
			endPointXray.material.dispose();
			endPointFront.material.dispose();
			draftPointXray.material.dispose();
			draftPointFront.material.dispose();
			lineBack.material.dispose();
			lineFront.material.dispose();
			draftLine.material.dispose();
		},
	};
}
