import assert from "node:assert/strict";
import {
	bindInputRouter,
	isNativeHistoryTarget,
	isViewportOverlayControlTarget,
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

{
	const projectStatusTarget = createClosestTarget({
		".viewport-project-status": {},
	});
	const lodScaleTarget = createClosestTarget({ ".viewport-lod-scale": {} });
	const backgroundTaskTarget = createClosestTarget({
		".background-task-pill": {},
	});
	assert.equal(isViewportOverlayControlTarget(projectStatusTarget), true);
	assert.equal(isViewportOverlayControlTarget(lodScaleTarget), true);
	assert.equal(isViewportOverlayControlTarget(backgroundTaskTarget), true);
	assert.equal(isViewportOverlayControlTarget(createClosestTarget({})), false);
	assert.equal(isViewportOverlayControlTarget(null), false);
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
	const viewportShellClasses = new Set<string>();
	const viewportShellStyle = new Map<string, string>();
	const viewportShell = {
		id: "viewport-shell",
		classList: {
			add(...values: string[]) {
				for (const value of values) {
					viewportShellClasses.add(value);
				}
			},
			remove(...values: string[]) {
				for (const value of values) {
					viewportShellClasses.delete(value);
				}
			},
			toggle(value: string, force?: boolean) {
				const enabled = force ?? !viewportShellClasses.has(value);
				if (enabled) {
					viewportShellClasses.add(value);
				} else {
					viewportShellClasses.delete(value);
				}
				return enabled;
			},
			contains(value: string) {
				return viewportShellClasses.has(value);
			},
		},
		style: {
			setProperty(name: string, value: string) {
				viewportShellStyle.set(name, value);
			},
			getPropertyValue(name: string) {
				return viewportShellStyle.get(name) ?? "";
			},
		},
		getBoundingClientRect() {
			return { left: 0, top: 0, width: 800, height: 600 };
		},
		setPointerCapture() {},
	};
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
	const pointerControls = { enable: false, reverseRotate: false };
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
		startOrbitAroundHitDrag: overrides.startOrbitAroundHitDrag ?? (() => false),
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
		startSplatEditBrushStroke: (event) => {
			calls.push([
				"start-splat-brush",
				event.clientX,
				event.clientY,
				Boolean(event.altKey),
			]);
			return overrides.startSplatEditBrushStrokeResult ?? true;
		},
		handleSplatEditBrushStrokeMove: (event) => {
			calls.push([
				"move-splat-brush",
				event.clientX,
				event.clientY,
				Boolean(event.altKey),
			]);
			return true;
		},
		finishSplatEditBrushStroke: (event, options) => {
			calls.push([
				"finish-splat-brush",
				event.clientX,
				event.clientY,
				Boolean(event.altKey),
				Boolean(options?.cancel),
			]);
			return true;
		},
		updateSplatEditBrushPreview: (event) =>
			calls.push([
				"preview-splat-brush",
				event.clientX,
				event.clientY,
				Boolean(event.altKey),
			]),
		clearSplatEditBrushPreview: () => calls.push(["clear-splat-brush-preview"]),
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
		isViewportSelectMode: () => overrides.isViewportSelectMode ?? false,
		isViewportReferenceImageEditMode: () =>
			overrides.isViewportReferenceImageEditMode ?? false,
		getActiveCamera: () => null,
		isZoomInteractionMode: () => false,
		isPieInteractionMode: () => false,
		isLensInteractionMode: () => false,
		isRollInteractionMode: () => false,
		isViewportOrthographicActive: () =>
			overrides.isViewportOrthographicActive ?? false,
		applyNavigateInteractionMode: () => {},
		syncControlsToMode: () => {},
		ensurePerspectiveForViewportRotation: () => false,
		captureViewportProjectionState: () => null,
		restoreViewportProjectionState: () => false,
		openViewportPieMenu: (event) => {
			calls.push(["open-pie", event.clientX, event.clientY]);
			return false;
		},
		updateViewportPiePointer: () => {},
		finishViewportPieMenu: () => null,
		closeViewportPieMenu: () => {},
		handleViewportPieAction: () => {},
		state: {
			mode: overrides.mode ?? "viewport",
			interactionMode: overrides.interactionMode ?? "navigate",
		},
		fpsMovement,
		pointerControls,
		isFrameSelectionActive: () => overrides.isFrameSelectionActive ?? false,
		isReferenceImageSelectionActive: () =>
			overrides.isReferenceImageSelectionActive ?? false,
		clearFrameSelection: () => calls.push(["clear-frame-selection"]),
		clearReferenceImageSelection: () =>
			calls.push(["clear-reference-selection"]),
		clearOutputFrameSelection: () => {},
		selectFrame: (frameId) => calls.push(["select-frame", frameId]),
		getFrameSelectHitAtPointer:
			overrides.getFrameSelectHitAtPointer ?? (() => null),
		selectOutputFrame: () => calls.push(["select-output-frame"]),
		isOutputFrameSelectHitAtPointer:
			overrides.isOutputFrameSelectHitAtPointer ?? (() => false),
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
		handleViewportOrthographicWheel: (event) => {
			calls.push(["ortho-wheel", event.deltaY ?? 0]);
			return false;
		},
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
		pickViewportAssetAtPointer: () => {
			calls.push(["pick-viewport-asset"]);
			return true;
		},
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
		viewportShellClasses,
		viewportShellStyle,
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
		assert.equal(harness.pointerControls.reverseRotate, false);
		pointerdown({
			pointerId: 21,
			pointerType: "touch",
			button: 0,
			clientX: 320,
			clientY: 240,
			target: viewportTarget,
		});
		assert.equal(harness.pointerControls.reverseRotate, true);
		pointerup({
			pointerId: 21,
			pointerType: "touch",
			clientX: 320,
			clientY: 240,
			target: viewportTarget,
		});
		assert.equal(harness.pointerControls.reverseRotate, false);
	} finally {
		harness.restore();
	}
}

