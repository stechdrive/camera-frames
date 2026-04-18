import { getFrameRotateCursorCss } from "../../engine/rotate-cursor.js";

export function setGlobalFrameCursor(cursorValue) {
	if (typeof document === "undefined") {
		return;
	}

	document.body.style.cursor = cursorValue;
}

export function setGlobalRotateCursor(rotationDegrees, zoneKey) {
	setGlobalFrameCursor(getFrameRotateCursorCss(rotationDegrees, zoneKey));
}

export function clearGlobalFrameCursor() {
	if (typeof document === "undefined") {
		return;
	}

	document.body.style.removeProperty("cursor");
}

export function getEventCursor(event, fallback) {
	const target = event?.currentTarget;
	if (!(target instanceof Element)) {
		return fallback;
	}

	return getComputedStyle(target).cursor || fallback;
}
