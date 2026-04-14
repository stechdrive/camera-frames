import { BASE_FRAME } from "../constants.js";

export const FRAME_MASK_SHAPE_BOUNDS = "bounds";
export const FRAME_MASK_SHAPE_TRAJECTORY = "trajectory";
export const FRAME_TRAJECTORY_MODE_LINE = "line";
export const FRAME_TRAJECTORY_MODE_SPLINE = "spline";
export const FRAME_TRAJECTORY_EXPORT_SOURCE_NONE = "none";
export const FRAME_TRAJECTORY_EXPORT_SOURCE_CENTER = "center";
export const FRAME_TRAJECTORY_EXPORT_SOURCE_TOP_LEFT = "top-left";
export const FRAME_TRAJECTORY_EXPORT_SOURCE_TOP_RIGHT = "top-right";
export const FRAME_TRAJECTORY_EXPORT_SOURCE_BOTTOM_RIGHT = "bottom-right";
export const FRAME_TRAJECTORY_EXPORT_SOURCE_BOTTOM_LEFT = "bottom-left";

const FRAME_TRAJECTORY_CORNER_KEYS = new Set([
	FRAME_TRAJECTORY_EXPORT_SOURCE_TOP_LEFT,
	FRAME_TRAJECTORY_EXPORT_SOURCE_TOP_RIGHT,
	FRAME_TRAJECTORY_EXPORT_SOURCE_BOTTOM_RIGHT,
	FRAME_TRAJECTORY_EXPORT_SOURCE_BOTTOM_LEFT,
]);

function rotatePoint(x, y, angleRadians) {
	const cos = Math.cos(angleRadians);
	const sin = Math.sin(angleRadians);
	return {
		x: x * cos - y * sin,
		y: x * sin + y * cos,
	};
}

function normalizeFrameAxis(value, fallback = 0.5) {
	const nextValue = Number(value);
	return Number.isFinite(nextValue) ? nextValue : fallback;
}

function normalizeRotationDegrees(value) {
	let rotation = Number(value) || 0;
	while (rotation <= -180) {
		rotation += 360;
	}
	while (rotation > 180) {
		rotation -= 360;
	}
	return rotation;
}

function getFrameScale(frame) {
	const value = Number(frame?.scale);
	return Number.isFinite(value) && value > 0 ? value : 1;
}

function getFrameRotationDegrees(frame) {
	return normalizeRotationDegrees(frame?.rotation ?? 0);
}

function getFrameCenterNormalized(frame) {
	return {
		x: normalizeFrameAxis(frame?.x, 0.5),
		y: normalizeFrameAxis(frame?.y, 0.5),
	};
}

function clonePoint(point) {
	return point
		? {
				x: point.x,
				y: point.y,
			}
		: null;
}

function sanitizeHandlePoint(point) {
	if (!point || typeof point !== "object") {
		return null;
	}

	const x = Number(point.x);
	const y = Number(point.y);
	if (!Number.isFinite(x) || !Number.isFinite(y)) {
		return null;
	}

	return {
		x,
		y,
	};
}

export function normalizeFrameMaskShape(value) {
	return value === FRAME_MASK_SHAPE_TRAJECTORY
		? FRAME_MASK_SHAPE_TRAJECTORY
		: FRAME_MASK_SHAPE_BOUNDS;
}

export function normalizeFrameTrajectoryMode(value) {
	return value === FRAME_TRAJECTORY_MODE_SPLINE
		? FRAME_TRAJECTORY_MODE_SPLINE
		: FRAME_TRAJECTORY_MODE_LINE;
}

export function normalizeFrameTrajectoryExportSource(value) {
	if (
		value === FRAME_TRAJECTORY_EXPORT_SOURCE_CENTER ||
		FRAME_TRAJECTORY_CORNER_KEYS.has(value)
	) {
		return value;
	}
	return FRAME_TRAJECTORY_EXPORT_SOURCE_NONE;
}

