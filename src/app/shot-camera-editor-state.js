function cloneOptionalPoint(value) {
	return value && Number.isFinite(value.x) && Number.isFinite(value.y)
		? { x: value.x, y: value.y }
		: null;
}

function cloneOptionalSelectionBox(value) {
	return value ? { ...value } : null;
}

function cloneShotCameraEditorState(editorState = null) {
	if (!editorState) {
		return {
			frameSelectionActive: false,
			frameSelectedIds: [],
			frameSelectionAnchor: null,
			frameSelectionBoxLogical: null,
			outputFrameSelected: false,
			referenceImageEditor: null,
		};
	}
	return {
		frameSelectionActive: Boolean(editorState.frameSelectionActive),
		frameSelectedIds: Array.isArray(editorState.frameSelectedIds)
			? [...editorState.frameSelectedIds]
			: [],
		frameSelectionAnchor: cloneOptionalPoint(editorState.frameSelectionAnchor),
		frameSelectionBoxLogical: cloneOptionalSelectionBox(
			editorState.frameSelectionBoxLogical,
		),
		outputFrameSelected: Boolean(editorState.outputFrameSelected),
		referenceImageEditor: editorState.referenceImageEditor
			? {
					selectedItemIds: Array.isArray(
						editorState.referenceImageEditor.selectedItemIds,
					)
						? [...editorState.referenceImageEditor.selectedItemIds]
						: [],
					selectedItemId: String(
						editorState.referenceImageEditor.selectedItemId ?? "",
					),
					selectedAssetId: String(
						editorState.referenceImageEditor.selectedAssetId ?? "",
					),
					selectionAnchor: cloneOptionalPoint(
						editorState.referenceImageEditor.selectionAnchor,
					),
					selectionBoxLogical: cloneOptionalSelectionBox(
						editorState.referenceImageEditor.selectionBoxLogical,
					),
					rememberedSelectedItemIds: Array.isArray(
						editorState.referenceImageEditor.rememberedSelectedItemIds,
					)
						? [...editorState.referenceImageEditor.rememberedSelectedItemIds]
						: [],
					rememberedActiveItemId: String(
						editorState.referenceImageEditor.rememberedActiveItemId ?? "",
					),
				}
			: null,
	};
}

function buildFallbackEditorState(shotCameraId, fallbackSnapshot) {
	return fallbackSnapshot?.activeShotCameraId === shotCameraId
		? cloneShotCameraEditorState({
				frameSelectionActive: fallbackSnapshot.frameSelectionActive,
				frameSelectedIds: fallbackSnapshot.frameSelectedIds,
				frameSelectionAnchor: fallbackSnapshot.frameSelectionAnchor,
				frameSelectionBoxLogical: fallbackSnapshot.frameSelectionBoxLogical,
				outputFrameSelected: fallbackSnapshot.outputFrameSelected,
				referenceImageEditor: fallbackSnapshot.referenceImageEditor ?? null,
			})
		: null;
}

