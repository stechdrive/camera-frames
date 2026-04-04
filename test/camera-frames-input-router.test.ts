import assert from "node:assert/strict";
import {
	bindInputRouter,
	isNativeHistoryTarget,
} from "../src/interactions/input-router.js";

function createClosestTarget(matches: Record<string, unknown>) {
	return {
		closest(selector: string) {
			for (const [pattern, value] of Object.entries(matches)) {
				if (selector.includes(pattern)) {
					return value;
				}
			}
			return null;
		},
	};
}

{
	const target = createClosestTarget({
		'input[data-draft-editing="true"]': {},
	});
	assert.equal(isNativeHistoryTarget(target), true);
}

{
	const target = createClosestTarget({
		textarea: {},
	});
	assert.equal(isNativeHistoryTarget(target), true);
}

{
	const target = createClosestTarget({
		'input[type="text"]': {},
	});
	assert.equal(isNativeHistoryTarget(target), false);
}

{
	const target = createClosestTarget({});
	assert.equal(isNativeHistoryTarget(target), false);
	assert.equal(isNativeHistoryTarget(null), false);
	assert.equal(isNativeHistoryTarget(undefined), false);
	assert.equal(isNativeHistoryTarget({}), false);
}

function createInputRouterHarness() {
	const listeners = new Map();
	const listen = (target, type, handler) => {
		if (!listeners.has(target)) {
			listeners.set(target, new Map());
		}
		listeners.get(target).set(type, handler);
	};
	const viewportShell = { id: "viewport-shell" };
	const dropHint = {
		classList: {
			removed: [],
			added: [],
			remove(value) {
				this.removed.push(value);
			},
			add(value) {
				this.added.push(value);
			},
		},
	};
	const anchorDot = { id: "anchor-dot" };
	const calls = [];
	const originalWindow = globalThis.window;
	globalThis.window = { clearTimeout, setTimeout };

	bindInputRouter({
		listen,
		viewportShell,
		dropHint,
		anchorDot,
		assetController: {
			importDroppedFiles: async (files) =>
				calls.push(["import-assets", files.map((file) => file.name)]),
		},
		importReferenceImageFiles: async (files) =>
			calls.push(["import-references", files.map((file) => file.name)]),
		supportsReferenceImageFile: (file) => file.name.endsWith(".png"),
		updateDropHint: () => calls.push(["update-drop-hint"]),
		updateUi: () => {},
		updateOutputFrameOverlay: () => {},
		setStatus: (message) => calls.push(["status", message]),
		startOrbitAroundHitDrag: () => false,
		startZoomToolDrag: () => false,
		startLensAdjustDrag: () => false,
		startShotCameraRollDrag: () => false,
		startViewportOrthographicPanDrag: () => false,
		toggleMeasurementMode: () => {},
		toggleZoomTool: () => {},
		toggleViewportSelectMode: () => {},
		toggleViewportReferenceImageEditMode: () => {},
		toggleViewportTransformMode: () => {},
		toggleViewportPivotEditMode: () => {},
		startNewProject: () => {},
		saveProject: () => {},
		exportProject: () => {},
		openFiles: () => {},
		undoHistory: () => {},
		redoHistory: () => {},
		clearSceneAssetSelection: () => {},
		requestNavigationHistoryCommit: () => {},
		flushNavigationHistory: () => {},
		isInteractiveTextTarget: () => false,
		isViewportSelectMode: () => false,
		getActiveCamera: () => null,
		isZoomInteractionMode: () => false,
		isPieInteractionMode: () => false,
		isLensInteractionMode: () => false,
		isRollInteractionMode: () => false,
		isViewportOrthographicActive: () => false,
		applyNavigateInteractionMode: () => {},
		syncControlsToMode: () => {},
		ensurePerspectiveForViewportRotation: () => false,
		captureViewportProjectionState: () => null,
		restoreViewportProjectionState: () => false,
		openViewportPieMenu: () => false,
		updateViewportPiePointer: () => {},
		finishViewportPieMenu: () => null,
		closeViewportPieMenu: () => {},
		handleViewportPieAction: () => {},
		state: { mode: "viewport", interactionMode: "navigate" },
		fpsMovement: { enable: false, moveSpeed: 1 },
		pointerControls: { enable: false },
		isFrameSelectionActive: () => false,
		isReferenceImageSelectionActive: () => false,
		clearFrameSelection: () => {},
		clearReferenceImageSelection: () => {},
		clearOutputFrameSelection: () => {},
		handleOrbitAroundHitDragMove: () => {},
		handleOrbitAroundHitDragEnd: () => {},
		handleZoomToolDragMove: () => {},
		handleZoomToolDragEnd: () => {},
		handleLensAdjustDragMove: () => {},
		handleLensAdjustDragEnd: () => {},
		handleShotCameraRollDragMove: () => {},
		handleShotCameraRollDragEnd: () => {},
		handleViewportOrthographicPanMove: () => {},
		handleViewportOrthographicPanEnd: () => {},
		handleViewportOrthographicWheel: () => false,
		handleOutputFramePanMove: () => {},
		handleOutputFramePanEnd: () => {},
		handleOutputFrameResizeMove: () => {},
		handleOutputFrameResizeEnd: () => {},
		handleOutputFrameAnchorDragMove: () => {},
		handleOutputFrameAnchorDragEnd: () => {},
		handleFrameDragMove: () => {},
		handleFrameDragEnd: () => {},
		handleFrameResizeMove: () => {},
		handleFrameResizeEnd: () => {},
		handleFrameRotateMove: () => {},
		handleFrameRotateEnd: () => {},
		handleFrameAnchorDragMove: () => {},
		handleFrameAnchorDragEnd: () => {},
		handleViewportTransformDragMove: () => {},
		handleViewportTransformDragEnd: () => {},
		pickViewportAssetAtPointer: () => false,
		handleMeasurementPointerDown: () => false,
		handleMeasurementHoverMove: () => {},
		clearSelectedMeasurementPoint: () => {},
		deleteSelectedMeasurement: () => {},
		startOutputFrameAnchorDrag: () => {},
	});

	return {
		listeners,
		viewportShell,
		dropHint,
		calls,
		restore() {
			globalThis.window = originalWindow;
		},
	};
}

{
	const harness = createInputRouterHarness();
	try {
		const dragover = harness.listeners
			.get(harness.viewportShell)
			.get("dragover");
		dragover({
			preventDefault() {},
		});
		assert.deepEqual(harness.dropHint.classList.removed, []);
	} finally {
		harness.restore();
	}
}

{
	const harness = createInputRouterHarness();
	try {
		const dragleave = harness.listeners
			.get(harness.viewportShell)
			.get("dragleave");
		dragleave({
			preventDefault() {},
		});
		assert.deepEqual(harness.calls, [["update-drop-hint"]]);
	} finally {
		harness.restore();
	}
}

console.log("✅ CAMERA_FRAMES input router tests passed!");
