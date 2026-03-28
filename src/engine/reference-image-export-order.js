export function getPsdReferenceImageGroupLayers(referenceImageLayers, group) {
	return referenceImageLayers
		.filter((layer) => layer.group === group)
		.sort(
			(left, right) =>
				right.order - left.order || right.id.localeCompare(left.id),
		);
}
