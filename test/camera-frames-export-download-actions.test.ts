import assert from "node:assert/strict";
import {
	runFrameSequenceExport,
	runOutputExport,
	runPngExport,
	runPsdExport,
	runVideoExport,
} from "../src/controllers/export/download-actions.js";

{
	const calls = [];
	await runPngExport({
		targetDocuments: [{ id: "camera-a" }, { id: "camera-b" }],
		renderSnapshot: async (documentState, index, targetDocuments) => {
			calls.push(["render", documentState.id, index, targetDocuments.length]);
			return { width: 640, height: 480 };
		},
		downloadSnapshot: (documentState, snapshot, index, targetDocuments) => {
			calls.push([
				"download",
				documentState.id,
				snapshot.width,
				index,
				targetDocuments.length,
			]);
		},
		setExportStatus: (...args) => calls.push(["setExportStatus", ...args]),
		setSummary: (value) => calls.push(["setSummary", value]),
		setStatus: (value) => calls.push(["setStatus", value]),
		updateUi: () => calls.push(["updateUi"]),
		requireTargetsMessage: "missing",
		t: (key, values = {}) => `${key}:${JSON.stringify(values)}`,
	});

	assert.deepEqual(calls[0], ["setExportStatus", "export.exporting", true]);
	assert.deepEqual(calls[1], ["render", "camera-a", 0, 2]);
	assert.deepEqual(calls[2], ["download", "camera-a", 640, 0, 2]);
	assert.deepEqual(calls[3], ["render", "camera-b", 1, 2]);
	assert.deepEqual(calls[4], ["download", "camera-b", 640, 1, 2]);
	assert.deepEqual(calls[5], [
		"setSummary",
		'exportSummary.exportedBatch:{"count":2}',
	]);
	assert.deepEqual(calls[6], [
		"setStatus",
		'status.pngExportedBatch:{"count":2}',
	]);
	assert.deepEqual(calls[7], ["setExportStatus", "export.ready"]);
	assert.deepEqual(calls[8], ["updateUi"]);
}

{
	const calls = [];
	await runPsdExport({
		targetDocuments: [{ id: "camera-a" }],
		renderSnapshot: async () => ({ width: 100, height: 50 }),
		downloadSnapshot: (documentState) =>
			calls.push(["download", documentState.id]),
		setExportStatus: (...args) => calls.push(["setExportStatus", ...args]),
		setSummary: (value) => calls.push(["setSummary", value]),
		setStatus: (value) => calls.push(["setStatus", value]),
		updateUi: () => calls.push(["updateUi"]),
		requireTargetsMessage: "missing",
		t: (key, values = {}) => `${key}:${JSON.stringify(values)}`,
	});

	assert.deepEqual(calls[0], ["setExportStatus", "export.exporting", true]);
	assert.deepEqual(calls[1], ["download", "camera-a"]);
	assert.deepEqual(calls[2], [
		"setSummary",
		'exportSummary.psdExported:{"count":1}',
	]);
	assert.deepEqual(calls[3], ["setExportStatus", "export.ready"]);
	assert.deepEqual(calls[4], ["setStatus", 'status.psdExported:{"count":1}']);
	assert.deepEqual(calls[5], ["updateUi"]);
}

