import { selectAllSplatsForAssets } from "./actions.js";

export function createSplatEditContentMutations({
	store,
	t,
	setStatus,
	updateUi,
	getAssetController,
	buildSelectedSplatOperations,
	createDerivedPackedSplatSource,
	buildDerivedSplatFileName,
	buildUniqueSplitLabel,
	buildUniqueDuplicateLabel,
	markSplatAssetsForHistorySourceCapture,
	runSplatSourceHistoryTransaction,
	invalidateBrushSpatialIndex,
	selectedSplatsByAssetId,
	syncSelectionCount,
	syncSelectionHighlight,
	syncSceneHelper,
	syncScopeToSceneSelection,
}) {
	async function deleteSelectedSplats() {
		const operations = buildSelectedSplatOperations();
		if (operations.length === 0) {
			setStatus?.(t("status.splatEditSelectionMissing"));
			return false;
		}
		const assetController = getAssetController?.();
		if (!assetController) {
			return false;
		}
		return runSplatSourceHistoryTransaction(
			"splat-edit.delete",
			operations.map((operation) => operation.asset),
			async (historyCaptureAssets) => {
				let deletedCount = 0;
				for (const operation of operations) {
					invalidateBrushSpatialIndex(operation.assetIdKey);
					if (operation.remainingIndices.length > 0) {
						const remainderSource = createDerivedPackedSplatSource(
							operation.asset,
							operation.remainingIndices,
							{
								label: operation.asset.label,
								fileName:
									operation.asset?.source?.fileName ??
									buildDerivedSplatFileName(operation.asset, "remainder"),
							},
						);
						if (remainderSource) {
							const replacementAsset =
								await assetController.replaceSplatAssetFromSource?.(
									operation.asset.id,
									remainderSource,
								);
							markSplatAssetsForHistorySourceCapture(
								[replacementAsset],
								historyCaptureAssets,
							);
						}
					} else {
						assetController.removeSceneAssets?.([operation.asset.id]);
					}
					selectedSplatsByAssetId.delete(operation.assetIdKey);
					deletedCount += operation.selectedIndices.length;
				}
				store.splatEdit.lastOperation.value = {
					mode: "delete",
					hitCount: deletedCount,
				};
				syncSelectionCount();
				syncSelectionHighlight();
				syncScopeToSceneSelection();
				syncSceneHelper();
				updateUi?.();
				setStatus?.(t("status.splatEditDeleted", { count: deletedCount }));
				return deletedCount;
			},
		);
	}

	async function separateSelectedSplats() {
		const operations = buildSelectedSplatOperations();
		if (operations.length === 0) {
			setStatus?.(t("status.splatEditSelectionMissing"));
			return false;
		}
		const assetController = getAssetController?.();
		if (!assetController) {
			return false;
		}
		return runSplatSourceHistoryTransaction(
			"splat-edit.separate",
			operations.map((operation) => operation.asset),
			async (historyCaptureAssets) => {
				const createdAssets = [];
				let separatedCount = 0;
				for (const operation of operations) {
					invalidateBrushSpatialIndex(operation.assetIdKey);
					const currentAssets = assetController.getSceneAssets?.() ?? [];
					const sourceIndex = currentAssets.findIndex(
						(asset) => String(asset.id) === String(operation.asset.id),
					);
					const splitLabel = buildUniqueSplitLabel(operation.asset.label);
					const selectedSource = createDerivedPackedSplatSource(
						operation.asset,
						operation.selectedIndices,
						{
							label: splitLabel,
							fileName: buildDerivedSplatFileName(operation.asset, "split"),
						},
					);
					const createdAsset = selectedSource
						? await assetController.createSplatAssetFromSource?.(
								selectedSource,
								{
									insertIndex: sourceIndex >= 0 ? sourceIndex + 1 : null,
								},
							)
						: null;
					if (createdAsset) {
						createdAssets.push(createdAsset);
						markSplatAssetsForHistorySourceCapture(
							[createdAsset],
							historyCaptureAssets,
						);
					}
					if (operation.remainingIndices.length > 0) {
						const remainderSource = createDerivedPackedSplatSource(
							operation.asset,
							operation.remainingIndices,
							{
								label: operation.asset.label,
								fileName:
									operation.asset?.source?.fileName ??
									buildDerivedSplatFileName(operation.asset, "remainder"),
							},
						);
						if (remainderSource) {
							const replacementAsset =
								await assetController.replaceSplatAssetFromSource?.(
									operation.asset.id,
									remainderSource,
								);
							markSplatAssetsForHistorySourceCapture(
								[replacementAsset],
								historyCaptureAssets,
							);
						}
					} else {
						assetController.removeSceneAssets?.([operation.asset.id]);
					}
					selectedSplatsByAssetId.delete(operation.assetIdKey);
					separatedCount += operation.selectedIndices.length;
				}
				if (createdAssets.length > 0) {
					assetController.clearSceneAssetSelection?.();
					const [firstAsset, ...restAssets] = createdAssets;
					assetController.selectSceneAsset?.(firstAsset.id);
					for (const asset of restAssets) {
						assetController.selectSceneAsset?.(asset.id, { additive: true });
					}
				}
				store.splatEdit.lastOperation.value = {
					mode: "separate",
					hitCount: separatedCount,
				};
				syncScopeToSceneSelection();
				selectAllSplatsForAssets(createdAssets, selectedSplatsByAssetId);
				syncSelectionCount();
				syncSelectionHighlight();
				syncSceneHelper();
				updateUi?.();
				setStatus?.(
					t("status.splatEditSeparated", {
						count: separatedCount,
						assets: createdAssets.length,
					}),
				);
				return createdAssets.length;
			},
		);
	}

	async function duplicateSelectedSplats() {
		const operations = buildSelectedSplatOperations();
		if (operations.length === 0) {
			setStatus?.(t("status.splatEditSelectionMissing"));
			return false;
		}
		const assetController = getAssetController?.();
		if (!assetController) {
			return false;
		}
		return runSplatSourceHistoryTransaction(
			"splat-edit.duplicate",
			[],
			async (historyCaptureAssets) => {
				const createdAssets = [];
				let duplicatedCount = 0;
				for (const operation of operations) {
					const currentAssets = assetController.getSceneAssets?.() ?? [];
					const sourceIndex = currentAssets.findIndex(
						(asset) => String(asset.id) === String(operation.asset.id),
					);
					const duplicateLabel = buildUniqueDuplicateLabel(
						operation.asset.label,
					);
					const selectedSource = createDerivedPackedSplatSource(
						operation.asset,
						operation.selectedIndices,
						{
							label: duplicateLabel,
							fileName: buildDerivedSplatFileName(operation.asset, "copy"),
						},
					);
					const createdAsset = selectedSource
						? await assetController.createSplatAssetFromSource?.(
								selectedSource,
								{
									insertIndex: sourceIndex >= 0 ? sourceIndex + 1 : null,
								},
							)
						: null;
					if (createdAsset) {
						createdAssets.push(createdAsset);
						markSplatAssetsForHistorySourceCapture(
							[createdAsset],
							historyCaptureAssets,
						);
					}
					duplicatedCount += operation.selectedIndices.length;
				}
				if (createdAssets.length > 0) {
					assetController.clearSceneAssetSelection?.();
					const [firstAsset, ...restAssets] = createdAssets;
					assetController.selectSceneAsset?.(firstAsset.id);
					for (const asset of restAssets) {
						assetController.selectSceneAsset?.(asset.id, {
							additive: true,
						});
					}
				}
				store.splatEdit.lastOperation.value = {
					mode: "duplicate",
					hitCount: duplicatedCount,
				};
				syncScopeToSceneSelection();
				selectAllSplatsForAssets(createdAssets, selectedSplatsByAssetId);
				syncSelectionCount();
				syncSelectionHighlight();
				syncSceneHelper();
				updateUi?.();
				setStatus?.(
					t("status.splatEditDuplicated", {
						count: duplicatedCount,
						assets: createdAssets.length,
					}),
				);
				return createdAssets.length;
			},
		);
	}

	return {
		deleteSelectedSplats,
		separateSelectedSplats,
		duplicateSelectedSplats,
	};
}
