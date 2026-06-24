import {
	createReleaseRustEnv,
	getRepoRoot,
	removeTauriReleaseSidecars,
	runCommand,
} from "./release-rust-env.mjs";
import { join } from "node:path";

const repoRoot = getRepoRoot();
const tauriCli = join(
	repoRoot,
	"node_modules",
	"@tauri-apps",
	"cli",
	"tauri.js",
);
const args = [tauriCli, "build", ...process.argv.slice(2)];

runCommand(process.execPath, args, {
	cwd: repoRoot,
	env: createReleaseRustEnv({ repoRoot }),
});

removeTauriReleaseSidecars({ repoRoot });
