import * as THREE from "three";
import { buildExportPassPlan } from "../../engine/export-pass-plan.js";
import {
	buildExportReadinessPlan,
	finalizeExportReadiness,
} from "../../engine/export-readiness.js";
import { createSparkExportRendererManager } from "../../engine/spark-export-renderer.js";
import {
	createCanvasFromPixels,
	createSolidColorCanvas,
} from "./canvas-utils.js";
import {
	renderModelLayerDocuments as renderModelLayerDocumentsHelper,
	renderSplatLayerDocuments as renderSplatLayerDocumentsHelper,
} from "./layer-documents.js";
import {
	buildLayerMaskPixels,
	buildSplatLayerMaskPixels,
	createAlphaPreviewPixels,
} from "./mask-pixels.js";
import { renderOutputSnapshotSession } from "./output-snapshot.js";
import {
	getExportPhaseDefaultDetail,
	getExportPhaseDefinitions,
} from "./progress.js";
import { renderReferenceImageLayersForShotCamera } from "./reference-images.js";
import {
	renderConfiguredSceneCapture as renderConfiguredSceneCaptureHelper,
	renderConfiguredScenePixels as renderConfiguredScenePixelsHelper,
	renderMaskPassSnapshots as renderMaskPassSnapshotsHelper,
	renderPsdBasePixels as renderPsdBasePixelsHelper,
} from "./render-capture.js";
import {
	renderGuideLayerPixels as renderGuideLayerPixelsHelper,
	renderScenePixelsWithReadiness as renderScenePixelsWithReadinessHelper,
} from "./render-session.js";
import { applyExportAssetRenderOrder } from "./render-state.js";
import {
	withAssetRenderState as withAssetRenderStateHelper,
	withMaskSceneState as withMaskSceneStateHelper,
} from "./scene-state.js";
import {
	createSnapshotPhaseTracker,
	withOutputSnapshotSession,
} from "./snapshot-session.js";
import {
	buildSceneAssetExportMetadata,
	getShotCameraExportSettings,
} from "./targets.js";

function createDefaultGuideRenderTarget(width, height) {
	return new THREE.WebGLRenderTarget(width, height, {
		format: THREE.RGBAFormat,
		type: THREE.UnsignedByteType,
		colorSpace: THREE.SRGBColorSpace,
		depthBuffer: false,
		stencilBuffer: false,
	});
}

