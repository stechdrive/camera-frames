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
const DEFAULT_TIMEOUT_MS = 120000;
const DEFAULT_CDP_COMMAND_TIMEOUT_MS = 120000;
const DEFAULT_MANIFEST_PATH = join(".local", "cf-test", "scenarios.json");

const DEFAULT_CF_TEST_EXPECTED = {
	activeShotCameraId: "shot-camera-1",
	cameraName: "Camera 1",
	minShotCameras: 3,
	baseFovX: 60.849,
	clippingMode: "auto",
	near: 0.1,
	widthScale: 1,
	heightScale: 1,
	viewZoom: 0.96,
	anchor: "center",
	exportName: "cf-%cam",
	exportFormat: "psd",
	exportGridOverlay: true,
	exportModelLayers: true,
	exportSplatLayers: true,
	frameCount: 1,
	activeFrameId: "frame-1",
	activeFrameName: "FRAME A",
	maskMode: "off",
	maskShape: "bounds",
	trajectoryMode: "line",
	trajectoryExportSource: "none",
	trajectoryNodeCount: 0,
};

export const DEFAULT_SCENARIOS = [
	{
		id: "ui-baseline",
		kind: "ui-smoke",
		description: "Boot the app and exercise a few rendered UI controls.",
		screenshot: true,
	},
	{
		id: "cf-test-project",
		kind: "project-state",
		description: "Load the main local current-format fixture.",
		project: "/.local/cf-test/cf-test.ssproj",
		expected: DEFAULT_CF_TEST_EXPECTED,
		screenshot: true,
	},
	{
		id: "cf-test2-summary",
		kind: "project-summary",
		description: "Load the docs/backdrop fixture and verify it is usable.",
		project: "/.local/cf-test/cf-test2.ssproj",
		expect: {
			minShotCameraCount: 1,
			minFrameCount: 1,
		},
		screenshot: true,
	},
	{
		id: "legacy-summary",
		kind: "project-summary",
		description: "Load the local legacy package fixture through the app.",
		project: "/.local/cf-test/legacy.ssproj",
		optional: true,
		expect: {
			minShotCameraCount: 1,
			minFrameCount: 1,
		},
		screenshot: true,
	},
	{
		id: "rad-full-data-swap",
		kind: "rad-ssproj",
		description:
			"Open a RAD-backed .ssproj, transform one object, then enter splat edit to force FullData swap.",
		project: "/.local/cf-test/cf-test-rad.ssproj",
		optional: true,
		assetIndex: 0,
	},
	{
		id: "trajectory-fixture",
		kind: "docs-fixture",
		description: "Open a high-risk frame trajectory help fixture.",
		fixture: "trajectory-spline",
		screenshot: true,
	},
];

const SUPPORTED_KINDS = new Set([
	"ui-smoke",
	"project-state",
	"project-summary",
	"rad-ssproj",
	"docs-fixture",
]);

const args = parseArgs(process.argv.slice(2));
const host = String(args.host ?? process.env.CF_SMOKE_HOST ?? DEFAULT_HOST);
const port = Number(args.port ?? process.env.CF_SMOKE_PORT ?? DEFAULT_PORT);
const timeoutMs = Number(args["timeout-ms"] ?? DEFAULT_TIMEOUT_MS);
const cdpCommandTimeoutMs = Number(
	args["cdp-command-timeout-ms"] ?? DEFAULT_CDP_COMMAND_TIMEOUT_MS,
);
const headed = Boolean(args.headed);
const keepBrowser = Boolean(args["keep-browser"]);
const noDevServer = Boolean(args["no-dev-server"]);
const outDir = resolve(
	repoRoot,
	String(args["out-dir"] ?? join(".local", "local-scenario-smoke")),
);
const manifestPath = resolve(
	repoRoot,
	String(args.manifest ?? DEFAULT_MANIFEST_PATH),
);
const baseUrl = `http://${host}:${port}`;

let devServer = null;
let browser = null;
let profileDir = null;
let cdp = null;
let isCleaningUp = false;

if (isMainModule()) {
	main().catch(async (error) => {
		console.error(`[local-scenarios] ${error?.stack ?? error}`);
		await cleanup().catch(() => {});
		process.exitCode = 1;
	});
}

