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
const DEFAULT_PROJECT_PATH = "/.local/cf-test/cf-test.ssproj";
const DEFAULT_FIXTURE_ID = "hello";
const DEFAULT_TIMEOUT_MS = 60000;
const DEFAULT_CDP_COMMAND_TIMEOUT_MS = 120000;

const args = parseArgs(process.argv.slice(2));
const host = String(args.host ?? process.env.CF_SMOKE_HOST ?? DEFAULT_HOST);
const port = Number(args.port ?? process.env.CF_SMOKE_PORT ?? DEFAULT_PORT);
const projectPath = String(
	args.project ?? process.env.CF_SMOKE_PROJECT ?? DEFAULT_PROJECT_PATH,
);
const fixtureId = String(
	args.fixture ?? process.env.CF_SMOKE_FIXTURE ?? DEFAULT_FIXTURE_ID,
);
const timeoutMs = Number(args["timeout-ms"] ?? DEFAULT_TIMEOUT_MS);
const cdpCommandTimeoutMs = Number(
	args["cdp-command-timeout-ms"] ?? DEFAULT_CDP_COMMAND_TIMEOUT_MS,
);
const headed = Boolean(args.headed);
const keepBrowser = Boolean(args["keep-browser"]);
const noDevServer = Boolean(args["no-dev-server"]);
const outDir = resolve(
	repoRoot,
	String(args["out-dir"] ?? join(".local", "browser-smoke")),
);

const baseUrl = `http://${host}:${port}`;
let devServer = null;
let browser = null;
let profileDir = null;
let cdp = null;
let isCleaningUp = false;

main().catch(async (error) => {
	console.error(`[browser-smoke] ${error?.stack ?? error}`);
	await cleanup().catch(() => {});
	process.exitCode = 1;
});

