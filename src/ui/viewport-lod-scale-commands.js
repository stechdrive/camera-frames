import {
	clampViewportLodScale,
	writePersistedViewportLodUserScale,
} from "./viewport-lod-scale.js";

export function createViewportLodScaleCommands({ store }) {
	function setViewportLodScale(rawValue) {
		const nextScale = clampViewportLodScale(rawValue);
		store.viewportLod.userScale.value = nextScale;
		writePersistedViewportLodUserScale(nextScale);
		return nextScale;
	}

	function resetViewportLodScale() {
		store.viewportLod.userScale.value = null;
		writePersistedViewportLodUserScale(null);
		return store.viewportLod.effectiveScale.value;
	}

	return {
		setViewportLodScale,
		resetViewportLodScale,
	};
}
