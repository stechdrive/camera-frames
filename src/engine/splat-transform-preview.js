import { SplatMesh } from "@sparkjsdev/spark";
import * as THREE from "three";

const DEFAULT_PREVIEW_HIGHLIGHT = new THREE.Color(0.36, 0.95, 0.55);
const DEFAULT_PREVIEW_MIX = 0.68;

function applyPreviewTint(packedSplats, highlightColor, highlightMix) {
	const splatCount =
		packedSplats?.getNumSplats?.() ?? packedSplats?.numSplats ?? 0;
	if (splatCount <= 0) {
		return;
	}
	for (let index = 0; index < splatCount; index += 1) {
		const splat = packedSplats.getSplat(index);
		packedSplats.setSplat(
			index,
			splat.center,
			splat.scales,
			splat.quaternion,
			splat.opacity,
			splat.color.clone().lerp(highlightColor, highlightMix),
		);
	}
	packedSplats.needsUpdate = true;
}

export function createSplatTransformPreviewController({
	guides,
	highlightColor = DEFAULT_PREVIEW_HIGHLIGHT,
	highlightMix = DEFAULT_PREVIEW_MIX,
} = {}) {
	const root = new THREE.Group();
	root.name = "splat-transform-preview";
	root.matrixAutoUpdate = false;
	root.visible = false;
	guides?.add?.(root);

	const EMPTY_HIDDEN_MAP = new Map();
	const tempMatrix = new THREE.Matrix4();
	const tempPivotMatrix = new THREE.Matrix4();
	const tempRotationMatrix = new THREE.Matrix4();
	const tempScaleMatrix = new THREE.Matrix4();
	const tempInversePivotMatrix = new THREE.Matrix4();
	let generation = 0;
	let activePreview = null;

	function composePreviewMatrix(previewState, target = new THREE.Matrix4()) {
		const translation = previewState?.worldTranslation ?? new THREE.Vector3();
		const rotation =
			previewState?.worldRotation instanceof THREE.Quaternion
				? previewState.worldRotation
				: new THREE.Quaternion();
		const pivot = previewState?.pivotWorld ?? new THREE.Vector3();
		const uniformScale =
			Number.isFinite(previewState?.uniformScale) &&
			previewState.uniformScale > 0
				? Number(previewState.uniformScale)
				: 1;
		target.makeTranslation(translation.x, translation.y, translation.z);
		target.multiply(tempPivotMatrix.makeTranslation(pivot.x, pivot.y, pivot.z));
		target.multiply(tempRotationMatrix.makeRotationFromQuaternion(rotation));
		target.multiply(
			tempScaleMatrix.makeScale(uniformScale, uniformScale, uniformScale),
		);
		target.multiply(
			tempInversePivotMatrix.makeTranslation(-pivot.x, -pivot.y, -pivot.z),
		);
		return target;
	}

	function disposeActivePreview() {
		if (!activePreview) {
			root.visible = false;
			return;
		}
		for (const node of activePreview.nodes) {
			node.assetRoot?.remove?.(node.mesh);
			root.remove(node.assetRoot);
			node.mesh?.dispose?.();
			node.packedSplats?.dispose?.();
		}
		activePreview = null;
		root.visible = false;
		while (root.children.length > 0) {
			root.remove(root.children[0]);
		}
	}

	async function start(previewState) {
		disposeActivePreview();
		const nextGeneration = generation + 1;
		generation = nextGeneration;
		if (!previewState || !Array.isArray(previewState.entries)) {
			return null;
		}

		const preview = {
			previewState,
			nodes: [],
			hiddenSelectedSplatsByAssetId: new Map(),
			ready: false,
		};
		activePreview = preview;

		for (const entry of previewState.entries) {
			const extractedSplats = entry.packedSplats.extractSplats(
				new Uint32Array(entry.splats.map((splat) => splat.index)),
				false,
			);
			applyPreviewTint(extractedSplats, highlightColor, highlightMix);
			const previewMesh = new SplatMesh({
				packedSplats: extractedSplats,
				fileName: `preview-${entry.assetIdKey}.rawsplat`,
				lod: true,
			});
			previewMesh.enableWorldToView = true;
			await previewMesh.initialized;
			if (
				generation !== nextGeneration ||
				activePreview?.previewState !== previewState
			) {
				previewMesh.dispose?.();
				extractedSplats.dispose?.();
				return null;
			}
			const assetRoot = new THREE.Group();
			assetRoot.matrixAutoUpdate = false;
			assetRoot.matrix.copy(entry.worldMatrix);
			assetRoot.matrixWorldNeedsUpdate = true;
			assetRoot.add(previewMesh);
			assetRoot.updateMatrixWorld(true);
			root.add(assetRoot);
			preview.nodes.push({
				assetRoot,
				mesh: previewMesh,
				packedSplats: extractedSplats,
			});
			preview.hiddenSelectedSplatsByAssetId.set(
				entry.assetIdKey,
				new Set(entry.splats.map((splat) => splat.index)),
			);
		}

		if (
			generation !== nextGeneration ||
			activePreview?.previewState !== previewState
		) {
			disposeActivePreview();
			return null;
		}

		preview.ready = preview.nodes.length > 0;
		updateTransform(previewState);
		root.visible = preview.ready;
		return preview;
	}

	function updateTransform(previewState) {
		if (!activePreview || activePreview.previewState !== previewState) {
			return false;
		}
		root.matrix.copy(composePreviewMatrix(previewState, tempMatrix));
		root.matrixWorldNeedsUpdate = true;
		root.updateMatrixWorld(true);
		root.visible = activePreview.ready;
		return true;
	}

	function clear() {
		generation += 1;
		disposeActivePreview();
	}

	function getHiddenSelectedSplatsByAssetId() {
		return activePreview?.ready
			? activePreview.hiddenSelectedSplatsByAssetId
			: EMPTY_HIDDEN_MAP;
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
		getHiddenSelectedSplatsByAssetId,
	};
}
