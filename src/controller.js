import {
	FpsMovement,
	PointerControls,
	SparkRenderer,
	SplatMesh,
	flipPixels,
} from "@sparkjsdev/spark";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { getAssetFileURL } from "./asset-url.js";
import {
	BASE_RENDER_BOX,
	DEFAULT_CAMERA_FAR,
	DEFAULT_CAMERA_NEAR,
	DEFAULT_FPS_MOVE_SPEED,
	DEFAULT_GRID_DIVISIONS,
	DEFAULT_GRID_SIZE_METERS,
	DEFAULT_POINTER_SCROLL_SPEED,
	DEFAULT_POINTER_SLIDE_SPEED,
} from "./constants.js";
import { createAssetController } from "./controllers/asset-controller.js";
import { createCameraController } from "./controllers/camera-controller.js";
import { createExportController } from "./controllers/export-controller.js";
import { createFrameController } from "./controllers/frame-controller.js";
import { createInteractionController } from "./controllers/interaction-controller.js";
import { createOutputFrameController } from "./controllers/output-frame-controller.js";
import { createUiSyncController } from "./controllers/ui-sync-controller.js";
import { drawFramesToContext } from "./engine/frame-overlay.js";
import {
	getPreviewFrustumExtents,
	getTargetFrustumExtents,
	horizontalToVerticalFovDegrees,
} from "./engine/projection.js";
import {
	formatAssetWorldScale,
	getDefaultAssetUnitMode,
} from "./engine/scene-units.js";
import { getAnchorLabel, translate } from "./i18n.js";
import { bindInputRouter } from "./interactions/input-router.js";
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
		renderBox,
		frameOverlayCanvas,
		renderBoxMeta,
		anchorDot,
		dropHint,
		exportCanvas,
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
	renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
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
	splatRoot.quaternion.set(1, 0, 0, 0);
	const modelRoot = new THREE.Group();
	contentRoot.add(splatRoot, modelRoot);
	scene.add(contentRoot);

	const guides = new THREE.Group();
	const grid = new THREE.GridHelper(
		DEFAULT_GRID_SIZE_METERS,
		DEFAULT_GRID_DIVISIONS,
		0x335770,
		0x13212e,
	);
	grid.position.y = -0.001;
	grid.material.transparent = true;
	grid.material.opacity = 0.5;
	const axes = new THREE.AxesHelper(0.75);
	guides.add(grid, axes);
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

	function getAutoClipRange() {
		const { radius } = getSceneFraming();
		return {
			near: Math.max(radius / 200, DEFAULT_CAMERA_NEAR),
			far: Math.max(radius * 40, 60),
		};
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
	let lastFrameTime = 0;
	let interactionController = null;
	let outputFrameController = null;
	let uiSyncController = null;
	const disposers = [];

	function currentLocale() {
		return store.locale.value;
	}

	function t(key, params) {
		return translate(currentLocale(), key, params);
	}

	const frameController = createFrameController({
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
	});

	const assetController = createAssetController({
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
		resetLocalizedCaches,
		setExportStatus,
		t,
		formatAssetWorldScale,
		getDefaultAssetUnitMode,
		getAssetFileURL,
		isProjectPackageSource,
		extractProjectPackageAssets,
		disposeObject,
	});

	const exportController = createExportController({
		scene,
		renderer,
		spark,
		guides,
		shotCameraRegistry,
		store,
		exportCanvas,
		flipPixels,
		drawFramesToContext,
		t,
		setStatus,
		setExportStatus,
		updateUi,
		getTotalLoadedItems,
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

	const cameraController = createCameraController({
		store,
		state,
		scene,
		viewportCamera,
		shotCameraRegistry,
		horizontalToVerticalFovDegrees,
		t,
		setStatus,
		updateUi,
		getAutoClipRange,
		clearFrameDrag: () => frameController.clearFrameDrag(),
		clearOutputFramePan,
		clearOutputFrameSelection,
		clearControlMomentum: () => interactionController?.clearControlMomentum(),
		applyNavigateInteractionMode: () =>
			interactionController?.applyNavigateInteractionMode({ silent: true }),
		copyPose,
		frameCamera,
		syncControlsToMode: () => interactionController?.syncControlsToMode(),
	});
	outputFrameController = createOutputFrameController({
		store,
		state,
		viewportShell,
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
	uiSyncController = createUiSyncController({
		store,
		state,
		sceneState,
		viewportShell,
		renderBox,
		dropHint,
		exportCanvas,
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
		syncActiveShotCameraFromDocument();
		const shotCamera = getActiveShotCamera();
		const outputFrameDocument =
			getActiveShotCameraDocument()?.outputFrame ?? {};
		const exportSize = getOutputSizeState();
		const metrics = getOutputFrameMetrics();
		const targetFrustum = getTargetFrustumExtents({
			near: shotCamera.near,
			horizontalFovDegrees: state.baseFovX,
			widthScale: state.outputFrame.widthScale,
			heightScale: state.outputFrame.heightScale,
			centerX: outputFrameDocument.centerX,
			centerY: outputFrameDocument.centerY,
		});
		const previewFrustum = getPreviewFrustumExtents({
			targetFrustum,
			metrics,
		});

		return {
			exportSize,
			metrics,
			targetFrustum,
			previewFrustum,
		};
	}

	function updateOutputFrameOverlay() {
		return outputFrameController.updateOutputFrameOverlay();
	}

	function updateDropHint() {
		return uiSyncController?.updateDropHint();
	}

	function setPerspectiveExtents(camera, left, right, top, bottom) {
		camera.projectionMatrix.makePerspective(
			left,
			right,
			top,
			bottom,
			camera.near,
			camera.far,
		);
		camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
	}

	function applyCustomProjection(camera, frustum) {
		setPerspectiveExtents(
			camera,
			frustum.left,
			frustum.right,
			frustum.top,
			frustum.bottom,
		);
	}

	function applySymmetricProjection(camera, aspect) {
		camera.aspect = aspect;
		camera.fov = horizontalToVerticalFovDegrees(state.baseFovX, aspect);
		camera.updateProjectionMatrix();
	}

	function syncShotProjection() {
		const shotCamera = getActiveShotCamera();
		const { targetFrustum } = getProjectionState();
		applyCustomProjection(shotCamera, targetFrustum);
	}

	function applyCameraViewProjection() {
		const shotCamera = getActiveShotCamera();
		const cameraViewCamera = getActiveCameraViewCamera();
		const { previewFrustum } = getProjectionState();

		cameraViewCamera.position.copy(shotCamera.position);
		cameraViewCamera.quaternion.copy(shotCamera.quaternion);
		cameraViewCamera.near = shotCamera.near;
		cameraViewCamera.far = shotCamera.far;
		cameraViewCamera.up.copy(shotCamera.up);
		cameraViewCamera.updateMatrixWorld();

		applyCustomProjection(cameraViewCamera, previewFrustum);
	}

	function clearControlMomentum() {
		return interactionController?.clearControlMomentum();
	}

	function syncControlsToMode() {
		return interactionController?.syncControlsToMode();
	}

	function copyPose(sourceCamera, destinationCamera) {
		destinationCamera.position.copy(sourceCamera.position);
		destinationCamera.quaternion.copy(sourceCamera.quaternion);
		destinationCamera.up.copy(sourceCamera.up);
		destinationCamera.updateMatrixWorld();
	}

	function getSceneFraming() {
		const bounds = getSceneBounds();
		if (!bounds) {
			return {
				center: new THREE.Vector3(0, 0, 0),
				radius: 1,
			};
		}

		const center = bounds.box.getCenter(new THREE.Vector3());
		const size = bounds.size;
		return {
			center,
			radius: Math.max(size.length() * 0.35, 0.6),
		};
	}

	function frameCamera(camera, variant) {
		const { center, radius } = getSceneFraming();
		const offset =
			variant === "camera"
				? new THREE.Vector3(
						radius * 0.12,
						radius * 0.08,
						Math.max(radius * 2.3, 2),
					)
				: new THREE.Vector3(
						radius * 1.5,
						radius * 0.9,
						Math.max(radius * 2.6, 2.8),
					);

		camera.position.copy(center).add(offset);
		if (variant === "viewport") {
			const autoClip = getAutoClipRange();
			camera.near = autoClip.near;
			camera.far = Math.max(autoClip.far, DEFAULT_CAMERA_FAR);
		}
		camera.lookAt(center);
		camera.updateMatrixWorld();
	}

	function frameAllCameras() {
		for (const entry of shotCameraRegistry.values()) {
			frameCamera(entry.camera, "camera");
			syncShotCameraEntryFromDocument(entry);
		}
		frameCamera(viewportCamera, "viewport");
		syncControlsToMode();
	}

	function handleResize() {
		const { width, height } = outputFrameController.getViewportSize();
		renderer.setSize(width, height, false);
		outputFrameController.handleResize();
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
		const shotCamera = getActiveShotCamera();
		const outputCamera = getActiveOutputCamera();
		const { targetFrustum } = getProjectionState();
		outputCamera.position.copy(shotCamera.position);
		outputCamera.quaternion.copy(shotCamera.quaternion);
		outputCamera.near = shotCamera.near;
		outputCamera.far = shotCamera.far;
		outputCamera.up.copy(shotCamera.up);
		applyCustomProjection(outputCamera, targetFrustum);
		outputCamera.updateMatrixWorld();
	}

	function setMode(mode) {
		return cameraController.setMode(mode);
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

	function clearScene() {
		return assetController.clearScene();
	}

	function setStatus(message) {
		store.statusLine.value = message;
	}

	function updateSceneSummary() {
		return uiSyncController?.updateSceneSummary();
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

	async function refreshOutputPreview() {
		return exportController.refreshOutputPreview();
	}

	async function downloadPng() {
		return exportController.downloadPng();
	}

	function setBaseFovX(nextValue) {
		return cameraController.setBaseFovX(nextValue);
	}

	function setShotCameraClippingMode(nextValue) {
		return cameraController.setShotCameraClippingMode(nextValue);
	}

	function setShotCameraNear(nextValue) {
		return cameraController.setShotCameraNear(nextValue);
	}

	function setShotCameraFar(nextValue) {
		return cameraController.setShotCameraFar(nextValue);
	}

	function setShotCameraExportName(nextValue) {
		return cameraController.setShotCameraExportName(nextValue);
	}

	function setExportTarget(nextValue) {
		return exportController.setExportTarget(nextValue);
	}

	function toggleExportPreset(shotCameraId) {
		return exportController.toggleExportPreset(shotCameraId);
	}

	function selectShotCamera(shotCameraId) {
		return cameraController.selectShotCamera(shotCameraId);
	}

	function createShotCamera() {
		return cameraController.createShotCamera();
	}

	function duplicateActiveShotCamera() {
		return cameraController.duplicateActiveShotCamera();
	}

	function selectFrame(frameId) {
		return frameController.selectFrame(frameId);
	}

	function createFrame() {
		return frameController.createFrame();
	}

	function duplicateActiveFrame() {
		return frameController.duplicateActiveFrame();
	}

	function deleteActiveFrame() {
		return frameController.deleteActiveFrame();
	}

	function startFrameDrag(frameId, event) {
		return frameController.startFrameDrag(frameId, event);
	}

	function handleFrameDragMove(event) {
		return frameController.handleFrameDragMove(event);
	}

	function handleFrameDragEnd(event) {
		return frameController.handleFrameDragEnd(event);
	}

	function startFrameResize(frameId, handleKey, event) {
		return frameController.startFrameResize(frameId, handleKey, event);
	}

	function handleFrameResizeMove(event) {
		return frameController.handleFrameResizeMove(event);
	}

	function handleFrameResizeEnd(event) {
		return frameController.handleFrameResizeEnd(event);
	}

	function startFrameRotate(frameId, zoneKey, event) {
		return frameController.startFrameRotate(frameId, zoneKey, event);
	}

	function handleFrameRotateMove(event) {
		return frameController.handleFrameRotateMove(event);
	}

	function handleFrameRotateEnd(event) {
		return frameController.handleFrameRotateEnd(event);
	}

	function startFrameAnchorDrag(frameId, event) {
		return frameController.startFrameAnchorDrag(frameId, event);
	}

	function handleFrameAnchorDragMove(event) {
		return frameController.handleFrameAnchorDragMove(event);
	}

	function handleFrameAnchorDragEnd(event) {
		return frameController.handleFrameAnchorDragEnd(event);
	}

	function startOutputFramePan(event) {
		return outputFrameController.startOutputFramePan(event);
	}

	function handleOutputFramePanMove(event) {
		return outputFrameController.handleOutputFramePanMove(event);
	}

	function handleOutputFramePanEnd(event) {
		return outputFrameController.handleOutputFramePanEnd(event);
	}

	function startOutputFrameAnchorDrag(event) {
		return outputFrameController.startOutputFrameAnchorDrag(event);
	}

	function handleOutputFrameAnchorDragMove(event) {
		return outputFrameController.handleOutputFrameAnchorDragMove(event);
	}

	function handleOutputFrameAnchorDragEnd(event) {
		return outputFrameController.handleOutputFrameAnchorDragEnd(event);
	}

	function startOutputFrameResize(handleKey, event) {
		return outputFrameController.startOutputFrameResize(handleKey, event);
	}

	function handleOutputFrameResizeMove(event) {
		return outputFrameController.handleOutputFrameResizeMove(event);
	}

	function handleOutputFrameResizeEnd(event) {
		return outputFrameController.handleOutputFrameResizeEnd(event);
	}

	function applyOutputFrameResize(
		documentState,
		nextWidthScale,
		nextHeightScale,
	) {
		return outputFrameController.applyOutputFrameResize(
			documentState,
			nextWidthScale,
			nextHeightScale,
		);
	}

	function setAssetWorldScale(assetId, nextValue) {
		return assetController.setAssetWorldScale(assetId, nextValue);
	}

	function resetAssetWorldScale(assetId) {
		return assetController.resetAssetWorldScale(assetId);
	}

	function setBoxWidthPercent(nextValue) {
		return outputFrameController.setBoxWidthPercent(nextValue);
	}

	function setBoxHeightPercent(nextValue) {
		return outputFrameController.setBoxHeightPercent(nextValue);
	}

	function setViewZoomPercent(nextValue) {
		return outputFrameController.setViewZoomPercent(nextValue);
	}

	function setAnchor(nextValue) {
		return outputFrameController.setAnchor(nextValue);
	}

	async function loadRemoteUrls() {
		return assetController.loadRemoteUrls();
	}

	async function handleAssetInputChange(event) {
		return assetController.handleAssetInputChange(event);
	}

	async function loadSample() {
		return assetController.loadSample();
	}

	function copyViewportToShotCamera() {
		return cameraController.copyViewportToShotCamera();
	}

	function copyShotCameraToViewport() {
		return cameraController.copyShotCameraToViewport();
	}

	function resetActiveView() {
		return cameraController.resetActiveView();
	}

	function openFiles() {
		return assetController.openFiles();
	}

	function listen(target, eventName, handler) {
		target.addEventListener(eventName, handler);
		disposers.push(() => target.removeEventListener(eventName, handler));
	}

	function bindViewportInteractions() {
		bindInputRouter({
			listen,
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
			isInteractiveTextTarget,
			isZoomInteractionMode: () =>
				interactionController?.isZoomInteractionMode() ?? false,
			applyNavigateInteractionMode: () =>
				interactionController?.applyNavigateInteractionMode(),
			state,
			isFrameSelectionActive,
			clearFrameSelection,
			clearOutputFrameSelection,
			handleZoomToolDragMove,
			handleZoomToolDragEnd,
			handleOutputFramePanMove,
			handleOutputFramePanEnd,
			handleOutputFrameResizeMove,
			handleOutputFrameResizeEnd,
			handleOutputFrameAnchorDragMove,
			handleOutputFrameAnchorDragEnd,
			handleFrameDragMove,
			handleFrameDragEnd,
			handleFrameResizeMove,
			handleFrameResizeEnd,
			handleFrameRotateMove,
			handleFrameRotateEnd,
			handleFrameAnchorDragMove,
			handleFrameAnchorDragEnd,
			startOutputFrameAnchorDrag,
		});
	}

	async function loadStartupUrls() {
		return assetController.loadStartupUrls();
	}

	function animate(timeMs) {
		handleResize();
		if (exportController.isRenderLocked()) {
			updateOutputFrameOverlay();
			return;
		}

		const deltaTime =
			lastFrameTime > 0 ? Math.min((timeMs - lastFrameTime) / 1000, 0.1) : 0;
		lastFrameTime = timeMs;
		const activeCamera = getActiveCamera();
		fpsMovement.update(deltaTime, activeCamera);
		pointerControls.update(deltaTime, activeCamera, activeCamera);

		applySymmetricProjection(
			viewportCamera,
			Math.max(viewportShell.clientWidth, 1) /
				Math.max(viewportShell.clientHeight, 1),
		);
		syncShotProjection();
		applyCameraViewProjection();

		updateShotCameraHelpers();

		renderer.render(
			scene,
			state.mode === WORKSPACE_PANE_CAMERA
				? getActiveCameraViewCamera()
				: viewportCamera,
		);
		updateOutputFrameOverlay();
		updateCameraSummary();
	}

	function init() {
		document.body.dataset.mode = state.mode;
		store.sceneSummary.value = t("scene.summaryEmpty");
		store.sceneScaleSummary.value = t("scene.scaleDefault");
		store.exportSummary.value = t("exportSummary.empty");
		setStatus(t("status.ready"));
		setExportStatus("export.idle");
		updateUi();
		frameAllCameras();
		syncControlsToMode();
		interactionController?.applyNavigateInteractionMode({ silent: true });
		setStatus(
			t("status.navigationActive", {
				speed: formatNumber(fpsMovement.moveSpeed, 1),
			}),
		);
		handleResize();
		bindViewportInteractions();
		renderer.setAnimationLoop(animate);
		loadStartupUrls();
	}

	init();

	return {
		setMode,
		setLocale,
		setBaseFovX,
		setBoxWidthPercent,
		setBoxHeightPercent,
		setViewZoomPercent,
		setAnchor,
		setShotCameraClippingMode,
		setShotCameraNear,
		setShotCameraFar,
		setShotCameraExportName,
		setExportTarget,
		toggleExportPreset,
		selectFrame,
		createFrame,
		duplicateActiveFrame,
		deleteActiveFrame,
		startFrameDrag,
		startFrameResize,
		startFrameRotate,
		startFrameAnchorDrag,
		startOutputFramePan,
		startOutputFrameResize,
		selectShotCamera,
		createShotCamera,
		duplicateActiveShotCamera,
		setAssetWorldScale,
		resetAssetWorldScale,
		openFiles,
		loadSample,
		clearScene,
		loadRemoteUrls,
		handleAssetInputChange,
		copyViewportToShotCamera,
		copyShotCameraToViewport,
		resetActiveView,
		refreshOutputPreview,
		downloadPng,
		dispose() {
			renderer.setAnimationLoop(null);
			while (disposers.length > 0) {
				const dispose = disposers.pop();
				dispose();
			}
			fpsMovement.enable = false;
			pointerControls.enable = false;
			exportController.dispose();
			renderer.dispose();
		},
	};
}
