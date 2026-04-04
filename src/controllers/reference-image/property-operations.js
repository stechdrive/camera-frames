export function createReferenceImagePropertyOperations({
	createReferenceImageItem,
	getSelectedItemIds,
	getDocument,
	getResolvedShotItems,
	runReferenceImageHistoryAction,
	updateResolvedReferenceImageItem,
	commitResolvedItems,
} = {}) {
	function setReferenceImagePreviewVisible(itemId, nextVisible) {
		runReferenceImageHistoryAction("reference-image.preview-visible", () => {
			updateResolvedReferenceImageItem(itemId, {
				previewVisible: nextVisible !== false,
			});
		});
	}

	function setSelectedReferenceImagesPreviewVisible(nextVisible) {
		const selectedItemIdSet = new Set(getSelectedItemIds());
		if (selectedItemIdSet.size === 0) {
			return false;
		}
		const documentState = getDocument();
		const resolved = getResolvedShotItems(documentState);
		runReferenceImageHistoryAction("reference-image.preview-visible", () => {
			const nextItems = resolved.items.map((item) =>
				selectedItemIdSet.has(item.id)
					? createReferenceImageItem({
							...item,
							previewVisible: nextVisible !== false,
						})
					: item,
			);
			commitResolvedItems(documentState, resolved, nextItems);
		});
		return true;
	}

	function setReferenceImageExportEnabled(itemId, nextEnabled) {
		runReferenceImageHistoryAction("reference-image.export-enabled", () => {
			updateResolvedReferenceImageItem(itemId, {
				exportEnabled: nextEnabled !== false,
			});
		});
	}

	function setSelectedReferenceImagesExportEnabled(nextEnabled) {
		const selectedItemIdSet = new Set(getSelectedItemIds());
		if (selectedItemIdSet.size === 0) {
			return false;
		}
		const documentState = getDocument();
		const resolved = getResolvedShotItems(documentState);
		runReferenceImageHistoryAction("reference-image.export-enabled", () => {
			const nextItems = resolved.items.map((item) =>
				selectedItemIdSet.has(item.id)
					? createReferenceImageItem({
							...item,
							exportEnabled: nextEnabled !== false,
						})
					: item,
			);
			commitResolvedItems(documentState, resolved, nextItems);
		});
		return true;
	}

	function setSelectedReferenceImagesOpacity(nextOpacityPercent) {
		const selectedItemIdSet = new Set(getSelectedItemIds());
		if (selectedItemIdSet.size === 0) {
			return false;
		}
		const numericValue = Math.round(Number(nextOpacityPercent));
		if (!Number.isFinite(numericValue)) {
			return false;
		}
		const clampedOpacity = Math.max(0, Math.min(1, numericValue / 100));
		const documentState = getDocument();
		const resolved = getResolvedShotItems(documentState);
		runReferenceImageHistoryAction("reference-image.opacity", () => {
			const nextItems = resolved.items.map((item) =>
				selectedItemIdSet.has(item.id)
					? createReferenceImageItem({
							...item,
							opacity: clampedOpacity,
						})
					: item,
			);
			commitResolvedItems(documentState, resolved, nextItems);
		});
		return true;
	}

	function setReferenceImageOpacity(itemId, nextOpacityPercent) {
		const numericValue = Math.round(Number(nextOpacityPercent));
		if (!Number.isFinite(numericValue)) {
			return;
		}
		runReferenceImageHistoryAction("reference-image.opacity", () => {
			updateResolvedReferenceImageItem(itemId, {
				opacity: Math.max(0, Math.min(1, numericValue / 100)),
			});
		});
	}

	function setReferenceImageScalePct(itemId, nextScalePct) {
		const numericValue = Number(nextScalePct);
		if (!Number.isFinite(numericValue) || numericValue <= 0) {
			return;
		}
		runReferenceImageHistoryAction("reference-image.scale", () => {
			updateResolvedReferenceImageItem(itemId, {
				scalePct: numericValue,
			});
		});
	}

	function setReferenceImageRotationDeg(itemId, nextRotationDeg) {
		const numericValue = Number(nextRotationDeg);
		if (!Number.isFinite(numericValue)) {
			return;
		}
		runReferenceImageHistoryAction("reference-image.rotation", () => {
			updateResolvedReferenceImageItem(itemId, {
				rotationDeg: numericValue,
			});
		});
	}

	function setReferenceImageOffsetPx(itemId, axis, nextOffsetPx) {
		const normalizedAxis = axis === "y" ? "y" : "x";
		const numericValue = Math.round(Number(nextOffsetPx));
		if (!Number.isFinite(numericValue)) {
			return;
		}
		runReferenceImageHistoryAction(
			`reference-image.offset.${normalizedAxis}`,
			() => {
				updateResolvedReferenceImageItem(itemId, (item) => ({
					offsetPx: {
						...item.offsetPx,
						[normalizedAxis]: numericValue,
					},
				}));
			},
		);
	}

	return {
		setReferenceImagePreviewVisible,
		setSelectedReferenceImagesPreviewVisible,
		setReferenceImageExportEnabled,
		setSelectedReferenceImagesExportEnabled,
		setSelectedReferenceImagesOpacity,
		setReferenceImageOpacity,
		setReferenceImageScalePct,
		setReferenceImageRotationDeg,
		setReferenceImageOffsetPx,
	};
}