{
	const harness = createInputRouterHarness();
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
			pointerId: 41,
			pointerType: "mouse",
			button: 2,
			clientX: 200,
			clientY: 210,
			target: viewportTarget,
		});
		assert.equal(
			harness.viewportShellClasses.has("is-camera-pan-dragging"),
			true,
		);
		pointerup({
			pointerId: 41,
			pointerType: "mouse",
			clientX: 210,
			clientY: 220,
			target: viewportTarget,
		});
		assert.equal(
			harness.viewportShellClasses.has("is-camera-pan-dragging"),
			false,
		);
	} finally {
		harness.restore();
	}
}

{
	const harness = createInputRouterHarness({ mode: "camera" });
	try {
		const pointerdown = harness.listeners
			.get(harness.viewportShell)
			.get("pointerdown");
		const pointercancel = harness.listeners
			.get(harness.windowRef)
			.get("pointercancel");
		const viewportTarget = new globalThis.Element();
		viewportTarget.closest = (selector: string) => {
			if (selector === "#viewport") {
				return {};
			}
			return null;
		};
		pointerdown({
			pointerId: 42,
			pointerType: "mouse",
			button: 2,
			clientX: 200,
			clientY: 210,
			target: viewportTarget,
		});
		assert.equal(
			harness.viewportShellClasses.has("is-camera-pan-dragging"),
			true,
		);
		pointercancel({
			pointerId: 42,
			pointerType: "mouse",
			clientX: 210,
			clientY: 220,
			target: viewportTarget,
		});
		assert.equal(
			harness.viewportShellClasses.has("is-camera-pan-dragging"),
			false,
		);
	} finally {
		harness.restore();
	}
}

{
	const harness = createInputRouterHarness({ isSplatEditModeActive: true });
	try {
		const pointerdown = harness.listeners
			.get(harness.viewportShell)
			.get("pointerdown");
		const viewportTarget = new globalThis.Element();
		viewportTarget.closest = (selector: string) => {
			if (selector === "#viewport") {
				return {};
			}
			return null;
		};
		pointerdown({
			pointerId: 43,
			pointerType: "mouse",
			button: 2,
			clientX: 200,
			clientY: 210,
			target: viewportTarget,
		});
		assert.equal(
			harness.viewportShellClasses.has("is-camera-pan-dragging"),
			false,
		);
	} finally {
		harness.restore();
	}
}

