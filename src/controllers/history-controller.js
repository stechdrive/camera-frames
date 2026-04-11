function cloneSerializable(value) {
	if (typeof structuredClone === "function") {
		return structuredClone(value);
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

export function createHistoryController({
	store,
	captureWorkspaceState,
	restoreWorkspaceState,
	updateUi,
}) {
	const undoStack = [];
	const redoStack = [];
	let activeTransaction = null;
	let isRestoring = false;

	function syncAvailability() {
		store.history.canUndo.value = undoStack.length > 0;
		store.history.canRedo.value = redoStack.length > 0;
	}

	function captureSnapshot() {
		return cloneSerializable(captureWorkspaceState());
	}

	function getSnapshotKey(snapshot) {
		return JSON.stringify(snapshot, (_key, value) =>
			buildSnapshotKeySummary(value),
		);
	}

	function clearHistory() {
		undoStack.length = 0;
		redoStack.length = 0;
		activeTransaction = null;
		syncAvailability();
	}

	function pushUndoEntry(label, beforeSnapshot, beforeKey) {
		const afterSnapshot = captureSnapshot();
		if (getSnapshotKey(afterSnapshot) === beforeKey) {
			return false;
		}

		undoStack.push({
			label,
			snapshot: beforeSnapshot,
		});
		if (undoStack.length > 100) {
			undoStack.shift();
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

	function beginHistoryTransaction(label) {
		if (isRestoring || activeTransaction) {
			return false;
		}

		const beforeSnapshot = captureSnapshot();
		activeTransaction = {
			label,
			beforeSnapshot,
			beforeKey: getSnapshotKey(beforeSnapshot),
		};
		return true;
	}

	function commitHistoryTransaction(label = activeTransaction?.label) {
		if (!activeTransaction) {
			return false;
		}

		const transaction = activeTransaction;
		activeTransaction = null;
		return pushUndoEntry(
			label,
			transaction.beforeSnapshot,
			transaction.beforeKey,
		);
	}

	function cancelHistoryTransaction() {
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
		const currentSnapshot = captureSnapshot();
		const restored = restoreSnapshot(entry.snapshot);
		if (!restored) {
			return false;
		}
		redoStack.push({
			label: entry.label,
			snapshot: currentSnapshot,
		});
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
		const currentSnapshot = captureSnapshot();
		const restored = restoreSnapshot(entry.snapshot);
		if (!restored) {
			return false;
		}
		undoStack.push({
			label: entry.label,
			snapshot: currentSnapshot,
		});
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
