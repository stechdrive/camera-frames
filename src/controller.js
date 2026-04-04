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
import { createControllerApi } from "./app/controller-api.js";
import { createControllerLocalization } from "./app/controller-localization.js";
import { createControllerRuntimeResources } from "./app/controller-runtime-resources.js";
import { createControllerState } from "./app/controller-state.js";
import { createFileOpenRouting } from "./app/file-open-routing.js";
import { createInteractionControllerBindings } from "./app/interaction-controller-bindings.js";
import { createInteractionZoomCommands } from "./app/interaction-zoom-commands.js";
import { createMeasurementControllerBindings } from "./app/measurement-controller-bindings.js";
import { createOutputFrameAccessors } from "./app/output-frame-accessors.js";
import { createPresentationSync } from "./app/presentation-sync.js";
import { createProjectControllerBindings } from "./app/project-controller-bindings.js";
import { createProjectOpenApply } from "./app/project-open-apply.js";
import { createProjectSceneCommands } from "./app/project-scene-commands.js";
import { createProjectStateBridge } from "./app/project-state-bridge.js";
import { createProjectionFramingCommands } from "./app/projection-framing-commands.js";
import { disposeObject } from "./app/resource-disposal.js";
import { createRuntimeControllerBindings } from "./app/runtime-controller-bindings.js";
import { createSceneAssetAccessors } from "./app/scene-asset-accessors.js";
import { createShotCameraEditorStateController } from "./app/shot-camera-editor-state.js";
import { createUiSyncControllerBindings } from "./app/ui-sync-controller-bindings.js";
import { createViewSyncCommands } from "./app/view-sync-commands.js";
import { createViewportEditingCommands } from "./app/viewport-editing-commands.js";
import { createViewportProjectionControllerBindings } from "./app/viewport-projection-controller-bindings.js";
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
import { getAnchorLabel } from "./i18n.js";
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

	const {
		renderer,
		scene,
		spark,
		contentRoot,
		splatRoot,
		modelRoot,
		guides,
		guideOverlay,
		viewportCamera,
		viewportOrthoCamera,
		shotCameraRegistry,
		fpsMovement,
		pointerControls,
		loader,
	} = createControllerRuntimeResources({
		viewportCanvas,
		viewportPixelRatio: VIEWPORT_PIXEL_RATIO,
		defaultCameraNear: DEFAULT_CAMERA_NEAR,
		defaultCameraFar: DEFAULT_CAMERA_FAR,
		defaultFpsMoveSpeed: DEFAULT_FPS_MOVE_SPEED,
		defaultPointerSlideSpeed: DEFAULT_POINTER_SLIDE_SPEED,
		defaultPointerScrollSpeed: DEFAULT_POINTER_SCROLL_SPEED,
		WebGLRendererImpl: THREE.WebGLRenderer,
		SceneImpl: THREE.Scene,
		ColorImpl: THREE.Color,
		GroupImpl: THREE.Group,
		PerspectiveCameraImpl: THREE.PerspectiveCamera,
		OrthographicCameraImpl: THREE.OrthographicCamera,
		FpsMovementImpl: FpsMovement,
		PointerControlsImpl: PointerControls,
		SparkRendererImpl: SparkRenderer,
		GLTFLoaderImpl: GLTFLoader,
		createGuideOverlayImpl: createGuideOverlay,
		srgbColorSpace: THREE.SRGBColorSpace,
	});
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
	const { state, outputFrameResizeHandles, sceneState } = createControllerState(
		{
			store,
			updateActiveShotCameraDocument,
		},
	);
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
	const { currentLocale, t, formatNumber } = createControllerLocalization({
		store,
	});

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
		activateViewportReferenceImageEditModeImplicit,
		clearViewportReferenceImageEditModeIfImplicit,
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

	const applyOpenedProject = createProjectOpenApply({
		getAssetController: () => assetController,
		applySavedProjectState,
		getHistoryController: () => historyController,
		setStatus,
		t,
	});

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

	viewportProjectionController = createViewportProjectionController(
		createViewportProjectionControllerBindings({
			store,
			viewportShell,
			viewportCamera,
			viewportOrthoCamera,
			outputFrameController,
			sceneFramingController,
			assetController,
		}),
	);

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
		outputFrameResizeHandles,
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
			clearViewportReferenceImageEditModeIfImplicit(),
		onReferenceImageSelectionActivated: () =>
			activateViewportReferenceImageEditModeImplicit(),
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
	interactionController = createInteractionController(
		createInteractionControllerBindings({
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
			outputFrameController,
			viewportProjectionController,
			projectionController,
			cameraController,
			historyController,
		}),
	);
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
	measurementController = createMeasurementController(
		createMeasurementControllerBindings({
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
		}),
	);
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
	uiSyncController = createUiSyncController(
		createUiSyncControllerBindings({
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
			interactionController,
			updateOutputFrameOverlay,
			getSceneAssetCounts,
			getSceneBounds,
			getTotalLoadedItems,
			getActiveShotCamera,
			getActiveCamera,
			getProjectionState,
			projectionController,
			getActiveShotCameraDocument,
		}),
	);
	lightingController = createLightingController({
		store,
		scene,
		updateUi,
		runHistoryAction: historyController.runHistoryAction,
	});
	projectController = createProjectController(
		createProjectControllerBindings({
			store,
			assetController,
			applySavedProjectState,
			applyOpenedProject,
			captureShotCameraEditorStates,
			restoreShotCameraEditorStates,
			restoreShotCameraEditorState,
			getActiveShotCameraId: () => store.workspace.activeShotCameraId.value,
			measurementController,
			referenceImageController,
			lightingController,
			viewportToolController,
			resetWorkspaceToDefaults,
			buildProjectFilename,
			captureProjectState,
			historyController,
			updateUi,
			setStatus,
			t,
		}),
	);
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
	runtimeController = createRuntimeController(
		createRuntimeControllerBindings({
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
			clearSceneAssetSelection,
			isInteractiveTextTarget,
			handleViewportPieAction: executeViewportPieAction,
			handleZoomToolDragMove,
			handleZoomToolDragEnd,
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
			setExportStatus,
			referenceImageController,
			projectController,
			historyController,
			interactionController,
			projectionController,
			viewportProjectionController,
			outputFrameController,
			frameController,
			viewportToolController,
			measurementController,
			viewportAxisGizmoController,
			projectPresentationSyncSuspendedRef: {
				get value() {
					return projectPresentationSyncSuspended;
				},
				set value(nextValue) {
					projectPresentationSyncSuspended = Boolean(nextValue);
				},
			},
		}),
	);
	registerShotCameraDocuments();

	runtimeController.init();

	return createControllerApi({
		store,
		state,
		cameraController,
		exportController,
		frameController,
		historyController,
		interactionController,
		lightingController,
		measurementController,
		outputFrameController,
		assetController,
		referenceImageController,
		runtimeController,
		viewportToolController,
		guideOverlay,
		setLocale,
		setViewportTransformMode,
		toggleViewportTransformMode,
		setViewportSelectMode,
		toggleViewportSelectMode,
		setViewportReferenceImageEditMode,
		activateViewportReferenceImageEditModeImplicit,
		toggleViewportReferenceImageEditMode,
		setViewportPivotEditMode,
		toggleViewportPivotEditMode,
		setMeasurementMode,
		toggleMeasurementMode,
		setViewportProjectionMode,
		alignViewportToOrthographicView,
		toggleViewportOrthographicAxis,
		setActiveShotCameraPoseAngle,
		moveActiveShotCameraLocalAxis,
		resetSelectedAssetWorkingPivot,
		clearSceneAssetSelection,
		openFiles,
		handleAssetInputChange,
		startNewProject,
		saveProject,
		exportProject,
		clearScene,
		getActiveCameraHeadingDeg,
		getActiveShotCameraPoseState,
		executeViewportPieAction,
		toggleZoomTool,
	});
}
