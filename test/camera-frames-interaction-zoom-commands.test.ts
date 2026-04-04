import assert from "node:assert/strict";
import { createInteractionZoomCommands } from "../src/app/interaction-zoom-commands.js";

function createHarness({ zoomActive = false, measurementActive = false } = {}) {
	const calls = [];
	const interactionController = {
		isZoomToolActive: () => zoomActive,
		isInteractiveTextTarget: (target) => target === "input",
		clearZoomToolDrag: () => calls.push(["clear-zoom-drag"]),
		applyInteractionMode: (mode, options) =>
			calls.push(["apply-mode", mode, options]),
		toggleZoomTool: () => calls.push(["toggle-zoom"]),
		startZoomToolDrag: (event) => {
			calls.push(["start-drag", event]);
			return true;
		},
		handleZoomToolDragMove: (event) => calls.push(["move-drag", event]),
		handleZoomToolDragEnd: (event) => calls.push(["end-drag", event]),
	};
	const measurementController = {
		isMeasurementModeActive: () => measurementActive,
		setMeasurementMode: (enabled, options) =>
			calls.push(["measurement-mode", enabled, options]),
	};

	const commands = createInteractionZoomCommands({
		getInteractionController: () => interactionController,
		getMeasurementController: () => measurementController,
	});

	return {
		commands,
		calls,
	};
}

{
	const { commands, calls } = createHarness({ measurementActive: true });
	assert.equal(commands.isZoomToolActive(), false);
	assert.equal(commands.isInteractiveTextTarget("input"), true);
	commands.clearZoomToolDrag();
	commands.applyInteractionMode("navigate", { silent: true });
	assert.equal(commands.startZoomToolDrag("down"), true);
	commands.handleZoomToolDragMove("move");
	commands.handleZoomToolDragEnd("up");
	commands.toggleZoomTool();
	assert.deepEqual(calls, [
		["clear-zoom-drag"],
		["apply-mode", "navigate", { silent: true }],
		["start-drag", "down"],
		["move-drag", "move"],
		["end-drag", "up"],
		["measurement-mode", false, { silent: true }],
		["toggle-zoom"],
	]);
}

{
	const { commands, calls } = createHarness({
		zoomActive: true,
		measurementActive: true,
	});
	commands.toggleZoomTool();
	assert.deepEqual(calls, [["toggle-zoom"]]);
}

console.log("✅ CAMERA_FRAMES interaction zoom commands tests passed!");