{
	const harness = createInputRouterHarness();
	try {
		const pointerdown = harness.listeners
			.get(harness.viewportShell)
			.get("pointerdown");
		const pointermove = harness.listeners
			.get(harness.windowRef)
			.get("pointermove");
		const pointerup = harness.listeners.get(harness.windowRef).get("pointerup");
		const viewportTarget = new globalThis.Element();
		viewportTarget.closest = (selector: string) => {
			if (selector === "#viewport") {
				return {};
			}
			return null;
		};
		pointerdown({
			pointerId: 31,
			pointerType: "mouse",
			button: 0,
			clientX: 120,
			clientY: 140,
			target: viewportTarget,
		});
		assert.equal(
			harness.viewportShellClasses.has("is-orbit-reticle-active"),
			false,
		);
		pointermove({
			pointerId: 31,
			pointerType: "mouse",
			clientX: 121,
			clientY: 141,
			target: viewportTarget,
		});
		assert.equal(
			harness.viewportShellClasses.has("is-orbit-reticle-active"),
			false,
		);
		pointermove({
			pointerId: 31,
			pointerType: "mouse",
			clientX: 128,
			clientY: 140,
			target: viewportTarget,
		});
		assert.equal(
			harness.viewportShellClasses.has("is-orbit-reticle-active"),
			true,
		);
		assert.equal(
			harness.viewportShellStyle.get("--cf-orbit-reticle-x"),
			"120px",
		);
		assert.equal(
			harness.viewportShellStyle.get("--cf-orbit-reticle-y"),
			"140px",
		);
		pointerup({
			pointerId: 31,
			pointerType: "mouse",
			clientX: 128,
			clientY: 140,
			target: viewportTarget,
		});
		assert.equal(
			harness.viewportShellClasses.has("is-orbit-reticle-active"),
			false,
		);
	} finally {
		harness.restore();
	}
}

{
	const harness = createInputRouterHarness();
	try {
		const pointerdown = harness.listeners
			.get(harness.viewportShell)
			.get("pointerdown");
		const pointermove = harness.listeners
			.get(harness.windowRef)
			.get("pointermove");
		const viewportTarget = new globalThis.Element();
		viewportTarget.closest = (selector: string) => {
			if (selector === "#viewport") {
				return {};
			}
			return null;
		};
		pointerdown({
			pointerId: 32,
			pointerType: "touch",
			button: 0,
			clientX: 120,
			clientY: 140,
			target: viewportTarget,
		});
		pointermove({
			pointerId: 32,
			pointerType: "touch",
			clientX: 160,
			clientY: 140,
			target: viewportTarget,
		});
		assert.equal(
			harness.viewportShellClasses.has("is-orbit-reticle-active"),
			false,
		);
	} finally {
		harness.restore();
	}
}

{
	const harness = createInputRouterHarness({
		startOrbitAroundHitDrag: () => true,
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
			pointerId: 33,
			pointerType: "mouse",
			button: 0,
			ctrlKey: true,
			clientX: 160,
			clientY: 180,
			target: viewportTarget,
		});
		assert.equal(
			harness.viewportShellClasses.has("is-orbit-reticle-active"),
			true,
		);
		assert.equal(
			harness.viewportShellClasses.has("is-orbit-reticle-anchor"),
			true,
		);
		pointerup({
			pointerId: 33,
			pointerType: "mouse",
			clientX: 160,
			clientY: 180,
			target: viewportTarget,
		});
		assert.equal(
			harness.viewportShellClasses.has("is-orbit-reticle-active"),
			false,
		);
	} finally {
		harness.restore();
	}
}

{
	const harness = createInputRouterHarness();
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
			pointerId: 22,
			pointerType: "touch",
			button: 0,
			clientX: 320,
			clientY: 240,
			target: viewportTarget,
		});
		pointerdown({
			pointerId: 23,
			pointerType: "touch",
			button: 0,
			clientX: 420,
			clientY: 240,
			target: viewportTarget,
		});
		assert.equal(harness.pointerControls.reverseRotate, true);
		pointerup({
			pointerId: 22,
			pointerType: "touch",
			clientX: 320,
			clientY: 240,
			target: viewportTarget,
		});
		assert.equal(harness.pointerControls.reverseRotate, true);
		pointerup({
			pointerId: 23,
			pointerType: "touch",
			clientX: 420,
			clientY: 240,
			target: viewportTarget,
		});
		assert.equal(harness.pointerControls.reverseRotate, false);
	} finally {
		harness.restore();
	}
}

{
	const harness = createInputRouterHarness();
	try {
		const pointerdown = harness.listeners
			.get(harness.viewportShell)
			.get("pointerdown");
		const viewportTarget = new globalThis.Element();
		viewportTarget.closest = (selector: string) => {
			if (selector === "#viewport") {
				return {};
			}
			return null;
		};
		pointerdown({
			pointerId: 24,
			pointerType: "mouse",
			button: 0,
			clientX: 320,
			clientY: 240,
			target: viewportTarget,
		});
		assert.equal(harness.pointerControls.reverseRotate, false);
	} finally {
		harness.restore();
	}
}

