import assert from "node:assert/strict";
import {
	computeReferenceMultiSelectionSessionRotationDelta,
	computeReferenceMultiSelectionSessionScaleFactor,
	computeReferenceMultiSelectionTargetOffsetDelta,
	computeReferenceMultiSelectionTargetRotationDelta,
	computeReferenceMultiSelectionTargetScaleFactor,
} from "../src/ui/reference-multi-selection-input.js";

assert.equal(computeReferenceMultiSelectionTargetOffsetDelta(5, 12), 7);

assert.equal(computeReferenceMultiSelectionTargetOffsetDelta(12, 12), null);

assert.equal(computeReferenceMultiSelectionTargetRotationDelta(15, 30), 15);

assert.equal(computeReferenceMultiSelectionTargetRotationDelta(170, -170), 20);

assert.ok(
	Math.abs(
		(computeReferenceMultiSelectionTargetScaleFactor(20, 50) ?? 0) - 1.25,
	) <= 1e-8,
);

assert.equal(computeReferenceMultiSelectionTargetScaleFactor(50, 50), null);

assert.equal(computeReferenceMultiSelectionSessionRotationDelta(15, 45), 30);

assert.equal(computeReferenceMultiSelectionSessionRotationDelta(170, -170), 20);

assert.ok(
	Math.abs(
		(computeReferenceMultiSelectionSessionScaleFactor(20, 50) ?? 0) - 1.25,
	) <= 1e-8,
);

assert.equal(computeReferenceMultiSelectionSessionScaleFactor(50, 50), null);

console.log("✅ CAMERA_FRAMES reference multi-selection input tests passed!");
