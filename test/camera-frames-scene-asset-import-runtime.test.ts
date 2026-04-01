import assert from "node:assert/strict";
import {
	createAssetImportRuntime,
	getStandaloneProjectAssetSource,
	parseAssetImportInputUrls,
} from "../src/controllers/scene-assets/import-runtime.js";

assert.deepEqual(
	parseAssetImportInputUrls(
		"https://a.example/test.glb\nhttp://b.example/c.ply foo",
	),
	["https://a.example/test.glb", "http://b.example/c.ply"],
);

{
	const source = new File([new Uint8Array([1])], "scene.ssproj");
	assert.equal(
		getStandaloneProjectAssetSource([source], {
			openProjectSource: () => {},
			getExtension: (value) => value.name.split(".").pop(),
		}),
		source,
	);
	assert.equal(
		getStandaloneProjectAssetSource([source, source], {
			openProjectSource: () => {},
			getExtension: () => "ssproj",
		}),
		null,
	);
}

function createHarness(overrides = {}) {
	const store = {
		overlay: { value: null },
		remoteUrl: { value: "" },
	};
	const calls = {
		statuses: [],
		openProjectSources: [],
		loadedSplats: [],
		loadedModels: [],
		beginHistory: [],
		commitHistory: [],
		cancelHistory: [],
		clearScene: 0,
		clearHistory: 0,
		disposeDetached: 0,
		placeAllCamerasAtHome: 0,
		updateCameraSummary: 0,
		updateUi: 0,
		openFiles: 0,
	};
	const runtime = createAssetImportRuntime({
		store,
		t: (key) => key,
		setStatus: (value) => calls.statuses.push(value),
		setOverlay: (overlay) => {
			store.overlay.value = overlay;
		},
		clearOverlay: () => {
			store.overlay.value = null;
		},
		openFiles: () => {
			calls.openFiles += 1;
		},
		isProjectPackageSource: () => false,
		isProjectPackagePackedSplatSource: () => false,
		extractProjectPackageAssets: async () => ({
			files: [],
			importState: null,
		}),
		openProjectSource: async (source) => {
			calls.openProjectSources.push(source);
		},
		getExtension: (value) =>
			String(typeof value === "string" ? value : value.name)
				.split("?")[0]
				.split("#")[0]
				.toLowerCase()
				.split(".")
				.pop(),
		getDisplayName: (value) =>
			typeof value === "string" ? value : (value.name ?? "asset"),
		loadSplatFromSource: async (source) => {
			calls.loadedSplats.push(source);
		},
		loadModelFromSource: async (source) => {
			calls.loadedModels.push(source);
		},
		getSceneAssetCount: () => overrides.sceneAssetCount ?? 0,
		clearScene: () => {
			calls.clearScene += 1;
		},
		disposeDetachedSceneAssets: () => {
			calls.disposeDetached += 1;
		},
		clearHistory: () => {
			calls.clearHistory += 1;
		},
		applyProjectPackageImport: () => false,
		placeAllCamerasAtHome: () => {
			calls.placeAllCamerasAtHome += 1;
		},
		updateCameraSummary: () => {
			calls.updateCameraSummary += 1;
		},
		updateUi: () => {
			calls.updateUi += 1;
		},
		beginHistoryTransaction: (label) => {
			calls.beginHistory.push(label);
			return true;
		},
		commitHistoryTransaction: (label) => {
			calls.commitHistory.push(label);
			return true;
		},
		cancelHistoryTransaction: () => {
			calls.cancelHistory.push(true);
		},
	});
	return {
		store,
		calls,
		runtime,
	};
}

{
	const { runtime, calls, store } = createHarness();
	const imported = await runtime.importDroppedFiles([
		new File([new Uint8Array([1])], "model.glb"),
	]);
	assert.equal(imported, true);
	assert.equal(calls.loadedModels.length, 1);
	assert.equal(calls.loadedSplats.length, 0);
	assert.deepEqual(calls.beginHistory, ["asset.import"]);
	assert.deepEqual(calls.commitHistory, ["asset.import"]);
	assert.deepEqual(calls.cancelHistory, []);
	assert.equal(calls.clearHistory, 0);
	assert.equal(calls.placeAllCamerasAtHome, 1);
	assert.equal(calls.updateUi, 1);
	assert.equal(store.overlay.value, null);
}

{
	const { runtime, calls } = createHarness();
	assert.equal(typeof runtime.expandProjectPackageSources, "function");
	const projectFile = new File([new Uint8Array([1])], "scene.ssproj");
	const imported = await runtime.importDroppedFiles([projectFile]);
	assert.equal(imported, true);
	assert.deepEqual(calls.openProjectSources, [projectFile]);
	assert.equal(calls.loadedModels.length, 0);
	assert.equal(calls.loadedSplats.length, 0);
}

{
	const { runtime, calls } = createHarness();
	await runtime.loadRemoteUrls();
	assert.deepEqual(calls.statuses, ["status.enterUrl"]);
}

console.log("✅ CAMERA_FRAMES scene asset import runtime tests passed!");
