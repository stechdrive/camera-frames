import { getFrameOutlineSpec } from "./frame-overlay.js";

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

export function buildFrameMaskPolygon(
	frames,
	drawSpaceWidth,
	drawSpaceHeight,
	logicalSpaceWidth = drawSpaceWidth,
	logicalSpaceHeight = drawSpaceHeight,
	offsetX = 0,
	offsetY = 0,
) {
	if (!Array.isArray(frames) || frames.length === 0) {
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
	} = {},
) {
	if (!context) {
		throw new Error("Failed to acquire the 2D context for FRAME mask.");
	}

	context.clearRect(0, 0, canvasWidth, canvasHeight);
	if (!Array.isArray(frames) || frames.length === 0) {
		return null;
	}

	const polygon = buildFrameMaskPolygon(
		frames,
		frameSpaceWidth,
		frameSpaceHeight,
		logicalSpaceWidth,
		logicalSpaceHeight,
		offsetX,
		offsetY,
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
	});

	return {
		name,
		canvas,
		opacity,
		hidden,
	};
}
