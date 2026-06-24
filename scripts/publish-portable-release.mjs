import { spawnSync } from "node:child_process";
import { readFile, stat } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { getRepoRoot } from "./release-rust-env.mjs";

export const DEFAULT_PORTABLE_RELEASE_TAG = "portable-latest";
export const DEFAULT_PORTABLE_RELEASE_NAME = "Latest Windows Portable EXE";
export const DEFAULT_PORTABLE_RELEASE_ASSET_NAME = "camera-frames-portable.exe";

const githubApiVersion = "2022-11-28";

function capture(command, args, options = {}) {
	const result = spawnSync(command, args, {
		cwd: options.cwd ?? getRepoRoot(),
		encoding: "utf8",
		stdio: ["ignore", "pipe", "pipe"],
		shell: false,
	});

	if (result.status !== 0) {
		throw new Error(result.stderr.trim() || `Command failed: ${command}`);
	}

	return result.stdout.trim();
}

function stripGitSuffix(value) {
	return value.replace(/\.git$/i, "");
}

function normalizeRepo(owner, repo) {
	if (!owner || !repo) {
		return null;
	}
	return `${owner}/${stripGitSuffix(repo)}`;
}

export function parseGitHubRepository(value) {
	if (!value) {
		return null;
	}

	const trimmed = value.trim();
	const shorthand = /^([^/\s:]+)\/([^/\s:]+)$/.exec(trimmed);
	if (shorthand) {
		return normalizeRepo(shorthand[1], shorthand[2]);
	}

	const scpLike = /^git@github\.com:([^/]+)\/(.+)$/i.exec(trimmed);
	if (scpLike) {
		return normalizeRepo(scpLike[1], scpLike[2]);
	}

	if (/^https?:\/\//i.test(trimmed) || /^ssh:\/\//i.test(trimmed)) {
		const url = new URL(trimmed);
		if (url.hostname.toLowerCase() !== "github.com") {
			return null;
		}
		const parts = url.pathname.replace(/^\/+/, "").split("/");
		return normalizeRepo(parts[0], parts.slice(1).join("/"));
	}

	return null;
}

export function createPortableReleaseBody(version) {
	return `${version}\n`;
}

function getDefaultAssetPath(repoRoot) {
	return join(repoRoot, "src-tauri", "target", "release", "camera-frames.exe");
}

function getGitHubToken() {
	return process.env.GITHUB_TOKEN || process.env.GH_TOKEN || null;
}

function getGitHubRepository(repoRoot, explicitRepo) {
	const repo =
		parseGitHubRepository(explicitRepo) ??
		parseGitHubRepository(process.env.GITHUB_REPOSITORY);
	if (repo) {
		return repo;
	}

	return parseGitHubRepository(
		capture("git", ["remote", "get-url", "origin"], { cwd: repoRoot }),
	);
}

function splitRepo(repo) {
	const [owner, repoName] = repo.split("/");
	if (!owner || !repoName) {
		throw new Error(`Invalid GitHub repository: ${repo}`);
	}
	return { owner, repoName };
}

function apiBaseFor(repo) {
	const { owner, repoName } = splitRepo(repo);
	return `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(
		repoName,
	)}`;
}

function createHeaders(token, headers = {}) {
	return {
		Accept: "application/vnd.github+json",
		Authorization: `Bearer ${token}`,
		"X-GitHub-Api-Version": githubApiVersion,
		...headers,
	};
}

async function readErrorMessage(response) {
	const text = await response.text();
	if (!text) {
		return response.statusText;
	}
	try {
		return JSON.parse(text).message ?? text;
	} catch {
		return text;
	}
}

async function githubRequest(url, { token, allow404 = false, ...options }) {
	const response = await fetch(url, {
		...options,
		headers: createHeaders(token, options.headers),
	});

	if (allow404 && response.status === 404) {
		return null;
	}
	if (!response.ok) {
		const message = await readErrorMessage(response);
		throw new Error(`GitHub API ${response.status}: ${message}`);
	}
	if (response.status === 204) {
		return null;
	}

	const text = await response.text();
	return text ? JSON.parse(text) : null;
}

async function upsertMovingTag({ apiBase, tag, targetSha, token }) {
	const ref = await githubRequest(`${apiBase}/git/ref/tags/${tag}`, {
		token,
		allow404: true,
	});

	if (ref) {
		await githubRequest(`${apiBase}/git/refs/tags/${tag}`, {
			token,
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ sha: targetSha, force: true }),
		});
		return;
	}

	await githubRequest(`${apiBase}/git/refs`, {
		token,
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ ref: `refs/tags/${tag}`, sha: targetSha }),
	});
}

async function getReleaseByTag({ apiBase, tag, token }) {
	return githubRequest(`${apiBase}/releases/tags/${tag}`, {
		token,
		allow404: true,
	});
}

