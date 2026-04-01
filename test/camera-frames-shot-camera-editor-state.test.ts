import assert from "node:assert/strict";
import { createShotCameraEditorStateController } from "../src/app/shot-camera-editor-state.js";

function createHarness() {
	const calls = {
		restoreReferenceImageEditorState: [],
		syncFrameSelectionTransformState: 0,
		updateUi: 0,
	};
	const store = {
		frames: {
			selectionActive: { value: true },
			selectedIds: { value: ["frame-a", "frame-b"] },
			selectionAnchor: { value: { x: 10, y: 20 } },
			selectionBoxLogical: { value: { left: 1, top: 2, width: 3, height: 4 } },
		},
		workspace: {
			activeShotCameraId: { value: "shot-a" },
			shotCameras: { value: [{ id: "shot-a" }, { id: "shot-b" }] },
		},
	};
	const state = {
		outputFrameSelected: true,
	};
	const frameController = {
		getActiveFrames: () => [{ id: "frame-a" }, { id: "frame-b" }],
		syncFrameSelectionTransformState: () => {
			calls.syncFrameSelectionTransformState += 1;
		},
	};
	const referenceImageController = {
		captureReferenceImageEditorState: () => ({
			selectedItemIds: ["ref-a"],
			selectedItemId: "ref-a",
			selectedAssetId: "asset-a",
			selectionAnchor: { x: 5, y: 6 },
			selectionBoxLogical: { left: 7, top: 8, width: 9, height: 10 },
			rememberedSelectedItemIds: ["ref-a", "ref-b"],
			rememberedActiveItemId: "ref-b",
		}),
		restoreReferenceImageEditorState: (nextState, options) => {
			calls.restoreReferenceImageEditorState.push({ nextState, options });
		},
	};
	const controller = createShotCameraEditorStateController({
		store,
		state,
		getReferenceImageController: () => referenceImageController,
		getFrameController: () => frameController,
		updateUi: () => {
			calls.updateUi += 1;
		},
	});

	return {
		store,
		state,
		calls,
		frameController,
		referenceImageController,
		controller,
	};
}

{
	const harness = createHarness();
	const captured = harness.controller.captureActiveShotCameraEditorState();

	assert.deepEqual(captured, {
		frameSelectionActive: true,
		frameSelectedIds: ["frame-a", "frame-b"],
		frameSelectionAnchor: { x: 10, y: 20 },
		frameSelectionBoxLogical: { left: 1, top: 2, width: 3, height: 4 },
		outputFrameSelected: true,
		referenceImageEditor: {
			selectedItemIds: ["ref-a"],
			selectedItemId: "ref-a",
			selectedAssetId: "asset-a",
			selectionAnchor: { x: 5, y: 6 },
			selectionBoxLogical: { left: 7, top: 8, width: 9, height: 10 },
			rememberedSelectedItemIds: ["ref-a", "ref-b"],
			rememberedActiveItemId: "ref-b",
		},
	});
}

{
	const harness = createHarness();
	harness.controller.clearActiveShotCameraEditorState();

	assert.equal(harness.store.frames.selectionActive.value, false);
	assert.deepEqual(harness.store.frames.selectedIds.value, []);
	assert.equal(harness.store.frames.selectionAnchor.value, null);
	assert.equal(harness.store.frames.selectionBoxLogical.value, null);
	assert.equal(harness.state.outputFrameSelected, false);
	assert.deepEqual(harness.calls.restoreReferenceImageEditorState, [
		{
			nextState: null,
			options: { preservePreviewSessionVisible: true },
		},
	]);
}