{
	const calls = [];
	await runOutputExport({
		targetDocuments: [{ id: "camera-a" }, { id: "camera-b" }],
		getExportSettings: (documentState) => ({
			exportFormat: documentState.id === "camera-a" ? "png" : "psd",
		}),
		renderSnapshot: async (
			documentState,
			index,
			targetDocuments,
			onProgress,
		) => {
			onProgress?.({
				definitions: [{ id: "write", label: "Write" }],
				completedIds: new Set(["beauty"]),
			});
			calls.push(["render", documentState.id, index, targetDocuments.length]);
			return { width: 800, height: 600 };
		},
		downloadPngSnapshot: (documentState, snapshot, sequenceIndex, index) => {
			calls.push([
				"downloadPng",
				documentState.id,
				snapshot.width,
				sequenceIndex,
				index,
			]);
		},
		downloadPsdSnapshot: (documentState, snapshot, sequenceIndex, index) => {
			calls.push([
				"downloadPsd",
				documentState.id,
				snapshot.width,
				sequenceIndex,
				index,
			]);
		},
		setExportStatus: (...args) => calls.push(["setExportStatus", ...args]),
		setSummary: (value) => calls.push(["setSummary", value]),
		setStatus: (value) => calls.push(["setStatus", value]),
		updateUi: () => calls.push(["updateUi"]),
		clearExportOverlay: () => calls.push(["clearExportOverlay"]),
		showExportErrorOverlay: (error) => calls.push(["showError", error.message]),
		setExportProgressOverlay: (...args) => calls.push(["overlay", ...args]),
		getPhaseDefaultDetail: (id, format, t) => `${id}:${format}:${t("detail")}`,
		requireTargetsMessage: "missing",
		t: (key, values = {}) => `${key}:${JSON.stringify(values)}`,
		now: () => 12345,
		waitForWritePhasePaint: () => calls.push(["paint"]),
	});

	assert.deepEqual(calls[0], ["setExportStatus", "export.exporting", true]);
	assert.deepEqual(calls[1], [
		"overlay",
		[{ id: "camera-a" }, { id: "camera-b" }],
		0,
		"png",
		12345,
		null,
	]);
	assert.deepEqual(calls[2], [
		"overlay",
		[{ id: "camera-a" }, { id: "camera-b" }],
		0,
		"png",
		12345,
		{
			definitions: [{ id: "write", label: "Write" }],
			completedIds: new Set(["beauty"]),
		},
	]);
	assert.deepEqual(calls[3], ["render", "camera-a", 0, 2]);
	assert.deepEqual(calls[4], [
		"overlay",
		[{ id: "camera-a" }, { id: "camera-b" }],
		0,
		"png",
		12345,
		{
			definitions: [{ id: "write", label: "Write" }],
			completedIds: new Set(["beauty"]),
			id: "write",
			activeId: "write",
			label: "Write",
			detail: "write:png:detail:{}",
		},
	]);
	assert.deepEqual(calls[5], ["paint"]);
	assert.deepEqual(calls[6], ["downloadPng", "camera-a", 800, 1, 0]);
	assert.deepEqual(calls[10], [
		"overlay",
		[{ id: "camera-a" }, { id: "camera-b" }],
		1,
		"psd",
		12345,
		{
			definitions: [{ id: "write", label: "Write" }],
			completedIds: new Set(["beauty"]),
			id: "write",
			activeId: "write",
			label: "Write",
			detail: "write:psd:detail:{}",
		},
	]);
	assert.deepEqual(calls[11], ["paint"]);
	assert.deepEqual(calls[12], ["downloadPsd", "camera-b", 800, 2, 1]);
	assert.deepEqual(calls.at(-5), [
		"setSummary",
		'exportSummary.exportedMixed:{"count":2}',
	]);
	assert.deepEqual(calls.at(-4), [
		"setStatus",
		'status.exportedMixed:{"count":2}',
	]);
	assert.deepEqual(calls.at(-3), ["clearExportOverlay"]);
	assert.deepEqual(calls.at(-2), ["setExportStatus", "export.ready"]);
	assert.deepEqual(calls.at(-1), ["updateUi"]);
}

