import assert from "node:assert/strict";
import * as THREE from "three";
import { createSceneAssetProjectStateHelpers } from "../src/controllers/scene-assets/project-state.js";
import {
	createProjectFileEmbeddedFileSource,
	createProjectFilePackedSplatSource,
} from "../src/project-document.js";

function captureObjectLocalTransformState(object) {
	if (!object) {
		return null;
	}

	return {
		position: {
			x: object.position.x,
			y: object.position.y,
			z: object.position.z,
		},
		quaternion: {
			x: object.quaternion.x,
			y: object.quaternion.y,
			z: object.quaternion.z,
			w: object.quaternion.w,
		},
		scale: {
			x: object.scale.x,
			y: object.scale.y,
			z: object.scale.z,
		},
	};
}

function applyObjectLocalTransformState(object, state) {
	if (!object || !state) {
		return;
	}

	object.position.set(
		state.position?.x ?? object.position.x,
		state.position?.y ?? object.position.y,
		state.position?.z ?? object.position.z,
	);
	object.quaternion.set(
		state.quaternion?.x ?? object.quaternion.x,
		state.quaternion?.y ?? object.quaternion.y,
		state.quaternion?.z ?? object.quaternion.z,
		state.quaternion?.w ?? object.quaternion.w,
	);
	object.scale.set(
		state.scale?.x ?? object.scale.x,
		state.scale?.y ?? object.scale.y,
		state.scale?.z ?? object.scale.z,
	);
	object.updateMatrixWorld(true);
}

function createAsset(id, source = null) {
	const object = new THREE.Group();
	const contentObject = new THREE.Group();
	object.add(contentObject);
	return {
		id,
		kind: "model",
		label: `Asset ${id}`,
		source,
		object,
		contentObject,
		baseScale: new THREE.Vector3(1, 1, 1),
		worldScale: 1,
		unitMode: "meters",
		exportRole: "beauty",
		maskGroup: "",
		workingPivotLocal: null,
	};
}

function createHarness() {
	const sceneState = {
		assets: [],
	};
	const calls = {
		applyAssetWorldScale: [],
	};
	const helpers = createSceneAssetProjectStateHelpers({
		sceneState,
		captureObjectLocalTransformState,
		applyObjectLocalTransformState,
		clampAssetWorldScale: (value) => Math.max(0.01, Number(value) || 1),
		clampAssetTransformValue: (value, fallback = 0) => {
			const nextValue = Number(value);
			return Number.isFinite(nextValue) ? nextValue : fallback;
		},
		normalizeWorkingPivotLocal: (value) =>
			value
				? new THREE.Vector3(
						Number(value.x ?? 0),
						Number(value.y ?? 0),
						Number(value.z ?? 0),
					)
				: null,
		applyAssetWorldScale: (asset) => {
			calls.applyAssetWorldScale.push(asset.id);
			asset.object.scale.copy(asset.baseScale).multiplyScalar(asset.worldScale);
			asset.object.updateMatrixWorld(true);
		},
	});

	return {
		sceneState,
		calls,
		helpers,
	};
}

{
	const { helpers } = createHarness();
	const embeddedSource = createProjectFileEmbeddedFileSource({
		kind: "model",
		file: new File([new Uint8Array([1])], "House.GLB"),
		fileName: "House.GLB",
	});
	const packedSource = createProjectFilePackedSplatSource({
		fileName: "meta.json",
		inputBytes: new Uint8Array([1]),
	});
	const packageSource = {
		sourceType: "project-package-file",
		fileName: "cloud.PLY",
		label: "Cloud",
	};

	assert.equal(
		helpers.getExtension("https://example.com/a/model.glb?dl=1"),
		"glb",
	);
	assert.equal(helpers.getExtension(embeddedSource), "glb");
	assert.equal(helpers.getExtension(packedSource), "json");
	assert.equal(helpers.getExtension(packageSource), "ply");
	assert.equal(
		helpers.getDisplayName("https://example.com/assets/my%20scene.glb"),
		"my scene.glb",
	);
	assert.equal(helpers.getDisplayName(packageSource), "Cloud");
}

