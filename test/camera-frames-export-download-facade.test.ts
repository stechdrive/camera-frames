import assert from "node:assert/strict";
import {
	buildAnimationArchiveFilename,
	buildShotCameraFrameExportFilename,
	buildShotCameraExportFilename,
	buildShotCameraVideoExportFilename,
	createBatchSequenceIndexResolver,
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
	const buildFilename = (documentState, _snapshot, format, sequenceIndex) =>
		buildShotCameraExportFilename(documentState, null, format, sequenceIndex, {
			shotCameras: [{ id: "camera-a", name: "Camera A" }],
			getShotCameraExportBaseName: (state) => state.name,
		});
	assert.equal(
		buildShotCameraFrameExportFilename(
			{ id: "camera-a", name: "Camera A" },
			null,
			"png",
			null,
			12,
			{ buildFilename },
		),
		"Camera A-f0012.png",
	);
	assert.equal(
		buildShotCameraVideoExportFilename(
			{ id: "camera-a", name: "Camera A" },
			null,
			null,
			{ buildFilename },
		),
		"Camera A.webm",
	);
	assert.equal(
		buildAnimationArchiveFilename(
			[{ id: "camera-a", name: "Camera A" }],
			"sequence",
			buildFilename,
		),
		"Camera A-sequence.zip",
	);
}

{
	const resolveSequenceIndex = createBatchSequenceIndexResolver(
		[
			{ id: "camera-a", name: "A" },
			{ id: "camera-b", name: "B" },
		],
		() => "png",
		(documentState, _snapshot, format, sequenceIndex) =>
			buildShotCameraExportFilename(
				documentState,
				null,
				format,
				sequenceIndex,
				{
					shotCameras: [
						{ id: "camera-a", name: "A" },
						{ id: "camera-b", name: "B" },
					],
					getShotCameraExportBaseName: (state) => state.name,
				},
			),
	);

	assert.equal(resolveSequenceIndex({ id: "camera-a" }), null);
	assert.equal(resolveSequenceIndex({ id: "camera-b" }), null);
}

{
	const resolveSequenceIndex = createBatchSequenceIndexResolver(
		[
			{ id: "camera-a", name: "A" },
			{ id: "camera-b", name: "A" },
		],
		() => "png",
		(documentState, _snapshot, format, sequenceIndex) =>
			buildShotCameraExportFilename(
				documentState,
				null,
				format,
				sequenceIndex,
				{
					shotCameras: [
						{ id: "camera-a", name: "A" },
						{ id: "camera-b", name: "A" },
					],
					getShotCameraExportBaseName: (state) => state.name,
				},
			),
	);

	assert.equal(resolveSequenceIndex({ id: "camera-a" }), 1);
	assert.equal(resolveSequenceIndex({ id: "camera-b" }), 2);
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

{
	const calls = [];
	const facade = createExportDownloadFacade({
		getTargetDocuments: () => [
			{ id: "camera-a", name: "Same", frames: [] },
			{ id: "camera-b", name: "Same", frames: [] },
		],
		getExportSettings: () => ({ exportFormat: "png" }),
		renderSnapshot: async () => ({ width: 640, height: 480 }),
		downloadPngFromSnapshot: (
			documentState,
			_snapshot,
			sequenceIndex,
			options,
		) => {
			calls.push(
				options.buildFilename(documentState, null, "png", sequenceIndex),
			);
		},
		downloadPsdFromSnapshot: () => {},
		drawFramesToContext: "draw",
		previewContextError: "preview-error",
		buildFilename: (documentState, _snapshot, format, sequenceIndex) =>
			buildShotCameraExportFilename(
				documentState,
				null,
				format,
				sequenceIndex,
				{
					shotCameras: [
						{ id: "camera-a", name: "Same" },
						{ id: "camera-b", name: "Same" },
					],
					getShotCameraExportBaseName: (state) => state.name,
				},
			),
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
			for (const [index, documentState] of config.targetDocuments.entries()) {
				const snapshot = await config.renderSnapshot(documentState);
				config.downloadSnapshot(
					documentState,
					snapshot,
					index,
					config.targetDocuments,
				);
			}
		},
		runPsdExportFn: async () => {},
		runOutputExportFn: async () => {},
	});

	await facade.downloadPng();
	assert.deepEqual(calls, ["Same-01.png", "Same-02.png"]);
}

