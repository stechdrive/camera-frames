import assert from "node:assert/strict";
import {
	renderModelLayerDocuments,
	renderSplatLayerDocuments,
} from "../src/controllers/export/layer-documents.js";
import { buildPsdExportDocument } from "../src/controllers/export/psd-document.js";
import { renderReferenceImageLayersForShotCamera } from "../src/controllers/export/reference-images.js";
import { createReferenceImageImportRuntime } from "../src/controllers/reference-image/import-runtime.js";
import { createAssetImportRuntime } from "../src/controllers/scene-assets/import-runtime.js";
import {
	createExportPass,
	createPixelLayer,
} from "../src/engine/export-bundle.js";
import { prioritizeSceneAssetsWithinKinds } from "../src/engine/scene-asset-order.js";
import {
	createDefaultReferenceImageDocument,
	getReferenceImageDisplayItems,
} from "../src/reference-image-model.js";
import { createShotCameraDocument } from "../src/workspace-model.js";

function createSourceMeta(filename) {
	return {
		filename,
		mime: "image/png",
		originalSize: { w: 128, h: 64 },
		appliedSize: { w: 128, h: 64 },
		pixelRatio: 1,
		usedOriginal: true,
	};
}

function buildSceneAsset(id, kind, label) {
	return {
		id,
		kind,
		label,
		exportRole: "normal",
	};
}

