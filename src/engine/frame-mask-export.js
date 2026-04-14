import { getFrameOutlineSpec } from "./frame-overlay.js";
import {
	FRAME_MASK_SHAPE_TRAJECTORY,
	FRAME_TRAJECTORY_EXPORT_SOURCE_CENTER,
	FRAME_TRAJECTORY_EXPORT_SOURCE_NONE,
	normalizeFrameMaskShape,
	normalizeFrameTrajectoryExportSource,
	sampleFrameMotionGeometries,
	sampleFrameTrajectoryPoints,
} from "./frame-trajectory.js";

function rotatePoint(point, angleRadians) {
	const cos = Math.cos(angleRadians);
	const sin = Math.sin(angleRadians);
	return {
		x: point.x * cos - point.y * sin,
		y: point.x * sin + point.y * cos,
	};
}

function buildFrameCornerPoints(
	frame,
	drawSpaceWidth,
	drawSpaceHeight,
	logicalSpaceWidth = drawSpaceWidth,
	logicalSpaceHeight = drawSpaceHeight,
	offsetX = 0,
	offsetY = 0,
) {
	const spec = getFrameOutlineSpec(
		frame,
		drawSpaceWidth,
		drawSpaceHeight,
		logicalSpaceWidth,
		logicalSpaceHeight,
		offsetX,
		offsetY,
		{
			pixelSnapAxisAligned: false,
		},
	);
	const halfWidth = spec.width * 0.5;
	const halfHeight = spec.height * 0.5;
	return [
		{ x: -halfWidth, y: -halfHeight },
		{ x: halfWidth, y: -halfHeight },
		{ x: halfWidth, y: halfHeight },
		{ x: -halfWidth, y: halfHeight },
	].map((point) => {
		const rotated = rotatePoint(point, spec.rotationRadians);
		return {
			x: spec.centerX + rotated.x,
			y: spec.centerY + rotated.y,
		};
	});
}

function normalizeRectangleOrientationRadians(value) {
	let angle = Number(value) || 0;
	while (angle < 0) {
		angle += Math.PI;
	}
	while (angle >= Math.PI) {
		angle -= Math.PI;
	}
	return angle;
}

function buildAxisAlignedBoundingRectangle(points) {
	if (!Array.isArray(points) || points.length === 0) {
		return null;
	}
	const minX = Math.min(...points.map((point) => point.x));
	const maxX = Math.max(...points.map((point) => point.x));
	const minY = Math.min(...points.map((point) => point.y));
	const maxY = Math.max(...points.map((point) => point.y));
	return [
		{ x: minX, y: minY },
		{ x: maxX, y: minY },
		{ x: maxX, y: maxY },
		{ x: minX, y: maxY },
	];
}

function buildOrientedBoundingRectangle(points, angleRadians) {
	if (!Array.isArray(points) || points.length === 0) {
		return null;
	}
	const rotatedPoints = points.map((point) =>
		rotatePoint(point, -angleRadians),
	);
	const minX = Math.min(...rotatedPoints.map((point) => point.x));
	const maxX = Math.max(...rotatedPoints.map((point) => point.x));
	const minY = Math.min(...rotatedPoints.map((point) => point.y));
	const maxY = Math.max(...rotatedPoints.map((point) => point.y));
	return [
		{ x: minX, y: minY },
		{ x: maxX, y: minY },
		{ x: maxX, y: maxY },
		{ x: minX, y: maxY },
	].map((point) => rotatePoint(point, angleRadians));
}

function appendPolygonPath(context, polygon) {
	if (!Array.isArray(polygon) || polygon.length === 0) {
		return;
	}
	context.moveTo(polygon[0].x, polygon[0].y);
	for (let index = 1; index < polygon.length; index += 1) {
		context.lineTo(polygon[index].x, polygon[index].y);
	}
	context.closePath();
}

function projectLogicalPointToDrawSpace(
	point,
	drawSpaceWidth,
	drawSpaceHeight,
	logicalSpaceWidth,
	logicalSpaceHeight,
	offsetX,
	offsetY,
) {
	return {
		x: offsetX + (point.x / Math.max(logicalSpaceWidth, 1e-6)) * drawSpaceWidth,
		y:
			offsetY +
			(point.y / Math.max(logicalSpaceHeight, 1e-6)) * drawSpaceHeight,
	};
}

function buildProjectedMotionGeometries(
	frames,
	frameMaskSettings,
	drawSpaceWidth,
	drawSpaceHeight,
	logicalSpaceWidth,
	logicalSpaceHeight,
	offsetX,
	offsetY,
) {
	return sampleFrameMotionGeometries(
		frames,
		frameMaskSettings,
		logicalSpaceWidth,
		logicalSpaceHeight,
	).map((geometry) => ({
		...geometry,
		corners: geometry.corners.map((point) =>
			projectLogicalPointToDrawSpace(
				point,
				drawSpaceWidth,
				drawSpaceHeight,
				logicalSpaceWidth,
				logicalSpaceHeight,
				offsetX,
				offsetY,
			),
		),
	}));
}

