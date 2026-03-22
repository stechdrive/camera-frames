import assert from "node:assert/strict";
import {
	clampOutputFrameCenterPx,
	getBaseFrustumExtents,
	getExportSize,
	getMaxOutputFrameScalePct,
	getPreviewFrustumExtents,
	getRenderBoxMetrics,
	getTargetFrustumExtents,
	remapPointBetweenRenderBoxes,
	sampleFrustumAtViewportPoint,
} from "../src/engine/projection.js";

function almostEqual(actual, expected, message) {
	assert.ok(
		Math.abs(actual - expected) < 1e-9,
		`${message}: expected ${expected}, got ${actual}`,
	);
}

{
	const size = getExportSize({ widthScale: 0.5, heightScale: 0.5 });
	assert.equal(
		size.width,
		1754,
		"export width should not shrink below A4 base",
	);
	assert.equal(
		size.height,
		1240,
		"export height should not shrink below A4 base",
	);
}

{
	const size = getExportSize({ widthScale: 20, heightScale: 20 });
	assert.equal(size.width, 15996, "export width should clamp to max dimension");
	assert.equal(
		size.height,
		15996,
		"export height should clamp to max dimension",
	);
	assert.equal(getMaxOutputFrameScalePct(1754), 912);
	assert.equal(getMaxOutputFrameScalePct(1240), 1290);
}

{
	const base = getBaseFrustumExtents({ near: 0.1, horizontalFovDegrees: 60 });
	const target = getTargetFrustumExtents({
		near: 0.1,
		horizontalFovDegrees: 60,
		widthScale: 2,
		heightScale: 1.5,
		centerX: 0.5,
		centerY: 0.5,
	});

	almostEqual(target.width, base.width * 2, "width should scale around center");
	almostEqual(
		target.height,
		base.height * 1.5,
		"height should scale around center",
	);
	almostEqual(
		(target.left + target.right) * 0.5,
		0,
		"centered target should preserve horizontal center",
	);
	almostEqual(
		(target.top + target.bottom) * 0.5,
		0,
		"centered target should preserve vertical center",
	);
}

{
	const base = getBaseFrustumExtents({ near: 0.1, horizontalFovDegrees: 60 });
	const target = getTargetFrustumExtents({
		near: 0.1,
		horizontalFovDegrees: 60,
		widthScale: 1.25,
		heightScale: 0.75,
		centerX: 1,
		centerY: 1,
	});

	almostEqual(
		target.right,
		base.right + base.width * 1.25 * 0.5,
		"off-center target should shift toward the requested center",
	);
	almostEqual(
		target.bottom,
		base.bottom - base.height * 0.75 * 0.5,
		"off-center target should shift vertically toward the requested center",
	);
}

{
	const metrics = getRenderBoxMetrics({
		viewportWidth: 1920,
		viewportHeight: 1080,
		exportWidth: 1754,
		exportHeight: 1240,
		viewZoom: 1,
		viewportCenterX: 0.55,
		viewportCenterY: 0.5,
		anchorKey: "center",
	});

	almostEqual(
		metrics.boxCenterX,
		1056,
		"render box center should follow viewport X",
	);
	almostEqual(
		metrics.boxCenterY,
		540,
		"render box center should follow viewport Y",
	);
}

{
	const metrics = getRenderBoxMetrics({
		viewportWidth: 1280,
		viewportHeight: 720,
		exportWidth: 1754,
		exportHeight: 1240,
		viewZoom: 0.25,
		viewportCenterX: -1,
		viewportCenterY: -1,
		anchorKey: "center",
	});
	const clampedCenter = clampOutputFrameCenterPx({
		centerX: metrics.boxCenterX,
		centerY: metrics.boxCenterY,
		viewportWidth: metrics.viewportWidth,
		viewportHeight: metrics.viewportHeight,
		boxWidth: metrics.boxWidth,
		boxHeight: metrics.boxHeight,
	});

	assert.ok(
		metrics.boxLeft < 0,
		"raw render box metrics should preserve unclamped horizontal position",
	);
	assert.ok(
		metrics.boxTop < 0,
		"raw render box metrics should preserve unclamped vertical position",
	);
	assert.ok(
		clampedCenter.x - metrics.boxWidth * 0.5 >= 0,
		"pan clamp should keep a small render box inside the viewport horizontally",
	);
	assert.ok(
		clampedCenter.y - metrics.boxHeight * 0.5 >= 0,
		"pan clamp should keep a small render box inside the viewport vertically",
	);
}

