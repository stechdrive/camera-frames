import assert from "node:assert/strict";
import { createProjectControllerBindings } from "../src/app/project-controller-bindings.js";

{
	const calls = [];
	const bindings = createProjectControllerBindings({
		store: { id: "store" },
		assetController: {
			id: "asset",
			clearScene: () => calls.push("clear-scene"),
		},
		applySavedProjectState: () => calls.push("apply-saved"),
		applyOpenedProject: () => calls.push("apply-opened"),
		captureShotCameraEditorStates: () => ({ cameras: 1 }),
		restoreShotCameraEditorStates: (editorState) =>
			calls.push(["restore-states", editorState]),
		restoreShotCameraEditorState: (cameraId) =>
			calls.push(["restore-state", cameraId]),
		getAnimationController: () => ({
			captureTimelineEditorState: () => ({ timelineFrame: 12 }),
			restoreTimelineEditorState: (editorState) =>
				calls.push(["restore-animation-editor", editorState]),
		}),
		getActiveShotCameraId: () => "camera-2",
		measurementController: {
			clearMeasurementSession: (options) =>
				calls.push(["clear-measurement", options]),
		},
		referenceImageController: {
			clearReferenceImages: () => calls.push("clear-reference"),
		},
		lightingController: {
			resetLighting: () => calls.push("reset-lighting"),
		},
		viewportToolController: {
			setViewportTransformMode: (value) =>
				calls.push(["set-transform-mode", value]),
		},
		resetWorkspaceToDefaults: () => calls.push("reset-workspace"),
		buildProjectFilename: () => "project.ssproj",
		captureProjectState: () => ({ project: true }),
		historyController: {
			clearHistory: () => calls.push("clear-history"),
		},
		updateUi: () => calls.push("ui"),
		setStatus: () => calls.push("status"),
		t: (value) => `t:${value}`,
	});

	assert.equal(bindings.store.id, "store");
	assert.equal(bindings.assetController.id, "asset");
	assert.deepEqual(bindings.captureWorkingEditorState(), {
		shotCameraEditorStates: { cameras: 1 },
		animationEditorState: { timelineFrame: 12 },
	});

	bindings.applyWorkingEditorState({
		shotCameraEditorStates: { hello: "world" },
		animationEditorState: { timelineFrame: 10 },
	});
	assert.deepEqual(calls[0], ["restore-states", { hello: "world" }]);
	assert.deepEqual(calls[1], [
		"restore-animation-editor",
		{ timelineFrame: 10 },
	]);
	assert.deepEqual(calls[2], ["restore-state", "camera-2"]);

	bindings.clearProjectSidecars();
	assert.deepEqual(calls[3], ["clear-measurement", { keepActive: false }]);
	assert.equal(calls[4], "clear-reference");
	assert.equal(calls[5], "reset-lighting");

	bindings.resetProjectWorkspace();
	assert.deepEqual(calls[6], ["set-transform-mode", false]);
	assert.equal(calls[7], "reset-workspace");
	assert.equal(calls[8], "clear-reference");
	assert.equal(calls[9], "reset-lighting");
	assert.equal(calls[10], "clear-scene");

	assert.equal(bindings.flushDirtySplatSources(), false);
	assert.equal(bindings.buildProjectFilename(), "project.ssproj");
	assert.deepEqual(bindings.captureProjectState(), { project: true });
	bindings.clearHistory();
	assert.equal(calls[11], "clear-history");
}

console.log("✅ CAMERA_FRAMES project controller bindings tests passed!");
