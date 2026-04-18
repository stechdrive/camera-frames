import {
	FRAME_MASK_SHAPE_TRAJECTORY,
	FRAME_TRAJECTORY_NODE_MODE_AUTO,
	FRAME_TRAJECTORY_NODE_MODE_CORNER,
	FRAME_TRAJECTORY_NODE_MODE_FREE,
	FRAME_TRAJECTORY_NODE_MODE_MIRRORED,
	cloneFrameTrajectoryNodesByFrameId,
	getFrameTrajectoryHandleVectorNormalized,
	getFrameTrajectoryNodeMode,
	normalizeFrameTrajectoryExportSource,
	normalizeFrameTrajectoryMode,
	normalizeFrameTrajectoryNodeMode,
} from "../../engine/frame-trajectory.js";
import { getFrameDocumentById } from "../../workspace-model.js";

export function invertTrajectoryVector(vector) {
	return vector && Number.isFinite(vector.x) && Number.isFinite(vector.y)
		? {
				x: -vector.x,
				y: -vector.y,
			}
		: null;
}

export function getTrajectoryNodesByFrameId(documentState) {
	return cloneFrameTrajectoryNodesByFrameId(
		documentState?.frameMask?.trajectory?.nodesByFrameId,
	);
}

export function updateTrajectoryNodesByFrameId(documentState, nodesByFrameId) {
	documentState.frameMask = {
		...documentState.frameMask,
		trajectory: {
			...(documentState.frameMask?.trajectory ?? {}),
			nodesByFrameId,
		},
	};
}

export function transformStoredFrameTrajectoryNodes(
	documentState,
	frameIds,
	previousCentersByFrameId,
	transformPoint,
) {
	if (typeof transformPoint !== "function") {
		return;
	}
	const frameIdSet = new Set(frameIds ?? []);
	if (frameIdSet.size === 0) {
		return;
	}
	const nodesByFrameId = getTrajectoryNodesByFrameId(documentState);
	let changed = false;
	for (const frameId of frameIdSet) {
		const frameNode = nodesByFrameId[frameId];
		if (!frameNode) {
			continue;
		}
		const previousCenter = previousCentersByFrameId?.get?.(frameId) ?? null;
		const nextFrame = getFrameDocumentById(documentState.frames, frameId);
		if (!previousCenter || !nextFrame) {
			continue;
		}
		const nextCenter = {
			x: nextFrame.x,
			y: nextFrame.y,
		};
		for (const handleKey of ["in", "out"]) {
			const vector = frameNode[handleKey];
			if (
				!vector ||
				!Number.isFinite(vector.x) ||
				!Number.isFinite(vector.y)
			) {
				continue;
			}
			const nextPoint = transformPoint(
				{
					x: previousCenter.x + vector.x,
					y: previousCenter.y + vector.y,
				},
				frameId,
				handleKey,
			);
			if (!nextPoint) {
				continue;
			}
			frameNode[handleKey] = {
				x: nextPoint.x - nextCenter.x,
				y: nextPoint.y - nextCenter.y,
			};
			changed = true;
		}
	}
	if (changed) {
		updateTrajectoryNodesByFrameId(documentState, nodesByFrameId);
	}
}

export function copyStoredFrameTrajectoryNodes(
	documentState,
	frameIdMappings = [],
) {
	const nodesByFrameId = getTrajectoryNodesByFrameId(documentState);
	let changed = false;
	for (const mapping of frameIdMappings) {
		const sourceFrameId = mapping?.sourceFrameId;
		const targetFrameId = mapping?.targetFrameId;
		if (
			typeof sourceFrameId !== "string" ||
			typeof targetFrameId !== "string"
		) {
			continue;
		}
		const sourceNode = nodesByFrameId[sourceFrameId];
		if (!sourceNode) {
			continue;
		}
		nodesByFrameId[targetFrameId] = {
			...(sourceNode.mode ? { mode: sourceNode.mode } : {}),
			...(sourceNode.in &&
			Number.isFinite(sourceNode.in.x) &&
			Number.isFinite(sourceNode.in.y)
				? { in: { ...sourceNode.in } }
				: {}),
			...(sourceNode.out &&
			Number.isFinite(sourceNode.out.x) &&
			Number.isFinite(sourceNode.out.y)
				? { out: { ...sourceNode.out } }
				: {}),
		};
		changed = true;
	}
	if (changed) {
		updateTrajectoryNodesByFrameId(documentState, nodesByFrameId);
	}
}

