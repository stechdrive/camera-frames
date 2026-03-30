import assert from "node:assert/strict";
import { buildViewportPieActions } from "../src/engine/viewport-pie.js";
import { translate } from "../src/i18n.js";

const t = (key, params) => translate("en", key, params);

const cameraActions = buildViewportPieActions({
	mode: "camera",
	t,
	referencePreviewSessionVisible: true,
	hasReferenceImages: true,
	frameMaskMode: "off",
	hasRememberedFrameMaskSelection: false,
});
const cameraActionIds = cameraActions.map((action) => action.id);

assert.deepEqual(cameraActionIds, [
	"tool-select",
	"tool-reference",
	"toggle-reference-preview",
	"tool-transform",
	"tool-pivot",
	"adjust-lens",
	"frame-create",
	"frame-mask-all",
	"frame-mask-selected",
	"toggle-view-mode",
	"clear-selection",
]);

assert.equal(
	cameraActions.find((action) => action.id === "tool-reference")?.icon,
	"reference-tool",
);
assert.equal(
	cameraActions.find((action) => action.id === "toggle-reference-preview")
		?.icon,
	"eye",
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
	cameraActions.find((action) => action.id === "frame-mask-all")?.icon,
	"mask-all",
);
assert.equal(
	cameraActions.find((action) => action.id === "frame-mask-selected")?.disabled,
	true,
);
assert.equal(
	cameraActions.find((action) => action.id === "toggle-view-mode")?.icon,
	"viewport",
);

const viewportActions = buildViewportPieActions({
	mode: "viewport",
	t,
	referencePreviewSessionVisible: false,
	hasReferenceImages: false,
	frameMaskMode: "all",
	hasRememberedFrameMaskSelection: true,
});
assert.equal(
	viewportActions.find((action) => action.id === "toggle-view-mode")?.icon,
	"camera",
);
assert.equal(
	viewportActions.find((action) => action.id === "frame-mask-all")?.disabled,
	true,
);
assert.equal(
	viewportActions.find((action) => action.id === "toggle-reference-preview")
		?.disabled,
	true,
);
assert.equal(
	buildViewportPieActions({
		mode: "camera",
		t,
		referencePreviewSessionVisible: true,
		hasReferenceImages: true,
		frameMaskMode: "selected",
		hasRememberedFrameMaskSelection: true,
	}).find((action) => action.id === "frame-mask-selected")?.active,
	true,
);

console.log("✅ CAMERA_FRAMES viewport pie tests passed!");
