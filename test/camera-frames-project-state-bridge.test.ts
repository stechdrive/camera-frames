import assert from "node:assert/strict";
import * as THREE from "three";
import {
	captureCameraPose,
	createProjectStateBridge,
	restoreCameraPose,
} from "../src/app/project-state-bridge.js";

function createTestStore(shotCameras = []) {
	return {
		locale: { value: "en" },
		viewportBaseFovX: { value: 42 },
		viewportBaseFovXDirty: { value: true },
		workspace: {
			activeShotCameraId: { value: shotCameras[0]?.id ?? "camera-a" },
			shotCameras: { value: shotCameras },
		},
		frames: {
			selectionActive: { value: true },
			selectedIds: { value: ["frame-a"] },
			selectionAnchor: { value: { x: 10, y: 20 } },
			selectionBoxLogical: { value: { x: 1, y: 2, width: 3, height: 4 } },
		},
	};
}

function createBridgeHarness(overrides = {}) {
	let shotDocuments = overrides.shotDocuments ?? [
		{ id: "camera-a", name: "Camera A" },
	];
	const store = overrides.store ?? createTestStore(shotDocuments);
	store.workspace.shotCameras.value = shotDocuments;
	const state = overrides.state ?? { outputFrameSelected: true };
	const viewportCamera =
		overrides.viewportCamera ?? new THREE.PerspectiveCamera();
	viewportCamera.position.set(1, 2, 3);
	const shotCamera = new THREE.PerspectiveCamera();
	shotCamera.position.set(4, 5, 6);
	const shotCameraRegistry =
		overrides.shotCameraRegistry ??
		new Map([[shotDocuments[0]?.id ?? "camera-a", { camera: shotCamera }]]);
	const contentRoot = overrides.contentRoot ?? new THREE.Group();
	const calls = [];
	const assetController = overrides.assetController ?? {
		captureSceneAssetEditState: () => ({ assets: ["edit"] }),
		restoreSceneAssetEditState: (sceneAssets) => {
			calls.push(["restore-scene-assets", sceneAssets]);
			return true;
		},
		captureProjectSceneState: () => [{ id: "asset-a" }],
	};
	const lightingController = overrides.lightingController ?? {
		captureLightingState: () => ({ intensity: 1 }),
		applyLightingState: (lighting) => calls.push(["lighting", lighting]),
	};
	const referenceImageController = overrides.referenceImageController ?? {
		captureProjectReferenceImagesState: () => ({ items: ["ref-a"] }),
		applyProjectReferenceImagesState: (referenceImages, options) =>
			calls.push(["reference-images", referenceImages, options ?? null]),
	};
	const measurementController = overrides.measurementController ?? {
		clearMeasurementSession: (options) =>
			calls.push(["measurement-clear", options]),
	};
	const perSplatEditController = overrides.perSplatEditController ?? {
		captureEditState: () => ({ scopeAssetIds: ["splat-a"], selectionCount: 2 }),
		restoreEditState: (snapshot) =>
			calls.push(["restore-splat-edit", snapshot ?? null]),
	};
	const interactionController = overrides.interactionController ?? {
		clearControlMomentum: () => calls.push(["clear-momentum"]),
	};
	const viewportProjectionController =
		overrides.viewportProjectionController ?? {
			captureViewportProjectionState: () => ({ mode: "perspective" }),
			restoreViewportProjectionState: (snapshot) =>
				calls.push(["viewport-projection", snapshot]),
		};
	const frameController = overrides.frameController ?? {
		clearFrameInteraction: () => calls.push(["frame-clear"]),
		clearFrameSelection: () => calls.push(["frame-selection-clear"]),
	};
	const outputFrameController = overrides.outputFrameController ?? {
		clearOutputFramePan: () => calls.push(["output-pan-clear"]),
		clearOutputFrameSelection: () => calls.push(["output-selection-clear"]),
		clearOutputFrameAnchorDrag: () => calls.push(["output-anchor-clear"]),
		clearOutputFrameResize: () => calls.push(["output-resize-clear"]),
	};
	const sceneFramingController = overrides.sceneFramingController ?? {
		copyPose: (sourceCamera, destinationCamera) =>
			calls.push(["copy-pose", sourceCamera.uuid, destinationCamera.uuid]),
	};
	const shotCameraEditorStateController =
		overrides.shotCameraEditorStateController ?? {
			captureShotCameraEditorStates: () => ({
				[store.workspace.activeShotCameraId.value]: {
					referenceImageEditor: { id: "editor-a" },
				},
			}),
			restoreShotCameraEditorStates: (editorStates) =>
				calls.push(["restore-editor-states", editorStates]),
			clearActiveShotCameraEditorState: () =>
				calls.push(["clear-active-editor-state"]),
			restoreShotCameraEditorState: (shotCameraId, options) =>
				calls.push([
					"restore-editor-state",
					shotCameraId,
					options?.fallbackSnapshot ?? null,
				]),
		};
	const registerShotCameraDocuments =
		overrides.registerShotCameraDocuments ??
		(() => calls.push(["register-shot-cameras"]));
	const getShotCameraDocument =
		overrides.getShotCameraDocument ??
		((shotCameraId) =>
			shotDocuments.find(
				(documentState) => documentState.id === shotCameraId,
			) ?? null);
	const getActiveShotCameraDocument =
		overrides.getActiveShotCameraDocument ??
		(() => getShotCameraDocument(store.workspace.activeShotCameraId.value));
	const getActiveShotCameraEntry =
		overrides.getActiveShotCameraEntry ??
		(() =>
			shotCameraRegistry.get(store.workspace.activeShotCameraId.value) ?? null);
	const setShotCameraDocuments =
		overrides.setShotCameraDocuments ??
		((documents) => {
			shotDocuments = documents;
			store.workspace.shotCameras.value = documents;
			calls.push([
				"set-shot-cameras",
				documents.map((document) => document.id),
			]);
		});
	const syncShotCameraEntryFromDocument =
		overrides.syncShotCameraEntryFromDocument ??
		((entry) => calls.push(["sync-shot-entry", entry.camera.uuid]));
	const getShotCameraExportBaseName =
		overrides.getShotCameraExportBaseName ??
		((documentState) => `export-${documentState.id}`);
	const bridge = createProjectStateBridge({
		store,
		state,
		viewportCamera,
		shotCameraRegistry,
		contentRoot,
		getAssetController: () => assetController,
		getLightingController: () => lightingController,
		getReferenceImageController: () => referenceImageController,
		getMeasurementController: () => measurementController,
		getInteractionController: () => interactionController,
		getPerSplatEditController: () => perSplatEditController,
		getViewportProjectionController: () => viewportProjectionController,
		getFrameController: () => frameController,
		getOutputFrameController: () => outputFrameController,
		getSceneFramingController: () => sceneFramingController,
		getShotCameraEditorStateController: () => shotCameraEditorStateController,
		registerShotCameraDocuments,
		getShotCameraDocument,
		getActiveShotCameraDocument,
		getActiveShotCameraEntry,
		setShotCameraDocuments,
		syncShotCameraEntryFromDocument,
		getShotCameraExportBaseName,
		syncControlsToMode: () => calls.push(["sync-controls"]),
		syncViewportProjection: () => calls.push(["sync-viewport"]),
		syncShotProjection: () => calls.push(["sync-shot"]),
		applyCameraViewProjection: () => calls.push(["apply-camera-view"]),
		syncOutputCamera: () => calls.push(["sync-output-camera"]),
		updateShotCameraHelpers: () => calls.push(["update-shot-helpers"]),
		updateCameraSummary: () => calls.push(["update-camera-summary"]),
		updateOutputFrameOverlay: () => calls.push(["update-output-overlay"]),
		updateUi: () => calls.push(["update-ui"]),
		cloneShotCameraDocumentImpl: (documentState) => ({ ...documentState }),
		createDefaultShotCameraDocumentsImpl:
			overrides.createDefaultShotCameraDocumentsImpl ??
			(() => [{ id: "shot-camera-1", name: "Camera 1" }]),
		getDefaultProjectFilenameImpl: () => "default.ssproj",
		buildLegacyProjectImportImpl:
			overrides.buildLegacyProjectImportImpl ??
			((input) => ({
				activeShotCameraId: "camera-a",
				shots: [
					{
						document: { id: "camera-a", name: "Camera A" },
						transform: { id: "transform-a", input },
					},
				],
			})),
		applyLegacyCameraTransformImpl:
			overrides.applyLegacyCameraTransformImpl ??
			((camera, transform) =>
				calls.push(["apply-legacy-transform", camera.uuid, transform.id])),
	});

	return {
		bridge,
		calls,
		store,
		state,
		viewportCamera,
		shotCameraRegistry,
		getShotDocuments: () => shotDocuments,
	};
}

