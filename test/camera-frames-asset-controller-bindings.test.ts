import assert from "node:assert/strict";
import { createAssetControllerBindings } from "../src/app/asset-controller-bindings.js";

{
	const calls = {
		openProjectSource: [],
	};
	const historyController = {
		runHistoryAction: () => "run",
		beginHistoryTransaction: () => "begin",
		commitHistoryTransaction: () => "commit",
		cancelHistoryTransaction: () => "cancel",
		clearHistory: () => "clear",
	};
	const bindings = createAssetControllerBindings({
		sceneState: { id: "scene-state" },
		assetInput: { id: "asset-input" },
		store: { id: "store" },
		loader: { id: "loader" },
		splatRoot: { id: "splat-root" },
		modelRoot: { id: "model-root" },
		contentRoot: { id: "content-root" },
		SplatMesh: { id: "splat-mesh" },
		setStatus: () => "status",
		updateUi: () => "ui",
		updateCameraSummary: () => "camera-summary",
		frameAllCameras: () => "frame-all",
		placeAllCamerasAtHome: () => "home-all",
		resetLocalizedCaches: () => "reset-caches",
		setExportStatus: () => "export-status",
		t: () => "t",
		formatAssetWorldScale: () => "format-scale",
		getDefaultAssetUnitMode: () => "unit-mode",
		isProjectPackageSource: () => true,
		extractProjectPackageAssets: () => [],
		applyProjectPackageImport: () => "apply-package",
		projectController: {
			openProjectSource: (...args) => {
				calls.openProjectSource.push(args);
				return "opened";
			},
		},
		disposeObject: () => "dispose",
		historyController,
	});

	assert.equal(bindings.sceneState.id, "scene-state");
	assert.equal(bindings.assetInput.id, "asset-input");
	assert.equal(bindings.store.id, "store");
	assert.equal(bindings.loader.id, "loader");
	assert.equal(bindings.openProjectSource("a", "b"), "opened");
	assert.deepEqual(calls.openProjectSource, [["a", "b"]]);
	assert.equal(bindings.runHistoryAction(), "run");
	assert.equal(bindings.beginHistoryTransaction(), "begin");
	assert.equal(bindings.commitHistoryTransaction(), "commit");
	assert.equal(bindings.cancelHistoryTransaction(), "cancel");
	assert.equal(bindings.clearHistory(), "clear");
}

console.log("✅ CAMERA_FRAMES asset controller bindings tests passed!");
