export function createReferenceImageUiStateSync({
	store,
	referenceImageDefaultPresetId,
	buildReferenceImageSizeLabel,
	getDocument,
	getResolvedShotItems,
	getSelectedItemIds,
	getValidSelectionState,
	setSelectionState,
	isReferenceImageDragActive = () => false,
	getTransformContext,
	buildLogicalItemGeometry,
	doesReferenceImageSelectionBoxMatchGeometries,
	buildReferenceImageSelectionBoxLogicalFromGeometries,
	setStoredSelectionBox,
	initializeMultiSelectionTransformBox,
}) {
	function syncSelectionState(documentState, resolved) {
		const assetIds = new Set(
			(documentState?.assets ?? []).map((asset) => asset.id),
		);
		let nextSelectedAssetId = store.referenceImages.selectedAssetId.value;
		if (!assetIds.has(nextSelectedAssetId)) {
			nextSelectedAssetId = "";
		}
		const normalized = getValidSelectionState({
			items: resolved?.items ?? [],
			selectedItemIds: getSelectedItemIds(),
			activeItemId: store.referenceImages.selectedItemId.value,
		});
		if (!normalized.activeItemId && nextSelectedAssetId) {
			const matchingItems = (resolved?.items ?? []).filter(
				(item) => item.assetId === nextSelectedAssetId,
			);
			normalized.selectedItemIds = matchingItems.map((item) => item.id);
			normalized.activeItemId =
				matchingItems[matchingItems.length - 1]?.id ?? "";
			normalized.activeAssetId = nextSelectedAssetId;
		}
		setSelectionState({
			selectedItemIds: normalized.selectedItemIds,
			activeItemId: normalized.activeItemId,
			activeAssetId: normalized.activeAssetId || nextSelectedAssetId,
		});
	}

	function syncUiState() {
		const documentState = getDocument();
		const resolved = getResolvedShotItems(documentState);
		const resolvedPreset = resolved.preset;
		const assetsById = resolved.assetsById;
		const usageCounts = new Map();
		for (const item of resolved.items) {
			usageCounts.set(item.assetId, (usageCounts.get(item.assetId) ?? 0) + 1);
		}

		store.referenceImages.assetCount.value = documentState.assets.length;
		store.referenceImages.assets.value = documentState.assets.map((asset) => ({
			id: asset.id,
			label: asset.label,
			fileName: asset.sourceMeta?.filename ?? asset.label ?? "",
			sizeLabel: buildReferenceImageSizeLabel(asset.sourceMeta),
			currentCameraCount: usageCounts.get(asset.id) ?? 0,
		}));
		store.referenceImages.presets.value = (documentState.presets ?? []).map(
			(preset) => ({
				id: preset.id,
				name: preset.name,
				itemCount: preset.items.length,
				isBlank: preset.id === referenceImageDefaultPresetId,
			}),
		);
		store.referenceImages.panelPresetId.value = resolvedPreset?.id ?? "";
		store.referenceImages.panelPresetName.value = resolvedPreset?.name ?? "";
		store.referenceImages.items.value = resolved.items.map((item) => {
			const asset = assetsById.get(item.assetId) ?? null;
			return {
				id: item.id,
				assetId: item.assetId,
				name: item.name,
				group: item.group,
				order: item.order,
				previewVisible: item.previewVisible,
				exportEnabled: item.exportEnabled,
				opacity: item.opacity,
				scalePct: item.scalePct,
				rotationDeg: item.rotationDeg,
				offsetPx: {
					x: item.offsetPx.x,
					y: item.offsetPx.y,
				},
				anchor: {
					ax: item.anchor.ax,
					ay: item.anchor.ay,
				},
				fileName: asset?.sourceMeta?.filename ?? asset?.label ?? "",
				sizeLabel: buildReferenceImageSizeLabel(asset?.sourceMeta),
			};
		});
		syncSelectionState(documentState, resolved);
		if (!isReferenceImageDragActive?.() && getSelectedItemIds().length > 1) {
			const context = getTransformContext(documentState);
			if (context) {
				const geometries = resolved.items
					.filter((item) => getSelectedItemIds().includes(item.id))
					.map((item) => {
						const asset = resolved.assetsById.get(item.assetId) ?? null;
						if (!asset?.sourceMeta) {
							return null;
						}
						return buildLogicalItemGeometry(item, asset, context);
					})
					.filter(Boolean);
				const storedSelectionBox =
					store.referenceImages.selectionBoxLogical.value ?? null;
				if (
					!storedSelectionBox ||
					!doesReferenceImageSelectionBoxMatchGeometries(
						storedSelectionBox,
						geometries,
					)
				) {
					const preservedSelectionAnchor =
						store.referenceImages.selectionAnchor.value &&
						Number.isFinite(store.referenceImages.selectionAnchor.value.x) &&
						Number.isFinite(store.referenceImages.selectionAnchor.value.y)
							? {
									x: store.referenceImages.selectionAnchor.value.x,
									y: store.referenceImages.selectionAnchor.value.y,
								}
							: storedSelectionBox &&
									Number.isFinite(storedSelectionBox.anchorX) &&
									Number.isFinite(storedSelectionBox.anchorY)
								? {
										x: storedSelectionBox.anchorX,
										y: storedSelectionBox.anchorY,
									}
								: null;
					const rebuiltSelectionBox =
						storedSelectionBox && preservedSelectionAnchor
							? buildReferenceImageSelectionBoxLogicalFromGeometries(
									geometries,
									{
										rotationDeg: storedSelectionBox.rotationDeg ?? 0,
										anchorX: preservedSelectionAnchor.x,
										anchorY: preservedSelectionAnchor.y,
										anchorPoint: {
											x:
												storedSelectionBox.left +
												storedSelectionBox.width * preservedSelectionAnchor.x,
											y:
												storedSelectionBox.top +
												storedSelectionBox.height * preservedSelectionAnchor.y,
										},
									},
								)
							: null;
					if (rebuiltSelectionBox && preservedSelectionAnchor) {
						store.referenceImages.selectionAnchor.value =
							preservedSelectionAnchor;
						setStoredSelectionBox(
							rebuiltSelectionBox,
							context,
							preservedSelectionAnchor,
						);
					} else {
						store.referenceImages.selectionAnchor.value = null;
						initializeMultiSelectionTransformBox(
							store.referenceImages.items.value,
						);
					}
				}
			}
		}
	}

	return {
		syncSelectionState,
		syncUiState,
	};
}
