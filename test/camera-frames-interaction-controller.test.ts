import assert from "node:assert/strict";
import { createInteractionController } from "../src/controllers/interaction-controller.js";

function createHarness() {
	const updateUiCalls = [];
	const store = {
		interactionMode: { value: "navigate" },
		viewportPieMenu: { value: null },
		viewportLensHud: { value: null },
		viewportRollHud: { value: null },
	};
	const state = {
		interactionMode: "navigate",
		mode: "camera",
	};
	const viewportShell = {
		classList: {
			add() {},
			remove() {},
		},
		releasePointerCapture() {},
	};
	const fpsMovement = {
		enable: false,
		keydown: {},
		keycode: {},
	};
	const pointerControls = {
		enable: true,
		moveVelocity: { set() {}, lengthSq: () => 0 },
		rotateVelocity: { set() {}, lengthSq: () => 0 },
		scroll: { set() {}, lengthSq: () => 0 },
	};
	const controller = createInteractionController({
		store,
		state,
		viewportShell,
		assetController: null,
		fpsMovement,
		pointerControls,
		getActiveCamera: () => null,
		workspacePaneCamera: "camera",
		t: (key) => key,
		setStatus: () => {},
		updateUi: (options) => {
			updateUiCalls.push(options ?? null);
		},
		getViewZoomFactor: () => 1,
		setViewZoomFactor: () => {},
		getShotCameraBaseFovX: () => 55,
		setShotCameraBaseFovXLive: () => {},
		getViewportBaseFovX: () => 55,
		setViewportBaseFovXLive: () => {},
		getShotCameraRollAxisWorld: () => null,
		getShotCameraRollAngleDegrees: () => 0,
		applyActiveShotCameraRoll: () => false,
		beginHistoryTransaction: () => false,
		commitHistoryTransaction: () => false,
		cancelHistoryTransaction: () => {},
	});

	return {
		controller,
		state,
		store,
		updateUiCalls,
	};
}

{
	const harness = createHarness();
	harness.controller.toggleZoomTool();
	assert.equal(harness.state.interactionMode, "zoom");
	assert.deepEqual(harness.updateUiCalls.at(-1), {
		syncProjectPresentation: false,
	});
}

{
	const harness = createHarness();
	harness.controller.syncControlsToMode();
	assert.deepEqual(harness.updateUiCalls.at(-1), {
		syncProjectPresentation: false,
	});
}
