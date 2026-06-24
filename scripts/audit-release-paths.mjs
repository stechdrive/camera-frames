import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { getRepoRoot } from "./release-rust-env.mjs";

const repoRoot = getRepoRoot();
const maxReportedHitsPerFile = 12;
const tauriReleaseSidecars = new Set(["camera_frames.pdb", "camera-frames.d"]);

function escapeRegExp(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function pathVariants(path) {
	if (!path) {
		return [];
	}
	const resolved = resolve(path);
	return [...new Set([resolved, resolved.replace(/\\/g, "/")])];
}

function createPathPattern(id, path) {
	const variants = pathVariants(path).filter((variant) => variant.length > 3);
	if (variants.length === 0) {
		return null;
	}
	return {
		id,
		pattern: new RegExp(
			variants
				.map((variant) => escapeRegExp(variant))
				.sort((left, right) => right.length - left.length)
				.join("|"),
			"gi",
		),
	};
}

function createForbiddenPatterns() {
	const candidates = [
		createPathPattern("repo-root", repoRoot),
		createPathPattern("home-dir", homedir()),
		createPathPattern(
			"cargo-home",
			process.env.CARGO_HOME ?? join(homedir(), ".cargo"),
		),
		createPathPattern(
			"rustup-home",
			process.env.RUSTUP_HOME ?? join(homedir(), ".rustup"),
		),
		createPathPattern("temp-dir", process.env.TEMP),
		createPathPattern("tmp-dir", process.env.TMP),
		createPathPattern("os-temp-dir", tmpdir()),
		{
			id: "windows-user-profile",
			pattern:
				/[A-Za-z]:[\\/]+Users[\\/]+[^\\/\0\r\n"'<>]+(?:[\\/][^\0\r\n"'<>]*)?/gi,
		},
		{
			id: "file-url-local-path",
			pattern:
				/file:\/\/\/[A-Za-z]:\/(?:Users|GitHub|Documents|Desktop|Downloads)\//gi,
		},
	];

	return candidates.filter(Boolean);
}

function collectFiles(targetPath) {
	if (!existsSync(targetPath)) {
		return [];
	}
	const stats = statSync(targetPath);
	if (stats.isFile()) {
		return [targetPath];
	}
	if (!stats.isDirectory()) {
		return [];
	}
	return readdirSync(targetPath).flatMap((entry) =>
		collectFiles(join(targetPath, entry)),
	);
}

function extractAsciiStrings(buffer) {
	const chunks = [];
	let current = [];

	for (const byte of buffer) {
		if (byte >= 0x20 && byte <= 0x7e) {
			current.push(byte);
			continue;
		}
		if (current.length >= 4) {
			chunks.push(Buffer.from(current).toString("ascii"));
		}
		current = [];
	}
	if (current.length >= 4) {
		chunks.push(Buffer.from(current).toString("ascii"));
	}

	return chunks.join("\n");
}

function extractUtf16LeStrings(buffer) {
	const chunks = [];
	let current = [];

	for (let index = 0; index + 1 < buffer.length; index += 2) {
		const codePoint = buffer[index] | (buffer[index + 1] << 8);
		if (codePoint >= 0x20 && codePoint <= 0x7e) {
			current.push(codePoint);
			continue;
		}
		if (current.length >= 4) {
			chunks.push(String.fromCharCode(...current));
		}
		current = [];
	}
	if (current.length >= 4) {
		chunks.push(String.fromCharCode(...current));
	}

	return chunks.join("\n");
}

function scanFile(filePath, forbiddenPatterns) {
	const buffer = readFileSync(filePath);
	const text = `${extractAsciiStrings(buffer)}\n${extractUtf16LeStrings(buffer)}`;
	const hits = [];

	for (const { id, pattern } of forbiddenPatterns) {
		pattern.lastIndex = 0;
		for (const match of text.matchAll(pattern)) {
			const value = match[0].slice(0, 260);
			hits.push({ id, value });
		}
	}

	if (filePath.endsWith(".map")) {
		hits.push({
			id: "source-map-file",
			value: "source map files must not be present in release artifacts",
		});
	}
	if (tauriReleaseSidecars.has(basename(filePath).toLowerCase())) {
		hits.push({
			id: "tauri-release-sidecar",
			value: "Tauri release debug sidecars must not be distributed",
		});
	}

	const unique = new Map();
	for (const hit of hits) {
		unique.set(`${hit.id}\0${hit.value}`, hit);
	}

	return [...unique.values()];
}

function getTauriReleaseFiles() {
	const releaseDir = resolve(repoRoot, "src-tauri", "target", "release");
	return [
		join(releaseDir, "camera-frames.exe"),
		...Array.from(tauriReleaseSidecars, (filename) =>
			join(releaseDir, filename),
		),
	];
}

function parseArgs(argv) {
	const files = [];
	const targets = [];
	let explicitTarget = false;

	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		switch (arg) {
			case "--file": {
				const next = argv[index + 1];
				if (!next) {
					throw new Error("--file requires a path");
				}
				files.push(resolve(next));
				index += 1;
				explicitTarget = true;
				break;
			}
			case "--dist":
				targets.push(resolve(repoRoot, "dist"));
				explicitTarget = true;
				break;
			case "--tauri-exe":
				files.push(...getTauriReleaseFiles());
				explicitTarget = true;
				break;
			case "--rad-wasm-source":
				files.push(
					resolve(
						repoRoot,
						"src",
						"engine",
						"rad-encoder-wasm",
						"pkg",
						"camera_frames_rad_encoder_bg.wasm",
					),
				);
				explicitTarget = true;
				break;
			default:
				throw new Error(`Unknown argument: ${arg}`);
		}
	}

	if (!explicitTarget) {
		targets.push(resolve(repoRoot, "dist"));
		files.push(
			...getTauriReleaseFiles(),
			resolve(
				repoRoot,
				"src",
				"engine",
				"rad-encoder-wasm",
				"pkg",
				"camera_frames_rad_encoder_bg.wasm",
			),
		);
	}

	return [...targets.flatMap(collectFiles), ...files.filter(existsSync)];
}

export function auditReleasePaths(argv = process.argv.slice(2)) {
	const files = [...new Set(parseArgs(argv))];
	if (files.length === 0) {
		throw new Error("No release artifacts found to audit");
	}

	const forbiddenPatterns = createForbiddenPatterns();
	const failures = [];

	for (const file of files) {
		const hits = scanFile(file, forbiddenPatterns);
		if (hits.length > 0) {
			failures.push({ file, hits });
		}
	}

	if (failures.length === 0) {
		console.log(`Release path audit passed (${files.length} files scanned).`);
		return 0;
	}

	console.error(`Release path audit failed (${failures.length} files).`);
	for (const failure of failures) {
		console.error(failure.file);
		for (const hit of failure.hits.slice(0, maxReportedHitsPerFile)) {
			console.error(`  [${hit.id}] ${hit.value}`);
		}
		if (failure.hits.length > maxReportedHitsPerFile) {
			console.error(
				`  ... ${failure.hits.length - maxReportedHitsPerFile} more hits`,
			);
		}
	}
	return 1;
}

if (
	process.argv[1] &&
	resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
	try {
		process.exitCode = auditReleasePaths();
	} catch (error) {
		console.error(error instanceof Error ? error.message : String(error));
		process.exitCode = 1;
	}
}
