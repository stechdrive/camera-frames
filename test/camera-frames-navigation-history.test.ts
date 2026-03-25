import assert from "node:assert/strict";
import { createNavigationHistoryController } from "../src/controllers/navigation-history.js";

function createHarness() {
	const events: string[] = [];
	const navigationHistory = createNavigationHistoryController({
		beginHistoryTransaction: (label) => {
			events.push(`begin:${label}`);
			return true;
		},
		commitHistoryTransaction: () => {
			events.push("commit");
			return true;
		},
	});

	return {
		navigationHistory,
		events,
	};
}

{
	const harness = createHarness();
	harness.navigationHistory.noteFrame({
		targetKey: "viewport",
		label: "viewport.pose",
		poseChanged: true,
		navigationActive: true,
		deltaMs: 16,
	});
	assert.deepEqual(harness.events, ["begin:viewport.pose"]);

	harness.navigationHistory.requestCommit();
	harness.navigationHistory.noteFrame({
		targetKey: "viewport",
		label: "viewport.pose",
		poseChanged: false,
		navigationActive: false,
		deltaMs: 16,
	});
	assert.deepEqual(harness.events, ["begin:viewport.pose", "commit"]);
}

{
	const harness = createHarness();
	harness.navigationHistory.noteFrame({
		targetKey: "viewport",
		label: "viewport.pose",
		poseChanged: true,
		navigationActive: true,
		deltaMs: 16,
	});
	harness.navigationHistory.noteFrame({
		targetKey: "viewport",
		label: "viewport.pose",
		poseChanged: false,
		navigationActive: false,
		deltaMs: 60,
	});
	assert.deepEqual(harness.events, ["begin:viewport.pose"]);
	harness.navigationHistory.noteFrame({
		targetKey: "viewport",
		label: "viewport.pose",
		poseChanged: false,
		navigationActive: false,
		deltaMs: 70,
	});
	assert.deepEqual(harness.events, ["begin:viewport.pose", "commit"]);
}

{
	const harness = createHarness();
	harness.navigationHistory.noteFrame({
		targetKey: "viewport",
		label: "viewport.pose",
		poseChanged: true,
		navigationActive: true,
		deltaMs: 16,
	});
	harness.navigationHistory.noteFrame({
		targetKey: "shot:camera-1",
		label: "camera.pose",
		poseChanged: false,
		navigationActive: false,
		deltaMs: 16,
	});
	assert.deepEqual(harness.events, ["begin:viewport.pose", "commit"]);
}

console.log("✅ CAMERA_FRAMES navigation history tests passed!");
