import assert from "node:assert/strict";

import {
	computeWorkbenchAutoCollapseState,
	computeWorkbenchLayoutState,
	createOutputFrameController,
} from "../src/controllers/output-frame-controller.js";
import { createOutputFrameMetricsController } from "../src/controllers/output-frame/metrics.js";
import {
	getExportSize,
	getTargetFrustumExtents,
} from "../src/engine/projection.js";
import { createCameraFramesStore } from "../src/store.js";
import { createShotCameraDocument } from "../src/workspace-model.js";

function getFrameOverlayCanvasOffset(metrics, renderBox) {
	return {
		left: -(metrics.boxLeft + Math.max(renderBox?.clientLeft ?? 0, 0)),
		top: -(metrics.boxTop + Math.max(renderBox?.clientTop ?? 0, 0)),
	};
}

function createOutputFrameHitHarness() {
	const store = createCameraFramesStore();
	const state = {
		mode: "camera",
		outputFrameSelected: false,
		outputFrame: {
			anchor: "center",
		},
	};
	let shotCameraDocument = createShotCameraDocument({
		name: "Camera 1",
	});
	const historyLabels = [];
	let renderBoxRect = {
		left: 120,
		top: 80,
		width: 600,
		height: 360,
	};
	const renderBox = {
		clientLeft: 0,
		clientTop: 0,
		classList: {
			add() {},
			remove() {},
		},
		dataset: {},
		style: {},
		getBoundingClientRect: () => renderBoxRect,
	};
	const controller = createOutputFrameController({
		store,
		state,
		viewportShell: {
			clientWidth: 1280,
			clientHeight: 720,
			parentElement: null,
			getBoundingClientRect: () => ({ right: 1280 }),
		},
		workbenchRightColumn: null,
		renderBox,
		renderBoxMeta: {
			textContent: "",
		},
		anchorDot: {
			style: {},
		},
		frameOverlayCanvas: {
			style: {},
			getContext: () => null,
		},
		outputFrameResizeHandles: {},
		workspacePaneCamera: "camera",
		isZoomToolActive: () => false,
		t: () => "",
		getAnchorLabel: () => "",
		currentLocale: () => "ja",
		clearFrameSelection: () => {},
		isFrameSelectionActive: () => false,
		getActiveShotCameraDocument: () => shotCameraDocument,
		getShotCameraDocument: () => shotCameraDocument,
		getActiveShotCameraEntry: () => null,
		getReferenceImageController: () => null,
		shotCameraRegistry: {},
		getActiveFrames: () => shotCameraDocument.frames,
		getFrameAnchorDocument: () => ({ x: 0.5, y: 0.5 }),
		resolveFrameAxis: (value) => Number(value) || 0,
		resolveFrameAnchor: (value) => value ?? { x: 0.5, y: 0.5 },
		getBaseFovX: () => 50,
		updateActiveShotCameraDocument: (updater) => {
			shotCameraDocument = updater(shotCameraDocument);
			return shotCameraDocument;
		},
		updateUi: () => {},
		runHistoryAction: (label, applyChange) => {
			historyLabels.push(label);
			applyChange();
		},
	});
	return {
		controller,
		state,
		historyLabels,
		getDocument: () => shotCameraDocument,
		setRenderBoxRect: (nextRect) => {
			renderBoxRect = nextRect;
		},
	};
}

{
	const cameraPane = {
		clientWidth: 600,
		clientHeight: 720,
		parentElement: { clientWidth: 600, clientHeight: 720 },
		getBoundingClientRect: () => ({ right: 600 }),
	};
	const workbenchContainer = { clientWidth: 1600, clientHeight: 900 };
	const metrics = createOutputFrameMetricsController({
		store: { workbenchCollapsed: { value: false } },
		viewportShell: cameraPane,
		workbenchContainer,
		workbenchRightColumn: null,
		renderBox: null,
		getActiveShotCameraDocument: () => ({ outputFrame: {} }),
	});
	assert.deepEqual(metrics.getWorkbenchContainerSize(), {
		width: 1600,
		height: 900,
	});
}

{
	const metrics = { boxLeft: 120, boxTop: 80 };
	const renderBox = { clientLeft: 2, clientTop: 2 };
	assert.deepEqual(getFrameOverlayCanvasOffset(metrics, renderBox), {
		left: -122,
		top: -82,
	});
}

{
	const metrics = { boxLeft: 120, boxTop: 80 };
	const renderBox = { clientLeft: 0, clientTop: 0 };
	assert.deepEqual(getFrameOverlayCanvasOffset(metrics, renderBox), {
		left: -120,
		top: -80,
	});
}

{
	const layout = computeWorkbenchLayoutState({
		viewportWidth: 1600,
		viewportHeight: 900,
		shellRect: { right: 1600 },
		rightRect: { left: 1240 },
		workbenchCollapsed: false,
	});
	assert.equal(layout.stackedLayout, false);
	assert.equal(layout.safeWidth, 1224);
	assert.equal(layout.safeHeight, 900);
}

{
	const layout = computeWorkbenchLayoutState({
		viewportWidth: 1230,
		viewportHeight: 900,
		shellRect: { right: 1230 },
		rightRect: { left: 1240 },
		workbenchCollapsed: false,
	});
	assert.equal(layout.stackedLayout, false);
	assert.equal(layout.safeWidth, 1230);
	assert.equal(layout.safeRight, 1230);
}

