import {
	REFERENCE_IMAGE_DEFAULT_PRESET_ID,
	REFERENCE_IMAGE_DEFAULT_PRESET_NAME,
	REFERENCE_IMAGE_GROUP_BACK,
	createReferenceImagePreset,
	getReferenceImageCompositeItems,
	normalizeReferenceImageFileName,
} from "../../reference-image-model.js";

const REFERENCE_IMAGE_EXTENSIONS = new Set([
	"png",
	"jpg",
	"jpeg",
	"webp",
	"psd",
]);

export function getFileExtension(fileName) {
	const normalized = String(fileName ?? "")
		.trim()
		.toLowerCase();
	const lastDot = normalized.lastIndexOf(".");
	return lastDot >= 0 ? normalized.slice(lastDot + 1) : "";
}

export function supportsReferenceImageFile(file) {
	return REFERENCE_IMAGE_EXTENSIONS.has(
		getFileExtension(file?.name ?? file?.fileName ?? ""),
	);
}

export function buildReferenceImageSizeLabel(sourceMeta) {
	const size = sourceMeta?.appliedSize ?? sourceMeta?.originalSize ?? null;
	if (!size) {
		return "";
	}
	return `${size.w} × ${size.h}`;
}

export function ensurePresetBaseRenderBox(preset, outputSize) {
	if ((preset.items?.length ?? 0) > 0) {
		return;
	}
	if (!outputSize?.width || !outputSize?.height) {
		return;
	}
	preset.baseRenderBox = {
		w: Math.max(1, Math.round(outputSize.width)),
		h: Math.max(1, Math.round(outputSize.height)),
	};
}

export function normalizeReferenceImageItemOrderInPlace(items) {
	const nextItems = getReferenceImageCompositeItems(items);
	let backIndex = 0;
	let frontIndex = 0;
	for (const item of nextItems) {
		if (item.group === REFERENCE_IMAGE_GROUP_BACK) {
			item.order = backIndex;
			backIndex += 1;
			continue;
		}
		item.order = frontIndex;
		frontIndex += 1;
	}
	return items;
}

export function buildReferenceImageOverridePatch(baseItem, nextItem) {
	const patch = {};

	if (nextItem.name !== baseItem.name) {
		patch.name = nextItem.name;
	}
	if (nextItem.group !== baseItem.group) {
		patch.group = nextItem.group;
	}
	if (nextItem.order !== baseItem.order) {
		patch.order = nextItem.order;
	}
	if (nextItem.previewVisible !== baseItem.previewVisible) {
		patch.previewVisible = nextItem.previewVisible;
	}
	if (nextItem.exportEnabled !== baseItem.exportEnabled) {
		patch.exportEnabled = nextItem.exportEnabled;
	}
	if (nextItem.opacity !== baseItem.opacity) {
		patch.opacity = nextItem.opacity;
	}
	if (nextItem.scalePct !== baseItem.scalePct) {
		patch.scalePct = nextItem.scalePct;
	}
	if (nextItem.rotationDeg !== baseItem.rotationDeg) {
		patch.rotationDeg = nextItem.rotationDeg;
	}
	if (
		nextItem.offsetPx.x !== baseItem.offsetPx.x ||
		nextItem.offsetPx.y !== baseItem.offsetPx.y
	) {
		patch.offsetPx = {
			x: nextItem.offsetPx.x,
			y: nextItem.offsetPx.y,
		};
	}
	if (
		nextItem.anchor.ax !== baseItem.anchor.ax ||
		nextItem.anchor.ay !== baseItem.anchor.ay
	) {
		patch.anchor = {
			ax: nextItem.anchor.ax,
			ay: nextItem.anchor.ay,
		};
	}

	return patch;
}

export function isReferenceImageOverrideEmpty(override) {
	return (
		!override?.activeItemId &&
		!Object.keys(override?.items ?? {}).length &&
		(override?.renderBoxCorrection?.x ?? 0) === 0 &&
		(override?.renderBoxCorrection?.y ?? 0) === 0
	);
}

export function findMutablePresetInDocument(documentState, presetId = null) {
	const presets = Array.isArray(documentState?.presets)
		? documentState.presets
		: [];
	if (presets.length === 0) {
		return null;
	}
	if (typeof presetId === "string" && presetId) {
		return presets.find((preset) => preset.id === presetId) ?? null;
	}
	return null;
}

export function buildReferenceImagePresetNameHint(
	fileNameHint = "",
	cameraName = "",
) {
	const normalizedFileName = normalizeReferenceImageFileName(
		fileNameHint,
		"Reference",
	);
	const baseFileName = normalizedFileName.replace(/\.[^./\\]+$/, "").trim();
	const normalizedCameraName = String(cameraName ?? "").trim();
	return baseFileName || normalizedCameraName || "Reference";
}

export function buildDuplicatePresetName(presetName = "Reference") {
	const normalized = String(presetName ?? "").trim() || "Reference";
	return normalized === REFERENCE_IMAGE_DEFAULT_PRESET_NAME
		? "Reference Copy"
		: `${normalized} Copy`;
}

export function sanitizeReferenceImagePresetName(
	value,
	fallback = "Reference",
) {
	const normalized = String(value ?? "")
		.replace(/[\r\n\t]+/g, " ")
		.replace(/\s+/g, " ")
		.trim();
	return normalized || fallback;
}

export function pruneUnusedReferenceImageAssetsInDocument(documentState) {
	const usedAssetIds = new Set(
		(documentState?.presets ?? []).flatMap((preset) =>
			(preset?.items ?? []).map((item) => item.assetId),
		),
	);
	documentState.assets = (documentState?.assets ?? []).filter((asset) =>
		usedAssetIds.has(asset.id),
	);
}

export function ensureWritableReferenceImageImportPreset(
	documentState,
	shotCameraDocument = null,
	presetNameHint = "",
) {
	const explicitShotPresetId =
		typeof shotCameraDocument?.referenceImages?.presetId === "string" &&
		shotCameraDocument.referenceImages.presetId
			? shotCameraDocument.referenceImages.presetId
			: null;
	const explicitShotPreset = explicitShotPresetId
		? findMutablePresetInDocument(documentState, explicitShotPresetId)
		: null;
	if (explicitShotPreset) {
		documentState.activePresetId = explicitShotPreset.id;
		return explicitShotPreset;
	}

	if (!shotCameraDocument) {
		const fallbackPreset =
			findMutablePresetInDocument(
				documentState,
				documentState.activePresetId,
			) ??
			findMutablePresetInDocument(
				documentState,
				REFERENCE_IMAGE_DEFAULT_PRESET_ID,
			) ??
			documentState?.presets?.[0] ??
			null;
		if (fallbackPreset) {
			documentState.activePresetId = fallbackPreset.id;
			return fallbackPreset;
		}
	}

	const nextPreset = createReferenceImagePreset({
		name: buildReferenceImagePresetNameHint(
			presetNameHint,
			shotCameraDocument?.name ?? "",
		),
	});
	documentState.presets.push(nextPreset);
	documentState.activePresetId = nextPreset.id;
	return nextPreset;
}
