export function createPerSplatEditController({
	store,
	state,
	t,
	setStatus,
	updateUi,
	setViewportSelectMode,
	setViewportReferenceImageEditMode,
	setViewportTransformMode,
	setViewportPivotEditMode,
	setMeasurementMode,
	applyNavigateInteractionMode,
	syncControlsToMode,
}) {
	const selectedSplatsByAssetId = new Map();

	function getSceneSplatAssets() {
		return (store.sceneAssets.value ?? []).filter(
			(asset) => asset?.kind === "splat",
		);
	}

	function normalizeScopeAssetIds(assetIds = []) {
		const validIds = new Set(getSceneSplatAssets().map((asset) => asset.id));
		return [...new Set(assetIds)].filter((assetId) => validIds.has(assetId));
	}

	function resolveEntryScopeAssetIds() {
		const selectedScopeAssetIds = normalizeScopeAssetIds(
			store.selectedSceneAssetIds.value,
		);
		if (selectedScopeAssetIds.length > 0) {
			return selectedScopeAssetIds;
		}
		return normalizeScopeAssetIds(
			store.splatEdit.rememberedScopeAssetIds.value,
		);
	}

	function syncSelectionCount() {
		let totalCount = 0;
		for (const selectedSplats of selectedSplatsByAssetId.values()) {
			totalCount += selectedSplats?.size ?? 0;
		}
		store.splatEdit.selectionCount.value = totalCount;
	}

	function clearSplatSelection() {
		selectedSplatsByAssetId.clear();
		syncSelectionCount();
		updateUi?.();
	}

	function getSplatEditScopeAssetIds() {
		return [...(store.splatEdit.scopeAssetIds.value ?? [])];
	}

	function getSplatEditScopeAssets() {
		const scopeIds = new Set(getSplatEditScopeAssetIds());
		return getSceneSplatAssets().filter((asset) => scopeIds.has(asset.id));
	}

	function isSplatEditModeAvailable() {
		return state.mode === "viewport" || state.mode === "camera";
	}

	function isSplatEditModeActive() {
		return store.splatEdit.active.value === true;
	}

	function setSplatEditTool(nextTool) {
		store.splatEdit.tool.value = nextTool === "brush" ? "brush" : "box";
		updateUi?.();
		return store.splatEdit.tool.value;
	}

	function handleToolModeDeactivated() {
		if (!isSplatEditModeActive()) {
			return false;
		}
		clearSplatSelection();
		store.splatEdit.scopeAssetIds.value = [];
		return true;
	}

	function resetForSceneChange() {
		clearSplatSelection();
		store.splatEdit.scopeAssetIds.value = [];
		store.splatEdit.rememberedScopeAssetIds.value = [];
		if (store.viewportToolMode.value === "splat-edit") {
			store.viewportToolMode.value = "none";
		}
		syncControlsToMode?.();
		updateUi?.();
	}

	function setSplatEditMode(nextEnabled, { silent = false } = {}) {
		if (!isSplatEditModeAvailable()) {
			return false;
		}

		if (!nextEnabled) {
			const wasActive = isSplatEditModeActive();
			clearSplatSelection();
			store.splatEdit.scopeAssetIds.value = [];
			if (store.viewportToolMode.value === "splat-edit") {
				store.viewportToolMode.value = "none";
			}
			syncControlsToMode?.();
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

		setMeasurementMode?.(false, { silent: true });
		setViewportSelectMode?.(false);
		setViewportReferenceImageEditMode?.(false);
		setViewportTransformMode?.(false);
		setViewportPivotEditMode?.(false);
		applyNavigateInteractionMode?.({ silent: true });
		store.viewportToolMode.value = "splat-edit";
		store.splatEdit.scopeAssetIds.value = [...scopeAssetIds];
		store.splatEdit.rememberedScopeAssetIds.value = [...scopeAssetIds];
		if (
			store.splatEdit.tool.value !== "box" &&
			store.splatEdit.tool.value !== "brush"
		) {
			store.splatEdit.tool.value = "box";
		}
		syncControlsToMode?.();
		updateUi?.();
		if (!silent) {
			setStatus?.(
				t("status.splatEditEnabled", { count: scopeAssetIds.length }),
			);
		}
		return true;
	}

	function toggleSplatEditMode() {
		return setSplatEditMode(!isSplatEditModeActive());
	}

	return {
		isSplatEditModeActive,
		setSplatEditMode,
		toggleSplatEditMode,
		setSplatEditTool,
		clearSplatSelection,
		getSplatEditScopeAssetIds,
		getSplatEditScopeAssets,
		handleToolModeDeactivated,
		resetForSceneChange,
	};
}
