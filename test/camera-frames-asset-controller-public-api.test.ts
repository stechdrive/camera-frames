import assert from "node:assert/strict";
import * as THREE from "three";
import { createAssetControllerBindings } from "../src/app/asset-controller-bindings.js";
import { createAssetController } from "../src/controllers/asset-controller.js";
import { SplatMesh } from "../src/engine/spark-integration/spark-symbols.js";
import {
	createProjectFileEmbeddedFileSource,
	createProjectFilePackedSplatSource,
} from "../src/project/document.js";
import { createCameraFramesStore } from "../src/store.js";

function createAssetControllerForPublicApiTest() {
	const store = createCameraFramesStore();
	const sceneState = { assets: [], nextAssetId: 1 };
	const statusEvents = [];
	const controller = createAssetController(
		createAssetControllerBindings({
			sceneState,
			assetInput: { click() {} },
			store,
			loader: {
				loadAsync: async () => ({
					scene: new THREE.Group(),
					scenes: [new THREE.Group()],
				}),
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
	const { controller } = createAssetControllerForPublicApiTest();

	assert.equal(typeof controller.createSplatAssetFromSource, "function");
	assert.equal(typeof controller.replaceSplatAssetFromSource, "function");
	assert.equal(typeof controller.removeSceneAssets, "function");
	assert.equal(typeof controller.duplicateSelectedSceneAssets, "function");
	assert.equal(typeof controller.ensureFullDataForSplatAssets, "function");
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
	const createdAsset = await harness.controller.createSplatAssetFromSource(
		source,
	);

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

console.log("✅ CAMERA_FRAMES asset controller public API tests passed!");
