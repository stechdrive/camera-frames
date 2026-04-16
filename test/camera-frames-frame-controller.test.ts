import assert from "node:assert/strict";
import { createFrameController } from "../src/controllers/frame-controller.js";
import { createCameraFramesStore } from "../src/store.js";
import {
	createShotCameraDocument,
	getFrameDocumentId,
} from "../src/workspace-model.js";

if (typeof globalThis.Element === "undefined") {
	globalThis.Element = class {};
}

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
		renderBox: {
			getBoundingClientRect: () => ({
				width: 1536,
				height: 864,
			}),
		},
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

{
	const harness = createHarness();
	const document = harness.getShotCameraDocument();
	document.frames[0].x = 0.2;
	document.frames[0].y = 0.2;
	document.frames.push({
		...document.frames[0],
		id: getFrameDocumentId(2),
		name: "FRAME 2",
		x: 0.5,
		y: 0.8,
		rotation: 0,
		scale: 1,
		anchor: { x: 0.5, y: 0.5 },
	});
	document.frames.push({
		...document.frames[0],
		id: getFrameDocumentId(3),
		name: "FRAME 3",
		x: 0.8,
		y: 0.2,
		rotation: 0,
		scale: 1,
		anchor: { x: 0.5, y: 0.5 },
	});
	document.activeFrameId = getFrameDocumentId(2);
	document.frameMask.trajectoryMode = "spline";

	harness.controller.setFrameTrajectoryNodeMode(getFrameDocumentId(2), "free");
	const initialNode =
		harness.getShotCameraDocument().frameMask.trajectory.nodesByFrameId[
			getFrameDocumentId(2)
		];
	assert.equal(initialNode.mode, "free");
	assert.ok(initialNode.in.x < 0);
	assert.ok(Math.abs(initialNode.in.y) < 1e-9);
	assert.ok(initialNode.out.x > 0);
	assert.ok(Math.abs(initialNode.out.y) < 1e-9);

	harness.controller.setFrameTrajectoryHandlePoint(
		getFrameDocumentId(2),
		"out",
		{
			x: 0.9,
			y: 0.9,
		},
	);

	const updatedNode =
		harness.getShotCameraDocument().frameMask.trajectory.nodesByFrameId[
			getFrameDocumentId(2)
		];
	assert.equal(updatedNode.mode, "free");
	assert.equal(updatedNode.in.x, initialNode.in.x);
	assert.equal(updatedNode.in.y, initialNode.in.y);
	assert.equal(updatedNode.out.x, 0.4);
	assert.equal(updatedNode.out.y, 0.09999999999999998);
}

{
	const harness = createHarness();
	const document = harness.getShotCameraDocument();
	harness.controller.duplicateActiveFrame();
	const firstFrameId = getFrameDocumentId(1);
	const secondFrameId = getFrameDocumentId(2);
	harness.controller.selectFrame(firstFrameId);
	harness.controller.selectFrame(secondFrameId, { additive: true });
	assert.equal(harness.getShotCameraDocument().activeFrameId, secondFrameId);

	harness.controller.startFrameDrag(firstFrameId, {
		button: 0,
		pointerId: 1,
		clientX: 100,
		clientY: 100,
		shiftKey: false,
		metaKey: false,
		ctrlKey: false,
		preventDefault() {},
		stopPropagation() {},
	});

	assert.equal(harness.getShotCameraDocument().activeFrameId, firstFrameId);
}

{
	const harness = createHarness();
	const document = harness.getShotCameraDocument();
	document.frames[0].x = 0.2;
	document.frames[0].y = 0.2;
	document.frames.push({
		...document.frames[0],
		id: getFrameDocumentId(2),
		name: "FRAME 2",
		x: 0.5,
		y: 0.8,
		rotation: 0,
		scale: 1,
		anchor: { x: 0.5, y: 0.5 },
	});
	document.frames.push({
		...document.frames[0],
		id: getFrameDocumentId(3),
		name: "FRAME 3",
		x: 0.8,
		y: 0.2,
		rotation: 0,
		scale: 1,
		anchor: { x: 0.5, y: 0.5 },
	});
	document.activeFrameId = getFrameDocumentId(2);
	document.frameMask.trajectoryMode = "spline";

	harness.controller.setFrameTrajectoryNodeMode(
		getFrameDocumentId(2),
		"corner",
	);
	harness.controller.setFrameTrajectoryHandlePoint(
		getFrameDocumentId(2),
		"out",
		{
			x: 0.9,
			y: 0.9,
		},
	);

	const updatedNode =
		harness.getShotCameraDocument().frameMask.trajectory.nodesByFrameId[
			getFrameDocumentId(2)
		];
	assert.equal(updatedNode.mode, "free");
	assert.ok(updatedNode.in.x < 0);
	assert.ok(updatedNode.in.y < 0);
	assert.equal(updatedNode.out.x, 0.4);
	assert.equal(updatedNode.out.y, 0.09999999999999998);
}

console.log("✅ CAMERA_FRAMES frame controller tests passed!");
