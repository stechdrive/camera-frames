import assert from "node:assert/strict";
import { tokenizeInline } from "../src/ui/help/markdown-parser.js";
import { resolveInlineVariable } from "../src/ui/help/markdown-renderer.js";

{
	const tokens = tokenizeInline("表示中のアプリ版: v{{appVersion}}");
	assert.deepEqual(tokens, [
		{ type: "text", content: "表示中のアプリ版: v" },
		{ type: "variable", name: "appVersion" },
	]);
}

assert.equal(
	resolveInlineVariable("appVersion", {
		variables: { appVersion: "1.2.3" },
	}),
	"1.2.3",
);
assert.equal(resolveInlineVariable("unknown", {}), "{{unknown}}");

console.log("✅ CAMERA_FRAMES help markdown tests passed!");
