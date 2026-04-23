import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = join(dirname(__filename), "..");

const source = readFileSync(
	join(repoRoot, "src", "ui", "workbench-icons.js"),
	"utf8",
);

assert.ok(
	source.includes('import.meta.glob("./svg/*.svg",'),
	"WorkbenchIcon must keep the SVG import.meta.glob call so Vite replaces it with the eager sprite map.",
);

assert.doesNotMatch(
	source,
	/typeof\s+import\.meta\.glob/u,
	"Do not guard the workbench icon glob with typeof import.meta.glob. Vite rewrites the glob call but leaves the runtime guard false in the browser, which empties the icon sprite.",
);

console.log("✅ CAMERA_FRAMES workbench icon sprite tests passed!");
