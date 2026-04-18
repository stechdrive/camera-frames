import {
	debugSplatPerf,
	isSplatPerfDebugEnabled,
} from "../../debug/splat-perf-debug.js";

export function createSplatSelectionState({
	store,
	selectionHighlightController,
	transformPreviewController,
	getSplatEditScopeAssets,
	getSplatEditScopeAssetIds,
}) {
	const selectedSplatsInner = new Map();
	let selectionDirty = true;
	let currentSelectionRevisionId = 0;
	let nextSelectionRevisionId = 1;
	const selectionByRevision = new Map();
	let pendingSelectionHighlightFrameId = null;

	function markSelectionDirty() {
		selectionDirty = true;
	}

	const selectedSplatsByAssetId = {
		get size() {
			return selectedSplatsInner.size;
		},
		get(key) {
			return selectedSplatsInner.get(key);
		},
		has(key) {
			return selectedSplatsInner.has(key);
		},
		set(key, value) {
			markSelectionDirty();
			return selectedSplatsInner.set(key, value);
		},
		delete(key) {
			markSelectionDirty();
			return selectedSplatsInner.delete(key);
		},
		clear() {
			markSelectionDirty();
			return selectedSplatsInner.clear();
		},
		entries() {
			return selectedSplatsInner.entries();
		},
		keys() {
			return selectedSplatsInner.keys();
		},
		values() {
			return selectedSplatsInner.values();
		},
		forEach(callback, thisArg) {
			return selectedSplatsInner.forEach(callback, thisArg);
		},
		[Symbol.iterator]() {
			return selectedSplatsInner[Symbol.iterator]();
		},
	};

	function syncSelectionCount() {
		const scopeAssetIds = new Set(getSplatEditScopeAssetIds());
		let totalCount = 0;
		for (const [assetId, selectedSplats] of selectedSplatsByAssetId.entries()) {
			if (!scopeAssetIds.has(assetId)) {
				continue;
			}
			totalCount += selectedSplats?.size ?? 0;
		}
		store.splatEdit.selectionCount.value = totalCount;
	}

	function runSelectionHighlightSync({ touchedByAssetId = null } = {}) {
		const perfEnabled = isSplatPerfDebugEnabled();
		const perfStart = perfEnabled ? performance.now() : 0;
		selectionHighlightController?.sync?.({
			scopeAssets: getSplatEditScopeAssets(),
			selectedSplatsByAssetId,
			hiddenSelectedSplatsByAssetId:
				transformPreviewController.getHiddenSelectedSplatsByAssetId?.() ??
				new Map(),
			touchedByAssetId,
		});
		if (perfEnabled) {
			let trackedSelectionCount = 0;
			for (const value of selectedSplatsByAssetId.values()) {
				trackedSelectionCount += value?.size ?? 0;
			}
			let touchedCount = null;
			if (touchedByAssetId instanceof Map) {
				touchedCount = 0;
				for (const set of touchedByAssetId.values()) {
					touchedCount += set?.size ?? 0;
				}
			}
			debugSplatPerf("highlight-sync", {
				selectionCount: trackedSelectionCount,
				touchedCount,
				fastPath: touchedByAssetId instanceof Map,
				elapsedMs: Number((performance.now() - perfStart).toFixed(2)),
			});
		}
	}

	function cancelPendingSelectionHighlightSync() {
		if (
			pendingSelectionHighlightFrameId !== null &&
			typeof globalThis.cancelAnimationFrame === "function"
		) {
			globalThis.cancelAnimationFrame(pendingSelectionHighlightFrameId);
		}
		pendingSelectionHighlightFrameId = null;
	}

	function flushPendingSelectionHighlightSync() {
		if (pendingSelectionHighlightFrameId === null) {
			return false;
		}
		cancelPendingSelectionHighlightSync();
		runSelectionHighlightSync();
		return true;
	}

	function clearSelectionHighlight() {
		cancelPendingSelectionHighlightSync();
		selectionHighlightController?.clear?.();
	}

	function syncSelectionHighlight(options = {}) {
		cancelPendingSelectionHighlightSync();
		runSelectionHighlightSync(options);
		return true;
	}

	function buildFrozenSelection() {
		return Object.freeze(
			Array.from(selectedSplatsInner.entries()).map(
				([assetId, selectedSplats]) =>
					Object.freeze({
						assetId,
						indices: Uint32Array.from(
							[...selectedSplats]
								.filter((index) => Number.isInteger(index) && index >= 0)
								.sort((left, right) => left - right),
						),
					}),
			),
		);
	}

	function ensureSelectionRevisionCached() {
		if (selectionDirty) {
			currentSelectionRevisionId = nextSelectionRevisionId;
			nextSelectionRevisionId += 1;
			selectionDirty = false;
		}
		if (!selectionByRevision.has(currentSelectionRevisionId)) {
			selectionByRevision.set(currentSelectionRevisionId, {
				frozen: buildFrozenSelection(),
				refCount: 0,
			});
		}
		return currentSelectionRevisionId;
	}

	function retainSelectionRevision(revisionId) {
		if (!Number.isInteger(revisionId)) {
			return;
		}
		const entry = selectionByRevision.get(revisionId);
		if (entry) {
			entry.refCount += 1;
		}
	}

	function releaseSelectionRevision(revisionId) {
		if (!Number.isInteger(revisionId)) {
			return;
		}
		const entry = selectionByRevision.get(revisionId);
		if (!entry) {
			return;
		}
		entry.refCount -= 1;
		if (entry.refCount <= 0 && revisionId !== currentSelectionRevisionId) {
			selectionByRevision.delete(revisionId);
		}
	}

	function setCurrentSelectionRevisionId(revisionId) {
		if (Number.isInteger(revisionId)) {
			currentSelectionRevisionId = revisionId;
			selectionDirty = false;
		}
	}

	return {
		selectedSplatsInner,
		selectedSplatsByAssetId,
		selectionByRevision,
		markSelectionDirty,
		setCurrentSelectionRevisionId,
		syncSelectionCount,
		runSelectionHighlightSync,
		cancelPendingSelectionHighlightSync,
		flushPendingSelectionHighlightSync,
		clearSelectionHighlight,
		syncSelectionHighlight,
		buildFrozenSelection,
		ensureSelectionRevisionCached,
		retainSelectionRevision,
		releaseSelectionRevision,
	};
}
