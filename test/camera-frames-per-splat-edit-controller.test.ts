import assert from "node:assert/strict";
import { PackedSplats, SplatMesh } from "@sparkjsdev/spark";
import * as THREE from "three";
import { createPerSplatEditControllerBindings } from "../src/app/per-splat-edit-controller-bindings.js";
import { createHistoryController } from "../src/controllers/history-controller.js";
import { createPerSplatEditController } from "../src/controllers/per-splat-edit-controller.js";
import { createSceneAssetStatePersistence } from "../src/controllers/scene-assets/state-persistence.js";
import {
	createProjectFileEmbeddedFileSource,
	createProjectFilePackedSplatSource,
	isProjectFileEmbeddedFileSource,
	isProjectFilePackedSplatSource,
} from "../src/project-document.js";
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

function computeExpectedPlanarHitPoint({
	camera,
	viewportRect,
	viewRect = viewportRect,
	planeZ = 0,
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
	const directionZ = raycaster.ray.direction.z;
	const distance = (planeZ - raycaster.ray.origin.z) / directionZ;
	return raycaster.ray.at(distance, new THREE.Vector3());
}

function worldToClientPoint({
	camera,
	viewportRect,
	worldPoint,
	viewRect = viewportRect,
}) {
	const projectedPoint = worldPoint.clone().project(camera);
	return {
		clientX:
			viewRect.left + ((projectedPoint.x + 1) * 0.5 * viewRect.width - 0),
		clientY:
			viewRect.top + ((1 - projectedPoint.y) * 0.5 * viewRect.height - 0),
	};
}

function toPlainPoint(vector) {
	return {
		x: vector.x,
		y: vector.y,
		z: vector.z,
	};
}

function toPlainQuaternion(quaternion) {
	return {
		x: quaternion.x,
		y: quaternion.y,
		z: quaternion.z,
		w: quaternion.w,
	};
}

function createPointerEvent({
	pointerId = 1,
	clientX = 0,
	clientY = 0,
	altKey = false,
	button = 0,
} = {}) {
	return {
		pointerId,
		clientX,
		clientY,
		altKey,
		button,
		preventDefault() {},
		stopPropagation() {},
		stopImmediatePropagation() {},
	};
}

function captureObjectLocalTransformState(object) {
	if (!object) {
		return null;
	}
	return {
		position: {
			x: object.position.x,
			y: object.position.y,
			z: object.position.z,
		},
		quaternion: {
			x: object.quaternion.x,
			y: object.quaternion.y,
			z: object.quaternion.z,
			w: object.quaternion.w,
		},
		scale: {
			x: object.scale.x,
			y: object.scale.y,
			z: object.scale.z,
		},
	};
}

function applyObjectLocalTransformState(object, state) {
	if (!object || !state) {
		return;
	}
	object.position.set(state.position.x, state.position.y, state.position.z);
	object.quaternion.set(
		state.quaternion.x,
		state.quaternion.y,
		state.quaternion.z,
		state.quaternion.w,
	);
	object.scale.set(state.scale.x, state.scale.y, state.scale.z);
	object.updateMatrixWorld(true);
}

function ensureSceneStateAssetShape(asset) {
	if (!asset.baseScale?.isVector3) {
		asset.baseScale = new THREE.Vector3(1, 1, 1);
	}
	if (!Number.isFinite(asset.worldScale)) {
		asset.worldScale = 1;
	}
	if (!asset.unitMode) {
		asset.unitMode = "meters";
	}
	if (!asset.exportRole) {
		asset.exportRole = "beauty";
	}
	if (typeof asset.maskGroup !== "string") {
		asset.maskGroup = "";
	}
	if (!("workingPivotLocal" in asset)) {
		asset.workingPivotLocal = null;
	}
	return asset;
}

function createHarnessWithRealHistory(options = {}) {
	let historyController = null;
	const historyFacade = {
		beginHistoryTransaction: (...args) =>
			historyController?.beginHistoryTransaction?.(...args),
		commitHistoryTransaction: (...args) =>
			historyController?.commitHistoryTransaction?.(...args),
		cancelHistoryTransaction: (...args) =>
			historyController?.cancelHistoryTransaction?.(...args),
	};
	const harness = createHarness({
		...options,
		historyController: historyFacade,
	});
	const detachedSceneAssets = new Map();
	const sceneState = {
		get assets() {
			return harness.store.sceneAssets.value;
		},
		set assets(nextValue) {
			harness.store.sceneAssets.value = nextValue;
		},
	};
	const statePersistence = createSceneAssetStatePersistence({
		sceneState,
		store: harness.store,
		detachedSceneAssets,
		getProjectSourceStableKey: (source) => source?.stableKey ?? null,
		isProjectFileEmbeddedFileSource,
		isProjectFilePackedSplatSource,
		captureObjectLocalTransformState,
		applyObjectLocalTransformState,
		clampAssetWorldScale: (value) => Math.max(0.01, Number(value) || 1),
		clampAssetTransformValue: (value, fallback = 0) => {
			const nextValue = Number(value);
			return Number.isFinite(nextValue) ? nextValue : fallback;
		},
		normalizeWorkingPivotLocal: (value) =>
			value
				? new THREE.Vector3(
						Number(value.x ?? 0),
						Number(value.y ?? 0),
						Number(value.z ?? 0),
					)
				: null,
		applyAssetWorldScale: (asset) => {
			asset.object.scale.copy(asset.baseScale).multiplyScalar(asset.worldScale);
			asset.object.updateMatrixWorld(true);
		},
		restoreSceneAsset: (asset) => {
			detachedSceneAssets.delete(asset.id);
		},
		detachSceneAsset: (asset) => {
			detachedSceneAssets.set(asset.id, asset);
		},
		captureProjectSceneState: () => [],
		applyProjectAssetState: () => {},
		loadSources: async () => {},
	});
	const controller = harness.controller;
	historyController = createHistoryController({
		store: harness.store,
		captureWorkspaceState: () => ({
			sceneAssets: statePersistence.captureSceneAssetEditState(),
			splatEdit: controller.captureEditState(),
		}),
		restoreWorkspaceState: (snapshot) => {
			if (!statePersistence.restoreSceneAssetEditState(snapshot.sceneAssets)) {
				return false;
			}
			return controller.restoreEditState(snapshot.splatEdit);
		},
		updateUi: () => {},
	});
	return {
		...harness,
		statePersistence,
		historyController,
		ensureAsset(asset) {
			return ensureSceneStateAssetShape(asset);
		},
	};
}

function createHarness({
	mode = "viewport",
	camera = null,
	cameraViewCamera = null,
	viewportRect = { left: 0, top: 0, width: 1000, height: 1000 },
	renderBoxRect = null,
	historyController = null,
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
		getSceneRaycastTargets: () =>
			store.sceneAssets.value
				.filter((asset) => asset?.object?.visible !== false)
				.map((asset) => asset.object),
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
	const historyCalls = [];
	const resolvedHistoryController = historyController ?? {
		beginHistoryTransaction: (label) => {
			historyCalls.push(["begin", label]);
			return true;
		},
		commitHistoryTransaction: (label) => {
			historyCalls.push(["commit", label]);
			return true;
		},
		cancelHistoryTransaction: () => {
			historyCalls.push(["cancel"]);
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
		getHistoryController: () => resolvedHistoryController,
	});
	return {
		store,
		calls,
		historyCalls,
		historyController: resolvedHistoryController,
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
	raycastHitPoint = null,
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
	if (raycastHitPoint) {
		mesh.raycast = function raycast(raycaster, intersections) {
			const hitPoint = raycastHitPoint.clone();
			const offset = hitPoint.clone().sub(raycaster.ray.origin);
			const distance = offset.dot(raycaster.ray.direction);
			if (distance < 0) {
				return;
			}
			const closestPoint = raycaster.ray
				.at(distance, new THREE.Vector3())
				.clone();
			if (closestPoint.distanceToSquared(hitPoint) > 1e-8) {
				return;
			}
			intersections.push({
				distance,
				point: hitPoint,
				object: this,
			});
		};
	}
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

function createPlanarBrushSplatAsset({ id, centers, planeZ = 0 } = {}) {
	const object = new THREE.Group();
	object.updateMatrixWorld(true);
	const contentObject = new THREE.Group();
	object.add(contentObject);
	const mesh = new THREE.Group();
	contentObject.add(mesh);
	contentObject.updateMatrixWorld(true);
	mesh.updateMatrixWorld(true);
	mesh.raycast = function raycast(raycaster, intersections) {
		const directionZ = raycaster.ray.direction.z;
		if (Math.abs(directionZ) <= 1e-6) {
			return;
		}
		const distance = (planeZ - raycaster.ray.origin.z) / directionZ;
		if (distance < 0) {
			return;
		}
		intersections.push({
			distance,
			point: raycaster.ray.at(distance, new THREE.Vector3()).clone(),
			object: this,
		});
	};
	mesh.forEachSplat = function forEachSplat(callback) {
		centers.forEach((center, index) => callback(index, center.clone()));
	};
	mesh.getBoundingBox = function getBoundingBox() {
		return new THREE.Box3().setFromPoints(centers);
	};
	return {
		id,
		kind: "splat",
		object,
		contentObject,
		localCenterBoundsHint: new THREE.Box3().setFromPoints(centers),
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
	assert.equal(harness.store.splatEdit.tool.value, "brush");
}

{
	const harness = createHarness();
	assert.equal(harness.controller.setSplatEditTool("brush"), "brush");
	assert.ok(
		harness.calls.some(
			(entry) => Array.isArray(entry) && entry[0] === "sync-controls",
		),
	);
	harness.calls.length = 0;
	assert.equal(harness.controller.setSplatEditTool("transform"), "transform");
	assert.ok(
		harness.calls.some(
			(entry) => Array.isArray(entry) && entry[0] === "sync-controls",
		),
	);
}

{
	const harness = createHarness();
	harness.store.sceneAssets.value = [
		createSplatAsset({
			id: "splat-1",
			centers: [new THREE.Vector3(0, 0, 0)],
			raycastHitPoint: new THREE.Vector3(0, 0, 0),
		}),
	];
	harness.store.selectedSceneAssetIds.value = ["splat-1"];

	assert.equal(
		harness.controller.setSplatEditMode(true, { silent: true }),
		true,
	);
	assert.equal(harness.controller.setSplatEditTool("brush"), "brush");
	assert.equal(
		harness.controller.applySplatEditBrushAtClientPoint({
			clientX: 500,
			clientY: 500,
		}),
		1,
	);
	assert.equal(harness.controller.setSplatEditBoxCenterAxis("x", 0), true);
	assert.equal(harness.store.splatEdit.boxPlaced.value, true);
	assert.equal(harness.store.splatEdit.selectionCount.value, 1);
	assert.equal(
		harness.controller.setSplatEditMode(false, { silent: true }),
		true,
	);
	assert.equal(harness.store.splatEdit.selectionCount.value, 1);
	assert.equal(
		harness.controller.setSplatEditMode(true, { silent: true }),
		true,
	);
	assert.equal(harness.store.splatEdit.selectionCount.value, 1);
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
		createSplatAsset({
			id: "splat-1",
			centers: [new THREE.Vector3(0, 0, 0)],
			raycastHitPoint: new THREE.Vector3(0, 0, 0),
		}),
	];
	harness.store.selectedSceneAssetIds.value = ["splat-1"];

	assert.equal(
		harness.controller.setSplatEditMode(true, { silent: true }),
		true,
	);
	assert.equal(harness.controller.setSplatEditTool("brush"), "brush");
	assert.equal(
		harness.controller.applySplatEditBrushAtClientPoint({
			clientX: 500,
			clientY: 500,
		}),
		1,
	);
	assert.equal(harness.controller.setSplatEditBoxCenterAxis("x", 0), true);
	assert.equal(harness.store.splatEdit.boxPlaced.value, true);
	assert.equal(harness.controller.handleToolModeDeactivated(), true);
	assert.equal(harness.store.splatEdit.selectionCount.value, 1);
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
	assert.equal(harness.store.splatEdit.boxPlaced.value, false);
	assert.equal(
		harness.controller.placeSplatEditBoxAtPointer(
			createPointerEvent({ clientX: 500, clientY: 500 }),
			{
				camera: harness.activeCamera,
				viewportRect: { left: 0, top: 0, width: 1000, height: 1000 },
			},
		),
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
	assert.deepEqual(harness.historyCalls, [
		["begin", "splat-edit.box-place"],
		["commit", "splat-edit.box-place"],
	]);
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
			id: "splat-rotation-input",
			centers: [new THREE.Vector3(0, 0, 0)],
			centerBounds: new THREE.Box3(
				new THREE.Vector3(-0.5, -0.5, -0.5),
				new THREE.Vector3(0.5, 0.5, 0.5),
			),
		}),
	];
	harness.store.selectedSceneAssetIds.value = ["splat-rotation-input"];

	assert.equal(
		harness.controller.setSplatEditMode(true, { silent: true }),
		true,
	);
	assert.equal(harness.controller.setSplatEditBoxRotationAxis("z", 90), true);
	assert.ok(
		new THREE.Quaternion(
			harness.store.splatEdit.boxRotation.value.x,
			harness.store.splatEdit.boxRotation.value.y,
			harness.store.splatEdit.boxRotation.value.z,
			harness.store.splatEdit.boxRotation.value.w,
		).angleTo(
			new THREE.Quaternion().setFromAxisAngle(
				new THREE.Vector3(0, 0, 1),
				Math.PI * 0.5,
			),
		) < 1e-6,
	);
}

{
	const harness = createHarness();
	harness.store.sceneAssets.value = [
		createSplatAsset({
			id: "splat-rotated-box",
			centers: [
				new THREE.Vector3(0.6, 0.6, 0),
				new THREE.Vector3(1, 0, 0),
				new THREE.Vector3(0, 0.8, 0),
			],
			centerBounds: new THREE.Box3(
				new THREE.Vector3(-1.5, -1.5, -0.5),
				new THREE.Vector3(1.5, 1.5, 0.5),
			),
		}),
	];
	harness.store.selectedSceneAssetIds.value = ["splat-rotated-box"];

	assert.equal(
		harness.controller.setSplatEditMode(true, { silent: true }),
		true,
	);
	harness.controller.setSplatEditBoxCenterAxis("x", 0);
	harness.controller.setSplatEditBoxCenterAxis("y", 0);
	harness.controller.setSplatEditBoxCenterAxis("z", 0);
	harness.controller.setSplatEditBoxSizeAxis("x", 2);
	harness.controller.setSplatEditBoxSizeAxis("y", 1);
	harness.controller.setSplatEditBoxSizeAxis("z", 1);
	harness.store.splatEdit.boxRotation.value = toPlainQuaternion(
		new THREE.Quaternion().setFromAxisAngle(
			new THREE.Vector3(0, 0, 1),
			Math.PI * 0.25,
		),
	);

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
			id: "splat-fit-history",
			centers: [new THREE.Vector3(-1, 0, 0), new THREE.Vector3(1, 0, 0)],
			centerBounds: new THREE.Box3(
				new THREE.Vector3(-1, -0.5, -0.5),
				new THREE.Vector3(1, 0.5, 0.5),
			),
		}),
	];
	harness.store.selectedSceneAssetIds.value = ["splat-fit-history"];

	assert.equal(
		harness.controller.setSplatEditMode(true, { silent: true }),
		true,
	);
	assert.equal(harness.controller.fitSplatEditBoxToScope(), true);
	assert.deepEqual(harness.historyCalls, [
		["begin", "splat-edit.box-fit"],
		["commit", "splat-edit.box-fit"],
	]);
}

