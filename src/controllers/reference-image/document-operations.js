export function createReferenceImageDocumentOperations({
	createReferenceImageItem,
	createReferenceImagePreset,
	createShotCameraReferenceImagesState,
	createReferenceImageCameraPresetOverride,
	isReferenceImageOverrideEmpty,
	buildDuplicatePresetName,
	buildReferenceImageOverridePatch,
	findMutablePresetInDocument,
	sanitizeReferenceImagePresetName,
	normalizeReferenceImageItemOrderInPlace,
	pruneUnusedReferenceImageAssetsInDocument,
	referenceImageDefaultPresetId,
	cloneDocument,
	getSelectedItemIds,
	getDocument,
	getResolvedShotItems,
	setDocument,
	clearSelection,
	syncUiState,
	updateUi,
	updateActiveShotCameraDocument,
	dropReferencePresetFromAllShotCameras,
	removeReferenceItemsFromAllShotCameras,
	runHistoryAction,
}) {
	function runReferenceImageHistoryAction(label, applyChange) {
		return runHistoryAction?.(label, applyChange) ?? false;
	}

	function commitResolvedItems(documentState, resolved, nextItems) {
		const presetId = resolved?.preset?.id ?? null;
		if (!presetId) {
			return false;
		}
		const preset = findMutablePresetInDocument(documentState, presetId);
		if (!preset) {
			return false;
		}

		const normalizedItems = normalizeReferenceImageItemOrderInPlace(
			nextItems.map((item) => createReferenceImageItem(item)),
		);
		const baseItemsById = new Map(
			preset.items.map((item) => [item.id, createReferenceImageItem(item)]),
		);
		const nextOverrideItems = {};
		for (const item of normalizedItems) {
			const baseItem = baseItemsById.get(item.id) ?? null;
			if (!baseItem) {
				continue;
			}
			const patch = buildReferenceImageOverridePatch(baseItem, item);
			if (Object.keys(patch).length > 0) {
				nextOverrideItems[item.id] = patch;
			}
		}

		updateActiveShotCameraDocument((shotCameraDocument) => {
			const nextReferenceImages = createShotCameraReferenceImagesState(
				shotCameraDocument.referenceImages,
			);
			nextReferenceImages.presetId = presetId;
			const nextOverride = createReferenceImageCameraPresetOverride(
				nextReferenceImages.overridesByPresetId?.[presetId] ?? null,
			);
			nextOverride.items = nextOverrideItems;
			const nextOverridesByPresetId = {
				...nextReferenceImages.overridesByPresetId,
			};
			if (isReferenceImageOverrideEmpty(nextOverride)) {
				delete nextOverridesByPresetId[presetId];
			} else {
				nextOverridesByPresetId[presetId] = nextOverride;
			}
			nextReferenceImages.overridesByPresetId = nextOverridesByPresetId;
			shotCameraDocument.referenceImages = nextReferenceImages;
			return shotCameraDocument;
		});
		syncUiState();
		updateUi?.();
		return true;
	}

	function updateResolvedReferenceImageItem(itemId, patchOrUpdater) {
		const documentState = getDocument();
		const resolved = getResolvedShotItems(documentState);
		const existingItem =
			resolved.items.find((item) => item.id === itemId) ?? null;
		if (!existingItem || !resolved.preset) {
			return false;
		}
		const nextItems = resolved.items.map((item) => {
			if (item.id !== itemId) {
				return item;
			}
			const patch =
				typeof patchOrUpdater === "function"
					? patchOrUpdater(item)
					: patchOrUpdater;
			return createReferenceImageItem({
				...item,
				...(patch ?? {}),
			});
		});
		return commitResolvedItems(documentState, resolved, nextItems);
	}

	function setActiveReferenceImagePreset(presetId) {
		const nextPresetId = String(presetId ?? "").trim();
		const documentState = getDocument();
		const nextPreset =
			findMutablePresetInDocument(documentState, nextPresetId) ??
			findMutablePresetInDocument(
				documentState,
				referenceImageDefaultPresetId,
			) ??
			null;
		if (!nextPreset) {
			return false;
		}
		documentState.activePresetId = nextPreset.id;
		setDocument(documentState);
		updateActiveShotCameraDocument((shotCameraDocument) => {
			const nextReferenceImages = createShotCameraReferenceImagesState(
				shotCameraDocument.referenceImages,
			);
			nextReferenceImages.presetId = nextPreset.id;
			shotCameraDocument.referenceImages = nextReferenceImages;
			return shotCameraDocument;
		});
		clearSelection();
		syncUiState();
		updateUi?.();
		return true;
	}

	function setActiveReferenceImagePresetName(nextValue) {
		const documentState = cloneDocument(getDocument());
		const activePreset =
			findMutablePresetInDocument(
				documentState,
				documentState.activePresetId,
			) ?? null;
		if (!activePreset || activePreset.id === referenceImageDefaultPresetId) {
			return false;
		}
		const nextName = sanitizeReferenceImagePresetName(
			nextValue,
			activePreset.name || "Reference",
		);
		if (!nextName || nextName === activePreset.name) {
			return false;
		}
		runReferenceImageHistoryAction("reference-image.preset.rename", () => {
			activePreset.name = nextName;
			setDocument(documentState);
			syncUiState();
			updateUi?.();
		});
		return true;
	}

	function deleteActiveReferenceImagePreset() {
		const documentState = cloneDocument(getDocument());
		const activePreset =
			findMutablePresetInDocument(
				documentState,
				documentState.activePresetId,
			) ?? null;
		if (!activePreset || activePreset.id === referenceImageDefaultPresetId) {
			return false;
		}
		const nextPreset =
			findMutablePresetInDocument(
				documentState,
				referenceImageDefaultPresetId,
			) ??
			documentState.presets.find((preset) => preset.id !== activePreset.id) ??
			null;
		if (!nextPreset) {
			return false;
		}
		runReferenceImageHistoryAction("reference-image.preset.delete", () => {
			documentState.presets = documentState.presets.filter(
				(preset) => preset.id !== activePreset.id,
			);
			documentState.activePresetId = nextPreset.id;
			pruneUnusedReferenceImageAssetsInDocument(documentState);
			setDocument(documentState);
			dropReferencePresetFromAllShotCameras(activePreset.id, nextPreset.id);
			clearSelection();
			syncUiState();
			updateUi?.();
		});
		return true;
	}

	function duplicateActiveReferenceImagePreset() {
		const documentState = getDocument();
		const resolved = getResolvedShotItems(documentState);
		if (!resolved.preset) {
			return false;
		}
		const nextPreset = createReferenceImagePreset({
			name: buildDuplicatePresetName(resolved.preset.name),
			baseRenderBox: resolved.preset.baseRenderBox,
			items: resolved.items.map((item) => ({
				assetId: item.assetId,
				name: item.name,
				group: item.group,
				order: item.order,
				previewVisible: item.previewVisible,
				exportEnabled: item.exportEnabled,
				opacity: item.opacity,
				scalePct: item.scalePct,
				rotationDeg: item.rotationDeg,
				offsetPx: item.offsetPx,
				anchor: item.anchor,
			})),
		});
		runReferenceImageHistoryAction("reference-image.preset.duplicate", () => {
			const nextDocument = cloneDocument(documentState);
			nextDocument.presets.push(nextPreset);
			nextDocument.activePresetId = nextPreset.id;
			setDocument(nextDocument);
			updateActiveShotCameraDocument((shotCameraDocument) => {
				const nextReferenceImages = createShotCameraReferenceImagesState(
					shotCameraDocument.referenceImages,
				);
				nextReferenceImages.presetId = nextPreset.id;
				shotCameraDocument.referenceImages = nextReferenceImages;
				return shotCameraDocument;
			});
			clearSelection();
			syncUiState();
			updateUi?.();
		});
		return true;
	}

	function deleteSelectedReferenceImageItems(itemIds = null) {
		const documentState = cloneDocument(getDocument());
		const resolved = getResolvedShotItems(documentState);
		const presetId = resolved?.preset?.id ?? null;
		if (!presetId) {
			return false;
		}
		const nextSelectedItemIds =
			Array.isArray(itemIds) && itemIds.length > 0
				? itemIds
				: getSelectedItemIds();
		const deletedItemIdSet = new Set(
			nextSelectedItemIds
				.map((itemId) => String(itemId ?? "").trim())
				.filter(Boolean),
		);
		if (deletedItemIdSet.size === 0) {
			return false;
		}
		const preset = findMutablePresetInDocument(documentState, presetId);
		if (!preset) {
			return false;
		}
		const nextItems = preset.items.filter(
			(item) => !deletedItemIdSet.has(item.id),
		);
		if (nextItems.length === preset.items.length) {
			return false;
		}
		runReferenceImageHistoryAction("reference-image.delete", () => {
			preset.items = nextItems;
			normalizeReferenceImageItemOrderInPlace(preset.items);
			pruneUnusedReferenceImageAssetsInDocument(documentState);
			setDocument(documentState);
			removeReferenceItemsFromAllShotCameras(
				presetId,
				Array.from(deletedItemIdSet),
			);
			clearSelection();
			syncUiState();
			updateUi?.();
		});
		return true;
	}

	return {
		runReferenceImageHistoryAction,
		commitResolvedItems,
		updateResolvedReferenceImageItem,
		setActiveReferenceImagePreset,
		setActiveReferenceImagePresetName,
		deleteActiveReferenceImagePreset,
		duplicateActiveReferenceImagePreset,
		deleteSelectedReferenceImageItems,
	};
}
