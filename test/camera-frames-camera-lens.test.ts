import assert from "node:assert/strict";
import {
	clampStandardFrameHorizontalEquivalentMm,
	getBaseHorizontalFovDegreesForStandardFrameHorizontalEquivalentMm,
	getStandardFrameCropFactor,
	getStandardFrameHorizontalEquivalentMm,
	getStandardFrameHorizontalFovDegrees,
	snapStandardFrameHorizontalEquivalentMm,
} from "../src/engine/camera-lens.js";

assert.ok(Math.abs(getStandardFrameCropFactor() - 1.1419270833333333) < 1e-9);
assert.ok(
	Math.abs(getStandardFrameHorizontalFovDegrees(60) - 53.64167726482178) < 1e-9,
);
assert.ok(
	Math.abs(getStandardFrameHorizontalEquivalentMm(60) - 35.60176308370091) <
		1e-9,
);
assert.ok(
	Math.abs(
		getBaseHorizontalFovDegreesForStandardFrameHorizontalEquivalentMm(
			getStandardFrameHorizontalEquivalentMm(60),
		) - 60,
	) < 1e-9,
);
assert.equal(clampStandardFrameHorizontalEquivalentMm(10), 14);
assert.equal(clampStandardFrameHorizontalEquivalentMm(240), 200);
assert.equal(snapStandardFrameHorizontalEquivalentMm(74), 75);
assert.equal(snapStandardFrameHorizontalEquivalentMm(72), 72);

console.log("✅ CAMERA_FRAMES camera lens tests passed!");