{
	const harness = createHarness();
	harness.store.sceneAssets.value = [
		createSplatAsset({
			id: "splat-scale-history",
			centers: [new THREE.Vector3(0, 0, 0)],
			centerBounds: new THREE.Box3(
				new THREE.Vector3(-0.5, -0.5, -0.5),
				new THREE.Vector3(0.5, 0.5, 0.5),
			),
		}),
	];
	harness.store.selectedSceneAssetIds.value = ["splat-scale-history"];

	assert.equal(
		harness.controller.setSplatEditMode(true, { silent: true }),
		true,
	);
	assert.equal(harness.controller.scaleSplatEditBoxUniform(1.1), true);
	assert.deepEqual(harness.historyCalls, [
		["begin", "splat-edit.box-scale"],
		["commit", "splat-edit.box-scale"],
	]);
}

{
	const harness = createHarness();
	harness.store.sceneAssets.value = [
		createSplatAsset({
			id: "splat-1",
			centers: [
				new THREE.Vector3(0, 0, -0.05),
				new THREE.Vector3(0, 0, -0.18),
				new THREE.Vector3(0, 0, -0.25),
				new THREE.Vector3(0.12, 0, -0.05),
				new THREE.Vector3(0, 0, 0.05),
			],
			centerBounds: new THREE.Box3(
				new THREE.Vector3(-0.5, -0.5, -0.5),
				new THREE.Vector3(0.5, 0.5, 0.5),
			),
			raycastHitPoint: new THREE.Vector3(0, 0, 0),
		}),
	];
	harness.store.selectedSceneAssetIds.value = ["splat-1"];

	assert.equal(
		harness.controller.setSplatEditMode(true, { silent: true }),
		true,
	);
	assert.equal(harness.controller.setSplatEditTool("brush"), "brush");
	assert.equal(harness.controller.setSplatEditBrushSize(0.2), true);
	assert.equal(harness.controller.setSplatEditBrushDepthMode("depth"), "depth");
	assert.equal(harness.controller.setSplatEditBrushDepth(0.2), true);
	assert.equal(
		harness.controller.applySplatEditBrushAtClientPoint({
			clientX: 500,
			clientY: 500,
		}),
		2,
	);
	assert.equal(harness.store.splatEdit.selectionCount.value, 2);
	assert.deepEqual(harness.calls.at(-1), ["status", "added:2"]);
	assert.deepEqual(harness.historyCalls, [
		["begin", "splat-edit.brush"],
		["commit", "splat-edit.brush"],
	]);
}

