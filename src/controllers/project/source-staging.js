import {
	PROJECT_PICKER_MIME,
	ensureProjectFileName,
} from "./picker-options.js";

export const PROJECT_SOURCE_STAGING_MEMORY_LIMIT_BYTES = 256 * 1024 * 1024;
export const PROJECT_SOURCE_STAGING_CLEANUP_MAX_AGE_MS = 24 * 60 * 60 * 1000;

const PROJECT_SOURCE_STAGING_DIR = "camera-frames-project-open-staging";
const STAGING_OVERRIDE_PARAM = "cfProjectSourceStaging";

function getDefaultPlatform() {
	return {
		userAgent: globalThis.navigator?.userAgent ?? "",
		maxTouchPoints: globalThis.navigator?.maxTouchPoints ?? 0,
	};
}

export function isMobileProjectSourceStagingPlatform(
	platform = getDefaultPlatform(),
) {
	const userAgent = String(platform?.userAgent ?? "");
	const maxTouchPoints = Number(platform?.maxTouchPoints ?? 0);
	return (
		/Android|iPhone|iPad|iPod/iu.test(userAgent) ||
		(/Macintosh/iu.test(userAgent) && maxTouchPoints > 1)
	);
}

function getProjectSourceStagingOverride(search) {
	const rawSearch =
		typeof search === "string" ? search : (globalThis.location?.search ?? "");
	try {
		const value = new URLSearchParams(rawSearch)
			.get(STAGING_OVERRIDE_PARAM)
			?.trim()
			.toLowerCase();
		return value === "on" || value === "off" ? value : "auto";
	} catch {
		return "auto";
	}
}

function shouldStageProjectSource(source, { platform, search }) {
	if (!(source instanceof Blob)) {
		return false;
	}
	const override = getProjectSourceStagingOverride(search);
	if (override === "off") {
		return false;
	}
	if (override === "on") {
		return true;
	}
	return isMobileProjectSourceStagingPlatform(platform);
}

function normalizeStagingFileName(fileName) {
	return ensureProjectFileName(fileName || "camera-frames-project.ssproj");
}

function buildOpfsStagingFileName(fileName) {
	const safeStem = normalizeStagingFileName(fileName)
		.replace(/\.ssproj$/iu, "")
		.replace(/[^a-z0-9._-]+/giu, "-")
		.replace(/^-+|-+$/gu, "")
		.slice(0, 80);
	const suffix = `${Date.now().toString(36)}-${Math.random()
		.toString(36)
		.slice(2, 10)}`;
	return `${safeStem || "project"}-${suffix}.ssproj`;
}

async function getOpfsStagingDirectory(storage, { create = false } = {}) {
	const root = await storage.getDirectory();
	return await root.getDirectoryHandle(PROJECT_SOURCE_STAGING_DIR, {
		create,
	});
}

function isNotFoundError(error) {
	return (
		error?.name === "NotFoundError" ||
		error?.name === "NotFound" ||
		error?.code === 8
	);
}

function getDirectoryEntries(directory) {
	if (typeof directory?.entries === "function") {
		return directory.entries();
	}
	if (typeof directory?.[Symbol.asyncIterator] === "function") {
		return directory[Symbol.asyncIterator]();
	}
	return null;
}

function isStaleStagingFile(name, file, { now, maxAgeMs }) {
	if (!/\.ssproj$/iu.test(String(name ?? ""))) {
		return false;
	}
	if (!Number.isFinite(maxAgeMs) || maxAgeMs < 0) {
		return false;
	}
	if (maxAgeMs === 0) {
		return true;
	}
	const lastModified = Number(file?.lastModified);
	if (!Number.isFinite(lastModified) || lastModified <= 0) {
		return false;
	}
	return now - lastModified >= maxAgeMs;
}

function createNamedProjectBlob(parts, fileName, source) {
	const options = {
		type: source?.type || PROJECT_PICKER_MIME,
		lastModified: Number.isFinite(source?.lastModified)
			? source.lastModified
			: Date.now(),
	};
	if (typeof File === "function") {
		return new File(parts, normalizeStagingFileName(fileName), options);
	}
	const blob = new Blob(parts, { type: options.type });
	Object.defineProperty(blob, "name", {
		configurable: true,
		value: normalizeStagingFileName(fileName),
	});
	Object.defineProperty(blob, "lastModified", {
		configurable: true,
		value: options.lastModified,
	});
	return blob;
}

