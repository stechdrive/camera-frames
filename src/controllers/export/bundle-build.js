import {
	createExportBundle,
	createExportPass,
	createPixelLayer,
	createRasterLayer,
} from "../../engine/export-bundle.js";
import { buildExportPassPlan } from "../../engine/export-pass-plan.js";
import {
	REFERENCE_IMAGE_GROUP_BACK,
	REFERENCE_IMAGE_GROUP_FRONT,
} from "../../reference-image-model.js";
import { sanitizeFrameName } from "../../workspace-model.js";

export function buildFrameOverlayLayers(
	width,
	height,
	frames = [],
	{
		drawFramesToContext,
		previewContextError = "error.previewContext",
		createCanvas = () => document.createElement("canvas"),
	} = {},
) {
	return [...frames]
		.sort(
			(left, right) =>
				(left.order ?? 0) - (right.order ?? 0) ||
				String(left.id ?? "").localeCompare(String(right.id ?? "")),
		)
		.map((frame, index) => {
			const canvas = createCanvas();
			canvas.width = width;
			canvas.height = height;

			const context = canvas.getContext("2d");
			if (!context) {
				throw new Error(previewContextError);
			}

			context.clearRect(0, 0, width, height);
			drawFramesToContext(context, width, height, [frame], {
				logicalSpaceWidth: width,
				logicalSpaceHeight: height,
				strokeStyle: "#ff0000",
			});

			return createRasterLayer({
				name: sanitizeFrameName(frame?.name, `FRAME ${index + 1}`),
				canvas,
				category: "frame",
				metadata: {
					frameId: frame?.id ?? null,
					order: frame?.order ?? index,
				},
			});
		});
}

