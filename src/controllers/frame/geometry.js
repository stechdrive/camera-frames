import { ANCHORS, BASE_FRAME } from "../../constants.js";
import { getFrameOutlineSpec } from "../../engine/frame-overlay.js";
import {
	FRAME_MAX_SCALE,
	FRAME_MIN_SCALE,
	getFrameAnchorLocalNormalized,
	getFrameDocumentCenterFromWorld,
	getPointsBounds,
	getRectCornersFromAnchor,
	normalizeRotationDegrees,
} from "../../engine/frame-transform.js";

export function resolveFrameAxis(value) {
	return Number.isFinite(value) ? value : 0;
}

export function resolveFrameScale(value) {
	const nextValue = Number(value);
	return Number.isFinite(nextValue) && nextValue > 0
		? Math.min(FRAME_MAX_SCALE, Math.max(FRAME_MIN_SCALE, nextValue))
		: 1;
}

export function resolveFrameAnchor(value, fallback = null) {
	const fallbackAnchor = fallback ?? { x: 0.5, y: 0.5 };
	const nextAnchor =
		value && typeof value === "object"
			? value
			: typeof value === "string" && ANCHORS[value]
				? ANCHORS[value]
				: fallbackAnchor;

	return {
		x: resolveFrameAxis(nextAnchor.x ?? fallbackAnchor.x),
		y: resolveFrameAxis(nextAnchor.y ?? fallbackAnchor.y),
	};
}

export function getFrameAnchorDocument(frame) {
	return resolveFrameAnchor(frame?.anchor, {
		x: resolveFrameAxis(frame?.x ?? 0.5),
		y: resolveFrameAxis(frame?.y ?? 0.5),
	});
}

export function offsetFrameDocument(frame, xOffset, yOffset) {
	const nextFrame = {
		...frame,
		x: resolveFrameAxis(frame.x + xOffset),
		y: resolveFrameAxis(frame.y + yOffset),
	};

	const anchor = getFrameAnchorDocument(frame);
	nextFrame.anchor = resolveFrameAnchor(
		{
			x: anchor.x + xOffset,
			y: anchor.y + yOffset,
		},
		{
			x: nextFrame.x,
			y: nextFrame.y,
		},
	);

	return nextFrame;
}

export function getFrameScreenSpec(frame, metrics) {
	return getFrameOutlineSpec(
		frame,
		metrics.boxWidth,
		metrics.boxHeight,
		metrics.exportWidth,
		metrics.exportHeight,
		metrics.boxLeft,
		metrics.boxTop,
	);
}

export function buildFrameGeometry(frame, metrics) {
	const scale = resolveFrameScale(frame.scale ?? 1);
	const rotationDeg = normalizeRotationDegrees(frame.rotation ?? 0);
	const rotationRadians = (rotationDeg * Math.PI) / 180;
	const width = BASE_FRAME.width * scale;
	const height = BASE_FRAME.height * scale;
	const anchorPointNormalized = getFrameAnchorDocument(frame);
	const anchorPoint = {
		x: anchorPointNormalized.x * metrics.exportWidth,
		y: anchorPointNormalized.y * metrics.exportHeight,
	};
	const anchorLocal = getFrameAnchorLocalNormalized(
		frame,
		{
			width: BASE_FRAME.width * scale,
			height: BASE_FRAME.height * scale,
			rotationRadians,
		},
		{
			boxWidth: metrics.exportWidth,
			boxHeight: metrics.exportHeight,
		},
	);
	const left = anchorPoint.x - width * anchorLocal.x;
	const top = anchorPoint.y - height * anchorLocal.y;
	const corners = getRectCornersFromAnchor({
		left,
		top,
		width,
		height,
		anchorAx: anchorLocal.x,
		anchorAy: anchorLocal.y,
		rotationDeg,
	});
	return {
		frame,
		scale,
		rotationDeg,
		width,
		height,
		left,
		top,
		centerPoint: {
			x: resolveFrameAxis(frame.x) * metrics.exportWidth,
			y: resolveFrameAxis(frame.y) * metrics.exportHeight,
		},
		anchorPoint,
		anchorLocal,
		corners,
		bounds: getPointsBounds(corners),
	};
}

export function buildSelectionBoxLogicalFromGeometries(geometries) {
	const bounds = getPointsBounds(
		geometries.flatMap((geometry) => geometry.corners ?? []),
	);
	if (!bounds) {
		return null;
	}
	return {
		left: bounds.left,
		top: bounds.top,
		width: bounds.width,
		height: bounds.height,
		rotationDeg: 0,
		anchorX: 0.5,
		anchorY: 0.5,
	};
}

export function projectSelectionBoxLogicalToScreen(
	selectionBoxLogical,
	metrics,
	anchor,
) {
	if (!selectionBoxLogical || !metrics) {
		return null;
	}
	return {
		left:
			(selectionBoxLogical.left / Math.max(metrics.exportWidth, 1e-6)) *
			metrics.boxWidth,
		top:
			(selectionBoxLogical.top / Math.max(metrics.exportHeight, 1e-6)) *
			metrics.boxHeight,
		width:
			(selectionBoxLogical.width / Math.max(metrics.exportWidth, 1e-6)) *
			metrics.boxWidth,
		height:
			(selectionBoxLogical.height / Math.max(metrics.exportHeight, 1e-6)) *
			metrics.boxHeight,
		rotationDeg: selectionBoxLogical.rotationDeg ?? 0,
		anchorX: anchor?.x ?? selectionBoxLogical.anchorX ?? 0.5,
		anchorY: anchor?.y ?? selectionBoxLogical.anchorY ?? 0.5,
	};
}

export function updateFrameCenterFromWorldPoint(
	frame,
	centerX,
	centerY,
	metrics,
) {
	const center = getFrameDocumentCenterFromWorld(centerX, centerY, metrics);
	frame.x = resolveFrameAxis(center.x);
	frame.y = resolveFrameAxis(center.y);
	return frame;
}

export function updateFrameTransformFromWorldCenter(
	frame,
	metrics,
	{
		centerWorldX,
		centerWorldY,
		scale = frame.scale,
		rotation = frame.rotation,
	},
) {
	updateFrameCenterFromWorldPoint(frame, centerWorldX, centerWorldY, metrics);
	frame.scale = resolveFrameScale(scale);
	frame.rotation = normalizeRotationDegrees(rotation);
	frame.anchor = resolveFrameAnchor(frame.anchor, {
		x: frame.x,
		y: frame.y,
	});
	return frame;
}

export function normalizeAngleDeltaDegrees(value) {
	let rotation = Number(value) || 0;
	while (rotation <= -180) {
		rotation += 360;
	}
	while (rotation > 180) {
		rotation -= 360;
	}
	return rotation;
}
