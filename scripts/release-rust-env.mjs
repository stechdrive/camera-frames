import { spawnSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function getRepoRoot() {
	return resolve(dirname(fileURLToPath(import.meta.url)), "..");
}

function getRustcCommitHash(env) {
	const result = spawnSync("rustc", ["-Vv"], {
		encoding: "utf8",
		env,
	});
	if (result.status !== 0) {
		return null;
	}
	return /^commit-hash:\s*([0-9a-f]+)$/m.exec(result.stdout)?.[1] ?? null;
}

function pathVariants(path) {
	if (!path) {
		return [];
	}
	const resolved = path.startsWith("/") ? path : resolve(path);
	const variants = new Set([resolved, resolved.replace(/\\/g, "/")]);
	return [...variants].filter(Boolean);
}

function appendRemap(remaps, fromPath, toPath) {
	for (const variant of pathVariants(fromPath)) {
		remaps.push({ from: variant, to: toPath });
	}
}

function createRemapFlags(env, repoRoot) {
	const remaps = [];
	const homeDir = homedir();

	appendRemap(remaps, join(homeDir, ".cargo"), "/cargo");
	appendRemap(remaps, env.CARGO_HOME, "/cargo");
	appendRemap(remaps, join(homeDir, ".rustup"), "/rustup");
	appendRemap(remaps, env.RUSTUP_HOME, "/rustup");
	appendRemap(remaps, repoRoot, "/camera-frames");
	appendRemap(remaps, homeDir, "/home");
	appendRemap(remaps, tmpdir(), "/tmp");
	appendRemap(remaps, env.TEMP, "/tmp");
	appendRemap(remaps, env.TMP, "/tmp");

	const rustcCommitHash = getRustcCommitHash(env);
	if (rustcCommitHash) {
		appendRemap(remaps, `/rustc/${rustcCommitHash}`, "/rustc");
	}

	const unique = new Map();
	for (const remap of remaps) {
		unique.set(remap.from.toLowerCase(), remap);
	}

	return [...unique.values()]
		.sort((left, right) => left.from.length - right.from.length)
		.map((remap) => `--remap-path-prefix=${remap.from}=${remap.to}`);
}

export function createReleaseRustEnv({ repoRoot = getRepoRoot() } = {}) {
	const env = { ...process.env };
	const flags = createRemapFlags(env, repoRoot);

	env.RUSTFLAGS = [env.RUSTFLAGS, ...flags].filter(Boolean).join(" ");
	return env;
}

export function runCommand(command, args, options = {}) {
	const result = spawnSync(command, args, {
		cwd: options.cwd ?? getRepoRoot(),
		env: options.env ?? process.env,
		stdio: "inherit",
	});

	if (result.error) {
		throw result.error;
	}
	if (result.status !== 0) {
		process.exit(result.status ?? 1);
	}
}

export function removeTauriReleaseSidecars({ repoRoot = getRepoRoot() } = {}) {
	const releaseDir = join(repoRoot, "src-tauri", "target", "release");
	for (const filename of ["camera_frames.pdb", "camera-frames.d"]) {
		const targetPath = join(releaseDir, filename);
		if (existsSync(targetPath)) {
			rmSync(targetPath, { force: true });
		}
	}
}
