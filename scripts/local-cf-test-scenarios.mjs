#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	readdirSync,
	rmSync,
	statSync,
	writeFileSync,
} from "node:fs";
import net from "node:net";
import { tmpdir } from "node:os";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { initializeCanvas, readPsd } from "ag-psd";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 5173;
const DEFAULT_TIMEOUT_MS = 120000;
const DEFAULT_CDP_COMMAND_TIMEOUT_MS = 120000;
const DEFAULT_MANIFEST_PATH = join(".local", "cf-test", "scenarios.json");
const DEFAULT_PSD_DOWNLOAD_TIMEOUT_MS = 30000;

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

const DEFAULT_PSD_EXPORT_EXPECTED = {
	minWidth: 64,
	minHeight: 64,
	minByteLength: 4096,
	minLayerCount: 2,
	requiredLayerNames: ["Render"],
	requiredAnyLayerNames: [["Frames", "FRAME"]],
	requireCompositeImageData: true,
	requireNonBlankComposite: true,
	matchStoreExportSize: true,
	goldenTolerance: {
		boundsPx: 6,
		nonZeroRatio: 0.05,
		sumRatio: 0.08,
	},
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
		id: "cf-test-psd-export",
		kind: "psd-export",
		description:
			"Load the main local fixture, export the current shot as PSD, then read it back.",
		project: "/.local/cf-test/cf-test.ssproj",
		expect: DEFAULT_PSD_EXPORT_EXPECTED,
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
	"psd-export",
	"rad-ssproj",
	"docs-fixture",
]);

initializePsdCanvasAdapter();

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
const updateGolden = Boolean(args["update-golden"]);
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
						golden: scenario.golden ?? null,
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

export function evaluatePsdExportExpectations(summary, expectations = {}) {
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

	const layerNames = new Set(summary?.layers?.map((layer) => layer.name) ?? []);
	const topLevelLayerNames = new Set(summary?.topLevelLayerNames ?? []);
	const requiredLayerNames = Array.isArray(expectations.requiredLayerNames)
		? expectations.requiredLayerNames
		: DEFAULT_PSD_EXPORT_EXPECTED.requiredLayerNames;
	const requiredTopLevelLayerNames = Array.isArray(
		expectations.requiredTopLevelLayerNames,
	)
		? expectations.requiredTopLevelLayerNames
		: [];
	const requiredAnyLayerNames = Array.isArray(
		expectations.requiredAnyLayerNames,
	)
		? expectations.requiredAnyLayerNames
		: (DEFAULT_PSD_EXPORT_EXPECTED.requiredAnyLayerNames ?? []);

	check("psd-readable", !summary?.readError, {
		readError: summary?.readError ?? null,
	});
	check("psd-signature", summary?.signature === "8BPS", {
		signature: summary?.signature,
	});
	checkMin(
		"psd-byte-length-min",
		summary?.byteLength,
		expectations.minByteLength ?? DEFAULT_PSD_EXPORT_EXPECTED.minByteLength,
	);
	checkEqual("psd-width", summary?.width, expectations.width);
	checkEqual("psd-height", summary?.height, expectations.height);
	checkMin(
		"psd-width-min",
		summary?.width,
		expectations.minWidth ?? DEFAULT_PSD_EXPORT_EXPECTED.minWidth,
	);
	checkMin(
		"psd-height-min",
		summary?.height,
		expectations.minHeight ?? DEFAULT_PSD_EXPORT_EXPECTED.minHeight,
	);
	checkMin(
		"psd-layer-count-min",
		summary?.layers?.length ?? 0,
		expectations.minLayerCount ?? DEFAULT_PSD_EXPORT_EXPECTED.minLayerCount,
	);

	for (const name of requiredLayerNames) {
		check("psd-layer-present", layerNames.has(name), {
			name,
			layers: [...layerNames],
		});
	}
	for (const entry of requiredAnyLayerNames) {
		const alternatives = Array.isArray(entry) ? entry : [entry];
		check(
			"psd-layer-present-any",
			alternatives.some((name) => layerNames.has(name)),
			{
				alternatives,
				layers: [...layerNames],
			},
		);
	}
	for (const name of requiredTopLevelLayerNames) {
		check("psd-top-level-layer-present", topLevelLayerNames.has(name), {
			name,
			topLevelLayerNames: [...topLevelLayerNames],
		});
	}

	if (
		expectations.requireCompositeImageData ??
		DEFAULT_PSD_EXPORT_EXPECTED.requireCompositeImageData
	) {
		check("psd-composite-image-data", summary?.composite?.present === true, {
			composite: summary?.composite,
		});
	}
	if (
		expectations.requireNonBlankComposite ??
		DEFAULT_PSD_EXPORT_EXPECTED.requireNonBlankComposite
	) {
		check("psd-composite-nonblank", summary?.composite?.nonBlank === true, {
			composite: summary?.composite,
		});
	}

	return {
		ok: checks.every((entry) => entry.ok),
		checks,
	};
}

