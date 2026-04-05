import assert from "node:assert/strict";
import { PackedSplats, SplatMesh } from "@sparkjsdev/spark";
import * as THREE from "three";
import { createPerSplatEditControllerBindings } from "../src/app/per-splat-edit-controller-bindings.js";
import { createPerSplatEditController } from "../src/controllers/per-splat-edit-controller.js";
import { createCameraFramesStore } from "../src/store.js";

function createRectElement({
	left = 0,
	top = 0,
	width = 1000,
	height = 1000,
} = {}) {
	return {
		getBoundingClientRect() {
			return {
				left,
				top,
				width,
				height,
				right: left + width,
				bottom: top + height,
			};
		},
	};
}

function createHarness({
	mode = "viewport",
	camera = null,
	viewportRect = { left: 0, top: 0, width: 1000, height: 1000 },
	renderBoxRect = null,
} = {}) {
	const store = createCameraFramesStore();
	const calls = [];
	const guides = new THREE.Group();
	const selectionHighlightCalls = [];
	const viewportShell = createRectElement(viewportRect);
	const renderBox = renderBoxRect ? createRectElement(renderBoxRect) : null;
	const activeCamera =
		camera ??
		new THREE.PerspectiveCamera(
			90,
			viewportRect.width / viewportRect.height,
			0.1,
			1000,
		);
	activeCamera.position.set(0, 0, 5);
	activeCamera.lookAt(0, 0, 0);
	activeCamera.updateProjectionMatrix();
	activeCamera.updateMatrixWorld(true);
	const bindings = createPerSplatEditControllerBindings({
		store,
		state: { mode },
		guides,
		viewportShell,
		renderBox,
		t: (key, values = {}) =>
			key === "status.splatEditEnabled"
				? `enabled:${values.count}`
				: key === "status.splatEditSelectionAdded"
					? `added:${values.count}`
					: key === "status.splatEditSelectionRemoved"
						? `removed:${values.count}`
						: key,
		setStatus: (message) => calls.push(["status", message]),
		updateUi: () => calls.push(["update-ui"]),
		getAssetController: () => ({
			getSceneAssets: () => store.sceneAssets.value,
		}),
		getActiveCamera: () => activeCamera,
		selectionHighlightController: {
			sync: (payload) => selectionHighlightCalls.push(["sync", payload]),
			clear: () => selectionHighlightCalls.push(["clear"]),
			dispose: () => selectionHighlightCalls.push(["dispose"]),
		},
		setViewportSelectMode: (nextValue) =>
			calls.push(["select-mode", nextValue]),
		setViewportReferenceImageEditMode: (nextValue) =>
			calls.push(["reference-mode", nextValue]),
		setViewportTransformMode: (nextValue) =>
			calls.push(["transform-mode", nextValue]),
		setViewportPivotEditMode: (nextValue) =>
			calls.push(["pivot-mode", nextValue]),
		setMeasurementMode: (nextValue, options) =>
			calls.push(["measurement-mode", nextValue, options]),
		getInteractionController: () => ({
			applyNavigateInteractionMode: (options) =>
				calls.push(["navigate-mode", options]),
			syncControlsToMode: () => calls.push(["sync-controls"]),
		}),
	});
	return {
		store,
		calls,
		guides,
		selectionHighlightCalls,
		controller: createPerSplatEditController(bindings),
	};
}

function createSplatAsset({
	id,
	centers,
	centerBounds = null,
	position = new THREE.Vector3(),
	meshPosition = new THREE.Vector3(),
} = {}) {
	const object = new THREE.Group();
	object.position.copy(position);
	object.updateMatrixWorld(true);
	const contentObject = new THREE.Group();
	object.add(contentObject);
	const mesh = new THREE.Group();
	mesh.position.copy(meshPosition);
	contentObject.add(mesh);
	contentObject.updateMatrixWorld(true);
	mesh.updateMatrixWorld(true);
	mesh.forEachSplat = function forEachSplat(callback) {
		centers.forEach((center, index) => callback(index, center.clone()));
	};
	mesh.getBoundingBox = function getBoundingBox() {
		return centerBounds?.clone?.() ?? null;
	};
	return {
		id,
		kind: "splat",
		object,
		contentObject,
		localCenterBoundsHint: centerBounds,
		disposeTarget: mesh,
	};
}

