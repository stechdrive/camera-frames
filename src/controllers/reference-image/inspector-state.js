import { normalizeAngleDeltaDeg } from "../../engine/reference-image-selection.js";

export function buildReferenceImageMultiSelectionInspectorSignature({
	selectedItemIds = [],
	selectedItems = [],
	selectionAnchor = null,
	selectionBoxLogical = null,
} = {}) {
	return [
		Array.isArray(selectedItemIds) ? selectedItemIds.join("|") : "",
		...selectedItems.map((item) =>
			[
				item.id,
				Math.round(Number(item.opacity ?? 1) * 100),
				Number(item.scalePct ?? 100).toFixed(6),
				Number(item.offsetPx?.x ?? 0).toFixed(6),
				Number(item.offsetPx?.y ?? 0).toFixed(6),
				Number(item.rotationDeg ?? 0).toFixed(6),
				Number(item.anchor?.ax ?? 0.5).toFixed(6),
				Number(item.anchor?.ay ?? 0.5).toFixed(6),
			].join(":"),
		),
		selectionAnchor &&
		Number.isFinite(selectionAnchor.x) &&
		Number.isFinite(selectionAnchor.y)
			? [
					"anchor",
					Number(selectionAnchor.x).toFixed(6),
					Number(selectionAnchor.y).toFixed(6),
				].join(":")
			: "anchor:null",
		selectionBoxLogical
			? [
					"box",
					Number(selectionBoxLogical.left ?? 0).toFixed(6),
					Number(selectionBoxLogical.top ?? 0).toFixed(6),
					Number(selectionBoxLogical.width ?? 0).toFixed(6),
					Number(selectionBoxLogical.height ?? 0).toFixed(6),
					Number(selectionBoxLogical.rotationDeg ?? 0).toFixed(6),
					Number(selectionBoxLogical.anchorX ?? 0.5).toFixed(6),
					Number(selectionBoxLogical.anchorY ?? 0.5).toFixed(6),
				].join(":")
			: "box:null",
	].join("|");
}

export function captureReferenceImageMultiSelectionBaseline(
	selectedItems = [],
) {
	return new Map(
		selectedItems.map((item) => [
			item.id,
			{
				opacityPct: Math.round(Number(item.opacity ?? 1) * 100),
				scalePct: Number(item.scalePct ?? 100),
				offsetPx: {
					x: Number(item.offsetPx?.x ?? 0),
					y: Number(item.offsetPx?.y ?? 0),
				},
				rotationDeg: Number(item.rotationDeg ?? 0),
			},
		]),
	);
}

function getSharedSelectionDelta(
	selectedItems,
	baselineItems,
	getValue,
	{ normalize = null } = {},
) {
	let sharedValue = null;
	for (const item of selectedItems) {
		const baselineItem = baselineItems.get(item.id);
		if (!baselineItem) {
			return null;
		}
		let nextValue = getValue(item, baselineItem);
		if (normalize) {
			nextValue = normalize(nextValue);
		}
		if (!Number.isFinite(nextValue)) {
			return null;
		}
		if (sharedValue === null) {
			sharedValue = nextValue;
			continue;
		}
		if (Math.abs(sharedValue - nextValue) > 1e-4) {
			return null;
		}
	}
	return sharedValue;
}

function getSharedSelectionValue(selectedItems, getValue) {
	let sharedValue = null;
	for (const item of selectedItems) {
		const nextValue = getValue(item);
		if (!Number.isFinite(nextValue)) {
			return null;
		}
		if (sharedValue === null) {
			sharedValue = nextValue;
			continue;
		}
		if (Math.abs(sharedValue - nextValue) > 1e-4) {
			return null;
		}
	}
	return sharedValue;
}

export function buildReferenceImageMultiSelectionInspectorState({
	selectedItems = [],
	baselineItems = new Map(),
	session = null,
} = {}) {
	if (!Array.isArray(selectedItems) || selectedItems.length <= 1) {
		return null;
	}
	const sharedOpacityPercent = getSharedSelectionValue(
		selectedItems ?? [],
		(item) => Math.round(Number(item.opacity ?? 1) * 100),
	);
	const averageOpacityPercent =
		selectedItems.length > 0
			? Math.round(
					selectedItems.reduce(
						(sum, item) => sum + Math.round(Number(item.opacity ?? 1) * 100),
						0,
					) / selectedItems.length,
				)
			: 100;
	const currentScaleFactor = getSharedSelectionDelta(
		selectedItems,
		baselineItems,
		(item, baselineItem) =>
			Number(item.scalePct ?? 100) / Number(baselineItem.scalePct ?? 100),
	);
	return {
		selectionCount: selectedItems.length,
		session,
		sharedOpacityPercent,
		averageOpacityPercent,
		scaleDeltaPercent: Number.isFinite(currentScaleFactor)
			? (Number(currentScaleFactor) - 1) * 100
			: null,
		offsetXDelta: getSharedSelectionDelta(
			selectedItems,
			baselineItems,
			(item, baselineItem) =>
				Number(item.offsetPx?.x ?? 0) - Number(baselineItem.offsetPx?.x ?? 0),
		),
		offsetYDelta: getSharedSelectionDelta(
			selectedItems,
			baselineItems,
			(item, baselineItem) =>
				Number(item.offsetPx?.y ?? 0) - Number(baselineItem.offsetPx?.y ?? 0),
		),
		rotationDeltaDeg: getSharedSelectionDelta(
			selectedItems,
			baselineItems,
			(item, baselineItem) =>
				Number(item.rotationDeg ?? 0) - Number(baselineItem.rotationDeg ?? 0),
			{ normalize: normalizeAngleDeltaDeg },
		),
	};
}
