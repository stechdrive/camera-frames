import assert from "node:assert/strict";
import { createHistoryController } from "../src/controllers/history-controller.js";

function createSignal(value: boolean) {
	return { value };
}

function createHarness() {
	const store = {
		history: {
			canUndo: createSignal(false),
			canRedo: createSignal(false),
		},
	};
	let workspaceState = {
		count: 0,
		label: "initial",
	};
	let updateCount = 0;
	const historyController = createHistoryController({
		store,
		captureWorkspaceState: () => workspaceState,
		restoreWorkspaceState: (snapshot) => {
			workspaceState = snapshot;
			return true;
		},
		updateUi: () => {
			updateCount += 1;
		},
	});

	return {
		store,
		historyController,
		getState: () => workspaceState,
		setState: (nextState) => {
			workspaceState = nextState;
		},
		getUpdateCount: () => updateCount,
	};
}

{
	const harness = createHarness();
	harness.historyController.runHistoryAction("increment", () => {
		harness.setState({
			...harness.getState(),
			count: 1,
		});
	});
	assert.equal(harness.getState().count, 1);
	assert.equal(harness.store.history.canUndo.value, true);
	assert.equal(harness.store.history.canRedo.value, false);
	assert.equal(harness.historyController.undoHistory(), true);
	assert.equal(harness.getState().count, 0);
	assert.equal(harness.store.history.canRedo.value, true);
	assert.equal(harness.historyController.redoHistory(), true);
	assert.equal(harness.getState().count, 1);
	assert.equal(harness.getUpdateCount(), 2);
}

{
	const harness = createHarness();
	harness.historyController.beginHistoryTransaction("drag");
	harness.setState({
		...harness.getState(),
		count: 2,
		label: "dragged",
	});
	harness.historyController.commitHistoryTransaction();
	assert.equal(harness.store.history.canUndo.value, true);
	assert.equal(harness.historyController.undoHistory(), true);
	assert.equal(harness.getState().count, 0);
	assert.equal(harness.getState().label, "initial");
}

{
	const harness = createHarness();
	harness.historyController.beginHistoryTransaction("noop");
	harness.historyController.commitHistoryTransaction();
	assert.equal(harness.store.history.canUndo.value, false);
	assert.equal(harness.historyController.undoHistory(), false);
}

{
	const harness = createHarness();
	harness.historyController.beginHistoryTransaction("fast-path", {
		skipSnapshotDiff: true,
	});
	harness.setState({
		...harness.getState(),
		count: 7,
		label: "fast",
	});
	assert.equal(harness.historyController.commitHistoryTransaction(), true);
	assert.equal(harness.historyController.undoHistory(), true);
	assert.equal(harness.getState().count, 0);
	assert.equal(harness.historyController.redoHistory(), true);
	assert.equal(harness.getState().count, 7);
}

{
	const harness = createHarness();
	const largeBefore = new Uint32Array(300_000);
	largeBefore[150_000] = 1;
	harness.setState({
		...harness.getState(),
		splats: largeBefore,
	});
	harness.historyController.beginHistoryTransaction("large-binary");
	const largeAfter = new Uint32Array(largeBefore);
	largeAfter[150_000] = 2;
	harness.setState({
		...harness.getState(),
		splats: largeAfter,
	});
	assert.equal(harness.historyController.commitHistoryTransaction(), true);
	assert.equal(harness.store.history.canUndo.value, true);
	assert.equal(harness.historyController.undoHistory(), true);
	assert.equal(harness.getState().splats[150_000], 1);
}

{
	const store = {
		history: {
			canUndo: createSignal(false),
			canRedo: createSignal(false),
		},
	};
	let workspaceState = {
		count: 0,
		persisted: "before",
	};
	let lossyCapture = false;
	const historyController = createHistoryController({
		store,
		captureWorkspaceState: () =>
			lossyCapture
				? {
						count: workspaceState.count,
					}
				: workspaceState,
		restoreWorkspaceState: (snapshot) => {
			workspaceState = snapshot;
			return true;
		},
		updateUi: () => {},
	});
	historyController.beginHistoryTransaction("lossy-redo");
	workspaceState = {
		count: 1,
		persisted: "after",
	};
	assert.equal(historyController.commitHistoryTransaction(), true);
	lossyCapture = true;
	assert.equal(historyController.undoHistory(), true);
	assert.deepEqual(workspaceState, {
		count: 0,
		persisted: "before",
	});
	assert.equal(historyController.redoHistory(), true);
	assert.deepEqual(workspaceState, {
		count: 1,
		persisted: "after",
	});
}

console.log("✅ CAMERA_FRAMES history controller tests passed!");