{
	const harness = createHarness();
	harness.store.sceneAssets.value = [
		{ id: "model-1", kind: "model" },
		{ id: "splat-1", kind: "splat" },
		{ id: "splat-2", kind: "splat" },
	];
	harness.store.selectedSceneAssetIds.value = ["model-1", "splat-2", "splat-1"];

	assert.equal(harness.controller.setSplatEditMode(true), true);
	assert.equal(harness.store.viewportToolMode.value, "splat-edit");
	assert.deepEqual(harness.store.splatEdit.scopeAssetIds.value, [
		"splat-2",
		"splat-1",
	]);
	assert.deepEqual(harness.store.splatEdit.rememberedScopeAssetIds.value, [
		"splat-2",
		"splat-1",
	]);
	assert.deepEqual(harness.controller.getSplatEditScopeAssetIds(), [
		"splat-2",
		"splat-1",
	]);
	assert.equal(harness.controller.isSplatEditModeActive(), true);
	assert.deepEqual(harness.calls.slice(0, 6), [
		["measurement-mode", false, { silent: true }],
		["select-mode", false],
		["reference-mode", false],
		["transform-mode", false],
		["pivot-mode", false],
		["navigate-mode", { silent: true }],
	]);
	assert.ok(
		harness.calls.some(
			(entry) => Array.isArray(entry) && entry[0] === "sync-controls",
		),
	);
	assert.deepEqual(harness.calls.at(-1), ["status", "enabled:2"]);
}

{
	const harness = createHarness();
	harness.store.sceneAssets.value = [{ id: "splat-1", kind: "splat" }];
	harness.store.selectedSceneAssetIds.value = ["splat-1"];
	harness.store.splatEdit.tool.value = "brush";

	assert.equal(
		harness.controller.setSplatEditMode(true, { silent: true }),
		true,
	);
	assert.equal(harness.store.splatEdit.tool.value, "box");
}

{
	const harness = createHarness();
	harness.store.sceneAssets.value = [{ id: "splat-1", kind: "splat" }];

	assert.equal(harness.controller.setSplatEditMode(true), false);
	assert.equal(harness.store.viewportToolMode.value, "none");
	assert.deepEqual(harness.calls.at(-1), [
		"status",
		"status.splatEditRequiresScope",
	]);
}

{
	const harness = createHarness();
	harness.store.sceneAssets.value = [
		{ id: "splat-1", kind: "splat" },
		{ id: "splat-2", kind: "splat" },
	];
	harness.store.selectedSceneAssetIds.value = ["splat-2"];

	assert.equal(
		harness.controller.setSplatEditMode(true, { silent: true }),
		true,
	);
	assert.equal(
		harness.controller.setSplatEditMode(false, { silent: true }),
		true,
	);
	harness.store.selectedSceneAssetIds.value = [];
	assert.equal(
		harness.controller.setSplatEditMode(true, { silent: true }),
		true,
	);
	assert.deepEqual(harness.store.splatEdit.scopeAssetIds.value, ["splat-2"]);
	harness.controller.resetForSceneChange();
	assert.deepEqual(harness.store.splatEdit.scopeAssetIds.value, []);
	assert.deepEqual(harness.store.splatEdit.rememberedScopeAssetIds.value, []);
	assert.equal(harness.store.viewportToolMode.value, "none");
}

{
	const harness = createHarness();
	const scopeBounds = new THREE.Box3(
		new THREE.Vector3(-1, -2, -3),
		new THREE.Vector3(3, 4, 1),
	);
	harness.store.sceneAssets.value = [
		createSplatAsset({
			id: "splat-1",
			centers: [new THREE.Vector3(0, 0, 0)],
			centerBounds: scopeBounds,
		}),
	];
	harness.store.selectedSceneAssetIds.value = ["splat-1"];

	assert.equal(
		harness.controller.setSplatEditMode(true, { silent: true }),
		true,
	);
	assert.deepEqual(harness.store.splatEdit.boxCenter.value, {
		x: 0,
		y: 0,
		z: 1,
	});
	assert.deepEqual(harness.store.splatEdit.boxSize.value, {
		x: 1,
		y: 1,
		z: 1,
	});
}

