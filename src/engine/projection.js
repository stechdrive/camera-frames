import {
	ANCHORS,
	BASE_RENDER_BOX,
	DEFAULT_CAMERA_VIEW_ZOOM,
	MAX_CAMERA_VIEW_ZOOM_PCT,
	MAX_OUTPUT_FRAME_DIMENSION,
	MIN_CAMERA_VIEW_ZOOM_PCT,
	MIN_OUTPUT_FRAME_SCALE_PCT,
} from "../constants.js";

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

function clamp(value, min, max) {
	return Math.min(max, Math.max(min, value));
}

export function clampViewZoom(viewZoom) {
	const min = MIN_CAMERA_VIEW_ZOOM_PCT / 100;
	const max = MAX_CAMERA_VIEW_ZOOM_PCT / 100;
	const nextValue = Number(viewZoom);
	return clamp(
		Number.isFinite(nextValue) ? nextValue : DEFAULT_CAMERA_VIEW_ZOOM,
		min,
		max,
	);
}

export function getMaxOutputFrameScalePct(baseDimension) {
	if (!(baseDimension > 0)) {
		return MIN_OUTPUT_FRAME_SCALE_PCT;
	}

	return Math.floor((MAX_OUTPUT_FRAME_DIMENSION / baseDimension) * 100);
}

export function clampOutputFrameScaleFactor(scale, baseDimension) {
	const min = MIN_OUTPUT_FRAME_SCALE_PCT / 100;
	const max = getMaxOutputFrameScalePct(baseDimension) / 100;
	const nextValue = Number(scale);
	return clamp(Number.isFinite(nextValue) ? nextValue : min, min, max);
}

function lerp(start, end, alpha) {
	return start + (end - start) * alpha;
}

function withFrustumSize(extents) {
	return {
		...extents,
		width: extents.right - extents.left,
		height: extents.top - extents.bottom,
	};
}

function getViewportFitScale({
	viewportWidth,
	viewportHeight,
	exportWidth,
	exportHeight,
}) {
	return Math.min(viewportWidth / exportWidth, viewportHeight / exportHeight);
}

export function clampOutputFrameCenterPx({
	centerX,
	centerY,
	viewportWidth,
	viewportHeight,
	boxWidth,
	boxHeight,
	safeLeft = 0,
	safeRight = viewportWidth,
	safeTop = 0,
	safeBottom = viewportHeight,
}) {
	const halfWidth = boxWidth * 0.5;
	const halfHeight = boxHeight * 0.5;
	const minCenterX = Math.min(safeLeft + halfWidth, safeRight - halfWidth);
	const maxCenterX = Math.max(safeLeft + halfWidth, safeRight - halfWidth);
	const minCenterY = Math.min(safeTop + halfHeight, safeBottom - halfHeight);
	const maxCenterY = Math.max(safeTop + halfHeight, safeBottom - halfHeight);

	return {
		x: clamp(centerX, minCenterX, maxCenterX),
		y: clamp(centerY, minCenterY, maxCenterY),
	};
}

export function horizontalToVerticalFovDegrees(horizontalFov, aspect) {
	const halfHorizontal = horizontalFov * DEG_TO_RAD * 0.5;
	return RAD_TO_DEG * 2 * Math.atan(Math.tan(halfHorizontal) / aspect);
}

export function frustumSpanToFovDegrees(span, near) {
	return RAD_TO_DEG * 2 * Math.atan(span / (2 * near));
}

export function getExportSize({ widthScale, heightScale }) {
	const clampedWidthScale = clampOutputFrameScaleFactor(
		widthScale,
		BASE_RENDER_BOX.width,
	);
	const clampedHeightScale = clampOutputFrameScaleFactor(
		heightScale,
		BASE_RENDER_BOX.height,
	);

	return {
		width: Math.round(BASE_RENDER_BOX.width * clampedWidthScale),
		height: Math.round(BASE_RENDER_BOX.height * clampedHeightScale),
	};
}

