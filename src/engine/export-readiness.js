const DEFAULT_MIN_WARMUP_PASSES = 0;
const DEFAULT_SPLAT_WARMUP_PASSES = 2;
const DEFAULT_SPLAT_SETTLED_PASSES = 2;
const DEFAULT_MAX_WAIT_MS = 1500;

function clampInteger(value, fallback, minimum = 0) {
	const nextValue = Math.floor(Number(value));
	if (!Number.isFinite(nextValue)) {
		return fallback;
	}

	return Math.max(minimum, nextValue);
}

function clampPositiveInteger(value, fallback) {
	const nextValue = Math.floor(Number(value));
	if (!Number.isFinite(nextValue) || nextValue <= 0) {
		return fallback;
	}

	return nextValue;
}

export function countExportSceneAssets(sceneAssets = []) {
	let splatCount = 0;
	let modelCount = 0;

	for (const asset of sceneAssets) {
		if (asset?.kind === "splat") {
			splatCount += 1;
			continue;
		}

		if (asset?.kind === "model") {
			modelCount += 1;
		}
	}

	return {
		splatCount,
		modelCount,
		totalCount: splatCount + modelCount,
	};
}

export function normalizeExportReadinessPolicy(policy = {}) {
	return {
		minWarmupPasses: clampInteger(
			policy.minWarmupPasses,
			DEFAULT_MIN_WARMUP_PASSES,
		),
		splatWarmupPasses: clampInteger(
			policy.splatWarmupPasses,
			DEFAULT_SPLAT_WARMUP_PASSES,
		),
		splatSettledPasses: clampInteger(
			policy.splatSettledPasses,
			DEFAULT_SPLAT_SETTLED_PASSES,
		),
		maxWaitMs: clampPositiveInteger(policy.maxWaitMs, DEFAULT_MAX_WAIT_MS),
	};
}

export function buildExportReadinessPlan({
	sceneAssets = [],
	policy = {},
} = {}) {
	const normalizedPolicy = normalizeExportReadinessPolicy(policy);
	const assetCounts = countExportSceneAssets(sceneAssets);
	const requiresSplatWarmup = assetCounts.splatCount > 0;
	const warmupPasses = requiresSplatWarmup
		? Math.max(
				normalizedPolicy.minWarmupPasses,
				normalizedPolicy.splatWarmupPasses,
			)
		: normalizedPolicy.minWarmupPasses;
	const settledPasses = requiresSplatWarmup
		? normalizedPolicy.splatSettledPasses
		: 0;

	return {
		...normalizedPolicy,
		assetCounts,
		requiresSplatWarmup,
		warmupPasses,
		settledPasses,
	};
}

export function finalizeExportReadiness(plan, result = {}) {
	const completedWarmupPasses = clampInteger(result.completedWarmupPasses, 0);
	const completedRenderPasses = clampInteger(result.completedRenderPasses, 0);
	const settledPassesPlanned = clampInteger(
		result.settledPassesPlanned,
		plan.settledPasses ?? 0,
	);
	const completedSettledPasses = clampInteger(
		result.completedSettledPasses,
		0,
	);
	return {
		maxWaitMs: plan.maxWaitMs,
		warmupPassesPlanned: plan.warmupPasses,
		completedWarmupPasses,
		completedRenderPasses,
		settledPassesPlanned,
		completedSettledPasses,
		timedOut: Boolean(result.timedOut),
		requiresSplatWarmup: plan.requiresSplatWarmup,
		assetCounts: plan.assetCounts,
		sparkReadinessProbe: {
			supported: Boolean(result.probeSupported),
			lastState: result.lastReadinessProbe ?? null,
		},
	};
}
