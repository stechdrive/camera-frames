import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const distDir = path.join(repoRoot, "dist");
const worktreeDir = path.join(repoRoot, ".local", "gh-pages-publish");

function run(command, args, options = {}) {
	const result = spawnSync(command, args, {
		cwd: repoRoot,
		stdio: "inherit",
		shell: false,
		...options,
	});

	if (result.status !== 0) {
		throw new Error(`Command failed: ${command} ${args.join(" ")}`);
	}
}

function capture(command, args, options = {}) {
	const result = spawnSync(command, args, {
		cwd: repoRoot,
		stdio: ["ignore", "pipe", "pipe"],
		encoding: "utf8",
		shell: false,
		...options,
	});

	if (result.status !== 0) {
		throw new Error(result.stderr.trim() || `Command failed: ${command}`);
	}

	return result.stdout.trim();
}

async function resetWorktreeRoot() {
	const entries = await readdir(worktreeDir, { withFileTypes: true });
	await Promise.all(
		entries
			.filter((entry) => entry.name !== ".git")
			.map((entry) =>
				rm(path.join(worktreeDir, entry.name), {
					force: true,
					recursive: true,
				}),
			),
	);
}

async function copyDistContents() {
	const entries = await readdir(distDir, { withFileTypes: true });
	await Promise.all(
		entries.map((entry) =>
			cp(path.join(distDir, entry.name), path.join(worktreeDir, entry.name), {
				force: true,
				recursive: true,
			}),
		),
	);
}

async function main() {
	await mkdir(path.dirname(worktreeDir), { recursive: true });
	await rm(worktreeDir, { force: true, recursive: true });

	const headSha = capture("git", ["rev-parse", "--short", "HEAD"]);

	try {
		run("git", ["worktree", "add", "--force", worktreeDir, "gh-pages"]);
		await resetWorktreeRoot();
		await copyDistContents();
		await writeFile(path.join(worktreeDir, ".nojekyll"), "");

		const indexHtml = await readFile(path.join(worktreeDir, "index.html"), "utf8");
		await writeFile(path.join(worktreeDir, "404.html"), indexHtml);

		run("git", ["-C", worktreeDir, "add", "-A"]);

		const diffResult = spawnSync(
			"git",
			["-C", worktreeDir, "diff", "--cached", "--quiet"],
			{ cwd: repoRoot, shell: false },
		);
		if (diffResult.status === 0) {
			console.log("gh-pages is already up to date.");
			return;
		}
		if (diffResult.status !== 1) {
			throw new Error("Failed to inspect gh-pages diff state.");
		}

		run("git", [
			"-C",
			worktreeDir,
			"commit",
			"-m",
			`deploy: publish ${headSha}`,
		]);
		run("git", ["-C", worktreeDir, "push", "origin", "gh-pages"]);
	} finally {
		const worktreeList = spawnSync(
			"git",
			["worktree", "list", "--porcelain"],
			{ cwd: repoRoot, encoding: "utf8", shell: false },
		);
		if (worktreeList.status === 0 && worktreeList.stdout.includes(worktreeDir)) {
			run("git", ["worktree", "remove", "--force", worktreeDir]);
		} else {
			await rm(worktreeDir, { force: true, recursive: true });
		}
	}
}

main().catch((error) => {
	console.error(error.message);
	process.exitCode = 1;
});
