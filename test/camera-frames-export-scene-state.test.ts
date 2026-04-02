import assert from "node:assert/strict";
import * as THREE from "three";
import {
	applySourceCutoutState,
	createFlatRenderMaterial,
	createMaskMaterial,
	withAssetRenderState,
	withMaskSceneState,
} from "../src/controllers/export/scene-state.js";

{
	const targetMaterial = new THREE.MeshBasicMaterial();
	const sourceMaterial = new THREE.MeshBasicMaterial({
		opacity: 0.4,
		transparent: true,
	});
	sourceMaterial.name = "Source";
	sourceMaterial.map = {};
	sourceMaterial.alphaMap = {};
	sourceMaterial.alphaTest = 0.25;
	sourceMaterial.alphaHash = true;
	sourceMaterial.vertexColors = true;

	applySourceCutoutState(targetMaterial, sourceMaterial);

	assert.equal(targetMaterial.map, sourceMaterial.map);
	assert.equal(targetMaterial.alphaMap, sourceMaterial.alphaMap);
	assert.equal(targetMaterial.alphaTest, 0.25);
	assert.equal(targetMaterial.opacity, 0.4);
	assert.equal(targetMaterial.transparent, true);
	assert.equal(targetMaterial.alphaHash, true);
	assert.equal(targetMaterial.vertexColors, true);
	assert.equal(typeof targetMaterial.onBeforeCompile, "function");
	assert.equal(typeof targetMaterial.customProgramCacheKey, "function");
	assert.match(
		targetMaterial.customProgramCacheKey(),
		/camera-frames-export-cutout/,
	);
}

{
	const sourceMaterial = new THREE.MeshBasicMaterial({
		opacity: 0.7,
		transparent: true,
	});
	sourceMaterial.name = "Asset";
	sourceMaterial.alphaTest = 0.5;

	const flatMaterial = createFlatRenderMaterial(sourceMaterial, 0xffffff, {
		colorWrite: false,
		depthTest: true,
		depthWrite: false,
	});
	const maskMaterial = createMaskMaterial(sourceMaterial, 0x000000);

	assert.equal(flatMaterial.name, "Asset__export");
	assert.equal(flatMaterial.colorWrite, false);
	assert.equal(flatMaterial.depthTest, true);
	assert.equal(flatMaterial.depthWrite, false);
	assert.equal(flatMaterial.opacity, 0.7);
	assert.equal(flatMaterial.transparent, true);
	assert.equal(maskMaterial.name, "Asset__mask");
	assert.equal(maskMaterial.opacity, 0.7);
	assert.equal(maskMaterial.transparent, true);
	assert.equal(maskMaterial.alphaTest, 0.5);
}

{
	const previousGuideState = { gridVisible: true };
	const appliedGuideStates = [];
	const guideOverlay = {
		captureState() {
			return previousGuideState;
		},
		applyState(state) {
			appliedGuideStates.push(state);
		},
	};
	const guides = new THREE.Group();
	guides.visible = true;
	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0x123456);
	const clearState = {
		color: new THREE.Color(0xabcdef),
		alpha: 0.4,
		calls: [],
	};
	const renderer = {
		getClearAlpha() {
			return clearState.alpha;
		},
		getClearColor(target) {
			return target.copy(clearState.color);
		},
		setClearColor(color, alpha) {
			clearState.calls.push({
				color: color?.isColor ? color.clone() : color,
				alpha,
			});
			clearState.alpha = alpha;
			if (color?.isColor) {
				clearState.color.copy(color);
			}
		},
	};
	const sourceMaterial = new THREE.MeshBasicMaterial({ opacity: 0.6 });
	sourceMaterial.name = "Model";
	const modelMesh = new THREE.Mesh(
		new THREE.BoxGeometry(1, 1, 1),
		sourceMaterial,
	);
	const hiddenMesh = new THREE.Mesh(
		new THREE.BoxGeometry(1, 1, 1),
		new THREE.MeshBasicMaterial(),
	);
	const modelAsset = {
		id: "model",
		kind: "model",
		object: modelMesh,
	};
	const hiddenAsset = {
		id: "hidden",
		kind: "model",
		object: hiddenMesh,
	};
	const splatAsset = {
		id: "splat",
		kind: "splat",
		object: new THREE.Group(),
		disposeTarget: {
			recolor: new THREE.Color(0x111111),
			opacity: 0.3,
		},
	};

	await withAssetRenderState(
		{
			sceneBackground: null,
			clearAlpha: 0,
			guidesVisible: false,
			guideOverlayState: { gridVisible: false },
			resolveAssetRole: (asset) => {
				if (asset.id === "model") {
					return "mask-target";
				}
				if (asset.id === "splat") {
					return "mask-alpha-occluder";
				}
				return "hide";
			},
		},
		async () => {
			assert.equal(scene.background, null);
			assert.equal(guides.visible, false);
			assert.notEqual(modelMesh.material, sourceMaterial);
			assert.equal(hiddenMesh.visible, false);
			assert.equal(splatAsset.disposeTarget.opacity, 0.3);
			assert.equal(splatAsset.disposeTarget.recolor.getHex(), 0xffffff);
		},
		{
			scene,
			guides,
			guideOverlay,
			renderer,
			getSceneAssets: () => [modelAsset, hiddenAsset, splatAsset],
		},
	);

	assert.equal(scene.background.getHex(), 0x123456);
	assert.equal(guides.visible, true);
	assert.equal(modelMesh.material, sourceMaterial);
	assert.equal(hiddenMesh.visible, true);
	assert.equal(splatAsset.disposeTarget.opacity, 0.3);
	assert.equal(splatAsset.disposeTarget.recolor.getHex(), 0x111111);
	assert.deepEqual(appliedGuideStates, [
		{ gridVisible: false },
		previousGuideState,
	]);
	assert.equal(clearState.calls.length, 2);
	assert.equal(clearState.calls[0].alpha, 0);
	assert.equal(clearState.calls[1].alpha, 0.4);
}

