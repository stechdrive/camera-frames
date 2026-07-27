import assert from "node:assert/strict";
import * as THREE from "three";
import {
	buildBlenderPackageEntries,
	buildSplatGlbBytes,
} from "../src/controllers/export/blender-package.js";

function parseGlbJson(bytes: Uint8Array) {
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	assert.equal(view.getUint32(0, true), 0x46546c67);
	assert.equal(view.getUint32(4, true), 2);
	const jsonLength = view.getUint32(12, true);
	assert.equal(view.getUint32(16, true), 0x4e4f534a);
	return JSON.parse(
		new TextDecoder().decode(bytes.subarray(20, 20 + jsonLength)).trimEnd(),
	);
}

function createPackedSplats() {
	const splats = [
		{
			center: new THREE.Vector3(1, 2, 3),
			scales: new THREE.Vector3(0.1, 0.2, 0.3),
			quaternion: new THREE.Quaternion(0, 0, 0, 1),
			opacity: 0.75,
			color: new THREE.Color(0.2, 0.4, 0.6),
		},
		{
			center: new THREE.Vector3(-1, -2, -3),
			scales: new THREE.Vector3(1, 2, 3),
			quaternion: new THREE.Quaternion(0.1, 0.2, 0.3, 0.9).normalize(),
			opacity: 0.5,
			color: new THREE.Color(0.9, 0.8, 0.7),
		},
	];
	return {
		numSplats: splats.length,
		getNumSplats: () => splats.length,
		forEachSplat(
			callback: (
				index: number,
				center: THREE.Vector3,
				scales: THREE.Vector3,
				quaternion: THREE.Quaternion,
				opacity: number,
				color: THREE.Color,
			) => void,
		) {
			splats.forEach((splat, index) => {
				callback(
					index,
					splat.center,
					splat.scales,
					splat.quaternion,
					splat.opacity,
					splat.color,
				);
			});
		},
	};
}

{
	const bytes = await buildSplatGlbBytes(createPackedSplats());
	const document = parseGlbJson(bytes);
	assert.deepEqual(document.extensionsUsed, ["KHR_gaussian_splatting"]);
	assert.equal(document.accessors[0].count, 2);
	const primitive = document.meshes[0].primitives[0];
	assert.equal(primitive.mode, 0);
	assert.ok(primitive.extensions.KHR_gaussian_splatting);
	assert.ok(primitive.attributes.POSITION >= 0);
	assert.ok(primitive.attributes.COLOR_0 >= 0);
	assert.ok(primitive.attributes["KHR_gaussian_splatting:ROTATION"] >= 0);
	assert.ok(primitive.attributes["KHR_gaussian_splatting:SCALE"] >= 0);
	assert.ok(primitive.attributes["KHR_gaussian_splatting:OPACITY"] >= 0);
	assert.ok(
		primitive.attributes["KHR_gaussian_splatting:SH_DEGREE_0_COEF_0"] >= 0,
	);
}

class FakeGltfExporter {
	parse(
		_object: unknown,
		onDone: (result: ArrayBuffer) => void,
		_onError: (error: Error) => void,
	) {
		onDone(new Uint8Array([0x67, 0x6c, 0x62]).buffer);
	}
}

{
	const modelObject = new THREE.Group();
	const packedSplats = createPackedSplats();
	const shotCamera = {
		id: "shot-a",
		name: "Camera A",
		lens: { baseFovX: 50, shiftX: 0.1, shiftY: -0.05 },
		outputFrame: {
			widthScale: 1,
			heightScale: 1,
			viewportCenterX: 0.5,
			viewportCenterY: 0.5,
			anchor: "center",
		},
		clipping: { mode: "manual", near: 0.2, far: 250 },
		referenceImages: {},
	};
	const result = await buildBlenderPackageEntries({
		projectName: "Test Scene",
		targetDocuments: [shotCamera],
		projectSnapshot: {
			shotCameras: [
				{
					...shotCamera,
					pose: {
						position: { x: 1, y: 2, z: 3 },
						quaternion: { x: 0, y: 0, z: 0, w: 1 },
					},
				},
			],
			scene: {
				assets: [
					{
						id: "model-a",
						kind: "model",
						label: "Robot.glb",
						transform: {
							position: { x: 1, y: 0, z: 0 },
							quaternion: { x: 0, y: 0, z: 0, w: 1 },
						},
						baseScale: { x: 1, y: 2, z: 3 },
						worldScale: 2,
						visible: true,
						exportRole: "beauty",
					},
					{
						id: "splat-a",
						kind: "splat",
						label: "Room.ply",
						transform: {
							position: { x: 0, y: 0, z: 0 },
							quaternion: { x: 0, y: 0, z: 0, w: 1 },
						},
						baseScale: { x: 1, y: 1, z: 1 },
						worldScale: 1,
						visible: true,
						exportRole: "beauty",
					},
					{
						id: "omit-a",
						kind: "model",
						label: "Omitted",
						exportRole: "omit",
					},
				],
				lighting: {
					ambient: 0.4,
					modelLight: {
						enabled: true,
						intensity: 1.2,
						azimuthDeg: 20,
						elevationDeg: 40,
					},
				},
				referenceImages: null,
			},
			animation: {
				enabled: false,
				activeClipId: "clip-main",
				clips: [
					{
						id: "clip-main",
						fps: 24,
						startFrame: 1,
						durationFrames: 10,
						playbackStartFrame: 1,
						playbackEndFrame: 10,
						bindings: [],
					},
				],
			},
		},
		sceneAssets: [
			{
				id: "model-a",
				kind: "model",
				contentObject: modelObject,
			},
			{
				id: "splat-a",
				kind: "splat",
				disposeTarget: { packedSplats },
			},
		],
		shotCameraRegistry: new Map([
			["shot-a", { camera: { near: 0.2, far: 250 } }],
		]),
		getOutputSizeState: () => ({ width: 1754, height: 1240 }),
		GLTFExporterClass: FakeGltfExporter,
		appVersion: "9.9.9",
	});

	assert.equal(result.filename, "Test Scene-blender.zip");
	assert.equal(result.manifest.schema, "camera_frames_blender_package");
	assert.equal(result.manifest.generator.version, "9.9.9");
	assert.equal(result.manifest.assets.length, 2);
	assert.equal(result.manifest.cameras.length, 1);
	assert.deepEqual(result.manifest.assets[0].transform.scale, {
		x: 2,
		y: 4,
		z: 6,
	});
	assert.equal(result.manifest.assets[1].extension, "KHR_gaussian_splatting");
	assert.equal(result.manifest.assets[1].splatCount, 2);
	assert.equal(result.manifest.assets[1].shBands, 0);
	assert.equal(result.manifest.cameras[0].output.width, 1754);
	assert.equal(result.manifest.cameras[0].transform.position.x, 1);

	const paths = result.entries.map((entry) => entry.path);
	assert.deepEqual(paths, [
		"geometry/001-Robot.glb",
		"splats/002-Room.glb",
		"manifest.json",
		"build_blend.py",
		"open_in_blender.cmd",
		"README.txt",
	]);
	const scriptEntry = result.entries.find(
		(entry) => entry.path === "build_blend.py",
	);
	const script = new TextDecoder().decode(scriptEntry?.data as Uint8Array);
	assert.match(script, /KHR_gaussian_splatting/);
	assert.match(script, /bpy\.ops\.wm\.save_as_mainfile/);
	assert.match(script, /THREE_TO_BLENDER/);
}
