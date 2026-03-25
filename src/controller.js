import {
	FpsMovement,
	PointerControls,
	SparkRenderer,
	SplatMesh,
	flipPixels,
} from "@sparkjsdev/spark";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {
	BASE_RENDER_BOX,
	DEFAULT_CAMERA_FAR,
	DEFAULT_CAMERA_NEAR,
	DEFAULT_FPS_MOVE_SPEED,
	DEFAULT_POINTER_SCROLL_SPEED,
	DEFAULT_POINTER_SLIDE_SPEED,
	VIEWPORT_PIXEL_RATIO,
} from "./constants.js";
import { createAssetController } from "./controllers/asset-controller.js";
import { createCameraController } from "./controllers/camera-controller.js";
import { createExportController } from "./controllers/export-controller.js";
import { createFrameController } from "./controllers/frame-controller.js";
import { createHistoryController } from "./controllers/history-controller.js";
import { createInteractionController } from "./controllers/interaction-controller.js";
import { createOutputFrameController } from "./controllers/output-frame-controller.js";
import { createProjectionController } from "./controllers/projection-controller.js";
import { createRuntimeController } from "./controllers/runtime-controller.js";
import { createSceneFramingController } from "./controllers/scene-framing-controller.js";
import { createUiSyncController } from "./controllers/ui-sync-controller.js";
import { createViewportToolController } from "./controllers/viewport-tool-controller.js";
import { drawFramesToContext } from "./engine/frame-overlay.js";
import {
	GUIDE_GRID_LAYER_MODE_BOTTOM,
	createGuideOverlay,
} from "./engine/guide-overlays.js";
import { horizontalToVerticalFovDegrees } from "./engine/projection.js";
import {
	formatAssetWorldScale,
	getDefaultAssetUnitMode,
} from "./engine/scene-units.js";
import { getAnchorLabel, translate } from "./i18n.js";
import {
	applyLegacyCameraTransform,
	buildLegacyProjectImport,
} from "./importers/legacy-ssproj.js";
import {
	extractProjectPackageAssets,
	isProjectPackageSource,
} from "./project-package.js";
import {
	WORKSPACE_PANE_CAMERA,
	cloneShotCameraDocument,
} from "./workspace-model.js";

