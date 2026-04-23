// Mock store factory for docs fixtures. Wraps the real createCameraFramesStore
// so shape-parity is guaranteed at build time — if the real store grows a new
// namespace or signal, fixtures either opt into it explicitly or inherit the
// default. Each call returns an independent store instance; do not share.

import { createCameraFramesStore } from "../../store.js";

/**
 * @typedef {ReturnType<typeof createCameraFramesStore>} CameraFramesStore
 */

/**
 * @typedef {Partial<Record<string, unknown>>} MockStoreOverrides
 *   Nested object whose leaves are the new values to assign to the matching
 *   signal's `.value`. Namespaces (e.g. `workspace`, `help`) recurse.
 *   Example: { help: { open: true, lang: "en" }, remoteUrl: "https://…" }.
 */

/**
 * Create a new mock store with optional partial overrides. Signals that are
 * not listed keep the real-store default.
 *
 * @param {MockStoreOverrides} [overrides]
 * @returns {CameraFramesStore}
 */
export function createMockStore(overrides = {}) {
	const store = createCameraFramesStore(null);
	applyOverrides(store, overrides, []);
	return store;
}

function applyOverrides(target, overrides, path) {
	for (const [key, value] of Object.entries(overrides)) {
		const nextPath = path.concat(key);
		const node = target?.[key];
		if (node == null) {
			throw new Error(`createMockStore: unknown path "${nextPath.join(".")}"`);
		}
		if (isSignalLike(node)) {
			assignSignalValue(node, value, nextPath);
			continue;
		}
		if (isPlainObject(node) && isPlainObject(value)) {
			applyOverrides(node, value, nextPath);
			continue;
		}
		throw new Error(
			`createMockStore: cannot assign "${nextPath.join(".")}" — target is neither a signal nor a namespace`,
		);
	}
}

function isSignalLike(node) {
	return (
		node !== null &&
		typeof node === "object" &&
		"value" in node &&
		typeof node.peek === "function"
	);
}

function isPlainObject(value) {
	if (value === null || typeof value !== "object") return false;
	if (Array.isArray(value)) return false;
	const proto = Object.getPrototypeOf(value);
	return proto === Object.prototype || proto === null;
}

function assignSignalValue(node, value, path) {
	try {
		node.value = value;
	} catch (error) {
		const reason = error instanceof Error ? error.message : String(error);
		throw new Error(
			`createMockStore: cannot assign to "${path.join(".")}" (computed or read-only): ${reason}`,
		);
	}
}
