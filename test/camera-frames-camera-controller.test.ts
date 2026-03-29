import assert from "node:assert/strict";
import {
	getShotCameraExportBaseNameForDocument,
	resolveShotCameraExportNameTemplate,
	sanitizeExportName,
} from "../src/controllers/camera-controller.js";

assert.equal(sanitizeExportName(" Camera 1 "), "Camera-1");
assert.equal(
	resolveShotCameraExportNameTemplate("cut-%cam", "Shot A"),
	"cut-Shot A",
);
assert.equal(
	getShotCameraExportBaseNameForDocument(
		{
			name: "Close Up",
			exportSettings: {
				exportName: "%cam-final",
			},
		},
		1,
	),
	"Close-Up-final",
);
assert.equal(
	getShotCameraExportBaseNameForDocument(
		{
			name: "Close Up",
			exportSettings: {
				exportName: "",
			},
		},
		1,
	),
	"Close-Up",
);
assert.equal(
	getShotCameraExportBaseNameForDocument(
		{
			name: "Close Up",
			exportSettings: {
				exportName: "cf-%cam",
			},
		},
		1,
	),
	"cf-Close-Up",
);

console.log("✅ CAMERA_FRAMES camera controller tests passed!");