{
	const harness = createHarness();
	harness.store.sceneAssets.value = [
		createPlanarBrushSplatAsset({
			id: "splat-1",
			centers: [new THREE.Vector3(-0.4, 0, 0), new THREE.Vector3(0.4, 0, 0)],
		}),
	];
	harness.store.selectedSceneAssetIds.value = ["splat-1"];

	assert.equal(
		harness.controller.setSplatEditMode(true, { silent: true }),
		true,
	);
	assert.equal(harness.controller.setSplatEditTool("brush"), "brush");
	assert.equal(harness.controller.setSplatEditBrushSize(0.2), true);
	assert.equal(
		harness.controller.startSplatEditBrushStroke(
			createPointerEvent({
				pointerId: 9,
				clientX: 460,
				clientY: 500,
			}),
		),
		true,
	);
	assert.equal(
		harness.controller.handleSplatEditBrushStrokeMove(
			createPointerEvent({
				pointerId: 9,
				clientX: 540,
				clientY: 500,
			}),
		),
		true,
	);
	assert.equal(
		harness.controller.finishSplatEditBrushStroke(
			createPointerEvent({
				pointerId: 9,
				clientX: 540,
				clientY: 500,
			}),
		),
		true,
	);
	assert.equal(harness.store.splatEdit.selectionCount.value, 2);
	assert.equal(harness.store.splatEdit.brushPreview.value.visible, true);
	assert.equal(harness.store.splatEdit.brushPreview.value.painting, false);
	assert.deepEqual(harness.calls.at(-1), ["status", "added:2"]);
	assert.deepEqual(harness.historyCalls, [
		["begin", "splat-edit.brush"],
		["commit", "splat-edit.brush"],
	]);
}

{
	const camera = new THREE.PerspectiveCamera(90, 1.4, 0.1, 1000);
	camera.position.set(0, 0, 5);
	camera.lookAt(0, 0, 0);
	camera.updateProjectionMatrix();
	camera.updateMatrixWorld(true);
	const viewportRect = { left: 0, top: 0, width: 1400, height: 1000 };
	const renderBoxRect = { left: 100, top: 100, width: 800, height: 800 };
	const harness = createHarness({
		mode: "camera",
		camera,
		viewportRect,
		renderBoxRect,
	});
	const hitPoint = computeExpectedPlanarHitPoint({
		camera,
		viewportRect,
		viewRect: renderBoxRect,
		planeZ: 0,
	});
	harness.store.sceneAssets.value = [
		createPlanarBrushSplatAsset({
			id: "splat-1",
			centers: [hitPoint.clone()],
		}),
	];
	harness.store.selectedSceneAssetIds.value = ["splat-1"];

	assert.equal(
		harness.controller.setSplatEditMode(true, { silent: true }),
		true,
	);
	assert.equal(harness.controller.setSplatEditTool("brush"), "brush");
	assert.equal(harness.controller.setSplatEditBrushSize(0.2), true);
	assert.equal(
		harness.controller.applySplatEditBrushAtClientPoint({
			clientX: 500,
			clientY: 500,
		}),
		1,
	);
	assert.equal(harness.store.splatEdit.selectionCount.value, 1);
}