function getChunkByteLength(chunk) {
	if (chunk instanceof ArrayBuffer) {
		return chunk.byteLength;
	}
	if (ArrayBuffer.isView(chunk)) {
		return chunk.byteLength;
	}
	if (chunk instanceof Blob) {
		return chunk.size;
	}
	if (typeof chunk === "string") {
		return new TextEncoder().encode(chunk).byteLength;
	}
	return 0;
}

async function notifyStagingProgress(onProgress, payload) {
	if (typeof onProgress !== "function") {
		return;
	}
	await onProgress({
		phase: "verify",
		...payload,
	});
}

function createCopyProgressTransform({ totalBytes, onProgress, mode }) {
	let bytesCopied = 0;
	let lastPercent = -1;
	let lastReportAt = 0;
	async function report(force = false) {
		const percent =
			totalBytes > 0
				? Math.max(
						0,
						Math.min(100, Math.round((bytesCopied / totalBytes) * 100)),
					)
				: null;
		const now =
			typeof globalThis.performance?.now === "function"
				? globalThis.performance.now()
				: Date.now();
		if (
			!force &&
			percent === lastPercent &&
			now - lastReportAt < 250 &&
			bytesCopied < totalBytes
		) {
			return;
		}
		lastPercent = percent ?? lastPercent;
		lastReportAt = now;
		await notifyStagingProgress(onProgress, {
			stage: "copy-local-project-source",
			sourceStagingMode: mode,
			bytesCopied,
			totalBytes,
			percent,
		});
	}

	return new TransformStream({
		async transform(chunk, controller) {
			bytesCopied += getChunkByteLength(chunk);
			await report(false);
			controller.enqueue(chunk);
		},
		async flush() {
			if (bytesCopied !== totalBytes) {
				bytesCopied = totalBytes;
			}
			await report(true);
		},
	});
}

async function assertOpfsQuota(storage, sourceSize) {
	if (!Number.isFinite(sourceSize) || sourceSize <= 0) {
		return;
	}
	if (typeof storage?.estimate !== "function") {
		return;
	}
	const estimate = await storage.estimate();
	const quota = Number(estimate?.quota);
	const usage = Number(estimate?.usage);
	if (!Number.isFinite(quota) || !Number.isFinite(usage)) {
		return;
	}
	if (quota - usage < sourceSize) {
		const error = new Error("Insufficient browser storage quota for staging.");
		error.name = "QuotaExceededError";
		throw error;
	}
}

async function copySourceToOpfs(source, { fileName, storage, onProgress }) {
	if (typeof storage?.getDirectory !== "function") {
		throw new Error("OPFS is unavailable.");
	}
	if (typeof source?.stream !== "function") {
		throw new Error("Blob stream() is unavailable.");
	}
	await assertOpfsQuota(storage, source.size);
	await notifyStagingProgress(onProgress, {
		stage: "prepare-local-project-source",
		sourceStagingMode: "opfs",
		totalBytes: source.size,
	});
	const directory = await getOpfsStagingDirectory(storage, { create: true });
	const stagedName = buildOpfsStagingFileName(fileName);
	const fileHandle = await directory.getFileHandle(stagedName, {
		create: true,
	});
	const writable = await fileHandle.createWritable();
	try {
		await source
			.stream()
			.pipeThrough(
				createCopyProgressTransform({
					totalBytes: source.size,
					onProgress,
					mode: "opfs",
				}),
			)
			.pipeTo(writable);
	} catch (error) {
		try {
			await writable.abort?.();
		} catch {
			// Ignore cleanup errors after a failed staging write.
		}
		try {
			await directory.removeEntry(stagedName);
		} catch {
			// Ignore missing partial staging files.
		}
		throw error;
	}
	const stagedFile = await fileHandle.getFile();
	await notifyStagingProgress(onProgress, {
		stage: "complete-local-project-source",
		sourceStagingMode: "opfs",
		bytesCopied: source.size,
		totalBytes: source.size,
		percent: 100,
	});
	let cleaned = false;
	const cleanup = async () => {
		if (cleaned) {
			return;
		}
		cleaned = true;
		try {
			await directory.removeEntry(stagedName);
		} catch {
			// OPFS staging is best-effort cleanup.
		}
	};
	return {
		source: stagedFile,
		mode: "opfs",
		cleanup,
		warning: null,
	};
}