{
	const layout = computeWorkbenchLayoutState({
		viewportWidth: 1600,
		viewportHeight: 900,
		shellRect: { right: 1600 },
		rightRect: null,
		workbenchCollapsed: false,
	});
	assert.equal(layout.stackedLayout, false);
	assert.equal(layout.safeWidth, 1600);
}

{
	const layout = computeWorkbenchLayoutState({
		viewportWidth: 1600,
		viewportHeight: 900,
		shellRect: { right: 1600 },
		rightRect: { left: 1240 },
		workbenchCollapsed: true,
	});
	assert.equal(layout.safeWidth, 1600);
}

{
	const layout = computeWorkbenchLayoutState({
		viewportWidth: 900,
		viewportHeight: 700,
		shellRect: { right: 900 },
		rightRect: { left: 540 },
		workbenchCollapsed: false,
	});
	assert.equal(layout.stackedLayout, true);
	assert.equal(layout.safeWidth, 900);
}

{
	const layout = computeWorkbenchAutoCollapseState({
		containerWidth: 1120,
		containerHeight: 900,
		exportWidth: 1754,
		exportHeight: 1240,
	});
	assert.equal(layout.expandedViewportWidth, 750);
	assert.equal(layout.expandedStackedLayout, true);
	assert.equal(layout.shouldAutoCollapse, true);
}

{
	const layout = computeWorkbenchAutoCollapseState({
		containerWidth: 1480,
		containerHeight: 900,
		exportWidth: 1754,
		exportHeight: 1240,
	});
	assert.equal(layout.expandedViewportWidth, 1110);
	assert.equal(layout.expandedStackedLayout, false);
	assert.equal(layout.shouldAutoCollapse, false);
}

{
	const layout = computeWorkbenchAutoCollapseState({
		containerWidth: 1280,
		containerHeight: 900,
		exportWidth: 1754,
		exportHeight: 1240,
		phoneLikeTouchViewport: true,
	});
	assert.equal(layout.shouldAutoCollapse, true);
}

{
	const harness = createOutputFrameHitHarness();
	assert.equal(
		harness.controller.isOutputFrameSelectHitAtPointer({
			clientX: 420,
			clientY: 82,
		}),
		true,
	);
	assert.equal(
		harness.controller.isOutputFrameSelectHitAtPointer({
			clientX: 420,
			clientY: 260,
		}),
		false,
	);

	harness.setRenderBoxRect({
		left: 320,
		top: 140,
		width: 420,
		height: 240,
	});
	assert.equal(
		harness.controller.isOutputFrameSelectHitAtPointer({
			clientX: 420,
			clientY: 82,
		}),
		false,
	);
	assert.equal(
		harness.controller.isOutputFrameSelectHitAtPointer({
			clientX: 738,
			clientY: 260,
		}),
		true,
	);

	harness.state.outputFrameSelected = true;
	assert.equal(
		harness.controller.isOutputFrameSelectHitAtPointer({
			clientX: 738,
			clientY: 260,
		}),
		false,
	);
}

{
	const harness = createOutputFrameHitHarness();
	const document = harness.getDocument();
	document.outputFrame.anchor = "top-left";
	const frustum = () =>
		getTargetFrustumExtents({
			near: 0.1,
			horizontalFovDegrees: document.lens.baseFovX,
			...document.outputFrame,
		});
	const before = frustum();
	harness.controller.setBoxWidthPixels(" 2048 ");
	assert.deepEqual(getExportSize(document.outputFrame), {
		width: 2048,
		height: 1240,
	});
	harness.controller.setBoxHeightPixels("１５３６．６");
	assert.deepEqual(getExportSize(document.outputFrame), {
		width: 2048,
		height: 1537,
	});
	assert.ok(Math.abs(frustum().left - before.left) < 1e-9);
	assert.ok(Math.abs(frustum().top - before.top) < 1e-9);
	assert.deepEqual(harness.historyLabels, [
		"output-frame.width",
		"output-frame.height",
	]);

	const snapshot = structuredClone(document);
	for (const value of [
		"",
		"  ",
		"NaN",
		"Infinity",
		"-Infinity",
		"2048px",
		"0x1000",
		"<script>alert(1)</script>",
		"9".repeat(400),
		Number.NaN,
		Number.POSITIVE_INFINITY,
		null,
		undefined,
	]) {
		harness.controller.setBoxWidthPixels(value);
		harness.controller.setBoxHeightPixels(value);
		assert.deepEqual(document, snapshot, `invalid input: ${value}`);
	}
	assert.equal(harness.historyLabels.length, 2);

	harness.controller.setBoxWidthPixels(-100);
	harness.controller.setBoxHeightPixels("0");
	assert.deepEqual(getExportSize(document.outputFrame), {
		width: 1754,
		height: 1240,
	});
	harness.controller.setBoxWidthPixels("999999");
	harness.controller.setBoxHeightPixels("999999");
	assert.deepEqual(getExportSize(document.outputFrame), {
		width: 15996,
		height: 15996,
	});
}

console.log("✅ CAMERA_FRAMES output frame controller tests passed!");