{
	const harness = createInputRouterHarness();
	try {
		const pointerdown = harness.listeners
			.get(harness.viewportShell)
			.get("pointerdown");
		const hudTarget = new globalThis.Element();
		hudTarget.closest = (selector: string) => {
			if (selector.includes(".viewport-project-status")) {
				return {};
			}
			return null;
		};
		pointerdown({
			pointerId: 25,
			pointerType: "touch",
			button: 0,
			clientX: 320,
			clientY: 240,
			target: hudTarget,
		});
		assert.equal(harness.pointerControls.reverseRotate, false);
	} finally {
		harness.restore();
	}
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
		const pointermove = harness.listeners
			.get(harness.windowRef)
			.get("pointermove");
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
			preventDefault() {},
			stopPropagation() {},
			stopImmediatePropagation() {},
		});
		pointermove({
			pointerId: 2,
			clientX: 672,
			clientY: 392,
			target: viewportTarget,
			altKey: true,
			preventDefault() {},
			stopPropagation() {},
			stopImmediatePropagation() {},
		});
		pointerup({
			pointerId: 2,
			clientX: 672,
			clientY: 392,
			altKey: true,
			preventDefault() {},
			stopPropagation() {},
			stopImmediatePropagation() {},
		});
		assert.deepEqual(harness.calls, [
			["start-splat-brush", 640, 360, false],
			["move-splat-brush", 672, 392, true],
			["finish-splat-brush", 672, 392, true, false],
		]);
	} finally {
		harness.restore();
	}
}

{
	const harness = createInputRouterHarness({
		isSplatEditModeActive: true,
		isSplatEditBrushActive: true,
		startSplatEditBrushStrokeResult: false,
	});
	try {
		const pointerdown = harness.listeners
			.get(harness.viewportShell)
			.get("pointerdown");
		const pointerup = harness.listeners.get(harness.windowRef).get("pointerup");
		const viewportTarget = new globalThis.Element();
		viewportTarget.closest = (selector: string) => {
			if (selector === "#viewport" || selector === "#viewport-shell") {
				return {};
			}
			return null;
		};
		pointerdown({
			pointerId: 8,
			button: 0,
			clientX: 640,
			clientY: 360,
			target: viewportTarget,
			altKey: true,
			preventDefault() {},
			stopPropagation() {},
			stopImmediatePropagation() {},
		});
		pointerup({
			pointerId: 8,
			clientX: 640,
			clientY: 360,
			altKey: true,
		});
		assert.deepEqual(harness.calls, [
			["start-splat-brush", 640, 360, true],
			["apply-splat-brush", 640, 360, true],
		]);
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
		const viewportTarget = new globalThis.Element();
		viewportTarget.closest = (selector: string) => {
			if (selector === "#viewport") {
				return {};
			}
			return null;
		};
		pointerdown({
			pointerId: 4,
			button: 0,
			clientX: 640,
			clientY: 360,
			target: viewportTarget,
			ctrlKey: true,
			preventDefault() {},
			stopPropagation() {},
			stopImmediatePropagation() {},
		});
		assert.deepEqual(harness.calls, []);
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
		const pointermove = harness.listeners
			.get(harness.windowRef)
			.get("pointermove");
		const viewportTarget = new globalThis.Element();
		viewportTarget.closest = (selector: string) => {
			if (selector === "#viewport") {
				return {};
			}
			return null;
		};
		pointermove({
			pointerId: 3,
			clientX: 500,
			clientY: 280,
			target: viewportTarget,
			altKey: false,
		});
		assert.deepEqual(harness.calls, [["preview-splat-brush", 500, 280, false]]);
	} finally {
		harness.restore();
	}
}

{
	const harness = createInputRouterHarness({
		isViewportOrthographicActive: true,
	});
	try {
		const wheel = harness.listeners.get(harness.viewportShell).get("wheel");
		const hudTarget = new globalThis.Element();
		hudTarget.closest = (selector: string) => {
			if (selector.includes(".viewport-project-status")) {
				return {};
			}
			return null;
		};
		wheel({
			target: hudTarget,
			deltaY: 120,
			preventDefault() {},
			stopPropagation() {},
		});
		assert.deepEqual(harness.calls, []);
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
		const hudTarget = new globalThis.Element();
		hudTarget.closest = (selector: string) => {
			if (
				selector.includes(".viewport-lod-scale") ||
				selector === "#viewport-shell"
			) {
				return {};
			}
			return null;
		};
		pointerdown({
			pointerId: 9,
			button: 0,
			clientX: 240,
			clientY: 120,
			target: hudTarget,
			preventDefault() {},
			stopPropagation() {},
			stopImmediatePropagation() {},
		});
		assert.deepEqual(harness.calls, []);
	} finally {
		harness.restore();
	}
}

