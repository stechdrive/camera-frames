import { join } from "node:path";

import {
	createReleaseRustEnv,
	getRepoRoot,
	runCommand,
} from "./release-rust-env.mjs";

const repoRoot = getRepoRoot();

runCommand(
	"wasm-pack",
	[
		"build",
		"src/engine/rad-encoder-wasm-rs",
		"--target",
		"web",
		"--out-dir",
		"../rad-encoder-wasm/pkg",
		"--release",
	],
	{
		cwd: repoRoot,
		env: createReleaseRustEnv({ repoRoot }),
	},
);

console.log(
	`RAD encoder wasm built at ${join(
		"src",
		"engine",
		"rad-encoder-wasm",
		"pkg",
	)}`,
);