async function main() {
	const manifest = loadScenarioManifest(manifestPath);
	const selectedIds = parseScenarioFilter(args.scenario);
	const scenarios = manifest.scenarios.filter((scenario) =>
		selectedIds ? selectedIds.has(scenario.id) : true,
	);

	if (selectedIds) {
		const knownIds = new Set(manifest.scenarios.map((scenario) => scenario.id));
		const missing = [...selectedIds].filter((id) => !knownIds.has(id));
		if (missing.length > 0) {
			throw new Error(`Unknown scenario id(s): ${missing.join(", ")}`);
		}
	}

	if (args.list) {
		console.log(
			JSON.stringify(
				{
					manifest: relativePath(manifestPath),
					source: manifest.source,
					count: scenarios.length,
					scenarios: scenarios.map((scenario) => ({
						id: scenario.id,
						kind: scenario.kind,
						optional: scenario.optional === true,
						project: scenario.project ?? null,
						fixture: scenario.fixture ?? null,
						localFile: getLocalScenarioFileStatus(scenario),
						description: scenario.description ?? "",
					})),
				},
				null,
				2,
			),
		);
		return;
	}

	if (scenarios.length === 0) {
		throw new Error("No scenarios selected.");
	}

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
	profileDir = mkdtempSync(join(tmpdir(), "camera-frames-local-scenarios-"));
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

	const verificationSource = readFileSync(
		resolve(repoRoot, "test", "ui-state-verification.js"),
		"utf8",
	);

	const results = [];
	for (const scenario of scenarios) {
		const fileStatus = getLocalScenarioFileStatus(scenario);
		if (fileStatus?.exists === false && scenario.optional === true) {
			results.push({
				id: scenario.id,
				kind: scenario.kind,
				ok: true,
				skipped: true,
				reason: `optional local file not found: ${fileStatus.path}`,
			});
			continue;
		}
		if (fileStatus?.exists === false) {
			results.push({
				id: scenario.id,
				kind: scenario.kind,
				ok: false,
				failures: [
					{
						name: "local-file-missing",
						details: fileStatus,
					},
				],
			});
			continue;
		}

		const issues = [];
		cdp = await createScenarioCdpClient(cdpPort, issues);
		const startedAt = performance.now();
		try {
			const result = await runScenario({
				scenario,
				verificationSource,
				issues,
			});
			result.durationMs = Math.round((performance.now() - startedAt) * 10) / 10;
			results.push(result);
		} finally {
			cdp?.close();
			cdp = null;
		}
	}

	const summary = {
		ok: results.every((result) => result.ok),
		manifest: relativePath(manifestPath),
		source: manifest.source,
		baseUrl,
		browser: browserPath,
		results,
		output: relativePath(join(outDir, "local-scenarios.json")),
	};
	writeFileSync(
		join(outDir, "local-scenarios.json"),
		JSON.stringify(summary, null, 2),
	);
	console.log(JSON.stringify(summary, null, 2));
	await cleanup();
	if (!summary.ok) {
		process.exitCode = 1;
	}
}

export function normalizeScenarioManifest(value, { source = "inline" } = {}) {
	const rawScenarios = Array.isArray(value?.scenarios)
		? value.scenarios
		: DEFAULT_SCENARIOS;
	const scenarios = rawScenarios.map((entry, index) =>
		normalizeScenario(entry, index),
	);
	const ids = new Set();
	for (const scenario of scenarios) {
		if (ids.has(scenario.id)) {
			throw new Error(`Duplicate scenario id: ${scenario.id}`);
		}
		ids.add(scenario.id);
	}
	return {
		version: Number(value?.version ?? 1),
		description: String(value?.description ?? ""),
		source,
		scenarios,
	};
}