export function createExportOutputRuntime(
	{
		scene,
		renderer,
		spark,
		guides,
		guideOverlay,
		shotCameraRegistry,
		store,
		flipPixels,
		t,
		getSceneAssets,
		getShotCameraDocument,
		getActiveOutputCamera,
		getOutputSizeState,
		syncActiveShotCameraFromDocument,
		syncShotProjection,
		syncOutputCamera,
		updateShotCameraHelpers,
		exportDebugLayersEnabled,
	},
	{
		buildExportPassPlanFn = buildExportPassPlan,
		buildExportReadinessPlanFn = buildExportReadinessPlan,
		finalizeExportReadinessFn = finalizeExportReadiness,
		createSparkExportRendererManagerFn = createSparkExportRendererManager,
		createGuideRenderTarget = createDefaultGuideRenderTarget,
		createSolidColorCanvasFn = createSolidColorCanvas,
		createCanvasFromPixelsFn = createCanvasFromPixels,
		renderConfiguredSceneCaptureFn = renderConfiguredSceneCaptureHelper,
		renderConfiguredScenePixelsFn = renderConfiguredScenePixelsHelper,
		renderMaskPassSnapshotsFn = renderMaskPassSnapshotsHelper,
		renderPsdBasePixelsFn = renderPsdBasePixelsHelper,
		withAssetRenderStateFn = withAssetRenderStateHelper,
		withMaskSceneStateFn = withMaskSceneStateHelper,
		renderGuideLayerPixelsFn = renderGuideLayerPixelsHelper,
		renderScenePixelsWithReadinessFn = renderScenePixelsWithReadinessHelper,
		withOutputSnapshotSessionFn = withOutputSnapshotSession,
		createSnapshotPhaseTrackerFn = createSnapshotPhaseTracker,
		renderOutputSnapshotSessionFn = renderOutputSnapshotSession,
		renderModelLayerDocumentsFn = renderModelLayerDocumentsHelper,
		renderSplatLayerDocumentsFn = renderSplatLayerDocumentsHelper,
		renderReferenceImageLayersForShotCameraFn = renderReferenceImageLayersForShotCamera,
		getShotCameraExportSettingsFn = getShotCameraExportSettings,
		buildSceneAssetExportMetadataFn = buildSceneAssetExportMetadata,
		getExportPhaseDefinitionsFn = getExportPhaseDefinitions,
		getExportPhaseDefaultDetailFn = getExportPhaseDefaultDetail,
		buildLayerMaskPixelsFn = buildLayerMaskPixels,
		buildSplatLayerMaskPixelsFn = buildSplatLayerMaskPixels,
		createAlphaPreviewPixelsFn = createAlphaPreviewPixels,
		applyRenderOrder = applyExportAssetRenderOrder,
	} = {},
) {
	let exportRenderLock = false;
	const exportRenderBackend = createSparkExportRendererManagerFn({
		sourceSpark: spark,
	});
	let guideRenderTarget = null;

	function ensureGuideRenderTarget(width, height) {
		const needsNewTarget =
			!guideRenderTarget ||
			guideRenderTarget.width !== width ||
			guideRenderTarget.height !== height;
		if (!needsNewTarget) {
			return guideRenderTarget;
		}
		guideRenderTarget?.dispose?.();
		guideRenderTarget = createGuideRenderTarget(width, height);
		return guideRenderTarget;
	}

	function getNowMs() {
		if (typeof performance !== "undefined" && performance.now) {
			return performance.now();
		}

		return Date.now();
	}

	function clonePixelBuffer(pixels) {
		return pixels ? new Uint8Array(pixels) : pixels;
	}

	function getRenderableSceneAssets() {
		return getSceneAssets().filter(
			(asset) => asset.exportRole !== "omit" && asset.object.visible !== false,
		);
	}

	function withAssetRenderState(config, callback) {
		return withAssetRenderStateFn(config, callback, {
			scene,
			guides,
			guideOverlay,
			renderer,
			getSceneAssets,
			applyRenderOrder,
		});
	}

	function withMaskSceneState(maskPass, allowedAssetIds, callback) {
		return withMaskSceneStateFn(maskPass, allowedAssetIds, callback, {
			scene,
			getSceneAssets,
		});
	}

	function renderGuideLayerPixels(config) {
		return renderGuideLayerPixelsFn(config, {
			ensureRenderTarget: ensureGuideRenderTarget,
			renderer,
			guideOverlay,
			flipPixels,
		});
	}

	function renderScenePixelsWithReadiness(config) {
		return renderScenePixelsWithReadinessFn(config, {
			buildReadinessPlan: buildExportReadinessPlanFn,
			finalizeReadiness: finalizeExportReadinessFn,
			getNowMs,
			renderBackend: exportRenderBackend,
		});
	}

	function renderConfiguredSceneCapture(config) {
		return renderConfiguredSceneCaptureFn(config, {
			scene,
			withAssetRenderState,
			renderScenePixelsWithReadiness,
			buildSceneAssetExportMetadata: buildSceneAssetExportMetadataFn,
			flipPixels,
			clonePixels: clonePixelBuffer,
		});
	}

	function renderConfiguredScenePixels(config) {
		return renderConfiguredScenePixelsFn(config, {
			renderCapture: renderConfiguredSceneCapture,
		});
	}

	function renderMaskPassSnapshots(config) {
		return renderMaskPassSnapshotsFn(config, {
			withMaskSceneState,
			renderScenePixelsWithReadiness,
			buildSceneAssetExportMetadata: buildSceneAssetExportMetadataFn,
			getSceneAssets,
			flipPixels,
			clonePixels: clonePixelBuffer,
		});
	}

	function renderPsdBasePixels(config) {
		return renderPsdBasePixelsFn(config, {
			renderScenePixels: renderConfiguredScenePixels,
		});
	}

	function renderModelLayerDocuments(config) {
		return renderModelLayerDocumentsFn(config, {
			renderScenePixels: renderConfiguredScenePixels,
			createCanvasFromPixels: createCanvasFromPixelsFn,
			buildLayerMaskPixels: buildLayerMaskPixelsFn,
			createAlphaPreviewPixels: createAlphaPreviewPixelsFn,
			exportDebugLayersEnabled,
		});
	}

	function renderSplatLayerDocuments(config) {
		return renderSplatLayerDocumentsFn(config, {
			renderScenePixels: renderConfiguredScenePixels,
			createCanvasFromPixels: createCanvasFromPixelsFn,
			buildSplatLayerMaskPixels: buildSplatLayerMaskPixelsFn,
			createAlphaPreviewPixels: createAlphaPreviewPixelsFn,
			exportDebugLayersEnabled,
		});
	}

	function withSnapshotSession(shotCameraId, callback) {
		return withOutputSnapshotSessionFn(
			{ shotCameraId },
			{
				scene,
				spark,
				guides,
				guideOverlay,
				shotCameraRegistry,
				store,
				getShotCameraDocument,
				getShotCameraExportSettings: getShotCameraExportSettingsFn,
				getActiveOutputCamera,
				getOutputSizeState,
				getRenderableSceneAssets,
				buildSceneAssetExportMetadata: buildSceneAssetExportMetadataFn,
				buildExportPassPlan: buildExportPassPlanFn,
				createSolidColorCanvas: createSolidColorCanvasFn,
				syncActiveShotCameraFromDocument,
				syncShotProjection,
				syncOutputCamera,
				updateShotCameraHelpers,
				setRenderLock: (locked) => {
					exportRenderLock = locked;
				},
			},
			callback,
		);
	}

	async function renderOutputSnapshotForShotCamera(
		shotCameraId,
		{ onProgress = null } = {},
	) {
		return withSnapshotSession(
			shotCameraId,
			async ({
				targetDocument,
				targetExportSettings,
				outputCamera,
				width,
				height,
				renderableSceneAssets,
				sceneAssets,
				backgroundCanvas,
				passPlan,
			}) =>
				renderOutputSnapshotSessionFn(
					{
						scene,
						targetDocument,
						targetExportSettings,
						outputCamera,
						width,
						height,
						renderableSceneAssets,
						sceneAssets,
						backgroundCanvas,
						passPlan,
						referenceImageDocument: store.referenceImages.document.value,
						referenceImagesExportSessionEnabled:
							store.referenceImages.exportSessionEnabled.value,
						t,
					},
					{
						phaseTracker: createSnapshotPhaseTrackerFn(
							{
								targetExportSettings,
								passPlan,
								includeReferenceImages:
									store.referenceImages.exportSessionEnabled.value !== false,
								onProgress,
								t,
							},
							{
								getPhaseDefinitions: getExportPhaseDefinitionsFn,
								getPhaseDefaultDetail: getExportPhaseDefaultDetailFn,
							},
						),
						renderConfiguredSceneCapture,
						clonePixels: clonePixelBuffer,
						renderGuideLayerPixels,
						renderMaskPassSnapshots,
						renderPsdBasePixels,
						renderModelLayerDocuments,
						renderSplatLayerDocuments,
						renderReferenceImageLayersForShotCamera:
							renderReferenceImageLayersForShotCameraFn,
					},
				),
		);
	}

	function isRenderLocked() {
		return exportRenderLock;
	}

	function dispose() {
		exportRenderBackend.dispose();
	}

	return {
		renderOutputSnapshotForShotCamera,
		isRenderLocked,
		dispose,
	};
}
