import { debugSplatHistory } from "../debug/splat-history-debug.js";

function findFirstNonCloneablePath(value, path = "$", seen = new WeakSet()) {
	if (value === null || value === undefined) {
		return null;
	}
	if (
		typeof value === "string" ||
		typeof value === "number" ||
		typeof value === "boolean" ||
		typeof value === "bigint"
	) {
		return null;
	}
	if (typeof value === "function") {
		return path;
	}
	if (typeof value !== "object") {
		return null;
	}
	if (
		value instanceof Date ||
		value instanceof RegExp ||
		value instanceof Blob ||
		value instanceof File ||
		value instanceof ArrayBuffer ||
		ArrayBuffer.isView(value)
	) {
		return null;
	}
	if (seen.has(value)) {
		return null;
	}
	seen.add(value);
	if (Array.isArray(value)) {
		for (let index = 0; index < value.length; index += 1) {
			const nextPath = findFirstNonCloneablePath(
				value[index],
				`${path}[${index}]`,
				seen,
			);
			if (nextPath) {
				return nextPath;
			}
		}
		return null;
	}
	if (value instanceof Map) {
		let index = 0;
		for (const [entryKey, entryValue] of value.entries()) {
			const keyPath = findFirstNonCloneablePath(
				entryKey,
				`${path}.<mapKey:${index}>`,
				seen,
			);
			if (keyPath) {
				return keyPath;
			}
			const valuePath = findFirstNonCloneablePath(
				entryValue,
				`${path}.<mapValue:${index}>`,
				seen,
			);
			if (valuePath) {
				return valuePath;
			}
			index += 1;
		}
		return null;
	}
	if (value instanceof Set) {
		let index = 0;
		for (const entryValue of value.values()) {
			const nextPath = findFirstNonCloneablePath(
				entryValue,
				`${path}.<set:${index}>`,
				seen,
			);
			if (nextPath) {
				return nextPath;
			}
			index += 1;
		}
		return null;
	}
	for (const [entryKey, entryValue] of Object.entries(value)) {
		const nextPath = findFirstNonCloneablePath(
			entryValue,
			`${path}.${entryKey}`,
			seen,
		);
		if (nextPath) {
			return nextPath;
		}
	}
	return null;
}

function cloneSerializable(value) {
	if (typeof structuredClone === "function") {
		try {
			return structuredClone(value);
		} catch (error) {
			const suspectPath = findFirstNonCloneablePath(value);
			if (suspectPath) {
				console.error("[history] non-cloneable snapshot path", suspectPath);
			}
			throw error;
		}
	}
	return JSON.parse(JSON.stringify(value));
}

function hashBinaryView(view) {
	const bytes =
		view instanceof Uint8Array
			? view
			: new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
	let hashA = 0x811c9dc5;
	let hashB = 0x9e3779b9;
	for (let index = 0; index < bytes.length; index += 1) {
		const value = bytes[index];
		hashA = Math.imul(hashA ^ value, 0x01000193);
		hashB = Math.imul(hashB ^ (value + (index & 0xff)), 0x85ebca6b);
	}
	return `${(hashA >>> 0).toString(16)}:${(hashB >>> 0).toString(16)}`;
}

function buildSnapshotKeySummary(value) {
	if (value instanceof ArrayBuffer) {
		const bytes = new Uint8Array(value);
		return {
			__binary: "ArrayBuffer",
			byteLength: bytes.byteLength,
			hash: hashBinaryView(bytes),
		};
	}
	if (ArrayBuffer.isView(value)) {
		return {
			__binary: value.constructor?.name ?? "ArrayBufferView",
			byteLength: value.byteLength,
			hash: hashBinaryView(value),
		};
	}
	return value;
}

function isSplatHistoryLabel(label) {
	return typeof label === "string" && label.startsWith("splat-edit.");
}

