import { computed, signal } from "@preact/signals";
import {
	BASE_RENDER_BOX,
	DEFAULT_CAMERA_FAR,
	DEFAULT_CAMERA_NEAR,
	SCENE_UNIT_BADGE,
} from "./constants.js";
import { DEFAULT_LOCALE, translate } from "./i18n.js";
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

export function createCameraFramesStore() {
	const locale = signal(DEFAULT_LOCALE);
	const workspaceLayout = signal(WORKSPACE_LAYOUT_SINGLE);
	const workspacePanes = signal(createDefaultWorkspacePanes());
	const activePaneId = signal(workspacePanes.value[0].id);
	const shotCameras = signal(createDefaultShotCameraDocuments());
	const activeShotCameraId = signal(shotCameras.value[0].id);

	const remoteUrl = signal("");
	const sceneBadge = signal(translate(DEFAULT_LOCALE, "scene.badgeEmpty"));
	const sceneUnitBadge = signal(SCENE_UNIT_BADGE);
	const sceneSummary = signal(translate(DEFAULT_LOCALE, "scene.summaryEmpty"));
	const sceneScaleSummary = signal(
		translate(DEFAULT_LOCALE, "scene.scaleDefault"),
	);
	const sceneAssets = signal([]);
	const cameraSummary = signal("");
	const statusLine = signal(translate(DEFAULT_LOCALE, "status.ready"));
	const exportBusy = signal(false);
	const exportStatusKey = signal("export.idle");
	const exportSummary = signal(
		translate(DEFAULT_LOCALE, "exportSummary.empty"),
	);
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
	const fovLabel = computed(() => `${formatNumber(baseFovX.value, 0)}°`);
	const widthLabel = computed(
		() => `${formatNumber(widthScale.value * 100, 0)}%`,
	);
	const heightLabel = computed(
		() => `${formatNumber(heightScale.value * 100, 0)}%`,
	);
	const zoomLabel = computed(() => `${formatNumber(viewZoom.value * 100, 0)}%`);

	return {
		locale,
		workspace: {
			layout: workspaceLayout,
			panes: workspacePanes,
			activePaneId,
			shotCameras,
			activeShotCameraId,
			activeShotCamera,
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
			exportName: activeExportName,
		},
		frames: {
			documents: frameDocuments,
			active: activeFrame,
			activeId: activeFrameId,
			count: frameCount,
			selectionActive: frameSelectionActive,
		},
		remoteUrl,
		sceneBadge,
		sceneUnitBadge,
		sceneSummary,
		sceneScaleSummary,
		sceneAssets,
		cameraSummary,
		statusLine,
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
		widthLabel,
		heightLabel,
		zoomLabel,
	};
}
