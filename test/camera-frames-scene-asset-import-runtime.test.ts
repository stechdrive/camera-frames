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
	assert.equal(
		getStandaloneProjectAssetSource(["https://example.test/scene.ssproj"], {
			openProjectSource: () => {},
			getExtension: (value) => value.split(".").pop(),
		}),
		"https://example.test/scene.ssproj",
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
		prioritizedAssets: [],
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
		t: overrides.t ?? ((key) => key),
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
		isProjectFilePackedSplatSource: (source) =>
			source?.sourceType === "packed-splat",
		isProjectFileLazyResourceSource:
			overrides.isProjectFileLazyResourceSource ?? (() => false),
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
		loadSplatFromSource:
			overrides.loadSplatFromSource ??
			(async (source) => {
				calls.loadedSplats.push(source);
				return {
					id:
						typeof source === "string"
							? source
							: (source.fileName ?? source.name),
					kind: "splat",
				};
			}),
		loadModelFromSource:
			overrides.loadModelFromSource ??
			(async (source) => {
				calls.loadedModels.push(source);
				return {
					id:
						typeof source === "string"
							? source
							: (source.fileName ?? source.name),
					kind: "model",
				};
			}),
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
		prioritizeImportedSceneAssets: (assets) => {
			calls.prioritizedAssets.push(assets);
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
	assert.deepEqual(calls.prioritizedAssets, []);
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
	const { runtime, calls, store } = createHarness();
	store.remoteUrl.value = "https://example.test/remote-scene.ssproj";
	await runtime.loadRemoteUrls();
	assert.deepEqual(calls.openProjectSources, [
		"https://example.test/remote-scene.ssproj",
	]);
	assert.equal(calls.loadedModels.length, 0);
	assert.equal(calls.loadedSplats.length, 0);
	assert.equal(store.remoteUrl.value, "");
}

{
	const { runtime, calls } = createHarness();
	const packedProjectSource = {
		sourceType: "packed-splat",
		fileName: "split.rawsplat",
	};
	const imported = await runtime.loadSources([packedProjectSource], false);
	assert.equal(imported, undefined);
	assert.deepEqual(calls.loadedSplats, [packedProjectSource]);
	assert.equal(calls.loadedModels.length, 0);
}

{
	const progressEvents = [];
	const t = (key, values = {}) =>
		`${key}:${Object.entries(values)
			.map(([name, value]) => `${name}=${value}`)
			.join(",")}`;
	const { runtime } = createHarness({
		t,
		loadSplatFromSource: async (source, options = {}) => {
			options.onProgress?.({
				stage: "init-packed-splats",
				sourceKind: "raw-packed-splat",
			});
			return {
				id: source.name,
				kind: "splat",
			};
		},
	});
	await runtime.loadSources(
		[new File([new Uint8Array([1])], "timed.ply")],
		false,
		{
			onProgress: (...args) => progressEvents.push(args),
		},
	);
	const stageProgress = progressEvents.find(
		([step, detail]) =>
			step === "load" &&
			String(detail).startsWith("overlay.importDetailLoadAssetStage:"),
	);
	assert.ok(stageProgress, "splat load stage progress should be emitted");
	assert.match(
		stageProgress[1],
		/stage=overlay\.importLoadStage\.initPackedSplats/u,
	);
	assert.equal(stageProgress[2].index, 1);
	assert.equal(stageProgress[2].total, 1);
	assert.equal(stageProgress[2].name, "timed.ply");
	assert.equal(stageProgress[2].stage, "init-packed-splats");
	assert.equal(
		stageProgress[2].detailTiming.stageLabel,
		"overlay.importTimingStage:",
	);
	assert.equal(
		stageProgress[2].detailTiming.totalLabel,
		"overlay.importTimingTotal:",
	);
	assert.equal(typeof stageProgress[2].detailTiming.stageStartedAt, "number");
}

{
	const { runtime, calls } = createHarness({
		isProjectFileLazyResourceSource: (source) =>
			source?.sourceType === "project-file-lazy-resource",
	});
	const lazyPackedSource = {
		sourceType: "project-file-lazy-resource",
		kind: "splat",
		fileName: "meta.json",
	};
	await runtime.loadSources([lazyPackedSource], false);
	assert.deepEqual(calls.loadedSplats, [lazyPackedSource]);
	assert.equal(
		calls.loadedModels.length,
		0,
		"lazy packed-splat sources should route by kind, not by .json extension",
	);
}

{
	const { runtime, calls } = createHarness({
		sceneAssetCount: 2,
	});
	const glb = new File([new Uint8Array([1])], "model.glb");
	const ply = new File([new Uint8Array([1])], "cloud.ply");
	await runtime.loadSources([glb, ply], false, {
		prioritizeNewAssets: true,
	});
	assert.equal(calls.prioritizedAssets.length, 1);
	assert.deepEqual(
		calls.prioritizedAssets[0].map((asset) => asset.id),
		["model.glb", "cloud.ply"],
	);
}

{
	let activeLoads = 0;
	let maxActiveLoads = 0;
	const { runtime } = createHarness({
		loadModelFromSource: async (source) => {
			activeLoads += 1;
			maxActiveLoads = Math.max(maxActiveLoads, activeLoads);
			await new Promise((resolve) => setTimeout(resolve, 5));
			activeLoads -= 1;
			return {
				id: source.name,
				kind: "model",
			};
		},
	});
	await runtime.loadSources(
		[
			new File([new Uint8Array([1])], "a.glb"),
			new File([new Uint8Array([1])], "b.glb"),
			new File([new Uint8Array([1])], "c.glb"),
		],
		false,
		{ concurrency: 1 },
	);
	assert.equal(
		maxActiveLoads,
		1,
		"loadSources should honor concurrency=1 for package-open lazy materialization",
	);
}

{
	const { runtime, calls } = createHarness();
	await runtime.loadRemoteUrls();
	assert.deepEqual(calls.statuses, ["status.enterUrl"]);
}

console.log("✅ CAMERA_FRAMES scene asset import runtime tests passed!");
