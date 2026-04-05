import {
	FpsMovement,
	PointerControls,
	SparkRenderer,
	SplatMesh,
	flipPixels,
} from "@sparkjsdev/spark";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { createAssetControllerBindings } from "./app/asset-controller-bindings.js";
import { createCameraControllerBindings } from "./app/camera-controller-bindings.js";
import { createCameraPoseCommands } from "./app/camera-pose-commands.js";
import {
	createControllerAccessors,
	createShotCameraEditorStateAccessors,
} from "./app/controller-accessors.js";
import { createControllerApi } from "./app/controller-api.js";
import { createControllerLocalization } from "./app/controller-localization.js";
import { createControllerRuntimeResources } from "./app/controller-runtime-resources.js";
import { createControllerState } from "./app/controller-state.js";
import { createExportControllerBindings } from "./app/export-controller-bindings.js";
import { createFileOpenRouting } from "./app/file-open-routing.js";
import { createFrameControllerBindings } from "./app/frame-controller-bindings.js";
import { createHistoryControllerBindings } from "./app/history-controller-bindings.js";
import { createInteractionControllerBindings } from "./app/interaction-controller-bindings.js";
import { createInteractionZoomCommands } from "./app/interaction-zoom-commands.js";
import { createLightingControllerBindings } from "./app/lighting-controller-bindings.js";
import { createMeasurementControllerBindings } from "./app/measurement-controller-bindings.js";
import { createOutputFrameAccessors } from "./app/output-frame-accessors.js";
import { createOutputFrameControllerBindings } from "./app/output-frame-controller-bindings.js";
import { createPerSplatEditControllerBindings } from "./app/per-splat-edit-controller-bindings.js";
import { createPresentationSync } from "./app/presentation-sync.js";
import { createProjectControllerBindings } from "./app/project-controller-bindings.js";
import { createProjectOpenApply } from "./app/project-open-apply.js";
import { createProjectSceneCommands } from "./app/project-scene-commands.js";
import { createProjectStateBridge } from "./app/project-state-bridge.js";
import { createProjectionControllerBindings } from "./app/projection-controller-bindings.js";
import { createProjectionFramingCommands } from "./app/projection-framing-commands.js";
import { createReferenceImageControllerBindings } from "./app/reference-image-controller-bindings.js";
import { createReferenceImageRenderControllerBindings } from "./app/reference-image-render-controller-bindings.js";
import { disposeObject } from "./app/resource-disposal.js";
import { createRuntimeControllerBindings } from "./app/runtime-controller-bindings.js";
import { createSceneAssetAccessors } from "./app/scene-asset-accessors.js";
import { createSceneFramingControllerBindings } from "./app/scene-framing-controller-bindings.js";
import { createShotCameraEditorStateControllerBindings } from "./app/shot-camera-editor-state-bindings.js";
import { createShotCameraEditorStateController } from "./app/shot-camera-editor-state.js";
import { createUiSyncControllerBindings } from "./app/ui-sync-controller-bindings.js";
import { createViewSyncCommands } from "./app/view-sync-commands.js";
import { createViewportAxisGizmoControllerBindings } from "./app/viewport-axis-gizmo-controller-bindings.js";
import { createViewportEditingCommands } from "./app/viewport-editing-commands.js";
import { createViewportProjectionControllerBindings } from "./app/viewport-projection-controller-bindings.js";
import { createViewportToolControllerBindings } from "./app/viewport-tool-controller-bindings.js";
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
import { createPerSplatEditController } from "./controllers/per-splat-edit-controller.js";
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
import { createSplatSelectionHighlightController } from "./engine/splat-selection-highlight.js";
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
	const splatSelectionHighlightController =
		createSplatSelectionHighlightController();
	let assetController = null;
	let frameController = null;
	let cameraController = null;
	let historyController = null;
	let interactionController = null;
	let lightingController = null;
	let outputFrameController = null;
	let perSplatEditController = null;
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
		getPerSplatEditController: () => perSplatEditController,
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
		getPerSplatEditController: () => perSplatEditController,
		getReferenceImageController: () => referenceImageController,
		getViewportToolController: () => viewportToolController,
		clearFrameSelection,
		clearOutputFrameSelection,
	});

	perSplatEditController = createPerSplatEditController(
		createPerSplatEditControllerBindings({
			store,
			state,
			t,
			guides,
			viewportShell,
			renderBox,
			setStatus,
			updateUi,
			getAssetController: () => assetController,
			getActiveCamera: () => getActiveCamera(),
			getActiveCameraViewCamera: () => getActiveCameraViewCamera(),
			selectionHighlightController: splatSelectionHighlightController,
			setViewportSelectMode,
			setViewportReferenceImageEditMode,
			setViewportTransformMode,
			setViewportPivotEditMode,
			setMeasurementMode,
			getInteractionController: () => interactionController,
		}),
	);

	const applyOpenedProject = createProjectOpenApply({
		getAssetController: () => assetController,
		getPerSplatEditController: () => perSplatEditController,
		applySavedProjectState,
		getHistoryController: () => historyController,
		setStatus,
		t,
	});

	historyController = createHistoryController(
		createHistoryControllerBindings({
			store,
			captureWorkspaceState,
			restoreWorkspaceState,
			updateUi: () => updateUi(),
		}),
	);

	assetController = createAssetController(
		createAssetControllerBindings({
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
			projectController,
			disposeObject,
			historyController,
			getPerSplatEditController: () => perSplatEditController,
		}),
	);

	const exportController = createExportController(
		createExportControllerBindings({
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
		}),
	);

	sceneFramingController = createSceneFramingController(
		createSceneFramingControllerBindings({
			getSceneBounds,
			assetController,
			viewportCamera,
			shotCameraRegistry,
			cameraController,
			interactionController,
			fpsMovement,
		}),
	);

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

	cameraController = createCameraController(
		createCameraControllerBindings({
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
			sceneFramingController,
			getFrameController: () => frameController,
			clearOutputFramePan,
			clearOutputFrameSelection,
			getInteractionController: () => interactionController,
			beforeActiveShotCameraChange: (currentShotCameraId) =>
				shotCameraEditorStateController?.prepareForShotCameraSwitch?.(
					currentShotCameraId,
				),
			afterActiveShotCameraChange: (nextShotCameraId) =>
				shotCameraEditorStateController?.restoreAfterShotCameraSwitch?.(
					nextShotCameraId,
				),
			viewportProjectionController,
			historyController,
		}),
	);
	frameController = createFrameController(
		createFrameControllerBindings({
			store,
			state,
			renderBox,
			workspacePaneCamera: WORKSPACE_PANE_CAMERA,
			isZoomToolActive: () =>
				interactionController?.isZoomToolActive() ?? false,
			t,
			setStatus,
			updateUi,
			getOutputFrameController: () => outputFrameController,
			getActiveShotCameraDocument,
			updateActiveShotCameraDocument,
			getOutputFrameMetrics,
			historyController,
		}),
	);
	outputFrameController = createOutputFrameController(
		createOutputFrameControllerBindings({
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
			isZoomToolActive: () =>
				interactionController?.isZoomToolActive() ?? false,
			t,
			getAnchorLabel,
			currentLocale,
			getFrameController: () => frameController,
			getActiveShotCameraDocument,
			getShotCameraDocument,
			getActiveShotCameraEntry,
			shotCameraRegistry,
			getBaseFovX: () => state.baseFovX,
			updateActiveShotCameraDocument,
			updateUi,
			historyController,
		}),
	);
	referenceImageController = createReferenceImageController(
		createReferenceImageControllerBindings({
			store,
			referenceImageInput,
			renderBox,
			t,
			setStatus,
			updateUi,
			getCameraController: () => cameraController,
			onReferenceImageSelectionCleared: () =>
				clearViewportReferenceImageEditModeIfImplicit(),
			onReferenceImageSelectionActivated: () =>
				activateViewportReferenceImageEditModeImplicit(),
			getActiveShotCameraDocument,
			updateActiveShotCameraDocument,
			getOutputSizeState,
			historyController,
			workspacePaneCamera: WORKSPACE_PANE_CAMERA,
		}),
	);
	shotCameraEditorStateController = createShotCameraEditorStateController(
		createShotCameraEditorStateControllerBindings({
			store,
			state,
			getReferenceImageController: () => referenceImageController,
			getFrameController: () => frameController,
			updateUi,
		}),
	);

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
	referenceImageRenderController = createReferenceImageRenderController(
		createReferenceImageRenderControllerBindings({
			store,
			renderBox,
			viewportShell,
			getActiveShotCameraDocument,
			getOutputSizeState,
		}),
	);
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
	viewportToolController = createViewportToolController(
		createViewportToolControllerBindings({
			store,
			state,
			viewportShell,
			viewportGizmo,
			viewportGizmoSvg,
			getActiveCameraViewCamera,
			getActiveViewportCamera,
			assetController,
			historyController,
			workspacePaneCamera: WORKSPACE_PANE_CAMERA,
		}),
	);
	projectionController = createProjectionController(
		createProjectionControllerBindings({
			state,
			renderer,
			getOutputFrameController: () => outputFrameController,
			syncActiveShotCameraFromDocument,
			getActiveShotCamera,
			getActiveShotCameraDocument,
			getActiveCameraViewCamera,
			getActiveOutputCamera,
		}),
	);
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
	viewportToolController.setCustomGizmoDelegate?.({
		getViewportGizmoConfig: (options) =>
			perSplatEditController?.getViewportGizmoConfig?.(options) ??
			measurementController?.getViewportGizmoConfig?.(options) ??
			null,
		startViewportGizmoDrag: (handleName, options) =>
			perSplatEditController?.startViewportGizmoDrag?.(handleName, options) ||
			measurementController?.startViewportGizmoDrag?.(handleName, options) ||
			false,
		handleViewportGizmoDragMove: (event, options) =>
			perSplatEditController?.handleViewportGizmoDragMove?.(event, options) ||
			measurementController?.handleViewportGizmoDragMove?.(event, options) ||
			false,
		handleViewportGizmoDragEnd: (event) =>
			perSplatEditController?.handleViewportGizmoDragEnd?.(event) ||
			measurementController?.handleViewportGizmoDragEnd?.(event) ||
			false,
	});
	viewportAxisGizmoController = createViewportAxisGizmoController(
		createViewportAxisGizmoControllerBindings({
			state,
			viewportAxisGizmo,
			viewportAxisGizmoSvg,
			getActiveViewportCamera: () => getActiveViewportCamera(),
			viewportProjectionController,
		}),
	);
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
	lightingController = createLightingController(
		createLightingControllerBindings({
			store,
			scene,
			updateUi,
			historyController,
		}),
	);
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
			perSplatEditController,
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
	const { importOpenedFiles, openFiles, handleAssetInputChange } =
		createFileOpenRouting({
			openProjectSource: (...args) =>
				projectController?.openProjectSource?.(...args),
			supportsReferenceImageFile: (...args) =>
				referenceImageController?.supportsReferenceImageFile?.(...args) ??
				false,
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
			importOpenedFiles,
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
			toggleSplatEditMode: (...args) =>
				perSplatEditController?.toggleSplatEditMode?.(...args),
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
			perSplatEditController,
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
		perSplatEditController,
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
		setSplatEditMode: (...args) =>
			perSplatEditController?.setSplatEditMode?.(...args),
		toggleSplatEditMode: (...args) =>
			perSplatEditController?.toggleSplatEditMode?.(...args),
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
