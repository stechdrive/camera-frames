import { effect } from "@preact/signals";
import { AUTO_LOD_MIN_SPLATS } from "../constants.js";
import { createSplatEditSceneHelper } from "../engine/splat-edit-scene-helper.js";
import { createSplatTransformPreviewController } from "../engine/splat-transform-preview.js";
import {
	clampBrushDepth,
	clampBrushSizePx,
} from "./per-splat-edit/pure-utils.js";
import {
	createSceneSplatAssetAccessor,
} from "./per-splat-edit/asset-accessors.js";
import { createSplatAssetPersistence } from "./per-splat-edit/persistence.js";
import { createBrushSpatialIndex } from "./per-splat-edit/brush-spatial-index.js";
import { createSplatSelectionState } from "./per-splat-edit/selection-state.js";
import { createSplatEditHistoryBridge } from "./per-splat-edit/history-bridge.js";
import { createSplatEditScope } from "./per-splat-edit/scope.js";
import {
	createSplatEditBoxTool,
	pointInSplatEditBox,
} from "./per-splat-edit/box-tool.js";
import { createSplatEditBrushTool } from "./per-splat-edit/brush-tool.js";
import { createSplatEditTransformTool } from "./per-splat-edit/transform-tool.js";
import {
	createSplatEditActions,
} from "./per-splat-edit/actions.js";
import { createSplatEditSceneHelperSync } from "./per-splat-edit/scene-helper-sync.js";
import { createSplatEditViewportHelpers } from "./per-splat-edit/viewport-helpers.js";
import { createSplatEditGizmo } from "./per-splat-edit/gizmo.js";
import { createSplatEditModeSwitch } from "./per-splat-edit/mode-switch.js";
import { createSplatEditContentMutations } from "./per-splat-edit/content-mutations.js";