{
	const harness = createInputRouterHarness({
		isViewportSelectMode: true,
	});
	try {
		const pointerdown = harness.listeners
			.get(harness.viewportShell)
			.get("pointerdown");
		const pointerup = harness.listeners.get(harness.windowRef).get("pointerup");
		const hudTarget = new globalThis.Element();
		hudTarget.closest = (selector: string) => {
			if (
				selector.includes(".viewport-project-status") ||
				selector === "#viewport-shell"
			) {
				return {};
			}
			return null;
		};
		pointerdown({
			pointerId: 10,
			button: 0,
			clientX: 100,
			clientY: 80,
			target: hudTarget,
			preventDefault() {},
			stopPropagation() {},
			stopImmediatePropagation() {},
		});
		pointerup({
			pointerId: 10,
			clientX: 100,
			clientY: 80,
			target: hudTarget,
		});
		assert.deepEqual(harness.calls, []);
	} finally {
		harness.restore();
	}
}

{
	const harness = createInputRouterHarness();
	try {
		const pointerdown = harness.listeners
			.get(harness.viewportShell)
			.get("pointerdown");
		const hudTarget = new globalThis.Element();
		hudTarget.closest = (selector: string) => {
			if (selector.includes(".viewport-project-status")) {
				return {};
			}
			return null;
		};
		pointerdown({
			pointerId: 11,
			button: 1,
			clientX: 300,
			clientY: 160,
			target: hudTarget,
			preventDefault() {},
			stopPropagation() {},
			stopImmediatePropagation() {},
		});
		assert.deepEqual(harness.calls, []);
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
		importOpenedFiles: async (files, options = {}) => {
			calls.push([
				"import-opened-files",
				files.map((file) => file.name),
				options.fileHandles?.map((handle) => handle?.id ?? null) ?? null,
			]);
		},
	});
	try {
		const droppedHandle = {
			id: "dnd-project-handle",
			kind: "file",
			getFile: async () => ({ name: "scene.ssproj" }),
		};
		const drop = harness.listeners.get(harness.viewportShell).get("drop");
		await drop({
			preventDefault() {},
			dataTransfer: {
				files: [{ name: "scene.ssproj" }],
				items: [
					{
						kind: "file",
						getAsFileSystemHandle: async () => droppedHandle,
					},
				],
			},
		});
		assert.deepEqual(calls, [
			["import-opened-files", ["scene.ssproj"], ["dnd-project-handle"]],
		]);
		assert.deepEqual(harness.calls, []);
	} finally {
		harness.restore();
	}
}

{
	const harness = createInputRouterHarness();
	try {
		const paste = harness.listeners.get(harness.windowRef).get("paste");
		let prevented = false;
		await paste({
			target: createClosestTarget({}),
			clipboardData: {
				items: [
					{
						kind: "file",
						getAsFile: () =>
							new File([new Uint8Array([1])], "", { type: "image/png" }),
					},
				],
			},
			preventDefault() {
				prevented = true;
			},
		});
		assert.equal(prevented, true);
		assert.equal(harness.calls.length, 1);
		assert.equal(harness.calls[0][0], "import-references");
		assert.equal(harness.calls[0][1].length, 1);
		assert.match(harness.calls[0][1][0], /^clipboard-\d{8}-\d{6}\.png$/);
	} finally {
		harness.restore();
	}
}

{
	const harness = createInputRouterHarness();
	try {
		const paste = harness.listeners.get(harness.windowRef).get("paste");
		let prevented = false;
		await paste({
			target: createClosestTarget({ input: {} }),
			clipboardData: {
				items: [
					{
						kind: "file",
						getAsFile: () =>
							new File([new Uint8Array([1])], "", { type: "image/png" }),
					},
				],
			},
			preventDefault() {
				prevented = true;
			},
		});
		assert.equal(prevented, false);
		assert.deepEqual(harness.calls, []);
	} finally {
		harness.restore();
	}
}

