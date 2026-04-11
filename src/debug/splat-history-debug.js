const DEBUG_FLAG_KEY = "camera-frames.debug.splat-history";

export function isSplatHistoryDebugEnabled() {
	if (globalThis.__CAMERA_FRAMES_DEBUG_SPLAT_HISTORY__ === true) {
		return true;
	}
	try {
		return globalThis.localStorage?.getItem?.(DEBUG_FLAG_KEY) === "1";
	} catch {
		return false;
	}
}

export function debugSplatHistory(event, details = null) {
	if (!isSplatHistoryDebugEnabled()) {
		return false;
	}
	if (details == null) {
		console.debug(`[splat-history] ${event}`);
		return true;
	}
	console.debug(`[splat-history] ${event}`, details);
	return true;
}
