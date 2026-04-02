import assert from "node:assert/strict";
import {
	createSnapshotPhaseTracker,
	withOutputSnapshotSession,
} from "../src/controllers/export/snapshot-session.js";

{
	const progressCalls = [];
	const tracker = createSnapshotPhaseTracker(
		{
			targetExportSettings: {
				exportFormat: "psd",
				exportGridOverlay: true,
				exportModelLayers: true,
				exportSplatLayers: false,
			},
			passPlan: {
				masks: [{ assetIds: ["asset-a"] }],
			},
			includeReferenceImages: true,
			onProgress: (payload) => progressCalls.push(payload),
			t: (key) => `t:${key}`,
		},
		{
			getPhaseDefinitions: (options) => {
				assert.equal(options.exportFormat, "psd");
				assert.equal(options.hasMasks, true);
				assert.equal(options.includeReferenceImages, true);
				return [{ id: "beauty", label: "Beauty" }];
			},
			getPhaseDefaultDetail: (id, format, t) =>
				`${id}:${format}:${t("detail")}`,
		},
	);

	tracker.emitPhase("beauty");
	tracker.completePhase("beauty");
	tracker.emitPhase("beauty", "custom-detail", { index: 1 });

	assert.equal(progressCalls.length, 2);
	assert.deepEqual(progressCalls[0], {
		id: "beauty",
		label: "Beauty",
		detail: "beauty:psd:t:detail",
		definitions: [{ id: "beauty", label: "Beauty" }],
		completedIds: new Set(),
		activeId: "beauty",
		progress: null,
	});
	assert.deepEqual(progressCalls[1], {
		id: "beauty",
		label: "Beauty",
		detail: "custom-detail",
		definitions: [{ id: "beauty", label: "Beauty" }],
		completedIds: new Set(["beauty"]),
		activeId: "beauty",
		progress: { index: 1 },
	});
}

{
	const guideStates = [];
	const lockStates = [];
	const syncCalls = [];
	const updateCalls = [];
	const store = {
		workspace: {
			activeShotCameraId: { value: "camera-prev" },
		},
	};
	const guides = { visible: true };
	const guideOverlay = {
		captureState() {
			return { previous: true };
		},
		applyState(state) {
			guideStates.push(state);
		},
	};
	const shotCameraRegistry = new Map([
		["a", { helper: { visible: true } }],
		["b", { helper: { visible: false } }],
	]);
	const spark = { autoUpdate: true };

	const result = await withOutputSnapshotSession(
		{ shotCameraId: "camera-next" },
		{
			scene: {
				background: {
					isColor: true,
					getHexString() {
						return "08111d";
					},
				},
			},
			spark,
			guides,
			guideOverlay,
			shotCameraRegistry,
			store,
			getShotCameraDocument: (id) => ({ id, name: "Camera Next" }),
			getShotCameraExportSettings: () => ({
				exportGridLayerMode: "bottom",
			}),
			getActiveOutputCamera: () => ({ id: "output-camera" }),
			getOutputSizeState: () => ({ width: 1920, height: 1080 }),
			getRenderableSceneAssets: () => [{ id: "asset-a" }],
			buildSceneAssetExportMetadata: (assets) => [
				{ ...assets[0], kind: "model" },
			],
			buildExportPassPlan: (sceneAssets) => ({
				masks: [],
				sceneAssets,
			}),
			createSolidColorCanvas: (width, height, color) => ({
				width,
				height,
				color,
			}),
			syncActiveShotCameraFromDocument: () => syncCalls.push("syncActive"),
			syncShotProjection: () => syncCalls.push("syncProjection"),
			syncOutputCamera: () => syncCalls.push("syncOutput"),
			updateShotCameraHelpers: () => updateCalls.push("updateHelpers"),
			setRenderLock: (value) => lockStates.push(value),
		},
		async (session) => {
			assert.equal(store.workspace.activeShotCameraId.value, "camera-next");
			assert.equal(guides.visible, false);
			assert.equal(spark.autoUpdate, false);
			assert.equal(shotCameraRegistry.get("a").helper.visible, false);
			assert.equal(shotCameraRegistry.get("b").helper.visible, false);
			assert.equal(session.targetDocument.id, "camera-next");
			assert.equal(session.targetExportSettings.exportGridLayerMode, "bottom");
			assert.equal(session.outputCamera.id, "output-camera");
			assert.equal(session.width, 1920);
			assert.equal(session.height, 1080);
			assert.deepEqual(session.backgroundCanvas, {
				width: 1920,
				height: 1080,
				color: "#08111d",
			});
			assert.deepEqual(session.passPlan, {
				masks: [],
				sceneAssets: [{ id: "asset-a", kind: "model" }],
			});
			return "done";
		},
	);

	assert.equal(result, "done");
	assert.deepEqual(lockStates, [true, false]);
	assert.deepEqual(syncCalls, [
		"syncActive",
		"syncProjection",
		"syncOutput",
		"syncActive",
		"syncProjection",
		"syncOutput",
	]);
	assert.deepEqual(guideStates, [
		{
			gridVisible: false,
			eyeLevelVisible: false,
			gridLayerMode: "bottom",
		},
		{ previous: true },
	]);
	assert.equal(store.workspace.activeShotCameraId.value, "camera-prev");
	assert.equal(guides.visible, true);
	assert.equal(spark.autoUpdate, true);
	assert.equal(shotCameraRegistry.get("a").helper.visible, true);
	assert.equal(shotCameraRegistry.get("b").helper.visible, false);
	assert.deepEqual(updateCalls, ["updateHelpers"]);
}

console.log("✅ CAMERA_FRAMES export snapshot session tests passed!");
