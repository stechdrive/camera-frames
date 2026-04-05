import { RgbaArray } from "@sparkjsdev/spark";

const DEFAULT_HIGHLIGHT_RGBA = {
	r: 92,
	g: 242,
	b: 139,
};
const DEFAULT_HIGHLIGHT_MIX = 0.82;

function clampByte(value) {
	return Math.max(0, Math.min(255, Math.round(Number(value) || 0)));
}

function getSplatCount(splatMesh) {
	return (
		splatMesh?.splats?.getNumSplats?.() ??
		splatMesh?.packedSplats?.getNumSplats?.() ??
		splatMesh?.extSplats?.getNumSplats?.() ??
		0
	);
}

function buildBaseRgbaArray(splatMesh, count) {
	const array = new Uint8Array(count * 4);
	if (count <= 0 || typeof splatMesh?.forEachSplat !== "function") {
		return array;
	}
	splatMesh.forEachSplat(
		(index, _center, _scales, _quaternion, opacity, color) => {
			const baseOffset = index * 4;
			array[baseOffset] = clampByte((color?.r ?? 0) * 255);
			array[baseOffset + 1] = clampByte((color?.g ?? 0) * 255);
			array[baseOffset + 2] = clampByte((color?.b ?? 0) * 255);
			array[baseOffset + 3] = clampByte((opacity ?? 1) * 255);
		},
	);
	return array;
}

function copyBaseRgbaArray(splatMesh, count) {
	const existingArray = splatMesh?.splatRgba?.array;
	if (
		existingArray instanceof Uint8Array &&
		existingArray.length >= count * 4
	) {
		return existingArray.slice(0, count * 4);
	}
	return buildBaseRgbaArray(splatMesh, count);
}

function setHighlightColor(array, baseArray, index, highlightRgba, mixFactor) {
	const baseOffset = index * 4;
	const keepFactor = 1 - mixFactor;
	array[baseOffset] = clampByte(
		baseArray[baseOffset] * keepFactor + highlightRgba.r * mixFactor,
	);
	array[baseOffset + 1] = clampByte(
		baseArray[baseOffset + 1] * keepFactor + highlightRgba.g * mixFactor,
	);
	array[baseOffset + 2] = clampByte(
		baseArray[baseOffset + 2] * keepFactor + highlightRgba.b * mixFactor,
	);
	array[baseOffset + 3] = baseArray[baseOffset + 3];
}

function restoreBaseColor(array, baseArray, index) {
	const baseOffset = index * 4;
	array[baseOffset] = baseArray[baseOffset];
	array[baseOffset + 1] = baseArray[baseOffset + 1];
	array[baseOffset + 2] = baseArray[baseOffset + 2];
	array[baseOffset + 3] = baseArray[baseOffset + 3];
}

export function createSplatSelectionHighlightController({
	RgbaArrayImpl = RgbaArray,
	highlightRgba = DEFAULT_HIGHLIGHT_RGBA,
	highlightMix = DEFAULT_HIGHLIGHT_MIX,
} = {}) {
	const entriesByAssetId = new Map();

	function getAssetIdKey(assetId) {
		return String(assetId);
	}

	function disposeEntry(entry) {
		if (!entry) {
			return;
		}
		if (entry.mesh) {
			entry.mesh.splatRgba = entry.previousSplatRgba ?? null;
			entry.mesh.updateGenerator?.();
		}
		entry.rgbaArray?.dispose?.();
	}

	function ensureEntry(asset) {
		if (!asset?.id || !asset?.disposeTarget) {
			return null;
		}
		const assetIdKey = getAssetIdKey(asset.id);
		const existingEntry = entriesByAssetId.get(assetIdKey);
		if (existingEntry?.mesh === asset.disposeTarget) {
			return existingEntry;
		}
		if (existingEntry) {
			disposeEntry(existingEntry);
			entriesByAssetId.delete(assetIdKey);
		}
		const splatMesh = asset.disposeTarget;
		const count = getSplatCount(splatMesh);
		if (count <= 0) {
			return null;
		}
		const baseArray = copyBaseRgbaArray(splatMesh, count);
		const rgbaArray = new RgbaArrayImpl({
			array: baseArray.slice(),
			count,
			capacity: count,
		});
		rgbaArray.getTexture?.();
		const entry = {
			assetId: assetIdKey,
			mesh: splatMesh,
			baseArray,
			rgbaArray,
			previousSplatRgba: splatMesh.splatRgba ?? null,
			highlightedIndices: new Set(),
		};
		splatMesh.splatRgba = rgbaArray;
		splatMesh.updateGenerator?.();
		entriesByAssetId.set(assetIdKey, entry);
		return entry;
	}

	function syncAssetSelection(entry, selectedIndices) {
		const nextSelectedIndices = selectedIndices ?? new Set();
		let changed = false;
		for (const index of entry.highlightedIndices) {
			if (nextSelectedIndices.has(index)) {
				continue;
			}
			restoreBaseColor(entry.rgbaArray.array, entry.baseArray, index);
			changed = true;
		}
		for (const index of nextSelectedIndices) {
			if (entry.highlightedIndices.has(index)) {
				continue;
			}
			setHighlightColor(
				entry.rgbaArray.array,
				entry.baseArray,
				index,
				highlightRgba,
				highlightMix,
			);
			changed = true;
		}
		entry.highlightedIndices = new Set(nextSelectedIndices);
		if (changed) {
			entry.rgbaArray.needsUpdate = true;
			entry.rgbaArray.getTexture?.();
		}
	}

	function sync({
		scopeAssets = [],
		selectedSplatsByAssetId = new Map(),
	} = {}) {
		const scopeAssetMap = new Map(
			scopeAssets
				.filter((asset) => asset?.kind === "splat" && asset?.disposeTarget)
				.map((asset) => [getAssetIdKey(asset.id), asset]),
		);
		const activeSelectedAssetIds = new Set();
		for (const [
			assetId,
			selectedIndices,
		] of selectedSplatsByAssetId.entries()) {
			if (
				!scopeAssetMap.has(assetId) ||
				!selectedIndices ||
				selectedIndices.size <= 0
			) {
				continue;
			}
			activeSelectedAssetIds.add(assetId);
			const entry = ensureEntry(scopeAssetMap.get(assetId));
			if (entry) {
				syncAssetSelection(entry, selectedIndices);
			}
		}
		for (const [assetId, entry] of entriesByAssetId.entries()) {
			if (activeSelectedAssetIds.has(assetId)) {
				continue;
			}
			disposeEntry(entry);
			entriesByAssetId.delete(assetId);
		}
	}

	function clear() {
		for (const entry of entriesByAssetId.values()) {
			disposeEntry(entry);
		}
		entriesByAssetId.clear();
	}

	return {
		sync,
		clear,
		dispose: clear,
	};
}