export function createShotCameraEditorStateController({
	store,
	state,
	getReferenceImageController,
	getFrameController,
	updateUi,
}) {
	const shotCameraEditorStateById = new Map();

	function captureActiveShotCameraEditorState() {
		return cloneShotCameraEditorState({
			frameSelectionActive: store.frames.selectionActive.value,
			frameSelectedIds: [...(store.frames.selectedIds.value ?? [])],
			frameSelectionAnchor: store.frames.selectionAnchor.value,
			frameSelectionBoxLogical: store.frames.selectionBoxLogical.value,
			outputFrameSelected: state.outputFrameSelected,
			referenceImageEditor:
				getReferenceImageController()?.captureReferenceImageEditorState?.({
					includePreviewSessionVisible: false,
				}) ?? null,
		});
	}

	function storeShotCameraEditorState(shotCameraId = null) {
		const resolvedShotCameraId =
			typeof shotCameraId === "string" && shotCameraId
				? shotCameraId
				: store.workspace.activeShotCameraId.value;
		if (!resolvedShotCameraId) {
			return;
		}
		shotCameraEditorStateById.set(
			resolvedShotCameraId,
			captureActiveShotCameraEditorState(),
		);
	}

	function clearActiveShotCameraEditorState() {
		store.frames.selectionActive.value = false;
		store.frames.selectedIds.value = [];
		store.frames.selectionAnchor.value = null;
		store.frames.selectionBoxLogical.value = null;
		state.outputFrameSelected = false;
		getReferenceImageController()?.restoreReferenceImageEditorState?.(null, {
			preservePreviewSessionVisible: true,
		});
	}

	function restoreShotCameraEditorState(
		shotCameraId,
		{ fallbackSnapshot = null } = {},
	) {
		const savedState =
			shotCameraEditorStateById.get(shotCameraId) ??
			buildFallbackEditorState(shotCameraId, fallbackSnapshot);
		const validFrameIds = new Set(
			(getFrameController()?.getActiveFrames?.() ?? []).map(
				(frame) => frame.id,
			),
		);
		const nextFrameSelectedIds = Array.isArray(savedState?.frameSelectedIds)
			? savedState.frameSelectedIds.filter((frameId) =>
					validFrameIds.has(frameId),
				)
			: [];
		const frameSelectionActive =
			Boolean(savedState?.frameSelectionActive) &&
			nextFrameSelectedIds.length > 0;
		store.frames.selectionActive.value = frameSelectionActive;
		store.frames.selectedIds.value = frameSelectionActive
			? [...nextFrameSelectedIds]
			: [];
		store.frames.selectionAnchor.value =
			frameSelectionActive && nextFrameSelectedIds.length > 1
				? cloneOptionalPoint(savedState?.frameSelectionAnchor)
				: null;
		store.frames.selectionBoxLogical.value =
			frameSelectionActive && nextFrameSelectedIds.length > 1
				? cloneOptionalSelectionBox(savedState?.frameSelectionBoxLogical)
				: null;
		getFrameController()?.syncFrameSelectionTransformState?.();
		state.outputFrameSelected =
			!frameSelectionActive && Boolean(savedState?.outputFrameSelected);
		getReferenceImageController()?.restoreReferenceImageEditorState?.(
			savedState?.referenceImageEditor ?? null,
			{ preservePreviewSessionVisible: true },
		);
	}

	function pruneShotCameraEditorStates() {
		const validShotCameraIds = new Set(
			store.workspace.shotCameras.value.map(
				(documentState) => documentState.id,
			),
		);
		for (const shotCameraId of Array.from(shotCameraEditorStateById.keys())) {
			if (!validShotCameraIds.has(shotCameraId)) {
				shotCameraEditorStateById.delete(shotCameraId);
			}
		}
	}

	function captureShotCameraEditorStates() {
		pruneShotCameraEditorStates();
		storeShotCameraEditorState();
		return Object.fromEntries(
			Array.from(shotCameraEditorStateById.entries()).map(
				([shotCameraId, value]) => [
					shotCameraId,
					cloneShotCameraEditorState(value),
				],
			),
		);
	}

	function restoreShotCameraEditorStates(editorStates = null) {
		shotCameraEditorStateById.clear();
		if (!editorStates || typeof editorStates !== "object") {
			return;
		}
		for (const [shotCameraId, value] of Object.entries(editorStates)) {
			if (!shotCameraId) {
				continue;
			}
			shotCameraEditorStateById.set(
				shotCameraId,
				cloneShotCameraEditorState(value),
			);
		}
		pruneShotCameraEditorStates();
	}

	function prepareForShotCameraSwitch(currentShotCameraId) {
		pruneShotCameraEditorStates();
		if (currentShotCameraId) {
			storeShotCameraEditorState(currentShotCameraId);
		}
		clearActiveShotCameraEditorState();
	}

	function restoreAfterShotCameraSwitch(nextShotCameraId) {
		pruneShotCameraEditorStates();
		restoreShotCameraEditorState(nextShotCameraId);
		updateUi?.();
	}

	return {
		captureActiveShotCameraEditorState,
		storeShotCameraEditorState,
		clearActiveShotCameraEditorState,
		restoreShotCameraEditorState,
		captureShotCameraEditorStates,
		restoreShotCameraEditorStates,
		pruneShotCameraEditorStates,
		prepareForShotCameraSwitch,
		restoreAfterShotCameraSwitch,
	};
}
