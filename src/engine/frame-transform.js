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
