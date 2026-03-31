import assert from "node:assert/strict";
import {
	PROJECT_VERSION,
	normalizeProjectDocument,
	sanitizeProjectAssetLabel,
} from "../src/project-document.js";

assert.equal(
	sanitizeProjectAssetLabel("  Layout\tModel\nA  ", "Asset 1"),
	"Layout Model A",
);
assert.equal(sanitizeProjectAssetLabel("", "Asset 1"), "Asset 1");

const normalized = normalizeProjectDocument({
	workspace: {
		viewport: {
			projectionMode: "orthographic",
			orthographic: {
				viewId: "negY",
				size: 14,
				distance: 28,
				focus: {
					x: 3,
					y: 4,
					z: 5,
				},
			},
		},
	},
	scene: {
		assets: [
			{
				id: "asset-model",
				kind: "model",
				label: "  Hero\tModel\n",
			},
		],
	},
});

assert.equal(normalized.version, PROJECT_VERSION);
assert.equal(normalized.scene.assets[0].label, "Hero Model");
assert.equal(normalized.workspace.viewport.projectionMode, "orthographic");
assert.deepEqual(normalized.workspace.viewport.orthographic, {
	viewId: "negY",
	size: 14,
	distance: 28,
	focus: {
		x: 3,
		y: 4,
		z: 5,
	},
});

console.log("✅ CAMERA_FRAMES project document tests passed!");
