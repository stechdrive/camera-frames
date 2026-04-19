import assert from "node:assert/strict";
import { createMockController } from "../src/docs/mock/controller.js";

// Default mock: any method returns undefined, invocations are recorded.
const controller = createMockController();
assert.equal(controller.setMode("camera"), undefined);
controller.closeHelp();
controller.handleAssetInputChange({ foo: 1 });
assert.deepEqual(controller.__calls, [
	{ method: "setMode", args: ["camera"] },
	{ method: "closeHelp", args: [] },
	{ method: "handleAssetInputChange", args: [{ foo: 1 }] },
]);

// typeof <method> is always "function" (UI does `if (typeof c.foo === "function") c.foo()`).
assert.equal(typeof controller.literallyAnyMethodName, "function");
// Optional-chain style call patterns still work.
assert.equal(controller?.someUnknown?.("x"), undefined);

// Method overrides produce custom return values.
const c2 = createMockController({
	methods: {
		getFrameCount: () => 3,
		// biome-ignore lint/suspicious/noExplicitAny: test utility
		echo: (x: any) => x * 2,
	},
});
assert.equal(c2.getFrameCount(), 3);
assert.equal(c2.echo(5), 10);
// Un-overridden methods still no-op.
assert.equal(c2.unknownMethod(), undefined);
// All invocations are recorded, overrides included.
assert.equal(c2.__calls.length, 3);
assert.deepEqual(c2.__calls[0], { method: "getFrameCount", args: [] });
assert.deepEqual(c2.__calls[1], { method: "echo", args: [5] });
assert.deepEqual(c2.__calls[2], { method: "unknownMethod", args: [] });
// __methods is the options map.
assert.equal(typeof c2.__methods, "object");
assert.ok(c2.__methods !== null);

// Each controller has an independent __calls log.
const a = createMockController();
const b = createMockController();
a.alpha();
b.beta();
assert.equal(a.__calls.length, 1);
assert.equal(a.__calls[0].method, "alpha");
assert.equal(b.__calls.length, 1);
assert.equal(b.__calls[0].method, "beta");

console.log("✅ CAMERA_FRAMES docs mock controller tests passed!");
