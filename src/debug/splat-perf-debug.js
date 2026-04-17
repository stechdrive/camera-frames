const DEBUG_FLAG_KEY = "camera-frames.debug.splat-perf";

export function isSplatPerfDebugEnabled() {
	if (globalThis.__CAMERA_FRAMES_DEBUG_SPLAT_PERF__ === true) {
		return true;
	}
	try {
		return globalThis.localStorage?.getItem?.(DEBUG_FLAG_KEY) === "1";
	} catch {
		return false;
	}
}

export function debugSplatPerf(phase, details = null) {
	if (!isSplatPerfDebugEnabled()) {
		return false;
	}
	if (details == null) {
		console.debug(`[splat-perf] ${phase}`);
		return true;
	}
	console.debug(`[splat-perf] ${phase}`, details);
	return true;
}