export function cloneFrameTrajectoryHandlesByFrameId(handlesByFrameId = {}) {
	const nextHandlesByFrameId = {};
	for (const [frameId, handles] of Object.entries(handlesByFrameId ?? {})) {
		if (typeof frameId !== "string" || !frameId) {
			continue;
		}
		const nextIn = clonePoint(handles?.in ?? null);
		const nextOut = clonePoint(handles?.out ?? null);
		if (!nextIn && !nextOut) {
			continue;
		}
		nextHandlesByFrameId[frameId] = {
			...(nextIn ? { in: nextIn } : {}),
			...(nextOut ? { out: nextOut } : {}),
		};
	}
	return nextHandlesByFrameId;
}

export function sanitizeFrameTrajectoryHandlesByFrameId(
	frames = [],
	handlesByFrameId = {},
) {
	const availableFrameIdSet = new Set(
		(frames ?? [])
			.map((frame) => frame?.id)
			.filter((frameId) => typeof frameId === "string" && frameId.length > 0),
	);
	const nextHandlesByFrameId = {};

	for (const [frameId, handles] of Object.entries(handlesByFrameId ?? {})) {
		if (!availableFrameIdSet.has(frameId)) {
			continue;
		}
		const nextIn = sanitizeHandlePoint(handles?.in);
		const nextOut = sanitizeHandlePoint(handles?.out);
		if (!nextIn && !nextOut) {
			continue;
		}
		nextHandlesByFrameId[frameId] = {
			...(nextIn ? { in: nextIn } : {}),
			...(nextOut ? { out: nextOut } : {}),
		};
	}

	return nextHandlesByFrameId;
}

function getStoredTrajectoryHandle(frameMask, frameId, handleKey) {
	const point = frameMask?.trajectory?.handlesByFrameId?.[frameId]?.[handleKey];
	return sanitizeHandlePoint(point);
}

function getAutomaticTrajectoryTangent(frames, frameIndex) {
	const current = getFrameCenterNormalized(frames[frameIndex]);
	if (frames.length <= 1) {
		return { x: 0, y: 0 };
	}
	if (frameIndex <= 0) {
		const next = getFrameCenterNormalized(
			frames[Math.min(1, frames.length - 1)],
		);
		return {
			x: next.x - current.x,
			y: next.y - current.y,
		};
	}
	if (frameIndex >= frames.length - 1) {
		const previous = getFrameCenterNormalized(frames[frameIndex - 1]);
		return {
			x: current.x - previous.x,
			y: current.y - previous.y,
		};
	}

	const previous = getFrameCenterNormalized(frames[frameIndex - 1]);
	const next = getFrameCenterNormalized(frames[frameIndex + 1]);
	return {
		x: (next.x - previous.x) * 0.5,
		y: (next.y - previous.y) * 0.5,
	};
}

function getAutomaticTrajectoryHandle(frames, frameIndex, handleKey) {
	const center = getFrameCenterNormalized(frames[frameIndex]);
	const tangent = getAutomaticTrajectoryTangent(frames, frameIndex);
	const sign = handleKey === "in" ? -1 : 1;
	return {
		x: center.x + tangent.x * sign * (1 / 3),
		y: center.y + tangent.y * sign * (1 / 3),
	};
}

export function getFrameTrajectoryHandlePointNormalized(
	frames,
	frameMask,
	frameId,
	handleKey,
) {
	const frameIndex = (frames ?? []).findIndex((frame) => frame?.id === frameId);
	if (frameIndex < 0) {
		return null;
	}
	return (
		getStoredTrajectoryHandle(frameMask, frameId, handleKey) ??
		getAutomaticTrajectoryHandle(frames, frameIndex, handleKey)
	);
}