async function upsertRelease({ apiBase, tag, name, body, targetSha, token }) {
	const existing = await getReleaseByTag({ apiBase, tag, token });
	const payload = {
		tag_name: tag,
		target_commitish: targetSha,
		name,
		body,
		draft: false,
		prerelease: false,
		make_latest: "true",
	};

	if (!existing) {
		return githubRequest(`${apiBase}/releases`, {
			token,
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});
	}

	return githubRequest(`${apiBase}/releases/${existing.id}`, {
		token,
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
}

async function listReleaseAssets({ apiBase, releaseId, token }) {
	const assets = [];
	for (let page = 1; ; page += 1) {
		const chunk = await githubRequest(
			`${apiBase}/releases/${releaseId}/assets?per_page=100&page=${page}`,
			{ token },
		);
		assets.push(...chunk);
		if (chunk.length < 100) {
			return assets;
		}
	}
}

async function replaceReleaseAsset({
	apiBase,
	release,
	assetPath,
	assetName,
	token,
}) {
	const assets = await listReleaseAssets({
		apiBase,
		releaseId: release.id,
		token,
	});
	for (const asset of assets.filter((asset) => asset.name === assetName)) {
		await githubRequest(`${apiBase}/releases/assets/${asset.id}`, {
			token,
			method: "DELETE",
		});
	}

	const bytes = await readFile(assetPath);
	const uploadUrl = release.upload_url.replace(/\{.*\}$/, "");
	return githubRequest(`${uploadUrl}?name=${encodeURIComponent(assetName)}`, {
		token,
		method: "POST",
		headers: {
			"Content-Type": "application/octet-stream",
			"Content-Length": String(bytes.byteLength),
		},
		body: bytes,
	});
}

function parseArgs(argv) {
	const options = {};
	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		switch (arg) {
			case "--repo":
				options.repo = argv[++index];
				break;
			case "--tag":
				options.tag = argv[++index];
				break;
			case "--release-name":
				options.releaseName = argv[++index];
				break;
			case "--asset-name":
				options.assetName = argv[++index];
				break;
			case "--asset-path":
				options.assetPath = argv[++index];
				break;
			case "--target":
				options.targetSha = argv[++index];
				break;
			case "--no-move-tag":
				options.moveTag = false;
				break;
			case "--dry-run":
				options.dryRun = true;
				break;
			default:
				throw new Error(`Unknown argument: ${arg}`);
		}
	}
	return options;
}

export async function publishPortableRelease(options = {}) {
	const repoRoot = options.repoRoot ?? getRepoRoot();
	const packageJson = JSON.parse(
		await readFile(join(repoRoot, "package.json"), "utf8"),
	);
	const version = packageJson.version;
	const tag =
		options.tag ??
		process.env.CAMERA_FRAMES_PORTABLE_RELEASE_TAG ??
		DEFAULT_PORTABLE_RELEASE_TAG;
	const releaseName =
		options.releaseName ??
		process.env.CAMERA_FRAMES_PORTABLE_RELEASE_NAME ??
		DEFAULT_PORTABLE_RELEASE_NAME;
	const assetName =
		options.assetName ??
		process.env.CAMERA_FRAMES_PORTABLE_ASSET_NAME ??
		DEFAULT_PORTABLE_RELEASE_ASSET_NAME;
	const assetPath = resolve(options.assetPath ?? getDefaultAssetPath(repoRoot));
	const repo = getGitHubRepository(repoRoot, options.repo);
	const targetSha =
		options.targetSha ??
		capture("git", ["rev-parse", "HEAD"], { cwd: repoRoot });
	const body = createPortableReleaseBody(version);
	const moveTag = options.moveTag ?? true;

	if (!repo) {
		throw new Error(
			"GitHub repository could not be resolved from origin remote.",
		);
	}

	const assetStats = await stat(assetPath);
	if (!assetStats.isFile()) {
		throw new Error(`Portable EXE was not found: ${assetPath}`);
	}

	if (options.dryRun) {
		console.log(
			`Would publish ${basename(assetPath)} (${assetStats.size} bytes) to ${repo} ${tag} as ${assetName}.`,
		);
		return null;
	}

	const token = options.token ?? getGitHubToken();
	if (!token) {
		throw new Error(
			"GITHUB_TOKEN or GH_TOKEN is required to publish the portable release asset.",
		);
	}

	const apiBase = apiBaseFor(repo);
	if (moveTag) {
		await upsertMovingTag({ apiBase, tag, targetSha, token });
	}
	const release = await upsertRelease({
		apiBase,
		tag,
		name: releaseName,
		body,
		targetSha,
		token,
	});
	const asset = await replaceReleaseAsset({
		apiBase,
		release,
		assetPath,
		assetName,
		token,
	});

	const downloadUrl = `https://github.com/${repo}/releases/latest/download/${assetName}`;
	console.log(
		`Published portable release asset: ${asset.browser_download_url}`,
	);
	console.log(`Latest download URL: ${downloadUrl}`);
	return asset;
}

if (
	process.argv[1] &&
	resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
	publishPortableRelease(parseArgs(process.argv.slice(2))).catch((error) => {
		console.error(error instanceof Error ? error.message : String(error));
		process.exitCode = 1;
	});
}
