import assert from "node:assert/strict";
import {
	getBlockedStartupUrlReason,
	validateStartupUrls,
} from "../src/engine/import-link-policy.js";

assert.equal(
	getBlockedStartupUrlReason("https://cdn.box.com/shared/static/scene.ssproj"),
	null,
);
assert.equal(
	getBlockedStartupUrlReason("http://cdn.box.com/shared/static/scene.ssproj"),
	"https-only",
);
assert.equal(
	getBlockedStartupUrlReason("https://127.0.0.1:8080/scene.ssproj"),
	"private-host",
);
assert.equal(
	getBlockedStartupUrlReason("https://192.168.0.10/scene.ssproj"),
	"private-host",
);
assert.equal(
	getBlockedStartupUrlReason("https://[::1]/scene.ssproj"),
	"private-host",
);
assert.equal(getBlockedStartupUrlReason("not-a-url"), "invalid");

const validation = validateStartupUrls([
	"https://example.com/a.glb",
	"http://example.com/b.glb",
	"https://localhost/c.glb",
]);
assert.deepEqual(validation.allowed, ["https://example.com/a.glb"]);
assert.deepEqual(validation.blocked, [
	{ url: "http://example.com/b.glb", reason: "https-only" },
	{ url: "https://localhost/c.glb", reason: "private-host" },
]);

console.log("✅ CAMERA_FRAMES import link policy tests passed!");
