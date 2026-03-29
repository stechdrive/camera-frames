import { ANCHORS, BASE_FRAME } from "../constants.js";

export const FRAME_MIN_SCALE = 0.1;
export const FRAME_MAX_SCALE = 4;

export const FRAME_RESIZE_HANDLES = {
	"top-left": { x: 0, y: 0, affectsWidth: true, affectsHeight: true },
	top: { x: 0.5, y: 0, affectsWidth: false, affectsHeight: true },
	"top-right": { x: 1, y: 0, affectsWidth: true, affectsHeight: true },
	right: { x: 1, y: 0.5, affectsWidth: true, affectsHeight: false },
	"bottom-right": { x: 1, y: 1, affectsWidth: true, affectsHeight: true },
	bottom: { x: 0.5, y: 1, affectsWidth: false, affectsHeight: true },
	"bottom-left": { x: 0, y: 1, affectsWidth: true, affectsHeight: true },
	left: { x: 0, y: 0.5, affectsWidth: true, affectsHeight: false },
};

const FRAME_OPPOSITE_RESIZE_HANDLES = {
	"top-left": "bottom-right",
	top: "bottom",
	"top-right": "bottom-left",
	right: "left",
	"bottom-right": "top-left",
	bottom: "top",
	"bottom-left": "top-right",
	left: "right",
};

const FRAME_ANCHOR_HANDLE_KEYS = {
	"top-left": "top-left",
	"top-center": "top",
	"top-right": "top-right",
	"middle-left": "left",
	center: "",
	"middle-right": "right",
	"bottom-left": "bottom-left",
	"bottom-center": "bottom",
	"bottom-right": "bottom-right",
};

const QUARTER_TURN_RADIANS = Math.PI * 0.5;
const ANCHOR_PRESET_EPSILON = 1e-6;

function clampAnchorAxis(value, fallback = 0.5) {
	const nextValue = Number(value);
	if (!Number.isFinite(nextValue)) {
		return fallback;
	}

	return Math.min(1, Math.max(0, nextValue));
}

function resolveDocumentAnchorAxis(value, fallback = 0.5) {
	const nextValue = Number(value);
	if (!Number.isFinite(nextValue)) {
		return fallback;
	}

	return nextValue;
}

function isAnchorObject(value) {
	return value !== null && typeof value === "object";
}

function getPresetAxisLabel(value, negativeLabel, centerLabel, positiveLabel) {
	if (Math.abs(value - 0) <= ANCHOR_PRESET_EPSILON) {
		return negativeLabel;
	}
	if (Math.abs(value - 0.5) <= ANCHOR_PRESET_EPSILON) {
		return centerLabel;
	}
	if (Math.abs(value - 1) <= ANCHOR_PRESET_EPSILON) {
		return positiveLabel;
	}
	return null;
}

export function getFrameAnchorNormalized(
	anchorValue,
	fallback = ANCHORS.center,
) {
	const fallbackAnchor = isAnchorObject(fallback)
		? {
				x: clampAnchorAxis(fallback.x, 0.5),
				y: clampAnchorAxis(fallback.y, 0.5),
			}
		: ANCHORS.center;

	if (typeof anchorValue === "string") {
		return ANCHORS[anchorValue] ?? fallbackAnchor;
	}

	if (isAnchorObject(anchorValue)) {
		return {
			x: clampAnchorAxis(anchorValue.x, fallbackAnchor.x),
			y: clampAnchorAxis(anchorValue.y, fallbackAnchor.y),
		};
	}

	return fallbackAnchor;
}

export function getFrameAnchorDocumentPoint(frame) {
	const fallbackAnchor = {
		x: resolveDocumentAnchorAxis(frame?.x, 0.5),
		y: resolveDocumentAnchorAxis(frame?.y, 0.5),
	};

	if (typeof frame?.anchor === "string") {
		return ANCHORS[frame.anchor] ?? fallbackAnchor;
	}

	if (isAnchorObject(frame?.anchor)) {
		return {
			x: resolveDocumentAnchorAxis(frame.anchor.x, fallbackAnchor.x),
			y: resolveDocumentAnchorAxis(frame.anchor.y, fallbackAnchor.y),
		};
	}

	return fallbackAnchor;
}

export function getFrameAnchorHandleKey(localAnchor = ANCHORS.center) {
	const anchor = getFrameAnchorNormalized(localAnchor, ANCHORS.center);
	const vertical = getPresetAxisLabel(anchor.y, "top", "middle", "bottom");
	const horizontal = getPresetAxisLabel(anchor.x, "left", "center", "right");

	if (!vertical || !horizontal) {
		return "";
	}

	const presetKey =
		vertical === "middle" && horizontal === "center"
			? "center"
			: `${vertical}-${horizontal}`;

	return FRAME_ANCHOR_HANDLE_KEYS[presetKey] ?? "";
}

