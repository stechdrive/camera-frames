import assert from "node:assert/strict";
import { createViewportEditingCommands } from "../src/app/viewport-editing-commands.js";

function createHarness(overrides = {}) {
	const store = overrides.store ?? {
		viewportSelectMode: { value: false },
		viewportReferenceImageEditMode: { value: false },
		viewportTransformMode: { value: false },
		viewportPivotEditMode: { value: false },
		referenceImages: {
			items: { value: [] },
			previewSessionVisible: { value: true },
		},
	};
	const state = overrides.state ?? {
		mode: overrides.mode ?? "camera",
	};
	const calls = [];
	const assetController = overrides.assetController ?? {
		clearSceneAssetSelection: () => calls.push(["clear-assets"]),
	};
	const cameraController = overrides.cameraController ?? {
		setMode: (mode) => calls.push(["set-mode", mode]),
		resetActiveView: () => calls.push(["reset-view"]),
	};
	const frameController = overrides.frameController ?? {
		createFrame: () => calls.push(["frame-create"]),
		toggleFrameMaskMode: (mode) => calls.push(["frame-mask", mode]),
		togglePreferredFrameMaskMode: () => calls.push(["frame-mask-toggle"]),
	};
	const interactionController = overrides.interactionController ?? {
		syncControlsToMode: () => calls.push(["sync-controls"]),
		applyNavigateInteractionMode: (options) =>
			calls.push(["apply-navigate", options]),
		closeViewportPieMenu: (options) => calls.push(["close-pie", options]),
		activateLensAdjustMode: (event) => {
			calls.push(["adjust-lens", event]);
			return true;
		},
	};
	const measurementController = overrides.measurementController ?? {
		setMeasurementMode: (enabled, options) =>
			calls.push(["measurement-mode", enabled, options]),
		isMeasurementModeActive: () => overrides.measurementModeActive ?? false,
	};
	const referenceImageController = overrides.referenceImageController ?? {
		ensureReferenceImageEditingSelection: () =>
			calls.push(["ensure-reference-selection"]),
		clearReferenceImageSelection: () => calls.push(["clear-references"]),
		setPreviewSessionVisible: (visible) =>
			calls.push(["reference-preview", visible]),
	};
	const viewportToolController = overrides.viewportToolController ?? {
		setViewportSelectMode: (enabled) => calls.push(["tool-select", enabled]),
		setViewportReferenceImageEditMode: (enabled) =>
			calls.push(["tool-reference", enabled]),
		setViewportTransformMode: (enabled) =>
			calls.push(["tool-transform", enabled]),
		setViewportPivotEditMode: (enabled) => calls.push(["tool-pivot", enabled]),
	};

	const commands = createViewportEditingCommands({
		store,
		state,
		getAssetController: () => assetController,
		getCameraController: () => cameraController,
		getFrameController: () => frameController,
		getInteractionController: () => interactionController,
		getMeasurementController: () => measurementController,
		getReferenceImageController: () => referenceImageController,
		getViewportToolController: () => viewportToolController,
		clearFrameSelection: () => calls.push(["clear-frames"]),
		clearOutputFrameSelection: () => calls.push(["clear-output-frames"]),
	});

	return {
		commands,
		store,
		state,
		calls,
	};
}

{
	const { commands, calls } = createHarness();
	commands.setViewportReferenceImageEditMode(true);
	assert.deepEqual(calls, [
		["measurement-mode", false, { silent: true }],
		["tool-reference", true],
		["sync-controls"],
		["ensure-reference-selection"],
	]);
}

{
	const { commands, calls } = createHarness({
		store: {
			viewportSelectMode: { value: true },
			viewportReferenceImageEditMode: { value: false },
			viewportTransformMode: { value: false },
			viewportPivotEditMode: { value: false },
			referenceImages: {
				items: { value: [] },
				previewSessionVisible: { value: true },
			},
		},
	});
	commands.toggleViewportSelectMode();
	assert.deepEqual(calls, [["tool-transform", false], ["sync-controls"]]);
}

{
	const { commands, calls } = createHarness({
		measurementModeActive: true,
	});
	commands.toggleMeasurementMode();
	assert.deepEqual(calls, [["measurement-mode", false, undefined]]);
}

{
	const { commands, calls } = createHarness();
	assert.equal(commands.handleViewportPieAction("tool-none"), true);
	assert.deepEqual(calls, [
		["clear-assets"],
		["clear-references"],
		["clear-frames"],
		["clear-output-frames"],
		["measurement-mode", false, { silent: true }],
		["tool-transform", false],
		["sync-controls"],
	]);
}

{
	const { commands, calls } = createHarness({
		store: {
			viewportSelectMode: { value: false },
			viewportReferenceImageEditMode: { value: false },
			viewportTransformMode: { value: false },
			viewportPivotEditMode: { value: false },
			referenceImages: {
				items: { value: [{ id: "ref-a" }] },
				previewSessionVisible: { value: true },
			},
		},
	});
	assert.equal(
		commands.handleViewportPieAction("toggle-reference-preview"),
		true,
	);
	assert.deepEqual(calls, [["reference-preview", false]]);
}

{
	const { commands, calls } = createHarness({
		state: {
			mode: "viewport",
		},
	});
	assert.equal(commands.handleViewportPieAction("frame-mask-all"), false);
	assert.deepEqual(calls, []);
}

{
	const { commands, calls } = createHarness();
	assert.equal(commands.handleViewportPieAction("toggle-view-mode"), true);
	assert.deepEqual(calls, [["set-mode", "viewport"]]);
}

{
	const { commands, calls } = createHarness();
	assert.equal(
		commands.executeViewportPieAction("adjust-lens", "pointer"),
		true,
	);
	assert.deepEqual(calls, [
		["close-pie", { silent: true }],
		["measurement-mode", false, { silent: true }],
		["adjust-lens", "pointer"],
	]);
}

console.log("✅ CAMERA_FRAMES viewport editing commands tests passed!");
