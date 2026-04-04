import assert from "node:assert/strict";
import { shouldUseMobileWorkbenchLayout } from "../src/ui/workbench-layout-mode.js";

assert.equal(
	shouldUseMobileWorkbenchLayout({
		widthMatches: true,
		coarseMatches: true,
		hoverNoneMatches: true,
	}),
	true,
);

assert.equal(
	shouldUseMobileWorkbenchLayout({
		widthMatches: true,
		coarseMatches: false,
		hoverNoneMatches: true,
	}),
	false,
);

assert.equal(
	shouldUseMobileWorkbenchLayout({
		widthMatches: true,
		coarseMatches: true,
		hoverNoneMatches: false,
	}),
	false,
);

assert.equal(
	shouldUseMobileWorkbenchLayout({
		widthMatches: false,
		coarseMatches: true,
		hoverNoneMatches: true,
	}),
	false,
);

console.log("✅ CAMERA_FRAMES side panel tests passed!");
