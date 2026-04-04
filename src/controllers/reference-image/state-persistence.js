export function createReferenceImageStatePersistence({
	store,
	getDocument,
	setDocument,
	getSelectedItemIds,
	getTransformContext,
	getResolvedPreset,
	clearSelection,
	setSelectionState,
	setStoredSelectionBox,
	syncUiState,
	updateUi,
	refreshUiAfterLayout,
	createEmptyDocument,
	cloneDocument,
	captureEditorStateSnapshot,
	normalizeEditorStateForRestore,
	getRememberedSelectionState,
	setRememberedSelectionState,
}) {
	function captureProjectReferenceImagesState() {
		return cloneDocument(getDocument());
	}

	function captureReferenceImageEditorState(options = {}) {
		const rememberedSelectionState = getRememberedSelectionState();
		return captureEditorStateSnapshot({
			selectedItemIds: getSelectedItemIds(),
			selectedItemId: store.referenceImages.selectedItemId.value,
			selectedAssetId: store.referenceImages.selectedAssetId.value,
			selectionAnchor: store.referenceImages.selectionAnchor.value,
			selectionBoxLogical: store.referenceImages.selectionBoxLogical.value,
			rememberedSelectedItemIds: rememberedSelectionState.selectedItemIds,
			rememberedActiveItemId: rememberedSelectionState.activeItemId,
			previewSessionVisible: store.referenceImages.previewSessionVisible.value,
			includePreviewSessionVisible:
				options?.includePreviewSessionVisible !== false,
		});
	}

	function restoreReferenceImageEditorState(editorState = null, options = {}) {
		const restoredEditorState = normalizeEditorStateForRestore(
			editorState,
			options,
		);
		if (restoredEditorState.shouldUpdatePreviewSessionVisible) {
			store.referenceImages.previewSessionVisible.value =
				restoredEditorState.previewSessionVisible;
		}
		if (!restoredEditorState.hasEditorState) {
			clearSelection();
			setRememberedSelectionState(restoredEditorState.rememberedSelectionState);
			return;
		}
		setSelectionState({
			selectedItemIds: restoredEditorState.selectedItemIds,
			activeItemId: restoredEditorState.selectedItemId,
			activeAssetId: restoredEditorState.selectedAssetId,
		});
		setRememberedSelectionState(restoredEditorState.rememberedSelectionState);
		if (
			restoredEditorState.selectedItemIds.length > 1 &&
			restoredEditorState.selectionBoxLogical
		) {
			const nextSelectionAnchor = restoredEditorState.selectionAnchor;
			store.referenceImages.selectionAnchor.value = nextSelectionAnchor;
			setStoredSelectionBox(
				restoredEditorState.selectionBoxLogical,
				getTransformContext(),
				nextSelectionAnchor,
			);
			return;
		}
		store.referenceImages.selectionAnchor.value = null;
		setStoredSelectionBox(null);
	}

	function applyProjectReferenceImagesState(documentState, options = {}) {
		const editorState = options?.editorState ?? null;
		setDocument(documentState ?? createEmptyDocument());
		store.referenceImages.previewSessionVisible.value =
			editorState?.previewSessionVisible !== false;
		store.referenceImages.exportSessionEnabled.value = true;
		clearSelection();
		syncUiState();
		restoreReferenceImageEditorState(editorState);
		updateUi?.();
		refreshUiAfterLayout({
			expectedVisibleItems: getResolvedPreset()?.items.filter(
				(item) => item.previewVisible !== false,
			).length,
		});
	}

	function clearReferenceImages() {
		setDocument(createEmptyDocument());
		store.referenceImages.previewSessionVisible.value = true;
		store.referenceImages.exportSessionEnabled.value = true;
		clearSelection();
		syncUiState();
		updateUi?.();
	}

	return {
		captureProjectReferenceImagesState,
		captureReferenceImageEditorState,
		restoreReferenceImageEditorState,
		applyProjectReferenceImagesState,
		clearReferenceImages,
	};
}
