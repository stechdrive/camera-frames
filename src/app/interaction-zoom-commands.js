export function createInteractionZoomCommands({
	getInteractionController,
	getMeasurementController,
} = {}) {
	function isZoomToolActive() {
		return getInteractionController?.()?.isZoomToolActive?.() ?? false;
	}

	function isInteractiveTextTarget(target) {
		return (
			getInteractionController?.()?.isInteractiveTextTarget?.(target) ?? false
		);
	}

	function clearZoomToolDrag() {
		return getInteractionController?.()?.clearZoomToolDrag?.();
	}

	function applyInteractionMode(nextMode, { silent = false } = {}) {
		return getInteractionController?.()?.applyInteractionMode?.(nextMode, {
			silent,
		});
	}

	function toggleZoomTool() {
		if (
			!(getInteractionController?.()?.isZoomToolActive?.() ?? false) &&
			getMeasurementController?.()?.isMeasurementModeActive?.()
		) {
			getMeasurementController?.()?.setMeasurementMode?.(false, {
				silent: true,
			});
		}
		return getInteractionController?.()?.toggleZoomTool?.();
	}

	function startZoomToolDrag(event) {
		return getInteractionController?.()?.startZoomToolDrag?.(event) ?? false;
	}

	function handleZoomToolDragMove(event) {
		return getInteractionController?.()?.handleZoomToolDragMove?.(event);
	}

	function handleZoomToolDragEnd(event) {
		return getInteractionController?.()?.handleZoomToolDragEnd?.(event);
	}

	return {
		isZoomToolActive,
		isInteractiveTextTarget,
		clearZoomToolDrag,
		applyInteractionMode,
		toggleZoomTool,
		startZoomToolDrag,
		handleZoomToolDragMove,
		handleZoomToolDragEnd,
	};
}
