import assert from "node:assert/strict";
import {
	buildShotCameraExportFilename,
	createExportBundleFacade,
	createExportDownloadFacade,
	createPsdExportDocumentBuilder,
} from "../src/controllers/export/download-facade.js";

{
	const filename = buildShotCameraExportFilename(
		{ id: "camera-b", name: "Camera B" },
		null,
		"psd",
		3,
		{
			shotCameras: [{ id: "camera-a" }, { id: "camera-b" }],
			getShotCameraExportBaseName: (documentState, fallbackIndex) =>
				`${documentState.name}-${fallbackIndex}`,
		},
	);

	assert.equal(filename, "Camera B-2-03.psd");
}

{
	const calls = [];
	const buildPsdExportDocument = createPsdExportDocumentBuilder({
		getFrames: () => [{ id: "frame-a" }],
		t: (key) => `t:${key}`,
		exportDebugLayersEnabled: true,
		createCanvasFromPixels: () => "canvas",
		renderExportPassToCanvas: () => "rendered",
		buildPsdDocument: (bundle, frames, options) => {
			calls.push([bundle, frames, options]);
			return { bundle, frames, options };
		},
	});

	const result = buildPsdExportDocument({ id: "bundle-a" });
	assert.deepEqual(result.frames, [{ id: "frame-a" }]);
	assert.equal(calls[0][2].groupLabel, "t:section.referenceImages");
	assert.equal(calls[0][2].frameGroupLabel, "t:section.frames");
	assert.equal(calls[0][2].exportDebugLayersEnabled, true);
}

{
	const bundleFacade = createExportBundleFacade({
		getFrames: () => [{ id: "frame-a" }],
		drawFramesToContext: "draw",
		previewContextError: "preview-error",
		buildSnapshotExportBundle: (snapshot, frames, options) => ({
			kind: "bundle",
			snapshot,
			frames,
			options,
		}),
		renderCompositeOutputCanvas: (snapshot, frames, options) => ({
			kind: "canvas",
			snapshot,
			frames,
			options,
		}),
	});

	assert.deepEqual(bundleFacade.buildExportBundle({ id: "snapshot-a" }), {
		kind: "bundle",
		snapshot: { id: "snapshot-a" },
		frames: [{ id: "frame-a" }],
		options: {
			drawFramesToContext: "draw",
			previewContextError: "preview-error",
		},
	});
	assert.deepEqual(
		bundleFacade.renderCompositeOutputCanvas({ id: "snapshot-b" }),
		{
			kind: "canvas",
			snapshot: { id: "snapshot-b" },
			frames: [{ id: "frame-a" }],
			options: {
				drawFramesToContext: "draw",
				previewContextError: "preview-error",
			},
		},
	);
}

{
	const calls = [];
	const facade = createExportDownloadFacade({
		getTargetDocuments: () => [{ id: "camera-a", frames: [{ id: "frame-a" }] }],
		getExportSettings: () => ({ exportFormat: "png" }),
		renderSnapshot: async (shotCameraId, options) => {
			calls.push(["render", shotCameraId, options]);
			return { width: 640, height: 480 };
		},
		downloadPngFromSnapshot: (
			documentState,
			snapshot,
			sequenceIndex,
			options,
		) => {
			calls.push([
				"png",
				documentState.id,
				snapshot.width,
				sequenceIndex,
				options.buildFilename(documentState, snapshot, "png", sequenceIndex),
			]);
		},
		downloadPsdFromSnapshot: (
			documentState,
			snapshot,
			sequenceIndex,
			options,
		) => {
			calls.push([
				"psd",
				documentState.id,
				snapshot.width,
				sequenceIndex,
				Boolean(options.buildPsdExportDocument),
			]);
		},
		drawFramesToContext: "draw",
		previewContextError: "preview-error",
		buildFilename: () => "name.png",
		buildPsdExportDocument: () => "psd",
		setExportStatus: () => {},
		setSummary: () => {},
		setStatus: () => {},
		updateUi: () => {},
		clearExportOverlay: () => {},
		showExportErrorOverlay: () => {},
		setExportProgressOverlay: () => {},
		getPhaseDefaultDetail: () => "detail",
		requireTargetsMessage: "missing",
		t: (key) => key,
		runPngExportFn: async (config) => {
			calls.push(["runPng", config.targetDocuments.length]);
			const snapshot = await config.renderSnapshot(config.targetDocuments[0]);
			config.downloadSnapshot(
				config.targetDocuments[0],
				snapshot,
				0,
				config.targetDocuments,
			);
		},
		runPsdExportFn: async (config) => {
			calls.push(["runPsd", config.targetDocuments.length]);
			const snapshot = await config.renderSnapshot(config.targetDocuments[0]);
			config.downloadSnapshot(
				config.targetDocuments[0],
				snapshot,
				0,
				config.targetDocuments,
			);
		},
		runOutputExportFn: async (config) => {
			calls.push(["runOutput", config.targetDocuments.length]);
			const snapshot = await config.renderSnapshot(
				config.targetDocuments[0],
				0,
				config.targetDocuments,
				() => {},
			);
			config.downloadPngSnapshot(config.targetDocuments[0], snapshot, null);
		},
	});

	await facade.downloadPng();
	await facade.downloadPsd();
	await facade.downloadOutput();

	assert.deepEqual(calls[0], ["runPng", 1]);
	assert.deepEqual(calls[1], ["render", "camera-a", undefined]);
	assert.deepEqual(calls[2], ["png", "camera-a", 640, null, "name.png"]);
	assert.deepEqual(calls[3], ["runPsd", 1]);
	assert.deepEqual(calls[4], ["render", "camera-a", undefined]);
	assert.deepEqual(calls[5], ["psd", "camera-a", 640, null, true]);
	assert.deepEqual(calls[6], ["runOutput", 1]);
	assert.equal(calls[7][0], "render");
	assert.equal(calls[7][1], "camera-a");
	assert.equal(typeof calls[7][2]?.onProgress, "function");
	assert.deepEqual(calls[8], ["png", "camera-a", 640, null, "name.png"]);
}

console.log("✅ CAMERA_FRAMES export download facade tests passed!");