export function getOppositeFrameResizeHandleKey(handleKey) {
	return FRAME_OPPOSITE_RESIZE_HANDLES[handleKey] ?? "";
}

export function rotateVector(x, y, rotationRadians) {
	const cos = Math.cos(rotationRadians);
	const sin = Math.sin(rotationRadians);
	return {
		x: x * cos - y * sin,
		y: x * sin + y * cos,
	};
}

export function inverseRotateVector(x, y, rotationRadians) {
	return rotateVector(x, y, -rotationRadians);
}

export function getFrameScreenSize(scale, metrics) {
	const nextScale = Number.isFinite(scale) && scale > 0 ? scale : 1;
	return {
		width:
			BASE_FRAME.width * nextScale * (metrics.boxWidth / metrics.exportWidth),
		height:
			BASE_FRAME.height *
			nextScale *
			(metrics.boxHeight / metrics.exportHeight),
	};
}

export function getFrameWorldPointFromLocal(spec, localPoint) {
	const rotated = rotateVector(
		(localPoint.x - 0.5) * spec.width,
		(localPoint.y - 0.5) * spec.height,
		spec.rotationRadians,
	);

	return {
		x: spec.centerX + rotated.x,
		y: spec.centerY + rotated.y,
	};
}

export function getFrameDocumentCenterFromWorld(centerX, centerY, metrics) {
	return {
		x: (centerX - metrics.boxLeft) / Math.max(metrics.boxWidth, 1e-6),
		y: (centerY - metrics.boxTop) / Math.max(metrics.boxHeight, 1e-6),
	};
}

export function getPointFromRectLocal({
	left,
	top,
	width,
	height,
	localX,
	localY,
	anchorAx = 0.5,
	anchorAy = 0.5,
	rotationDeg = 0,
}) {
	const rotationRadians = (rotationDeg * Math.PI) / 180;
	const anchorPoint = {
		x: left + width * anchorAx,
		y: top + height * anchorAy,
	};
	const rotated = rotateVector(
		(localX - anchorAx) * width,
		(localY - anchorAy) * height,
		rotationRadians,
	);
	return {
		x: anchorPoint.x + rotated.x,
		y: anchorPoint.y + rotated.y,
	};
}

export function getRectCornersFromAnchor({
	left,
	top,
	width,
	height,
	anchorAx = 0.5,
	anchorAy = 0.5,
	rotationDeg = 0,
}) {
	return [
		getPointFromRectLocal({
			left,
			top,
			width,
			height,
			localX: 0,
			localY: 0,
			anchorAx,
			anchorAy,
			rotationDeg,
		}),
		getPointFromRectLocal({
			left,
			top,
			width,
			height,
			localX: 1,
			localY: 0,
			anchorAx,
			anchorAy,
			rotationDeg,
		}),
		getPointFromRectLocal({
			left,
			top,
			width,
			height,
			localX: 1,
			localY: 1,
			anchorAx,
			anchorAy,
			rotationDeg,
		}),
		getPointFromRectLocal({
			left,
			top,
			width,
			height,
			localX: 0,
			localY: 1,
			anchorAx,
			anchorAy,
			rotationDeg,
		}),
	];
}

export function getPointsBounds(points) {
	if (!Array.isArray(points) || points.length === 0) {
		return null;
	}

	let left = Number.POSITIVE_INFINITY;
	let top = Number.POSITIVE_INFINITY;
	let right = Number.NEGATIVE_INFINITY;
	let bottom = Number.NEGATIVE_INFINITY;

	for (const point of points) {
		if (!Number.isFinite(point?.x) || !Number.isFinite(point?.y)) {
			continue;
		}
		left = Math.min(left, point.x);
		top = Math.min(top, point.y);
		right = Math.max(right, point.x);
		bottom = Math.max(bottom, point.y);
	}

	if (
		!Number.isFinite(left) ||
		!Number.isFinite(top) ||
		!Number.isFinite(right) ||
		!Number.isFinite(bottom)
	) {
		return null;
	}

	return {
		left,
		top,
		right,
		bottom,
		width: Math.max(right - left, 1e-6),
		height: Math.max(bottom - top, 1e-6),
	};
}

