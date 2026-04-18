import { resolveElementRect } from "./pure-utils.js";

export function createSplatEditViewportHelpers({
	state,
	viewportShell,
	getActiveCamera,
	getActiveCameraViewCamera,
}) {
	function getViewportRect() {
		return resolveElementRect(viewportShell);
	}

	function getPrimaryViewRect() {
		return getViewportRect();
	}

	function getPrimaryViewCamera() {
		return state.mode === "camera"
			? (getActiveCameraViewCamera?.() ?? getActiveCamera?.() ?? null)
			: (getActiveCamera?.() ?? null);
	}

	return {
		getViewportRect,
		getPrimaryViewRect,
		getPrimaryViewCamera,
	};
}
