import * as THREE from "three";
import { frustumSpanToFovDegrees } from "../engine/projection.js";
import {
	buildAssetCountBadge,
	buildSceneScaleSummary,
	buildSceneSummary,
	getAssetKindLabelKey,
	getAssetUnitModeLabelKey,
} from "../engine/scene-units.js";

export function createUiSyncController({
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
	isZoomToolActive,
	updateOutputFrameOverlay,
	getSceneAssetCounts,
	getSceneBounds,
	getTotalLoadedItems,
	getActiveShotCamera,
	getActiveCamera,
	getProjectionState,
	getActiveShotCameraDocument,
}) {
	function formatNumber(value, digits = 2) {
		return Number(value).toFixed(digits);
	}

	function resetLocalizedCaches() {
		state.lastCameraSummary = "";
		state.lastSceneSummary = "";
		state.lastSceneScaleSummary = "";
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

	function updateDropHint() {
		dropHint.classList.toggle("is-hidden", getTotalLoadedItems() > 0);
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

	return {
		resetLocalizedCaches,
		updateDropHint,
		updateSceneSummary,
		updateCameraSummary,
		updateUi,
	};
}
