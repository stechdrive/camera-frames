import {
	FRAME_RESIZE_HANDLES,
	getFrameResizeAxisLocal,
	getOppositeFrameResizeHandleKey,
	inverseRotateVector,
} from "../engine/frame-transform.js";
import {
	getPointFromRectLocal,
	getPointsBounds,
	getRectCornersFromAnchor,
	normalizeAngleDeltaDeg,
} from "../engine/reference-image-selection.js";
import {
	REFERENCE_IMAGE_DEFAULT_PRESET_ID,
	REFERENCE_IMAGE_GROUP_BACK,
	REFERENCE_IMAGE_GROUP_FRONT,
	applyRenderBoxOffsetCorrection,
	cloneReferenceImageDocument,
	createDefaultReferenceImageDocument,
	createReferenceImageCameraPresetOverride,
	createReferenceImageItem,
	createReferenceImagePreset,
	createShotCameraReferenceImagesState,
	findReferenceImagePreset,
	getReferenceImageDisplayItems,
	getReferenceImageRenderBoxAnchor,
	getShotReferenceImagePresetId,
	normalizeReferenceImageDocument,
	removeRenderBoxOffsetCorrection,
	resolveReferenceImageItemsForShot,
} from "../reference-image-model.js";
import { cloneShotCameraDocument } from "../workspace-model.js";
import { getReferenceImagePreviewRenderBoxMetrics } from "./reference-image-render-controller.js";
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
import { createReferenceImageImportRuntime } from "./reference-image/import-runtime.js";
import {
	buildReferenceImageMultiSelectionInspectorSignature,
	buildReferenceImageMultiSelectionInspectorState,
	captureReferenceImageMultiSelectionBaseline,
	cloneReferenceImageMultiSelectionLogicalBox,
} from "./reference-image/inspector-state.js";
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

