import assert from "node:assert/strict";

import { computeWorkbenchLayoutState } from "../src/controllers/output-frame-controller.js";

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

{
	const layout = computeWorkbenchLayoutState({
		viewportWidth: 1600,
		viewportHeight: 900,
		shellRect: { right: 1600 },
		rightRect: { left: 1240 },
		workbenchCollapsed: false,
	});
	assert.equal(layout.stackedLayout, false);
	assert.equal(layout.safeWidth, 1224);
	assert.equal(layout.safeHeight, 900);
}

{
	const layout = computeWorkbenchLayoutState({
		viewportWidth: 1600,
		viewportHeight: 900,
		shellRect: { right: 1600 },
		rightRect: null,
		workbenchCollapsed: false,
	});
	assert.equal(layout.stackedLayout, false);
	assert.equal(layout.safeWidth, 1600);
}

{
	const layout = computeWorkbenchLayoutState({
		viewportWidth: 1600,
		viewportHeight: 900,
		shellRect: { right: 1600 },
		rightRect: { left: 1240 },
		workbenchCollapsed: true,
	});
	assert.equal(layout.safeWidth, 1600);
}

{
	const layout = computeWorkbenchLayoutState({
		viewportWidth: 900,
		viewportHeight: 700,
		shellRect: { right: 900 },
		rightRect: { left: 540 },
		workbenchCollapsed: false,
	});
	assert.equal(layout.stackedLayout, true);
	assert.equal(layout.safeWidth, 900);
}

console.log("✅ CAMERA_FRAMES output frame controller tests passed!");
