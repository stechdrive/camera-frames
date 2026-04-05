import assert from "node:assert/strict";
import { SplatMesh } from "@sparkjsdev/spark";
import * as THREE from "three";
import { createAssetControllerBindings } from "../src/app/asset-controller-bindings.js";
import { createAssetController } from "../src/controllers/asset-controller.js";
import { createCameraFramesStore } from "../src/store.js";

function createAssetControllerForPublicApiTest() {
	const store = createCameraFramesStore();
	const sceneState = { assets: [], nextAssetId: 1 };
	return createAssetController(
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
			setStatus: () => {},
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
				beginHistoryTransaction: () => {},
				commitHistoryTransaction: () => {},
				cancelHistoryTransaction: () => {},
				clearHistory: () => {},
			},
			getPerSplatEditController: () => null,
		}),
	);
}

{
	const controller = createAssetControllerForPublicApiTest();

	assert.equal(typeof controller.createSplatAssetFromSource, "function");
	assert.equal(typeof controller.replaceSplatAssetFromSource, "function");
	assert.equal(typeof controller.removeSceneAssets, "function");
}

console.log("✅ CAMERA_FRAMES asset controller public API tests passed!");
