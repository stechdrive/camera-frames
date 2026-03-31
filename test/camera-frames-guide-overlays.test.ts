import assert from "node:assert/strict";
import { createGuideOverlay } from "../src/engine/guide-overlays.js";

const guideOverlay = createGuideOverlay();
const before = guideOverlay.captureState();

guideOverlay.setViewportOrthographicGridState({
	visible: true,
	plane: "xy",
});

assert.deepEqual(guideOverlay.captureState(), before);

guideOverlay.setViewportOrthographicGridState({
	visible: true,
	plane: "zy",
});

assert.deepEqual(guideOverlay.captureState(), before);

guideOverlay.setViewportOrthographicGridState({
	visible: false,
	plane: null,
});

assert.deepEqual(guideOverlay.captureState(), before);

guideOverlay.dispose();

console.log("✅ CAMERA_FRAMES guide overlay tests passed!");
