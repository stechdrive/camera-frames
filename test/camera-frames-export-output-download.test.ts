import assert from "node:assert/strict";
import {
	downloadPngFromSnapshot,
	downloadPsdFromSnapshot,
	renderCompositeOutputCanvas,
} from "../src/controllers/export/output-download.js";

{
	const calls = [];
	const renderedCanvas = { id: "canvas" };
	const snapshot = { id: "shot" };
	const frames = [{ id: "frame-a" }];
	const result = renderCompositeOutputCanvas(snapshot, frames, {
		drawFramesToContext: () => {},
		previewContextError: "preview",
		buildBundle(sourceSnapshot, sourceFrames, options) {
			calls.push({
				type: "buildBundle",
				sourceSnapshot,
				sourceFrames,
				options,
			});
			return { id: "bundle" };
		},
		renderBundleToCanvas(bundle) {
			calls.push({ type: "renderBundleToCanvas", bundle });
			return renderedCanvas;
		},
	});

	assert.equal(result, renderedCanvas);
	assert.equal(calls.length, 2);
	assert.equal(calls[0].type, "buildBundle");
	assert.equal(calls[0].sourceSnapshot, snapshot);
	assert.equal(calls[0].sourceFrames, frames);
	assert.equal(typeof calls[0].options.drawFramesToContext, "function");
	assert.equal(calls[0].options.previewContextError, "preview");
	assert.deepEqual(calls[1], {
		type: "renderBundleToCanvas",
		bundle: { id: "bundle" },
	});
}

{
	const clicked = [];
	const linkState = {
		href: "",
		download: "",
		click() {
			clicked.push("click");
		},
	};
	const result = downloadPngFromSnapshot(
		{ id: "camera-1" },
		{ id: "snapshot-1" },
		2,
		{
			frames: [{ id: "frame-a" }],
			drawFramesToContext: () => {},
			buildFilename(documentState, snapshot, format, sequenceIndex) {
				assert.equal(documentState.id, "camera-1");
				assert.equal(snapshot.id, "snapshot-1");
				assert.equal(format, "png");
				assert.equal(sequenceIndex, 2);
				return "camera-1-02.png";
			},
			renderBundleToCanvas() {
				return {
					toDataURL(type: string) {
						assert.equal(type, "image/png");
						return "data:image/png;base64,AAAA";
					},
				};
			},
			buildBundle() {
				return { id: "bundle" };
			},
			createLink() {
				return linkState;
			},
		},
	);

	assert.equal(result, linkState);
	assert.equal(linkState.href, "data:image/png;base64,AAAA");
	assert.equal(linkState.download, "camera-1-02.png");
	assert.deepEqual(clicked, ["click"]);
}

{
	let capturedDownload = null;
	const result = downloadPsdFromSnapshot(
		{ id: "camera-2" },
		{ id: "snapshot-2" },
		3,
		{
			frames: [{ id: "frame-b" }],
			drawFramesToContext: () => {},
			buildFilename(documentState, snapshot, format, sequenceIndex) {
				assert.equal(documentState.id, "camera-2");
				assert.equal(snapshot.id, "snapshot-2");
				assert.equal(format, "psd");
				assert.equal(sequenceIndex, 3);
				return "camera-2-03.psd";
			},
			buildBundle(snapshot, frames, options) {
				assert.equal(snapshot.id, "snapshot-2");
				assert.deepEqual(frames, [{ id: "frame-b" }]);
				assert.equal(typeof options.drawFramesToContext, "function");
				assert.equal(options.previewContextError, "error.previewContext");
				return { id: "bundle-2" };
			},
			buildPsdExportDocument(bundle, frames) {
				assert.deepEqual(bundle, { id: "bundle-2" });
				assert.deepEqual(frames, [{ id: "frame-b" }]);
				return { children: [{ name: "Beauty" }] };
			},
			downloadDocument(state) {
				capturedDownload = state;
			},
		},
	);

	assert.deepEqual(result, {
		children: [{ name: "Beauty" }],
		filename: "camera-2-03.psd",
	});
	assert.deepEqual(capturedDownload, result);
}

console.log("✅ CAMERA_FRAMES export output download tests passed!");
