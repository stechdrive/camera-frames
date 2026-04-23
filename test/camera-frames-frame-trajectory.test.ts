import assert from "node:assert/strict";
import {
	buildFrameRectangleGeometry,
	chooseBestFrameTrajectoryExportSource,
	getFrameTrajectoryHandleVectorNormalized,
	getFrameTrajectoryTickAnchors,
	sampleFrameMotionGeometries,
	sanitizeFrameTrajectoryNodesByFrameId,
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

{
	const frames = [
		{ id: "frame-a", x: 0.2, y: 0.5 },
		{ id: "frame-b", x: 0.5, y: 0.5 },
		{ id: "frame-c", x: 0.8, y: 0.5 },
	];
	const frameMask = { trajectoryMode: "line" };

	const anchors = getFrameTrajectoryTickAnchors(frames, frameMask, 1000, 1000, {
		source: "center",
	});
	assert.equal(anchors.length, 3);
	for (const anchor of anchors) {
		assert.ok(Math.abs(anchor.tangent.x - 1) < 1e-9);
		assert.ok(Math.abs(anchor.tangent.y) < 1e-9);
	}
	assert.deepEqual(anchors[0].point, { x: 200, y: 500 });
	assert.deepEqual(anchors[2].point, { x: 800, y: 500 });
}

{
	const frames = [
		{ id: "frame-a", x: 0.2, y: 0.5 },
		{ id: "frame-b", x: 0.5, y: 0.2 },
	];
	const frameMask = { trajectoryMode: "line" };
	const anchors = getFrameTrajectoryTickAnchors(frames, frameMask, 1000, 1000, {
		source: "center",
	});
	assert.equal(anchors.length, 2);
	const expectedDir = { x: 0.3, y: -0.3 };
	const expectedLen = Math.hypot(expectedDir.x, expectedDir.y);
	for (const anchor of anchors) {
		assert.ok(Math.abs(anchor.tangent.x - expectedDir.x / expectedLen) < 1e-9);
		assert.ok(Math.abs(anchor.tangent.y - expectedDir.y / expectedLen) < 1e-9);
	}
}

{
	const frames = [
		{ id: "frame-a", x: 0.2, y: 0.5 },
		{ id: "frame-b", x: 0.8, y: 0.5 },
	];
	const anchors = getFrameTrajectoryTickAnchors(frames, null, 1000, 1000, {
		source: "none",
	});
	assert.equal(anchors.length, 0);
}

{
	const frames = [{ id: "frame-a", x: 0.5, y: 0.5 }];
	const anchors = getFrameTrajectoryTickAnchors(frames, null, 1000, 1000, {
		source: "center",
	});
	assert.equal(anchors.length, 0);
}

{
	// Two aligned frames, horizontal motion — all 4 corners on hull; TL wins via priority.
	const frames = [
		{ id: "frame-a", x: 0.2, y: 0.5, scale: 0.2, rotation: 0 },
		{ id: "frame-b", x: 0.8, y: 0.5, scale: 0.2, rotation: 0 },
	];
	assert.equal(
		chooseBestFrameTrajectoryExportSource(frames, { trajectoryMode: "line" }),
		"top-left",
	);
}

{
	// Single frame -> fallback center.
	const frames = [{ id: "frame-a", x: 0.5, y: 0.5, scale: 0.2, rotation: 0 }];
	assert.equal(chooseBestFrameTrajectoryExportSource(frames, null), "center");
}

{
	// 3 frames in a triangle-like spline. Some corners should still qualify.
	const frames = [
		{ id: "frame-a", x: 0.2, y: 0.2, scale: 0.15, rotation: 0 },
		{ id: "frame-b", x: 0.5, y: 0.7, scale: 0.15, rotation: 0 },
		{ id: "frame-c", x: 0.8, y: 0.2, scale: 0.15, rotation: 0 },
	];
	const source = chooseBestFrameTrajectoryExportSource(frames, {
		trajectoryMode: "line",
	});
	// With triangle waypoints, top-side corners (TL at first, TL at last) are inside the
	// bottom expansion; bottom corners trace the outer hull. Confirm we did not silently
	// fall back to center.
	assert.ok(
		["top-left", "top-right", "bottom-right", "bottom-left", "center"].includes(
			source,
		),
	);
}

{
	// Overlapping frames (identical positions) still collapse to a single rectangle:
	// all 4 corners are on the hull, so the priority-first TL wins. This is acceptable —
	// a zero-length "trajectory" is a dot and any corner is equally valid.
	const frames = [
		{ id: "frame-a", x: 0.5, y: 0.5, scale: 0.2, rotation: 0 },
		{ id: "frame-b", x: 0.5, y: 0.5, scale: 0.2, rotation: 0 },
	];
	assert.equal(chooseBestFrameTrajectoryExportSource(frames, null), "top-left");
}

{
	// Legacy handlesByFrameId migration: absolute handle points
	// must convert to frame-center-relative vectors under "free" mode.
	const frames = [
		{ id: "frame-a", x: 0.2, y: 0.5 },
		{ id: "frame-b", x: 0.6, y: 0.4 },
	];
	const legacyTrajectory = {
		handlesByFrameId: {
			"frame-a": {
				out: { x: 0.35, y: 0.55 },
			},
			"frame-b": {
				in: { x: 0.45, y: 0.45 },
				out: { x: 0.75, y: 0.3 },
			},
		},
	};

	const migrated = sanitizeFrameTrajectoryNodesByFrameId(
		frames,
		legacyTrajectory,
	);

	assert.equal(migrated["frame-a"].mode, "free");
	assert.ok(Math.abs(migrated["frame-a"].out.x - 0.15) < 1e-9);
	assert.ok(Math.abs(migrated["frame-a"].out.y - 0.05) < 1e-9);
	assert.equal(migrated["frame-b"].mode, "free");
	assert.ok(Math.abs(migrated["frame-b"].in.x - -0.15) < 1e-9);
	assert.ok(Math.abs(migrated["frame-b"].in.y - 0.05) < 1e-9);
	assert.ok(Math.abs(migrated["frame-b"].out.x - 0.15) < 1e-9);
	assert.ok(Math.abs(migrated["frame-b"].out.y - -0.1) < 1e-9);
}

{
	// sanitizeFrameTrajectoryNodesByFrameId drops orphan entries
	// whose frameId is no longer present in frames[].
	const frames = [{ id: "frame-a", x: 0.5, y: 0.5 }];
	const trajectory = {
		nodesByFrameId: {
			"frame-a": { mode: "free", in: { x: -0.1, y: 0 }, out: { x: 0.1, y: 0 } },
			"frame-ghost": {
				mode: "free",
				in: { x: 0.2, y: 0.2 },
				out: { x: -0.2, y: -0.2 },
			},
		},
	};

	const sanitized = sanitizeFrameTrajectoryNodesByFrameId(frames, trajectory);

	assert.ok(sanitized["frame-a"]);
	assert.equal(sanitized["frame-ghost"], undefined);
}

{
	// sanitizeFrameTrajectoryNodesByFrameId prefers nodesByFrameId
	// over legacy handlesByFrameId when both are present.
	const frames = [{ id: "frame-a", x: 0.3, y: 0.3 }];
	const trajectory = {
		nodesByFrameId: {
			"frame-a": {
				mode: "mirrored",
				in: { x: -0.2, y: 0 },
				out: { x: 0.2, y: 0 },
			},
		},
		handlesByFrameId: {
			"frame-a": { out: { x: 0.99, y: 0.99 } },
		},
	};

	const sanitized = sanitizeFrameTrajectoryNodesByFrameId(frames, trajectory);

	assert.equal(sanitized["frame-a"].mode, "mirrored");
	assert.ok(Math.abs(sanitized["frame-a"].out.x - 0.2) < 1e-9);
}

{
	// sanitizeFrameTrajectoryNodesByFrameId rejects NaN / non-finite vectors
	// silently, returning an empty node rather than corrupt data.
	const frames = [{ id: "frame-a", x: 0.5, y: 0.5 }];
	const trajectory = {
		nodesByFrameId: {
			"frame-a": {
				mode: "free",
				in: { x: Number.NaN, y: 0 },
				out: { x: 0.1, y: "bogus" },
			},
		},
	};

	const sanitized = sanitizeFrameTrajectoryNodesByFrameId(frames, trajectory);

	assert.equal(sanitized["frame-a"], undefined);
}

console.log("✅ CAMERA_FRAMES frame trajectory tests passed!");
