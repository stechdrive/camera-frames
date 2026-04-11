import assert from "node:assert/strict";
import { computeDropHintStyle } from "../src/ui/drop-hint-layout.js";

{
	const style = computeDropHintStyle({
		viewportRect: {
			left: 0,
			top: 0,
			width: 1200,
			height: 800,
		},
		renderBoxRect: {
			left: 150,
			top: 120,
			width: 900,
			height: 500,
		},
	});
	assert.deepEqual(style, {
		left: "600px",
		top: "370px",
		bottom: "auto",
		transform: "translate(-50%, -50%)",
	});
}

{
	const style = computeDropHintStyle({
		viewportRect: {
			left: 0,
			top: 0,
			width: 1280,
			height: 720,
		},
		renderBoxRect: null,
	});
	assert.deepEqual(style, {
		left: "640px",
		top: "360px",
		bottom: "auto",
		transform: "translate(-50%, -50%)",
	});
}

{
	const style = computeDropHintStyle({
		viewportRect: {
			left: 12,
			top: 24,
			width: 1000,
			height: 600,
		},
		renderBoxRect: {
			left: 0,
			top: 0,
			width: 0,
			height: 0,
		},
	});
	assert.deepEqual(style, {
		left: "512px",
		top: "324px",
		bottom: "auto",
		transform: "translate(-50%, -50%)",
	});
}

console.log("✅ CAMERA_FRAMES viewport shell tests passed!");
