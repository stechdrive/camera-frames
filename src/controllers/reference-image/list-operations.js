import {
	REFERENCE_IMAGE_GROUP_BACK,
	REFERENCE_IMAGE_GROUP_FRONT,
	getReferenceImageDisplayItems,
} from "../../reference-image-model.js";

export function createReferenceImageListOperations({
	createReferenceImageItem,
	getSelectedItemIds,
	getDocument,
	getResolvedShotItems,
	commitResolvedItems,
	runReferenceImageHistoryAction,
} = {}) {
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

	return {
		setReferenceImageGroup,
		setReferenceImageOrder,
		moveReferenceImageToDisplayTarget,
	};
}
