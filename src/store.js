import { computed, signal } from "@preact/signals";
import {
	BASE_RENDER_BOX,
	DEFAULT_CAMERA_FAR,
	DEFAULT_CAMERA_NEAR,
	SCENE_UNIT_BADGE,
} from "./constants.js";
import {
	DEFAULT_SHOT_CAMERA_BASE_FOVX,
	DEFAULT_VIEWPORT_CAMERA_BASE_FOVX,
	getBaseHorizontalFovDegreesForStandardFrameHorizontalEquivalentMm,
	getStandardFrameHorizontalEquivalentMm,
	getStandardFrameHorizontalFovDegrees,
} from "./engine/camera-lens.js";
import {
	DEFAULT_VIEWPORT_ORTHO_DISTANCE,
	DEFAULT_VIEWPORT_ORTHO_FOCUS,
	DEFAULT_VIEWPORT_ORTHO_SIZE,
	DEFAULT_VIEWPORT_ORTHO_VIEW,
	VIEWPORT_PROJECTION_PERSPECTIVE,
} from "./engine/viewport-orthographic.js";
import { resolveInitialLocale, translate } from "./i18n.js";
import { createDefaultLightingState } from "./lighting-model.js";
import { createDefaultReferenceImageDocument } from "./reference-image-model.js";
import {
	WORKSPACE_LAYOUT_SINGLE,
	createDefaultShotCameraDocuments,
	createDefaultWorkspacePanes,
	getActiveFrameDocument,
	getActiveShotCameraDocument,
	getActiveWorkspacePane,
	getWorkspaceModeLabelKey,
	resolveFrameMaskPreferredMode,
	resolveFrameMaskSelectedIds,
} from "./workspace-model.js";

function formatNumber(value, digits = 0) {
	return Number(value).toFixed(digits);
}

