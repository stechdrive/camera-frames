import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));

function readText(path: string) {
	return readFileSync(join(repoRoot, path), "utf8");
}

function readJson(path: string) {
	return JSON.parse(readText(path));
}

const packageJson = readJson("package.json");
const tauriConfig = readJson("src-tauri/tauri.conf.json");
const cargoToml = readText("src-tauri/Cargo.toml");
const tauriMainRs = readText("src-tauri/src/main.rs");
const viteConfig = readText("vite.config.js");
const gitignore = readText(".gitignore");
const deployPagesAndPortableScript = readText(
	"scripts/deploy-pages-and-portable.mjs",
);

function assertPackageScripts() {
	assert.equal(
		packageJson.scripts["desktop:build:web"],
		"vite build --mode desktop",
	);
	assert.equal(
		packageJson.scripts["desktop:build:exe"],
		"node scripts/build-tauri.mjs --no-bundle",
	);
	assert.equal(
		packageJson.scripts["desktop:build"],
		"node scripts/build-tauri.mjs",
	);
	assert.equal(
		packageJson.scripts["build:rad-encoder"],
		"node scripts/build-rad-encoder.mjs",
	);
	assert.equal(
		packageJson.scripts["release:audit-paths"],
		"node scripts/audit-release-paths.mjs",
	);
	assert.equal(packageJson.scripts.deploy, "npm run pages:publish");
	assert.equal(
		packageJson.scripts["pages:publish"],
		"node scripts/deploy-pages-and-portable.mjs",
	);
	assert.equal(
		packageJson.scripts["pages:publish:web"],
		"npm run build && node scripts/publish-pages.mjs",
	);
	assert.equal(
		packageJson.scripts["portable:build"],
		"npm run desktop:build:exe && npm run release:audit-paths -- --tauri-exe --rad-wasm-source",
	);
	assert.equal(
		packageJson.scripts["portable:publish"],
		"npm run portable:build && node scripts/publish-portable-release.mjs",
	);
}

function assertTauriConfig() {
	assert.equal(tauriConfig.productName, "CAMERA_FRAMES");
	assert.equal(tauriConfig.version, packageJson.version);
	assert.equal(
		tauriConfig.build.beforeBuildCommand,
		"npm run desktop:build:web",
	);
	assert.equal(tauriConfig.build.frontendDist, "../dist");
	assert.equal(tauriConfig.build.devUrl, "http://localhost:3000");
	assert.equal(tauriConfig.bundle.windows.webviewInstallMode.type, "skip");
}

function assertCargoMetadata() {
	const cargoVersion = /^version = "([^"]+)"$/m.exec(cargoToml)?.[1];
	const cargoName = /^name = "([^"]+)"$/m.exec(cargoToml)?.[1];
	assert.equal(cargoName, "camera-frames");
	assert.equal(cargoVersion, packageJson.version);
}

function assertWindowsReleaseExeDoesNotOpenConsole() {
	assert.match(
		tauriMainRs,
		/#!\[cfg_attr\(not\(debug_assertions\), windows_subsystem = "windows"\)\]/,
	);
}

function assertViteBaseMode() {
	assert.match(
		viteConfig,
		/mode === "desktop" \? "\.\/" : "\/camera-frames\/"/,
		"desktop builds must use relative Vite base while web builds keep the GitHub Pages base",
	);
}

function assertGeneratedFilesAreIgnored() {
	assert.match(gitignore, /^src-tauri\/target\/$/m);
	assert.match(gitignore, /^src-tauri\/gen\/$/m);
	assert.match(gitignore, /^src-tauri\/icons\/\*$/m);
	assert.match(gitignore, /^!src-tauri\/icons\/$/m);
	assert.match(gitignore, /^!src-tauri\/icons\/icon\.ico$/m);
}

function assertPagesPublishCanSpawnNpmOnWindows() {
	assert.match(deployPagesAndPortableScript, /const npmCommand = "npm";/);
	assert.match(
		deployPagesAndPortableScript,
		/const useNpmShell = process\.platform === "win32";/,
	);
	assert.match(deployPagesAndPortableScript, /shell: useNpmShell/);
}

assertPackageScripts();
assertTauriConfig();
assertCargoMetadata();
assertWindowsReleaseExeDoesNotOpenConsole();
assertViteBaseMode();
assertGeneratedFilesAreIgnored();
assertPagesPublishCanSpawnNpmOnWindows();

console.log("CAMERA_FRAMES desktop build config tests passed.");
