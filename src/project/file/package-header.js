import { normalizeReferenceImageDocument } from "../../reference-image-model.js";
import {
	PROJECT_DOCUMENT_PATH,
	PROJECT_FORMAT,
	PROJECT_MANIFEST_PATH,
	PROJECT_VERSION,
	normalizeProjectDocument,
} from "../document.js";
import { notifyProjectReadProgress } from "./progress.js";

export async function readProjectPackageHeader(
	reader,
	{ onProgress = null } = {},
) {
	const archivePaths = reader.listFilenames();
	await notifyProjectReadProgress(onProgress, {
		phase: "verify",
		stage: "inspect-archive",
	});
	const hasManifest = archivePaths.includes(PROJECT_MANIFEST_PATH);
	const manifest = hasManifest
		? JSON.parse(
				await (async () => {
					await notifyProjectReadProgress(onProgress, {
						phase: "verify",
						stage: "read-manifest",
						fileLabel: PROJECT_MANIFEST_PATH,
					});
					return reader.text(PROJECT_MANIFEST_PATH);
				})(),
			)
		: null;
	if (
		manifest &&
		(manifest?.format !== PROJECT_FORMAT ||
			Number(manifest?.version) !== PROJECT_VERSION)
	) {
		throw new Error("Unsupported CAMERA_FRAMES project format.");
	}

	const projectPath =
		(typeof manifest?.entries?.project === "string" &&
			manifest.entries.project) ||
		archivePaths.find((path) => path === PROJECT_DOCUMENT_PATH) ||
		PROJECT_DOCUMENT_PATH;
	await notifyProjectReadProgress(onProgress, {
		phase: "expand",
		stage: "read-project-document",
		fileLabel: projectPath,
	});
	const project = normalizeProjectDocument(
		JSON.parse(await reader.text(projectPath)),
	);
	const normalizedReferenceImages = normalizeReferenceImageDocument(
		project.scene.referenceImages,
	);
	const totalAssets = project.scene.assets.length;
	await notifyProjectReadProgress(onProgress, {
		phase: "expand",
		stage: "scan-project-assets",
		total: totalAssets,
		referenceTotal: normalizedReferenceImages.assets.length,
	});

	return {
		archivePaths,
		manifest,
		projectPath,
		project,
		normalizedReferenceImages,
		totalAssets,
	};
}
