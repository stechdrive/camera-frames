import { FRAME_MAX_COUNT } from "../../constants.js";
import {
	FRAME_MASK_SHAPE_TRAJECTORY,
	FRAME_TRAJECTORY_EXPORT_SOURCE_NONE,
	chooseBestFrameTrajectoryExportSource,
	normalizeFrameMaskShape,
	normalizeFrameTrajectoryExportSource,
} from "../../engine/frame-trajectory.js";
import {
	createFrameDocument,
	getFrameDisplayLabel,
	getFrameDocumentId,
	getNextFrameNumber,
	getActiveFrameDocument as resolveActiveFrameDocument,
} from "../../workspace-model.js";

export function createFrameDocumentHelpers({
	t,
	getActiveShotCameraDocument,
}) {
	function buildFrameDocumentName(nextNumber) {
		return t("frame.defaultName", { index: getFrameDisplayLabel(nextNumber) });
	}

	function getActiveFrames() {
		return getActiveShotCameraDocument()?.frames ?? [];
	}

	function getActiveFrameDocument() {
		return resolveActiveFrameDocument(
			getActiveFrames(),
			getActiveShotCameraDocument()?.activeFrameId ?? null,
		);
	}

	function createWorkspaceFrameDocument(sourceFrame = null) {
		const nextNumber = getNextFrameNumber(getActiveFrames());
		return createFrameDocument({
			id: getFrameDocumentId(nextNumber),
			name: buildFrameDocumentName(nextNumber),
			source: sourceFrame,
		});
	}

	function hasReachedFrameLimit() {
		return getActiveFrames().length >= FRAME_MAX_COUNT;
	}

	function promoteFrameMaskShapeForMultipleFrames(
		documentState,
		prevFrameCount,
	) {
		if (prevFrameCount >= 2) {
			return;
		}
		if ((documentState.frames?.length ?? 0) < 2) {
			return;
		}
		let nextFrameMask = documentState.frameMask;
		const currentShape = normalizeFrameMaskShape(nextFrameMask?.shape);
		if (currentShape !== FRAME_MASK_SHAPE_TRAJECTORY) {
			nextFrameMask = {
				...nextFrameMask,
				shape: FRAME_MASK_SHAPE_TRAJECTORY,
			};
		}
		const currentExportSource = normalizeFrameTrajectoryExportSource(
			nextFrameMask?.trajectoryExportSource,
		);
		if (currentExportSource === FRAME_TRAJECTORY_EXPORT_SOURCE_NONE) {
			const bestSource = chooseBestFrameTrajectoryExportSource(
				documentState.frames,
				nextFrameMask,
			);
			nextFrameMask = {
				...nextFrameMask,
				trajectoryExportSource: bestSource,
			};
		}
		if (nextFrameMask !== documentState.frameMask) {
			documentState.frameMask = nextFrameMask;
		}
	}

	return {
		buildFrameDocumentName,
		getActiveFrames,
		getActiveFrameDocument,
		createWorkspaceFrameDocument,
		hasReachedFrameLimit,
		promoteFrameMaskShapeForMultipleFrames,
	};
}