export function getRenderBoxMetrics({
	viewportWidth,
	viewportHeight,
	exportWidth,
	exportHeight,
	viewZoom,
	fitScale,
	viewportCenterX = 0.5,
	viewportCenterY = 0.5,
	anchorKey,
}) {
	const width = Math.max(viewportWidth, 1);
	const height = Math.max(viewportHeight, 1);
	const resolvedFitScale =
		Number.isFinite(fitScale) && fitScale > 0
			? fitScale
			: getViewportFitScale({
					viewportWidth: width,
					viewportHeight: height,
					exportWidth,
					exportHeight,
				});
	const displayScale = resolvedFitScale * clampViewZoom(viewZoom);
	const boxWidth = Math.max(24, exportWidth * displayScale);
	const boxHeight = Math.max(24, exportHeight * displayScale);
	const anchor = ANCHORS[anchorKey] ?? ANCHORS.center;
	const rawCenterX =
		width * (Number.isFinite(viewportCenterX) ? viewportCenterX : 0.5);
	const rawCenterY =
		height * (Number.isFinite(viewportCenterY) ? viewportCenterY : 0.5);
	const boxLeft = rawCenterX - boxWidth * 0.5;
	const boxTop = rawCenterY - boxHeight * 0.5;

	return {
		viewportWidth: width,
		viewportHeight: height,
		exportWidth,
		exportHeight,
		fitScale: resolvedFitScale,
		displayScale,
		boxWidth,
		boxHeight,
		boxLeft,
		boxTop,
		boxCenterX: rawCenterX,
		boxCenterY: rawCenterY,
		viewportCenterX: rawCenterX / width,
		viewportCenterY: rawCenterY / height,
		anchor,
	};
}

export function remapPointBetweenRenderBoxes({ x, y, fromMetrics, toMetrics }) {
	const screenX = fromMetrics.boxLeft + x * fromMetrics.boxWidth;
	const screenY = fromMetrics.boxTop + y * fromMetrics.boxHeight;

	return {
		x: (screenX - toMetrics.boxLeft) / Math.max(toMetrics.boxWidth, 1e-6),
		y: (screenY - toMetrics.boxTop) / Math.max(toMetrics.boxHeight, 1e-6),
	};
}

export function getBaseFrustumExtents({ near, horizontalFovDegrees }) {
	const halfWidth = near * Math.tan(horizontalFovDegrees * DEG_TO_RAD * 0.5);
	const halfHeight =
		halfWidth / (BASE_RENDER_BOX.width / BASE_RENDER_BOX.height);

	return withFrustumSize({
		left: -halfWidth,
		right: halfWidth,
		top: halfHeight,
		bottom: -halfHeight,
	});
}

export function getTargetFrustumExtents({
	near,
	horizontalFovDegrees,
	widthScale,
	heightScale,
	centerX = 0.5,
	centerY = 0.5,
}) {
	const base = getBaseFrustumExtents({ near, horizontalFovDegrees });
	const normalizedCenterX = Number.isFinite(centerX) ? centerX : 0.5;
	const normalizedCenterY = Number.isFinite(centerY) ? centerY : 0.5;
	const frustumCenterX = lerp(base.left, base.right, normalizedCenterX);
	const frustumCenterY = lerp(base.top, base.bottom, normalizedCenterY);
	const width = base.width * widthScale;
	const height = base.height * heightScale;
	const left = frustumCenterX - width * 0.5;
	const right = frustumCenterX + width * 0.5;
	const top = frustumCenterY + height * 0.5;
	const bottom = frustumCenterY - height * 0.5;

	return withFrustumSize({ left, right, top, bottom });
}

export function getFrustumCenterRayDirection({ near, frustum }) {
	const depth = Math.max(Math.abs(Number(near)) || 0, 1e-6);
	const centerX = ((frustum?.left ?? 0) + (frustum?.right ?? 0)) * 0.5;
	const centerY = ((frustum?.top ?? 0) + (frustum?.bottom ?? 0)) * 0.5;
	const length = Math.hypot(centerX, centerY, depth);

	return {
		x: centerX / length,
		y: centerY / length,
		z: -depth / length,
	};
}

export function getPreviewFrustumExtents({ targetFrustum, metrics }) {
	const fullWidth =
		targetFrustum.width * (metrics.viewportWidth / metrics.boxWidth);
	const fullHeight =
		targetFrustum.height * (metrics.viewportHeight / metrics.boxHeight);
	const left =
		targetFrustum.left - (metrics.boxLeft / metrics.viewportWidth) * fullWidth;
	const top =
		targetFrustum.top + (metrics.boxTop / metrics.viewportHeight) * fullHeight;

	return withFrustumSize({
		left,
		right: left + fullWidth,
		top,
		bottom: top - fullHeight,
	});
}

export function sampleFrustumAtViewportPoint({
	frustum,
	viewportWidth,
	viewportHeight,
	x,
	y,
}) {
	return {
		x: frustum.left + (x / viewportWidth) * frustum.width,
		y: frustum.top - (y / viewportHeight) * frustum.height,
	};
}
