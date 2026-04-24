import { REFERENCE_IMAGE_ASSET_KIND } from "../../reference-image-model.js";
import { normalizeProjectFileName } from "../document.js";

export const PROJECT_FILE_LAZY_RESOURCE_SOURCE = "project-file-lazy-resource";

export function createProjectFileLazyResourceSource({
	kind,
	fileName,
	projectAssetState = null,
	legacyState = null,
	resource = null,
	materialize,
} = {}) {
	const normalizedKind =
		kind === "model" || kind === "splat" || kind === REFERENCE_IMAGE_ASSET_KIND
			? kind
			: "splat";
	let materializedSource = null;
	let materializePromise = null;
	return {
		sourceType: PROJECT_FILE_LAZY_RESOURCE_SOURCE,
		kind: normalizedKind,
		fileName: normalizeProjectFileName(fileName, "asset.bin"),
		projectAssetState,
		legacyState,
		resource,
		async materialize() {
			if (materializedSource) {
				return materializedSource;
			}
			if (!materializePromise) {
				if (typeof materialize !== "function") {
					throw new Error(
						`Project resource "${fileName || "asset.bin"}" cannot be loaded.`,
					);
				}
				materializePromise = Promise.resolve(materialize()).then((source) => {
					materializedSource = source;
					return materializedSource;
				});
			}
			return await materializePromise;
		},
	};
}

export async function materializeProjectFileLazyResourceSource(source) {
	if (!isProjectFileLazyResourceSource(source)) {
		return source;
	}
	return await source.materialize();
}

export function isProjectFileLazyResourceSource(source) {
	return source?.sourceType === PROJECT_FILE_LAZY_RESOURCE_SOURCE;
}
