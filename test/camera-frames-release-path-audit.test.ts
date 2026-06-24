import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const auditScript = join(repoRoot, "scripts", "audit-release-paths.mjs");
const tempDir = mkdtempSync(join(tmpdir(), "camera-frames-path-audit-"));

try {
	const safeFile = join(tempDir, "safe.bin");
	const sidecarFile = join(tempDir, "camera_frames.pdb");
	const unsafeFile = join(tempDir, "unsafe.bin");

	writeFileSync(safeFile, "compiled from /camera-frames and /cargo");
	writeFileSync(
		unsafeFile,
		"compiled from C:\\Users\\alice\\.cargo\\registry\\src\\crate\\lib.rs",
	);

	const safeResult = spawnSync(
		process.execPath,
		[auditScript, "--file", safeFile],
		{ cwd: repoRoot, encoding: "utf8" },
	);
	assert.equal(safeResult.status, 0, safeResult.stderr);

	const unsafeResult = spawnSync(
		process.execPath,
		[auditScript, "--file", unsafeFile],
		{ cwd: repoRoot, encoding: "utf8" },
	);
	assert.notEqual(unsafeResult.status, 0);
	assert.match(unsafeResult.stderr, /windows-user-profile/);
	assert.match(unsafeResult.stderr, /C:\\Users\\alice/);

	writeFileSync(sidecarFile, "debug information");
	const sidecarResult = spawnSync(
		process.execPath,
		[auditScript, "--file", sidecarFile],
		{ cwd: repoRoot, encoding: "utf8" },
	);
	assert.notEqual(sidecarResult.status, 0);
	assert.match(sidecarResult.stderr, /tauri-release-sidecar/);
} finally {
	rmSync(tempDir, { recursive: true, force: true });
}

console.log("CAMERA_FRAMES release path audit tests passed.");
