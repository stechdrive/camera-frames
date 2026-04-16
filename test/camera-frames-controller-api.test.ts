import assert from "node:assert/strict";
import { createControllerApi } from "../src/app/controller-api.js";

let transformModeEnabled = false;
let clearedSelection = false;
let startedNewProject = false;
let disposedRuntime = false;
let disposedGuideOverlay = false;
let disposedLighting = false;
let frameTrajectoryNodeModeCall = null;

const api = createControllerApi({
	store: {},
	state: { mode: "camera" },
	cameraController: {
		setMode: () => {},
		setBaseFovX: () => {},
		setViewportBaseFovX: () => {},
		setShotCameraClippingMode: () => {},
		setShotCameraNear: () => {},
		setShotCameraFar: () => {},
		setShotCameraRollLock: () => {},
		setActiveShotCameraPositionAxis: () => {},
		setShotCameraName: () => {},
		setShotCameraExportName: () => {},
		setShotCameraExportFormat: () => {},
		setShotCameraExportGridOverlay: () => {},
		setShotCameraExportGridLayerMode: () => {},
		setShotCameraExportModelLayers: () => {},
		setShotCameraExportSplatLayers: () => {},
		selectShotCamera: () => {},
		createShotCamera: () => {},
		duplicateActiveShotCamera: () => {},
		deleteActiveShotCamera: () => {},
		copyViewportToShotCamera: () => "copy-v2s",
		copyShotCameraToViewport: () => "copy-s2v",
		resetActiveView: () => "reset",
	},
	exportController: {
		setExportTarget: () => {},
		toggleExportPreset: () => {},
		setReferenceImageExportSessionEnabled: () => {},
		downloadOutput: () => "download-output",
		downloadPng: () => "download-png",
		downloadPsd: () => "download-psd",
	},
	frameController: {
		selectFrame: () => {},
		createFrame: () => {},
		duplicateActiveFrame: () => {},
		duplicateSelectedFrames: () => {},
		setFrameName: () => {},
		deleteSelectedFrames: () => {},
		deleteFrame: () => {},
		deleteActiveFrame: () => {},
		setFrameMaskMode: () => {},
		toggleFrameMaskMode: () => {},
		setFrameMaskOpacity: () => {},
		setFrameTrajectoryNodeMode: (...args) => {
			frameTrajectoryNodeModeCall = args;
		},
		startFrameDrag: () => {},
		startSelectedFramesDrag: () => {},
		startFrameResize: () => {},
		startSelectedFramesResize: () => {},
		startFrameRotate: () => {},
		startSelectedFramesRotate: () => {},
		startFrameAnchorDrag: () => {},
		startSelectedFramesAnchorDrag: () => {},
	},
	historyController: {
		beginHistoryTransaction: (label) => label,
		commitHistoryTransaction: (label) => label,
		cancelHistoryTransaction: () => "cancel",
		undoHistory: () => "undo",
		redoHistory: () => "redo",
	},
	interactionController: {
		activateShotCameraRollMode: () => "roll",
		openViewportPieMenuAtCenter: () => "pie-center",
		closeViewportPieMenu: () => "pie-close",
	},
	lightingController: {
		setAmbient: () => {},
		setModelLightEnabled: () => {},
		setModelLightIntensity: () => {},
		setModelLightAzimuthDeg: () => {},
		setModelLightElevationDeg: () => {},
		setModelLightDirection: () => {},
		resetModelLightDirection: () => {},
		dispose: () => {
			disposedLighting = true;
		},
	},
	measurementController: {
		setMeasurementMode: () => {},
		selectMeasurementPoint: () => {},
		startMeasurementAxisDrag: () => {},
		setMeasurementLengthInputText: () => {},
		applyMeasurementScale: () => {},
		dispose: () => {},
	},
	outputFrameController: {
		setBoxWidthPercent: () => {},
		setBoxHeightPercent: () => {},
		setViewZoomPercent: () => {},
		fitOutputFrameToSafeArea: () => {},
		canFitOutputFrameToSafeArea: () => true,
		setAnchor: () => {},
		startOutputFramePan: () => {},
		startOutputFrameResize: () => {},
	},
	assetController: {
		selectSceneAsset: () => {},
		setAssetWorldScale: () => {},
		setAssetTransform: () => {},
		resetAssetWorldScale: () => {},
		resetSelectedSceneAssetsWorldScale: () => {},
		setAssetPosition: () => {},
		offsetSelectedSceneAssetsPosition: () => {},
		setAssetRotationDegrees: () => {},
		offsetSelectedSceneAssetsRotationDegrees: () => {},
		setAssetVisibility: () => {},
		setAssetLabel: () => {},
		duplicateSelectedSceneAssets: () => "duplicate-assets",
		deleteSelectedSceneAssets: () => {},
		setSelectedSceneAssetsVisibility: () => {},
		applyAssetTransform: () => {},
		scaleSelectedSceneAssetsByFactor: () => {},
		moveAssetUp: () => {},
		moveAssetDown: () => {},
		moveAssetToIndex: () => {},
		setAssetExportRole: () => {},
		setAssetMaskGroup: () => {},
		loadRemoteUrls: () => {},
	},
	referenceImageController: {
		openReferenceImageFiles: () => {},
		importReferenceImageFiles: () => {},
		supportsReferenceImageFile: () => true,
		handleReferenceImageInputChange: () => {},
		setPreviewSessionVisible: () => {},
		setActiveReferenceImagePreset: () => {},
		setActiveReferenceImagePresetName: () => {},
		duplicateActiveReferenceImagePreset: () => {},
		deleteActiveReferenceImagePreset: () => {},
		deleteSelectedReferenceImageItems: () => {},
		clearReferenceImageSelection: () => {},
		ensureReferenceImageEditingSelection: () => {},
		isReferenceImageSelectionActive: () => true,
		getSelectedReferenceImageInspectorState: () => ({}),
		beginSelectedReferenceImageInspectorTransformSession: () => {},
		endSelectedReferenceImageInspectorTransformSession: () => {},
		selectReferenceImageAsset: () => {},
		selectReferenceImageItem: () => {},
		setReferenceImagePreviewVisible: () => {},
		setSelectedReferenceImagesPreviewVisible: () => {},
		setReferenceImageExportEnabled: () => {},
		setSelectedReferenceImagesExportEnabled: () => {},
		setSelectedReferenceImagesOpacity: () => {},
		setReferenceImageOpacity: () => {},
		scaleSelectedReferenceImagesByFactor: () => {},
		applySelectedReferenceImagesScaleFromSession: () => {},
		setReferenceImageScalePct: () => {},
		offsetSelectedReferenceImagesRotationDeg: () => {},
		applySelectedReferenceImagesRotationFromSession: () => {},
		setReferenceImageRotationDeg: () => {},
		offsetSelectedReferenceImagesPosition: () => {},
		offsetReferenceImageBoundsPosition: () => {},
		getReferenceImageLogicalBounds: () => null,
		getSelectedReferenceImageTransformSession: () => null,
		setReferenceImageOffsetPx: () => {},
		setReferenceImageBoundsPosition: () => {},
		setReferenceImageGroup: () => {},
		setReferenceImageOrder: () => {},
		moveReferenceImageToDisplayTarget: () => {},
		startReferenceImageMove: () => {},
		startReferenceImageResize: () => {},
		startReferenceImageRotate: () => {},
		startReferenceImageAnchorDrag: () => {},
	},
	runtimeController: {
		dispose: () => {
			disposedRuntime = true;
		},
	},
	viewportToolController: {
		setViewportTransformSpace: () => {},
		setViewportTransformHover: () => {},
		pickViewportAssetAtPointer: () => {},
		startViewportTransformDrag: () => {},
	},
	guideOverlay: {
		dispose: () => {
			disposedGuideOverlay = true;
		},
	},
	setLocale: () => {},
	setViewportTransformMode: (nextValue) => {
		transformModeEnabled = nextValue;
	},
	toggleViewportTransformMode: () => {},
	setViewportSelectMode: () => {},
	toggleViewportSelectMode: () => {},
	setViewportReferenceImageEditMode: () => {},
	toggleViewportReferenceImageEditMode: () => {},
	setViewportPivotEditMode: () => {},
	toggleViewportPivotEditMode: () => {},
	setMeasurementMode: () => {},
	toggleMeasurementMode: () => {},
	setViewportProjectionMode: () => {},
	alignViewportToOrthographicView: () => {},
	toggleViewportOrthographicAxis: () => {},
	setActiveShotCameraPoseAngle: () => {},
	moveActiveShotCameraLocalAxis: () => {},
	resetSelectedAssetWorkingPivot: () => {},
	clearSceneAssetSelection: () => {
		clearedSelection = true;
	},
	openFiles: () => {},
	handleAssetInputChange: () => {},
	startNewProject: () => {
		startedNewProject = true;
	},
	saveProject: () => {},
	exportProject: () => {},
	clearScene: () => {},
	getActiveCameraHeadingDeg: () => 90,
	getActiveShotCameraPoseState: () => ({ x: 1 }),
	executeViewportPieAction: () => {},
	toggleZoomTool: () => {},
	disposeSceneResources: () => {},
});

api.setViewportTransformMode(true);
assert.equal(transformModeEnabled, true);

api.clearSceneAssetSelection();
assert.equal(clearedSelection, true);

api.startNewProject();
assert.equal(startedNewProject, true);

assert.equal(api.copyViewportToShotCamera(), "copy-v2s");
assert.equal(api.copyShotCameraToViewport(), "copy-s2v");
assert.equal(api.resetActiveView(), "reset");
assert.equal(api.downloadOutput(), "download-output");
assert.equal(api.duplicateSelectedSceneAssets(), "duplicate-assets");
assert.equal(api.beginHistoryTransaction("x"), "x");
api.setFrameTrajectoryNodeMode("frame-1", "free");
assert.deepEqual(frameTrajectoryNodeModeCall, ["frame-1", "free"]);

api.dispose();
assert.equal(disposedRuntime, true);
assert.equal(disposedGuideOverlay, true);
assert.equal(disposedLighting, true);

console.log("✅ CAMERA_FRAMES controller api tests passed!");
