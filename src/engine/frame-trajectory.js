import { BASE_FRAME } from "../constants.js";

export const FRAME_MASK_SHAPE_BOUNDS = "bounds";
export const FRAME_MASK_SHAPE_TRAJECTORY = "trajectory";
export const FRAME_TRAJECTORY_MODE_LINE = "line";
export const FRAME_TRAJECTORY_MODE_SPLINE = "spline";
export const FRAME_TRAJECTORY_NODE_MODE_AUTO = "auto";
export const FRAME_TRAJECTORY_NODE_MODE_CORNER = "corner";
export const FRAME_TRAJECTORY_NODE_MODE_MIRRORED = "mirrored";
export const FRAME_TRAJECTORY_NODE_MODE_FREE = "free";
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
const DEFAULT_FRAME_MOTION_MAX_SEGMENT_ERROR_PX = 0.35;

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

function sanitizeHandleVector(point) {
	return sanitizeHandlePoint(point);
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

export function normalizeFrameTrajectoryNodeMode(value) {
	if (value === FRAME_TRAJECTORY_NODE_MODE_CORNER) {
		return FRAME_TRAJECTORY_NODE_MODE_CORNER;
	}
	if (value === FRAME_TRAJECTORY_NODE_MODE_MIRRORED) {
		return FRAME_TRAJECTORY_NODE_MODE_MIRRORED;
	}
	if (value === FRAME_TRAJECTORY_NODE_MODE_FREE) {
		return FRAME_TRAJECTORY_NODE_MODE_FREE;
	}
	return FRAME_TRAJECTORY_NODE_MODE_AUTO;
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

function cloneTrajectoryNode(node) {
	const nextIn = clonePoint(node?.in ?? null);
	const nextOut = clonePoint(node?.out ?? null);
	const mode = normalizeFrameTrajectoryNodeMode(node?.mode);
	if (mode === FRAME_TRAJECTORY_NODE_MODE_AUTO && !nextIn && !nextOut) {
		return null;
	}
	return {
		...(mode !== FRAME_TRAJECTORY_NODE_MODE_AUTO ? { mode } : {}),
		...(nextIn ? { in: nextIn } : {}),
		...(nextOut ? { out: nextOut } : {}),
	};
}

export function cloneFrameTrajectoryNodesByFrameId(nodesByFrameId = {}) {
	const nextNodesByFrameId = {};
	for (const [frameId, node] of Object.entries(nodesByFrameId ?? {})) {
		if (typeof frameId !== "string" || !frameId) {
			continue;
		}
		const nextNode = cloneTrajectoryNode(node);
		if (!nextNode) {
			continue;
		}
		nextNodesByFrameId[frameId] = nextNode;
	}
	return nextNodesByFrameId;
}

function getFrameCenterLogical(frame, logicalWidth, logicalHeight) {
	const center = getFrameCenterNormalized(frame);
	return {
		x: center.x * logicalWidth,
		y: center.y * logicalHeight,
	};
}

function getDocumentVectorFromLogical(vector, logicalWidth, logicalHeight) {
	return {
		x: vector.x / Math.max(logicalWidth, 1e-6),
		y: vector.y / Math.max(logicalHeight, 1e-6),
	};
}

function getLogicalVectorFromDocument(vector, logicalWidth, logicalHeight) {
	return {
		x: vector.x * logicalWidth,
		y: vector.y * logicalHeight,
	};
}

function addPoints(a, b) {
	return {
		x: a.x + b.x,
		y: a.y + b.y,
	};
}

function subtractPoints(a, b) {
	return {
		x: a.x - b.x,
		y: a.y - b.y,
	};
}

function scalePoint(point, scalar) {
	return {
		x: point.x * scalar,
		y: point.y * scalar,
	};
}

function getPointLength(point) {
	return Math.hypot(point.x, point.y);
}

function normalizePoint(point) {
	const length = getPointLength(point);
	if (length <= 1e-6) {
		return null;
	}
	return {
		x: point.x / length,
		y: point.y / length,
	};
}

function dotPoints(a, b) {
	return a.x * b.x + a.y * b.y;
}

function sanitizeTrajectoryNode(node) {
	if (!node || typeof node !== "object") {
		return null;
	}
	const requestedMode = normalizeFrameTrajectoryNodeMode(node.mode);
	const nextIn = sanitizeHandleVector(node.in);
	const nextOut = sanitizeHandleVector(node.out);
	const mode =
		requestedMode === FRAME_TRAJECTORY_NODE_MODE_AUTO && (nextIn || nextOut)
			? FRAME_TRAJECTORY_NODE_MODE_FREE
			: requestedMode;

	if (mode === FRAME_TRAJECTORY_NODE_MODE_AUTO && !nextIn && !nextOut) {
		return null;
	}

	if (mode === FRAME_TRAJECTORY_NODE_MODE_MIRRORED) {
		if (nextIn && !nextOut) {
			return {
				mode,
				in: nextIn,
				out: scalePoint(nextIn, -1),
			};
		}
		if (!nextIn && nextOut) {
			return {
				mode,
				in: scalePoint(nextOut, -1),
				out: nextOut,
			};
		}
	}

	if (
		mode === FRAME_TRAJECTORY_NODE_MODE_CORNER ||
		mode === FRAME_TRAJECTORY_NODE_MODE_AUTO ||
		nextIn ||
		nextOut
	) {
		return {
			...(mode !== FRAME_TRAJECTORY_NODE_MODE_AUTO ? { mode } : {}),
			...(nextIn ? { in: nextIn } : {}),
			...(nextOut ? { out: nextOut } : {}),
		};
	}

	return null;
}

function migrateLegacyTrajectoryHandlesByFrameId(
	frames = [],
	handlesByFrameId = {},
) {
	const availableFrameIdSet = new Set(
		(frames ?? [])
			.map((frame) => frame?.id)
			.filter((frameId) => typeof frameId === "string" && frameId.length > 0),
	);
	const frameCenterById = new Map(
		(frames ?? []).map((frame) => [frame.id, getFrameCenterNormalized(frame)]),
	);
	const nextNodesByFrameId = {};

	for (const [frameId, handles] of Object.entries(handlesByFrameId ?? {})) {
		if (!availableFrameIdSet.has(frameId)) {
			continue;
		}
		const center = frameCenterById.get(frameId);
		if (!center) {
			continue;
		}
		const nextIn = sanitizeHandlePoint(handles?.in);
		const nextOut = sanitizeHandlePoint(handles?.out);
		const node = sanitizeTrajectoryNode({
			mode: FRAME_TRAJECTORY_NODE_MODE_FREE,
			in: nextIn
				? {
						x: nextIn.x - center.x,
						y: nextIn.y - center.y,
					}
				: null,
			out: nextOut
				? {
						x: nextOut.x - center.x,
						y: nextOut.y - center.y,
					}
				: null,
		});
		if (!node) {
			continue;
		}
		nextNodesByFrameId[frameId] = node;
	}

	return nextNodesByFrameId;
}

export function sanitizeFrameTrajectoryNodesByFrameId(
	frames = [],
	trajectory = {},
) {
	const availableFrameIdSet = new Set(
		(frames ?? [])
			.map((frame) => frame?.id)
			.filter((frameId) => typeof frameId === "string" && frameId.length > 0),
	);
	const nextNodesByFrameId = {};
	const sourceNodesByFrameId =
		trajectory?.nodesByFrameId && typeof trajectory.nodesByFrameId === "object"
			? trajectory.nodesByFrameId
			: migrateLegacyTrajectoryHandlesByFrameId(
					frames,
					trajectory?.handlesByFrameId,
				);

	for (const [frameId, node] of Object.entries(sourceNodesByFrameId ?? {})) {
		if (!availableFrameIdSet.has(frameId)) {
			continue;
		}
		const nextNode = sanitizeTrajectoryNode(node);
		if (!nextNode) {
			continue;
		}
		nextNodesByFrameId[frameId] = nextNode;
	}

	return nextNodesByFrameId;
}

function getStoredTrajectoryNode(frameMask, frameId) {
	return sanitizeTrajectoryNode(
		frameMask?.trajectory?.nodesByFrameId?.[frameId],
	);
}

export function getFrameTrajectoryNodeMode(frameMask, frameId) {
	return normalizeFrameTrajectoryNodeMode(
		getStoredTrajectoryNode(frameMask, frameId)?.mode,
	);
}

function getAutomaticTrajectoryHandleVectorsLogical(
	frames,
	frameIndex,
	logicalWidth,
	logicalHeight,
) {
	const current = getFrameCenterLogical(
		frames[frameIndex],
		logicalWidth,
		logicalHeight,
	);
	if (frames.length <= 1) {
		return {
			in: { x: 0, y: 0 },
			out: { x: 0, y: 0 },
		};
	}

	const previous =
		frameIndex > 0
			? getFrameCenterLogical(
					frames[frameIndex - 1],
					logicalWidth,
					logicalHeight,
				)
			: null;
	const next =
		frameIndex < frames.length - 1
			? getFrameCenterLogical(
					frames[frameIndex + 1],
					logicalWidth,
					logicalHeight,
				)
			: null;

	if (frameIndex <= 0) {
		const nextOffset = next ? subtractPoints(next, current) : { x: 0, y: 0 };
		return {
			in: { x: 0, y: 0 },
			out: scalePoint(nextOffset, 1 / 3),
		};
	}
	if (frameIndex >= frames.length - 1) {
		const previousOffset = previous
			? subtractPoints(current, previous)
			: { x: 0, y: 0 };
		return {
			in: scalePoint(previousOffset, -1 / 3),
			out: { x: 0, y: 0 },
		};
	}

	const incomingOffset = previous
		? subtractPoints(current, previous)
		: { x: 0, y: 0 };
	const outgoingOffset = next ? subtractPoints(next, current) : { x: 0, y: 0 };
	const incomingLength = getPointLength(incomingOffset);
	const outgoingLength = getPointLength(outgoingOffset);
	const incomingDir = normalizePoint(incomingOffset);
	const outgoingDir = normalizePoint(outgoingOffset);
	if (!incomingDir || !outgoingDir) {
		return {
			in: incomingDir ? scalePoint(incomingOffset, -1 / 3) : { x: 0, y: 0 },
			out: outgoingDir ? scalePoint(outgoingOffset, 1 / 3) : { x: 0, y: 0 },
		};
	}

	const weightedDirection = normalizePoint({
		x:
			incomingDir.x * Math.sqrt(Math.max(incomingLength, 1e-6)) +
			outgoingDir.x * Math.sqrt(Math.max(outgoingLength, 1e-6)),
		y:
			incomingDir.y * Math.sqrt(Math.max(incomingLength, 1e-6)) +
			outgoingDir.y * Math.sqrt(Math.max(outgoingLength, 1e-6)),
	});
	const smoothDirection = weightedDirection ?? outgoingDir;
	const angleScale = Math.max(
		0,
		Math.min(1, (1 + dotPoints(incomingDir, outgoingDir)) * 0.5),
	);
	const baseInLength = (incomingLength / 3) * angleScale;
	const baseOutLength = (outgoingLength / 3) * angleScale;
	return {
		in: scalePoint(smoothDirection, -baseInLength),
		out: scalePoint(smoothDirection, baseOutLength),
	};
}

function getAutomaticTrajectoryHandleVectorNormalized(
	frames,
	frameIndex,
	handleKey,
	logicalWidth,
	logicalHeight,
) {
	const vectors = getAutomaticTrajectoryHandleVectorsLogical(
		frames,
		frameIndex,
		logicalWidth,
		logicalHeight,
	);
	const vector = handleKey === "in" ? vectors.in : vectors.out;
	return getDocumentVectorFromLogical(vector, logicalWidth, logicalHeight);
}

export function getFrameTrajectoryHandleVectorNormalized(
	frames,
	frameMask,
	frameId,
	handleKey,
	logicalWidth = 1,
	logicalHeight = 1,
) {
	const frameIndex = (frames ?? []).findIndex((frame) => frame?.id === frameId);
	if (frameIndex < 0) {
		return null;
	}
	const nodeMode = getFrameTrajectoryNodeMode(frameMask, frameId);
	if (nodeMode === FRAME_TRAJECTORY_NODE_MODE_CORNER) {
		return { x: 0, y: 0 };
	}
	const storedNode = getStoredTrajectoryNode(frameMask, frameId);
	if (nodeMode === FRAME_TRAJECTORY_NODE_MODE_FREE) {
		return clonePoint(storedNode?.[handleKey] ?? { x: 0, y: 0 });
	}
	if (nodeMode === FRAME_TRAJECTORY_NODE_MODE_MIRRORED) {
		const directVector = clonePoint(storedNode?.[handleKey] ?? null);
		if (directVector) {
			return directVector;
		}
		const oppositeHandleKey = handleKey === "in" ? "out" : "in";
		const mirroredVector = clonePoint(storedNode?.[oppositeHandleKey] ?? null);
		return mirroredVector ? scalePoint(mirroredVector, -1) : { x: 0, y: 0 };
	}
	return getAutomaticTrajectoryHandleVectorNormalized(
		frames,
		frameIndex,
		handleKey,
		logicalWidth,
		logicalHeight,
	);
}

function getAutomaticTrajectoryHandle(
	frames,
	frameIndex,
	handleKey,
	logicalWidth,
	logicalHeight,
) {
	const center = getFrameCenterNormalized(frames[frameIndex]);
	const tangent = getAutomaticTrajectoryHandleVectorNormalized(
		frames,
		frameIndex,
		handleKey,
		logicalWidth,
		logicalHeight,
	);
	return {
		x: center.x + tangent.x,
		y: center.y + tangent.y,
	};
}

export function getFrameTrajectoryHandlePointNormalized(
	frames,
	frameMask,
	frameId,
	handleKey,
	logicalWidth = 1,
	logicalHeight = 1,
) {
	const frameIndex = (frames ?? []).findIndex((frame) => frame?.id === frameId);
	if (frameIndex < 0) {
		return null;
	}
	const center = getFrameCenterNormalized(frames[frameIndex]);
	const vector = getFrameTrajectoryHandleVectorNormalized(
		frames,
		frameMask,
		frameId,
		handleKey,
		logicalWidth,
		logicalHeight,
	);
	if (!vector) {
		return getAutomaticTrajectoryHandle(
			frames,
			frameIndex,
			handleKey,
			logicalWidth,
			logicalHeight,
		);
	}
	return addPoints(center, vector);
}

function getCenterTrajectorySegmentControlPoints(
	frames,
	frameMask,
	segmentIndex,
	logicalWidth,
	logicalHeight,
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
			logicalWidth,
			logicalHeight,
		),
		p2: getFrameTrajectoryHandlePointNormalized(
			frames,
			frameMask,
			endFrame.id,
			"in",
			logicalWidth,
			logicalHeight,
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
	logicalWidth = 1,
	logicalHeight = 1,
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
			logicalWidth,
			logicalHeight,
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

function evaluateFrameMotionGeometryAt(
	frames,
	frameMask,
	segmentIndex,
	t,
	logicalWidth,
	logicalHeight,
) {
	const startFrame = frames[segmentIndex];
	const endFrame = frames[segmentIndex + 1];
	if (!startFrame || !endFrame) {
		return null;
	}
	if (t <= 0) {
		return buildFrameRectangleGeometry(startFrame, logicalWidth, logicalHeight);
	}
	if (t >= 1) {
		return buildFrameRectangleGeometry(endFrame, logicalWidth, logicalHeight);
	}

	const centerNormalized = evaluateFrameCenterTrajectoryPointNormalized(
		frames,
		frameMask,
		segmentIndex,
		t,
		logicalWidth,
		logicalHeight,
	);
	if (!centerNormalized) {
		return null;
	}
	return buildFrameRectangleGeometry(
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
	);
}

function estimateFrameMotionSubdivisionError(
	startGeometry,
	midGeometry,
	endGeometry,
) {
	if (!startGeometry || !midGeometry || !endGeometry) {
		return 0;
	}
	const points = [
		[
			startGeometry.centerPoint,
			midGeometry.centerPoint,
			endGeometry.centerPoint,
		],
		...startGeometry.corners.map((point, index) => [
			point,
			midGeometry.corners[index],
			endGeometry.corners[index],
		]),
	];

	let maxError = 0;
	for (const [startPoint, midPoint, endPoint] of points) {
		if (
			!startPoint ||
			!midPoint ||
			!endPoint ||
			!Number.isFinite(startPoint.x) ||
			!Number.isFinite(startPoint.y) ||
			!Number.isFinite(midPoint.x) ||
			!Number.isFinite(midPoint.y) ||
			!Number.isFinite(endPoint.x) ||
			!Number.isFinite(endPoint.y)
		) {
			continue;
		}
		const linearMidpoint = {
			x: (startPoint.x + endPoint.x) * 0.5,
			y: (startPoint.y + endPoint.y) * 0.5,
		};
		maxError = Math.max(
			maxError,
			Math.hypot(midPoint.x - linearMidpoint.x, midPoint.y - linearMidpoint.y),
		);
	}
	return maxError;
}

function appendAdaptiveSegmentSamples(
	samples,
	frames,
	frameMask,
	segmentIndex,
	startT,
	endT,
	startGeometry,
	endGeometry,
	logicalWidth,
	logicalHeight,
	maxErrorPx,
	depth,
	maxDepth,
) {
	if (!startGeometry || !endGeometry) {
		return;
	}

	const midT = (startT + endT) * 0.5;
	const midGeometry = evaluateFrameMotionGeometryAt(
		frames,
		frameMask,
		segmentIndex,
		midT,
		logicalWidth,
		logicalHeight,
	);
	const errorPx = estimateFrameMotionSubdivisionError(
		startGeometry,
		midGeometry,
		endGeometry,
	);
	if (
		!midGeometry ||
		depth >= maxDepth ||
		errorPx <= maxErrorPx ||
		endT - startT <= 1 / 4096
	) {
		samples.push(endGeometry);
		return;
	}

	appendAdaptiveSegmentSamples(
		samples,
		frames,
		frameMask,
		segmentIndex,
		startT,
		midT,
		startGeometry,
		midGeometry,
		logicalWidth,
		logicalHeight,
		maxErrorPx,
		depth + 1,
		maxDepth,
	);
	appendAdaptiveSegmentSamples(
		samples,
		frames,
		frameMask,
		segmentIndex,
		midT,
		endT,
		midGeometry,
		endGeometry,
		logicalWidth,
		logicalHeight,
		maxErrorPx,
		depth + 1,
		maxDepth,
	);
}

export function sampleFrameMotionGeometries(
	frames,
	frameMask,
	logicalWidth,
	logicalHeight,
	{
		maxSegmentErrorPx = DEFAULT_FRAME_MOTION_MAX_SEGMENT_ERROR_PX,
		maxSubdivisionDepth = 8,
	} = {},
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
		const startGeometry = evaluateFrameMotionGeometryAt(
			frames,
			frameMask,
			segmentIndex,
			0,
			logicalWidth,
			logicalHeight,
		);
		const endGeometry = evaluateFrameMotionGeometryAt(
			frames,
			frameMask,
			segmentIndex,
			1,
			logicalWidth,
			logicalHeight,
		);
		if (!startGeometry || !endGeometry) {
			continue;
		}
		if (segmentIndex === 0) {
			samples.push(startGeometry);
		}
		appendAdaptiveSegmentSamples(
			samples,
			frames,
			frameMask,
			segmentIndex,
			0,
			1,
			startGeometry,
			endGeometry,
			logicalWidth,
			logicalHeight,
			maxSegmentErrorPx,
			0,
			maxSubdivisionDepth,
		);
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
		{
			maxSegmentErrorPx: Math.max(0.25, 1 / Math.max(baseSamplesPerSegment, 1)),
		},
	)
		.map((geometry) =>
			getTrajectoryPointFromGeometry(geometry, normalizedSource),
		)
		.filter((point) => Number.isFinite(point?.x) && Number.isFinite(point?.y));
}
