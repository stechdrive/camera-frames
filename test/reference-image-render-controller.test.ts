import assert from "node:assert/strict";
import { getReferenceImagePreviewRenderBoxMetrics } from "../src/controllers/reference-image-render-controller.js";

{
	const metrics = getReferenceImagePreviewRenderBoxMetrics({
		renderBoxRect: {
			left: 100,
			top: 50,
		},
		viewportShellRect: {
			left: 20,
			top: 10,
		},
		clientWidth: 800,
		clientHeight: 600,
		clientLeft: 2,
		clientTop: 2,
	});

	assert.deepEqual(metrics, {
		width: 800,
		height: 600,
		left: 82,
		top: 42,
	});
}

console.log("✅ reference image render controller tests passed!");