function getCenterTrajectorySegmentControlPoints(
	frames,
	frameMask,
	segmentIndex,
) {
	const startFrame = frames[segmentIndex];
	const endFrame = frames[segmentIndex + 1];
	if (!startFrame || !endFrame) {
		return null;
	}

	return {
		p0: getFrameCenterNormalized(startFrame),
		p1: getFrameTrajectoryHandlePointNormalized(
			frames,
			frameMask,
			startFrame.id,
			"out",
		),
		p2: getFrameTrajectoryHandlePointNormalized(
			frames,
			frameMask,
			endFrame.id,
			"in",
		),
		p3: getFrameCenterNormalized(endFrame),
	};
}

function evaluateCubicBezierPoint(p0, p1, p2, p3, t) {
	const invT = 1 - t;
	const a = invT * invT * invT;
	const b = 3 * invT * invT * t;
	const c = 3 * invT * t * t;
	const d = t * t * t;
	return {
		x: p0.x * a + p1.x * b + p2.x * c + p3.x * d,
		y: p0.y * a + p1.y * b + p2.y * c + p3.y * d,
	};
}

function interpolateAngleDegrees(startDegrees, endDegrees, t) {
	let delta = normalizeRotationDegrees(endDegrees - startDegrees);
	if (delta > 180) {
		delta -= 360;
	}
	if (delta < -180) {
		delta += 360;
	}
	return normalizeRotationDegrees(startDegrees + delta * t);
}

export function evaluateFrameCenterTrajectoryPointNormalized(
	frames,
	frameMask,
	segmentIndex,
	t,
) {
	const startFrame = frames[segmentIndex];
	const endFrame = frames[segmentIndex + 1];
	if (!startFrame || !endFrame) {
		return null;
	}

	if (
		normalizeFrameTrajectoryMode(frameMask?.trajectoryMode) ===
		FRAME_TRAJECTORY_MODE_SPLINE
	) {
		const controlPoints = getCenterTrajectorySegmentControlPoints(
			frames,
			frameMask,
			segmentIndex,
		);
		if (controlPoints) {
			return evaluateCubicBezierPoint(
				controlPoints.p0,
				controlPoints.p1,
				controlPoints.p2,
				controlPoints.p3,
				t,
			);
		}
	}

	const start = getFrameCenterNormalized(startFrame);
	const end = getFrameCenterNormalized(endFrame);
	return {
		x: start.x + (end.x - start.x) * t,
		y: start.y + (end.y - start.y) * t,
	};
}

export function buildFrameRectangleGeometry(
	frame,
	logicalWidth,
	logicalHeight,
) {
	const scale = getFrameScale(frame);
	const rotationDeg = getFrameRotationDegrees(frame);
	const rotationRadians = (rotationDeg * Math.PI) / 180;
	const width = BASE_FRAME.width * scale;
	const height = BASE_FRAME.height * scale;
	const centerNormalized = getFrameCenterNormalized(frame);
	const centerPoint = {
		x: centerNormalized.x * logicalWidth,
		y: centerNormalized.y * logicalHeight,
	};
	const halfWidth = width * 0.5;
	const halfHeight = height * 0.5;
	const corners = [
		{ x: -halfWidth, y: -halfHeight },
		{ x: halfWidth, y: -halfHeight },
		{ x: halfWidth, y: halfHeight },
		{ x: -halfWidth, y: halfHeight },
	].map((point) => {
		const rotated = rotatePoint(point.x, point.y, rotationRadians);
		return {
			x: centerPoint.x + rotated.x,
			y: centerPoint.y + rotated.y,
		};
	});

	return {
		frame,
		centerPoint,
		centerNormalized,
		scale,
		rotationDeg,
		rotationRadians,
		width,
		height,
		corners,
		cornerPointsByKey: {
			[FRAME_TRAJECTORY_EXPORT_SOURCE_TOP_LEFT]: corners[0],
			[FRAME_TRAJECTORY_EXPORT_SOURCE_TOP_RIGHT]: corners[1],
			[FRAME_TRAJECTORY_EXPORT_SOURCE_BOTTOM_RIGHT]: corners[2],
			[FRAME_TRAJECTORY_EXPORT_SOURCE_BOTTOM_LEFT]: corners[3],
		},
	};
}