{
	const sceneState = {
		assets: [
			buildSceneAsset("model-existing", "model", "Model Existing"),
			buildSceneAsset("splat-existing", "splat", "Splat Existing"),
		],
	};
	const assetRuntime = createAssetImportRuntime({
		store: {
			overlay: { value: null },
			remoteUrl: { value: "" },
		},
		t: (key) => key,
		setStatus: () => {},
		setOverlay: () => {},
		clearOverlay: () => {},
		openFiles: () => {},
		isProjectPackageSource: () => false,
		isProjectPackagePackedSplatSource: () => false,
		isProjectFilePackedSplatSource: () => false,
		extractProjectPackageAssets: async () => ({
			files: [],
			importState: null,
		}),
		openProjectSource: async () => {},
		getExtension: (value) =>
			String(typeof value === "string" ? value : value.name)
				.split(".")
				.pop()
				.toLowerCase(),
		getDisplayName: (value) =>
			typeof value === "string" ? value : (value.name ?? "asset"),
		loadSplatFromSource: async () => {
			const asset = buildSceneAsset("splat-new", "splat", "Splat New");
			sceneState.assets.push(asset);
			return asset;
		},
		loadModelFromSource: async () => {
			const asset = buildSceneAsset("model-new", "model", "Model New");
			sceneState.assets.push(asset);
			return asset;
		},
		getSceneAssetCount: () => sceneState.assets.length,
		clearScene: () => {
			sceneState.assets = [];
		},
		disposeDetachedSceneAssets: () => {},
		clearHistory: () => {},
		applyProjectPackageImport: () => false,
		placeAllCamerasAtHome: () => {},
		updateCameraSummary: () => {},
		updateUi: () => {},
		prioritizeImportedSceneAssets: (importedAssets) => {
			sceneState.assets = prioritizeSceneAssetsWithinKinds(
				sceneState.assets,
				importedAssets.map((asset) => asset.id),
			);
		},
		beginHistoryTransaction: () => true,
		commitHistoryTransaction: () => true,
		cancelHistoryTransaction: () => {},
	});
	await assetRuntime.importDroppedFiles([
		new File([new Uint8Array([1])], "model-new.glb"),
		new File([new Uint8Array([2])], "splat-new.ply"),
	]);
	assert.deepEqual(
		sceneState.assets.map((asset) => asset.label),
		["Model New", "Splat New", "Model Existing", "Splat Existing"],
	);

	let referenceImageDocument = createDefaultReferenceImageDocument();
	const importShotCameraDocument = {
		referenceImages: {
			presetId: "reference-preset-blank",
			overridesByPresetId: {},
		},
	};
	const referenceRuntime = createReferenceImageImportRuntime({
		store: {
			mode: { value: "camera" },
			referenceImages: {
				previewLayers: { value: [] },
				previewSessionVisible: { value: false },
				assetCount: { value: 0 },
				items: { value: [] },
			},
		},
		t: (key) => key,
		setStatus: () => {},
		updateUi: () => {},
		ensureCameraMode: () => {},
		getActiveShotCameraDocument: () => importShotCameraDocument,
		getOutputSizeState: () => ({ width: 1000, height: 500 }),
		getDocument: () => referenceImageDocument,
		setDocument: (nextDocument) => {
			referenceImageDocument = nextDocument;
		},
		syncUiState: () => {},
		setSelectionState: () => {},
		ensureActiveShotPresetBinding: (presetId) => {
			importShotCameraDocument.referenceImages.presetId = presetId;
		},
		beginHistoryTransaction: () => true,
		commitHistoryTransaction: () => true,
		cancelHistoryTransaction: () => {},
		decodeReferenceImageBlobImpl: async (_blob, filename) => ({
			sourceMeta: createSourceMeta(filename),
			previewCanvas: { width: 128, height: 64 },
		}),
		extractReferenceImagePsdLayersImpl: async () => [
			{
				name: "Ref Bottom",
				visible: true,
				opacity: 1,
				offsetPx: { x: 0, y: 0 },
				decoded: {
					blob: new Blob([new Uint8Array([3])], { type: "image/png" }),
					sourceMeta: createSourceMeta("ref-bottom.png"),
				},
			},
			{
				name: "Ref Top",
				visible: true,
				opacity: 1,
				offsetPx: { x: 0, y: 0 },
				decoded: {
					blob: new Blob([new Uint8Array([4])], { type: "image/png" }),
					sourceMeta: createSourceMeta("ref-top.png"),
				},
			},
		],
	});
	await referenceRuntime.importReferenceImageFiles([
		new File([new Uint8Array([5])], "refs.psd", {
			type: "image/vnd.adobe.photoshop",
		}),
	]);
	const importedReferencePreset =
		referenceImageDocument.presets.find(
			(preset) => preset.id === referenceImageDocument.activePresetId,
		) ?? referenceImageDocument.presets[0];
	assert.deepEqual(
		getReferenceImageDisplayItems(importedReferencePreset.items, "front").map(
			(item) => item.name,
		),
		["Ref Top", "Ref Bottom"],
	);

	const modelLayerResult = await renderModelLayerDocuments(
		{
			camera: { id: "camera" },
			width: 1,
			height: 1,
			sceneAssets: sceneState.assets,
			exportSettings: { exportModelLayers: true },
		},
		{
			renderScenePixels: async () => new Uint8Array([1, 1, 1, 255]),
			createCanvasFromPixels: () => ({ id: "model-canvas" }),
			buildLayerMaskPixels: () => new Uint8Array([0, 0, 0, 255]),
		},
	);
	const splatLayerResult = await renderSplatLayerDocuments(
		{
			camera: { id: "camera" },
			width: 1,
			height: 1,
			sceneAssets: sceneState.assets,
			exportSettings: { exportSplatLayers: true },
		},
		{
			renderScenePixels: async () => new Uint8Array([1, 1, 1, 255]),
			createCanvasFromPixels: () => ({ id: "splat-canvas" }),
			buildSplatLayerMaskPixels: () => new Uint8Array([0, 0, 0, 255]),
		},
	);

	const shotCameraDocument = createShotCameraDocument({
		name: "Camera 1",
	});
	shotCameraDocument.outputFrame.anchor = "center";
	shotCameraDocument.referenceImages.presetId =
		referenceImageDocument.activePresetId;
	const referenceImageLayers = await renderReferenceImageLayersForShotCamera({
		referenceImageDocument,
		exportSessionEnabled: true,
		documentState: shotCameraDocument,
		width: 1000,
		height: 500,
		applyOpacity: false,
		loadDrawable: async () => ({
			drawable: { id: "drawable" },
			cleanup() {},
		}),
		renderLayerCanvas: (options) => ({
			canvas: { id: options.drawable.id },
			opacity: options.opacity,
			bounds: { left: 0, top: 0, right: 10, bottom: 10 },
		}),
	});

	const document = buildPsdExportDocument(
		{
			width: 1,
			height: 1,
			exportSettings: {
				exportGridLayerMode: "bottom",
				exportModelLayers: true,
				exportSplatLayers: true,
			},
			psdBasePixels: new Uint8Array([1, 1, 1, 255]),
			referenceImageLayers,
			modelLayers: modelLayerResult.layers,
			modelDebugGroups: [],
			splatLayers: splatLayerResult.layers,
			splatDebugGroups: [],
			passes: [
				createExportPass({
					id: "beauty",
					layers: [
						createPixelLayer({
							name: "Render",
							pixels: new Uint8Array([1, 1, 1, 255]),
							width: 1,
							height: 1,
						}),
					],
				}),
			],
		},
		[],
		{
			groupLabel: "Reference Images",
			createCanvasFromPixels: () => ({ id: "render" }),
			createFrameMaskLayerDocument: () => null,
			renderExportPassToCanvas: () => ({ id: "pass" }),
		},
	);

	assert.deepEqual(
		document.layers.map((layer) => layer.name),
		[
			"Render",
			"Splat Existing",
			"Splat New",
			"Model Existing",
			"Model New",
			"Reference Images",
		],
	);
	assert.deepEqual(
		document.layers.at(-1)?.children?.map((layer) => layer.name),
		["Ref Bottom", "Ref Top"],
	);
}

console.log("✅ CAMERA_FRAMES import/export order contract tests passed!");
