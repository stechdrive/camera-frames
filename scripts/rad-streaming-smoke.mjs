#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import net from "node:net";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 5173;
const DEFAULT_TIMEOUT_MS = 90000;
const DEFAULT_CDP_COMMAND_TIMEOUT_MS = 120000;
const DEFAULT_FIXTURE = resolve(
	repoRoot,
	"test",
	"fixtures",
	"rad",
	"tiny-splats-lod.rad",
);

const args = parseArgs(process.argv.slice(2));
const host = String(args.host ?? process.env.CF_RAD_SMOKE_HOST ?? DEFAULT_HOST);
const port = Number(args.port ?? process.env.CF_RAD_SMOKE_PORT ?? DEFAULT_PORT);
const timeoutMs = Number(args["timeout-ms"] ?? DEFAULT_TIMEOUT_MS);
const cdpCommandTimeoutMs = Number(
	args["cdp-command-timeout-ms"] ?? DEFAULT_CDP_COMMAND_TIMEOUT_MS,
);
const frameCount = Number(args["frame-count"] ?? 120);
const headed = Boolean(args.headed);
const keepBrowser = Boolean(args["keep-browser"]);
const noDevServer = Boolean(args["no-dev-server"]);
const fixturePath = resolve(
	repoRoot,
	String(args.fixture ?? process.env.CF_RAD_SMOKE_FIXTURE ?? DEFAULT_FIXTURE),
);
const outDir = resolve(
	repoRoot,
	String(args["out-dir"] ?? join(".local", "rad-streaming-smoke")),
);

const baseUrl = `http://${host}:${port}`;
let devServer = null;
let browser = null;
let profileDir = null;
let cdp = null;
let isCleaningUp = false;

main().catch(async (error) => {
	console.error(`[rad-streaming-smoke] ${error?.stack ?? error}`);
	await cleanup().catch(() => {});
	process.exitCode = 1;
});

async function main() {
	mkdirSync(outDir, { recursive: true });
	if (!existsSync(fixturePath)) {
		throw new Error(`RAD fixture was not found: ${fixturePath}`);
	}
	if (!(await isHttpReady(baseUrl))) {
		if (noDevServer) {
			throw new Error(
				`${baseUrl} is not reachable and --no-dev-server was set`,
			);
		}
		devServer = startDevServer({ host, port });
		await waitForHttp(baseUrl, timeoutMs, "Vite dev server");
	}

	const browserPath = findBrowserExecutable(args.browser);
	const cdpPort = await findFreePort();
	profileDir = mkdtempSync(join(tmpdir(), "camera-frames-rad-smoke-"));
	browser = startBrowser({
		browserPath,
		cdpPort,
		profileDir,
		headed,
	});
	await waitForHttp(
		`http://127.0.0.1:${cdpPort}/json/version`,
		timeoutMs,
		"Chrome DevTools Protocol",
	);

	const target = await createCdpTarget(cdpPort, "about:blank");
	cdp = await CdpClient.connect(target.webSocketDebuggerUrl);
	const issues = [];
	collectPageIssues(cdp, issues);

	await cdp.send("Page.enable");
	await cdp.send("Runtime.enable");
	await cdp.send("Log.enable").catch(() => {});

	await navigate(cdp, `${baseUrl}/`);
	await waitForExpression(
		cdp,
		"document.readyState === 'interactive' || document.readyState === 'complete'",
		timeoutMs,
	);

	const radBase64 = readFileSync(fixturePath).toString("base64");
	issues.length = 0;
	const result = await evaluate(
		cdp,
		`(async () => {
			const smoke = await import(${JSON.stringify("/test/fixtures/rad/rad-streaming-smoke-page.js")});
			return await smoke.runRadStreamingSmoke({
				radBase64: ${JSON.stringify(radBase64)},
				fixtureName: ${JSON.stringify(relativePath(fixturePath))},
				frameCount: ${JSON.stringify(frameCount)},
				timeoutMs: ${JSON.stringify(Math.min(timeoutMs, DEFAULT_CDP_COMMAND_TIMEOUT_MS))},
			});
		})()`,
		{ awaitPromise: true },
	);

	if (issues.length > 0) {
		result.ok = false;
		result.failures.push({
			name: "browser-page-issues",
			ok: false,
			details: { issues },
		});
	}

	const outputPath = join(outDir, "rad-streaming-smoke.json");
	writeFileSync(outputPath, JSON.stringify(result, null, 2));
	console.log(
		JSON.stringify(
			{
				...result,
				baseUrl,
				fixture: relativePath(fixturePath),
				output: relativePath(outputPath),
				browser: browserPath,
			},
			null,
			2,
		),
	);

	await cleanup();
	if (!result.ok) {
		process.exitCode = 1;
	}
}