export { ensureWritableReferenceImageImportPreset, supportsReferenceImageFile };
const REFERENCE_IMAGE_DRAG_START_THRESHOLD_PX = 4;
export function createReferenceImageController({
	store,
	referenceImageInput,
	renderBox,
	t,
	setStatus,
	updateUi,
	ensureCameraMode,
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

	let referenceImageDragState = null;
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
				inspectorState.session?.selectionBoxLogical ?? null,
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

	function getRenderableSelectionLayers() {
		const selectedIdSet = new Set(getSelectedItemIds());
		return store.referenceImages.previewLayers.value.filter((layer) =>
			selectedIdSet.has(layer.id),
		);
	}

	function getTransformPreviewMetrics() {
		const renderBoxElement = renderBox?.current ?? renderBox;
		const viewportShellElement =
			typeof document !== "undefined"
				? document.getElementById("viewport-shell")
				: null;
		if (!renderBoxElement || !viewportShellElement) {
			return null;
		}
		return getReferenceImagePreviewRenderBoxMetrics({
			renderBoxRect: renderBoxElement.getBoundingClientRect(),
			viewportShellRect: viewportShellElement.getBoundingClientRect(),
			clientWidth: renderBoxElement.clientWidth,
			clientHeight: renderBoxElement.clientHeight,
			clientLeft: renderBoxElement.clientLeft,
			clientTop: renderBoxElement.clientTop,
		});
	}

	function clampPointerToViewportShell(clientX, clientY, context) {
		return {
			x: Math.max(
				0,
				Math.min(context.viewportShellWidth, Number(clientX) || 0),
			),
			y: Math.max(
				0,
				Math.min(context.viewportShellHeight, Number(clientY) || 0),
			),
		};
	}

	function getLogicalTransformContext(documentState = getDocument()) {
		const outputSize = getOutputSizeState?.();
		const activeShotCameraDocument = getActiveShotCameraDocument?.() ?? null;
		const resolved = getResolvedShotItems(documentState);
		if (!outputSize?.width || !outputSize?.height || !resolved?.preset) {
			return null;
		}
		return {
			documentState,
			resolved,
			outputSize: {
				w: outputSize.width,
				h: outputSize.height,
			},
			renderBoxAnchor: getReferenceImageRenderBoxAnchor(
				activeShotCameraDocument?.outputFrame?.anchor ?? "center",
			),
		};
	}

	function getTransformContext(documentState = getDocument()) {
		const renderBoxElement = renderBox?.current ?? renderBox;
		const logicalContext = getLogicalTransformContext(documentState);
		if (!renderBoxElement || !logicalContext) {
			return null;
		}
		const renderBoxWidth = Math.max(renderBoxElement.clientWidth, 0);
		const renderBoxHeight = Math.max(renderBoxElement.clientHeight, 0);
		if (renderBoxWidth <= 0 || renderBoxHeight <= 0) {
			return null;
		}
		const previewMetrics = getTransformPreviewMetrics();
		if (!previewMetrics) {
			return null;
		}
		return {
			...logicalContext,
			renderScaleX: renderBoxWidth / logicalContext.outputSize.w,
			renderScaleY: renderBoxHeight / logicalContext.outputSize.h,
			renderBoxScreenLeft: previewMetrics.left,
			renderBoxScreenTop: previewMetrics.top,
			viewportShellWidth: previewMetrics.viewportShellWidth,
			viewportShellHeight: previewMetrics.viewportShellHeight,
		};
	}

	function buildLogicalItemGeometry(item, asset, context) {
		const effectiveOffset = applyRenderBoxOffsetCorrection(
			item.offsetPx,
			item.anchor,
			context.resolved.preset.baseRenderBox,
			context.outputSize,
			context.renderBoxAnchor,
			context.resolved.override?.renderBoxCorrection ?? null,
		);
		const logicalWidth = asset.sourceMeta.appliedSize.w * (item.scalePct / 100);
		const logicalHeight =
			asset.sourceMeta.appliedSize.h * (item.scalePct / 100);
		const itemAnchorPx = {
			x: context.outputSize.w * item.anchor.ax,
			y: context.outputSize.h * item.anchor.ay,
		};
		const anchorPoint = {
			x: itemAnchorPx.x - effectiveOffset.x,
			y: itemAnchorPx.y - effectiveOffset.y,
		};
		const left = anchorPoint.x - logicalWidth * item.anchor.ax;
		const top = anchorPoint.y - logicalHeight * item.anchor.ay;
		const corners = getRectCornersFromAnchor({
			left,
			top,
			width: logicalWidth,
			height: logicalHeight,
			anchorAx: item.anchor.ax,
			anchorAy: item.anchor.ay,
			rotationDeg: item.rotationDeg,
		});
		return {
			item,
			asset,
			logicalWidth,
			logicalHeight,
			itemAnchorPx,
			effectiveOffset,
			anchorPoint,
			left,
			top,
			corners,
			bounds: getPointsBounds(corners),
		};
	}

	function buildSelectionTransformState({ includeScreenState = true } = {}) {
		const context = includeScreenState
			? getTransformContext()
			: getLogicalTransformContext();
		if (!context) {
			return null;
		}
		const selectedItemIds = getSelectedItemIds();
		if (selectedItemIds.length === 0) {
			return null;
		}
		const selectedItems = context.resolved.items.filter((item) =>
			selectedItemIds.includes(item.id),
		);
		if (selectedItems.length === 0) {
			return null;
		}
		const geometries = selectedItems
			.map((item) => {
				const asset = context.resolved.assetsById.get(item.assetId) ?? null;
				if (!asset?.sourceMeta) {
					return null;
				}
				return buildLogicalItemGeometry(item, asset, context);
			})
			.filter(Boolean);
		if (geometries.length === 0) {
			return null;
		}
		const selectedLayers = includeScreenState
			? getRenderableSelectionLayers()
			: [];
		if (includeScreenState && selectedLayers.length === 0) {
			return null;
		}
		let pivot;
		let screenPivot;
		let anchorLocal;
		let selectionBoxLogical;
		let selectionBoxScreen;
		if (geometries.length === 1) {
			const geometry = geometries[0];
			anchorLocal = {
				x: geometry.item.anchor.ax,
				y: geometry.item.anchor.ay,
			};
			pivot = {
				x: geometry.anchorPoint.x,
				y: geometry.anchorPoint.y,
			};
			selectionBoxLogical = {
				left: geometry.left,
				top: geometry.top,
				width: geometry.logicalWidth,
				height: geometry.logicalHeight,
				rotationDeg: geometry.item.rotationDeg,
				anchorX: anchorLocal.x,
				anchorY: anchorLocal.y,
			};
			if (includeScreenState) {
				const layer =
					selectedLayers.find((entry) => entry.id === geometry.item.id) ?? null;
				if (!layer) {
					return null;
				}
				screenPivot = {
					x: layer.leftPx + layer.widthPx * anchorLocal.x,
					y: layer.topPx + layer.heightPx * anchorLocal.y,
				};
				selectionBoxScreen = {
					left: layer.leftPx,
					top: layer.topPx,
					width: layer.widthPx,
					height: layer.heightPx,
					rotationDeg: layer.rotationDeg,
					anchorX: anchorLocal.x,
					anchorY: anchorLocal.y,
				};
			}
		} else {
			const storedSelectionBox =
				store.referenceImages.selectionBoxLogical.value ??
				buildReferenceImageSelectionBoxLogicalFromGeometries(geometries);
			if (!storedSelectionBox) {
				return null;
			}
			const selectionAnchor =
				store.referenceImages.selectionAnchor.value &&
				Number.isFinite(store.referenceImages.selectionAnchor.value.x) &&
				Number.isFinite(store.referenceImages.selectionAnchor.value.y)
					? {
							x: store.referenceImages.selectionAnchor.value.x,
							y: store.referenceImages.selectionAnchor.value.y,
						}
					: {
							x: storedSelectionBox.anchorX ?? 0.5,
							y: storedSelectionBox.anchorY ?? 0.5,
						};
			anchorLocal = selectionAnchor;
			selectionBoxLogical = {
				left: storedSelectionBox.left,
				top: storedSelectionBox.top,
				width: storedSelectionBox.width,
				height: storedSelectionBox.height,
				rotationDeg: storedSelectionBox.rotationDeg ?? 0,
				anchorX: anchorLocal.x,
				anchorY: anchorLocal.y,
			};
			pivot = getPointFromRectLocal({
				left: selectionBoxLogical.left,
				top: selectionBoxLogical.top,
				width: selectionBoxLogical.width,
				height: selectionBoxLogical.height,
				localX: anchorLocal.x,
				localY: anchorLocal.y,
				anchorAx: selectionBoxLogical.anchorX,
				anchorAy: selectionBoxLogical.anchorY,
				rotationDeg: selectionBoxLogical.rotationDeg,
			});
			if (includeScreenState) {
				selectionBoxScreen = projectReferenceImageSelectionBoxLogicalToScreen(
					selectionBoxLogical,
					context,
					anchorLocal,
				);
				if (!selectionBoxScreen) {
					return null;
				}
				screenPivot = getPointFromRectLocal({
					left: selectionBoxScreen.left,
					top: selectionBoxScreen.top,
					width: selectionBoxScreen.width,
					height: selectionBoxScreen.height,
					localX: anchorLocal.x,
					localY: anchorLocal.y,
					anchorAx: selectionBoxScreen.anchorX,
					anchorAy: selectionBoxScreen.anchorY,
					rotationDeg: selectionBoxScreen.rotationDeg,
				});
			}
		}
		return {
			context,
			selectedItemIds: geometries.map((geometry) => geometry.item.id),
			geometries,
			pivot,
			screenPivot,
			anchorLocal,
			selectionBoxLogical,
			selectionBoxScreen,
		};
	}

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

	function stopReferenceImageDrag({
		shouldCommit = false,
		label = referenceImageDragState?.historyLabel,
	} = {}) {
		if (!referenceImageDragState) {
			return false;
		}
		window.removeEventListener("pointermove", handleReferenceImagePointerMove);
		window.removeEventListener("pointerup", handleReferenceImagePointerUp);
		window.removeEventListener("pointercancel", handleReferenceImagePointerUp);
		if (shouldCommit) {
			commitHistoryTransaction(label);
		} else {
			cancelHistoryTransaction();
		}
		referenceImageDragState = null;
		return true;
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

	function ensureActiveShotPresetBinding(presetId) {
		const activeShotCameraDocument = getActiveShotCameraDocument();
		if (
			!activeShotCameraDocument ||
			activeShotCameraDocument.referenceImages?.presetId === presetId
		) {
			return;
		}
		updateActiveShotCameraDocument((documentState) => {
			documentState.referenceImages = {
				...(documentState.referenceImages ?? {}),
				presetId,
				overridesByPresetId:
					documentState.referenceImages?.overridesByPresetId ?? {},
			};
			return documentState;
		});
	}

	function updateAllShotCameraReferenceImages(updateState) {
		const currentShotCameras = Array.isArray(store.workspace.shotCameras.value)
			? store.workspace.shotCameras.value
			: [];
		store.workspace.shotCameras.value = currentShotCameras.map(
			(documentState) => {
				const nextDocument = cloneShotCameraDocument(documentState);
				const nextReferenceImages = updateState(
					createShotCameraReferenceImagesState(nextDocument.referenceImages),
					nextDocument,
				);
				nextDocument.referenceImages =
					createShotCameraReferenceImagesState(nextReferenceImages);
				return nextDocument;
			},
		);
	}

	function dropReferencePresetFromAllShotCameras(
		deletedPresetId,
		fallbackPresetId,
	) {
		updateAllShotCameraReferenceImages((referenceImagesState) => {
			const nextState =
				createShotCameraReferenceImagesState(referenceImagesState);
			if (nextState.presetId === deletedPresetId) {
				nextState.presetId = fallbackPresetId ?? null;
			}
			const nextOverrides = {
				...(nextState.overridesByPresetId ?? {}),
			};
			delete nextOverrides[deletedPresetId];
			nextState.overridesByPresetId = nextOverrides;
			return nextState;
		});
	}

	function removeReferenceItemsFromAllShotCameras(presetId, deletedItemIds) {
		if (
			!presetId ||
			!Array.isArray(deletedItemIds) ||
			deletedItemIds.length === 0
		) {
			return;
		}
		const deletedItemIdSet = new Set(
			deletedItemIds
				.map((itemId) => String(itemId ?? "").trim())
				.filter(Boolean),
		);
		if (deletedItemIdSet.size === 0) {
			return;
		}
		updateAllShotCameraReferenceImages((referenceImagesState) => {
			const nextState =
				createShotCameraReferenceImagesState(referenceImagesState);
			const existingOverride =
				nextState.overridesByPresetId?.[presetId] ?? null;
			if (!existingOverride) {
				return nextState;
			}
			const nextOverride =
				createReferenceImageCameraPresetOverride(existingOverride);
			for (const deletedItemId of deletedItemIdSet) {
				delete nextOverride.items[deletedItemId];
				if (nextOverride.activeItemId === deletedItemId) {
					nextOverride.activeItemId = null;
				}
			}
			const nextOverrides = {
				...(nextState.overridesByPresetId ?? {}),
			};
			if (isReferenceImageOverrideEmpty(nextOverride)) {
				delete nextOverrides[presetId];
			} else {
				nextOverrides[presetId] = nextOverride;
			}
			nextState.overridesByPresetId = nextOverrides;
			return nextState;
		});
	}

	function syncSelectionState(documentState, resolved) {
		const assetIds = new Set(
			(documentState?.assets ?? []).map((asset) => asset.id),
		);
		let nextSelectedAssetId = store.referenceImages.selectedAssetId.value;
		if (!assetIds.has(nextSelectedAssetId)) {
			nextSelectedAssetId = "";
		}
		const normalized = getValidSelectionState({
			items: resolved?.items ?? [],
			selectedItemIds: getSelectedItemIds(),
			activeItemId: store.referenceImages.selectedItemId.value,
		});
		if (!normalized.activeItemId && nextSelectedAssetId) {
			const matchingItems = (resolved?.items ?? []).filter(
				(item) => item.assetId === nextSelectedAssetId,
			);
			normalized.selectedItemIds = matchingItems.map((item) => item.id);
			normalized.activeItemId =
				matchingItems[matchingItems.length - 1]?.id ?? "";
			normalized.activeAssetId = nextSelectedAssetId;
		}
		setSelectionState({
			selectedItemIds: normalized.selectedItemIds,
			activeItemId: normalized.activeItemId,
			activeAssetId: normalized.activeAssetId || nextSelectedAssetId,
		});
	}

	function syncUiState() {
		const documentState = getDocument();
		const resolved = getResolvedShotItems(documentState);
		const resolvedPreset = resolved.preset;
		const assetsById = resolved.assetsById;
		const usageCounts = new Map();
		for (const item of resolved.items) {
			usageCounts.set(item.assetId, (usageCounts.get(item.assetId) ?? 0) + 1);
		}

		store.referenceImages.assetCount.value = documentState.assets.length;
		store.referenceImages.assets.value = documentState.assets.map((asset) => ({
			id: asset.id,
			label: asset.label,
			fileName: asset.sourceMeta?.filename ?? asset.label ?? "",
			sizeLabel: buildReferenceImageSizeLabel(asset.sourceMeta),
			currentCameraCount: usageCounts.get(asset.id) ?? 0,
		}));
		store.referenceImages.presets.value = (documentState.presets ?? []).map(
			(preset) => ({
				id: preset.id,
				name: preset.name,
				itemCount: preset.items.length,
				isBlank: preset.id === REFERENCE_IMAGE_DEFAULT_PRESET_ID,
			}),
		);
		store.referenceImages.panelPresetId.value = resolvedPreset?.id ?? "";
		store.referenceImages.panelPresetName.value = resolvedPreset?.name ?? "";
		store.referenceImages.items.value = resolved.items.map((item) => {
			const asset = assetsById.get(item.assetId) ?? null;
			return {
				id: item.id,
				assetId: item.assetId,
				name: item.name,
				group: item.group,
				order: item.order,
				previewVisible: item.previewVisible,
				exportEnabled: item.exportEnabled,
				opacity: item.opacity,
				scalePct: item.scalePct,
				rotationDeg: item.rotationDeg,
				offsetPx: {
					x: item.offsetPx.x,
					y: item.offsetPx.y,
				},
				anchor: {
					ax: item.anchor.ax,
					ay: item.anchor.ay,
				},
				fileName: asset?.sourceMeta?.filename ?? asset?.label ?? "",
				sizeLabel: buildReferenceImageSizeLabel(asset?.sourceMeta),
			};
		});
		syncSelectionState(documentState, resolved);
		if (!referenceImageDragState && getSelectedItemIds().length > 1) {
			const context = getTransformContext(documentState);
			if (context) {
				const geometries = resolved.items
					.filter((item) => getSelectedItemIds().includes(item.id))
					.map((item) => {
						const asset = resolved.assetsById.get(item.assetId) ?? null;
						if (!asset?.sourceMeta) {
							return null;
						}
						return buildLogicalItemGeometry(item, asset, context);
					})
					.filter(Boolean);
				const storedSelectionBox =
					store.referenceImages.selectionBoxLogical.value ?? null;
				if (
					!storedSelectionBox ||
					!doesReferenceImageSelectionBoxMatchGeometries(
						storedSelectionBox,
						geometries,
					)
				) {
					const preservedSelectionAnchor =
						store.referenceImages.selectionAnchor.value &&
						Number.isFinite(store.referenceImages.selectionAnchor.value.x) &&
						Number.isFinite(store.referenceImages.selectionAnchor.value.y)
							? {
									x: store.referenceImages.selectionAnchor.value.x,
									y: store.referenceImages.selectionAnchor.value.y,
								}
							: storedSelectionBox &&
									Number.isFinite(storedSelectionBox.anchorX) &&
									Number.isFinite(storedSelectionBox.anchorY)
								? {
										x: storedSelectionBox.anchorX,
										y: storedSelectionBox.anchorY,
									}
								: null;
					const rebuiltSelectionBox =
						storedSelectionBox && preservedSelectionAnchor
							? buildReferenceImageSelectionBoxLogicalFromGeometries(
									geometries,
									{
										rotationDeg: storedSelectionBox.rotationDeg ?? 0,
										anchorX: preservedSelectionAnchor.x,
										anchorY: preservedSelectionAnchor.y,
										anchorPoint: {
											x:
												storedSelectionBox.left +
												storedSelectionBox.width * preservedSelectionAnchor.x,
											y:
												storedSelectionBox.top +
												storedSelectionBox.height * preservedSelectionAnchor.y,
										},
									},
								)
							: null;
					if (rebuiltSelectionBox && preservedSelectionAnchor) {
						store.referenceImages.selectionAnchor.value =
							preservedSelectionAnchor;
						setStoredSelectionBox(
							rebuiltSelectionBox,
							context,
							preservedSelectionAnchor,
						);
					} else {
						store.referenceImages.selectionAnchor.value = null;
						initializeMultiSelectionTransformBox(
							store.referenceImages.items.value,
						);
					}
				}
			}
		}
	}

	function openReferenceImageFiles() {
		referenceImageInput?.click?.();
	}

	function captureProjectReferenceImagesState() {
		return cloneReferenceImageDocument(getDocument());
	}

	function captureReferenceImageEditorState(options = {}) {
		return captureReferenceImageEditorStateSnapshot({
			selectedItemIds: getSelectedItemIds(),
			selectedItemId: store.referenceImages.selectedItemId.value,
			selectedAssetId: store.referenceImages.selectedAssetId.value,
			selectionAnchor: store.referenceImages.selectionAnchor.value,
			selectionBoxLogical: store.referenceImages.selectionBoxLogical.value,
			rememberedSelectedItemIds:
				lastNonEmptyReferenceSelectionState.selectedItemIds,
			rememberedActiveItemId: lastNonEmptyReferenceSelectionState.activeItemId,
			previewSessionVisible: store.referenceImages.previewSessionVisible.value,
			includePreviewSessionVisible:
				options?.includePreviewSessionVisible !== false,
		});
	}

	function restoreReferenceImageEditorState(editorState = null, options = {}) {
		const restoredEditorState = normalizeReferenceImageEditorStateForRestore(
			editorState,
			options,
		);
		if (restoredEditorState.shouldUpdatePreviewSessionVisible) {
			store.referenceImages.previewSessionVisible.value =
				restoredEditorState.previewSessionVisible;
		}
		if (!restoredEditorState.hasEditorState) {
			clearSelection();
			lastNonEmptyReferenceSelectionState =
				restoredEditorState.rememberedSelectionState;
			return;
		}
		setSelectionState({
			selectedItemIds: restoredEditorState.selectedItemIds,
			activeItemId: restoredEditorState.selectedItemId,
			activeAssetId: restoredEditorState.selectedAssetId,
		});
		lastNonEmptyReferenceSelectionState =
			restoredEditorState.rememberedSelectionState;
		if (
			restoredEditorState.selectedItemIds.length > 1 &&
			restoredEditorState.selectionBoxLogical
		) {
			const nextSelectionAnchor = restoredEditorState.selectionAnchor;
			store.referenceImages.selectionAnchor.value = nextSelectionAnchor;
			setStoredSelectionBox(
				restoredEditorState.selectionBoxLogical,
				getTransformContext(),
				nextSelectionAnchor,
			);
			return;
		}
		store.referenceImages.selectionAnchor.value = null;
		setStoredSelectionBox(null);
	}

	function applyProjectReferenceImagesState(documentState, options = {}) {
		const editorState = options?.editorState ?? null;
		setDocument(documentState ?? createDefaultReferenceImageDocument());
		store.referenceImages.previewSessionVisible.value =
			editorState?.previewSessionVisible !== false;
		store.referenceImages.exportSessionEnabled.value = true;
		clearSelection();
		syncUiState();
		restoreReferenceImageEditorState(editorState);
		updateUi?.();
		refreshUiAfterLayout({
			expectedVisibleItems: getResolvedPreset()?.items.filter(
				(item) => item.previewVisible !== false,
			).length,
		});
	}

	function clearReferenceImages() {
		setDocument(createDefaultReferenceImageDocument());
		store.referenceImages.previewSessionVisible.value = true;
		store.referenceImages.exportSessionEnabled.value = true;
		clearSelection();
		syncUiState();
		updateUi?.();
	}

	function setPreviewSessionVisible(nextVisible) {
		store.referenceImages.previewSessionVisible.value = nextVisible !== false;
	}

	function setActiveReferenceImagePreset(presetId) {
		const nextPresetId = String(presetId ?? "").trim();
		const documentState = getDocument();
		const nextPreset =
			findMutablePresetInDocument(documentState, nextPresetId) ??
			findMutablePresetInDocument(
				documentState,
				REFERENCE_IMAGE_DEFAULT_PRESET_ID,
			) ??
			null;
		if (!nextPreset) {
			return false;
		}
		documentState.activePresetId = nextPreset.id;
		setDocument(documentState);
		updateActiveShotCameraDocument((shotCameraDocument) => {
			const nextReferenceImages = createShotCameraReferenceImagesState(
				shotCameraDocument.referenceImages,
			);
			nextReferenceImages.presetId = nextPreset.id;
			shotCameraDocument.referenceImages = nextReferenceImages;
			return shotCameraDocument;
		});
		clearSelection();
		syncUiState();
		updateUi?.();
		return true;
	}

	function setActiveReferenceImagePresetName(nextValue) {
		const documentState = cloneReferenceImageDocument(getDocument());
		const activePreset =
			findMutablePresetInDocument(
				documentState,
				documentState.activePresetId,
			) ?? null;
		if (
			!activePreset ||
			activePreset.id === REFERENCE_IMAGE_DEFAULT_PRESET_ID
		) {
			return false;
		}
		const nextName = sanitizeReferenceImagePresetName(
			nextValue,
			activePreset.name || "Reference",
		);
		if (!nextName || nextName === activePreset.name) {
			return false;
		}
		runReferenceImageHistoryAction("reference-image.preset.rename", () => {
			activePreset.name = nextName;
			setDocument(documentState);
			syncUiState();
			updateUi?.();
		});
		return true;
	}

	function deleteActiveReferenceImagePreset() {
		const documentState = cloneReferenceImageDocument(getDocument());
		const activePreset =
			findMutablePresetInDocument(
				documentState,
				documentState.activePresetId,
			) ?? null;
		if (
			!activePreset ||
			activePreset.id === REFERENCE_IMAGE_DEFAULT_PRESET_ID
		) {
			return false;
		}
		const nextPreset =
			findMutablePresetInDocument(
				documentState,
				REFERENCE_IMAGE_DEFAULT_PRESET_ID,
			) ??
			documentState.presets.find((preset) => preset.id !== activePreset.id) ??
			null;
		if (!nextPreset) {
			return false;
		}
		runReferenceImageHistoryAction("reference-image.preset.delete", () => {
			documentState.presets = documentState.presets.filter(
				(preset) => preset.id !== activePreset.id,
			);
			documentState.activePresetId = nextPreset.id;
			pruneUnusedReferenceImageAssetsInDocument(documentState);
			setDocument(documentState);
			dropReferencePresetFromAllShotCameras(activePreset.id, nextPreset.id);
			clearSelection();
			syncUiState();
			updateUi?.();
		});
		return true;
	}

	function duplicateActiveReferenceImagePreset() {
		const documentState = getDocument();
		const resolved = getResolvedShotItems(documentState);
		if (!resolved.preset) {
			return false;
		}
		const nextPreset = createReferenceImagePreset({
			name: buildDuplicatePresetName(resolved.preset.name),
			baseRenderBox: resolved.preset.baseRenderBox,
			items: resolved.items.map((item) => ({
				assetId: item.assetId,
				name: item.name,
				group: item.group,
				order: item.order,
				previewVisible: item.previewVisible,
				exportEnabled: item.exportEnabled,
				opacity: item.opacity,
				scalePct: item.scalePct,
				rotationDeg: item.rotationDeg,
				offsetPx: item.offsetPx,
				anchor: item.anchor,
			})),
		});
		runReferenceImageHistoryAction("reference-image.preset.duplicate", () => {
			const nextDocument = cloneReferenceImageDocument(documentState);
			nextDocument.presets.push(nextPreset);
			nextDocument.activePresetId = nextPreset.id;
			setDocument(nextDocument);
			updateActiveShotCameraDocument((shotCameraDocument) => {
				const nextReferenceImages = createShotCameraReferenceImagesState(
					shotCameraDocument.referenceImages,
				);
				nextReferenceImages.presetId = nextPreset.id;
				shotCameraDocument.referenceImages = nextReferenceImages;
				return shotCameraDocument;
			});
			clearSelection();
			syncUiState();
			updateUi?.();
		});
		return true;
	}

	function deleteSelectedReferenceImageItems(itemIds = null) {
		const documentState = cloneReferenceImageDocument(getDocument());
		const resolved = getResolvedShotItems(documentState);
		const presetId = resolved?.preset?.id ?? null;
		if (!presetId) {
			return false;
		}
		const nextSelectedItemIds =
			Array.isArray(itemIds) && itemIds.length > 0
				? itemIds
				: getSelectedItemIds();
		const deletedItemIdSet = new Set(
			nextSelectedItemIds
				.map((itemId) => String(itemId ?? "").trim())
				.filter(Boolean),
		);
		if (deletedItemIdSet.size === 0) {
			return false;
		}
		const preset = findMutablePresetInDocument(documentState, presetId);
		if (!preset) {
			return false;
		}
		const nextItems = preset.items.filter(
			(item) => !deletedItemIdSet.has(item.id),
		);
		if (nextItems.length === preset.items.length) {
			return false;
		}
		runReferenceImageHistoryAction("reference-image.delete", () => {
			preset.items = nextItems;
			normalizeReferenceImageItemOrderInPlace(preset.items);
			pruneUnusedReferenceImageAssetsInDocument(documentState);
			setDocument(documentState);
			removeReferenceItemsFromAllShotCameras(
				presetId,
				Array.from(deletedItemIdSet),
			);
			clearSelection();
			syncUiState();
			updateUi?.();
		});
		return true;
	}

	function commitResolvedItems(documentState, resolved, nextItems) {
		const presetId = resolved?.preset?.id ?? null;
		if (!presetId) {
			return false;
		}
		const preset = findMutablePresetInDocument(documentState, presetId);
		if (!preset) {
			return false;
		}

		const normalizedItems = normalizeReferenceImageItemOrderInPlace(
			nextItems.map((item) => createReferenceImageItem(item)),
		);
		const baseItemsById = new Map(
			preset.items.map((item) => [item.id, createReferenceImageItem(item)]),
		);
		const nextOverrideItems = {};
		for (const item of normalizedItems) {
			const baseItem = baseItemsById.get(item.id) ?? null;
			if (!baseItem) {
				continue;
			}
			const patch = buildReferenceImageOverridePatch(baseItem, item);
			if (Object.keys(patch).length > 0) {
				nextOverrideItems[item.id] = patch;
			}
		}

		updateActiveShotCameraDocument((shotCameraDocument) => {
			const nextReferenceImages = createShotCameraReferenceImagesState(
				shotCameraDocument.referenceImages,
			);
			nextReferenceImages.presetId = presetId;
			const nextOverride = createReferenceImageCameraPresetOverride(
				nextReferenceImages.overridesByPresetId?.[presetId] ?? null,
			);
			nextOverride.items = nextOverrideItems;
			const nextOverridesByPresetId = {
				...nextReferenceImages.overridesByPresetId,
			};
			if (isReferenceImageOverrideEmpty(nextOverride)) {
				delete nextOverridesByPresetId[presetId];
			} else {
				nextOverridesByPresetId[presetId] = nextOverride;
			}
			nextReferenceImages.overridesByPresetId = nextOverridesByPresetId;
			shotCameraDocument.referenceImages = nextReferenceImages;
			return shotCameraDocument;
		});
		syncUiState();
		updateUi?.();
		return true;
	}

	function updateResolvedReferenceImageItem(itemId, patchOrUpdater) {
		const documentState = getDocument();
		const resolved = getResolvedShotItems(documentState);
		const existingItem =
			resolved.items.find((item) => item.id === itemId) ?? null;
		if (!existingItem || !resolved.preset) {
			return false;
		}
		const nextItems = resolved.items.map((item) => {
			if (item.id !== itemId) {
				return item;
			}
			const patch =
				typeof patchOrUpdater === "function"
					? patchOrUpdater(item)
					: patchOrUpdater;
			return createReferenceImageItem({
				...item,
				...(patch ?? {}),
			});
		});
		return commitResolvedItems(documentState, resolved, nextItems);
	}

	function runReferenceImageHistoryAction(label, applyChange) {
		return runHistoryAction?.(label, applyChange) ?? false;
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
			return;
		}
		if (!additive && !toggle) {
			referenceListSelectionAnchorId = item.id;
			setSelectionState({
				selectedItemIds: [item.id],
				activeItemId: item.id,
				activeAssetId: item.assetId,
			});
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

	function setReferenceImageGroup(itemId, nextGroup) {
		const normalizedGroup =
			nextGroup === REFERENCE_IMAGE_GROUP_BACK
				? REFERENCE_IMAGE_GROUP_BACK
				: REFERENCE_IMAGE_GROUP_FRONT;
		const documentState = getDocument();
		const resolved = getResolvedShotItems(documentState);
		const existingItem =
			resolved.items.find((item) => item.id === itemId) ?? null;
		if (!existingItem) {
			return;
		}
		const nextGroupOrder = resolved.items.filter(
			(item) => item.id !== itemId && item.group === normalizedGroup,
		).length;
		const nextItems = resolved.items.map((item) =>
			item.id === itemId
				? createReferenceImageItem({
						...item,
						group: normalizedGroup,
						order: nextGroupOrder,
					})
				: item,
		);
		runReferenceImageHistoryAction("reference-image.group", () => {
			commitResolvedItems(documentState, resolved, nextItems);
		});
	}

	function setReferenceImageOrder(itemId, nextOrderNumber) {
		const numericValue = Number(nextOrderNumber);
		if (!Number.isFinite(numericValue)) {
			return;
		}
		const targetIndex = Math.max(0, Math.floor(numericValue));
		const documentState = getDocument();
		const resolved = getResolvedShotItems(documentState);
		const existingItem =
			resolved.items.find((item) => item.id === itemId) ?? null;
		if (!existingItem) {
			return;
		}
		const currentGroupItems = resolved.items
			.filter((item) => item.group === existingItem.group && item.id !== itemId)
			.sort((left, right) => left.order - right.order);
		const insertIndex = Math.min(targetIndex, currentGroupItems.length);
		const reorderedGroupItems = [
			...currentGroupItems.slice(0, insertIndex),
			existingItem,
			...currentGroupItems.slice(insertIndex),
		];
		const nextItems = [
			...resolved.items.filter((item) => item.group !== existingItem.group),
			...reorderedGroupItems,
		];
		runReferenceImageHistoryAction("reference-image.order", () => {
			commitResolvedItems(documentState, resolved, nextItems);
		});
	}

	function moveReferenceImageToDisplayTarget(
		itemId,
		targetItemId,
		position = "before",
		orderedIds = null,
	) {
		const draggedItemId = String(itemId ?? "").trim();
		const nextTargetItemId = String(targetItemId ?? "").trim();
		if (
			!draggedItemId ||
			!nextTargetItemId ||
			draggedItemId === nextTargetItemId
		) {
			return false;
		}
		const documentState = getDocument();
		const resolved = getResolvedShotItems(documentState);
		const itemsById = new Map(resolved.items.map((item) => [item.id, item]));
		const draggedItem = itemsById.get(draggedItemId) ?? null;
		const targetItem = itemsById.get(nextTargetItemId) ?? null;
		if (!draggedItem || !targetItem) {
			return false;
		}
		const currentSelectedIds = getSelectedItemIds().filter((selectedId) =>
			itemsById.has(selectedId),
		);
		const movedItemIdSet = new Set(
			currentSelectedIds.includes(draggedItemId)
				? currentSelectedIds
				: [draggedItemId],
		);
		if (movedItemIdSet.has(nextTargetItemId)) {
			return false;
		}
		const displayItems = (
			Array.isArray(orderedIds) && orderedIds.length > 0
				? orderedIds
						.map(
							(entryId) => itemsById.get(String(entryId ?? "").trim()) ?? null,
						)
						.filter(Boolean)
				: getReferenceImageDisplayItems(resolved.items)
		).filter((item, index, source) => source.indexOf(item) === index);
		const movedItems = displayItems
			.filter((item) => movedItemIdSet.has(item.id))
			.map((item) =>
				createReferenceImageItem({
					...item,
					group: targetItem.group,
				}),
			);
		if (movedItems.length === 0) {
			return false;
		}
		const remainingItems = displayItems.filter(
			(item) => !movedItemIdSet.has(item.id),
		);
		const targetIndex = remainingItems.findIndex(
			(item) => item.id === nextTargetItemId,
		);
		if (targetIndex < 0) {
			return false;
		}
		const insertionIndex = position === "after" ? targetIndex + 1 : targetIndex;
		const nextDisplayItems = [
			...remainingItems.slice(0, insertionIndex),
			...movedItems,
			...remainingItems.slice(insertionIndex),
		];
		const rebuildGroupItems = (group) =>
			nextDisplayItems
				.filter((item) => item.group === group)
				.reverse()
				.map((item, index) =>
					createReferenceImageItem({
						...item,
						order: index,
					}),
				);
		const nextItems = [
			...rebuildGroupItems(REFERENCE_IMAGE_GROUP_BACK),
			...rebuildGroupItems(REFERENCE_IMAGE_GROUP_FRONT),
		];
		runReferenceImageHistoryAction("reference-image.order", () => {
			commitResolvedItems(documentState, resolved, nextItems);
		});
		return true;
	}

	function startReferenceImageMove(itemId, event) {
		if (!store.viewportReferenceImageEditMode.value) {
			return false;
		}
		const item =
			store.referenceImages.items.value.find((entry) => entry.id === itemId) ??
			null;
		if (!item || event.button !== 0) {
			return false;
		}
		event.preventDefault();
		event.stopPropagation();

		const selectionOptions = parseSelectionOptions(event);
		if (selectionOptions.additive || selectionOptions.toggle) {
			selectReferenceImageItem(itemId, selectionOptions);
			updateUi?.();
			return true;
		}

		const selectedItemIds = getSelectedItemIds();
		if (!selectedItemIds.includes(item.id)) {
			setSelectionState({
				selectedItemIds: [item.id],
				activeItemId: item.id,
				activeAssetId: item.assetId,
			});
			updateUi?.();
			return true;
		}

		const transformState = buildSelectionTransformState();
		if (!transformState) {
			return false;
		}
		referenceImageDragState = {
			type: "move",
			pointerId: event.pointerId,
			startClientX: event.clientX,
			startClientY: event.clientY,
			selectionState: transformState,
			dragActivated: false,
			historyLabel: "reference-image.move",
		};
		window.addEventListener("pointermove", handleReferenceImagePointerMove);
		window.addEventListener("pointerup", handleReferenceImagePointerUp);
		window.addEventListener("pointercancel", handleReferenceImagePointerUp);
		return true;
	}

	function startReferenceImageResize(handleKey, event) {
		if (!store.viewportReferenceImageEditMode.value) {
			return false;
		}
		if (event.button !== 0) {
			return false;
		}
		const handle = FRAME_RESIZE_HANDLES[handleKey];
		if (!handle) {
			return false;
		}
		event.preventDefault();
		event.stopPropagation();
		const selectionState = buildSelectionTransformState();
		if (
			!selectionState?.selectionBoxScreen ||
			!selectionState.selectionBoxLogical
		) {
			return false;
		}
		const rotationRadians =
			(selectionState.selectionBoxScreen.rotationDeg * Math.PI) / 180;
		const frameAnchorLocal = selectionState.anchorLocal;
		const useSelectionAnchorPivot = event.altKey;
		const anchorLocal = useSelectionAnchorPivot
			? frameAnchorLocal
			: (FRAME_RESIZE_HANDLES[getOppositeFrameResizeHandleKey(handleKey)] ?? {
					x: 0.5,
					y: 0.5,
				});
		const anchorWorld = getPointFromRectLocal({
			left: selectionState.selectionBoxScreen.left,
			top: selectionState.selectionBoxScreen.top,
			width: selectionState.selectionBoxScreen.width,
			height: selectionState.selectionBoxScreen.height,
			localX: anchorLocal.x,
			localY: anchorLocal.y,
			anchorAx: selectionState.selectionBoxScreen.anchorX,
			anchorAy: selectionState.selectionBoxScreen.anchorY,
			rotationDeg: selectionState.selectionBoxScreen.rotationDeg,
		});
		const anchorLogical = getPointFromRectLocal({
			left: selectionState.selectionBoxLogical.left,
			top: selectionState.selectionBoxLogical.top,
			width: selectionState.selectionBoxLogical.width,
			height: selectionState.selectionBoxLogical.height,
			localX: anchorLocal.x,
			localY: anchorLocal.y,
			anchorAx: selectionState.selectionBoxLogical.anchorX,
			anchorAy: selectionState.selectionBoxLogical.anchorY,
			rotationDeg: selectionState.selectionBoxLogical.rotationDeg,
		});
		const resizeAxis = getFrameResizeAxisLocal(
			{
				width: selectionState.selectionBoxScreen.width,
				height: selectionState.selectionBoxScreen.height,
			},
			handleKey,
			anchorLocal,
		);
		if (!resizeAxis) {
			return false;
		}
		const startPointerLocal = inverseRotateVector(
			event.clientX - anchorWorld.x,
			event.clientY - anchorWorld.y,
			rotationRadians,
		);
		beginHistoryTransaction("reference-image.resize");
		referenceImageDragState = {
			type: "resize",
			pointerId: event.pointerId,
			handleKey,
			selectionState,
			selectionBoxScreen: selectionState.selectionBoxScreen,
			rotationRadians,
			anchorLocal,
			anchorWorld,
			anchorLogical,
			resizeAxisX: resizeAxis.x,
			resizeAxisY: resizeAxis.y,
			startProjectionDistance:
				startPointerLocal.x * resizeAxis.x + startPointerLocal.y * resizeAxis.y,
			historyLabel: "reference-image.resize",
		};
		window.addEventListener("pointermove", handleReferenceImagePointerMove);
		window.addEventListener("pointerup", handleReferenceImagePointerUp);
		window.addEventListener("pointercancel", handleReferenceImagePointerUp);
		return true;
	}

	function startReferenceImageRotate(zoneKey, event) {
		if (!store.viewportReferenceImageEditMode.value) {
			return false;
		}
		if (event.button !== 0) {
			return false;
		}
		event.preventDefault();
		event.stopPropagation();
		const selectionState = buildSelectionTransformState();
		if (!selectionState?.screenPivot) {
			return false;
		}
		beginHistoryTransaction("reference-image.rotate");
		referenceImageDragState = {
			type: "rotate",
			pointerId: event.pointerId,
			zoneKey,
			selectionState,
			screenPivot: selectionState.screenPivot,
			startPointerAngleDeg:
				(Math.atan2(
					event.clientY - selectionState.screenPivot.y,
					event.clientX - selectionState.screenPivot.x,
				) *
					180) /
				Math.PI,
			historyLabel: "reference-image.rotate",
		};
		window.addEventListener("pointermove", handleReferenceImagePointerMove);
		window.addEventListener("pointerup", handleReferenceImagePointerUp);
		window.addEventListener("pointercancel", handleReferenceImagePointerUp);
		return true;
	}

	function startReferenceImageAnchorDrag(event) {
		if (!store.viewportReferenceImageEditMode.value) {
			return false;
		}
		if (event.button !== 0) {
			return false;
		}
		event.preventDefault();
		event.stopPropagation();
		const selectionState = buildSelectionTransformState();
		if (
			!selectionState?.selectionBoxScreen ||
			!selectionState.selectionBoxLogical
		) {
			return false;
		}
		if (selectionState.geometries.length === 1) {
			beginHistoryTransaction("reference-image.anchor");
		}
		referenceImageDragState = {
			type: "anchor",
			pointerId: event.pointerId,
			selectionState,
			historyLabel:
				selectionState.geometries.length === 1
					? "reference-image.anchor"
					: null,
		};
		window.addEventListener("pointermove", handleReferenceImagePointerMove);
		window.addEventListener("pointerup", handleReferenceImagePointerUp);
		window.addEventListener("pointercancel", handleReferenceImagePointerUp);
		return true;
	}

	function handleReferenceImagePointerMove(event) {
		if (
			!referenceImageDragState ||
			event.pointerId !== referenceImageDragState.pointerId
		) {
			return;
		}
		event.preventDefault();
		const { selectionState } = referenceImageDragState;
		if (!selectionState) {
			return;
		}
		if (referenceImageDragState.type === "move") {
			const deltaLogicalX =
				(event.clientX - referenceImageDragState.startClientX) /
				selectionState.context.renderScaleX;
			const deltaLogicalY =
				(event.clientY - referenceImageDragState.startClientY) /
				selectionState.context.renderScaleY;
			if (!referenceImageDragState.dragActivated) {
				if (
					Math.hypot(
						event.clientX - referenceImageDragState.startClientX,
						event.clientY - referenceImageDragState.startClientY,
					) < REFERENCE_IMAGE_DRAG_START_THRESHOLD_PX
				) {
					return;
				}
				referenceImageDragState.dragActivated = true;
				beginHistoryTransaction("reference-image.move");
			}
			applyReferenceImageSelectionMoveDelta(
				selectionState,
				deltaLogicalX,
				deltaLogicalY,
			);
			return;
		}

		if (referenceImageDragState.type === "rotate") {
			const nextPointerAngleDeg =
				(Math.atan2(
					event.clientY - referenceImageDragState.screenPivot.y,
					event.clientX - referenceImageDragState.screenPivot.x,
				) *
					180) /
				Math.PI;
			const deltaAngleDeg = normalizeAngleDeltaDeg(
				nextPointerAngleDeg - referenceImageDragState.startPointerAngleDeg,
			);
			applyReferenceImageSelectionRotationDelta(selectionState, deltaAngleDeg);
			return;
		}

		if (referenceImageDragState.type === "resize") {
			const currentPointerLocal = inverseRotateVector(
				event.clientX - referenceImageDragState.anchorWorld.x,
				event.clientY - referenceImageDragState.anchorWorld.y,
				referenceImageDragState.rotationRadians,
			);
			const currentProjection =
				currentPointerLocal.x * referenceImageDragState.resizeAxisX +
				currentPointerLocal.y * referenceImageDragState.resizeAxisY;
			const scaleRatio = Math.max(
				0.01,
				currentProjection /
					Math.max(referenceImageDragState.startProjectionDistance, 1e-6),
			);
			applyReferenceImageSelectionScaleRatio(
				selectionState,
				scaleRatio,
				referenceImageDragState.anchorLogical,
			);
			return;
		}

		if (referenceImageDragState.type === "anchor") {
			const singleGeometry =
				selectionState.geometries.length === 1
					? selectionState.geometries[0]
					: null;
			if (singleGeometry) {
				const clampedPointer = clampPointerToViewportShell(
					event.clientX,
					event.clientY,
					selectionState.context,
				);
				const pointerLogicalX =
					(clampedPointer.x - selectionState.context.renderBoxScreenLeft) /
					selectionState.context.renderScaleX;
				const pointerLogicalY =
					(clampedPointer.y - selectionState.context.renderBoxScreenTop) /
					selectionState.context.renderScaleY;
				const rotationRadians =
					(selectionState.selectionBoxLogical.rotationDeg * Math.PI) / 180;
				const pointerLocal = inverseRotateVector(
					pointerLogicalX - singleGeometry.anchorPoint.x,
					pointerLogicalY - singleGeometry.anchorPoint.y,
					rotationRadians,
				);
				const normalizedAnchor = {
					ax:
						(singleGeometry.anchorPoint.x +
							pointerLocal.x -
							singleGeometry.left) /
						Math.max(singleGeometry.logicalWidth, 1e-6),
					ay:
						(singleGeometry.anchorPoint.y +
							pointerLocal.y -
							singleGeometry.top) /
						Math.max(singleGeometry.logicalHeight, 1e-6),
				};
				applyGeometryUpdates([singleGeometry], (geometry, context) => {
					const nextAnchorPoint = getPointFromRectLocal({
						left: geometry.left,
						top: geometry.top,
						width: geometry.logicalWidth,
						height: geometry.logicalHeight,
						localX: normalizedAnchor.ax,
						localY: normalizedAnchor.ay,
						anchorAx: geometry.item.anchor.ax,
						anchorAy: geometry.item.anchor.ay,
						rotationDeg: geometry.item.rotationDeg,
					});
					const nextItemAnchorPx = {
						x: context.outputSize.w * normalizedAnchor.ax,
						y: context.outputSize.h * normalizedAnchor.ay,
					};
					const nextEffectiveOffset = {
						x: nextItemAnchorPx.x - nextAnchorPoint.x,
						y: nextItemAnchorPx.y - nextAnchorPoint.y,
					};
					const nextOffset = removeRenderBoxOffsetCorrection(
						nextEffectiveOffset,
						normalizedAnchor,
						context.resolved.preset.baseRenderBox,
						context.outputSize,
						context.renderBoxAnchor,
						context.resolved.override?.renderBoxCorrection ?? null,
					);
					return {
						anchor: normalizedAnchor,
						offsetPx: {
							x: nextOffset.x,
							y: nextOffset.y,
						},
					};
				});
				return;
			}
			const { selectionBoxLogical } = selectionState;
			const clampedPointer = clampPointerToViewportShell(
				event.clientX,
				event.clientY,
				selectionState.context,
			);
			const pointerLogicalX =
				(clampedPointer.x - selectionState.context.renderBoxScreenLeft) /
				selectionState.context.renderScaleX;
			const pointerLogicalY =
				(clampedPointer.y - selectionState.context.renderBoxScreenTop) /
				selectionState.context.renderScaleY;
			const rotationRadians =
				((selectionBoxLogical.rotationDeg ?? 0) * Math.PI) / 180;
			const pointerLocal = inverseRotateVector(
				pointerLogicalX - selectionState.pivot.x,
				pointerLogicalY - selectionState.pivot.y,
				rotationRadians,
			);
			const nextSelectionAnchor = {
				x:
					(selectionState.pivot.x + pointerLocal.x - selectionBoxLogical.left) /
					Math.max(selectionBoxLogical.width, 1e-6),
				y:
					(selectionState.pivot.y + pointerLocal.y - selectionBoxLogical.top) /
					Math.max(selectionBoxLogical.height, 1e-6),
			};
			const nextAnchorPoint = getPointFromRectLocal({
				left: selectionBoxLogical.left,
				top: selectionBoxLogical.top,
				width: selectionBoxLogical.width,
				height: selectionBoxLogical.height,
				localX: nextSelectionAnchor.x,
				localY: nextSelectionAnchor.y,
				anchorAx: selectionBoxLogical.anchorX,
				anchorAy: selectionBoxLogical.anchorY,
				rotationDeg: selectionBoxLogical.rotationDeg,
			});
			store.referenceImages.selectionAnchor.value = nextSelectionAnchor;
			setStoredSelectionBox(
				{
					...selectionBoxLogical,
					left:
						nextAnchorPoint.x -
						selectionBoxLogical.width * nextSelectionAnchor.x,
					top:
						nextAnchorPoint.y -
						selectionBoxLogical.height * nextSelectionAnchor.y,
					anchorX: nextSelectionAnchor.x,
					anchorY: nextSelectionAnchor.y,
				},
				selectionState.context,
				nextSelectionAnchor,
			);
			updateUi?.();
		}
	}

	function handleReferenceImagePointerUp(event) {
		if (
			!referenceImageDragState ||
			event.pointerId !== referenceImageDragState.pointerId
		) {
			return;
		}
		event.preventDefault();
		stopReferenceImageDrag({
			shouldCommit:
				referenceImageDragState.type !== "move" ||
				referenceImageDragState.dragActivated,
		});
	}

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