{
	const camera = new THREE.PerspectiveCamera();
	camera.position.set(1, 2, 3);
	camera.quaternion.set(0.1, 0.2, 0.3, 0.9).normalize();
	camera.up.set(0, 0, 1);

	const snapshot = captureCameraPose(camera);
	camera.position.set(7, 8, 9);
	camera.quaternion.set(0, 0, 0, 1);
	camera.up.set(0, 1, 0);

	assert.equal(restoreCameraPose(camera, snapshot), true);
	assert.deepEqual(
		[camera.position.x, camera.position.y, camera.position.z],
		[1, 2, 3],
	);
	assert.deepEqual([camera.up.x, camera.up.y, camera.up.z], [0, 0, 1]);
	assert.equal(restoreCameraPose(null, snapshot), false);
}

{
	const { bridge, store, viewportCamera } = createBridgeHarness();
	store.viewportLod = {
		userScale: { value: 0.72 },
		effectiveScale: { value: 0.72 },
	};
	const workspaceState = bridge.captureWorkspaceState();
	const projectState = bridge.captureProjectState();

	assert.equal(workspaceState.activeShotCameraId, "camera-a");
	assert.equal(
		workspaceState.viewportPose.position.x,
		viewportCamera.position.x,
	);
	assert.equal(workspaceState.referenceImageEditor.id, "editor-a");
	assert.deepEqual(workspaceState.splatEdit, {
		scopeAssetIds: ["splat-a"],
		selectionCount: 2,
	});
	assert.deepEqual(projectState.scene.assets, [{ id: "asset-a" }]);
	assert.equal(projectState.shotCameras[0].pose.position.x, 4);
	assert.equal(bridge.buildProjectFilename(), "export-camera-a.ssproj");
	assert.equal(
		JSON.stringify(workspaceState).includes("viewportLod"),
		false,
		"Viewport LoD is a machine-local preference and must not enter working/history snapshots.",
	);
	assert.equal(
		JSON.stringify(projectState).includes("viewportLod"),
		false,
		"Viewport LoD is a machine-local preference and must not enter project snapshots.",
	);
}

