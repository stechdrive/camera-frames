export function supportsSparkRadBundleBuild() {
	return false;
}

export async function buildSparkRadBundleFromPackedSplats() {
	throw new Error(
		"Spark RAD bundle generation is not available in @sparkjsdev/spark@2.0.0. The runtime can load embedded RAD bundles, but a browser-side RAD encoder must be added before Quality save can generate them.",
	);
}
