import { createProjectFilePackedSplatSource } from "../../project/document.js";
import {
	DERIVED_SPLAT_FILE_EXTENSION,
	clonePackedExtra,
	sanitizeFileStem,
} from "./pure-utils.js";
import {
	getAssetIdKey,
	getSplatAssetTotalCount,
	getSplatPackedSource,
	buildRemainingIndices,
} from "./asset-accessors.js";

export function createSplatAssetPersistence({
	getSceneSplatAssets,
	getAssetController,
	invalidateBrushSpatialIndex,
	beginHistoryTransaction,
	getSplatEditScopeAssets,
	selectedSplatsByAssetId,
}) {
	function buildDerivedSplatFileName(asset, suffix = "derived") {
		const sourceFileName =
			asset?.source?.fileName ?? asset?.label ?? `${asset?.id ?? "splat"}`;
		const baseName = String(sourceFileName).replace(/\.[^./\\]+$/, "");
		return `${sanitizeFileStem(baseName)}-${suffix}.${DERIVED_SPLAT_FILE_EXTENSION}`;
	}

	function buildUniqueSplitLabel(baseLabel) {
		const existingLabels = new Set(
			getSceneSplatAssets().map((asset) => String(asset.label ?? "").trim()),
		);
		const base = `${String(baseLabel ?? "3DGS").trim() || "3DGS"} Split`;
		if (!existingLabels.has(base)) {
			return base;
		}
		let index = 2;
		while (existingLabels.has(`${base} ${index}`)) {
			index += 1;
		}
		return `${base} ${index}`;
	}

	function buildUniqueDuplicateLabel(baseLabel) {
		const existingLabels = new Set(
			getSceneSplatAssets().map((asset) => String(asset.label ?? "").trim()),
		);
		const base = `${String(baseLabel ?? "3DGS").trim() || "3DGS"} Copy`;
		if (!existingLabels.has(base)) {
			return base;
		}
		let index = 2;
		while (existingLabels.has(`${base} ${index}`)) {
			index += 1;
		}
		return `${base} ${index}`;
	}

	function updateSplatAssetBoundsHints(asset) {
		const splatMesh = asset?.disposeTarget;
		if (!splatMesh || typeof splatMesh.getBoundingBox !== "function") {
			return false;
		}
		const localBoundsHint =
			splatMesh.getBoundingBox(false)?.clone?.() ??
			splatMesh.getBoundingBox()?.clone?.() ??
			null;
		const localCenterBoundsHint =
			splatMesh.getBoundingBox(true)?.clone?.() ??
			localBoundsHint?.clone?.() ??
			null;
		asset.localBoundsHint = localBoundsHint;
		asset.localCenterBoundsHint = localCenterBoundsHint;
		return true;
	}

	function getCapturedProjectAssetState(asset, { label = asset?.label } = {}) {
		const snapshot =
			getAssetController?.()
				?.captureProjectSceneState?.()
				?.find((entry) => String(entry.id) === String(asset?.id)) ?? null;
		if (!snapshot) {
			return null;
		}
		const { source: _source, ...snapshotWithoutSource } = snapshot;
		return {
			...snapshotWithoutSource,
			label: String(
				label ?? snapshotWithoutSource.label ?? asset?.label ?? "3DGS",
			),
		};
	}

	function syncSplatAssetPersistentSource(asset) {
		const packedSplats = getSplatPackedSource(asset);
		if (!asset || !packedSplats) {
			return false;
		}
		asset.source = createProjectFilePackedSplatSource({
			fileName:
				asset?.source?.fileName ?? buildDerivedSplatFileName(asset, "edited"),
			inputBytes: asset?.source?.inputBytes ?? new Uint8Array(),
			extraFiles: asset?.source?.extraFiles ?? {},
			fileType: asset?.source?.fileType ?? null,
			packedArray: packedSplats.packedArray ?? new Uint32Array(),
			numSplats: packedSplats.getNumSplats?.() ?? packedSplats.numSplats ?? 0,
			extra: packedSplats.extra ?? {},
			splatEncoding: packedSplats.splatEncoding ?? null,
			projectAssetState: getCapturedProjectAssetState(asset.id, {
				label: asset.label,
			}),
			legacyState: asset?.source?.legacyState ?? null,
			resource: asset?.source?.resource ?? null,
		});
		asset.persistentSourceDirty = false;
		updateSplatAssetBoundsHints(asset);
		invalidateBrushSpatialIndex(asset);
		return true;
	}

	function markSplatAssetPersistentSourceDirty(asset) {
		if (asset?.kind !== "splat") {
			return false;
		}
		asset.persistentSourceDirty = true;
		return true;
	}

	function flushDirtySplatAssetPersistentSources() {
		let flushed = false;
		for (const asset of getSceneSplatAssets()) {
			if (asset?.persistentSourceDirty !== true) {
				continue;
			}
			flushed = syncSplatAssetPersistentSource(asset) || flushed;
		}
		return flushed;
	}

	function markSplatAssetsForHistorySourceCapture(
		items = [],
		capturedAssets = [],
	) {
		const trackedAssets = Array.isArray(capturedAssets) ? capturedAssets : [];
		const seenAssets = new Set(trackedAssets);
		for (const item of items) {
			const asset =
				item?.asset?.kind === "splat"
					? item.asset
					: item?.kind === "splat"
						? item
						: null;
			if (!asset || !getSplatPackedSource(asset) || asset?.source == null) {
				continue;
			}
			if (seenAssets.has(asset)) {
				continue;
			}
			seenAssets.add(asset);
			if (asset.capturePackedSplatSourceInEditState !== true) {
				asset.capturePackedSplatSourceInEditState = true;
				trackedAssets.push(asset);
			}
		}
		return trackedAssets;
	}

	function releaseSplatAssetsForHistorySourceCapture(capturedAssets = []) {
		for (const asset of capturedAssets) {
			if (asset?.kind === "splat") {
				asset.capturePackedSplatSourceInEditState = false;
			}
		}
		return true;
	}

	function beginSplatSourceHistoryTransaction(label, items = [], options = {}) {
		const historyCaptureAssets = markSplatAssetsForHistorySourceCapture(
			items,
			[],
		);
		const historyStarted = beginHistoryTransaction?.(label, options) === true;
		if (!historyStarted) {
			releaseSplatAssetsForHistorySourceCapture(historyCaptureAssets);
		}
		return {
			historyStarted,
			historyCaptureAssets: historyStarted ? historyCaptureAssets : [],
		};
	}

	function createDerivedPackedSplatSource(
		asset,
		indices,
		{ label, fileName } = {},
	) {
		const packedSplats = getSplatPackedSource(asset);
		if (
			!packedSplats ||
			!(indices instanceof Uint32Array) ||
			indices.length === 0
		) {
			return null;
		}
		const extracted = packedSplats.extractSplats(indices, false);
		return createProjectFilePackedSplatSource({
			fileName:
				fileName ??
				asset?.source?.fileName ??
				buildDerivedSplatFileName(asset, "selection"),
			packedArray: extracted.packedArray,
			numSplats: extracted.numSplats,
			extra: clonePackedExtra(extracted.extra),
			splatEncoding:
				extracted.splatEncoding && typeof extracted.splatEncoding === "object"
					? JSON.parse(JSON.stringify(extracted.splatEncoding))
					: null,
			projectAssetState: getCapturedProjectAssetState(asset, { label }),
			legacyState: asset?.source?.legacyState ?? null,
		});
	}

	function buildSelectedSplatOperations() {
		const operations = [];
		for (const asset of getSplatEditScopeAssets()) {
			const assetIdKey = getAssetIdKey(asset.id);
			const selectedSet = selectedSplatsByAssetId.get(assetIdKey);
			if (!selectedSet || selectedSet.size === 0) {
				continue;
			}
			const totalCount = getSplatAssetTotalCount(asset);
			if (totalCount <= 0) {
				continue;
			}
			const selectedIndices = new Uint32Array(
				[...selectedSet]
					.filter(
						(index) =>
							Number.isInteger(index) && index >= 0 && index < totalCount,
					)
					.sort((left, right) => left - right),
			);
			if (selectedIndices.length === 0) {
				continue;
			}
			const selectedIndexSet = new Set(selectedIndices);
			operations.push({
				asset,
				assetIdKey,
				totalCount,
				selectedIndices,
				selectedIndexSet,
				remainingIndices: buildRemainingIndices(totalCount, selectedIndexSet),
			});
		}
		return operations;
	}

	return {
		buildDerivedSplatFileName,
		buildUniqueSplitLabel,
		buildUniqueDuplicateLabel,
		updateSplatAssetBoundsHints,
		getCapturedProjectAssetState,
		syncSplatAssetPersistentSource,
		markSplatAssetPersistentSourceDirty,
		flushDirtySplatAssetPersistentSources,
		markSplatAssetsForHistorySourceCapture,
		releaseSplatAssetsForHistorySourceCapture,
		beginSplatSourceHistoryTransaction,
		createDerivedPackedSplatSource,
		buildSelectedSplatOperations,
	};
}
