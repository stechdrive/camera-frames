import assert from "node:assert/strict";
import {
	debugSplatPerf,
	isSplatPerfDebugEnabled,
} from "../src/debug/splat-perf-debug.js";

const FLAG_KEY = "camera-frames.debug.splat-perf";

function restoreGlobals() {
	delete (globalThis as { __CAMERA_FRAMES_DEBUG_SPLAT_PERF__?: boolean })
		.__CAMERA_FRAMES_DEBUG_SPLAT_PERF__;
	(globalThis as { localStorage?: unknown }).localStorage = undefined;
}

function withConsoleDebug(run: () => void) {
	const captured: unknown[][] = [];
	const originalDebug = console.debug;
	console.debug = (...args: unknown[]) => {
		captured.push(args);
	};
	try {
		run();
	} finally {
		console.debug = originalDebug;
	}
	return captured;
}

// ---------- default off ----------
{
	restoreGlobals();
	assert.equal(
		isSplatPerfDebugEnabled(),
		false,
		"default should be disabled without flag or storage",
	);
	const calls = withConsoleDebug(() => {
		assert.equal(debugSplatPerf("grid-init", { elapsedMs: 1 }), false);
		assert.equal(debugSplatPerf("brush-hit"), false);
	});
	assert.equal(
		calls.length,
		0,
		"disabled debugSplatPerf must not emit console output",
	);
	console.log("  splat-perf-debug: default-off OK");
}

// ---------- enabled via global flag ----------
{
	restoreGlobals();
	(
		globalThis as { __CAMERA_FRAMES_DEBUG_SPLAT_PERF__?: boolean }
	).__CAMERA_FRAMES_DEBUG_SPLAT_PERF__ = true;
	assert.equal(isSplatPerfDebugEnabled(), true);
	const calls = withConsoleDebug(() => {
		assert.equal(debugSplatPerf("grid-init", { elapsedMs: 2.5 }), true);
		assert.equal(debugSplatPerf("no-details"), true);
	});
	assert.equal(calls.length, 2, "enabled debugSplatPerf must emit per call");
	assert.equal(calls[0][0], "[splat-perf] grid-init");
	assert.deepEqual(calls[0][1], { elapsedMs: 2.5 });
	assert.equal(calls[1][0], "[splat-perf] no-details");
	assert.equal(calls[1].length, 1, "details=null should omit payload arg");
	restoreGlobals();
	console.log("  splat-perf-debug: global-flag OK");
}

// ---------- enabled via localStorage ----------
{
	restoreGlobals();
	const store = new Map<string, string>();
	(globalThis as { localStorage?: unknown }).localStorage = {
		getItem(key: string) {
			return store.has(key) ? store.get(key) : null;
		},
		setItem(key: string, value: string) {
			store.set(key, value);
		},
		removeItem(key: string) {
			store.delete(key);
		},
	};
	assert.equal(
		isSplatPerfDebugEnabled(),
		false,
		"empty localStorage should keep flag off",
	);
	store.set(FLAG_KEY, "1");
	assert.equal(isSplatPerfDebugEnabled(), true);
	store.set(FLAG_KEY, "0");
	assert.equal(
		isSplatPerfDebugEnabled(),
		false,
		"any value other than '1' should keep flag off",
	);
	restoreGlobals();
	console.log("  splat-perf-debug: localStorage-flag OK");
}

// ---------- tolerates missing localStorage ----------
{
	restoreGlobals();
	(globalThis as { localStorage?: unknown }).localStorage = {
		getItem() {
			throw new Error("localStorage unavailable");
		},
	};
	assert.equal(
		isSplatPerfDebugEnabled(),
		false,
		"thrown localStorage should not escape",
	);
	restoreGlobals();
	console.log("  splat-perf-debug: storage-error OK");
}

console.log("✅ CAMERA_FRAMES splat perf debug tests passed!");
