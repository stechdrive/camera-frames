import { ZipReader } from "../../project/package-legacy.js";

export const PROJECT_PICKER_MIME = "application/x-camera-frames-project";

export function getProjectBaseName(value) {
	const fileName = String(value ?? "").trim();
	if (!fileName) {
		return "";
	}
	return fileName.replace(/\.ssproj$/i, "");
}

export function ensureProjectFileName(
	value,
	fallback = "camera-frames-project.ssproj",
) {
	const baseName = getProjectBaseName(value);
	return baseName ? `${baseName}.ssproj` : fallback;
}

export function supportsProjectFileSave() {
	return typeof globalThis.showSaveFilePicker === "function";
}

export function supportsSogCompression() {
	return Boolean(globalThis.navigator?.gpu);
}

export function createSogCompressionUnavailableError(t) {
	return new Error(t("error.sogCompressionWorkerUnavailable"));
}

export function getProjectPickerTypes() {
	return [
		{
			description: "CAMERA_FRAMES Project",
			accept: {
				[PROJECT_PICKER_MIME]: [".ssproj"],
			},
		},
	];
}

export async function pickProjectSaveHandle(suggestedName) {
	if (!supportsProjectFileSave()) {
		return null;
	}

	return globalThis.showSaveFilePicker({
		suggestedName,
		types: getProjectPickerTypes(),
	});
}

export async function writeProjectFileHandle(fileHandle, bytes) {
	const writable = await fileHandle.createWritable();
	await writable.write(bytes);
	await writable.close();
}

export async function isLegacyCameraFramesProjectSource(source) {
	try {
		const reader = await ZipReader.from(source);
		const archivePaths = reader
			.listFilenames()
			.map((path) => path.toLowerCase());
		return (
			!archivePaths.includes("manifest.json") &&
			archivePaths.includes("document.json")
		);
	} catch {
		return false;
	}
}
