import assert from "node:assert/strict";
import { renderVideoFrameSnapshotSession } from "../src/controllers/export/video-snapshot.js";

{
	const calls: string[] = [];
	const phaseEvents: string[] = [];
	const snapshot = await renderVideoFrameSnapshotSession(
		{
			targetDocument: { id: "camera-a" },
			targetExportSettings: {
				exportFormat: "psd",
				exportGridOverlay: true,
				exportGridLayerMode: "overlay",
				exportModelLayers: true,
				exportSplatLayers: true,
			},
			outputCamera: { id: "camera" },
			width: 2,
			height: 1,
			renderableSceneAssets: [{ id: "asset-a", exportRole: "beauty" }],
			sceneAssets: [{ id: "asset-a", maskGroup: "hero" }],
			backgroundCanvas: { id: "background" },
			referenceImageDocument: { id: "refs" },
			referenceImagesExportSessionEnabled: true,
			t: (key: string, values: Record<string, unknown> = {}) =>
				`${key}:${JSON.stringify(values)}`,
		},
		{
			phaseTracker: {
				emitPhase(id: string) {
					phaseEvents.push(id);
				},
				completePhase(id: string) {
					phaseEvents.push(`done:${id}`);
				},
			},
			renderConfiguredSceneCapture: async (config) => {
				calls.push(`beauty:${config.sceneAssets.length}`);
				return {
					pixels: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]),
					readiness: { pending: false },
				};
			},
			clonePixels: (pixels) => new Uint8Array(pixels),
			renderGuideLayerPixels: async (config) => {
				calls.push(config.gridVisible ? "guide:grid" : "guide:eye");
				return new Uint8Array(8);
			},
			renderReferenceImageLayersForShotCamera: async (config) => {
				calls.push(`reference:${config.applyOpacity}`);
				return [{ id: "ref-layer", group: "front" }];
			},
		},
	);

	assert.deepEqual(calls, [
		"beauty:1",
		"guide:grid",
		"guide:eye",
		"reference:true",
	]);
	assert.equal(phaseEvents.includes("masks"), false);
	assert.equal(snapshot.exportSettings.exportFormat, "webm");
	assert.equal(snapshot.exportSettings.exportModelLayers, false);
	assert.equal(snapshot.exportSettings.exportSplatLayers, false);
	assert.deepEqual(snapshot.maskPasses, []);
	assert.equal(snapshot.modelLayers.length, 0);
	assert.equal(snapshot.splatLayers.length, 0);
	assert.deepEqual(snapshot.readiness, { pending: false });
}

console.log("✅ CAMERA_FRAMES export video snapshot tests passed!");
