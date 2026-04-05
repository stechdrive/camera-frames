import { dyno } from "@sparkjsdev/spark";
import * as THREE from "three";

function buildSelectionMaskTexture(totalCount, selectedIndices) {
	const width = Math.max(1, Number(totalCount) || 0);
	const array = new Uint8Array(width * 4);
	for (const index of selectedIndices ?? []) {
		if (!Number.isInteger(index) || index < 0 || index >= width) {
			continue;
		}
		array[index * 4] = 255;
	}
	const texture = new THREE.DataTexture(
		array,
		width,
		1,
		THREE.RGBAFormat,
		THREE.UnsignedByteType,
	);
	texture.magFilter = THREE.NearestFilter;
	texture.minFilter = THREE.NearestFilter;
	texture.generateMipmaps = false;
	texture.needsUpdate = true;
	return texture;
}

function createSelectionTransformModifier({
	maskTexture,
	scaleUniform,
	rotateUniform,
	translateUniform,
	assetIdKey,
}) {
	const maskUniform = dyno.dynoSampler2D(
		maskTexture,
		`splatTransformMask_${assetIdKey}`,
	);
	const zeroInt = dyno.int(0);
	const selectionThreshold = dyno.dynoFloat(
		0.5,
		`splatTransformMaskThreshold_${assetIdKey}`,
	);
	return dyno.dynoBlock(
		{ gsplat: dyno.Gsplat },
		{ gsplat: dyno.Gsplat },
		({ gsplat }) => {
			const original = dyno.splitGsplat(gsplat);
			const maskCoord = dyno.combine({
				vectorType: "ivec2",
				x: original.index,
				y: zeroInt,
			});
			const maskTexel = dyno.texelFetch(maskUniform, maskCoord, zeroInt);
			const maskChannels = dyno.split(maskTexel);
			const selected = dyno.greaterThan(maskChannels.x, selectionThreshold);
			const transformed = dyno.splitGsplat(
				dyno.transformGsplat(gsplat, {
					scale: scaleUniform,
					rotate: rotateUniform,
					translate: translateUniform,
				}),
			);
			return {
				gsplat: dyno.combineGsplat({
					gsplat,
					center: dyno.select(selected, transformed.center, original.center),
					scales: dyno.select(selected, transformed.scales, original.scales),
					quaternion: dyno.select(
						selected,
						transformed.quaternion,
						original.quaternion,
					),
				}),
			};
		},
	);
}

function computePreviewTranslate(
	previewState,
	target = new THREE.Vector3(),
	scratch = new THREE.Vector3(),
) {
	const translation = previewState?.worldTranslation ?? new THREE.Vector3();
	const rotation =
		previewState?.worldRotation instanceof THREE.Quaternion
			? previewState.worldRotation
			: new THREE.Quaternion();
	const pivot = previewState?.pivotWorld ?? new THREE.Vector3();
	const uniformScale =
		Number.isFinite(previewState?.uniformScale) && previewState.uniformScale > 0
			? Number(previewState.uniformScale)
			: 1;
	scratch.copy(pivot).multiplyScalar(uniformScale).applyQuaternion(rotation);
	return target.copy(translation).add(pivot).sub(scratch);
}

export function createSplatTransformPreviewController({ guides } = {}) {
	const root = new THREE.Group();
	root.name = "splat-transform-preview";
	root.visible = false;
	guides?.add?.(root);

	const EMPTY_HIDDEN_MAP = new Map();
	const previewTranslate = new THREE.Vector3();
	const previewTranslateScratch = new THREE.Vector3();
	let generation = 0;
	let activePreview = null;

	function disposeActivePreview() {
		if (!activePreview) {
			root.visible = false;
			return;
		}
		for (const entry of activePreview.entries) {
			if (entry.mesh) {
				entry.mesh.worldModifiers = entry.previousWorldModifiers;
				entry.mesh.updateGenerator?.();
			}
			entry.maskTexture?.dispose?.();
		}
		activePreview = null;
		root.visible = false;
	}

	function updateTransform(previewState) {
		if (!activePreview || activePreview.previewState !== previewState) {
			return false;
		}
		const rotation =
			previewState?.worldRotation instanceof THREE.Quaternion
				? previewState.worldRotation
				: new THREE.Quaternion();
		const uniformScale =
			Number.isFinite(previewState?.uniformScale) &&
			previewState.uniformScale > 0
				? Number(previewState.uniformScale)
				: 1;
		computePreviewTranslate(
			previewState,
			previewTranslate,
			previewTranslateScratch,
		);
		activePreview.scaleUniform.value = uniformScale;
		activePreview.rotateUniform.value.copy(rotation);
		activePreview.translateUniform.value.copy(previewTranslate);
		root.visible = activePreview.entries.length > 0;
		return true;
	}

	async function start(previewState) {
		disposeActivePreview();
		const nextGeneration = generation + 1;
		generation = nextGeneration;
		if (!previewState || !Array.isArray(previewState.entries)) {
			return null;
		}

		const scaleUniform = dyno.dynoFloat(
			1,
			`splatTransformScale_${nextGeneration}`,
		);
		const rotateUniform = dyno.dynoVec4(
			new THREE.Quaternion(),
			`splatTransformRotate_${nextGeneration}`,
		);
		const translateUniform = dyno.dynoVec3(
			new THREE.Vector3(),
			`splatTransformTranslate_${nextGeneration}`,
		);
		const preview = {
			previewState,
			scaleUniform,
			rotateUniform,
			translateUniform,
			entries: [],
		};
		activePreview = preview;

		for (const entry of previewState.entries) {
			const mesh = entry?.asset?.disposeTarget ?? null;
			if (!mesh) {
				continue;
			}
			const selectedIndices = entry.splats
				.map((splat) => splat.index)
				.filter((index) => Number.isInteger(index) && index >= 0);
			if (selectedIndices.length === 0) {
				continue;
			}
			const maskTexture = buildSelectionMaskTexture(
				entry.totalCount,
				selectedIndices,
			);
			const modifier = createSelectionTransformModifier({
				maskTexture,
				scaleUniform,
				rotateUniform,
				translateUniform,
				assetIdKey: entry.assetIdKey,
			});
			const previousWorldModifiers = Array.isArray(mesh.worldModifiers)
				? [...mesh.worldModifiers]
				: [];
			mesh.worldModifiers = [...previousWorldModifiers, modifier];
			mesh.updateGenerator?.();
			preview.entries.push({
				mesh,
				maskTexture,
				previousWorldModifiers,
			});
		}

		if (
			generation !== nextGeneration ||
			activePreview?.previewState !== previewState
		) {
			disposeActivePreview();
			return null;
		}

		updateTransform(previewState);
		return preview;
	}

	function clear() {
		generation += 1;
		disposeActivePreview();
	}

	function dispose() {
		clear();
		guides?.remove?.(root);
	}

	return {
		start,
		updateTransform,
		clear,
		dispose,
		getHiddenSelectedSplatsByAssetId() {
			return EMPTY_HIDDEN_MAP;
		},
	};
}