{
	const calls = [];
	await runOutputExport({
		targetDocuments: [{ id: "camera-a", name: "Camera A" }],
		getExportSettings: () => ({ exportFormat: "psd" }),
		renderSnapshot: async (
			_documentState,
			_index,
			_targetDocuments,
			onProgress,
		) => {
			onProgress?.({
				id: "reference-images",
				activeId: "reference-images",
				label: "References",
				detail: "reference detail",
				definitions: [
					{ id: "prepare", label: "Prepare" },
					{ id: "beauty", label: "Beauty" },
					{ id: "reference-images", label: "References" },
					{ id: "write", label: "Write" },
				],
				completedIds: new Set(["prepare", "beauty"]),
			});
			calls.push(["render"]);
			return { width: 800, height: 600 };
		},
		downloadPngSnapshot: () => calls.push(["downloadPng"]),
		downloadPsdSnapshot: () => calls.push(["downloadPsd"]),
		setExportStatus: (...args) => calls.push(["setExportStatus", ...args]),
		setSummary: (value) => calls.push(["setSummary", value]),
		setStatus: (value) => calls.push(["setStatus", value]),
		updateUi: () => calls.push(["updateUi"]),
		clearExportOverlay: () => calls.push(["clearExportOverlay"]),
		showExportErrorOverlay: (error) => calls.push(["showError", error.message]),
		setExportProgressOverlay: (...args) => calls.push(["overlay", ...args]),
		getPhaseDefaultDetail: (id, format, t) => `${id}:${format}:${t("detail")}`,
		requireTargetsMessage: "missing",
		t: (key, values = {}) => `${key}:${JSON.stringify(values)}`,
		now: () => 67890,
		waitForWritePhasePaint: () => calls.push(["paint"]),
	});

	assert.deepEqual(calls[4], [
		"overlay",
		[{ id: "camera-a", name: "Camera A" }],
		0,
		"psd",
		67890,
		{
			id: "write",
			activeId: "write",
			label: "Write",
			detail: "write:psd:detail:{}",
			definitions: [
				{ id: "prepare", label: "Prepare" },
				{ id: "beauty", label: "Beauty" },
				{ id: "reference-images", label: "References" },
				{ id: "write", label: "Write" },
			],
			completedIds: new Set(["prepare", "beauty", "reference-images"]),
		},
	]);
	assert.deepEqual(calls[5], ["paint"]);
	assert.deepEqual(calls[6], ["downloadPsd"]);
}

{
	const calls = [];
	await runFrameSequenceExport({
		targetDocuments: [{ id: "camera-a", name: "Camera A", frames: [] }],
		frames: [1, 3],
		getExportSettings: () => ({ exportFormat: "png" }),
		renderSnapshot: async (
			documentState,
			timelineFrame,
			index,
			progressItems,
			onProgress,
		) => {
			onProgress?.({
				definitions: [{ id: "write", label: "Write" }],
				completedIds: new Set(),
			});
			calls.push([
				"render",
				documentState.id,
				timelineFrame,
				index,
				progressItems.length,
			]);
			return { id: `snapshot-${timelineFrame}` };
		},
		createSnapshotBlob: async (
			documentState,
			snapshot,
			exportFormat,
			timelineFrame,
		) => {
			calls.push([
				"blob",
				documentState.id,
				snapshot.id,
				exportFormat,
				timelineFrame,
			]);
			return new Blob([snapshot.id]);
		},
		buildEntryPath: (documentState, _snapshot, exportFormat, timelineFrame) =>
			`${documentState.id}-f${timelineFrame}.${exportFormat}`,
		createArchiveBlob: async (entries) => {
			calls.push(["zip", entries.map((entry) => entry.path)]);
			return new Blob(["zip"]);
		},
		downloadArchive: (blob, filename) =>
			calls.push(["downloadArchive", filename, blob.size]),
		archiveFilename: "sequence.zip",
		setExportStatus: (...args) => calls.push(["setExportStatus", ...args]),
		setSummary: (value) => calls.push(["setSummary", value]),
		setStatus: (value) => calls.push(["setStatus", value]),
		updateUi: () => calls.push(["updateUi"]),
		clearExportOverlay: () => calls.push(["clearExportOverlay"]),
		showExportErrorOverlay: (error) => calls.push(["showError", error.message]),
		setExportProgressOverlay: (...args) => calls.push(["overlay", ...args]),
		getPhaseDefaultDetail: (id, format, t) => `${id}:${format}:${t("detail")}`,
		requireTargetsMessage: "missing target",
		requireFramesMessage: "missing frames",
		t: (key, values = {}) => `${key}:${JSON.stringify(values)}`,
		now: () => 24680,
		waitForWritePhasePaint: () => calls.push(["paint"]),
	});

	assert.deepEqual(calls[0], ["setExportStatus", "export.exporting", true]);
	assert.deepEqual(calls[1][0], "overlay");
	assert.deepEqual(calls[2][0], "overlay");
	assert.deepEqual(calls[3], ["render", "camera-a", 1, 0, 2]);
	assert.deepEqual(calls[5], ["paint"]);
	assert.deepEqual(calls[6], ["blob", "camera-a", "snapshot-1", "png", 1]);
	assert.deepEqual(calls[13], ["zip", ["camera-a-f1.png", "camera-a-f3.png"]]);
	assert.deepEqual(calls[14], ["downloadArchive", "sequence.zip", 3]);
	assert.deepEqual(calls.at(-2), ["setExportStatus", "export.ready"]);
	assert.deepEqual(calls.at(-1), ["updateUi"]);
}