{
	const { bridge, calls, store, viewportCamera, shotCameraRegistry } =
		createBridgeHarness();
	const snapshot = bridge.captureWorkspaceState();

	store.workspace.activeShotCameraId.value = "missing";
	store.viewportBaseFovX.value = 10;
	store.viewportBaseFovXDirty.value = false;
	viewportCamera.position.set(9, 9, 9);
	shotCameraRegistry.get("camera-a").camera.position.set(11, 12, 13);

	assert.equal(bridge.restoreWorkspaceState(snapshot), true);
	assert.equal(store.workspace.activeShotCameraId.value, "camera-a");
	assert.equal(store.viewportBaseFovX.value, 42);
	assert.equal(store.viewportBaseFovXDirty.value, true);
	assert.deepEqual(
		[
			viewportCamera.position.x,
			viewportCamera.position.y,
			viewportCamera.position.z,
		],
		[1, 2, 3],
	);
	assert.ok(
		calls.some(([label]) => label === "restore-editor-state"),
		"restores active shot camera editor state",
	);
	assert.ok(
		calls.some(([label]) => label === "restore-splat-edit"),
		"restores per-splat edit runtime state",
	);
	assert.ok(
		calls.some(([label]) => label === "sync-controls"),
		"syncs controls after restore",
	);
}

