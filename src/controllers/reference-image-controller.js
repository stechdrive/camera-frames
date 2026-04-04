import { getPointFromRectLocal } from "../engine/reference-image-selection.js";
import {
	REFERENCE_IMAGE_DEFAULT_PRESET_ID,
	cloneReferenceImageDocument,
	createDefaultReferenceImageDocument,
	createReferenceImageCameraPresetOverride,
	createReferenceImageItem,
	createReferenceImagePreset,
	createShotCameraReferenceImagesState,
	findReferenceImagePreset,
	getShotReferenceImagePresetId,
	normalizeReferenceImageDocument,
	removeRenderBoxOffsetCorrection,
	resolveReferenceImageItemsForShot,
} from "../reference-image-model.js";
import { cloneShotCameraDocument } from "../workspace-model.js";
import { createReferenceImageCameraBindings } from "./reference-image/camera-bindings.js";
import {
	buildDuplicatePresetName,
	buildReferenceImageOverridePatch,
	buildReferenceImageSizeLabel,
	ensureWritableReferenceImageImportPreset,
	findMutablePresetInDocument,
	isReferenceImageOverrideEmpty,
	normalizeReferenceImageItemOrderInPlace,
	pruneUnusedReferenceImageAssetsInDocument,
	sanitizeReferenceImagePresetName,
	supportsReferenceImageFile,
} from "./reference-image/document-helpers.js";
import { createReferenceImageDocumentOperations } from "./reference-image/document-operations.js";
import { createReferenceImageImportRuntime } from "./reference-image/import-runtime.js";
import {
	buildReferenceImageMultiSelectionInspectorSignature,
	buildReferenceImageMultiSelectionInspectorState,
	captureReferenceImageMultiSelectionBaseline,
	cloneReferenceImageMultiSelectionLogicalBox,
} from "./reference-image/inspector-state.js";
import { createReferenceImageListOperations } from "./reference-image/list-operations.js";
import { createReferenceImagePropertyOperations } from "./reference-image/property-operations.js";
import {
	buildReferenceImageSelectionBoxLogicalFromGeometries,
	captureReferenceImageEditorStateSnapshot,
	doesReferenceImageSelectionBoxMatchGeometries,
	getSelectedReferenceImageItemIds,
	getValidReferenceImageSelectionState,
	normalizeReferenceImageEditorStateForRestore,
	projectReferenceImageSelectionBoxLogicalToScreen,
} from "./reference-image/selection-state.js";
import { createReferenceImageStatePersistence } from "./reference-image/state-persistence.js";
import { createReferenceImageTransformState } from "./reference-image/transform-state.js";
import { createReferenceImageUiStateSync } from "./reference-image/ui-state-sync.js";
import { createReferenceImageViewportInteraction } from "./reference-image/viewport-interaction.js";

