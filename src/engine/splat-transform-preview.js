import { dyno } from "./spark-integration/spark-symbols.js";
import * as THREE from "three";

const MASK_TEXTURE_WIDTH = 2048;
const EMPTY_HIDDEN_MAP = new Map();

function buildSelectionMaskTexture(totalCount, selectedIndices) {
	const count = Math.max(1, Number(totalCount) || 0);
	const width = Math.min(MASK_TEXTURE_WIDTH, count);
	const height = Math.max(1, Math.ceil(count / width));
	const array = new Uint8Array(width * height);
	for (const index of selectedIndices) {
		if (Number.isInteger(index) && index >= 0 && index < count) {
			array[index] = 255;
		}
	}
	const texture = new THREE.DataTexture(
		array,
		width,
		height,
		THREE.RedFormat,
		THREE.UnsignedByteType,
	);
	texture.internalFormat = "R8";
	texture.magFilter = THREE.NearestFilter;
	texture.minFilter = THREE.NearestFilter;
	texture.generateMipmaps = false;
	texture.needsUpdate = true;
	return { texture, width };
}

function createSelectionTransformModifier({
	maskTexture,
	maskWidth,
	scaleUniform,
	rotateUniform,
	translateUniform,
	key,
}) {
	const maskSampler = dyno.dynoSampler2D(
		maskTexture,
		`splatTransformMask_${key}`,
	);
	const widthLiteral = dyno.dynoConst("int", maskWidth);
	const zeroInt = dyno.dynoConst("int", 0);
	const halfFloat = dyno.dynoConst("float", 0.5);
	return dyno.dynoBlock(
		{ gsplat: dyno.Gsplat },
		{ gsplat: dyno.Gsplat },
		({ gsplat }) => {
			const original = dyno.splitGsplat(gsplat);
			const index = original.outputs.index;
			const coord = dyno.combine({
				vectorType: "ivec2",
				x: dyno.imod(index, widthLiteral),
				y: dyno.div(index, widthLiteral),
			});
			const sampleVec = dyno.texelFetch(maskSampler, coord, zeroInt);
			const sampleR = dyno.split(sampleVec).outputs.x;
			const selected = dyno.greaterThan(sampleR, halfFloat);
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
					center: dyno.select(
						selected,
						transformed.outputs.center,
						original.outputs.center,
					),
					scales: dyno.select(
						selected,
						transformed.outputs.scales,
						original.outputs.scales,
					),
					quaternion: dyno.select(
						selected,
						transformed.outputs.quaternion,
						original.outputs.quaternion,
					),
				}),
			};
		},
	);
}

function computeEffectiveTranslate(
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

export function createSplatTransformPreviewController(_options = {}) {
	const tempTranslate = new THREE.Vector3();
	const tempScratch = new THREE.Vector3();
	let generation = 0;
	let activePreview = null;

	function detachActivePreview() {
		if (!activePreview) {
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
		computeEffectiveTranslate(previewState, tempTranslate, tempScratch);
		activePreview.scaleUniform.value = uniformScale;
		activePreview.rotateUniform.value.copy(rotation);
		activePreview.translateUniform.value.copy(tempTranslate);
		for (const entry of activePreview.entries) {
			if (entry.mesh) {
				entry.mesh.needsUpdate = true;
			}
		}
		return true;
	}

	async function start(previewState) {
		detachActivePreview();
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
			const mesh = entry?.splatMesh ?? entry?.asset?.disposeTarget ?? null;
			if (!mesh) {
				continue;
			}
			const selectedIndices = entry.selectedIndices;
			if (!selectedIndices || selectedIndices.length === 0) {
				continue;
			}
			const { texture: maskTexture, width: maskWidth } =
				buildSelectionMaskTexture(entry.totalCount, selectedIndices);
			const modifier = createSelectionTransformModifier({
				maskTexture,
				maskWidth,
				scaleUniform,
				rotateUniform,
				translateUniform,
				key: `${nextGeneration}_${entry.assetIdKey}`,
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

		if (generation !== nextGeneration) {
			detachActivePreview();
			return null;
		}

		updateTransform(previewState);
		return preview;
	}

	function clear() {
		generation += 1;
		detachActivePreview();
	}

	function dispose() {
		clear();
	}

	function getHiddenSelectedSplatsByAssetId() {
		return EMPTY_HIDDEN_MAP;
	}

	return {
		start,
		updateTransform,
		clear,
		dispose,
		getHiddenSelectedSplatsByAssetId,
	};
}
