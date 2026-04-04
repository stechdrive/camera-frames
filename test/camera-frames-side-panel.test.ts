import assert from "node:assert/strict";
import { shouldUseMobileWorkbenchLayout } from "../src/ui/workbench-layout-mode.js";

assert.equal(
	shouldUseMobileWorkbenchLayout({
		widthMatches: true,
	}),
	true,
);

assert.equal(
	shouldUseMobileWorkbenchLayout({
		widthMatches: false,
	}),
	false,
);

console.log("✅ CAMERA_FRAMES side panel tests passed!");