{
	const { bridge } = createBridgeHarness({
		assetController: {
			restoreSceneAssetEditState: () => false,
		},
	});

	assert.equal(
		bridge.restoreWorkspaceState({
			activeShotCameraId: "camera-a",
			shotCameras: [{ id: "camera-a" }],
		}),
		false,
	);
}

{
	const { bridge, calls, store, getShotDocuments } = createBridgeHarness();
	assert.equal(
		bridge.applyProjectPackageImport({ cameraFrames: { id: "legacy" } }),
		true,
	);
	assert.equal(store.workspace.activeShotCameraId.value, "camera-a");
	assert.deepEqual(getShotDocuments(), [{ id: "camera-a", name: "Camera A" }]);
	assert.ok(
		calls.some(([label]) => label === "apply-legacy-transform"),
		"applies imported legacy camera transforms",
	);
	assert.ok(
		calls.some(([label]) => label === "update-ui"),
		"refreshes UI after package import",
	);
}

{
	const { bridge, calls, store, shotCameraRegistry } = createBridgeHarness();
	const project = {
		workspace: {
			activeShotCameraId: "camera-a",
			viewport: {
				baseFovX: 55,
				baseFovXDirty: false,
				pose: {
					position: { x: 7, y: 8, z: 9 },
					quaternion: { x: 0, y: 0, z: 0, w: 1 },
					up: { x: 0, y: 1, z: 0 },
				},
			},
		},
		shotCameras: [
			{
				id: "camera-a",
				name: "Camera A",
				pose: {
					position: { x: 10, y: 11, z: 12 },
					quaternion: { x: 0, y: 0, z: 0, w: 1 },
					up: { x: 0, y: 1, z: 0 },
				},
			},
		],
		scene: {
			lighting: { intensity: 2 },
			referenceImages: { items: ["ref-b"] },
		},
	};

	bridge.applySavedProjectState(project);

	assert.equal(store.viewportBaseFovX.value, 55);
	assert.equal(store.viewportBaseFovXDirty.value, false);
	assert.deepEqual(
		[
			shotCameraRegistry.get("camera-a").camera.position.x,
			shotCameraRegistry.get("camera-a").camera.position.y,
			shotCameraRegistry.get("camera-a").camera.position.z,
		],
		[10, 11, 12],
	);
	assert.ok(
		calls.some(([label]) => label === "update-output-overlay"),
		"updates frame overlay after applying saved project state",
	);
	assert.ok(
		calls.some(([label]) => label === "update-ui"),
		"refreshes UI after applying saved project state",
	);
}

{
	const { bridge, calls, store, getShotDocuments } = createBridgeHarness({
		shotDocuments: [
			{ id: "camera-a", name: "Camera A", frames: [{ id: "frame-z" }] },
		],
	});

	bridge.resetWorkspaceToDefaults();

	assert.equal(store.workspace.activeShotCameraId.value, "shot-camera-1");
	assert.equal(store.viewportBaseFovXDirty.value, false);
	assert.deepEqual(getShotDocuments(), [
		{ id: "shot-camera-1", name: "Camera 1" },
	]);
	assert.deepEqual(
		calls.filter(([label]) => label === "set-shot-cameras"),
		[
			["set-shot-cameras", []],
			["set-shot-cameras", ["shot-camera-1"]],
		],
	);
	assert.ok(
		calls.some(([label]) => label === "frame-selection-clear"),
		"clears frame selection for a fresh project",
	);
	assert.ok(
		calls.some(([label]) => label === "output-selection-clear"),
		"clears output frame selection for a fresh project",
	);
	assert.ok(
		calls.some(([label]) => label === "update-ui"),
		"refreshes UI after resetting to defaults",
	);
}

console.log("✅ CAMERA_FRAMES project state bridge tests passed!");
