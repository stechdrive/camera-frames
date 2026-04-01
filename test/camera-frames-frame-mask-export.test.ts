import assert from "node:assert/strict";
import {
	buildFrameMaskPolygon,
	drawFrameMaskToContext,
} from "../src/engine/frame-mask-export.js";

{
	const polygon = buildFrameMaskPolygon(
		[
			{
				id: "frame-1",
				x: 0.5,
				y: 0.5,
				scale: 0.25,
				rotation: 30,
			},
		],
		400,
		200,
		400,
		200,
	);

	assert.equal(polygon.length, 4);
	const xs = polygon.map((point) => point.x);
	const ys = polygon.map((point) => point.y);
	assert.ok(Math.min(...xs) < 200);
	assert.ok(Math.max(...xs) > 200);
	assert.ok(Math.min(...ys) < 100);
	assert.ok(Math.max(...ys) > 100);
}

{
	const polygon = buildFrameMaskPolygon(
		[
			{
				id: "frame-a",
				x: 0.35,
				y: 0.45,
				scale: 0.2,
				rotation: 20,
			},
			{
				id: "frame-b",
				x: 0.65,
				y: 0.55,
				scale: 0.2,
				rotation: 20,
			},
		],
		400,
		200,
		400,
		200,
	);

	assert.equal(polygon.length, 4);
	const xs = polygon.map((point) => point.x);
	const ys = polygon.map((point) => point.y);
	assert.ok(Math.min(...xs) < 140);
	assert.ok(Math.max(...xs) > 260);
	assert.ok(Math.min(...ys) < 70);
	assert.ok(Math.max(...ys) > 130);
}

{
	const polygon = buildFrameMaskPolygon(
		[
			{
				id: "frame-a",
				x: 0.35,
				y: 0.45,
				scale: 0.2,
				rotation: 20,
			},
			{
				id: "frame-b",
				x: 0.65,
				y: 0.55,
				scale: 0.2,
				rotation: 0,
			},
		],
		400,
		200,
		400,
		200,
	);

	assert.equal(polygon.length, 4);
	assert.ok(Math.abs(polygon[0].y - polygon[1].y) < 1e-6);
	assert.ok(Math.abs(polygon[1].x - polygon[2].x) < 1e-6);
}

{
	let clearRectCount = 0;
	let fillRectCount = 0;
	let beginPathCount = 0;
	let fillCount = 0;
	let compositeOperation = "source-over";
	const context = {
		clearRect() {
			clearRectCount += 1;
		},
		fillRect() {
			fillRectCount += 1;
		},
		beginPath() {
			beginPathCount += 1;
		},
		moveTo() {},
		lineTo() {},
		closePath() {},
		fill() {
			fillCount += 1;
		},
		set fillStyle(_value) {},
		set globalCompositeOperation(value) {
			compositeOperation = value;
		},
		get globalCompositeOperation() {
			return compositeOperation;
		},
	};

	const polygon = drawFrameMaskToContext(
		context,
		[
			{
				id: "frame-1",
				x: 0.5,
				y: 0.5,
				scale: 0.3,
				rotation: 45,
			},
		],
		{
			canvasWidth: 400,
			canvasHeight: 200,
		},
	);

	assert.equal(clearRectCount, 1);
	assert.equal(fillRectCount, 1);
	assert.equal(beginPathCount, 1);
	assert.equal(fillCount, 1);
	assert.equal(compositeOperation, "source-over");
	assert.equal(polygon.length, 4);
}

console.log("✅ CAMERA_FRAMES frame mask export tests passed!");
