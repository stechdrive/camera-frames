import assert from "node:assert/strict";
import {
	buildFrameRectangleGeometry,
	getFrameTrajectoryHandleVectorNormalized,
	sampleFrameMotionGeometries,
} from "../src/engine/frame-trajectory.js";

{
	const frames = [
		{
			id: "frame-a",
			x: 0.18,
			y: 0.78,
			scale: 0.82,
			rotation: -24,
		},
		{
			id: "frame-b",
			x: 0.83,
			y: 0.28,
			scale: 1.15,
			rotation: 42,
		},
		{
			id: "frame-c",
			x: 0.22,
			y: 0.16,
			scale: 0.94,
			rotation: -31,
		},
	];
	const frameMask = {
		shape: "trajectory",
		trajectoryMode: "spline",
		trajectory: {
			nodesByFrameId: {
				"frame-a": {
					mode: "free",
					out: { x: 0.42, y: -0.56 },
				},
				"frame-b": {
					mode: "free",
					in: { x: -0.31, y: 0.18 },
					out: { x: 0.14, y: 0.47 },
				},
				"frame-c": {
					mode: "free",
					in: { x: -0.18, y: -0.34 },
				},
			},
		},
	};

	const samples = sampleFrameMotionGeometries(frames, frameMask, 1897, 1497);
	const firstGeometry = buildFrameRectangleGeometry(frames[0], 1897, 1497);
	const lastGeometry = buildFrameRectangleGeometry(frames[2], 1897, 1497);

	assert.ok(samples.length > 8);
	assert.deepEqual(samples[0].centerPoint, firstGeometry.centerPoint);
	assert.deepEqual(
		samples[samples.length - 1].centerPoint,
		lastGeometry.centerPoint,
	);
	assert.deepEqual(samples[samples.length - 1].corners, lastGeometry.corners);
}

{
	const frames = [
		{
			id: "frame-a",
			x: 0.2,
			y: 0.2,
		},
		{
			id: "frame-b",
			x: 0.5,
			y: 0.8,
		},
		{
			id: "frame-c",
			x: 0.8,
			y: 0.2,
		},
	];
	const frameMask = {
		trajectory: {
			nodesByFrameId: {
				"frame-b": {
					mode: "corner",
				},
			},
		},
	};

	const handleIn = getFrameTrajectoryHandleVectorNormalized(
		frames,
		frameMask,
		"frame-b",
		"in",
		1000,
		1000,
	);
	const handleOut = getFrameTrajectoryHandleVectorNormalized(
		frames,
		frameMask,
		"frame-b",
		"out",
		1000,
		1000,
	);

	assert.ok(handleIn);
	assert.ok(handleOut);
	assert.ok(Math.abs(handleIn.x + 0.1) < 1e-9);
	assert.ok(Math.abs(handleIn.y + 0.2) < 1e-9);
	assert.ok(Math.abs(handleOut.x - 0.1) < 1e-9);
	assert.ok(Math.abs(handleOut.y + 0.2) < 1e-9);
}

console.log("✅ CAMERA_FRAMES frame trajectory tests passed!");
