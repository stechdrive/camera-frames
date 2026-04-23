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
	const historyLabels: string[] = [];
	const transactionEvents: Array<{ kind: string; label?: string }> = [];
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
		runHistoryAction: (label, applyChange) => {
			historyLabels.push(label);
			applyChange?.();
			return true;
		},
		beginHistoryTransaction: (label) => {
			transactionEvents.push({ kind: "begin", label });
			return true;
		},
		commitHistoryTransaction: (label) => {
			transactionEvents.push({ kind: "commit", label });
			return true;
		},
		cancelHistoryTransaction: () => {
			transactionEvents.push({ kind: "cancel" });
		},
	});

	return {
		store,
		controller,
		getShotCameraDocument: () => shotCameraDocument,
		getStatusMessage: () => statusMessage,
		getHistoryLabels: () => historyLabels.slice(),
		getTransactionEvents: () => transactionEvents.slice(),
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
	assert.equal(harness.getShotCameraDocument().frameMask.shape, "bounds");
	assert.equal(
		harness.getShotCameraDocument().frameMask.trajectoryExportSource,
		"none",
	);
	harness.controller.createFrame();
	assert.equal(harness.getShotCameraDocument().frames.length, 2);
	assert.equal(
		harness.getShotCameraDocument().frameMask.shape,
		"trajectory",
		"mask shape should promote to trajectory on 1->2 frame transition",
	);
	assert.notEqual(
		harness.getShotCameraDocument().frameMask.trajectoryExportSource,
		"none",
		"trajectoryExportSource should be auto-chosen on 1->2 transition",
	);
}

{
	const harness = createHarness();
	const doc = harness.getShotCameraDocument();
	doc.frames[0].x = 0.2;
	doc.frames[0].y = 0.5;
	// Build next frame position via controller create (uses defaults), then move it.
	harness.controller.createFrame();
	const afterPromote =
		harness.getShotCameraDocument().frameMask.trajectoryExportSource;
	assert.notEqual(afterPromote, "none");
	assert.ok(
		["top-left", "top-right", "bottom-right", "bottom-left", "center"].includes(
			afterPromote,
		),
	);
}