{
	const harness = createHarness();
	harness.store.sceneAssets.value = [
		createSplatAsset({
			id: "splat-1",
			centers: [
				new THREE.Vector3(0, 0, 0),
				new THREE.Vector3(0.75, 0, 0),
				new THREE.Vector3(3, 0, 0),
			],
			centerBounds: new THREE.Box3(
				new THREE.Vector3(-0.5, -0.5, -0.5),
				new THREE.Vector3(3.5, 0.5, 0.5),
			),
		}),
	];
	harness.store.selectedSceneAssetIds.value = ["splat-1"];

	assert.equal(
		harness.controller.setSplatEditMode(true, { silent: true }),
		true,
	);
	assert.equal(harness.controller.setSplatEditBoxCenterAxis("x", 0.5), true);
	assert.equal(harness.controller.setSplatEditBoxSizeAxis("x", 2), true);
	assert.equal(
		harness.controller.applySplatEditBoxSelection({ subtract: false }),
		2,
	);
	assert.equal(harness.store.splatEdit.selectionCount.value, 2);
	assert.equal(harness.selectionHighlightCalls.at(-1)?.[0], "sync");
	assert.deepEqual(harness.calls.at(-1), ["status", "added:2"]);
	assert.equal(
		harness.controller.applySplatEditBoxSelection({ subtract: true }),
		2,
	);
	assert.equal(harness.store.splatEdit.selectionCount.value, 0);
	assert.equal(harness.selectionHighlightCalls.at(-1)?.[0], "sync");
	assert.deepEqual(harness.calls.at(-1), ["status", "removed:2"]);
}

{
	const harness = createHarness();
	harness.store.sceneAssets.value = [
		createSplatAsset({
			id: "splat-1",
			centers: [new THREE.Vector3(0, 0, 0)],
			centerBounds: new THREE.Box3(
				new THREE.Vector3(-0.5, -0.5, -0.5),
				new THREE.Vector3(0.5, 0.5, 0.5),
			),
			meshPosition: new THREE.Vector3(10, 0, 0),
		}),
	];
	harness.store.selectedSceneAssetIds.value = ["splat-1"];

	assert.equal(
		harness.controller.setSplatEditMode(true, { silent: true }),
		true,
	);
	assert.equal(harness.controller.setSplatEditBoxCenterAxis("x", 10), true);
	assert.equal(harness.controller.setSplatEditBoxSizeAxis("x", 2), true);
	assert.equal(
		harness.controller.applySplatEditBoxSelection({ subtract: false }),
		1,
	);
	assert.equal(harness.store.splatEdit.selectionCount.value, 1);
}

{
	const harness = createHarness();
	harness.store.sceneAssets.value = [
		createSplatAsset({
			id: "splat-1",
			centers: [new THREE.Vector3(0, 0, 0)],
			centerBounds: new THREE.Box3(
				new THREE.Vector3(-0.5, -0.5, -0.5),
				new THREE.Vector3(0.5, 0.5, 0.5),
			),
		}),
		createSplatAsset({
			id: "splat-2",
			centers: [new THREE.Vector3(10, 0, 0)],
			centerBounds: new THREE.Box3(
				new THREE.Vector3(9.5, -0.5, -0.5),
				new THREE.Vector3(10.5, 0.5, 0.5),
			),
		}),
	];
	harness.store.selectedSceneAssetIds.value = ["splat-1"];

	assert.equal(
		harness.controller.setSplatEditMode(true, { silent: true }),
		true,
	);
	assert.deepEqual(harness.store.splatEdit.scopeAssetIds.value, ["splat-1"]);
	const initialBoxCenter = { ...harness.store.splatEdit.boxCenter.value };
	harness.store.selectedSceneAssetIds.value = ["splat-2"];
	assert.equal(harness.controller.syncScopeToSceneSelection(), true);
	assert.deepEqual(harness.store.splatEdit.scopeAssetIds.value, ["splat-2"]);
	assert.deepEqual(harness.store.splatEdit.rememberedScopeAssetIds.value, [
		"splat-2",
	]);
	assert.deepEqual(harness.store.splatEdit.boxCenter.value, initialBoxCenter);
}

