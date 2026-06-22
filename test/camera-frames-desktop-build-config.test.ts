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
const viteConfig = readText("vite.config.js");
const gitignore = readText(".gitignore");

function assertPackageScripts() {
	assert.equal(
		packageJson.scripts["desktop:build:web"],
		"vite build --mode desktop",
	);
	assert.equal(
		packageJson.scripts["desktop:build:exe"],
		"tauri build --no-bundle",
	);
	assert.equal(
		packageJson.scripts["pages:publish"],
		"npm run build && node scripts/publish-pages.mjs",
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

assertPackageScripts();
assertTauriConfig();
assertCargoMetadata();
assertViteBaseMode();
assertGeneratedFilesAreIgnored();

console.log("CAMERA_FRAMES desktop build config tests passed.");
