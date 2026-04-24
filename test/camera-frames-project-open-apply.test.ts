import assert from "node:assert/strict";
import { createProjectOpenApply } from "../src/app/project-open-apply.js";

{
	const calls = [];
	const assetController = {
		clearScene: () => calls.push(["clear-scene"]),
		loadSources: async (sources, replace, options) => {
			calls.push(["load-sources", sources, replace, options?.concurrency]);
			options?.onProgress?.("load", "Loading");
		},
	};
	const historyController = {
		clearHistory: () => calls.push(["clear-history"]),
	};
	const applyOpenedProject = createProjectOpenApply({
		getAssetController: () => assetController,
		applySavedProjectState: (project) => calls.push(["apply-project", project]),
		getHistoryController: () => historyController,
		setStatus: (status) => calls.push(["status", status]),
		t: (key) => key,
	});

	await applyOpenedProject(
		{
			assetEntries: [{ source: "asset-a" }, { source: "asset-b" }],
			project: { id: "project-a" },
			assetLoadConcurrency: 1,
			materializeReferenceImages: async () =>
				calls.push(["materialize-reference-images"]),
		},
		{
			loadedStatus: "Loaded",
			onAssetProgress: (phase, detail) =>
				calls.push(["progress", phase, detail]),
		},
	);

	assert.deepEqual(calls, [
		["clear-scene"],
		["load-sources", ["asset-a", "asset-b"], false, 1],
		["progress", "load", "Loading"],
		["progress", "apply", "overlay.importDetailApply"],
		["materialize-reference-images"],
		["apply-project", { id: "project-a" }],
		["clear-history"],
		["status", "Loaded"],
	]);
}

{
	const calls = [];
	const applyOpenedProject = createProjectOpenApply({
		getAssetController: () => ({
			clearScene: () => calls.push(["clear-scene"]),
			loadSources: async () => calls.push(["load-sources"]),
		}),
		applySavedProjectState: (project) => calls.push(["apply-project", project]),
		getHistoryController: () => ({
			clearHistory: () => calls.push(["clear-history"]),
		}),
		setStatus: (status) => calls.push(["status", status]),
		t: (key) => key,
	});

	await applyOpenedProject({
		assetEntries: [],
		project: { id: "project-b" },
	});

	assert.deepEqual(calls, [
		["clear-scene"],
		["apply-project", { id: "project-b" }],
		["clear-history"],
		["status", "status.projectLoaded"],
	]);
}

{
	const calls = [];
	const applyOpenedProject = createProjectOpenApply({
		getAssetController: () => ({
			clearScene: () => calls.push(["clear-scene"]),
			loadSources: async () => calls.push(["load-sources"]),
		}),
		applySavedProjectState: (project) => calls.push(["apply-project", project]),
		getHistoryController: () => ({
			clearHistory: () => calls.push(["clear-history"]),
		}),
		setStatus: (status) => calls.push(["status", status]),
		t: (key) => key,
	});

	await applyOpenedProject(
		{
			assetEntries: [],
			project: { id: "project-c" },
			materializeReferenceImages: async () =>
				calls.push(["materialize-reference-images"]),
		},
		{
			skipApplyState: true,
		},
	);

	assert.deepEqual(calls, [
		["clear-scene"],
		["status", "status.projectLoaded"],
	]);
}

console.log("✅ CAMERA_FRAMES project open apply tests passed!");