export function createCameraFramesController(elements, store) {
	const {
		viewportCanvas,
		viewportShell,
		workbenchLeftColumn,
		workbenchRightColumn,
		renderBox,
		frameOverlayCanvas,
		viewportGizmo,
		viewportGizmoSvg,
		renderBoxMeta,
		anchorDot,
		dropHint,
		assetInput,
	} = elements;

	const outputFrameState = {
		get widthScale() {
			return store.renderBox.widthScale.value;
		},
		set widthScale(value) {
			updateActiveShotCameraDocument((documentState) => {
				documentState.outputFrame.widthScale = value;
				return documentState;
			});
		},
		get heightScale() {
			return store.renderBox.heightScale.value;
		},
		set heightScale(value) {
			updateActiveShotCameraDocument((documentState) => {
				documentState.outputFrame.heightScale = value;
				return documentState;
			});
		},
		get viewZoom() {
			return store.renderBox.viewZoom.value;
		},
		set viewZoom(value) {
			updateActiveShotCameraDocument((documentState) => {
				documentState.outputFrame.viewZoom = value;
				return documentState;
			});
		},
		get anchor() {
			return store.renderBox.anchor.value;
		},
		set anchor(value) {
			updateActiveShotCameraDocument((documentState) => {
				documentState.outputFrame.anchor = value;
				return documentState;
			});
		},
	};

	const state = {
		get mode() {
			return store.mode.value;
		},
		get baseFovX() {
			return store.baseFovX.value;
		},
		set baseFovX(value) {
			updateActiveShotCameraDocument((documentState) => {
				documentState.lens.baseFovX = Number(value);
				return documentState;
			});
		},
		get viewportBaseFovX() {
			return store.viewportBaseFovX.value;
		},
		set viewportBaseFovX(value) {
			store.viewportBaseFovX.value = Number(value);
		},
		outputFrame: outputFrameState,
		exportBusy: false,
		exportStatusKey: "export.idle",
		outputFrameSelected: false,
		interactionMode: "navigate",
		lastCameraSummary: "",
		lastSceneSummary: "",
		lastSceneScaleSummary: "",
	};

	const OUTPUT_FRAME_RESIZE_HANDLES = {
		"top-left": { x: 0, y: 0, affectsWidth: true, affectsHeight: true },
		top: { x: 0.5, y: 0, affectsWidth: false, affectsHeight: true },
		"top-right": { x: 1, y: 0, affectsWidth: true, affectsHeight: true },
		right: { x: 1, y: 0.5, affectsWidth: true, affectsHeight: false },
		"bottom-right": { x: 1, y: 1, affectsWidth: true, affectsHeight: true },
		bottom: { x: 0.5, y: 1, affectsWidth: false, affectsHeight: true },
		"bottom-left": { x: 0, y: 1, affectsWidth: true, affectsHeight: true },
		left: { x: 0, y: 0.5, affectsWidth: true, affectsHeight: false },
	};

	const sceneState = {
		assets: [],
		nextAssetId: 1,
	};

	const renderer = new THREE.WebGLRenderer({
		canvas: viewportCanvas,
		antialias: false,
		alpha: false,
	});
	renderer.setPixelRatio(VIEWPORT_PIXEL_RATIO);
	renderer.outputColorSpace = THREE.SRGBColorSpace;

	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0x08111d);

	const spark = new SparkRenderer({
		renderer,
		sortRadial: true,
		lodSplatScale: 1.1,
	});
	scene.add(spark);

	const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
	const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
	keyLight.position.set(3, 5, 4);
	scene.add(ambientLight, keyLight);

	const contentRoot = new THREE.Group();
	const splatRoot = new THREE.Group();
	const modelRoot = new THREE.Group();
	contentRoot.add(splatRoot, modelRoot);
	scene.add(contentRoot);

	const guides = new THREE.Group();
	const guideOverlay = createGuideOverlay();
	guides.add(guideOverlay.group);
	scene.add(guides);

	const viewportCamera = new THREE.PerspectiveCamera(
		50,
		1,
		DEFAULT_CAMERA_NEAR,
		DEFAULT_CAMERA_FAR,
	);
	const shotCameraRegistry = new Map();

	function registerShotCameraDocuments() {
		return cameraController.registerShotCameraDocuments();
	}

	function getActiveShotCameraEntry() {
		return cameraController.getActiveShotCameraEntry();
	}

	function getShotCameraDocument(shotCameraId) {
		return cameraController.getShotCameraDocument(shotCameraId);
	}

	function getActiveShotCameraDocument() {
		return cameraController.getActiveShotCameraDocument();
	}

	function updateActiveShotCameraDocument(updateDocument) {
		return cameraController.updateActiveShotCameraDocument(updateDocument);
	}

	function setShotCameraDocuments(nextDocuments) {
		return cameraController.setShotCameraDocuments(nextDocuments);
	}

	function getShotCameraExportBaseName(documentState, fallbackIndex = 1) {
		return cameraController.getShotCameraExportBaseName(
			documentState,
			fallbackIndex,
		);
	}

	function getActiveFrames() {
		return frameController.getActiveFrames();
	}

	function resolveFrameAxis(value) {
		return frameController.resolveFrameAxis(value);
	}

	function resolveFrameAnchor(value, fallback = null) {
		return frameController.resolveFrameAnchor(value, fallback);
	}

	function getFrameAnchorDocument(frame) {
		return frameController.getFrameAnchorDocument(frame);
	}

	function isFrameSelectionActive() {
		return frameController.isFrameSelectionActive();
	}

	function clearFrameDrag() {
		return frameController.clearFrameDrag();
	}

	function clearFrameSelection() {
		return frameController.clearFrameSelection();
	}

	function clearOutputFramePan() {
		return outputFrameController.clearOutputFramePan();
	}

	function clearOutputFrameAnchorDrag() {
		return outputFrameController.clearOutputFrameAnchorDrag();
	}

	function clearOutputFrameResize() {
		return outputFrameController.clearOutputFrameResize();
	}

	function selectOutputFrame() {
		return outputFrameController.selectOutputFrame();
	}

	function clearOutputFrameSelection() {
		return outputFrameController.clearOutputFrameSelection();
	}

	function getActiveShotCamera() {
		return cameraController.getActiveShotCamera();
	}

	function getActiveCameraViewCamera() {
		return cameraController.getActiveCameraViewCamera();
	}

	function getActiveOutputCamera() {
		return cameraController.getActiveOutputCamera();
	}

	function getAutoClipRange(camera) {
		return sceneFramingController.getAutoClipRange(camera);
	}

	function updateShotCameraHelpers() {
		return cameraController.updateShotCameraHelpers();
	}

	function syncShotCameraEntryFromDocument(entry) {
		return cameraController.syncShotCameraEntryFromDocument(entry);
	}

	function syncActiveShotCameraFromDocument() {
		return cameraController.syncActiveShotCameraFromDocument();
	}

	const fpsMovement = new FpsMovement({
		moveSpeed: DEFAULT_FPS_MOVE_SPEED,
	});
	const pointerControls = new PointerControls({
		canvas: renderer.domElement,
		slideSpeed: DEFAULT_POINTER_SLIDE_SPEED,
		scrollSpeed: DEFAULT_POINTER_SCROLL_SPEED,
		moveInertia: 0.01,
		rotateInertia: 0.01,
		reverseSlide: true,
	});
	pointerControls.pointerRollScale = 0.0;

	const loader = new GLTFLoader();
	let assetController = null;
	let frameController = null;
	let cameraController = null;
	let historyController = null;
	let interactionController = null;
	let outputFrameController = null;
	let projectionController = null;
	let runtimeController = null;
	let sceneFramingController = null;
	let uiSyncController = null;
	let viewportToolController = null;

	function currentLocale() {
		return store.locale.value;
	}

	function t(key, params) {
		return translate(currentLocale(), key, params);
	}

	function captureCameraPose(camera) {
		return {
			position: {
				x: camera.position.x,
				y: camera.position.y,
				z: camera.position.z,
			},
			quaternion: {
				x: camera.quaternion.x,
				y: camera.quaternion.y,
				z: camera.quaternion.z,
				w: camera.quaternion.w,
			},
			up: {
				x: camera.up.x,
				y: camera.up.y,
				z: camera.up.z,
			},
		};
	}

	function restoreCameraPose(camera, snapshot) {
		if (!camera || !snapshot) {
			return false;
		}

		camera.position.set(
			Number(snapshot.position?.x ?? camera.position.x),
			Number(snapshot.position?.y ?? camera.position.y),
			Number(snapshot.position?.z ?? camera.position.z),
		);
		camera.quaternion.set(
			Number(snapshot.quaternion?.x ?? camera.quaternion.x),
			Number(snapshot.quaternion?.y ?? camera.quaternion.y),
			Number(snapshot.quaternion?.z ?? camera.quaternion.z),
			Number(snapshot.quaternion?.w ?? camera.quaternion.w),
		);
		camera.up.set(
			Number(snapshot.up?.x ?? camera.up.x),
			Number(snapshot.up?.y ?? camera.up.y),
			Number(snapshot.up?.z ?? camera.up.z),
		);
		camera.updateMatrixWorld(true);
		return true;
	}

	function captureWorkspaceState() {
		return {
			activeShotCameraId: store.workspace.activeShotCameraId.value,
			viewportBaseFovX: store.viewportBaseFovX.value,
			shotCameras: store.workspace.shotCameras.value.map((documentState) =>
				cloneShotCameraDocument(documentState),
			),
			viewportPose: captureCameraPose(viewportCamera),
			shotCameraPoses: Array.from(shotCameraRegistry.entries()).map(
				([shotCameraId, entry]) => ({
					id: shotCameraId,
					pose: captureCameraPose(entry.camera),
				}),
			),
			sceneAssets: assetController?.captureSceneAssetEditState?.() ?? null,
			frameSelectionActive: store.frames.selectionActive.value,
			outputFrameSelected: state.outputFrameSelected,
		};
	}

	function restoreWorkspaceState(snapshot) {
		if (!snapshot || !Array.isArray(snapshot.shotCameras)) {
			return false;
		}

		if (!assetController?.restoreSceneAssetEditState?.(snapshot.sceneAssets)) {
			return false;
		}

		setShotCameraDocuments(
			snapshot.shotCameras.map((documentState) =>
				cloneShotCameraDocument(documentState),
			),
		);
		registerShotCameraDocuments();
		if (!getShotCameraDocument(snapshot.activeShotCameraId)) {
			return false;
		}

		store.workspace.activeShotCameraId.value = snapshot.activeShotCameraId;
		store.viewportBaseFovX.value = Number.isFinite(snapshot.viewportBaseFovX)
			? snapshot.viewportBaseFovX
			: store.viewportBaseFovX.value;
		restoreCameraPose(viewportCamera, snapshot.viewportPose);

		for (const poseEntry of snapshot.shotCameraPoses ?? []) {
			const entry = shotCameraRegistry.get(poseEntry.id);
			if (!entry) {
				return false;
			}
			restoreCameraPose(entry.camera, poseEntry.pose);
			syncShotCameraEntryFromDocument(entry);
		}

		frameController?.clearFrameInteraction();
		outputFrameController?.clearOutputFramePan();
		outputFrameController?.clearOutputFrameAnchorDrag();
		outputFrameController?.clearOutputFrameResize();
		store.frames.selectionActive.value = Boolean(snapshot.frameSelectionActive);
		state.outputFrameSelected =
			!store.frames.selectionActive.value &&
			Boolean(snapshot.outputFrameSelected);
		interactionController?.clearControlMomentum();
		syncControlsToMode();
		syncViewportProjection();
		syncShotProjection();
		applyCameraViewProjection();
		syncOutputCamera();
		updateShotCameraHelpers();
		updateCameraSummary();
		return true;
	}

	function getLegacyImportSceneRadius() {
		const box = new THREE.Box3().setFromObject(contentRoot);
		if (box.isEmpty()) {
			return 1;
		}

		const size = box.getSize(new THREE.Vector3());
		return Math.max(size.length() * 0.35, 0.6);
	}

	function applyProjectPackageImport(importState) {
		const legacyImport = buildLegacyProjectImport({
			cameraFramesState: importState?.cameraFrames ?? null,
			sceneRadius: getLegacyImportSceneRadius(),
		});
		if (!legacyImport?.shots?.length) {
			return false;
		}

		setShotCameraDocuments(legacyImport.shots.map((shot) => shot.document));
		store.workspace.activeShotCameraId.value =
			legacyImport.activeShotCameraId ??
			legacyImport.shots[0]?.document.id ??
			store.workspace.activeShotCameraId.value;

		for (const shot of legacyImport.shots) {
			const entry = shotCameraRegistry.get(shot.document.id);
			if (!entry) {
				continue;
			}

			applyLegacyCameraTransform(entry.camera, shot.transform);
			syncShotCameraEntryFromDocument(entry);
		}

		const activeEntry = getActiveShotCameraEntry();
		if (activeEntry) {
			sceneFramingController.copyPose(activeEntry.camera, viewportCamera);
		}

		interactionController?.clearControlMomentum();
		interactionController?.syncControlsToMode();
		syncViewportProjection();
		syncShotProjection();
		applyCameraViewProjection();
		syncOutputCamera();
		updateOutputFrameOverlay();
		updateShotCameraHelpers();
		updateCameraSummary();
		updateUi();
		return true;
	}

	historyController = createHistoryController({
		store,
		captureWorkspaceState,
		restoreWorkspaceState,
		updateUi: () => updateUi(),
	});

	assetController = createAssetController({
		sceneState,
		assetInput,
		store,
		loader,
		splatRoot,
		modelRoot,
		contentRoot,
		SplatMesh,
		setStatus,
		updateUi,
		updateCameraSummary,
		frameAllCameras,
		placeAllCamerasAtHome,
		resetLocalizedCaches,
		setExportStatus,
		t,
		formatAssetWorldScale,
		getDefaultAssetUnitMode,
		isProjectPackageSource,
		extractProjectPackageAssets,
		applyProjectPackageImport,
		disposeObject,
		runHistoryAction: historyController.runHistoryAction,
		clearHistory: historyController.clearHistory,
	});

	const exportController = createExportController({
		scene,
		renderer,
		spark,
		guides,
		guideOverlay,
		shotCameraRegistry,
		store,
		flipPixels,
		drawFramesToContext,
		t,
		setStatus,
		setExportStatus,
		updateUi,
		getTotalLoadedItems,
		getSceneAssets,
		getShotCameraDocument,
		getActiveShotCameraDocument,
		getActiveOutputCamera,
		getActiveFrames,
		getOutputSizeState,
		getShotCameraExportBaseName,
		syncActiveShotCameraFromDocument,
		syncShotProjection,
		syncOutputCamera,
		updateShotCameraHelpers,
	});

	sceneFramingController = createSceneFramingController({
		getSceneBounds,
		getSceneFramingBounds: () => assetController.getSceneFramingBounds(),
		viewportCamera,
		shotCameraRegistry,
		syncShotCameraEntryFromDocument: (entry) =>
			cameraController?.syncShotCameraEntryFromDocument(entry),
		syncControlsToMode: () => interactionController?.syncControlsToMode(),
		fpsMovement,
	});

	cameraController = createCameraController({
		store,
		state,
		scene,
		viewportCamera,
		shotCameraRegistry,
		horizontalToVerticalFovDegrees,
		t,
		setStatus,
		updateUi,
		getAutoClipRange: (camera) =>
			sceneFramingController.getAutoClipRange(camera),
		clearFrameDrag: () => frameController.clearFrameDrag(),
		clearOutputFramePan,
		clearOutputFrameSelection,
		clearControlMomentum: () => interactionController?.clearControlMomentum(),
		applyNavigateInteractionMode: () =>
			interactionController?.applyNavigateInteractionMode({ silent: true }),
		copyPose: (...args) => sceneFramingController.copyPose(...args),
		placeCameraAtHome: (...args) =>
			sceneFramingController.placeCameraAtHome(...args),
		frameCamera: (...args) => sceneFramingController.frameCamera(...args),
		syncControlsToMode: () => interactionController?.syncControlsToMode(),
		runHistoryAction: historyController.runHistoryAction,
	});
	frameController = createFrameController({
		store,
		state,
		renderBox,
		workspacePaneCamera: WORKSPACE_PANE_CAMERA,
		isZoomToolActive: () => interactionController?.isZoomToolActive() ?? false,
		t,
		setStatus,
		updateUi,
		clearOutputFrameSelection: () =>
			outputFrameController?.clearOutputFrameSelection(),
		clearOutputFramePan: () => outputFrameController?.clearOutputFramePan(),
		getActiveShotCameraDocument,
		updateActiveShotCameraDocument,
		getOutputFrameMetrics,
		runHistoryAction: historyController.runHistoryAction,
		beginHistoryTransaction: historyController.beginHistoryTransaction,
		commitHistoryTransaction: historyController.commitHistoryTransaction,
		cancelHistoryTransaction: historyController.cancelHistoryTransaction,
	});
	outputFrameController = createOutputFrameController({
		store,
		state,
		viewportShell,
		workbenchLeftColumn,
		workbenchRightColumn,
		renderBox,
		renderBoxMeta,
		anchorDot,
		frameOverlayCanvas,
		outputFrameResizeHandles: OUTPUT_FRAME_RESIZE_HANDLES,
		workspacePaneCamera: WORKSPACE_PANE_CAMERA,
		isZoomToolActive: () => interactionController?.isZoomToolActive() ?? false,
		t,
		getAnchorLabel,
		currentLocale,
		clearFrameSelection: () => frameController.clearFrameSelection(),
		isFrameSelectionActive: () => frameController.isFrameSelectionActive(),
		getActiveShotCameraDocument,
		getShotCameraDocument,
		getActiveShotCameraEntry,
		shotCameraRegistry,
		getActiveFrames: () => frameController.getActiveFrames(),
		getFrameAnchorDocument: (frame) =>
			frameController.getFrameAnchorDocument(frame),
		resolveFrameAxis: (value) => frameController.resolveFrameAxis(value),
		resolveFrameAnchor: (value, fallback) =>
			frameController.resolveFrameAnchor(value, fallback),
		getBaseFovX: () => state.baseFovX,
		updateActiveShotCameraDocument,
		updateUi,
		runHistoryAction: historyController.runHistoryAction,
		beginHistoryTransaction: historyController.beginHistoryTransaction,
		commitHistoryTransaction: historyController.commitHistoryTransaction,
		cancelHistoryTransaction: historyController.cancelHistoryTransaction,
	});
	interactionController = createInteractionController({
		state,
		viewportShell,
		fpsMovement,
		pointerControls,
		workspacePaneCamera: WORKSPACE_PANE_CAMERA,
		t,
		setStatus,
		updateUi,
		getViewZoomFactor: () => state.outputFrame.viewZoom,
		setViewZoomFactor: (nextZoom) =>
			outputFrameController.setViewZoomFactor(nextZoom),
	});
	viewportToolController = createViewportToolController({
		store,
		state,
		viewportShell,
		viewportGizmo,
		viewportGizmoSvg,
		getActiveCamera,
		assetController,
		beginHistoryTransaction: historyController.beginHistoryTransaction,
		commitHistoryTransaction: historyController.commitHistoryTransaction,
	});
	projectionController = createProjectionController({
		state,
		viewportShell,
		viewportCamera,
		renderer,
		getOutputSizeState: (documentState) =>
			outputFrameController.getOutputSizeState(documentState),
		getOutputFrameMetrics: (documentState) =>
			outputFrameController.getOutputFrameMetrics(documentState),
		getViewportSize: () => outputFrameController.getViewportSize(),
		handleOutputFrameResize: () => outputFrameController.handleResize(),
		syncActiveShotCameraFromDocument,
		getActiveShotCamera,
		getActiveShotCameraDocument,
		getActiveCameraViewCamera,
		getActiveOutputCamera,
	});
	uiSyncController = createUiSyncController({
		store,
		state,
		sceneState,
		viewportShell,
		renderBox,
		dropHint,
		fpsMovement,
		currentLocale,
		t,
		syncActiveShotCameraFromDocument,
		isZoomToolActive: () => interactionController?.isZoomToolActive() ?? false,
		updateOutputFrameOverlay,
		getSceneAssetCounts,
		getSceneBounds,
		getTotalLoadedItems,
		getActiveShotCamera,
		getActiveCamera,
		getProjectionState,
		getActiveShotCameraDocument,
	});
	runtimeController = createRuntimeController({
		renderer,
		scene,
		store,
		state,
		viewportShell,
		dropHint,
		anchorDot,
		assetController,
		updateDropHint,
		updateUi,
		updateOutputFrameOverlay,
		setStatus,
		startZoomToolDrag,
		toggleZoomTool,
		toggleViewportSelectMode,
		undoHistory: () => historyController?.undoHistory(),
		redoHistory: () => historyController?.redoHistory(),
		beginHistoryTransaction: (label) =>
			historyController?.beginHistoryTransaction(label),
		commitHistoryTransaction: (label) =>
			historyController?.commitHistoryTransaction(label),
		isInteractiveTextTarget,
		isZoomInteractionMode: () =>
			interactionController?.isZoomInteractionMode() ?? false,
		applyNavigateInteractionMode: () =>
			interactionController?.applyNavigateInteractionMode(),
		isFrameSelectionActive,
		clearFrameSelection,
		clearOutputFrameSelection,
		handleZoomToolDragMove,
		handleZoomToolDragEnd,
		handleOutputFramePanMove: outputFrameController.handleOutputFramePanMove,
		handleOutputFramePanEnd: outputFrameController.handleOutputFramePanEnd,
		handleOutputFrameResizeMove:
			outputFrameController.handleOutputFrameResizeMove,
		handleOutputFrameResizeEnd:
			outputFrameController.handleOutputFrameResizeEnd,
		handleOutputFrameAnchorDragMove:
			outputFrameController.handleOutputFrameAnchorDragMove,
		handleOutputFrameAnchorDragEnd:
			outputFrameController.handleOutputFrameAnchorDragEnd,
		handleFrameDragMove: frameController.handleFrameDragMove,
		handleFrameDragEnd: frameController.handleFrameDragEnd,
		handleFrameResizeMove: frameController.handleFrameResizeMove,
		handleFrameResizeEnd: frameController.handleFrameResizeEnd,
		handleFrameRotateMove: frameController.handleFrameRotateMove,
		handleFrameRotateEnd: frameController.handleFrameRotateEnd,
		handleFrameAnchorDragMove: frameController.handleFrameAnchorDragMove,
		handleFrameAnchorDragEnd: frameController.handleFrameAnchorDragEnd,
		handleViewportTransformDragMove:
			viewportToolController.handleViewportTransformDragMove,
		handleViewportTransformDragEnd:
			viewportToolController.handleViewportTransformDragEnd,
		pickViewportAssetAtPointer:
			viewportToolController.pickViewportAssetAtPointer,
		startOutputFrameAnchorDrag:
			outputFrameController.startOutputFrameAnchorDrag,
		syncViewportTransformGizmo:
			viewportToolController.syncViewportTransformGizmo,
		exportController,
		handleResize,
		fpsMovement,
		pointerControls,
		getActiveCamera,
		guideOverlay,
		syncGuideOverlayState,
		syncViewportProjection,
		syncShotProjection,
		applyCameraViewProjection,
		updateShotCameraHelpers,
		getActiveCameraViewCamera,
		viewportCamera,
		updateCameraSummary,
		t,
		formatNumber,
		frameAllCameras,
		placeAllCamerasAtHome,
		syncControlsToMode,
		applyInitialNavigateInteractionMode: () =>
			interactionController?.applyNavigateInteractionMode({ silent: true }),
		loadStartupUrls: () => assetController.loadStartupUrls(),
		setExportStatus,
	});
	registerShotCameraDocuments();

	function formatNumber(value, digits = 2) {
		return Number(value).toFixed(digits);
	}

	function isZoomToolActive() {
		return interactionController?.isZoomToolActive() ?? false;
	}

	function isInteractiveTextTarget(target) {
		return interactionController?.isInteractiveTextTarget(target) ?? false;
	}

	function clearZoomToolDrag() {
		return interactionController?.clearZoomToolDrag();
	}

	function applyInteractionMode(nextMode, { silent = false } = {}) {
		return interactionController?.applyInteractionMode(nextMode, { silent });
	}

	function toggleZoomTool() {
		return interactionController?.toggleZoomTool();
	}

	function startZoomToolDrag(event) {
		return interactionController?.startZoomToolDrag(event) ?? false;
	}

	function handleZoomToolDragMove(event) {
		return interactionController?.handleZoomToolDragMove(event);
	}

	function handleZoomToolDragEnd(event) {
		return interactionController?.handleZoomToolDragEnd(event);
	}

	function getActiveCamera() {
		return state.mode === WORKSPACE_PANE_CAMERA
			? getActiveShotCamera()
			: viewportCamera;
	}

	function resetLocalizedCaches() {
		return uiSyncController?.resetLocalizedCaches();
	}

	function getSceneAssetCounts() {
		return assetController.getSceneAssetCounts();
	}

	function getTotalLoadedItems() {
		return assetController.getTotalLoadedItems();
	}

	function getSceneAssets() {
		return assetController.getSceneAssets();
	}

	function getSceneBounds() {
		return assetController.getSceneBounds();
	}

	function getOutputFrameDocumentState(
		documentState = getActiveShotCameraDocument(),
	) {
		return outputFrameController.getOutputFrameDocumentState(documentState);
	}

	function getOutputSizeState(documentState = getActiveShotCameraDocument()) {
		return outputFrameController.getOutputSizeState(documentState);
	}

	function getViewportSize() {
		return outputFrameController.getViewportSize();
	}

	function syncOutputFrameFitState(
		documentState = getActiveShotCameraDocument(),
		viewportWidth = getViewportSize().width,
		viewportHeight = getViewportSize().height,
		force = false,
	) {
		return outputFrameController.syncOutputFrameFitState(
			documentState,
			viewportWidth,
			viewportHeight,
			force,
		);
	}

	function getOutputFrameMetrics(
		documentState = getActiveShotCameraDocument(),
	) {
		return outputFrameController.getOutputFrameMetrics(documentState);
	}

	function getProjectionState() {
		return projectionController.getProjectionState();
	}

	function updateOutputFrameOverlay() {
		return outputFrameController.updateOutputFrameOverlay();
	}

	function updateDropHint() {
		return uiSyncController?.updateDropHint();
	}

	function syncShotProjection() {
		return projectionController.syncShotProjection();
	}

	function applyCameraViewProjection() {
		return projectionController.applyCameraViewProjection();
	}

	function syncViewportProjection() {
		return projectionController.syncViewportProjection();
	}

	function clearControlMomentum() {
		return interactionController?.clearControlMomentum();
	}

	function syncControlsToMode() {
		return interactionController?.syncControlsToMode();
	}

	function copyPose(sourceCamera, destinationCamera) {
		return sceneFramingController.copyPose(sourceCamera, destinationCamera);
	}

	function frameCamera(camera, variant) {
		return sceneFramingController.frameCamera(camera, variant);
	}

	function frameAllCameras() {
		return sceneFramingController.frameAllCameras();
	}

	function placeAllCamerasAtHome() {
		return sceneFramingController.placeAllCamerasAtHome();
	}

	function handleResize() {
		return projectionController.handleResize();
	}

	function disposeMaterial(material) {
		if (!material) {
			return;
		}

		for (const value of Object.values(material)) {
			if (value && typeof value === "object" && value.isTexture) {
				value.dispose();
			}
		}

		material.dispose();
	}

	function disposeObject(root) {
		root.traverse((node) => {
			if (node.geometry) {
				node.geometry.dispose();
			}

			if (Array.isArray(node.material)) {
				node.material.forEach(disposeMaterial);
			} else if (node.material) {
				disposeMaterial(node.material);
			}
		});
	}

	function syncOutputCamera() {
		return projectionController.syncOutputCamera();
	}

	function setLocale(nextLocale) {
		if (nextLocale === currentLocale()) {
			return;
		}

		store.locale.value = nextLocale;
		resetLocalizedCaches();
		if (getTotalLoadedItems() === 0) {
			store.exportSummary.value = t("exportSummary.empty");
		}
		updateUi();
		updateCameraSummary();
		setStatus(
			t("status.localeChanged", {
				language: t(`localeName.${nextLocale}`),
			}),
		);
	}

	function setStatus(message) {
		store.statusLine.value = message;
	}

	function updateSceneSummary() {
		return uiSyncController?.updateSceneSummary();
	}

	function syncGuideOverlayState(
		documentState = getActiveShotCameraDocument(),
		{ gridVisible = true, eyeLevelVisible = true } = {},
	) {
		guideOverlay.applyState({
			gridVisible,
			eyeLevelVisible,
			gridLayerMode:
				documentState?.exportSettings?.exportGridLayerMode === "overlay"
					? "overlay"
					: GUIDE_GRID_LAYER_MODE_BOTTOM,
		});
	}

	function updateCameraSummary() {
		return uiSyncController?.updateCameraSummary();
	}

	function setExportStatus(key, busy = false) {
		state.exportStatusKey = key;
		state.exportBusy = busy;
		store.exportStatusKey.value = key;
		store.exportBusy.value = busy;
	}

	function updateUi() {
		return uiSyncController?.updateUi();
	}

	function setViewportPivotEditMode(nextEnabled) {
		if (nextEnabled) {
			store.viewportSelectMode.value = false;
		}
		store.viewportPivotEditMode.value = Boolean(nextEnabled);
		viewportToolController.setViewportPivotEditMode(nextEnabled);
		interactionController?.syncControlsToMode();
	}

	function setViewportSelectMode(nextEnabled) {
		if (nextEnabled) {
			store.viewportPivotEditMode.value = false;
		}
		store.viewportSelectMode.value = Boolean(nextEnabled);
		viewportToolController.setViewportSelectMode(nextEnabled);
		interactionController?.syncControlsToMode();
	}

	function toggleViewportSelectMode() {
		setViewportSelectMode(!store.viewportSelectMode.value);
	}

	function resetSelectedAssetWorkingPivot() {
		const selectedAssetId = store.selectedSceneAssetId.value;
		if (!selectedAssetId) {
			return;
		}
		assetController.resetAssetWorkingPivot(selectedAssetId);
	}

	function clearScene() {
		store.viewportSelectMode.value = false;
		store.viewportPivotEditMode.value = false;
		assetController.clearScene();
	}

	runtimeController.init();

	return {
		setMode: cameraController.setMode,
		setLocale,
		setBaseFovX: cameraController.setBaseFovX,
		setViewportBaseFovX: cameraController.setViewportBaseFovX,
		setViewportTransformSpace: viewportToolController.setViewportTransformSpace,
		setViewportSelectMode,
		toggleViewportSelectMode,
		setViewportPivotEditMode,
		setViewportTransformHover: viewportToolController.setViewportTransformHover,
		setBoxWidthPercent: outputFrameController.setBoxWidthPercent,
		setBoxHeightPercent: outputFrameController.setBoxHeightPercent,
		setViewZoomPercent: outputFrameController.setViewZoomPercent,
		setAnchor: outputFrameController.setAnchor,
		setShotCameraClippingMode: cameraController.setShotCameraClippingMode,
		setShotCameraNear: cameraController.setShotCameraNear,
		setShotCameraFar: cameraController.setShotCameraFar,
		setShotCameraExportName: cameraController.setShotCameraExportName,
		setShotCameraExportFormat: cameraController.setShotCameraExportFormat,
		setShotCameraExportGridOverlay:
			cameraController.setShotCameraExportGridOverlay,
		setShotCameraExportGridLayerMode:
			cameraController.setShotCameraExportGridLayerMode,
		setShotCameraExportModelLayers:
			cameraController.setShotCameraExportModelLayers,
		setShotCameraExportSplatLayers:
			cameraController.setShotCameraExportSplatLayers,
		setExportTarget: exportController.setExportTarget,
		toggleExportPreset: exportController.toggleExportPreset,
		selectFrame: frameController.selectFrame,
		createFrame: frameController.createFrame,
		duplicateActiveFrame: frameController.duplicateActiveFrame,
		deleteActiveFrame: frameController.deleteActiveFrame,
		startFrameDrag: frameController.startFrameDrag,
		startFrameResize: frameController.startFrameResize,
		startFrameRotate: frameController.startFrameRotate,
		startFrameAnchorDrag: frameController.startFrameAnchorDrag,
		startOutputFramePan: outputFrameController.startOutputFramePan,
		startOutputFrameResize: outputFrameController.startOutputFrameResize,
		selectShotCamera: cameraController.selectShotCamera,
		createShotCamera: cameraController.createShotCamera,
		duplicateActiveShotCamera: cameraController.duplicateActiveShotCamera,
		selectSceneAsset: assetController.selectSceneAsset,
		pickViewportAssetAtPointer:
			viewportToolController.pickViewportAssetAtPointer,
		startViewportTransformDrag:
			viewportToolController.startViewportTransformDrag,
		setAssetWorldScale: assetController.setAssetWorldScale,
		setAssetTransform: assetController.setAssetTransform,
		resetAssetWorldScale: assetController.resetAssetWorldScale,
		resetSelectedAssetWorkingPivot,
		setAssetPosition: assetController.setAssetPosition,
		setAssetRotationDegrees: assetController.setAssetRotationDegrees,
		setAssetVisibility: assetController.setAssetVisibility,
		moveAssetUp: assetController.moveAssetUp,
		moveAssetDown: assetController.moveAssetDown,
		moveAssetToIndex: assetController.moveAssetToIndex,
		setAssetExportRole: assetController.setAssetExportRole,
		setAssetMaskGroup: assetController.setAssetMaskGroup,
		openFiles: assetController.openFiles,
		clearScene,
		loadRemoteUrls: assetController.loadRemoteUrls,
		handleAssetInputChange: assetController.handleAssetInputChange,
		copyViewportToShotCamera: cameraController.copyViewportToShotCamera,
		copyShotCameraToViewport: cameraController.copyShotCameraToViewport,
		resetActiveView: cameraController.resetActiveView,
		downloadOutput: exportController.downloadOutput,
		downloadPng: exportController.downloadPng,
		downloadPsd: exportController.downloadPsd,
		beginHistoryTransaction: (label) =>
			historyController?.beginHistoryTransaction(label),
		commitHistoryTransaction: (label) =>
			historyController?.commitHistoryTransaction(label),
		cancelHistoryTransaction: () =>
			historyController?.cancelHistoryTransaction(),
		undoHistory: () => historyController?.undoHistory(),
		redoHistory: () => historyController?.redoHistory(),
		dispose() {
			guideOverlay.dispose();
			runtimeController.dispose();
		},
	};
}
