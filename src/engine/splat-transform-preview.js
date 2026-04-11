import { SplatMesh } from "@sparkjsdev/spark";
import * as THREE from "three";
import { enableSparkSplatMeshWorldToView } from "./spark-integration/spark-splat-mesh-adapter.js";

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
	root.visible = false;
	guides?.add?.(root);
	const transformedRoot = new THREE.Group();
	transformedRoot.name = "splat-transform-preview-transform";
	transformedRoot.matrixAutoUpdate = false;
	root.add(transformedRoot);

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
			transformedRoot.visible = false;
			return;
		}
		for (const entry of activePreview.entries) {
			for (const node of entry.nodes) {
				node.parent?.remove?.(node.assetRoot);
				node.assetRoot?.remove?.(node.mesh);
				node.mesh?.dispose?.();
				node.packedSplats?.dispose?.();
			}
		}
		activePreview = null;
		root.visible = false;
		transformedRoot.visible = false;
		while (transformedRoot.children.length > 0) {
			transformedRoot.remove(transformedRoot.children[0]);
		}
	}

	function createPreviewNode({
		entry,
		indices,
		tint = false,
		parent,
		nextGeneration,
		previewState,
	}) {
		if (!(indices instanceof Uint32Array) || indices.length === 0) {
			return Promise.resolve(null);
		}
		const extractedSplats = entry.packedSplats.extractSplats(indices, false);
		if (tint) {
			applyPreviewTint(extractedSplats, highlightColor, highlightMix);
		}
		const previewMesh = new SplatMesh({
			packedSplats: extractedSplats,
			fileName: `${tint ? "selected" : "remainder"}-${entry.assetIdKey}.rawsplat`,
			lod: true,
		});
		enableSparkSplatMeshWorldToView(previewMesh);
		return previewMesh.initialized.then(() => {
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
			parent.add(assetRoot);
			return {
				assetRoot,
				mesh: previewMesh,
				packedSplats: extractedSplats,
				parent,
			};
		});
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
			entries: [],
			hiddenSelectedSplatsByAssetId: new Map(),
			ready: false,
		};
		activePreview = preview;

		for (const entry of previewState.entries) {
			const selectedIndices = new Uint32Array(
				entry.splats.map((splat) => splat.index),
			);
			const previewEntry = {
				nodes: [],
			};
			preview.entries.push(previewEntry);
			const selectedNode = await createPreviewNode({
				entry,
				indices: selectedIndices,
				tint: true,
				parent: transformedRoot,
				nextGeneration,
				previewState,
			});
			if (selectedNode) {
				previewEntry.nodes.push(selectedNode);
			}
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

		preview.ready = preview.entries.some((entry) => entry.nodes.length > 0);
		updateTransform(previewState);
		root.visible = preview.ready;
		transformedRoot.visible = preview.ready;
		return preview;
	}

	function updateTransform(previewState) {
		if (!activePreview || activePreview.previewState !== previewState) {
			return false;
		}
		transformedRoot.matrix.copy(composePreviewMatrix(previewState, tempMatrix));
		transformedRoot.matrixWorldNeedsUpdate = true;
		transformedRoot.updateMatrixWorld(true);
		root.visible = activePreview.ready;
		transformedRoot.visible = activePreview.ready;
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
