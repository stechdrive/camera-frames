import assert from "node:assert/strict";
import {
	createControllerAccessors,
	createShotCameraEditorStateAccessors,
} from "../src/app/controller-accessors.js";

{
	const calls = [];
	const cameraController = {
		registerShotCameraDocuments: () => calls.push(["register"]),
		getActiveShotCameraEntry: () => ({ id: "entry" }),
		getShotCameraDocument: (id) => ({ id }),
		getActiveShotCameraDocument: () => ({ id: "active-doc" }),
		updateActiveShotCameraDocument: (updateDocument) => updateDocument("doc"),
		setShotCameraDocuments: (documents) => documents.length,
		getShotCameraExportBaseName: (documentState, fallbackIndex) =>
			`${documentState.id}-${fallbackIndex}`,
		getActiveShotCamera: () => ({ id: "shot-camera" }),
		getActiveCameraViewCamera: () => ({ id: "camera-view" }),
		getActiveOutputCamera: () => ({ id: "output-camera" }),
		updateShotCameraHelpers: () => calls.push(["helpers"]),
		syncShotCameraEntryFromDocument: (entry) =>
			calls.push(["sync-entry", entry.id]),
		syncActiveShotCameraFromDocument: () => calls.push(["sync-active"]),
	};
	const frameController = {
		getActiveFrames: () => [{ id: "frame-a" }],
		resolveFrameAxis: (value) => value.toUpperCase(),
		resolveFrameAnchor: (value, fallback) => value ?? fallback,
		getFrameAnchorDocument: (frame) => ({ id: frame.id }),
		isFrameSelectionActive: () => true,
		clearFrameDrag: () => calls.push(["clear-frame-drag"]),
		clearFrameSelection: () => calls.push(["clear-frame-selection"]),
	};
	const outputFrameController = {
		clearOutputFramePan: () => calls.push(["clear-pan"]),
		clearOutputFrameAnchorDrag: () => calls.push(["clear-anchor-drag"]),
		clearOutputFrameResize: () => calls.push(["clear-resize"]),
		selectOutputFrame: () => calls.push(["select-output"]),
		clearOutputFrameSelection: () => calls.push(["clear-output-selection"]),
	};
	const sceneFramingController = {
		getAutoClipRange: (camera) => ({ camera }),
	};

	const accessors = createControllerAccessors({
		getCameraController: () => cameraController,
		getFrameController: () => frameController,
		getOutputFrameController: () => outputFrameController,
		getSceneFramingController: () => sceneFramingController,
	});

	accessors.registerShotCameraDocuments();
	assert.deepEqual(accessors.getActiveShotCameraEntry(), { id: "entry" });
	assert.deepEqual(accessors.getShotCameraDocument("camera-a"), {
		id: "camera-a",
	});
	assert.deepEqual(accessors.getActiveShotCameraDocument(), {
		id: "active-doc",
	});
	assert.equal(
		accessors.updateActiveShotCameraDocument((documentState) => documentState),
		"doc",
	);
	assert.equal(accessors.setShotCameraDocuments([{ id: "a" }, { id: "b" }]), 2);
	assert.equal(
		accessors.getShotCameraExportBaseName({ id: "camera-a" }, 3),
		"camera-a-3",
	);
	assert.deepEqual(accessors.getActiveFrames(), [{ id: "frame-a" }]);
	assert.equal(accessors.resolveFrameAxis("x"), "X");
	assert.equal(accessors.resolveFrameAnchor(null, "center"), "center");
	assert.deepEqual(accessors.getFrameAnchorDocument({ id: "frame-a" }), {
		id: "frame-a",
	});
	assert.equal(accessors.isFrameSelectionActive(), true);
	accessors.clearFrameDrag();
	accessors.clearFrameSelection();
	accessors.clearOutputFramePan();
	accessors.clearOutputFrameAnchorDrag();
	accessors.clearOutputFrameResize();
	accessors.selectOutputFrame();
	accessors.clearOutputFrameSelection();
	assert.deepEqual(accessors.getActiveShotCamera(), { id: "shot-camera" });
	assert.deepEqual(accessors.getActiveCameraViewCamera(), {
		id: "camera-view",
	});
	assert.deepEqual(accessors.getActiveOutputCamera(), { id: "output-camera" });
	assert.deepEqual(accessors.getAutoClipRange({ id: "camera-a" }), {
		camera: { id: "camera-a" },
	});
	accessors.updateShotCameraHelpers();
	accessors.syncShotCameraEntryFromDocument({ id: "entry-a" });
	accessors.syncActiveShotCameraFromDocument();

	assert.deepEqual(calls, [
		["register"],
		["clear-frame-drag"],
		["clear-frame-selection"],
		["clear-pan"],
		["clear-anchor-drag"],
		["clear-resize"],
		["select-output"],
		["clear-output-selection"],
		["helpers"],
		["sync-entry", "entry-a"],
		["sync-active"],
	]);
}

{
	const calls = [];
	const shotCameraEditorStateController = {
		captureActiveShotCameraEditorState: () => ({ id: "active" }),
		storeShotCameraEditorState: (shotCameraId) =>
			calls.push(["store", shotCameraId]),
		clearActiveShotCameraEditorState: () => calls.push(["clear"]),
		restoreShotCameraEditorState: (shotCameraId, options) =>
			calls.push(["restore", shotCameraId, options.fallbackSnapshot]),
		captureShotCameraEditorStates: () => ({ a: 1 }),
		restoreShotCameraEditorStates: (editorStates) =>
			calls.push(["restore-all", editorStates]),
		pruneShotCameraEditorStates: () => calls.push(["prune"]),
		prepareForShotCameraSwitch: (shotCameraId) =>
			calls.push(["prepare", shotCameraId]),
		restoreAfterShotCameraSwitch: (shotCameraId) =>
			calls.push(["after", shotCameraId]),
	};

	const accessors = createShotCameraEditorStateAccessors({
		getShotCameraEditorStateController: () => shotCameraEditorStateController,
	});

	assert.deepEqual(accessors.captureActiveShotCameraEditorState(), {
		id: "active",
	});
	accessors.storeShotCameraEditorState("camera-a");
	accessors.clearActiveShotCameraEditorState();
	accessors.restoreShotCameraEditorState("camera-b", {
		fallbackSnapshot: { id: "snap" },
	});
	assert.deepEqual(accessors.captureShotCameraEditorStates(), { a: 1 });
	accessors.restoreShotCameraEditorStates({ a: 1 });
	accessors.pruneShotCameraEditorStates();
	accessors.prepareForShotCameraSwitch("camera-c");
	accessors.restoreAfterShotCameraSwitch("camera-d");

	assert.deepEqual(calls, [
		["store", "camera-a"],
		["clear"],
		["restore", "camera-b", { id: "snap" }],
		["restore-all", { a: 1 }],
		["prune"],
		["prepare", "camera-c"],
		["after", "camera-d"],
	]);
}

console.log("✅ CAMERA_FRAMES controller accessors tests passed!");
