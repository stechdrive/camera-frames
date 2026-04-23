import assert from "node:assert/strict";
import { computed, signal } from "@preact/signals";
import { createViewportLodScaleRuntimeBinding } from "../src/app/viewport-lod-scale-runtime-binding.js";
import { resolveEffectiveViewportLodScale } from "../src/ui/viewport-lod-scale.js";

const userScale = signal(null);
const store = {
	viewportLod: {
		userScale,
		effectiveScale: computed(() =>
			resolveEffectiveViewportLodScale({ userScale: userScale.value }),
		),
	},
};
const spark = { lodSplatScale: 0 };
let locked = false;

const binding = createViewportLodScaleRuntimeBinding({
	store,
	spark,
	isExportRenderLocked: () => locked,
});

assert.equal(spark.lodSplatScale, 1.1);

userScale.value = 0.8;
assert.equal(spark.lodSplatScale, 0.8);

locked = true;
userScale.value = 1.2;
assert.equal(
	spark.lodSplatScale,
	0.8,
	"export lock must keep preview preference changes off Spark",
);

locked = false;
binding.apply();
assert.equal(spark.lodSplatScale, 1.2);

binding.dispose();
userScale.value = 0.7;
assert.equal(spark.lodSplatScale, 1.2);

console.log("✅ CAMERA_FRAMES viewport LoD runtime binding tests passed!");