{
	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0x334455);
	const targetMaterial = new THREE.MeshBasicMaterial();
	const targetMesh = new THREE.Mesh(
		new THREE.BoxGeometry(1, 1, 1),
		targetMaterial,
	);
	const otherMaterial = new THREE.MeshBasicMaterial();
	const otherMesh = new THREE.Mesh(
		new THREE.BoxGeometry(1, 1, 1),
		otherMaterial,
	);
	const omitMesh = new THREE.Mesh(
		new THREE.BoxGeometry(1, 1, 1),
		new THREE.MeshBasicMaterial(),
	);
	const hiddenMesh = new THREE.Mesh(
		new THREE.BoxGeometry(1, 1, 1),
		new THREE.MeshBasicMaterial(),
	);
	const splatAsset = {
		id: "splat",
		kind: "splat",
		object: new THREE.Group(),
		disposeTarget: {
			recolor: new THREE.Color(0x888888),
			opacity: 0.2,
		},
	};
	const result = await withMaskSceneState(
		{
			id: "mask-a",
			assetIds: ["target"],
		},
		new Set(["target", "other", "splat", "omit"]),
		async () => {
			assert.equal(scene.background.getHex(), 0x000000);
			assert.equal(targetMesh.visible, true);
			assert.equal(otherMesh.visible, true);
			assert.equal(omitMesh.visible, false);
			assert.equal(hiddenMesh.visible, false);
			assert.equal(targetMesh.material.color.getHex(), 0xffffff);
			assert.equal(otherMesh.material.color.getHex(), 0x000000);
			assert.equal(splatAsset.disposeTarget.recolor.getHex(), 0x000000);
			assert.equal(splatAsset.disposeTarget.opacity, 1);
			return "ok";
		},
		{
			scene,
			getSceneAssets: () => [
				{
					id: "target",
					kind: "model",
					object: targetMesh,
					exportRole: "normal",
				},
				{ id: "other", kind: "model", object: otherMesh, exportRole: "normal" },
				{ id: "omit", kind: "model", object: omitMesh, exportRole: "omit" },
				{
					id: "hidden",
					kind: "model",
					object: hiddenMesh,
					exportRole: "normal",
				},
				splatAsset,
			],
		},
	);

	assert.equal(result, "ok");
	assert.equal(scene.background.getHex(), 0x334455);
	assert.equal(targetMesh.material, targetMaterial);
	assert.equal(otherMesh.material, otherMaterial);
	assert.equal(targetMesh.visible, true);
	assert.equal(otherMesh.visible, true);
	assert.equal(omitMesh.visible, true);
	assert.equal(hiddenMesh.visible, true);
	assert.equal(splatAsset.disposeTarget.recolor.getHex(), 0x888888);
	assert.equal(splatAsset.disposeTarget.opacity, 0.2);
}

console.log("✅ CAMERA_FRAMES export scene state tests passed!");
