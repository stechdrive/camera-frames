export function createSplatEditModeSwitch({
	store,
	state,
	t,
	setStatus,
	updateUi,
	setMeasurementMode,
	setViewportSelectMode,
	setViewportReferenceImageEditMode,
	setViewportTransformMode,
	setViewportPivotEditMode,
	applyNavigateInteractionMode,
	syncControlsToMode,
	cancelHistoryTransaction,
	resolveEntryScopeAssetIds,
	getSplatEditScopeAssetIds,
	ensureFullDataForSplatAssets = null,
	syncSelectionCount,
	syncSelectionHighlight,
	clearSelectionHighlight,
	syncSceneHelper,
	clearSplatSelection,
	clearBrushPreview,
	clearActiveBrushStroke,
	clearActiveTransformPreview,
	flushPendingSelectionHighlightSync,
	clearBrushSpatialIndices,
	getActiveBoxDrag,
	clearActiveBoxDrag,
	getActiveTransformDrag,
	clearActiveTransformDrag,
	finalizeSplatTransformDragHistory,
}) {
	function isSplatEditModeAvailable() {
		return state.mode === "viewport" || state.mode === "camera";
	}

	function isSplatEditModeActive() {
		return store.splatEdit.active.value === true;
	}

	function isSplatEditBrushActive() {
		return (
			isSplatEditModeActive() &&
			store.splatEdit.tool.value === "brush" &&
			getSplatEditScopeAssetIds().length > 0
		);
	}

	function setSplatEditTool(nextTool) {
		const previousTool = store.splatEdit.tool.value;
		const resolvedTool =
			nextTool === "brush"
				? "brush"
				: nextTool === "transform"
					? "transform"
					: "box";
		if (previousTool === "box" && resolvedTool === "box") {
			if (getActiveBoxDrag()?.historyStarted) {
				cancelHistoryTransaction?.();
			}
			clearActiveBoxDrag();
			store.splatEdit.boxPlaced.value = false;
			syncSceneHelper();
			updateUi?.();
			return store.splatEdit.tool.value;
		}
		store.splatEdit.tool.value = resolvedTool;
		if (previousTool === "box" && resolvedTool !== "box") {
			if (getActiveBoxDrag()?.historyStarted) {
				cancelHistoryTransaction?.();
			}
			clearActiveBoxDrag();
		}
		if (previousTool === "brush" && store.splatEdit.tool.value !== "brush") {
			clearActiveBrushStroke({ commitHistory: true });
			clearBrushPreview({ syncUi: false });
			flushPendingSelectionHighlightSync();
		}
		if (store.splatEdit.tool.value !== "transform") {
			clearActiveTransformPreview({ syncUi: false });
		}
		syncSceneHelper();
		if (
			(previousTool === "brush") !==
			(store.splatEdit.tool.value === "brush")
		) {
			syncControlsToMode?.();
		}
		updateUi?.();
		return store.splatEdit.tool.value;
	}

	function handleToolModeDeactivated() {
		if (!isSplatEditModeActive()) {
			return false;
		}
		if (getActiveBoxDrag()?.historyStarted) {
			cancelHistoryTransaction?.();
		}
		clearActiveBoxDrag();
		clearActiveBrushStroke({ commitHistory: true });
		clearBrushPreview({ syncUi: false });
		finalizeSplatTransformDragHistory(getActiveTransformDrag());
		clearActiveTransformDrag();
		clearActiveTransformPreview({ syncUi: false });
		syncSceneHelper();
		clearSelectionHighlight();
		updateUi?.();
		return true;
	}

	function resetForSceneChange() {
		clearSplatSelection();
		clearActiveBrushStroke();
		clearBrushPreview({ syncUi: false });
		store.splatEdit.scopeAssetIds.value = [];
		store.splatEdit.rememberedScopeAssetIds.value = [];
		store.splatEdit.boxPlaced.value = false;
		store.splatEdit.boxCenter.value = { x: 0, y: 0, z: 0 };
		store.splatEdit.boxSize.value = { x: 1, y: 1, z: 1 };
		store.splatEdit.boxRotation.value = { x: 0, y: 0, z: 0, w: 1 };
		store.splatEdit.lastOperation.value = {
			mode: "",
			hitCount: 0,
		};
		if (store.viewportToolMode.value === "splat-edit") {
			store.viewportToolMode.value = "none";
		}
		if (getActiveBoxDrag()?.historyStarted) {
			cancelHistoryTransaction?.();
		}
		clearActiveBoxDrag();
		finalizeSplatTransformDragHistory(getActiveTransformDrag());
		clearActiveTransformDrag();
		clearActiveTransformPreview({ syncUi: false });
		syncSceneHelper();
		syncControlsToMode?.();
		clearSelectionHighlight();
		clearBrushSpatialIndices();
		updateUi?.();
	}

	function setSplatEditMode(nextEnabled, { silent = false } = {}) {
		if (!isSplatEditModeAvailable()) {
			return false;
		}

		if (!nextEnabled) {
			const wasActive = isSplatEditModeActive();
			if (store.viewportToolMode.value === "splat-edit") {
				store.viewportToolMode.value = "none";
			}
			if (getActiveBoxDrag()?.historyStarted) {
				cancelHistoryTransaction?.();
			}
			clearActiveBoxDrag();
			clearActiveBrushStroke({ commitHistory: true });
			finalizeSplatTransformDragHistory(getActiveTransformDrag());
			clearActiveTransformDrag();
			clearBrushPreview({ syncUi: false });
			clearActiveTransformPreview({ syncUi: false });
			syncSceneHelper();
			syncControlsToMode?.();
			clearSelectionHighlight();
			clearBrushSpatialIndices();
			updateUi?.();
			if (wasActive && !silent) {
				setStatus?.(t("status.splatEditDisabled"));
			}
			return wasActive;
		}

		const scopeAssetIds = resolveEntryScopeAssetIds();
		if (scopeAssetIds.length === 0) {
			if (!silent) {
				setStatus?.(t("status.splatEditRequiresScope"));
			}
			return false;
		}

		const activateSplatEditMode = () => {
			setMeasurementMode?.(false, { silent: true });
			setViewportSelectMode?.(false);
			setViewportReferenceImageEditMode?.(false);
			setViewportTransformMode?.(false);
			setViewportPivotEditMode?.(false);
			applyNavigateInteractionMode?.({ silent: true });
			store.viewportToolMode.value = "splat-edit";
			const previousScopeAssetIds = getSplatEditScopeAssetIds();
			store.splatEdit.scopeAssetIds.value = [...scopeAssetIds];
			store.splatEdit.rememberedScopeAssetIds.value = [...scopeAssetIds];
			if (
				previousScopeAssetIds.length !== scopeAssetIds.length ||
				previousScopeAssetIds.some(
					(assetId, index) => assetId !== scopeAssetIds[index],
				)
			) {
				store.splatEdit.lastOperation.value = {
					mode: "",
					hitCount: 0,
				};
			}
			syncSelectionCount();
			syncSceneHelper();
			syncSelectionHighlight();
			syncControlsToMode?.();
			updateUi?.();
			if (!silent) {
				setStatus?.(
					t("status.splatEditEnabled", { count: scopeAssetIds.length }),
				);
			}
			return true;
		};

		const handleFullDataError = (error) => {
			console.error(error);
			if (!silent) {
				setStatus?.(error?.message ?? String(error));
			}
			return false;
		};

		if (typeof ensureFullDataForSplatAssets === "function") {
			try {
				const ensureResult = ensureFullDataForSplatAssets(scopeAssetIds, {
					silent,
				});
				if (ensureResult && typeof ensureResult.then === "function") {
					return ensureResult
						.then((ensured) =>
							ensured === false ? false : activateSplatEditMode(),
						)
						.catch(handleFullDataError);
				}
				if (ensureResult === false) {
					return false;
				}
			} catch (error) {
				return handleFullDataError(error);
			}
		}

		return activateSplatEditMode();
	}

	function toggleSplatEditMode() {
		return setSplatEditMode(!isSplatEditModeActive());
	}

	return {
		isSplatEditModeAvailable,
		isSplatEditModeActive,
		isSplatEditBrushActive,
		setSplatEditTool,
		handleToolModeDeactivated,
		resetForSceneChange,
		setSplatEditMode,
		toggleSplatEditMode,
	};
}
