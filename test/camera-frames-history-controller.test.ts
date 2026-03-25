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

console.log("✅ CAMERA_FRAMES history controller tests passed!");