export function getFrameAnchorWorldPoint(frame, metrics) {
	const anchor = getFrameAnchorDocumentPoint(frame);
	return {
		x: metrics.boxLeft + anchor.x * metrics.boxWidth,
		y: metrics.boxTop + anchor.y * metrics.boxHeight,
		anchor,
	};
}

export function getFrameAnchorLocalNormalized(frame, spec, metrics) {
	const anchor = getFrameAnchorDocumentPoint(frame);
	const local = inverseRotateVector(
		(anchor.x - frame.x) * metrics.boxWidth,
		(anchor.y - frame.y) * metrics.boxHeight,
		spec.rotationRadians,
	);

	return {
		x: 0.5 + local.x / Math.max(spec.width, 1e-6),
		y: 0.5 + local.y / Math.max(spec.height, 1e-6),
	};
}

export function getNearestFrameAnchorKey(normalizedX, normalizedY) {
	let nearestKey = "center";
	let nearestDistance = Number.POSITIVE_INFINITY;

	for (const [anchorKey, anchor] of Object.entries(ANCHORS)) {
		const dx = normalizedX - anchor.x;
		const dy = normalizedY - anchor.y;
		const distance = dx * dx + dy * dy;

		if (distance < nearestDistance) {
			nearestDistance = distance;
			nearestKey = anchorKey;
		}
	}

	return nearestKey;
}

export function getFrameResizeAxisLocal(
	spec,
	handleKey,
	anchorLocal = ANCHORS.center,
) {
	const handle = FRAME_RESIZE_HANDLES[handleKey];
	if (!handle) {
		return null;
	}

	const axis = {
		x: (handle.x - anchorLocal.x) * spec.width,
		y: (handle.y - anchorLocal.y) * spec.height,
	};
	const length = Math.hypot(axis.x, axis.y);
	if (!(Number.isFinite(length) && length > 1e-6)) {
		return null;
	}

	return {
		x: axis.x / length,
		y: axis.y / length,
		length,
	};
}

export function getUniformFrameScaleFromHandle({
	pointerWorldX,
	pointerWorldY,
	anchorWorldX,
	anchorWorldY,
	rotationRadians,
	axisX,
	axisY,
	startProjectionDistance,
	startScale = 1,
	fallbackScale = 1,
}) {
	if (
		!(
			Number.isFinite(startProjectionDistance) &&
			Math.abs(startProjectionDistance) > 1e-6
		)
	) {
		return fallbackScale;
	}
	if (!(Number.isFinite(axisX) && Number.isFinite(axisY))) {
		return fallbackScale;
	}

	const localPointer = inverseRotateVector(
		pointerWorldX - anchorWorldX,
		pointerWorldY - anchorWorldY,
		rotationRadians,
	);
	const currentProjection = localPointer.x * axisX + localPointer.y * axisY;
	const nextScale = startScale * (currentProjection / startProjectionDistance);

	if (!Number.isFinite(nextScale)) {
		return fallbackScale;
	}

	return Math.min(FRAME_MAX_SCALE, Math.max(FRAME_MIN_SCALE, nextScale));
}

export function getClampedFrameSelectionScaleRatio(rawScaleRatio, startScales) {
	const numericRatio = Number(rawScaleRatio);
	if (!Number.isFinite(numericRatio)) {
		return 1;
	}

	const scales = (startScales ?? []).filter(
		(value) => Number.isFinite(value) && value > 0,
	);
	if (scales.length === 0) {
		return Math.max(0.01, numericRatio);
	}

	let minRatio = 0;
	let maxRatio = Number.POSITIVE_INFINITY;

	for (const scale of scales) {
		minRatio = Math.max(minRatio, FRAME_MIN_SCALE / scale);
		maxRatio = Math.min(maxRatio, FRAME_MAX_SCALE / scale);
	}

	if (!(Number.isFinite(maxRatio) && maxRatio > 0)) {
		return Math.max(0.01, numericRatio);
	}

	const safeMinRatio = Math.max(minRatio, 0.01);
	const safeMaxRatio = Math.max(maxRatio, safeMinRatio);
	return Math.min(safeMaxRatio, Math.max(safeMinRatio, numericRatio));
}

export function normalizeRotationDegrees(value) {
	let rotation = Number(value) || 0;
	while (rotation <= -180) {
		rotation += 360;
	}
	while (rotation > 180) {
		rotation -= 360;
	}
	return rotation;
}

export function isAxisAlignedRotation(rotationRadians) {
	const nearestQuarterTurn =
		Math.round(rotationRadians / QUARTER_TURN_RADIANS) * QUARTER_TURN_RADIANS;
	return Math.abs(rotationRadians - nearestQuarterTurn) < ANCHOR_PRESET_EPSILON;
}
