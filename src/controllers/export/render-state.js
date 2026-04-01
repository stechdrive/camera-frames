export const EXPORT_DEPTH_OCCLUDER_RENDER_ORDER = -1_000_000;

export function getExportAssetRenderOrder(role, fallbackRenderOrder = 0) {
	return role === "depth-occluder"
		? EXPORT_DEPTH_OCCLUDER_RENDER_ORDER
		: fallbackRenderOrder;
}

export function applyExportAssetRenderOrder(assetRoot, role, restoreCallbacks) {
	if (!assetRoot) {
		return;
	}

	assetRoot.traverse((node) => {
		const previousRenderOrder = node.renderOrder;
		const nextRenderOrder = getExportAssetRenderOrder(
			role,
			previousRenderOrder,
		);
		if (nextRenderOrder === previousRenderOrder) {
			return;
		}

		node.renderOrder = nextRenderOrder;
		restoreCallbacks.push(() => {
			node.renderOrder = previousRenderOrder;
		});
	});
}
