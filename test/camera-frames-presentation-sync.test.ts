import assert from "node:assert/strict";
import { createPresentationSync } from "../src/app/presentation-sync.js";

function createHarness(overrides = {}) {
	const store = overrides.store ?? {
		statusLine: { value: "" },
		exportStatusKey: { value: "export.idle" },
		exportBusy: { value: false },
		exportSummary: { value: "" },
		locale: { value: "en" },
	};
	const state = overrides.state ?? {
		exportStatusKey: "export.idle",
		exportBusy: false,
	};
	const calls = [];
	const referenceImageController = overrides.referenceImageController ?? {
		syncUiState: () => calls.push(["sync-ui"]),
	};
	const referenceImageRenderController =
		overrides.referenceImageRenderController ?? {
			syncPreviewLayers: () => calls.push(["sync-preview"]),
			clearPreviewLayers: () => calls.push(["clear-preview"]),
		};
	const projectController = overrides.projectController ?? {
		syncProjectPresentation: () => calls.push(["sync-project-presentation"]),
	};
	const uiSyncController = overrides.uiSyncController ?? {
		updateUi: () => calls.push(["update-ui"]),
	};
	const sync = createPresentationSync({
		store,
		state,
		currentLocale: () => store.locale.value,
		t: (key, params) =>
			key === "status.localeChanged"
				? `locale:${params.language}`
				: key === "exportSummary.empty"
					? "empty-summary"
					: key.replace("localeName.", ""),
		resetLocalizedCaches: () => calls.push(["reset-caches"]),
		getTotalLoadedItems: () => overrides.totalLoadedItems ?? 0,
		getReferenceImageController: () => referenceImageController,
		getReferenceImageRenderController: () => referenceImageRenderController,
		getProjectController: () => projectController,
		getUiSyncController: () => uiSyncController,
		isProjectPresentationSyncSuspended: () =>
			overrides.projectPresentationSyncSuspended ?? false,
		updateCameraSummary: () => calls.push(["update-camera-summary"]),
	});

	return {
		sync,
		store,
		state,
		calls,
	};
}

{
	const { sync, store, state } = createHarness();
	sync.setStatus("ready");
	assert.equal(store.statusLine.value, "ready");

	sync.setExportStatus("export.busy", true);
	assert.equal(state.exportStatusKey, "export.busy");
	assert.equal(state.exportBusy, true);
	assert.equal(store.exportStatusKey.value, "export.busy");
	assert.equal(store.exportBusy.value, true);
}

{
	const { sync, calls } = createHarness();
	sync.updateUi();
	assert.deepEqual(calls, [
		["sync-ui"],
		["sync-preview"],
		["sync-project-presentation"],
		["update-ui"],
	]);
}

{
	const { sync, calls } = createHarness({
		projectPresentationSyncSuspended: true,
	});
	sync.updateUi();
	assert.deepEqual(calls, [["sync-ui"], ["sync-preview"], ["update-ui"]]);
}

{
	const errors = [];
	const originalConsoleError = console.error;
	console.error = (...args) => errors.push(args);
	try {
		const failure = new Error("preview failed");
		const previewCalls = [];
		const { sync } = createHarness({
			referenceImageRenderController: {
				syncPreviewLayers: () => {
					throw failure;
				},
				clearPreviewLayers: () => previewCalls.push(["clear-preview"]),
			},
		});
		sync.updateUi();
		sync.updateUi();
		assert.equal(errors.length, 1);
		assert.ok(
			previewCalls.some(([label]) => label === "clear-preview"),
			"clears preview layers after preview sync failure",
		);
	} finally {
		console.error = originalConsoleError;
	}
}

{
	const { sync, store, calls } = createHarness({
		totalLoadedItems: 0,
	});
	sync.setLocale("ja");
	assert.equal(store.locale.value, "ja");
	assert.equal(store.exportSummary.value, "empty-summary");
	assert.equal(store.statusLine.value, "locale:ja");
	assert.deepEqual(calls, [
		["reset-caches"],
		["sync-ui"],
		["sync-preview"],
		["sync-project-presentation"],
		["update-ui"],
		["update-camera-summary"],
	]);
}

{
	const { sync, calls } = createHarness({
		totalLoadedItems: 3,
	});
	sync.setLocale("en");
	assert.deepEqual(calls, []);
}

console.log("✅ CAMERA_FRAMES presentation sync tests passed!");
