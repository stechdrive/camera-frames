import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
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

	function createPngPostHandler({ resolveTargetPath }) {
		return (request, response, next) => {
			const requestPath = request.url?.split("?")[0] ?? "";
			if (requestPath !== "/" && requestPath !== "") {
				next();
				return;
			}
			if (request.method !== "POST") {
				response.statusCode = 405;
				response.setHeader("Content-Type", "application/json");
				response.end(JSON.stringify({ ok: false, error: "POST only" }));
				return;
			}
			const url = new URL(request.url ?? "/", "http://localhost");
			const rawName = (url.searchParams.get("name") ?? "").trim();
			if (!/^[A-Za-z0-9_\-.]+$/.test(rawName) || rawName === "") {
				response.statusCode = 400;
				response.setHeader("Content-Type", "application/json");
				response.end(JSON.stringify({ ok: false, error: "Invalid name" }));
				return;
			}
			let targetPath;
			try {
				targetPath = resolveTargetPath(rawName, url);
			} catch (error) {
				response.statusCode = 400;
				response.setHeader("Content-Type", "application/json");
				response.end(
					JSON.stringify({ ok: false, error: error.message ?? String(error) }),
				);
				return;
			}
			const chunks = [];
			request.on("data", (chunk) => chunks.push(chunk));
			request.on("error", (error) => {
				response.statusCode = 500;
				response.setHeader("Content-Type", "application/json");
				response.end(
					JSON.stringify({ ok: false, error: error.message ?? String(error) }),
				);
			});
			request.on("end", () => {
				try {
					const body = Buffer.concat(chunks).toString("utf8");
					const parsed = JSON.parse(body);
					const dataUrl =
						typeof parsed.dataUrl === "string" ? parsed.dataUrl : "";
					const prefix = "data:image/png;base64,";
					if (!dataUrl.startsWith(prefix)) {
						throw new Error("dataUrl must be data:image/png;base64,...");
					}
					const base64 = dataUrl.slice(prefix.length);
					const buffer = Buffer.from(base64, "base64");
					mkdirSync(dirname(targetPath), { recursive: true });
					writeFileSync(targetPath, buffer);
					response.statusCode = 200;
					response.setHeader("Content-Type", "application/json");
					response.end(
						JSON.stringify({
							ok: true,
							bytes: buffer.length,
							path: relative(repoRoot, targetPath).replace(/\\/g, "/"),
						}),
					);
				} catch (error) {
					response.statusCode = 400;
					response.setHeader("Content-Type", "application/json");
					response.end(
						JSON.stringify({
							ok: false,
							error: error.message ?? String(error),
						}),
					);
				}
			});
		};
	}

	const screenshotServePlugin = {
		name: "camera-frames-screenshot-serve",
		configureServer(server) {
			server.middlewares.use(
				"/__screenshot",
				createPngPostHandler({
					resolveTargetPath: (rawName, url) => {
						const rawLang = (url.searchParams.get("lang") ?? "ja").trim();
						if (!/^[A-Za-z]{2,5}$/.test(rawLang)) {
							throw new Error("Invalid lang");
						}
						return join(
							repoRoot,
							"docs",
							"help",
							"assets",
							"screenshots",
							rawLang,
							`${rawName}.png`,
						);
					},
				}),
			);
			// Phase IV mock-scene backdrops — static PNGs captured from the
			// real app that fixtures load as placeholder splat canvases.
			server.middlewares.use(
				"/__backdrop",
				createPngPostHandler({
					resolveTargetPath: (rawName) =>
						join(
							repoRoot,
							"docs",
							"help",
							"assets",
							"fixture-backdrops",
							`${rawName}.png`,
						),
				}),
			);
		},
	};

	// Chapter Markdown references screenshots via `../assets/screenshots/…`
	// and fixtures reference backdrop PNGs via `…/fixture-backdrops/…`.
	// In dev vite serves them straight from the source tree, but they are
	// not hashed asset imports so nothing copies them into `dist/` at
	// build time. This plugin walks `docs/help/assets/` once during
	// `generateBundle` and emits each file as a build asset so the GitHub
	// Pages deploy ships them alongside index.html and the help modal's
	// `${BASE_URL}docs/help/assets/…` URLs resolve.
	function createHelpAssetsCopyPlugin() {
		const helpAssetsDir = resolve(repoRoot, "docs", "help", "assets");

		function collectFiles(dir) {
			const results = [];
			const entries = readdirSync(dir, { withFileTypes: true });
			for (const entry of entries) {
				const full = join(dir, entry.name);
				if (entry.isDirectory()) {
					for (const child of collectFiles(full)) results.push(child);
				} else if (entry.isFile()) {
					results.push(full);
				}
			}
			return results;
		}

		return {
			name: "camera-frames-help-assets-copy",
			apply: "build",
			generateBundle() {
				const files = collectFiles(helpAssetsDir);
				for (const full of files) {
					const rel = relative(helpAssetsDir, full).replace(/\\/g, "/");
					this.emitFile({
						type: "asset",
						fileName: `docs/help/assets/${rel}`,
						source: readFileSync(full),
					});
				}
			},
		};
	}

	const forceReloadPlugin = {
		name: "camera-frames-force-reload",
		handleHotUpdate(context) {
			const rel = relative(repoRoot, context.file).replace(/\\/g, "/");
			if (
				rel.startsWith("src/controllers/") ||
				rel.startsWith("src/engine/") ||
				rel === "src/controller.js" ||
				rel === "src/store.js"
			) {
				context.server.ws.send({ type: "full-reload" });
				return [];
			}
		},
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
			createHelpAssetsCopyPlugin(),
			screenshotServePlugin,
			forceReloadPlugin,
		],
		build: {
			rollupOptions: {
				input: {
					main: resolve(repoRoot, "index.html"),
					docs: resolve(repoRoot, "docs.html"),
				},
			},
		},
		optimizeDeps: {
			exclude: ["playcanvas", "@playcanvas/splat-transform"],
		},
		server: {
			host: true,
			port: 3000,
			strictPort: true,
		},
		worker: {
			format: "es",
		},
	};
});
