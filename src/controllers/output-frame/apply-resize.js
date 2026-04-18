import { ANCHORS, BASE_RENDER_BOX, DEFAULT_CAMERA_NEAR } from "../../constants.js";
import {
	clampOutputFrameCenterPx,
	getBaseFrustumExtents,
	getExportSize,
	getRenderBoxMetrics,
	getTargetFrustumExtents,
	remapPointBetweenRenderBoxes,
} from "../../engine/projection.js";

export function createApplyOutputFrameResize({
	store,
	state,
	shotCameraRegistry,
	getActiveShotCameraDocument,
	getShotCameraDocument,
	getActiveShotCameraEntry,
	getOutputFrameMetrics,
	getOutputFrameDocumentState,
	getWorkbenchLayoutState,
	getBaseFovX,
	getFrameAnchorDocument,
	resolveFrameAxis,
	resolveFrameAnchor,
}) {
	return function applyOutputFrameResize(
		documentState,
		nextWidthScale,
		nextHeightScale,
	) {
		const shotCameraId =
			documentState?.id ?? store.workspace.activeShotCameraId.value;
		const shotCameraDocument =
			shotCameraId === store.workspace.activeShotCameraId.value
				? getActiveShotCameraDocument()
				: getShotCameraDocument(shotCameraId);
		const shotCameraEntry =
			shotCameraId === store.workspace.activeShotCameraId.value
				? getActiveShotCameraEntry()
				: shotCameraRegistry.get(shotCameraId);
		const currentMetrics = getOutputFrameMetrics(shotCameraDocument);
		const outputFrameDocument = {
			...getOutputFrameDocumentState(shotCameraDocument),
		};
		const frameCenters = new Map(
			(documentState.frames ?? []).map((frame) => [
				frame.id,
				{
					x: frame.x,
					y: frame.y,
				},
			]),
		);
		const exportSize = getExportSize({
			widthScale: nextWidthScale,
			heightScale: nextHeightScale,
		});
		const clampedWidthScale = exportSize.width / BASE_RENDER_BOX.width;
		const clampedHeightScale = exportSize.height / BASE_RENDER_BOX.height;
		const anchor =
			ANCHORS[outputFrameDocument.anchor ?? state.outputFrame.anchor] ??
			ANCHORS.center;
		const anchorX = currentMetrics.boxLeft + currentMetrics.boxWidth * anchor.x;
		const anchorY = currentMetrics.boxTop + currentMetrics.boxHeight * anchor.y;
		const nextMetricsSeed = getRenderBoxMetrics({
			viewportWidth: currentMetrics.viewportWidth,
			viewportHeight: currentMetrics.viewportHeight,
			exportWidth: exportSize.width,
			exportHeight: exportSize.height,
			viewZoom: outputFrameDocument.viewZoom ?? 1,
			fitScale: outputFrameDocument.fitScale,
			viewportCenterX: outputFrameDocument.viewportCenterX,
			viewportCenterY: outputFrameDocument.viewportCenterY,
			anchorKey: outputFrameDocument.anchor ?? state.outputFrame.anchor,
		});
		const nextMetrics = getRenderBoxMetrics({
			viewportWidth: currentMetrics.viewportWidth,
			viewportHeight: currentMetrics.viewportHeight,
			exportWidth: exportSize.width,
			exportHeight: exportSize.height,
			viewZoom: outputFrameDocument.viewZoom ?? 1,
			fitScale: outputFrameDocument.fitScale,
			viewportCenterX:
				(anchorX + nextMetricsSeed.boxWidth * (0.5 - anchor.x)) /
				currentMetrics.viewportWidth,
			viewportCenterY:
				(anchorY + nextMetricsSeed.boxHeight * (0.5 - anchor.y)) /
				currentMetrics.viewportHeight,
			anchorKey: outputFrameDocument.anchor ?? state.outputFrame.anchor,
		});
		const near = shotCameraEntry?.camera?.near ?? DEFAULT_CAMERA_NEAR;
		const horizontalFovDegrees =
			shotCameraDocument?.lens?.baseFovX ?? getBaseFovX();
		const baseFrustum = getBaseFrustumExtents({
			near,
			horizontalFovDegrees,
		});
		const currentTargetFrustum = getTargetFrustumExtents({
			near,
			horizontalFovDegrees,
			widthScale: outputFrameDocument.widthScale ?? 1,
			heightScale: outputFrameDocument.heightScale ?? 1,
			centerX: outputFrameDocument.centerX,
			centerY: outputFrameDocument.centerY,
		});
		const fixedX =
			currentTargetFrustum.left + currentTargetFrustum.width * anchor.x;
		const fixedY =
			currentTargetFrustum.top - currentTargetFrustum.height * anchor.y;
		const nextWidth = baseFrustum.width * clampedWidthScale;
		const nextHeight = baseFrustum.height * clampedHeightScale;
		const nextCenterXFrustum = fixedX + nextWidth * (0.5 - anchor.x);
		const nextCenterYFrustum = fixedY + nextHeight * (anchor.y - 0.5);

		documentState.outputFrame.widthScale = clampedWidthScale;
		documentState.outputFrame.heightScale = clampedHeightScale;
		documentState.outputFrame.centerX =
			(nextCenterXFrustum - baseFrustum.left) /
			Math.max(baseFrustum.width, 1e-6);
		documentState.outputFrame.centerY =
			(baseFrustum.top - nextCenterYFrustum) /
			Math.max(baseFrustum.height, 1e-6);
		const layout = getWorkbenchLayoutState();
		const revealedCenter = clampOutputFrameCenterPx({
			centerX: nextMetrics.boxCenterX,
			centerY: nextMetrics.boxCenterY,
			viewportWidth: currentMetrics.viewportWidth,
			viewportHeight: currentMetrics.viewportHeight,
			boxWidth: nextMetrics.boxWidth,
			boxHeight: nextMetrics.boxHeight,
			safeLeft: layout.safeLeft,
			safeRight: layout.safeRight,
			safeTop: layout.safeTop,
			safeBottom: layout.safeBottom,
		});

		documentState.outputFrame.fitScale = outputFrameDocument.fitScale;
		documentState.outputFrame.fitViewportWidth = currentMetrics.viewportWidth;
		documentState.outputFrame.fitViewportHeight = currentMetrics.viewportHeight;
		documentState.outputFrame.viewportCenterX =
			revealedCenter.x / currentMetrics.viewportWidth;
		documentState.outputFrame.viewportCenterY =
			revealedCenter.y / currentMetrics.viewportHeight;

		for (const frame of documentState.frames ?? []) {
			const center = frameCenters.get(frame.id);
			if (!center) {
				continue;
			}

			const remapped = remapPointBetweenRenderBoxes({
				x: center.x,
				y: center.y,
				fromMetrics: currentMetrics,
				toMetrics: nextMetrics,
			});
			const frameAnchor = getFrameAnchorDocument(frame);
			frame.x = resolveFrameAxis(remapped.x);
			frame.y = resolveFrameAxis(remapped.y);

			const remappedAnchor = remapPointBetweenRenderBoxes({
				x: frameAnchor.x,
				y: frameAnchor.y,
				fromMetrics: currentMetrics,
				toMetrics: nextMetrics,
			});
			frame.anchor = resolveFrameAnchor(remappedAnchor, {
				x: frame.x,
				y: frame.y,
			});
		}
		const remappedTrajectoryNodesByFrameId = {};
		for (const [frameId, node] of Object.entries(
			documentState.frameMask?.trajectory?.nodesByFrameId ?? {},
		)) {
			const previousCenter = frameCenters.get(frameId);
			const nextFrame =
				(documentState.frames ?? []).find((frame) => frame.id === frameId) ??
				null;
			if (!previousCenter || !nextFrame) {
				continue;
			}
			const nextCenter = {
				x: nextFrame.x,
				y: nextFrame.y,
			};
			const nextIn =
				node?.in && Number.isFinite(node.in.x) && Number.isFinite(node.in.y)
					? remapPointBetweenRenderBoxes({
							x: previousCenter.x + node.in.x,
							y: previousCenter.y + node.in.y,
							fromMetrics: currentMetrics,
							toMetrics: nextMetrics,
						})
					: null;
			const nextOut =
				node?.out && Number.isFinite(node.out.x) && Number.isFinite(node.out.y)
					? remapPointBetweenRenderBoxes({
							x: previousCenter.x + node.out.x,
							y: previousCenter.y + node.out.y,
							fromMetrics: currentMetrics,
							toMetrics: nextMetrics,
						})
					: null;
			if (!nextIn && !nextOut && !node?.mode) {
				continue;
			}
			remappedTrajectoryNodesByFrameId[frameId] = {
				...(node?.mode ? { mode: node.mode } : {}),
				...(nextIn
					? {
							in: {
								x: nextIn.x - nextCenter.x,
								y: nextIn.y - nextCenter.y,
							},
						}
					: {}),
				...(nextOut
					? {
							out: {
								x: nextOut.x - nextCenter.x,
								y: nextOut.y - nextCenter.y,
							},
						}
					: {}),
			};
		}
		documentState.frameMask = {
			...documentState.frameMask,
			trajectory: {
				...(documentState.frameMask?.trajectory ?? {}),
				nodesByFrameId: remappedTrajectoryNodesByFrameId,
			},
		};
	};
}
