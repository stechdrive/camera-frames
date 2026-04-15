import assert from "node:assert/strict";
import {
	buildFrameMaskPolygon,
	createAllFrameMaskPsdLayerDocument,
	createFrameTrajectoryPsdLayerDocument,
	drawFrameMaskToContext,
	resolveFrameMaskFrames,
} from "../src/engine/frame-mask-export.js";

assert.deepEqual(
	resolveFrameMaskFrames(
		[{ id: "frame-a" }, { id: "frame-b" }, { id: "frame-c" }],
		{
			mode: "selected",
			selectedIds: ["frame-c", "frame-a"],
		},
	).map((frame) => frame.id),
	["frame-a", "frame-c"],
);
assert.deepEqual(
	resolveFrameMaskFrames([{ id: "frame-a" }, { id: "frame-b" }], {
		mode: "off",
	}),
	[],
);

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

assert.equal(
	buildFrameMaskPolygon(
		[
			{
				id: "frame-a",
				x: 0.2,
				y: 0.4,
				scale: 0.2,
				rotation: 0,
			},
			{
				id: "frame-b",
				x: 0.75,
				y: 0.55,
				scale: 0.28,
				rotation: 35,
			},
		],
		400,
		200,
		400,
		200,
		0,
		0,
		{
			frameMaskSettings: {
				shape: "trajectory",
				trajectoryMode: "spline",
			},
		},
	),
	null,
);

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

{
	let fillRectCount = 0;
	let beginPathCount = 0;
	let fillCount = 0;
	const context = {
		clearRect() {},
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
		set globalCompositeOperation(_value) {},
	};

	const polygon = drawFrameMaskToContext(
		context,
		[
			{
				id: "frame-a",
				x: 0.2,
				y: 0.4,
				scale: 0.2,
				rotation: 0,
			},
			{
				id: "frame-b",
				x: 0.75,
				y: 0.55,
				scale: 0.28,
				rotation: 35,
			},
		],
		{
			canvasWidth: 400,
			canvasHeight: 200,
			frameMaskSettings: {
				shape: "trajectory",
				trajectoryMode: "spline",
				trajectory: {
					nodesByFrameId: {
						"frame-a": {
							mode: "free",
							out: { x: 0.22, y: -0.25 },
						},
						"frame-b": {
							mode: "free",
							in: { x: -0.15, y: 0.15 },
						},
					},
				},
			},
		},
	);

	assert.equal(fillRectCount, 1);
	assert.ok(beginPathCount > 2);
	assert.ok(fillCount > 2);
	assert.equal(polygon, null);
}

{
	const layer = createAllFrameMaskPsdLayerDocument(
		[
			{
				id: "frame-a",
				x: 0.25,
				y: 0.4,
				scale: 0.2,
				rotation: 0,
			},
		],
		1536,
		864,
		{
			frameMaskSettings: {
				mode: "off",
			},
		},
	);

	assert.equal(layer, null);
}

{
	let clearRectCount = 0;
	let strokeCount = 0;
	let beginPathCount = 0;
	let recordedLineWidth = 0;
	const mockContext = {
		clearRect() {
			clearRectCount += 1;
		},
		beginPath() {
			beginPathCount += 1;
		},
		moveTo() {},
		lineTo() {},
		stroke() {
			strokeCount += 1;
		},
		set strokeStyle(_value) {},
		set lineWidth(value) {
			recordedLineWidth = value;
		},
		set lineJoin(_value) {},
		set lineCap(_value) {},
	};
	const mockCanvas = {
		width: 0,
		height: 0,
		getContext(kind) {
			return kind === "2d" ? mockContext : null;
		},
	};

	const layer = createFrameTrajectoryPsdLayerDocument(
		[
			{
				id: "frame-a",
				x: 0.25,
				y: 0.4,
				scale: 0.2,
				rotation: 0,
			},
			{
				id: "frame-b",
				x: 0.75,
				y: 0.55,
				scale: 0.25,
				rotation: 20,
			},
		],
		1536,
		864,
		{
			trajectorySource: "center",
			frameMaskSettings: {
				trajectoryMode: "spline",
			},
			createCanvas(width, height) {
				mockCanvas.width = width;
				mockCanvas.height = height;
				return mockCanvas;
			},
		},
	);

	assert.ok(layer);
	assert.equal(layer.name, "Trajectory");
	assert.equal(layer.canvas, mockCanvas);
	assert.equal(mockCanvas.width, 1536);
	assert.equal(mockCanvas.height, 864);
	assert.equal(clearRectCount, 1);
	assert.equal(beginPathCount, 1);
	assert.equal(strokeCount, 1);
	assert.equal(recordedLineWidth, 2);
}

console.log("✅ CAMERA_FRAMES frame mask export tests passed!");
