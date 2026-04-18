export function getAssetIdKey(assetId) {
	return String(assetId);
}

export function getSplatPackedSource(asset) {
	return asset?.disposeTarget?.packedSplats ?? null;
}

export function getSplatAssetWorldMatrix(asset) {
	const splatMesh = asset?.disposeTarget;
	asset?.object?.updateMatrixWorld?.(true);
	splatMesh?.updateMatrixWorld?.(true);
	return (
		splatMesh?.matrixWorld ??
		asset?.contentObject?.matrixWorld ??
		asset?.object?.matrixWorld ??
		null
	);
}

export function getSplatAssetTotalCount(asset) {
	const packedSplats = getSplatPackedSource(asset);
	if (Number.isFinite(packedSplats?.numSplats)) {
		return packedSplats.numSplats;
	}
	let totalCount = 0;
	asset?.disposeTarget?.forEachSplat?.(() => {
		totalCount += 1;
	});
	return totalCount;
}

export function buildRemainingIndices(totalCount, selectedIndexSet) {
	const remaining = [];
	for (let index = 0; index < totalCount; index += 1) {
		if (!selectedIndexSet.has(index)) {
			remaining.push(index);
		}
	}
	return new Uint32Array(remaining);
}

export function createSceneSplatAssetAccessor({ store, getAssetController }) {
	return function getSceneSplatAssets() {
		const runtimeAssets =
			getAssetController?.()?.getSceneAssets?.() ??
			store.sceneAssets.value ??
			[];
		return runtimeAssets.filter((asset) => asset?.kind === "splat");
	};
}