{
	const harness = createHarness();
	harness.controller.storeShotCameraEditorState("shot-b");
	harness.store.frames.selectionActive.value = false;
	harness.store.frames.selectedIds.value = [];
	harness.store.frames.selectionAnchor.value = null;
	harness.store.frames.selectionBoxLogical.value = null;
	harness.state.outputFrameSelected = false;
	harness.controller.restoreShotCameraEditorState("shot-b");

	assert.equal(harness.store.frames.selectionActive.value, true);
	assert.deepEqual(harness.store.frames.selectedIds.value, [
		"frame-a",
		"frame-b",
	]);
	assert.deepEqual(harness.store.frames.selectionAnchor.value, {
		x: 10,
		y: 20,
	});
	assert.deepEqual(harness.store.frames.selectionBoxLogical.value, {
		left: 1,
		top: 2,
		width: 3,
		height: 4,
	});
	assert.equal(harness.state.outputFrameSelected, false);
	assert.equal(harness.calls.syncFrameSelectionTransformState, 1);
	assert.deepEqual(harness.calls.restoreReferenceImageEditorState.at(-1), {
		nextState: {
			selectedItemIds: ["ref-a"],
			selectedItemId: "ref-a",
			selectedAssetId: "asset-a",
			selectionAnchor: { x: 5, y: 6 },
			selectionBoxLogical: { left: 7, top: 8, width: 9, height: 10 },
			rememberedSelectedItemIds: ["ref-a", "ref-b"],
			rememberedActiveItemId: "ref-b",
		},
		options: { preservePreviewSessionVisible: true },
	});
}

{
	const harness = createHarness();
	harness.controller.restoreShotCameraEditorState("shot-a", {
		fallbackSnapshot: {
			activeShotCameraId: "shot-a",
			frameSelectionActive: true,
			frameSelectedIds: ["frame-a", "missing-frame"],
			frameSelectionAnchor: { x: 1, y: 2 },
			frameSelectionBoxLogical: { left: 3, top: 4, width: 5, height: 6 },
			outputFrameSelected: true,
			referenceImageEditor: {
				selectedItemIds: ["fallback-item"],
				selectedItemId: "fallback-item",
				selectedAssetId: "fallback-asset",
				selectionAnchor: { x: 9, y: 9 },
				selectionBoxLogical: { left: 8, top: 8, width: 7, height: 7 },
				rememberedSelectedItemIds: ["fallback-item"],
				rememberedActiveItemId: "fallback-item",
			},
		},
	});

	assert.equal(harness.store.frames.selectionActive.value, true);
	assert.deepEqual(harness.store.frames.selectedIds.value, ["frame-a"]);
	assert.equal(harness.store.frames.selectionAnchor.value, null);
	assert.equal(harness.store.frames.selectionBoxLogical.value, null);
	assert.equal(harness.state.outputFrameSelected, false);
}

{
	const harness = createHarness();
	harness.controller.storeShotCameraEditorState("shot-a");
	harness.store.workspace.shotCameras.value = [{ id: "shot-b" }];
	harness.store.workspace.activeShotCameraId.value = "shot-b";
	const captured = harness.controller.captureShotCameraEditorStates();

	assert.deepEqual(Object.keys(captured), ["shot-b"]);
	assert.deepEqual(captured["shot-b"].frameSelectedIds, ["frame-a", "frame-b"]);
}

{
	const harness = createHarness();
	harness.controller.restoreShotCameraEditorStates({
		"": { frameSelectedIds: ["ignored"] },
		"shot-a": {
			frameSelectionActive: false,
			frameSelectedIds: [],
			frameSelectionAnchor: null,
			frameSelectionBoxLogical: null,
			outputFrameSelected: true,
			referenceImageEditor: null,
		},
		"stale-shot": {
			frameSelectionActive: true,
			frameSelectedIds: ["frame-a"],
			frameSelectionAnchor: null,
			frameSelectionBoxLogical: null,
			outputFrameSelected: false,
			referenceImageEditor: null,
		},
	});
	harness.controller.restoreAfterShotCameraSwitch("shot-a");

	assert.equal(harness.store.frames.selectionActive.value, false);
	assert.deepEqual(harness.store.frames.selectedIds.value, []);
	assert.equal(harness.state.outputFrameSelected, true);
	assert.equal(harness.calls.updateUi, 1);
}

console.log("✅ CAMERA_FRAMES shot camera editor state tests passed!");
