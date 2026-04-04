import assert from "node:assert/strict";
import { createOutputFrameAccessors } from "../src/app/output-frame-accessors.js";

function createHarness() {
	const calls = [];
	const activeDocument = { id: "shot-camera-1" };
	const outputFrameController = {
		getOutputFrameDocumentState: (documentState) => {
			calls.push(["document-state", documentState]);
			return { documentState };
		},
		getOutputSizeState: (documentState) => {
			calls.push(["size-state", documentState]);
			return { width: 1280, height: 720 };
		},
		getViewportSize: () => {
			calls.push(["viewport-size"]);
			return { width: 1920, height: 1080 };
		},
		syncOutputFrameFitState: (
			documentState,
			viewportWidth,
			viewportHeight,
			force,
		) => {
			calls.push([
				"sync-fit",
				documentState,
				viewportWidth,
				viewportHeight,
				force,
			]);
			return true;
		},
		getOutputFrameMetrics: (documentState) => {
			calls.push(["metrics", documentState]);
			return { width: 100, height: 50 };
		},
	};

	const accessors = createOutputFrameAccessors({
		getActiveShotCameraDocument: () => activeDocument,
		getOutputFrameController: () => outputFrameController,
	});

	return {
		accessors,
		activeDocument,
		calls,
	};
}

{
	const { accessors, activeDocument, calls } = createHarness();
	assert.deepEqual(accessors.getOutputFrameDocumentState(), {
		documentState: activeDocument,
	});
	assert.deepEqual(accessors.getOutputSizeState(), {
		width: 1280,
		height: 720,
	});
	assert.deepEqual(accessors.getViewportSize(), {
		width: 1920,
		height: 1080,
	});
	assert.equal(accessors.syncOutputFrameFitState(), true);
	assert.deepEqual(accessors.getOutputFrameMetrics(), {
		width: 100,
		height: 50,
	});
	assert.deepEqual(calls, [
		["document-state", activeDocument],
		["size-state", activeDocument],
		["viewport-size"],
		["viewport-size"],
		["viewport-size"],
		["sync-fit", activeDocument, 1920, 1080, false],
		["metrics", activeDocument],
	]);
}

{
	const { accessors, calls } = createHarness();
	const documentState = { id: "shot-camera-2" };
	assert.equal(
		accessors.syncOutputFrameFitState(documentState, 800, 600, true),
		true,
	);
	assert.deepEqual(calls, [["sync-fit", documentState, 800, 600, true]]);
}

console.log("✅ CAMERA_FRAMES output frame accessors tests passed!");