export function createPerSplatEditController({
	store,
	state,
	t,
	guides,
	viewportShell,
	setStatus,
	updateUi,
	getAssetController,
	getActiveCamera,
	getActiveCameraViewCamera,
	selectionHighlightController,
	setViewportSelectMode,
	setViewportReferenceImageEditMode,
	setViewportTransformMode,
	setViewportPivotEditMode,
	setMeasurementMode,
	applyNavigateInteractionMode,
	syncControlsToMode,
	beginHistoryTransaction = () => false,
	commitHistoryTransaction = () => false,
	cancelHistoryTransaction = () => {},
}) {
	const isDevRuntime = Boolean(import.meta?.env?.DEV);
	const defaultBrushSize = clampBrushSizePx(store.splatEdit.brushSize.value);
	const defaultBrushDepthMode =
		store.splatEdit.brushDepthMode.value === "through" ? "through" : "depth";
	const defaultBrushDepth = clampBrushDepth(store.splatEdit.brushDepth.value);

	const sceneHelper = createSplatEditSceneHelper();
	const transformPreviewController = createSplatTransformPreviewController({
		guides,
	});
	guides?.add?.(sceneHelper.group);

	// Forward-declared module references (late-bound via closure)
	let scope;
	let selectionState;
	let persistence;
	let boxTool;
	let brushTool;
	let transformTool;
	let actions;
	let sceneHelperSync;
	let historyBridge;
	let contentMutations;
	let gizmo;
	let modeSwitch;

	const getSceneSplatAssets = createSceneSplatAssetAccessor({
		store,
		getAssetController,
	});

	const brushIndex = createBrushSpatialIndex({ pointInSplatEditBox });

	const viewportHelpers = createSplatEditViewportHelpers({
		state,
		viewportShell,
		getActiveCamera,
		getActiveCameraViewCamera,
	});

	scope = createSplatEditScope({
		store,
		updateUi,
		getSceneSplatAssets,
		syncSelectionCount: () => selectionState.syncSelectionCount(),
		syncSelectionHighlight: (opts) => selectionState.syncSelectionHighlight(opts),
		syncSceneHelper: () => sceneHelperSync.syncSceneHelper(),
		clearActiveTransformPreview: (opts) =>
			transformTool.clearActiveTransformPreview(opts),
		isSplatEditModeActive: () => modeSwitch.isSplatEditModeActive(),
	});

	selectionState = createSplatSelectionState({
		store,
		selectionHighlightController,
		transformPreviewController,
		getSplatEditScopeAssets: scope.getSplatEditScopeAssets,
		getSplatEditScopeAssetIds: scope.getSplatEditScopeAssetIds,
	});

	persistence = createSplatAssetPersistence({
		getSceneSplatAssets,
		getAssetController,
		invalidateBrushSpatialIndex: brushIndex.invalidateBrushSpatialIndex,
		beginHistoryTransaction,
		getSplatEditScopeAssets: scope.getSplatEditScopeAssets,
		selectedSplatsByAssetId: selectionState.selectedSplatsByAssetId,
	});

	boxTool = createSplatEditBoxTool({
		store,
		state,
		t,
		isDevRuntime,
		setStatus,
		updateUi,
		getAssetController,
		getActiveCamera,
		getActiveCameraViewCamera,
		getViewportRect: viewportHelpers.getViewportRect,
		getPrimaryViewRect: viewportHelpers.getPrimaryViewRect,
		cancelHistoryTransaction,
		runSynchronousHistoryTransaction: (label, apply) =>
			historyBridge.runSynchronousHistoryTransaction(label, apply),
		getSplatEditScopeAssets: scope.getSplatEditScopeAssets,
		getSplatEditScopeAssetIds: scope.getSplatEditScopeAssetIds,
		getSceneSplatAssets,
		getScopeBounds: scope.getScopeBounds,
		getPreciseScopeCenterBounds: scope.getPreciseScopeCenterBounds,
		selectedSplatsByAssetId: selectionState.selectedSplatsByAssetId,
		findReusableBrushSpatialIndex: brushIndex.findReusableBrushSpatialIndex,
		applyBoxSelectionToSpatialIndex: brushIndex.applyBoxSelectionToSpatialIndex,
		syncSelectionCount: selectionState.syncSelectionCount,
		syncSelectionHighlight: selectionState.syncSelectionHighlight,
		syncSceneHelper: () => sceneHelperSync.syncSceneHelper(),
	});

	sceneHelperSync = createSplatEditSceneHelperSync({
		store,
		sceneHelper,
		isSplatEditModeActive: () => modeSwitch.isSplatEditModeActive(),
		getSplatEditScopeAssetIds: scope.getSplatEditScopeAssetIds,
		getSplatEditBoxCenter: boxTool.getSplatEditBoxCenter,
		getSplatEditBoxSize: boxTool.getSplatEditBoxSize,
		getSplatEditBoxRotation: boxTool.getSplatEditBoxRotation,
	});

	transformTool = createSplatEditTransformTool({
		store,
		t,
		setStatus,
		updateUi,
		transformPreviewController,
		selectedSplatsByAssetId: selectionState.selectedSplatsByAssetId,
		getSplatEditScopeAssets: scope.getSplatEditScopeAssets,
		markSplatAssetPersistentSourceDirty:
			persistence.markSplatAssetPersistentSourceDirty,
		invalidateBrushSpatialIndex: brushIndex.invalidateBrushSpatialIndex,
		updateSplatAssetBoundsHints: persistence.updateSplatAssetBoundsHints,
		syncSelectionHighlight: selectionState.syncSelectionHighlight,
		syncSceneHelper: sceneHelperSync.syncSceneHelper,
	});

	brushTool = createSplatEditBrushTool({
		store,
		t,
		setStatus,
		updateUi,
		getAssetController,
		beginHistoryTransaction,
		commitHistoryTransaction,
		cancelHistoryTransaction,
		getPrimaryViewCamera: viewportHelpers.getPrimaryViewCamera,
		getPrimaryViewRect: viewportHelpers.getPrimaryViewRect,
		getSplatEditScopeAssetIds: scope.getSplatEditScopeAssetIds,
		getSplatEditScopeAssets: scope.getSplatEditScopeAssets,
		selectedSplatsByAssetId: selectionState.selectedSplatsByAssetId,
		isSplatEditModeActive: () => modeSwitch.isSplatEditModeActive(),
		ensureBrushSpatialIndex: brushIndex.ensureBrushSpatialIndex,
		applyBrushHitToSpatialIndex: brushIndex.applyBrushHitToSpatialIndex,
		brushPointMatchesCylinder: brushIndex.brushPointMatchesCylinder,
		syncSelectionCount: selectionState.syncSelectionCount,
		syncSelectionHighlight: selectionState.syncSelectionHighlight,
		flushPendingSelectionHighlightSync:
			selectionState.flushPendingSelectionHighlightSync,
	});

	actions = createSplatEditActions({
		store,
		t,
		setStatus,
		updateUi,
		selectedSplatsByAssetId: selectionState.selectedSplatsByAssetId,
		getSplatEditScopeAssets: scope.getSplatEditScopeAssets,
		syncSelectionCount: selectionState.syncSelectionCount,
		syncSelectionHighlight: selectionState.syncSelectionHighlight,
		clearSelectionHighlight: selectionState.clearSelectionHighlight,
		syncSceneHelper: sceneHelperSync.syncSceneHelper,
		clearActiveTransformPreview: transformTool.clearActiveTransformPreview,
		isSplatEditModeActive: () => modeSwitch.isSplatEditModeActive(),
	});

	historyBridge = createSplatEditHistoryBridge({
		store,
		updateUi,
		beginHistoryTransaction,
		commitHistoryTransaction,
		cancelHistoryTransaction,
		defaultBrushSize,
		defaultBrushDepthMode,
		defaultBrushDepth,
		getSplatEditScopeAssetIds: scope.getSplatEditScopeAssetIds,
		normalizeScopeAssetIds: scope.normalizeScopeAssetIds,
		getSplatEditBoxRotation: boxTool.getSplatEditBoxRotation,
		getSceneSplatAssets,
		selectedSplatsByAssetId: selectionState.selectedSplatsByAssetId,
		selectedSplatsInner: selectionState.selectedSplatsInner,
		selectionByRevision: selectionState.selectionByRevision,
		setCurrentSelectionRevisionId: selectionState.setCurrentSelectionRevisionId,
		markSelectionDirty: selectionState.markSelectionDirty,
		ensureSelectionRevisionCached: selectionState.ensureSelectionRevisionCached,
		markSplatAssetsForHistorySourceCapture:
			persistence.markSplatAssetsForHistorySourceCapture,
		releaseSplatAssetsForHistorySourceCapture:
			persistence.releaseSplatAssetsForHistorySourceCapture,
		syncSelectionCount: selectionState.syncSelectionCount,
		syncSelectionHighlight: selectionState.syncSelectionHighlight,
		syncSceneHelper: sceneHelperSync.syncSceneHelper,
		clearActiveTransformPreview: transformTool.clearActiveTransformPreview,
		clearActiveBrushStroke: brushTool.clearActiveBrushStroke,
		clearBrushPreview: brushTool.clearBrushPreview,
	});

	contentMutations = createSplatEditContentMutations({
		store,
		t,
		setStatus,
		updateUi,
		getAssetController,
		buildSelectedSplatOperations: persistence.buildSelectedSplatOperations,
		createDerivedPackedSplatSource: persistence.createDerivedPackedSplatSource,
		buildDerivedSplatFileName: persistence.buildDerivedSplatFileName,
		buildUniqueSplitLabel: persistence.buildUniqueSplitLabel,
		buildUniqueDuplicateLabel: persistence.buildUniqueDuplicateLabel,
		markSplatAssetsForHistorySourceCapture:
			persistence.markSplatAssetsForHistorySourceCapture,
		runSplatSourceHistoryTransaction:
			historyBridge.runSplatSourceHistoryTransaction,
		invalidateBrushSpatialIndex: brushIndex.invalidateBrushSpatialIndex,
		selectedSplatsByAssetId: selectionState.selectedSplatsByAssetId,
		syncSelectionCount: selectionState.syncSelectionCount,
		syncSelectionHighlight: selectionState.syncSelectionHighlight,
		syncSceneHelper: sceneHelperSync.syncSceneHelper,
		syncScopeToSceneSelection: scope.syncScopeToSceneSelection,
	});

	gizmo = createSplatEditGizmo({
		store,
		t,
		setStatus,
		updateUi,
		beginHistoryTransaction,
		commitHistoryTransaction,
		isSplatEditModeActive: () => modeSwitch.isSplatEditModeActive(),
		getSplatEditBoxCenter: boxTool.getSplatEditBoxCenter,
		getSplatEditBoxRotation: boxTool.getSplatEditBoxRotation,
		getSplatEditBoxBasisWorld: boxTool.getSplatEditBoxBasisWorld,
		getSelectedSplatTransformEntries:
			transformTool.getSelectedSplatTransformEntries,
		getSelectedSplatTransformPivotWorld:
			transformTool.getSelectedSplatTransformPivotWorld,
		ensureSelectedSplatTransformPreview:
			transformTool.ensureSelectedSplatTransformPreview,
		updateSelectedSplatTransformPreview:
			transformTool.updateSelectedSplatTransformPreview,
		finalizeSelectedSplatTransform: transformTool.finalizeSelectedSplatTransform,
		beginSplatSourceHistoryTransaction:
			persistence.beginSplatSourceHistoryTransaction,
		finalizeSplatTransformDragHistory:
			historyBridge.finalizeSplatTransformDragHistory,
		syncSceneHelper: sceneHelperSync.syncSceneHelper,
	});

	modeSwitch = createSplatEditModeSwitch({
		store,
		state,
		t,
		setStatus,
		updateUi,
		setMeasurementMode,
		setViewportSelectMode,
		setViewportReferenceImageEditMode,
		setViewportTransformMode,
		setViewportPivotEditMode,
		applyNavigateInteractionMode,
		syncControlsToMode,
		cancelHistoryTransaction,
		resolveEntryScopeAssetIds: scope.resolveEntryScopeAssetIds,
		getSplatEditScopeAssetIds: scope.getSplatEditScopeAssetIds,
		syncSelectionCount: selectionState.syncSelectionCount,
		syncSelectionHighlight: selectionState.syncSelectionHighlight,
		clearSelectionHighlight: selectionState.clearSelectionHighlight,
		syncSceneHelper: sceneHelperSync.syncSceneHelper,
		clearSplatSelection: actions.clearSplatSelection,
		clearBrushPreview: brushTool.clearBrushPreview,
		clearActiveBrushStroke: brushTool.clearActiveBrushStroke,
		clearActiveTransformPreview: transformTool.clearActiveTransformPreview,
		flushPendingSelectionHighlightSync:
			selectionState.flushPendingSelectionHighlightSync,
		clearBrushSpatialIndices: brushIndex.clearBrushSpatialIndices,
		getActiveBoxDrag: gizmo.getActiveBoxDrag,
		clearActiveBoxDrag: gizmo.clearActiveBoxDrag,
		getActiveTransformDrag: gizmo.getActiveTransformDrag,
		clearActiveTransformDrag: gizmo.clearActiveTransformDrag,
		finalizeSplatTransformDragHistory:
			historyBridge.finalizeSplatTransformDragHistory,
	});

	function assetNeedsLodRebuild(asset) {
		const packedSplats = asset?.disposeTarget?.packedSplats;
		if (!packedSplats) {
			return false;
		}
		if (packedSplats.lodSplats) {
			return false;
		}
		const numSplats =
			packedSplats.getNumSplats?.() ?? packedSplats.numSplats ?? 0;
		return numSplats >= AUTO_LOD_MIN_SPLATS;
	}

	function syncSplatEditLodStatus() {
		const active = modeSwitch?.isSplatEditModeActive?.() ?? false;
		if (!active) {
			store.splatEdit.lodStatus.value = "empty";
			return;
		}
		const scopeAssets = scope?.getSplatEditScopeAssets?.() ?? [];
		const eligible = scopeAssets.filter((asset) => {
			const packedSplats = asset?.disposeTarget?.packedSplats;
			if (!packedSplats) {
				return false;
			}
			const numSplats =
				packedSplats.getNumSplats?.() ?? packedSplats.numSplats ?? 0;
			return numSplats >= AUTO_LOD_MIN_SPLATS;
		});
		if (eligible.length === 0) {
			store.splatEdit.lodStatus.value = "empty";
			return;
		}
		const stale = eligible.some((asset) => assetNeedsLodRebuild(asset));
		store.splatEdit.lodStatus.value = stale ? "stale" : "ready";
	}

	const lodStatusEffectDisposer = effect(() => {
		// Subscribe to the signals that affect LoD status computation so
		// the splat-edit toolbar's "LoD 最適化" button stays fresh without
		// needing explicit calls scattered through every edit path.
		void store.splatEdit.active.value;
		void store.splatEdit.scopeAssetIds.value;
		void store.splatEdit.lastOperation.value;
		void store.backgroundTask?.value;
		syncSplatEditLodStatus();
	});

	function rebuildSplatEditLod() {
		if (!modeSwitch?.isSplatEditModeActive?.()) {
			return false;
		}
		const assetController = getAssetController?.();
		const kick = assetController?.kickAutoLodBake;
		if (typeof kick !== "function") {
			return false;
		}
		const scopeAssets = scope?.getSplatEditScopeAssets?.() ?? [];
		let dispatched = 0;
		for (const asset of scopeAssets) {
			if (!assetNeedsLodRebuild(asset)) {
				continue;
			}
			const displayName =
				asset?.label ?? asset?.source?.fileName ?? "3DGS";
			kick(asset.disposeTarget.packedSplats, displayName);
			dispatched += 1;
		}
		// Recompute after dispatching so UI flips to "ready" for small
		// assets immediately (their bakes are near-instant) and otherwise
		// stays "stale" until the background task completes and calls
		// syncSplatEditLodStatus again.
		syncSplatEditLodStatus();
		return dispatched > 0;
	}

	function dispose() {
		lodStatusEffectDisposer?.();
		brushTool.clearActiveBrushStroke();
		brushTool.clearBrushPreview({ syncUi: false });
		historyBridge.finalizeSplatTransformDragHistory(gizmo.getActiveTransformDrag());
		gizmo.clearActiveTransformDrag();
		transformTool.clearActiveTransformPreview({ syncUi: false });
		selectionState.clearSelectionHighlight();
		brushIndex.clearBrushSpatialIndices();
		transformPreviewController.dispose();
		selectionHighlightController?.dispose?.();
		sceneHelper.clear();
		guides?.remove?.(sceneHelper.group);
		sceneHelper.dispose();
		selectionState.selectionByRevision.clear();
	}

	return {
		isSplatEditModeActive: modeSwitch.isSplatEditModeActive,
		isSplatEditBrushActive: modeSwitch.isSplatEditBrushActive,
		setSplatEditMode: modeSwitch.setSplatEditMode,
		toggleSplatEditMode: modeSwitch.toggleSplatEditMode,
		syncScopeToSceneSelection: scope.syncScopeToSceneSelection,
		setSplatEditTool: modeSwitch.setSplatEditTool,
		setSplatEditBrushSize: brushTool.setSplatEditBrushSize,
		setSplatEditBrushDepthMode: brushTool.setSplatEditBrushDepthMode,
		setSplatEditBrushDepth: brushTool.setSplatEditBrushDepth,
		setSplatEditBoxCenterAxis: boxTool.setSplatEditBoxCenterAxis,
		setSplatEditBoxSizeAxis: boxTool.setSplatEditBoxSizeAxis,
		setSplatEditBoxRotationAxis: boxTool.setSplatEditBoxRotationAxis,
		scaleSplatEditBoxUniform: boxTool.scaleSplatEditBoxUniform,
		placeSplatEditBoxAtViewCenter: boxTool.placeSplatEditBoxAtViewCenter,
		fitSplatEditBoxToScope: boxTool.fitSplatEditBoxToScope,
		applySplatEditBoxSelection: boxTool.applySplatEditBoxSelection,
		applySplatEditBrushAtClientPoint: brushTool.applySplatEditBrushAtClientPoint,
		updateBrushPreviewFromClientPoint:
			brushTool.updateBrushPreviewFromClientPoint,
		moveSelectedSplatsByWorldDelta: transformTool.moveSelectedSplatsByWorldDelta,
		rotateSelectedSplatsAroundSelection:
			transformTool.rotateSelectedSplatsAroundSelection,
		scaleSelectedSplatsUniformAroundSelection:
			transformTool.scaleSelectedSplatsUniformAroundSelection,
		deleteSelectedSplats: contentMutations.deleteSelectedSplats,
		separateSelectedSplats: contentMutations.separateSelectedSplats,
		duplicateSelectedSplats: contentMutations.duplicateSelectedSplats,
		captureEditState: historyBridge.captureEditState,
		restoreEditState: historyBridge.restoreEditState,
		retainSelectionRevision: selectionState.retainSelectionRevision,
		releaseSelectionRevision: selectionState.releaseSelectionRevision,
		clearSplatSelection: actions.clearSplatSelection,
		selectAllSplats: actions.selectAllSplats,
		invertSplatSelection: actions.invertSplatSelection,
		getSplatEditScopeAssetIds: scope.getSplatEditScopeAssetIds,
		getSplatEditScopeAssets: scope.getSplatEditScopeAssets,
		rebuildSplatEditLod,
		syncSplatEditLodStatus,
		needsSplatEditBoxPlacement() {
			return (
				modeSwitch.isSplatEditModeActive() &&
				store.splatEdit.tool.value === "box" &&
				!store.splatEdit.boxPlaced.value &&
				scope.getSplatEditScopeAssetIds().length > 0
			);
		},
		getViewportGizmoConfig: gizmo.getViewportGizmoConfig,
		placeSplatEditBoxAtPointer(event, { camera, viewportRect } = {}) {
			if (
				!modeSwitch.isSplatEditModeActive() ||
				store.splatEdit.tool.value !== "box" ||
				!camera ||
				!viewportRect ||
				!Number.isFinite(event?.clientX) ||
				!Number.isFinite(event?.clientY)
			) {
				return false;
			}
			return boxTool.placeSplatEditBoxAtClientPoint({
				clientX: Number(event.clientX),
				clientY: Number(event.clientY),
			});
		},
		applySplatEditBrushAtPointer(event) {
			if (
				!modeSwitch.isSplatEditModeActive() ||
				store.splatEdit.tool.value !== "brush" ||
				!Number.isFinite(event?.clientX) ||
				!Number.isFinite(event?.clientY)
			) {
				return false;
			}
			return (
				brushTool.applySplatEditBrushAtClientPoint({
					clientX: Number(event.clientX),
					clientY: Number(event.clientY),
					subtract: event?.altKey === true,
				}) > 0
			);
		},
		startSplatEditBrushStroke: brushTool.startSplatEditBrushStroke,
		handleSplatEditBrushStrokeMove: brushTool.handleSplatEditBrushStrokeMove,
		finishSplatEditBrushStroke: brushTool.finishSplatEditBrushStroke,
		clearBrushPreview: brushTool.clearBrushPreview,
		startViewportGizmoDrag: gizmo.startViewportGizmoDrag,
		handleViewportGizmoDragMove: gizmo.handleViewportGizmoDragMove,
		handleViewportGizmoDragEnd: gizmo.handleViewportGizmoDragEnd,
		flushDirtySplatAssetPersistentSources:
			persistence.flushDirtySplatAssetPersistentSources,
		syncSceneHelperForCamera: sceneHelperSync.syncSceneHelperForCamera,
		handleToolModeDeactivated: modeSwitch.handleToolModeDeactivated,
		resetForSceneChange: modeSwitch.resetForSceneChange,
		dispose,
	};
}
