import { BASE_FRAME, FRAME_OUTLINE_WIDTH_PX } from "../constants.js";

const QUARTER_TURN_RADIANS = Math.PI * 0.5;
const AXIS_ALIGNMENT_EPSILON = 1e-3;

export function getFrameRotationRadians(frame) {
	return ((frame.rotation ?? 0) * Math.PI) / 180;
}

export function isAxisAlignedRotation(rotationRadians) {
	const nearestQuarterTurn =
		Math.round(rotationRadians / QUARTER_TURN_RADIANS) * QUARTER_TURN_RADIANS;
	return (
		Math.abs(rotationRadians - nearestQuarterTurn) < AXIS_ALIGNMENT_EPSILON
	);
}

export function snapAxisAlignedFrameRect(centerX, centerY, width, height) {
	const left = Math.round(centerX - width * 0.5);
	const right = Math.round(centerX + width * 0.5);
	const top = Math.round(centerY - height * 0.5);
	const bottom = Math.round(centerY + height * 0.5);

	return {
		x: left,
		y: top,
		width: Math.max(0, right - left),
		height: Math.max(0, bottom - top),
	};
}

function getFrameScale(frame) {
	const value = Number(frame.scale);
	return Number.isFinite(value) && value > 0 ? value : 1;
}

export function getFrameOutlineSize(
	frame,
	drawSpaceWidth,
	drawSpaceHeight,
	logicalSpaceWidth = drawSpaceWidth,
	logicalSpaceHeight = drawSpaceHeight,
) {
	const scale = getFrameScale(frame);
	const widthScale = drawSpaceWidth / Math.max(logicalSpaceWidth, 1e-6);
	const heightScale = drawSpaceHeight / Math.max(logicalSpaceHeight, 1e-6);

	return {
		width: BASE_FRAME.width * scale * widthScale,
		height: BASE_FRAME.height * scale * heightScale,
	};
}

export function getFrameOutlineSpec(
	frame,
	drawSpaceWidth,
	drawSpaceHeight,
	logicalSpaceWidth = drawSpaceWidth,
	logicalSpaceHeight = drawSpaceHeight,
	offsetX = 0,
	offsetY = 0,
) {
	const { width, height } = getFrameOutlineSize(
		frame,
		drawSpaceWidth,
		drawSpaceHeight,
		logicalSpaceWidth,
		logicalSpaceHeight,
	);
	const centerX = offsetX + frame.x * drawSpaceWidth;
	const centerY = offsetY + frame.y * drawSpaceHeight;
	const rotationRadians = getFrameRotationRadians(frame);
	const nearestQuarterTurn = Math.round(rotationRadians / QUARTER_TURN_RADIANS);
	const axisAligned = isAxisAlignedRotation(rotationRadians);
	const swapAxes = axisAligned && Math.abs(nearestQuarterTurn) % 2 === 1;
	const snappedRect = axisAligned
		? snapAxisAlignedFrameRect(
				centerX,
				centerY,
				swapAxes ? height : width,
				swapAxes ? width : height,
			)
		: null;

	return {
		centerX,
		centerY,
		width,
		height,
		rotationRadians,
		axisAligned,
		snappedRect,
	};
}

export function strokeFrameOutlinePath(
	context,
	x,
	y,
	width,
	height,
	lineWidth = FRAME_OUTLINE_WIDTH_PX,
) {
	const expand = lineWidth * 0.5;
	context.strokeRect(
		x - expand,
		y - expand,
		width + expand * 2,
		height + expand * 2,
	);
}

function strokeFrameFromSpec(
	context,
	spec,
	lineWidth = FRAME_OUTLINE_WIDTH_PX,
) {
	if (spec.axisAligned && spec.snappedRect) {
		strokeFrameOutlinePath(
			context,
			spec.snappedRect.x,
			spec.snappedRect.y,
			spec.snappedRect.width,
			spec.snappedRect.height,
			lineWidth,
		);
		return;
	}

	context.translate(spec.centerX, spec.centerY);
	context.rotate(spec.rotationRadians);
	strokeFrameOutlinePath(
		context,
		-spec.width * 0.5,
		-spec.height * 0.5,
		spec.width,
		spec.height,
		lineWidth,
	);
}

export function drawFramesToContext(
	context,
	drawSpaceWidth,
	drawSpaceHeight,
	frames,
	options = {},
) {
	const {
		strokeStyle = "#ff0000",
		lineWidth = FRAME_OUTLINE_WIDTH_PX,
		selectedFrameId = null,
		selectedStrokeStyle = null,
		selectedLineWidth = 1,
		selectedLineDash = [4, 2],
		logicalSpaceWidth = drawSpaceWidth,
		logicalSpaceHeight = drawSpaceHeight,
		offsetX = 0,
		offsetY = 0,
	} = options;

	const framesSorted = [...frames].sort(
		(left, right) => (left.order ?? 0) - (right.order ?? 0),
	);

	for (const frame of framesSorted) {
		const spec = getFrameOutlineSpec(
			frame,
			drawSpaceWidth,
			drawSpaceHeight,
			logicalSpaceWidth,
			logicalSpaceHeight,
			offsetX,
			offsetY,
		);

		context.save();
		context.strokeStyle = strokeStyle;
		context.lineWidth = lineWidth;
		context.setLineDash([]);
		strokeFrameFromSpec(context, spec, lineWidth);
		context.restore();

		if (
			selectedFrameId &&
			frame.id === selectedFrameId &&
			selectedStrokeStyle
		) {
			context.save();
			context.strokeStyle = selectedStrokeStyle;
			context.lineWidth = selectedLineWidth;
			context.setLineDash(selectedLineDash);
			strokeFrameFromSpec(context, spec, selectedLineWidth);
			context.restore();
		}
	}
}
