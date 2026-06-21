import { renderExportBundleToCanvas } from "../../engine/export-bundle.js";
import {
	createPsdDocumentBlob,
	downloadPsdDocument,
} from "../../engine/psd-export.js";
import { buildSnapshotExportBundle } from "./bundle-build.js";

function canvasToPngBlob(canvas) {
	return new Promise((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (!blob) {
				reject(new Error("Failed to encode PNG output."));
				return;
			}
			resolve(blob);
		}, "image/png");
	});
}

export function renderCompositeOutputCanvas(
	snapshot,
	frames = [],
	{
		drawFramesToContext,
		previewContextError = "error.previewContext",
		buildBundle = buildSnapshotExportBundle,
		renderBundleToCanvas = renderExportBundleToCanvas,
		includeMaskPasses = true,
	} = {},
) {
	return renderBundleToCanvas(
		buildBundle(snapshot, frames, {
			drawFramesToContext,
			previewContextError,
			includeMaskPasses,
		}),
	);
}

export function renderVideoCompositeOutputCanvas(
	snapshot,
	frames = [],
	{
		drawFramesToContext,
		previewContextError = "error.previewContext",
		buildBundle = buildSnapshotExportBundle,
		renderBundleToCanvas = renderExportBundleToCanvas,
	} = {},
) {
	return renderCompositeOutputCanvas(snapshot, frames, {
		drawFramesToContext,
		previewContextError,
		buildBundle,
		renderBundleToCanvas,
		includeMaskPasses: false,
	});
}

export async function createPngBlobFromSnapshot(
	snapshot,
	frames = [],
	{
		drawFramesToContext,
		previewContextError = "error.previewContext",
		buildBundle = buildSnapshotExportBundle,
		renderBundleToCanvas = renderExportBundleToCanvas,
	} = {},
) {
	const compositeCanvas = renderCompositeOutputCanvas(snapshot, frames, {
		drawFramesToContext,
		previewContextError,
		buildBundle,
		renderBundleToCanvas,
	});
	return canvasToPngBlob(compositeCanvas);
}

export function createPsdBlobFromSnapshot(
	documentState,
	snapshot,
	{
		frames = [],
		frameMaskSettings = documentState?.frameMask ?? null,
		drawFramesToContext,
		previewContextError = "error.previewContext",
		buildPsdExportDocument,
		buildBundle = buildSnapshotExportBundle,
		createDocumentBlob = createPsdDocumentBlob,
	} = {},
) {
	const bundle = buildBundle(snapshot, frames, {
		drawFramesToContext,
		previewContextError,
		frameMaskSettings,
	});
	const psdDocument = buildPsdExportDocument(bundle, frames);
	return createDocumentBlob(psdDocument);
}

export function downloadPngFromSnapshot(
	documentState,
	snapshot,
	sequenceIndex = null,
	{
		frames = [],
		drawFramesToContext,
		previewContextError = "error.previewContext",
		buildFilename,
		buildBundle = buildSnapshotExportBundle,
		renderBundleToCanvas = renderExportBundleToCanvas,
		createLink = () => document.createElement("a"),
	} = {},
) {
	const compositeCanvas = renderCompositeOutputCanvas(snapshot, frames, {
		drawFramesToContext,
		previewContextError,
		buildBundle,
		renderBundleToCanvas,
	});
	const link = createLink();
	link.href = compositeCanvas.toDataURL("image/png");
	link.download = buildFilename(documentState, snapshot, "png", sequenceIndex);
	link.click();
	return link;
}

export function downloadPsdFromSnapshot(
	documentState,
	snapshot,
	sequenceIndex = null,
	{
		frames = [],
		frameMaskSettings = documentState?.frameMask ?? null,
		drawFramesToContext,
		previewContextError = "error.previewContext",
		buildFilename,
		buildPsdExportDocument,
		buildBundle = buildSnapshotExportBundle,
		downloadDocument = downloadPsdDocument,
	} = {},
) {
	const bundle = buildBundle(snapshot, frames, {
		drawFramesToContext,
		previewContextError,
		frameMaskSettings,
	});
	const psdDocument = buildPsdExportDocument(bundle, frames);
	const downloadState = {
		...psdDocument,
		filename: buildFilename(documentState, snapshot, "psd", sequenceIndex),
	};
	downloadDocument(downloadState);
	return downloadState;
}
