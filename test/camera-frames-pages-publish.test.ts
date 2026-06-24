import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const publishPagesScript = readFileSync(
	join(repoRoot, "scripts/publish-pages.mjs"),
	"utf8",
);

assert.match(
	publishPagesScript,
	/"switch",\s*"--orphan",\s*publishBranch/s,
	"gh-pages publish must create a parentless snapshot commit",
);
assert.match(
	publishPagesScript,
	/`\+\$\{pagesBranch\}:\$\{remotePagesRef\}`/,
	"gh-pages publish must fetch rewritten remote history before comparing trees",
);
assert.match(
	publishPagesScript,
	/"write-tree"/,
	"gh-pages publish must compare the new snapshot tree before pushing",
);
assert.match(
	publishPagesScript,
	/nextTree === remoteTree/,
	"gh-pages publish must skip pushes when the published tree is unchanged",
);
assert.match(
	publishPagesScript,
	/`--force-with-lease=\$\{remotePagesHeadRef\}:\$\{remoteHead\}`/,
	"gh-pages publish must protect remote updates while replacing history",
);
assert.match(
	publishPagesScript,
	/`\$\{publishBranch\}:\$\{pagesBranch\}`/,
	"gh-pages publish must push the snapshot branch to gh-pages",
);
assert.doesNotMatch(
	publishPagesScript,
	/"push",\s*"origin",\s*"gh-pages"/,
	"gh-pages publish must not append normal commits to the existing branch",
);

console.log("CAMERA_FRAMES pages publish tests passed.");
