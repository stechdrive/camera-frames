export function isNativeHistoryTarget(target) {
	if (
		!target ||
		(typeof target !== "object" && typeof target !== "function") ||
		typeof target.closest !== "function"
	) {
		return false;
	}
	const draftEditingTarget = target.closest('input[data-draft-editing="true"]');
	if (draftEditingTarget) {
		return true;
	}
	return (
		target.closest(
			[
				"textarea",
				'[contenteditable="true"]',
				'input[type="search"]',
				'input[type="url"]',
				'input[type="email"]',
				'input[type="password"]',
			].join(", "),
		) !== null
	);
}

export function isHistoryShortcut(event) {
	const hasHistoryModifier = event.ctrlKey || event.metaKey;
	return (
		hasHistoryModifier && (event.code === "KeyZ" || event.code === "KeyY")
	);
}