{
	const harness = createHarness();
	harness.controller.duplicateActiveFrame();
	assert.equal(harness.getShotCameraDocument().frames.length, 2);
	assert.equal(
		harness.getShotCameraDocument().frameMask.shape,
		"trajectory",
		"mask shape should promote on duplicate reaching 2 frames",
	);
	harness.controller.setFrameMaskShape("bounds");
	harness.controller.setFrameTrajectoryExportSource("none");
	harness.controller.createFrame();
	assert.equal(harness.getShotCameraDocument().frames.length, 3);
	assert.equal(
		harness.getShotCameraDocument().frameMask.shape,
		"bounds",
		"shape promotion should not fire again after frames already number 2+",
	);
	assert.equal(
		harness.getShotCameraDocument().frameMask.trajectoryExportSource,
		"none",
		"trajectoryExportSource promotion should not fire again after frames number 2+",
	);
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

{
	// Deleting a frame must remove its trajectory node entry so that stored
	// nodesByFrameId never retains orphans after a delete.
	const harness = createHarness();
	harness.controller.duplicateActiveFrame();
	const firstFrameId = getFrameDocumentId(1);
	const secondFrameId = getFrameDocumentId(2);

	harness.controller.setFrameTrajectoryHandlePoint(firstFrameId, "out", {
		x: 0.66,
		y: 0.42,
	});
	harness.controller.setFrameTrajectoryHandlePoint(secondFrameId, "out", {
		x: 0.82,
		y: 0.31,
	});
	const nodesBeforeDelete = Object.keys(
		harness.getShotCameraDocument().frameMask.trajectory.nodesByFrameId,
	);
	assert.deepEqual(nodesBeforeDelete.sort(), [firstFrameId, secondFrameId]);

	harness.controller.deleteFrame(firstFrameId);

	const nodesAfterDelete = Object.keys(
		harness.getShotCameraDocument().frameMask.trajectory.nodesByFrameId,
	);
	assert.deepEqual(
		nodesAfterDelete,
		[secondFrameId],
		"deleteFrame should drop the deleted frame's trajectory node",
	);
}

{
	// deleteSelectedFrames must also drop trajectory nodes for every
	// selected frame in one batch.
	const harness = createHarness();
	harness.controller.duplicateActiveFrame();
	harness.controller.duplicateActiveFrame();
	const firstFrameId = getFrameDocumentId(1);
	const secondFrameId = getFrameDocumentId(2);
	const thirdFrameId = getFrameDocumentId(3);

	for (const frameId of [firstFrameId, secondFrameId, thirdFrameId]) {
		harness.controller.setFrameTrajectoryHandlePoint(frameId, "out", {
			x: 0.6,
			y: 0.4,
		});
	}

	harness.controller.deleteSelectedFrames([firstFrameId, thirdFrameId]);

	const remaining = Object.keys(
		harness.getShotCameraDocument().frameMask.trajectory.nodesByFrameId,
	);
	assert.deepEqual(
		remaining,
		[secondFrameId],
		"deleteSelectedFrames should drop all selected frames' trajectory nodes",
	);
}

{
	// Trajectory public mutations must route through runHistoryAction with
	// a dedicated label so that undo/redo can scope the action.
	const harness = createHarness();
	harness.controller.createFrame();
	const labelsBefore = harness.getHistoryLabels();
	assert.ok(
		labelsBefore.includes("frame.create"),
		"createFrame should push 'frame.create' into history",
	);

	harness.controller.setFrameMaskShape("trajectory");
	harness.controller.setFrameTrajectoryMode("spline");
	harness.controller.setFrameTrajectoryExportSource("center");
	harness.controller.setFrameTrajectoryNodeMode(getFrameDocumentId(2), "free");

	const labels = harness.getHistoryLabels();
	assert.ok(labels.includes("frame.mask-shape"));
	assert.ok(labels.includes("frame.trajectory-mode"));
	assert.ok(labels.includes("frame.trajectory-export-source"));
	assert.ok(labels.includes("frame.trajectory-node-mode"));
}

{
	// A trajectory handle drag must open a single history transaction and
	// commit it on pointer up, batching all moves into one undo step.
	const harness = createHarness();
	harness.controller.duplicateActiveFrame();
	const targetFrameId = getFrameDocumentId(2);
	harness.controller.selectFrame(targetFrameId);

	const pointerId = 42;
	harness.controller.startFrameTrajectoryHandleDrag(targetFrameId, "out", {
		button: 0,
		pointerId,
		clientX: 900,
		clientY: 500,
		preventDefault() {},
		stopPropagation() {},
	});

	harness.controller.handleFrameTrajectoryHandleDragMove({
		pointerId,
		clientX: 920,
		clientY: 460,
	});
	harness.controller.handleFrameTrajectoryHandleDragMove({
		pointerId,
		clientX: 960,
		clientY: 400,
	});
	harness.controller.handleFrameTrajectoryHandleDragEnd({
		pointerId,
	});

	const events = harness.getTransactionEvents();
	const firstBegin = events.findIndex(
		(event) =>
			event.kind === "begin" && event.label === "frame.trajectory-handle",
	);
	const firstCommit = events.findIndex(
		(event) =>
			event.kind === "commit" && event.label === "frame.trajectory-handle",
	);
	assert.ok(
		firstBegin >= 0,
		"handle drag must begin a 'frame.trajectory-handle' transaction",
	);
	assert.ok(
		firstCommit > firstBegin,
		"handle drag must commit after begin, scoping all moves into one undo step",
	);

	const historyLabelsDuringDrag = harness
		.getHistoryLabels()
		.filter((label) => label === "frame.trajectory-handle");
	assert.equal(
		historyLabelsDuringDrag.length,
		0,
		"handle drag moves must not push history entries outside the transaction",
	);
}

{
	// Starting a new trajectory drag while a stale transaction is open must
	// cancel the previous transaction rather than nest.
	const harness = createHarness();
	harness.controller.duplicateActiveFrame();
	const targetFrameId = getFrameDocumentId(2);
	harness.controller.selectFrame(targetFrameId);

	harness.controller.startFrameTrajectoryHandleDrag(targetFrameId, "out", {
		button: 0,
		pointerId: 1,
		clientX: 900,
		clientY: 500,
		preventDefault() {},
		stopPropagation() {},
	});
	// Simulate an interruption (no drag end fired). A second drag start must
	// cancel the prior transaction before beginning a new one.
	harness.controller.startFrameTrajectoryHandleDrag(targetFrameId, "in", {
		button: 0,
		pointerId: 2,
		clientX: 400,
		clientY: 300,
		preventDefault() {},
		stopPropagation() {},
	});

	const events = harness.getTransactionEvents();
	const beginCount = events.filter(
		(event) =>
			event.kind === "begin" && event.label === "frame.trajectory-handle",
	).length;
	const cancelCount = events.filter((event) => event.kind === "cancel").length;
	assert.equal(beginCount, 2, "each drag start must begin its own transaction");
	assert.ok(
		cancelCount >= 1,
		"a second drag start must cancel the prior transaction",
	);
}

console.log("✅ CAMERA_FRAMES frame controller tests passed!");
