import * as THREE from "three";
import { IS_DEV_RUNTIME, hasEnabledQueryFlag } from "../build-info.js";
import {
	getAllExportBundlePasses,
	renderExportPassToCanvas,
} from "../engine/export-bundle.js";
import { buildExportPassPlan } from "../engine/export-pass-plan.js";
import {
	buildExportReadinessPlan,
	finalizeExportReadiness,
} from "../engine/export-readiness.js";
import { createSparkExportRendererManager } from "../engine/spark-export-renderer.js";
import { buildSnapshotExportBundle } from "./export/bundle-build.js";
import {
	createCanvasFromPixels,
	createSolidColorCanvas,
} from "./export/canvas-utils.js";
import {
	runOutputExport,
	runPngExport,
	runPsdExport,
} from "./export/download-actions.js";
import {
	buildShotCameraExportFilename as buildShotCameraExportFilenameHelper,
	createExportBundleFacade,
	createExportDownloadFacade,
	createPsdExportDocumentBuilder,
} from "./export/download-facade.js";
import {
	renderModelLayerDocuments as renderModelLayerDocumentsHelper,
	renderSplatLayerDocuments as renderSplatLayerDocumentsHelper,
} from "./export/layer-documents.js";
import { createAlphaPreviewPixels } from "./export/mask-pixels.js";
import {
	buildLayerMaskPixels,
	buildSplatLayerMaskPixels,
} from "./export/mask-pixels.js";
import {
	downloadPngFromSnapshot,
	downloadPsdFromSnapshot,
	renderCompositeOutputCanvas,
} from "./export/output-download.js";
import { renderOutputSnapshotSession } from "./export/output-snapshot.js";
import {
	buildExportProgressOverlay,
	getExportPhaseDefaultDetail,
	getExportPhaseDefinitions,
} from "./export/progress.js";
import { buildPsdExportDocument as buildPsdDocument } from "./export/psd-document.js";
import { renderReferenceImageLayersForShotCamera } from "./export/reference-images.js";
import {
	renderConfiguredSceneCapture as renderConfiguredSceneCaptureHelper,
	renderConfiguredScenePixels as renderConfiguredScenePixelsHelper,
	renderMaskPassSnapshots as renderMaskPassSnapshotsHelper,
	renderPsdBasePixels as renderPsdBasePixelsHelper,
} from "./export/render-capture.js";
import {
	renderGuideLayerPixels as renderGuideLayerPixelsHelper,
	renderScenePixelsWithReadiness as renderScenePixelsWithReadinessHelper,
} from "./export/render-session.js";
import { applyExportAssetRenderOrder } from "./export/render-state.js";
import {
	withAssetRenderState as withAssetRenderStateHelper,
	withMaskSceneState as withMaskSceneStateHelper,
} from "./export/scene-state.js";
import {
	createSnapshotPhaseTracker,
	withOutputSnapshotSession,
} from "./export/snapshot-session.js";
import {
	buildSceneAssetExportMetadata,
	getShotCameraExportSettings,
	resolveExportTargetShotCameras,
} from "./export/targets.js";

