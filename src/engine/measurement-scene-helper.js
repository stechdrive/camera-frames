import * as THREE from "three";

const SEGMENT_LENGTH_EPSILON = 1e-5;
const Y_AXIS = new THREE.Vector3(0, 1, 0);
const START_POINT_COLOR = new THREE.Color(0xffb26d);
const END_POINT_COLOR = new THREE.Color(0x7ddcff);
const SELECTED_POINT_COLOR = new THREE.Color(0xffffff);
const DRAFT_POINT_COLOR = new THREE.Color(0xffd7aa);
const OUTLINE_COLOR = new THREE.Color(0x050607);
const LINE_COLOR = new THREE.Color(0xfff1d8);
const DRAFT_LINE_COLOR = new THREE.Color(0xfff4df);

function createMarkerTexture(size = 64) {
	const pixelData = new Uint8Array(size * size * 4);
	const center = (size - 1) * 0.5;
	const centerDotRadius = size * 0.085;
	const ringInnerRadius = size * 0.265;
	const ringOuterRadius = size * 0.315;
	const feather = Math.max(size * 0.05, 1e-6);

	for (let y = 0; y < size; y += 1) {
		for (let x = 0; x < size; x += 1) {
			const dx = x - center;
			const dy = y - center;
			const distance = Math.hypot(dx, dy);
			const centerAlpha = THREE.MathUtils.clamp(
				(centerDotRadius + feather - distance) / feather,
				0,
				1,
			);
			const ringOuterAlpha = THREE.MathUtils.clamp(
				(ringOuterRadius + feather - distance) / feather,
				0,
				1,
			);
			const ringInnerAlpha = THREE.MathUtils.clamp(
				(distance - ringInnerRadius + feather) / feather,
				0,
				1,
			);
			const alpha = Math.max(centerAlpha, ringOuterAlpha * ringInnerAlpha);
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

function createLineMaterial(color, opacity = 1) {
	const material = new THREE.MeshBasicMaterial({
		color,
		transparent: true,
		opacity,
		depthTest: false,
		depthWrite: false,
	});
	material.toneMapped = false;
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

	const pointTexture = createMarkerTexture();
	const segmentGeometry = new THREE.CylinderGeometry(1, 1, 1, 14, 1, false);

	const startPointOutline = new THREE.Sprite(
		createPointMaterial(pointTexture, OUTLINE_COLOR, 0.96),
	);
	startPointOutline.name = "MeasurementStartPointOutline";
	startPointOutline.renderOrder = 1010;

	const startPoint = new THREE.Sprite(
		createPointMaterial(pointTexture, START_POINT_COLOR, 0.96),
	);
	startPoint.name = "MeasurementStartPoint";
	startPoint.renderOrder = 1011;

	const endPointOutline = new THREE.Sprite(
		createPointMaterial(pointTexture, OUTLINE_COLOR, 0.96),
	);
	endPointOutline.name = "MeasurementEndPointOutline";
	endPointOutline.renderOrder = 1010;

	const endPoint = new THREE.Sprite(
		createPointMaterial(pointTexture, END_POINT_COLOR, 0.96),
	);
	endPoint.name = "MeasurementEndPoint";
	endPoint.renderOrder = 1011;

	const draftPointOutline = new THREE.Sprite(
		createPointMaterial(pointTexture, OUTLINE_COLOR, 0.68),
	);
	draftPointOutline.name = "MeasurementDraftPointOutline";
	draftPointOutline.renderOrder = 1009;

	const draftPoint = new THREE.Sprite(
		createPointMaterial(pointTexture, DRAFT_POINT_COLOR, 0.62),
	);
	draftPoint.name = "MeasurementDraftPoint";
	draftPoint.renderOrder = 1010;

	const segmentOutline = new THREE.Mesh(
		segmentGeometry,
		createLineMaterial(OUTLINE_COLOR, 0.82),
	);
	segmentOutline.name = "MeasurementSegmentOutline";
	segmentOutline.renderOrder = 999;

	const segment = new THREE.Mesh(
		segmentGeometry,
		createLineMaterial(LINE_COLOR, 0.94),
	);
	segment.name = "MeasurementSegment";
	segment.renderOrder = 1000;

	const draftSegmentOutline = new THREE.Mesh(
		segmentGeometry,
		createLineMaterial(OUTLINE_COLOR, 0.46),
	);
	draftSegmentOutline.name = "MeasurementDraftSegmentOutline";
	draftSegmentOutline.renderOrder = 999;

	const draftSegment = new THREE.Mesh(
		segmentGeometry,
		createLineMaterial(DRAFT_LINE_COLOR, 0.54),
	);
	draftSegment.name = "MeasurementDraftSegment";
	draftSegment.renderOrder = 1000;

	for (const entry of [
		startPointOutline,
		startPoint,
		endPointOutline,
		endPoint,
		draftPointOutline,
		draftPoint,
		segmentOutline,
		segment,
		draftSegmentOutline,
		draftSegment,
	]) {
		entry.visible = false;
	}

	group.add(
		segmentOutline,
		segment,
		draftSegmentOutline,
		draftSegment,
		startPointOutline,
		startPoint,
		endPointOutline,
		endPoint,
		draftPointOutline,
		draftPoint,
	);

	function clear() {
		group.visible = false;
		for (const entry of [
			startPointOutline,
			startPoint,
			endPointOutline,
			endPoint,
			draftPointOutline,
			draftPoint,
			segmentOutline,
			segment,
			draftSegmentOutline,
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
		startPointRadiusWorld = 0,
		endPointRadiusWorld = 0,
		draftPointRadiusWorld = 0,
		lineRadiusWorld = 0,
	} = {}) {
		const startSelected = selectedPointKey === "start";
		const endSelected = selectedPointKey === "end";
		const startPointSizeWorld = startPointRadiusWorld * 4;
		const startOutlinePointSizeWorld = startPointSizeWorld * 1.18;
		const startSelectedPointSizeWorld = startPointSizeWorld * 1.08;
		const startSelectedOutlinePointSizeWorld =
			startOutlinePointSizeWorld * 1.04;
		const endPointSizeWorld = endPointRadiusWorld * 4;
		const endOutlinePointSizeWorld = endPointSizeWorld * 1.18;
		const endSelectedPointSizeWorld = endPointSizeWorld * 1.08;
		const endSelectedOutlinePointSizeWorld = endOutlinePointSizeWorld * 1.04;
		const draftPointSizeWorld = draftPointRadiusWorld * 4;
		const draftOutlinePointSizeWorld = draftPointSizeWorld * 1.18;

		updatePointSprite(
			startPointOutline,
			startPointWorld,
			startSelected
				? startSelectedOutlinePointSizeWorld
				: startOutlinePointSizeWorld,
			OUTLINE_COLOR,
			startSelected ? 1 : 0.96,
		);
		updatePointSprite(
			startPoint,
			startPointWorld,
			startSelected ? startSelectedPointSizeWorld : startPointSizeWorld,
			startSelected ? SELECTED_POINT_COLOR : START_POINT_COLOR,
			startSelected ? 1 : 0.96,
		);
		updatePointSprite(
			endPointOutline,
			endPointWorld,
			endSelected ? endSelectedOutlinePointSizeWorld : endOutlinePointSizeWorld,
			OUTLINE_COLOR,
			endSelected ? 1 : 0.96,
		);
		updatePointSprite(
			endPoint,
			endPointWorld,
			endSelected ? endSelectedPointSizeWorld : endPointSizeWorld,
			endSelected ? SELECTED_POINT_COLOR : END_POINT_COLOR,
			endSelected ? 1 : 0.96,
		);
		updatePointSprite(
			draftPointOutline,
			endPointWorld ? null : draftEndPointWorld,
			draftOutlinePointSizeWorld,
			OUTLINE_COLOR,
			0.68,
		);
		updatePointSprite(
			draftPoint,
			endPointWorld ? null : draftEndPointWorld,
			draftPointSizeWorld,
			DRAFT_POINT_COLOR,
			0.62,
		);
		updateSegmentMesh(
			segmentOutline,
			startPointWorld,
			endPointWorld,
			lineRadiusWorld * 1.2,
			OUTLINE_COLOR,
			0.82,
		);
		updateSegmentMesh(
			segment,
			startPointWorld,
			endPointWorld,
			lineRadiusWorld * 0.86,
			LINE_COLOR,
			0.94,
		);
		updateSegmentMesh(
			draftSegmentOutline,
			endPointWorld ? null : startPointWorld,
			endPointWorld ? null : draftEndPointWorld,
			lineRadiusWorld * 0.96,
			OUTLINE_COLOR,
			0.46,
		);
		updateSegmentMesh(
			draftSegment,
			endPointWorld ? null : startPointWorld,
			endPointWorld ? null : draftEndPointWorld,
			lineRadiusWorld * 0.72,
			DRAFT_LINE_COLOR,
			0.54,
		);

		group.visible =
			startPointOutline.visible ||
			startPoint.visible ||
			endPointOutline.visible ||
			endPoint.visible ||
			draftPointOutline.visible ||
			draftPoint.visible ||
			segmentOutline.visible ||
			segment.visible ||
			draftSegmentOutline.visible ||
			draftSegment.visible;
	}

	return {
		group,
		clear,
		sync,
		dispose() {
			group.removeFromParent();
			pointTexture.dispose();
			segmentGeometry.dispose();
			startPointOutline.material.dispose();
			startPoint.material.dispose();
			endPointOutline.material.dispose();
			endPoint.material.dispose();
			draftPointOutline.material.dispose();
			draftPoint.material.dispose();
			segmentOutline.material.dispose();
			segment.material.dispose();
			draftSegmentOutline.material.dispose();
			draftSegment.material.dispose();
		},
	};
}
