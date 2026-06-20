import assert from "node:assert/strict";
import * as THREE from "three";
import { createAssetControllerBindings } from "../src/app/asset-controller-bindings.js";
import { createAssetController } from "../src/controllers/asset-controller.js";
import { SplatMesh } from "../src/engine/spark-integration/spark-symbols.js";
import { createSplatSelectionHighlightController } from "../src/engine/splat-selection-highlight.js";
import {
	PROJECT_FILE_PACKED_SPLAT_FULL_DATA_POLICY_DERIVE_FROM_RAD,
	createProjectFileEmbeddedFileSource,
	createProjectFilePackedSplatSource,
} from "../src/project/document.js";
import { materializeRadBundleToPackedSplatData } from "../src/project/file/rad-unlod.js";
import { createCameraFramesStore } from "../src/store.js";
import { createSyntheticRadBundle } from "./helpers/rad-bundle-fixture.ts";

class FakeRgbaArray {
	constructor({ array, count, capacity } = {}) {
		this.array = array ?? new Uint8Array((count ?? 0) * 4);
		this.count = count ?? 0;
		this.capacity = capacity ?? this.count;
		this.needsUpdate = false;
		this.texture = { needsUpdate: false };
	}

	getTexture() {
		this.texture.needsUpdate = true;
		return this.texture;
	}

	dispose() {}
}

function createAssetControllerForPublicApiTest({
	gltfLoader = {
		loadAsync: async () => ({
			scene: new THREE.Group(),
			scenes: [new THREE.Group()],
		}),
	},
	fbxLoader = {
		loadAsync: async () => new THREE.Group(),
	},
} = {}) {
	const store = createCameraFramesStore();
	const sceneState = { assets: [], nextAssetId: 1 };
	const statusEvents = [];
	const controller = createAssetController(
		createAssetControllerBindings({
			sceneState,
			assetInput: { click() {} },
			store,
			loader: gltfLoader,
			modelLoaders: {
				gltf: gltfLoader,
				fbx: fbxLoader,
			},
			splatRoot: new THREE.Group(),
			modelRoot: new THREE.Group(),
			contentRoot: new THREE.Group(),
			SplatMesh,
			setStatus: (message) => {
				statusEvents.push(message);
			},
			updateUi: () => {},
			updateCameraSummary: () => {},
			frameAllCameras: () => {},
			placeAllCamerasAtHome: () => {},
			resetLocalizedCaches: () => {},
			setExportStatus: () => {},
			t: (key) => key,
			formatAssetWorldScale: (value) => String(value),
			getDefaultAssetUnitMode: () => "meters",
			isProjectPackageSource: () => false,
			extractProjectPackageAssets: () => [],
			applyProjectPackageImport: () => {},
			projectController: {
				openProjectSource: async () => {},
			},
			disposeObject: () => {},
			historyController: {
				runHistoryAction: (_label, operation) => operation?.(),
				beginHistoryTransaction: () => false,
				commitHistoryTransaction: () => false,
				cancelHistoryTransaction: () => {},
				clearHistory: () => {},
			},
			getPerSplatEditController: () => null,
		}),
	);
	return {
		controller,
		sceneState,
		store,
		statusEvents,
	};
}

{
	const gltfCalls = [];
	const fbxCalls = [];
	const harness = createAssetControllerForPublicApiTest({
		gltfLoader: {
			loadAsync: async (url) => {
				gltfCalls.push(url);
				return {
					scene: new THREE.Group(),
					scenes: [],
				};
			},
		},
		fbxLoader: {
			loadAsync: async (url) => {
				fbxCalls.push(url);
				return new THREE.Group();
			},
		},
	});

	await harness.controller.loadModelFromSource(
		createProjectFileEmbeddedFileSource({
			kind: "model",
			file: new File([new Uint8Array([1])], "robot.glb", {
				type: "model/gltf-binary",
			}),
			fileName: "robot.glb",
		}),
	);
	await harness.controller.loadModelFromSource(
		createProjectFileEmbeddedFileSource({
			kind: "model",
			file: new File([new Uint8Array([2])], "prop.fbx", {
				type: "model/fbx",
			}),
			fileName: "prop.fbx",
		}),
	);

	assert.equal(gltfCalls.length, 1);
	assert.equal(fbxCalls.length, 1);
	assert.deepEqual(
		harness.sceneState.assets.map((asset) => asset.label),
		["robot.glb", "prop.fbx"],
	);
}

