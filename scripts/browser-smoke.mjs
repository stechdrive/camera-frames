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
	const webmTimingSmoke = await runWebmEncoderTimingSmoke(cdp);
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
	const timelineCameraAnimationSmoke =
		await runTimelineCameraAnimationSmoke(cdp);
	const timelineSceneAssetTransformSmoke =
		await runTimelineSceneAssetTransformSmoke(cdp);
	const exportOutputSmoke = await runExportOutputSmoke(cdp);
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
				webmTiming: webmTimingSmoke,
				project: projectSmoke.summary,
				timeline: {
					...timelineSmoke,
					cameraAnimation: timelineCameraAnimationSmoke,
					sceneAssetTransform: timelineSceneAssetTransformSmoke,
				},
				exportOutput: exportOutputSmoke,
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

async function runWebmEncoderTimingSmoke(cdp) {
	const result = await evaluate(
		cdp,
		`(async () => {
			const supported = Boolean(
				typeof MediaRecorder !== "undefined" &&
					typeof HTMLCanvasElement !== "undefined" &&
					HTMLCanvasElement.prototype.captureStream &&
					(typeof MediaRecorder.isTypeSupported !== "function" ||
						MediaRecorder.isTypeSupported("video/webm")),
			);
			if (!supported) {
				return { ok: true, supported: false };
			}
			const { createWebmFromFrameRenderer } = await import(
				"/src/controllers/export/video-download.js"
			);
			const wait = (durationMs) =>
				new Promise((resolve) => setTimeout(resolve, durationMs));
			const loadVideoDuration = (blob) =>
				new Promise((resolve, reject) => {
					const url = URL.createObjectURL(blob);
					const video = document.createElement("video");
					const timeout = setTimeout(() => {
						URL.revokeObjectURL(url);
						reject(new Error("Timed out while reading WebM duration"));
					}, 10000);
					video.preload = "metadata";
					video.onloadedmetadata = () => {
						clearTimeout(timeout);
						const duration = video.duration;
						URL.revokeObjectURL(url);
						resolve(duration);
					};
					video.onerror = () => {
						clearTimeout(timeout);
						URL.revokeObjectURL(url);
						reject(new Error("Failed to read WebM duration"));
					};
					video.src = url;
				});
			const frameCount = 4;
			const fps = 4;
			const renderDelayMs = 300;
			const canvas = document.createElement("canvas");
			canvas.width = 48;
			canvas.height = 32;
			const context = canvas.getContext("2d");
			const startedAt = performance.now();
			const blob = await createWebmFromFrameRenderer(
				async (drawFrame) => {
					for (let frame = 0; frame < frameCount; frame += 1) {
						await wait(renderDelayMs);
						context.fillStyle = \`rgb(\${50 + frame * 40}, 90, 160)\`;
						context.fillRect(0, 0, canvas.width, canvas.height);
						context.fillStyle = "white";
						context.fillRect(frame * 4, frame * 3, 10, 10);
						await drawFrame(canvas);
					}
				},
				{ fps },
			);
			const elapsedSeconds = (performance.now() - startedAt) / 1000;
			const duration = await loadVideoDuration(blob);
			const expectedDuration = Math.max(0, frameCount - 1) / fps;
			const maxDeltaSeconds = 0.25;
			return {
				ok:
					Number.isFinite(duration) &&
					Math.abs(duration - expectedDuration) <= maxDeltaSeconds &&
					Math.abs(duration - elapsedSeconds) > 0.5,
				supported: true,
				frameCount,
				fps,
				renderDelayMs,
				expectedDuration,
				duration,
				elapsedSeconds,
				blobSize: blob.size,
			};
		})()`,
		{ awaitPromise: true },
	);
	if (!result?.ok) {
		throw new Error(
			`WebM encoder timing smoke failed: ${JSON.stringify(result, null, 2)}`,
		);
	}
	return result;
}

