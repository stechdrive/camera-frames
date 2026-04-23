export function createViewportLodScaleRuntimeBinding({
	store,
	spark,
	isExportRenderLocked = () => false,
}) {
	function applyViewportLodScale() {
		if (isExportRenderLocked?.()) {
			return;
		}
		spark.lodSplatScale = store.viewportLod.effectiveScale.value;
	}

	applyViewportLodScale();
	const unsubscribe = store.viewportLod.effectiveScale.subscribe?.(
		applyViewportLodScale,
	);

	return {
		apply: applyViewportLodScale,
		dispose() {
			unsubscribe?.();
		},
	};
}