export { ensureWritableReferenceImageImportPreset, supportsReferenceImageFile };
export function createReferenceImageController({
	store,
	referenceImageInput,
	renderBox,
	t,
	setStatus,
	updateUi,
	ensureCameraMode,
	onReferenceImageSelectionCleared = () => {},
	onReferenceImageSelectionActivated = () => {},
	getActiveShotCameraDocument,
	updateActiveShotCameraDocument,
	getOutputSizeState,
	runHistoryAction = (_label, applyChange) => {
		applyChange?.();
		return false;
	},
	beginHistoryTransaction = () => false,
	commitHistoryTransaction = () => false,
	cancelHistoryTransaction = () => {},
}) {
	let referenceListSelectionAnchorId = "";

	let lastNonEmptyReferenceSelectionState = {
		selectedItemIds: [],
		activeItemId: "",
	};
	let referenceImageInspectorTransformState = {
		locked: false,
		baselineSignature: "",
		sessionSignature: "",
		baselineItems: new Map(),
		baselineSelectionBoxLogical: null,
		session: null,
	};

	function getSelectedItemIds() {
		return getSelectedReferenceImageItemIds(
			store.referenceImages.selectedItemIds.value,
		);
	}

	function getValidSelectionState({
		items = store.referenceImages.items.value,
		selectedItemIds = getSelectedItemIds(),
		activeItemId = store.referenceImages.selectedItemId.value,
	} = {}) {
		return getValidReferenceImageSelectionState({
			items,
			selectedItemIds,
			activeItemId,
		});
	}

	function setStoredSelectionBox(
		logicalBox,
		context = null,
		anchorLocal = null,
	) {
		store.referenceImages.selectionBoxLogical.value = logicalBox ?? null;
		store.referenceImages.selectionBoxScreen.value =
			logicalBox && context
				? projectReferenceImageSelectionBoxLogicalToScreen(
						logicalBox,
						context,
						anchorLocal,
					)
				: null;
	}

	function initializeMultiSelectionTransformBox(
		items = store.referenceImages.items.value,
	) {
		const context = getTransformContext();
		if (!context) {
			setStoredSelectionBox(null);
			return false;
		}
		const selectedItemIds = getSelectedItemIds();
		if (selectedItemIds.length <= 1) {
			setStoredSelectionBox(null);
			return false;
		}
		const geometries = context.resolved.items
			.filter((item) => selectedItemIds.includes(item.id))
			.map((item) => {
				const asset = context.resolved.assetsById.get(item.assetId) ?? null;
				if (!asset?.sourceMeta) {
					return null;
				}
				return buildLogicalItemGeometry(item, asset, context);
			})
			.filter(Boolean);
		const logicalBox =
			buildReferenceImageSelectionBoxLogicalFromGeometries(geometries);
		if (!logicalBox) {
			setStoredSelectionBox(null);
			return false;
		}
		setStoredSelectionBox(logicalBox, context, { x: 0.5, y: 0.5 });
		return true;
	}

	function setSelectionState({
		selectedItemIds = [],
		activeItemId = "",
		activeAssetId = "",
		items = store.referenceImages.items.value,
	} = {}) {
		const previousSelectedItemIds = getSelectedItemIds();
		const previousSelectionKey = previousSelectedItemIds.join("|");
		const normalized = getValidSelectionState({
			items,
			selectedItemIds,
			activeItemId,
		});
		recenterDeselectedSingleReferenceImageAnchor(
			previousSelectedItemIds,
			normalized.selectedItemIds,
		);
		const nextSelectionKey = normalized.selectedItemIds.join("|");
		if (previousSelectionKey !== nextSelectionKey) {
			store.referenceImages.selectionAnchor.value = null;
		}
		const nextActiveAssetId =
			activeAssetId ||
			normalized.activeAssetId ||
			(normalized.selectedItemIds.length === 1
				? (store.referenceImages.items.value.find(
						(item) => item.id === normalized.selectedItemIds[0],
					)?.assetId ?? "")
				: "");
		store.referenceImages.selectedItemIds.value = normalized.selectedItemIds;
		store.referenceImages.selectedItemId.value = normalized.activeItemId;
		store.referenceImages.selectedAssetId.value = nextActiveAssetId;
		if (
			previousSelectionKey !== nextSelectionKey &&
			normalized.selectedItemIds.length === 0
		) {
			onReferenceImageSelectionCleared?.();
		}
		if (normalized.selectedItemIds.length > 0) {
			lastNonEmptyReferenceSelectionState = {
				selectedItemIds: [...normalized.selectedItemIds],
				activeItemId: normalized.activeItemId,
			};
		}
		if (previousSelectionKey !== nextSelectionKey) {
			resetReferenceImageInspectorTransformState();
			if (normalized.selectedItemIds.length > 1) {
				initializeMultiSelectionTransformBox(items);
				syncReferenceImageInspectorTransformState(items);
			} else {
				setStoredSelectionBox(null);
			}
		} else if (normalized.selectedItemIds.length <= 1) {
			setStoredSelectionBox(null);
		}
	}

	function recenterDeselectedSingleReferenceImageAnchor(
		previousSelectedItemIds,
		nextSelectedItemIds,
	) {
		if (
			!Array.isArray(previousSelectedItemIds) ||
			previousSelectedItemIds.length !== 1
		) {
			return false;
		}
		const previousItemId = String(previousSelectedItemIds[0] ?? "").trim();
		if (!previousItemId) {
			return false;
		}
		if (
			Array.isArray(nextSelectedItemIds) &&
			nextSelectedItemIds.length === 1 &&
			String(nextSelectedItemIds[0] ?? "").trim() === previousItemId
		) {
			return false;
		}
		const context = getTransformContext();
		if (!context) {
			return false;
		}
		const item =
			context.resolved.items.find((entry) => entry.id === previousItemId) ??
			null;
		if (!item) {
			return false;
		}
		if (
			Math.abs((item.anchor?.ax ?? 0.5) - 0.5) < 1e-6 &&
			Math.abs((item.anchor?.ay ?? 0.5) - 0.5) < 1e-6
		) {
			return false;
		}
		const asset = context.resolved.assetsById.get(item.assetId) ?? null;
		if (!asset?.sourceMeta) {
			return false;
		}
		const geometry = buildLogicalItemGeometry(item, asset, context);
		const centeredAnchor = { ax: 0.5, ay: 0.5 };
		const nextAnchorPoint = getPointFromRectLocal({
			left: geometry.left,
			top: geometry.top,
			width: geometry.logicalWidth,
			height: geometry.logicalHeight,
			localX: centeredAnchor.ax,
			localY: centeredAnchor.ay,
			anchorAx: geometry.item.anchor.ax,
			anchorAy: geometry.item.anchor.ay,
			rotationDeg: geometry.item.rotationDeg,
		});
		const nextItemAnchorPx = {
			x: context.outputSize.w * centeredAnchor.ax,
			y: context.outputSize.h * centeredAnchor.ay,
		};
		const nextEffectiveOffset = {
			x: nextItemAnchorPx.x - nextAnchorPoint.x,
			y: nextItemAnchorPx.y - nextAnchorPoint.y,
		};
		const nextOffset = removeRenderBoxOffsetCorrection(
			nextEffectiveOffset,
			centeredAnchor,
			context.resolved.preset.baseRenderBox,
			context.outputSize,
			context.renderBoxAnchor,
			context.resolved.override?.renderBoxCorrection ?? null,
		);
		return updateResolvedReferenceImageItem(previousItemId, {
			anchor: centeredAnchor,
			offsetPx: {
				x: nextOffset.x,
				y: nextOffset.y,
			},
		});
	}

	function clearSelection() {
		referenceListSelectionAnchorId = "";
		resetReferenceImageInspectorTransformState();
		store.referenceImages.selectionAnchor.value = null;
		setStoredSelectionBox(null);
		setSelectionState({
			selectedItemIds: [],
			activeItemId: "",
			activeAssetId: "",
		});
	}

	function resetReferenceImageInspectorTransformState() {
		referenceImageInspectorTransformState = {
			locked: false,
			baselineSignature: "",
			sessionSignature: "",
			baselineItems: new Map(),
			baselineSelectionBoxLogical: null,
			session: null,
		};
	}

	function syncReferenceImageInspectorTransformState(
		items = store.referenceImages.items.value,
	) {
		const selectedItemIds = getSelectedItemIds();
		if (selectedItemIds.length <= 1) {
			resetReferenceImageInspectorTransformState();
			return null;
		}
		const selectedItemIdSet = new Set(selectedItemIds);
		const selectedItems = (items ?? []).filter((item) =>
			selectedItemIdSet.has(item.id),
		);
		if (selectedItems.length <= 1) {
			resetReferenceImageInspectorTransformState();
			return null;
		}
		const baselineSignature = selectedItemIds.join("|");
		const currentSelectionTransformState = buildSelectionTransformState({
			includeScreenState: false,
		});
		const sessionSignature =
			buildReferenceImageMultiSelectionInspectorSignature({
				selectedItemIds,
				selectedItems,
				selectionAnchor: store.referenceImages.selectionAnchor.value,
				selectionBoxLogical: store.referenceImages.selectionBoxLogical.value,
			});
		if (
			referenceImageInspectorTransformState.baselineSignature !==
			baselineSignature
		) {
			referenceImageInspectorTransformState = {
				...referenceImageInspectorTransformState,
				baselineSignature,
				baselineItems:
					captureReferenceImageMultiSelectionBaseline(selectedItems),
				baselineSelectionBoxLogical:
					cloneReferenceImageMultiSelectionLogicalBox(
						currentSelectionTransformState?.selectionBoxLogical ??
							store.referenceImages.selectionBoxLogical.value,
					),
			};
		}
		if (
			!referenceImageInspectorTransformState.locked &&
			(referenceImageInspectorTransformState.sessionSignature !==
				sessionSignature ||
				!referenceImageInspectorTransformState.session)
		) {
			referenceImageInspectorTransformState = {
				...referenceImageInspectorTransformState,
				locked: false,
				sessionSignature,
				session: currentSelectionTransformState,
			};
		}
		return {
			selectedItems,
			baselineSignature,
			sessionSignature,
			currentSelectionTransformState,
			...referenceImageInspectorTransformState,
		};
	}

	function beginSelectedReferenceImageInspectorTransformSession() {
		const inspectorState = syncReferenceImageInspectorTransformState();
		if (!inspectorState) {
			return false;
		}
		referenceImageInspectorTransformState = {
			...referenceImageInspectorTransformState,
			locked: true,
		};
		return true;
	}

	function endSelectedReferenceImageInspectorTransformSession() {
		referenceImageInspectorTransformState = {
			...referenceImageInspectorTransformState,
			locked: false,
		};
		return true;
	}

	function getSelectedReferenceImageInspectorState() {
		const inspectorState = syncReferenceImageInspectorTransformState();
		if (!inspectorState) {
			return null;
		}
		return buildReferenceImageMultiSelectionInspectorState({
			selectedItems: inspectorState.selectedItems,
			baselineItems: inspectorState.baselineItems,
			baselineSelectionBoxLogical: inspectorState.baselineSelectionBoxLogical,
			currentSelectionBoxLogical:
				inspectorState.currentSelectionTransformState?.selectionBoxLogical ??
				store.referenceImages.selectionBoxLogical.value,
			session: inspectorState.session,
		});
	}

	function ensureEditingSelection() {
		const items = store.referenceImages.items.value;
		if (!Array.isArray(items) || items.length === 0) {
			return false;
		}
		const currentSelectedItemIds = getSelectedItemIds().filter((itemId) =>
			items.some((item) => item.id === itemId),
		);
		if (currentSelectedItemIds.length > 0) {
			return false;
		}
		const rememberedSelectedItemIds = (
			lastNonEmptyReferenceSelectionState.selectedItemIds ?? []
		).filter((itemId) => items.some((item) => item.id === itemId));
		if (rememberedSelectedItemIds.length > 0) {
			const activeItemId = rememberedSelectedItemIds.includes(
				lastNonEmptyReferenceSelectionState.activeItemId,
			)
				? lastNonEmptyReferenceSelectionState.activeItemId
				: rememberedSelectedItemIds[rememberedSelectedItemIds.length - 1];
			setSelectionState({
				items,
				selectedItemIds: rememberedSelectedItemIds,
				activeItemId,
			});
			return true;
		}
		const fallbackItem = items[0] ?? null;
		if (!fallbackItem) {
			return false;
		}
		setSelectionState({
			items,
			selectedItemIds: [fallbackItem.id],
			activeItemId: fallbackItem.id,
			activeAssetId: fallbackItem.assetId,
		});
		return true;
	}

	function parseSelectionOptions(optionsOrEvent = null) {
		if (!optionsOrEvent) {
			return { additive: false, toggle: false, range: false, orderedIds: null };
		}
		if (
			"additive" in optionsOrEvent ||
			"toggle" in optionsOrEvent ||
			"range" in optionsOrEvent ||
			"orderedIds" in optionsOrEvent
		) {
			return {
				additive: Boolean(optionsOrEvent.additive),
				toggle: Boolean(optionsOrEvent.toggle),
				range: Boolean(optionsOrEvent.range),
				orderedIds: Array.isArray(optionsOrEvent.orderedIds)
					? optionsOrEvent.orderedIds
					: null,
			};
		}
		return {
			additive:
				Boolean(optionsOrEvent.shiftKey) ||
				Boolean(optionsOrEvent.metaKey) ||
				Boolean(optionsOrEvent.ctrlKey),
			toggle:
				Boolean(optionsOrEvent.metaKey) || Boolean(optionsOrEvent.ctrlKey),
			range: false,
			orderedIds: null,
		};
	}

	const {
		clampPointerToViewportShell,
		getLogicalTransformContext,
		getTransformContext,
		buildLogicalItemGeometry,
		buildSelectionTransformState,
	} = createReferenceImageTransformState({
		store,
		renderBox,
		getDocument,
		getSelectedItemIds,
		getActiveShotCameraDocument,
		getOutputSizeState,
		getResolvedShotItems,
	});

	function applyGeometryUpdates(geometries, updater, contextOverride = null) {
		const context = contextOverride ?? getLogicalTransformContext();
		if (!context) {
			return false;
		}
		const nextById = new Map();
		for (const geometry of geometries) {
			const nextPatch = updater(geometry, context);
			if (!nextPatch) {
				continue;
			}
			const currentItem =
				context.resolved.items.find((item) => item.id === geometry.item.id) ??
				geometry.item;
			nextById.set(
				geometry.item.id,
				createReferenceImageItem({
					...currentItem,
					...nextPatch,
				}),
			);
		}
		if (nextById.size === 0) {
			return false;
		}
		const nextItems = context.resolved.items.map(
			(item) => nextById.get(item.id) ?? item,
		);
		return commitResolvedItems(
			context.documentState,
			context.resolved,
			nextItems,
		);
	}

	function applyReferenceImageSelectionMoveDelta(
		selectionState,
		deltaLogicalX,
		deltaLogicalY,
	) {
		if (!selectionState) {
			return false;
		}
		if (selectionState.geometries.length > 1) {
			setStoredSelectionBox(
				{
					...selectionState.selectionBoxLogical,
					left: selectionState.selectionBoxLogical.left + deltaLogicalX,
					top: selectionState.selectionBoxLogical.top + deltaLogicalY,
				},
				selectionState.context,
				selectionState.anchorLocal,
			);
		}
		return applyGeometryUpdates(
			selectionState.geometries,
			(geometry, context) => {
				const nextEffectiveOffset = {
					x: geometry.effectiveOffset.x - deltaLogicalX,
					y: geometry.effectiveOffset.y - deltaLogicalY,
				};
				const nextOffset = removeRenderBoxOffsetCorrection(
					nextEffectiveOffset,
					geometry.item.anchor,
					context.resolved.preset.baseRenderBox,
					context.outputSize,
					context.renderBoxAnchor,
					context.resolved.override?.renderBoxCorrection ?? null,
				);
				return {
					offsetPx: {
						x: Math.round(nextOffset.x),
						y: Math.round(nextOffset.y),
					},
				};
			},
			selectionState.context,
		);
	}

	function applyReferenceImageSelectionRotationDelta(
		selectionState,
		deltaAngleDeg,
	) {
		if (!selectionState) {
			return false;
		}
		const deltaAngleRad = (deltaAngleDeg * Math.PI) / 180;
		const pivot = selectionState.pivot;
		if (selectionState.geometries.length > 1) {
			setStoredSelectionBox(
				{
					...selectionState.selectionBoxLogical,
					rotationDeg:
						(selectionState.selectionBoxLogical.rotationDeg ?? 0) +
						deltaAngleDeg,
				},
				selectionState.context,
				selectionState.anchorLocal,
			);
		}
		return applyGeometryUpdates(
			selectionState.geometries,
			(geometry, context) => {
				const deltaX = geometry.anchorPoint.x - pivot.x;
				const deltaY = geometry.anchorPoint.y - pivot.y;
				const cosine = Math.cos(deltaAngleRad);
				const sine = Math.sin(deltaAngleRad);
				const nextAnchorPoint = {
					x: pivot.x + deltaX * cosine - deltaY * sine,
					y: pivot.y + deltaX * sine + deltaY * cosine,
				};
				const nextEffectiveOffset = {
					x: geometry.itemAnchorPx.x - nextAnchorPoint.x,
					y: geometry.itemAnchorPx.y - nextAnchorPoint.y,
				};
				const nextOffset = removeRenderBoxOffsetCorrection(
					nextEffectiveOffset,
					geometry.item.anchor,
					context.resolved.preset.baseRenderBox,
					context.outputSize,
					context.renderBoxAnchor,
					context.resolved.override?.renderBoxCorrection ?? null,
				);
				return {
					rotationDeg: geometry.item.rotationDeg + deltaAngleDeg,
					offsetPx: {
						x: Math.round(nextOffset.x),
						y: Math.round(nextOffset.y),
					},
				};
			},
			selectionState.context,
		);
	}

	function applyReferenceImageSelectionScaleRatio(
		selectionState,
		scaleRatio,
		pivotOverride = null,
	) {
		if (!selectionState) {
			return false;
		}
		const pivot = pivotOverride ?? selectionState.pivot;
		if (selectionState.geometries.length > 1) {
			const nextWidth = Math.max(
				selectionState.selectionBoxLogical.width * scaleRatio,
				1e-6,
			);
			const nextHeight = Math.max(
				selectionState.selectionBoxLogical.height * scaleRatio,
				1e-6,
			);
			const nextSelectionPivot = {
				x: pivot.x + (selectionState.pivot.x - pivot.x) * scaleRatio,
				y: pivot.y + (selectionState.pivot.y - pivot.y) * scaleRatio,
			};
			setStoredSelectionBox(
				{
					...selectionState.selectionBoxLogical,
					left: nextSelectionPivot.x - nextWidth * selectionState.anchorLocal.x,
					top: nextSelectionPivot.y - nextHeight * selectionState.anchorLocal.y,
					width: nextWidth,
					height: nextHeight,
				},
				selectionState.context,
				selectionState.anchorLocal,
			);
		}
		return applyGeometryUpdates(
			selectionState.geometries,
			(geometry, context) => {
				const nextAnchorPoint = {
					x: pivot.x + (geometry.anchorPoint.x - pivot.x) * scaleRatio,
					y: pivot.y + (geometry.anchorPoint.y - pivot.y) * scaleRatio,
				};
				const nextEffectiveOffset = {
					x: geometry.itemAnchorPx.x - nextAnchorPoint.x,
					y: geometry.itemAnchorPx.y - nextAnchorPoint.y,
				};
				const nextOffset = removeRenderBoxOffsetCorrection(
					nextEffectiveOffset,
					geometry.item.anchor,
					context.resolved.preset.baseRenderBox,
					context.outputSize,
					context.renderBoxAnchor,
					context.resolved.override?.renderBoxCorrection ?? null,
				);
				return {
					scalePct: geometry.item.scalePct * scaleRatio,
					offsetPx: {
						x: Math.round(nextOffset.x),
						y: Math.round(nextOffset.y),
					},
				};
			},
			selectionState.context,
		);
	}

	function getDocument() {
		return normalizeReferenceImageDocument(
			store.referenceImages.document.value,
		);
	}

	function setDocument(nextDocument) {
		store.referenceImages.document.value = normalizeReferenceImageDocument(
			nextDocument ?? createDefaultReferenceImageDocument(),
		);
	}

	function getResolvedPreset(documentState = getDocument()) {
		const shotCameraDocument = getActiveShotCameraDocument();
		const presetId = getShotReferenceImagePresetId(
			documentState,
			shotCameraDocument?.referenceImages ?? null,
		);
		return (
			findMutablePresetInDocument(documentState, presetId) ??
			findReferenceImagePreset(documentState, presetId) ??
			findMutablePresetInDocument(
				documentState,
				REFERENCE_IMAGE_DEFAULT_PRESET_ID,
			) ??
			findReferenceImagePreset(
				documentState,
				REFERENCE_IMAGE_DEFAULT_PRESET_ID,
			) ??
			documentState?.presets?.[0] ??
			null
		);
	}

	function getResolvedShotItems(documentState = getDocument()) {
		const activeShotCameraDocument = getActiveShotCameraDocument?.() ?? null;
		return resolveReferenceImageItemsForShot(
			documentState,
			activeShotCameraDocument?.referenceImages ?? null,
		);
	}

	function openReferenceImageFiles() {
		referenceImageInput?.click?.();
	}

	function setPreviewSessionVisible(nextVisible) {
		store.referenceImages.previewSessionVisible.value = nextVisible !== false;
	}

	function selectReferenceImageAsset(assetId) {
		const nextAssetId = String(assetId ?? "").trim();
		if (!nextAssetId) {
			clearSelection();
			return;
		}
		const matchingItems = store.referenceImages.items.value.filter(
			(item) => item.assetId === nextAssetId,
		);
		setSelectionState({
			selectedItemIds: matchingItems.map((item) => item.id),
			activeItemId: matchingItems[matchingItems.length - 1]?.id ?? "",
			activeAssetId: nextAssetId,
		});
	}

	function selectReferenceImageItem(itemId, optionsOrEvent = null) {
		const nextItemId = String(itemId ?? "").trim();
		if (!nextItemId) {
			clearSelection();
			return;
		}
		const item =
			store.referenceImages.items.value.find(
				(entry) => entry.id === nextItemId,
			) ?? null;
		if (!item) {
			clearSelection();
			return;
		}
		const { additive, toggle, range, orderedIds } =
			parseSelectionOptions(optionsOrEvent);
		if (range) {
			const resolvedOrderedIds = (
				Array.isArray(orderedIds) && orderedIds.length > 0
					? orderedIds
					: store.referenceImages.items.value.map((entry) => entry.id)
			).filter((entryId, index, sourceIds) => {
				return (
					store.referenceImages.items.value.some(
						(entry) => entry.id === entryId,
					) && sourceIds.indexOf(entryId) === index
				);
			});
			const currentSelectedIds = getSelectedItemIds();
			const currentSelectedIdSet = new Set(currentSelectedIds);
			const anchorId =
				referenceListSelectionAnchorId ||
				store.referenceImages.selectedItemId.value ||
				currentSelectedIds.at(-1) ||
				item.id;
			const anchorIndex = resolvedOrderedIds.indexOf(anchorId);
			const targetIndex = resolvedOrderedIds.indexOf(item.id);
			if (anchorIndex === -1 || targetIndex === -1) {
				referenceListSelectionAnchorId = item.id;
				setSelectionState({
					selectedItemIds: [item.id],
					activeItemId: item.id,
					activeAssetId: item.assetId,
				});
				onReferenceImageSelectionActivated?.();
				return;
			}

			const rangeStart = Math.min(anchorIndex, targetIndex);
			const rangeEnd = Math.max(anchorIndex, targetIndex);
			const rangeIds = resolvedOrderedIds.slice(rangeStart, rangeEnd + 1);
			const removeRange = currentSelectedIdSet.has(item.id);
			const nextSelectedIds = removeRange
				? currentSelectedIds.filter(
						(selectedId) => !rangeIds.includes(selectedId),
					)
				: Array.from(new Set([...currentSelectedIds, ...rangeIds]));
			const nextActiveItemId = nextSelectedIds.includes(item.id)
				? item.id
				: (nextSelectedIds.at(-1) ?? "");
			const nextActiveAssetId =
				store.referenceImages.items.value.find(
					(entry) => entry.id === nextActiveItemId,
				)?.assetId ?? "";
			setSelectionState({
				selectedItemIds: nextSelectedIds,
				activeItemId: nextActiveItemId,
				activeAssetId: nextActiveAssetId,
			});
			if (nextSelectedIds.length > 0) {
				onReferenceImageSelectionActivated?.();
			}
			return;
		}
		if (!additive && !toggle) {
			const currentSelectedIds = getSelectedItemIds();
			if (
				currentSelectedIds.length === 1 &&
				currentSelectedIds[0] === item.id &&
				store.referenceImages.selectedItemId.value === item.id
			) {
				clearSelection();
				return;
			}
			referenceListSelectionAnchorId = item.id;
			setSelectionState({
				selectedItemIds: [item.id],
				activeItemId: item.id,
				activeAssetId: item.assetId,
			});
			onReferenceImageSelectionActivated?.();
			return;
		}
		const nextSelectedIds = [...getSelectedItemIds()];
		const existingIndex = nextSelectedIds.indexOf(item.id);
		if (toggle && existingIndex >= 0) {
			nextSelectedIds.splice(existingIndex, 1);
		} else if (existingIndex < 0) {
			nextSelectedIds.push(item.id);
		}
		referenceListSelectionAnchorId =
			nextSelectedIds.length === 0 ? "" : item.id;
		setSelectionState({
			selectedItemIds: nextSelectedIds,
			activeItemId:
				nextSelectedIds.length === 0
					? ""
					: existingIndex >= 0 && toggle
						? (nextSelectedIds[nextSelectedIds.length - 1] ?? "")
						: item.id,
			activeAssetId:
				nextSelectedIds.length === 0
					? ""
					: existingIndex >= 0 && toggle
						? (store.referenceImages.items.value.find(
								(entry) =>
									entry.id === nextSelectedIds[nextSelectedIds.length - 1],
							)?.assetId ?? "")
						: item.assetId,
		});
		if (nextSelectedIds.length > 0) {
			onReferenceImageSelectionActivated?.();
		}
	}

	function getReferenceImageLogicalBounds(itemId) {
		const context = getTransformContext();
		if (!context) {
			return null;
		}
		const item =
			context.resolved.items.find((entry) => entry.id === itemId) ?? null;
		if (!item) {
			return null;
		}
		const asset = context.resolved.assetsById.get(item.assetId) ?? null;
		if (!asset?.sourceMeta) {
			return null;
		}
		const geometry = buildLogicalItemGeometry(item, asset, context);
		return {
			left: Number(geometry.bounds?.left ?? geometry.left ?? 0),
			top: Number(geometry.bounds?.top ?? geometry.top ?? 0),
		};
	}

	function offsetReferenceImageBoundsPosition(itemId, axis, deltaValue) {
		const normalizedAxis = axis === "y" ? "y" : "x";
		const numericDelta = Number(deltaValue);
		if (!Number.isFinite(numericDelta) || Math.abs(numericDelta) <= 1e-8) {
			return false;
		}
		const context = getTransformContext();
		if (!context) {
			return false;
		}
		const item =
			context.resolved.items.find((entry) => entry.id === itemId) ?? null;
		if (!item) {
			return false;
		}
		const asset = context.resolved.assetsById.get(item.assetId) ?? null;
		if (!asset?.sourceMeta) {
			return false;
		}
		const geometry = buildLogicalItemGeometry(item, asset, context);
		return (
			runReferenceImageHistoryAction(
				`reference-image.offset.${normalizedAxis}`,
				() => {
					const nextEffectiveOffset = {
						x:
							geometry.effectiveOffset.x -
							(normalizedAxis === "x" ? numericDelta : 0),
						y:
							geometry.effectiveOffset.y -
							(normalizedAxis === "y" ? numericDelta : 0),
					};
					const nextOffset = removeRenderBoxOffsetCorrection(
						nextEffectiveOffset,
						geometry.item.anchor,
						context.resolved.preset.baseRenderBox,
						context.outputSize,
						context.renderBoxAnchor,
						context.resolved.override?.renderBoxCorrection ?? null,
					);
					updateResolvedReferenceImageItem(itemId, {
						offsetPx: {
							x: Math.round(nextOffset.x),
							y: Math.round(nextOffset.y),
						},
					});
				},
			) ?? false
		);
	}

	function setReferenceImageBoundsPosition(itemId, axis, nextBoundValue) {
		const normalizedAxis = axis === "y" ? "y" : "x";
		const numericTarget = Number(nextBoundValue);
		if (!Number.isFinite(numericTarget)) {
			return false;
		}
		const currentBounds = getReferenceImageLogicalBounds(itemId);
		if (!currentBounds) {
			return false;
		}
		const boundsKey = normalizedAxis === "x" ? "left" : "top";
		return offsetReferenceImageBoundsPosition(
			itemId,
			normalizedAxis,
			numericTarget - Number(currentBounds[boundsKey] ?? 0),
		);
	}

	function offsetSelectedReferenceImagesPosition(axis, deltaValue) {
		const normalizedAxis = axis === "y" ? "y" : "x";
		const numericDelta = Number(deltaValue);
		if (!Number.isFinite(numericDelta) || Math.abs(numericDelta) <= 1e-8) {
			return false;
		}
		const selectionState = buildSelectionTransformState({
			includeScreenState: false,
		});
		if (!selectionState) {
			return false;
		}
		return (
			runReferenceImageHistoryAction(
				`reference-image.offset.${normalizedAxis}`,
				() =>
					applyReferenceImageSelectionMoveDelta(
						selectionState,
						normalizedAxis === "x" ? numericDelta : 0,
						normalizedAxis === "y" ? numericDelta : 0,
					),
			) ?? false
		);
	}

	function offsetSelectedReferenceImagesRotationDeg(deltaAngleDeg) {
		const numericDelta = Number(deltaAngleDeg);
		if (!Number.isFinite(numericDelta) || Math.abs(numericDelta) <= 1e-8) {
			return false;
		}
		const selectionState = buildSelectionTransformState({
			includeScreenState: false,
		});
		if (!selectionState) {
			return false;
		}
		return (
			runReferenceImageHistoryAction("reference-image.rotation", () =>
				applyReferenceImageSelectionRotationDelta(selectionState, numericDelta),
			) ?? false
		);
	}

	function scaleSelectedReferenceImagesByFactor(scaleFactor) {
		const numericScaleFactor = Number(scaleFactor);
		if (
			!Number.isFinite(numericScaleFactor) ||
			numericScaleFactor <= 0 ||
			Math.abs(numericScaleFactor - 1) <= 1e-8
		) {
			return false;
		}
		const selectionState = buildSelectionTransformState({
			includeScreenState: false,
		});
		if (!selectionState) {
			return false;
		}
		return (
			runReferenceImageHistoryAction("reference-image.scale", () =>
				applyReferenceImageSelectionScaleRatio(
					selectionState,
					numericScaleFactor,
				),
			) ?? false
		);
	}

	function getSelectedReferenceImageTransformSession() {
		return buildSelectionTransformState();
	}

	function applySelectedReferenceImagesRotationFromSession(
		selectionState,
		totalDeltaAngleDeg,
	) {
		const numericDelta = Number(totalDeltaAngleDeg);
		if (!selectionState || !Number.isFinite(numericDelta)) {
			return false;
		}
		return (
			runReferenceImageHistoryAction("reference-image.rotation", () =>
				applyReferenceImageSelectionRotationDelta(selectionState, numericDelta),
			) ?? false
		);
	}

	function applySelectedReferenceImagesScaleFromSession(
		selectionState,
		totalScaleFactor,
	) {
		const numericScaleFactor = Number(totalScaleFactor);
		if (
			!selectionState ||
			!Number.isFinite(numericScaleFactor) ||
			numericScaleFactor <= 0
		) {
			return false;
		}
		return (
			runReferenceImageHistoryAction("reference-image.scale", () =>
				applyReferenceImageSelectionScaleRatio(
					selectionState,
					numericScaleFactor,
				),
			) ?? false
		);
	}

	const {
		ensureActiveShotPresetBinding,
		updateAllShotCameraReferenceImages,
		dropReferencePresetFromAllShotCameras,
		removeReferenceItemsFromAllShotCameras,
	} = createReferenceImageCameraBindings({
		store,
		getActiveShotCameraDocument,
		updateActiveShotCameraDocument,
		cloneShotCameraDocument,
		createShotCameraReferenceImagesState,
		createReferenceImageCameraPresetOverride,
		isReferenceImageOverrideEmpty,
	});

	const {
		isReferenceImageDragActive,
		startReferenceImageMove,
		startReferenceImageResize,
		startReferenceImageRotate,
		startReferenceImageAnchorDrag,
		handleReferenceImagePointerMove,
		handleReferenceImagePointerUp,
	} = createReferenceImageViewportInteraction({
		store,
		updateUi,
		getSelectedItemIds,
		parseSelectionOptions,
		selectReferenceImageItem,
		setSelectionState,
		buildSelectionTransformState,
		beginHistoryTransaction,
		commitHistoryTransaction,
		cancelHistoryTransaction,
		applyReferenceImageSelectionMoveDelta,
		applyReferenceImageSelectionRotationDelta,
		applyReferenceImageSelectionScaleRatio,
		applyGeometryUpdates,
		setStoredSelectionBox,
		clampPointerToViewportShell,
	});

	const { syncSelectionState, syncUiState } = createReferenceImageUiStateSync({
		store,
		referenceImageDefaultPresetId: REFERENCE_IMAGE_DEFAULT_PRESET_ID,
		buildReferenceImageSizeLabel,
		getDocument,
		getResolvedShotItems,
		getSelectedItemIds,
		getValidSelectionState,
		setSelectionState,
		isReferenceImageDragActive,
		getTransformContext,
		buildLogicalItemGeometry,
		doesReferenceImageSelectionBoxMatchGeometries,
		buildReferenceImageSelectionBoxLogicalFromGeometries,
		setStoredSelectionBox,
		initializeMultiSelectionTransformBox,
	});

	const {
		runReferenceImageHistoryAction,
		commitResolvedItems,
		updateResolvedReferenceImageItem,
		setActiveReferenceImagePreset,
		setActiveReferenceImagePresetName,
		deleteActiveReferenceImagePreset,
		duplicateActiveReferenceImagePreset,
		deleteSelectedReferenceImageItems,
	} = createReferenceImageDocumentOperations({
		createReferenceImageItem,
		createReferenceImagePreset,
		createShotCameraReferenceImagesState,
		createReferenceImageCameraPresetOverride,
		isReferenceImageOverrideEmpty,
		buildDuplicatePresetName,
		buildReferenceImageOverridePatch,
		findMutablePresetInDocument,
		sanitizeReferenceImagePresetName,
		normalizeReferenceImageItemOrderInPlace,
		pruneUnusedReferenceImageAssetsInDocument,
		referenceImageDefaultPresetId: REFERENCE_IMAGE_DEFAULT_PRESET_ID,
		cloneDocument: cloneReferenceImageDocument,
		getSelectedItemIds,
		getDocument,
		getResolvedShotItems,
		setDocument,
		clearSelection,
		syncUiState,
		updateUi,
		updateActiveShotCameraDocument,
		dropReferencePresetFromAllShotCameras,
		removeReferenceItemsFromAllShotCameras,
		runHistoryAction,
	});

	const {
		setReferenceImagePreviewVisible,
		setSelectedReferenceImagesPreviewVisible,
		setReferenceImageExportEnabled,
		setSelectedReferenceImagesExportEnabled,
		setSelectedReferenceImagesOpacity,
		setReferenceImageOpacity,
		setReferenceImageScalePct,
		setReferenceImageRotationDeg,
		setReferenceImageOffsetPx,
	} = createReferenceImagePropertyOperations({
		createReferenceImageItem,
		getSelectedItemIds,
		getDocument,
		getResolvedShotItems,
		runReferenceImageHistoryAction,
		updateResolvedReferenceImageItem,
		commitResolvedItems,
	});

	const {
		setReferenceImageGroup,
		setReferenceImageOrder,
		moveReferenceImageToDisplayTarget,
	} = createReferenceImageListOperations({
		createReferenceImageItem,
		getSelectedItemIds,
		getDocument,
		getResolvedShotItems,
		commitResolvedItems,
		runReferenceImageHistoryAction,
	});

	const {
		refreshUiAfterLayout,
		handleReferenceImageInputChange,
		importReferenceImageFiles,
	} = createReferenceImageImportRuntime({
		store,
		t,
		setStatus,
		updateUi,
		ensureCameraMode,
		getActiveShotCameraDocument,
		getOutputSizeState,
		getDocument,
		setDocument,
		syncUiState,
		setSelectionState,
		ensureActiveShotPresetBinding,
		beginHistoryTransaction,
		commitHistoryTransaction,
		cancelHistoryTransaction,
	});

	const {
		captureProjectReferenceImagesState,
		captureReferenceImageEditorState,
		restoreReferenceImageEditorState,
		applyProjectReferenceImagesState,
		clearReferenceImages,
	} = createReferenceImageStatePersistence({
		store,
		getDocument,
		setDocument,
		getSelectedItemIds,
		getTransformContext,
		getResolvedPreset,
		clearSelection,
		setSelectionState,
		setStoredSelectionBox,
		syncUiState,
		updateUi,
		refreshUiAfterLayout,
		createEmptyDocument: createDefaultReferenceImageDocument,
		cloneDocument: cloneReferenceImageDocument,
		captureEditorStateSnapshot: captureReferenceImageEditorStateSnapshot,
		normalizeEditorStateForRestore:
			normalizeReferenceImageEditorStateForRestore,
		getRememberedSelectionState: () => lastNonEmptyReferenceSelectionState,
		setRememberedSelectionState: (nextState) => {
			lastNonEmptyReferenceSelectionState = nextState;
		},
	});

	syncUiState();

	return {
		openReferenceImageFiles,
		handleReferenceImageInputChange,
		importReferenceImageFiles,
		supportsReferenceImageFile,
		captureProjectReferenceImagesState,
		captureReferenceImageEditorState,
		applyProjectReferenceImagesState,
		clearReferenceImages,
		syncUiState,
		isReferenceImageSelectionActive: () => getSelectedItemIds().length > 0,
		restoreReferenceImageEditorState,
		setPreviewSessionVisible,
		setActiveReferenceImagePreset,
		setActiveReferenceImagePresetName,
		duplicateActiveReferenceImagePreset,
		deleteActiveReferenceImagePreset,
		deleteSelectedReferenceImageItems,
		clearReferenceImageSelection: clearSelection,
		ensureReferenceImageEditingSelection: ensureEditingSelection,
		selectReferenceImageAsset,
		selectReferenceImageItem,
		setReferenceImagePreviewVisible,
		setSelectedReferenceImagesPreviewVisible,
		setReferenceImageExportEnabled,
		setSelectedReferenceImagesExportEnabled,
		setSelectedReferenceImagesOpacity,
		getSelectedReferenceImageInspectorState,
		beginSelectedReferenceImageInspectorTransformSession,
		endSelectedReferenceImageInspectorTransformSession,
		setReferenceImageOpacity,
		scaleSelectedReferenceImagesByFactor,
		applySelectedReferenceImagesScaleFromSession,
		setReferenceImageScalePct,
		offsetSelectedReferenceImagesRotationDeg,
		applySelectedReferenceImagesRotationFromSession,
		setReferenceImageRotationDeg,
		offsetSelectedReferenceImagesPosition,
		offsetReferenceImageBoundsPosition,
		getReferenceImageLogicalBounds,
		getSelectedReferenceImageTransformSession,
		setReferenceImageOffsetPx,
		setReferenceImageBoundsPosition,
		setReferenceImageGroup,
		setReferenceImageOrder,
		moveReferenceImageToDisplayTarget,
		startReferenceImageMove,
		startReferenceImageResize,
		startReferenceImageRotate,
		startReferenceImageAnchorDrag,
		handleReferenceImagePointerMove,
		handleReferenceImagePointerUp,
	};
}