export async function cleanupStaleProjectOpenSources({
	storage = globalThis.navigator?.storage,
	now = Date.now(),
	maxAgeMs = PROJECT_SOURCE_STAGING_CLEANUP_MAX_AGE_MS,
} = {}) {
	const summary = {
		checked: 0,
		removed: 0,
		skipped: 0,
		failed: 0,
		unavailable: false,
	};
	if (typeof storage?.getDirectory !== "function") {
		summary.unavailable = true;
		return summary;
	}

	let directory = null;
	try {
		directory = await getOpfsStagingDirectory(storage, { create: false });
	} catch (error) {
		if (!isNotFoundError(error)) {
			summary.failed += 1;
			summary.unavailable = true;
		}
		return summary;
	}

	const entries = getDirectoryEntries(directory);
	if (!entries) {
		summary.unavailable = true;
		return summary;
	}

	for await (const [name, handle] of entries) {
		summary.checked += 1;
		try {
			if (handle?.kind && handle.kind !== "file") {
				summary.skipped += 1;
				continue;
			}
			if (typeof handle?.getFile !== "function") {
				summary.skipped += 1;
				continue;
			}
			const file = await handle.getFile();
			if (!isStaleStagingFile(name, file, { now, maxAgeMs })) {
				summary.skipped += 1;
				continue;
			}
			await directory.removeEntry(name);
			summary.removed += 1;
		} catch {
			summary.failed += 1;
		}
	}

	return summary;
}

async function copySourceToMemory(source, { fileName, onProgress }) {
	await notifyStagingProgress(onProgress, {
		stage: "prepare-local-project-source",
		sourceStagingMode: "memory",
		totalBytes: source.size,
	});
	await notifyStagingProgress(onProgress, {
		stage: "copy-local-project-source",
		sourceStagingMode: "memory",
		bytesCopied: 0,
		totalBytes: source.size,
		percent: null,
	});
	const bytes = await source.arrayBuffer();
	const stagedFile = createNamedProjectBlob([bytes], fileName, source);
	await notifyStagingProgress(onProgress, {
		stage: "complete-local-project-source",
		sourceStagingMode: "memory",
		bytesCopied: source.size,
		totalBytes: source.size,
		percent: 100,
	});
	return {
		source: stagedFile,
		mode: "memory",
		cleanup: null,
		warning: null,
	};
}

async function returnOriginalWithWarning(source, { onProgress, reason }) {
	await notifyStagingProgress(onProgress, {
		stage: "warn-local-project-source",
		sourceStagingMode: "original-with-warning",
		warningReason: reason,
		totalBytes: source?.size ?? 0,
	});
	return {
		source,
		mode: "original-with-warning",
		cleanup: null,
		warning: "status.projectSourceStagingUnavailable",
	};
}

export async function prepareStableProjectOpenSource(
	source,
	{
		fileName = "",
		platform = getDefaultPlatform(),
		search = globalThis.location?.search ?? "",
		storage = globalThis.navigator?.storage,
		onProgress = null,
		memoryLimitBytes = PROJECT_SOURCE_STAGING_MEMORY_LIMIT_BYTES,
	} = {},
) {
	if (!shouldStageProjectSource(source, { platform, search })) {
		return {
			source,
			mode: "none",
			cleanup: null,
			warning: null,
		};
	}

	try {
		return await copySourceToOpfs(source, { fileName, storage, onProgress });
	} catch {
		// Fall back below. Cloud-backed providers can fail any individual read, so
		// staging must be best-effort and never make opening worse.
	}

	if (source.size <= memoryLimitBytes) {
		try {
			return await copySourceToMemory(source, { fileName, onProgress });
		} catch {
			return await returnOriginalWithWarning(source, {
				onProgress,
				reason: "memory-copy-failed",
			});
		}
	}

	return await returnOriginalWithWarning(source, {
		onProgress,
		reason: "staging-unavailable-large-file",
	});
}
