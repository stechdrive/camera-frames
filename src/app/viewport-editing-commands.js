import {
	WORKSPACE_PANE_CAMERA,
	WORKSPACE_PANE_VIEWPORT,
} from "../workspace-model.js";

export function createViewportEditingCommands({
	store,
	state,
	getAssetController,
	getCameraController,
	getFrameController,
	getInteractionController,
	getMeasurementController,
	getReferenceImageController,
	getViewportToolController,
	clearFrameSelection,
	clearOutputFrameSelection,
}) {
	function setViewportToolMode(nextMode) {
		if (nextMode !== "none") {
			getMeasurementController()?.setMeasurementMode?.(false, { silent: true });
		}
		switch (nextMode) {
			case "select":
				getViewportToolController()?.setViewportSelectMode(true);
				break;
			case "reference":
				getViewportToolController()?.setViewportReferenceImageEditMode(true);
				break;
			case "transform":
				getViewportToolController()?.setViewportTransformMode(true);
				break;
			case "pivot":
				getViewportToolController()?.setViewportPivotEditMode(true);
				break;
			default:
				getViewportToolController()?.setViewportTransformMode(false);
				break;
		}
		getInteractionController()?.syncControlsToMode?.();
	}

	function setViewportPivotEditMode(nextEnabled) {
		setViewportToolMode(nextEnabled ? "pivot" : "none");
	}

	function setViewportSelectMode(nextEnabled) {
		setViewportToolMode(nextEnabled ? "select" : "none");
	}

	function setViewportReferenceImageEditMode(nextEnabled) {
		setViewportToolMode(nextEnabled ? "reference" : "none");
		if (nextEnabled) {
			getReferenceImageController()?.ensureReferenceImageEditingSelection?.();
		}
	}

	function setViewportTransformMode(nextEnabled) {
		setViewportToolMode(nextEnabled ? "transform" : "none");
	}

	function toggleViewportSelectMode() {
		setViewportSelectMode(!store.viewportSelectMode.value);
	}

	function toggleViewportTransformMode() {
		setViewportTransformMode(!store.viewportTransformMode.value);
	}

	function toggleViewportReferenceImageEditMode() {
		setViewportReferenceImageEditMode(
			!store.viewportReferenceImageEditMode.value,
		);
	}

	function toggleViewportPivotEditMode() {
		setViewportPivotEditMode(!store.viewportPivotEditMode.value);
	}

	function setMeasurementMode(nextEnabled, options) {
		if (nextEnabled) {
			getInteractionController()?.applyNavigateInteractionMode?.({
				silent: true,
			});
		}
		return getMeasurementController()?.setMeasurementMode?.(
			nextEnabled,
			options,
		);
	}

	function toggleMeasurementMode() {
		return setMeasurementMode(
			!(getMeasurementController()?.isMeasurementModeActive?.() ?? false),
		);
	}

	function clearViewportEditingSelection() {
		getAssetController()?.clearSceneAssetSelection?.();
		getReferenceImageController()?.clearReferenceImageSelection?.();
		clearFrameSelection?.();
		clearOutputFrameSelection?.();
		setMeasurementMode(false, { silent: true });
		setViewportToolMode("none");
	}

	function handleViewportPieAction(actionId, pointerEvent = null) {
		switch (actionId) {
			case "tool-none":
				clearViewportEditingSelection();
				return true;
			case "tool-select":
				setViewportSelectMode(!store.viewportSelectMode.value);
				return true;
			case "tool-reference":
				setViewportReferenceImageEditMode(
					!store.viewportReferenceImageEditMode.value,
				);
				return true;
			case "toggle-reference-preview":
				if ((store.referenceImages.items.value?.length ?? 0) === 0) {
					return false;
				}
				getReferenceImageController()?.setPreviewSessionVisible?.(
					!(store.referenceImages.previewSessionVisible.value !== false),
				);
				return true;
			case "tool-transform":
				setViewportTransformMode(!store.viewportTransformMode.value);
				return true;
			case "tool-pivot":
				setViewportPivotEditMode(!store.viewportPivotEditMode.value);
				return true;
			case "toggle-view-mode":
				getCameraController()?.setMode(
					state.mode === WORKSPACE_PANE_CAMERA
						? WORKSPACE_PANE_VIEWPORT
						: WORKSPACE_PANE_CAMERA,
				);
				return true;
			case "reset-view":
				getCameraController()?.resetActiveView?.();
				return true;
			case "frame-create":
				getFrameController()?.createFrame?.();
				return true;
			case "frame-mask-all":
				if (state.mode !== WORKSPACE_PANE_CAMERA) {
					return false;
				}
				getFrameController()?.toggleFrameMaskMode?.("all");
				return true;
			case "frame-mask-selected":
				if (state.mode !== WORKSPACE_PANE_CAMERA) {
					return false;
				}
				getFrameController()?.toggleFrameMaskMode?.("selected");
				return true;
			case "frame-mask-toggle":
				if (state.mode !== WORKSPACE_PANE_CAMERA) {
					return false;
				}
				getFrameController()?.togglePreferredFrameMaskMode?.();
				return true;
			case "adjust-lens":
				getMeasurementController()?.setMeasurementMode?.(false, {
					silent: true,
				});
				return (
					getInteractionController()?.activateLensAdjustMode?.(pointerEvent) ??
					false
				);
			case "clear-selection":
				clearViewportEditingSelection();
				return true;
			default:
				return false;
		}
	}

	function executeViewportPieAction(actionId, pointerEvent = null) {
		getInteractionController()?.closeViewportPieMenu?.({ silent: true });
		return handleViewportPieAction(actionId, pointerEvent);
	}

	return {
		setViewportToolMode,
		setViewportPivotEditMode,
		setViewportSelectMode,
		setViewportReferenceImageEditMode,
		setViewportTransformMode,
		toggleViewportSelectMode,
		toggleViewportTransformMode,
		toggleViewportReferenceImageEditMode,
		toggleViewportPivotEditMode,
		setMeasurementMode,
		toggleMeasurementMode,
		clearViewportEditingSelection,
		handleViewportPieAction,
		executeViewportPieAction,
	};
}
