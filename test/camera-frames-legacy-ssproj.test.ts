import assert from "node:assert/strict";
import * as THREE from "three";
import {
	applyLegacyAssetState,
	buildLegacyProjectImport,
} from "../src/importers/legacy-ssproj.js";

function assertVectorClose(actual, expected, epsilon = 1e-6) {
	assert.equal(actual.length, expected.length);
	for (let index = 0; index < actual.length; index += 1) {
		assert.ok(
			Math.abs(actual[index] - expected[index]) <= epsilon,
			`expected ${expected[index]} at index ${index}, got ${actual[index]}`,
		);
	}
}

{
	const legacyImport = buildLegacyProjectImport({
		cameraFramesState: {
			selectedPresetId: "preset-a",
			cameraPresets: [
				{
					id: "preset-a",
					name: "Cut A",
					mainCamera: {
						transform: {
							position: { x: 1, y: 2, z: 3 },
							rotation: { yaw: 0, pitch: 0, roll: 0 },
						},
						projection: {
							type: "perspective",
							baseFov: 42,
						},
						nearClip: 0.4,
					},
					cameraFramesState: {
						renderBox: {
							baseSize: { w: 1754, h: 1240 },
							scale: { kx: 1.2, ky: 1.1 },
							scalePct: { x: 120, y: 110 },
							anchor: { ax: 1, ay: 0 },
							center: { cx: 960, cy: 540 },
							fitScale: 0.8,
							viewZoomPct: 125,
							lastViewport: { vw: 1920, vh: 1080 },
							projection: {
								type: "perspective",
								baseFov: 42,
							},
						},
						frames: [
							{
								id: "A",
								pos: { x: 0.4, y: 0.6 },
								scaleK: 1.25,
								order: 2,
								rotationDeg: 15,
								anchor: { x: 0.4, y: 0.6 },
								selected: true,
							},
						],
						exportName: "cut-a",
						exportFormat: "png",
						exportGridOverlay: true,
					},
				},
			],
		},
		sceneRadius: 5,
	});

	assert.ok(legacyImport);
	assert.equal(legacyImport.shots.length, 1);
	assert.equal(legacyImport.activeShotCameraId, "shot-camera-1");

	const shot = legacyImport.shots[0];
	assert.equal(shot.document.name, "Cut A");
	assert.equal(shot.document.lens.baseFovX, 42);
	assert.equal(shot.document.clipping.mode, "auto");
	assert.equal(shot.document.clipping.near, 0.4);
	assert.ok(Math.abs(shot.document.outputFrame.widthScale - 1.2) < 1e-9);
	assert.ok(Math.abs(shot.document.outputFrame.heightScale - 1.1) < 1e-9);
	assert.equal(shot.document.outputFrame.anchor, "top-right");
	assert.equal(shot.document.outputFrame.viewportCenterX, 0.5);
	assert.equal(shot.document.outputFrame.viewportCenterY, 0.5);
	assert.equal(shot.document.exportSettings.exportName, "cut-a");
	assert.equal(shot.document.frames.length, 1);
	assert.equal(shot.document.activeFrameId, "frame-1");
	assert.equal(shot.document.frames[0].name, "A");
	assert.equal(shot.document.frames[0].x, 0.4);
	assert.equal(shot.document.frames[0].y, 0.6);
	assert.equal(shot.document.frames[0].scale, 1.25);
	assert.equal(shot.document.frames[0].rotation, 15);
	assert.deepEqual(shot.transform.position.toArray(), [1, 2, 3]);
	assertVectorClose(
		new THREE.Vector3(0, 0, -1)
			.applyQuaternion(shot.transform.quaternion)
			.toArray(),
		[0, 0, -1],
	);
}

{
	const legacyImport = buildLegacyProjectImport({
		cameraFramesState: {
			cameraPresets: [
				{
					id: "preset-b",
					name: "Turned",
					mainCamera: {
						transform: {
							position: { x: 0, y: 0, z: 0 },
							rotation: { yaw: 90, pitch: 30, roll: 0 },
						},
						projection: {
							type: "perspective",
							baseFov: 50,
						},
						nearClip: 0.2,
					},
					cameraFramesState: {
						renderBox: {
							projection: {
								type: "perspective",
								baseFov: 50,
							},
						},
						frames: [],
					},
				},
			],
		},
	});

	assert.ok(legacyImport);
	const shot = legacyImport.shots[0];
	assertVectorClose(
		new THREE.Vector3(0, 0, -1)
			.applyQuaternion(shot.transform.quaternion)
			.toArray(),
		[-0.8660254037844387, 0.5, 0],
	);
}

{
	const object = new THREE.Object3D();
	const applied = applyLegacyAssetState(object, "model", {
		name: "Layout Model",
		visible: false,
		transform: {
			position: [4, 5, 6],
			rotation: [0, 0, 0, 1],
			scale: [2, 3, 4],
		},
	});

	assert.equal(applied, true);
	assert.equal(object.name, "Layout Model");
	assert.equal(object.visible, false);
	assert.deepEqual(object.position.toArray(), [4, 5, 6]);
	assert.deepEqual(object.quaternion.toArray(), [0, 0, 0, 1]);
	assert.deepEqual(object.scale.toArray(), [2, 3, 4]);
}
