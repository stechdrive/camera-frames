function getAssetMaskPassId(asset) {
	return asset?.id != null ? `mask:asset-${asset.id}` : null;
}

function getAssetMaskPassName(asset) {
	const label = String(asset?.label ?? "").trim();
	return label ? `Mask ${label}` : `Mask Asset ${asset?.id ?? "?"}`;
}

export function buildExportPassPlan(sceneAssets = []) {
	const beautyAssetIds = [];
	const maskPasses = [];

	for (const asset of sceneAssets) {
		const exportRole = asset?.exportRole ?? "beauty";
		if (exportRole !== "omit") {
			beautyAssetIds.push(asset.id);
			const maskPassId = getAssetMaskPassId(asset);
			if (!maskPassId) {
				continue;
			}

			maskPasses.push({
				id: maskPassId,
				name: getAssetMaskPassName(asset),
				category: "mask",
				assetIds: [asset.id],
				maskGroup: asset?.maskGroup ?? "",
				assetLabel: asset?.label ?? `Asset ${asset.id}`,
			});
		}
	}

	return {
		beauty: {
			id: "beauty",
			name: "Beauty",
			category: "render",
			assetIds: beautyAssetIds,
		},
		masks: maskPasses,
	};
}
