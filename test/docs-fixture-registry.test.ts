import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
	FIXTURES,
	getFixture,
	listFixtureIds,
	listFixtures,
} from "../src/docs/fixtures/index.js";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = join(dirname(__filename), "..");

const KNOWN_FIXTURE_TYPES = new Set([
	"icon",
	"panel",
	"overlay",
	"viewport",
	"composite",
	"reference",
]);

// -- Shape validation --------------------------------------------------------

const allFixtures = listFixtures();
assert.ok(allFixtures.length > 0, "registry must contain at least one fixture");

for (const fixture of allFixtures) {
	assert.equal(
		typeof fixture.id,
		"string",
		"fixture.id must be a string",
	);
	assert.ok(
		fixture.id.length > 0,
		"fixture.id must be non-empty",
	);
	assert.ok(
		KNOWN_FIXTURE_TYPES.has(fixture.type),
		`fixture ${fixture.id}: type "${fixture.type}" must be one of ${[...KNOWN_FIXTURE_TYPES].join(", ")}`,
	);
	assert.equal(
		typeof fixture.title,
		"string",
		`fixture ${fixture.id}: title must be a string`,
	);
	assert.ok(
		fixture.title.length > 0,
		`fixture ${fixture.id}: title must be non-empty`,
	);
	assert.equal(
		typeof fixture.mount,
		"function",
		`fixture ${fixture.id}: mount must be a function`,
	);
}

// -- Registry integrity ------------------------------------------------------

for (const [key, fixture] of Object.entries(FIXTURES)) {
	assert.equal(
		key,
		fixture.id,
		`FIXTURES key "${key}" must match fixture.id "${fixture.id}"`,
	);
}

const ids = allFixtures.map((fixture) => fixture.id);
assert.equal(
	new Set(ids).size,
	ids.length,
	"fixture ids must be unique across the registry",
);

// -- API sanity --------------------------------------------------------------

assert.equal(getFixture(""), null, "getFixture('') returns null");
assert.equal(
	getFixture("definitelyNotARegisteredFixture"),
	null,
	"getFixture(unknown) returns null",
);
// biome-ignore lint/suspicious/noExplicitAny: test utility
assert.equal(getFixture(null as any), null, "getFixture(null) returns null");
// biome-ignore lint/suspicious/noExplicitAny: test utility
assert.equal(getFixture(42 as any), null, "getFixture(non-string) returns null");
assert.deepEqual(
	listFixtureIds().sort(),
	Object.keys(FIXTURES).sort(),
	"listFixtureIds() matches FIXTURES keys",
);
assert.equal(
	listFixtures().length,
	Object.keys(FIXTURES).length,
	"listFixtures() has same count as FIXTURES",
);

// -- Icon reference validity -------------------------------------------------
// Every {{icon:<name>}} referenced from chapter Markdown must exist as
// src/ui/svg/<name>.svg. This catches typos and icon renames at test time.

const svgDir = join(repoRoot, "src", "ui", "svg");
const iconFiles = readdirSync(svgDir).filter((file) => file.endsWith(".svg"));
const iconNames = new Set(iconFiles.map((file) => file.slice(0, -4)));
assert.ok(iconNames.size > 0, "src/ui/svg/ must contain at least one icon");

// Match {{icon:<name>}} only when not inside a backtick code span. Chapters
// like index.md document the syntax itself with `{{icon:...}}`, which must
// not be validated against the real icon set.
const iconRefRegex = /(?<!`)\{\{icon:([^}]+)\}\}/g;
const referencedIcons = new Set<string>();

function collectIconRefsFromLang(lang: string) {
	const chaptersDir = join(repoRoot, "docs", "help", lang);
	let chapterFiles: string[];
	try {
		chapterFiles = readdirSync(chaptersDir).filter((file) => file.endsWith(".md"));
	} catch {
		return;
	}
	for (const file of chapterFiles) {
		const content = readFileSync(join(chaptersDir, file), "utf8");
		iconRefRegex.lastIndex = 0;
		let match: RegExpExecArray | null;
		// biome-ignore lint/suspicious/noAssignInExpressions: canonical regex.exec loop
		while ((match = iconRefRegex.exec(content)) !== null) {
			referencedIcons.add(match[1].trim());
		}
	}
}

collectIconRefsFromLang("ja");

for (const name of referencedIcons) {
	assert.ok(
		iconNames.has(name),
		`{{icon:${name}}} referenced in chapter Markdown is missing from src/ui/svg/`,
	);
}

console.log(
	`✅ CAMERA_FRAMES docs fixture registry tests passed! (${allFixtures.length} fixtures, ${iconNames.size} icons, ${referencedIcons.size} referenced from chapters)`,
);