{
	const calls = [];
	const facade = createExportDownloadFacade({
		getTargetDocuments: () => [
			{ id: "camera-a", name: "A", frames: [] },
			{ id: "camera-b", name: "B", frames: [] },
		],
		getExportSettings: () => ({ exportFormat: "png" }),
		renderSnapshot: async () => ({ width: 640, height: 480 }),
		downloadPngFromSnapshot: (
			documentState,
			_snapshot,
			sequenceIndex,
			options,
		) => {
			calls.push(
				options.buildFilename(documentState, null, "png", sequenceIndex),
			);
		},
		downloadPsdFromSnapshot: () => {},
		drawFramesToContext: "draw",
		previewContextError: "preview-error",
		buildFilename: (documentState, _snapshot, format, sequenceIndex) =>
			buildShotCameraExportFilename(
				documentState,
				null,
				format,
				sequenceIndex,
				{
					shotCameras: [
						{ id: "camera-a", name: "A" },
						{ id: "camera-b", name: "B" },
					],
					getShotCameraExportBaseName: (state) => state.name,
				},
			),
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
			for (const [index, documentState] of config.targetDocuments.entries()) {
				const snapshot = await config.renderSnapshot(documentState);
				config.downloadSnapshot(
					documentState,
					snapshot,
					index,
					config.targetDocuments,
				);
			}
		},
		runPsdExportFn: async () => {},
		runOutputExportFn: async () => {},
	});

	await facade.downloadPng();
	assert.deepEqual(calls, ["A.png", "B.png"]);
}

{
	const calls = [];
	const facade = createExportDownloadFacade({
		getTargetDocuments: () => [
			{ id: "camera-a", name: "Camera A", frames: [] },
		],
		getExportSettings: () => ({ exportFormat: "png" }),
		getExportMode: () => "sequence",
		getExportFrameSource: () => "keyframes",
		getAnimationDocument: () => ({
			activeClipId: "clip-a",
			clips: [
				{
					id: "clip-a",
					startFrame: 1,
					durationFrames: 5,
					bindings: [
						{
							id: "binding-a",
							target: { kind: "shot-camera", id: "camera-a" },
							tracks: [
								{
									path: "transform.position.x",
									keys: [
										{ frame: 2, value: 0 },
										{ frame: 4, value: 1 },
									],
								},
							],
						},
					],
				},
			],
		}),
		renderSnapshot: async (shotCameraId, options) => {
			calls.push(["render", shotCameraId, options.timelineFrame]);
			return { id: `snapshot-${options.timelineFrame}` };
		},
		createPngBlobFromSnapshot: async (snapshot) => {
			calls.push(["pngBlob", snapshot.id]);
			return new Blob([snapshot.id]);
		},
		createPsdBlobFromSnapshot: () => {
			throw new Error("not expected");
		},
		createZipBlob: async (entries) => {
			calls.push(["zip", entries.map((entry) => entry.path)]);
			return new Blob(["zip"]);
		},
		downloadBlob: (blob, filename) =>
			calls.push(["downloadBlob", filename, blob.size]),
		downloadPngFromSnapshot: () => {},
		downloadPsdFromSnapshot: () => {},
		drawFramesToContext: "draw",
		previewContextError: "preview-error",
		buildFilename: (documentState, _snapshot, format, sequenceIndex) =>
			buildShotCameraExportFilename(
				documentState,
				null,
				format,
				sequenceIndex,
				{
					shotCameras: [{ id: "camera-a", name: "Camera A" }],
					getShotCameraExportBaseName: (state) => state.name,
				},
			),
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
		runPngExportFn: async () => {},
		runPsdExportFn: async () => {},
		runOutputExportFn: async () => {},
		runFrameSequenceExportFn: async (config) => {
			assert.deepEqual(config.frames, [2, 4]);
			for (const [index, frame] of config.frames.entries()) {
				const snapshot = await config.renderSnapshot(
					config.targetDocuments[0],
					frame,
					index,
					config.targetDocuments,
					() => {},
				);
				await config.createSnapshotBlob(
					config.targetDocuments[0],
					snapshot,
					"png",
					frame,
					index,
					config.targetDocuments,
				);
			}
			const entries = config.frames.map((frame) => ({
				path: config.buildEntryPath(
					config.targetDocuments[0],
					null,
					"png",
					frame,
				),
				data: new Blob(["entry"]),
			}));
			const zipBlob = await config.createArchiveBlob(entries);
			config.downloadArchive(zipBlob, config.archiveFilename);
		},
		runVideoExportFn: async () => {},
	});

	await facade.downloadOutput();
	assert.deepEqual(calls, [
		["render", "camera-a", 2],
		["pngBlob", "snapshot-2"],
		["render", "camera-a", 4],
		["pngBlob", "snapshot-4"],
		["zip", ["Camera A-f0002.png", "Camera A-f0004.png"]],
		["downloadBlob", "Camera A-sequence.zip", 3],
	]);
}