export function evaluateProjectSummaryExpectations(summary, expectations = {}) {
	const checks = [];
	function check(name, ok, details = {}) {
		checks.push({ name, ok: Boolean(ok), details });
	}
	function checkEqual(name, actual, expected) {
		if (expected === undefined) return;
		check(name, actual === expected, { actual, expected });
	}
	function checkMin(name, actual, min) {
		if (min === undefined) return;
		check(name, Number(actual) >= Number(min), { actual, min });
	}
	function checkNumber(name, actual, expected, tolerance = 0.01) {
		if (expected === undefined) return;
		check(name, Math.abs(Number(actual) - Number(expected)) <= tolerance, {
			actual,
			expected,
			tolerance,
		});
	}

	checkEqual(
		"active-shot-camera-id",
		summary?.activeShotCameraId,
		expectations.activeShotCameraId,
	);
	checkEqual(
		"active-shot-camera-name",
		summary?.activeShotCameraName,
		expectations.activeShotCameraName,
	);
	checkEqual("export-format", summary?.exportFormat, expectations.exportFormat);
	checkEqual(
		"output-frame-anchor",
		summary?.outputFrame?.anchor,
		expectations.outputFrame?.anchor,
	);
	checkNumber(
		"output-frame-width-scale",
		summary?.outputFrame?.widthScale,
		expectations.outputFrame?.widthScale,
	);
	checkNumber(
		"output-frame-height-scale",
		summary?.outputFrame?.heightScale,
		expectations.outputFrame?.heightScale,
	);
	checkNumber(
		"output-frame-view-zoom",
		summary?.outputFrame?.viewZoom,
		expectations.outputFrame?.viewZoom,
	);
	checkMin(
		"shot-camera-count-min",
		summary?.shotCameraCount,
		expectations.minShotCameraCount,
	);
	checkMin("frame-count-min", summary?.frameCount, expectations.minFrameCount);
	checkEqual(
		"shot-camera-count",
		summary?.shotCameraCount,
		expectations.shotCameraCount,
	);
	checkEqual("frame-count", summary?.frameCount, expectations.frameCount);

	return {
		ok: checks.every((entry) => entry.ok),
		checks,
	};
}

function normalizeScenario(entry, index) {
	const kind = String(entry?.kind ?? "").trim();
	if (!SUPPORTED_KINDS.has(kind)) {
		throw new Error(
			`Unsupported scenario kind at index ${index}: ${JSON.stringify(kind)}`,
		);
	}
	const id = String(entry?.id ?? `${kind}-${index + 1}`).trim();
	if (!id) {
		throw new Error(`Scenario at index ${index} has an empty id.`);
	}
	const scenario = {
		...entry,
		id,
		kind,
		optional: entry?.optional === true,
		screenshot: entry?.screenshot === true,
	};
	if (
		(kind === "project-state" || kind === "project-summary") &&
		!entry.project
	) {
		throw new Error(`Scenario "${id}" requires "project".`);
	}
	if (kind === "rad-ssproj" && !entry.project) {
		throw new Error(`Scenario "${id}" requires "project".`);
	}
	if (kind === "docs-fixture" && !entry.fixture) {
		throw new Error(`Scenario "${id}" requires "fixture".`);
	}
	return scenario;
}

function loadScenarioManifest(filePath) {
	if (!existsSync(filePath)) {
		return normalizeScenarioManifest(
			{
				version: 1,
				description:
					"Built-in fallback scenarios. Create .local/cf-test/scenarios.json to customize.",
				scenarios: DEFAULT_SCENARIOS,
			},
			{ source: "built-in" },
		);
	}
	const parsed = JSON.parse(readFileSync(filePath, "utf8"));
	return normalizeScenarioManifest(parsed, {
		source: relativePath(filePath),
	});
}

function getLocalScenarioFileStatus(scenario) {
	const project = scenario.project;
	if (!project || isRemoteUrl(project)) return null;
	const filePath = resolveProjectPathToFile(project);
	if (!filePath) return null;
	return {
		path: relativePath(filePath),
		exists: existsSync(filePath),
	};
}

