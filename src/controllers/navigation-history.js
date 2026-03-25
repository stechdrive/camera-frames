const NAVIGATION_HISTORY_IDLE_COMMIT_MS = 120;

export function createNavigationHistoryController({
	beginHistoryTransaction,
	commitHistoryTransaction,
}) {
	let activeTargetKey = null;
	let idleMs = 0;
	let flushRequested = false;

	function reset() {
		activeTargetKey = null;
		idleMs = 0;
		flushRequested = false;
	}

	function hasActiveTransaction() {
		return activeTargetKey !== null;
	}

	function flush() {
		if (!hasActiveTransaction()) {
			return false;
		}

		const committed = commitHistoryTransaction?.() ?? false;
		reset();
		return committed;
	}

	function requestCommit() {
		if (!hasActiveTransaction()) {
			return false;
		}

		flushRequested = true;
		return true;
	}

	function noteFrame({
		targetKey,
		label,
		poseChanged,
		navigationActive,
		deltaMs,
	}) {
		if (hasActiveTransaction() && targetKey !== activeTargetKey) {
			flush();
		}

		if (!hasActiveTransaction()) {
			if (!navigationActive || !poseChanged) {
				return false;
			}

			const began = beginHistoryTransaction?.(label ?? "camera.pose") ?? false;
			if (!began) {
				return false;
			}

			activeTargetKey = targetKey;
			idleMs = 0;
			flushRequested = false;
			return true;
		}

		if (navigationActive || poseChanged) {
			idleMs = 0;
			return false;
		}

		idleMs += Math.max(0, Number(deltaMs) || 0);
		if (flushRequested || idleMs >= NAVIGATION_HISTORY_IDLE_COMMIT_MS) {
			return flush();
		}

		return false;
	}

	return {
		hasActiveTransaction,
		flush,
		requestCommit,
		noteFrame,
	};
}
