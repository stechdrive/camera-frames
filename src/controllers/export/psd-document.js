import { getAllExportBundlePasses } from "../../engine/export-bundle.js";
import {
	createAllFrameMaskPsdLayerDocument,
	createFrameTrajectoryPsdLayerDocument,
} from "../../engine/frame-mask-export.js";
import {
	FRAME_TRAJECTORY_EXPORT_SOURCE_BOTTOM_LEFT,
	FRAME_TRAJECTORY_EXPORT_SOURCE_BOTTOM_RIGHT,
	FRAME_TRAJECTORY_EXPORT_SOURCE_CENTER,
	FRAME_TRAJECTORY_EXPORT_SOURCE_NONE,
	FRAME_TRAJECTORY_EXPORT_SOURCE_TOP_LEFT,
	FRAME_TRAJECTORY_EXPORT_SOURCE_TOP_RIGHT,
} from "../../engine/frame-trajectory.js";
import { getPsdReferenceImageGroupLayers } from "../../engine/reference-image-export-order.js";
import {
	REFERENCE_IMAGE_GROUP_BACK,
	REFERENCE_IMAGE_GROUP_FRONT,
} from "../../reference-image-model.js";

function buildReferenceImageGroupDocument(
	referenceImageLayers,
	group,
	groupLabel,
) {
	if (!referenceImageLayers.some((layer) => layer.group === group)) {
		return null;
	}

	return {
		name: groupLabel,
		opened: false,
		children: getPsdReferenceImageGroupLayers(referenceImageLayers, group).map(
			(layer) => ({
				name: layer.name,
				canvas: layer.canvas,
				left: layer.bounds?.left ?? 0,
				top: layer.bounds?.top ?? 0,
				opacity: layer.opacity,
			}),
		),
	};
}

