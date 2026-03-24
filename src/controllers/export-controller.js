import * as THREE from "three";
import { IS_DEV_RUNTIME } from "../build-info.js";
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
import { downloadPsdDocument } from "../engine/psd-export.js";
import { createSparkExportRendererManager } from "../engine/spark-export-renderer.js";

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

	function getExportTargetShotCameras() {
		const target = store.exportOptions.target.value;
		if (target === "all") {
			return [...store.workspace.shotCameras.value];
		}

		if (target === "selected") {
			const selectedIds = new Set(store.exportOptions.presetIds.value);
			return store.workspace.shotCameras.value.filter((documentState) =>
				selectedIds.has(documentState.id),
			);
		}

		const activeDocument = getActiveShotCameraDocument();
		return activeDocument ? [activeDocument] : [];
	}

	function getSceneAssetExportOrder() {
		return getSceneAssets().map((asset) => ({
			id: asset.id,
			kind: asset.kind,
			label: asset.label,
			exportRole: asset.exportRole ?? "beauty",
			maskGroup: asset.maskGroup ?? "",
		}));
	}

	function getShotCameraExportSettings(documentState) {
		const exportSettings = documentState?.exportSettings ?? {};
		const exportFormat = exportSettings.exportFormat === "png" ? "png" : "psd";
		const exportModelLayers =
			exportFormat === "psd" && exportSettings.exportModelLayers !== false;
		return {
			exportName: String(exportSettings.exportName ?? ""),
			exportFormat,
			exportGridOverlay: Boolean(exportSettings.exportGridOverlay),
			exportGridLayerMode:
				exportSettings.exportGridLayerMode === "overlay" ? "overlay" : "bottom",
			exportModelLayers,
			exportSplatLayers:
				exportModelLayers && Boolean(exportSettings.exportSplatLayers),
		};
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

	function createAlphaPreviewPixels(pixels) {
		const previewPixels = new Uint8Array(pixels.length);
		for (let index = 0; index < pixels.length; index += 4) {
			const value = pixels[index + 3];
			previewPixels[index + 0] = value;
			previewPixels[index + 1] = value;
			previewPixels[index + 2] = value;
			previewPixels[index + 3] = value;
		}
		return previewPixels;
	}

	function extractAlphaChannel(pixels) {
		const alpha = new Uint8ClampedArray(Math.floor(pixels.length / 4));
		for (let index = 0; index < alpha.length; index += 1) {
			alpha[index] = pixels[index * 4 + 3];
		}
		return alpha;
	}

	function buildLayerMaskPixels(
		sourcePixels,
		modelOccluderPixels = null,
		splatOccluderPixels = null,
	) {
		const maskPixels = new Uint8Array(sourcePixels.length);
		for (let index = 0; index < sourcePixels.length; index += 4) {
			const sourceAlpha = sourcePixels[index + 3] / 255;
			const modelOccluderAlpha = modelOccluderPixels
				? modelOccluderPixels[index + 3] / 255
				: 0;
			const splatOccluderAlpha = splatOccluderPixels
				? splatOccluderPixels[index + 3] / 255
				: 0;
			const visibleAlpha = Math.max(
				0,
				Math.min(
					1,
					sourceAlpha * (1 - modelOccluderAlpha) * (1 - splatOccluderAlpha),
				),
			);
			const value = Math.round(visibleAlpha * 255);
			maskPixels[index + 0] = value;
			maskPixels[index + 1] = value;
			maskPixels[index + 2] = value;
			maskPixels[index + 3] = value;
		}
		return maskPixels;
	}

	function fillSplatMaskDarkSpeckles(pixels, width, height, sourceAlpha) {
		const currentThreshold = 24;
		const neighborThreshold = 6;
		const neighborMaskThreshold = 224;
		const result = new Uint8ClampedArray(pixels);

		for (let y = 1; y < height - 1; y += 1) {
			for (let x = 1; x < width - 1; x += 1) {
				const index = y * width + x;
				const pixelOffset = index * 4;
				const currentAlpha = pixels[pixelOffset + 3];
				if (currentAlpha > currentThreshold) {
					continue;
				}

				if (sourceAlpha[index] <= 0) {
					continue;
				}

				let visibleNeighbors = 0;
				for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
					for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
						if (offsetX === 0 && offsetY === 0) {
							continue;
						}
						const neighborOffset =
							((y + offsetY) * width + (x + offsetX)) * 4 + 3;
						if (pixels[neighborOffset] >= neighborMaskThreshold) {
							visibleNeighbors += 1;
						}
					}
				}

				if (visibleNeighbors >= neighborThreshold) {
					result[pixelOffset + 0] = 255;
					result[pixelOffset + 1] = 255;
					result[pixelOffset + 2] = 255;
					result[pixelOffset + 3] = 255;
				}
			}
		}

		return result;
	}

	function buildSplatLayerMaskPixels(
		sourcePixels,
		compositePixels,
		lowerPixels,
		width,
		height,
	) {
		const contributionEpsilon = 1 / 255;
		const solveDenominatorEpsilon = 1e-3;
		const result = new Uint8ClampedArray(sourcePixels.length);
		const sourceAlpha = extractAlphaChannel(sourcePixels);

		for (let index = 0; index < result.length; index += 4) {
			const sourceAlphaValue = sourcePixels[index + 3];
			const pixelIndex = index / 4;
			if (sourceAlphaValue === 0) {
				continue;
			}

			const sourceAlphaNormalized = sourceAlphaValue / 255;
			const compositeAlphaNormalized = compositePixels[index + 3] / 255;
			const lowerAlphaNormalized = lowerPixels[index + 3] / 255;
			const estimates = [];

			const alphaDenominator =
				sourceAlphaNormalized * (1 - lowerAlphaNormalized);
			if (alphaDenominator > contributionEpsilon) {
				estimates.push({
					value:
						(compositeAlphaNormalized - lowerAlphaNormalized) /
						alphaDenominator,
					weight: alphaDenominator * 2,
				});
			}

			for (let channel = 0; channel < 3; channel += 1) {
				const sourcePremultiplied =
					(sourcePixels[index + channel] / 255) * sourceAlphaNormalized;
				const compositePremultiplied =
					(compositePixels[index + channel] / 255) * compositeAlphaNormalized;
				const lowerPremultiplied =
					(lowerPixels[index + channel] / 255) * lowerAlphaNormalized;
				const denominator =
					sourcePremultiplied - sourceAlphaNormalized * lowerPremultiplied;
				if (Math.abs(denominator) <= solveDenominatorEpsilon) {
					continue;
				}

				estimates.push({
					value: (compositePremultiplied - lowerPremultiplied) / denominator,
					weight: Math.abs(denominator),
				});
			}

			let maskNormalized = 1;
			if (estimates.length > 0) {
				const weighted = estimates.reduce(
					(sum, { value, weight }) =>
						sum + Math.max(0, Math.min(1, value)) * weight,
					0,
				);
				const totalWeight = estimates.reduce(
					(sum, { weight }) => sum + weight,
					0,
				);
				maskNormalized = totalWeight > 0 ? weighted / totalWeight : 1;
			} else {
				const contribution =
					Math.abs(compositeAlphaNormalized - lowerAlphaNormalized) +
					Math.abs(
						compositePixels[index + 0] * compositeAlphaNormalized -
							lowerPixels[index + 0] * lowerAlphaNormalized,
					) /
						(255 * 255) +
					Math.abs(
						compositePixels[index + 1] * compositeAlphaNormalized -
							lowerPixels[index + 1] * lowerAlphaNormalized,
					) /
						(255 * 255) +
					Math.abs(
						compositePixels[index + 2] * compositeAlphaNormalized -
							lowerPixels[index + 2] * lowerAlphaNormalized,
					) /
						(255 * 255);
				maskNormalized = contribution > contributionEpsilon ? 1 : 0;
			}

			const maskValue = Math.round(maskNormalized * 255);
			result[index + 0] = maskValue;
			result[index + 1] = maskValue;
			result[index + 2] = maskValue;
			result[index + 3] = maskValue;
		}

		return fillSplatMaskDarkSpeckles(result, width, height, sourceAlpha);
	}

	function getRenderableSceneAssets() {
		return getSceneAssets().filter(
			(asset) => asset.exportRole !== "omit" && asset.object.visible !== false,
		);
	}

	function buildSceneAssetExportMetadata(sceneAssets = []) {
		return sceneAssets.map((asset) => ({
			id: asset.id,
			kind: asset.kind,
			label: asset.label,
			exportRole: asset.exportRole ?? "beauty",
			maskGroup: asset.maskGroup ?? "",
		}));
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
		maskMaterial.name = `${sourceMaterial?.name || "material"}__mask`;
		return maskMaterial;
	}

	function createFlatRenderMaterial(
		sourceMaterial,
		color,
		{ colorWrite = true } = {},
	) {
		const material = new THREE.MeshBasicMaterial({
			color,
			side: sourceMaterial?.side ?? THREE.FrontSide,
			depthTest: sourceMaterial?.depthTest !== false,
			depthWrite: sourceMaterial?.depthWrite !== false,
			fog: false,
			toneMapped: false,
			transparent: false,
			opacity: 1,
		});
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
								createFlatRenderMaterial(material, MASK_FOREGROUND_COLOR),
							)
						: createFlatRenderMaterial(previousMaterial, MASK_FOREGROUND_COLOR);
				} else if (role === "matte-white") {
					nextMaterial = Array.isArray(previousMaterial)
						? previousMaterial.map((material) =>
								createFlatRenderMaterial(material, MASK_FOREGROUND_COLOR),
							)
						: createFlatRenderMaterial(previousMaterial, MASK_FOREGROUND_COLOR);
				} else if (role === "mask-occluder") {
					nextMaterial = Array.isArray(previousMaterial)
						? previousMaterial.map((material) =>
								createFlatRenderMaterial(material, MASK_BACKGROUND_COLOR),
							)
						: createFlatRenderMaterial(previousMaterial, MASK_BACKGROUND_COLOR);
				} else if (role === "depth-occluder") {
					nextMaterial = Array.isArray(previousMaterial)
						? previousMaterial.map((material) =>
								createFlatRenderMaterial(material, MASK_BACKGROUND_COLOR, {
									colorWrite: false,
								}),
							)
						: createFlatRenderMaterial(
								previousMaterial,
								MASK_BACKGROUND_COLOR,
								{ colorWrite: false },
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
		for (const modelAsset of modelAssets) {
			const sourcePixels = await renderConfiguredScenePixels({
				camera,
				width,
				height,
				sceneAssets,
				resolveAssetRole: (asset) =>
					asset.id === modelAsset.id ? "normal" : "hide",
			});
			const modelOccluderPixels = await renderConfiguredScenePixels({
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
					if (asset.kind === "model") {
						return "matte-white";
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
				modelOccluderPixels,
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

			if (IS_DEV_RUNTIME) {
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
							name: "Model Occluder Alpha",
							canvas: createCanvasFromPixels(
								createAlphaPreviewPixels(modelOccluderPixels),
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

				if (IS_DEV_RUNTIME) {
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
	}) {
		const renderedMaskPasses = [];
		const allowedAssetIds = new Set(sceneAssets.map((asset) => asset.id));

		for (const maskPass of maskPasses) {
			if (!maskPass.assetIds?.length) {
				continue;
			}

			const maskCapture = await withMaskSceneState(
				maskPass,
				allowedAssetIds,
				() =>
					renderScenePixelsWithReadiness({
						scene,
						camera,
						width,
						height,
						sceneAssets: getSceneAssetExportOrder(),
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

	async function renderOutputSnapshotForShotCamera(shotCameraId) {
		if (getTotalLoadedItems() === 0) {
			throw new Error(t("error.exportRequiresAsset"));
		}

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
			spark.autoUpdate = false;
			guideOverlay.applyState({
				gridVisible: false,
				eyeLevelVisible: false,
				gridLayerMode: targetExportSettings.exportGridLayerMode,
			});
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
			const gridGuidePixels = targetExportSettings.exportGridOverlay
				? await renderGuideLayerPixels({
						camera: outputCamera,
						width,
						height,
						gridVisible: true,
						eyeLevelVisible: false,
						gridLayerMode: targetExportSettings.exportGridLayerMode,
					})
				: null;
			const eyeLevelPixels = targetExportSettings.exportGridOverlay
				? await renderGuideLayerPixels({
						camera: outputCamera,
						width,
						height,
						gridVisible: false,
						eyeLevelVisible: true,
						gridLayerMode: targetExportSettings.exportGridLayerMode,
					})
				: null;
			const maskPasses = await renderMaskPassSnapshots({
				scene,
				camera: outputCamera,
				width,
				height,
				sceneAssets,
				maskPasses: passPlan.masks,
			});
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
			const modelLayers =
				targetExportSettings.exportFormat === "psd"
					? await renderModelLayerDocuments({
							camera: outputCamera,
							width,
							height,
							sceneAssets: renderableSceneAssets,
							exportSettings: targetExportSettings,
						})
					: { layers: [], debugGroups: [] };
			const splatLayers =
				targetExportSettings.exportFormat === "psd"
					? await renderSplatLayerDocuments({
							camera: outputCamera,
							width,
							height,
							sceneAssets: renderableSceneAssets,
							exportSettings: targetExportSettings,
						})
					: { layers: [], debugGroups: [] };
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
		snapshot,
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
		return `${baseName}${sequenceSuffix}-${snapshot.width}x${snapshot.height}.${format}`;
	}

	function renderFrameOverlayLayer(width, height, frames = getActiveFrames()) {
		const canvas = document.createElement("canvas");
		canvas.width = width;
		canvas.height = height;

		const context = canvas.getContext("2d");
		if (!context) {
			throw new Error(t("error.previewContext"));
		}

		context.clearRect(0, 0, width, height);
		drawFramesToContext(context, width, height, frames, {
			logicalSpaceWidth: width,
			logicalSpaceHeight: height,
			strokeStyle: "#ff0000",
		});

		return createRasterLayer({
			name: "FRAME",
			canvas,
			category: "frame",
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
						name: "Infinite Grid",
						category: "guide",
						metadata: {
							role: "guide-grid",
							gridLayerMode: exportSettings.exportGridLayerMode ?? "bottom",
						},
						layers: [
							createPixelLayer({
								name: "Infinite Grid",
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
			if (gridPass) {
				orderedPasses.push(gridPass);
			}
			orderedPasses.push(beautyPass);
		} else {
			orderedPasses.push(beautyPass);
			if (gridPass) {
				orderedPasses.push(gridPass);
			}
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
				layers: [renderFrameOverlayLayer(width, height, frames)],
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
			modelLayers,
			modelDebugGroups,
			splatLayers,
			splatDebugGroups,
		};
	}

	function renderCompositeOutputCanvas(snapshot, frames = getActiveFrames()) {
		return renderExportBundleToCanvas(buildExportBundle(snapshot, frames));
	}

	function buildPsdExportDocument(bundle) {
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

		const modelLayers = snapshotExportSettings.exportModelLayers
			? [...(bundle.modelLayers ?? [])].reverse()
			: [];
		const splatLayers = snapshotExportSettings.exportSplatLayers
			? [...(bundle.splatLayers ?? [])].reverse()
			: [];
		const modelDebugGroups =
			snapshotExportSettings.exportModelLayers && IS_DEV_RUNTIME
				? [...(bundle.modelDebugGroups ?? [])]
				: [];
		const splatDebugGroups =
			snapshotExportSettings.exportSplatLayers && IS_DEV_RUNTIME
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
					name: "Infinite Grid",
					canvas: renderExportPassToCanvas(bundle, gridPass),
				}
			: null;
		const eyeLevelLayerDocument = eyeLevelPass
			? {
					name: "Eye Level",
					canvas: renderExportPassToCanvas(bundle, eyeLevelPass),
				}
			: null;
		const frameOverlayLayerDocument = frameOverlayPass
			? {
					name: frameOverlayPass.name,
					canvas: renderExportPassToCanvas(bundle, frameOverlayPass),
				}
			: null;
		const orderedLayers = [];
		if (backgroundLayerDocument) {
			orderedLayers.push(backgroundLayerDocument);
		}
		if (snapshotExportSettings.exportGridLayerMode === "bottom") {
			if (gridLayerDocument) {
				orderedLayers.push(gridLayerDocument);
			}
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
		if (frameOverlayLayerDocument) {
			orderedLayers.push(frameOverlayLayerDocument);
		}

		return {
			width: bundle.width,
			height: bundle.height,
			layers: [...orderedLayers, ...splatDebugGroups, ...modelDebugGroups],
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
		const psdDocument = buildPsdExportDocument(bundle);
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

			let pngCount = 0;
			let psdCount = 0;
			let lastSnapshot = null;
			let lastFormat = "png";

			for (const [index, documentState] of targetDocuments.entries()) {
				const snapshot = await renderOutputSnapshotForShotCamera(
					documentState.id,
				);
				const exportSettings = getShotCameraExportSettings(documentState);
				const sequenceIndex = targetDocuments.length > 1 ? index + 1 : null;
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
			setExportStatus("export.ready");
			updateUi();
		} catch (error) {
			console.error(error);
			store.exportSummary.value = error.message;
			setExportStatus("export.idle");
			setStatus(error.message);
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
		isRenderLocked,
		dispose,
	};
}
