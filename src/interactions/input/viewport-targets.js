export function isViewportOverlayControlTarget(target) {
	if (
		!target ||
		(typeof target !== "object" && typeof target !== "function") ||
		typeof target.closest !== "function"
	) {
		return false;
	}
	return (
		target.closest(
			".viewport-project-status, .viewport-lod-scale, .background-task-pill",
		) !== null
	);
}

export function isViewportPointerTarget(target) {
	return Boolean(
		target?.closest?.("#render-box") ||
			target?.closest?.("#viewport") ||
			target?.closest?.("#viewport-shell"),
	);
}

export function isMiddleMouseButton(event) {
	return event.button === 1;
}
