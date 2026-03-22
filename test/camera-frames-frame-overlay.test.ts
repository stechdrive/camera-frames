import assert from "node:assert/strict";
import {
	getFrameOutlineSpec,
	isAxisAlignedRotation,
	snapAxisAlignedFrameRect,
} from "../src/engine/frame-overlay.js";

const baseFrame = {
	id: "frame-1",
	x: 0.5,
	y: 0.5,
	scale: 0.5,
	rotation: 0,
};

const zeroRotation = getFrameOutlineSpec(baseFrame, 400, 200, 400, 200);
assert.equal(zeroRotation.axisAligned, true);
assert.deepEqual(zeroRotation.snappedRect, {
	x: -184,
	y: -116,
	width: 768,
	height: 432,
});

const quarterTurn = getFrameOutlineSpec(
	{
		...baseFrame,
		rotation: 90,
	},
	400,
	200,
	400,
	200,
);
assert.equal(quarterTurn.axisAligned, true);
assert.deepEqual(quarterTurn.snappedRect, {
	x: -16,
	y: -284,
	width: 432,
	height: 768,
});

const diagonal = getFrameOutlineSpec(
	{
		...baseFrame,
		rotation: 45,
	},
	400,
	200,
	400,
	200,
);
assert.equal(diagonal.axisAligned, false);
assert.equal(diagonal.snappedRect, null);
assert.equal(isAxisAlignedRotation(Math.PI * 0.5), true);
assert.equal(isAxisAlignedRotation(Math.PI * 0.25), false);
assert.deepEqual(snapAxisAlignedFrameRect(10, 20, 3, 5), {
	x: 9,
	y: 18,
	width: 3,
	height: 5,
});

const shifted = getFrameOutlineSpec(baseFrame, 400, 200, 400, 200, 30, 40);
assert.equal(shifted.centerX, 230);
assert.equal(shifted.centerY, 140);

console.log("✅ CAMERA_FRAMES frame overlay tests passed!");
