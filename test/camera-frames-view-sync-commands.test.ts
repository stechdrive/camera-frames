import assert from "node:assert/strict";
import { createViewSyncCommands } from "../src/app/view-sync-commands.js";

function createHarness(overrides = {}) {
	const state = overrides.state ?? { mode: "camera" };
	const calls = [];
	const guideOverlay = overrides.guideOverlay ?? {
		applyState: (nextState) => calls.push(["apply-guide", nextState]),
		setViewportOrthographicGridState: (nextState) =>
			calls.push(["ortho-grid", nextState]),
	};
	const outputFrameController = overrides.outputFrameController ?? {
		updateOutputFrameOverlay: () => {
			calls.push(["update-output-overlay"]);
			return "overlay-result";
		},
	};
	const uiSyncController = overrides.uiSyncController ?? {
		updateDropHint: () => calls.push(["drop-hint"]),
		updateSceneSummary: () => calls.push(["scene-summary"]),
		updateCameraSummary: () => calls.push(["camera-summary"]),
	};
	const viewportProjectionController =
		overrides.viewportProjectionController ?? {
			getViewportOrthographicPreviewGridPlane: () => "xy",
		};

	const commands = createViewSyncCommands({
		state,
		guideOverlay,
		getActiveShotCameraDocument: () =>
			overrides.documentState ?? {
				exportSettings: {
					exportGridLayerMode: "bottom",
				},
			},
		getOutputFrameController: () => outputFrameController,
		getUiSyncController: () => uiSyncController,
		getViewportProjectionController: () => viewportProjectionController,
		safeSyncReferenceImagePreview: () => calls.push(["sync-reference-preview"]),
	});

	return {
		commands,
		calls,
	};
}

{
	const { commands, calls } = createHarness();
	assert.equal(commands.updateOutputFrameOverlay(), "overlay-result");
	assert.deepEqual(calls, [
		["update-output-overlay"],
		["sync-reference-preview"],
	]);
}

{
	const { commands, calls } = createHarness();
	commands.updateDropHint();
	commands.updateSceneSummary();
	commands.updateCameraSummary();
	assert.deepEqual(calls, [
		["drop-hint"],
		["scene-summary"],
		["camera-summary"],
	]);
}

{
	const { commands, calls } = createHarness({
		state: { mode: "viewport" },
		documentState: {
			exportSettings: {
				exportGridLayerMode: "overlay",
			},
		},
	});
	commands.syncGuideOverlayState();
	assert.deepEqual(calls, [
		[
			"apply-guide",
			{
				gridVisible: false,
				eyeLevelVisible: true,
				gridLayerMode: "overlay",
			},
		],
		["ortho-grid", { visible: true, plane: "xy" }],
	]);
}

{
	const { commands, calls } = createHarness({
		state: { mode: "camera" },
	});
	commands.syncGuideOverlayState(undefined, {
		gridVisible: false,
		eyeLevelVisible: false,
	});
	assert.deepEqual(calls, [
		[
			"apply-guide",
			{
				gridVisible: false,
				eyeLevelVisible: false,
				gridLayerMode: "bottom",
			},
		],
		["ortho-grid", { visible: false, plane: null }],
	]);
}

console.log("✅ CAMERA_FRAMES view sync commands tests passed!");