export function createExportController({
	scene,
	renderer,
	spark,
	guides,
	guideOverlay,
	shotCameraRegistry,
	store,
	flipPixels,
	drawFramesToContext,
	t,
	setStatus,
	setExportStatus,
	updateUi,
	getTotalLoadedItems,
	getSceneAssets,
	getShotCameraDocument,
	getActiveShotCameraDocument,
	getActiveOutputCamera,
	getActiveFrames,
	getOutputSizeState,
	getShotCameraExportBaseName,
	syncActiveShotCameraFromDocument,
	syncShotProjection,
	syncOutputCamera,
	updateShotCameraHelpers,
}) {
	const exportDebugLayersEnabled =
		IS_DEV_RUNTIME && hasEnabledQueryFlag("psdDebug");
	let exportRenderLock = false;
	const exportRenderBackend = createSparkExportRendererManager({
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
		guideRenderTarget = new THREE.WebGLRenderTarget(width, height, {
			format: THREE.RGBAFormat,
			type: THREE.UnsignedByteType,
			colorSpace: THREE.SRGBColorSpace,
			depthBuffer: false,
			stencilBuffer: false,
		});
		return guideRenderTarget;
	}

	function getNowMs() {
		if (typeof performance !== "undefined" && performance.now) {
			return performance.now();
		}

		return Date.now();
	}

	function setExportProgressOverlay(
		targetDocuments,
		currentIndex,
		exportFormat,
		startedAt,
		phaseState = null,
	) {
		store.overlay.value = buildExportProgressOverlay({
			targetDocuments,
			currentIndex,
			exportFormat,
			startedAt,
			phaseState,
			t,
		});
	}

	function clearExportOverlay() {
		if (store.overlay.value?.source === "export") {
			store.overlay.value = null;
		}
	}

	function showExportErrorOverlay(error) {
		const detail =
			error instanceof Error
				? error.stack || error.message
				: String(error ?? "");
		store.overlay.value = {
			source: "export",
			kind: "error",
			title: t("overlay.exportErrorTitle"),
			message: t("overlay.exportErrorMessage"),
			detail,
			detailLabel: t("overlay.errorDetails"),
			actions: [
				{
					label: t("action.close"),
					primary: true,
					onClick: () => clearExportOverlay(),
				},
			],
		};
	}

	function getExportTargetShotCameras() {
		return resolveExportTargetShotCameras({
			store,
			getActiveShotCameraDocument,
		});
	}

	function clonePixelBuffer(pixels) {
		return pixels ? new Uint8Array(pixels) : pixels;
	}

	function getRenderableSceneAssets() {
		return getSceneAssets().filter(
			(asset) => asset.exportRole !== "omit" && asset.object.visible !== false,
		);
	}

	function renderConfiguredSceneCapture(config) {
		return renderConfiguredSceneCaptureHelper(config, {
			scene,
			withAssetRenderState,
			renderScenePixelsWithReadiness,
			buildSceneAssetExportMetadata,
			flipPixels,
			clonePixels: clonePixelBuffer,
		});
	}

	function renderConfiguredScenePixels(config) {
		return renderConfiguredScenePixelsHelper(config, {
			renderCapture: renderConfiguredSceneCapture,
		});
	}

	function renderMaskPassSnapshots(config) {
		return renderMaskPassSnapshotsHelper(config, {
			withMaskSceneState,
			renderScenePixelsWithReadiness,
			buildSceneAssetExportMetadata,
			getSceneAssets,
			flipPixels,
			clonePixels: clonePixelBuffer,
		});
	}

	function renderPsdBasePixels(config) {
		return renderPsdBasePixelsHelper(config, {
			renderScenePixels: renderConfiguredScenePixels,
		});
	}

	function withAssetRenderState(config, callback) {
		return withAssetRenderStateHelper(config, callback, {
			scene,
			guides,
			guideOverlay,
			renderer,
			getSceneAssets,
			applyRenderOrder: applyExportAssetRenderOrder,
		});
	}

	function withMaskSceneState(maskPass, allowedAssetIds, callback) {
		return withMaskSceneStateHelper(maskPass, allowedAssetIds, callback, {
			scene,
			getSceneAssets,
		});
	}

	function renderGuideLayerPixels(config) {
		return renderGuideLayerPixelsHelper(config, {
			ensureRenderTarget: ensureGuideRenderTarget,
			renderer,
			guideOverlay,
			flipPixels,
		});
	}

	function renderScenePixelsWithReadiness(config) {
		return renderScenePixelsWithReadinessHelper(config, {
			buildReadinessPlan: buildExportReadinessPlan,
			finalizeReadiness: finalizeExportReadiness,
			getNowMs,
			renderBackend: exportRenderBackend,
		});
	}

	function withSnapshotSession(shotCameraId, callback) {
		return withOutputSnapshotSession(
			{ shotCameraId },
			{
				scene,
				spark,
				guides,
				guideOverlay,
				shotCameraRegistry,
				store,
				getShotCameraDocument,
				getShotCameraExportSettings,
				getActiveOutputCamera,
				getOutputSizeState,
				getRenderableSceneAssets,
				buildSceneAssetExportMetadata,
				buildExportPassPlan,
				createSolidColorCanvas,
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

	function renderModelLayerDocuments(config) {
		return renderModelLayerDocumentsHelper(config, {
			renderScenePixels: renderConfiguredScenePixels,
			createCanvasFromPixels,
			buildLayerMaskPixels,
			createAlphaPreviewPixels,
			exportDebugLayersEnabled,
		});
	}

	function renderSplatLayerDocuments(config) {
		return renderSplatLayerDocumentsHelper(config, {
			renderScenePixels: renderConfiguredScenePixels,
			createCanvasFromPixels,
			buildSplatLayerMaskPixels,
			createAlphaPreviewPixels,
			exportDebugLayersEnabled,
		});
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
			}) => {
				return renderOutputSnapshotSession(
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
						phaseTracker: createSnapshotPhaseTracker(
							{
								targetExportSettings,
								passPlan,
								includeReferenceImages:
									store.referenceImages.exportSessionEnabled.value !== false,
								onProgress,
								t,
							},
							{
								getPhaseDefinitions: getExportPhaseDefinitions,
								getPhaseDefaultDetail: getExportPhaseDefaultDetail,
							},
						),
						renderConfiguredSceneCapture,
						clonePixels: clonePixelBuffer,
						renderGuideLayerPixels,
						renderMaskPassSnapshots,
						renderPsdBasePixels,
						renderModelLayerDocuments,
						renderSplatLayerDocuments,
						renderReferenceImageLayersForShotCamera,
					},
				);
			},
		);
	}

	const buildShotCameraExportFilename = (...args) =>
		buildShotCameraExportFilenameHelper(...args, {
			shotCameras: store.workspace.shotCameras.value,
			getShotCameraExportBaseName,
		});

	const buildPsdExportDocument = createPsdExportDocumentBuilder({
		getFrames: getActiveFrames,
		t,
		exportDebugLayersEnabled,
		createCanvasFromPixels,
		renderExportPassToCanvas,
		buildPsdDocument,
	});

	const { downloadPng, downloadPsd, downloadOutput } =
		createExportDownloadFacade({
			getTargetDocuments: getExportTargetShotCameras,
			getExportSettings: getShotCameraExportSettings,
			renderSnapshot: renderOutputSnapshotForShotCamera,
			downloadPngFromSnapshot,
			downloadPsdFromSnapshot,
			drawFramesToContext,
			previewContextError: t("error.previewContext"),
			buildFilename: buildShotCameraExportFilename,
			buildPsdExportDocument,
			setExportStatus,
			setSummary: (value) => {
				store.exportSummary.value = value;
			},
			setStatus,
			updateUi,
			clearExportOverlay,
			showExportErrorOverlay,
			setExportProgressOverlay,
			getPhaseDefaultDetail: getExportPhaseDefaultDetail,
			requireTargetsMessage: t("error.exportRequiresPreset"),
			t,
			runPngExportFn: runPngExport,
			runPsdExportFn: runPsdExport,
			runOutputExportFn: runOutputExport,
		});

	const exportBundleFacade = createExportBundleFacade({
		getFrames: getActiveFrames,
		drawFramesToContext,
		previewContextError: t("error.previewContext"),
		buildSnapshotExportBundle,
		renderCompositeOutputCanvas,
	});

	function setExportTarget(nextValue) {
		const target =
			nextValue === "all" || nextValue === "selected" ? nextValue : "current";
		store.exportOptions.target.value = target;
		if (
			target === "selected" &&
			store.exportOptions.presetIds.value.length === 0 &&
			store.workspace.activeShotCameraId.value
		) {
			store.exportOptions.presetIds.value = [
				store.workspace.activeShotCameraId.value,
			];
		}
		setStatus(
			t("status.exportTargetChanged", {
				target: t(`exportTarget.${target}`),
			}),
		);
	}

	function toggleExportPreset(shotCameraId) {
		const nextIds = new Set(store.exportOptions.presetIds.value);
		if (nextIds.has(shotCameraId)) {
			nextIds.delete(shotCameraId);
		} else {
			nextIds.add(shotCameraId);
		}

		store.exportOptions.presetIds.value = store.workspace.shotCameras.value
			.filter((documentState) => nextIds.has(documentState.id))
			.map((documentState) => documentState.id);
		setStatus(
			t("status.exportPresetSelection", {
				count: store.exportOptions.presetIds.value.length,
			}),
		);
	}

	function setReferenceImageExportSessionEnabled(nextEnabled) {
		store.referenceImages.exportSessionEnabled.value = nextEnabled !== false;
	}

	function isRenderLocked() {
		return exportRenderLock;
	}

	function dispose() {
		exportRenderBackend.dispose();
	}

	return {
		getExportTargetShotCameras,
		renderOutputSnapshotForShotCamera,
		buildExportBundle: exportBundleFacade.buildExportBundle,
		renderCompositeOutputCanvas: exportBundleFacade.renderCompositeOutputCanvas,
		downloadPng,
		downloadPsd,
		downloadOutput,
		buildShotCameraExportFilename,
		setExportTarget,
		toggleExportPreset,
		setReferenceImageExportSessionEnabled,
		isRenderLocked,
		dispose,
	};
}
