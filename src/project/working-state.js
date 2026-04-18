const WORKING_STATE_DB = "camera-frames-working-state";
const WORKING_STATE_STORE = "projects";
const WORKING_STATE_FORMAT = "camera-frames-working-state";
const WORKING_STATE_VERSION = 1;
const MAX_WORKING_PROJECTS = 16;
const MAX_WORKING_STATE_BYTES = 512 * 1024 * 1024;

function supportsIndexedDb() {
	return typeof globalThis.indexedDB !== "undefined";
}

function openWorkingStateDatabase() {
	return new Promise((resolve, reject) => {
		if (!supportsIndexedDb()) {
			reject(
				new Error("Working save storage is not supported in this browser."),
			);
			return;
		}

		const request = globalThis.indexedDB.open(WORKING_STATE_DB, 1);
		request.onerror = () =>
			reject(
				request.error ?? new Error("Failed to open working save storage."),
			);
		request.onupgradeneeded = () => {
			const database = request.result;
			if (!database.objectStoreNames.contains(WORKING_STATE_STORE)) {
				database.createObjectStore(WORKING_STATE_STORE, {
					keyPath: "projectId",
				});
			}
		};
		request.onsuccess = () => resolve(request.result);
	});
}

function runStoreRequest(mode, callback) {
	return openWorkingStateDatabase().then(
		(database) =>
			new Promise((resolve, reject) => {
				const transaction = database.transaction(WORKING_STATE_STORE, mode);
				const store = transaction.objectStore(WORKING_STATE_STORE);
				let request = null;

				try {
					request = callback(store);
				} catch (error) {
					database.close();
					reject(error);
					return;
				}

				transaction.onabort = () => {
					database.close();
					reject(
						transaction.error ?? new Error("Working save transaction failed."),
					);
				};
				transaction.onerror = () => {
					database.close();
					reject(
						transaction.error ?? new Error("Working save transaction failed."),
					);
				};
				transaction.oncomplete = () => {
					const result = request?.result ?? null;
					database.close();
					resolve(result);
				};
			}),
	);
}

function normalizeWorkingStateRecord(record = {}) {
	return {
		format: WORKING_STATE_FORMAT,
		version: WORKING_STATE_VERSION,
		projectId: String(record.projectId ?? "").trim(),
		projectName: String(record.projectName ?? "").trim(),
		savedAt: String(record.savedAt ?? new Date().toISOString()),
		packageRevision:
			Number.isFinite(record.packageRevision) && record.packageRevision >= 0
				? Math.floor(record.packageRevision)
				: 0,
		packageFingerprint:
			typeof record.packageFingerprint === "string"
				? record.packageFingerprint
				: "",
		snapshot: record.snapshot ?? null,
	};
}

function estimateValueBytes(value, seen = new WeakSet()) {
	if (value == null) {
		return 0;
	}

	if (typeof value === "string") {
		return value.length * 2;
	}

	if (typeof value === "number" || typeof value === "boolean") {
		return 8;
	}

	if (value instanceof ArrayBuffer) {
		return value.byteLength;
	}

	if (ArrayBuffer.isView(value)) {
		return value.byteLength;
	}

	if (value instanceof Blob) {
		return value.size;
	}

	if (Array.isArray(value)) {
		return value.reduce(
			(total, item) => total + estimateValueBytes(item, seen),
			0,
		);
	}

	if (typeof value === "object") {
		if (seen.has(value)) {
			return 0;
		}
		seen.add(value);
		let total = 0;
		for (const [key, nested] of Object.entries(value)) {
			total += key.length * 2;
			total += estimateValueBytes(nested, seen);
		}
		return total;
	}

	return 0;
}

function estimateWorkingStateRecordBytes(record) {
	return estimateValueBytes(record);
}

async function listWorkingStateRecords() {
	const result = await runStoreRequest("readonly", (store) => store.getAll());
	return Array.isArray(result)
		? result.map((record) => normalizeWorkingStateRecord(record))
		: [];
}

export function supportsWorkingProjectStateStorage() {
	return supportsIndexedDb();
}

export async function saveCameraFramesWorkingState(record) {
	const normalizedRecord = normalizeWorkingStateRecord(record);
	if (!normalizedRecord.projectId) {
		throw new Error("A projectId is required for working save.");
	}

	await runStoreRequest("readwrite", (store) => store.put(normalizedRecord));
	return normalizedRecord;
}

export async function readCameraFramesWorkingState(projectId) {
	const normalizedProjectId = String(projectId ?? "").trim();
	if (!normalizedProjectId) {
		return null;
	}

	const result = await runStoreRequest("readonly", (store) =>
		store.get(normalizedProjectId),
	);
	if (!result) {
		return null;
	}

	return normalizeWorkingStateRecord(result);
}

export async function deleteCameraFramesWorkingState(projectId) {
	const normalizedProjectId = String(projectId ?? "").trim();
	if (!normalizedProjectId) {
		return false;
	}

	await runStoreRequest("readwrite", (store) =>
		store.delete(normalizedProjectId),
	);
	return true;
}

export async function cleanupCameraFramesWorkingState({
	keepProjectId = "",
	maxProjects = MAX_WORKING_PROJECTS,
	maxBytes = MAX_WORKING_STATE_BYTES,
} = {}) {
	const normalizedKeepProjectId = String(keepProjectId ?? "").trim();
	const normalizedMaxProjects = Math.max(0, Number(maxProjects) || 0);
	const normalizedMaxBytes = Math.max(0, Number(maxBytes) || 0);
	const records = await listWorkingStateRecords();
	const entries = records.map((record) => ({
		record,
		estimatedBytes: estimateWorkingStateRecordBytes(record),
		savedAtMs: Date.parse(record.savedAt || "") || 0,
	}));

	let totalBytes = entries.reduce(
		(sum, entry) => sum + entry.estimatedBytes,
		0,
	);
	let totalProjects = entries.length;
	if (
		totalProjects <= normalizedMaxProjects &&
		totalBytes <= normalizedMaxBytes
	) {
		return {
			removedProjects: 0,
			freedBytes: 0,
			totalProjects,
			totalBytes,
		};
	}

	const removable = entries
		.filter((entry) => entry.record.projectId !== normalizedKeepProjectId)
		.sort((left, right) => left.savedAtMs - right.savedAtMs);
	const removed = [];
	for (const entry of removable) {
		if (
			totalProjects <= normalizedMaxProjects &&
			totalBytes <= normalizedMaxBytes
		) {
			break;
		}
		removed.push(entry);
		totalProjects -= 1;
		totalBytes -= entry.estimatedBytes;
	}

	if (removed.length > 0) {
		await runStoreRequest("readwrite", (store) => {
			for (const entry of removed) {
				store.delete(entry.record.projectId);
			}
			return null;
		});
	}

	return {
		removedProjects: removed.length,
		freedBytes: removed.reduce((sum, entry) => sum + entry.estimatedBytes, 0),
		totalProjects: Math.max(0, totalProjects),
		totalBytes: Math.max(0, totalBytes),
	};
}
