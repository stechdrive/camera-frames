import assert from "node:assert/strict";
import {
	shouldUseCompactDesktopWorkbenchLayout,
	shouldUseMobileWorkbenchLayout,
} from "../src/ui/workbench-layout-mode.js";

assert.equal(
	shouldUseMobileWorkbenchLayout({
		widthMatches: true,
		coarsePointerMatches: true,
		noHoverMatches: true,
	}),
	true,
);

assert.equal(
	shouldUseMobileWorkbenchLayout({
		widthMatches: false,
		coarsePointerMatches: true,
		noHoverMatches: true,
	}),
	false,
);

assert.equal(
	shouldUseMobileWorkbenchLayout({
		widthMatches: true,
		coarsePointerMatches: false,
		noHoverMatches: true,
	}),
	false,
);

assert.equal(
	shouldUseMobileWorkbenchLayout({
		widthMatches: true,
		coarsePointerMatches: true,
		noHoverMatches: false,
	}),
	false,
);

assert.equal(
	shouldUseCompactDesktopWorkbenchLayout({
		widthMatches: true,
		coarsePointerMatches: false,
		noHoverMatches: false,
	}),
	true,
);

assert.equal(
	shouldUseCompactDesktopWorkbenchLayout({
		widthMatches: true,
		coarsePointerMatches: true,
		noHoverMatches: true,
	}),
	false,
);

assert.equal(
	shouldUseCompactDesktopWorkbenchLayout({
		widthMatches: false,
		coarsePointerMatches: false,
		noHoverMatches: false,
	}),
	false,
);

console.log("✅ CAMERA_FRAMES side panel tests passed!");