{
	const { controller } = createAssetControllerForPublicApiTest();

	assert.equal(typeof controller.createSplatAssetFromSource, "function");
	assert.equal(typeof controller.replaceSplatAssetFromSource, "function");
	assert.equal(typeof controller.removeSceneAssets, "function");
	assert.equal(typeof controller.duplicateSelectedSceneAssets, "function");
	assert.equal(typeof controller.ensureFullDataForSplatAssets, "function");
}

{
	const harness = createAssetControllerForPublicApiTest();
	const bakeCalls = [];
	const timeoutCalls = [];
	const packedSplats = {
		numSplats: 1_000_000,
		lodSplats: null,
		needsUpdate: false,
		createLodSplats: async ({ quality = false } = {}) => {
			bakeCalls.push({ quality });
			packedSplats.lodSplats = {
				packedArray: new Uint32Array([1, 2, 3, 4]),
				numSplats: 1,
			};
		},
	};
	const mesh = {
		numSplats: 0,
		raycastIndices: {
			numSplats: 1,
			indices: new Uint32Array([0]),
		},
		context: {
			splats: null,
			numSplats: { value: 0 },
			enableLod: { value: true },
		},
		generatorDirty: false,
		updateGeneratorCalls: 0,
		updateVersionCalls: 0,
		updateGenerator() {
			this.updateGeneratorCalls += 1;
		},
		updateVersion() {
			this.updateVersionCalls += 1;
		},
	};
	const originalSetTimeout = globalThis.setTimeout;
	globalThis.setTimeout = ((_callback, delay) => {
		timeoutCalls.push(delay);
		return 0;
	}) as typeof setTimeout;
	try {
		harness.controller.kickAutoLodBake(packedSplats, "LoD Target", mesh);
		await Promise.resolve();
		await Promise.resolve();
	} finally {
		globalThis.setTimeout = originalSetTimeout;
	}

	assert.deepEqual(bakeCalls, [{ quality: false }]);
	assert.equal(packedSplats.needsUpdate, true);
	assert.equal(mesh.raycastIndices, undefined);
	assert.equal(mesh.splats, packedSplats);
	assert.equal(mesh.context.splats, packedSplats);
	assert.equal(mesh.context.numSplats.value, packedSplats.numSplats);
	assert.equal(mesh.context.enableLod.value, false);
	assert.equal(mesh.updateGeneratorCalls, 1);
	assert.equal(mesh.updateVersionCalls, 1);
	assert.deepEqual(timeoutCalls, [2000]);
}

{
	const harness = createAssetControllerForPublicApiTest();
	const source = createProjectFileEmbeddedFileSource({
		kind: "model",
		file: new File([new Uint8Array([1, 2, 3, 4])], "robot.glb", {
			type: "model/gltf-binary",
		}),
		fileName: "robot.glb",
	});
	const createdAsset = await harness.controller.loadModelFromSource(source);
	harness.controller.selectSceneAsset(createdAsset.id);

	const duplicatedCount =
		await harness.controller.duplicateSelectedSceneAssets();

	assert.equal(duplicatedCount, 1);
	assert.deepEqual(
		harness.sceneState.assets.map((asset) => asset.label),
		["robot.glb", "robot.glb Copy"],
	);
	assert.deepEqual(harness.store.selectedSceneAssetIds.value, [2]);
	assert.equal(harness.store.selectedSceneAssetId.value, 2);
	assert.equal(harness.statusEvents.at(-1), "status.duplicatedSceneAsset");
}