function summarizeSplatHistorySnapshot(snapshot) {
	if (!snapshot || typeof snapshot !== "object") {
		return null;
	}
	const assetSummaries = Array.isArray(snapshot.sceneAssets?.assets)
		? snapshot.sceneAssets.assets
				.filter((asset) => asset?.kind === "splat")
				.map((asset) => ({
					id: asset.id,
					numSplats:
						asset.sourceSnapshot?.numSplats ?? asset.source?.numSplats ?? null,
					hasSourceSnapshot: asset.sourceSnapshot != null,
				}))
		: [];
	const selectedSplats = Array.isArray(
		snapshot.splatEdit?.selectedSplatsByAssetId,
	)
		? snapshot.splatEdit.selectedSplatsByAssetId.map((entry) => ({
				assetId: entry.assetId,
				count: Array.isArray(entry.indices) ? entry.indices.length : 0,
			}))
		: [];
	return {
		splatAssets: assetSummaries,
		splatEdit: snapshot.splatEdit
			? {
					tool: snapshot.splatEdit.tool ?? null,
					boxPlaced: snapshot.splatEdit.boxPlaced === true,
					scopeAssetIds: [...(snapshot.splatEdit.scopeAssetIds ?? [])],
					selectedSplats,
					lastOperation: snapshot.splatEdit.lastOperation ?? null,
				}
			: null,
	};
}