export function deleteStoredFrameTrajectoryNodes(documentState, frameIds) {
	const frameIdSet = new Set(frameIds ?? []);
	if (frameIdSet.size === 0) {
		return;
	}
	const nodesByFrameId = getTrajectoryNodesByFrameId(documentState);
	let changed = false;
	for (const frameId of frameIdSet) {
		if (nodesByFrameId[frameId]) {
			delete nodesByFrameId[frameId];
			changed = true;
		}
	}
	if (changed) {
		updateTrajectoryNodesByFrameId(documentState, nodesByFrameId);
	}
}

export function createCameraFrameTrajectoryController({
	store,
	runHistoryAction,
	updateUi,
	getActiveShotCameraDocument,
	updateActiveShotCameraDocument,
	getActiveFrames,
	getOutputFrameMetrics,
}) {
	function getFrameTrajectoryMode() {
		return normalizeFrameTrajectoryMode(
			getActiveShotCameraDocument()?.frameMask?.trajectoryMode,
		);
	}

	function setFrameTrajectoryMode(nextValue) {
		const trajectoryMode = normalizeFrameTrajectoryMode(nextValue);
		runHistoryAction?.("frame.trajectory-mode", () => {
			updateActiveShotCameraDocument((documentState) => {
				documentState.frameMask = {
					...documentState.frameMask,
					trajectoryMode,
					shape: documentState.frameMask?.shape ?? FRAME_MASK_SHAPE_TRAJECTORY,
				};
				return documentState;
			});
		});
		updateUi();
	}

	function getFrameTrajectoryExportSource() {
		return normalizeFrameTrajectoryExportSource(
			getActiveShotCameraDocument()?.frameMask?.trajectoryExportSource,
		);
	}

	function setFrameTrajectoryExportSource(nextValue) {
		const trajectoryExportSource =
			normalizeFrameTrajectoryExportSource(nextValue);
		runHistoryAction?.("frame.trajectory-export-source", () => {
			updateActiveShotCameraDocument((documentState) => {
				documentState.frameMask = {
					...documentState.frameMask,
					trajectoryExportSource,
				};
				return documentState;
			});
		});
		updateUi();
	}

	function setFrameTrajectoryEditMode(nextValue) {
		store.frames.trajectoryEditMode.value = Boolean(nextValue);
		updateUi();
	}

	function toggleFrameTrajectoryEditMode() {
		setFrameTrajectoryEditMode(!store.frames.trajectoryEditMode.value);
	}

	function getTrajectoryLogicalSize(metrics = getOutputFrameMetrics()) {
		return {
			logicalWidth: Math.max(metrics?.exportWidth ?? 1, 1e-6),
			logicalHeight: Math.max(metrics?.exportHeight ?? 1, 1e-6),
		};
	}

	function getFrameTrajectoryHandleVector(
		documentState,
		frameId,
		handleKey,
		nodesByFrameId = null,
	) {
		const { logicalWidth, logicalHeight } = getTrajectoryLogicalSize();
		const frameMaskState =
			nodesByFrameId === null
				? documentState.frameMask
				: {
						...documentState.frameMask,
						trajectory: {
							...(documentState.frameMask?.trajectory ?? {}),
							nodesByFrameId,
						},
					};
		return (
			getFrameTrajectoryHandleVectorNormalized(
				documentState.frames,
				frameMaskState,
				frameId,
				handleKey,
				logicalWidth,
				logicalHeight,
			) ?? { x: 0, y: 0 }
		);
	}

	function setFrameTrajectoryNodeMode(frameId, nextValue) {
		const frame = getFrameDocumentById(getActiveFrames(), frameId);
		if (!frame) {
			return;
		}
		const nodeMode = normalizeFrameTrajectoryNodeMode(nextValue);
		runHistoryAction?.("frame.trajectory-node-mode", () => {
			updateActiveShotCameraDocument((documentState) => {
				const nodesByFrameId = getTrajectoryNodesByFrameId(documentState);
				if (nodeMode === FRAME_TRAJECTORY_NODE_MODE_AUTO) {
					delete nodesByFrameId[frameId];
				} else if (nodeMode === FRAME_TRAJECTORY_NODE_MODE_CORNER) {
					nodesByFrameId[frameId] = {
						mode: FRAME_TRAJECTORY_NODE_MODE_CORNER,
					};
				} else {
					const effectiveIn = getFrameTrajectoryHandleVector(
						documentState,
						frameId,
						"in",
						nodesByFrameId,
					);
					const effectiveOut = getFrameTrajectoryHandleVector(
						documentState,
						frameId,
						"out",
						nodesByFrameId,
					);
					if (nodeMode === FRAME_TRAJECTORY_NODE_MODE_MIRRORED) {
						const baseVector = (nodesByFrameId[frameId]?.out &&
						Number.isFinite(nodesByFrameId[frameId].out.x) &&
						Number.isFinite(nodesByFrameId[frameId].out.y)
							? { ...nodesByFrameId[frameId].out }
							: effectiveOut && (effectiveOut.x !== 0 || effectiveOut.y !== 0)
								? effectiveOut
								: invertTrajectoryVector(effectiveIn)) ?? {
							x: 0,
							y: 0,
						};
						nodesByFrameId[frameId] = {
							mode: FRAME_TRAJECTORY_NODE_MODE_MIRRORED,
							in: invertTrajectoryVector(baseVector),
							out: baseVector,
						};
					} else {
						nodesByFrameId[frameId] = {
							mode: FRAME_TRAJECTORY_NODE_MODE_FREE,
							in: effectiveIn,
							out: effectiveOut,
						};
					}
				}
				updateTrajectoryNodesByFrameId(documentState, nodesByFrameId);
				documentState.activeFrameId = frameId;
				return documentState;
			});
		});
		updateUi();
	}

	function setFrameTrajectoryHandlePoint(frameId, handleKey, nextPoint) {
		if (handleKey !== "in" && handleKey !== "out") {
			return;
		}
		const frame = getFrameDocumentById(getActiveFrames(), frameId);
		if (!frame) {
			return;
		}

		const nextHandlePoint =
			nextPoint && Number.isFinite(nextPoint.x) && Number.isFinite(nextPoint.y)
				? {
						x: nextPoint.x,
						y: nextPoint.y,
					}
				: null;
		updateActiveShotCameraDocument((documentState) => {
			const documentFrame = getFrameDocumentById(documentState.frames, frameId);
			if (!documentFrame) {
				return documentState;
			}
			const nodesByFrameId = getTrajectoryNodesByFrameId(documentState);
			if (!nextHandlePoint) {
				delete nodesByFrameId[frameId];
				updateTrajectoryNodesByFrameId(documentState, nodesByFrameId);
				documentState.activeFrameId = frameId;
				return documentState;
			}

			const currentNodeMode = getFrameTrajectoryNodeMode(
				{
					trajectory: {
						nodesByFrameId,
					},
				},
				frameId,
			);
			const resolvedNodeMode =
				currentNodeMode === FRAME_TRAJECTORY_NODE_MODE_FREE
					? FRAME_TRAJECTORY_NODE_MODE_FREE
					: currentNodeMode === FRAME_TRAJECTORY_NODE_MODE_CORNER
						? FRAME_TRAJECTORY_NODE_MODE_FREE
						: FRAME_TRAJECTORY_NODE_MODE_MIRRORED;
			const nextVector = {
				x: nextHandlePoint.x - documentFrame.x,
				y: nextHandlePoint.y - documentFrame.y,
			};
			if (resolvedNodeMode === FRAME_TRAJECTORY_NODE_MODE_MIRRORED) {
				nodesByFrameId[frameId] = {
					mode: FRAME_TRAJECTORY_NODE_MODE_MIRRORED,
					...(handleKey === "in"
						? {
								in: nextVector,
								out: invertTrajectoryVector(nextVector),
							}
						: {
								in: invertTrajectoryVector(nextVector),
								out: nextVector,
							}),
				};
			} else {
				const effectiveIn = getFrameTrajectoryHandleVector(
					documentState,
					frameId,
					"in",
					nodesByFrameId,
				);
				const effectiveOut = getFrameTrajectoryHandleVector(
					documentState,
					frameId,
					"out",
					nodesByFrameId,
				);
				nodesByFrameId[frameId] = {
					mode: FRAME_TRAJECTORY_NODE_MODE_FREE,
					in: handleKey === "in" ? nextVector : effectiveIn,
					out: handleKey === "out" ? nextVector : effectiveOut,
				};
			}
			updateTrajectoryNodesByFrameId(documentState, nodesByFrameId);
			documentState.activeFrameId = frameId;
			return documentState;
		});
	}

	function clearFrameTrajectoryHandlePoint(frameId, handleKey) {
		if (handleKey !== "in" && handleKey !== "out") {
			return;
		}
		setFrameTrajectoryNodeMode(frameId, FRAME_TRAJECTORY_NODE_MODE_AUTO);
	}

	return {
		getFrameTrajectoryMode,
		setFrameTrajectoryMode,
		getFrameTrajectoryExportSource,
		setFrameTrajectoryExportSource,
		setFrameTrajectoryEditMode,
		toggleFrameTrajectoryEditMode,
		getTrajectoryLogicalSize,
		getFrameTrajectoryHandleVector,
		setFrameTrajectoryNodeMode,
		setFrameTrajectoryHandlePoint,
		clearFrameTrajectoryHandlePoint,
	};
}
