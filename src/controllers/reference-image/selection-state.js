import { inverseRotateVector } from "../../engine/frame-transform.js";
import { getPointsBounds } from "../../engine/reference-image-selection.js";

export function getSelectedReferenceImageItemIds(selectedItemIdsValue) {
	return Array.isArray(selectedItemIdsValue) ? selectedItemIdsValue : [];
}

export function getValidReferenceImageSelectionState({
	items = [],
	selectedItemIds = [],
	activeItemId = "",
} = {}) {
	const validIds = new Set(items.map((item) => item.id));
	const normalizedSelectedItemIds = [];
	for (const itemId of selectedItemIds ?? []) {
		if (!validIds.has(itemId) || normalizedSelectedItemIds.includes(itemId)) {
			continue;
		}
		normalizedSelectedItemIds.push(itemId);
	}
	let nextActiveItemId =
		typeof activeItemId === "string" && validIds.has(activeItemId)
			? activeItemId
			: "";
	if (
		nextActiveItemId &&
		!normalizedSelectedItemIds.includes(nextActiveItemId)
	) {
		normalizedSelectedItemIds.push(nextActiveItemId);
	}
	if (!nextActiveItemId && normalizedSelectedItemIds.length > 0) {
		nextActiveItemId =
			normalizedSelectedItemIds[normalizedSelectedItemIds.length - 1];
	}
	const activeItem = items.find((item) => item.id === nextActiveItemId) ?? null;
	return {
		selectedItemIds: normalizedSelectedItemIds,
		activeItemId: nextActiveItemId,
		activeAssetId: activeItem?.assetId ?? "",
	};
}

export function buildReferenceImageSelectionBoxLogicalFromGeometries(
	geometries,
) {
	const bounds = getPointsBounds(
		(geometries ?? []).flatMap((geometry) => geometry.corners ?? []),
	);
	if (!bounds) {
		return null;
	}
	return {
		left: bounds.left,
		top: bounds.top,
		width: bounds.width,
		height: bounds.height,
		rotationDeg: 0,
		anchorX: 0.5,
		anchorY: 0.5,
	};
}

export function doesReferenceImageSelectionBoxMatchGeometries(
	logicalBox,
	geometries,
) {
	if (!logicalBox || !Array.isArray(geometries) || geometries.length === 0) {
		return false;
	}
	const anchorPoint = {
		x: logicalBox.left + logicalBox.width * 0.5,
		y: logicalBox.top + logicalBox.height * 0.5,
	};
	const rotationRadians = ((logicalBox.rotationDeg ?? 0) * Math.PI) / 180;
	const unrotatedCorners = geometries.flatMap((geometry) =>
		(geometry.corners ?? []).map((corner) => {
			const local = inverseRotateVector(
				corner.x - anchorPoint.x,
				corner.y - anchorPoint.y,
				rotationRadians,
			);
			return {
				x: anchorPoint.x + local.x,
				y: anchorPoint.y + local.y,
			};
		}),
	);
	const bounds = getPointsBounds(unrotatedCorners);
	if (!bounds) {
		return false;
	}
	const epsilon = 1e-3;
	return (
		Math.abs(bounds.left - logicalBox.left) <= epsilon &&
		Math.abs(bounds.top - logicalBox.top) <= epsilon &&
		Math.abs(bounds.width - logicalBox.width) <= epsilon &&
		Math.abs(bounds.height - logicalBox.height) <= epsilon
	);
}

export function projectReferenceImageSelectionBoxLogicalToScreen(
	logicalBox,
	context,
	anchorLocal = null,
) {
	if (!logicalBox || !context) {
		return null;
	}
	const nextAnchorLocal = {
		x: Number.isFinite(anchorLocal?.x)
			? anchorLocal.x
			: (logicalBox.anchorX ?? 0.5),
		y: Number.isFinite(anchorLocal?.y)
			? anchorLocal.y
			: (logicalBox.anchorY ?? 0.5),
	};
	return {
		left: context.renderBoxScreenLeft + logicalBox.left * context.renderScaleX,
		top: context.renderBoxScreenTop + logicalBox.top * context.renderScaleY,
		width: logicalBox.width * context.renderScaleX,
		height: logicalBox.height * context.renderScaleY,
		rotationDeg: logicalBox.rotationDeg ?? 0,
		anchorX: nextAnchorLocal.x,
		anchorY: nextAnchorLocal.y,
	};
}

