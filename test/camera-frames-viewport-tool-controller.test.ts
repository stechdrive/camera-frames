import assert from "node:assert/strict";
import * as THREE from "three";
import { createViewportToolController } from "../src/controllers/viewport-tool-controller.js";
import { WORKSPACE_PANE_VIEWPORT } from "../src/workspace-model.js";

function createEvent(overrides = {}) {
	const calls = {
		preventDefault: 0,
		stopPropagation: 0,
	};
	return {
		clientX: 50,
		clientY: 50,
		shiftKey: false,
		ctrlKey: false,
		metaKey: false,
		preventDefault() {
			calls.preventDefault += 1;
		},
		stopPropagation() {
			calls.stopPropagation += 1;
		},
		...overrides,
		calls,
	};
}

function createHarness() {
	const camera = new THREE.PerspectiveCamera(90, 1, 0.1, 100);
	camera.position.set(0, 0, 10);
	camera.lookAt(0, 0, 0);
	camera.updateProjectionMatrix();
	camera.updateMatrixWorld(true);

	const mesh = new THREE.Mesh(
		new THREE.BoxGeometry(2, 2, 2),
		new THREE.MeshBasicMaterial(),
	);
	mesh.position.set(0, 0, 0);
	mesh.updateMatrixWorld(true);

	const asset = {
		id: 101,
		object: mesh,
	};
	const calls = {
		selectSceneAsset: [],
	};
	const controller = createViewportToolController({
		store: {
			viewportToolMode: { value: "select" },
			viewportTransformSpace: { value: "world" },
			selectedSceneAssetId: { value: null },
			selectedSceneAssetIds: { value: [] },
		},
		state: {
			mode: WORKSPACE_PANE_VIEWPORT,
		},
		viewportShell: {
			getBoundingClientRect() {
				return {
					left: 0,
					top: 0,
					width: 100,
					height: 100,
				};
			},
		},
		viewportGizmo: null,
		viewportGizmoSvg: null,
		getActiveToolCamera: () => camera,
		assetController: {
			getSceneAsset: () => asset,
			getSceneRaycastTargets: () => [mesh],
			getSceneAssetForObject: (object) => (object === mesh ? asset : null),
			selectSceneAsset: (assetId, options) => {
				calls.selectSceneAsset.push({ assetId, options });
			},
		},
		beginHistoryTransaction: () => {},
		commitHistoryTransaction: () => {},
	});

	return {
		controller,
		calls,
	};
}

{
	const harness = createHarness();
	const event = createEvent();
	const selected = harness.controller.pickViewportAssetAtPointer(event);

	assert.equal(selected, true);
	assert.deepEqual(harness.calls.selectSceneAsset, [
		{
			assetId: 101,
			options: {
				additive: false,
				toggle: false,
			},
		},
	]);
	assert.equal(event.calls.preventDefault, 1);
	assert.equal(event.calls.stopPropagation, 1);
}

{
	const harness = createHarness();
	const event = createEvent({ shiftKey: true });
	harness.controller.pickViewportAssetAtPointer(event);

	assert.deepEqual(harness.calls.selectSceneAsset, [
		{
			assetId: 101,
			options: {
				additive: true,
				toggle: true,
			},
		},
	]);
}

console.log("✅ CAMERA_FRAMES viewport tool controller tests passed!");
