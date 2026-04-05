import {
	moveSceneAssetBlockWithinKind,
	moveSceneAssetWithinKind,
} from "../../engine/scene-asset-order.js";

export function createSceneAssetSelectionOrderController({
	sceneState,
	store,
	updateUi,
	onSelectionChanged = null,
	setStatus,
	t,
	runHistoryAction = (_label, applyChange) => {
		applyChange?.();
		return false;
	},
	getSceneAsset,
	getSelectionAnchorId,
	setSelectionAnchorId,
}) {
	function getSelectedSceneAssets() {
		return store.selectedSceneAssetIds.value
			.map((assetId) => getSceneAsset(assetId))
			.filter(Boolean);
	}

	function selectSceneAsset(
		assetId,
		{ additive = false, toggle = false, range = false, orderedIds = null } = {},
	) {
		const asset = getSceneAsset(assetId);
		if (!asset) {
			return;
		}

		const currentSelectedIds = store.selectedSceneAssetIds.value.filter((id) =>
			Boolean(getSceneAsset(id)),
		);
		const alreadySelected = currentSelectedIds.includes(asset.id);
		let nextSelectedIds = [asset.id];
		let nextSelectedId = asset.id;
		const resolvedOrderedIds = (
			Array.isArray(orderedIds) && orderedIds.length > 0
				? orderedIds
				: sceneState.assets.map((entry) => entry.id)
		).filter((id, index, sourceIds) => {
			return Boolean(getSceneAsset(id)) && sourceIds.indexOf(id) === index;
		});

		if (range) {
			const anchorId =
				getSelectionAnchorId?.() ??
				store.selectedSceneAssetId.value ??
				currentSelectedIds.at(-1) ??
				asset.id;
			const anchorIndex = resolvedOrderedIds.indexOf(anchorId);
			const targetIndex = resolvedOrderedIds.indexOf(asset.id);
			if (anchorIndex === -1 || targetIndex === -1) {
				setSelectionAnchorId?.(asset.id);
				store.selectedSceneAssetIds.value = [asset.id];
				store.selectedSceneAssetId.value = asset.id;
				onSelectionChanged?.({
					selectedAssetIds: [...store.selectedSceneAssetIds.value],
					activeAssetId: store.selectedSceneAssetId.value,
				});
				updateUi();
				return;
			}

			const rangeStart = Math.min(anchorIndex, targetIndex);
			const rangeEnd = Math.max(anchorIndex, targetIndex);
			const rangeIds = resolvedOrderedIds.slice(rangeStart, rangeEnd + 1);
			const currentSelectedIdSet = new Set(currentSelectedIds);
			const removeRange = currentSelectedIdSet.has(asset.id);
			if (removeRange) {
				nextSelectedIds = currentSelectedIds.filter(
					(id) => !rangeIds.includes(id),
				);
				nextSelectedId = nextSelectedIds.includes(
					store.selectedSceneAssetId.value,
				)
					? store.selectedSceneAssetId.value
					: (nextSelectedIds.at(-1) ?? null);
			} else {
				nextSelectedIds = [...currentSelectedIds];
				for (const rangeId of rangeIds) {
					if (!nextSelectedIds.includes(rangeId)) {
						nextSelectedIds.push(rangeId);
					}
				}
				nextSelectedId = asset.id;
			}

			store.selectedSceneAssetIds.value = [...new Set(nextSelectedIds)];
			store.selectedSceneAssetId.value = nextSelectedId;
			onSelectionChanged?.({
				selectedAssetIds: [...store.selectedSceneAssetIds.value],
				activeAssetId: store.selectedSceneAssetId.value,
			});
			updateUi();
			return;
		}

		if (additive || toggle) {
			if (alreadySelected) {
				nextSelectedIds = currentSelectedIds.filter((id) => id !== asset.id);
				nextSelectedId =
					store.selectedSceneAssetId.value === asset.id
						? (nextSelectedIds.at(-1) ?? null)
						: (store.selectedSceneAssetId.value ??
							nextSelectedIds.at(-1) ??
							null);
			} else {
				nextSelectedIds = [...currentSelectedIds, asset.id];
				nextSelectedId = asset.id;
			}
		} else if (alreadySelected && currentSelectedIds.length === 1) {
			nextSelectedIds = [];
			nextSelectedId = null;
		} else if (alreadySelected && currentSelectedIds.length > 1) {
			nextSelectedIds = [asset.id];
			nextSelectedId = asset.id;
		}

		setSelectionAnchorId?.(nextSelectedId ?? asset.id);
		store.selectedSceneAssetIds.value = [...new Set(nextSelectedIds)];
		store.selectedSceneAssetId.value = nextSelectedId;
		onSelectionChanged?.({
			selectedAssetIds: [...store.selectedSceneAssetIds.value],
			activeAssetId: store.selectedSceneAssetId.value,
		});
		updateUi();
	}

	function clearSceneAssetSelection() {
		setSelectionAnchorId?.(null);
		store.selectedSceneAssetIds.value = [];
		store.selectedSceneAssetId.value = null;
		onSelectionChanged?.({
			selectedAssetIds: [],
			activeAssetId: null,
		});
		updateUi();
	}

	function moveAsset(assetId, direction) {
		const asset = getSceneAsset(assetId);
		if (!asset) {
			return;
		}

		const kindAssets = sceneState.assets.filter(
			(candidate) => candidate.kind === asset.kind,
		);
		const currentKindIndex = kindAssets.findIndex(
			(candidate) => candidate.id === asset.id,
		);
		if (currentKindIndex === -1) {
			return;
		}

		const targetKindIndex = Math.max(
			0,
			Math.min(kindAssets.length - 1, currentKindIndex + direction),
		);
		if (targetKindIndex === currentKindIndex) {
			return;
		}

		runHistoryAction?.("asset.order", () => {
			sceneState.assets = moveSceneAssetWithinKind(
				sceneState.assets,
				assetId,
				targetKindIndex,
			);
		});
		updateUi();
		setStatus(
			t("status.assetOrderUpdated", {
				name: asset.label,
				index: targetKindIndex + 1,
			}),
		);
	}

	function moveAssetUp(assetId) {
		moveAsset(assetId, -1);
	}

	function moveAssetDown(assetId) {
		moveAsset(assetId, 1);
	}

	function moveAssetToIndex(assetId, nextIndex) {
		const asset = getSceneAsset(assetId);
		if (!asset) {
			return;
		}

		const kindAssets = sceneState.assets.filter(
			(candidate) => candidate.kind === asset.kind,
		);
		const currentKindIndex = kindAssets.findIndex(
			(candidate) => candidate.id === asset.id,
		);
		if (currentKindIndex === -1) {
			return;
		}

		const targetKindIndex = Math.max(
			0,
			Math.min(kindAssets.length - 1, Number(nextIndex) || 0),
		);
		const selectedKindAssetIds = kindAssets
			.filter((candidate) =>
				store.selectedSceneAssetIds.value.includes(candidate.id),
			)
			.map((candidate) => candidate.id);
		const movedAssetIds = selectedKindAssetIds.includes(asset.id)
			? selectedKindAssetIds
			: [asset.id];
		const draggedSelectionIndex = movedAssetIds.indexOf(asset.id);
		const remainingKindCount = kindAssets.length - movedAssetIds.length;
		const targetInsertionIndex =
			movedAssetIds.length > 1
				? Math.max(
						0,
						Math.min(
							remainingKindCount,
							targetKindIndex - Math.max(0, draggedSelectionIndex),
						),
					)
				: targetKindIndex;
		const nextSceneAssets =
			movedAssetIds.length > 1
				? moveSceneAssetBlockWithinKind(
						sceneState.assets,
						movedAssetIds,
						targetInsertionIndex,
					)
				: moveSceneAssetWithinKind(
						sceneState.assets,
						asset.id,
						targetKindIndex,
					);
		if (nextSceneAssets === sceneState.assets) {
			return;
		}

		runHistoryAction?.("asset.order", () => {
			sceneState.assets = nextSceneAssets;
		});
		const reorderedKindAssets = sceneState.assets.filter(
			(candidate) => candidate.kind === asset.kind,
		);
		const nextKindIndex = reorderedKindAssets.findIndex(
			(candidate) => candidate.id === asset.id,
		);
		updateUi();
		setStatus(
			t("status.assetOrderUpdated", {
				name: asset.label,
				index: nextKindIndex + 1,
			}),
		);
	}

	return {
		getSelectedSceneAssets,
		selectSceneAsset,
		clearSceneAssetSelection,
		moveAssetUp,
		moveAssetDown,
		moveAssetToIndex,
	};
}
