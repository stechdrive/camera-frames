import assert from "node:assert/strict";
import { PackedSplats, SplatMesh } from "@sparkjsdev/spark";
import * as THREE from "three";
import { createPerSplatEditControllerBindings } from "../src/app/per-splat-edit-controller-bindings.js";
import { createPerSplatEditController } from "../src/controllers/per-splat-edit-controller.js";
import { createProjectFilePackedSplatSource } from "../src/project-document.js";
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

function computeExpectedSpawnPoint({
	camera,
	viewportRect,
	viewRect = viewportRect,
}) {
	const raycaster = new THREE.Raycaster();
	const pointerNdc = new THREE.Vector2(
		((viewRect.left + viewRect.width * 0.5 - viewportRect.left) /
			viewportRect.width) *
			2 -
			1,
		-(
			(viewRect.top + viewRect.height * 0.5 - viewportRect.top) /
			viewportRect.height
		) *
			2 +
			1,
	);
	raycaster.setFromCamera(pointerNdc, camera);
	return raycaster.ray.at(1, new THREE.Vector3());
}

function toPlainPoint(vector) {
	return {
		x: vector.x,
		y: vector.y,
		z: vector.z,
	};
}

function createHarness({
	mode = "viewport",
	camera = null,
	cameraViewCamera = null,
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
	const activeCameraViewCamera = cameraViewCamera ?? activeCamera;
	let createdAssetIndex = 1;
	const assetController = {
		getSceneAssets: () => store.sceneAssets.value,
		captureProjectSceneState: () =>
			store.sceneAssets.value.map((asset, index) => ({
				id: String(asset.id),
				kind: asset.kind,
				label: asset.label ?? `Asset ${index + 1}`,
				source: asset.source ?? null,
				transform: {
					position: {
						x: asset.object?.position?.x ?? 0,
						y: asset.object?.position?.y ?? 0,
						z: asset.object?.position?.z ?? 0,
					},
					quaternion: {
						x: asset.object?.quaternion?.x ?? 0,
						y: asset.object?.quaternion?.y ?? 0,
						z: asset.object?.quaternion?.z ?? 0,
						w: asset.object?.quaternion?.w ?? 1,
					},
				},
				contentTransform: null,
				baseScale: { x: 1, y: 1, z: 1 },
				worldScale: 1,
				unitMode: "meters",
				visible: asset.object?.visible !== false,
				exportRole: "beauty",
				maskGroup: "",
				workingPivotLocal: null,
				order: index,
			})),
		createSplatAssetFromSource: async (source, { insertIndex = null } = {}) => {
			const asset = createDerivedRuntimeAsset({
				id: `created-${createdAssetIndex++}`,
				label: source.projectAssetState?.label ?? source.fileName,
				source,
			});
			if (Number.isFinite(insertIndex)) {
				store.sceneAssets.value.splice(insertIndex, 0, asset);
			} else {
				store.sceneAssets.value.push(asset);
			}
			return asset;
		},
		replaceSplatAssetFromSource: async (assetId, source) => {
			const index = store.sceneAssets.value.findIndex(
				(asset) => String(asset.id) === String(assetId),
			);
			if (index === -1) {
				return null;
			}
			const asset = createDerivedRuntimeAsset({
				id: assetId,
				label: source.projectAssetState?.label ?? source.fileName,
				source,
			});
			store.sceneAssets.value[index] = asset;
			return asset;
		},
		removeSceneAssets: (assetIds = []) => {
			const deleteIds = new Set(assetIds.map(String));
			store.sceneAssets.value = store.sceneAssets.value.filter(
				(asset) => !deleteIds.has(String(asset.id)),
			);
			store.selectedSceneAssetIds.value =
				store.selectedSceneAssetIds.value.filter(
					(assetId) => !deleteIds.has(String(assetId)),
				);
			store.selectedSceneAssetId.value =
				store.selectedSceneAssetIds.value[0] ?? null;
			return true;
		},
		clearSceneAssetSelection: () => {
			store.selectedSceneAssetIds.value = [];
			store.selectedSceneAssetId.value = null;
		},
		selectSceneAsset: (assetId, { additive = false } = {}) => {
			if (additive) {
				const nextIds = new Set(store.selectedSceneAssetIds.value);
				nextIds.add(assetId);
				store.selectedSceneAssetIds.value = [...nextIds];
			} else {
				store.selectedSceneAssetIds.value = [assetId];
			}
			store.selectedSceneAssetId.value = assetId;
		},
	};
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
		getAssetController: () => assetController,
		getActiveCamera: () => activeCamera,
		getActiveCameraViewCamera: () => activeCameraViewCamera,
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
		activeCamera,
		activeCameraViewCamera,
		assetController,
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

function createDerivedRuntimeAsset({ id, label, source }) {
	const object = new THREE.Group();
	object.updateMatrixWorld(true);
	const contentObject = new THREE.Group();
	object.add(contentObject);
	const mesh = new THREE.Group();
	mesh.packedSplats = {
		numSplats: source.numSplats ?? 0,
	};
	contentObject.add(mesh);
	contentObject.updateMatrixWorld(true);
	mesh.updateMatrixWorld(true);
	return {
		id,
		kind: "splat",
		label,
		object,
		contentObject,
		disposeTarget: mesh,
		source,
		localCenterBoundsHint: null,
	};
}

async function createPackedSplatAsset({ id, label, centers }) {
	const packed = new PackedSplats({
		packedArray: new Uint32Array(0),
		numSplats: 0,
	});
	await packed.initialized;
	for (const center of centers) {
		packed.pushSplat(
			center,
			new THREE.Vector3(0.1, 0.1, 0.1),
			new THREE.Quaternion(),
			1,
			new THREE.Color(1, 1, 1),
		);
	}
	packed.needsUpdate = true;
	const mesh = new SplatMesh({ packedSplats: packed, lod: true });
	mesh.enableWorldToView = true;
	await mesh.initialized;
	const object = new THREE.Group();
	object.add(mesh);
	object.updateMatrixWorld(true);
	mesh.updateMatrixWorld(true);
	return {
		id,
		kind: "splat",
		label,
		object,
		contentObject: object,
		disposeTarget: mesh,
		source: createProjectFilePackedSplatSource({
			fileName: `${id}.rawsplat`,
			packedArray: packed.packedArray,
			numSplats: packed.numSplats,
			extra: packed.extra,
			splatEncoding: packed.splatEncoding,
			projectAssetState: {
				id: String(id),
				kind: "splat",
				label,
				transform: {
					position: { x: 0, y: 0, z: 0 },
					quaternion: { x: 0, y: 0, z: 0, w: 1 },
				},
				contentTransform: null,
				baseScale: { x: 1, y: 1, z: 1 },
				worldScale: 1,
				unitMode: "meters",
				visible: true,
				exportRole: "beauty",
				maskGroup: "",
				workingPivotLocal: null,
			},
		}),
		localCenterBoundsHint: mesh.getBoundingBox(true),
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
	harness.store.sceneAssets.value = [
		createSplatAsset({
			id: "splat-1",
			centers: [new THREE.Vector3(0, 0, 0)],
			centerBounds: new THREE.Box3(
				new THREE.Vector3(-1, -2, -3),
				new THREE.Vector3(3, 4, 1),
			),
		}),
	];
	harness.store.selectedSceneAssetIds.value = ["splat-1"];

	assert.equal(
		harness.controller.setSplatEditMode(true, { silent: true }),
		true,
	);
	assert.deepEqual(
		harness.store.splatEdit.boxCenter.value,
		toPlainPoint(
			computeExpectedSpawnPoint({
				camera: harness.activeCamera,
				viewportRect: { left: 0, top: 0, width: 1000, height: 1000 },
			}),
		),
	);
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
	harness.controller.setSplatEditBoxCenterAxis("x", 0.5);
	harness.controller.setSplatEditBoxCenterAxis("z", 0);
	harness.controller.setSplatEditBoxSizeAxis("x", 2);
	assert.equal(harness.store.splatEdit.boxCenter.value.x, 0.5);
	assert.equal(harness.store.splatEdit.boxSize.value.x, 2);
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
	harness.controller.setSplatEditBoxCenterAxis("x", 10);
	harness.controller.setSplatEditBoxCenterAxis("z", 0);
	harness.controller.setSplatEditBoxSizeAxis("x", 2);
	assert.equal(harness.store.splatEdit.boxCenter.value.x, 10);
	assert.equal(harness.store.splatEdit.boxSize.value.x, 2);
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
	const expectedCenter = computeExpectedSpawnPoint({
		camera,
		viewportRect: { left: 0, top: 0, width: 1400, height: 1000 },
		viewRect: { left: 100, top: 100, width: 800, height: 800 },
	});
	assert.ok(
		Math.abs(harness.store.splatEdit.boxCenter.value.x - expectedCenter.x) <
			1e-6,
	);
	assert.ok(
		Math.abs(harness.store.splatEdit.boxCenter.value.y - expectedCenter.y) <
			1e-6,
	);
	assert.ok(
		Math.abs(harness.store.splatEdit.boxCenter.value.z - expectedCenter.z) <
			1e-6,
	);
}

{
	const harnessA = createHarness();
	const harnessB = createHarness();
	harnessA.store.sceneAssets.value = [
		createSplatAsset({
			id: "splat-a",
			centers: [new THREE.Vector3(0, 0, 0)],
			centerBounds: new THREE.Box3(
				new THREE.Vector3(-100, -100, -100),
				new THREE.Vector3(-90, -90, -90),
			),
		}),
	];
	harnessB.store.sceneAssets.value = [
		createSplatAsset({
			id: "splat-b",
			centers: [new THREE.Vector3(0, 0, 0)],
			centerBounds: new THREE.Box3(
				new THREE.Vector3(250, 250, 250),
				new THREE.Vector3(260, 260, 260),
			),
		}),
	];
	harnessA.store.selectedSceneAssetIds.value = ["splat-a"];
	harnessB.store.selectedSceneAssetIds.value = ["splat-b"];

	assert.equal(
		harnessA.controller.setSplatEditMode(true, { silent: true }),
		true,
	);
	assert.equal(
		harnessB.controller.setSplatEditMode(true, { silent: true }),
		true,
	);
	assert.deepEqual(
		harnessA.store.splatEdit.boxCenter.value,
		harnessB.store.splatEdit.boxCenter.value,
		"initial box spawn should not change just because the selected splat asset changed",
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
	harness.controller.setSplatEditBoxCenterAxis("z", 0);
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
	harness.controller.setSplatEditBoxCenterAxis("z", 0);
	assert.equal(
		harness.controller.applySplatEditBoxSelection({ subtract: false }),
		1,
	);
	assert.equal(harness.store.splatEdit.selectionCount.value, 1);
}

{
	const harness = createHarness();
	const asset = await createPackedSplatAsset({
		id: "splat-delete",
		label: "Terrain",
		centers: [
			new THREE.Vector3(0, 0, 0),
			new THREE.Vector3(0.5, 0, 0),
			new THREE.Vector3(2, 0, 0),
		],
	});
	harness.store.sceneAssets.value = [asset];
	harness.store.selectedSceneAssetIds.value = [asset.id];
	harness.store.selectedSceneAssetId.value = asset.id;

	assert.equal(
		harness.controller.setSplatEditMode(true, { silent: true }),
		true,
	);
	harness.controller.setSplatEditBoxCenterAxis("x", 0.25);
	harness.controller.setSplatEditBoxCenterAxis("z", 0);
	harness.controller.setSplatEditBoxSizeAxis("x", 1.5);
	assert.equal(
		harness.controller.applySplatEditBoxSelection({ subtract: false }),
		2,
	);
	assert.equal(await harness.controller.deleteSelectedSplats(), 2);
	assert.equal(harness.store.sceneAssets.value.length, 1);
	assert.equal(harness.store.sceneAssets.value[0].id, "splat-delete");
	assert.equal(harness.store.sceneAssets.value[0].source.numSplats, 1);
	assert.equal(harness.store.splatEdit.selectionCount.value, 0);
}

{
	const harness = createHarness();
	const asset = await createPackedSplatAsset({
		id: "splat-separate",
		label: "Facade",
		centers: [
			new THREE.Vector3(0, 0, 0),
			new THREE.Vector3(0.5, 0, 0),
			new THREE.Vector3(2, 0, 0),
		],
	});
	harness.store.sceneAssets.value = [asset];
	harness.store.selectedSceneAssetIds.value = [asset.id];
	harness.store.selectedSceneAssetId.value = asset.id;

	assert.equal(
		harness.controller.setSplatEditMode(true, { silent: true }),
		true,
	);
	harness.controller.setSplatEditBoxCenterAxis("x", 0.25);
	harness.controller.setSplatEditBoxCenterAxis("z", 0);
	harness.controller.setSplatEditBoxSizeAxis("x", 1.5);
	assert.equal(
		harness.controller.applySplatEditBoxSelection({ subtract: false }),
		2,
	);
	assert.equal(await harness.controller.separateSelectedSplats(), 1);
	assert.equal(harness.store.sceneAssets.value.length, 2);
	assert.equal(harness.store.sceneAssets.value[0].id, "splat-separate");
	assert.equal(harness.store.sceneAssets.value[0].source.numSplats, 1);
	assert.equal(harness.store.sceneAssets.value[1].source.numSplats, 2);
	assert.equal(harness.store.sceneAssets.value[1].label, "Facade Split");
	assert.deepEqual(harness.store.selectedSceneAssetIds.value, ["created-1"]);
	assert.equal(harness.store.splatEdit.selectionCount.value, 0);
}

console.log("✅ CAMERA_FRAMES per-splat edit controller tests passed!");
