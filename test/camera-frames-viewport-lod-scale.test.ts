import assert from "node:assert/strict";
import {
	VIEWPORT_LOD_SCALE_DEFAULT,
	VIEWPORT_LOD_SCALE_MAX,
	VIEWPORT_LOD_SCALE_MIN,
	VIEWPORT_LOD_SCALE_STEP,
	VIEWPORT_LOD_SCALE_STORAGE_KEY,
} from "../src/constants.js";
import {
	buildViewportLodExportReadinessPolicy,
	clampViewportLodScale,
	formatViewportLodScaleLabel,
	readPersistedViewportLodUserScale,
	resolveEffectiveViewportLodScale,
	resolveExportViewportLodScale,
	writePersistedViewportLodUserScale,
} from "../src/ui/viewport-lod-scale.js";

assert.equal(VIEWPORT_LOD_SCALE_MIN, 0.6);
assert.equal(VIEWPORT_LOD_SCALE_MAX, 1.2);
assert.equal(VIEWPORT_LOD_SCALE_STEP, 0.01);
assert.equal(VIEWPORT_LOD_SCALE_DEFAULT, 1.1);
assert.equal(VIEWPORT_LOD_SCALE_STORAGE_KEY, "camera-frames.viewportLodScale");

assert.equal(clampViewportLodScale(1), 1.0);
assert.equal(clampViewportLodScale(0.1), VIEWPORT_LOD_SCALE_MIN);
assert.equal(clampViewportLodScale(5), VIEWPORT_LOD_SCALE_MAX);
assert.equal(clampViewportLodScale(Number.NaN), VIEWPORT_LOD_SCALE_DEFAULT);
assert.equal(clampViewportLodScale("0.876"), 0.88);

assert.equal(formatViewportLodScaleLabel(1), "1.00");
assert.equal(formatViewportLodScaleLabel(1.2), "1.20");
assert.equal(formatViewportLodScaleLabel(0.6), "0.60");
assert.equal(formatViewportLodScaleLabel(Number.NaN), "1.10");

assert.equal(resolveEffectiveViewportLodScale({ userScale: null }), 1.1);
assert.equal(resolveEffectiveViewportLodScale({ userScale: undefined }), 1.1);
assert.equal(resolveEffectiveViewportLodScale({ userScale: 0.7 }), 0.7);
assert.equal(resolveEffectiveViewportLodScale({ userScale: 9 }), 1.2);

assert.equal(resolveExportViewportLodScale(0.7), 1.1);
assert.equal(resolveExportViewportLodScale(1.0), 1.1);
assert.equal(resolveExportViewportLodScale(1.1), 1.1);
assert.equal(resolveExportViewportLodScale(1.2), 1.2);

assert.deepEqual(buildViewportLodExportReadinessPolicy(0.7), {
	minWarmupPasses: 0,
	splatWarmupPasses: 2,
	maxWaitMs: 1500,
});
assert.deepEqual(buildViewportLodExportReadinessPolicy(1.1), {
	minWarmupPasses: 0,
	splatWarmupPasses: 2,
	maxWaitMs: 1500,
});
assert.deepEqual(buildViewportLodExportReadinessPolicy(1.2), {
	minWarmupPasses: 0,
	splatWarmupPasses: 3,
	maxWaitMs: 1636,
});

{
	const memory = new Map();
	const storage = {
		getItem: (key) => (memory.has(key) ? memory.get(key) : null),
		setItem: (key, value) => {
			memory.set(key, value);
		},
		removeItem: (key) => {
			memory.delete(key);
		},
	};

	assert.equal(readPersistedViewportLodUserScale({ storage }), null);
	writePersistedViewportLodUserScale(0.74, { storage });
	assert.equal(readPersistedViewportLodUserScale({ storage }), 0.74);

	writePersistedViewportLodUserScale(5, { storage });
	assert.equal(
		readPersistedViewportLodUserScale({ storage }),
		VIEWPORT_LOD_SCALE_MAX,
	);

	writePersistedViewportLodUserScale(null, { storage });
	assert.equal(memory.size, 0);
	assert.equal(readPersistedViewportLodUserScale({ storage }), null);

	memory.set(VIEWPORT_LOD_SCALE_STORAGE_KEY, "not-json");
	assert.equal(readPersistedViewportLodUserScale({ storage }), null);

	memory.set(VIEWPORT_LOD_SCALE_STORAGE_KEY, JSON.stringify({ foo: 1 }));
	assert.equal(readPersistedViewportLodUserScale({ storage }), null);
}

console.log("✅ CAMERA_FRAMES viewport LoD scale tests passed!");