{
	const { helpers } = createHarness();
	const legacyPackedSource = createProjectFilePackedSplatSource({
		fileName: "meta.json",
		inputBytes: new Uint8Array([1]),
		legacyState: {
			filename: "scan.lcc",
		},
		projectAssetState: {
			label: "Imported Scan",
		},
	});

	const correctionQuaternion =
		helpers.getLegacySplatCorrectionQuaternion(legacyPackedSource);
	const expectedQuaternion = new THREE.Quaternion().setFromEuler(
		new THREE.Euler(Math.PI / 2, 0, Math.PI, "XYZ"),
	);

	assert.equal(
		helpers.getLegacyState(legacyPackedSource)?.filename,
		"scan.lcc",
	);
	assert.equal(
		helpers.getProjectAssetState(legacyPackedSource)?.label,
		"Imported Scan",
	);
	assert.ok(correctionQuaternion.angleTo(expectedQuaternion) < 1e-9);
	assert.deepEqual(
		helpers.getLegacySplatCorrectionQuaternion("https://example.com/a.spz"),
		new THREE.Quaternion(1, 0, 0, 0),
	);
}

{
	const { sceneState, calls, helpers } = createHarness();
	const asset = createAsset(
		1,
		createProjectFileEmbeddedFileSource({
			kind: "model",
			file: new File([new Uint8Array([1])], "chair.glb"),
			fileName: "chair.glb",
			legacyState: {
				filename: "chair.glb",
				legacyTransformBakedInAsset: true,
			},
		}),
	);

	helpers.applyProjectAssetState(asset, {
		label: "Chair",
		worldScale: 2.5,
		unitMode: "centimeters",
		exportRole: "omit",
		maskGroup: "fg",
		workingPivotLocal: { x: 1, y: 2, z: 3 },
		baseScale: { x: 2, y: 3, z: 4 },
		contentTransform: {
			position: { x: 5, y: 6, z: 7 },
			quaternion: { x: 0, y: 0, z: 0, w: 1 },
			scale: { x: 1.5, y: 1.5, z: 1.5 },
		},
		visible: false,
		transform: {
			position: { x: 8, y: 9, z: 10 },
			quaternion: { x: 0, y: Math.SQRT1_2, z: 0, w: Math.SQRT1_2 },
		},
	});

	assert.deepEqual(calls.applyAssetWorldScale, [1]);
	assert.equal(asset.label, "Chair");
	assert.equal(asset.object.name, "Chair");
	assert.equal(asset.worldScale, 2.5);
	assert.equal(asset.unitMode, "centimeters");
	assert.equal(asset.exportRole, "omit");
	assert.equal(asset.maskGroup, "fg");
	assert.equal(asset.object.visible, false);
	assert.equal(asset.object.position.z, 10);
	assert.equal(asset.contentObject.position.x, 5);
	assert.equal(asset.baseScale.y, 3);
	assert.equal(asset.workingPivotLocal?.z, 3);

	sceneState.assets.push(asset);
	const snapshot = helpers.captureProjectSceneState();

	assert.equal(snapshot.length, 1);
	assert.equal(snapshot[0].label, "Chair");
	assert.equal(snapshot[0].worldScale, 2.5);
	assert.equal(snapshot[0].order, 0);
	assert.equal(snapshot[0].legacyState?.filename, "chair.glb");
	assert.equal(snapshot[0].contentTransform?.position?.x, 5);
	assert.equal(snapshot[0].transform.position.y, 9);
}

{
	const { helpers } = createHarness();
	const originalFetch = globalThis.fetch;
	globalThis.fetch = async () => ({
		ok: true,
		status: 200,
		blob: async () =>
			new Blob([new Uint8Array([1, 2, 3])], {
				type: "model/gltf-binary",
			}),
	});

	try {
		const file = await helpers.fetchUrlAsFile(
			"https://example.com/assets/tree.glb",
		);
		assert.equal(file.name, "tree.glb");
		assert.equal(file.type, "model/gltf-binary");
		assert.equal(file.size, 3);
	} finally {
		globalThis.fetch = originalFetch;
	}
}

console.log("✅ CAMERA_FRAMES scene asset project-state tests passed!");
