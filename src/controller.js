import {
	FpsMovement,
	PointerControls,
	SparkRenderer,
	SplatMesh,
	flipPixels,
} from "@sparkjsdev/spark";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { createCameraPoseCommands } from "./app/camera-pose-commands.js";
import {
	createControllerAccessors,
	createShotCameraEditorStateAccessors,
} from "./app/controller-accessors.js";
import { createFileOpenRouting } from "./app/file-open-routing.js";
import { createInteractionZoomCommands } from "./app/interaction-zoom-commands.js";
import { createOutputFrameAccessors } from "./app/output-frame-accessors.js";
import { createPresentationSync } from "./app/presentation-sync.js";
import { createProjectSceneCommands } from "./app/project-scene-commands.js";
import { createProjectStateBridge } from "./app/project-state-bridge.js";
import { createProjectionFramingCommands } from "./app/projection-framing-commands.js";
import { createSceneAssetAccessors } from "./app/scene-asset-accessors.js";
import { createShotCameraEditorStateController } from "./app/shot-camera-editor-state.js";
import { createViewSyncCommands } from "./app/view-sync-commands.js";
import { createViewportEditingCommands } from "./app/viewport-editing-commands.js";
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
import { createLightingController } from "./controllers/lighting-controller.js";
import { createMeasurementController } from "./controllers/measurement-controller.js";
import { createOutputFrameController } from "./controllers/output-frame-controller.js";
import { createProjectController } from "./controllers/project-controller.js";
import { createProjectionController } from "./controllers/projection-controller.js";
import { createReferenceImageController } from "./controllers/reference-image-controller.js";
import { createReferenceImageRenderController } from "./controllers/reference-image-render-controller.js";
import { createRuntimeController } from "./controllers/runtime-controller.js";
import { createSceneFramingController } from "./controllers/scene-framing-controller.js";
import { createUiSyncController } from "./controllers/ui-sync-controller.js";
import { createViewportAxisGizmoController } from "./controllers/viewport-axis-gizmo-controller.js";
import { createViewportProjectionController } from "./controllers/viewport-projection-controller.js";
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
	extractProjectPackageAssets,
	isProjectPackageSource,
} from "./project-package.js";
import {
	WORKSPACE_PANE_CAMERA,
	WORKSPACE_PANE_VIEWPORT,
} from "./workspace-model.js";

