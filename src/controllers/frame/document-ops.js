import { FRAME_MAX_COUNT } from "../../constants.js";
import {
	createFrameDocument,
	getFrameDocumentById,
	getFrameDocumentId,
	getNextFrameNumber,
	sanitizeFrameName,
} from "../../workspace-model.js";
import {
	copyStoredFrameTrajectoryNodes,
	deleteStoredFrameTrajectoryNodes,
} from "./trajectory.js";

export function createCameraFrameDocumentOpsController({
	store,
	t,
	setStatus,
	updateUi,
	runHistoryAction,
	clearOutputFrameSelection,
	clearOutputFramePan,
	clearFrameInteraction,
	getActiveFrames,
	getActiveFrameDocument,
	updateActiveShotCameraDocument,
	buildFrameDocumentName,
	createWorkspaceFrameDocument,
	hasReachedFrameLimit,
	promoteFrameMaskShapeForMultipleFrames,
	getSelectedFrameIds,
	setSelectedFrameIds,
	setFrameMaskSelectedIds,
	getRememberedFrameMaskSelectedIds,
	syncFrameSelectionTransformState,
}) {
	function createFrame() {
		if (hasReachedFrameLimit()) {
			setStatus(
				t("status.frameLimitReached", {
					limit: FRAME_MAX_COUNT,
				}),
			);
			return;
		}

		const nextFrame = createWorkspaceFrameDocument();
		clearOutputFrameSelection();
		clearFrameInteraction();
		runHistoryAction?.("frame.create", () => {
			updateActiveShotCameraDocument((documentState) => {
				const prevFrameCount = documentState.frames.length;
				documentState.frames = [...documentState.frames, nextFrame];
				documentState.activeFrameId = nextFrame.id;
				promoteFrameMaskShapeForMultipleFrames(documentState, prevFrameCount);
				return documentState;
			});
		});
		store.frames.selectionActive.value = true;
		setSelectedFrameIds([nextFrame.id]);
		setFrameMaskSelectedIds([nextFrame.id]);
		syncFrameSelectionTransformState();
		updateUi();
		setStatus(
			t("status.createdFrame", {
				name: nextFrame.name,
			}),
		);
	}

	function duplicateActiveFrame() {
		const activeFrame = getActiveFrameDocument();
		if (!activeFrame) {
			createFrame();
			return;
		}

		if (hasReachedFrameLimit()) {
			setStatus(
				t("status.frameLimitReached", {
					limit: FRAME_MAX_COUNT,
				}),
			);
			return;
		}

		const nextFrame = createWorkspaceFrameDocument(activeFrame);
		clearOutputFrameSelection();
		clearFrameInteraction();
		runHistoryAction?.("frame.duplicate", () => {
			updateActiveShotCameraDocument((documentState) => {
				const prevFrameCount = documentState.frames.length;
				documentState.frames = [...documentState.frames, nextFrame];
				documentState.activeFrameId = nextFrame.id;
				copyStoredFrameTrajectoryNodes(documentState, [
					{
						sourceFrameId: activeFrame.id,
						targetFrameId: nextFrame.id,
					},
				]);
				promoteFrameMaskShapeForMultipleFrames(documentState, prevFrameCount);
				return documentState;
			});
		});
		store.frames.selectionActive.value = true;
		setSelectedFrameIds([nextFrame.id]);
		setFrameMaskSelectedIds([nextFrame.id]);
		syncFrameSelectionTransformState();
		updateUi();
		setStatus(
			t("status.duplicatedFrame", {
				name: nextFrame.name,
			}),
		);
	}

	function duplicateSelectedFrames(frameIds = null) {
		const selectedFrameIds = Array.isArray(frameIds)
			? Array.from(
					new Set(
						frameIds.filter((frameId) =>
							getActiveFrames().some((frame) => frame.id === frameId),
						),
					),
				)
			: getSelectedFrameIds();
		const sourceFrames = getActiveFrames().filter((frame) =>
			selectedFrameIds.includes(frame.id),
		);
		if (sourceFrames.length === 0) {
			duplicateActiveFrame();
			return;
		}

		const remainingCapacity = FRAME_MAX_COUNT - getActiveFrames().length;
		if (remainingCapacity <= 0 || sourceFrames.length > remainingCapacity) {
			setStatus(
				t("status.frameLimitReached", {
					limit: FRAME_MAX_COUNT,
				}),
			);
			return;
		}

		const nextFrameNumberStart = getNextFrameNumber(getActiveFrames());
		const duplicatedFrames = sourceFrames.map((sourceFrame, index) =>
			createFrameDocument({
				id: getFrameDocumentId(nextFrameNumberStart + index),
				name: buildFrameDocumentName(nextFrameNumberStart + index),
				source: sourceFrame,
			}),
		);
		clearOutputFrameSelection();
		clearFrameInteraction();
		runHistoryAction?.("frame.duplicate", () => {
			updateActiveShotCameraDocument((documentState) => {
				const prevFrameCount = documentState.frames.length;
				documentState.frames = [...documentState.frames, ...duplicatedFrames];
				documentState.activeFrameId =
					duplicatedFrames[duplicatedFrames.length - 1]?.id ?? null;
				copyStoredFrameTrajectoryNodes(
					documentState,
					duplicatedFrames.map((frame, index) => ({
						sourceFrameId: sourceFrames[index]?.id,
						targetFrameId: frame.id,
					})),
				);
				promoteFrameMaskShapeForMultipleFrames(documentState, prevFrameCount);
				return documentState;
			});
		});
		const duplicatedFrameIds = duplicatedFrames.map((frame) => frame.id);
		store.frames.selectionActive.value = duplicatedFrameIds.length > 0;
		setSelectedFrameIds(duplicatedFrameIds);
		setFrameMaskSelectedIds(duplicatedFrameIds);
		syncFrameSelectionTransformState();
		updateUi();
		setStatus(
			duplicatedFrames.length === 1
				? t("status.duplicatedFrame", {
						name: duplicatedFrames[0].name,
					})
				: t("status.duplicatedFrames", {
						count: duplicatedFrames.length,
					}),
		);
	}

	function setFrameName(frameId, nextValue) {
		const targetFrame = getFrameDocumentById(getActiveFrames(), frameId);
		if (!targetFrame) {
			return;
		}

		runHistoryAction?.("frame.name", () => {
			updateActiveShotCameraDocument((documentState) => {
				const frame = getFrameDocumentById(documentState.frames, frameId);
				const normalizedName = sanitizeFrameName(nextValue, targetFrame.name);
				if (!frame) {
					return documentState;
				}
				frame.name = normalizedName;
				documentState.activeFrameId = frame.id;
				return documentState;
			});
		});
		updateUi();
	}

	function deleteActiveFrame() {
		const activeFrame = getActiveFrameDocument();
		if (!activeFrame) {
			return;
		}

		deleteFrame(activeFrame.id);
	}

	function deleteSelectedFrames(frameIds = null) {
		const selectedFrameIds = Array.isArray(frameIds)
			? Array.from(
					new Set(
						frameIds.filter((frameId) =>
							getActiveFrames().some((frame) => frame.id === frameId),
						),
					),
				)
			: getSelectedFrameIds().filter((frameId) =>
					getActiveFrames().some((frame) => frame.id === frameId),
				);
		if (selectedFrameIds.length === 0) {
			return;
		}

		const selectedFrameIdSet = new Set(selectedFrameIds);
		const selectedFrames = getActiveFrames().filter((frame) =>
			selectedFrameIdSet.has(frame.id),
		);
		const selectedFrameNames = selectedFrames.map((frame) => frame.name);
		const rememberedMaskSelectedIds = getRememberedFrameMaskSelectedIds();
		let nextActiveFrameId = null;
		let nextRememberedMaskSelectedIds = [];

		clearFrameInteraction();
		clearOutputFramePan();
		runHistoryAction?.("frame.delete", () => {
			updateActiveShotCameraDocument((documentState) => {
				const remainingFrames = documentState.frames.filter(
					(frame) => !selectedFrameIdSet.has(frame.id),
				);
				const remainingFrameIdSet = new Set(
					remainingFrames.map((frame) => frame.id),
				);
				nextActiveFrameId =
					documentState.activeFrameId &&
					remainingFrameIdSet.has(documentState.activeFrameId)
						? documentState.activeFrameId
						: (remainingFrames[0]?.id ?? null);
				nextRememberedMaskSelectedIds = rememberedMaskSelectedIds.filter(
					(selectedFrameId) => remainingFrameIdSet.has(selectedFrameId),
				);
				documentState.frames = remainingFrames;
				documentState.activeFrameId = nextActiveFrameId;
				documentState.frameMask = {
					...documentState.frameMask,
					selectedIds: nextRememberedMaskSelectedIds,
				};
				deleteStoredFrameTrajectoryNodes(documentState, selectedFrameIds);
				return documentState;
			});
		});
		const remainingFrames = getActiveFrames();
		const remainingFrameIdSet = new Set(
			remainingFrames.map((frame) => frame.id),
		);
		let nextSelectedIds = getSelectedFrameIds().filter((selectedFrameId) =>
			remainingFrameIdSet.has(selectedFrameId),
		);
		if (nextSelectedIds.length === 0 && nextActiveFrameId) {
			nextSelectedIds = [nextActiveFrameId];
		}
		store.frames.selectionActive.value = nextSelectedIds.length > 0;
		setSelectedFrameIds(nextSelectedIds);
		setFrameMaskSelectedIds(nextRememberedMaskSelectedIds);
		syncFrameSelectionTransformState();
		updateUi();
		setStatus(
			selectedFrameNames.length === 1
				? t("status.deletedFrame", {
						name: selectedFrameNames[0],
					})
				: t("status.deletedFrames", {
						count: selectedFrameNames.length,
					}),
		);
	}

	function deleteFrame(frameId) {
		const targetFrame = getFrameDocumentById(getActiveFrames(), frameId);
		if (!targetFrame) {
			return;
		}

		const selectedFrameIds = getSelectedFrameIds();
		const rememberedMaskSelectedIds = getRememberedFrameMaskSelectedIds();
		let nextActiveFrameId = null;
		let nextRememberedMaskSelectedIds = [];

		clearFrameInteraction();
		clearOutputFramePan();
		runHistoryAction?.("frame.delete", () => {
			updateActiveShotCameraDocument((documentState) => {
				const remainingFrames = documentState.frames.filter(
					(frame) => frame.id !== targetFrame.id,
				);
				const remainingFrameIdSet = new Set(
					remainingFrames.map((frame) => frame.id),
				);
				const survivingSelectedIds = selectedFrameIds.filter(
					(selectedFrameId) =>
						selectedFrameId !== targetFrame.id &&
						remainingFrameIdSet.has(selectedFrameId),
				);
				nextActiveFrameId =
					survivingSelectedIds[0] ??
					(documentState.activeFrameId &&
					documentState.activeFrameId !== targetFrame.id &&
					remainingFrameIdSet.has(documentState.activeFrameId)
						? documentState.activeFrameId
						: (remainingFrames[0]?.id ?? null));
				nextRememberedMaskSelectedIds = rememberedMaskSelectedIds.filter(
					(selectedFrameId) =>
						selectedFrameId !== targetFrame.id &&
						remainingFrameIdSet.has(selectedFrameId),
				);
				documentState.frames = remainingFrames;
				documentState.activeFrameId = nextActiveFrameId;
				documentState.frameMask = {
					...documentState.frameMask,
					selectedIds: nextRememberedMaskSelectedIds,
				};
				deleteStoredFrameTrajectoryNodes(documentState, [targetFrame.id]);
				return documentState;
			});
		});
		const remainingFrames = getActiveFrames();
		const remainingFrameIdSet = new Set(
			remainingFrames.map((frame) => frame.id),
		);
		let nextSelectedIds = selectedFrameIds.filter(
			(selectedFrameId) =>
				selectedFrameId !== targetFrame.id &&
				remainingFrameIdSet.has(selectedFrameId),
		);
		if (nextSelectedIds.length === 0 && nextActiveFrameId) {
			nextSelectedIds = [nextActiveFrameId];
		}
		store.frames.selectionActive.value = nextSelectedIds.length > 0;
		setSelectedFrameIds(nextSelectedIds);
		setFrameMaskSelectedIds(nextRememberedMaskSelectedIds);
		syncFrameSelectionTransformState();
		updateUi();
		setStatus(
			t("status.deletedFrame", {
				name: targetFrame.name,
			}),
		);
	}

	return {
		createFrame,
		duplicateActiveFrame,
		duplicateSelectedFrames,
		setFrameName,
		deleteActiveFrame,
		deleteSelectedFrames,
		deleteFrame,
	};
}
