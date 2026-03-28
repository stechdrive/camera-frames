function cloneSerializable(value) {
	if (typeof structuredClone === "function") {
		return structuredClone(value);
	}
	return JSON.parse(JSON.stringify(value));
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
		return JSON.stringify(snapshot);
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
