import assert from "node:assert/strict";
import {
	normalizeProjectDocument,
	sanitizeProjectAssetLabel,
} from "../src/project-document.js";

assert.equal(
	sanitizeProjectAssetLabel("  Layout\tModel\nA  ", "Asset 1"),
	"Layout Model A",
);
assert.equal(sanitizeProjectAssetLabel("", "Asset 1"), "Asset 1");

const normalized = normalizeProjectDocument({
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

assert.equal(normalized.scene.assets[0].label, "Hero Model");

console.log("✅ CAMERA_FRAMES project document tests passed!");
