import assert from "node:assert/strict";
import { createFrameControllerBindings } from "../src/app/frame-controller-bindings.js";
import { createHistoryControllerBindings } from "../src/app/history-controller-bindings.js";
import { createLightingControllerBindings } from "../src/app/lighting-controller-bindings.js";
import { createOutputFrameControllerBindings } from "../src/app/output-frame-controller-bindings.js";
import { createProjectionControllerBindings } from "../src/app/projection-controller-bindings.js";
import { createReferenceImageControllerBindings } from "../src/app/reference-image-controller-bindings.js";
import { createReferenceImageRenderControllerBindings } from "../src/app/reference-image-render-controller-bindings.js";
import { createShotCameraEditorStateControllerBindings } from "../src/app/shot-camera-editor-state-bindings.js";
import { createViewportAxisGizmoControllerBindings } from "../src/app/viewport-axis-gizmo-controller-bindings.js";
import { createViewportToolControllerBindings } from "../src/app/viewport-tool-controller-bindings.js";

{
	const calls = [];
	const historyController = {
		runHistoryAction: () => "run",
		beginHistoryTransaction: () => "begin",
		commitHistoryTransaction: () => "commit",
		cancelHistoryTransaction: () => "cancel",
	};
	const frameBindings = createFrameControllerBindings({
		store: { id: "store" },
		state: { id: "state" },
		renderBox: { id: "render-box" },
		workspacePaneCamera: "camera",
		isZoomToolActive: () => true,
		t: () => "t",
		setStatus: () => "status",
		updateUi: () => "ui",
		getOutputFrameController: () => ({
			clearOutputFrameSelection: () => calls.push("clear-output-selection"),
			clearOutputFramePan: () => calls.push("clear-output-pan"),
		}),
		getActiveShotCameraDocument: () => ({ id: "shot-a" }),
		updateActiveShotCameraDocument: () => "update-shot",
		getOutputFrameMetrics: () => ({ id: "metrics" }),
		historyController,
	});
	assert.equal(frameBindings.workspacePaneCamera, "camera");
	frameBindings.clearOutputFrameSelection();
	frameBindings.clearOutputFramePan();
	assert.deepEqual(calls, ["clear-output-selection", "clear-output-pan"]);
	assert.equal(frameBindings.runHistoryAction(), "run");
	assert.equal(frameBindings.beginHistoryTransaction(), "begin");
	assert.equal(frameBindings.commitHistoryTransaction(), "commit");
	assert.equal(frameBindings.cancelHistoryTransaction(), "cancel");
}

{
	const outputFrameBindings = createOutputFrameControllerBindings({
		store: { id: "store" },
		state: { id: "state" },
		viewportShell: { id: "viewport-shell" },
		workbenchRightColumn: { id: "right-column" },
		renderBox: { id: "render-box" },
		renderBoxMeta: { id: "render-box-meta" },
		anchorDot: { id: "anchor-dot" },
		frameOverlayCanvas: { id: "overlay" },
		outputFrameResizeHandles: { id: "handles" },
		workspacePaneCamera: "camera",
		isZoomToolActive: () => false,
		t: () => "t",
		getAnchorLabel: () => "Center",
		currentLocale: "ja",
		getFrameController: () => ({
			clearFrameSelection: () => "clear-frame",
			isFrameSelectionActive: () => true,
			getActiveFrames: () => ["frame-a"],
			getFrameAnchorDocument: (frame) => ({ frame }),
			resolveFrameAxis: (value) => value,
			resolveFrameAnchor: (value, fallback) => value ?? fallback,
		}),
		getActiveShotCameraDocument: () => ({ id: "shot-a" }),
		getShotCameraDocument: () => ({ id: "shot-b" }),
		getActiveShotCameraEntry: () => ({ id: "entry-a" }),
		shotCameraRegistry: new Map(),
		getBaseFovX: () => 50,
		updateActiveShotCameraDocument: () => "update",
		updateUi: () => "ui",
		historyController: {
			runHistoryAction: () => "run",
			beginHistoryTransaction: () => "begin",
			commitHistoryTransaction: () => "commit",
			cancelHistoryTransaction: () => "cancel",
		},
	});
	assert.equal(outputFrameBindings.workspacePaneCamera, "camera");
	assert.equal(outputFrameBindings.isFrameSelectionActive(), true);
	assert.deepEqual(outputFrameBindings.getActiveFrames(), ["frame-a"]);
	assert.equal(outputFrameBindings.getBaseFovX(), 50);
}

{
	const referenceImageBindings = createReferenceImageControllerBindings({
		store: { id: "store" },
		referenceImageInput: { id: "input" },
		renderBox: { id: "render-box" },
		t: () => "t",
		setStatus: () => "status",
		updateUi: () => "ui",
		getCameraController: () => ({ setMode: (mode) => mode }),
		onReferenceImageSelectionCleared: () => "clear",
		onReferenceImageSelectionActivated: () => "activate",
		getActiveShotCameraDocument: () => ({ id: "shot" }),
		updateActiveShotCameraDocument: () => "update",
		getOutputSizeState: () => ({ width: 1, height: 1 }),
		historyController: {
			runHistoryAction: () => "run",
			beginHistoryTransaction: () => "begin",
			commitHistoryTransaction: () => "commit",
			cancelHistoryTransaction: () => "cancel",
		},
		workspacePaneCamera: "camera",
	});
	assert.equal(referenceImageBindings.ensureCameraMode(), "camera");
	assert.equal(referenceImageBindings.runHistoryAction(), "run");
}

