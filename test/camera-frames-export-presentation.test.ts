import assert from "node:assert/strict";
import {
	clearExportOverlay,
	createExportOptionsFacade,
	setExportProgressOverlay,
	showExportErrorOverlay,
} from "../src/controllers/export/presentation.js";

{
	const store = {
		overlay: {
			value: {
				source: "export",
				kind: "progress",
			},
		},
	};

	clearExportOverlay(store);
	assert.equal(store.overlay.value, null);

	store.overlay.value = { source: "other" };
	clearExportOverlay(store);
	assert.deepEqual(store.overlay.value, { source: "other" });
}

{
	const t = (key) => `t:${key}`;
	const store = {
		overlay: {
			value: null,
		},
	};

	setExportProgressOverlay(
		[{ id: "camera-a" }],
		0,
		"png",
		123,
		{ id: "beauty" },
		{
			store,
			t,
			buildExportProgressOverlay: (config) => config,
		},
	);

	assert.deepEqual(store.overlay.value, {
		targetDocuments: [{ id: "camera-a" }],
		currentIndex: 0,
		exportFormat: "png",
		startedAt: 123,
		phaseState: { id: "beauty" },
		t,
	});
}

{
	const store = {
		overlay: {
			value: null,
		},
	};

	showExportErrorOverlay(new Error("boom"), {
		store,
		t: (key) => `t:${key}`,
	});

	assert.equal(store.overlay.value?.source, "export");
	assert.equal(store.overlay.value?.kind, "error");
	assert.equal(store.overlay.value?.title, "t:overlay.exportErrorTitle");
	assert.equal(store.overlay.value?.message, "t:overlay.exportErrorMessage");
	assert.equal(store.overlay.value?.detailLabel, "t:overlay.errorDetails");
	assert.equal(store.overlay.value?.detail.includes("boom"), true);
	assert.equal(store.overlay.value?.actions[0].label, "t:action.close");

	store.overlay.value.actions[0].onClick();
	assert.equal(store.overlay.value, null);
}

{
	const statusCalls = [];
	const store = {
		exportOptions: {
			target: { value: "current" },
			presetIds: { value: [] },
		},
		workspace: {
			activeShotCameraId: { value: "camera-b" },
			shotCameras: {
				value: [{ id: "camera-a" }, { id: "camera-b" }, { id: "camera-c" }],
			},
		},
		referenceImages: {
			exportSessionEnabled: { value: true },
		},
	};

	const facade = createExportOptionsFacade({
		store,
		t: (key, values = {}) => `${key}:${JSON.stringify(values)}`,
		setStatus: (value) => statusCalls.push(value),
	});

	facade.setExportTarget("selected");
	assert.equal(store.exportOptions.target.value, "selected");
	assert.deepEqual(store.exportOptions.presetIds.value, ["camera-b"]);

	facade.toggleExportPreset("camera-a");
	assert.deepEqual(store.exportOptions.presetIds.value, [
		"camera-a",
		"camera-b",
	]);

	facade.toggleExportPreset("camera-b");
	assert.deepEqual(store.exportOptions.presetIds.value, ["camera-a"]);

	facade.setReferenceImageExportSessionEnabled(false);
	assert.equal(store.referenceImages.exportSessionEnabled.value, false);

	assert.equal(
		statusCalls[0],
		'status.exportTargetChanged:{"target":"exportTarget.selected:{}"}',
	);
	assert.equal(statusCalls.at(-1), 'status.exportPresetSelection:{"count":1}');
}

console.log("✅ CAMERA_FRAMES export presentation tests passed!");