export function buildPsdExportDocument(
	bundle,
	frames = [],
	{
		groupLabel = "Reference Images",
		frameGroupLabel = "Frames",
		exportDebugLayersEnabled = false,
		createCanvasFromPixels,
		createFrameMaskLayerDocument = createAllFrameMaskPsdLayerDocument,
		createFrameTrajectoryLayerDocument = createFrameTrajectoryPsdLayerDocument,
		createCanvas,
		renderExportPassToCanvas,
	} = {},
) {
	const passes = getAllExportBundlePasses(bundle).filter(
		(pass) => pass.enabled !== false && pass.layers?.length,
	);
	const beautyPass = passes.find((pass) => pass.id === "beauty") ?? null;
	const backgroundPass =
		passes.find((pass) => pass.id === "background") ?? null;
	const snapshotExportSettings = bundle.exportSettings ?? {
		exportGridLayerMode: "bottom",
		exportModelLayers: false,
		exportSplatLayers: false,
	};
	const gridPass = passes.find((pass) => pass.id === "guide-grid") ?? null;
	const eyeLevelPass =
		passes.find((pass) => pass.id === "guide-eye-level") ?? null;
	const frameOverlayPass =
		passes.find((pass) => pass.id === "frame-overlay") ?? null;
	const referenceImageLayers = Array.isArray(bundle.referenceImageLayers)
		? [...bundle.referenceImageLayers]
		: [];

	const modelLayers = snapshotExportSettings.exportModelLayers
		? [...(bundle.modelLayers ?? [])].reverse()
		: [];
	const splatLayers = snapshotExportSettings.exportSplatLayers
		? [...(bundle.splatLayers ?? [])].reverse()
		: [];
	const modelDebugGroups =
		snapshotExportSettings.exportModelLayers && exportDebugLayersEnabled
			? [...(bundle.modelDebugGroups ?? [])]
			: [];
	const splatDebugGroups =
		snapshotExportSettings.exportSplatLayers && exportDebugLayersEnabled
			? [...(bundle.splatDebugGroups ?? [])]
			: [];
	const renderLayer =
		beautyPass?.layers?.find((layer) => layer.type === "pixels") ?? null;
	const renderLayerDocument =
		renderLayer && typeof createCanvasFromPixels === "function"
			? {
					name: "Render",
					canvas: createCanvasFromPixels(
						bundle.psdBasePixels ?? renderLayer.pixels,
						bundle.width,
						bundle.height,
					),
				}
			: null;
	const backgroundLayerDocument =
		backgroundPass && typeof renderExportPassToCanvas === "function"
			? {
					name: "Background",
					canvas: renderExportPassToCanvas(bundle, backgroundPass),
				}
			: null;
	const gridLayerDocument =
		gridPass && typeof renderExportPassToCanvas === "function"
			? {
					name: "Grid",
					canvas: renderExportPassToCanvas(bundle, gridPass),
				}
			: null;
	const eyeLevelLayerDocument =
		eyeLevelPass && typeof renderExportPassToCanvas === "function"
			? {
					name: "Eye Level",
					canvas: renderExportPassToCanvas(bundle, eyeLevelPass),
				}
			: null;
	const referenceImagesBackLayerDocument = buildReferenceImageGroupDocument(
		referenceImageLayers,
		REFERENCE_IMAGE_GROUP_BACK,
		groupLabel,
	);
	const referenceImagesFrontLayerDocument = buildReferenceImageGroupDocument(
		referenceImageLayers,
		REFERENCE_IMAGE_GROUP_FRONT,
		groupLabel,
	);
	const trajectoryLayerNameBySource = {
		[FRAME_TRAJECTORY_EXPORT_SOURCE_CENTER]: "Trajectory",
		[FRAME_TRAJECTORY_EXPORT_SOURCE_TOP_LEFT]: "Trajectory Top Left",
		[FRAME_TRAJECTORY_EXPORT_SOURCE_TOP_RIGHT]: "Trajectory Top Right",
		[FRAME_TRAJECTORY_EXPORT_SOURCE_BOTTOM_RIGHT]: "Trajectory Bottom Right",
		[FRAME_TRAJECTORY_EXPORT_SOURCE_BOTTOM_LEFT]: "Trajectory Bottom Left",
	};
	const trajectoryExportSource =
		bundle.frameMaskSettings?.trajectoryExportSource ??
		FRAME_TRAJECTORY_EXPORT_SOURCE_NONE;
	const frameTrajectoryLayerDocument = createFrameTrajectoryLayerDocument(
		frames,
		bundle.width,
		bundle.height,
		{
			name: trajectoryLayerNameBySource[trajectoryExportSource] ?? "Trajectory",
			createCanvas,
			frameMaskSettings: bundle.frameMaskSettings,
			trajectorySource: trajectoryExportSource,
		},
	);
	const frameOverlayLayerDocument = frameOverlayPass
		? {
				name: frameGroupLabel,
				opened: false,
				children: [
					...(frameOverlayPass.layers ?? []).map((layer) => ({
						name: layer.name,
						canvas: layer.canvas,
						left: layer.left ?? 0,
						top: layer.top ?? 0,
						opacity: layer.opacity,
					})),
					...(frameTrajectoryLayerDocument
						? [frameTrajectoryLayerDocument]
						: []),
				],
			}
		: null;
	const frameMaskLayerDocument = createFrameMaskLayerDocument(
		frames,
		bundle.width,
		bundle.height,
		{
			frameMaskSettings: bundle.frameMaskSettings,
			createCanvas,
		},
	);
	const orderedLayers = [];
	if (backgroundLayerDocument) {
		orderedLayers.push(backgroundLayerDocument);
	}
	if (snapshotExportSettings.exportGridLayerMode === "bottom") {
		if (referenceImagesBackLayerDocument) {
			orderedLayers.push(referenceImagesBackLayerDocument);
		}
		if (gridLayerDocument) {
			orderedLayers.push(gridLayerDocument);
		}
	} else if (referenceImagesBackLayerDocument) {
		orderedLayers.push(referenceImagesBackLayerDocument);
	}
	if (renderLayerDocument) {
		orderedLayers.push(renderLayerDocument);
	}
	orderedLayers.push(...splatLayers, ...modelLayers);
	if (snapshotExportSettings.exportGridLayerMode !== "bottom") {
		if (gridLayerDocument) {
			orderedLayers.push(gridLayerDocument);
		}
	}
	if (eyeLevelLayerDocument) {
		orderedLayers.push(eyeLevelLayerDocument);
	}
	if (referenceImagesFrontLayerDocument) {
		orderedLayers.push(referenceImagesFrontLayerDocument);
	}
	if (frameOverlayLayerDocument) {
		orderedLayers.push(frameOverlayLayerDocument);
	}

	return {
		width: bundle.width,
		height: bundle.height,
		layers: [
			...orderedLayers,
			...splatDebugGroups,
			...modelDebugGroups,
			...(frameMaskLayerDocument ? [frameMaskLayerDocument] : []),
		],
	};
}
