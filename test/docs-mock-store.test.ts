import assert from "node:assert/strict";
import { createMockStore } from "../src/docs/mock/store.js";
import { createCameraFramesStore } from "../src/store.js";

// Shape parity — mock wraps the real factory, so top-level keys must match.
const realStore = createCameraFramesStore(null);
const baseline = createMockStore();
assert.deepEqual(
	Object.keys(baseline).sort(),
	Object.keys(realStore).sort(),
	"mock store top-level keys should match real store",
);

// Baseline mock has usable signals and namespaces.
assert.ok("value" in baseline.locale, "locale is a signal");
assert.equal(baseline.remoteUrl.value, "");
assert.equal(baseline.helpOpen === undefined, true);
assert.ok(baseline.help, "help namespace exists");
assert.ok("value" in baseline.help.open, "help.open is a signal");
assert.equal(baseline.help.open.value, false);

// Flat signal override.
const storeA = createMockStore({ remoteUrl: "https://example.com" });
assert.equal(storeA.remoteUrl.value, "https://example.com");

// Nested signal override (help.open + help.lang together).
const storeB = createMockStore({ help: { open: true, lang: "en" } });
assert.equal(storeB.help.open.value, true);
assert.equal(storeB.help.lang.value, "en");
// Untouched sibling keeps default.
assert.equal(storeB.help.sectionId.value, "getting-started");

// Unknown top-level path throws.
assert.throws(
	() => createMockStore({ definitelyNotAKey: 1 }),
	/unknown path "definitelyNotAKey"/,
);

// Unknown nested path throws with full dotted path in message.
assert.throws(
	() => createMockStore({ help: { definitelyNotAKey: 1 } }),
	/unknown path "help\.definitelyNotAKey"/,
);

// Computed signal override is rejected (workbenchCollapsed is a computed).
assert.throws(
	() => createMockStore({ workbenchCollapsed: true }),
	/cannot assign to "workbenchCollapsed"/,
);

// Each call returns an independent store instance.
const s1 = createMockStore({ remoteUrl: "a" });
const s2 = createMockStore({ remoteUrl: "b" });
assert.equal(s1.remoteUrl.value, "a");
assert.equal(s2.remoteUrl.value, "b");
assert.notStrictEqual(s1, s2);
assert.notStrictEqual(s1.remoteUrl, s2.remoteUrl);

console.log("✅ CAMERA_FRAMES docs mock store tests passed!");
