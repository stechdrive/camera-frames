const ROUTE_PREFIX = "/__cf_rad_bundle__/";
const bundles = new Map();

self.addEventListener("install", (event) => {
	event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
	event.waitUntil(self.clients.claim());
});

self.addEventListener("message", (event) => {
	const data = event.data ?? {};
	const port = event.ports?.[0] ?? null;
	try {
		if (data.type === "REGISTER_RAD_BUNDLE") {
			const token = String(data.token ?? "");
			if (!token) {
				throw new Error("Missing RAD bundle token.");
			}
			const files = new Map();
			for (const entry of data.files ?? []) {
				const name = normalizeName(entry?.name);
				if (!name || !(entry?.blob instanceof Blob)) {
					continue;
				}
				files.set(name, {
					blob: entry.blob,
					type: entry.type || entry.blob.type || "application/octet-stream",
				});
			}
			if (files.size === 0) {
				throw new Error("RAD bundle has no readable files.");
			}
			bundles.set(token, files);
			port?.postMessage({ ok: true });
			return;
		}
		if (data.type === "UNREGISTER_RAD_BUNDLE") {
			bundles.delete(String(data.token ?? ""));
			port?.postMessage({ ok: true });
			return;
		}
		port?.postMessage({ ok: false, error: "Unknown RAD bundle message." });
	} catch (error) {
		port?.postMessage({
			ok: false,
			error: error?.message ?? String(error),
		});
	}
});

self.addEventListener("fetch", (event) => {
	const url = new URL(event.request.url);
	const routeIndex = url.pathname.indexOf(ROUTE_PREFIX);
	if (routeIndex < 0) {
		return;
	}
	event.respondWith(handleRadBundleFetch(event.request, url, routeIndex));
});

function normalizeName(value) {
	return String(value ?? "")
		.replace(/\\/g, "/")
		.split("/")
		.filter(Boolean)
		.join("/");
}

function parseRoute(url, routeIndex) {
	const tail = url.pathname.slice(routeIndex + ROUTE_PREFIX.length);
	const parts = tail.split("/").filter(Boolean);
	const token = decodeURIComponent(parts.shift() ?? "");
	const name = normalizeName(
		parts.map((part) => decodeURIComponent(part)).join("/"),
	);
	return { token, name };
}

function parseRange(value, size) {
	if (!value) {
		return null;
	}
	const match = /^bytes=(\d*)-(\d*)$/i.exec(value.trim());
	if (!match) {
		return null;
	}
	let start = match[1] === "" ? null : Number(match[1]);
	let end = match[2] === "" ? null : Number(match[2]);
	if (start === null && end === null) {
		return null;
	}
	if (start === null) {
		const suffixLength = Math.max(0, end ?? 0);
		start = Math.max(0, size - suffixLength);
		end = size - 1;
	} else if (end === null || end >= size) {
		end = size - 1;
	}
	if (
		!Number.isFinite(start) ||
		!Number.isFinite(end) ||
		start < 0 ||
		end < start ||
		start >= size
	) {
		return null;
	}
	return { start, end };
}

async function handleRadBundleFetch(request, url, routeIndex) {
	const { token, name } = parseRoute(url, routeIndex);
	const entry = bundles.get(token)?.get(name);
	if (!entry) {
		return new Response("RAD bundle entry not found", { status: 404 });
	}
	const { blob, type } = entry;
	const size = blob.size;
	const headers = new Headers({
		"Accept-Ranges": "bytes",
		"Content-Type": type,
		"Cache-Control": "no-store",
	});
	const range = parseRange(request.headers.get("Range"), size);
	if (range) {
		const { start, end } = range;
		headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
		headers.set("Content-Length", String(end - start + 1));
		return new Response(
			request.method === "HEAD" ? null : blob.slice(start, end + 1, type),
			{ status: 206, headers },
		);
	}
	headers.set("Content-Length", String(size));
	return new Response(request.method === "HEAD" ? null : blob, {
		status: 200,
		headers,
	});
}