{
	const camera = new THREE.PerspectiveCamera(90, 1.4, 0.1, 1000);
	camera.position.set(0, 0, 5);
	camera.lookAt(0, 0, 0);
	camera.updateProjectionMatrix();
	camera.updateMatrixWorld(true);
	const harness = createHarness({
		mode: "camera",
		camera,
		viewportRect: { left: 0, top: 0, width: 1400, height: 1000 },
		renderBoxRect: { left: 100, top: 100, width: 800, height: 800 },
	});
	harness.store.sceneAssets.value = [
		createSplatAsset({
			id: "splat-1",
			centers: [new THREE.Vector3(0, 0, 0)],
			centerBounds: new THREE.Box3(
				new THREE.Vector3(-10, -10, -1),
				new THREE.Vector3(10, 10, 1),
			),
		}),
	];
	harness.store.selectedSceneAssetIds.value = ["splat-1"];

	assert.equal(
		harness.controller.setSplatEditMode(true, { silent: true }),
		true,
	);
	assert.ok(
		harness.store.splatEdit.boxCenter.value.x < -0.5,
		"camera mode should use render box center instead of viewport shell center",
	);
}

{
	const harness = createHarness();
	harness.store.sceneAssets.value = [
		createSplatAsset({
			id: 7,
			centers: [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.25, 0, 0)],
			centerBounds: new THREE.Box3(
				new THREE.Vector3(-0.5, -0.5, -0.5),
				new THREE.Vector3(0.5, 0.5, 0.5),
			),
		}),
	];
	harness.store.selectedSceneAssetIds.value = [7];

	assert.equal(
		harness.controller.setSplatEditMode(true, { silent: true }),
		true,
	);
	assert.deepEqual(harness.store.splatEdit.scopeAssetIds.value, ["7"]);
	assert.equal(
		harness.controller.applySplatEditBoxSelection({ subtract: false }),
		2,
	);
	assert.equal(harness.store.splatEdit.selectionCount.value, 2);
}

{
	const harness = createHarness();
	const packed = new PackedSplats({
		packedArray: new Uint32Array(0),
		numSplats: 0,
	});
	await packed.initialized;
	packed.pushSplat(
		new THREE.Vector3(0, 0, 0),
		new THREE.Vector3(0.1, 0.1, 0.1),
		new THREE.Quaternion(),
		1,
		new THREE.Color(1, 0, 0),
	);
	packed.pushSplat(
		new THREE.Vector3(1, 0, 0),
		new THREE.Vector3(0.1, 0.1, 0.1),
		new THREE.Quaternion(),
		1,
		new THREE.Color(0, 1, 0),
	);
	packed.needsUpdate = true;
	const mesh = new SplatMesh({ packedSplats: packed, lod: true });
	mesh.enableWorldToView = true;
	await mesh.initialized;
	const object = new THREE.Group();
	object.add(mesh);
	object.updateMatrixWorld(true);
	mesh.updateMatrixWorld(true);

	harness.store.sceneAssets.value = [
		{
			id: "spark-splat",
			kind: "splat",
			object,
			contentObject: object,
			disposeTarget: mesh,
			localCenterBoundsHint: mesh.getBoundingBox(true),
		},
	];
	harness.store.selectedSceneAssetIds.value = ["spark-splat"];

	assert.equal(
		harness.controller.setSplatEditMode(true, { silent: true }),
		true,
	);
	assert.equal(
		harness.controller.applySplatEditBoxSelection({ subtract: false }),
		1,
	);
	assert.equal(harness.store.splatEdit.selectionCount.value, 1);
}

console.log("✅ CAMERA_FRAMES per-splat edit controller tests passed!");
