import * as THREE from "three";
import { applyExportAssetRenderOrder } from "./render-state.js";

const MASK_FOREGROUND_COLOR = new THREE.Color(0xffffff);
const MASK_BACKGROUND_COLOR = new THREE.Color(0x000000);

function disposeAssignedMaterial(material) {
	if (Array.isArray(material)) {
		for (const entry of material) {
			entry?.dispose?.();
		}
		return;
	}
	material?.dispose?.();
}

export function applySourceCutoutState(material, sourceMaterial) {
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

export function createMaskMaterial(sourceMaterial, color) {
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

export function createFlatRenderMaterial(
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

export async function withAssetRenderState(
	{
		sceneBackground = null,
		clearAlpha = 0,
		guidesVisible = false,
		guideOverlayState = null,
		resolveAssetRole,
	},
	callback,
	{
		scene,
		guides,
		guideOverlay,
		renderer,
		getSceneAssets,
		applyRenderOrder = applyExportAssetRenderOrder,
	} = {},
) {
	const previousBackground = scene.background;
	const previousGuidesVisible = guides.visible;
	const previousGuideOverlayState = guideOverlay.captureState();
	const previousClearAlpha = renderer.getClearAlpha();
	const previousClearColor = renderer.getClearColor(new THREE.Color()).clone();
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
		applyRenderOrder(asset.object, role, restoreCallbacks);

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
					: createFlatRenderMaterial(previousMaterial, MASK_FOREGROUND_COLOR, {
							depthTest: true,
							depthWrite: true,
						});
			} else if (role === "mask-occluder") {
				nextMaterial = Array.isArray(previousMaterial)
					? previousMaterial.map((material) =>
							createFlatRenderMaterial(material, MASK_BACKGROUND_COLOR, {
								depthTest: true,
								depthWrite: true,
							}),
						)
					: createFlatRenderMaterial(previousMaterial, MASK_BACKGROUND_COLOR, {
							depthTest: true,
							depthWrite: true,
						});
			} else if (role === "depth-occluder") {
				nextMaterial = Array.isArray(previousMaterial)
					? previousMaterial.map((material) =>
							createFlatRenderMaterial(material, MASK_BACKGROUND_COLOR, {
								colorWrite: false,
								depthTest: true,
								depthWrite: true,
							}),
						)
					: createFlatRenderMaterial(previousMaterial, MASK_BACKGROUND_COLOR, {
							colorWrite: false,
							depthTest: true,
							depthWrite: true,
						});
			}

			if (nextMaterial === previousMaterial) {
				return;
			}

			node.material = nextMaterial;
			restoreCallbacks.push(() => {
				disposeAssignedMaterial(node.material);
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

export function withMaskSceneState(
	maskPass,
	allowedAssetIds,
	callback,
	{ scene, getSceneAssets } = {},
) {
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
				disposeAssignedMaterial(node.material);
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