async function main() {
	mkdirSync(outDir, { recursive: true });
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
	profileDir = mkdtempSync(join(tmpdir(), "camera-frames-browser-smoke-"));
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

	const verificationSource = readFileSync(
		resolve(repoRoot, "test", "ui-state-verification.js"),
		"utf8",
	);

	console.log(`[browser-smoke] opening ${baseUrl}/`);
	await navigate(cdp, `${baseUrl}/`);
	await waitForExpression(
		cdp,
		"Boolean(globalThis.__CF_TEST__?.loadProject)",
		timeoutMs,
	);
	await evaluate(cdp, verificationSource, { awaitPromise: false });
	console.log(`[browser-smoke] loading ${projectPath}`);
	const projectSmoke = await evaluate(
		cdp,
		`globalThis.__cfRunProjectSmoke({ path: ${JSON.stringify(projectPath)} })`,
		{ awaitPromise: true },
	);
	if (!projectSmoke?.ok) {
		throw new Error(
			`Project smoke failed: ${JSON.stringify(projectSmoke, null, 2)}`,
		);
	}
	await captureScreenshot(cdp, join(outDir, "project-smoke.png"));
	const timelineSmoke = await runTimelineSmoke(cdp);
	await captureScreenshot(cdp, join(outDir, "timeline-smoke.png"));
	cdp.close();
	cdp = null;

	console.log(`[browser-smoke] opening fixture ${fixtureId}`);
	const fixtureTarget = await createCdpTarget(
		cdpPort,
		`${baseUrl}/docs.html?fixture=${encodeURIComponent(fixtureId)}`,
	);
	cdp = await CdpClient.connect(fixtureTarget.webSocketDebuggerUrl);
	collectPageIssues(cdp, issues);
	await cdp.send("Page.enable");
	await cdp.send("Runtime.enable");
	await cdp.send("Log.enable").catch(() => {});
	await waitForExpression(
		cdp,
		"globalThis.__DOCS_FIXTURE_READY === true",
		timeoutMs,
	);
	const fixtureInfo = await evaluate(
		cdp,
		`({
			id: globalThis.__DOCS_FIXTURE_ID,
			count: Array.isArray(globalThis.__DOCS_FIXTURE_IDS)
				? globalThis.__DOCS_FIXTURE_IDS.length
				: 0,
			known: Array.isArray(globalThis.__DOCS_FIXTURE_IDS)
				? globalThis.__DOCS_FIXTURE_IDS.includes(${JSON.stringify(fixtureId)})
				: false,
		})`,
		{ awaitPromise: false },
	);
	if (!fixtureInfo?.known) {
		throw new Error(
			`Fixture "${fixtureId}" was not registered: ${JSON.stringify(fixtureInfo)}`,
		);
	}
	await captureScreenshot(cdp, join(outDir, `fixture-${fixtureId}.png`));

	if (issues.length > 0) {
		throw new Error(
			`Browser reported ${issues.length} error(s): ${JSON.stringify(issues, null, 2)}`,
		);
	}

	console.log(
		JSON.stringify(
			{
				ok: true,
				baseUrl,
				projectPath,
				project: projectSmoke.summary,
				timeline: timelineSmoke,
				fixture: fixtureInfo,
				screenshots: [
					relativePath(join(outDir, "project-smoke.png")),
					relativePath(join(outDir, "timeline-smoke.png")),
					relativePath(join(outDir, `fixture-${fixtureId}.png`)),
				],
				browser: browserPath,
			},
			null,
			2,
		),
	);
	await cleanup();
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
			console.error(`[browser-smoke] Vite exited with code ${code}`);
		}
		if (signal) {
			console.error(`[browser-smoke] Vite exited with signal ${signal}`);
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
		"--disable-gpu",
		"--disable-sync",
		"--window-size=1280,900",
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

async function runTimelineSmoke(cdp) {
	const result = await evaluate(
		cdp,
		`(async () => {
			const test = globalThis.__CF_TEST__;
			if (!test?.store || !test?.controller) {
				return { ok: false, error: "__CF_TEST__ store/controller unavailable" };
			}

			const waitForReady = async (frames = 4, delayMs = 0) => {
				if (typeof test.waitForReady === "function") {
					await test.waitForReady({ frames, delayMs });
					return;
				}
				for (let i = 0; i < frames; i++) {
					await new Promise((resolve) => requestAnimationFrame(resolve));
				}
				if (delayMs > 0) {
					await new Promise((resolve) => setTimeout(resolve, delayMs));
				}
			};
			const click = (selector, predicate, label) => {
				const element = [...document.querySelectorAll(selector)].find(predicate);
				if (!element) {
					throw new Error("Missing timeline UI element: " + label);
				}
				element.click();
				return element;
			};
			const readFieldValues = () =>
				Object.fromEntries(
					[...document.querySelectorAll(".timeline-field")].map((field) => [
						field.querySelector("span")?.textContent?.trim() ?? "",
						field.querySelector("input")?.value ?? "",
					]),
				);

			if (!document.querySelector(".timeline-panel")) {
				click(
					".timeline-rail__button",
					() => true,
					"collapsed rail",
				);
				await waitForReady(4);
			}
			if (!document.querySelector(".timeline-panel")) {
				throw new Error("Timeline panel did not open");
			}

			if (!test.store.animation.document.value.enabled) {
				click(
					".timeline-toggle",
					() => true,
					"enable toggle",
				);
				await waitForReady(4);
			}

			const readKeyTargetState = () => {
				const active = document.querySelector(".timeline-key-target__mode.is-active");
				return {
					text: document.querySelector(".timeline-key-target")?.textContent?.trim() ?? "",
					mode: active?.getAttribute("data-mode") ?? "",
					title: active?.getAttribute("title") ?? "",
					addKeyDisabled: Boolean(
						document.querySelector(".timeline-action--add-key")?.disabled,
					),
				};
			};
			const cameraKeyTargetState = readKeyTargetState();
			const firstSceneAssetId = test.store.sceneAssets.value?.[0]?.id ?? null;
			let sceneKeyTargetState = null;
			let cameraWithSelectionKeyTargetState = null;
			if (firstSceneAssetId !== null && typeof test.controller.selectSceneAsset === "function") {
				test.controller.selectSceneAsset(firstSceneAssetId);
				await waitForReady(4);
				click(
					'.timeline-key-target__mode[data-mode="objects"]',
					() => true,
					"objects key target mode",
				);
				await waitForReady(4);
				sceneKeyTargetState = readKeyTargetState();
				click(
					'.timeline-key-target__mode[data-mode="camera"]',
					() => true,
					"camera key target mode",
				);
				await waitForReady(4);
				cameraWithSelectionKeyTargetState = readKeyTargetState();
			}

			test.controller.setTimelineFrame(12);
			test.controller.setAnimationFps(12);
			test.controller.setAnimationDurationFrames(48);
			await waitForReady(3);
			click(
				".timeline-action--add-key",
				(element) => !element.disabled,
				"add key",
			);
			await waitForReady(8);

			click(
				".timeline-action--play",
				(element) => !element.disabled,
				"play",
			);
			await waitForReady(8, 250);
			const played = test.store.animation.isPlaying.value === true;
			click(
				".timeline-action--play",
				(element) => !element.disabled,
				"pause",
			);
			await waitForReady(4);

			const rulerLabelsBeforeZoom = [
				...document.querySelectorAll(".timeline-ruler__tick"),
			].map((element) => element.textContent?.trim() ?? "");
			click(
				".timeline-action--zoom-in",
				(element) => !element.disabled,
				"zoom in",
			);
			await waitForReady(4);
			const zoomAfterIn = test.store.animation.zoom.value;
			const rulerLabelsAfterZoomIn = [
				...document.querySelectorAll(".timeline-ruler__tick"),
			].map((element) => element.textContent?.trim() ?? "");
			click(
				".timeline-action--zoom-out",
				(element) => !element.disabled,
				"zoom out",
			);
			await waitForReady(4);
			const zoomAfterOut = test.store.animation.zoom.value;

			test.controller.setTimelineFrame(1);
			await waitForReady(3);
			const dopesheet = document.querySelector(".timeline-dopesheet");
			const timelineContent = document.querySelector(
				".timeline-dopesheet__content",
			);
			if (!dopesheet || !timelineContent) {
				throw new Error("Timeline dopesheet content missing");
			}
			const dopesheetRect = dopesheet.getBoundingClientRect();
			const scrubClientX = dopesheetRect.left + dopesheetRect.width * 0.7;
			const scrubClientY = dopesheetRect.top + Math.min(60, dopesheetRect.height / 2);
			timelineContent.dispatchEvent(
				new PointerEvent("pointerdown", {
					bubbles: true,
					pointerId: 10,
					button: 0,
					clientX: scrubClientX,
					clientY: scrubClientY,
				}),
			);
			timelineContent.dispatchEvent(
				new PointerEvent("pointerup", {
					bubbles: true,
					pointerId: 10,
					button: 0,
					clientX: scrubClientX,
					clientY: scrubClientY,
				}),
			);
			await waitForReady(4);
			const scrubbedFrame = test.store.animation.timelineFrame.value;

			click(
				".timeline-panel__collapse",
				(element) => !element.disabled,
				"collapse",
			);
			await waitForReady(4);
			const collapsed = Boolean(document.querySelector(".timeline-rail__button"));
			if (!collapsed) {
				throw new Error("Timeline collapse button did not close the panel");
			}
			click(".timeline-rail__button", () => true, "collapsed rail reopen");
			await waitForReady(4);
			if (!document.querySelector(".timeline-panel")) {
				throw new Error("Timeline rail did not reopen the panel");
			}

			const animation = test.store.animation;
			const documentState = animation.document.value;
			const clip = animation.activeClip.value;
			const keyCount = (clip.bindings ?? []).reduce(
				(total, binding) =>
					total +
					(binding.tracks ?? []).reduce(
						(trackTotal, track) => trackTotal + (track.keys ?? []).length,
						0,
					),
				0,
			);
			const keyElementCount =
				document.querySelectorAll(".timeline-key").length;
			const panelBounds = document
				.querySelector(".timeline-panel")
				?.getBoundingClientRect();
			const fieldValues = readFieldValues();
			const summary = {
				enabled: Boolean(documentState.enabled),
				currentFrame: animation.timelineFrame.value,
				fps: clip.fps,
				durationFrames: clip.durationFrames,
				bindings: (clip.bindings ?? []).length,
				keys: keyCount,
				keyElements: keyElementCount,
				played,
				zoomAfterIn,
				zoomAfterOut,
				scrubbedFrame,
				cameraKeyTargetState,
				sceneKeyTargetState,
				cameraWithSelectionKeyTargetState,
				rulerLabelsBeforeZoom,
				rulerLabelsAfterZoomIn,
				panel: panelBounds
					? {
							width: Math.round(panelBounds.width),
							height: Math.round(panelBounds.height),
							top: Math.round(panelBounds.top),
							bottom: Math.round(panelBounds.bottom),
						}
					: null,
				fields: fieldValues,
			};
			const failures = [];
			if (!summary.enabled) failures.push("animation not enabled");
			if (
				summary.cameraKeyTargetState.mode !== "camera" ||
				!/Camera 1/.test(summary.cameraKeyTargetState.title)
			) {
				failures.push("Camera key target indicator did not show active camera");
			}
			if (
				firstSceneAssetId !== null &&
				(!summary.sceneKeyTargetState ||
					summary.sceneKeyTargetState.mode !== "objects" ||
					summary.sceneKeyTargetState.addKeyDisabled ||
					summary.sceneKeyTargetState.title ===
						summary.cameraKeyTargetState.title)
			) {
				failures.push("Object key target mode did not reflect selection");
			}
			if (
				firstSceneAssetId !== null &&
				(!summary.cameraWithSelectionKeyTargetState ||
					summary.cameraWithSelectionKeyTargetState.mode !== "camera" ||
					!/Camera 1/.test(summary.cameraWithSelectionKeyTargetState.title))
			) {
				failures.push("Camera key target mode was not selectable with object selected");
			}
			if (summary.fps !== 12) failures.push("fps field did not apply");
			if (summary.durationFrames !== 48) {
				failures.push("duration field did not apply");
			}
			if (summary.bindings < 1 || summary.keys < 1) {
				failures.push("Add key did not create animation keys");
			}
			if (summary.keyElements < 1) {
				failures.push("Dopesheet did not render key markers");
			}
			if (!summary.played) failures.push("Play button did not toggle playback");
			if (summary.zoomAfterIn <= 1) failures.push("Zoom in did not increase zoom");
			if (summary.zoomAfterOut >= summary.zoomAfterIn) {
				failures.push("Zoom out did not reduce zoom");
			}
			if (summary.scrubbedFrame <= 1) {
				failures.push("Dopesheet pointer scrub did not move the playhead");
			}
			if (
				[...summary.rulerLabelsBeforeZoom, ...summary.rulerLabelsAfterZoomIn].some(
					(label) => /^F\\s*/.test(label),
				)
			) {
				failures.push("Timeline ruler still shows F-prefixed frame labels");
			}
			if (
				summary.rulerLabelsAfterZoomIn.length <=
				summary.rulerLabelsBeforeZoom.length
			) {
				failures.push("Zoom in did not increase ruler tick density");
			}
			if (!summary.panel || summary.panel.width < 600 || summary.panel.height < 160) {
				failures.push("Timeline panel bounds are too small");
			}
			return {
				ok: failures.length === 0,
				failures,
				summary,
			};
		})()`,
		{ awaitPromise: true },
	);
	if (!result?.ok) {
		throw new Error(
			`Timeline smoke failed: ${JSON.stringify(result, null, 2)}`,
		);
	}
	return result.summary;
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

async function captureScreenshot(cdp, filePath) {
	const result = await cdp.send("Page.captureScreenshot", {
		format: "png",
		captureBeyondViewport: false,
	});
	if (!result.data || result.data.length < 1000) {
		throw new Error(`Screenshot capture produced too little data: ${filePath}`);
	}
	writeFileSync(filePath, Buffer.from(result.data, "base64"));
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