{
	const shotBindings = createShotCameraEditorStateControllerBindings({
		store: { id: "store" },
		state: { id: "state" },
		getReferenceImageController: () => ({ id: "reference-controller" }),
		getFrameController: () => ({ id: "frame-controller" }),
		updateUi: () => "ui",
	});
	assert.equal(shotBindings.store.id, "store");
	assert.equal(shotBindings.state.id, "state");
	assert.equal(
		shotBindings.getReferenceImageController().id,
		"reference-controller",
	);
}

{
	const renderBindings = createReferenceImageRenderControllerBindings({
		store: { id: "store" },
		renderBox: { id: "render-box" },
		viewportShell: { id: "viewport-shell" },
		getActiveShotCameraDocument: () => ({ id: "shot" }),
		getOutputSizeState: () => ({ width: 10, height: 20 }),
	});
	assert.equal(renderBindings.store.id, "store");
	assert.deepEqual(renderBindings.getOutputSizeState(), {
		width: 10,
		height: 20,
	});
}

{
	const viewportToolBindings = createViewportToolControllerBindings({
		store: { id: "store" },
		state: { mode: "camera" },
		viewportShell: { id: "shell" },
		viewportGizmo: { id: "gizmo" },
		viewportGizmoSvg: { id: "gizmo-svg" },
		getActiveCameraViewCamera: () => "camera-view",
		getActiveViewportCamera: () => "viewport-view",
		assetController: { id: "asset-controller" },
		historyController: {
			beginHistoryTransaction: () => "begin",
			commitHistoryTransaction: () => "commit",
		},
		workspacePaneCamera: "camera",
	});
	assert.equal(viewportToolBindings.getActiveToolCamera(), "camera-view");
	assert.equal(viewportToolBindings.beginHistoryTransaction(), "begin");
	assert.equal(viewportToolBindings.commitHistoryTransaction(), "commit");
}

{
	const projectionBindings = createProjectionControllerBindings({
		state: { id: "state" },
		renderer: { id: "renderer" },
		getOutputFrameController: () => ({
			getOutputSizeState: () => ({ width: 1, height: 2 }),
			getOutputFrameMetrics: () => ({ id: "metrics" }),
			getViewportSize: () => ({ width: 3, height: 4 }),
			handleResize: () => "resize",
		}),
		syncActiveShotCameraFromDocument: () => "sync-shot",
		getActiveShotCamera: () => ({ id: "shot" }),
		getActiveShotCameraDocument: () => ({ id: "doc" }),
		getActiveCameraViewCamera: () => ({ id: "view" }),
		getActiveOutputCamera: () => ({ id: "output" }),
	});
	assert.deepEqual(projectionBindings.getOutputSizeState(), {
		width: 1,
		height: 2,
	});
	assert.deepEqual(projectionBindings.getViewportSize(), {
		width: 3,
		height: 4,
	});
	assert.equal(projectionBindings.handleOutputFrameResize(), "resize");
}

{
	const axisBindings = createViewportAxisGizmoControllerBindings({
		state: { id: "state" },
		viewportAxisGizmo: { id: "axis-gizmo" },
		viewportAxisGizmoSvg: { id: "axis-gizmo-svg" },
		getActiveViewportCamera: () => ({ id: "viewport-camera" }),
		viewportProjectionController: {
			getViewportProjectionMode: () => "orthographic",
			getViewportOrthoState: () => ({ axis: "+x" }),
		},
	});
	assert.equal(axisBindings.axisGizmo.id, "axis-gizmo");
	assert.equal(axisBindings.getViewportProjectionMode(), "orthographic");
	assert.deepEqual(axisBindings.getViewportOrthoState(), { axis: "+x" });
}

{
	const lightingBindings = createLightingControllerBindings({
		store: { id: "store" },
		scene: { id: "scene" },
		updateUi: () => "ui",
		historyController: { runHistoryAction: () => "run" },
	});
	assert.equal(lightingBindings.store.id, "store");
	assert.equal(lightingBindings.scene.id, "scene");
	assert.equal(lightingBindings.runHistoryAction(), "run");
}

{
	const historyBindings = createHistoryControllerBindings({
		store: { id: "store" },
		captureWorkspaceState: () => ({ id: "snapshot" }),
		restoreWorkspaceState: (snapshot) => snapshot,
		updateUi: () => "ui",
	});
	assert.equal(historyBindings.store.id, "store");
	assert.deepEqual(historyBindings.captureWorkspaceState(), { id: "snapshot" });
	assert.deepEqual(historyBindings.restoreWorkspaceState({ id: "restore" }), {
		id: "restore",
	});
}

console.log("✅ CAMERA_FRAMES remaining controller bindings tests passed!");
