import { sanitizeProjectAssetLabel } from "../../project-document.js";

const EMPTY_MASK_GROUP_LABEL = "—";

export function createSceneAssetDocumentMutationsController({
	sceneState,
	store,
	getSceneAsset,
	getSelectedSceneAssets,
	runHistoryAction = (_label, applyChange) => {
		applyChange?.();
		return false;
	},
	detachSceneAsset,
	setSelectionAnchorId = () => {},
	resetLocalizedCaches = () => {},
	updateCameraSummary = () => {},
	updateUi = () => {},
	setStatus = () => {},
	t = (key) => key,
}) {
	function setAssetVisibility(assetId, nextVisible) {
		const asset = getSceneAsset(assetId);
		if (!asset) {
			return;
		}

		runHistoryAction?.("asset.visibility", () => {
			asset.object.visible = Boolean(nextVisible);
		});
		updateUi();
		setStatus(
			t("status.assetVisibilityUpdated", {
				name: asset.label,
				visibility: asset.object.visible
					? t("assetVisibility.visible")
					: t("assetVisibility.hidden"),
			}),
		);
	}

	function setAssetLabel(assetId, nextLabel) {
		const asset = getSceneAsset(assetId);
		if (!asset) {
			return;
		}

		const sanitizedLabel = sanitizeProjectAssetLabel(nextLabel, asset.label);
		if (sanitizedLabel === asset.label) {
			updateUi();
			return;
		}

		runHistoryAction?.("asset.label", () => {
			asset.label = sanitizedLabel;
			asset.object.name = sanitizedLabel;
		});
		updateUi();
	}

	function deleteSelectedSceneAssets(assetIds = null) {
		const nextDeletedIds = Array.isArray(assetIds)
			? assetIds
			: store.selectedSceneAssetIds.value;
		const deletedIdSet = new Set(
			nextDeletedIds
				.map((assetId) => Number(assetId))
				.filter(
					(assetId) => Number.isFinite(assetId) && getSceneAsset(assetId),
				),
		);
		if (deletedIdSet.size === 0) {
			return false;
		}

		const deletedAssets = sceneState.assets.filter((asset) =>
			deletedIdSet.has(asset.id),
		);
		if (deletedAssets.length === 0) {
			return false;
		}

		const activeAssetId =
			store.selectedSceneAssetId.value ?? deletedAssets[0]?.id ?? null;
		const activeAssetIndex = sceneState.assets.findIndex(
			(asset) => asset.id === activeAssetId,
		);
		const survivingAssets = sceneState.assets.filter(
			(asset) => !deletedIdSet.has(asset.id),
		);
		const nextSelectedAsset =
			survivingAssets[
				Math.max(0, Math.min(activeAssetIndex, survivingAssets.length - 1))
			] ?? null;
		const nextSelectedAssetId = nextSelectedAsset?.id ?? null;

		runHistoryAction?.("asset.delete", () => {
			sceneState.assets = survivingAssets;
			for (const asset of deletedAssets) {
				detachSceneAsset(asset);
			}
			setSelectionAnchorId(nextSelectedAssetId);
			store.selectedSceneAssetIds.value = nextSelectedAssetId
				? [nextSelectedAssetId]
				: [];
			store.selectedSceneAssetId.value = nextSelectedAssetId;
		});

		resetLocalizedCaches();
		updateCameraSummary();
		updateUi();
		setStatus(
			deletedAssets.length === 1
				? t("status.deletedSceneAsset", {
						name: deletedAssets[0].label,
					})
				: t("status.deletedSceneAssets", {
						count: deletedAssets.length,
					}),
		);
		return true;
	}

	function setSelectedSceneAssetsVisibility(nextVisible) {
		const selectedAssets = getSelectedSceneAssets();
		if (selectedAssets.length === 0) {
			return;
		}

		runHistoryAction?.("asset.visibility", () => {
			for (const asset of selectedAssets) {
				asset.object.visible = Boolean(nextVisible);
			}
		});
		updateUi();
	}

	function setAssetExportRole(assetId, nextRole) {
		const asset = getSceneAsset(assetId);
		if (!asset) {
			return;
		}

		runHistoryAction?.("asset.export-role", () => {
			asset.exportRole = nextRole === "omit" ? "omit" : "beauty";
		});
		updateUi();
		setStatus(
			t("status.assetExportRoleUpdated", {
				name: asset.label,
				role: t(`exportRole.${asset.exportRole}`),
			}),
		);
	}

	function setAssetMaskGroup(assetId, nextValue) {
		const asset = getSceneAsset(assetId);
		if (!asset) {
			return;
		}

		runHistoryAction?.("asset.mask-group", () => {
			asset.maskGroup = String(nextValue ?? "").trim();
		});
		updateUi();
		setStatus(
			t("status.assetMaskGroupUpdated", {
				name: asset.label,
				group: asset.maskGroup || EMPTY_MASK_GROUP_LABEL,
			}),
		);
	}

	return {
		setAssetVisibility,
		setAssetLabel,
		deleteSelectedSceneAssets,
		setSelectedSceneAssetsVisibility,
		setAssetExportRole,
		setAssetMaskGroup,
	};
}