export function createHistoryController({
	store,
	captureWorkspaceState,
	restoreWorkspaceState,
	updateUi,
	onRetainSnapshot = null,
	onReleaseSnapshot = null,
}) {
	const undoStack = [];
	const redoStack = [];
	let activeTransaction = null;
	let isRestoring = false;

	function syncAvailability() {
		store.history.canUndo.value = undoStack.length > 0;
		store.history.canRedo.value = redoStack.length > 0;
	}

	function retainSnapshot(snapshot) {
		if (typeof onRetainSnapshot === "function" && snapshot != null) {
			onRetainSnapshot(snapshot);
		}
	}

	function releaseSnapshot(snapshot) {
		if (typeof onReleaseSnapshot === "function" && snapshot != null) {
			onReleaseSnapshot(snapshot);
		}
	}

	function releaseEntry(entry) {
		if (!entry) {
			return;
		}
		releaseSnapshot(entry.undoSnapshot);
		releaseSnapshot(entry.redoSnapshot);
	}

	function captureSnapshot() {
		const snapshot = cloneSerializable(captureWorkspaceState());
		retainSnapshot(snapshot);
		return snapshot;
	}

	function getSnapshotKey(snapshot) {
		return JSON.stringify(snapshot, (_key, value) =>
			buildSnapshotKeySummary(value),
		);
	}

	function clearHistory() {
		for (const entry of undoStack) {
			releaseEntry(entry);
		}
		undoStack.length = 0;
		for (const entry of redoStack) {
			releaseEntry(entry);
		}
		redoStack.length = 0;
		if (activeTransaction) {
			releaseSnapshot(activeTransaction.beforeSnapshot);
		}
		activeTransaction = null;
		syncAvailability();
	}

	function pushUndoEntry(
		label,
		beforeSnapshot,
		beforeKey,
		{ skipSnapshotDiff = false } = {},
	) {
		const afterSnapshot = captureSnapshot();
		if (!skipSnapshotDiff) {
			const afterKey = getSnapshotKey(afterSnapshot);
			if (afterKey === beforeKey) {
				if (isSplatHistoryLabel(label)) {
					debugSplatHistory("skip-noop", {
						label,
					});
				}
				releaseSnapshot(beforeSnapshot);
				releaseSnapshot(afterSnapshot);
				return false;
			}
		}
		undoStack.push({
			label,
			undoSnapshot: beforeSnapshot,
			redoSnapshot: afterSnapshot,
		});
		if (isSplatHistoryLabel(label)) {
			debugSplatHistory("push", {
				label,
				undo: summarizeSplatHistorySnapshot(beforeSnapshot),
				redo: summarizeSplatHistorySnapshot(afterSnapshot),
			});
		}
		if (undoStack.length > 100) {
			const shifted = undoStack.shift();
			releaseEntry(shifted);
		}
		for (const entry of redoStack) {
			releaseEntry(entry);
		}
		redoStack.length = 0;
		syncAvailability();
		return true;
	}

	function runHistoryAction(label, applyChange) {
		if (typeof applyChange !== "function") {
			return false;
		}

		if (isRestoring || activeTransaction) {
			applyChange();
			return false;
		}

		const beforeSnapshot = captureSnapshot();
		const beforeKey = getSnapshotKey(beforeSnapshot);
		applyChange();
		return pushUndoEntry(label, beforeSnapshot, beforeKey);
	}

	function beginHistoryTransaction(label, options = {}) {
		if (isRestoring || activeTransaction) {
			return false;
		}

		const beforeSnapshot = captureSnapshot();
		const skipSnapshotDiff = options?.skipSnapshotDiff === true;
		if (isSplatHistoryLabel(label)) {
			debugSplatHistory("begin", {
				label,
				before: summarizeSplatHistorySnapshot(beforeSnapshot),
			});
		}
		activeTransaction = {
			label,
			beforeSnapshot,
			beforeKey: skipSnapshotDiff ? null : getSnapshotKey(beforeSnapshot),
			skipSnapshotDiff,
		};
		return true;
	}

	function commitHistoryTransaction(
		label = activeTransaction?.label,
		options = activeTransaction
			? {
					skipSnapshotDiff: activeTransaction.skipSnapshotDiff === true,
				}
			: undefined,
	) {
		if (!activeTransaction) {
			return false;
		}

		const transaction = activeTransaction;
		activeTransaction = null;
		return pushUndoEntry(
			label,
			transaction.beforeSnapshot,
			transaction.beforeKey,
			options,
		);
	}

	function cancelHistoryTransaction() {
		if (activeTransaction) {
			releaseSnapshot(activeTransaction.beforeSnapshot);
		}
		activeTransaction = null;
	}

	function restoreSnapshot(snapshot) {
		isRestoring = true;
		try {
			const restored = restoreWorkspaceState(cloneSerializable(snapshot));
			if (!restored) {
				clearHistory();
				return false;
			}
			updateUi();
			return true;
		} finally {
			isRestoring = false;
			syncAvailability();
		}
	}

	function undoHistory() {
		if (isRestoring) {
			return false;
		}

		if (activeTransaction) {
			commitHistoryTransaction();
		}

		if (undoStack.length === 0) {
			return false;
		}

		const entry = undoStack.pop();
		if (isSplatHistoryLabel(entry.label)) {
			debugSplatHistory("undo", {
				label: entry.label,
				target: summarizeSplatHistorySnapshot(entry.undoSnapshot),
			});
		}
		const restored = restoreSnapshot(entry.undoSnapshot);
		if (!restored) {
			return false;
		}
		redoStack.push(entry);
		syncAvailability();
		return true;
	}

	function redoHistory() {
		if (isRestoring) {
			return false;
		}

		if (activeTransaction) {
			commitHistoryTransaction();
		}

		if (redoStack.length === 0) {
			return false;
		}

		const entry = redoStack.pop();
		if (isSplatHistoryLabel(entry.label)) {
			debugSplatHistory("redo", {
				label: entry.label,
				target: summarizeSplatHistorySnapshot(entry.redoSnapshot),
			});
		}
		const restored = restoreSnapshot(entry.redoSnapshot);
		if (!restored) {
			return false;
		}
		undoStack.push(entry);
		syncAvailability();
		return true;
	}

	syncAvailability();

	return {
		clearHistory,
		runHistoryAction,
		beginHistoryTransaction,
		commitHistoryTransaction,
		cancelHistoryTransaction,
		undoHistory,
		redoHistory,
		isRestoringHistory: () => isRestoring,
	};
}
