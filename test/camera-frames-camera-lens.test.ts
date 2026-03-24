import assert from "node:assert/strict";
import {
	clampStandardFrameEquivalentMm,
	getBaseHorizontalFovDegreesForStandardFrameEquivalentMm,
	getStandardFrameCropFactor,
	getStandardFrameEquivalentMm,
	getStandardFrameHorizontalFovDegrees,
	snapStandardFrameEquivalentMm,
} from "../src/engine/camera-lens.js";

assert.ok(Math.abs(getStandardFrameCropFactor() - 1.1419270833333333) < 1e-9);
assert.ok(
	Math.abs(getStandardFrameHorizontalFovDegrees(60) - 53.64167726482178) < 1e-9,
);
assert.ok(
	Math.abs(getStandardFrameEquivalentMm(60) - 37.292968938796356) < 1e-9,
);
assert.ok(
	Math.abs(
		getBaseHorizontalFovDegreesForStandardFrameEquivalentMm(
			getStandardFrameEquivalentMm(60),
		) - 60,
	) < 1e-9,
);
assert.equal(clampStandardFrameEquivalentMm(10), 14);
assert.equal(clampStandardFrameEquivalentMm(240), 200);
assert.equal(snapStandardFrameEquivalentMm(74), 75);
assert.equal(snapStandardFrameEquivalentMm(72), 72);

console.log("✅ CAMERA_FRAMES camera lens tests passed!");
