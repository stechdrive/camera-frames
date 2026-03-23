import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const packageJson = JSON.parse(
	readFileSync(new URL("./package.json", import.meta.url), "utf8"),
);
const repoRoot = fileURLToPath(new URL(".", import.meta.url));

function captureGitValue(args, fallback) {
	const result = spawnSync("git", args, {
		cwd: repoRoot,
		encoding: "utf8",
		shell: false,
	});

	if (result.status !== 0) {
		return fallback;
	}

	return result.stdout.trim() || fallback;
}

function createVersionAssetPlugin(buildInfo) {
	const source = `${JSON.stringify(buildInfo, null, 2)}\n`;

	return {
		name: "camera-frames-version-asset",
		configureServer(server) {
			server.middlewares.use("/version.json", (request, response, next) => {
				const requestPath = request.url?.split("?")[0] ?? "";
				if (requestPath !== "/version.json") {
					next();
					return;
				}

				response.setHeader("Content-Type", "application/json; charset=utf-8");
				response.end(source);
			});
		},
		generateBundle() {
			this.emitFile({
				type: "asset",
				fileName: "version.json",
				source,
			});
		},
	};
}

export default defineConfig(({ command }) => {
	const buildInfo = {
		name: packageJson.name,
		version: packageJson.version,
		commit: captureGitValue(["rev-parse", "--short", "HEAD"], "unknown"),
		branch: captureGitValue(["branch", "--show-current"], "unknown"),
		builtAt: new Date().toISOString(),
	};

	return {
		base: command === "build" ? "/camera-frames/" : "/",
		define: {
			__APP_NAME__: JSON.stringify(buildInfo.name),
			__APP_VERSION__: JSON.stringify(buildInfo.version),
			__APP_BUILD_SHA__: JSON.stringify(buildInfo.commit),
			__APP_BUILD_BRANCH__: JSON.stringify(buildInfo.branch),
			__APP_BUILD_TIMESTAMP__: JSON.stringify(buildInfo.builtAt),
		},
		plugins: [createVersionAssetPlugin(buildInfo)],
		server: {
			host: true,
			port: 3000,
		},
	};
});
