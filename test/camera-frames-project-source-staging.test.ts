import assert from "node:assert/strict";
import {
	PROJECT_SOURCE_STAGING_CLEANUP_MAX_AGE_MS,
	cleanupStaleProjectOpenSources,
	isMobileProjectSourceStagingPlatform,
	isProjectSourceStagingRequiredError,
	prepareStableProjectOpenSource,
} from "../src/controllers/project/source-staging.js";

const ANDROID_PLATFORM = {
	userAgent: "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/147",
	maxTouchPoints: 5,
};
const ANDROID_DESKTOP_SITE_PLATFORM = {
	userAgent:
		"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/147 Safari/537.36",
	maxTouchPoints: 5,
};
const DESKTOP_PLATFORM = {
	userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
	maxTouchPoints: 0,
};

function createFakeOpfsStorage({
	quota = 1024 * 1024 * 1024,
	usage = 0,
	entries = [],
} = {}) {
	const records = new Map(
		entries.map((entry) => [
			entry.name,
			{
				chunks: entry.parts ?? [new Uint8Array()],
				lastModified: Number.isFinite(entry.lastModified)
					? entry.lastModified
					: Date.now(),
			},
		]),
	);
	const removed = [];
	const written = [];
	const createFileHandle = (name) => ({
		kind: "file",
		name,
		async createWritable() {
			const chunks = [];
			return new WritableStream({
				write(chunk) {
					written.push(name);
					if (chunk instanceof Uint8Array) {
						chunks.push(chunk.slice());
					} else if (chunk instanceof ArrayBuffer) {
						chunks.push(chunk.slice(0));
					} else {
						chunks.push(chunk);
					}
				},
				close() {
					records.set(name, {
						chunks,
						lastModified: Date.now(),
					});
				},
			});
		},
		async getFile() {
			const record = records.get(name);
			if (!record) {
				throw new Error(`Missing staged file ${name}`);
			}
			return new File(record.chunks, name, {
				type: "application/x-camera-frames-project",
				lastModified: record.lastModified,
			});
		},
	});
	const directory = {
		async getFileHandle(name) {
			return createFileHandle(name);
		},
		async *entries() {
			for (const name of records.keys()) {
				yield [name, createFileHandle(name)];
			}
		},
		async removeEntry(name) {
			removed.push(name);
			records.delete(name);
		},
	};
	return {
		records,
		removed,
		written,
		storage: {
			async estimate() {
				return { quota, usage };
			},
			async getDirectory() {
				return {
					async getDirectoryHandle() {
						return directory;
					},
				};
			},
		},
	};
}

class NoArrayBufferFile extends File {
	constructor(parts, name, state = {}) {
		super(parts, name, { type: "application/x-camera-frames-project" });
		this.state = state;
	}

	async arrayBuffer() {
		this.state.arrayBufferCalls = (this.state.arrayBufferCalls ?? 0) + 1;
		throw new Error("arrayBuffer should not be used");
	}
}

class HugeProjectBlob extends Blob {
	get size() {
		return 300 * 1024 * 1024;
	}
}

assert.equal(
	isMobileProjectSourceStagingPlatform(ANDROID_PLATFORM),
	true,
	"Android should enable mobile project source staging",
);
assert.equal(
	isMobileProjectSourceStagingPlatform({
		userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)",
		maxTouchPoints: 5,
	}),
	true,
	"iPadOS desktop-style user agents should enable mobile staging",
);
assert.equal(
	isMobileProjectSourceStagingPlatform(DESKTOP_PLATFORM),
	false,
	"desktop browsers should not stage by default",
);
assert.equal(
	isMobileProjectSourceStagingPlatform({
		userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
		maxTouchPoints: 0,
		userAgentDataMobile: true,
		userAgentDataPlatform: "Android",
	}),
	true,
	"UA Client Hints should enable staging even if the legacy UA is desktop-like",
);

{
	const opfs = createFakeOpfsStorage();
	const sourceState = {};
	const source = new NoArrayBufferFile(
		[new Uint8Array([1, 2, 3, 4])],
		"drive-project.ssproj",
		sourceState,
	);
	const progress = [];
	const result = await prepareStableProjectOpenSource(source, {
		fileName: source.name,
		platform: ANDROID_PLATFORM,
		storage: opfs.storage,
		onProgress: (payload) => progress.push(payload),
	});

	assert.equal(result.mode, "opfs");
	assert.notEqual(result.source, source);
	assert.equal(sourceState.arrayBufferCalls ?? 0, 0);
	assert.deepEqual(
		Array.from(new Uint8Array(await result.source.arrayBuffer())),
		[1, 2, 3, 4],
	);
	assert.ok(
		progress.some(
			(payload) => payload.stage === "prepare-local-project-source",
		),
	);
	assert.ok(
		progress.some((payload) => payload.stage === "copy-local-project-source"),
	);
	assert.ok(
		progress.some(
			(payload) => payload.stage === "complete-local-project-source",
		),
	);
	assert.equal(opfs.written.length > 0, true);
	await result.cleanup?.();
	await result.cleanup?.();
	assert.equal(opfs.removed.length, 1);
}

