import assert from "node:assert/strict";
import {
	estimateVideoBitrate,
	getVideoFrameTiming,
	normalizeVideoFps,
	resolveWebmVideoCodec,
	shouldEncodeKeyFrame,
} from "../src/controllers/export/video/encoding-config.js";

assert.equal(normalizeVideoFps(0), 24);
assert.equal(normalizeVideoFps(""), 24);
assert.equal(normalizeVideoFps(12), 12);

assert.equal(estimateVideoBitrate(1920, 1080, 24), 5_971_968);
assert.equal(estimateVideoBitrate(1, 1, 24), 1_000_000);

assert.deepEqual(getVideoFrameTiming(12, 24), {
	timestampSeconds: 0.5,
	durationSeconds: 1 / 24,
});

assert.equal(shouldEncodeKeyFrame(0, 24), true);
assert.equal(shouldEncodeKeyFrame(47, 24), false);
assert.equal(shouldEncodeKeyFrame(48, 24), true);

{
	const calls: Array<[string, Record<string, unknown>]> = [];
	const selected = await resolveWebmVideoCodec({
		width: 64,
		height: 36,
		fps: 24,
		canEncodeVideo: async (codec, options) => {
			calls.push([codec, options]);
			return codec === "vp8";
		},
	});

	assert.equal(selected?.codec, "vp8");
	assert.equal(calls.length, 2);
	assert.equal(calls[0][0], "vp9");
	assert.equal(calls[1][0], "vp8");
}

{
	const selected = await resolveWebmVideoCodec({
		width: 64,
		height: 36,
		fps: 24,
		canEncodeVideo: async () => false,
	});

	assert.equal(selected, null);
}

console.log("✅ CAMERA_FRAMES video encoding config tests passed!");
