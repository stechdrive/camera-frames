import { buildProjectManifest } from "../document.js";
import { ZipReader } from "../package-legacy.js";
import { createProjectFileLazyResourceSource } from "./lazy-source.js";
import { readProjectPackageHeader } from "./package-header.js";
import { notifyProjectReadProgress } from "./progress.js";
import {
	cloneResourceForSource,
	getResourceFileLabel,
	materializeProjectAssetResource,
	materializeReferenceImageAsset,
} from "./resource-materializer.js";

export async function readCameraFramesProject(
	source,
	{ onProgress = null } = {},
) {
	await notifyProjectReadProgress(onProgress, {
		phase: "verify",
		stage: "open-archive",
	});
	const reader = await ZipReader.from(source);
	try {
		const {
			manifest,
			projectPath,
			project,
			normalizedReferenceImages,
			totalAssets,
		} = await readProjectPackageHeader(reader, { onProgress });

		const assetExtractors = project.scene.assets.map(
			(asset, index) => async () => {
				const resourceId = asset.source?.resourceId;
				const resource = project.resources?.[resourceId];
				if (!resource) {
					throw new Error(
						`Missing project resource for asset "${asset.label}".`,
					);
				}
				return {
					...asset,
					source: await materializeProjectAssetResource({
						reader,
						asset,
						index,
						resource,
						onProgress,
						totalAssets,
					}),
				};
			},
		);

		const referenceImageExtractors = normalizedReferenceImages.assets.map(
			(referenceAsset, index) => async () => {
				const resourceId = referenceAsset.source?.resourceId;
				const resource = project.resources?.[resourceId];
				if (!resource) {
					throw new Error(
						`Missing project resource for reference image "${referenceAsset.label}".`,
					);
				}
				return await materializeReferenceImageAsset({
					reader,
					referenceAsset,
					index,
					resource,
					onProgress,
					total: normalizedReferenceImages.assets.length,
				});
			},
		);

		const [assetEntries, reconstructedReferenceImageAssets] = await Promise.all(
			[
				Promise.all(assetExtractors.map((extract) => extract())),
				Promise.all(referenceImageExtractors.map((extract) => extract())),
			],
		);

		await notifyProjectReadProgress(onProgress, {
			phase: "expand",
			stage: "expand-complete",
			total: totalAssets,
			referenceTotal: normalizedReferenceImages.assets.length,
		});

		project.scene.referenceImages = {
			...normalizedReferenceImages,
			assets: reconstructedReferenceImageAssets,
		};

		return {
			manifest:
				manifest ||
				buildProjectManifest({
					storageMode: "portable",
					projectPath,
				}),
			project,
			assetEntries,
		};
	} finally {
		await reader.close();
	}
}

export async function openCameraFramesProjectPackage(
	source,
	{ onProgress = null } = {},
) {
	await notifyProjectReadProgress(onProgress, {
		phase: "verify",
		stage: "open-archive",
	});
	const reader = await ZipReader.from(source);
	let closed = false;
	async function close() {
		if (closed) {
			return;
		}
		closed = true;
		await reader.close();
	}

	try {
		const {
			manifest,
			projectPath,
			project,
			normalizedReferenceImages,
			totalAssets,
		} = await readProjectPackageHeader(reader, { onProgress });
		project.scene.referenceImages = normalizedReferenceImages;

		const assetEntries = project.scene.assets.map((asset, index) => {
			const resourceId = asset.source?.resourceId;
			const resource = project.resources?.[resourceId];
			if (!resource) {
				throw new Error(`Missing project resource for asset "${asset.label}".`);
			}
			const clonedResource = cloneResourceForSource(resource, asset.kind);
			return {
				...asset,
				source: createProjectFileLazyResourceSource({
					kind: asset.kind,
					fileName: getResourceFileLabel(resource),
					projectAssetState: asset,
					legacyState: asset.legacyState ?? null,
					resource: clonedResource,
					materialize: async () =>
						await materializeProjectAssetResource({
							reader,
							asset,
							index,
							resource,
							totalAssets,
						}),
				}),
			};
		});

		let referenceImageAssets = null;
		async function materializeReferenceImages({
			onMaterializeProgress = null,
		} = {}) {
			if (referenceImageAssets) {
				return project.scene.referenceImages;
			}
			const total = normalizedReferenceImages.assets.length;
			referenceImageAssets = [];
			for (const [
				index,
				referenceAsset,
			] of normalizedReferenceImages.assets.entries()) {
				const resourceId = referenceAsset.source?.resourceId;
				const resource = project.resources?.[resourceId];
				if (!resource) {
					throw new Error(
						`Missing project resource for reference image "${referenceAsset.label}".`,
					);
				}
				referenceImageAssets.push(
					await materializeReferenceImageAsset({
						reader,
						referenceAsset,
						index,
						resource,
						onProgress: onMaterializeProgress,
						total,
					}),
				);
			}
			project.scene.referenceImages = {
				...normalizedReferenceImages,
				assets: referenceImageAssets,
			};
			return project.scene.referenceImages;
		}

		await notifyProjectReadProgress(onProgress, {
			phase: "expand",
			stage: "expand-complete",
			total: totalAssets,
			referenceTotal: normalizedReferenceImages.assets.length,
		});

		return {
			manifest:
				manifest ||
				buildProjectManifest({
					storageMode: "portable",
					projectPath,
				}),
			project,
			assetEntries,
			assetLoadConcurrency: 1,
			materializeReferenceImages,
			close,
		};
	} catch (error) {
		await close();
		throw error;
	}
}
