import { computed, signal } from "@preact/signals";
import {
	BASE_RENDER_BOX,
	DEFAULT_CAMERA_FAR,
	DEFAULT_CAMERA_NEAR,
	SCENE_UNIT_BADGE,
} from "./constants.js";
import {
	getStandardFrameEquivalentMm,
	getStandardFrameHorizontalFovDegrees,
} from "./engine/camera-lens.js";
import { resolveInitialLocale, translate } from "./i18n.js";
import {
	WORKSPACE_LAYOUT_SINGLE,
	createDefaultShotCameraDocuments,
	createDefaultWorkspacePanes,
	getActiveFrameDocument,
	getActiveShotCameraDocument,
	getActiveWorkspacePane,
	getWorkspaceModeLabelKey,
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
	const viewportBaseFovX = signal(60);
	const viewportTransformSpace = signal("world");
	const viewportSelectMode = signal(false);
	const viewportPivotEditMode = signal(false);
	const workbenchManualCollapsed = signal(false);
	const workbenchAutoCollapsed = signal(false);
	const workbenchManualExpanded = signal(false);
	const workbenchCollapsed = computed(
		() =>
			workbenchManualCollapsed.value ||
			(workbenchAutoCollapsed.value && !workbenchManualExpanded.value),
	);

	const remoteUrl = signal("");
	const sceneBadge = signal(translate(initialLocale, "scene.badgeEmpty"));
	const sceneUnitBadge = signal(SCENE_UNIT_BADGE);
	const sceneSummary = signal(translate(initialLocale, "scene.summaryEmpty"));
	const sceneScaleSummary = signal(
		translate(initialLocale, "scene.scaleDefault"),
	);
	const sceneAssets = signal([]);
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
	const overlay = signal(null);
	const exportBusy = signal(false);
	const exportStatusKey = signal("export.idle");
	const exportSummary = signal(translate(initialLocale, "exportSummary.empty"));
	const exportTarget = signal("current");
	const exportPresetIds = signal([]);
	const shotCameraNearLive = signal(DEFAULT_CAMERA_NEAR);
	const shotCameraFarLive = signal(DEFAULT_CAMERA_FAR);

	const activeWorkspacePane = computed(() =>
		getActiveWorkspacePane(workspacePanes.value, activePaneId.value),
	);
	const activeShotCamera = computed(() =>
		getActiveShotCameraDocument(shotCameras.value, activeShotCameraId.value),
	);
	const frameSelectionActive = signal(false);
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
	const mode = computed(() => activeWorkspacePane.value.role);
	const baseFovX = computed(() => activeShotCamera.value?.lens.baseFovX ?? 60);
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
	const exportWidth = computed(() =>
		Math.max(64, Math.round(BASE_RENDER_BOX.width * widthScale.value)),
	);
	const exportHeight = computed(() =>
		Math.max(64, Math.round(BASE_RENDER_BOX.height * heightScale.value)),
	);
	const exportSizeLabel = computed(
		() => `${exportWidth.value} × ${exportHeight.value}`,
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
		Math.round(getStandardFrameEquivalentMm(baseFovX.value)),
	);
	const equivalentMmLabel = computed(
		() => `${formatNumber(getStandardFrameEquivalentMm(baseFovX.value), 1)}mm`,
	);
	const viewportFovLabel = computed(
		() =>
			`${formatNumber(getStandardFrameHorizontalFovDegrees(viewportBaseFovX.value), 1)}°`,
	);
	const viewportEquivalentMmValue = computed(() =>
		Math.round(getStandardFrameEquivalentMm(viewportBaseFovX.value)),
	);
	const viewportEquivalentMmLabel = computed(
		() =>
			`${formatNumber(getStandardFrameEquivalentMm(viewportBaseFovX.value), 1)}mm`,
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
		viewportBaseFovX,
		viewportTransformSpace,
		viewportSelectMode,
		viewportPivotEditMode,
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
		selectedSceneAssetIds,
		selectedSceneAssetId,
		selectedSceneAsset,
		cameraSummary,
		statusLine,
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
		equivalentMmLabel,
		viewportFovLabel,
		viewportEquivalentMmValue,
		viewportEquivalentMmLabel,
		widthLabel,
		heightLabel,
		zoomLabel,
	};
}