function parseArgs(argv) {
	const parsed = {};
	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		if (!arg.startsWith("--")) continue;
		const [rawKey, inlineValue] = arg.slice(2).split("=", 2);
		if (inlineValue !== undefined) {
			parsed[rawKey] = inlineValue;
			continue;
		}
		const next = argv[i + 1];
		if (next && !next.startsWith("--")) {
			parsed[rawKey] = next;
			i++;
		} else {
			parsed[rawKey] = true;
		}
	}
	return parsed;
}

async function isHttpReady(url) {
	try {
		const response = await fetch(url, { method: "GET" });
		return response.ok || response.status < 500;
	} catch {
		return false;
	}
}

async function waitForHttp(url, timeoutMs, label) {
	const start = Date.now();
	while (Date.now() - start < timeoutMs) {
		if (await isHttpReady(url)) return;
		await sleep(250);
	}
	throw new Error(`${label} did not become ready at ${url}`);
}

function startDevServer({ host, port }) {
	const viteBin = resolve(repoRoot, "node_modules", "vite", "bin", "vite.js");
	if (!existsSync(viteBin)) {
		throw new Error(
			`Vite CLI was not found at ${viteBin}. Run npm install first.`,
		);
	}
	const child = spawn(
		process.execPath,
		[viteBin, "--host", host, "--port", String(port), "--strictPort"],
		{
			cwd: repoRoot,
			stdio: ["ignore", "pipe", "pipe"],
			windowsHide: true,
		},
	);
	const outLog = join(outDir, "vite.out.log");
	const errLog = join(outDir, "vite.err.log");
	child.stdout.on("data", (chunk) => appendLog(outLog, chunk));
	child.stderr.on("data", (chunk) => appendLog(errLog, chunk));
	child.on("exit", (code, signal) => {
		if (isCleaningUp) return;
		if (code !== null && code !== 0) {
			console.error(`[rad-streaming-smoke] Vite exited with code ${code}`);
		}
		if (signal) {
			console.error(`[rad-streaming-smoke] Vite exited with signal ${signal}`);
		}
	});
	return child;
}

function appendLog(filePath, chunk) {
	writeFileSync(filePath, chunk, { flag: "a" });
}