export function resolveProjectPathToFile(projectPath) {
	const value = String(projectPath ?? "");
	if (!value || isRemoteUrl(value)) return null;
	if (value.startsWith("/@fs/")) {
		return decodeURIComponent(value.slice("/@fs/".length)).replace(/\//g, "\\");
	}
	if (value.startsWith("/")) {
		return resolve(repoRoot, value.slice(1));
	}
	return resolve(repoRoot, value);
}

function isRemoteUrl(value) {
	return /^https?:\/\//i.test(String(value ?? ""));
}

function parseScenarioFilter(value) {
	if (!value) return null;
	const raw = Array.isArray(value) ? value.join(",") : String(value);
	const ids = raw
		.split(",")
		.map((entry) => entry.trim())
		.filter(Boolean);
	return ids.length > 0 ? new Set(ids) : null;
}

async function runScenario({ scenario, verificationSource, issues }) {
	switch (scenario.kind) {
		case "ui-smoke":
			return await runUiSmokeScenario({ scenario, issues });
		case "project-state":
			return await runProjectStateScenario({
				scenario,
				verificationSource,
				issues,
			});
		case "project-summary":
			return await runProjectSummaryScenario({
				scenario,
				verificationSource,
				issues,
			});
		case "rad-ssproj":
			return await runRadSsprojScenario({ scenario, issues });
		case "docs-fixture":
			return await runDocsFixtureScenario({ scenario, issues });
		default:
			throw new Error(`Unhandled scenario kind: ${scenario.kind}`);
	}
}

async function runUiSmokeScenario({ scenario, issues }) {
	await openApp();
	const result = await evaluate(
		cdp,
		`(async () => {
			const result = { ok: true, checks: [], observations: {} };
			const check = (name, ok, details = {}) => {
				const entry = { name, ok: Boolean(ok), details };
				result.checks.push(entry);
				if (!entry.ok) result.ok = false;
			};
			const textOf = (node) => (
				node?.getAttribute?.("aria-label") ||
				node?.getAttribute?.("title") ||
				node?.dataset?.tooltip ||
				node?.textContent ||
				""
			).trim();
			const button = (label) => Array.from(document.querySelectorAll("button,[role='button']"))
				.find((node) => textOf(node).includes(label));

			check("test-bridge-ready", Boolean(globalThis.__CF_TEST__ && globalThis.__CF_DOCS__));
			const store = globalThis.__CF_TEST__?.store;
			const beforeCount = store?.workspace?.shotCameras?.value?.length ?? null;
			const addButton = button("カメラを追加");
			check("add-camera-button-visible", Boolean(addButton), { beforeCount });
			addButton?.click();
			await new Promise((resolve) => setTimeout(resolve, 80));
			const afterCount = store?.workspace?.shotCameras?.value?.length ?? null;
			check("add-camera-updates-store", afterCount === beforeCount + 1, {
				beforeCount,
				afterCount,
			});
			const renderedCamera2 = Array.from(document.querySelectorAll("input,button,article"))
				.some((node) => textOf(node).includes("Camera 2") || String(node.value || "").includes("Camera 2"));
			check("new-camera-rendered", renderedCamera2);

			const fileButton = button("ファイル");
			check("file-button-visible", Boolean(fileButton));
			fileButton?.click();
			await new Promise((resolve) => setTimeout(resolve, 80));
			const menuText = document.body.textContent;
			check("file-menu-opens", menuText.includes("開く...") && menuText.includes("プロジェクトを書き出し"));
			document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
			await new Promise((resolve) => setTimeout(resolve, 80));
			result.observations = {
				title: document.title,
				shotCameraCount: afterCount,
				url: location.href,
			};
			return result;
		})()`,
		{ awaitPromise: true },
	);
	await maybeCaptureScenarioScreenshot(scenario, "ui-smoke");
	return finishScenarioResult(scenario, result, issues);
}

async function runProjectStateScenario({
	scenario,
	verificationSource,
	issues,
}) {
	await openApp();
	await evaluate(cdp, verificationSource, { awaitPromise: false });
	const payload = { path: scenario.project };
	if (scenario.expected && scenario.expected !== "default") {
		payload.expected = scenario.expected;
	}
	const result = await evaluate(
		cdp,
		`globalThis.__cfRunProjectSmoke(${JSON.stringify(payload)})`,
		{ awaitPromise: true },
	);
	await maybeCaptureScenarioScreenshot(scenario, "project-state");
	const checks = [
		{
			name: "project-smoke",
			ok: result?.ok === true,
			details: result,
		},
	];
	return finishScenarioResult(
		scenario,
		{
			ok: checks.every((entry) => entry.ok),
			checks,
			observations: result?.summary ?? null,
		},
		issues,
	);
}

async function runProjectSummaryScenario({
	scenario,
	verificationSource,
	issues,
}) {
	await openApp();
	await evaluate(cdp, verificationSource, { awaitPromise: false });
	const load = await evaluate(
		cdp,
		`globalThis.__cfLoadProject(${JSON.stringify(scenario.project)})`,
		{ awaitPromise: true },
	);
	const summary = await evaluate(cdp, "globalThis.__cfReadProjectSummary()", {
		awaitPromise: false,
	});
	const expectation = evaluateProjectSummaryExpectations(
		summary,
		scenario.expect ?? {},
	);
	await maybeCaptureScenarioScreenshot(scenario, "project-summary");
	const checks = [
		{
			name: "project-load",
			ok: load?.ok === true,
			details: load,
		},
		...expectation.checks,
	];
	return finishScenarioResult(
		scenario,
		{
			ok: checks.every((entry) => entry.ok),
			checks,
			observations: summary,
		},
		issues,
	);
}

async function runRadSsprojScenario({ scenario, issues }) {
	await openApp();
	await waitForExpression(
		cdp,
		"Boolean(globalThis.__CF_BROWSER_VALIDATE__?.runRadSsproj)",
		timeoutMs,
	);
	const result = await evaluate(
		cdp,
		`globalThis.__CF_BROWSER_VALIDATE__.runRadSsproj(${JSON.stringify({
			projectUrl: scenario.project,
			assetIndex: Number(scenario.assetIndex ?? 0),
		})})`,
		{ awaitPromise: true },
	);
	return finishScenarioResult(scenario, result, issues);
}

async function runDocsFixtureScenario({ scenario, issues }) {
	const url = `${baseUrl}/docs.html?fixture=${encodeURIComponent(scenario.fixture)}`;
	await navigate(cdp, url);
	await waitForExpression(
		cdp,
		"globalThis.__DOCS_FIXTURE_READY === true",
		timeoutMs,
	);
	const info = await evaluate(
		cdp,
		`({
			id: globalThis.__DOCS_FIXTURE_ID,
			known: Array.isArray(globalThis.__DOCS_FIXTURE_IDS)
				? globalThis.__DOCS_FIXTURE_IDS.includes(${JSON.stringify(scenario.fixture)})
				: false,
			count: Array.isArray(globalThis.__DOCS_FIXTURE_IDS)
				? globalThis.__DOCS_FIXTURE_IDS.length
				: 0,
			bodyChars: document.body.textContent.length,
		})`,
		{ awaitPromise: false },
	);
	await maybeCaptureScenarioScreenshot(scenario, "docs-fixture");
	const checks = [
		{
			name: "fixture-known",
			ok: info.known === true,
			details: info,
		},
		{
			name: "fixture-ready",
			ok: info.id === scenario.fixture,
			details: info,
		},
		{
			name: "fixture-nonempty",
			ok: Number(info.bodyChars) > 0,
			details: info,
		},
	];
	return finishScenarioResult(
		scenario,
		{
			ok: checks.every((entry) => entry.ok),
			checks,
			observations: info,
		},
		issues,
	);
}

async function openApp() {
	await navigate(cdp, `${baseUrl}/`);
	await waitForExpression(
		cdp,
		"Boolean(globalThis.__CF_TEST__ && globalThis.__CF_DOCS__)",
		timeoutMs,
	);
}

function finishScenarioResult(scenario, result, issues) {
	const browserIssues = issues.filter((issue) => !isIgnoredPageIssue(issue));
	const checks = Array.isArray(result?.checks) ? result.checks : [];
	const failures = [
		...checks.filter((entry) => entry.ok !== true),
		...(browserIssues.length > 0
			? [
					{
						name: "browser-page-issues",
						ok: false,
						details: { issues: browserIssues },
					},
				]
			: []),
	];
	return {
		id: scenario.id,
		kind: scenario.kind,
		ok: result?.ok === true && failures.length === 0,
		checks,
		failures,
		observations: result?.observations ?? null,
	};
}

function isIgnoredPageIssue(issue) {
	const text = String(issue?.text ?? "");
	return text.includes("Error: No target") && text.includes("readbackDepth");
}

async function maybeCaptureScenarioScreenshot(scenario, suffix) {
	if (scenario.screenshot !== true) return null;
	const filePath = join(outDir, `${safeFileName(scenario.id)}-${suffix}.png`);
	await captureScreenshot(cdp, filePath);
	return filePath;
}

function safeFileName(value) {
	return String(value).replace(/[^A-Za-z0-9_.-]+/g, "-");
}

function parseArgs(argv) {
	const parsed = {};
	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		if (!arg.startsWith("--")) continue;
		const [rawKey, inlineValue] = arg.slice(2).split("=", 2);
		if (inlineValue !== undefined) {
			parsed[rawKey] = appendArgValue(parsed[rawKey], inlineValue);
			continue;
		}
		const next = argv[i + 1];
		if (next && !next.startsWith("--")) {
			parsed[rawKey] = appendArgValue(parsed[rawKey], next);
			i++;
		} else {
			parsed[rawKey] = true;
		}
	}
	return parsed;
}

