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
			],
		},
		{ source: "unit" },
	);
	assert.equal(manifest.source, "unit");
	assert.equal(manifest.scenarios.length, 2);
	assert.equal(manifest.scenarios[0].id, "ui");
	assert.equal(manifest.scenarios[1].optional, false);
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
