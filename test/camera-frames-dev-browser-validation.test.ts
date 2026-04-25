import assert from "node:assert/strict";
import * as THREE from "three";
import {
	runRadSsprojDevValidation,
	summarizeSceneAssetForDevValidation,
} from "../src/app/dev-browser-validation.js";

function createRadAsset() {
	const object = new THREE.Group();
	const paged = {};
	const runtime = {};
	return {
		id: 1,
		label: "RAD asset",
		kind: "splat",
		object,
		disposeTarget: {
			paged,
			enableLod: true,
		},
		radBundleRuntime: runtime,
		source: {
			radBundle: {
				root: {
					name: "asset-lod.rad",
				},
				chunks: [],
			},
			deferredFullData: {
				loadFullData: async () => ({}),
			},
			numSplats: 10,
		},
	};
}

{
	const asset = createRadAsset();
	assert.deepEqual(summarizeSceneAssetForDevValidation(asset), {
		id: 1,
		label: "RAD asset",
		kind: "splat",
		hasPaged: true,
		hasPackedSplats: false,
		hasRadRuntime: true,
		sourceHasRad: true,
		sourceDeferredFullData: true,
		enableLod: true,
		numSplats: 10,
		packedArrayLength: null,
		lodSplats: false,
	});
}

{
	let assets = [];
	const controller = {
		async openProjectSource(source, options) {
			assert.equal(
				source,
				"https://example.test/project.ssproj",
				"dev validation should open the provided project URL",
			);
			assert.deepEqual(options, { skipReplaceConfirm: true });
			assets = [createRadAsset()];
		},
		__debugGetSceneAssets() {
			return assets;
		},
		setAssetTransform(assetId, { worldPosition }) {
			const asset = assets.find((entry) => entry.id === assetId);
			asset.object.position.copy(worldPosition);
			asset.object.updateMatrixWorld(true);
		},
		selectSceneAsset(assetId) {
			assert.equal(assetId, 1);
		},
		async setSplatEditMode(enabled) {
			if (!enabled) {
				return true;
			}
			const asset = assets[0];
			asset.disposeTarget.paged = undefined;
			asset.disposeTarget.packedSplats = {
				packedArray: new Uint32Array([1, 2, 3, 4]),
				numSplats: 1,
			};
			asset.radBundleRuntime = null;
			asset.source = {
				packedArray: new Uint32Array([1, 2, 3, 4]),
				numSplats: 1,
			};
			return true;
		},
	};

	const result = await runRadSsprojDevValidation({
		controller,
		projectUrl: "https://example.test/project.ssproj",
	});

	assert.equal(result.ok, true);
	assert.deepEqual(
		result.checks.map((entry) => [entry.name, entry.ok]),
		[
			["project-opened-assets", true],
			["rad-backed-paged-assets", true],
			["object-transform-keeps-rad-streaming", true],
			["splat-edit-materializes-full-data", true],
		],
	);
}

console.log("✅ CAMERA_FRAMES dev browser validation tests passed!");