{
	const harness = createAssetControllerForPublicApiTest();
	let fullDataLoads = 0;
	const source = createProjectFilePackedSplatSource({
		fileName: "lod-first.rawsplat",
		packedArray: new Uint32Array(),
		numSplats: 2,
		lodSplats: {
			packedArray: new Uint32Array([9, 9, 9, 9]),
			numSplats: 1,
			extra: {
				lodTree: new Uint32Array([1, 2]),
			},
		},
		previewPackedSplats: {
			packedArray: new Uint32Array([9, 9, 9, 9]),
			numSplats: 1,
			extra: {
				lodTree: new Uint32Array([1, 2]),
			},
		},
		deferredFullData: {
			async loadFullData() {
				fullDataLoads += 1;
				return {
					packedArray: new Uint32Array([1, 2, 3, 4, 5, 6, 7, 8]),
					numSplats: 2,
					extra: {
						sh1: new Uint32Array([11, 12]),
					},
					splatEncoding: null,
					lodSplats: {
						packedArray: new Uint32Array([9, 9, 9, 9]),
						numSplats: 1,
						extra: {
							lodTree: new Uint32Array([1, 2]),
						},
					},
				};
			},
		},
		skipClone: true,
	});
	const createdAsset =
		await harness.controller.createSplatAssetFromSource(source);

	assert.equal(
		fullDataLoads,
		1,
		"deferred FullData should be materialized before creating the runtime splat asset",
	);
	assert.deepEqual(
		Array.from(createdAsset.disposeTarget.packedSplats.packedArray),
		[1, 2, 3, 4, 5, 6, 7, 8],
		"runtime splat asset should render from FullData, not the baked LoD preview",
	);

	await harness.controller.ensureFullDataForSplatAssets([createdAsset.id]);
	await harness.controller.ensureFullDataForSplatAssets([createdAsset.id]);

	assert.equal(fullDataLoads, 1);
	assert.deepEqual(
		Array.from(createdAsset.disposeTarget.packedSplats.packedArray),
		[1, 2, 3, 4, 5, 6, 7, 8],
		"FullData ensure should swap the runtime splat mesh onto the full packedArray",
	);
	assert.deepEqual(Array.from(createdAsset.source.extra.sh1), [11, 12]);
	assert.deepEqual(
		Array.from(createdAsset.source.lodSplats.packedArray),
		[9, 9, 9, 9],
		"FullData ensure should keep the baked LoD bundle on the persistent source",
	);
}

{
	const harness = createAssetControllerForPublicApiTest();
	let fullDataLoads = 0;
	const source = createProjectFilePackedSplatSource({
		fileName: "rad-backed.rawsplat",
		packedArray: new Uint32Array(),
		numSplats: 1,
		radBundle: {
			kind: "spark-rad-bundle",
			version: 1,
			root: {
				name: "rad-backed-lod-0.rad",
				blob: new Blob([new Uint8Array([0x52, 0x41, 0x44, 0x30])]),
			},
			chunks: [],
		},
		deferredFullData: {
			async loadFullData() {
				fullDataLoads += 1;
				return {
					packedArray: new Uint32Array([201, 202, 203, 204]),
					numSplats: 1,
					extra: {},
					splatEncoding: null,
					lodSplats: null,
				};
			},
		},
		skipClone: true,
	});
	const originalWarn = console.warn;
	const warnings = [];
	console.warn = (...args) => warnings.push(args);
	let createdAsset = null;
	try {
		createdAsset = await harness.controller.createSplatAssetFromSource(source);
	} finally {
		console.warn = originalWarn;
	}

	assert.equal(
		fullDataLoads,
		1,
		"RAD-backed assets must fall back to FullData when Service Worker streaming is unavailable",
	);
	assert.deepEqual(
		Array.from(createdAsset.disposeTarget.packedSplats.packedArray),
		[201, 202, 203, 204],
	);
	assert.equal(
		createdAsset.source.radBundle,
		null,
		"fallback FullData source must not keep the stale RAD bundle",
	);
	assert.equal(warnings.length, 1);
}