function findBrowserExecutable(explicitPath) {
	if (explicitPath) {
		const resolved = resolve(String(explicitPath));
		if (existsSync(resolved)) return resolved;
		throw new Error(`Browser executable not found: ${resolved}`);
	}

	const envPath = process.env.CF_CHROME_PATH;
	if (envPath && existsSync(envPath)) return envPath;

	const candidates =
		process.platform === "win32"
			? [
					join(
						process.env.PROGRAMFILES ?? "C:\\Program Files",
						"Google",
						"Chrome",
						"Application",
						"chrome.exe",
					),
					join(
						process.env["PROGRAMFILES(X86)"] ?? "C:\\Program Files (x86)",
						"Google",
						"Chrome",
						"Application",
						"chrome.exe",
					),
					join(
						process.env.LOCALAPPDATA ?? "",
						"Google",
						"Chrome",
						"Application",
						"chrome.exe",
					),
					join(
						process.env.PROGRAMFILES ?? "C:\\Program Files",
						"Microsoft",
						"Edge",
						"Application",
						"msedge.exe",
					),
					join(
						process.env["PROGRAMFILES(X86)"] ?? "C:\\Program Files (x86)",
						"Microsoft",
						"Edge",
						"Application",
						"msedge.exe",
					),
				]
			: [
					"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
					"/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
					"/usr/bin/google-chrome",
					"/usr/bin/chromium",
					"/usr/bin/chromium-browser",
				];
	const found = candidates.find(
		(candidate) => candidate && existsSync(candidate),
	);
	if (found) return found;

	const pathCommand = process.platform === "win32" ? "where.exe" : "which";
	const names =
		process.platform === "win32"
			? ["chrome.exe", "msedge.exe"]
			: ["google-chrome", "chromium", "chromium-browser", "msedge"];
	for (const name of names) {
		const result = spawnSync(pathCommand, [name], { encoding: "utf8" });
		const first = result.stdout?.split(/\r?\n/).find(Boolean);
		if (result.status === 0 && first && existsSync(first)) return first;
	}

	throw new Error(
		"Chrome or Edge executable was not found. Set CF_CHROME_PATH or pass --browser <path>.",
	);
}

function startBrowser({ browserPath, cdpPort, profileDir, headed }) {
	const browserArgs = [
		`--remote-debugging-port=${cdpPort}`,
		`--user-data-dir=${profileDir}`,
		"--no-first-run",
		"--no-default-browser-check",
		"--disable-background-networking",
		"--disable-default-apps",
		"--disable-sync",
		"--ignore-gpu-blocklist",
		"--use-gl=swiftshader",
		"--enable-unsafe-swiftshader",
		"--window-size=960,720",
	];
	if (!headed) {
		browserArgs.push("--headless=new");
	}
	browserArgs.push("about:blank");

	return spawn(browserPath, browserArgs, {
		cwd: repoRoot,
		stdio: ["ignore", "pipe", "pipe"],
		windowsHide: !headed,
	});
}

async function findFreePort() {
	return await new Promise((resolve, reject) => {
		const server = net.createServer();
		server.on("error", reject);
		server.listen(0, "127.0.0.1", () => {
			const address = server.address();
			const port = typeof address === "object" && address ? address.port : null;
			server.close(() => {
				if (port) resolve(port);
				else reject(new Error("Could not allocate a free local port"));
			});
		});
	});
}

async function createCdpTarget(cdpPort, url) {
	let response = await fetch(
		`http://127.0.0.1:${cdpPort}/json/new?${encodeURIComponent(url)}`,
		{ method: "PUT" },
	);
	if (!response.ok) {
		response = await fetch(
			`http://127.0.0.1:${cdpPort}/json/new?${encodeURIComponent(url)}`,
		);
	}
	if (!response.ok) {
		throw new Error(`Could not create CDP target: ${response.status}`);
	}
	return await response.json();
}

class CdpClient {
	static async connect(webSocketUrl) {
		const client = new CdpClient(webSocketUrl);
		await client.open();
		return client;
	}

	constructor(webSocketUrl) {
		this.webSocketUrl = webSocketUrl;
		this.nextId = 1;
		this.pending = new Map();
		this.handlers = new Map();
		this.commandTimeoutMs = cdpCommandTimeoutMs;
	}

	async open() {
		this.socket = new WebSocket(this.webSocketUrl);
		await new Promise((resolve, reject) => {
			this.socket.addEventListener("open", resolve, { once: true });
			this.socket.addEventListener("error", reject, { once: true });
		});
		this.socket.addEventListener("message", (event) => {
			const message = JSON.parse(event.data);
			if (message.id) {
				const pending = this.pending.get(message.id);
				if (!pending) return;
				this.pending.delete(message.id);
				clearTimeout(pending.timeout);
				if (message.error) {
					pending.reject(new Error(JSON.stringify(message.error)));
				} else {
					pending.resolve(message.result ?? {});
				}
				return;
			}
			const handlers = this.handlers.get(message.method) ?? [];
			for (const handler of handlers) handler(message.params ?? {});
		});
	}

