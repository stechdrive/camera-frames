import assert from "node:assert/strict";
import { SplatMesh } from "@sparkjsdev/spark";
import * as THREE from "three";
import { createAssetControllerBindings } from "../src/app/asset-controller-bindings.js";
import { createAssetController } from "../src/controllers/asset-controller.js";
import { createProjectFileEmbeddedFileSource } from "../src/project/document.js";
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

console.log("✅ CAMERA_FRAMES asset controller public API tests passed!");
