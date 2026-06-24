import { spawnSync } from "node:child_process";
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const distDir = path.join(repoRoot, "dist");
const worktreeDir = path.join(repoRoot, ".local", "gh-pages-publish");
const pagesBranch = "gh-pages";
const remotePagesRef = `refs/remotes/origin/${pagesBranch}`;
const remotePagesHeadRef = `refs/heads/${pagesBranch}`;
const publishBranch = `gh-pages-publish-${Date.now()}-${process.pid}`;

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
		run("git", ["fetch", "origin", `+${pagesBranch}:${remotePagesRef}`]);
		const remoteHead = capture("git", ["rev-parse", remotePagesRef]);
		const remoteTree = capture("git", [
			"rev-parse",
			`${remotePagesRef}^{tree}`,
		]);

		run("git", [
			"worktree",
			"add",
			"--force",
			"--detach",
			worktreeDir,
			remotePagesRef,
		]);
		run("git", ["-C", worktreeDir, "switch", "--orphan", publishBranch]);
		await resetWorktreeRoot();
		await copyDistContents();
		await writeFile(path.join(worktreeDir, ".nojekyll"), "");

		const indexHtml = await readFile(
			path.join(worktreeDir, "index.html"),
			"utf8",
		);
		await writeFile(path.join(worktreeDir, "404.html"), indexHtml);

		run("git", ["-C", worktreeDir, "add", "-A"]);
		const nextTree = capture("git", ["-C", worktreeDir, "write-tree"]);

		if (nextTree === remoteTree) {
			console.log("gh-pages is already up to date.");
			return;
		}

		run("git", [
			"-C",
			worktreeDir,
			"commit",
			"-m",
			`deploy: publish ${headSha}`,
		]);
		run("git", [
			"-C",
			worktreeDir,
			"push",
			`--force-with-lease=${remotePagesHeadRef}:${remoteHead}`,
			"origin",
			`${publishBranch}:${pagesBranch}`,
		]);
	} finally {
		const worktreeList = spawnSync("git", ["worktree", "list", "--porcelain"], {
			cwd: repoRoot,
			encoding: "utf8",
			shell: false,
		});
		if (
			worktreeList.status === 0 &&
			worktreeList.stdout.includes(worktreeDir)
		) {
			run("git", ["worktree", "remove", "--force", worktreeDir]);
		} else {
			await rm(worktreeDir, { force: true, recursive: true });
		}
		spawnSync("git", ["branch", "-D", publishBranch], {
			cwd: repoRoot,
			stdio: "ignore",
			shell: false,
		});
	}
}

main().catch((error) => {
	console.error(error.message);
	process.exitCode = 1;
});
