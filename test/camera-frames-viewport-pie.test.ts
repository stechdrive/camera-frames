import assert from "node:assert/strict";
import { buildViewportPieActions } from "../src/engine/viewport-pie.js";
import { translate } from "../src/i18n.js";

const t = (key, params) => translate("en", key, params);

const cameraActions = buildViewportPieActions({ mode: "camera", t });
const cameraActionIds = cameraActions.map((action) => action.id);

assert.deepEqual(cameraActionIds, [
	"tool-select",
	"tool-reference",
	"tool-transform",
	"tool-pivot",
	"adjust-lens",
	"frame-create",
	"toggle-view-mode",
	"clear-selection",
]);

assert.equal(
	cameraActions.find((action) => action.id === "tool-reference")?.icon,
	"reference-tool",
);
assert.equal(
	cameraActions.find((action) => action.id === "frame-create")?.icon,
	"frame-plus",
);
assert.equal(
	cameraActions.find((action) => action.id === "clear-selection")?.icon,
	"selection-clear",
);
assert.equal(
	cameraActions.find((action) => action.id === "toggle-view-mode")?.icon,
	"viewport",
);

const viewportActions = buildViewportPieActions({ mode: "viewport", t });
assert.equal(
	viewportActions.find((action) => action.id === "toggle-view-mode")?.icon,
	"camera",
);

console.log("✅ CAMERA_FRAMES viewport pie tests passed!");