{
	const harness = createHarness();
	harness.store.sceneAssets.value = [
		createSplatAsset({
			id: "splat-1",
			centers: [
				new THREE.Vector3(0, 0, -0.05),
				new THREE.Vector3(0, 0, -1.5),
				new THREE.Vector3(0.12, 0, -0.05),
			],
			centerBounds: new THREE.Box3(
				new THREE.Vector3(-2, -2, -2),
				new THREE.Vector3(2, 2, 2),
			),
			raycastHitPoint: new THREE.Vector3(0, 0, 0),
		}),
	];
	harness.store.selectedSceneAssetIds.value = ["splat-1"];

	assert.equal(
		harness.controller.setSplatEditMode(true, { silent: true }),
		true,
	);
	assert.equal(harness.controller.setSplatEditTool("brush"), "brush");
	assert.equal(harness.controller.setSplatEditBrushSize(0.2), true);
	assert.equal(
		harness.controller.setSplatEditBrushDepthMode("through"),
		"through",
	);
	assert.equal(
		harness.controller.applySplatEditBrushAtClientPoint({
			clientX: 500,
			clientY: 500,
		}),
		2,
	);
	assert.equal(harness.store.splatEdit.selectionCount.value, 2);
	assert.equal(
		harness.controller.applySplatEditBrushAtPointer(
			createPointerEvent({ clientX: 500, clientY: 500, altKey: true }),
		),
		true,
	);
	assert.equal(harness.store.splatEdit.selectionCount.value, 0);
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
	assert.equal(harness.store.splatEdit.boxPlaced.value, false);
	const expectedCenter = computeExpectedSpawnPoint({
		camera,
		viewportRect: { left: 0, top: 0, width: 1400, height: 1000 },
		viewRect: { left: 100, top: 100, width: 800, height: 800 },
	});
	assert.equal(
		harness.controller.placeSplatEditBoxAtPointer(
			createPointerEvent({ clientX: 500, clientY: 500 }),
			{
				camera,
				viewportRect: { left: 0, top: 0, width: 1400, height: 1000 },
			},
		),
		true,
	);
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
	assert.equal(
		harnessA.controller.placeSplatEditBoxAtPointer(
			createPointerEvent({ clientX: 500, clientY: 500 }),
			{
				camera: harnessA.activeCamera,
				viewportRect: { left: 0, top: 0, width: 1000, height: 1000 },
			},
		),
		true,
	);
	assert.equal(
		harnessB.controller.placeSplatEditBoxAtPointer(
			createPointerEvent({ clientX: 500, clientY: 500 }),
			{
				camera: harnessB.activeCamera,
				viewportRect: { left: 0, top: 0, width: 1000, height: 1000 },
			},
		),
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
	harness.store.sceneAssets.value = [
		createSplatAsset({
			id: "splat-fit-precise",
			centers: [new THREE.Vector3(0, 0, 0), new THREE.Vector3(20, 0, 0)],
			centerBounds: new THREE.Box3(
				new THREE.Vector3(-0.5, -0.5, -0.5),
				new THREE.Vector3(0.5, 0.5, 0.5),
			),
		}),
	];
	harness.store.selectedSceneAssetIds.value = ["splat-fit-precise"];

	assert.equal(
		harness.controller.setSplatEditMode(true, { silent: true }),
		true,
	);
	assert.equal(harness.controller.fitSplatEditBoxToScope(), true);
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
	assert.deepEqual(harness.historyCalls, [
		["begin", "splat-edit.delete"],
		["commit", "splat-edit.delete"],
	]);
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
	assert.equal(harness.store.splatEdit.selectionCount.value, 2);
	assert.deepEqual(harness.historyCalls, [
		["begin", "splat-edit.separate"],
		["commit", "splat-edit.separate"],
	]);
	assert.equal(harness.store.splatEdit.boxCenter.value.x, 0.25);
	assert.equal(harness.store.splatEdit.boxSize.value.x, 1.5);
}

{
	const historyCalls = [];
	let commitReplacementFlag = false;
	const harness = createHarness({
		historyController: {
			beginHistoryTransaction: (label) => {
				historyCalls.push(["begin", label]);
				return true;
			},
			commitHistoryTransaction: (label) => {
				historyCalls.push(["commit", label]);
				commitReplacementFlag =
					harness.store.sceneAssets.value[0]
						?.capturePackedSplatSourceInEditState === true;
				return true;
			},
			cancelHistoryTransaction: () => {
				historyCalls.push(["cancel"]);
			},
		},
	});
	const asset = await createPackedSplatAsset({
		id: "splat-delete-history",
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
	assert.equal(commitReplacementFlag, true);
	assert.equal(
		harness.store.sceneAssets.value[0].capturePackedSplatSourceInEditState,
		false,
	);
	assert.deepEqual(historyCalls, [
		["begin", "splat-edit.delete"],
		["commit", "splat-edit.delete"],
	]);
}

{
	const historyCalls = [];
	let commitFlags = null;
	const harness = createHarness({
		historyController: {
			beginHistoryTransaction: (label) => {
				historyCalls.push(["begin", label]);
				return true;
			},
			commitHistoryTransaction: (label) => {
				historyCalls.push(["commit", label]);
				commitFlags = harness.store.sceneAssets.value.map(
					(asset) => asset.capturePackedSplatSourceInEditState === true,
				);
				return true;
			},
			cancelHistoryTransaction: () => {
				historyCalls.push(["cancel"]);
			},
		},
	});
	const asset = await createPackedSplatAsset({
		id: "splat-separate-history",
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
	assert.deepEqual(commitFlags, [true, true]);
	assert.deepEqual(
		harness.store.sceneAssets.value.map(
			(asset) => asset.capturePackedSplatSourceInEditState === true,
		),
		[false, false],
	);
	assert.deepEqual(historyCalls, [
		["begin", "splat-edit.separate"],
		["commit", "splat-edit.separate"],
	]);
}

{
	const historyCalls = [];
	let commitFlags = null;
	const harness = createHarness({
		historyController: {
			beginHistoryTransaction: (label) => {
				historyCalls.push(["begin", label]);
				return true;
			},
			commitHistoryTransaction: (label) => {
				historyCalls.push(["commit", label]);
				commitFlags = harness.store.sceneAssets.value.map(
					(asset) => asset.capturePackedSplatSourceInEditState === true,
				);
				return true;
			},
			cancelHistoryTransaction: () => {
				historyCalls.push(["cancel"]);
			},
		},
	});
	const asset = await createPackedSplatAsset({
		id: "splat-duplicate-history",
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
	assert.equal(await harness.controller.duplicateSelectedSplats(), 1);
	assert.deepEqual(commitFlags, [false, true]);
	assert.deepEqual(
		harness.store.sceneAssets.value.map(
			(asset) => asset.capturePackedSplatSourceInEditState === true,
		),
		[false, false],
	);
	assert.deepEqual(historyCalls, [
		["begin", "splat-edit.duplicate"],
		["commit", "splat-edit.duplicate"],
	]);
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
	];
	harness.store.selectedSceneAssetIds.value = ["splat-1"];

	assert.equal(
		harness.controller.setSplatEditMode(true, { silent: true }),
		true,
	);
	harness.controller.setSplatEditBoxCenterAxis("x", 3.5);
	harness.controller.setSplatEditBoxSizeAxis("x", 2.25);
	harness.store.selectedSceneAssetIds.value = [];
	assert.equal(harness.controller.syncScopeToSceneSelection(), true);
	harness.store.selectedSceneAssetIds.value = ["splat-1"];
	assert.equal(harness.controller.syncScopeToSceneSelection(), true);
	assert.equal(harness.store.splatEdit.boxCenter.value.x, 3.5);
	assert.equal(harness.store.splatEdit.boxSize.value.x, 2.25);
}

{
	const harness = createHarness();
	harness.store.sceneAssets.value = [
		createSplatAsset({
			id: "splat-1",
			centers: [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.5, 0, 0)],
			centerBounds: new THREE.Box3(
				new THREE.Vector3(-0.5, -0.5, -0.5),
				new THREE.Vector3(0.5, 0.5, 0.5),
			),
		}),
	];
	harness.store.selectedSceneAssetIds.value = ["splat-1"];
	harness.store.viewportToolMode.value = "splat-edit";
	harness.store.splatEdit.scopeAssetIds.value = ["splat-1"];
	harness.store.splatEdit.rememberedScopeAssetIds.value = ["splat-1"];
	harness.store.splatEdit.tool.value = "box";
	harness.store.splatEdit.hudPosition.value = { x: 123, y: 456 };
	harness.controller.setSplatEditBoxCenterAxis("x", 1.25);
	harness.controller.setSplatEditBoxSizeAxis("x", 2.5);
	harness.controller.setSplatEditBoxSizeAxis("z", 2);
	harness.store.splatEdit.boxRotation.value = toPlainQuaternion(
		new THREE.Quaternion().setFromAxisAngle(
			new THREE.Vector3(0, 1, 0),
			Math.PI * 0.1,
		),
	);
	harness.controller.applySplatEditBoxSelection({ subtract: false });

	const snapshot = harness.controller.captureEditState();
	harness.controller.clearSplatSelection();
	harness.store.splatEdit.scopeAssetIds.value = [];
	harness.store.splatEdit.hudPosition.value = { x: null, y: null };
	harness.store.splatEdit.boxRotation.value = { x: 0, y: 0, z: 0, w: 1 };

	assert.equal(harness.controller.restoreEditState(snapshot), true);
	assert.deepEqual(harness.store.splatEdit.scopeAssetIds.value, ["splat-1"]);
	assert.equal(harness.store.splatEdit.selectionCount.value, 2);
	assert.deepEqual(harness.store.splatEdit.hudPosition.value, {
		x: 123,
		y: 456,
	});
	assert.ok(
		new THREE.Quaternion(
			harness.store.splatEdit.boxRotation.value.x,
			harness.store.splatEdit.boxRotation.value.y,
			harness.store.splatEdit.boxRotation.value.z,
			harness.store.splatEdit.boxRotation.value.w,
		).angleTo(
			new THREE.Quaternion(
				snapshot.boxRotation.x,
				snapshot.boxRotation.y,
				snapshot.boxRotation.z,
				snapshot.boxRotation.w,
			),
		) < 1e-5,
	);
}

{
	const harness = createHarness();
	const asset = await createPackedSplatAsset({
		id: "splat-transform-move",
		label: "Transform Move",
		centers: [new THREE.Vector3(-0.2, 0, 0), new THREE.Vector3(0.2, 0, 0)],
	});
	harness.store.sceneAssets.value = [asset];
	harness.store.selectedSceneAssetIds.value = [asset.id];
	harness.store.selectedSceneAssetId.value = asset.id;

	assert.equal(
		harness.controller.setSplatEditMode(true, { silent: true }),
		true,
	);
	harness.controller.fitSplatEditBoxToScope();
	assert.equal(
		harness.controller.applySplatEditBoxSelection({ subtract: false }),
		2,
	);
	assert.equal(harness.controller.setSplatEditTool("transform"), "transform");
	const gizmoConfig = harness.controller.getViewportGizmoConfig();
	assert.equal(gizmoConfig?.showRotate, true);
	assert.equal(gizmoConfig?.showScale, true);
	assert.equal(
		harness.controller.moveSelectedSplatsByWorldDelta(
			new THREE.Vector3(1, 0, 0),
		),
		true,
	);
	const movedFirstX = asset.disposeTarget.packedSplats.getSplat(0).center.x;
	const movedSecondX = asset.disposeTarget.packedSplats.getSplat(1).center.x;
	assert.ok(Math.abs(movedFirstX - 0.8) < 5e-4);
	assert.ok(Math.abs(movedSecondX - 1.2) < 5e-4);
	assert.equal(asset.persistentSourceDirty, true);
	assert.equal(
		harness.controller.flushDirtySplatAssetPersistentSources(),
		true,
	);
	assert.equal(asset.persistentSourceDirty, false);
	assert.ok(asset.source.packedArray instanceof Uint32Array);
}

{
	const harness = createHarness();
	const asset = await createPackedSplatAsset({
		id: "splat-transform-rotate",
		label: "Transform Rotate",
		centers: [new THREE.Vector3(-1, 0, 0), new THREE.Vector3(1, 0, 0)],
	});
	harness.store.sceneAssets.value = [asset];
	harness.store.selectedSceneAssetIds.value = [asset.id];
	harness.store.selectedSceneAssetId.value = asset.id;

	assert.equal(
		harness.controller.setSplatEditMode(true, { silent: true }),
		true,
	);
	harness.controller.fitSplatEditBoxToScope();
	assert.equal(
		harness.controller.applySplatEditBoxSelection({ subtract: false }),
		2,
	);
	assert.equal(harness.controller.setSplatEditTool("transform"), "transform");
	assert.equal(
		harness.controller.rotateSelectedSplatsAroundSelection(
			new THREE.Vector3(0, 0, 1),
			Math.PI * 0.5,
		),
		true,
	);
	const rotatedFirst = asset.disposeTarget.packedSplats
		.getSplat(0)
		.center.clone();
	const rotatedSecond = asset.disposeTarget.packedSplats
		.getSplat(1)
		.center.clone();
	assert.ok(Math.abs(rotatedFirst.x) < 5e-4);
	assert.ok(Math.abs(rotatedFirst.y + 1) < 5e-4);
	assert.ok(Math.abs(rotatedSecond.x) < 5e-4);
	assert.ok(Math.abs(rotatedSecond.y - 1) < 5e-4);
}

{
	const harness = createHarness();
	const asset = await createPackedSplatAsset({
		id: "splat-transform-scale",
		label: "Transform Scale",
		centers: [new THREE.Vector3(-1, 0, 0), new THREE.Vector3(1, 0, 0)],
	});
	harness.store.sceneAssets.value = [asset];
	harness.store.selectedSceneAssetIds.value = [asset.id];
	harness.store.selectedSceneAssetId.value = asset.id;

	assert.equal(
		harness.controller.setSplatEditMode(true, { silent: true }),
		true,
	);
	harness.controller.fitSplatEditBoxToScope();
	assert.equal(
		harness.controller.applySplatEditBoxSelection({ subtract: false }),
		2,
	);
	assert.equal(harness.controller.setSplatEditTool("transform"), "transform");
	const baseScaleX = asset.disposeTarget.packedSplats.getSplat(0).scales.x;
	const baseScaleY = asset.disposeTarget.packedSplats.getSplat(1).scales.y;
	assert.equal(
		harness.controller.scaleSelectedSplatsUniformAroundSelection(2),
		true,
	);
	const scaledFirst = asset.disposeTarget.packedSplats.getSplat(0);
	const scaledFirstCenterX = scaledFirst.center.x;
	const scaledFirstScaleX = scaledFirst.scales.x;
	const scaledSecond = asset.disposeTarget.packedSplats.getSplat(1);
	const scaledSecondCenterX = scaledSecond.center.x;
	const scaledSecondScaleY = scaledSecond.scales.y;
	assert.ok(Math.abs(scaledFirstCenterX + 2) < 5e-4);
	assert.ok(Math.abs(scaledSecondCenterX - 2) < 5e-4);
	assert.ok(Math.abs(scaledFirstScaleX - baseScaleX * 2) < 0.01);
	assert.ok(Math.abs(scaledSecondScaleY - baseScaleY * 2) < 0.01);
}

{
	const harness = createHarness();
	const asset = await createPackedSplatAsset({
		id: "splat-transform-preview",
		label: "Transform Preview",
		centers: [new THREE.Vector3(-1, 0, 0), new THREE.Vector3(1, 0, 0)],
	});
	const viewportRect = { left: 0, top: 0, width: 1000, height: 1000 };
	harness.store.sceneAssets.value = [asset];
	harness.store.selectedSceneAssetIds.value = [asset.id];
	harness.store.selectedSceneAssetId.value = asset.id;

	assert.equal(
		harness.controller.setSplatEditMode(true, { silent: true }),
		true,
	);
	harness.controller.fitSplatEditBoxToScope();
	assert.equal(
		harness.controller.applySplatEditBoxSelection({ subtract: false }),
		2,
	);
	assert.equal(harness.controller.setSplatEditTool("transform"), "transform");
	const gizmoConfig = harness.controller.getViewportGizmoConfig();
	assert.equal(
		harness.controller.startViewportGizmoDrag("scale-uniform", {
			camera: harness.activeCamera,
			viewportRect,
			config: gizmoConfig,
			event: createPointerEvent({
				pointerId: 9,
				clientX: 500,
				clientY: 500,
			}),
		}),
		true,
	);
	assert.equal(asset.capturePackedSplatSourceInEditState, true);
	const previewMoveEvent = createPointerEvent({
		pointerId: 9,
		clientX: 550,
		clientY: 500,
	});
	assert.equal(
		harness.controller.handleViewportGizmoDragMove(previewMoveEvent, {
			camera: harness.activeCamera,
			viewportRect,
		}),
		true,
	);
	assert.equal(asset.object.visible, true);
	assert.ok(
		Math.abs(asset.disposeTarget.packedSplats.getSplat(0).center.x + 1) < 5e-4,
	);
	assert.ok(
		Math.abs(asset.disposeTarget.packedSplats.getSplat(1).center.x - 1) < 5e-4,
	);
	const previewEnded =
		harness.controller.handleViewportGizmoDragEnd(previewMoveEvent);
	assert.equal(previewEnded, true);
	assert.equal(asset.capturePackedSplatSourceInEditState, false);
	assert.equal(asset.object.visible, true);
	assert.ok(
		Math.abs(asset.disposeTarget.packedSplats.getSplat(0).center.x + 1) > 0.1,
	);
	assert.ok(
		Math.abs(asset.disposeTarget.packedSplats.getSplat(1).center.x - 1) > 0.1,
	);
}

{
	const historyCalls = [];
	let beginOptions = null;
	const harness = createHarness({
		historyController: {
			beginHistoryTransaction: (label, options) => {
				historyCalls.push(["begin", label]);
				beginOptions = options ?? null;
				return true;
			},
			commitHistoryTransaction: (label) => {
				historyCalls.push(["commit", label]);
				return true;
			},
			cancelHistoryTransaction: () => {
				historyCalls.push(["cancel"]);
			},
		},
	});
	const asset = await createPackedSplatAsset({
		id: "splat-transform-noop",
		label: "Transform Noop",
		centers: [new THREE.Vector3(-1, 0, 0), new THREE.Vector3(1, 0, 0)],
	});
	const viewportRect = { left: 0, top: 0, width: 1000, height: 1000 };
	harness.store.sceneAssets.value = [asset];
	harness.store.selectedSceneAssetIds.value = [asset.id];
	harness.store.selectedSceneAssetId.value = asset.id;

	assert.equal(
		harness.controller.setSplatEditMode(true, { silent: true }),
		true,
	);
	harness.controller.fitSplatEditBoxToScope();
	assert.equal(
		harness.controller.applySplatEditBoxSelection({ subtract: false }),
		2,
	);
	assert.equal(harness.controller.setSplatEditTool("transform"), "transform");
	historyCalls.length = 0;
	const gizmoConfig = harness.controller.getViewportGizmoConfig();
	const startEvent = createPointerEvent({
		pointerId: 31,
		...worldToClientPoint({
			camera: harness.activeCamera,
			viewportRect,
			worldPoint: new THREE.Vector3(1, 0, 0),
		}),
	});
	assert.equal(
		harness.controller.startViewportGizmoDrag("move-x", {
			camera: harness.activeCamera,
			viewportRect,
			config: gizmoConfig,
			event: startEvent,
		}),
		true,
	);
	assert.deepEqual(beginOptions, { skipSnapshotDiff: true });
	const noopEnded = harness.controller.handleViewportGizmoDragEnd(startEvent);
	assert.equal(noopEnded, true);
	assert.deepEqual(historyCalls, [
		["begin", "splat-edit.transform"],
		["cancel"],
	]);
	assert.equal(asset.persistentSourceDirty, undefined);
}

{
	const harness = createHarnessWithRealHistory();
	const asset = harness.ensureAsset(
		await createPackedSplatAsset({
			id: "splat-transform-history",
			label: "History Target",
			centers: [new THREE.Vector3(-1, 0, 0), new THREE.Vector3(1, 0, 0)],
		}),
	);
	const viewportRect = { left: 0, top: 0, width: 1000, height: 1000 };
	harness.store.sceneAssets.value = [asset];
	harness.store.selectedSceneAssetIds.value = [asset.id];
	harness.store.selectedSceneAssetId.value = asset.id;

	assert.equal(
		harness.controller.setSplatEditMode(true, { silent: true }),
		true,
	);
	harness.controller.fitSplatEditBoxToScope();
	assert.equal(
		harness.controller.applySplatEditBoxSelection({ subtract: false }),
		2,
	);
	assert.equal(harness.controller.setSplatEditTool("transform"), "transform");
	const gizmoConfig = harness.controller.getViewportGizmoConfig();
	const startEvent = createPointerEvent({
		pointerId: 14,
		...worldToClientPoint({
			camera: harness.activeCamera,
			viewportRect,
			worldPoint: new THREE.Vector3(1, 0, 0),
		}),
	});
	assert.equal(
		harness.controller.startViewportGizmoDrag("move-x", {
			camera: harness.activeCamera,
			viewportRect,
			config: gizmoConfig,
			event: startEvent,
		}),
		true,
	);
	const dragEvent = createPointerEvent({
		pointerId: 14,
		...worldToClientPoint({
			camera: harness.activeCamera,
			viewportRect,
			worldPoint: new THREE.Vector3(2, 0, 0),
		}),
	});
	assert.equal(
		harness.controller.handleViewportGizmoDragMove(dragEvent, {
			camera: harness.activeCamera,
			viewportRect,
		}),
		true,
	);
	assert.equal(harness.controller.handleViewportGizmoDragEnd(dragEvent), true);

	const movedLeftX = asset.disposeTarget.packedSplats.getSplat(0).center.x;
	const movedRightX = asset.disposeTarget.packedSplats.getSplat(1).center.x;
	assert.ok(movedLeftX > -0.6);
	assert.ok(movedRightX > 1.4);

	const undoTransformHistory = harness.historyController.undoHistory();
	assert.equal(undoTransformHistory, true);
	assert.ok(
		Math.abs(asset.disposeTarget.packedSplats.getSplat(0).center.x + 1) < 5e-4,
	);
	assert.ok(
		Math.abs(asset.disposeTarget.packedSplats.getSplat(1).center.x - 1) < 5e-4,
	);
	assert.equal(harness.store.splatEdit.tool.value, "transform");
	assert.equal(harness.store.splatEdit.selectionCount.value, 2);

	const redoTransformHistory = harness.historyController.redoHistory();
	assert.equal(redoTransformHistory, true);
	assert.ok(
		Math.abs(
			asset.disposeTarget.packedSplats.getSplat(0).center.x - movedLeftX,
		) < 5e-4,
	);
	assert.ok(
		Math.abs(
			asset.disposeTarget.packedSplats.getSplat(1).center.x - movedRightX,
		) < 5e-4,
	);
}

{
	const harness = createHarnessWithRealHistory();
	const asset = harness.ensureAsset(
		await createPackedSplatAsset({
			id: "splat-transform-history-embedded",
			label: "Embedded Target",
			centers: [new THREE.Vector3(-1, 0, 0), new THREE.Vector3(1, 0, 0)],
		}),
	);
	asset.source = createProjectFileEmbeddedFileSource({
		kind: "splat",
		file: new File([new Uint8Array([1, 2, 3])], "embedded-source.splat"),
		fileName: "embedded-source.splat",
	});
	const viewportRect = { left: 0, top: 0, width: 1000, height: 1000 };
	harness.store.sceneAssets.value = [asset];
	harness.store.selectedSceneAssetIds.value = [asset.id];
	harness.store.selectedSceneAssetId.value = asset.id;

	assert.equal(
		harness.controller.setSplatEditMode(true, { silent: true }),
		true,
	);
	harness.controller.fitSplatEditBoxToScope();
	assert.equal(
		harness.controller.applySplatEditBoxSelection({ subtract: false }),
		2,
	);
	assert.equal(harness.controller.setSplatEditTool("transform"), "transform");
	const gizmoConfig = harness.controller.getViewportGizmoConfig();
	const startEvent = createPointerEvent({
		pointerId: 15,
		...worldToClientPoint({
			camera: harness.activeCamera,
			viewportRect,
			worldPoint: new THREE.Vector3(1, 0, 0),
		}),
	});
	assert.equal(
		harness.controller.startViewportGizmoDrag("move-x", {
			camera: harness.activeCamera,
			viewportRect,
			config: gizmoConfig,
			event: startEvent,
		}),
		true,
	);
	const dragEvent = createPointerEvent({
		pointerId: 15,
		...worldToClientPoint({
			camera: harness.activeCamera,
			viewportRect,
			worldPoint: new THREE.Vector3(2, 0, 0),
		}),
	});
	assert.equal(
		harness.controller.handleViewportGizmoDragMove(dragEvent, {
			camera: harness.activeCamera,
			viewportRect,
		}),
		true,
	);
	assert.equal(harness.controller.handleViewportGizmoDragEnd(dragEvent), true);

	const undoEmbeddedHistory = harness.historyController.undoHistory();
	assert.equal(undoEmbeddedHistory, true);
	assert.ok(
		Math.abs(asset.disposeTarget.packedSplats.getSplat(0).center.x + 1) < 5e-4,
	);
	assert.ok(
		Math.abs(asset.disposeTarget.packedSplats.getSplat(1).center.x - 1) < 5e-4,
	);
	const redoEmbeddedHistory = harness.historyController.redoHistory();
	assert.equal(redoEmbeddedHistory, true);
	assert.ok(asset.disposeTarget.packedSplats.getSplat(0).center.x > -0.6);
	assert.ok(asset.disposeTarget.packedSplats.getSplat(1).center.x > 1.4);
}

{
	const harness = createHarness();
	const viewportRect = { left: 0, top: 0, width: 1000, height: 1000 };
	harness.store.sceneAssets.value = [
		createSplatAsset({
			id: "splat-box-gizmo",
			centers: [new THREE.Vector3(0, 0, 0)],
			centerBounds: new THREE.Box3(
				new THREE.Vector3(-1, -1, -1),
				new THREE.Vector3(1, 1, 1),
			),
		}),
	];
	harness.store.selectedSceneAssetIds.value = ["splat-box-gizmo"];

	assert.equal(
		harness.controller.setSplatEditMode(true, { silent: true }),
		true,
	);
	harness.controller.setSplatEditBoxCenterAxis("x", 0);
	harness.controller.setSplatEditBoxCenterAxis("y", 0);
	harness.controller.setSplatEditBoxCenterAxis("z", 0);
	const gizmoConfig = harness.controller.getViewportGizmoConfig();
	assert.equal(gizmoConfig?.showRotate, true);
	assert.ok(gizmoConfig?.basisWorld?.x);
	assert.equal(
		harness.controller.startViewportGizmoDrag("rotate-z", {
			camera: harness.activeCamera,
			viewportRect,
			config: gizmoConfig,
			event: createPointerEvent({
				pointerId: 23,
				...worldToClientPoint({
					camera: harness.activeCamera,
					viewportRect,
					worldPoint: new THREE.Vector3(1, 0, 0),
				}),
			}),
		}),
		true,
	);
	const rotateEvent = createPointerEvent({
		pointerId: 23,
		...worldToClientPoint({
			camera: harness.activeCamera,
			viewportRect,
			worldPoint: new THREE.Vector3(0, 1, 0),
		}),
	});
	assert.equal(
		harness.controller.handleViewportGizmoDragMove(rotateEvent, {
			camera: harness.activeCamera,
			viewportRect,
		}),
		true,
	);
	assert.ok(
		new THREE.Quaternion(
			harness.store.splatEdit.boxRotation.value.x,
			harness.store.splatEdit.boxRotation.value.y,
			harness.store.splatEdit.boxRotation.value.z,
			harness.store.splatEdit.boxRotation.value.w,
		).angleTo(
			new THREE.Quaternion().setFromAxisAngle(
				new THREE.Vector3(0, 0, 1),
				Math.PI * 0.5,
			),
		) < 5e-3,
	);
	const boxRotateEnded =
		harness.controller.handleViewportGizmoDragEnd(rotateEvent);
	assert.equal(boxRotateEnded, true);
	assert.deepEqual(harness.historyCalls, [
		["begin", "splat-edit.box-transform"],
		["commit", "splat-edit.box-transform"],
	]);
}

// Brush selects splats via fallback depth when raycast misses
{
	const harness = createHarness();
	harness.store.sceneAssets.value = [
		createSplatAsset({
			id: "splat-no-raycast",
			centers: [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.05, 0, 0)],
			// No raycastHitPoint → mesh has no raycast method → raycaster will miss
		}),
	];
	harness.store.selectedSceneAssetIds.value = ["splat-no-raycast"];

	assert.equal(
		harness.controller.setSplatEditMode(true, { silent: true }),
		true,
	);
	assert.equal(harness.controller.setSplatEditTool("brush"), "brush");
	assert.equal(harness.controller.setSplatEditBrushSize(2), true);
	assert.equal(
		harness.controller.setSplatEditBrushDepthMode("through"),
		"through",
	);
	// Brush should still work via fallback depth even without raycast hit
	const hitCount = harness.controller.applySplatEditBrushAtClientPoint({
		clientX: 500,
		clientY: 500,
	});
	assert.ok(
		hitCount > 0,
		`brush should select splats via fallback depth, got ${hitCount}`,
	);
	assert.ok(harness.store.splatEdit.selectionCount.value > 0);
}

// Brush stroke lifecycle works with fallback depth
{
	const harness = createHarness();
	harness.store.sceneAssets.value = [
		createSplatAsset({
			id: "splat-stroke-fallback",
			centers: [new THREE.Vector3(0, 0, 0)],
		}),
	];
	harness.store.selectedSceneAssetIds.value = ["splat-stroke-fallback"];

	assert.equal(
		harness.controller.setSplatEditMode(true, { silent: true }),
		true,
	);
	assert.equal(harness.controller.setSplatEditTool("brush"), "brush");
	assert.equal(harness.controller.setSplatEditBrushSize(2), true);
	assert.equal(
		harness.controller.setSplatEditBrushDepthMode("through"),
		"through",
	);
	const started = harness.controller.startSplatEditBrushStroke(
		createPointerEvent({ pointerId: 20, clientX: 500, clientY: 500 }),
	);
	assert.equal(started, true, "brush stroke should start with fallback depth");
	const finishedBrushStroke = harness.controller.finishSplatEditBrushStroke(
		createPointerEvent({ pointerId: 20, clientX: 510, clientY: 500 }),
	);
	assert.equal(finishedBrushStroke, true);
}

// Brush stroke syncs highlight immediately during drag
{
	const harness = createHarness();
	harness.store.sceneAssets.value = [
		createPlanarBrushSplatAsset({
			id: "splat-immediate-highlight",
			centers: [new THREE.Vector3(-0.4, 0, 0), new THREE.Vector3(0.4, 0, 0)],
		}),
	];
	harness.store.selectedSceneAssetIds.value = ["splat-immediate-highlight"];
	assert.equal(
		harness.controller.setSplatEditMode(true, { silent: true }),
		true,
	);
	assert.equal(harness.controller.setSplatEditTool("brush"), "brush");
	assert.equal(harness.controller.setSplatEditBrushSize(200), true);
	harness.selectionHighlightCalls.length = 0;

	const startedImmediateHighlight =
		harness.controller.startSplatEditBrushStroke(
			createPointerEvent({
				pointerId: 21,
				clientX: 460,
				clientY: 500,
			}),
		);
	assert.equal(startedImmediateHighlight, true);
	const syncCountAfterStart = harness.selectionHighlightCalls.filter(
		(entry) => entry[0] === "sync",
	).length;
	assert.ok(syncCountAfterStart >= 1, "highlight should sync on stroke start");
	const finishedImmediateHighlight =
		harness.controller.finishSplatEditBrushStroke(
			createPointerEvent({
				pointerId: 21,
				clientX: 540,
				clientY: 500,
			}),
		);
	assert.equal(finishedImmediateHighlight, true);
}

{
	const harness = createHarness();
	const centers = Array.from({ length: 300 }, (_value, index) => {
		return new THREE.Vector3((index - 150) * 0.05, 0, 0);
	});
	const asset = await createPackedSplatAsset({
		id: "splat-brush-index",
		label: "Brush Index",
		centers,
	});
	asset.disposeTarget.raycast = function raycast(raycaster, intersections) {
		const directionZ = raycaster.ray.direction.z;
		if (Math.abs(directionZ) <= 1e-6) {
			return;
		}
		const distance = -raycaster.ray.origin.z / directionZ;
		if (distance < 0) {
			return;
		}
		intersections.push({
			distance,
			point: raycaster.ray.at(distance, new THREE.Vector3()).clone(),
			object: this,
		});
	};
	harness.store.sceneAssets.value = [asset];
	harness.store.selectedSceneAssetIds.value = [asset.id];
	harness.store.selectedSceneAssetId.value = asset.id;

	assert.equal(
		harness.controller.setSplatEditMode(true, { silent: true }),
		true,
	);
	assert.equal(harness.controller.setSplatEditTool("brush"), "brush");
	assert.equal(harness.controller.setSplatEditBrushSize(0.2), true);
	assert.equal(
		harness.controller.setSplatEditBrushDepthMode("through"),
		"through",
	);
	const viewportRect = { left: 0, top: 0, width: 1000, height: 1000 };
	const initialClientPoint = worldToClientPoint({
		camera: harness.activeCamera,
		viewportRect,
		worldPoint: new THREE.Vector3(0, 0, 0),
	});
	const addedCount =
		harness.controller.applySplatEditBrushAtClientPoint(initialClientPoint);
	assert.ok(addedCount > 0);
	const selectedCount = harness.store.splatEdit.selectionCount.value;
	assert.equal(selectedCount, addedCount);
	assert.equal(
		harness.controller.moveSelectedSplatsByWorldDelta(
			new THREE.Vector3(1, 0, 0),
		),
		true,
	);
	const movedClientPoint = worldToClientPoint({
		camera: harness.activeCamera,
		viewportRect,
		worldPoint: new THREE.Vector3(1, 0, 0),
	});
	const removedCount = harness.controller.applySplatEditBrushAtClientPoint({
		...movedClientPoint,
		subtract: true,
	});
	assert.equal(removedCount, selectedCount);
	assert.equal(harness.store.splatEdit.selectionCount.value, 0);
}

console.log("✅ CAMERA_FRAMES per-splat edit controller tests passed!");
