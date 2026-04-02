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
import { applyExportAssetRenderOrder } from "./export/render-state.js";
import {
	withAssetRenderState as withAssetRenderStateHelper,
	withMaskSceneState as withMaskSceneStateHelper,
} from "./export/scene-state.js";
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

	async function renderGuideLayerPixels({
		camera,
		width,
		height,
		gridVisible = false,
		eyeLevelVisible = false,
		gridLayerMode = "bottom",
	}) {
		if (!gridVisible && !eyeLevelVisible) {
			return null;
		}

		const target = ensureGuideRenderTarget(width, height);
		const previousTarget = renderer.getRenderTarget();
		const previousAutoClear = renderer.autoClear;
		const previousClearAlpha = renderer.getClearAlpha();
		const previousClearColor = renderer
			.getClearColor(new THREE.Color())
			.clone();
		const previousGuideOverlayState = guideOverlay.captureState();
		const pixels = new Uint8Array(width * height * 4);

		try {
			guideOverlay.applyState({
				gridVisible,
				eyeLevelVisible,
				gridLayerMode,
			});
			renderer.setRenderTarget(target);
			renderer.autoClear = true;
			renderer.setClearColor(0x000000, 0);
			renderer.clear(true, true, true);
			guideOverlay.renderBackground(renderer, camera);
			renderer.autoClear = false;
			guideOverlay.renderOverlay(renderer, camera);
			renderer.readRenderTargetPixels(target, 0, 0, width, height, pixels);
			return flipPixels(pixels, width, height);
		} finally {
			guideOverlay.applyState(previousGuideOverlayState);
			renderer.setRenderTarget(previousTarget);
			renderer.autoClear = previousAutoClear;
			renderer.setClearColor(previousClearColor, previousClearAlpha);
		}
	}

	async function renderScenePixelsWithReadiness({
		scene,
		camera,
		width,
		height,
		sceneAssets,
	}) {
		const readinessPlan = buildExportReadinessPlan({
			sceneAssets,
		});
		const deadline = getNowMs() + readinessPlan.maxWaitMs;
		let completedWarmupPasses = 0;

		while (
			completedWarmupPasses < readinessPlan.warmupPasses &&
			getNowMs() <= deadline
		) {
			await exportRenderBackend.prepareFrame({
				scene,
				camera,
				width,
				height,
				update: true,
			});
			await exportRenderBackend.renderFrame({
				scene,
				camera,
				width,
				height,
			});
			completedWarmupPasses += 1;
		}

		await exportRenderBackend.prepareFrame({
			scene,
			camera,
			width,
			height,
			update: true,
		});
		await exportRenderBackend.renderFrame({
			scene,
			camera,
			width,
			height,
		});

		return {
			pixels: await exportRenderBackend.readPixels({
				width,
				height,
			}),
			readiness: finalizeExportReadiness(readinessPlan, {
				completedWarmupPasses,
				timedOut: completedWarmupPasses < readinessPlan.warmupPasses,
			}),
		};
	}

	async function renderOutputSnapshotForShotCamera(
		shotCameraId,
		{ onProgress = null } = {},
	) {
		const targetDocument = getShotCameraDocument(shotCameraId);
		const previousShotCameraId = store.workspace.activeShotCameraId.value;
		const shouldRestore = shotCameraId && shotCameraId !== previousShotCameraId;
		const previousGuidesVisible = guides.visible;
		const previousGuideOverlayState = guideOverlay.captureState();
		const previousSparkAutoUpdate = spark.autoUpdate;
		const previousHelperVisibility = new Map();
		const targetExportSettings = getShotCameraExportSettings(targetDocument);

		for (const [entryId, entry] of shotCameraRegistry.entries()) {
			previousHelperVisibility.set(entryId, entry.helper.visible);
			entry.helper.visible = false;
		}

		guides.visible = false;

		if (shouldRestore) {
			store.workspace.activeShotCameraId.value = shotCameraId;
		}

		try {
			exportRenderLock = true;
			syncActiveShotCameraFromDocument();
			syncShotProjection();
			syncOutputCamera();

			const outputCamera = getActiveOutputCamera();
			const { width, height } = getOutputSizeState(targetDocument);
			const renderableSceneAssets = getRenderableSceneAssets();
			const sceneAssets = buildSceneAssetExportMetadata(renderableSceneAssets);
			const backgroundColor = scene.background?.isColor
				? `#${scene.background.getHexString()}`
				: "#08111d";
			const backgroundCanvas = createSolidColorCanvas(
				width,
				height,
				backgroundColor,
			);
			const passPlan = buildExportPassPlan(sceneAssets);
			const phaseDefinitions = getExportPhaseDefinitions({
				exportFormat: targetExportSettings.exportFormat,
				exportGridOverlay: targetExportSettings.exportGridOverlay,
				hasMasks: passPlan.masks.some((maskPass) => maskPass.assetIds?.length),
				exportModelLayers: targetExportSettings.exportModelLayers,
				exportSplatLayers: targetExportSettings.exportSplatLayers,
				includeReferenceImages:
					store.referenceImages.exportSessionEnabled.value !== false,
				t,
			});
			const completedPhaseIds = new Set();
			const emitPhase = (id, detail = "", progress = null) => {
				const phase = phaseDefinitions.find((entry) => entry.id === id) ?? null;
				onProgress?.({
					id,
					label: phase?.label ?? "",
					detail:
						detail ||
						getExportPhaseDefaultDetail(
							id,
							targetExportSettings.exportFormat,
							t,
						),
					definitions: phaseDefinitions,
					completedIds: new Set(completedPhaseIds),
					activeId: id,
					progress,
				});
			};
			const completePhase = (id) => {
				completedPhaseIds.add(id);
			};
			spark.autoUpdate = false;
			guideOverlay.applyState({
				gridVisible: false,
				eyeLevelVisible: false,
				gridLayerMode: targetExportSettings.exportGridLayerMode,
			});
			emitPhase("prepare");
			completePhase("prepare");
			emitPhase("beauty");
			const sceneCapture = await renderConfiguredSceneCapture({
				camera: outputCamera,
				width,
				height,
				sceneAssets: renderableSceneAssets,
				sceneBackground: null,
				clearAlpha: 0,
				guidesVisible: false,
				resolveAssetRole: (asset) => {
					if (asset.exportRole === "omit") {
						return "hide";
					}
					return "normal";
				},
			});
			const beautyPixels = clonePixelBuffer(sceneCapture.pixels);
			completePhase("beauty");
			const gridGuidePixels = targetExportSettings.exportGridOverlay
				? await (() => {
						emitPhase("guides", t("overlay.exportPhaseDetailGuidesGrid"));
						return renderGuideLayerPixels({
							camera: outputCamera,
							width,
							height,
							gridVisible: true,
							eyeLevelVisible: false,
							gridLayerMode: targetExportSettings.exportGridLayerMode,
						});
					})()
				: null;
			const eyeLevelPixels = targetExportSettings.exportGridOverlay
				? await (() => {
						emitPhase("guides", t("overlay.exportPhaseDetailGuidesEyeLevel"));
						return renderGuideLayerPixels({
							camera: outputCamera,
							width,
							height,
							gridVisible: false,
							eyeLevelVisible: true,
							gridLayerMode: targetExportSettings.exportGridLayerMode,
						});
					})()
				: null;
			if (targetExportSettings.exportGridOverlay) {
				completePhase("guides");
			}
			if (passPlan.masks.some((maskPass) => maskPass.assetIds?.length)) {
				emitPhase("masks");
			}
			const maskPasses = await renderMaskPassSnapshots({
				scene,
				camera: outputCamera,
				width,
				height,
				sceneAssets,
				maskPasses: passPlan.masks,
				onProgress: ({ index, count, name }) =>
					emitPhase(
						"masks",
						t("overlay.exportPhaseDetailMaskBatch", { index, count, name }),
					),
			});
			if (passPlan.masks.some((maskPass) => maskPass.assetIds?.length)) {
				completePhase("masks");
			}
			if (
				targetExportSettings.exportFormat === "psd" &&
				targetExportSettings.exportModelLayers
			) {
				emitPhase("psd-base");
			}
			const psdBasePixels =
				targetExportSettings.exportFormat === "psd"
					? await renderPsdBasePixels({
							camera: outputCamera,
							width,
							height,
							sceneAssets: renderableSceneAssets,
							exportSettings: targetExportSettings,
						})
					: null;
			if (
				targetExportSettings.exportFormat === "psd" &&
				targetExportSettings.exportModelLayers
			) {
				completePhase("psd-base");
				emitPhase("model-layers");
			}
			const modelLayers =
				targetExportSettings.exportFormat === "psd"
					? await renderModelLayerDocuments({
							camera: outputCamera,
							width,
							height,
							sceneAssets: renderableSceneAssets,
							exportSettings: targetExportSettings,
							onProgress: ({ index, count, name }) =>
								emitPhase(
									"model-layers",
									t("overlay.exportPhaseDetailModelLayersBatch", {
										index,
										count,
										name,
									}),
								),
						})
					: { layers: [], debugGroups: [] };
			if (
				targetExportSettings.exportFormat === "psd" &&
				targetExportSettings.exportModelLayers
			) {
				completePhase("model-layers");
			}
			if (
				targetExportSettings.exportFormat === "psd" &&
				targetExportSettings.exportSplatLayers
			) {
				emitPhase("splat-layers");
			}
			const splatLayers =
				targetExportSettings.exportFormat === "psd"
					? await renderSplatLayerDocuments({
							camera: outputCamera,
							width,
							height,
							sceneAssets: renderableSceneAssets,
							exportSettings: targetExportSettings,
							onProgress: ({ index, count, name }) =>
								emitPhase(
									"splat-layers",
									t("overlay.exportPhaseDetailSplatLayersBatch", {
										index,
										count,
										name,
									}),
								),
						})
					: { layers: [], debugGroups: [] };
			if (
				targetExportSettings.exportFormat === "psd" &&
				targetExportSettings.exportSplatLayers
			) {
				completePhase("splat-layers");
			}
			if (store.referenceImages.exportSessionEnabled.value !== false) {
				emitPhase("reference-images");
			}
			const referenceImageLayers =
				await renderReferenceImageLayersForShotCamera({
					referenceImageDocument: store.referenceImages.document.value,
					exportSessionEnabled:
						store.referenceImages.exportSessionEnabled.value,
					documentState: targetDocument,
					width,
					height,
					previewContextError: t("error.previewContext"),
					applyOpacity: targetExportSettings.exportFormat !== "psd",
					onProgress: ({ index, count, name }) =>
						emitPhase(
							"reference-images",
							t("overlay.exportPhaseDetailReferenceImagesBatch", {
								index,
								count,
								name,
							}),
						),
				});
			if (store.referenceImages.exportSessionEnabled.value !== false) {
				completePhase("reference-images");
			}
			return {
				width,
				height,
				pixels: beautyPixels,
				exportSettings: targetExportSettings,
				sceneAssets,
				readiness: sceneCapture.readiness,
				maskPasses,
				backgroundCanvas,
				gridGuidePixels,
				eyeLevelPixels,
				referenceImageLayers,
				psdBasePixels,
				modelLayers: modelLayers.layers,
				modelDebugGroups: modelLayers.debugGroups,
				splatLayers: splatLayers.layers,
				splatDebugGroups: splatLayers.debugGroups,
			};
		} finally {
			exportRenderLock = false;
			spark.autoUpdate = previousSparkAutoUpdate;
			guides.visible = previousGuidesVisible;
			guideOverlay.applyState(previousGuideOverlayState);
			for (const [entryId, entry] of shotCameraRegistry.entries()) {
				entry.helper.visible = previousHelperVisibility.get(entryId) ?? false;
			}

			if (shouldRestore) {
				store.workspace.activeShotCameraId.value = previousShotCameraId;
				syncActiveShotCameraFromDocument();
				syncShotProjection();
				syncOutputCamera();
			}

			updateShotCameraHelpers();
		}
	}

	function buildShotCameraExportFilename(
		documentState,
		_snapshot,
		format = "png",
		sequenceIndex = null,
	) {
		const fallbackIndex =
			store.workspace.shotCameras.value.findIndex(
				(shotCamera) => shotCamera.id === documentState?.id,
			) + 1;
		const baseName = getShotCameraExportBaseName(documentState, fallbackIndex);
		const sequenceSuffix =
			Number.isFinite(sequenceIndex) && sequenceIndex > 0
				? `-${String(sequenceIndex).padStart(2, "0")}`
				: "";
		return `${baseName}${sequenceSuffix}.${format}`;
	}

	function buildPsdExportDocument(bundle, frames = getActiveFrames()) {
		return buildPsdDocument(bundle, frames, {
			groupLabel: t("section.referenceImages"),
			frameGroupLabel: t("section.frames"),
			exportDebugLayersEnabled,
			createCanvasFromPixels,
			renderExportPassToCanvas,
		});
	}

	async function downloadPng() {
		setExportStatus("export.exporting", true);

		try {
			const targetDocuments = getExportTargetShotCameras();
			if (targetDocuments.length === 0) {
				throw new Error(t("error.exportRequiresPreset"));
			}

			let lastSnapshot = null;

			for (const [index, documentState] of targetDocuments.entries()) {
				const snapshot = await renderOutputSnapshotForShotCamera(
					documentState.id,
				);
				downloadPngFromSnapshot(
					documentState,
					snapshot,
					targetDocuments.length > 1 ? index + 1 : null,
					{
						frames: documentState.frames ?? [],
						drawFramesToContext,
						previewContextError: t("error.previewContext"),
						buildFilename: buildShotCameraExportFilename,
					},
				);

				lastSnapshot = snapshot;
			}

			if (targetDocuments.length === 1 && lastSnapshot) {
				store.exportSummary.value = t("exportSummary.exported", {
					width: lastSnapshot.width,
					height: lastSnapshot.height,
				});
				setStatus(t("status.pngExported"));
			} else {
				store.exportSummary.value = t("exportSummary.exportedBatch", {
					count: targetDocuments.length,
				});
				setStatus(
					t("status.pngExportedBatch", {
						count: targetDocuments.length,
					}),
				);
			}
			setExportStatus("export.ready");
			updateUi();
		} catch (error) {
			console.error(error);
			store.exportSummary.value = error.message;
			setExportStatus("export.idle");
			setStatus(error.message);
		}
	}

	async function downloadPsd() {
		setExportStatus("export.exporting", true);

		try {
			const targetDocuments = getExportTargetShotCameras();
			if (targetDocuments.length === 0) {
				throw new Error(t("error.exportRequiresPreset"));
			}

			let exportCount = 0;

			for (const [index, documentState] of targetDocuments.entries()) {
				const snapshot = await renderOutputSnapshotForShotCamera(
					documentState.id,
				);
				downloadPsdFromSnapshot(
					documentState,
					snapshot,
					targetDocuments.length > 1 ? index + 1 : null,
					{
						frames: documentState.frames ?? [],
						drawFramesToContext,
						previewContextError: t("error.previewContext"),
						buildFilename: buildShotCameraExportFilename,
						buildPsdExportDocument,
					},
				);
				exportCount += 1;
			}

			store.exportSummary.value = t("exportSummary.psdExported", {
				count: exportCount,
			});
			setExportStatus("export.ready");
			setStatus(
				t("status.psdExported", {
					count: exportCount,
				}),
			);
			updateUi();
		} catch (error) {
			console.error(error);
			store.exportSummary.value = error.message;
			setExportStatus("export.idle");
			setStatus(error.message);
		}
	}

	async function downloadOutput() {
		setExportStatus("export.exporting", true);

		try {
			const targetDocuments = getExportTargetShotCameras();
			if (targetDocuments.length === 0) {
				throw new Error(t("error.exportRequiresPreset"));
			}
			const progressStartedAt = Date.now();

			let pngCount = 0;
			let psdCount = 0;
			let lastSnapshot = null;
			let lastFormat = "png";

			for (const [index, documentState] of targetDocuments.entries()) {
				const exportSettings = getShotCameraExportSettings(documentState);
				let currentPhaseState = null;
				const pushOverlay = (phaseState = currentPhaseState) =>
					setExportProgressOverlay(
						targetDocuments,
						index,
						exportSettings.exportFormat,
						progressStartedAt,
						phaseState,
					);
				pushOverlay();
				const snapshot = await renderOutputSnapshotForShotCamera(
					documentState.id,
					{
						onProgress: (phaseState) => {
							currentPhaseState = phaseState;
							pushOverlay();
						},
					},
				);
				const sequenceIndex = targetDocuments.length > 1 ? index + 1 : null;
				if (currentPhaseState?.definitions?.length) {
					const completedIds = new Set(currentPhaseState.completedIds ?? []);
					const activeId =
						currentPhaseState.definitions.find((phase) => phase.id === "write")
							?.id ?? null;
					currentPhaseState = {
						...currentPhaseState,
						id: activeId,
						activeId,
						label:
							currentPhaseState.definitions.find(
								(phase) => phase.id === "write",
							)?.label ?? "",
						detail: getExportPhaseDefaultDetail(
							"write",
							exportSettings.exportFormat,
							t,
						),
						completedIds,
					};
					pushOverlay();
				}
				if (exportSettings.exportFormat === "png") {
					downloadPngFromSnapshot(documentState, snapshot, sequenceIndex, {
						frames: documentState.frames ?? [],
						drawFramesToContext,
						previewContextError: t("error.previewContext"),
						buildFilename: buildShotCameraExportFilename,
					});
					pngCount += 1;
				} else {
					downloadPsdFromSnapshot(documentState, snapshot, sequenceIndex, {
						frames: documentState.frames ?? [],
						drawFramesToContext,
						previewContextError: t("error.previewContext"),
						buildFilename: buildShotCameraExportFilename,
						buildPsdExportDocument,
					});
					psdCount += 1;
				}
				lastSnapshot = snapshot;
				lastFormat = exportSettings.exportFormat;
			}

			const exportCount = pngCount + psdCount;
			if (exportCount === 1 && lastSnapshot) {
				store.exportSummary.value =
					lastFormat === "png"
						? t("exportSummary.exported", {
								width: lastSnapshot.width,
								height: lastSnapshot.height,
							})
						: t("exportSummary.psdExported", { count: 1 });
				setStatus(
					lastFormat === "png"
						? t("status.pngExported")
						: t("status.psdExported", { count: 1 }),
				);
			} else if (pngCount > 0 && psdCount > 0) {
				store.exportSummary.value = t("exportSummary.exportedMixed", {
					count: exportCount,
				});
				setStatus(
					t("status.exportedMixed", {
						count: exportCount,
					}),
				);
			} else if (pngCount > 0) {
				store.exportSummary.value = t("exportSummary.exportedBatch", {
					count: pngCount,
				});
				setStatus(
					t("status.pngExportedBatch", {
						count: pngCount,
					}),
				);
			} else {
				store.exportSummary.value = t("exportSummary.psdExported", {
					count: psdCount,
				});
				setStatus(
					t("status.psdExported", {
						count: psdCount,
					}),
				);
			}
			clearExportOverlay();
			setExportStatus("export.ready");
			updateUi();
		} catch (error) {
			console.error(error);
			store.exportSummary.value = error.message;
			setExportStatus("export.idle");
			setStatus(error.message);
			showExportErrorOverlay(error);
		}
	}

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
		buildExportBundle: (snapshot, frames = getActiveFrames()) =>
			buildSnapshotExportBundle(snapshot, frames, {
				drawFramesToContext,
				previewContextError: t("error.previewContext"),
			}),
		renderCompositeOutputCanvas: (snapshot, frames = getActiveFrames()) =>
			renderCompositeOutputCanvas(snapshot, frames, {
				drawFramesToContext,
				previewContextError: t("error.previewContext"),
			}),
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