{
	const harness = createInputRouterHarness();
	try {
		const paste = harness.listeners.get(harness.windowRef).get("paste");
		let prevented = false;
		await paste({
			target: createClosestTarget({}),
			clipboardData: {
				items: [
					{
						kind: "file",
						getAsFile: () =>
							new File([new Uint8Array([1])], "", { type: "image/bmp" }),
					},
				],
			},
			preventDefault() {
				prevented = true;
			},
		});
		assert.equal(prevented, false);
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
		isFrameSelectionActive: () => true,
	});
	try {
		const pointerdown = harness.listeners
			.get(harness.viewportShell)
			.get("pointerdown");
		const trajectoryHandleTarget = new globalThis.Element();
		trajectoryHandleTarget.closest = (selector: string) => {
			if (selector.includes(".frame-trajectory-layer")) {
				return {};
			}
			if (selector.includes("#render-box")) {
				return {};
			}
			return null;
		};
		pointerdown({
			button: 0,
			target: trajectoryHandleTarget,
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

{
	const harness = createInputRouterHarness({
		mode: "camera",
		getFrameSelectHitAtPointer: () => ({ frameId: "frame-2" }),
	});
	try {
		const pointerdown = harness.listeners
			.get(harness.viewportShell)
			.get("pointerdown");
		const pointerup = harness.listeners.get(harness.windowRef).get("pointerup");
		const viewportTarget = new globalThis.Element();
		viewportTarget.closest = (selector: string) => {
			const selectors = selector.split(",").map((item) => item.trim());
			if (selectors.includes("#viewport")) {
				return {};
			}
			return null;
		};
		pointerdown({
			button: 0,
			pointerId: 91,
			pointerType: "mouse",
			clientX: 100,
			clientY: 100,
			target: viewportTarget,
			preventDefault() {
				harness.calls.push(["prevent-default"]);
			},
			stopPropagation() {
				harness.calls.push(["stop-propagation"]);
			},
		});
		assert.deepEqual(harness.calls, []);
		pointerup({
			pointerId: 91,
			clientX: 102,
			clientY: 101,
		});
		assert.deepEqual(harness.calls, [["select-frame", "frame-2"]]);
	} finally {
		harness.restore();
	}
}

{
	const harness = createInputRouterHarness({
		mode: "camera",
		isFrameSelectionActive: true,
		getFrameSelectHitAtPointer: () => ({ frameId: "frame-3" }),
	});
	try {
		const pointerdown = harness.listeners
			.get(harness.viewportShell)
			.get("pointerdown");
		const pointerup = harness.listeners.get(harness.windowRef).get("pointerup");
		const viewportTarget = new globalThis.Element();
		viewportTarget.closest = (selector: string) => {
			const selectors = selector.split(",").map((item) => item.trim());
			if (selectors.includes("#viewport")) {
				return {};
			}
			return null;
		};
		pointerdown({
			button: 0,
			pointerId: 92,
			pointerType: "mouse",
			clientX: 100,
			clientY: 100,
			target: viewportTarget,
			preventDefault() {
				harness.calls.push(["prevent-default"]);
			},
			stopPropagation() {
				harness.calls.push(["stop-propagation"]);
			},
		});
		pointerup({
			pointerId: 92,
			clientX: 120,
			clientY: 100,
		});
		assert.deepEqual(harness.calls, []);
	} finally {
		harness.restore();
	}
}

{
	const harness = createInputRouterHarness({
		mode: "camera",
		isOutputFrameSelectHitAtPointer: () => true,
	});
	try {
		const pointerdown = harness.listeners
			.get(harness.viewportShell)
			.get("pointerdown");
		const pointerup = harness.listeners.get(harness.windowRef).get("pointerup");
		const viewportTarget = new globalThis.Element();
		viewportTarget.closest = (selector: string) => {
			const selectors = selector.split(",").map((item) => item.trim());
			if (selectors.includes("#viewport")) {
				return {};
			}
			return null;
		};
		pointerdown({
			button: 0,
			pointerId: 93,
			pointerType: "mouse",
			clientX: 100,
			clientY: 100,
			target: viewportTarget,
			preventDefault() {
				harness.calls.push(["prevent-default"]);
			},
			stopPropagation() {
				harness.calls.push(["stop-propagation"]);
			},
		});
		pointerup({
			pointerId: 93,
			clientX: 100,
			clientY: 100,
		});
		assert.deepEqual(harness.calls, [["select-output-frame"], ["update-ui"]]);
	} finally {
		harness.restore();
	}
}

console.log("✅ CAMERA_FRAMES input router tests passed!");
