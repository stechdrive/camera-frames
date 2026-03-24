const DEFAULT_KIND_SECTION_ORDER = ["model", "splat"];

export function getSceneAssetKindSectionOrder(sceneAssets = []) {
	const encounteredKinds = [];
	for (const asset of sceneAssets) {
		if (!encounteredKinds.includes(asset.kind)) {
			encounteredKinds.push(asset.kind);
		}
	}

	const orderedKinds = [];
	for (const kind of DEFAULT_KIND_SECTION_ORDER) {
		if (encounteredKinds.includes(kind)) {
			orderedKinds.push(kind);
		}
	}
	for (const kind of encounteredKinds) {
		if (!orderedKinds.includes(kind)) {
			orderedKinds.push(kind);
		}
	}

	return orderedKinds;
}

export function groupSceneAssetsByKind(sceneAssets = []) {
	return getSceneAssetKindSectionOrder(sceneAssets)
		.map((kind) => ({
			kind,
			assets: sceneAssets.filter((asset) => asset.kind === kind),
		}))
		.filter((section) => section.assets.length > 0);
}

export function moveSceneAssetWithinKind(sceneAssets, assetId, nextKindIndex) {
	const currentAsset = sceneAssets.find((asset) => asset.id === assetId);
	if (!currentAsset) {
		return sceneAssets;
	}

	const sameKindAssets = sceneAssets.filter(
		(asset) => asset.kind === currentAsset.kind,
	);
	if (sameKindAssets.length <= 1) {
		return sceneAssets;
	}

	const currentKindIndex = sameKindAssets.findIndex(
		(asset) => asset.id === assetId,
	);
	if (currentKindIndex === -1) {
		return sceneAssets;
	}

	const clampedKindIndex = Math.max(
		0,
		Math.min(sameKindAssets.length - 1, Number(nextKindIndex) || 0),
	);
	if (clampedKindIndex === currentKindIndex) {
		return sceneAssets;
	}

	const reorderedKindAssets = [...sameKindAssets];
	const [movedAsset] = reorderedKindAssets.splice(currentKindIndex, 1);
	reorderedKindAssets.splice(clampedKindIndex, 0, movedAsset);

	let nextReorderedIndex = 0;
	return sceneAssets.map((asset) =>
		asset.kind === currentAsset.kind
			? reorderedKindAssets[nextReorderedIndex++]
			: asset,
	);
}
