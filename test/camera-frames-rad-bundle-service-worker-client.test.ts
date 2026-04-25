import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

function createMockServiceWorkerEnvironment() {
	const calls = [];
	const listeners = new Map();
	function dispatchControllerChange() {
		listeners.get("controllerchange")?.();
	}
	const activeWorker = {
		state: "activated",
		scriptURL: "https://camera-frames.test/camera-frames-rad-bundle-sw.js",
		postMessage(message, transfer = []) {
			calls.push(["post-message", message?.type ?? null, "active"]);
			if (message?.type === "CLAIM_CLIENTS") {
				serviceWorker.controller = activeWorker;
				dispatchControllerChange();
			}
			const port = transfer[0];
			port?.postMessage?.({ ok: true });
			port?.close?.();
		},
		addEventListener() {},
		removeEventListener() {},
	};
	const registration = {
		active: activeWorker,
		waiting: null,
		installing: null,
		update: async () => {
			calls.push(["update"]);
			return registration;
		},
	};
	const serviceWorker = {
		controller: null,
		ready: Promise.resolve(registration),
		async register(url, options) {
			calls.push(["register", url, options?.scope ?? null]);
			return registration;
		},
		addEventListener(type, listener) {
			listeners.set(type, listener);
		},
		removeEventListener(type, listener) {
			if (listeners.get(type) === listener) {
				listeners.delete(type);
			}
		},
	};
	return {
		activeWorker,
		calls,
		serviceWorker,
	};
}

function createStaleController(calls) {
	return {
		state: "activated",
		scriptURL: "https://camera-frames.test/old-rad-bundle-sw.js",
		postMessage(message, transfer = []) {
			calls.push(["post-message", message?.type ?? null, "stale"]);
			const port = transfer[0];
			port?.postMessage?.({ ok: true });
			port?.close?.();
		},
		addEventListener() {},
		removeEventListener() {},
	};
}

function installBrowserGlobals(serviceWorker) {
	const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
	const originalNavigator = Object.getOwnPropertyDescriptor(
		globalThis,
		"navigator",
	);
	const originalFetch = Object.getOwnPropertyDescriptor(globalThis, "fetch");
	const fetchCalls = [];
	Object.defineProperty(globalThis, "window", {
		configurable: true,
		value: {
			isSecureContext: true,
			location: {
				origin: "https://camera-frames.test",
			},
		},
	});
	Object.defineProperty(globalThis, "navigator", {
		configurable: true,
		value: {
			serviceWorker,
		},
	});
	Object.defineProperty(globalThis, "fetch", {
		configurable: true,
		value: async (url, init = {}) => {
			fetchCalls.push([url, init?.headers?.Range ?? null]);
			return new Response(new Uint8Array([0x52, 0x41, 0x44, 0x30]), {
				status: 206,
				headers: {
					"Content-Range": "bytes 0-3/592",
					"Content-Type": "application/octet-stream",
				},
			});
		},
	});
	function restore() {
		if (originalWindow) {
			Object.defineProperty(globalThis, "window", originalWindow);
		} else {
			delete globalThis.window;
		}
		if (originalNavigator) {
			Object.defineProperty(globalThis, "navigator", originalNavigator);
		} else {
			delete globalThis.navigator;
		}
		if (originalFetch) {
			Object.defineProperty(globalThis, "fetch", originalFetch);
		} else {
			delete globalThis.fetch;
		}
	}
	return { fetchCalls, restore };
}

{
	const { activeWorker, calls, serviceWorker } =
		createMockServiceWorkerEnvironment();
	const { fetchCalls, restore } = installBrowserGlobals(serviceWorker);
	try {
		const { registerProjectRadBundle } = await import(
			"../src/engine/rad-bundle-service-worker-client.js"
		);
		const runtime = await registerProjectRadBundle({
			kind: "spark-rad-bundle",
			version: 1,
			root: {
				name: "asset.rad",
				blob: new Blob([new Uint8Array([1, 2, 3, 4])], {
					type: "application/octet-stream",
				}),
			},
			chunks: [],
		});
		assert.ok(runtime?.rootUrl.includes("/__cf_rad_bundle__/"));
		assert.equal(serviceWorker.controller, activeWorker);
		assert.deepEqual(fetchCalls, [[runtime.rootUrl, "bytes=0-3"]]);
		assert.deepEqual(
			calls.map((entry) => entry[0] === "post-message" ? entry[1] : entry[0]),
			["register", "update", "CLAIM_CLIENTS", "REGISTER_RAD_BUNDLE"],
		);
		assert.equal(
			calls.findIndex((entry) => entry[1] === "CLAIM_CLIENTS") <
				calls.findIndex((entry) => entry[1] === "REGISTER_RAD_BUNDLE"),
			true,
			"uncontrolled pages must be claimed before registering RAD bundle files",
		);
	} finally {
		restore();
	}
}

{
	const { serviceWorker } = createMockServiceWorkerEnvironment();
	const { restore } = installBrowserGlobals(serviceWorker);
	Object.defineProperty(globalThis, "fetch", {
		configurable: true,
		value: async () =>
			new Response(new TextEncoder().encode("<!DOCTYPE html>"), {
				status: 200,
				headers: {
					"Content-Type": "text/html",
				},
			}),
	});
	try {
		const { registerProjectRadBundle } = await import(
			"../src/engine/rad-bundle-service-worker-client.js"
		);
		await assert.rejects(
			() =>
				registerProjectRadBundle({
					kind: "spark-rad-bundle",
					version: 1,
					root: {
						name: "asset.rad",
						blob: new Blob([new Uint8Array([1, 2, 3, 4])], {
							type: "application/octet-stream",
						}),
					},
					chunks: [],
				}),
			/RAD bundle service worker returned non-RAD root data.*text\/html.*3c 21 44 4f/,
		);
	} finally {
		restore();
	}
}

{
	const { activeWorker, calls, serviceWorker } =
		createMockServiceWorkerEnvironment();
	serviceWorker.controller = createStaleController(calls);
	const { fetchCalls, restore } = installBrowserGlobals(serviceWorker);
	try {
		const { registerProjectRadBundle } = await import(
			"../src/engine/rad-bundle-service-worker-client.js"
		);
		const runtime = await registerProjectRadBundle({
			kind: "spark-rad-bundle",
			version: 1,
			root: {
				name: "asset.rad",
				blob: new Blob([new Uint8Array([1, 2, 3, 4])], {
					type: "application/octet-stream",
				}),
			},
			chunks: [],
		});
		assert.ok(runtime?.rootUrl.includes("/__cf_rad_bundle__/"));
		assert.equal(serviceWorker.controller, activeWorker);
		assert.deepEqual(fetchCalls, [[runtime.rootUrl, "bytes=0-3"]]);
		assert.deepEqual(
			calls
				.filter((entry) => entry[0] === "post-message")
				.map((entry) => [entry[1], entry[2]]),
			[
				["CLAIM_CLIENTS", "active"],
				["REGISTER_RAD_BUNDLE", "active"],
			],
		);
	} finally {
		restore();
	}
}

{
	const source = await readFile(
		new URL("../public/camera-frames-rad-bundle-sw.js", import.meta.url),
		"utf8",
	);
	assert.match(source, /data\.type === "CLAIM_CLIENTS"/);
	assert.match(source, /self\.clients\.claim\(\)/);
}

console.log("✅ CAMERA_FRAMES RAD bundle service worker client tests passed!");
