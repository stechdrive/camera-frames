export function createViewportAxisGizmoControllerBindings({
	state,
	viewportAxisGizmo,
	viewportAxisGizmoSvg,
	getActiveViewportCamera,
	viewportProjectionController,
	isViewportPaneVisible = null,
} = {}) {
	return {
		state,
		axisGizmo: viewportAxisGizmo,
		axisGizmoSvg: viewportAxisGizmoSvg,
		getActiveViewportCamera,
		getViewportProjectionMode: () =>
			viewportProjectionController?.getViewportProjectionMode?.() ??
			"perspective",
		getViewportOrthoState: () =>
			viewportProjectionController?.getViewportOrthoState?.() ?? null,
		isViewportPaneVisible,
	};
}
