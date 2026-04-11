import { getReferenceImageCompositeItems } from "../reference-image-model.js";

export function getPsdReferenceImageGroupLayers(referenceImageLayers, group) {
	// Reference image `order` is stored as the canonical bottom-to-top stack
	// order for rendering, transforms, and persistence. The manager reverses
	// that order for display only; PSD export needs the canonical stack order.
	return getReferenceImageCompositeItems(referenceImageLayers, group);
}
