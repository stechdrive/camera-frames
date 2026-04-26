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
import { parseMarkdownDocument } from "../src/ui/help/markdown-parser.js";

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
	assert.equal(typeof fixture.id, "string", "fixture.id must be a string");
	assert.ok(fixture.id.length > 0, "fixture.id must be non-empty");
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
assert.equal(
	getFixture(null as unknown as string),
	null,
	"getFixture(null) returns null",
);
assert.equal(
	getFixture(42 as unknown as string),
	null,
	"getFixture(non-string) returns null",
);
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
const variableRefRegex = /(?<!`)\{\{([A-Za-z][\w]*)\}\}/g;
const knownInlineVariables = new Set(["appVersion"]);
const referencedVariables = new Set<string>();

function collectIconRefsFromLang(lang: string) {
	const chaptersDir = join(repoRoot, "docs", "help", lang);
	let chapterFiles: string[];
	try {
		chapterFiles = readdirSync(chaptersDir).filter((file) =>
			file.endsWith(".md"),
		);
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
		variableRefRegex.lastIndex = 0;
		// biome-ignore lint/suspicious/noAssignInExpressions: canonical regex.exec loop
		while ((match = variableRefRegex.exec(content)) !== null) {
			referencedVariables.add(match[1].trim());
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

for (const name of referencedVariables) {
	assert.ok(
		knownInlineVariables.has(name),
		`{{${name}}} referenced in chapter Markdown is not a known inline variable`,
	);
}

// -- Chapter frontmatter ↔ fixture id parity --------------------------------
// Every `screenshots[].id` declared in a chapter's frontmatter must correspond
// to a registered fixture. Browser-only fixtures (those that import vite-
// dependent modules) don't show up in FIXTURES at node-test time, so the full
// id set is recovered by statically scanning src/docs/fixtures/*.js for
// `id: "..."` literals.

const fixturesDir = join(repoRoot, "src", "docs", "fixtures");
const fixtureFileNames = readdirSync(fixturesDir).filter(
	(file) =>
		file.endsWith(".js") && !file.startsWith("index") && file !== "types.d.ts",
);
const fixtureIdLiteralPattern = /\bid:\s*"([^"]+)"/g;
const allFixtureIds = new Set<string>();
for (const file of fixtureFileNames) {
	const content = readFileSync(join(fixturesDir, file), "utf8");
	fixtureIdLiteralPattern.lastIndex = 0;
	let match: RegExpExecArray | null;
	// biome-ignore lint/suspicious/noAssignInExpressions: canonical regex.exec loop
	while ((match = fixtureIdLiteralPattern.exec(content)) !== null) {
		allFixtureIds.add(match[1]);
	}
}
assert.ok(
	allFixtureIds.size >= allFixtures.length,
	`static id scan (${allFixtureIds.size}) should cover at least the runtime-visible fixtures (${allFixtures.length})`,
);
for (const fixture of allFixtures) {
	assert.ok(
		allFixtureIds.has(fixture.id),
		`static id scan missed runtime-registered fixture "${fixture.id}"`,
	);
}

function collectChapterScreenshotIds(lang: string) {
	const chaptersDir = join(repoRoot, "docs", "help", lang);
	let chapterFiles: string[];
	try {
		chapterFiles = readdirSync(chaptersDir).filter((file) =>
			file.endsWith(".md"),
		);
	} catch {
		return new Map<string, string[]>();
	}
	const perChapter = new Map<string, string[]>();
	for (const file of chapterFiles) {
		const content = readFileSync(join(chaptersDir, file), "utf8");
		const { frontmatter } = parseMarkdownDocument(content);
		const screenshots = Array.isArray(frontmatter.screenshots)
			? frontmatter.screenshots
			: [];
		const ids = screenshots
			.map((entry: unknown) => {
				if (!entry || typeof entry !== "object") return null;
				const maybeId = (entry as { id?: unknown }).id;
				return typeof maybeId === "string" ? maybeId : null;
			})
			.filter((id): id is string => id !== null);
		if (ids.length > 0) perChapter.set(file, ids);
	}
	return perChapter;
}

const chapterIdsByFile = collectChapterScreenshotIds("ja");
let totalReferencedIds = 0;
for (const [file, ids] of chapterIdsByFile) {
	for (const id of ids) {
		totalReferencedIds++;
		assert.ok(
			allFixtureIds.has(id),
			`chapter ${file} declares screenshots[].id "${id}" but no fixture is registered with that id`,
		);
	}
}

console.log(
	`✅ CAMERA_FRAMES docs fixture registry tests passed! (${allFixtures.length} runtime fixtures, ${allFixtureIds.size} static, ${totalReferencedIds} chapter refs, ${iconNames.size} icons, ${referencedIcons.size} icons referenced, ${referencedVariables.size} variables referenced)`,
);
