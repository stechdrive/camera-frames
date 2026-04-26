import assert from "node:assert/strict";

// The runner is a local-maintenance script, but its manifest validation should
// stay covered by the regular test suite so scenario files fail predictably.
const runner = await import("../scripts/local-cf-test-scenarios.mjs");

{
	const manifest = runner.normalizeScenarioManifest(
		{
			version: 1,
			scenarios: [
				{
					id: "ui",
					kind: "ui-smoke",
				},
				{
					id: "project",
					kind: "project-summary",
					project: "/.local/cf-test/example.ssproj",
					expect: { minShotCameraCount: 1 },
				},
				{
					id: "psd",
					kind: "psd-export",
					project: "/.local/cf-test/example.ssproj",
					expect: { requiredLayerNames: ["Render"] },
				},
			],
		},
		{ source: "unit" },
	);
	assert.equal(manifest.source, "unit");
	assert.equal(manifest.scenarios.length, 3);
	assert.equal(manifest.scenarios[0].id, "ui");
	assert.equal(manifest.scenarios[1].optional, false);
	assert.equal(manifest.scenarios[2].kind, "psd-export");
}

{
	const manifestWithInvalidKind = {
		scenarios: [{ id: "bad", kind: "missing-kind" }],
	};
	assert.throws(
		() => runner.normalizeScenarioManifest(manifestWithInvalidKind),
		/Unsupported scenario kind/,
	);
	const manifestWithDuplicateIds = {
		scenarios: [
			{ id: "dup", kind: "ui-smoke" },
			{ id: "dup", kind: "ui-smoke" },
		],
	};
	assert.throws(
		() => runner.normalizeScenarioManifest(manifestWithDuplicateIds),
		/Duplicate scenario id/,
	);
	const manifestWithoutProject = {
		scenarios: [{ id: "project", kind: "project-summary" }],
	};
	assert.throws(
		() => runner.normalizeScenarioManifest(manifestWithoutProject),
		/requires "project"/,
	);
}

{
	const result = runner.evaluateProjectSummaryExpectations(
		{
			activeShotCameraId: "shot-camera-1",
			activeShotCameraName: "Camera 1",
			shotCameraCount: 3,
			frameCount: 2,
			exportFormat: "psd",
			outputFrame: {
				widthScale: 1,
				heightScale: 1,
				viewZoom: 0.7,
				anchor: "center",
			},
		},
		{
			activeShotCameraId: "shot-camera-1",
			activeShotCameraName: "Camera 1",
			minShotCameraCount: 1,
			minFrameCount: 2,
			exportFormat: "psd",
			outputFrame: {
				widthScale: 1,
				heightScale: 1,
				viewZoom: 0.7,
				anchor: "center",
			},
		},
	);
	assert.equal(result.ok, true);
	assert.equal(
		result.checks.every((entry) => entry.ok),
		true,
	);
}

{
	const result = runner.evaluateProjectSummaryExpectations(
		{ shotCameraCount: 0, frameCount: 0 },
		{ minShotCameraCount: 1, minFrameCount: 1 },
	);
	assert.equal(result.ok, false);
	assert.equal(result.checks.length, 2);
	assert.deepEqual(
		result.checks.map((entry) => [entry.name, entry.ok]),
		[
			["shot-camera-count-min", false],
			["frame-count-min", false],
		],
	);
}

{
	const result = runner.evaluatePsdExportExpectations(
		{
			file: ".local/local-scenario-smoke/downloads/cf-test.psd",
			byteLength: 8192,
			signature: "8BPS",
			width: 1280,
			height: 720,
			topLevelLayerNames: ["Background", "Render", "Frames"],
			layers: [
				{ name: "Background", depth: 0, childCount: 0 },
				{ name: "Render", depth: 0, childCount: 0 },
				{ name: "Frames", depth: 0, childCount: 1 },
				{ name: "FRAME A", depth: 1, childCount: 0 },
			],
			composite: {
				present: true,
				byteLength: 1280 * 720 * 4,
				nonBlank: true,
			},
			readError: null,
		},
		{
			width: 1280,
			height: 720,
			requiredLayerNames: ["Render"],
			requiredAnyLayerNames: [["Frames", "FRAME"]],
			requiredTopLevelLayerNames: ["Background"],
		},
	);
	assert.equal(result.ok, true);
}

{
	const result = runner.evaluatePsdExportExpectations(
		{
			byteLength: 0,
			signature: "BROK",
			width: 0,
			height: 0,
			topLevelLayerNames: [],
			layers: [],
			composite: {
				present: false,
				byteLength: 0,
				nonBlank: false,
			},
			readError: { message: "bad psd" },
		},
		{ requiredLayerNames: ["Render"] },
	);
	assert.equal(result.ok, false);
	assert.equal(
		result.checks.some((entry) => entry.name === "psd-readable" && !entry.ok),
		true,
	);
}

{
	const image = {
		present: true,
		width: 2,
		height: 2,
		byteLength: 16,
		nonBlank: true,
		nonZeroAlpha: 4,
		alphaSum: 1020,
		rgbSum: 120,
		bounds: { left: 0, top: 0, right: 2, bottom: 2 },
		gridSize: 1,
		gridAlphaSums: [1020],
		gridRgbSums: [120],
		hash: "ignored",
	};
	const golden = {
		version: 1,
		width: 1280,
		height: 720,
		topLevelLayerNames: ["Render"],
		layers: [
			{
				path: "/0:Render",
				name: "Render",
				depth: 0,
				childCount: 0,
				hidden: false,
				image,
				mask: { present: false },
			},
		],
		composite: image,
	};
	const actual = {
		...golden,
		layers: [
			{
				...golden.layers[0],
				image: { ...image, alphaSum: 1000, rgbSum: 122 },
			},
		],
		composite: { ...image, nonZeroAlpha: 4 },
	};
	const result = runner.evaluatePsdGoldenExpectations(actual, golden, {
		tolerance: {
			boundsPx: 1,
			nonZeroRatio: 0.05,
			sumRatio: 0.08,
			gridRatio: 0.15,
		},
	});
	assert.equal(result.ok, true);
}

{
	const golden = {
		width: 1,
		height: 1,
		topLevelLayerNames: ["Render"],
		layers: [
			{
				path: "/0:Render",
				depth: 0,
				childCount: 0,
				hidden: false,
				image: { present: true, width: 1, height: 1 },
				mask: { present: true, width: 1, height: 1 },
			},
		],
		composite: { present: true, width: 1, height: 1 },
	};
	const actual = {
		...golden,
		layers: [
			{
				...golden.layers[0],
				mask: { present: false },
			},
		],
	};
	const result = runner.evaluatePsdGoldenExpectations(actual, golden);
	assert.equal(result.ok, false);
	assert.equal(
		result.checks.some(
			(entry) => entry.name === "psd-golden-layer-0-mask-present" && !entry.ok,
		),
		true,
	);
}

{
	const resolved = runner.resolveProjectPathToFile(
		"/.local/cf-test/example.ssproj",
	);
	assert.equal(
		resolved.endsWith("\\.local\\cf-test\\example.ssproj") ||
			resolved.endsWith("/.local/cf-test/example.ssproj"),
		true,
	);
	assert.equal(
		runner.resolveProjectPathToFile("https://example.test/a.ssproj"),
		null,
	);
}

console.log("✅ CAMERA_FRAMES local scenario runner tests passed!");
