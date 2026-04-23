function assertSparkExportBufferStateTarget(sourceSpark) {
	if (!sourceSpark || typeof sourceSpark !== "object") {
		throw new Error(
			"Spark export contract mismatch: sourceSpark is not an object.",
		);
	}
	return sourceSpark;
}

export function captureSparkExportBufferState(sourceSpark) {
	const target = assertSparkExportBufferStateTarget(sourceSpark);
	return {
		target: target.target ?? null,
		backTarget: target.backTarget,
		superXY: Number.isFinite(target.superXY) ? target.superXY : 1,
		superPixels: target.superPixels ?? null,
		targetPixels: target.targetPixels ?? null,
		encodeLinear: target.encodeLinear === true,
	};
}

export function assignSparkExportBufferState(
	sourceSpark,
	{
		target = null,
		backTarget = undefined,
		superXY = 1,
		superPixels = null,
		targetPixels = null,
		encodeLinear = false,
	} = {},
) {
	const targetSpark = assertSparkExportBufferStateTarget(sourceSpark);
	targetSpark.target = target;
	targetSpark.backTarget = backTarget;
	targetSpark.superXY = superXY;
	targetSpark.superPixels = superPixels;
	targetSpark.targetPixels = targetPixels;
	targetSpark.encodeLinear = encodeLinear;
	return targetSpark;
}

export function captureSparkExportBufferOutputs(sourceSpark) {
	const target = assertSparkExportBufferStateTarget(sourceSpark);
	return {
		superPixels: target.superPixels ?? null,
		targetPixels: target.targetPixels ?? null,
	};
}
