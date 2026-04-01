import * as THREE from "three";
import { IS_DEV_RUNTIME, hasEnabledQueryFlag } from "../build-info.js";
import {
	createExportBundle,
	createExportPass,
	createPixelLayer,
	createRasterLayer,
	getAllExportBundlePasses,
	renderExportBundleToCanvas,
	renderExportPassToCanvas,
} from "../engine/export-bundle.js";
import { buildExportPassPlan } from "../engine/export-pass-plan.js";
import {
	buildExportReadinessPlan,
	finalizeExportReadiness,
} from "../engine/export-readiness.js";
import { createAllFrameMaskPsdLayerDocument } from "../engine/frame-mask-export.js";
import { downloadPsdDocument } from "../engine/psd-export.js";
import { getPsdReferenceImageGroupLayers } from "../engine/reference-image-export-order.js";
import { createSparkExportRendererManager } from "../engine/spark-export-renderer.js";
import {
	REFERENCE_IMAGE_GROUP_BACK,
	REFERENCE_IMAGE_GROUP_FRONT,
	applyRenderBoxOffsetCorrection,
	getReferenceImageRenderBoxAnchor,
	resolveReferenceImageItemsForShot,
} from "../reference-image-model.js";
import { sanitizeFrameName } from "../workspace-model.js";
import {
	buildLayerMaskPixels,
	buildSplatLayerMaskPixels,
	createAlphaPreviewPixels,
} from "./export/mask-pixels.js";
import {
	buildExportProgressOverlay,
	getExportPhaseDefaultDetail,
	getExportPhaseDefinitions,
} from "./export/progress.js";
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

	function createCanvasFromPixels(pixels, width, height) {
		const canvas = document.createElement("canvas");
		canvas.width = width;
		canvas.height = height;
		const context = canvas.getContext("2d");
		if (!context) {
			throw new Error(t("error.previewContext"));
		}

		const imageData = new ImageData(
			new Uint8ClampedArray(pixels),
			width,
			height,
		);
		context.putImageData(imageData, 0, 0);
		return canvas;
	}

	function createSolidColorCanvas(width, height, color) {
		const canvas = document.createElement("canvas");
		canvas.width = width;
		canvas.height = height;
		const context = canvas.getContext("2d");
		if (!context) {
			throw new Error(t("error.previewContext"));
		}
		context.fillStyle = color;
		context.fillRect(0, 0, width, height);
		return canvas;
	}

	async function loadReferenceImageDrawable(blob) {
		try {
			const imageBitmap = await createImageBitmap(blob);
			return {
				drawable: imageBitmap,
				cleanup: () => {
					try {
						imageBitmap.close?.();
					} catch {
						// ignore
					}
				},
			};
		} catch {
			const objectUrl = URL.createObjectURL(blob);
			const image = await new Promise((resolve, reject) => {
				const element = new Image();
				element.onload = () => resolve(element);
				element.onerror = (error) => reject(error);
				element.src = objectUrl;
			});
			return {
				drawable: image,
				cleanup: () => {
					URL.revokeObjectURL(objectUrl);
				},
			};
		}
	}

	function rotateReferencePoint(point, angleRad) {
		const cos = Math.cos(angleRad);
		const sin = Math.sin(angleRad);
		return {
			x: point.x * cos - point.y * sin,
			y: point.x * sin + point.y * cos,
		};
	}

	function buildReferenceImageExportCanvas({
		drawable,
		width,
		height,
		anchor,
		anchorPoint,
		rotationDeg,
		pixelPerfect,
		opacity,
		applyOpacity = true,
	}) {
		const angleRad = (rotationDeg * Math.PI) / 180;
		const localCorners = [
			{ x: -anchor.ax * width, y: -anchor.ay * height },
			{ x: (1 - anchor.ax) * width, y: -anchor.ay * height },
			{ x: (1 - anchor.ax) * width, y: (1 - anchor.ay) * height },
			{ x: -anchor.ax * width, y: (1 - anchor.ay) * height },
		];
		const worldCorners = localCorners.map((corner) => {
			const rotated = rotateReferencePoint(corner, angleRad);
			return {
				x: rotated.x + anchorPoint.x,
				y: rotated.y + anchorPoint.y,
			};
		});
		const minX = Math.min(...worldCorners.map((corner) => corner.x));
		const maxX = Math.max(...worldCorners.map((corner) => corner.x));
		const minY = Math.min(...worldCorners.map((corner) => corner.y));
		const maxY = Math.max(...worldCorners.map((corner) => corner.y));
		const left = Math.floor(minX);
		const top = Math.floor(minY);
		const right = Math.ceil(maxX);
		const bottom = Math.ceil(maxY);
		const canvas = document.createElement("canvas");
		canvas.width = Math.max(1, right - left);
		canvas.height = Math.max(1, bottom - top);
		const context = canvas.getContext("2d");
		if (!context) {
			throw new Error(t("error.previewContext"));
		}
		context.imageSmoothingEnabled = !pixelPerfect;
		context.translate(-left, -top);
		context.translate(anchorPoint.x, anchorPoint.y);
		context.rotate(angleRad);
		if (applyOpacity) {
			context.globalAlpha = opacity;
		}
		context.drawImage(
			drawable,
			-anchor.ax * width,
			-anchor.ay * height,
			width,
			height,
		);
		return {
			canvas,
			opacity: applyOpacity ? 1 : opacity,
			bounds: {
				left,
				top,
				right,
				bottom,
			},
		};
	}

	async function renderReferenceImageLayersForShotCamera(
		documentState,
		width,
		height,
		{ applyOpacity = true, onProgress = null } = {},
	) {
		if (store.referenceImages.exportSessionEnabled.value === false) {
			return [];
		}

		const resolved = resolveReferenceImageItemsForShot(
			store.referenceImages.document.value,
			documentState?.referenceImages ?? null,
		);
		if (!resolved.preset) {
			return [];
		}

		const renderBoxAnchor = getReferenceImageRenderBoxAnchor(
			documentState?.outputFrame?.anchor ?? "center",
		);
		const assetDrawableCache = new Map();
		const layers = [];
		const candidates = resolved.items
			.filter((item) => item.exportEnabled !== false)
			.sort((left, right) => {
				if (left.group !== right.group) {
					return left.group === REFERENCE_IMAGE_GROUP_BACK ? -1 : 1;
				}
				return left.order - right.order || left.id.localeCompare(right.id);
			});

		try {
			for (const [index, item] of candidates.entries()) {
				onProgress?.({
					index: index + 1,
					count: candidates.length,
					name: item.name,
				});
				const asset = resolved.assetsById.get(item.assetId) ?? null;
				const sourceFile = asset?.source?.file ?? null;
				if (!(sourceFile instanceof Blob) || !asset?.sourceMeta) {
					continue;
				}

				let cacheEntry = assetDrawableCache.get(asset.id) ?? null;
				if (!cacheEntry) {
					cacheEntry = await loadReferenceImageDrawable(sourceFile);
					assetDrawableCache.set(asset.id, cacheEntry);
				}

				const effectiveOffset = applyRenderBoxOffsetCorrection(
					item.offsetPx,
					item.anchor,
					resolved.preset.baseRenderBox,
					{ w: width, h: height },
					renderBoxAnchor,
					resolved.override?.renderBoxCorrection ?? null,
				);
				const logicalWidth =
					asset.sourceMeta.appliedSize.w * (item.scalePct / 100);
				const logicalHeight =
					asset.sourceMeta.appliedSize.h * (item.scalePct / 100);
				const itemAnchorPx = {
					x: width * item.anchor.ax,
					y: height * item.anchor.ay,
				};
				const anchorPoint = {
					x: itemAnchorPx.x - effectiveOffset.x,
					y: itemAnchorPx.y - effectiveOffset.y,
				};
				const renderedLayer = buildReferenceImageExportCanvas({
					drawable: cacheEntry.drawable,
					width: logicalWidth,
					height: logicalHeight,
					anchor: item.anchor,
					anchorPoint,
					rotationDeg: item.rotationDeg,
					pixelPerfect: Math.abs(item.scalePct - 100) < 1e-6,
					opacity: item.opacity,
					applyOpacity,
				});

				layers.push({
					id: item.id,
					assetId: asset.id,
					name: item.name,
					group: item.group,
					order: item.order,
					opacity: renderedLayer.opacity,
					canvas: renderedLayer.canvas,
					bounds: renderedLayer.bounds,
				});
			}
		} finally {
			for (const cacheEntry of assetDrawableCache.values()) {
				cacheEntry.cleanup?.();
			}
		}

		return layers;
	}

	function getRenderableSceneAssets() {
		return getSceneAssets().filter(
			(asset) => asset.exportRole !== "omit" && asset.object.visible !== false,
		);
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

	async function renderConfiguredScenePixels({
		camera,
		width,
		height,
		sceneAssets,
		resolveAssetRole,
		guidesVisible = false,
		sceneBackground = null,
		clearAlpha = 0,
	}) {
		const capture = await renderConfiguredSceneCapture({
			camera,
			width,
			height,
			sceneAssets,
			resolveAssetRole,
			guidesVisible,
			sceneBackground,
			clearAlpha,
		});
		return capture.pixels;
	}

	async function renderConfiguredSceneCapture({
		camera,
		width,
		height,
		sceneAssets,
		resolveAssetRole,
		guidesVisible = false,
		sceneBackground = null,
		clearAlpha = 0,
	}) {
		const allowedAssetIds = new Set(sceneAssets.map((asset) => asset.id));
		const capture = await withAssetRenderState(
			{
				sceneBackground,
				clearAlpha,
				guidesVisible,
				resolveAssetRole: (asset) => {
					if (!allowedAssetIds.has(asset.id)) {
						return "hide";
					}
					return resolveAssetRole(asset);
				},
			},
			() =>
				renderScenePixelsWithReadiness({
					scene,
					camera,
					width,
					height,
					sceneAssets: buildSceneAssetExportMetadata(sceneAssets),
				}),
		);
		return {
			...capture,
			pixels: flipPixels(clonePixelBuffer(capture.pixels), width, height),
		};
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

	async function renderPsdBasePixels({
		camera,
		width,
		height,
		sceneAssets,
		exportSettings,
	}) {
		if (!exportSettings.exportModelLayers) {
			return null;
		}

		const basePixels = await renderConfiguredScenePixels({
			camera,
			width,
			height,
			sceneAssets,
			guidesVisible: false,
			sceneBackground: null,
			clearAlpha: 0,
			resolveAssetRole: (asset) => {
				if (asset.exportRole === "omit") {
					return "hide";
				}
				if (asset.kind === "model") {
					return "hide";
				}
				if (exportSettings.exportSplatLayers && asset.kind === "splat") {
					return "hide";
				}
				return "normal";
			},
		});

		return basePixels;
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

	async function renderMaskPassSnapshots({
		scene,
		camera,
		width,
		height,
		sceneAssets,
		maskPasses,
		onProgress = null,
	}) {
		const renderedMaskPasses = [];
		const allowedAssetIds = new Set(sceneAssets.map((asset) => asset.id));

		for (const [index, maskPass] of maskPasses.entries()) {
			if (!maskPass.assetIds?.length) {
				continue;
			}
			onProgress?.({
				index: index + 1,
				count: maskPasses.length,
				name: maskPass.name,
			});

			const maskCapture = await withMaskSceneState(
				maskPass,
				allowedAssetIds,
				() =>
					renderScenePixelsWithReadiness({
						scene,
						camera,
						width,
						height,
						sceneAssets: buildSceneAssetExportMetadata(getSceneAssets()),
					}),
			);
			const maskPixels = clonePixelBuffer(maskCapture.pixels);
			renderedMaskPasses.push({
				...maskPass,
				pixels: flipPixels(maskPixels, width, height),
			});
		}

		return renderedMaskPasses;
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
				await renderReferenceImageLayersForShotCamera(
					targetDocument,
					width,
					height,
					{
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
					},
				);
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

	function renderFrameOverlayLayers(width, height, frames = getActiveFrames()) {
		return [...frames]
			.sort(
				(left, right) =>
					(left.order ?? 0) - (right.order ?? 0) ||
					String(left.id ?? "").localeCompare(String(right.id ?? "")),
			)
			.map((frame, index) => {
				const canvas = document.createElement("canvas");
				canvas.width = width;
				canvas.height = height;

				const context = canvas.getContext("2d");
				if (!context) {
					throw new Error(t("error.previewContext"));
				}

				context.clearRect(0, 0, width, height);
				drawFramesToContext(context, width, height, [frame], {
					logicalSpaceWidth: width,
					logicalSpaceHeight: height,
					strokeStyle: "#ff0000",
				});

				return createRasterLayer({
					name: sanitizeFrameName(frame?.name, `FRAME ${index + 1}`),
					canvas,
					category: "frame",
					metadata: {
						frameId: frame?.id ?? null,
						order: frame?.order ?? index,
					},
				});
			});
	}

	function buildExportBundle(
		{
			width,
			height,
			pixels,
			exportSettings = null,
			sceneAssets = [],
			readiness = null,
			maskPasses: renderedMaskPasses = [],
			gridGuidePixels = null,
			eyeLevelPixels = null,
			referenceImageLayers = [],
			psdBasePixels = null,
			backgroundCanvas = null,
			modelLayers = [],
			modelDebugGroups = [],
			splatLayers = [],
			splatDebugGroups = [],
		},
		frames = getActiveFrames(),
	) {
		const passPlan = buildExportPassPlan(sceneAssets);
		const renderedMaskPassesById = new Map(
			renderedMaskPasses.map((maskPass) => [maskPass.id, maskPass]),
		);
		const beautyPass = createExportPass({
			id: passPlan.beauty.id,
			name: passPlan.beauty.name,
			category: passPlan.beauty.category,
			metadata: {
				sceneAssets,
				readiness,
				role: "beauty",
				assetIds: passPlan.beauty.assetIds,
			},
			layers: [
				createPixelLayer({
					name: "Render",
					pixels,
					width,
					height,
					category: "render",
					metadata: {
						sceneAssets,
						readiness,
						passId: "beauty",
						assetIds: passPlan.beauty.assetIds,
					},
				}),
			],
		});
		const gridPass =
			exportSettings?.exportGridOverlay && gridGuidePixels
				? createExportPass({
						id: "guide-grid",
						name: "Grid",
						category: "guide",
						metadata: {
							role: "guide-grid",
							gridLayerMode: exportSettings.exportGridLayerMode ?? "bottom",
						},
						layers: [
							createPixelLayer({
								name: "Grid",
								pixels: gridGuidePixels,
								width,
								height,
								category: "guide",
							}),
						],
					})
				: null;
		const eyeLevelPass =
			exportSettings?.exportGridOverlay && eyeLevelPixels
				? createExportPass({
						id: "guide-eye-level",
						name: "Eye Level",
						category: "guide",
						metadata: {
							role: "guide-eye-level",
						},
						layers: [
							createPixelLayer({
								name: "Eye Level",
								pixels: eyeLevelPixels,
								width,
								height,
								category: "guide",
							}),
						],
					})
				: null;
		const referenceBackPass =
			referenceImageLayers.filter(
				(layer) => layer.group === REFERENCE_IMAGE_GROUP_BACK,
			).length > 0
				? createExportPass({
						id: "reference-images-back",
						name: "Reference Images Back",
						category: "reference-image",
						metadata: {
							role: "reference-images-back",
						},
						layers: referenceImageLayers
							.filter((layer) => layer.group === REFERENCE_IMAGE_GROUP_BACK)
							.map((layer) =>
								createRasterLayer({
									name: layer.name,
									canvas: layer.canvas,
									left: layer.bounds?.left ?? 0,
									top: layer.bounds?.top ?? 0,
									opacity: layer.opacity,
									category: "reference-image",
									metadata: {
										group: layer.group,
										order: layer.order,
										itemId: layer.id,
										assetId: layer.assetId,
									},
								}),
							),
					})
				: null;
		const referenceFrontPass =
			referenceImageLayers.filter(
				(layer) => layer.group === REFERENCE_IMAGE_GROUP_FRONT,
			).length > 0
				? createExportPass({
						id: "reference-images-front",
						name: "Reference Images Front",
						category: "reference-image",
						metadata: {
							role: "reference-images-front",
						},
						layers: referenceImageLayers
							.filter((layer) => layer.group === REFERENCE_IMAGE_GROUP_FRONT)
							.map((layer) =>
								createRasterLayer({
									name: layer.name,
									canvas: layer.canvas,
									left: layer.bounds?.left ?? 0,
									top: layer.bounds?.top ?? 0,
									opacity: layer.opacity,
									category: "reference-image",
									metadata: {
										group: layer.group,
										order: layer.order,
										itemId: layer.id,
										assetId: layer.assetId,
									},
								}),
							),
					})
				: null;
		const orderedPasses = [];
		if (backgroundCanvas) {
			orderedPasses.push(
				createExportPass({
					id: "background",
					name: "Background",
					category: "background",
					metadata: {
						role: "background",
					},
					layers: [
						createRasterLayer({
							name: "Background",
							canvas: backgroundCanvas,
							category: "background",
						}),
					],
				}),
			);
		}
		if ((exportSettings?.exportGridLayerMode ?? "bottom") === "bottom") {
			if (referenceBackPass) {
				orderedPasses.push(referenceBackPass);
			}
			if (gridPass) {
				orderedPasses.push(gridPass);
			}
			orderedPasses.push(beautyPass);
		} else {
			if (referenceBackPass) {
				orderedPasses.push(referenceBackPass);
			}
			orderedPasses.push(beautyPass);
			if (gridPass) {
				orderedPasses.push(gridPass);
			}
		}
		if (referenceFrontPass) {
			orderedPasses.push(referenceFrontPass);
		}
		if (eyeLevelPass) {
			orderedPasses.push(eyeLevelPass);
		}
		orderedPasses.push(
			createExportPass({
				id: "frame-overlay",
				name: "Frame Overlay",
				category: "overlay",
				metadata: {
					role: "frame-overlay",
				},
				layers: renderFrameOverlayLayers(width, height, frames),
			}),
		);
		const bundle = createExportBundle({
			width,
			height,
			sceneAssets,
			readiness,
			passes: [
				...orderedPasses,
				...passPlan.masks.map((maskPass) =>
					createExportPass({
						id: maskPass.id,
						name: maskPass.name,
						category: maskPass.category,
						metadata: {
							role: "mask",
							maskGroup: maskPass.maskGroup,
							assetIds: maskPass.assetIds,
						},
						layers: renderedMaskPassesById.has(maskPass.id)
							? [
									createPixelLayer({
										name: "Mask",
										pixels: renderedMaskPassesById.get(maskPass.id).pixels,
										width,
										height,
										category: "mask",
										metadata: {
											passId: maskPass.id,
											maskGroup: maskPass.maskGroup,
											assetIds: maskPass.assetIds,
										},
									}),
								]
							: [],
						enabled: false,
					}),
				),
			],
		});
		return {
			...bundle,
			exportSettings,
			psdBasePixels,
			backgroundCanvas,
			gridGuidePixels,
			eyeLevelPixels,
			referenceImageLayers,
			modelLayers,
			modelDebugGroups,
			splatLayers,
			splatDebugGroups,
		};
	}

	function renderCompositeOutputCanvas(snapshot, frames = getActiveFrames()) {
		return renderExportBundleToCanvas(buildExportBundle(snapshot, frames));
	}

	function buildPsdExportDocument(bundle, frames = getActiveFrames()) {
		const passes = getAllExportBundlePasses(bundle).filter(
			(pass) => pass.enabled !== false && pass.layers?.length,
		);
		const beautyPass = passes.find((pass) => pass.id === "beauty") ?? null;
		const backgroundPass =
			passes.find((pass) => pass.id === "background") ?? null;
		const snapshotExportSettings = bundle.exportSettings ?? {
			exportGridLayerMode: "bottom",
			exportModelLayers: false,
			exportSplatLayers: false,
		};
		const gridPass = passes.find((pass) => pass.id === "guide-grid") ?? null;
		const eyeLevelPass =
			passes.find((pass) => pass.id === "guide-eye-level") ?? null;
		const frameOverlayPass =
			passes.find((pass) => pass.id === "frame-overlay") ?? null;
		const referenceImageLayers = Array.isArray(bundle.referenceImageLayers)
			? [...bundle.referenceImageLayers]
			: [];

		const modelLayers = snapshotExportSettings.exportModelLayers
			? [...(bundle.modelLayers ?? [])].reverse()
			: [];
		const splatLayers = snapshotExportSettings.exportSplatLayers
			? [...(bundle.splatLayers ?? [])].reverse()
			: [];
		const modelDebugGroups =
			snapshotExportSettings.exportModelLayers && exportDebugLayersEnabled
				? [...(bundle.modelDebugGroups ?? [])]
				: [];
		const splatDebugGroups =
			snapshotExportSettings.exportSplatLayers && exportDebugLayersEnabled
				? [...(bundle.splatDebugGroups ?? [])]
				: [];
		const renderLayer =
			beautyPass?.layers?.find((layer) => layer.type === "pixels") ?? null;
		const renderLayerDocument = renderLayer
			? {
					name: "Render",
					canvas: createCanvasFromPixels(
						bundle.psdBasePixels ?? renderLayer.pixels,
						bundle.width,
						bundle.height,
					),
				}
			: null;
		const backgroundLayerDocument = backgroundPass
			? {
					name: "Background",
					canvas: renderExportPassToCanvas(bundle, backgroundPass),
				}
			: null;
		const gridLayerDocument = gridPass
			? {
					name: "Grid",
					canvas: renderExportPassToCanvas(bundle, gridPass),
				}
			: null;
		const eyeLevelLayerDocument = eyeLevelPass
			? {
					name: "Eye Level",
					canvas: renderExportPassToCanvas(bundle, eyeLevelPass),
				}
			: null;
		const referenceImagesBackLayerDocument = referenceImageLayers.some(
			(layer) => layer.group === REFERENCE_IMAGE_GROUP_BACK,
		)
			? {
					name: t("section.referenceImages"),
					opened: false,
					children: getPsdReferenceImageGroupLayers(
						referenceImageLayers,
						REFERENCE_IMAGE_GROUP_BACK,
					).map((layer) => ({
						name: layer.name,
						canvas: layer.canvas,
						left: layer.bounds?.left ?? 0,
						top: layer.bounds?.top ?? 0,
						opacity: layer.opacity,
					})),
				}
			: null;
		const referenceImagesFrontLayerDocument = referenceImageLayers.some(
			(layer) => layer.group === REFERENCE_IMAGE_GROUP_FRONT,
		)
			? {
					name: t("section.referenceImages"),
					opened: false,
					children: getPsdReferenceImageGroupLayers(
						referenceImageLayers,
						REFERENCE_IMAGE_GROUP_FRONT,
					).map((layer) => ({
						name: layer.name,
						canvas: layer.canvas,
						left: layer.bounds?.left ?? 0,
						top: layer.bounds?.top ?? 0,
						opacity: layer.opacity,
					})),
				}
			: null;
		const frameOverlayLayerDocument = frameOverlayPass
			? {
					name: t("section.frames"),
					opened: false,
					children: (frameOverlayPass.layers ?? []).map((layer) => ({
						name: layer.name,
						canvas: layer.canvas,
						left: layer.left ?? 0,
						top: layer.top ?? 0,
						opacity: layer.opacity,
					})),
				}
			: null;
		const frameMaskLayerDocument = createAllFrameMaskPsdLayerDocument(
			frames,
			bundle.width,
			bundle.height,
		);
		const orderedLayers = [];
		if (backgroundLayerDocument) {
			orderedLayers.push(backgroundLayerDocument);
		}
		if (snapshotExportSettings.exportGridLayerMode === "bottom") {
			if (referenceImagesBackLayerDocument) {
				orderedLayers.push(referenceImagesBackLayerDocument);
			}
			if (gridLayerDocument) {
				orderedLayers.push(gridLayerDocument);
			}
		} else if (referenceImagesBackLayerDocument) {
			orderedLayers.push(referenceImagesBackLayerDocument);
		}
		if (renderLayerDocument) {
			orderedLayers.push(renderLayerDocument);
		}
		orderedLayers.push(...splatLayers, ...modelLayers);
		if (snapshotExportSettings.exportGridLayerMode !== "bottom") {
			if (gridLayerDocument) {
				orderedLayers.push(gridLayerDocument);
			}
		}
		if (eyeLevelLayerDocument) {
			orderedLayers.push(eyeLevelLayerDocument);
		}
		if (referenceImagesFrontLayerDocument) {
			orderedLayers.push(referenceImagesFrontLayerDocument);
		}
		if (frameOverlayLayerDocument) {
			orderedLayers.push(frameOverlayLayerDocument);
		}

		return {
			width: bundle.width,
			height: bundle.height,
			layers: [
				...orderedLayers,
				...splatDebugGroups,
				...modelDebugGroups,
				...(frameMaskLayerDocument ? [frameMaskLayerDocument] : []),
			],
		};
	}

	function downloadPngFromSnapshot(
		documentState,
		snapshot,
		sequenceIndex = null,
	) {
		const compositeCanvas = renderCompositeOutputCanvas(
			snapshot,
			documentState.frames ?? [],
		);
		const link = document.createElement("a");
		link.href = compositeCanvas.toDataURL("image/png");
		link.download = buildShotCameraExportFilename(
			documentState,
			snapshot,
			"png",
			sequenceIndex,
		);
		link.click();
	}

	function downloadPsdFromSnapshot(
		documentState,
		snapshot,
		sequenceIndex = null,
	) {
		const bundle = buildExportBundle(snapshot, documentState.frames ?? []);
		const psdDocument = buildPsdExportDocument(
			bundle,
			documentState.frames ?? [],
		);
		downloadPsdDocument({
			...psdDocument,
			filename: buildShotCameraExportFilename(
				documentState,
				snapshot,
				"psd",
				sequenceIndex,
			),
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
					downloadPngFromSnapshot(documentState, snapshot, sequenceIndex);
					pngCount += 1;
				} else {
					downloadPsdFromSnapshot(documentState, snapshot, sequenceIndex);
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
		buildExportBundle,
		renderCompositeOutputCanvas,
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
