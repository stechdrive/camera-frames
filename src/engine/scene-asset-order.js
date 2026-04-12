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

export function moveSceneAssetBlockWithinKind(
	sceneAssets,
	assetIds,
	nextInsertionIndex,
) {
	const currentAsset = sceneAssets.find((asset) => assetIds.includes(asset.id));
	if (!currentAsset) {
		return sceneAssets;
	}

	const sameKindAssets = sceneAssets.filter(
		(asset) => asset.kind === currentAsset.kind,
	);
	const movedAssetIdSet = new Set(assetIds);
	const orderedMovedAssets = sameKindAssets.filter((asset) =>
		movedAssetIdSet.has(asset.id),
	);
	if (
		orderedMovedAssets.length === 0 ||
		sameKindAssets.length <= orderedMovedAssets.length
	) {
		return sceneAssets;
	}

	const remainingKindAssets = sameKindAssets.filter(
		(asset) => !movedAssetIdSet.has(asset.id),
	);
	const clampedInsertionIndex = Math.max(
		0,
		Math.min(remainingKindAssets.length, Number(nextInsertionIndex) || 0),
	);
	const reorderedKindAssets = [...remainingKindAssets];
	reorderedKindAssets.splice(clampedInsertionIndex, 0, ...orderedMovedAssets);

	if (
		reorderedKindAssets.every(
			(asset, index) => sameKindAssets[index]?.id === asset.id,
		)
	) {
		return sceneAssets;
	}

	let nextReorderedIndex = 0;
	return sceneAssets.map((asset) =>
		asset.kind === currentAsset.kind
			? reorderedKindAssets[nextReorderedIndex++]
			: asset,
	);
}

export function moveSceneAssetWithinKind(sceneAssets, assetId, nextKindIndex) {
	const currentAsset = sceneAssets.find((asset) => asset.id === assetId);
	if (!currentAsset) {
		return sceneAssets;
	}

	const sameKindAssets = sceneAssets.filter(
		(asset) => asset.kind === currentAsset.kind,
	);
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

	return moveSceneAssetBlockWithinKind(
		sceneAssets,
		[assetId],
		clampedKindIndex,
	);
}

export function prioritizeSceneAssetsWithinKinds(
	sceneAssets,
	prioritizedAssetIds = [],
) {
	if (!Array.isArray(sceneAssets) || sceneAssets.length === 0) {
		return sceneAssets;
	}

	const prioritizedIdsByKind = new Map();
	for (const assetId of prioritizedAssetIds) {
		const asset = sceneAssets.find((candidate) => candidate.id === assetId);
		if (!asset) {
			continue;
		}
		const kindIds = prioritizedIdsByKind.get(asset.kind) ?? [];
		if (!kindIds.includes(asset.id)) {
			kindIds.push(asset.id);
			prioritizedIdsByKind.set(asset.kind, kindIds);
		}
	}

	if (prioritizedIdsByKind.size === 0) {
		return sceneAssets;
	}

	const prioritizedIdSet = new Set([...prioritizedIdsByKind.values()].flat());
	const reorderedAssetsByKind = new Map();
	for (const [kind, kindIds] of prioritizedIdsByKind.entries()) {
		const kindAssets = sceneAssets.filter((asset) => asset.kind === kind);
		const prioritizedAssets = kindIds
			.map((assetId) =>
				kindAssets.find((candidate) => candidate.id === assetId),
			)
			.filter(Boolean);
		if (prioritizedAssets.length === 0) {
			continue;
		}
		const remainingAssets = kindAssets.filter(
			(asset) => !prioritizedIdSet.has(asset.id),
		);
		reorderedAssetsByKind.set(kind, [...prioritizedAssets, ...remainingAssets]);
	}

	let changed = false;
	const nextKindIndexByKind = new Map();
	const nextSceneAssets = sceneAssets.map((asset) => {
		const reorderedAssets = reorderedAssetsByKind.get(asset.kind);
		if (!reorderedAssets) {
			return asset;
		}
		const nextKindIndex = nextKindIndexByKind.get(asset.kind) ?? 0;
		const nextAsset = reorderedAssets[nextKindIndex] ?? asset;
		nextKindIndexByKind.set(asset.kind, nextKindIndex + 1);
		if (nextAsset !== asset) {
			changed = true;
		}
		return nextAsset;
	});

	return changed ? nextSceneAssets : sceneAssets;
}