export function evaluatePsdGoldenExpectations(
	actual,
	golden,
	{ tolerance = DEFAULT_PSD_EXPORT_EXPECTED.goldenTolerance } = {},
) {
	const checks = [];
	function check(name, ok, details = {}) {
		checks.push({ name, ok: Boolean(ok), details });
	}
	function checkEqual(name, actualValue, expectedValue) {
		check(name, actualValue === expectedValue, {
			actual: actualValue,
			expected: expectedValue,
		});
	}

	checkEqual("psd-golden-width", actual?.width, golden?.width);
	checkEqual("psd-golden-height", actual?.height, golden?.height);
	checkEqual(
		"psd-golden-top-level-layers",
		JSON.stringify(actual?.topLevelLayerNames ?? []),
		JSON.stringify(golden?.topLevelLayerNames ?? []),
	);

	const actualLayers = actual?.layers ?? [];
	const goldenLayers = golden?.layers ?? [];
	checkEqual(
		"psd-golden-layer-count",
		actualLayers.length,
		goldenLayers.length,
	);
	for (
		let index = 0;
		index < Math.max(actualLayers.length, goldenLayers.length);
		index++
	) {
		const actualLayer = actualLayers[index] ?? null;
		const goldenLayer = goldenLayers[index] ?? null;
		if (!actualLayer || !goldenLayer) continue;
		checkEqual(
			`psd-golden-layer-${index}-path`,
			actualLayer.path,
			goldenLayer.path,
		);
		checkEqual(
			`psd-golden-layer-${index}-depth`,
			actualLayer.depth,
			goldenLayer.depth,
		);
		checkEqual(
			`psd-golden-layer-${index}-child-count`,
			actualLayer.childCount,
			goldenLayer.childCount,
		);
		checkEqual(
			`psd-golden-layer-${index}-hidden`,
			actualLayer.hidden,
			goldenLayer.hidden,
		);
		checkImageFingerprint(
			check,
			`psd-golden-layer-${index}-image`,
			actualLayer.image,
			goldenLayer.image,
			tolerance,
		);
		checkImageFingerprint(
			check,
			`psd-golden-layer-${index}-mask`,
			actualLayer.mask,
			goldenLayer.mask,
			tolerance,
		);
	}

	checkImageFingerprint(
		check,
		"psd-golden-composite",
		actual?.composite,
		golden?.composite,
		tolerance,
	);

	const failures = checks.filter((entry) => entry.ok !== true);
	if (failures.length === 0) {
		return {
			ok: true,
			checks: [
				{
					name: "psd-golden-fingerprint",
					ok: true,
					details: {
						checked: checks.length,
						layers: actualLayers.length,
					},
				},
			],
		};
	}

	return {
		ok: false,
		checks: [
			{
				name: "psd-golden-fingerprint",
				ok: false,
				details: {
					checked: checks.length,
					failures: failures.length,
				},
			},
			...failures,
		],
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
		(kind === "project-state" ||
			kind === "project-summary" ||
			kind === "psd-export") &&
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
		case "psd-export":
			return await runPsdExportScenario({
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

async function runPsdExportScenario({ scenario, verificationSource, issues }) {
	await openApp();
	await evaluate(cdp, verificationSource, { awaitPromise: false });

	const downloadDir = join(outDir, "downloads", safeFileName(scenario.id));
	recreateDirectoryInsideOutDir(downloadDir);
	const downloadBehavior = await configureDownloadBehavior(cdp, downloadDir);
	await evaluate(cdp, createInstallDownloadCaptureExpression(), {
		awaitPromise: false,
	});

	const browserResult = await evaluate(
		cdp,
		createBrowserPsdExportExpression(scenario),
		{ awaitPromise: true },
	);

	const downloadedFile =
		(await waitForDownloadedFile(downloadDir, ".psd", {
			timeoutMs: Number(
				scenario.downloadTimeoutMs ?? DEFAULT_PSD_DOWNLOAD_TIMEOUT_MS,
			),
		})) ??
		(await writeCapturedDownloadFallback(downloadDir, {
			scenarioId: scenario.id,
		}));

	const checks = [
		...(Array.isArray(browserResult?.checks) ? browserResult.checks : []),
		{
			name: "psd-file-written",
			ok: Boolean(downloadedFile),
			details: {
				path: downloadedFile ? relativePath(downloadedFile) : null,
				downloadBehavior,
			},
		},
	];
	let psdSummary = null;
	if (downloadedFile) {
		psdSummary = inspectPsdExportFile(downloadedFile);
		const expectedSize = browserResult?.observations?.expectedSize ?? null;
		const psdExpectations = {
			...DEFAULT_PSD_EXPORT_EXPECTED,
			...(scenario.expect ?? {}),
			...(expectedSize &&
			(scenario.expect?.matchStoreExportSize ??
				DEFAULT_PSD_EXPORT_EXPECTED.matchStoreExportSize)
				? {
						width: expectedSize.width,
						height: expectedSize.height,
					}
				: {}),
		};
		const psdExpectation = evaluatePsdExportExpectations(
			psdSummary,
			psdExpectations,
		);
		checks.push(...psdExpectation.checks);
		const goldenResult = handlePsdGolden({
			scenario,
			psdSummary,
			browserResult,
			tolerance: psdExpectations.goldenTolerance,
		});
		if (goldenResult) {
			checks.push(...goldenResult.checks);
		}
	}

	await maybeCaptureScenarioScreenshot(scenario, "psd-export");
	return finishScenarioResult(
		scenario,
		{
			ok: checks.every((entry) => entry.ok),
			checks,
			observations: {
				...(browserResult?.observations ?? {}),
				downloadBehavior,
				downloadFile: downloadedFile ? relativePath(downloadedFile) : null,
				psd: compactPsdSummary(psdSummary),
			},
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

function createInstallDownloadCaptureExpression() {
	return `(() => {
		if (globalThis.__CF_DOWNLOAD_CAPTURE__) return true;
		const objectUrls = new Map();
		const downloads = [];
		const pending = [];
		const originalCreateObjectURL = URL.createObjectURL.bind(URL);
		const originalRevokeObjectURL = URL.revokeObjectURL.bind(URL);
		const originalClick = HTMLAnchorElement.prototype.click;

		URL.createObjectURL = function createObjectURL(blob) {
			const url = originalCreateObjectURL(blob);
			objectUrls.set(url, blob);
			return url;
		};
		URL.revokeObjectURL = function revokeObjectURL(url) {
			setTimeout(() => objectUrls.delete(url), 5000);
			return originalRevokeObjectURL(url);
		};
		HTMLAnchorElement.prototype.click = function click() {
			const href = String(this.href || "");
			const blob = objectUrls.get(href);
			if (blob) {
				const entry = {
					filename: this.download || "",
					type: blob.type || "",
					size: blob.size,
					href,
					byteLength: null,
					firstBytes: [],
					error: null,
				};
				const promise = blob.arrayBuffer()
					.then((buffer) => {
						entry.buffer = buffer;
						entry.byteLength = buffer.byteLength;
						entry.firstBytes = Array.from(new Uint8Array(buffer).slice(0, 16));
						return entry;
					})
					.catch((error) => {
						entry.error = error?.message ?? String(error);
						return entry;
					});
				downloads.push(entry);
				pending.push(promise);
			}
			return originalClick.call(this);
		};
		globalThis.__CF_DOWNLOAD_CAPTURE__ = {
			downloads,
			pending,
			async wait() {
				await Promise.allSettled(pending);
				return downloads.map(({ buffer, ...entry }) => entry);
			},
			async getBase64(index = 0) {
				await Promise.allSettled(pending);
				const entry = downloads[index];
				if (!entry || !entry.buffer) return null;
				const bytes = new Uint8Array(entry.buffer);
				let binary = "";
				const chunkSize = 0x8000;
				for (let offset = 0; offset < bytes.length; offset += chunkSize) {
					binary += String.fromCharCode(...bytes.slice(offset, offset + chunkSize));
				}
				return {
					filename: entry.filename,
					type: entry.type,
					size: entry.size,
					byteLength: bytes.byteLength,
					base64: btoa(binary),
				};
			},
		};
		return true;
	})()`;
}

function createBrowserPsdExportExpression(scenario) {
	const config = {
		project: scenario.project,
		exportTarget: scenario.exportTarget ?? "current",
		forceExportFormat: scenario.forceExportFormat !== false,
		settleMs: Number(scenario.settleMs ?? 500),
	};
	return `(async () => {
		const config = ${JSON.stringify(config)};
		const checks = [];
		const observations = {
			project: config.project,
			exportTarget: config.exportTarget,
		};
		const check = (name, ok, details = {}) => {
			const entry = { name, ok: Boolean(ok), details };
			checks.push(entry);
			return entry;
		};
		const test = globalThis.__CF_TEST__;
		check("test-bridge-ready", Boolean(test?.controller && test?.store));
		check("project-loader-ready", typeof globalThis.__cfLoadProject === "function");
		check(
			"download-capture-ready",
			Boolean(globalThis.__CF_DOWNLOAD_CAPTURE__?.wait),
		);
		if (!test?.controller || !test?.store || typeof globalThis.__cfLoadProject !== "function") {
			return { ok: false, checks, observations };
		}

		try {
			const load = await globalThis.__cfLoadProject(config.project);
			observations.load = load;
			check("project-load", load?.ok === true, load ?? {});
			if (load?.ok !== true) {
				return { ok: false, checks, observations };
			}

			await new Promise((resolve) =>
				setTimeout(resolve, Number.isFinite(config.settleMs) ? config.settleMs : 500),
			);
			test.controller.setExportTarget?.(config.exportTarget);
			if (config.forceExportFormat) {
				test.controller.setShotCameraExportFormat?.("psd");
			}

			const beforeDownloadCount =
				globalThis.__CF_DOWNLOAD_CAPTURE__?.downloads?.length ?? 0;
			const activeShotCamera = test.store.workspace.activeShotCamera.value;
			observations.expectedSize = {
				width: test.store.exportWidth.value,
				height: test.store.exportHeight.value,
			};
			observations.beforeExport = {
				activeShotCameraId: test.store.workspace.activeShotCameraId.value,
				activeShotCameraName: activeShotCamera?.name ?? null,
				exportFormat: test.store.shotCamera.exportFormat.value,
				exportTarget: test.store.exportOptions.target.value,
				shotCameraCount: test.store.workspace.shotCameras.value.length,
				frameCount: test.store.frames.count.value,
			};
			check("export-format-psd", test.store.shotCamera.exportFormat.value === "psd", {
				exportFormat: test.store.shotCamera.exportFormat.value,
			});

			await test.controller.downloadOutput();
			const downloads = await globalThis.__CF_DOWNLOAD_CAPTURE__?.wait?.();
			await new Promise((resolve) => setTimeout(resolve, 250));
			const afterDownloadCount =
				globalThis.__CF_DOWNLOAD_CAPTURE__?.downloads?.length ?? 0;
			const lastDownload = Array.isArray(downloads) ? downloads.at(-1) : null;
			observations.downloads = downloads ?? [];
			observations.exportSummary = test.store.exportSummary.value;
			observations.exportStatusKey = test.store.exportStatusKey.value;
			observations.statusLine = test.store.statusLine.value;
			check("download-captured", afterDownloadCount > beforeDownloadCount, {
				beforeDownloadCount,
				afterDownloadCount,
				downloads,
			});
			check("download-filename-psd", /\\.psd$/i.test(lastDownload?.filename ?? ""), {
				lastDownload,
			});
			check("export-status-ready", test.store.exportStatusKey.value === "export.ready", {
				exportStatusKey: test.store.exportStatusKey.value,
				exportSummary: test.store.exportSummary.value,
				statusLine: test.store.statusLine.value,
			});
		} catch (error) {
			check("psd-export-browser-error", false, {
				message: error?.message ?? String(error),
				stack: error?.stack ?? null,
			});
		}

		return {
			ok: checks.every((entry) => entry.ok),
			checks,
			observations,
		};
	})()`;
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

function handlePsdGolden({ scenario, psdSummary, browserResult, tolerance }) {
	if (!scenario.golden) return null;
	const goldenPath = resolveProjectPathToFile(scenario.golden);
	if (!goldenPath) {
		return {
			checks: [
				{
					name: "psd-golden-path",
					ok: false,
					details: { golden: scenario.golden },
				},
			],
		};
	}
	if (updateGolden) {
		mkdirSync(dirname(goldenPath), { recursive: true });
		writeFileSync(
			goldenPath,
			JSON.stringify(
				createPsdGoldenDocument({ scenario, psdSummary, browserResult }),
				null,
				2,
			),
		);
		return {
			checks: [
				{
					name: "psd-golden-updated",
					ok: true,
					details: { path: relativePath(goldenPath) },
				},
			],
		};
	}
	if (!existsSync(goldenPath)) {
		return {
			checks: [
				{
					name: "psd-golden-present",
					ok: false,
					details: {
						path: relativePath(goldenPath),
						hint: "Run npm run test:local-scenarios -- --scenario <id> --update-golden",
					},
				},
			],
		};
	}
	const golden = JSON.parse(readFileSync(goldenPath, "utf8"));
	return evaluatePsdGoldenExpectations(psdSummary.fingerprint, golden, {
		tolerance,
	});
}

function createPsdGoldenDocument({ scenario, psdSummary, browserResult }) {
	return {
		version: 1,
		kind: "psd-layer-fingerprint",
		scenarioId: scenario.id,
		project: scenario.project ?? null,
		generatedAt: new Date().toISOString(),
		source: {
			psdFile: psdSummary.file,
			byteLength: psdSummary.byteLength,
			export: browserResult?.observations?.beforeExport ?? null,
		},
		...psdSummary.fingerprint,
	};
}

function compactPsdSummary(summary) {
	if (!summary) return null;
	const compactImage = (image) => ({
		present: image?.present === true,
		nonBlank: image?.nonBlank === true,
		bounds: image?.bounds ?? null,
		hash: image?.hash ?? "",
	});
	return {
		file: summary.file,
		byteLength: summary.byteLength,
		signature: summary.signature,
		width: summary.width,
		height: summary.height,
		topLevelLayerNames: summary.topLevelLayerNames,
		layers: (summary.layers ?? []).map((layer) => ({
			name: layer.name,
			path: layer.path,
			depth: layer.depth,
			childCount: layer.childCount,
			hidden: layer.hidden,
			hasMask: layer.hasMask,
			left: layer.left,
			top: layer.top,
			right: layer.right,
			bottom: layer.bottom,
			image: compactImage(layer.image),
			mask: compactImage(layer.mask),
		})),
		composite: compactImage(
			summary.fingerprint?.composite ?? summary.composite,
		),
		readError: summary.readError,
	};
}

async function configureDownloadBehavior(cdpClient, downloadPath) {
	try {
		await cdpClient.send("Browser.setDownloadBehavior", {
			behavior: "allow",
			downloadPath,
			eventsEnabled: true,
		});
		return "Browser.setDownloadBehavior";
	} catch (_browserError) {
		try {
			await cdpClient.send("Page.setDownloadBehavior", {
				behavior: "allow",
				downloadPath,
			});
			return "Page.setDownloadBehavior";
		} catch (_pageError) {
			return "capture-fallback";
		}
	}
}

function recreateDirectoryInsideOutDir(directory) {
	const resolvedDirectory = resolve(directory);
	const resolvedOutDir = resolve(outDir);
	if (
		resolvedDirectory !== resolvedOutDir &&
		!resolvedDirectory.startsWith(`${resolvedOutDir}${sep}`)
	) {
		throw new Error(
			`Refusing to recreate a directory outside the local scenario output directory: ${resolvedDirectory}`,
		);
	}
	rmSync(resolvedDirectory, { recursive: true, force: true });
	mkdirSync(resolvedDirectory, { recursive: true });
}

async function waitForDownloadedFile(
	directory,
	extension,
	{ timeoutMs: waitTimeoutMs = DEFAULT_PSD_DOWNLOAD_TIMEOUT_MS } = {},
) {
	const startedAt = Date.now();
	let lastCandidate = null;
	let lastSize = -1;
	let stableCount = 0;
	while (Date.now() - startedAt < waitTimeoutMs) {
		const files = existsSync(directory)
			? readdirSync(directory)
					.filter((fileName) =>
						fileName.toLowerCase().endsWith(extension.toLowerCase()),
					)
					.filter((fileName) => !fileName.endsWith(".crdownload"))
					.map((fileName) => {
						const filePath = join(directory, fileName);
						const stats = statSync(filePath);
						return { filePath, mtimeMs: stats.mtimeMs, size: stats.size };
					})
					.sort((a, b) => b.mtimeMs - a.mtimeMs)
			: [];
		const candidate = files[0] ?? null;
		if (candidate && candidate.size > 0) {
			if (
				candidate.filePath === lastCandidate?.filePath &&
				candidate.size === lastSize
			) {
				stableCount += 1;
				if (stableCount >= 2) {
					return candidate.filePath;
				}
			} else {
				lastCandidate = candidate;
				lastSize = candidate.size;
				stableCount = 0;
			}
		}
		await sleep(250);
	}
	return null;
}

async function writeCapturedDownloadFallback(
	downloadDir,
	{ scenarioId = "psd-export" } = {},
) {
	const payload = await evaluate(
		cdp,
		`(async () => {
			const capture = globalThis.__CF_DOWNLOAD_CAPTURE__;
			if (!capture?.getBase64) return null;
			const index = Math.max(0, (capture.downloads?.length ?? 1) - 1);
			return await capture.getBase64(index);
		})()`,
		{ awaitPromise: true },
	);
	if (!payload?.base64) {
		return null;
	}
	const rawName = payload.filename || `${scenarioId}.psd`;
	const fileName = safeFileName(
		rawName.toLowerCase().endsWith(".psd") ? rawName : `${rawName}.psd`,
	);
	const filePath = join(downloadDir, fileName);
	writeFileSync(filePath, Buffer.from(payload.base64, "base64"));
	return filePath;
}

function inspectPsdExportFile(filePath) {
	const buffer = readFileSync(filePath);
	const signature = buffer.subarray(0, 4).toString("ascii");
	const baseSummary = {
		file: relativePath(filePath),
		byteLength: buffer.byteLength,
		signature,
		width: null,
		height: null,
		topLevelLayerNames: [],
		layers: [],
		composite: {
			present: false,
			byteLength: 0,
			nonBlank: false,
		},
		fingerprint: null,
		readError: null,
	};

	try {
		const psd = readPsd(buffer, {
			useImageData: true,
			skipThumbnail: true,
			skipLinkedFilesData: true,
		});
		const composite = createImageFingerprint(psd.imageData);
		const layers = flattenPsdLayers(psd.children ?? []);
		const topLevelLayerNames = (psd.children ?? []).map((layer) => layer.name);
		const fingerprint = {
			version: 1,
			width: psd.width ?? null,
			height: psd.height ?? null,
			topLevelLayerNames,
			layers,
			composite,
		};
		return {
			...baseSummary,
			width: psd.width ?? null,
			height: psd.height ?? null,
			topLevelLayerNames,
			layers,
			composite: {
				present: composite.present,
				byteLength: composite.byteLength,
				nonBlank: composite.nonBlank,
			},
			fingerprint,
		};
	} catch (error) {
		return {
			...baseSummary,
			readError: {
				message: error?.message ?? String(error),
				stack: error?.stack ?? null,
			},
		};
	}
}

function flattenPsdLayers(
	layers = [],
	depth = 0,
	result = [],
	parentPath = "",
) {
	for (const [index, layer] of layers.entries()) {
		const name = layer.name ?? "";
		const path = `${parentPath}/${index}:${name}`;
		result.push({
			name,
			path,
			depth,
			childCount: Array.isArray(layer.children) ? layer.children.length : 0,
			hidden: layer.hidden === true,
			hasMask: Boolean(layer.mask),
			left: layer.left ?? 0,
			top: layer.top ?? 0,
			right: layer.right ?? null,
			bottom: layer.bottom ?? null,
			image: createImageFingerprint(layer.imageData),
			mask: createImageFingerprint(layer.mask?.imageData),
		});
		if (Array.isArray(layer.children)) {
			flattenPsdLayers(layer.children, depth + 1, result, path);
		}
	}
	return result;
}

function createImageFingerprint(imageDataOrPixels) {
	const width = Number(imageDataOrPixels?.width ?? 0);
	const height = Number(imageDataOrPixels?.height ?? 0);
	const data = ArrayBuffer.isView(imageDataOrPixels)
		? imageDataOrPixels
		: imageDataOrPixels?.data;
	if (!data?.length || width <= 0 || height <= 0) {
		return {
			present: false,
			width,
			height,
			byteLength: data?.length ?? 0,
			nonBlank: false,
			nonZeroAlpha: 0,
			alphaSum: 0,
			rgbSum: 0,
			bounds: null,
			gridSize: 0,
			gridAlphaSums: [],
			gridRgbSums: [],
			hash: "",
		};
	}

	const gridSize = 8;
	const gridAlphaSums = new Array(gridSize * gridSize).fill(0);
	const gridRgbSums = new Array(gridSize * gridSize).fill(0);
	let nonZeroAlpha = 0;
	let alphaSum = 0;
	let rgbSum = 0;
	let minX = width;
	let minY = height;
	let maxX = -1;
	let maxY = -1;
	let hash = 0x811c9dc5;

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const offset = (y * width + x) * 4;
			const r = data[offset] ?? 0;
			const g = data[offset + 1] ?? 0;
			const b = data[offset + 2] ?? 0;
			const a = data[offset + 3] ?? 0;
			const pixelRgbSum = r + g + b;
			alphaSum += a;
			rgbSum += pixelRgbSum;
			if (a > 0) {
				nonZeroAlpha += 1;
				minX = Math.min(minX, x);
				minY = Math.min(minY, y);
				maxX = Math.max(maxX, x);
				maxY = Math.max(maxY, y);
			}
			const gridX = Math.min(gridSize - 1, Math.floor((x * gridSize) / width));
			const gridY = Math.min(gridSize - 1, Math.floor((y * gridSize) / height));
			const gridIndex = gridY * gridSize + gridX;
			gridAlphaSums[gridIndex] += a;
			gridRgbSums[gridIndex] += pixelRgbSum;
			hash = updateFnv1a(hash, r);
			hash = updateFnv1a(hash, g);
			hash = updateFnv1a(hash, b);
			hash = updateFnv1a(hash, a);
		}
	}

	return {
		present: true,
		width,
		height,
		byteLength: data.length,
		nonBlank: nonZeroAlpha > 0,
		nonZeroAlpha,
		alphaSum,
		rgbSum,
		bounds:
			nonZeroAlpha > 0
				? { left: minX, top: minY, right: maxX + 1, bottom: maxY + 1 }
				: null,
		gridSize,
		gridAlphaSums,
		gridRgbSums,
		hash: hash.toString(16).padStart(8, "0"),
	};
}

function updateFnv1a(hash, value) {
	return Math.imul((hash ^ value) >>> 0, 0x01000193) >>> 0;
}

function checkImageFingerprint(check, name, actual, expected, tolerance = {}) {
	check(`${name}-present`, actual?.present === expected?.present, {
		actual: actual?.present ?? null,
		expected: expected?.present ?? null,
	});
	if (!actual?.present || !expected?.present) {
		return;
	}
	check(`${name}-width`, actual.width === expected.width, {
		actual: actual.width,
		expected: expected.width,
	});
	check(`${name}-height`, actual.height === expected.height, {
		actual: actual.height,
		expected: expected.height,
	});
	check(`${name}-nonblank`, actual.nonBlank === expected.nonBlank, {
		actual: actual.nonBlank,
		expected: expected.nonBlank,
	});
	check(
		`${name}-non-zero-alpha`,
		isWithinRelativeTolerance(
			actual.nonZeroAlpha,
			expected.nonZeroAlpha,
			tolerance.nonZeroRatio ?? 0.05,
		),
		{
			actual: actual.nonZeroAlpha,
			expected: expected.nonZeroAlpha,
			tolerance: tolerance.nonZeroRatio ?? 0.05,
		},
	);
	check(
		`${name}-alpha-sum`,
		isWithinRelativeTolerance(
			actual.alphaSum,
			expected.alphaSum,
			tolerance.sumRatio ?? 0.08,
		),
		{
			actual: actual.alphaSum,
			expected: expected.alphaSum,
			tolerance: tolerance.sumRatio ?? 0.08,
		},
	);
	check(
		`${name}-rgb-sum`,
		isWithinRelativeTolerance(
			actual.rgbSum,
			expected.rgbSum,
			tolerance.sumRatio ?? 0.08,
		),
		{
			actual: actual.rgbSum,
			expected: expected.rgbSum,
			tolerance: tolerance.sumRatio ?? 0.08,
		},
	);
	check(
		`${name}-bounds`,
		areBoundsWithinTolerance(
			actual.bounds,
			expected.bounds,
			tolerance.boundsPx ?? 6,
		),
		{
			actual: actual.bounds,
			expected: expected.bounds,
			tolerance: tolerance.boundsPx ?? 6,
		},
	);
	check(
		`${name}-grid-alpha`,
		areArraysWithinMeanRelativeTolerance(
			actual.gridAlphaSums,
			expected.gridAlphaSums,
			tolerance.gridRatio ?? 0.15,
		),
		{
			tolerance: tolerance.gridRatio ?? 0.15,
		},
	);
	check(
		`${name}-grid-rgb`,
		areArraysWithinMeanRelativeTolerance(
			actual.gridRgbSums,
			expected.gridRgbSums,
			tolerance.gridRatio ?? 0.15,
		),
		{
			tolerance: tolerance.gridRatio ?? 0.15,
		},
	);
}

function isWithinRelativeTolerance(actual, expected, tolerance) {
	const denominator = Math.max(1, Math.abs(Number(expected)));
	return Math.abs(Number(actual) - Number(expected)) / denominator <= tolerance;
}

function areBoundsWithinTolerance(actual, expected, tolerancePx) {
	if (!actual || !expected) {
		return actual === expected;
	}
	return ["left", "top", "right", "bottom"].every(
		(key) =>
			Math.abs(Number(actual[key]) - Number(expected[key])) <= tolerancePx,
	);
}

function areArraysWithinMeanRelativeTolerance(actual, expected, tolerance) {
	const actualValues = actual ?? [];
	const expectedValues = expected ?? [];
	if (actualValues.length !== expectedValues.length) return false;
	if (actualValues.length === 0) return true;
	let errorSum = 0;
	for (let index = 0; index < actualValues.length; index++) {
		const denominator = Math.max(1, Math.abs(Number(expectedValues[index])));
		errorSum +=
			Math.abs(Number(actualValues[index]) - Number(expectedValues[index])) /
			denominator;
	}
	return errorSum / actualValues.length <= tolerance;
}

function initializePsdCanvasAdapter() {
	initializeCanvas(
		(width, height) => ({
			width,
			height,
			getContext() {
				return {
					createImageData(nextWidth, nextHeight) {
						return {
							width: nextWidth,
							height: nextHeight,
							data: new Uint8ClampedArray(nextWidth * nextHeight * 4),
						};
					},
				};
			},
		}),
		(width, height) => ({
			width,
			height,
			data: new Uint8ClampedArray(width * height * 4),
		}),
	);
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
