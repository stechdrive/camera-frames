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

function createInputRouterHarness(overrides = {}) {
	const listeners = new Map();
	const listen = (target, type, handler) => {
		if (!listeners.has(target)) {
			listeners.set(target, new Map());
		}
		const targetListeners = listeners.get(target);
		const existingHandler = targetListeners.get(type);
		if (typeof existingHandler === "function") {
			targetListeners.set(type, (event) => {
				existingHandler(event);
				handler(event);
			});
			return;
		}
		targetListeners.set(type, handler);
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
	const fpsMovement = { enable: false, moveSpeed: 1 };
	const pointerControls = { enable: false };
	const originalWindow = globalThis.window;
	const originalDocument = globalThis.document;
	const originalElement = globalThis.Element;
	class TestElement {
		closest(_selector: string) {
			return null;
		}
	}
	globalThis.Element = TestElement as typeof Element;
	const renderBoxTarget = new TestElement();
	renderBoxTarget.closest = (selector: string) => {
		if (selector.includes("#render-box")) {
			return {};
		}
		return null;
	};
	const windowRef = {
		clearTimeout,
		setTimeout,
	};
	globalThis.window = windowRef;
	globalThis.document = { activeElement: null } as Document;
	const isInteractiveTextTarget =
		overrides.isInteractiveTextTarget ??
		((target) =>
			Boolean(
				target &&
					typeof target === "object" &&
					typeof target.closest === "function" &&
					target.closest(
						'input, textarea, select, option, [contenteditable="true"]',
					),
			));

	bindInputRouter({
		listen,
		viewportShell,
		dropHint,
		anchorDot,
		importOpenedFiles: overrides.importOpenedFiles,
		assetController: {
			importDroppedFiles: async (files) =>
				calls.push(["import-assets", files.map((file) => file.name)]),
		},
		importReferenceImageFiles: async (files) =>
			calls.push(["import-references", files.map((file) => file.name)]),
		supportsReferenceImageFile: (file) => file.name.endsWith(".png"),
		updateDropHint: () => calls.push(["update-drop-hint"]),
		updateUi: () => calls.push(["update-ui"]),
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
		toggleSplatEditMode: () => calls.push(["toggle-splat-edit"]),
		isSplatEditModeActive: () => overrides.isSplatEditModeActive ?? false,
		isSplatEditBrushActive: () => overrides.isSplatEditBrushActive ?? false,
		needsSplatEditBoxPlacement: () =>
			overrides.needsSplatEditBoxPlacement ?? false,
		placeSplatEditBoxAtPointer: (event) =>
			calls.push(["place-splat-box", event.clientX, event.clientY]),
		applySplatEditBrushAtPointer: (event) =>
			calls.push([
				"apply-splat-brush",
				event.clientX,
				event.clientY,
				Boolean(event.altKey),
			]),
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
		isInteractiveTextTarget,
		isViewportSelectMode: () => false,
		isViewportReferenceImageEditMode: () =>
			overrides.isViewportReferenceImageEditMode ?? false,
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
		fpsMovement,
		pointerControls,
		isFrameSelectionActive: () => false,
		isReferenceImageSelectionActive: () =>
			overrides.isReferenceImageSelectionActive ?? false,
		clearFrameSelection: () => calls.push(["clear-frame-selection"]),
		clearReferenceImageSelection: () =>
			calls.push(["clear-reference-selection"]),
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
		startOutputFrameAnchorDrag: () =>
			calls.push(["start-output-frame-anchor-drag"]),
	});

	return {
		listeners,
		viewportShell,
		renderBoxTarget,
		anchorDot,
		windowRef,
		fpsMovement,
		pointerControls,
		dropHint,
		calls,
		restore() {
			globalThis.window = originalWindow;
			globalThis.document = originalDocument;
			globalThis.Element = originalElement;
		},
	};
}

{
	const harness = createInputRouterHarness();
	try {
		const keydown = harness.listeners.get(harness.windowRef).get("keydown");
		keydown({
			code: "KeyE",
			shiftKey: true,
			altKey: false,
			ctrlKey: false,
			metaKey: false,
			repeat: false,
			target: null,
			preventDefault() {},
		});
		assert.deepEqual(harness.calls, [["toggle-splat-edit"]]);
	} finally {
		harness.restore();
	}
}

{
	const harness = createInputRouterHarness({
		isSplatEditModeActive: true,
		needsSplatEditBoxPlacement: true,
	});
	try {
		const pointerdown = harness.listeners
			.get(harness.viewportShell)
			.get("pointerdown");
		const pointerup = harness.listeners.get(harness.windowRef).get("pointerup");
		const viewportTarget = new globalThis.Element();
		viewportTarget.closest = (selector: string) => {
			if (selector === "#viewport") {
				return {};
			}
			return null;
		};
		pointerdown({
			pointerId: 1,
			button: 0,
			clientX: 320,
			clientY: 240,
			target: viewportTarget,
		});
		pointerup({
			pointerId: 1,
			clientX: 320,
			clientY: 240,
		});
		assert.deepEqual(harness.calls, [["place-splat-box", 320, 240]]);
	} finally {
		harness.restore();
	}
}

{
	const harness = createInputRouterHarness({
		isSplatEditModeActive: true,
		isSplatEditBrushActive: true,
	});
	try {
		const pointerdown = harness.listeners
			.get(harness.viewportShell)
			.get("pointerdown");
		const pointerup = harness.listeners.get(harness.windowRef).get("pointerup");
		const viewportTarget = new globalThis.Element();
		viewportTarget.closest = (selector: string) => {
			if (selector === "#viewport") {
				return {};
			}
			return null;
		};
		pointerdown({
			pointerId: 2,
			button: 0,
			clientX: 640,
			clientY: 360,
			target: viewportTarget,
		});
		pointerup({
			pointerId: 2,
			clientX: 640,
			clientY: 360,
			altKey: true,
		});
		assert.deepEqual(harness.calls, [["apply-splat-brush", 640, 360, true]]);
	} finally {
		harness.restore();
	}
}

{
	const harness = createInputRouterHarness();
	try {
		const focusin = harness.listeners.get(harness.windowRef).get("focusin");
		const focusout = harness.listeners.get(harness.windowRef).get("focusout");
		const inputTarget = createClosestTarget({
			input: {},
		});
		focusin({
			target: inputTarget,
		});
		assert.equal(harness.fpsMovement.enable, false);
		assert.equal(harness.pointerControls.enable, false);
		globalThis.document.activeElement = null;
		focusout({
			target: inputTarget,
		});
		await Promise.resolve();
		assert.equal(
			harness.fpsMovement.enable,
			false,
			"focus restore must not re-enable Spark FPV keyboard movement",
		);
		assert.equal(harness.pointerControls.enable, true);
	} finally {
		harness.restore();
	}
}

{
	const calls = [];
	const harness = createInputRouterHarness({
		importOpenedFiles: async (files) => {
			calls.push(["import-opened-files", files.map((file) => file.name)]);
		},
	});
	try {
		const drop = harness.listeners.get(harness.viewportShell).get("drop");
		await drop({
			preventDefault() {},
			dataTransfer: {
				files: [{ name: "scene.ssproj" }],
			},
		});
		assert.deepEqual(calls, [["import-opened-files", ["scene.ssproj"]]]);
		assert.deepEqual(harness.calls, []);
	} finally {
		harness.restore();
	}
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

{
	const harness = createInputRouterHarness({
		isViewportReferenceImageEditMode: true,
		isReferenceImageSelectionActive: true,
	});
	try {
		const pointerdown = harness.listeners
			.get(harness.viewportShell)
			.get("pointerdown");
		pointerdown({
			button: 0,
			target: harness.renderBoxTarget,
			preventDefault() {},
		});
		assert.deepEqual(harness.calls, []);
	} finally {
		harness.restore();
	}
}

{
	const harness = createInputRouterHarness({
		isViewportReferenceImageEditMode: true,
	});
	try {
		const pointerdown = harness.listeners
			.get(harness.anchorDot)
			.get("pointerdown");
		pointerdown({
			button: 0,
			preventDefault() {},
			stopPropagation() {},
		});
		assert.deepEqual(harness.calls, []);
	} finally {
		harness.restore();
	}
}

console.log("✅ CAMERA_FRAMES input router tests passed!");
