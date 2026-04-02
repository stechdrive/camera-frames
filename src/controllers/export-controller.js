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
	buildLayerMaskPixels,
	buildSplatLayerMaskPixels,
	createAlphaPreviewPixels,
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
	const MASK_FOREGROUND_COLOR = new THREE.Color(0xffffff);
	const MASK_BACKGROUND_COLOR = new THREE.Color(0x000000);
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

	function createMaskMaterial(sourceMaterial, color) {
		const maskMaterial = new THREE.MeshBasicMaterial({
			color,
			side: sourceMaterial?.side ?? THREE.FrontSide,
			depthTest: sourceMaterial?.depthTest !== false,
			depthWrite: sourceMaterial?.depthWrite !== false,
			fog: false,
			toneMapped: false,
		});
		applySourceCutoutState(maskMaterial, sourceMaterial);
		maskMaterial.name = `${sourceMaterial?.name || "material"}__mask`;
		return maskMaterial;
	}

	function applySourceCutoutState(material, sourceMaterial) {
		if (!material || !sourceMaterial) {
			return material;
		}

		material.map = sourceMaterial.map ?? null;
		material.alphaMap = sourceMaterial.alphaMap ?? null;
		material.alphaTest = Number(sourceMaterial.alphaTest) || 0;
		material.opacity = Number.isFinite(sourceMaterial.opacity)
			? sourceMaterial.opacity
			: 1;
		material.transparent = sourceMaterial.transparent === true;
		material.alphaHash = sourceMaterial.alphaHash === true;
		material.vertexColors = Boolean(sourceMaterial.vertexColors);

		if (material.map || material.alphaMap) {
			material.onBeforeCompile = (shader) => {
				shader.fragmentShader = shader.fragmentShader.replace(
					"#include <alphamap_fragment>",
					"#include <alphamap_fragment>\n\tdiffuseColor.rgb = diffuse;",
				);
			};
			material.customProgramCacheKey = () =>
				`camera-frames-export-cutout:${material.map ? 1 : 0}:${
					material.alphaMap ? 1 : 0
				}:${material.alphaTest}:${material.alphaHash ? 1 : 0}`;
		}

		return material;
	}

	function createFlatRenderMaterial(
		sourceMaterial,
		color,
		{ colorWrite = true, depthTest = true, depthWrite = true } = {},
	) {
		const material = new THREE.MeshBasicMaterial({
			color,
			side: sourceMaterial?.side ?? THREE.FrontSide,
			depthTest,
			depthWrite,
			fog: false,
			toneMapped: false,
			transparent: false,
			opacity: 1,
		});
		applySourceCutoutState(material, sourceMaterial);
		material.colorWrite = colorWrite;
		material.name = `${sourceMaterial?.name || "material"}__export`;
		return material;
	}

	async function withAssetRenderState(
		{
			sceneBackground = null,
			clearAlpha = 0,
			guidesVisible = false,
			guideOverlayState = null,
			resolveAssetRole,
		},
		callback,
	) {
		const previousBackground = scene.background;
		const previousGuidesVisible = guides.visible;
		const previousGuideOverlayState = guideOverlay.captureState();
		const previousClearAlpha = renderer.getClearAlpha();
		const previousClearColor = renderer
			.getClearColor(new THREE.Color())
			.clone();
		const restoreCallbacks = [];

		scene.background = sceneBackground;
		guides.visible = guidesVisible;
		if (guideOverlayState) {
			guideOverlay.applyState(guideOverlayState);
		}
		renderer.setClearColor(0x000000, clearAlpha);

		for (const asset of getSceneAssets()) {
			const previousVisible = asset.object.visible;
			restoreCallbacks.push(() => {
				asset.object.visible = previousVisible;
			});
			const role = resolveAssetRole(asset);
			if (!role || role === "hide") {
				asset.object.visible = false;
				continue;
			}

			asset.object.visible = true;
			applyExportAssetRenderOrder(asset.object, role, restoreCallbacks);

			if (asset.kind === "splat" && asset.disposeTarget) {
				const previousRecolor = asset.disposeTarget.recolor.clone();
				const previousOpacity = asset.disposeTarget.opacity;
				restoreCallbacks.push(() => {
					asset.disposeTarget.recolor.copy(previousRecolor);
					asset.disposeTarget.opacity = previousOpacity;
				});
				if (role === "mask-target") {
					asset.disposeTarget.recolor.copy(MASK_FOREGROUND_COLOR);
					asset.disposeTarget.opacity = 1;
				} else if (role === "mask-occluder") {
					asset.disposeTarget.recolor.copy(MASK_BACKGROUND_COLOR);
					asset.disposeTarget.opacity = 1;
				} else if (role === "mask-alpha-occluder") {
					asset.disposeTarget.recolor.copy(MASK_FOREGROUND_COLOR);
					asset.disposeTarget.opacity = previousOpacity;
				}
				continue;
			}

			asset.object.traverse((node) => {
				if (!node.material) {
					return;
				}

				const previousMaterial = node.material;
				let nextMaterial = previousMaterial;
				if (role === "mask-target") {
					nextMaterial = Array.isArray(previousMaterial)
						? previousMaterial.map((material) =>
								createFlatRenderMaterial(material, MASK_FOREGROUND_COLOR, {
									depthTest: true,
									depthWrite: true,
								}),
							)
						: createFlatRenderMaterial(
								previousMaterial,
								MASK_FOREGROUND_COLOR,
								{
									depthTest: true,
									depthWrite: true,
								},
							);
				} else if (role === "mask-occluder") {
					nextMaterial = Array.isArray(previousMaterial)
						? previousMaterial.map((material) =>
								createFlatRenderMaterial(material, MASK_BACKGROUND_COLOR, {
									depthTest: true,
									depthWrite: true,
								}),
							)
						: createFlatRenderMaterial(
								previousMaterial,
								MASK_BACKGROUND_COLOR,
								{
									depthTest: true,
									depthWrite: true,
								},
							);
				} else if (role === "depth-occluder") {
					nextMaterial = Array.isArray(previousMaterial)
						? previousMaterial.map((material) =>
								createFlatRenderMaterial(material, MASK_BACKGROUND_COLOR, {
									colorWrite: false,
									depthTest: true,
									depthWrite: true,
								}),
							)
						: createFlatRenderMaterial(
								previousMaterial,
								MASK_BACKGROUND_COLOR,
								{
									colorWrite: false,
									depthTest: true,
									depthWrite: true,
								},
							);
				}

				if (nextMaterial === previousMaterial) {
					return;
				}

				node.material = nextMaterial;
				restoreCallbacks.push(() => {
					if (Array.isArray(node.material)) {
						for (const material of node.material) {
							material.dispose?.();
						}
					} else {
						node.material?.dispose?.();
					}
					node.material = previousMaterial;
				});
			});
		}

		try {
			return await callback();
		} finally {
			for (let index = restoreCallbacks.length - 1; index >= 0; index -= 1) {
				restoreCallbacks[index]();
			}
			scene.background = previousBackground;
			guides.visible = previousGuidesVisible;
			guideOverlay.applyState(previousGuideOverlayState);
			renderer.setClearColor(previousClearColor, previousClearAlpha);
		}
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

	async function renderModelLayerDocuments({
		camera,
		width,
		height,
		sceneAssets,
		exportSettings,
		onProgress = null,
	}) {
		if (!exportSettings.exportModelLayers) {
			return [];
		}

		const modelAssets = sceneAssets.filter((asset) => asset.kind === "model");
		if (modelAssets.length === 0) {
			return {
				layers: [],
				debugGroups: [],
			};
		}

		const modelLayers = [];
		const modelDebugGroups = [];
		for (const [index, modelAsset] of modelAssets.entries()) {
			onProgress?.({
				index: index + 1,
				count: modelAssets.length,
				name: modelAsset.label,
			});
			const sourcePixels = await renderConfiguredScenePixels({
				camera,
				width,
				height,
				sceneAssets,
				resolveAssetRole: (asset) =>
					asset.id === modelAsset.id ? "normal" : "hide",
			});
			const modelVisibilityPixels = await renderConfiguredScenePixels({
				camera,
				width,
				height,
				sceneAssets,
				resolveAssetRole: (asset) => {
					if (asset.id === modelAsset.id) {
						return "mask-target";
					}
					if (asset.exportRole === "omit") {
						return "hide";
					}
					if (asset.kind === "model") {
						return "mask-occluder";
					}
					return "hide";
				},
			});
			const splatOccluderPixels = await renderConfiguredScenePixels({
				camera,
				width,
				height,
				sceneAssets,
				resolveAssetRole: (asset) => {
					if (asset.id === modelAsset.id) {
						return "depth-occluder";
					}
					if (asset.exportRole === "omit") {
						return "hide";
					}
					if (asset.kind === "splat") {
						return "mask-alpha-occluder";
					}
					return "hide";
				},
			});
			const layerMaskPixels = buildLayerMaskPixels(
				sourcePixels,
				modelVisibilityPixels,
				splatOccluderPixels,
			);
			modelLayers.push({
				name: modelAsset.label,
				canvas: createCanvasFromPixels(sourcePixels, width, height),
				mask: {
					canvas: createCanvasFromPixels(layerMaskPixels, width, height),
					left: 0,
					top: 0,
					right: width,
					bottom: height,
					defaultColor: 0,
				},
			});

			if (exportDebugLayersEnabled) {
				modelDebugGroups.push({
					name: `__DEBUG ${modelAsset.label}`,
					hidden: true,
					opened: false,
					children: [
						{
							name: "Source Alpha",
							canvas: createCanvasFromPixels(
								createAlphaPreviewPixels(sourcePixels),
								width,
								height,
							),
						},
						{
							name: "Model Visibility Alpha",
							canvas: createCanvasFromPixels(
								createAlphaPreviewPixels(modelVisibilityPixels),
								width,
								height,
							),
						},
						{
							name: "Splat Occluder Alpha",
							canvas: createCanvasFromPixels(
								createAlphaPreviewPixels(splatOccluderPixels),
								width,
								height,
							),
						},
						{
							name: "Final Mask",
							canvas: createCanvasFromPixels(layerMaskPixels, width, height),
						},
					],
				});
			}
		}

		return {
			layers: modelLayers,
			debugGroups: modelDebugGroups,
		};
	}

	async function renderSplatLayerDocuments({
		camera,
		width,
		height,
		sceneAssets,
		exportSettings,
		onProgress = null,
	}) {
		if (!exportSettings.exportSplatLayers) {
			return {
				layers: [],
				debugGroups: [],
			};
		}

		const splatAssets = sceneAssets.filter((asset) => asset.kind === "splat");
		if (splatAssets.length === 0) {
			return {
				layers: [],
				debugGroups: [],
			};
		}

		const splatLayers = [];
		const splatDebugGroups = [];

		for (let index = 0; index < splatAssets.length; index += 1) {
			const splatAsset = splatAssets[index];
			onProgress?.({
				index: index + 1,
				count: splatAssets.length,
				name: splatAsset.label,
			});
			const lowerSplatAssets = splatAssets.slice(index + 1);
			const lowerSplatIds = new Set(lowerSplatAssets.map((asset) => asset.id));
			const isBottomSplatLayer = index === splatAssets.length - 1;

			const sourcePixels = await renderConfiguredScenePixels({
				camera,
				width,
				height,
				sceneAssets,
				resolveAssetRole: (asset) => {
					if (asset.kind === "model") {
						return "hide";
					}
					return asset.id === splatAsset.id ? "normal" : "hide";
				},
			});

			const overlay = {
				name: splatAsset.label,
				canvas: createCanvasFromPixels(sourcePixels, width, height),
			};

			if (!isBottomSplatLayer) {
				const lowerPixels = await renderConfiguredScenePixels({
					camera,
					width,
					height,
					sceneAssets,
					resolveAssetRole: (asset) => {
						if (asset.kind === "model") {
							return "hide";
						}
						return lowerSplatIds.has(asset.id) ? "normal" : "hide";
					},
				});

				const compositePixels = await renderConfiguredScenePixels({
					camera,
					width,
					height,
					sceneAssets,
					resolveAssetRole: (asset) => {
						if (asset.kind === "model") {
							return "hide";
						}
						return asset.id === splatAsset.id || lowerSplatIds.has(asset.id)
							? "normal"
							: "hide";
					},
				});

				const layerMaskPixels = buildSplatLayerMaskPixels(
					sourcePixels,
					compositePixels,
					lowerPixels,
					width,
					height,
				);
				overlay.mask = {
					canvas: createCanvasFromPixels(layerMaskPixels, width, height),
					left: 0,
					top: 0,
					right: width,
					bottom: height,
					defaultColor: 0,
				};

				if (exportDebugLayersEnabled) {
					splatDebugGroups.push({
						name: `__DEBUG ${splatAsset.label}`,
						hidden: true,
						opened: false,
						children: [
							{
								name: "Source Alpha",
								canvas: createCanvasFromPixels(
									createAlphaPreviewPixels(sourcePixels),
									width,
									height,
								),
							},
							{
								name: "Composite Alpha",
								canvas: createCanvasFromPixels(
									createAlphaPreviewPixels(compositePixels),
									width,
									height,
								),
							},
							{
								name: "Lower Alpha",
								canvas: createCanvasFromPixels(
									createAlphaPreviewPixels(lowerPixels),
									width,
									height,
								),
							},
							{
								name: "Final Mask",
								canvas: createCanvasFromPixels(layerMaskPixels, width, height),
							},
						],
					});
				}
			}

			splatLayers.push(overlay);
		}

		return {
			layers: splatLayers,
			debugGroups: splatDebugGroups,
		};
	}

	function withMaskSceneState(maskPass, allowedAssetIds, callback) {
		const targetAssetIds = new Set(maskPass.assetIds ?? []);
		const previousBackground = scene.background;
		const restoreCallbacks = [];

		scene.background = MASK_BACKGROUND_COLOR;

		for (const asset of getSceneAssets()) {
			const previousVisible = asset.object.visible;
			restoreCallbacks.push(() => {
				asset.object.visible = previousVisible;
			});
			if (!allowedAssetIds.has(asset.id)) {
				asset.object.visible = false;
				continue;
			}
			const isTargetAsset = targetAssetIds.has(asset.id);

			if (asset.exportRole === "omit" && !isTargetAsset) {
				asset.object.visible = false;
				continue;
			}

			asset.object.visible = true;
			const tintColor = isTargetAsset
				? MASK_FOREGROUND_COLOR
				: MASK_BACKGROUND_COLOR;

			if (asset.kind === "splat" && asset.disposeTarget) {
				const previousRecolor = asset.disposeTarget.recolor.clone();
				const previousOpacity = asset.disposeTarget.opacity;
				asset.disposeTarget.recolor.copy(tintColor);
				asset.disposeTarget.opacity = 1;
				restoreCallbacks.push(() => {
					asset.disposeTarget.recolor.copy(previousRecolor);
					asset.disposeTarget.opacity = previousOpacity;
				});
				continue;
			}

			asset.object.traverse((node) => {
				if (!node.material) {
					return;
				}

				const previousMaterial = node.material;
				const nextMaterial = Array.isArray(previousMaterial)
					? previousMaterial.map((material) =>
							createMaskMaterial(material, tintColor),
						)
					: createMaskMaterial(previousMaterial, tintColor);
				node.material = nextMaterial;
				restoreCallbacks.push(() => {
					if (Array.isArray(node.material)) {
						for (const material of node.material) {
							material.dispose?.();
						}
					} else {
						node.material?.dispose?.();
					}
					node.material = previousMaterial;
				});
			});
		}

		const restoreMaskSceneState = () => {
			for (let index = restoreCallbacks.length - 1; index >= 0; index -= 1) {
				restoreCallbacks[index]();
			}
			scene.background = previousBackground;
		};

		return Promise.resolve().then(callback).finally(restoreMaskSceneState);
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
