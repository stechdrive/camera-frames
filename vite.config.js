import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const packageJson = JSON.parse(
	readFileSync(new URL("./package.json", import.meta.url), "utf8"),
);
const repoRoot = fileURLToPath(new URL(".", import.meta.url));
const DEV_STAMP_VIRTUAL_ID = "virtual:camera-frames-dev-stamp";
const RESOLVED_DEV_STAMP_VIRTUAL_ID = `\0${DEV_STAMP_VIRTUAL_ID}`;

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

function shouldIncludeCodeStampFile(relativePath) {
	return (
		relativePath === "app.css" ||
		relativePath === "index.html" ||
		relativePath === "package.json" ||
		relativePath.startsWith("src/")
	);
}

function collectCodeStampFiles(rootDir, currentDir = rootDir, results = []) {
	for (const entry of readdirSync(currentDir, { withFileTypes: true })) {
		const fullPath = join(currentDir, entry.name);
		const relativePath = relative(rootDir, fullPath).replace(/\\/g, "/");

		if (
			relativePath.startsWith(".git/") ||
			relativePath.startsWith("dist/") ||
			relativePath.startsWith("node_modules/") ||
			relativePath.startsWith(".local/")
		) {
			continue;
		}

		if (entry.isDirectory()) {
			collectCodeStampFiles(rootDir, fullPath, results);
			continue;
		}

		if (entry.isFile() && shouldIncludeCodeStampFile(relativePath)) {
			results.push({
				fullPath,
				relativePath,
			});
		}
	}

	return results;
}

function createCodeStamp(rootDir) {
	const hash = createHash("sha1");
	const files = collectCodeStampFiles(rootDir).sort((left, right) =>
		left.relativePath.localeCompare(right.relativePath),
	);

	for (const file of files) {
		hash.update(file.relativePath);
		hash.update("\0");
		hash.update(readFileSync(file.fullPath));
		hash.update("\0");
	}

	return hash.digest("hex").slice(0, 8);
}

function createDevStampPlugin(rootDir) {
	let currentCodeStamp = createCodeStamp(rootDir);

	return {
		name: "camera-frames-dev-stamp",
		resolveId(id) {
			if (id === DEV_STAMP_VIRTUAL_ID) {
				return RESOLVED_DEV_STAMP_VIRTUAL_ID;
			}

			return null;
		},
		load(id) {
			if (id !== RESOLVED_DEV_STAMP_VIRTUAL_ID) {
				return null;
			}

			return `export const DEV_STAMP = ${JSON.stringify(currentCodeStamp)};`;
		},
		handleHotUpdate(context) {
			const relativePath = relative(rootDir, context.file).replace(/\\/g, "/");
			if (!shouldIncludeCodeStampFile(relativePath)) {
				return;
			}

			currentCodeStamp = createCodeStamp(rootDir);
			const module = context.server.moduleGraph.getModuleById(
				RESOLVED_DEV_STAMP_VIRTUAL_ID,
			);
			if (!module) {
				return;
			}

			context.server.moduleGraph.invalidateModule(module);
			return [module];
		},
	};
}

export default defineConfig(({ command }) => {
	const codeStamp = createCodeStamp(repoRoot);
	const buildInfo = {
		name: packageJson.name,
		version: packageJson.version,
		commit: captureGitValue(["rev-parse", "--short", "HEAD"], "unknown"),
		branch: captureGitValue(["branch", "--show-current"], "unknown"),
		codeStamp,
		builtAt: new Date().toISOString(),
	};

	return {
		base: command === "build" ? "/camera-frames/" : "/",
		define: {
			__APP_NAME__: JSON.stringify(buildInfo.name),
			__APP_VERSION__: JSON.stringify(buildInfo.version),
			__APP_BUILD_SHA__: JSON.stringify(buildInfo.commit),
			__APP_BUILD_BRANCH__: JSON.stringify(buildInfo.branch),
			__APP_CODE_STAMP__: JSON.stringify(buildInfo.codeStamp),
			__APP_BUILD_TIMESTAMP__: JSON.stringify(buildInfo.builtAt),
		},
		plugins: [
			createDevStampPlugin(repoRoot),
			createVersionAssetPlugin(buildInfo),
		],
		server: {
			host: true,
			port: 3000,
			strictPort: true,
		},
	};
});
