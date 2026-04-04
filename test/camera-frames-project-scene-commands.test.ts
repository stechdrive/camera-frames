import assert from "node:assert/strict";
import { createProjectSceneCommands } from "../src/app/project-scene-commands.js";

function createHarness(overrides = {}) {
	const store = overrides.store ?? {
		selectedSceneAssetId: { value: overrides.selectedSceneAssetId ?? null },
	};
	const calls = [];
	const assetController = overrides.assetController ?? {
		resetAssetWorkingPivot: (assetId) => calls.push(["reset-pivot", assetId]),
		clearSceneAssetSelection: () => calls.push(["clear-selection"]),
		clearScene: () => calls.push(["clear-scene"]),
	};
	const lightingController = overrides.lightingController ?? {
		resetLighting: () => calls.push(["reset-lighting"]),
	};
	const measurementController = overrides.measurementController ?? {
		clearMeasurementSession: (options) =>
			calls.push(["clear-measurement", options]),
	};
	const projectController = overrides.projectController ?? {
		startNewProject: () => calls.push(["start-project"]),
		saveProject: () => calls.push(["save-project"]),
		exportProject: () => calls.push(["export-project"]),
	};
	const referenceImageController = overrides.referenceImageController ?? {
		clearReferenceImages: () => calls.push(["clear-references"]),
	};
	const viewportToolController = overrides.viewportToolController ?? {
		setViewportTransformMode: (enabled) =>
			calls.push(["set-transform-mode", enabled]),
	};

	const commands = createProjectSceneCommands({
		store,
		getAssetController: () => assetController,
		getLightingController: () => lightingController,
		getMeasurementController: () => measurementController,
		getProjectController: () => projectController,
		getReferenceImageController: () => referenceImageController,
		getViewportToolController: () => viewportToolController,
	});

	return {
		commands,
		calls,
	};
}

{
	const { commands, calls } = createHarness({
		selectedSceneAssetId: "asset-a",
	});
	commands.resetSelectedAssetWorkingPivot();
	assert.deepEqual(calls, [["reset-pivot", "asset-a"]]);
}

{
	const { commands, calls } = createHarness();
	commands.resetSelectedAssetWorkingPivot();
	assert.deepEqual(calls, []);
}

{
	const { commands, calls } = createHarness();
	commands.clearSceneAssetSelection();
	assert.deepEqual(calls, [["clear-selection"]]);
}

{
	const { commands, calls } = createHarness();
	commands.clearScene();
	assert.deepEqual(calls, [
		["clear-measurement", { keepActive: false }],
		["set-transform-mode", false],
		["clear-references"],
		["reset-lighting"],
		["clear-scene"],
	]);
}

{
	const { commands, calls } = createHarness();
	commands.startNewProject();
	commands.saveProject();
	commands.exportProject();
	assert.deepEqual(calls, [
		["start-project"],
		["save-project"],
		["export-project"],
	]);
}

console.log("✅ CAMERA_FRAMES project scene commands tests passed!");
