export function clearExportOverlay(store) {
	if (store.overlay.value?.source === "export") {
		store.overlay.value = null;
	}
}

export function showExportErrorOverlay(
	error,
	{
		store,
		t,
		clearExportOverlay: clearExportOverlayFn = clearExportOverlay,
	} = {},
) {
	const detail =
		error instanceof Error ? error.stack || error.message : String(error ?? "");
	store.overlay.value = {
		source: "export",
		kind: "error",
		title: t("overlay.exportErrorTitle"),
		message: t("overlay.exportErrorMessage"),
		detail,
		detailLabel: t("overlay.errorDetails"),
		actions: [
			{
				label: t("action.close"),
				primary: true,
				onClick: () => clearExportOverlayFn(store),
			},
		],
	};
}

export function setExportProgressOverlay(
	targetDocuments,
	currentIndex,
	exportFormat,
	startedAt,
	phaseState = null,
	{ store, t, buildExportProgressOverlay } = {},
) {
	store.overlay.value = buildExportProgressOverlay({
		targetDocuments,
		currentIndex,
		exportFormat,
		startedAt,
		phaseState,
		t,
	});
}

export function createExportOptionsFacade({ store, t, setStatus } = {}) {
	function setExportTarget(nextValue) {
		const target =
			nextValue === "all" || nextValue === "selected" ? nextValue : "current";
		store.exportOptions.target.value = target;
		if (
			target === "selected" &&
			store.exportOptions.presetIds.value.length === 0 &&
			store.workspace.activeShotCameraId.value
		) {
			store.exportOptions.presetIds.value = [
				store.workspace.activeShotCameraId.value,
			];
		}
		setStatus(
			t("status.exportTargetChanged", {
				target: t(`exportTarget.${target}`),
			}),
		);
	}

	function toggleExportPreset(shotCameraId) {
		const nextIds = new Set(store.exportOptions.presetIds.value);
		if (nextIds.has(shotCameraId)) {
			nextIds.delete(shotCameraId);
		} else {
			nextIds.add(shotCameraId);
		}

		store.exportOptions.presetIds.value = store.workspace.shotCameras.value
			.filter((documentState) => nextIds.has(documentState.id))
			.map((documentState) => documentState.id);
		setStatus(
			t("status.exportPresetSelection", {
				count: store.exportOptions.presetIds.value.length,
			}),
		);
	}

	function setReferenceImageExportSessionEnabled(nextEnabled) {
		store.referenceImages.exportSessionEnabled.value = nextEnabled !== false;
	}

	return {
		setExportTarget,
		toggleExportPreset,
		setReferenceImageExportSessionEnabled,
	};
}
