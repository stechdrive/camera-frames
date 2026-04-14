import { renderExportBundleToCanvas } from "../../engine/export-bundle.js";
import { downloadPsdDocument } from "../../engine/psd-export.js";
import { buildSnapshotExportBundle } from "./bundle-build.js";

export function renderCompositeOutputCanvas(
	snapshot,
	frames = [],
	{
		drawFramesToContext,
		previewContextError = "error.previewContext",
		buildBundle = buildSnapshotExportBundle,
		renderBundleToCanvas = renderExportBundleToCanvas,
	} = {},
) {
	return renderBundleToCanvas(
		buildBundle(snapshot, frames, {
			drawFramesToContext,
			previewContextError,
		}),
	);
}

export function downloadPngFromSnapshot(
	documentState,
	snapshot,
	sequenceIndex = null,
	{
		frames = [],
		frameMaskSettings = documentState?.frameMask ?? null,
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