export function createCameraFramesStore(runtimeInfo = null) {
	const initialLocale = resolveInitialLocale();
	const locale = signal(initialLocale);
	const workspaceLayout = signal(WORKSPACE_LAYOUT_SINGLE);
	const workspacePanes = signal(createDefaultWorkspacePanes());
	const activePaneId = signal(workspacePanes.value[0].id);
	const shotCameras = signal(createDefaultShotCameraDocuments());
	const activeShotCameraId = signal(shotCameras.value[0].id);
	const viewportBaseFovX = signal(DEFAULT_VIEWPORT_CAMERA_BASE_FOVX);
	const viewportBaseFovXDirty = signal(false);
	const viewportProjectionMode = signal(VIEWPORT_PROJECTION_PERSPECTIVE);
	const viewportOrthoView = signal(DEFAULT_VIEWPORT_ORTHO_VIEW);
	const viewportOrthoSize = signal(DEFAULT_VIEWPORT_ORTHO_SIZE);
	const viewportOrthoDistance = signal(DEFAULT_VIEWPORT_ORTHO_DISTANCE);
	const viewportOrthoFocus = signal({ ...DEFAULT_VIEWPORT_ORTHO_FOCUS });
	const interactionMode = signal("navigate");
	const viewportTransformSpace = signal("world");
	const viewportToolMode = signal("none");
	const measurementActive = signal(false);
	const measurementStartPointWorld = signal(null);
	const measurementEndPointWorld = signal(null);
	const measurementDraftEndPointWorld = signal(null);
	const measurementSelectedPointKey = signal(null);
	const measurementLengthInputText = signal("");
	const measurementOverlay = signal({
		contextKind: "viewport",
		start: { visible: false, x: 0, y: 0 },
		end: { visible: false, x: 0, y: 0 },
		draftEnd: { visible: false, x: 0, y: 0 },
		lineVisible: false,
		lineUsesDraft: false,
		chip: { visible: false, x: 0, y: 0, label: "", placement: "above" },
		gizmo: {
			visible: false,
			pointKey: null,
			x: 0,
			y: 0,
			handles: {
				x: { visible: false, x: 0, y: 0 },
				y: { visible: false, x: 0, y: 0 },
				z: { visible: false, x: 0, y: 0 },
			},
		},
	});
	const viewportSelectMode = computed(
		() => viewportToolMode.value === "select",
	);
	const viewportReferenceImageEditMode = computed(
		() => viewportToolMode.value === "reference",
	);
	const viewportPivotEditMode = computed(
		() => viewportToolMode.value === "pivot",
	);
	const viewportTransformMode = computed(
		() => viewportToolMode.value === "transform",
	);
	const viewportSplatEditMode = computed(
		() => viewportToolMode.value === "splat-edit",
	);
	const splatEditTool = signal("box");
	const splatEditScopeAssetIds = signal([]);
	const splatEditRememberedScopeAssetIds = signal([]);
	const splatEditSelectionCount = signal(0);
	const splatEditBrushSize = signal(30);
	const splatEditBrushDepthMode = signal("depth");
	const splatEditBrushDepth = signal(0.2);
	const splatEditBrushDepthBarVisible = signal(false);
	const splatEditBrushPreview = signal({
		visible: false,
		x: 0,
		y: 0,
		radiusPx: 0,
		painting: false,
		subtract: false,
	});
	const splatEditBoxPlaced = signal(false);
	const splatEditBoxCenter = signal({ x: 0, y: 0, z: 0 });
	const splatEditBoxSize = signal({ x: 1, y: 1, z: 1 });
	const splatEditBoxRotation = signal({ x: 0, y: 0, z: 0, w: 1 });
	const splatEditHudPosition = signal({ x: null, y: null });
	const splatEditLastOperation = signal({
		mode: "",
		hitCount: 0,
	});
	const workbenchManualCollapsed = signal(false);
	const workbenchAutoCollapsed = signal(false);
	const workbenchManualExpanded = signal(false);
	const workbenchCollapsed = computed(
		() =>
			workbenchManualCollapsed.value ||
			(workbenchAutoCollapsed.value && !workbenchManualExpanded.value),
	);

	const remoteUrl = signal("");
	const viewportPieMenu = signal({
		open: false,
		x: 0,
		y: 0,
		hoveredActionId: null,
		coarse: false,
		radius: 88,
		innerRadius: 28,
		outerRadius: 126,
	});
	const viewportLensHud = signal({
		visible: false,
		x: 0,
		y: 0,
		mmLabel: "",
		fovLabel: "",
	});
	const viewportRollHud = signal({
		visible: false,
		x: 0,
		y: 0,
		angleLabel: "",
	});
	const sceneBadge = signal(translate(initialLocale, "scene.badgeEmpty"));
	const sceneUnitBadge = signal(SCENE_UNIT_BADGE);
	const sceneSummary = signal(translate(initialLocale, "scene.summaryEmpty"));
	const sceneScaleSummary = signal(
		translate(initialLocale, "scene.scaleDefault"),
	);
	const sceneAssets = signal([]);
	const sceneLighting = signal(createDefaultLightingState());
	const referenceImageDocument = signal(createDefaultReferenceImageDocument());
	const referenceImagePreviewSessionVisible = signal(true);
	const referenceImageExportSessionEnabled = signal(true);
	const referenceImagePanelPresetId = signal("");
	const referenceImagePanelPresetName = signal("");
	const referenceImagePresets = signal([]);
	const referenceImageItems = signal([]);
	const referenceImageAssets = signal([]);
	const referenceImageAssetCount = signal(0);
	const referenceImagePreviewLayers = signal([]);
	const referenceImageSelectedAssetId = signal("");
	const referenceImageSelectedItemId = signal("");
	const referenceImageSelectedItemIds = signal([]);
	const referenceImageSelectionAnchor = signal(null);
	const referenceImageSelectionBoxLogical = signal(null);
	const referenceImageSelectionBoxScreen = signal(null);
	const selectedSceneAssetIds = signal([]);
	const selectedSceneAssetId = signal(null);
	const selectedSceneAsset = computed(
		() =>
			sceneAssets.value.find(
				(asset) => asset.id === selectedSceneAssetId.value,
			) ?? null,
	);
	const cameraSummary = signal("");
	const statusLine = signal(translate(initialLocale, "status.ready"));
	const projectName = signal("");
	const projectDirty = signal(false);
	const projectPackageDirty = signal(true);
	const overlay = signal(null);
	const exportBusy = signal(false);
	const exportStatusKey = signal("export.idle");
	const exportSummary = signal(translate(initialLocale, "exportSummary.empty"));
	const exportTarget = signal("current");
	const exportPresetIds = signal([]);
	const shotCameraNearLive = signal(DEFAULT_CAMERA_NEAR);
	const shotCameraFarLive = signal(DEFAULT_CAMERA_FAR);
	const shotCameraPositionX = signal(0);
	const shotCameraPositionY = signal(0);
	const shotCameraPositionZ = signal(0);
	const shotCameraYawDeg = signal(0);
	const shotCameraPitchDeg = signal(0);
	const shotCameraRollDeg = signal(0);

	const activeWorkspacePane = computed(() =>
		getActiveWorkspacePane(workspacePanes.value, activePaneId.value),
	);
	const activeShotCamera = computed(() =>
		getActiveShotCameraDocument(shotCameras.value, activeShotCameraId.value),
	);
	const frameSelectionActive = signal(false);
	const frameSelectedIds = signal([]);
	const frameSelectionAnchor = signal(null);
	const frameSelectionBoxLogical = signal(null);
	const frameTrajectoryEditMode = signal(false);
	const historyCanUndo = signal(false);
	const historyCanRedo = signal(false);
	const frameDocuments = computed(() => activeShotCamera.value?.frames ?? []);
	const activeFrame = computed(() =>
		getActiveFrameDocument(
			frameDocuments.value,
			activeShotCamera.value?.activeFrameId ?? null,
		),
	);
	const activeFrameId = computed(() => activeFrame.value?.id ?? "");
	const frameCount = computed(() => frameDocuments.value.length);
	const frameMaskSelectedIds = computed(() =>
		resolveFrameMaskSelectedIds(
			activeShotCamera.value?.frames ?? [],
			activeShotCamera.value?.frameMask?.selectedIds ?? [],
		),
	);
	const mode = computed(() => activeWorkspacePane.value.role);
	const baseFovX = computed(
		() =>
			activeShotCamera.value?.lens.baseFovX ?? DEFAULT_SHOT_CAMERA_BASE_FOVX,
	);
	const widthScale = computed(
		() => activeShotCamera.value?.outputFrame.widthScale ?? 1,
	);
	const heightScale = computed(
		() => activeShotCamera.value?.outputFrame.heightScale ?? 1,
	);
	const viewZoom = computed(
		() => activeShotCamera.value?.outputFrame.viewZoom ?? 1,
	);
	const anchor = computed(
		() => activeShotCamera.value?.outputFrame.anchor ?? "center",
	);
	const clippingMode = computed(
		() => activeShotCamera.value?.clipping.mode ?? "auto",
	);
	const manualNear = computed(
		() => activeShotCamera.value?.clipping.near ?? DEFAULT_CAMERA_NEAR,
	);
	const manualFar = computed(
		() => activeShotCamera.value?.clipping.far ?? DEFAULT_CAMERA_FAR,
	);
	const activeNear = computed(() => manualNear.value);
	const activeFar = computed(() =>
		clippingMode.value === "manual" ? manualFar.value : shotCameraFarLive.value,
	);
	const activeExportName = computed(
		() => activeShotCamera.value?.exportSettings?.exportName ?? "",
	);
	const activeExportFormat = computed(
		() => activeShotCamera.value?.exportSettings?.exportFormat ?? "psd",
	);
	const activeExportGridOverlay = computed(() =>
		Boolean(activeShotCamera.value?.exportSettings?.exportGridOverlay),
	);
	const activeExportGridLayerMode = computed(() =>
		activeShotCamera.value?.exportSettings?.exportGridLayerMode === "overlay"
			? "overlay"
			: "bottom",
	);
	const activeExportModelLayers = computed(() =>
		Boolean(activeShotCamera.value?.exportSettings?.exportModelLayers),
	);
	const activeExportSplatLayers = computed(
		() =>
			Boolean(activeShotCamera.value?.exportSettings?.exportModelLayers) &&
			Boolean(activeShotCamera.value?.exportSettings?.exportSplatLayers),
	);
	const activeRollLock = computed(() =>
		Boolean(activeShotCamera.value?.navigation?.rollLock),
	);
	const frameMaskMode = computed(
		() => activeShotCamera.value?.frameMask?.mode ?? "off",
	);
	const frameMaskPreferredMode = computed(() =>
		resolveFrameMaskPreferredMode(
			activeShotCamera.value?.frameMask?.mode,
			activeShotCamera.value?.frameMask?.preferredMode,
		),
	);
	const frameMaskOpacityPct = computed(() =>
		Number.isFinite(activeShotCamera.value?.frameMask?.opacityPct)
			? activeShotCamera.value.frameMask.opacityPct
			: 80,
	);
	const frameMaskShape = computed(
		() => activeShotCamera.value?.frameMask?.shape ?? "bounds",
	);
	const frameTrajectoryMode = computed(
		() => activeShotCamera.value?.frameMask?.trajectoryMode ?? "line",
	);
	const frameTrajectoryExportSource = computed(
		() => activeShotCamera.value?.frameMask?.trajectoryExportSource ?? "none",
	);
	const frameTrajectoryHandlesByFrameId = computed(
		() => activeShotCamera.value?.frameMask?.trajectory?.handlesByFrameId ?? {},
	);
	const exportWidth = computed(() =>
		Math.max(64, Math.round(BASE_RENDER_BOX.width * widthScale.value)),
	);
	const exportHeight = computed(() =>
		Math.max(64, Math.round(BASE_RENDER_BOX.height * heightScale.value)),
	);
	const exportSizeLabel = computed(
		() => `${exportWidth.value} × ${exportHeight.value}`,
	);
	const lightingAmbient = computed(() => sceneLighting.value.ambient);
	const modelLightEnabled = computed(
		() => sceneLighting.value.modelLight.enabled,
	);
	const modelLightIntensity = computed(
		() => sceneLighting.value.modelLight.intensity,
	);
	const modelLightAzimuthDeg = computed(
		() => sceneLighting.value.modelLight.azimuthDeg,
	);
	const modelLightElevationDeg = computed(
		() => sceneLighting.value.modelLight.elevationDeg,
	);
	const exportPresetCount = computed(() => exportPresetIds.value.length);
	const modeLabel = computed(() =>
		translate(
			locale.value,
			getWorkspaceModeLabelKey(activeWorkspacePane.value),
		),
	);
	const exportStatusLabel = computed(() =>
		translate(locale.value, exportStatusKey.value),
	);
	const fovLabel = computed(
		() =>
			`${formatNumber(getStandardFrameHorizontalFovDegrees(baseFovX.value), 1)}°`,
	);
	const equivalentMmValue = computed(() =>
		Number(getStandardFrameHorizontalEquivalentMm(baseFovX.value).toFixed(2)),
	);
	const viewportFovLabel = computed(
		() =>
			`${formatNumber(getStandardFrameHorizontalFovDegrees(viewportBaseFovX.value), 1)}°`,
	);
	const viewportEquivalentMmValue = computed(() =>
		Number(
			getStandardFrameHorizontalEquivalentMm(viewportBaseFovX.value).toFixed(2),
		),
	);
	const widthLabel = computed(
		() => `${formatNumber(widthScale.value * 100, 0)}%`,
	);
	const heightLabel = computed(
		() => `${formatNumber(heightScale.value * 100, 0)}%`,
	);
	const zoomLabel = computed(() => `${formatNumber(viewZoom.value * 100, 0)}%`);

	return {
		runtime: runtimeInfo,
		locale,
		workspace: {
			layout: workspaceLayout,
			panes: workspacePanes,
			activePaneId,
			shotCameras,
			activeShotCameraId,
			activeShotCamera,
		},
		workbenchCollapsed,
		workbenchManualCollapsed,
		workbenchAutoCollapsed,
		workbenchManualExpanded,
		viewportPieMenu,
		viewportLensHud,
		viewportRollHud,
		interactionMode,
		viewportBaseFovX,
		viewportBaseFovXDirty,
		viewportProjectionMode,
		viewportOrthoView,
		viewportOrthoSize,
		viewportOrthoDistance,
		viewportOrthoFocus,
		viewportToolMode,
		viewportTransformSpace,
		viewportSelectMode,
		viewportReferenceImageEditMode,
		viewportPivotEditMode,
		viewportTransformMode,
		viewportSplatEditMode,
		splatEdit: {
			active: viewportSplatEditMode,
			tool: splatEditTool,
			scopeAssetIds: splatEditScopeAssetIds,
			rememberedScopeAssetIds: splatEditRememberedScopeAssetIds,
			selectionCount: splatEditSelectionCount,
			brushSize: splatEditBrushSize,
			brushDepthMode: splatEditBrushDepthMode,
			brushDepth: splatEditBrushDepth,
			brushDepthBarVisible: splatEditBrushDepthBarVisible,
			brushPreview: splatEditBrushPreview,
			boxPlaced: splatEditBoxPlaced,
			boxCenter: splatEditBoxCenter,
			boxSize: splatEditBoxSize,
			boxRotation: splatEditBoxRotation,
			hudPosition: splatEditHudPosition,
			lastOperation: splatEditLastOperation,
		},
		measurement: {
			active: measurementActive,
			startPointWorld: measurementStartPointWorld,
			endPointWorld: measurementEndPointWorld,
			draftEndPointWorld: measurementDraftEndPointWorld,
			selectedPointKey: measurementSelectedPointKey,
			lengthInputText: measurementLengthInputText,
			overlay: measurementOverlay,
		},
		mode,
		baseFovX,
		renderBox: {
			widthScale,
			heightScale,
			viewZoom,
			anchor,
		},
		shotCamera: {
			clippingMode,
			near: activeNear,
			far: activeFar,
			nearLive: shotCameraNearLive,
			farLive: shotCameraFarLive,
			positionX: shotCameraPositionX,
			positionY: shotCameraPositionY,
			positionZ: shotCameraPositionZ,
			yawDeg: shotCameraYawDeg,
			pitchDeg: shotCameraPitchDeg,
			rollDeg: shotCameraRollDeg,
			rollLock: activeRollLock,
			exportName: activeExportName,
			exportFormat: activeExportFormat,
			exportGridOverlay: activeExportGridOverlay,
			exportGridLayerMode: activeExportGridLayerMode,
			exportModelLayers: activeExportModelLayers,
			exportSplatLayers: activeExportSplatLayers,
		},
		frames: {
			documents: frameDocuments,
			active: activeFrame,
			activeId: activeFrameId,
			count: frameCount,
			selectionActive: frameSelectionActive,
			selectedIds: frameSelectedIds,
			selectionAnchor: frameSelectionAnchor,
			selectionBoxLogical: frameSelectionBoxLogical,
			trajectoryEditMode: frameTrajectoryEditMode,
			maskSelectedIds: frameMaskSelectedIds,
			maskMode: frameMaskMode,
			maskPreferredMode: frameMaskPreferredMode,
			maskOpacityPct: frameMaskOpacityPct,
			maskShape: frameMaskShape,
			trajectoryMode: frameTrajectoryMode,
			trajectoryExportSource: frameTrajectoryExportSource,
			trajectoryHandlesByFrameId: frameTrajectoryHandlesByFrameId,
		},
		history: {
			canUndo: historyCanUndo,
			canRedo: historyCanRedo,
		},
		remoteUrl,
		sceneBadge,
		sceneUnitBadge,
		sceneSummary,
		sceneScaleSummary,
		sceneAssets,
		lighting: {
			state: sceneLighting,
			ambient: lightingAmbient,
			modelLightEnabled,
			modelLightIntensity,
			modelLightAzimuthDeg,
			modelLightElevationDeg,
		},
		referenceImages: {
			document: referenceImageDocument,
			previewSessionVisible: referenceImagePreviewSessionVisible,
			exportSessionEnabled: referenceImageExportSessionEnabled,
			panelPresetId: referenceImagePanelPresetId,
			panelPresetName: referenceImagePanelPresetName,
			presets: referenceImagePresets,
			items: referenceImageItems,
			assets: referenceImageAssets,
			assetCount: referenceImageAssetCount,
			previewLayers: referenceImagePreviewLayers,
			selectedAssetId: referenceImageSelectedAssetId,
			selectedItemId: referenceImageSelectedItemId,
			selectedItemIds: referenceImageSelectedItemIds,
			selectionAnchor: referenceImageSelectionAnchor,
			selectionBoxLogical: referenceImageSelectionBoxLogical,
			selectionBoxScreen: referenceImageSelectionBoxScreen,
		},
		selectedSceneAssetIds,
		selectedSceneAssetId,
		selectedSceneAsset,
		cameraSummary,
		statusLine,
		project: {
			name: projectName,
			dirty: projectDirty,
			packageDirty: projectPackageDirty,
		},
		overlay,
		exportBusy,
		exportStatusKey,
		exportStatusLabel,
		exportSummary,
		exportOptions: {
			target: exportTarget,
			presetIds: exportPresetIds,
			presetCount: exportPresetCount,
		},
		exportWidth,
		exportHeight,
		exportSizeLabel,
		modeLabel,
		fovLabel,
		equivalentMmValue,
		viewportFovLabel,
		viewportEquivalentMmValue,
		widthLabel,
		heightLabel,
		zoomLabel,
	};
}