{
	const metrics = getRenderBoxMetrics({
		viewportWidth: 1280,
		viewportHeight: 720,
		exportWidth: 1754,
		exportHeight: 1240,
		viewZoom: 2,
		viewportCenterX: -1,
		viewportCenterY: -1,
		anchorKey: "center",
	});
	const clampedCenter = clampOutputFrameCenterPx({
		centerX: metrics.boxCenterX,
		centerY: metrics.boxCenterY,
		viewportWidth: metrics.viewportWidth,
		viewportHeight: metrics.viewportHeight,
		boxWidth: metrics.boxWidth,
		boxHeight: metrics.boxHeight,
	});
	const clampedLeft = clampedCenter.x - metrics.boxWidth * 0.5;
	const clampedTop = clampedCenter.y - metrics.boxHeight * 0.5;

	assert.ok(
		clampedLeft <= 0,
		"oversized render box should still overlap the viewport horizontally",
	);
	assert.ok(
		clampedLeft + metrics.boxWidth >= 1280,
		"oversized render box should not leave the viewport completely horizontally",
	);
	assert.ok(
		clampedTop <= 0,
		"oversized render box should still overlap the viewport vertically",
	);
	assert.ok(
		clampedTop + metrics.boxHeight >= 720,
		"oversized render box should not leave the viewport completely vertically",
	);
}

{
	const baseMetrics = getRenderBoxMetrics({
		viewportWidth: 1280,
		viewportHeight: 720,
		exportWidth: 1754,
		exportHeight: 1240,
		viewZoom: 1,
		anchorKey: "center",
	});
	const resizedMetrics = getRenderBoxMetrics({
		viewportWidth: 1280,
		viewportHeight: 720,
		exportWidth: 3508,
		exportHeight: 2480,
		viewZoom: 1,
		fitScale: baseMetrics.fitScale,
		anchorKey: "center",
	});

	almostEqual(
		resizedMetrics.fitScale,
		baseMetrics.fitScale,
		"stored fit scale should remain stable during output frame resize",
	);
}

{
	const fromMetrics = {
		boxLeft: 100,
		boxTop: 50,
		boxWidth: 200,
		boxHeight: 100,
	};
	const toMetrics = {
		boxLeft: 100,
		boxTop: 50,
		boxWidth: 400,
		boxHeight: 100,
	};
	const remapped = remapPointBetweenRenderBoxes({
		x: 0.5,
		y: 0.5,
		fromMetrics,
		toMetrics,
	});

	almostEqual(
		remapped.x,
		0.25,
		"left-anchored width expansion should keep frame on the original paper position",
	);
	almostEqual(
		remapped.y,
		0.5,
		"height-preserving resize should keep vertical frame position",
	);
}

{
	const target = getTargetFrustumExtents({
		near: 0.1,
		horizontalFovDegrees: 60,
		widthScale: 1.2,
		heightScale: 0.8,
		centerX: 0.4,
		centerY: 0.5,
	});
	const metrics = getRenderBoxMetrics({
		viewportWidth: 1920,
		viewportHeight: 1080,
		exportWidth: 2105,
		exportHeight: 992,
		viewZoom: 1,
		anchorKey: "middle-left",
	});
	const preview = getPreviewFrustumExtents({ targetFrustum: target, metrics });
	const topLeft = sampleFrustumAtViewportPoint({
		frustum: preview,
		viewportWidth: metrics.viewportWidth,
		viewportHeight: metrics.viewportHeight,
		x: metrics.boxLeft,
		y: metrics.boxTop,
	});
	const bottomRight = sampleFrustumAtViewportPoint({
		frustum: preview,
		viewportWidth: metrics.viewportWidth,
		viewportHeight: metrics.viewportHeight,
		x: metrics.boxLeft + metrics.boxWidth,
		y: metrics.boxTop + metrics.boxHeight,
	});

	almostEqual(
		topLeft.x,
		target.left,
		"preview should map box left to target left",
	);
	almostEqual(
		topLeft.y,
		target.top,
		"preview should map box top to target top",
	);
	almostEqual(
		bottomRight.x,
		target.right,
		"preview should map box right to target right",
	);
	almostEqual(
		bottomRight.y,
		target.bottom,
		"preview should map box bottom to target bottom",
	);
}

console.log("✅ CAMERA_FRAMES projection tests passed!");
