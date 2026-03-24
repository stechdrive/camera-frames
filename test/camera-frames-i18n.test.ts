import assert from "node:assert/strict";
import { getAnchorLabel, getAnchorOptions, translate } from "../src/i18n.js";

assert.equal(translate("ja", "mode.viewport"), "ビューポート");
assert.equal(translate("en", "section.outputFrame"), "Output Frame");
assert.equal(translate("ja", "clipMode.auto"), "自動");
assert.equal(translate("en", "field.shotCameraClipMode"), "Clip Range");
assert.equal(translate("ja", "field.activeShotCamera"), "Camera");
assert.equal(translate("en", "field.assetScale"), "World Scale");
assert.equal(translate("ja", "section.frames"), "FRAME");
assert.equal(translate("en", "action.newFrame"), "Add FRAME");
assert.equal(translate("en", "action.newShotCamera"), "Add Camera");
assert.match(translate("ja", "hint.shotCameraClip"), /Near.*Far/u);
assert.match(translate("en", "hint.shotCameraClip"), /per-Camera near clip/u);
assert.equal(
	translate("ja", "shotCamera.defaultName", { index: 3 }),
	"Camera 3",
);
assert.equal(translate("ja", "frame.defaultName", { index: "C" }), "FRAME C");
assert.equal(getAnchorLabel("ja", "center"), "中央");
assert.equal(getAnchorOptions("en")[0].label, "Top Left");
assert.equal(translate("en", "missing.key"), "missing.key");

console.log("✅ CAMERA_FRAMES i18n tests passed!");