export function createCameraFramesController(elements, store) {
	const {
		viewportCanvas,
		viewportShell,
		workbenchRightColumn,
		renderBox,
		frameOverlayCanvas,
		viewportGizmo,
		viewportGizmoSvg,
		viewportAxisGizmo,
		viewportAxisGizmoSvg,
		renderBoxMeta,
		anchorDot,
		dropHint,
		assetInput,
		referenceImageInput,
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
		get viewportBaseFovXDirty() {
			return store.viewportBaseFovXDirty.value;
		},
		set viewportBaseFovXDirty(value) {
			store.viewportBaseFovXDirty.value = Boolean(value);
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
	const viewportOrthoCamera = new THREE.OrthographicCamera(
		-1,
		1,
		1,
		-1,
		DEFAULT_CAMERA_NEAR,
		DEFAULT_CAMERA_FAR,
	);
	const shotCameraRegistry = new Map();

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
	let lightingController = null;
	let outputFrameController = null;
	let projectController = null;
	let projectionController = null;
	let referenceImageController = null;
	let referenceImageRenderController = null;
	let measurementController = null;
	let runtimeController = null;
	let sceneFramingController = null;
	let uiSyncController = null;
	let viewportAxisGizmoController = null;
	let viewportProjectionController = null;
	let viewportToolController = null;
	let shotCameraEditorStateController = null;
	let projectPresentationSyncSuspended = true;

	const {
		registerShotCameraDocuments,
		getActiveShotCameraEntry,
		getShotCameraDocument,
		getActiveShotCameraDocument,
		updateActiveShotCameraDocument,
		setShotCameraDocuments,
		getShotCameraExportBaseName,
		getActiveFrames,
		resolveFrameAxis,
		resolveFrameAnchor,
		getFrameAnchorDocument,
		isFrameSelectionActive,
		clearFrameDrag,
		clearFrameSelection,
		clearOutputFramePan,
		clearOutputFrameAnchorDrag,
		clearOutputFrameResize,
		selectOutputFrame,
		clearOutputFrameSelection,
		getActiveShotCamera,
		getActiveCameraViewCamera,
		getActiveOutputCamera,
		getAutoClipRange,
		updateShotCameraHelpers,
		syncShotCameraEntryFromDocument,
		syncActiveShotCameraFromDocument,
	} = createControllerAccessors({
		getCameraController: () => cameraController,
		getFrameController: () => frameController,
		getOutputFrameController: () => outputFrameController,
		getSceneFramingController: () => sceneFramingController,
	});
	const {
		getActiveViewportCamera,
		getActiveCamera,
		getActiveCameraHeadingDeg,
		getActiveShotCameraPoseState,
		setActiveShotCameraPoseAngle,
		moveActiveShotCameraLocalAxis,
	} = createCameraPoseCommands({
		state,
		viewportCamera,
		getActiveShotCamera,
		getCameraController: () => cameraController,
		getHistoryController: () => historyController,
		getProjectionController: () => projectionController,
		getViewportProjectionController: () => viewportProjectionController,
		updateUi: () => updateUi(),
	});
	const {
		getOutputFrameDocumentState,
		getOutputSizeState,
		getViewportSize,
		syncOutputFrameFitState,
		getOutputFrameMetrics,
	} = createOutputFrameAccessors({
		getActiveShotCameraDocument,
		getOutputFrameController: () => outputFrameController,
	});
	const {
		isZoomToolActive,
		isInteractiveTextTarget,
		clearZoomToolDrag,
		applyInteractionMode,
		toggleZoomTool,
		startZoomToolDrag,
		handleZoomToolDragMove,
		handleZoomToolDragEnd,
	} = createInteractionZoomCommands({
		getInteractionController: () => interactionController,
		getMeasurementController: () => measurementController,
	});
	const {
		resetLocalizedCaches,
		getSceneAssetCounts,
		getTotalLoadedItems,
		getSceneAssets,
		getSceneBounds,
	} = createSceneAssetAccessors({
		getAssetController: () => assetController,
		getUiSyncController: () => uiSyncController,
	});

	function currentLocale() {
		return store.locale.value;
	}

	function t(key, params) {
		return translate(currentLocale(), key, params);
	}

	const {
		updateOutputFrameOverlay,
		updateDropHint,
		updateSceneSummary,
		syncGuideOverlayState,
		updateCameraSummary,
	} = createViewSyncCommands({
		state,
		guideOverlay,
		getActiveShotCameraDocument,
		getOutputFrameController: () => outputFrameController,
		getUiSyncController: () => uiSyncController,
		getViewportProjectionController: () => viewportProjectionController,
		safeSyncReferenceImagePreview: () => safeSyncReferenceImagePreview(),
	});
	const {
		getProjectionState,
		syncShotProjection,
		applyCameraViewProjection,
		syncViewportProjection,
		clearControlMomentum,
		syncControlsToMode,
		setViewportProjectionMode,
		alignViewportToOrthographicView,
		toggleViewportOrthographicAxis,
		copyPose,
		frameCamera,
		frameAllCameras,
		placeAllCamerasAtHome,
		handleResize,
		syncOutputCamera,
	} = createProjectionFramingCommands({
		getInteractionController: () => interactionController,
		getProjectionController: () => projectionController,
		getSceneFramingController: () => sceneFramingController,
		getViewportProjectionController: () => viewportProjectionController,
	});
	const {
		captureWorkspaceState,
		restoreWorkspaceState,
		applyProjectPackageImport,
		captureProjectState,
		buildProjectFilename,
		applySavedProjectState,
		resetWorkspaceToDefaults,
	} = createProjectStateBridge({
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
		syncControlsToMode,
		syncViewportProjection,
		syncShotProjection,
		applyCameraViewProjection,
		syncOutputCamera,
		updateShotCameraHelpers,
		updateCameraSummary,
		updateOutputFrameOverlay,
		updateUi: (...args) => updateUi(...args),
	});
	const {
		setLocale,
		setStatus,
		safeSyncReferenceImageUi,
		safeSyncReferenceImagePreview,
		setExportStatus,
		updateUi,
	} = createPresentationSync({
		store,
		state,
		currentLocale,
		t,
		resetLocalizedCaches,
		getTotalLoadedItems,
		getReferenceImageController: () => referenceImageController,
		getReferenceImageRenderController: () => referenceImageRenderController,
		getProjectController: () => projectController,
		getUiSyncController: () => uiSyncController,
		isProjectPresentationSyncSuspended: () => projectPresentationSyncSuspended,
		updateCameraSummary: () => updateCameraSummary(),
	});
	const {
		resetSelectedAssetWorkingPivot,
		clearSceneAssetSelection,
		clearScene,
		startNewProject,
		saveProject,
		exportProject,
	} = createProjectSceneCommands({
		store,
		getAssetController: () => assetController,
		getLightingController: () => lightingController,
		getMeasurementController: () => measurementController,
		getProjectController: () => projectController,
		getReferenceImageController: () => referenceImageController,
		getViewportToolController: () => viewportToolController,
	});
	const {
		setViewportToolMode,
		setViewportPivotEditMode,
		setViewportSelectMode,
		setViewportReferenceImageEditMode,
		setViewportTransformMode,
		toggleViewportSelectMode,
		toggleViewportTransformMode,
		toggleViewportReferenceImageEditMode,
		toggleViewportPivotEditMode,
		setMeasurementMode,
		toggleMeasurementMode,
		executeViewportPieAction,
	} = createViewportEditingCommands({
		store,
		state,
		getAssetController: () => assetController,
		getCameraController: () => cameraController,
		getFrameController: () => frameController,
		getInteractionController: () => interactionController,
		getMeasurementController: () => measurementController,
		getReferenceImageController: () => referenceImageController,
		getViewportToolController: () => viewportToolController,
		clearFrameSelection,
		clearOutputFrameSelection,
	});

	async function applyOpenedProject(
		parsedProject,
		{
			projectName = "",
			loadedStatus = t("status.projectLoaded"),
			onAssetProgress = null,
		} = {},
	) {
		assetController.clearScene();
		const projectSources = parsedProject.assetEntries.map(
			(entry) => entry.source,
		);
		if (projectSources.length > 0) {
			await assetController.loadSources(projectSources, false, {
				onProgress: onAssetProgress,
			});
		}
		onAssetProgress?.("apply", t("overlay.importDetailApply"));
		applySavedProjectState(parsedProject.project);
		historyController?.clearHistory();
		setStatus(loadedStatus);
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
		openProjectSource: (...args) =>
			projectController?.openProjectSource?.(...args),
		disposeObject,
		runHistoryAction: historyController.runHistoryAction,
		beginHistoryTransaction: historyController.beginHistoryTransaction,
		commitHistoryTransaction: historyController.commitHistoryTransaction,
		cancelHistoryTransaction: historyController.cancelHistoryTransaction,
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

	viewportProjectionController = createViewportProjectionController({
		store,
		viewportShell,
		viewportPerspectiveCamera: viewportCamera,
		viewportOrthographicCamera: viewportOrthoCamera,
		getViewportSize: () => outputFrameController.getViewportSize(),
		getAutoClipRange: (camera) =>
			sceneFramingController.getAutoClipRange(camera),
		getSceneFraming: () => sceneFramingController.getSceneFraming(),
		getSceneRaycastTargets: () => assetController.getSceneRaycastTargets(),
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
		getSceneBounds,
		getAutoClipRange: (camera) =>
			sceneFramingController.getAutoClipRange(camera),
		clearFrameDrag: () => frameController.clearFrameDrag(),
		clearOutputFramePan,
		clearOutputFrameSelection,
		clearControlMomentum: () => interactionController?.clearControlMomentum(),
		beforeActiveShotCameraChange: (currentShotCameraId) =>
			prepareForShotCameraSwitch(currentShotCameraId),
		afterActiveShotCameraChange: (nextShotCameraId) =>
			restoreAfterShotCameraSwitch(nextShotCameraId),
		applyNavigateInteractionMode: () =>
			interactionController?.applyNavigateInteractionMode({ silent: true }),
		copyPose: (...args) => sceneFramingController.copyPose(...args),
		placeCameraAtHome: (...args) =>
			sceneFramingController.placeCameraAtHome(...args),
		frameCamera: (...args) => sceneFramingController.frameCamera(...args),
		getViewportCameraForShotCopy: () =>
			viewportProjectionController?.getActiveViewportCamera?.() ??
			viewportCamera,
		getViewportPerspectiveCamera: () =>
			viewportProjectionController?.getViewportPerspectiveCamera?.() ??
			viewportCamera,
		prepareViewportPerspectiveMode: () => {
			const changed =
				viewportProjectionController?.setViewportProjectionMode?.(
					"perspective",
					{
						copyActivePose: false,
					},
				) ?? false;
			interactionController?.syncControlsToMode?.();
			return changed;
		},
		resetViewportView: () => {
			if (viewportProjectionController?.isViewportOrthographic?.()) {
				viewportProjectionController.resetViewportOrthographicView();
				return true;
			}
			return false;
		},
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
	referenceImageController = createReferenceImageController({
		store,
		referenceImageInput,
		renderBox,
		t,
		setStatus,
		updateUi,
		ensureCameraMode: () => cameraController.setMode(WORKSPACE_PANE_CAMERA),
		onReferenceImageSelectionCleared: () =>
			setViewportReferenceImageEditMode(false),
		getActiveShotCameraDocument,
		updateActiveShotCameraDocument,
		getOutputSizeState,
		runHistoryAction: historyController.runHistoryAction,
		beginHistoryTransaction: historyController.beginHistoryTransaction,
		commitHistoryTransaction: historyController.commitHistoryTransaction,
		cancelHistoryTransaction: historyController.cancelHistoryTransaction,
	});
	shotCameraEditorStateController = createShotCameraEditorStateController({
		store,
		state,
		getReferenceImageController: () => referenceImageController,
		getFrameController: () => frameController,
		updateUi,
	});

	const {
		captureActiveShotCameraEditorState,
		storeShotCameraEditorState,
		clearActiveShotCameraEditorState,
		restoreShotCameraEditorState,
		captureShotCameraEditorStates,
		restoreShotCameraEditorStates,
		pruneShotCameraEditorStates,
		prepareForShotCameraSwitch,
		restoreAfterShotCameraSwitch,
	} = createShotCameraEditorStateAccessors({
		getShotCameraEditorStateController: () => shotCameraEditorStateController,
	});
	referenceImageRenderController = createReferenceImageRenderController({
		store,
		renderBox,
		viewportShell,
		getActiveShotCameraDocument,
		getOutputSizeState,
	});
	interactionController = createInteractionController({
		store,
		state,
		viewportShell,
		assetController,
		fpsMovement,
		pointerControls,
		getActiveCamera,
		workspacePaneCamera: WORKSPACE_PANE_CAMERA,
		t,
		setStatus,
		updateUi,
		getViewZoomFactor: () => state.outputFrame.viewZoom,
		setViewZoomFactor: (nextZoom) =>
			outputFrameController.setViewZoomFactor(nextZoom),
		getShotCameraBaseFovX: () => state.baseFovX,
		setShotCameraBaseFovXLive: (nextValue) => {
			state.baseFovX = Number(nextValue);
			updateUi();
		},
		getViewportBaseFovX: () => state.viewportBaseFovX,
		setViewportBaseFovXLive: (nextValue) => {
			state.viewportBaseFovX = Number(nextValue);
			state.viewportBaseFovXDirty = true;
			updateUi();
		},
		isViewportOrthographic: () =>
			viewportProjectionController?.isViewportOrthographic?.() ?? false,
		panViewportOrthographic: (deltaPxX, deltaPxY) =>
			viewportProjectionController?.panViewportOrthographic?.(
				deltaPxX,
				deltaPxY,
			) ?? false,
		zoomViewportOrthographic: (deltaY, options) =>
			viewportProjectionController?.zoomViewportOrthographic?.(
				deltaY,
				options,
			) ?? false,
		offsetViewportOrthographicDepth: (deltaY, options) =>
			viewportProjectionController?.offsetViewportOrthographicDepth?.(
				deltaY,
				options,
			) ?? false,
		ensurePerspectiveForViewportRotation: () =>
			viewportProjectionController?.ensurePerspectiveForViewportRotation?.() ??
			false,
		setViewportTransientReferencePoint: (point, options) =>
			viewportProjectionController?.setViewportTransientReferencePoint?.(
				point,
				options,
			) ?? false,
		getShotCameraRollAxisWorld: () =>
			projectionController?.getShotCameraRollAxisWorld?.() ?? null,
		getShotCameraRollAngleDegrees: () =>
			projectionController?.getShotCameraRollAngleDegrees?.() ?? 0,
		applyActiveShotCameraRoll: (...args) =>
			cameraController?.applyActiveShotCameraRoll?.(...args),
		beginHistoryTransaction: (label) =>
			historyController?.beginHistoryTransaction(label),
		commitHistoryTransaction: (label) =>
			historyController?.commitHistoryTransaction(label),
		cancelHistoryTransaction: () =>
			historyController?.cancelHistoryTransaction(),
	});
	viewportToolController = createViewportToolController({
		store,
		state,
		viewportShell,
		viewportGizmo,
		viewportGizmoSvg,
		getActiveToolCamera: () =>
			state.mode === WORKSPACE_PANE_CAMERA
				? getActiveCameraViewCamera()
				: getActiveViewportCamera(),
		assetController,
		beginHistoryTransaction: historyController.beginHistoryTransaction,
		commitHistoryTransaction: historyController.commitHistoryTransaction,
	});
	projectionController = createProjectionController({
		state,
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
	measurementController = createMeasurementController({
		store,
		state,
		viewportShell,
		viewportCanvas,
		guides,
		workspacePaneCamera: WORKSPACE_PANE_CAMERA,
		getActiveViewportCamera: () => getActiveViewportCamera(),
		getActiveCameraViewCamera,
		getActiveOutputCamera,
		assetController,
		setStatus,
		t,
	});
	viewportToolController.setCustomGizmoDelegate?.(measurementController);
	viewportAxisGizmoController = createViewportAxisGizmoController({
		state,
		axisGizmo: viewportAxisGizmo,
		axisGizmoSvg: viewportAxisGizmoSvg,
		getActiveViewportCamera: () => getActiveViewportCamera(),
		getViewportProjectionMode: () =>
			viewportProjectionController?.getViewportProjectionMode?.() ??
			"perspective",
		getViewportOrthoState: () =>
			viewportProjectionController?.getViewportOrthoState?.() ?? null,
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
		getShotCameraPoseAngles: () =>
			projectionController?.getShotCameraPoseAngles?.() ?? {
				yawDeg: 0,
				pitchDeg: 0,
				rollDeg: 0,
			},
		getActiveShotCameraDocument,
	});
	lightingController = createLightingController({
		store,
		scene,
		updateUi,
		runHistoryAction: historyController.runHistoryAction,
	});
	projectController = createProjectController({
		store,
		assetController,
		applySavedProjectState,
		applyOpenedProject,
		captureWorkingEditorState: () => captureShotCameraEditorStates(),
		applyWorkingEditorState: (editorState) => {
			restoreShotCameraEditorStates(editorState);
			restoreShotCameraEditorState(store.workspace.activeShotCameraId.value);
		},
		clearProjectSidecars: () => {
			measurementController?.clearMeasurementSession?.({ keepActive: false });
			referenceImageController?.clearReferenceImages?.();
			lightingController?.resetLighting?.();
		},
		resetProjectWorkspace: () => {
			viewportToolController.setViewportTransformMode(false);
			resetWorkspaceToDefaults();
			referenceImageController?.clearReferenceImages?.();
			lightingController?.resetLighting?.();
			assetController.clearScene();
		},
		buildProjectFilename,
		captureProjectState,
		clearHistory: () => historyController?.clearHistory(),
		updateUi,
		setStatus,
		t,
	});
	const { openFiles, handleAssetInputChange } = createFileOpenRouting({
		openProjectSource: (...args) =>
			projectController?.openProjectSource?.(...args),
		supportsReferenceImageFile: (...args) =>
			referenceImageController?.supportsReferenceImageFile?.(...args) ?? false,
		importDroppedFiles: (...args) =>
			assetController?.importDroppedFiles?.(...args),
		importReferenceImageFiles: (...args) =>
			referenceImageController?.importReferenceImageFiles?.(...args),
		fallbackOpenFiles: (...args) => assetController?.openFiles?.(...args),
		setStatus,
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
		importReferenceImageFiles:
			referenceImageController.importReferenceImageFiles,
		supportsReferenceImageFile:
			referenceImageController.supportsReferenceImageFile,
		updateDropHint,
		updateUi,
		updateOutputFrameOverlay,
		setStatus,
		startOrbitAroundHitDrag: (...args) =>
			interactionController?.startOrbitAroundHitDrag(...args) ?? false,
		startZoomToolDrag,
		startLensAdjustDrag: (...args) =>
			interactionController?.startLensAdjustDrag(...args) ?? false,
		startShotCameraRollDrag: (...args) =>
			interactionController?.startShotCameraRollDrag(...args) ?? false,
		startViewportOrthographicPanDrag: (...args) =>
			interactionController?.startViewportOrthographicPanDrag?.(...args) ??
			false,
		toggleMeasurementMode,
		toggleZoomTool,
		toggleViewportSelectMode,
		toggleViewportReferenceImageEditMode,
		toggleViewportTransformMode,
		toggleViewportPivotEditMode,
		openFiles,
		startNewProject: () => projectController?.startNewProject(),
		isProjectDirty: () => projectController?.isProjectDirty?.() ?? false,
		isPackageDirty: () => projectController?.isPackageDirty?.() ?? true,
		shouldWarnBeforeUnload: () =>
			projectController?.shouldWarnBeforeUnload?.() ?? false,
		syncProjectPresentation: () =>
			projectController?.syncProjectPresentation?.(),
		suspendProjectPresentationSync: (nextSuspended) => {
			projectPresentationSyncSuspended = Boolean(nextSuspended);
		},
		establishProjectDirtyBaseline: () =>
			projectController?.establishProjectDirtyBaseline?.(),
		saveProject: () => projectController?.saveProject(),
		exportProject: () => projectController?.exportProject(),
		undoHistory: () => historyController?.undoHistory(),
		redoHistory: () => historyController?.redoHistory(),
		clearSceneAssetSelection,
		beginHistoryTransaction: (label) =>
			historyController?.beginHistoryTransaction(label),
		commitHistoryTransaction: (label) =>
			historyController?.commitHistoryTransaction(label),
		isInteractiveTextTarget,
		isZoomInteractionMode: () =>
			interactionController?.isZoomInteractionMode() ?? false,
		isPieInteractionMode: () =>
			interactionController?.isPieInteractionMode() ?? false,
		isLensInteractionMode: () =>
			interactionController?.isLensInteractionMode() ?? false,
		isRollInteractionMode: () =>
			interactionController?.isRollInteractionMode() ?? false,
		isViewportOrthographicActive: () =>
			interactionController?.isViewportOrthographicActive?.() ?? false,
		applyNavigateInteractionMode: () =>
			interactionController?.applyNavigateInteractionMode(),
		ensurePerspectiveForViewportRotation: () =>
			interactionController?.ensurePerspectiveForViewportRotation?.() ?? false,
		captureViewportProjectionState: () =>
			viewportProjectionController?.captureViewportProjectionState?.() ?? null,
		restoreViewportProjectionState: (snapshot) =>
			viewportProjectionController?.restoreViewportProjectionState?.(
				snapshot,
			) ?? false,
		openViewportPieMenu: (...args) =>
			interactionController?.openViewportPieMenu(...args) ?? false,
		openViewportPieMenuAtCenter: (...args) =>
			interactionController?.openViewportPieMenuAtCenter(...args) ?? false,
		updateViewportPiePointer: (...args) =>
			interactionController?.updateViewportPiePointer(...args),
		finishViewportPieMenu: (...args) =>
			interactionController?.finishViewportPieMenu(...args) ?? null,
		closeViewportPieMenu: (...args) =>
			interactionController?.closeViewportPieMenu(...args),
		handleViewportPieAction: executeViewportPieAction,
		isFrameSelectionActive,
		isReferenceImageSelectionActive: () =>
			referenceImageController?.isReferenceImageSelectionActive?.() ?? false,
		clearFrameSelection,
		clearReferenceImageSelection: () =>
			referenceImageController?.clearReferenceImageSelection?.(),
		clearOutputFrameSelection,
		handleOrbitAroundHitDragMove: (...args) =>
			interactionController?.handleOrbitAroundHitDragMove(...args),
		handleOrbitAroundHitDragEnd: (...args) =>
			interactionController?.handleOrbitAroundHitDragEnd(...args),
		handleZoomToolDragMove,
		handleZoomToolDragEnd,
		handleLensAdjustDragMove: (...args) =>
			interactionController?.handleLensAdjustDragMove(...args),
		handleLensAdjustDragEnd: (...args) =>
			interactionController?.handleLensAdjustDragEnd(...args),
		handleShotCameraRollDragMove: (...args) =>
			interactionController?.handleShotCameraRollDragMove(...args),
		handleShotCameraRollDragEnd: (...args) =>
			interactionController?.handleShotCameraRollDragEnd(...args),
		handleViewportOrthographicPanMove: (...args) =>
			interactionController?.handleViewportOrthographicPanMove?.(...args),
		handleViewportOrthographicPanEnd: (...args) =>
			interactionController?.handleViewportOrthographicPanEnd?.(...args),
		handleViewportOrthographicWheel: (...args) =>
			interactionController?.handleViewportOrthographicWheel?.(...args) ??
			false,
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
		handleMeasurementPointerDown: (...args) =>
			measurementController?.handleMeasurementPointerDown?.(...args) ?? false,
		handleMeasurementHoverMove: (...args) =>
			measurementController?.handleMeasurementHoverMove?.(...args),
		clearSelectedMeasurementPoint: () =>
			measurementController?.clearSelectedMeasurementPoint?.() ?? false,
		deleteSelectedMeasurement: () =>
			measurementController?.deleteSelectedMeasurement?.() ?? false,
		syncMeasurementSceneHelpers: () =>
			measurementController?.syncMeasurementSceneHelpers?.(),
		startOutputFrameAnchorDrag:
			outputFrameController.startOutputFrameAnchorDrag,
		syncMeasurementOverlay: () =>
			measurementController?.syncMeasurementOverlay?.(),
		syncViewportTransformGizmo:
			viewportToolController.syncViewportTransformGizmo,
		syncViewportAxisGizmo: () =>
			viewportAxisGizmoController?.syncViewportAxisGizmo?.(),
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
		getActiveViewportCamera,
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
		getShotCameraRollLock: () => store.shotCamera.rollLock.value,
		setShotCameraRollAngleDegrees: (nextValue) =>
			projectionController?.setShotCameraRollAngleDegrees?.(nextValue),
	});
	registerShotCameraDocuments();

	function formatNumber(value, digits = 2) {
		return Number(value).toFixed(digits);
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

	runtimeController.init();

	return {
		setMode: cameraController.setMode,
		setLocale,
		setBaseFovX: cameraController.setBaseFovX,
		setViewportBaseFovX: cameraController.setViewportBaseFovX,
		setViewportTransformSpace: viewportToolController.setViewportTransformSpace,
		setViewportTransformMode,
		toggleViewportTransformMode,
		setViewportSelectMode,
		toggleViewportSelectMode,
		setViewportReferenceImageEditMode,
		toggleViewportReferenceImageEditMode,
		setViewportPivotEditMode,
		toggleViewportPivotEditMode,
		setMeasurementMode,
		toggleMeasurementMode,
		setViewportProjectionMode,
		alignViewportToOrthographicView,
		toggleViewportOrthographicAxis,
		setViewportTransformHover: viewportToolController.setViewportTransformHover,
		setBoxWidthPercent: outputFrameController.setBoxWidthPercent,
		setBoxHeightPercent: outputFrameController.setBoxHeightPercent,
		setViewZoomPercent: outputFrameController.setViewZoomPercent,
		fitOutputFrameToSafeArea: outputFrameController.fitOutputFrameToSafeArea,
		canFitOutputFrameToSafeArea:
			outputFrameController.canFitOutputFrameToSafeArea,
		setAnchor: outputFrameController.setAnchor,
		setShotCameraClippingMode: cameraController.setShotCameraClippingMode,
		setShotCameraNear: cameraController.setShotCameraNear,
		setShotCameraFar: cameraController.setShotCameraFar,
		setShotCameraRollLock: cameraController.setShotCameraRollLock,
		setActiveShotCameraPositionAxis:
			cameraController.setActiveShotCameraPositionAxis,
		setActiveShotCameraPoseAngle,
		moveActiveShotCameraLocalAxis,
		setShotCameraName: cameraController.setShotCameraName,
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
		setReferenceImageExportSessionEnabled:
			exportController.setReferenceImageExportSessionEnabled,
		selectFrame: frameController.selectFrame,
		createFrame: frameController.createFrame,
		duplicateActiveFrame: frameController.duplicateActiveFrame,
		duplicateSelectedFrames: frameController.duplicateSelectedFrames,
		setFrameName: frameController.setFrameName,
		deleteSelectedFrames: frameController.deleteSelectedFrames,
		deleteFrame: frameController.deleteFrame,
		deleteActiveFrame: frameController.deleteActiveFrame,
		setFrameMaskMode: frameController.setFrameMaskMode,
		toggleFrameMaskMode: frameController.toggleFrameMaskMode,
		setFrameMaskOpacity: frameController.setFrameMaskOpacity,
		startFrameDrag: frameController.startFrameDrag,
		startSelectedFramesDrag: frameController.startSelectedFramesDrag,
		startFrameResize: frameController.startFrameResize,
		startSelectedFramesResize: frameController.startSelectedFramesResize,
		startFrameRotate: frameController.startFrameRotate,
		startSelectedFramesRotate: frameController.startSelectedFramesRotate,
		startFrameAnchorDrag: frameController.startFrameAnchorDrag,
		startSelectedFramesAnchorDrag:
			frameController.startSelectedFramesAnchorDrag,
		startOutputFramePan: outputFrameController.startOutputFramePan,
		startOutputFrameResize: outputFrameController.startOutputFrameResize,
		selectShotCamera: cameraController.selectShotCamera,
		createShotCamera: cameraController.createShotCamera,
		duplicateActiveShotCamera: cameraController.duplicateActiveShotCamera,
		deleteActiveShotCamera: cameraController.deleteActiveShotCamera,
		selectSceneAsset: assetController.selectSceneAsset,
		clearSceneAssetSelection,
		pickViewportAssetAtPointer:
			viewportToolController.pickViewportAssetAtPointer,
		startViewportTransformDrag:
			viewportToolController.startViewportTransformDrag,
		selectMeasurementPoint: (...args) =>
			measurementController?.selectMeasurementPoint?.(...args),
		startMeasurementAxisDrag: (...args) =>
			measurementController?.startMeasurementAxisDrag?.(...args),
		setMeasurementLengthInputText: (...args) =>
			measurementController?.setMeasurementLengthInputText?.(...args),
		applyMeasurementScale: (...args) =>
			measurementController?.applyMeasurementScale?.(...args),
		setAssetWorldScale: assetController.setAssetWorldScale,
		setAssetTransform: assetController.setAssetTransform,
		resetAssetWorldScale: assetController.resetAssetWorldScale,
		resetSelectedSceneAssetsWorldScale:
			assetController.resetSelectedSceneAssetsWorldScale,
		resetSelectedAssetWorkingPivot,
		setAssetPosition: assetController.setAssetPosition,
		offsetSelectedSceneAssetsPosition:
			assetController.offsetSelectedSceneAssetsPosition,
		setAssetRotationDegrees: assetController.setAssetRotationDegrees,
		offsetSelectedSceneAssetsRotationDegrees:
			assetController.offsetSelectedSceneAssetsRotationDegrees,
		setAssetVisibility: assetController.setAssetVisibility,
		setAssetLabel: assetController.setAssetLabel,
		deleteSelectedSceneAssets: assetController.deleteSelectedSceneAssets,
		setSelectedSceneAssetsVisibility:
			assetController.setSelectedSceneAssetsVisibility,
		applyAssetTransform: assetController.applyAssetTransform,
		scaleSelectedSceneAssetsByFactor:
			assetController.scaleSelectedSceneAssetsByFactor,
		moveAssetUp: assetController.moveAssetUp,
		moveAssetDown: assetController.moveAssetDown,
		moveAssetToIndex: assetController.moveAssetToIndex,
		setAssetExportRole: assetController.setAssetExportRole,
		setAssetMaskGroup: assetController.setAssetMaskGroup,
		setLightingAmbient: lightingController.setAmbient,
		setModelLightEnabled: lightingController.setModelLightEnabled,
		setModelLightIntensity: lightingController.setModelLightIntensity,
		setModelLightAzimuthDeg: lightingController.setModelLightAzimuthDeg,
		setModelLightElevationDeg: lightingController.setModelLightElevationDeg,
		setModelLightDirection: lightingController.setModelLightDirection,
		resetModelLightDirection: lightingController.resetModelLightDirection,
		getActiveCameraHeadingDeg,
		openFiles,
		openReferenceImageFiles: referenceImageController.openReferenceImageFiles,
		importReferenceImageFiles:
			referenceImageController.importReferenceImageFiles,
		supportsReferenceImageFile:
			referenceImageController.supportsReferenceImageFile,
		startNewProject,
		saveProject,
		exportProject,
		clearScene,
		loadRemoteUrls: assetController.loadRemoteUrls,
		handleAssetInputChange,
		handleReferenceImageInputChange:
			referenceImageController.handleReferenceImageInputChange,
		setReferenceImagePreviewSessionVisible:
			referenceImageController.setPreviewSessionVisible,
		setActiveReferenceImagePreset:
			referenceImageController.setActiveReferenceImagePreset,
		setActiveReferenceImagePresetName:
			referenceImageController.setActiveReferenceImagePresetName,
		duplicateActiveReferenceImagePreset:
			referenceImageController.duplicateActiveReferenceImagePreset,
		deleteActiveReferenceImagePreset:
			referenceImageController.deleteActiveReferenceImagePreset,
		deleteSelectedReferenceImageItems:
			referenceImageController.deleteSelectedReferenceImageItems,
		clearReferenceImageSelection:
			referenceImageController.clearReferenceImageSelection,
		ensureReferenceImageEditingSelection:
			referenceImageController.ensureReferenceImageEditingSelection,
		getSelectedReferenceImageInspectorState:
			referenceImageController.getSelectedReferenceImageInspectorState,
		beginSelectedReferenceImageInspectorTransformSession:
			referenceImageController.beginSelectedReferenceImageInspectorTransformSession,
		endSelectedReferenceImageInspectorTransformSession:
			referenceImageController.endSelectedReferenceImageInspectorTransformSession,
		selectReferenceImageAsset:
			referenceImageController.selectReferenceImageAsset,
		selectReferenceImageItem: referenceImageController.selectReferenceImageItem,
		setReferenceImagePreviewVisible:
			referenceImageController.setReferenceImagePreviewVisible,
		setSelectedReferenceImagesPreviewVisible:
			referenceImageController.setSelectedReferenceImagesPreviewVisible,
		setReferenceImageExportEnabled:
			referenceImageController.setReferenceImageExportEnabled,
		setSelectedReferenceImagesExportEnabled:
			referenceImageController.setSelectedReferenceImagesExportEnabled,
		setSelectedReferenceImagesOpacity:
			referenceImageController.setSelectedReferenceImagesOpacity,
		setReferenceImageOpacity: referenceImageController.setReferenceImageOpacity,
		scaleSelectedReferenceImagesByFactor:
			referenceImageController.scaleSelectedReferenceImagesByFactor,
		applySelectedReferenceImagesScaleFromSession:
			referenceImageController.applySelectedReferenceImagesScaleFromSession,
		setReferenceImageScalePct:
			referenceImageController.setReferenceImageScalePct,
		offsetSelectedReferenceImagesRotationDeg:
			referenceImageController.offsetSelectedReferenceImagesRotationDeg,
		applySelectedReferenceImagesRotationFromSession:
			referenceImageController.applySelectedReferenceImagesRotationFromSession,
		setReferenceImageRotationDeg:
			referenceImageController.setReferenceImageRotationDeg,
		offsetSelectedReferenceImagesPosition:
			referenceImageController.offsetSelectedReferenceImagesPosition,
		offsetReferenceImageBoundsPosition:
			referenceImageController.offsetReferenceImageBoundsPosition,
		getReferenceImageLogicalBounds:
			referenceImageController.getReferenceImageLogicalBounds,
		getSelectedReferenceImageTransformSession:
			referenceImageController.getSelectedReferenceImageTransformSession,
		setReferenceImageOffsetPx:
			referenceImageController.setReferenceImageOffsetPx,
		setReferenceImageBoundsPosition:
			referenceImageController.setReferenceImageBoundsPosition,
		setReferenceImageGroup: referenceImageController.setReferenceImageGroup,
		setReferenceImageOrder: referenceImageController.setReferenceImageOrder,
		moveReferenceImageToDisplayTarget:
			referenceImageController.moveReferenceImageToDisplayTarget,
		startReferenceImageMove: referenceImageController.startReferenceImageMove,
		startReferenceImageResize:
			referenceImageController.startReferenceImageResize,
		startReferenceImageRotate:
			referenceImageController.startReferenceImageRotate,
		startReferenceImageAnchorDrag:
			referenceImageController.startReferenceImageAnchorDrag,
		activateShotCameraRollMode: (...args) => {
			if (state.mode !== WORKSPACE_PANE_CAMERA) {
				cameraController.setMode(WORKSPACE_PANE_CAMERA);
			}
			measurementController?.setMeasurementMode?.(false, { silent: true });
			return (
				interactionController?.activateShotCameraRollMode?.(...args) ?? false
			);
		},
		toggleZoomTool,
		openViewportPieMenuAtCenter: (...args) =>
			interactionController?.openViewportPieMenuAtCenter?.(...args) ?? false,
		copyViewportToShotCamera: cameraController.copyViewportToShotCamera,
		copyShotCameraToViewport: cameraController.copyShotCameraToViewport,
		resetActiveView: cameraController.resetActiveView,
		getActiveShotCameraPoseState,
		executeViewportPieAction,
		closeViewportPieMenu: (...args) =>
			interactionController?.closeViewportPieMenu(...args),
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
			measurementController?.dispose?.();
			guideOverlay.dispose();
			lightingController?.dispose?.();
			runtimeController.dispose();
		},
	};
}