export function captureReferenceImageEditorStateSnapshot({
	selectedItemIds = [],
	selectedItemId = "",
	selectedAssetId = "",
	selectionAnchor = null,
	selectionBoxLogical = null,
	rememberedSelectedItemIds = [],
	rememberedActiveItemId = "",
	previewSessionVisible = true,
	includePreviewSessionVisible = true,
} = {}) {
	const editorState = {
		selectedItemIds: [...selectedItemIds],
		selectedItemId: String(selectedItemId ?? ""),
		selectedAssetId: String(selectedAssetId ?? ""),
		selectionAnchor:
			selectionAnchor &&
			Number.isFinite(selectionAnchor.x) &&
			Number.isFinite(selectionAnchor.y)
				? {
						x: selectionAnchor.x,
						y: selectionAnchor.y,
					}
				: null,
		selectionBoxLogical: selectionBoxLogical
			? { ...selectionBoxLogical }
			: null,
		rememberedSelectedItemIds: Array.isArray(rememberedSelectedItemIds)
			? [...rememberedSelectedItemIds]
			: [],
		rememberedActiveItemId: String(rememberedActiveItemId ?? ""),
	};
	if (includePreviewSessionVisible) {
		editorState.previewSessionVisible = previewSessionVisible !== false;
	}
	return editorState;
}

export function normalizeReferenceImageEditorStateForRestore(
	editorState = null,
	options = {},
) {
	const preservePreviewSessionVisible =
		options?.preservePreviewSessionVisible === true;
	if (!editorState) {
		return {
			hasEditorState: false,
			shouldUpdatePreviewSessionVisible: !preservePreviewSessionVisible,
			previewSessionVisible: true,
			selectedItemIds: [],
			selectedItemId: "",
			selectedAssetId: "",
			rememberedSelectionState: {
				selectedItemIds: [],
				activeItemId: "",
			},
			selectionAnchor: null,
			selectionBoxLogical: null,
		};
	}
	const selectedItemIds = Array.isArray(editorState.selectedItemIds)
		? editorState.selectedItemIds.map((itemId) => String(itemId ?? "").trim())
		: [];
	const rememberedSelectedItemIds = Array.isArray(
		editorState.rememberedSelectedItemIds,
	)
		? editorState.rememberedSelectedItemIds.map((itemId) =>
				String(itemId ?? "").trim(),
			)
		: [];
	const rememberedActiveItemId = String(
		editorState.rememberedActiveItemId ?? "",
	);
	return {
		hasEditorState: true,
		shouldUpdatePreviewSessionVisible: !preservePreviewSessionVisible,
		previewSessionVisible: editorState.previewSessionVisible !== false,
		selectedItemIds,
		selectedItemId: String(editorState.selectedItemId ?? ""),
		selectedAssetId: String(editorState.selectedAssetId ?? ""),
		rememberedSelectionState:
			rememberedSelectedItemIds.length > 0
				? {
						selectedItemIds: rememberedSelectedItemIds,
						activeItemId: rememberedActiveItemId,
					}
				: selectedItemIds.length > 0
					? {
							selectedItemIds: [...selectedItemIds],
							activeItemId: String(editorState.selectedItemId ?? ""),
						}
					: {
							selectedItemIds: [],
							activeItemId: "",
						},
		selectionAnchor:
			editorState.selectionAnchor &&
			Number.isFinite(editorState.selectionAnchor.x) &&
			Number.isFinite(editorState.selectionAnchor.y)
				? {
						x: editorState.selectionAnchor.x,
						y: editorState.selectionAnchor.y,
					}
				: null,
		selectionBoxLogical: editorState.selectionBoxLogical
			? { ...editorState.selectionBoxLogical }
			: null,
	};
}