{
	const now = 1_700_000_000_000;
	const oldName = "old-cloud-project-a1b2c3.ssproj";
	const freshName = "fresh-cloud-project-d4e5f6.ssproj";
	const opfs = createFakeOpfsStorage({
		entries: [
			{
				name: oldName,
				parts: [new Uint8Array([1])],
				lastModified: now - PROJECT_SOURCE_STAGING_CLEANUP_MAX_AGE_MS - 1,
			},
			{
				name: freshName,
				parts: [new Uint8Array([2])],
				lastModified: now - 1000,
			},
			{
				name: "unrelated.txt",
				parts: [new Uint8Array([3])],
				lastModified: now - PROJECT_SOURCE_STAGING_CLEANUP_MAX_AGE_MS - 1,
			},
		],
	});
	const summary = await cleanupStaleProjectOpenSources({
		storage: opfs.storage,
		now,
	});
	assert.equal(summary.checked, 3);
	assert.equal(summary.removed, 1);
	assert.equal(summary.skipped, 2);
	assert.deepEqual(opfs.removed, [oldName]);
}

{
	const opfs = createFakeOpfsStorage();
	const source = new File(
		[new Uint8Array([4, 3, 2, 1])],
		"desktop-site.ssproj",
	);
	const result = await prepareStableProjectOpenSource(source, {
		fileName: source.name,
		platform: ANDROID_DESKTOP_SITE_PLATFORM,
		storage: opfs.storage,
	});
	assert.equal(
		result.mode,
		"opfs",
		"touch desktop-like UA without a File System Access handle should still stage cloud-prone project files",
	);
	await result.cleanup?.();
}

{
	const opfs = createFakeOpfsStorage();
	const source = new File(
		[new Uint8Array([4, 3, 2, 1])],
		"stable-handle.ssproj",
	);
	const result = await prepareStableProjectOpenSource(source, {
		fileName: source.name,
		platform: ANDROID_DESKTOP_SITE_PLATFORM,
		storage: opfs.storage,
		hasFileSystemHandle: true,
	});
	assert.equal(
		result.mode,
		"none",
		"desktop-like touch browsers with a File System Access handle should keep the stable desktop path",
	);
	assert.equal(opfs.written.length, 0);
}

{
	const opfs = createFakeOpfsStorage();
	const source = new File([new Uint8Array([6, 6, 6])], "windows-touch.ssproj");
	const result = await prepareStableProjectOpenSource(source, {
		fileName: source.name,
		platform: {
			userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
			maxTouchPoints: 10,
		},
		storage: opfs.storage,
	});
	assert.equal(
		result.mode,
		"none",
		"Windows touch PCs should not be treated as cloud-prone mobile project opens by default",
	);
	assert.equal(opfs.written.length, 0);
}

{
	const opfs = createFakeOpfsStorage({ quota: 1, usage: 0 });
	const source = new File(
		[new Uint8Array([1, 2, 3, 4])],
		"quota-estimate.ssproj",
	);
	const result = await prepareStableProjectOpenSource(source, {
		fileName: source.name,
		platform: ANDROID_PLATFORM,
		storage: opfs.storage,
	});
	assert.equal(
		result.mode,
		"opfs",
		"mobile staging should attempt the OPFS write instead of rejecting on a conservative quota estimate",
	);
	assert.equal(opfs.written.length > 0, true);
	await result.cleanup?.();
}

{
	const source = new File([new Uint8Array([5, 6, 7])], "small.ssproj");
	const result = await prepareStableProjectOpenSource(source, {
		fileName: source.name,
		platform: ANDROID_PLATFORM,
		storage: null,
	});
	assert.equal(result.mode, "memory");
	assert.notEqual(result.source, source);
	assert.deepEqual(
		Array.from(new Uint8Array(await result.source.arrayBuffer())),
		[5, 6, 7],
	);
}

{
	const source = new HugeProjectBlob([new Uint8Array([8, 9])], {
		type: "application/x-camera-frames-project",
	});
	const progress = [];
	await assert.rejects(
		prepareStableProjectOpenSource(source, {
			fileName: "huge.ssproj",
			platform: ANDROID_PLATFORM,
			storage: null,
			memoryLimitBytes: 256 * 1024 * 1024,
			onProgress: (payload) => progress.push(payload),
		}),
		(error) => {
			assert.equal(isProjectSourceStagingRequiredError(error), true);
			assert.equal(error.reason, "staging-unavailable-large-file");
			return true;
		},
	);
	assert.ok(
		progress.some((payload) => payload.stage === "fail-local-project-source"),
	);
}

{
	const sourceState = {};
	const source = new NoArrayBufferFile(
		[new Uint8Array([12, 13])],
		"small-memory-fails.ssproj",
		sourceState,
	);
	await assert.rejects(
		prepareStableProjectOpenSource(source, {
			fileName: source.name,
			platform: ANDROID_PLATFORM,
			storage: null,
		}),
		(error) => {
			assert.equal(isProjectSourceStagingRequiredError(error), true);
			assert.equal(error.reason, "memory-copy-failed");
			return true;
		},
	);
	assert.equal(sourceState.arrayBufferCalls, 1);
}

{
	const opfs = createFakeOpfsStorage();
	const source = new File([new Uint8Array([10])], "off.ssproj");
	const result = await prepareStableProjectOpenSource(source, {
		fileName: source.name,
		platform: ANDROID_PLATFORM,
		storage: opfs.storage,
		search: "?cfProjectSourceStaging=off",
	});
	assert.equal(result.mode, "none");
	assert.equal(result.source, source);
	assert.equal(opfs.written.length, 0);
}

{
	const opfs = createFakeOpfsStorage();
	const source = new File([new Uint8Array([11])], "forced.ssproj");
	const result = await prepareStableProjectOpenSource(source, {
		fileName: source.name,
		platform: DESKTOP_PLATFORM,
		storage: opfs.storage,
		search: "?cfProjectSourceStaging=on",
	});
	assert.equal(result.mode, "opfs");
	await result.cleanup?.();
}

console.log("✅ CAMERA_FRAMES project source staging tests passed!");
