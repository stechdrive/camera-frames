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
import { createOutputFrameController } from "./controllers/output-frame-controller.js";
import { drawFramesToContext } from "./engine/frame-overlay.js";
import {
	frustumSpanToFovDegrees,
	getPreviewFrustumExtents,
	getTargetFrustumExtents,
	horizontalToVerticalFovDegrees,
} from "./engine/projection.js";
import {
	buildAssetCountBadge,
	buildSceneScaleSummary,
	buildSceneSummary,
	formatAssetWorldScale,
	getAssetKindLabelKey,
	getAssetUnitModeLabelKey,
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

	const INTERACTION_MODE_NAVIGATE = "navigate";
	const INTERACTION_MODE_ZOOM = "zoom";

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
		interactionMode: INTERACTION_MODE_NAVIGATE,
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
	let zoomToolDragState = null;
	let outputFrameController = null;
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
		isZoomToolActive,
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
		clearControlMomentum,
		applyNavigateInteractionMode: () =>
			applyInteractionMode(INTERACTION_MODE_NAVIGATE, { silent: true }),
		copyPose,
		frameCamera,
		syncControlsToMode,
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
		isZoomToolActive,
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
	registerShotCameraDocuments();

	function formatNumber(value, digits = 2) {
		return Number(value).toFixed(digits);
	}

	function isZoomToolActive() {
		return (
			state.mode === WORKSPACE_PANE_CAMERA &&
			state.interactionMode === INTERACTION_MODE_ZOOM
		);
	}

	function isInteractiveTextTarget(target) {
		return (
			target instanceof Element &&
			target.closest(
				'input, textarea, select, option, [contenteditable="true"]',
			) !== null
		);
	}

	function clearZoomToolDrag() {
		zoomToolDragState = null;
		viewportShell.classList.remove("is-zoom-dragging");
	}

	function applyInteractionMode(nextMode, { silent = false } = {}) {
		if (state.interactionMode === nextMode) {
			return;
		}

		state.interactionMode = nextMode;
		clearZoomToolDrag();
		clearControlMomentum();
		const navigationEnabled = nextMode === INTERACTION_MODE_NAVIGATE;
		fpsMovement.enable = navigationEnabled;
		pointerControls.enable = navigationEnabled;
		if (!silent) {
			setStatus(
				navigationEnabled
					? t("status.navigationActive", {
							speed: formatNumber(fpsMovement.moveSpeed, 1),
						})
					: t("status.zoomToolEnabled"),
			);
		}
		updateUi();
	}

	function toggleZoomTool() {
		if (state.mode !== WORKSPACE_PANE_CAMERA) {
			setStatus(t("status.zoomToolUnavailable"));
			return;
		}

		applyInteractionMode(
			state.interactionMode === INTERACTION_MODE_ZOOM
				? INTERACTION_MODE_NAVIGATE
				: INTERACTION_MODE_ZOOM,
		);
	}

	function setViewZoomFactor(nextZoom) {
		return outputFrameController.setViewZoomFactor(nextZoom);
	}

	function startZoomToolDrag(event) {
		if (!isZoomToolActive() || event.button !== 0) {
			return false;
		}

		event.preventDefault();
		event.stopPropagation();
		viewportShell.classList.add("is-zoom-dragging");
		zoomToolDragState = {
			pointerId: event.pointerId,
			startClientX: event.clientX,
			startViewZoom: state.outputFrame.viewZoom,
		};
		return true;
	}

	function handleZoomToolDragMove(event) {
		if (!zoomToolDragState || event.pointerId !== zoomToolDragState.pointerId) {
			return;
		}

		const deltaX = event.clientX - zoomToolDragState.startClientX;
		const nextZoom =
			zoomToolDragState.startViewZoom * Math.exp(deltaX * 0.0045);
		setViewZoomFactor(nextZoom);
	}

	function handleZoomToolDragEnd(event) {
		if (!zoomToolDragState || event.pointerId !== zoomToolDragState.pointerId) {
			return;
		}

		clearZoomToolDrag();
	}

	function getActiveCamera() {
		return state.mode === WORKSPACE_PANE_CAMERA
			? getActiveShotCamera()
			: viewportCamera;
	}

	function resetLocalizedCaches() {
		state.lastCameraSummary = "";
		state.lastSceneSummary = "";
		state.lastSceneScaleSummary = "";
	}

	function getSceneAssetCounts() {
		return assetController.getSceneAssetCounts();
	}

	function getTotalLoadedItems() {
		return assetController.getTotalLoadedItems();
	}

	function syncSceneAssetRows() {
		store.sceneAssets.value = sceneState.assets.map((asset) => ({
			id: asset.id,
			label: asset.label,
			kindLabelKey: getAssetKindLabelKey(asset.kind),
			unitModeLabelKey: getAssetUnitModeLabelKey(asset.unitMode),
			worldScale: asset.worldScale,
		}));
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
		dropHint.classList.toggle("is-hidden", getTotalLoadedItems() > 0);
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
		pointerControls.moveVelocity.set(0, 0, 0);
		pointerControls.rotateVelocity.set(0, 0, 0);
		pointerControls.scroll.set(0, 0, 0);
	}

	function syncControlsToMode() {
		clearControlMomentum();
		const navigationEnabled =
			state.interactionMode === INTERACTION_MODE_NAVIGATE;
		fpsMovement.enable = navigationEnabled;
		pointerControls.enable = navigationEnabled;
		updateUi();
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

	function renderViewportFrameOverlay(metrics) {
		const context = frameOverlayCanvas?.getContext("2d");
		if (!context) {
			return;
		}

		const shellWidth = Math.max(1, viewportShell.clientWidth);
		const shellHeight = Math.max(1, viewportShell.clientHeight);
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		const canvasWidth = Math.max(1, Math.round(shellWidth * dpr));
		const canvasHeight = Math.max(1, Math.round(shellHeight * dpr));

		if (frameOverlayCanvas.width !== canvasWidth) {
			frameOverlayCanvas.width = canvasWidth;
		}
		if (frameOverlayCanvas.height !== canvasHeight) {
			frameOverlayCanvas.height = canvasHeight;
		}

		frameOverlayCanvas.style.left = `${-metrics.boxLeft}px`;
		frameOverlayCanvas.style.top = `${-metrics.boxTop}px`;
		frameOverlayCanvas.style.width = `${shellWidth}px`;
		frameOverlayCanvas.style.height = `${shellHeight}px`;

		context.setTransform(1, 0, 0, 1, 0, 0);
		context.clearRect(
			0,
			0,
			frameOverlayCanvas.width,
			frameOverlayCanvas.height,
		);
		context.scale(dpr, dpr);
		drawFramesToContext(
			context,
			metrics.boxWidth,
			metrics.boxHeight,
			getActiveFrames(),
			{
				logicalSpaceWidth: metrics.exportWidth,
				logicalSpaceHeight: metrics.exportHeight,
				offsetX: metrics.boxLeft,
				offsetY: metrics.boxTop,
				strokeStyle: "rgba(255, 87, 72, 0.92)",
				selectedFrameId: isFrameSelectionActive()
					? (getActiveShotCameraDocument()?.activeFrameId ?? null)
					: null,
				selectedStrokeStyle: "rgba(255, 214, 120, 0.96)",
			},
		);
		context.setTransform(1, 0, 0, 1, 0, 0);
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
		const locale = currentLocale();
		const counts = getSceneAssetCounts();
		const badgeText = buildAssetCountBadge(locale, counts);
		store.sceneBadge.value = badgeText;

		const bounds = getSceneBounds();
		const summary = buildSceneSummary(locale, {
			totalCount: counts.totalCount,
			badgeText,
			boundsSize: bounds?.size ?? null,
		});

		if (summary !== state.lastSceneSummary) {
			state.lastSceneSummary = summary;
			store.sceneSummary.value = summary;
		}

		const scaleSummary = buildSceneScaleSummary(locale, {
			assets: sceneState.assets,
		});
		if (scaleSummary !== state.lastSceneScaleSummary) {
			state.lastSceneScaleSummary = scaleSummary;
			store.sceneScaleSummary.value = scaleSummary;
		}

		syncSceneAssetRows();
		updateDropHint();
	}

	function updateCameraSummary() {
		const shotCamera = getActiveShotCamera();
		const activeCamera = getActiveCamera();
		const forward = activeCamera.getWorldDirection(new THREE.Vector3());
		const { targetFrustum } = getProjectionState();
		const targetHorizontalFov = frustumSpanToFovDegrees(
			targetFrustum.width,
			shotCamera.near,
		);
		const targetVerticalFov = frustumSpanToFovDegrees(
			targetFrustum.height,
			shotCamera.near,
		);
		const activeShotCameraDocument = getActiveShotCameraDocument();
		const nextSummary = [
			`${t("cameraSummary.view")} ${t(`mode.${state.mode}`)}`,
			`${t("cameraSummary.shot")} ${activeShotCameraDocument?.name ?? "-"}`,
			`${t("cameraSummary.pos")} ${formatNumber(activeCamera.position.x)}, ${formatNumber(activeCamera.position.y)}, ${formatNumber(activeCamera.position.z)} m`,
			`${t("cameraSummary.fwd")} ${formatNumber(forward.x)}, ${formatNumber(forward.y)}, ${formatNumber(forward.z)}`,
			`${t("cameraSummary.clip")} ${t(`clipMode.${store.shotCamera.clippingMode.value}`)}`,
			`${t("cameraSummary.nearFar")} ${formatNumber(activeCamera.near, 2)} / ${formatNumber(activeCamera.far, 1)} m`,
			`${t("cameraSummary.base")} ${formatNumber(state.baseFovX, 0)}°`,
			`${t("cameraSummary.frame")} ${formatNumber(targetHorizontalFov, 1)}° × ${formatNumber(targetVerticalFov, 1)}°`,
			`${t("cameraSummary.nav")} ${formatNumber(fpsMovement.moveSpeed, 1)} m/s`,
		].join(" · ");

		if (nextSummary !== state.lastCameraSummary) {
			state.lastCameraSummary = nextSummary;
			store.cameraSummary.value = nextSummary;
		}
	}

	function setExportStatus(key, busy = false) {
		state.exportStatusKey = key;
		state.exportBusy = busy;
		store.exportStatusKey.value = key;
		store.exportBusy.value = busy;
	}

	function updateUi() {
		syncActiveShotCameraFromDocument();
		document.body.dataset.mode = state.mode;
		document.body.dataset.interactionMode = state.interactionMode;
		viewportShell.classList.toggle("is-zoom-tool", isZoomToolActive());
		renderBox.classList.toggle("is-selected", state.outputFrameSelected);
		exportCanvas.width = store.exportWidth.value;
		exportCanvas.height = store.exportHeight.value;
		exportCanvas.style.aspectRatio = `${store.exportWidth.value} / ${store.exportHeight.value}`;
		updateOutputFrameOverlay();
		updateSceneSummary();
		updateDropHint();
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

	function startFrameRotate(frameId, event) {
		return frameController.startFrameRotate(frameId, event);
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
				state.interactionMode === INTERACTION_MODE_ZOOM,
			applyNavigateInteractionMode: () =>
				applyInteractionMode(INTERACTION_MODE_NAVIGATE),
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
		applyInteractionMode(INTERACTION_MODE_NAVIGATE, { silent: true });
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
