const SPARK_SPLAT_TEX_WIDTH = 2048;
const SPARK_SPLAT_TEX_HEIGHT = 2048;
const SPARK_SPLAT_TEX_MIN_HEIGHT = 1;

export function getSparkSplatTextureCapacity(numSplats) {
	if (numSplats <= 0) {
		return 0;
	}
	const height = Math.max(
		SPARK_SPLAT_TEX_MIN_HEIGHT,
		Math.min(
			SPARK_SPLAT_TEX_HEIGHT,
			Math.ceil(numSplats / SPARK_SPLAT_TEX_WIDTH),
		),
	);
	const depth = Math.ceil(numSplats / (SPARK_SPLAT_TEX_WIDTH * height));
	return SPARK_SPLAT_TEX_WIDTH * height * depth;
}
