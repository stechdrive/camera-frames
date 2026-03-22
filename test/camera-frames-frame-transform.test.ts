import assert from "node:assert/strict";
import { BASE_FRAME } from "../src/constants.js";
import {
	FRAME_MAX_SCALE,
	FRAME_MIN_SCALE,
	getFrameAnchorDocumentPoint,
	getFrameAnchorHandleKey,
	getFrameAnchorLocalNormalized,
	getFrameAnchorNormalized,
	getFrameAnchorWorldPoint,
	getFrameDocumentCenterFromWorld,
	getFrameResizeAxisLocal,
	getFrameWorldPointFromLocal,
	getOppositeFrameResizeHandleKey,
	getUniformFrameScaleFromHandle,
	normalizeRotationDegrees,
	rotateVector,
} from "../src/engine/frame-transform.js";

function almostEqual(actual, expected, message) {
	assert.ok(
		Math.abs(actual - expected) < 1e-9,
		`${message}: expected ${expected}, got ${actual}`,
	);
}

const metrics = {
	boxLeft: 100,
	boxTop: 50,
	boxWidth: 400,
	boxHeight: 200,
	exportWidth: 1754,
	exportHeight: 1240,
};

assert.deepEqual(getFrameAnchorNormalized("bottom-right"), { x: 1, y: 1 });
assert.deepEqual(
	getFrameAnchorNormalized(
		{ x: 0.2, y: 0.75 },
		{
			x: 0.5,
			y: 0.5,
		},
	),
	{
		x: 0.2,
		y: 0.75,
	},
);
assert.equal(getFrameAnchorHandleKey({ x: 0, y: 0 }), "top-left");
assert.equal(getFrameAnchorHandleKey({ x: 0.5, y: 0.5 }), "");
assert.equal(getFrameAnchorHandleKey({ x: 0.33, y: 0.62 }), "");
assert.equal(getOppositeFrameResizeHandleKey("top-left"), "bottom-right");
assert.equal(getOppositeFrameResizeHandleKey("left"), "right");
assert.equal(normalizeRotationDegrees(185), -175);

{
	const frame = {
		x: 0.4,
		y: 0.6,
		anchor: {
			x: 0.3,
			y: 0.7,
		},
	};
	assert.deepEqual(getFrameAnchorDocumentPoint(frame), {
		x: 0.3,
		y: 0.7,
	});
}

{
	const frame = {
		x: 0.4,
		y: 0.6,
		anchor: {
			x: 1.35,
			y: -0.25,
		},
	};
	assert.deepEqual(getFrameAnchorDocumentPoint(frame), {
		x: 1.35,
		y: -0.25,
	});
}

{
	const frame = {
		x: 0.5,
		y: 0.5,
		anchor: {
			x: 0.5,
			y: 0.5,
		},
		rotation: 0,
		scale: 1,
	};
	const local = getFrameAnchorLocalNormalized(
		frame,
		{
			width: BASE_FRAME.width,
			height: BASE_FRAME.height,
			rotationRadians: 0,
		},
		{
			boxWidth: metrics.exportWidth,
			boxHeight: metrics.exportHeight,
		},
	);
	almostEqual(local.x, 0.5, "center anchor local x");
	almostEqual(local.y, 0.5, "center anchor local y");
}

{
	const frame = {
		x: 0.5,
		y: 0.5,
		anchor: {
			x: 0.5 - BASE_FRAME.width / (2 * metrics.exportWidth),
			y: 0.5 - BASE_FRAME.height / (2 * metrics.exportHeight),
		},
		rotation: 0,
		scale: 1,
	};
	const local = getFrameAnchorLocalNormalized(
		frame,
		{
			width: BASE_FRAME.width,
			height: BASE_FRAME.height,
			rotationRadians: 0,
		},
		{
			boxWidth: metrics.exportWidth,
			boxHeight: metrics.exportHeight,
		},
	);
	almostEqual(local.x, 0, "top-left anchor local x");
	almostEqual(local.y, 0, "top-left anchor local y");
}

{
	const frame = {
		x: 0.25,
		y: 0.75,
		anchor: {
			x: 0.4,
			y: 0.35,
		},
	};
	const world = getFrameAnchorWorldPoint(frame, metrics);
	almostEqual(world.x, 100 + 400 * 0.4, "anchor world x");
	almostEqual(world.y, 50 + 200 * 0.35, "anchor world y");
}

{
	const axis = getFrameResizeAxisLocal(
		{
			width: 180,
			height: 120,
		},
		"top",
		{ x: 0.5, y: 0.5 },
	);
	assert.ok(axis, "top handle axis should exist");
	almostEqual(axis.x, 0, "top handle axis x");
	almostEqual(axis.y, -1, "top handle axis y");
}

{
	const rotated = rotateVector(10, 0, Math.PI * 0.5);
	almostEqual(rotated.x, 0, "rotation x");
	almostEqual(rotated.y, 10, "rotation y");
}

{
	const world = getFrameWorldPointFromLocal(
		{
			centerX: 200,
			centerY: 100,
			width: 100,
			height: 60,
			rotationRadians: 0,
		},
		{ x: 0, y: 1 },
	);
	almostEqual(world.x, 150, "local world x");
	almostEqual(world.y, 130, "local world y");
}

{
	const nextScale = getUniformFrameScaleFromHandle({
		pointerWorldX: 100,
		pointerWorldY: 40,
		anchorWorldX: 100,
		anchorWorldY: 100,
		rotationRadians: 0,
		axisX: 0,
		axisY: -1,
		startProjectionDistance: 40,
		startScale: 1,
		fallbackScale: 1,
	});

	assert.ok(nextScale > 1, "vertical top-handle drag should increase scale");
}

{
	const unchangedScale = getUniformFrameScaleFromHandle({
		pointerWorldX: 140,
		pointerWorldY: 60,
		anchorWorldX: 100,
		anchorWorldY: 100,
		rotationRadians: 0,
		axisX: 0,
		axisY: -1,
		startProjectionDistance: 40,
		startScale: 1,
		fallbackScale: 1,
	});

	almostEqual(
		unchangedScale,
		1,
		"horizontal motion on top handle should not affect scale",
	);
}

{
	const minScale = getUniformFrameScaleFromHandle({
		pointerWorldX: 100,
		pointerWorldY: 99.5,
		anchorWorldX: 100,
		anchorWorldY: 100,
		rotationRadians: 0,
		axisX: 0,
		axisY: -1,
		startProjectionDistance: 40,
		startScale: 1,
		fallbackScale: 1,
	});

	assert.equal(minScale, FRAME_MIN_SCALE, "scale should clamp to minimum");
}

{
	const maxScale = getUniformFrameScaleFromHandle({
		pointerWorldX: 100,
		pointerWorldY: -1000,
		anchorWorldX: 100,
		anchorWorldY: 100,
		rotationRadians: 0,
		axisX: 0,
		axisY: -1,
		startProjectionDistance: 40,
		startScale: 1,
		fallbackScale: 1,
	});

	assert.equal(maxScale, FRAME_MAX_SCALE, "scale should clamp to maximum");
}

{
	const docPoint = getFrameDocumentCenterFromWorld(300, 150, metrics);
	almostEqual(docPoint.x, 0.5, "document x");
	almostEqual(docPoint.y, 0.5, "document y");
}

console.log("✅ CAMERA_FRAMES frame transform tests passed!");
