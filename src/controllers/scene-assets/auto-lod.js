import { AUTO_LOD_MIN_SPLATS } from "../../constants.js";
import {
	bakeSparkPackedSplatsLod,
	refreshSparkPackedSplatMesh,
} from "../../engine/spark-integration/spark-packed-splats-adapter.js";

export function createSceneAssetAutoLodController({
	store,
	setStatus,
	t,
	autoLodMinSplats = AUTO_LOD_MIN_SPLATS,
	bakeSparkPackedSplatsLodImpl = bakeSparkPackedSplatsLod,
	refreshSparkPackedSplatMeshImpl = refreshSparkPackedSplatMesh,
}) {
	function updateBackgroundTaskSignal(mutation) {
		const current = store.backgroundTask?.value ?? null;
		const next = mutation(current);
		if (store.backgroundTask && next !== current) {
			store.backgroundTask.value = next;
		}
	}

	function scheduleBackgroundTaskClear(targetStatus, delayMs) {
		if (!store.backgroundTask) {
			return;
		}
		const captured = store.backgroundTask.value;
		setTimeout(() => {
			// Only clear if state hasn't moved on (e.g. another asset started).
			const now = store.backgroundTask.value;
			if (now === captured && now?.status === targetStatus) {
				store.backgroundTask.value = null;
			}
		}, delayMs);
	}

	function beginAutoLodBakeTask(label) {
		updateBackgroundTaskSignal((current) => {
			if (current?.kind === "auto-lod" && current.status === "running") {
				return {
					...current,
					total: current.total + 1,
					label,
				};
			}
			return {
				kind: "auto-lod",
				status: "running",
				current: 0,
				total: 1,
				label,
			};
		});
	}

	function finishAutoLodBakeTask(label, { failed = false } = {}) {
		updateBackgroundTaskSignal((current) => {
			if (current?.kind !== "auto-lod") {
				return current;
			}
			const nextCurrent = Math.min(current.total, current.current + 1);
			const allDone = nextCurrent >= current.total;
			if (!allDone) {
				return {
					...current,
					current: nextCurrent,
					label,
				};
			}
			return {
				...current,
				current: nextCurrent,
				label,
				status: failed ? "failed" : "done",
			};
		});
		if (store.backgroundTask?.value?.status === "done") {
			scheduleBackgroundTaskClear("done", 2000);
		} else if (store.backgroundTask?.value?.status === "failed") {
			scheduleBackgroundTaskClear("failed", 5000);
		}
	}

	function kickAutoLodBake(packedSplats, displayName, splatMesh = null) {
		if (!packedSplats || typeof packedSplats !== "object") {
			return;
		}
		if (packedSplats.lodSplats) {
			return;
		}
		const numSplats =
			packedSplats.getNumSplats?.() ?? packedSplats.numSplats ?? 0;
		if (numSplats < autoLodMinSplats) {
			return;
		}
		const label = displayName ?? "3DGS";
		beginAutoLodBakeTask(label);
		void bakeSparkPackedSplatsLodImpl(packedSplats, { quality: false })
			.then(() => {
				if (typeof splatMesh?.updateGenerator === "function") {
					refreshSparkPackedSplatMeshImpl(splatMesh, packedSplats, {
						updateVersion: typeof splatMesh.updateVersion === "function",
					});
				}
				finishAutoLodBakeTask(label);
				setStatus?.(t("status.autoLodReady", { name: label }));
			})
			.catch((error) => {
				console.error(
					`[camera-frames] auto-LoD bake failed for "${label}":`,
					error,
				);
				finishAutoLodBakeTask(label, { failed: true });
				setStatus?.(t("status.autoLodFailed", { name: label }));
			});
	}

	return {
		kickAutoLodBake,
	};
}
