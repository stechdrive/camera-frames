import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, normalize, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(fileURLToPath(new URL("..", import.meta.url)));
const srcRoot = join(repoRoot, "src");
const sourceExtensions = [".js", ".ts"];
const importPattern =
	/(?:import\s+(?:[^'";]+?\s+from\s*)?|export\s+[^'";]+?\s+from\s*|import\s*\()\s*["']([^"']+)["']/g;

function toPosixPath(path) {
	return path.split(sep).join("/");
}

function listSourceFiles(dir) {
	const entries = readdirSync(dir, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...listSourceFiles(path));
			continue;
		}
		if (sourceExtensions.some((extension) => entry.name.endsWith(extension))) {
			files.push(toPosixPath(relative(repoRoot, path)));
		}
	}
	return files.sort();
}

const sourceFiles = listSourceFiles(srcRoot);
const sourceFileSet = new Set(sourceFiles);

function resolveRelativeImport(fromFile, specifier) {
	if (!specifier.startsWith(".")) {
		return null;
	}
	const fromDir = fromFile.split("/").slice(0, -1).join("/");
	const base = normalize(join(fromDir, specifier)).split(sep).join("/");
	const candidates = [
		base,
		`${base}.js`,
		`${base}.ts`,
		`${base}/index.js`,
		`${base}/index.ts`,
	];
	return candidates.find((candidate) => sourceFileSet.has(candidate)) ?? null;
}

function readImports(file) {
	const content = readFileSync(join(repoRoot, file), "utf8");
	const imports = [];
	importPattern.lastIndex = 0;
	let match = importPattern.exec(content);
	while (match) {
		const specifier = match[1];
		imports.push({
			specifier,
			resolved: resolveRelativeImport(file, specifier),
		});
		match = importPattern.exec(content);
	}
	return imports;
}

function buildRelativeImportGraph() {
	const graph = new Map();
	for (const file of sourceFiles) {
		graph.set(
			file,
			readImports(file)
				.map((entry) => entry.resolved)
				.filter(Boolean),
		);
	}
	return graph;
}

function findCircularComponents(graph) {
	let nextIndex = 0;
	const stack = [];
	const onStack = new Set();
	const indexes = new Map();
	const lowLinks = new Map();
	const circularComponents = [];

	function visit(file) {
		indexes.set(file, nextIndex);
		lowLinks.set(file, nextIndex);
		nextIndex += 1;
		stack.push(file);
		onStack.add(file);

		for (const dependency of graph.get(file) ?? []) {
			if (!indexes.has(dependency)) {
				visit(dependency);
				lowLinks.set(
					file,
					Math.min(lowLinks.get(file), lowLinks.get(dependency)),
				);
			} else if (onStack.has(dependency)) {
				lowLinks.set(
					file,
					Math.min(lowLinks.get(file), indexes.get(dependency)),
				);
			}
		}

		if (lowLinks.get(file) !== indexes.get(file)) {
			return;
		}
		const component = [];
		let current = null;
		do {
			current = stack.pop();
			onStack.delete(current);
			component.push(current);
		} while (current !== file);
		if (component.length > 1) {
			circularComponents.push(component.sort());
		}
	}

	for (const file of graph.keys()) {
		if (!indexes.has(file)) {
			visit(file);
		}
	}
	return circularComponents;
}

function findImportsMatching(predicate) {
	const matches = [];
	for (const file of sourceFiles) {
		for (const entry of readImports(file)) {
			if (predicate(file, entry)) {
				matches.push(`${file} -> ${entry.specifier}`);
			}
		}
	}
	return matches;
}

{
	const circularComponents = findCircularComponents(buildRelativeImportGraph());
	assert.deepEqual(
		circularComponents,
		[],
		`src relative imports must remain acyclic:\n${circularComponents
			.map((component) => component.join("\n  "))
			.join("\n\n")}`,
	);
}

{
	const allowedSparkImports = new Set([
		"src/engine/spark-integration/spark-symbols.js",
		"src/engine/rad-build.worker.js",
	]);
	const matches = findImportsMatching(
		(file, entry) =>
			entry.specifier === "@sparkjsdev/spark" && !allowedSparkImports.has(file),
	);
	assert.deepEqual(
		matches,
		[],
		`@sparkjsdev/spark direct imports must stay behind spark-symbols.js or the RAD worker:\n${matches.join("\n")}`,
	);
}

{
	const matches = findImportsMatching((file, entry) => {
		if (!file.startsWith("src/project/") || !entry.resolved) {
			return false;
		}
		return (
			entry.resolved.startsWith("src/ui/") ||
			entry.resolved.startsWith("src/controllers/")
		);
	});
	assert.deepEqual(
		matches,
		[],
		`src/project must not depend on UI or controllers:\n${matches.join("\n")}`,
	);
}

{
	const matches = findImportsMatching((file, entry) => {
		if (!file.startsWith("src/controllers/") || !entry.resolved) {
			return false;
		}
		return entry.resolved.startsWith("src/ui/");
	});
	assert.deepEqual(
		matches,
		[],
		`src/controllers must not depend on src/ui presentation modules:\n${matches.join("\n")}`,
	);
}

assert.equal(existsSync(srcRoot) && statSync(srcRoot).isDirectory(), true);
console.log("✅ CAMERA_FRAMES architecture boundary tests passed!");
