import assert from "node:assert/strict";
import { createFrameController } from "../src/controllers/frame-controller.js";
import { createCameraFramesStore } from "../src/store.js";
import {
	createShotCameraDocument,
	getFrameDocumentId,
} from "../src/workspace-model.js";

function createHarness() {
	const store = createCameraFramesStore();
	let shotCameraDocument = createShotCameraDocument({
		name: "Camera 1",
	});
	let statusMessage = "";
	const controller = createFrameController({
		store,
		state: {
			mode: "camera",
		},
		renderBox: null,
		workspacePaneCamera: "camera",
		isZoomToolActive: () => false,
		t: (key, values = {}) =>
			key === "frame.defaultName"
				? `FRAME ${values.index}`
				: key === "status.duplicatedFrame"
					? `${values.name} duplicated`
					: key,
		setStatus: (value) => {
			statusMessage = value;
		},
		updateUi: () => {},
		clearOutputFrameSelection: () => {},
		clearOutputFramePan: () => {},
		getActiveShotCameraDocument: () => shotCameraDocument,
		updateActiveShotCameraDocument: (updater) => {
			shotCameraDocument = updater(shotCameraDocument);
			return shotCameraDocument;
		},
		getOutputFrameMetrics: () => ({
			boxWidth: 1536,
			boxHeight: 864,
			exportWidth: 1536,
			exportHeight: 864,
			boxLeft: 0,
			boxTop: 0,
		}),
		runHistoryAction: (_label, applyChange) => {
			applyChange?.();
			return true;
		},
		beginHistoryTransaction: () => true,
		commitHistoryTransaction: () => true,
		cancelHistoryTransaction: () => {},
	});

	return {
		store,
		controller,
		getShotCameraDocument: () => shotCameraDocument,
		getStatusMessage: () => statusMessage,
	};
}

{
	const harness = createHarness();
	const sourceFrame = harness.getShotCameraDocument().frames[0];
	sourceFrame.x = 0.31;
	sourceFrame.y = 0.62;
	sourceFrame.rotation = 33;
	sourceFrame.scale = 1.4;
	sourceFrame.anchor = { x: 0.29, y: 0.66 };

	harness.controller.duplicateActiveFrame();

	const frames = harness.getShotCameraDocument().frames;
	assert.equal(frames.length, 2);
	const duplicated = frames.find((frame) => frame.id === getFrameDocumentId(2));
	assert.ok(duplicated);
	assert.equal(duplicated.x, sourceFrame.x);
	assert.equal(duplicated.y, sourceFrame.y);
	assert.equal(duplicated.rotation, sourceFrame.rotation);
	assert.equal(duplicated.scale, sourceFrame.scale);
	assert.deepEqual(duplicated.anchor, sourceFrame.anchor);
	assert.notEqual(duplicated.anchor, sourceFrame.anchor);
	assert.equal(harness.getShotCameraDocument().activeFrameId, duplicated.id);
	assert.equal(harness.getStatusMessage(), `${duplicated.name} duplicated`);
}

{
	const harness = createHarness();
	const sourceFrame = harness.getShotCameraDocument().frames[0];
	harness.controller.setFrameTrajectoryHandlePoint(sourceFrame.id, "out", {
		x: 0.66,
		y: 0.42,
	});

	harness.controller.duplicateActiveFrame();

	const duplicated = harness
		.getShotCameraDocument()
		.frames.find((frame) => frame.id === getFrameDocumentId(2));
	assert.ok(duplicated);
	assert.deepEqual(
		harness.getShotCameraDocument().frameMask.trajectory.nodesByFrameId,
		{
			[sourceFrame.id]: {
				mode: "mirrored",
				in: { x: -0.16000000000000003, y: 0.08000000000000002 },
				out: { x: 0.16000000000000003, y: -0.08000000000000002 },
			},
			[duplicated.id]: {
				mode: "mirrored",
				in: { x: -0.16000000000000003, y: 0.08000000000000002 },
				out: { x: 0.16000000000000003, y: -0.08000000000000002 },
			},
		},
	);
}

console.log("✅ CAMERA_FRAMES frame controller tests passed!");
