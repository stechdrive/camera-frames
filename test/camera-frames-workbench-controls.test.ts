import assert from "node:assert/strict";
import { isDraftInputCompositionActive } from "../src/ui/draft-input-events.js";
import { formatNumericDraftDisplayValue } from "../src/ui/numeric-draft-format.js";
import {
	getNumericScrubEdgeHoldVelocityAfterPointerMove,
	getNumericScrubPointerVelocityPxPerMs,
} from "../src/ui/workbench-controls.js";

assert.equal(
	formatNumericDraftDisplayValue(12.34567, {
		template: "12.34",
		step: "0.01",
	}),
	"12.35",
);

assert.equal(
	formatNumericDraftDisplayValue(0.1234, {
		template: "+0.00",
		step: "0.01",
	}),
	"+0.12",
);

assert.equal(
	formatNumericDraftDisplayValue(-0.1234, {
		template: "+0.00",
		step: "0.01",
	}),
	"-0.12",
);

assert.equal(
	formatNumericDraftDisplayValue(42.75, {
		template: "43",
		step: "1",
	}),
	"43",
);

assert.equal(
	formatNumericDraftDisplayValue(18.7654, {
		template: "18.76",
		step: "0.01",
		formatDisplayValue: (value) => `${Number(value).toFixed(1)}mm`,
	}),
	"18.8mm",
);

assert.equal(
	isDraftInputCompositionActive({
		isComposing: true,
	}),
	true,
);

assert.equal(
	isDraftInputCompositionActive({
		nativeEvent: {
			isComposing: true,
		},
	}),
	true,
);

assert.equal(
	isDraftInputCompositionActive({
		keyCode: 229,
	}),
	true,
);

assert.equal(isDraftInputCompositionActive({}, true), true);
assert.equal(isDraftInputCompositionActive({}, false), false);

function assertNearlyEqual(actual: number, expected: number, epsilon = 1e-9) {
	assert.ok(
		Math.abs(actual - expected) <= epsilon,
		`expected ${actual} to be within ${epsilon} of ${expected}`,
	);
}

assert.equal(
	getNumericScrubPointerVelocityPxPerMs({
		deltaPixels: 24,
		elapsedMs: 16,
	}),
	1.5,
);
assert.equal(
	getNumericScrubPointerVelocityPxPerMs({
		deltaPixels: 240,
		elapsedMs: 16,
	}),
	2.4,
);
assertNearlyEqual(
	getNumericScrubEdgeHoldVelocityAfterPointerMove({
		currentVelocityPxPerMs: 1.2,
		movementVelocityPxPerMs: -0.35,
	}),
	0.85,
);
assert.equal(
	getNumericScrubEdgeHoldVelocityAfterPointerMove({
		currentVelocityPxPerMs: 0.2,
		movementVelocityPxPerMs: -0.35,
	}),
	0,
);

console.log("✅ CAMERA_FRAMES workbench controls tests passed!");
