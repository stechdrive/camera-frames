const CLIPBOARD_IMAGE_EXTENSIONS_BY_TYPE = new Map([
	["image/png", "png"],
	["image/jpeg", "jpg"],
	["image/jpg", "jpg"],
	["image/webp", "webp"],
]);

function normalizeMimeType(type) {
	return String(type ?? "")
		.trim()
		.toLowerCase();
}

function buildClipboardImageFileName(extension, index, now = new Date()) {
	const timestamp = [
		now.getFullYear(),
		String(now.getMonth() + 1).padStart(2, "0"),
		String(now.getDate()).padStart(2, "0"),
		"-",
		String(now.getHours()).padStart(2, "0"),
		String(now.getMinutes()).padStart(2, "0"),
		String(now.getSeconds()).padStart(2, "0"),
	].join("");
	const suffix = index > 0 ? `-${index + 1}` : "";
	return `clipboard-${timestamp}${suffix}.${extension}`;
}

function wrapClipboardImageFile(file, index, now) {
	const type = normalizeMimeType(file?.type);
	const extension = CLIPBOARD_IMAGE_EXTENSIONS_BY_TYPE.get(type);
	if (!extension || typeof File !== "function") {
		return null;
	}
	return new File([file], buildClipboardImageFileName(extension, index, now), {
		type,
	});
}

function collectClipboardCandidateFiles(clipboardData) {
	const items = Array.from(clipboardData?.items ?? []);
	if (items.length > 0) {
		const itemFiles = items
			.filter((item) => item?.kind === "file")
			.map((item) => item.getAsFile?.() ?? null)
			.filter(Boolean);
		if (itemFiles.length > 0) {
			return itemFiles;
		}
	}
	return Array.from(clipboardData?.files ?? []);
}

export function getPastedReferenceImageFiles(
	clipboardData,
	{ supportsReferenceImageFile = () => false, now = new Date() } = {},
) {
	const files = [];
	for (const file of collectClipboardCandidateFiles(clipboardData)) {
		if (supportsReferenceImageFile(file)) {
			files.push(file);
			continue;
		}
		const clipboardImageFile = wrapClipboardImageFile(file, files.length, now);
		if (clipboardImageFile) {
			files.push(clipboardImageFile);
		}
	}
	return files;
}
