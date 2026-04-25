function createAbortError() {
	if (typeof DOMException === "function") {
		return new DOMException("RAD bundle generation was aborted.", "AbortError");
	}
	const error = new Error("RAD bundle generation was aborted.");
	error.name = "AbortError";
	return error;
}

function createRadBuildError(data) {
	const error = new Error(data?.message || "RAD bundle generation failed.");
	if (typeof data?.name === "string" && data.name) {
		error.name = data.name;
	}
	if (typeof data?.stack === "string" && data.stack) {
		error.stack = data.stack;
	}
	return error;
}

export function supportsSparkRadBundleBuild() {
	return (
		typeof Worker === "function" &&
		typeof WebAssembly === "object" &&
		typeof URL === "function"
	);
}

export async function buildSparkRadBundleFromPackedSplats(
	input,
	{ onProgress = null, signal = null } = {},
) {
	if (!supportsSparkRadBundleBuild()) {
		throw new Error(
			"Spark RAD bundle generation requires browser module workers and WebAssembly.",
		);
	}
	if (signal?.aborted) {
		throw createAbortError();
	}
	const worker = new Worker(new URL("./rad-build.worker.js", import.meta.url), {
		type: "module",
		name: "camera-frames-rad-build",
	});
	let settled = false;

	return await new Promise((resolve, reject) => {
		function cleanup() {
			if (settled) {
				return;
			}
			settled = true;
			signal?.removeEventListener?.("abort", onAbort);
			worker.terminate();
		}
		function onAbort() {
			cleanup();
			reject(createAbortError());
		}
		worker.onmessage = (event) => {
			const data = event.data ?? {};
			if (data.type === "progress") {
				onProgress?.(data.progress ?? {});
				return;
			}
			if (data.type === "result") {
				cleanup();
				resolve(data.result);
				return;
			}
			if (data.type === "error") {
				cleanup();
				reject(createRadBuildError(data.error));
			}
		};
		worker.onerror = (event) => {
			cleanup();
			reject(
				new Error(
					event?.message || "RAD bundle generation worker failed to load.",
				),
			);
		};
		signal?.addEventListener?.("abort", onAbort, { once: true });
		try {
			worker.postMessage({ type: "build", input });
		} catch (error) {
			cleanup();
			reject(error);
		}
	});
}
