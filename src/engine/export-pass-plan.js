function getAssetMaskPassId(asset) {
	const maskGroup = asset?.maskGroup?.trim?.();
	return maskGroup ? `mask:${maskGroup}` : null;
}

export function buildExportPassPlan(sceneAssets = []) {
	const beautyAssetIds = [];
	const maskPasses = new Map();

	for (const asset of sceneAssets) {
		const exportRole = asset?.exportRole ?? "beauty";
		if (exportRole !== "omit") {
			beautyAssetIds.push(asset.id);
		}

		const maskPassId = getAssetMaskPassId(asset);
		if (!maskPassId) {
			continue;
		}

		const existingPass = maskPasses.get(maskPassId) ?? {
			id: maskPassId,
			name: `Mask ${asset.maskGroup}`,
			category: "mask",
			assetIds: [],
			maskGroup: asset.maskGroup,
		};
		existingPass.assetIds.push(asset.id);
		maskPasses.set(maskPassId, existingPass);
	}

	return {
		beauty: {
			id: "beauty",
			name: "Beauty",
			category: "render",
			assetIds: beautyAssetIds,
		},
		masks: [...maskPasses.values()],
	};
}