{
	const calls = [];
	const facade = createExportDownloadFacade({
		getTargetDocuments: () => [
			{ id: "camera-a", name: "Camera A", frames: [] },
		],
		getExportSettings: () => ({ exportFormat: "psd" }),
		getExportMode: () => "video",
		getExportFrameSource: () => "duration",
		getAnimationDocument: () => ({
			activeClipId: "clip-a",
			clips: [{ id: "clip-a", startFrame: 8, durationFrames: 2 }],
		}),
		getVideoExportFps: () => 12,
		isVideoExportSupported: () => true,
		renderSnapshot: async (shotCameraId, options) => {
			calls.push([
				"renderVideo",
				shotCameraId,
				options.timelineFrame,
				options.exportSettingsOverride,
			]);
			return { frame: options.timelineFrame };
		},
		renderCompositeOutputCanvas: (snapshot) => ({ canvas: snapshot.frame }),
		createWebmFromFrameRenderer: async () => new Blob(["video"]),
		createZipBlob: async () => new Blob(["zip"]),
		downloadBlob: (blob, filename) =>
			calls.push(["downloadBlob", filename, blob.size]),
		downloadPngFromSnapshot: () => {},
		downloadPsdFromSnapshot: () => {},
		drawFramesToContext: "draw",
		previewContextError: "preview-error",
		buildFilename: (documentState, _snapshot, format, sequenceIndex) =>
			buildShotCameraExportFilename(
				documentState,
				null,
				format,
				sequenceIndex,
				{
					shotCameras: [{ id: "camera-a", name: "Camera A" }],
					getShotCameraExportBaseName: (state) => state.name,
				},
			),
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
		runPngExportFn: async () => {},
		runPsdExportFn: async () => {},
		runOutputExportFn: async () => {},
		runFrameSequenceExportFn: async () => {},
		runVideoExportFn: async (config) => {
			assert.deepEqual(config.frames, [8, 9]);
			assert.equal(config.fps, 12);
			const snapshot = await config.renderSnapshot(
				config.targetDocuments[0],
				config.frames[0],
				0,
				config.targetDocuments,
				() => {},
			);
			assert.deepEqual(
				config.renderVideoFrame(config.targetDocuments[0], snapshot),
				{
					canvas: 8,
				},
			);
			config.downloadVideo(
				new Blob(["video"]),
				config.buildVideoFilename(config.targetDocuments[0], null, null),
			);
		},
	});

	await facade.downloadOutput();
	assert.deepEqual(calls, [
		[
			"renderVideo",
			"camera-a",
			8,
			{
				exportFormat: "png",
				exportModelLayers: false,
				exportSplatLayers: false,
			},
		],
		["downloadBlob", "Camera A.webm", 5],
	]);
}

console.log("✅ CAMERA_FRAMES export download facade tests passed!");
