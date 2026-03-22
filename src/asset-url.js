export async function getAssetFileURL(assetFile) {
	try {
		const assetsIndexUrl = new URL("../assets.json", import.meta.url);
		const assetsDirectory = new URL("../assets/", import.meta.url);
		const response = await fetch(assetsIndexUrl);
		const assetsInfo = await response.json();
		let url = assetsInfo[assetFile].url;
		if (window.sparkLocalAssets) {
			url = new URL(
				`${assetsInfo[assetFile].directory}/${assetFile}`,
				assetsDirectory,
			).toString();
		}
		return url;
	} catch (error) {
		console.error("Failed to load asset file URL:", error);
		return null;
	}
}
