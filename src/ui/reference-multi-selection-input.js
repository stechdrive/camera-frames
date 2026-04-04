function normalizeDeltaDegrees(value) {
	const numericValue = Number(value);
	if (!Number.isFinite(numericValue)) {
		return 0;
	}
	const wrapped = ((((numericValue + 180) % 360) + 360) % 360) - 180;
	return wrapped === -180 ? 180 : wrapped;
}

export function computeReferenceMultiSelectionTargetOffsetDelta(
	currentDelta,
	targetDelta,
) {
	const currentValue = Number.isFinite(currentDelta) ? Number(currentDelta) : 0;
	const targetValue = Number(targetDelta);
	if (!Number.isFinite(targetValue)) {
		return null;
	}
	const incrementalDelta = targetValue - currentValue;
	return Math.abs(incrementalDelta) <= 1e-8 ? null : incrementalDelta;
}

export function computeReferenceMultiSelectionTargetRotationDelta(
	currentDeltaDeg,
	targetDeltaDeg,
) {
	const currentValue = Number.isFinite(currentDeltaDeg)
		? Number(currentDeltaDeg)
		: 0;
	const targetValue = normalizeDeltaDegrees(targetDeltaDeg);
	const incrementalDelta = normalizeDeltaDegrees(targetValue - currentValue);
	return Math.abs(incrementalDelta) <= 1e-8 ? null : incrementalDelta;
}

export function computeReferenceMultiSelectionTargetScaleFactor(
	currentDeltaPercent,
	targetDeltaPercent,
) {
	const currentValue = Number.isFinite(currentDeltaPercent)
		? Number(currentDeltaPercent)
		: 0;
	const targetValue = Number(targetDeltaPercent);
	if (!Number.isFinite(targetValue)) {
		return null;
	}
	const currentScaleFactor = Math.max(0.01, 1 + currentValue / 100);
	const targetScaleFactor = Math.max(0.01, 1 + targetValue / 100);
	const incrementalScaleFactor = targetScaleFactor / currentScaleFactor;
	if (
		!Number.isFinite(incrementalScaleFactor) ||
		incrementalScaleFactor <= 0 ||
		Math.abs(incrementalScaleFactor - 1) <= 1e-8
	) {
		return null;
	}
	return incrementalScaleFactor;
}

export function computeReferenceMultiSelectionSessionRotationDelta(
	baselineDeltaDeg,
	targetDeltaDeg,
) {
	const baselineValue = Number.isFinite(baselineDeltaDeg)
		? Number(baselineDeltaDeg)
		: 0;
	const targetValue = normalizeDeltaDegrees(targetDeltaDeg);
	const relativeDelta = normalizeDeltaDegrees(targetValue - baselineValue);
	return Math.abs(relativeDelta) <= 1e-8 ? null : relativeDelta;
}

export function computeReferenceMultiSelectionSessionScaleFactor(
	baselineDeltaPercent,
	targetDeltaPercent,
) {
	const baselineValue = Number.isFinite(baselineDeltaPercent)
		? Number(baselineDeltaPercent)
		: 0;
	const targetValue = Number(targetDeltaPercent);
	if (!Number.isFinite(targetValue)) {
		return null;
	}
	const baselineScaleFactor = Math.max(0.01, 1 + baselineValue / 100);
	const targetScaleFactor = Math.max(0.01, 1 + targetValue / 100);
	const relativeScaleFactor = targetScaleFactor / baselineScaleFactor;
	if (
		!Number.isFinite(relativeScaleFactor) ||
		relativeScaleFactor <= 0 ||
		Math.abs(relativeScaleFactor - 1) <= 1e-8
	) {
		return null;
	}
	return relativeScaleFactor;
}
