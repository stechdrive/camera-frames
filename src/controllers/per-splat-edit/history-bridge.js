import { debugSplatHistory } from "../../debug/splat-history-debug.js";
import { getAssetIdKey, getSplatAssetTotalCount } from "./asset-accessors.js";
import {
	clampBoxAxisSize,
	clampBrushDepth,
	clampBrushSizePx,
	toPlainQuaternion,
	toQuaternion,
} from "./pure-utils.js";

export function createSplatEditHistoryBridge({
	store,
	updateUi,
	beginHistoryTransaction,
	commitHistoryTransaction,
	cancelHistoryTransaction,
	defaultBrushSize,
	defaultBrushDepthMode,
	defaultBrushDepth,
	getSplatEditScopeAssetIds,
	normalizeScopeAssetIds,
	getSplatEditBoxRotation,
	getSceneSplatAssets,
	selectedSplatsByAssetId,
	selectedSplatsInner,
	selectionByRevision,
	setCurrentSelectionRevisionId,
	markSelectionDirty,
	ensureSelectionRevisionCached,
	markSplatAssetsForHistorySourceCapture,
	releaseSplatAssetsForHistorySourceCapture,
	syncSelectionCount,
	syncSelectionHighlight,
	syncSceneHelper,
	clearActiveTransformPreview,
	clearActiveBrushStroke,
	clearBrushPreview,
}) {
	function captureEditState() {
		return {
			tool:
				store.splatEdit.tool.value === "brush"
					? "brush"
					: store.splatEdit.tool.value === "transform"
						? "transform"
						: "box",
			scopeAssetIds: getSplatEditScopeAssetIds(),
			rememberedScopeAssetIds: normalizeScopeAssetIds(
				store.splatEdit.rememberedScopeAssetIds.value,
			),
			brushSize: clampBrushSizePx(store.splatEdit.brushSize.value),
			brushDepthMode:
				store.splatEdit.brushDepthMode.value === "through"
					? "through"
					: "depth",
			brushDepth: clampBrushDepth(store.splatEdit.brushDepth.value),
			boxPlaced: store.splatEdit.boxPlaced.value === true,
			boxCenter: {
				...store.splatEdit.boxCenter.value,
			},
			boxSize: {
				x: clampBoxAxisSize(store.splatEdit.boxSize.value?.x),
				y: clampBoxAxisSize(store.splatEdit.boxSize.value?.y),
				z: clampBoxAxisSize(store.splatEdit.boxSize.value?.z),
			},
			boxRotation: {
				...toPlainQuaternion(getSplatEditBoxRotation()),
			},
			hudPosition: {
				x: Number.isFinite(store.splatEdit.hudPosition.value?.x)
					? Number(store.splatEdit.hudPosition.value.x)
					: null,
				y: Number.isFinite(store.splatEdit.hudPosition.value?.y)
					? Number(store.splatEdit.hudPosition.value.y)
					: null,
			},
			lastOperation: {
				mode: String(store.splatEdit.lastOperation.value?.mode ?? ""),
				hitCount: Number.isFinite(store.splatEdit.lastOperation.value?.hitCount)
					? Number(store.splatEdit.lastOperation.value.hitCount)
					: 0,
			},
			selectionRevision: ensureSelectionRevisionCached(),
		};
	}

	function restoreEditState(snapshot = null) {
		selectedSplatsByAssetId.clear();
		clearActiveTransformPreview({ syncUi: false });
		clearActiveBrushStroke();
		clearBrushPreview({ syncUi: false });
		if (!snapshot || typeof snapshot !== "object") {
			store.splatEdit.tool.value = "box";
			store.splatEdit.scopeAssetIds.value = [];
			store.splatEdit.rememberedScopeAssetIds.value = [];
			store.splatEdit.brushSize.value = defaultBrushSize;
			store.splatEdit.brushDepthMode.value = defaultBrushDepthMode;
			store.splatEdit.brushDepth.value = defaultBrushDepth;
			store.splatEdit.boxPlaced.value = false;
			store.splatEdit.boxCenter.value = { x: 0, y: 0, z: 0 };
			store.splatEdit.boxSize.value = { x: 1, y: 1, z: 1 };
			store.splatEdit.boxRotation.value = { x: 0, y: 0, z: 0, w: 1 };
			store.splatEdit.hudPosition.value = { x: null, y: null };
			store.splatEdit.lastOperation.value = { mode: "", hitCount: 0 };
			syncSelectionCount();
			syncSelectionHighlight();
			syncSceneHelper();
			updateUi?.();
			return true;
		}

		store.splatEdit.tool.value =
			snapshot.tool === "brush"
				? "brush"
				: snapshot.tool === "transform"
					? "transform"
					: "box";
		store.splatEdit.scopeAssetIds.value = normalizeScopeAssetIds(
			snapshot.scopeAssetIds,
		);
		store.splatEdit.rememberedScopeAssetIds.value = normalizeScopeAssetIds(
			snapshot.rememberedScopeAssetIds,
		);
		store.splatEdit.brushSize.value = clampBrushSizePx(snapshot.brushSize);
		store.splatEdit.brushDepthMode.value =
			snapshot.brushDepthMode === "through" ? "through" : "depth";
		store.splatEdit.brushDepth.value = clampBrushDepth(snapshot.brushDepth);
		store.splatEdit.boxPlaced.value =
			typeof snapshot.boxPlaced === "boolean" ? snapshot.boxPlaced : true;
		store.splatEdit.boxCenter.value = {
			x: Number(snapshot.boxCenter?.x ?? 0),
			y: Number(snapshot.boxCenter?.y ?? 0),
			z: Number(snapshot.boxCenter?.z ?? 0),
		};
		store.splatEdit.boxSize.value = {
			x: clampBoxAxisSize(snapshot.boxSize?.x),
			y: clampBoxAxisSize(snapshot.boxSize?.y),
			z: clampBoxAxisSize(snapshot.boxSize?.z),
		};
		store.splatEdit.boxRotation.value = toPlainQuaternion(
			toQuaternion(snapshot.boxRotation),
		);
		store.splatEdit.hudPosition.value = {
			x: Number.isFinite(snapshot.hudPosition?.x)
				? Number(snapshot.hudPosition.x)
				: null,
			y: Number.isFinite(snapshot.hudPosition?.y)
				? Number(snapshot.hudPosition.y)
				: null,
		};
		store.splatEdit.lastOperation.value = {
			mode: String(snapshot.lastOperation?.mode ?? ""),
			hitCount: Number.isFinite(snapshot.lastOperation?.hitCount)
				? Number(snapshot.lastOperation.hitCount)
				: 0,
		};

		const validAssetIds = new Set(
			getSceneSplatAssets().map((asset) => getAssetIdKey(asset.id)),
		);
		let restoredFromRevision = false;
		const revisionId = snapshot?.selectionRevision;
		if (Number.isInteger(revisionId) && selectionByRevision.has(revisionId)) {
			const { frozen } = selectionByRevision.get(revisionId);
			for (const item of frozen) {
				const assetIdKey = getAssetIdKey(item.assetId);
				if (!validAssetIds.has(assetIdKey)) {
					continue;
				}
				const asset = getSceneSplatAssets().find(
					(sceneAsset) => getAssetIdKey(sceneAsset.id) === assetIdKey,
				);
				if (!asset) {
					continue;
				}
				const totalCount = getSplatAssetTotalCount(asset);
				const selectedSet = new Set();
				for (let i = 0; i < item.indices.length; i += 1) {
					const index = item.indices[i];
					if (Number.isInteger(index) && index >= 0 && index < totalCount) {
						selectedSet.add(index);
					}
				}
				if (selectedSet.size > 0) {
					selectedSplatsInner.set(assetIdKey, selectedSet);
				}
			}
			setCurrentSelectionRevisionId(revisionId);
			restoredFromRevision = true;
		}
		if (!restoredFromRevision) {
			for (const entry of snapshot.selectedSplatsByAssetId ?? []) {
				const assetIdKey = getAssetIdKey(entry?.assetId);
				if (!validAssetIds.has(assetIdKey)) {
					continue;
				}
				const asset = getSceneSplatAssets().find(
					(sceneAsset) => getAssetIdKey(sceneAsset.id) === assetIdKey,
				);
				if (!asset) {
					continue;
				}
				const totalCount = getSplatAssetTotalCount(asset);
				const selectedSet = new Set(
					(entry?.indices ?? []).filter(
						(index) =>
							Number.isInteger(index) && index >= 0 && index < totalCount,
					),
				);
				if (selectedSet.size > 0) {
					selectedSplatsInner.set(assetIdKey, selectedSet);
				}
			}
			markSelectionDirty();
		}

		syncSelectionCount();
		syncSelectionHighlight();
		syncSceneHelper();
		updateUi?.();
		return true;
	}

	async function runHistoryTransaction(label, applyChange) {
		const hasHistoryTransaction = beginHistoryTransaction?.(label) === true;
		try {
			const result = await applyChange();
			if (hasHistoryTransaction) {
				commitHistoryTransaction?.(label);
			}
			return result;
		} catch (error) {
			if (hasHistoryTransaction) {
				cancelHistoryTransaction?.();
			}
			throw error;
		}
	}

	async function runSplatSourceHistoryTransaction(label, items, applyChange) {
		const historyCaptureAssets = markSplatAssetsForHistorySourceCapture(
			items,
			[],
		);
		try {
			return await runHistoryTransaction(label, () =>
				applyChange(historyCaptureAssets),
			);
		} finally {
			releaseSplatAssetsForHistorySourceCapture(historyCaptureAssets);
		}
	}

	function runSynchronousHistoryTransaction(label, applyChange) {
		const hasHistoryTransaction = beginHistoryTransaction?.(label) === true;
		try {
			const result = applyChange();
			if (hasHistoryTransaction) {
				commitHistoryTransaction?.(label);
			}
			return result;
		} catch (error) {
			if (hasHistoryTransaction) {
				cancelHistoryTransaction?.();
			}
			throw error;
		}
	}

	function finalizeSplatTransformDragHistory(drag, { commit = false } = {}) {
		if (!drag) {
			return false;
		}
		try {
			if (drag.historyStarted) {
				debugSplatHistory(commit ? "commit-transform" : "cancel-transform", {
					mode: drag.mode,
					assets: drag.entries?.map?.((entry) => entry.asset?.id ?? null) ?? [],
				});
				if (commit) {
					return commitHistoryTransaction?.("splat-edit.transform") === true;
				}
				cancelHistoryTransaction?.();
			}
			return false;
		} finally {
			releaseSplatAssetsForHistorySourceCapture(
				drag.historyCaptureAssets ?? [],
			);
		}
	}

	return {
		captureEditState,
		restoreEditState,
		runHistoryTransaction,
		runSplatSourceHistoryTransaction,
		runSynchronousHistoryTransaction,
		finalizeSplatTransformDragHistory,
	};
}
