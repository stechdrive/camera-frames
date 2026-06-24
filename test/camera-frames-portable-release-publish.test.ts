import assert from "node:assert/strict";

import {
	DEFAULT_PORTABLE_RELEASE_ASSET_NAME,
	DEFAULT_PORTABLE_RELEASE_NAME,
	DEFAULT_PORTABLE_RELEASE_TAG,
	createPortableReleaseBody,
	parseGitHubRepository,
} from "../scripts/publish-portable-release.mjs";

assert.equal(DEFAULT_PORTABLE_RELEASE_TAG, "portable-latest");
assert.equal(DEFAULT_PORTABLE_RELEASE_NAME, "Latest Windows Portable EXE");
assert.equal(DEFAULT_PORTABLE_RELEASE_ASSET_NAME, "camera-frames-portable.exe");
assert.equal(createPortableReleaseBody("1.5.0"), "1.5.0\n");

assert.equal(
	parseGitHubRepository("https://github.com/stechdrive/camera-frames.git"),
	"stechdrive/camera-frames",
);
assert.equal(
	parseGitHubRepository("git@github.com:stechdrive/camera-frames.git"),
	"stechdrive/camera-frames",
);
assert.equal(
	parseGitHubRepository("ssh://git@github.com/stechdrive/camera-frames.git"),
	"stechdrive/camera-frames",
);
assert.equal(
	parseGitHubRepository("stechdrive/camera-frames"),
	"stechdrive/camera-frames",
);
assert.equal(parseGitHubRepository("https://example.com/owner/repo.git"), null);

console.log("CAMERA_FRAMES portable release publish tests passed.");