function getSegmentSampleCount(
	startFrame,
	endFrame,
	logicalWidth,
	logicalHeight,
	baseSamplesPerSegment = 16,
) {
	const startCenter = getFrameCenterNormalized(startFrame);
	const endCenter = getFrameCenterNormalized(endFrame);
	const distancePx = Math.hypot(
		(endCenter.x - startCenter.x) * logicalWidth,
		(endCenter.y - startCenter.y) * logicalHeight,
	);
	const rotationDelta = Math.abs(
		normalizeRotationDegrees(
			getFrameRotationDegrees(endFrame) - getFrameRotationDegrees(startFrame),
		),
	);
	const scaleDelta = Math.abs(
		getFrameScale(endFrame) - getFrameScale(startFrame),
	);
	return Math.max(
		6,
		Math.min(
			96,
			Math.ceil(
				baseSamplesPerSegment +
					distancePx / 180 +
					rotationDelta / 18 +
					scaleDelta * 8,
			),
		),
	);
}

export function sampleFrameMotionGeometries(
	frames,
	frameMask,
	logicalWidth,
	logicalHeight,
	{ baseSamplesPerSegment = 16 } = {},
) {
	if (!Array.isArray(frames) || frames.length === 0) {
		return [];
	}

	if (frames.length === 1) {
		return [
			buildFrameRectangleGeometry(frames[0], logicalWidth, logicalHeight),
		];
	}

	const samples = [];
	for (
		let segmentIndex = 0;
		segmentIndex < frames.length - 1;
		segmentIndex += 1
	) {
		const startFrame = frames[segmentIndex];
		const endFrame = frames[segmentIndex + 1];
		const sampleCount = getSegmentSampleCount(
			startFrame,
			endFrame,
			logicalWidth,
			logicalHeight,
			baseSamplesPerSegment,
		);
		for (let step = 0; step <= sampleCount; step += 1) {
			if (segmentIndex > 0 && step === 0) {
				continue;
			}
			const t = step / Math.max(sampleCount, 1);
			const centerNormalized = evaluateFrameCenterTrajectoryPointNormalized(
				frames,
				frameMask,
				segmentIndex,
				t,
			);
			if (!centerNormalized) {
				continue;
			}
			samples.push(
				buildFrameRectangleGeometry(
					{
						x: centerNormalized.x,
						y: centerNormalized.y,
						scale:
							getFrameScale(startFrame) +
							(getFrameScale(endFrame) - getFrameScale(startFrame)) * t,
						rotation: interpolateAngleDegrees(
							getFrameRotationDegrees(startFrame),
							getFrameRotationDegrees(endFrame),
							t,
						),
					},
					logicalWidth,
					logicalHeight,
				),
			);
		}
	}
	return samples;
}

export function getTrajectoryPointFromGeometry(geometry, source) {
	if (!geometry) {
		return null;
	}
	if (source === FRAME_TRAJECTORY_EXPORT_SOURCE_CENTER) {
		return geometry.centerPoint;
	}
	if (FRAME_TRAJECTORY_CORNER_KEYS.has(source)) {
		return geometry.cornerPointsByKey[source] ?? null;
	}
	return null;
}

export function sampleFrameTrajectoryPoints(
	frames,
	frameMask,
	logicalWidth,
	logicalHeight,
	{
		source = FRAME_TRAJECTORY_EXPORT_SOURCE_CENTER,
		baseSamplesPerSegment = 16,
	} = {},
) {
	const normalizedSource = normalizeFrameTrajectoryExportSource(source);
	if (normalizedSource === FRAME_TRAJECTORY_EXPORT_SOURCE_NONE) {
		return [];
	}

	return sampleFrameMotionGeometries(
		frames,
		frameMask,
		logicalWidth,
		logicalHeight,
		{ baseSamplesPerSegment },
	)
		.map((geometry) =>
			getTrajectoryPointFromGeometry(geometry, normalizedSource),
		)
		.filter((point) => Number.isFinite(point?.x) && Number.isFinite(point?.y));
}
