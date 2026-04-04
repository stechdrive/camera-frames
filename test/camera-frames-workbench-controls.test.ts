import assert from "node:assert/strict";
import { formatNumericDraftDisplayValue } from "../src/ui/numeric-draft-format.js";

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

console.log("✅ CAMERA_FRAMES workbench controls tests passed!");