{
	const harness = createAssetControllerForPublicApiTest();
	const packedArray = new Uint32Array([
		0x01020304, 0x05060708, 0x090a0b0c, 0x0d0e0f10, 0x11121314, 0x15161718,
		0x191a1b1c, 0x1d1e1f20, 0x21222324, 0x25262728, 0x292a2b2c, 0x2d2e2f30,
	]);
	const radBundle = createSyntheticRadBundle({
		packedArray,
		numSplats: 3,
		splatEncoding: { rgbMin: 0, rgbMax: 1, lodOpacity: true },
		childCounts: new Uint16Array([2, 0, 0]),
	});
	let fullDataLoads = 0;
	let runtimeUnregisters = 0;
	const source = createProjectFilePackedSplatSource({
		fileName: "rad-only-unlod.rawsplat",
		packedArray: new Uint32Array(),
		numSplats: 3,
		radBundle,
		fullDataPolicy: PROJECT_FILE_PACKED_SPLAT_FULL_DATA_POLICY_DERIVE_FROM_RAD,
		deferredFullData: {
			async loadFullData() {
				fullDataLoads += 1;
				return await materializeRadBundleToPackedSplatData(radBundle);
			},
		},
		skipClone: true,
	});
	const mesh = {
		paged: { dispose() {} },
		enableLod: true,
		context: {
			splats: null,
			numSplats: { value: 0 },
			enableLod: { value: true },
		},
		updateGeneratorCalls: 0,
		updateVersionCalls: 0,
		updateGenerator() {
			this.updateGeneratorCalls += 1;
		},
		updateVersion() {
			this.updateVersionCalls += 1;
		},
		forEachSplat(callback) {
			const count =
				this.packedSplats?.getNumSplats?.() ??
				this.packedSplats?.numSplats ??
				0;
			for (let index = 0; index < count; index += 1) {
				callback(index, null, null, null, 1, { r: 0.1, g: 0.2, b: 0.3 });
			}
		},
	};
	const asset = {
		id: "rad-only-highlight",
		kind: "splat",
		label: "RAD-only highlight",
		object: new THREE.Group(),
		contentObject: new THREE.Group(),
		disposeTarget: mesh,
		source,
		radBundleRuntime: {
			async unregister() {
				runtimeUnregisters += 1;
			},
		},
	};
	harness.sceneState.assets.push(asset);

	await harness.controller.ensureFullDataForSplatAssets([asset.id]);

	assert.equal(fullDataLoads, 1);
	assert.equal(runtimeUnregisters, 1);
	assert.equal(mesh.paged, undefined);
	assert.ok(mesh.packedSplats, "RAD-only ensure must attach PackedSplats");
	assert.equal(mesh.splats, mesh.packedSplats);
	assert.equal(mesh.context.splats, mesh.packedSplats);
	assert.equal(mesh.context.enableLod.value, false);
	assert.equal(asset.source.radBundle, null);
	assert.equal(asset.source.fullDataPolicy, null);
	assert.equal(asset.source.lodSplats, null);
	assert.equal(asset.source.extra.lodTree, undefined);
	assert.equal(asset.source.numSplats, 2);
	assert.equal(
		asset.source.splatEncoding?.lodOpacity,
		false,
		"RAD-only ensure must switch to a non-LoD editable encoding.",
	);

	const highlightController = createSplatSelectionHighlightController({
		RgbaArrayImpl: FakeRgbaArray,
		highlightRgba: { r: 255, g: 0, b: 0 },
		highlightMix: 1,
	});
	highlightController.sync({
		scopeAssets: [asset],
		selectedSplatsByAssetId: new Map([[String(asset.id), new Set([0])]]),
	});

	assert.ok(mesh.splatRgba instanceof FakeRgbaArray);
	assert.equal(mesh.splatRgba.count, 2);
	assert.equal(mesh.enableLod, false);
	assert.deepEqual(
		Array.from(mesh.splatRgba.array.slice(0, 4)),
		[255, 0, 0, 255],
	);
	highlightController.clear();
	assert.equal(mesh.enableLod, true);
}

console.log("✅ CAMERA_FRAMES asset controller public API tests passed!");
