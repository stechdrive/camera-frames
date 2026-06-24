import { join } from "node:path";

import { getRepoRoot, runCommand } from "./release-rust-env.mjs";

const repoRoot = getRepoRoot();
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

function requireReleaseToken() {
	if (process.env.GITHUB_TOKEN || process.env.GH_TOKEN) {
		return;
	}
	throw new Error(
		"GITHUB_TOKEN or GH_TOKEN is required before publishing gh-pages with the portable release asset.",
	);
}

function npmRun(script, args = []) {
	runCommand(npmCommand, ["run", script, ...args], { cwd: repoRoot });
}

function runNodeScript(filename) {
	runCommand(process.execPath, [join(repoRoot, "scripts", filename)], {
		cwd: repoRoot,
	});
}

function main() {
	requireReleaseToken();

	npmRun("build:rad-encoder");
	npmRun("desktop:build:exe");

	// Tauri builds dist in desktop mode, so restore the GitHub Pages build before publishing.
	npmRun("build");
	npmRun("release:audit-paths", [
		"--",
		"--dist",
		"--rad-wasm-source",
		"--tauri-exe",
	]);

	runNodeScript("publish-pages.mjs");
	runNodeScript("publish-portable-release.mjs");
}

try {
	main();
} catch (error) {
	console.error(error instanceof Error ? error.message : String(error));
	process.exitCode = 1;
}
