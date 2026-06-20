import assert from "node:assert/strict";
import { BASE_FRAME } from "../src/constants.js";
import {
	COMPOSITION_GUIDE_PATTERN_CENTER,
	COMPOSITION_GUIDE_PATTERN_GOLDEN,
	COMPOSITION_GUIDE_PATTERN_GRID,
	COMPOSITION_GUIDE_PATTERN_THIRDS,
	COMPOSITION_GUIDE_SCOPE_ALL_FRAMES,
	COMPOSITION_GUIDE_SCOPE_SELECTED_FRAME,
	buildCompositionGuideLines,
	resolveCompositionGuideTarget,
	sanitizeCompositionGuideState,
} from "../src/engine/composition-guides.js";

function assertApprox(actual: number, expected: number, epsilon = 1e-6) {
	assert.ok(
		Math.abs(actual - expected) <= epsilon,
		`${actual} should be close to ${expected}`,
	);
}

const exportWidth = 2000;
const exportHeight = 1000;
const frames = [
	{
		id: "frame-a",
		x: 0.25,
		y: 0.5,
		scale: 0.5,
		rotation: 0,
	},
	{
		id: "frame-b",
		x: 0.5,
		y: 0.5,
		scale: 0.5,
		rotation: 90,
	},
];

assert.deepEqual(sanitizeCompositionGuideState(null), {
	enabled: false,
	scope: COMPOSITION_GUIDE_SCOPE_SELECTED_FRAME,
	pattern: COMPOSITION_GUIDE_PATTERN_THIRDS,
});
assert.deepEqual(
	sanitizeCompositionGuideState({
		enabled: 1,
		scope: COMPOSITION_GUIDE_SCOPE_ALL_FRAMES,
		pattern: COMPOSITION_GUIDE_PATTERN_GRID,
	}),
	{
		enabled: true,
		scope: COMPOSITION_GUIDE_SCOPE_ALL_FRAMES,
		pattern: COMPOSITION_GUIDE_PATTERN_GRID,
	},
);
assert.deepEqual(
	sanitizeCompositionGuideState({
		enabled: true,
		scope: "unknown",
		pattern: "unknown",
	}),
	{
		enabled: true,
		scope: COMPOSITION_GUIDE_SCOPE_SELECTED_FRAME,
		pattern: COMPOSITION_GUIDE_PATTERN_THIRDS,
	},
);

const selectedTarget = resolveCompositionGuideTarget({
	scope: COMPOSITION_GUIDE_SCOPE_SELECTED_FRAME,
	frames,
	activeFrameId: "frame-b",
	selectedFrameIds: ["frame-a", "frame-b"],
	frameSelectionActive: true,
	exportWidth,
	exportHeight,
});
assert.equal(selectedTarget?.frameId, "frame-b");
assert.equal(selectedTarget?.kind, COMPOSITION_GUIDE_SCOPE_SELECTED_FRAME);
assert.equal(selectedTarget?.width, BASE_FRAME.width * 0.5);
assert.equal(selectedTarget?.height, BASE_FRAME.height * 0.5);
assert.equal(selectedTarget?.rotationDeg, 90);
assert.equal(selectedTarget?.left, 1000 - (BASE_FRAME.width * 0.5) / 2);
assert.equal(selectedTarget?.top, 500 - (BASE_FRAME.height * 0.5) / 2);

const fallbackTarget = resolveCompositionGuideTarget({
	scope: COMPOSITION_GUIDE_SCOPE_SELECTED_FRAME,
	frames,
	activeFrameId: "frame-b",
	selectedFrameIds: ["frame-a"],
	frameSelectionActive: false,
	exportWidth,
	exportHeight,
});
assert.equal(fallbackTarget?.frameId, "frame-b");

const allFramesTarget = resolveCompositionGuideTarget({
	scope: COMPOSITION_GUIDE_SCOPE_ALL_FRAMES,
	frames: [frames[1]],
	activeFrameId: "frame-b",
	exportWidth,
	exportHeight,
});
assert.equal(allFramesTarget?.kind, COMPOSITION_GUIDE_SCOPE_ALL_FRAMES);
assert.equal(allFramesTarget?.frameId, null);
assert.equal(allFramesTarget?.rotationDeg, 0);
assertApprox(allFramesTarget?.width ?? 0, BASE_FRAME.height * 0.5);
assertApprox(allFramesTarget?.height ?? 0, BASE_FRAME.width * 0.5);
assertApprox(allFramesTarget?.left ?? 0, 1000 - (BASE_FRAME.height * 0.5) / 2);
assertApprox(allFramesTarget?.top ?? 0, 500 - (BASE_FRAME.width * 0.5) / 2);

const thirds = buildCompositionGuideLines({
	target: {
		width: 900,
		height: 600,
	},
	pattern: COMPOSITION_GUIDE_PATTERN_THIRDS,
}).lines;
assert.equal(thirds.length, 4);
assertApprox(thirds[0].x1, -150);
assertApprox(thirds[2].x1, 150);
assertApprox(thirds[1].y1, -100);
assertApprox(thirds[3].y1, 100);

const golden = buildCompositionGuideLines({
	target: {
		width: 1000,
		height: 1000,
	},
	pattern: COMPOSITION_GUIDE_PATTERN_GOLDEN,
}).lines;
assert.equal(golden.length, 4);
assertApprox(golden[0].x1, -118.0339887498949);
assertApprox(golden[2].x1, 118.0339887498949);

const center = buildCompositionGuideLines({
	target: {
		width: 800,
		height: 400,
	},
	pattern: COMPOSITION_GUIDE_PATTERN_CENTER,
}).lines;
assert.equal(center.length, 6);
assert.equal(center.filter((line) => line.weight === "major").length, 2);
assertApprox(center[4].x1, 0);
assertApprox(center[5].y1, 0);

const grid = buildCompositionGuideLines({
	target: {
		width: 960,
		height: 480,
	},
	pattern: COMPOSITION_GUIDE_PATTERN_GRID,
	screenWidth: 960,
	screenHeight: 480,
});
assert.deepEqual(grid.grid, { xDivisions: 10, yDivisions: 5 });
assert.equal(grid.lines.length, 13);
assert.equal(grid.lines.filter((line) => line.weight === "major").length, 1);

console.log("✅ CAMERA_FRAMES composition guide tests passed!");
