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
		const kindOrderByAssetKind = new Map();
		const rows = sceneState.assets.map((asset, index, assets) => {
			const kindOrderIndex = (kindOrderByAssetKind.get(asset.kind) ?? 0) + 1;
			kindOrderByAssetKind.set(asset.kind, kindOrderIndex);
			return {
				id: asset.id,
				kind: asset.kind,
				label: asset.label,
				kindLabelKey: getAssetKindLabelKey(asset.kind),
				unitModeLabelKey: getAssetUnitModeLabelKey(asset.unitMode),
				worldScale: asset.worldScale,
				visible: asset.object.visible !== false,
				orderIndex: index + 1,
				kindOrderIndex,
				canMoveUp: index > 0,
				canMoveDown: index < assets.length - 1,
				exportRole: asset.exportRole ?? "beauty",
				maskGroup: asset.maskGroup ?? "",
				hasWorkingPivot: Boolean(asset.workingPivotLocal),
				position: {
					x: asset.object.position.x,
					y: asset.object.position.y,
					z: asset.object.position.z,
				},
				rotationDegrees: {
					x: THREE.MathUtils.radToDeg(asset.object.rotation.x),
					y: THREE.MathUtils.radToDeg(asset.object.rotation.y),
					z: THREE.MathUtils.radToDeg(asset.object.rotation.z),
				},
			};
		});
		store.sceneAssets.value = rows;
		if (rows.length === 0) {
			store.selectedSceneAssetId.value = null;
			return;
		}
		const hasSelection = rows.some(
			(asset) => asset.id === store.selectedSceneAssetId.value,
		);
		if (!hasSelection) {
			store.selectedSceneAssetId.value = rows[0].id;
		}
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
		updateOutputFrameOverlay();
		updateSceneSummary();
		updateCameraSummary();
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
