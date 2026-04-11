function isValidOverlayRect(rect) {
	return Boolean(rect && rect.width > 0 && rect.height > 0);
}

export function getOverlayBounds(element, { preferClientSize = false } = {}) {
	if (!element) {
		return null;
	}
	const width = Number(
		preferClientSize
			? (element.clientWidth ?? element.offsetWidth ?? 0)
			: (element.offsetWidth ?? element.clientWidth ?? 0),
	);
	const height = Number(
		preferClientSize
			? (element.clientHeight ?? element.offsetHeight ?? 0)
			: (element.offsetHeight ?? element.clientHeight ?? 0),
	);
	if (!(width > 0) || !(height > 0)) {
		return null;
	}
	return {
		left: Number(element.offsetLeft ?? 0),
		top: Number(element.offsetTop ?? 0),
		width,
		height,
	};
}

export function computeDropHintStyle({
	viewportRect = null,
	renderBoxRect = null,
} = {}) {
	const targetRect = isValidOverlayRect(renderBoxRect)
		? renderBoxRect
		: viewportRect;
	if (!isValidOverlayRect(targetRect)) {
		return undefined;
	}
	return {
		left: `${targetRect.left + targetRect.width * 0.5}px`,
		top: `${targetRect.top + targetRect.height * 0.5}px`,
		bottom: "auto",
		transform: "translate(-50%, -50%)",
	};
}
