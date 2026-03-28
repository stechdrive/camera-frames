import assert from "node:assert/strict";

function getFrameOverlayCanvasOffset(metrics, renderBox) {
	return {
		left: -(metrics.boxLeft + Math.max(renderBox?.clientLeft ?? 0, 0)),
		top: -(metrics.boxTop + Math.max(renderBox?.clientTop ?? 0, 0)),
	};
}

{
	const metrics = { boxLeft: 120, boxTop: 80 };
	const renderBox = { clientLeft: 2, clientTop: 2 };
	assert.deepEqual(getFrameOverlayCanvasOffset(metrics, renderBox), {
		left: -122,
		top: -82,
	});
}

{
	const metrics = { boxLeft: 120, boxTop: 80 };
	const renderBox = { clientLeft: 0, clientTop: 0 };
	assert.deepEqual(getFrameOverlayCanvasOffset(metrics, renderBox), {
		left: -120,
		top: -80,
	});
}

console.log("✅ CAMERA_FRAMES output frame controller tests passed!");
