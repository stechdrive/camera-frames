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
	applyLegacyCameraTransform,
	buildLegacyProjectImport,
} from "./importers/legacy-ssproj.js";
import { getDefaultProjectFilename } from "./project-file.js";
import {
	extractProjectPackageAssets,
	isProjectPackageSource,
} from "./project-package.js";
import {
	WORKSPACE_PANE_CAMERA,
	WORKSPACE_PANE_VIEWPORT,
	cloneShotCameraDocument,
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
	let projectPresentationSyncSuspended = true;

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
		const shotCameraEditorStates = captureShotCameraEditorStates();
		return {
			activeShotCameraId: store.workspace.activeShotCameraId.value,
			viewportBaseFovX: store.viewportBaseFovX.value,
			viewportBaseFovXDirty: store.viewportBaseFovXDirty.value,
			viewportProjection:
				viewportProjectionController?.captureViewportProjectionState?.() ??
				null,
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
			sceneLighting: lightingController?.captureLightingState?.() ?? null,
			sceneReferenceImages:
				referenceImageController?.captureProjectReferenceImagesState?.() ??
				null,
			shotCameraEditorStates,
			referenceImageEditor:
				shotCameraEditorStates?.[store.workspace.activeShotCameraId.value]
					?.referenceImageEditor ?? null,
			frameSelectionActive: store.frames.selectionActive.value,
			frameSelectedIds: [...(store.frames.selectedIds.value ?? [])],
			frameSelectionAnchor: store.frames.selectionAnchor.value
				? { ...store.frames.selectionAnchor.value }
				: null,
			frameSelectionBoxLogical: store.frames.selectionBoxLogical.value
				? { ...store.frames.selectionBoxLogical.value }
				: null,
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
		lightingController?.applyLightingState(snapshot.sceneLighting ?? null);

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
		store.viewportBaseFovXDirty.value = Boolean(snapshot.viewportBaseFovXDirty);
		restoreCameraPose(viewportCamera, snapshot.viewportPose);
		viewportProjectionController?.restoreViewportProjectionState?.(
			snapshot.viewportProjection ?? null,
		);
		restoreShotCameraEditorStates(snapshot.shotCameraEditorStates ?? null);
		referenceImageController?.applyProjectReferenceImagesState?.(
			snapshot.sceneReferenceImages ?? null,
			{ editorState: null },
		);
		measurementController?.clearMeasurementSession?.({ keepActive: false });

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
		restoreShotCameraEditorState(snapshot.activeShotCameraId, {
			fallbackSnapshot: snapshot,
		});
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

		restoreShotCameraEditorStates(null);
		clearActiveShotCameraEditorState();
		measurementController?.clearMeasurementSession?.({ keepActive: false });
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

	function captureProjectShotCameras() {
		return store.workspace.shotCameras.value.map((documentState) => ({
			...cloneShotCameraDocument(documentState),
			pose: captureCameraPose(
				shotCameraRegistry.get(documentState.id)?.camera ?? viewportCamera,
			),
		}));
	}

	function captureProjectState() {
		return {
			workspace: {
				activeShotCameraId: store.workspace.activeShotCameraId.value,
				viewport: {
					baseFovX: store.viewportBaseFovX.value,
					baseFovXDirty: store.viewportBaseFovXDirty.value,
					pose: captureCameraPose(viewportCamera),
					...(viewportProjectionController?.captureViewportProjectionState?.() ??
						{}),
				},
			},
			shotCameras: captureProjectShotCameras(),
			scene: {
				assets: assetController?.captureProjectSceneState?.() ?? [],
				lighting: lightingController?.captureLightingState?.() ?? null,
				referenceImages:
					referenceImageController?.captureProjectReferenceImagesState?.() ??
					null,
			},
		};
	}

	function buildProjectFilename() {
		const activeDocument = getActiveShotCameraDocument();
		if (!activeDocument) {
			return getDefaultProjectFilename();
		}

		return `${getShotCameraExportBaseName(activeDocument, 1)}.ssproj`;
	}

	function applySavedProjectState(project) {
		const shotCameras = (project?.shotCameras ?? []).map((shotCamera) => {
			const { pose: _pose, ...documentState } = shotCamera;
			return cloneShotCameraDocument(documentState);
		});
		setShotCameraDocuments(shotCameras);
		registerShotCameraDocuments();

		store.workspace.activeShotCameraId.value = getShotCameraDocument(
			project?.workspace?.activeShotCameraId,
		)
			? project.workspace.activeShotCameraId
			: (shotCameras[0]?.id ?? store.workspace.activeShotCameraId.value);
		store.viewportBaseFovX.value = Number.isFinite(
			project?.workspace?.viewport?.baseFovX,
		)
			? project.workspace.viewport.baseFovX
			: store.viewportBaseFovX.value;
		store.viewportBaseFovXDirty.value = Boolean(
			project?.workspace?.viewport?.baseFovXDirty,
		);
		restoreCameraPose(viewportCamera, project?.workspace?.viewport?.pose);
		viewportProjectionController?.restoreViewportProjectionState?.(
			project?.workspace?.viewport ?? null,
		);

		for (const shotCamera of project?.shotCameras ?? []) {
			const entry = shotCameraRegistry.get(shotCamera.id);
			if (!entry) {
				continue;
			}
			restoreCameraPose(entry.camera, shotCamera.pose);
			syncShotCameraEntryFromDocument(entry);
		}
		referenceImageController?.applyProjectReferenceImagesState?.(
			project?.scene?.referenceImages,
		);
		lightingController?.applyLightingState(project?.scene?.lighting ?? null);

		restoreShotCameraEditorStates(null);
		clearActiveShotCameraEditorState();
		measurementController?.clearMeasurementSession?.({ keepActive: false });
		frameController?.clearFrameInteraction();
		outputFrameController?.clearOutputFramePan();
		outputFrameController?.clearOutputFrameAnchorDrag();
		outputFrameController?.clearOutputFrameResize();
		interactionController?.clearControlMomentum();
		syncControlsToMode();
		syncViewportProjection();
		syncShotProjection();
		applyCameraViewProjection();
		syncOutputCamera();
		updateOutputFrameOverlay();
		updateShotCameraHelpers();
		updateCameraSummary();
		updateUi();
	}

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
		getActiveShotCameraDocument,
		updateActiveShotCameraDocument,
		getOutputSizeState,
		runHistoryAction: historyController.runHistoryAction,
		beginHistoryTransaction: historyController.beginHistoryTransaction,
		commitHistoryTransaction: historyController.commitHistoryTransaction,
		cancelHistoryTransaction: historyController.cancelHistoryTransaction,
	});
	const shotCameraEditorStateById = new Map();

	function cloneOptionalPoint(value) {
		return value && Number.isFinite(value.x) && Number.isFinite(value.y)
			? { x: value.x, y: value.y }
			: null;
	}

	function cloneOptionalSelectionBox(value) {
		return value ? { ...value } : null;
	}

	function cloneShotCameraEditorState(editorState = null) {
		if (!editorState) {
			return {
				frameSelectionActive: false,
				frameSelectedIds: [],
				frameSelectionAnchor: null,
				frameSelectionBoxLogical: null,
				outputFrameSelected: false,
				referenceImageEditor: null,
			};
		}
		return {
			frameSelectionActive: Boolean(editorState.frameSelectionActive),
			frameSelectedIds: Array.isArray(editorState.frameSelectedIds)
				? [...editorState.frameSelectedIds]
				: [],
			frameSelectionAnchor: cloneOptionalPoint(
				editorState.frameSelectionAnchor,
			),
			frameSelectionBoxLogical: cloneOptionalSelectionBox(
				editorState.frameSelectionBoxLogical,
			),
			outputFrameSelected: Boolean(editorState.outputFrameSelected),
			referenceImageEditor: editorState.referenceImageEditor
				? {
						selectedItemIds: Array.isArray(
							editorState.referenceImageEditor.selectedItemIds,
						)
							? [...editorState.referenceImageEditor.selectedItemIds]
							: [],
						selectedItemId: String(
							editorState.referenceImageEditor.selectedItemId ?? "",
						),
						selectedAssetId: String(
							editorState.referenceImageEditor.selectedAssetId ?? "",
						),
						selectionAnchor: cloneOptionalPoint(
							editorState.referenceImageEditor.selectionAnchor,
						),
						selectionBoxLogical: cloneOptionalSelectionBox(
							editorState.referenceImageEditor.selectionBoxLogical,
						),
						rememberedSelectedItemIds: Array.isArray(
							editorState.referenceImageEditor.rememberedSelectedItemIds,
						)
							? [...editorState.referenceImageEditor.rememberedSelectedItemIds]
							: [],
						rememberedActiveItemId: String(
							editorState.referenceImageEditor.rememberedActiveItemId ?? "",
						),
					}
				: null,
		};
	}

	function captureActiveShotCameraEditorState() {
		return cloneShotCameraEditorState({
			frameSelectionActive: store.frames.selectionActive.value,
			frameSelectedIds: [...(store.frames.selectedIds.value ?? [])],
			frameSelectionAnchor: store.frames.selectionAnchor.value,
			frameSelectionBoxLogical: store.frames.selectionBoxLogical.value,
			outputFrameSelected: state.outputFrameSelected,
			referenceImageEditor:
				referenceImageController?.captureReferenceImageEditorState?.({
					includePreviewSessionVisible: false,
				}) ?? null,
		});
	}

	function storeShotCameraEditorState(shotCameraId = null) {
		const resolvedShotCameraId =
			typeof shotCameraId === "string" && shotCameraId
				? shotCameraId
				: store.workspace.activeShotCameraId.value;
		if (!resolvedShotCameraId) {
			return;
		}
		shotCameraEditorStateById.set(
			resolvedShotCameraId,
			captureActiveShotCameraEditorState(),
		);
	}

	function clearActiveShotCameraEditorState() {
		store.frames.selectionActive.value = false;
		store.frames.selectedIds.value = [];
		store.frames.selectionAnchor.value = null;
		store.frames.selectionBoxLogical.value = null;
		state.outputFrameSelected = false;
		referenceImageController?.restoreReferenceImageEditorState?.(null, {
			preservePreviewSessionVisible: true,
		});
	}

	function restoreShotCameraEditorState(
		shotCameraId,
		{ fallbackSnapshot = null } = {},
	) {
		const savedState =
			shotCameraEditorStateById.get(shotCameraId) ??
			(fallbackSnapshot?.activeShotCameraId === shotCameraId
				? cloneShotCameraEditorState({
						frameSelectionActive: fallbackSnapshot.frameSelectionActive,
						frameSelectedIds: fallbackSnapshot.frameSelectedIds,
						frameSelectionAnchor: fallbackSnapshot.frameSelectionAnchor,
						frameSelectionBoxLogical: fallbackSnapshot.frameSelectionBoxLogical,
						outputFrameSelected: fallbackSnapshot.outputFrameSelected,
						referenceImageEditor: fallbackSnapshot.referenceImageEditor ?? null,
					})
				: null);
		const validFrameIds = new Set(
			(frameController?.getActiveFrames?.() ?? []).map((frame) => frame.id),
		);
		const nextFrameSelectedIds = Array.isArray(savedState?.frameSelectedIds)
			? savedState.frameSelectedIds.filter((frameId) =>
					validFrameIds.has(frameId),
				)
			: [];
		const frameSelectionActive =
			Boolean(savedState?.frameSelectionActive) &&
			nextFrameSelectedIds.length > 0;
		store.frames.selectionActive.value = frameSelectionActive;
		store.frames.selectedIds.value = frameSelectionActive
			? [...nextFrameSelectedIds]
			: [];
		store.frames.selectionAnchor.value =
			frameSelectionActive && nextFrameSelectedIds.length > 1
				? cloneOptionalPoint(savedState?.frameSelectionAnchor)
				: null;
		store.frames.selectionBoxLogical.value =
			frameSelectionActive && nextFrameSelectedIds.length > 1
				? cloneOptionalSelectionBox(savedState?.frameSelectionBoxLogical)
				: null;
		frameController?.syncFrameSelectionTransformState?.();
		state.outputFrameSelected =
			!frameSelectionActive && Boolean(savedState?.outputFrameSelected);
		referenceImageController?.restoreReferenceImageEditorState?.(
			savedState?.referenceImageEditor ?? null,
			{ preservePreviewSessionVisible: true },
		);
	}

	function captureShotCameraEditorStates() {
		pruneShotCameraEditorStates();
		storeShotCameraEditorState();
		return Object.fromEntries(
			Array.from(shotCameraEditorStateById.entries()).map(
				([shotCameraId, value]) => [
					shotCameraId,
					cloneShotCameraEditorState(value),
				],
			),
		);
	}

	function restoreShotCameraEditorStates(editorStates = null) {
		shotCameraEditorStateById.clear();
		if (!editorStates || typeof editorStates !== "object") {
			return;
		}
		for (const [shotCameraId, value] of Object.entries(editorStates)) {
			if (!shotCameraId) {
				continue;
			}
			shotCameraEditorStateById.set(
				shotCameraId,
				cloneShotCameraEditorState(value),
			);
		}
		pruneShotCameraEditorStates();
	}

	function pruneShotCameraEditorStates() {
		const validShotCameraIds = new Set(
			store.workspace.shotCameras.value.map(
				(documentState) => documentState.id,
			),
		);
		for (const shotCameraId of Array.from(shotCameraEditorStateById.keys())) {
			if (!validShotCameraIds.has(shotCameraId)) {
				shotCameraEditorStateById.delete(shotCameraId);
			}
		}
	}

	function prepareForShotCameraSwitch(currentShotCameraId) {
		pruneShotCameraEditorStates();
		if (currentShotCameraId) {
			storeShotCameraEditorState(currentShotCameraId);
		}
		clearActiveShotCameraEditorState();
	}

	function restoreAfterShotCameraSwitch(nextShotCameraId) {
		pruneShotCameraEditorStates();
		restoreShotCameraEditorState(nextShotCameraId);
		updateUi();
	}
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
			measurementController?.clearMeasurementSession?.({ keepActive: false });
			viewportToolController.setViewportTransformMode(false);
			restoreShotCameraEditorStates(null);
			clearActiveShotCameraEditorState();
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
		handleMeasurementAxisDragMove: (...args) =>
			measurementController?.handleMeasurementAxisDragMove?.(...args),
		handleMeasurementAxisDragEnd: (...args) =>
			measurementController?.handleMeasurementAxisDragEnd?.(...args) ?? false,
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
		if (
			!(interactionController?.isZoomToolActive?.() ?? false) &&
			measurementController?.isMeasurementModeActive?.()
		) {
			measurementController?.setMeasurementMode?.(false, { silent: true });
		}
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

	function getActiveViewportCamera() {
		return (
			viewportProjectionController?.getActiveViewportCamera?.() ??
			viewportCamera
		);
	}

	function getActiveCamera() {
		return state.mode === WORKSPACE_PANE_CAMERA
			? getActiveShotCamera()
			: getActiveViewportCamera();
	}

	function getActiveCameraHeadingDeg() {
		const camera = getActiveCamera();
		if (!camera) {
			return 0;
		}

		const forward = camera.getWorldDirection(new THREE.Vector3());
		forward.y = 0;
		if (forward.lengthSq() <= 1e-8) {
			return 0;
		}
		forward.normalize();
		return THREE.MathUtils.radToDeg(Math.atan2(forward.x, forward.z));
	}

	function getActiveShotCameraPoseState() {
		const shotCamera = getActiveShotCamera();
		const poseAngles = projectionController?.getShotCameraPoseAngles?.() ?? {
			yawDeg: 0,
			pitchDeg: 0,
			rollDeg: 0,
		};

		return {
			position: {
				x: shotCamera.position.x,
				y: shotCamera.position.y,
				z: shotCamera.position.z,
			},
			rotation: poseAngles,
		};
	}

	function setActiveShotCameraPoseAngle(axis, nextValue) {
		const numericValue = Number(nextValue);
		if (
			!["yaw", "pitch", "roll"].includes(axis) ||
			!Number.isFinite(numericValue)
		) {
			return false;
		}

		return historyController?.runHistoryAction?.(
			`camera.rotation.${axis}`,
			() => {
				const nextAngles =
					axis === "yaw"
						? { yawDeg: numericValue }
						: axis === "pitch"
							? { pitchDeg: numericValue }
							: { rollDeg: numericValue };
				projectionController?.setShotCameraPoseAngles?.(nextAngles);
				cameraController?.syncActiveShotCameraDocumentFromLiveCamera?.();
				updateUi();
			},
		);
	}

	function moveActiveShotCameraLocalAxis(axis, distance) {
		return cameraController?.moveActiveShotCameraLocalAxis?.(axis, distance);
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
		const result = outputFrameController.updateOutputFrameOverlay();
		safeSyncReferenceImagePreview();
		return result;
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
		return viewportProjectionController?.syncActiveViewportProjection?.();
	}

	function clearControlMomentum() {
		return interactionController?.clearControlMomentum();
	}

	function syncControlsToMode() {
		return interactionController?.syncControlsToMode();
	}

	function setViewportProjectionMode(nextMode, options) {
		const changed =
			viewportProjectionController?.setViewportProjectionMode?.(
				nextMode,
				options,
			) ?? false;
		interactionController?.syncControlsToMode?.();
		return changed;
	}

	function alignViewportToOrthographicView(viewId, options) {
		const changed =
			viewportProjectionController?.alignViewportToOrthographicView?.(
				viewId,
				options,
			) ?? false;
		interactionController?.syncControlsToMode?.();
		return changed;
	}

	function toggleViewportOrthographicAxis(axisKey) {
		const changed =
			viewportProjectionController?.toggleOrthographicAxis?.(axisKey) ?? false;
		interactionController?.syncControlsToMode?.();
		return changed;
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

	let lastReferenceImageUiError = "";
	let lastReferenceImagePreviewError = "";

	function safeSyncReferenceImageUi() {
		try {
			referenceImageController?.syncUiState?.();
			lastReferenceImageUiError = "";
		} catch (error) {
			const nextMessage =
				error instanceof Error
					? error.message
					: String(error ?? "Unknown error");
			if (nextMessage !== lastReferenceImageUiError) {
				lastReferenceImageUiError = nextMessage;
				console.error("[CAMERA_FRAMES] reference-image ui sync failed", error);
			}
		}
	}

	function safeSyncReferenceImagePreview() {
		try {
			referenceImageRenderController?.syncPreviewLayers?.();
			lastReferenceImagePreviewError = "";
		} catch (error) {
			const nextMessage =
				error instanceof Error
					? error.message
					: String(error ?? "Unknown error");
			if (nextMessage !== lastReferenceImagePreviewError) {
				lastReferenceImagePreviewError = nextMessage;
				console.error(
					"[CAMERA_FRAMES] reference-image preview sync failed",
					error,
				);
			}
			referenceImageRenderController?.clearPreviewLayers?.();
		}
	}

	function updateSceneSummary() {
		return uiSyncController?.updateSceneSummary();
	}

	function syncGuideOverlayState(
		documentState = getActiveShotCameraDocument(),
		{ gridVisible = true, eyeLevelVisible = true } = {},
	) {
		const viewportOrthoPreviewGridPlane =
			state.mode === WORKSPACE_PANE_VIEWPORT
				? (viewportProjectionController?.getViewportOrthographicPreviewGridPlane?.() ??
					null)
				: null;
		const showViewportOrthoPreviewGrid =
			gridVisible !== false && viewportOrthoPreviewGridPlane !== null;
		guideOverlay.applyState({
			gridVisible: showViewportOrthoPreviewGrid ? false : gridVisible,
			eyeLevelVisible,
			gridLayerMode:
				documentState?.exportSettings?.exportGridLayerMode === "overlay"
					? "overlay"
					: GUIDE_GRID_LAYER_MODE_BOTTOM,
		});
		guideOverlay.setViewportOrthographicGridState?.({
			visible: showViewportOrthoPreviewGrid,
			plane: viewportOrthoPreviewGridPlane,
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

	function updateUi({ syncProjectPresentation = true } = {}) {
		safeSyncReferenceImageUi();
		safeSyncReferenceImagePreview();
		if (!projectPresentationSyncSuspended && syncProjectPresentation) {
			projectController?.syncProjectPresentation?.();
		}
		return uiSyncController?.updateUi();
	}

	function setViewportToolMode(nextMode) {
		if (nextMode !== "none") {
			measurementController?.setMeasurementMode?.(false, { silent: true });
		}
		switch (nextMode) {
			case "select":
				viewportToolController.setViewportSelectMode(true);
				break;
			case "reference":
				viewportToolController.setViewportReferenceImageEditMode(true);
				break;
			case "transform":
				viewportToolController.setViewportTransformMode(true);
				break;
			case "pivot":
				viewportToolController.setViewportPivotEditMode(true);
				break;
			default:
				viewportToolController.setViewportTransformMode(false);
				break;
		}
		interactionController?.syncControlsToMode();
	}

	function setViewportPivotEditMode(nextEnabled) {
		setViewportToolMode(nextEnabled ? "pivot" : "none");
	}

	function setViewportSelectMode(nextEnabled) {
		setViewportToolMode(nextEnabled ? "select" : "none");
	}

	function setViewportReferenceImageEditMode(nextEnabled) {
		setViewportToolMode(nextEnabled ? "reference" : "none");
		if (nextEnabled) {
			referenceImageController?.ensureReferenceImageEditingSelection?.();
		}
	}

	function setViewportTransformMode(nextEnabled) {
		setViewportToolMode(nextEnabled ? "transform" : "none");
	}

	function toggleViewportSelectMode() {
		setViewportSelectMode(!store.viewportSelectMode.value);
	}

	function toggleViewportTransformMode() {
		setViewportTransformMode(!store.viewportTransformMode.value);
	}

	function toggleViewportReferenceImageEditMode() {
		setViewportReferenceImageEditMode(
			!store.viewportReferenceImageEditMode.value,
		);
	}

	function toggleViewportPivotEditMode() {
		setViewportPivotEditMode(!store.viewportPivotEditMode.value);
	}

	function setMeasurementMode(nextEnabled, options) {
		if (nextEnabled) {
			interactionController?.applyNavigateInteractionMode?.({ silent: true });
		}
		return measurementController?.setMeasurementMode?.(nextEnabled, options);
	}

	function toggleMeasurementMode() {
		return setMeasurementMode(
			!(measurementController?.isMeasurementModeActive?.() ?? false),
		);
	}

	function clearViewportEditingSelection() {
		assetController.clearSceneAssetSelection();
		referenceImageController?.clearReferenceImageSelection?.();
		clearFrameSelection();
		clearOutputFrameSelection();
		setMeasurementMode(false, { silent: true });
		setViewportToolMode("none");
	}

	function handleViewportPieAction(actionId, pointerEvent = null) {
		switch (actionId) {
			case "tool-none":
				clearViewportEditingSelection();
				return true;
			case "tool-select":
				setViewportSelectMode(!store.viewportSelectMode.value);
				return true;
			case "tool-reference":
				setViewportReferenceImageEditMode(
					!store.viewportReferenceImageEditMode.value,
				);
				return true;
			case "toggle-reference-preview":
				if ((store.referenceImages.items.value?.length ?? 0) === 0) {
					return false;
				}
				referenceImageController?.setPreviewSessionVisible?.(
					!(store.referenceImages.previewSessionVisible.value !== false),
				);
				return true;
			case "tool-transform":
				setViewportTransformMode(!store.viewportTransformMode.value);
				return true;
			case "tool-pivot":
				setViewportPivotEditMode(!store.viewportPivotEditMode.value);
				return true;
			case "toggle-view-mode":
				cameraController.setMode(
					state.mode === WORKSPACE_PANE_CAMERA
						? WORKSPACE_PANE_VIEWPORT
						: WORKSPACE_PANE_CAMERA,
				);
				return true;
			case "reset-view":
				cameraController.resetActiveView();
				return true;
			case "frame-create":
				frameController.createFrame();
				return true;
			case "frame-mask-all":
				if (state.mode !== WORKSPACE_PANE_CAMERA) {
					return false;
				}
				frameController.toggleFrameMaskMode("all");
				return true;
			case "frame-mask-selected":
				if (state.mode !== WORKSPACE_PANE_CAMERA) {
					return false;
				}
				frameController.toggleFrameMaskMode("selected");
				return true;
			case "frame-mask-toggle": {
				if (state.mode !== WORKSPACE_PANE_CAMERA) {
					return false;
				}
				frameController.togglePreferredFrameMaskMode();
				return true;
			}
			case "adjust-lens":
				measurementController?.setMeasurementMode?.(false, { silent: true });
				return (
					interactionController?.activateLensAdjustMode(pointerEvent) ?? false
				);
			case "clear-selection":
				clearViewportEditingSelection();
				return true;
			default:
				return false;
		}
	}

	function executeViewportPieAction(actionId, pointerEvent = null) {
		interactionController?.closeViewportPieMenu({ silent: true });
		return handleViewportPieAction(actionId, pointerEvent);
	}

	function resetSelectedAssetWorkingPivot() {
		const selectedAssetId = store.selectedSceneAssetId.value;
		if (!selectedAssetId) {
			return;
		}
		assetController.resetAssetWorkingPivot(selectedAssetId);
	}

	function clearSceneAssetSelection() {
		assetController.clearSceneAssetSelection();
	}

	function clearScene() {
		measurementController?.clearMeasurementSession?.({ keepActive: false });
		viewportToolController.setViewportTransformMode(false);
		referenceImageController?.clearReferenceImages?.();
		lightingController?.resetLighting?.();
		assetController.clearScene();
	}

	function isProjectPackageFile(file) {
		return /\.ssproj$/i.test(String(file?.name ?? "").trim());
	}

	async function importOpenedFiles(files, { projectFileHandle = null } = {}) {
		if (!Array.isArray(files) || files.length === 0) {
			return;
		}

		if (files.length === 1 && isProjectPackageFile(files[0])) {
			await projectController?.openProjectSource(files[0], {
				fileHandle: projectFileHandle,
			});
			return;
		}

		const referenceFiles = files.filter((file) =>
			referenceImageController.supportsReferenceImageFile(file),
		);
		const assetFiles = files.filter(
			(file) => !referenceImageController.supportsReferenceImageFile(file),
		);

		if (assetFiles.length > 0) {
			await assetController.importDroppedFiles(assetFiles);
		}
		if (referenceFiles.length > 0) {
			await referenceImageController.importReferenceImageFiles(referenceFiles);
		}
	}

	function startNewProject() {
		return projectController?.startNewProject();
	}

	function saveProject() {
		return projectController?.saveProject();
	}

	function exportProject() {
		return projectController?.exportProject();
	}

	async function openFiles() {
		if (typeof globalThis.showOpenFilePicker === "function") {
			try {
				const fileHandles = await globalThis.showOpenFilePicker({
					multiple: true,
				});
				const files = await Promise.all(
					fileHandles.map((fileHandle) => fileHandle.getFile()),
				);
				const projectFileHandle =
					files.length === 1 && isProjectPackageFile(files[0])
						? fileHandles[0]
						: null;
				await importOpenedFiles(files, { projectFileHandle });
				return;
			} catch (error) {
				if (error?.name === "AbortError") {
					return;
				}
				console.error(error);
				setStatus(error.message);
				return;
			}
		}

		assetController.openFiles();
	}

	async function handleAssetInputChange(event) {
		const files = [...(event.currentTarget?.files ?? [])];
		if (files.length === 0) {
			return;
		}

		try {
			await importOpenedFiles(files);
		} finally {
			event.currentTarget.value = "";
		}
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