{
	const calls = [];
	await runVideoExport({
		targetDocuments: [{ id: "camera-a", name: "Camera A", frames: [] }],
		frames: [2, 4],
		fps: 12,
		isVideoSupported: () => true,
		renderSnapshot: async (
			documentState,
			timelineFrame,
			index,
			progressItems,
			onProgress,
		) => {
			onProgress?.({
				definitions: [{ id: "write", label: "Write" }],
				completedIds: new Set(),
			});
			calls.push([
				"renderVideo",
				documentState.id,
				timelineFrame,
				index,
				progressItems.length,
			]);
			return { frame: timelineFrame };
		},
		renderVideoFrame: (_documentState, snapshot) => ({
			id: `canvas-${snapshot.frame}`,
		}),
		createVideoBlob: async (renderFrames, options) => {
			calls.push(["createVideo", options.fps]);
			await renderFrames(async (canvas) => calls.push(["draw", canvas.id]));
			return new Blob(["video"]);
		},
		buildVideoFilename: (documentState) => `${documentState.id}.webm`,
		createArchiveBlob: async () => {
			throw new Error("single video export should not create a ZIP");
		},
		downloadArchive: () => {},
		downloadVideo: (blob, filename) =>
			calls.push(["downloadVideo", filename, blob.size]),
		archiveFilename: "video.zip",
		setExportStatus: (...args) => calls.push(["setExportStatus", ...args]),
		setSummary: (value) => calls.push(["setSummary", value]),
		setStatus: (value) => calls.push(["setStatus", value]),
		updateUi: () => calls.push(["updateUi"]),
		clearExportOverlay: () => calls.push(["clearExportOverlay"]),
		showExportErrorOverlay: (error) => calls.push(["showError", error.message]),
		setExportProgressOverlay: (...args) => calls.push(["overlay", ...args]),
		getPhaseDefaultDetail: (id, format, t) => `${id}:${format}:${t("detail")}`,
		requireTargetsMessage: "missing target",
		requireFramesMessage: "missing frames",
		videoUnsupportedMessage: "no video",
		t: (key, values = {}) => `${key}:${JSON.stringify(values)}`,
		now: () => 13579,
		waitForWritePhasePaint: () => calls.push(["paint"]),
	});

	assert.deepEqual(calls[0], ["setExportStatus", "export.exporting", true]);
	assert.deepEqual(calls[1], ["createVideo", 12]);
	assert.deepEqual(calls[4], ["renderVideo", "camera-a", 2, 0, 2]);
	assert.deepEqual(calls[7], ["draw", "canvas-2"]);
	assert.deepEqual(calls[13], ["draw", "canvas-4"]);
	assert.deepEqual(calls[14], ["downloadVideo", "camera-a.webm", 5]);
	assert.deepEqual(calls.at(-2), ["setExportStatus", "export.ready"]);
	assert.deepEqual(calls.at(-1), ["updateUi"]);
}

console.log("✅ CAMERA_FRAMES export download actions tests passed!");