function appendArgValue(current, value) {
	if (current === undefined) return value;
	return Array.isArray(current) ? [...current, value] : [current, value];
}

async function isHttpReady(url) {
	try {
		const response = await fetch(url, { method: "GET" });
		return response.ok || response.status < 500;
	} catch {
		return false;
	}
}

async function waitForHttp(url, timeoutMsValue, label) {
	const start = Date.now();
	while (Date.now() - start < timeoutMsValue) {
		if (await isHttpReady(url)) return;
		await sleep(250);
	}
	throw new Error(`${label} did not become ready at ${url}`);
}

function startDevServer({ host: viteHost, port: vitePort }) {
	const viteBin = resolve(repoRoot, "node_modules", "vite", "bin", "vite.js");
	if (!existsSync(viteBin)) {
		throw new Error(
			`Vite CLI was not found at ${viteBin}. Run npm install first.`,
		);
	}
	const child = spawn(
		process.execPath,
		[viteBin, "--host", viteHost, "--port", String(vitePort), "--strictPort"],
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
			console.error(`[local-scenarios] Vite exited with code ${code}`);
		}
		if (signal) {
			console.error(`[local-scenarios] Vite exited with signal ${signal}`);
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

function startBrowser({
	browserPath,
	cdpPort,
	profileDir: userDataDir,
	headed,
}) {
	const browserArgs = [
		`--remote-debugging-port=${cdpPort}`,
		`--user-data-dir=${userDataDir}`,
		"--no-first-run",
		"--no-default-browser-check",
		"--disable-background-networking",
		"--disable-default-apps",
		"--disable-sync",
		"--disable-gpu",
		"--window-size=1600,900",
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
	return await new Promise((resolvePort, reject) => {
		const server = net.createServer();
		server.on("error", reject);
		server.listen(0, "127.0.0.1", () => {
			const address = server.address();
			const freePort =
				typeof address === "object" && address ? address.port : null;
			server.close(() => {
				if (freePort) resolvePort(freePort);
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

async function createScenarioCdpClient(cdpPort, issues) {
	const target = await createCdpTarget(cdpPort, "about:blank");
	const client = await CdpClient.connect(target.webSocketDebuggerUrl);
	collectPageIssues(client, issues);
	await client.send("Page.enable");
	await client.send("Runtime.enable");
	await client.send("Log.enable").catch(() => {});
	return client;
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
		await new Promise((resolveOpen, reject) => {
			this.socket.addEventListener("open", resolveOpen, { once: true });
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
		return new Promise((resolveSend, reject) => {
			const timeout = setTimeout(() => {
				this.pending.delete(id);
				reject(new Error(`CDP command timed out: ${method}`));
			}, this.commandTimeoutMs);
			this.pending.set(id, { resolve: resolveSend, reject, timeout });
			this.socket.send(JSON.stringify(payload));
		});
	}

	close() {
		this.socket?.close();
	}
}

function collectPageIssues(cdpClient, issues = []) {
	cdpClient.on("Runtime.consoleAPICalled", (event) => {
		if (event.type !== "error") return;
		issues.push({
			kind: "console.error",
			text: (event.args ?? []).map(formatRemoteObject).join(" "),
		});
	});
	cdpClient.on("Runtime.exceptionThrown", (event) => {
		issues.push({
			kind: "exception",
			text:
				event.exceptionDetails?.exception?.description ??
				event.exceptionDetails?.text ??
				"Runtime exception",
		});
	});
	cdpClient.on("Log.entryAdded", (event) => {
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

async function navigate(cdpClient, url) {
	await cdpClient.send("Page.navigate", { url });
}

async function waitForExpression(cdpClient, expression, timeoutMsValue) {
	const startedAt = Date.now();
	while (Date.now() - startedAt < timeoutMsValue) {
		const value = await evaluate(cdpClient, expression, {
			awaitPromise: false,
		});
		if (value) return;
		await sleep(100);
	}
	throw new Error(`Expression did not become true: ${expression}`);
}

async function evaluate(cdpClient, expression, { awaitPromise }) {
	const result = await cdpClient.send("Runtime.evaluate", {
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

async function captureScreenshot(cdpClient, filePath) {
	const result = await cdpClient.send("Page.captureScreenshot", {
		format: "png",
		captureBeyondViewport: false,
	});
	if (!result.data || result.data.length < 1000) {
		throw new Error(`Screenshot capture produced too little data: ${filePath}`);
	}
	writeFileSync(filePath, Buffer.from(result.data, "base64"));
}

function sleep(ms) {
	return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

function relativePath(filePath) {
	return resolve(filePath)
		.replace(`${repoRoot}\\`, "")
		.replace(`${repoRoot}/`, "");
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
		new Promise((resolveExit) => child.once("exit", resolveExit)),
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

function isMainModule() {
	return process.argv[1]
		? resolve(process.argv[1]) === fileURLToPath(import.meta.url)
		: false;
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
