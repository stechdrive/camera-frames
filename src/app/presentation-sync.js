export function createPresentationSync({
	store,
	state,
	currentLocale,
	t,
	resetLocalizedCaches,
	getTotalLoadedItems,
	getReferenceImageController,
	getReferenceImageRenderController,
	getProjectController,
	getUiSyncController,
	isProjectPresentationSyncSuspended = () => false,
	updateCameraSummary,
} = {}) {
	let lastReferenceImageUiError = "";
	let lastReferenceImagePreviewError = "";

	function setStatus(message) {
		store.statusLine.value = message;
	}

	function safeSyncReferenceImageUi() {
		try {
			getReferenceImageController?.()?.syncUiState?.();
			lastReferenceImageUiError = "";
		} catch (error) {
			const nextMessage =
				error instanceof Error
					? error.message
					: String(error ?? "Unknown error");
			if (nextMessage !== lastReferenceImageUiError) {
				lastReferenceImageUiError = nextMessage;
				console.error("[CAMERA_FRAMES] reference-image ui sync failed", error);
			}
		}
	}

	function safeSyncReferenceImagePreview() {
		try {
			getReferenceImageRenderController?.()?.syncPreviewLayers?.();
			lastReferenceImagePreviewError = "";
		} catch (error) {
			const nextMessage =
				error instanceof Error
					? error.message
					: String(error ?? "Unknown error");
			if (nextMessage !== lastReferenceImagePreviewError) {
				lastReferenceImagePreviewError = nextMessage;
				console.error(
					"[CAMERA_FRAMES] reference-image preview sync failed",
					error,
				);
			}
			getReferenceImageRenderController?.()?.clearPreviewLayers?.();
		}
	}

	function setExportStatus(key, busy = false) {
		state.exportStatusKey = key;
		state.exportBusy = busy;
		store.exportStatusKey.value = key;
		store.exportBusy.value = busy;
	}

	function updateUi({ syncProjectPresentation = true } = {}) {
		safeSyncReferenceImageUi();
		safeSyncReferenceImagePreview();
		if (!isProjectPresentationSyncSuspended() && syncProjectPresentation) {
			getProjectController?.()?.syncProjectPresentation?.();
		}
		return getUiSyncController?.()?.updateUi?.();
	}

	function setLocale(nextLocale) {
		if (nextLocale === currentLocale()) {
			return;
		}

		store.locale.value = nextLocale;
		resetLocalizedCaches();
		if (getTotalLoadedItems() === 0) {
			store.exportSummary.value = t("exportSummary.empty");
		}
		updateUi();
		updateCameraSummary?.();
		setStatus(
			t("status.localeChanged", {
				language: t(`localeName.${nextLocale}`),
			}),
		);
	}

	return {
		setLocale,
		setStatus,
		safeSyncReferenceImageUi,
		safeSyncReferenceImagePreview,
		setExportStatus,
		updateUi,
	};
}