function drawTrajectoryFrameMaskToContext(
	context,
	frames,
	{
		canvasWidth,
		canvasHeight,
		frameSpaceWidth,
		frameSpaceHeight,
		logicalSpaceWidth,
		logicalSpaceHeight,
		offsetX,
		offsetY,
		fillStyle,
		frameMaskSettings,
	},
) {
	const motionGeometries = buildProjectedMotionGeometries(
		frames,
		frameMaskSettings,
		frameSpaceWidth,
		frameSpaceHeight,
		logicalSpaceWidth,
		logicalSpaceHeight,
		offsetX,
		offsetY,
	);
	if (motionGeometries.length === 0) {
		return null;
	}

	context.fillStyle = fillStyle;
	context.fillRect(0, 0, canvasWidth, canvasHeight);
	context.globalCompositeOperation = "destination-out";
	context.beginPath();
	for (const geometry of motionGeometries) {
		appendPolygonPath(context, geometry.corners);
	}
	for (
		let geometryIndex = 1;
		geometryIndex < motionGeometries.length;
		geometryIndex += 1
	) {
		const previousCorners = motionGeometries[geometryIndex - 1].corners;
		const nextCorners = motionGeometries[geometryIndex].corners;
		for (
			let cornerIndex = 0;
			cornerIndex < previousCorners.length;
			cornerIndex += 1
		) {
			appendPolygonPath(context, [
				previousCorners[cornerIndex],
				previousCorners[(cornerIndex + 1) % previousCorners.length],
				nextCorners[(cornerIndex + 1) % nextCorners.length],
				nextCorners[cornerIndex],
			]);
		}
	}
	context.fillStyle = "#000";
	context.fill();
	context.globalCompositeOperation = "source-over";
	return null;
}

export function buildFrameMaskPolygon(
	frames,
	drawSpaceWidth,
	drawSpaceHeight,
	logicalSpaceWidth = drawSpaceWidth,
	logicalSpaceHeight = drawSpaceHeight,
	offsetX = 0,
	offsetY = 0,
	options = {},
) {
	if (!Array.isArray(frames) || frames.length === 0) {
		return null;
	}

	if (
		normalizeFrameMaskShape(
			options.frameMaskShape ?? options.frameMaskSettings?.shape,
		) === FRAME_MASK_SHAPE_TRAJECTORY
	) {
		return null;
	}

	const framePolygons = frames.map((frame) =>
		buildFrameCornerPoints(
			frame,
			drawSpaceWidth,
			drawSpaceHeight,
			logicalSpaceWidth,
			logicalSpaceHeight,
			offsetX,
			offsetY,
		),
	);
	if (framePolygons.length === 1) {
		return framePolygons[0];
	}
	const orientationAngles = frames.map((frame) =>
		normalizeRectangleOrientationRadians(
			((Number(frame?.rotation) || 0) * Math.PI) / 180,
		),
	);
	const baseOrientation = orientationAngles[0];
	const hasSharedOrientation = orientationAngles.every(
		(angle) => Math.abs(angle - baseOrientation) <= 1e-6,
	);
	const allPoints = framePolygons.flat();
	return hasSharedOrientation
		? buildOrientedBoundingRectangle(allPoints, baseOrientation)
		: buildAxisAlignedBoundingRectangle(allPoints);
}

export function drawFrameMaskToContext(
	context,
	frames,
	{
		canvasWidth,
		canvasHeight,
		frameSpaceWidth = canvasWidth,
		frameSpaceHeight = canvasHeight,
		logicalSpaceWidth = frameSpaceWidth,
		logicalSpaceHeight = frameSpaceHeight,
		offsetX = 0,
		offsetY = 0,
		fillStyle = "rgb(3, 6, 11)",
		frameMaskSettings = null,
	} = {},
) {
	if (!context) {
		throw new Error("Failed to acquire the 2D context for FRAME mask.");
	}

	context.clearRect(0, 0, canvasWidth, canvasHeight);
	if (!Array.isArray(frames) || frames.length === 0) {
		return null;
	}

	if (
		normalizeFrameMaskShape(frameMaskSettings?.shape) ===
		FRAME_MASK_SHAPE_TRAJECTORY
	) {
		return drawTrajectoryFrameMaskToContext(context, frames, {
			canvasWidth,
			canvasHeight,
			frameSpaceWidth,
			frameSpaceHeight,
			logicalSpaceWidth,
			logicalSpaceHeight,
			offsetX,
			offsetY,
			fillStyle,
			frameMaskSettings,
		});
	}

	const polygon = buildFrameMaskPolygon(
		frames,
		frameSpaceWidth,
		frameSpaceHeight,
		logicalSpaceWidth,
		logicalSpaceHeight,
		offsetX,
		offsetY,
		{ frameMaskSettings },
	);
	if (!polygon) {
		return null;
	}

	context.fillStyle = fillStyle;
	context.fillRect(0, 0, canvasWidth, canvasHeight);
	context.globalCompositeOperation = "destination-out";
	context.beginPath();
	appendPolygonPath(context, polygon);
	context.fillStyle = "#000";
	context.fill();
	context.globalCompositeOperation = "source-over";
	return polygon;
}

