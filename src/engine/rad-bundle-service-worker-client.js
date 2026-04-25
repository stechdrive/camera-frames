const RAD_BUNDLE_ROUTE_PREFIX = "__cf_rad_bundle__";
const BASE_URL =
	typeof import.meta.env?.BASE_URL === "string"
		? import.meta.env.BASE_URL
		: "/";
const SERVICE_WORKER_URL = `${BASE_URL}camera-frames-rad-bundle-sw.js`;
const SERVICE_WORKER_SCOPE = BASE_URL || "/";

function hasServiceWorkerSupport() {
	return (
		typeof window !== "undefined" &&
		typeof navigator !== "undefined" &&
		"serviceWorker" in navigator &&
		window.isSecureContext === true
	);
}

function createToken() {
	if (typeof globalThis.crypto?.randomUUID === "function") {
		return globalThis.crypto.randomUUID();
	}
	return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function normalizeEntryName(value, fallback) {
	const normalized = String(value ?? "")
		.replace(/\\/g, "/")
		.split("/")
		.filter(Boolean)
		.join("/");
	return normalized || fallback;
}

function buildRouteUrl(token, entryName) {
	const basePath = SERVICE_WORKER_SCOPE.endsWith("/")
		? SERVICE_WORKER_SCOPE
		: `${SERVICE_WORKER_SCOPE}/`;
	const encodedName = normalizeEntryName(entryName, "asset.rad")
		.split("/")
		.map((part) => encodeURIComponent(part))
		.join("/");
	return new URL(
		`${basePath}${RAD_BUNDLE_ROUTE_PREFIX}/${encodeURIComponent(token)}/${encodedName}`,
		window.location.origin,
	).toString();
}

async function waitForController(timeoutMs = 5000) {
	if (navigator.serviceWorker.controller) {
		return navigator.serviceWorker.controller;
	}
	return await new Promise((resolve, reject) => {
		const timeout = setTimeout(() => {
			navigator.serviceWorker.removeEventListener(
				"controllerchange",
				onControllerChange,
			);
			reject(new Error("RAD bundle service worker did not control the page."));
		}, timeoutMs);
		function onControllerChange() {
			const controller = navigator.serviceWorker.controller;
			if (!controller) {
				return;
			}
			clearTimeout(timeout);
			navigator.serviceWorker.removeEventListener(
				"controllerchange",
				onControllerChange,
			);
			resolve(controller);
		}
		navigator.serviceWorker.addEventListener(
			"controllerchange",
			onControllerChange,
		);
	});
}

async function postServiceWorkerMessage(message, transfer = []) {
	const registration = await navigator.serviceWorker.ready;
	const target =
		navigator.serviceWorker.controller ||
		registration.active ||
		registration.waiting ||
		registration.installing;
	if (!target) {
		throw new Error("RAD bundle service worker is not active.");
	}
	const channel = new MessageChannel();
	const response = new Promise((resolve, reject) => {
		const timeout = setTimeout(() => {
			reject(new Error("RAD bundle service worker message timed out."));
		}, 5000);
		channel.port1.onmessage = (event) => {
			clearTimeout(timeout);
			const data = event.data ?? {};
			if (data.ok) {
				resolve(data);
			} else {
				reject(new Error(data.error || "RAD bundle service worker failed."));
			}
		};
	});
	target.postMessage(message, [channel.port2, ...transfer]);
	return await response;
}

async function ensureRadBundleServiceWorker() {
	if (!hasServiceWorkerSupport()) {
		throw new Error(
			"Service Worker is unavailable for embedded RAD streaming.",
		);
	}
	await navigator.serviceWorker.register(SERVICE_WORKER_URL, {
		scope: SERVICE_WORKER_SCOPE,
	});
	await navigator.serviceWorker.ready;
	await waitForController();
}

function getEntryBlob(entry) {
	if (entry?.blob instanceof Blob) {
		return entry.blob;
	}
	if (entry?.bytes instanceof Uint8Array) {
		return new Blob([entry.bytes], { type: "application/octet-stream" });
	}
	return null;
}

export async function registerProjectRadBundle(radBundle) {
	if (!radBundle || typeof radBundle !== "object") {
		return null;
	}
	const rootBlob = getEntryBlob(radBundle.root);
	if (!rootBlob) {
		return null;
	}
	await ensureRadBundleServiceWorker();
	const token = createToken();
	const rootName = normalizeEntryName(
		radBundle.root?.name ?? radBundle.root?.path,
		"root.rad",
	);
	const files = [
		{
			name: rootName,
			blob: rootBlob,
			size: rootBlob.size,
			type: rootBlob.type || "application/octet-stream",
		},
	];
	for (const [index, chunk] of (radBundle.chunks ?? []).entries()) {
		const blob = getEntryBlob(chunk);
		if (!blob) {
			continue;
		}
		files.push({
			name: normalizeEntryName(
				chunk.name ?? chunk.path,
				`chunk-${index + 1}.radc`,
			),
			blob,
			size: blob.size,
			type: blob.type || "application/octet-stream",
		});
	}
	await postServiceWorkerMessage({
		type: "REGISTER_RAD_BUNDLE",
		token,
		files,
	});
	return {
		token,
		rootUrl: buildRouteUrl(token, rootName),
		async unregister() {
			try {
				await postServiceWorkerMessage({
					type: "UNREGISTER_RAD_BUNDLE",
					token,
				});
			} catch {
				// Best-effort cleanup. A lost service worker map only drops cache.
			}
		},
	};
}