	on(method, handler) {
		const handlers = this.handlers.get(method) ?? [];
		handlers.push(handler);
		this.handlers.set(method, handlers);
		return () => {
			this.handlers.set(
				method,
				(this.handlers.get(method) ?? []).filter((entry) => entry !== handler),
			);
		};
	}

	send(method, params = {}) {
		const id = this.nextId++;
		const payload = { id, method, params };
		return new Promise((resolve, reject) => {
			const timeout = setTimeout(() => {
				this.pending.delete(id);
				reject(new Error(`CDP command timed out: ${method}`));
			}, this.commandTimeoutMs);
			this.pending.set(id, { resolve, reject, timeout });
			this.socket.send(JSON.stringify(payload));
		});
	}

	close() {
		this.socket?.close();
	}
}

function collectPageIssues(cdp, issues = []) {
	cdp.on("Runtime.consoleAPICalled", (event) => {
		if (event.type !== "error") return;
		issues.push({
			kind: "console.error",
			text: (event.args ?? []).map(formatRemoteObject).join(" "),
		});
	});
	cdp.on("Runtime.exceptionThrown", (event) => {
		issues.push({
			kind: "exception",
			text:
				event.exceptionDetails?.exception?.description ??
				event.exceptionDetails?.text ??
				"Runtime exception",
		});
	});
	cdp.on("Log.entryAdded", (event) => {
		if (event.entry?.level !== "error") return;
		issues.push({
			kind: "log.error",
			text: event.entry.text ?? "Log error",
		});
	});
	return issues;
}

function formatRemoteObject(value) {
	if (Object.hasOwn(value, "value")) return String(value.value);
	return value.description ?? value.type ?? "";
}

async function navigate(cdp, url) {
	await cdp.send("Page.navigate", { url });
}

async function waitForExpression(cdp, expression, timeoutMs) {
	const start = Date.now();
	while (Date.now() - start < timeoutMs) {
		const value = await evaluate(cdp, expression, { awaitPromise: false });
		if (value) return;
		await sleep(100);
	}
	throw new Error(`Expression did not become true: ${expression}`);
}

async function evaluate(cdp, expression, { awaitPromise }) {
	const result = await cdp.send("Runtime.evaluate", {
		expression,
		awaitPromise,
		returnByValue: true,
		userGesture: true,
	});
	if (result.exceptionDetails) {
		const details = result.exceptionDetails;
		throw new Error(
			details.exception?.description ??
				details.text ??
				"Runtime.evaluate failed",
		);
	}
	return result.result?.value;
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function relativePath(filePath) {
	return filePath.replace(`${repoRoot}\\`, "").replace(`${repoRoot}/`, "");
}

async function cleanup() {
	isCleaningUp = true;
	cdp?.close();
	if (browser && !keepBrowser) await terminateChild(browser);
	if (devServer) await terminateChild(devServer);
	if (profileDir && !keepBrowser) {
		await removeDirectoryWithRetries(profileDir);
	}
}

async function terminateChild(child) {
	if (!child || child.exitCode !== null || child.signalCode !== null) return;
	child.kill();
	await Promise.race([
		new Promise((resolve) => child.once("exit", resolve)),
		sleep(3000),
	]);
}

async function removeDirectoryWithRetries(directory) {
	for (let attempt = 0; attempt < 10; attempt++) {
		try {
			rmSync(directory, { recursive: true, force: true });
			return;
		} catch (error) {
			if (attempt === 9) throw error;
			await sleep(250);
		}
	}
}

process.on("exit", () => {
	if (browser && !keepBrowser && !browser.killed) browser.kill();
	if (devServer && !devServer.killed) devServer.kill();
	if (profileDir && !keepBrowser) {
		try {
			rmSync(profileDir, { recursive: true, force: true });
		} catch {
			// Best-effort cleanup only; async cleanup handles the normal path.
		}
	}
});