export function drawFrameTrajectoryToContext(
	context,
	frames,
	{
		canvasWidth,
		canvasHeight,
		frameSpaceWidth = canvasWidth,
		frameSpaceHeight = canvasHeight,
		logicalSpaceWidth = frameSpaceWidth,
		logicalSpaceHeight = frameSpaceHeight,
		offsetX = 0,
		offsetY = 0,
		strokeStyle = "#ff674d",
		lineWidth = 2,
		frameMaskSettings = null,
		trajectorySource = FRAME_TRAJECTORY_EXPORT_SOURCE_CENTER,
	} = {},
) {
	if (!context) {
		throw new Error("Failed to acquire the 2D context for FRAME trajectory.");
	}
	const normalizedSource =
		normalizeFrameTrajectoryExportSource(trajectorySource);
	if (
		!Array.isArray(frames) ||
		frames.length < 2 ||
		normalizedSource === FRAME_TRAJECTORY_EXPORT_SOURCE_NONE
	) {
		return [];
	}

	const points = sampleFrameTrajectoryPoints(
		frames,
		frameMaskSettings,
		logicalSpaceWidth,
		logicalSpaceHeight,
		{
			source: normalizedSource,
		},
	).map((point) =>
		projectLogicalPointToDrawSpace(
			point,
			frameSpaceWidth,
			frameSpaceHeight,
			logicalSpaceWidth,
			logicalSpaceHeight,
			offsetX,
			offsetY,
		),
	);

	if (points.length < 2) {
		return [];
	}

	context.clearRect(0, 0, canvasWidth, canvasHeight);
	context.beginPath();
	context.moveTo(points[0].x, points[0].y);
	for (let index = 1; index < points.length; index += 1) {
		context.lineTo(points[index].x, points[index].y);
	}
	context.strokeStyle = strokeStyle;
	context.lineWidth = lineWidth;
	context.lineJoin = "round";
	context.lineCap = "round";
	context.stroke();
	return points;
}

export function createAllFrameMaskPsdLayerDocument(
	frames,
	width,
	height,
	{
		name = "Mask",
		opacity = 0.8,
		hidden = true,
		fillStyle = "rgb(3, 6, 11)",
		createCanvas = null,
		frameMaskSettings = null,
	} = {},
) {
	if (!Array.isArray(frames) || frames.length === 0) {
		return null;
	}

	const canvas =
		typeof createCanvas === "function"
			? createCanvas(width, height)
			: (() => {
					const nextCanvas = document.createElement("canvas");
					nextCanvas.width = width;
					nextCanvas.height = height;
					return nextCanvas;
				})();
	const context = canvas.getContext("2d");
	drawFrameMaskToContext(context, frames, {
		canvasWidth: width,
		canvasHeight: height,
		fillStyle,
		frameMaskSettings,
	});

	return {
		name,
		canvas,
		opacity,
		hidden,
	};
}

export function createFrameTrajectoryPsdLayerDocument(
	frames,
	width,
	height,
	{
		name = "Trajectory",
		opacity = 1,
		strokeStyle = "#ff674d",
		lineWidth = 2,
		createCanvas = null,
		frameMaskSettings = null,
		trajectorySource = FRAME_TRAJECTORY_EXPORT_SOURCE_CENTER,
	} = {},
) {
	const normalizedSource =
		normalizeFrameTrajectoryExportSource(trajectorySource);
	if (
		!Array.isArray(frames) ||
		frames.length < 2 ||
		normalizedSource === FRAME_TRAJECTORY_EXPORT_SOURCE_NONE
	) {
		return null;
	}

	const canvas =
		typeof createCanvas === "function"
			? createCanvas(width, height)
			: (() => {
					const nextCanvas = document.createElement("canvas");
					nextCanvas.width = width;
					nextCanvas.height = height;
					return nextCanvas;
				})();
	const context = canvas.getContext("2d");
	const points = drawFrameTrajectoryToContext(context, frames, {
		canvasWidth: width,
		canvasHeight: height,
		strokeStyle,
		lineWidth,
		frameMaskSettings,
		trajectorySource: normalizedSource,
	});
	if (points.length < 2) {
		return null;
	}

	return {
		name,
		canvas,
		opacity,
	};
}
