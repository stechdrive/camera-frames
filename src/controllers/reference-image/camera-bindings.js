export function createReferenceImageCameraBindings({
	store,
	getActiveShotCameraDocument,
	updateActiveShotCameraDocument,
	cloneShotCameraDocument,
	createShotCameraReferenceImagesState,
	createReferenceImageCameraPresetOverride,
	isReferenceImageOverrideEmpty,
}) {
	function ensureActiveShotPresetBinding(presetId) {
		const activeShotCameraDocument = getActiveShotCameraDocument();
		if (
			!activeShotCameraDocument ||
			activeShotCameraDocument.referenceImages?.presetId === presetId
		) {
			return;
		}
		updateActiveShotCameraDocument((documentState) => {
			documentState.referenceImages = {
				...(documentState.referenceImages ?? {}),
				presetId,
				overridesByPresetId:
					documentState.referenceImages?.overridesByPresetId ?? {},
			};
			return documentState;
		});
	}

	function updateAllShotCameraReferenceImages(updateState) {
		const currentShotCameras = Array.isArray(store.workspace.shotCameras.value)
			? store.workspace.shotCameras.value
			: [];
		store.workspace.shotCameras.value = currentShotCameras.map(
			(documentState) => {
				const nextDocument = cloneShotCameraDocument(documentState);
				const nextReferenceImages = updateState(
					createShotCameraReferenceImagesState(nextDocument.referenceImages),
					nextDocument,
				);
				nextDocument.referenceImages =
					createShotCameraReferenceImagesState(nextReferenceImages);
				return nextDocument;
			},
		);
	}

	function dropReferencePresetFromAllShotCameras(
		deletedPresetId,
		fallbackPresetId,
	) {
		updateAllShotCameraReferenceImages((referenceImagesState) => {
			const nextState =
				createShotCameraReferenceImagesState(referenceImagesState);
			if (nextState.presetId === deletedPresetId) {
				nextState.presetId = fallbackPresetId ?? null;
			}
			const nextOverrides = {
				...(nextState.overridesByPresetId ?? {}),
			};
			delete nextOverrides[deletedPresetId];
			nextState.overridesByPresetId = nextOverrides;
			return nextState;
		});
	}

	function removeReferenceItemsFromAllShotCameras(presetId, deletedItemIds) {
		if (
			!presetId ||
			!Array.isArray(deletedItemIds) ||
			deletedItemIds.length === 0
		) {
			return;
		}
		const deletedItemIdSet = new Set(
			deletedItemIds
				.map((itemId) => String(itemId ?? "").trim())
				.filter(Boolean),
		);
		if (deletedItemIdSet.size === 0) {
			return;
		}
		updateAllShotCameraReferenceImages((referenceImagesState) => {
			const nextState =
				createShotCameraReferenceImagesState(referenceImagesState);
			const existingOverride =
				nextState.overridesByPresetId?.[presetId] ?? null;
			if (!existingOverride) {
				return nextState;
			}
			const nextOverride =
				createReferenceImageCameraPresetOverride(existingOverride);
			for (const deletedItemId of deletedItemIdSet) {
				delete nextOverride.items[deletedItemId];
				if (nextOverride.activeItemId === deletedItemId) {
					nextOverride.activeItemId = null;
				}
			}
			const nextOverrides = {
				...(nextState.overridesByPresetId ?? {}),
			};
			if (isReferenceImageOverrideEmpty(nextOverride)) {
				delete nextOverrides[presetId];
			} else {
				nextOverrides[presetId] = nextOverride;
			}
			nextState.overridesByPresetId = nextOverrides;
			return nextState;
		});
	}

	return {
		ensureActiveShotPresetBinding,
		updateAllShotCameraReferenceImages,
		dropReferencePresetFromAllShotCameras,
		removeReferenceItemsFromAllShotCameras,
	};
}