async function runExportOutputSmoke(cdp) {
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
			const text = (element) => element?.textContent?.replace(/\\s+/g, " ").trim() ?? "";
			const click = (element, label) => {
				if (!element) {
					throw new Error("Missing export UI element: " + label);
				}
				element.click();
				return element;
			};
			const findByText = (selector, pattern) =>
				[...document.querySelectorAll(selector)].find((element) =>
					pattern.test(text(element)),
				);
			const videoSupported = Boolean(
				typeof MediaRecorder !== "undefined" &&
					typeof HTMLCanvasElement !== "undefined" &&
					HTMLCanvasElement.prototype.captureStream &&
					(typeof MediaRecorder.isTypeSupported !== "function" ||
						MediaRecorder.isTypeSupported("video/webm")),
			);

			test.store.workbenchManualCollapsed.value = false;
			test.store.workbenchAutoCollapsed.value = false;
			test.store.workbenchManualExpanded.value = true;
			await waitForReady(6);

			const exportTab =
				findByText(".workbench-tab", /書き出し|Export/i) ??
				document.querySelectorAll(".workbench-inspector-header .workbench-tab")[3];
			if (!exportTab) {
				throw new Error(
					"Export tab not found; counts=" +
						JSON.stringify({
							tabs: document.querySelectorAll(".workbench-tab").length,
							headers: document.querySelectorAll(".workbench-inspector-header").length,
							railButtons: document.querySelectorAll(".workbench-inspector-rail__button").length,
							workbenchCollapsed: test.store.workbenchCollapsed.value,
						}),
				);
			}
			click(exportTab, "Export tab");
			await waitForReady(5);
			const downloadButton = () => document.querySelector("#download-output");
			if (!downloadButton()) {
				throw new Error("Export output section did not render");
			}
			const readState = () => ({
				mode: test.store.exportOptions.mode.value,
				frameSource: test.store.exportOptions.frameSource.value,
				buttonLabel: text(downloadButton()),
				buttonDisabled: Boolean(downloadButton()?.disabled),
				summary: text(document.querySelector(".export-run-settings__summary")),
				hasFrameSourceSelect: Boolean(document.querySelector("#export-frame-source")),
				modeButtons: [...document.querySelectorAll(".export-mode-segment__button")].map(text),
			});

			const initial = readState();
			click(findByText(".export-mode-segment__button", /連番|Sequence/i), "sequence mode");
			await waitForReady(5);
			const sequence = readState();
			const frameSourceSelect = document.querySelector("#export-frame-source");
			if (!frameSourceSelect) {
				throw new Error("Frame range select did not render in sequence mode");
			}
			frameSourceSelect.value = "duration";
			frameSourceSelect.dispatchEvent(new Event("change", { bubbles: true }));
			await waitForReady(5);
			const duration = readState();
			click(findByText(".export-mode-segment__button", /動画|Video/i), "video mode");
			await waitForReady(5);
			const video = readState();
			click(findByText(".export-mode-segment__button", /現在フレーム|Current/i), "current mode");
			await waitForReady(5);
			const current = readState();

			const failures = [];
			if (initial.modeButtons.length !== 3) {
				failures.push("Export mode segmented control did not render three modes");
			}
			if (initial.mode !== "current") {
				failures.push("Initial export mode was not current");
			}
			if (!/現在フレーム|current frame/i.test(initial.summary)) {
				failures.push("Current frame summary did not describe current-frame export");
			}
			if (sequence.mode !== "sequence" || !sequence.hasFrameSourceSelect) {
				failures.push("Sequence mode did not expose frame range select");
			}
			if (!/連番|sequence/i.test(sequence.buttonLabel)) {
				failures.push("Sequence mode did not update the export button label");
			}
			if (sequence.frameSource !== "keyframes") {
				failures.push("Sequence mode did not default to keyframes-only export");
			}
			if (duration.frameSource !== "duration") {
				failures.push("Duration frame source did not update store state");
			}
			if (video.mode !== "video") {
				failures.push("Video mode did not update store state");
			}
			if (video.frameSource !== "duration") {
				failures.push("Video mode did not default to full duration export");
			}
			if (!/動画|video/i.test(video.buttonLabel)) {
				failures.push("Video mode did not update the export button label");
			}
			if (videoSupported && /対応していない|cannot export/i.test(video.summary)) {
				failures.push("Video summary reported unsupported despite browser support");
			}
			if (!videoSupported && !video.buttonDisabled) {
				failures.push("Video export button was enabled in an unsupported browser");
			}
			if (current.mode !== "current" || current.hasFrameSourceSelect) {
				failures.push("Current mode did not hide frame range select");
			}
			return {
				ok: failures.length === 0,
				failures,
				summary: {
					initial,
					sequence,
					duration,
					video,
					current,
					videoSupported,
				},
			};
		})()`,
		{ awaitPromise: true },
	);
	if (!result?.ok) {
		throw new Error(
			`Export output smoke failed: ${JSON.stringify(result, null, 2)}`,
		);
	}
	return result.summary;
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
			const activeCameraKey =
				"shot-camera:" + test.store.workspace.activeShotCameraId.value;
			const autoKeyAfterAdd =
				(test.store.animation.document.value?.autoKeyTargetKeys ?? []).includes(
					activeCameraKey,
				) &&
				document.querySelector(".timeline-track-row__autokey.is-active") !==
					null;
			const cameraPoseBeforeMove =
				test.controller.getActiveShotCameraPoseState?.() ?? null;
			let cameraEditableAfterKey = null;
			if (
				cameraPoseBeforeMove?.position &&
				typeof test.controller.moveActiveShotCameraLocalAxis === "function"
			) {
				test.controller.moveActiveShotCameraLocalAxis("right", 0.5);
				await waitForReady(8);
				const cameraPoseAfterMove =
					test.controller.getActiveShotCameraPoseState?.() ?? null;
				await waitForReady(8);
				const cameraPoseAfterSettle =
					test.controller.getActiveShotCameraPoseState?.() ?? null;
				const distanceMoved = cameraPoseAfterMove?.position
					? Math.hypot(
							cameraPoseAfterMove.position.x -
								cameraPoseBeforeMove.position.x,
							cameraPoseAfterMove.position.y -
								cameraPoseBeforeMove.position.y,
							cameraPoseAfterMove.position.z -
								cameraPoseBeforeMove.position.z,
						)
					: 0;
				const distanceSettled = cameraPoseAfterSettle?.position
					? Math.hypot(
							cameraPoseAfterSettle.position.x -
								cameraPoseAfterMove.position.x,
							cameraPoseAfterSettle.position.y -
								cameraPoseAfterMove.position.y,
							cameraPoseAfterSettle.position.z -
								cameraPoseAfterMove.position.z,
						)
					: Number.POSITIVE_INFINITY;
				cameraEditableAfterKey = {
					distanceMoved,
					distanceSettled,
				};
			}

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
			const dopesheetForWheel = document.querySelector(".timeline-dopesheet");
			const wheelZoomBefore = test.store.animation.zoom.value;
			dopesheetForWheel?.dispatchEvent(
				new WheelEvent("wheel", {
					bubbles: true,
					cancelable: true,
					altKey: true,
					deltaY: -120,
					clientX:
						dopesheetForWheel.getBoundingClientRect().left +
						dopesheetForWheel.getBoundingClientRect().width / 2,
					clientY:
						dopesheetForWheel.getBoundingClientRect().top +
						Math.min(24, dopesheetForWheel.getBoundingClientRect().height / 2),
				}),
			);
			await waitForReady(4);
			const wheelZoomAfter = test.store.animation.zoom.value;
			const scrollBeforeWheel = dopesheetForWheel?.scrollLeft ?? 0;
			dopesheetForWheel?.dispatchEvent(
				new WheelEvent("wheel", {
					bubbles: true,
					cancelable: true,
					deltaY: 180,
				}),
			);
			await waitForReady(4);
			const scrollAfterWheel = dopesheetForWheel?.scrollLeft ?? 0;

			test.controller.setTimelineFrame(1);
			test.controller.setTimelineZoom?.(8);
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
			const scrollBeforeScrubDrag = dopesheet.scrollLeft;
			const scrubAutoScrollStartX = dopesheetRect.right - 8;
			const scrubAutoScrollY = dopesheetRect.top + Math.min(60, dopesheetRect.height / 2);
			timelineContent.dispatchEvent(
				new PointerEvent("pointerdown", {
					bubbles: true,
					pointerId: 11,
					button: 0,
					clientX: scrubAutoScrollStartX,
					clientY: scrubAutoScrollY,
				}),
			);
			for (let i = 0; i < 8; i++) {
				timelineContent.dispatchEvent(
					new PointerEvent("pointermove", {
						bubbles: true,
						pointerId: 11,
						button: 0,
						clientX: dopesheetRect.right + 90,
						clientY: scrubAutoScrollY,
					}),
				);
				await waitForReady(1);
			}
			timelineContent.dispatchEvent(
				new PointerEvent("pointerup", {
					bubbles: true,
					pointerId: 11,
					button: 0,
					clientX: dopesheetRect.right + 90,
					clientY: scrubAutoScrollY,
				}),
			);
			await waitForReady(4);
			const scrollAfterScrubDrag = dopesheet.scrollLeft;
			const scrubAutoScrolledFrame = test.store.animation.timelineFrame.value;

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
				autoKeyAfterAdd,
				zoomAfterIn,
				zoomAfterOut,
				scrubbedFrame,
				scrollBeforeScrubDrag,
				scrollAfterScrubDrag,
				scrubAutoScrolledFrame,
				cameraKeyTargetState,
				sceneKeyTargetState,
				cameraWithSelectionKeyTargetState,
				cameraEditableAfterKey,
				rulerLabelsBeforeZoom,
				rulerLabelsAfterZoomIn,
				wheelZoomBefore,
				wheelZoomAfter,
				scrollBeforeWheel,
				scrollAfterWheel,
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
			if (!summary.autoKeyAfterAdd) {
				failures.push("Add key did not enable Auto Key");
			}
			if (
				!summary.cameraEditableAfterKey ||
				summary.cameraEditableAfterKey.distanceMoved <= 0.01 ||
				summary.cameraEditableAfterKey.distanceSettled > 0.001
			) {
				failures.push("Camera pose was restored after adding a key");
			}
			if (!summary.played) failures.push("Play button did not toggle playback");
			if (summary.zoomAfterIn <= 1) failures.push("Zoom in did not increase zoom");
			if (summary.zoomAfterOut >= summary.zoomAfterIn) {
				failures.push("Zoom out did not reduce zoom");
			}
			if (summary.scrubbedFrame <= 1) {
				failures.push("Dopesheet pointer scrub did not move the playhead");
			}
			if (summary.scrollAfterScrubDrag <= summary.scrollBeforeScrubDrag) {
				failures.push("Dopesheet scrub did not auto-scroll beyond the visible range");
			}
			if (summary.scrubAutoScrolledFrame <= summary.scrubbedFrame) {
				failures.push("Dopesheet auto-scroll scrub did not keep advancing the playhead");
			}
			if (
				[...summary.rulerLabelsBeforeZoom, ...summary.rulerLabelsAfterZoomIn].some(
					(label) => /^F\\s*/.test(label),
				)
			) {
				failures.push("Timeline ruler still shows F-prefixed frame labels");
			}
			const beforeZoomAlreadyPerFrame =
				summary.rulerLabelsBeforeZoom.length >= summary.durationFrames;
			if (
				!beforeZoomAlreadyPerFrame &&
				summary.rulerLabelsAfterZoomIn.length <=
					summary.rulerLabelsBeforeZoom.length
			) {
				failures.push("Zoom in did not increase ruler tick density");
			}
			if (!summary.rulerLabelsBeforeZoom.includes("2")) {
				failures.push("Timeline ruler did not show per-frame labels when there was room");
			}
			if (summary.wheelZoomAfter <= summary.wheelZoomBefore) {
				failures.push("Alt+wheel did not zoom the timeline in");
			}
			if (summary.scrollAfterWheel <= summary.scrollBeforeWheel) {
				failures.push("Timeline wheel did not scroll horizontally");
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

async function runTimelineCameraAnimationSmoke(cdp) {
	const setup = await evaluate(
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
			const click = (selector, label) => {
				const element = document.querySelector(selector);
				if (!element || element.disabled) {
					throw new Error("Missing or disabled timeline UI element: " + label);
				}
				element.click();
				return element;
			};
			const poseSignature = () => {
				const pose = test.controller.getActiveShotCameraPoseState?.();
				if (!pose?.position || !pose?.rotation) {
					return null;
				}
				return {
					position: { ...pose.position },
					rotation: { ...pose.rotation },
				};
			};
			globalThis.__cfTimelineCameraSmoke = {
				waitForReady,
				poseSignature,
			};
			if (!document.querySelector(".timeline-panel")) {
				click(".timeline-rail__button", "timeline rail");
				await waitForReady(4);
			}
			test.store.animation.document.value = {
				version: 1,
				enabled: true,
				autoKeyTargetKeys: [],
				activeClipId: "clip-browser-camera",
				clips: [{
					id: "clip-browser-camera",
					name: "Browser Camera Regression",
					fps: 12,
					startFrame: 1,
					durationFrames: 48,
					playbackStartFrame: 1,
					playbackEndFrame: 48,
					bindings: [],
				}],
			};
			test.controller.setAnimationKeyTargetMode?.("camera");
			test.controller.setMode?.("camera");
			test.controller.setAnimationFps?.(12);
			test.controller.setAnimationDurationFrames?.(48);
			test.controller.setTimelineFrame?.(1);
			await waitForReady(6);
			click(".timeline-action--add-key", "first camera key");
			await waitForReady(8);
			const activeCameraKey =
				"shot-camera:" + test.store.workspace.activeShotCameraId.value;
			const autoKeyAfterFirstKey = (
				test.store.animation.document.value?.autoKeyTargetKeys ?? []
			).includes(activeCameraKey);
			const firstPose = poseSignature();
			test.controller.setTimelineFrame?.(24);
			await waitForReady(8);
			const viewport = document.querySelector("#viewport");
			if (!viewport) {
				throw new Error("Viewport canvas missing");
			}
			const rect = viewport.getBoundingClientRect();
			return {
				ok: true,
				firstPose,
				autoKeyAfterFirstKey,
				drag: {
					x0: Math.round(rect.left + rect.width * 0.52),
					y0: Math.round(rect.top + rect.height * 0.48),
					x1: Math.round(rect.left + rect.width * 0.68),
					y1: Math.round(rect.top + rect.height * 0.54),
				},
			};
		})()`,
		{ awaitPromise: true },
	);
	if (!setup?.ok) {
		throw new Error(
			`Timeline camera animation setup failed: ${JSON.stringify(setup, null, 2)}`,
		);
	}

	await cdp.send("Input.dispatchMouseEvent", {
		type: "mouseMoved",
		x: setup.drag.x0,
		y: setup.drag.y0,
		button: "none",
	});
	await cdp.send("Input.dispatchMouseEvent", {
		type: "mousePressed",
		x: setup.drag.x0,
		y: setup.drag.y0,
		button: "right",
		buttons: 2,
		clickCount: 1,
	});
	await cdp.send("Input.dispatchMouseEvent", {
		type: "mouseMoved",
		x: setup.drag.x1,
		y: setup.drag.y1,
		button: "right",
		buttons: 2,
	});
	await cdp.send("Input.dispatchMouseEvent", {
		type: "mouseReleased",
		x: setup.drag.x1,
		y: setup.drag.y1,
		button: "right",
		buttons: 0,
		clickCount: 1,
	});

	const result = await evaluate(
		cdp,
		`(async () => {
			const test = globalThis.__CF_TEST__;
			const smoke = globalThis.__cfTimelineCameraSmoke;
			const waitForReady = smoke.waitForReady;
			const poseSignature = smoke.poseSignature;
			const poseDelta = (left, right) => {
				if (!left || !right) return Number.POSITIVE_INFINITY;
				return Math.hypot(
					(left.position.x ?? 0) - (right.position.x ?? 0),
					(left.position.y ?? 0) - (right.position.y ?? 0),
					(left.position.z ?? 0) - (right.position.z ?? 0),
					(left.rotation.yawDeg ?? 0) - (right.rotation.yawDeg ?? 0),
					(left.rotation.pitchDeg ?? 0) - (right.rotation.pitchDeg ?? 0),
					(left.rotation.rollDeg ?? 0) - (right.rotation.rollDeg ?? 0),
				);
			};
			const click = (selector, label) => {
				const element = document.querySelector(selector);
				if (!element || element.disabled) {
					throw new Error("Missing or disabled timeline UI element: " + label);
				}
				element.click();
				return element;
			};
			await waitForReady(12, 80);
			let editedPose = poseSignature();
			let usedControllerEditFallback = false;
			if (poseDelta(${JSON.stringify(setup.firstPose)}, editedPose) <= 0.01) {
				test.controller.moveActiveShotCameraLocalAxis?.("right", 1);
				await waitForReady(8);
				editedPose = poseSignature();
				usedControllerEditFallback = true;
			}
			await waitForReady(10);
			const clip = test.store.animation.activeClip.value;
			const binding = (clip.bindings ?? []).find(
				(candidate) => candidate.target?.kind === "shot-camera",
			);
			const changedTracks = (binding?.tracks ?? []).filter((track) => {
				const keys = track.keys ?? [];
				return (
					keys.length >= 2 &&
					keys[0].frame === 1 &&
					keys[keys.length - 1].frame === 24 &&
					Math.abs(keys[0].value - keys[keys.length - 1].value) > 1e-5
				);
			});
			test.controller.setTimelineFrame?.(1);
			await waitForReady(6);
			const poseAtStart = poseSignature();
			test.controller.setTimelineFrame?.(12);
			await waitForReady(6);
			const poseAtMiddle = poseSignature();
			test.controller.setTimelineFrame?.(24);
			await waitForReady(6);
			const poseAtEnd = poseSignature();
			test.controller.setTimelineFrame?.(1);
			await waitForReady(4);
			test.controller.playTimeline?.();
			await waitForReady(16, 500);
			const poseDuringPlayback = poseSignature();
			const frameDuringPlayback = test.store.animation.timelineFrame.value;
			test.controller.pauseTimeline?.();
			await waitForReady(4);
			const summary = {
				bindingCount: clip.bindings?.length ?? 0,
				trackCount: binding?.tracks?.length ?? 0,
				autoKeyAfterFirstKey: ${JSON.stringify(setup.autoKeyAfterFirstKey)},
				changedTrackPaths: changedTracks.map((track) => track.path),
				startToEdited: poseDelta(${JSON.stringify(setup.firstPose)}, editedPose),
				startToScrubStart: poseDelta(${JSON.stringify(setup.firstPose)}, poseAtStart),
				startToMiddle: poseDelta(poseAtStart, poseAtMiddle),
				middleToEnd: poseDelta(poseAtMiddle, poseAtEnd),
				startToEnd: poseDelta(poseAtStart, poseAtEnd),
				frameDuringPlayback,
				startToPlayback: poseDelta(poseAtStart, poseDuringPlayback),
				usedControllerEditFallback,
			};
			const failures = [];
			if (summary.changedTrackPaths.length < 1) {
				failures.push("Auto Key did not create any changed camera track");
			}
			if (!summary.autoKeyAfterFirstKey) {
				failures.push("First camera key did not enable Auto Key");
			}
			if (summary.startToEdited <= 0.01) {
				failures.push("Browser camera edit did not change the shot camera");
			}
			if (summary.startToScrubStart > 0.001) {
				failures.push("Scrubbing to first key did not restore the first camera pose");
			}
			if (summary.startToMiddle <= 0.001 || summary.middleToEnd <= 0.001) {
				failures.push("Scrubbing did not evaluate an interpolated camera pose");
			}
			if (summary.startToEnd <= 0.01) {
				failures.push("Scrubbing to second key did not reach a distinct camera pose");
			}
			if (summary.frameDuringPlayback <= 1 || summary.startToPlayback <= 0.001) {
				failures.push("Timeline playback did not advance the animated camera");
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
			`Timeline camera animation smoke failed: ${JSON.stringify(result, null, 2)}`,
		);
	}
	return result.summary;
}

async function runTimelineSceneAssetTransformSmoke(cdp) {
	const assetCount = await evaluate(
		cdp,
		`globalThis.__CF_TEST__?.controller
			?.__debugGetSceneAssets?.()
			?.filter((asset) => asset?.object?.visible !== false)
			?.length ?? 0`,
		{ awaitPromise: false },
	);
	const handles = [
		{ handleName: "move-x", dx: 86, dy: 0 },
		{ handleName: "move-y", dx: 0, dy: -86 },
		{ handleName: "move-z", dx: 70, dy: -40 },
	];
	const attempts = [];
	for (let assetIndex = 0; assetIndex < assetCount; assetIndex += 1) {
		for (const handleCandidate of handles) {
			const setup = await evaluate(
				cdp,
				`(async () => {
					const test = globalThis.__CF_TEST__;
					if (!test?.store || !test?.controller) {
						return { ok: false, error: "__CF_TEST__ store/controller unavailable" };
					}
					const waitFrame = () =>
						new Promise((resolve) =>
							requestAnimationFrame(() => requestAnimationFrame(resolve)),
						);
					const worldPositionArray = (asset) => {
						asset.object.updateMatrixWorld?.(true);
						const elements = asset.object.matrixWorld?.elements ?? [];
						return [elements[12] ?? 0, elements[13] ?? 0, elements[14] ?? 0];
					};
					const resolveHandleDragOffset = (handle, fallback) => {
						const angleText = getComputedStyle(handle)
							.getPropertyValue("--gizmo-angle")
							.trim();
						const angleDegrees = Number.parseFloat(angleText);
						if (!Number.isFinite(angleDegrees)) {
							return fallback;
						}
						const radians = (angleDegrees * Math.PI) / 180;
						return {
							dx: Math.cos(radians) * 96,
							dy: Math.sin(radians) * 96,
						};
					};
					const assets =
						test.controller.__debugGetSceneAssets?.().filter(
							(asset) => asset?.object?.visible !== false,
						) ?? [];
					const asset = assets[${assetIndex}];
					if (!asset) {
						return { ok: false, skipped: "missing-asset", assetIndex: ${assetIndex} };
					}
					test.controller.setTimelinePanelOpen?.(true);
					test.controller.setAnimationKeyTargetMode?.("objects");
					test.controller.selectSceneAsset?.(asset.id);
					test.controller.setViewportTransformMode?.(true);
					test.controller.setTimelineFrame?.(1);
					test.controller.insertKeyForSelection?.();
					test.controller.setTimelineFrame?.(12);
					await waitFrame();
					const candidate = ${JSON.stringify(handleCandidate)};
					const handle = document.querySelector(
						\`[data-gizmo-handle="\${candidate.handleName}"]\`,
					);
					if (!handle || handle.classList.contains("is-hidden")) {
						return {
							ok: false,
							assetId: asset.id,
							label: asset.label,
							handleName: candidate.handleName,
							skipped: "hidden",
						};
					}
					const rect = handle.getBoundingClientRect();
					if (rect.width <= 0 || rect.height <= 0) {
						return {
							ok: false,
							assetId: asset.id,
							label: asset.label,
							handleName: candidate.handleName,
							skipped: "empty-rect",
						};
					}
					const start = {
						x: rect.left + rect.width / 2,
						y: rect.top + rect.height / 2,
					};
					const offset = resolveHandleDragOffset(handle, candidate);
					globalThis.__cfSceneAssetTransformSmoke = {
						assetIndex: ${assetIndex},
						assetId: asset.id,
						label: asset.label,
						handleName: candidate.handleName,
						beforePosition: worldPositionArray(asset),
					};
					return {
						ok: true,
						assetId: asset.id,
						label: asset.label,
						handleName: candidate.handleName,
						start,
						offset,
					};
				})()`,
				{ awaitPromise: true },
			);
			if (!setup?.ok) {
				attempts.push(setup);
				continue;
			}
			const end = {
				x: setup.start.x + setup.offset.dx,
				y: setup.start.y + setup.offset.dy,
			};
			await cdp.send("Input.dispatchMouseEvent", {
				type: "mouseMoved",
				x: setup.start.x,
				y: setup.start.y,
			});
			await cdp.send("Input.dispatchMouseEvent", {
				type: "mousePressed",
				x: setup.start.x,
				y: setup.start.y,
				button: "left",
				buttons: 1,
				clickCount: 1,
			});
			await cdp.send("Input.dispatchMouseEvent", {
				type: "mouseMoved",
				x: end.x,
				y: end.y,
				button: "left",
				buttons: 1,
			});
			await cdp.send("Input.dispatchMouseEvent", {
				type: "mouseReleased",
				x: end.x,
				y: end.y,
				button: "left",
				buttons: 0,
				clickCount: 1,
			});
			await sleep(100);
			const result = await evaluate(
				cdp,
				`(async () => {
					const test = globalThis.__CF_TEST__;
					const smoke = globalThis.__cfSceneAssetTransformSmoke;
					const assets =
						test.controller.__debugGetSceneAssets?.().filter(
							(asset) => asset?.object?.visible !== false,
						) ?? [];
					const asset = assets[smoke?.assetIndex ?? -1];
					const worldPositionArray = (asset) => {
						asset.object.updateMatrixWorld?.(true);
						const elements = asset.object.matrixWorld?.elements ?? [];
						return [elements[12] ?? 0, elements[13] ?? 0, elements[14] ?? 0];
					};
					const distance = (left, right) =>
						Math.hypot(
							(left?.[0] ?? 0) - (right?.[0] ?? 0),
							(left?.[1] ?? 0) - (right?.[1] ?? 0),
							(left?.[2] ?? 0) - (right?.[2] ?? 0),
						);
					const afterPosition = asset ? worldPositionArray(asset) : [0, 0, 0];
					const clip = test.store.animation.document.value?.clips?.[0];
					const binding = clip?.bindings?.find(
						(candidateBinding) =>
							candidateBinding.target?.kind === "scene-asset" &&
							String(candidateBinding.target?.id) === String(smoke?.assetId),
					);
					const keyFrames = [
						...new Set(
							(binding?.tracks ?? []).flatMap((track) =>
								(track.keys ?? []).map((key) => key.frame),
							),
						),
					].sort((left, right) => left - right);
					const autoKeyTargetKeys =
						test.store.animation.document.value?.autoKeyTargetKeys ?? [];
					const attempt = {
						assetId: smoke?.assetId,
						label: smoke?.label,
						handleName: smoke?.handleName,
						beforePosition: smoke?.beforePosition ?? [0, 0, 0],
						afterPosition,
						movedDistance: distance(smoke?.beforePosition, afterPosition),
						keyFrames,
						autoKeyEnabled: autoKeyTargetKeys.includes(
							\`scene-asset:\${smoke?.assetId}\`,
						),
					};
					return {
						ok:
							attempt.movedDistance > 0.001 &&
							attempt.keyFrames.includes(12) &&
							attempt.autoKeyEnabled,
						attempt,
					};
				})()`,
				{ awaitPromise: true },
			);
			attempts.push(result?.attempt ?? result);
			if (result?.ok) {
				return result.attempt;
			}
		}
	}
	const result = {
		ok: false,
		failures: [
			"Scene asset transform gizmo did not move an animated Auto Key target",
		],
		attempts,
	};
	if (!result.ok) {
		throw new Error(
			`Timeline scene asset transform smoke failed: ${JSON.stringify(result, null, 2)}`,
		);
	}
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
