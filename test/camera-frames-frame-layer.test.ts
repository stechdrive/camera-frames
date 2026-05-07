import assert from "node:assert/strict";
import { shouldShowFrameTrajectoryOverlay } from "../src/ui/frame-layer.js";

assert.equal(
	shouldShowFrameTrajectoryOverlay({
		frameMaskShape: "trajectory",
		trajectoryEditMode: false,
		frameSelectionActive: false,
	}),
	false,
);

assert.equal(
	shouldShowFrameTrajectoryOverlay({
		frameMaskShape: "trajectory",
		trajectoryEditMode: false,
		frameSelectionActive: true,
	}),
	true,
);

assert.equal(
	shouldShowFrameTrajectoryOverlay({
		frameMaskShape: "bounds",
		trajectoryEditMode: false,
		frameSelectionActive: true,
	}),
	false,
);

assert.equal(
	shouldShowFrameTrajectoryOverlay({
		frameMaskShape: "bounds",
		trajectoryEditMode: true,
		frameSelectionActive: true,
	}),
	true,
);

assert.equal(
	shouldShowFrameTrajectoryOverlay({
		frameMaskShape: "trajectory",
		trajectoryEditMode: true,
		frameSelectionActive: false,
	}),
	false,
);

console.log("✅ CAMERA_FRAMES frame layer tests passed!");