export function buildSnapshotExportBundle(
	{
		width,
		height,
		pixels,
		exportSettings = null,
		sceneAssets = [],
		readiness = null,
		maskPasses: renderedMaskPasses = [],
		gridGuidePixels = null,
		eyeLevelPixels = null,
		referenceImageLayers = [],
		psdBasePixels = null,
		backgroundCanvas = null,
		modelLayers = [],
		modelDebugGroups = [],
		splatLayers = [],
		splatDebugGroups = [],
	},
	frames = [],
	{
		drawFramesToContext,
		previewContextError = "error.previewContext",
		createCanvas = () => document.createElement("canvas"),
	} = {},
) {
	const passPlan = buildExportPassPlan(sceneAssets);
	const renderedMaskPassesById = new Map(
		renderedMaskPasses.map((maskPass) => [maskPass.id, maskPass]),
	);
	const beautyPass = createExportPass({
		id: passPlan.beauty.id,
		name: passPlan.beauty.name,
		category: passPlan.beauty.category,
		metadata: {
			sceneAssets,
			readiness,
			role: "beauty",
			assetIds: passPlan.beauty.assetIds,
		},
		layers: [
			createPixelLayer({
				name: "Render",
				pixels,
				width,
				height,
				category: "render",
				metadata: {
					sceneAssets,
					readiness,
					passId: "beauty",
					assetIds: passPlan.beauty.assetIds,
				},
			}),
		],
	});
	const gridPass =
		exportSettings?.exportGridOverlay && gridGuidePixels
			? createExportPass({
					id: "guide-grid",
					name: "Grid",
					category: "guide",
					metadata: {
						role: "guide-grid",
						gridLayerMode: exportSettings.exportGridLayerMode ?? "bottom",
					},
					layers: [
						createPixelLayer({
							name: "Grid",
							pixels: gridGuidePixels,
							width,
							height,
							category: "guide",
						}),
					],
				})
			: null;
	const eyeLevelPass =
		exportSettings?.exportGridOverlay && eyeLevelPixels
			? createExportPass({
					id: "guide-eye-level",
					name: "Eye Level",
					category: "guide",
					metadata: {
						role: "guide-eye-level",
					},
					layers: [
						createPixelLayer({
							name: "Eye Level",
							pixels: eyeLevelPixels,
							width,
							height,
							category: "guide",
						}),
					],
				})
			: null;
	const referenceBackPass =
		referenceImageLayers.filter(
			(layer) => layer.group === REFERENCE_IMAGE_GROUP_BACK,
		).length > 0
			? createExportPass({
					id: "reference-images-back",
					name: "Reference Images Back",
					category: "reference-image",
					metadata: {
						role: "reference-images-back",
					},
					layers: referenceImageLayers
						.filter((layer) => layer.group === REFERENCE_IMAGE_GROUP_BACK)
						.map((layer) =>
							createRasterLayer({
								name: layer.name,
								canvas: layer.canvas,
								left: layer.bounds?.left ?? 0,
								top: layer.bounds?.top ?? 0,
								opacity: layer.opacity,
								category: "reference-image",
								metadata: {
									group: layer.group,
									order: layer.order,
									itemId: layer.id,
									assetId: layer.assetId,
								},
							}),
						),
				})
			: null;
	const referenceFrontPass =
		referenceImageLayers.filter(
			(layer) => layer.group === REFERENCE_IMAGE_GROUP_FRONT,
		).length > 0
			? createExportPass({
					id: "reference-images-front",
					name: "Reference Images Front",
					category: "reference-image",
					metadata: {
						role: "reference-images-front",
					},
					layers: referenceImageLayers
						.filter((layer) => layer.group === REFERENCE_IMAGE_GROUP_FRONT)
						.map((layer) =>
							createRasterLayer({
								name: layer.name,
								canvas: layer.canvas,
								left: layer.bounds?.left ?? 0,
								top: layer.bounds?.top ?? 0,
								opacity: layer.opacity,
								category: "reference-image",
								metadata: {
									group: layer.group,
									order: layer.order,
									itemId: layer.id,
									assetId: layer.assetId,
								},
							}),
						),
				})
			: null;
	const orderedPasses = [];
	if (backgroundCanvas) {
		orderedPasses.push(
			createExportPass({
				id: "background",
				name: "Background",
				category: "background",
				metadata: {
					role: "background",
				},
				layers: [
					createRasterLayer({
						name: "Background",
						canvas: backgroundCanvas,
						category: "background",
					}),
				],
			}),
		);
	}
	if ((exportSettings?.exportGridLayerMode ?? "bottom") === "bottom") {
		if (referenceBackPass) {
			orderedPasses.push(referenceBackPass);
		}
		if (gridPass) {
			orderedPasses.push(gridPass);
		}
		orderedPasses.push(beautyPass);
	} else {
		if (referenceBackPass) {
			orderedPasses.push(referenceBackPass);
		}
		orderedPasses.push(beautyPass);
		if (gridPass) {
			orderedPasses.push(gridPass);
		}
	}
	if (referenceFrontPass) {
		orderedPasses.push(referenceFrontPass);
	}
	if (eyeLevelPass) {
		orderedPasses.push(eyeLevelPass);
	}
	orderedPasses.push(
		createExportPass({
			id: "frame-overlay",
			name: "Frame Overlay",
			category: "overlay",
			metadata: {
				role: "frame-overlay",
			},
			layers: buildFrameOverlayLayers(width, height, frames, {
				drawFramesToContext,
				previewContextError,
				createCanvas,
			}),
		}),
	);
	const bundle = createExportBundle({
		width,
		height,
		sceneAssets,
		readiness,
		passes: [
			...orderedPasses,
			...passPlan.masks.map((maskPass) =>
				createExportPass({
					id: maskPass.id,
					name: maskPass.name,
					category: maskPass.category,
					metadata: {
						role: "mask",
						maskGroup: maskPass.maskGroup,
						assetIds: maskPass.assetIds,
					},
					layers: renderedMaskPassesById.has(maskPass.id)
						? [
								createPixelLayer({
									name: "Mask",
									pixels: renderedMaskPassesById.get(maskPass.id).pixels,
									width,
									height,
									category: "mask",
									metadata: {
										passId: maskPass.id,
										maskGroup: maskPass.maskGroup,
										assetIds: maskPass.assetIds,
									},
								}),
							]
						: [],
					enabled: false,
				}),
			),
		],
	});
	return {
		...bundle,
		exportSettings,
		psdBasePixels,
		backgroundCanvas,
		gridGuidePixels,
		eyeLevelPixels,
		referenceImageLayers,
		modelLayers,
		modelDebugGroups,
		splatLayers,
		splatDebugGroups,
	};
}
