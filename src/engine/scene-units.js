import { translate } from "../i18n.js";

function formatNumber(value, digits = value >= 10 ? 1 : 2) {
	return Number(value).toFixed(digits);
}

function plural(locale, count) {
	return locale === "en" && count !== 1 ? "s" : "";
}

export function formatAssetWorldScale(value) {
	return `${formatNumber(value)}x`;
}

export function getAssetKindLabelKey(kind) {
	return `assetKind.${kind}`;
}

export function getAssetUnitModeLabelKey(unitMode) {
	return `unitMode.${unitMode}`;
}

export function getDefaultAssetUnitMode(kind) {
	return kind === "model" ? "meters" : "raw";
}

export function buildAssetCountBadge(
	locale,
	{ splatCount, modelCount, totalCount },
) {
	if (totalCount === 0) {
		return translate(locale, "scene.badgeEmpty");
	}

	const parts = [];
	if (splatCount > 0) {
		parts.push(
			translate(locale, "scene.splatCount", {
				count: splatCount,
				plural: plural(locale, splatCount),
			}),
		);
	}
	if (modelCount > 0) {
		parts.push(
			translate(locale, "scene.modelCount", {
				count: modelCount,
				plural: plural(locale, modelCount),
			}),
		);
	}
	return parts.join(" + ");
}

export function buildSceneSummary(
	locale,
	{ totalCount, badgeText, boundsSize },
) {
	if (totalCount === 0) {
		return "";
	}

	const parts = [
		translate(locale, "scene.loaded", {
			count: totalCount,
			badge: badgeText,
		}),
	];
	if (boundsSize) {
		parts.push(
			translate(locale, "scene.bounds", {
				x: formatNumber(boundsSize.x),
				y: formatNumber(boundsSize.y),
				z: formatNumber(boundsSize.z),
			}),
		);
	}
	return parts.join(" ");
}

export function buildSceneScaleSummary(locale, { assets }) {
	if (assets.length === 0) {
		return "";
	}

	const adjustedCount = assets.filter(
		(asset) => Math.abs((asset.worldScale ?? 1) - 1) > 0.0001,
	).length;
	if (adjustedCount === 0) {
		return "";
	}

	return translate(locale, "scene.scaleAdjusted", {
		count: adjustedCount,
	});
}
