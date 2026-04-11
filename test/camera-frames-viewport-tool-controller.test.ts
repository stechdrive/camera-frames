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

function createClassList() {
	const classes = new Set();
	return {
		add(name) {
			classes.add(name);
		},
		remove(name) {
			classes.delete(name);
		},
		toggle(name, force) {
			if (force === undefined) {
				if (classes.has(name)) {
					classes.delete(name);
				} else {
					classes.add(name);
				}
				return;
			}
			if (force) {
				classes.add(name);
			} else {
				classes.delete(name);
			}
		},
		contains(name) {
			return classes.has(name);
		},
	};
}

function createMockElement() {
	return {
		classList: createClassList(),
		style: {
			setProperty(name, value) {
				this[name] = value;
			},
		},
		dataset: {},
		attributes: new Map(),
		setAttribute(name, value) {
			this.attributes.set(name, value);
		},
		getAttribute(name) {
			return this.attributes.get(name);
		},
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

function createGizmoHarness({ camera }) {
	const handleElements = new Map(
		["move-x", "move-y", "move-z", "scale-uniform"].map((handleName) => [
			handleName,
			createMockElement(),
		]),
	);
	const ringElements = new Map(
		["x", "y", "z"].flatMap((axisKey) => [
			[`rotate-${axisKey}-front`, createMockElement()],
			[`rotate-${axisKey}-back`, createMockElement()],
		]),
	);
	const planeElements = new Map(
		["move-xy", "move-yz", "move-zx"].map((handleName) => [
			handleName,
			createMockElement(),
		]),
	);
	const viewportGizmo = {
		classList: createClassList(),
		dataset: {},
		querySelector(selector) {
			const match = selector.match(/\[data-gizmo-handle="([^\"]+)"\]/);
			return match ? (handleElements.get(match[1]) ?? null) : null;
		},
	};
	const viewportGizmoSvg = {
		attributes: new Map(),
		querySelector(selector) {
			const ringMatch = selector.match(/\[data-gizmo-ring="([^\"]+)"\]/);
			if (ringMatch) {
				return ringElements.get(ringMatch[1]) ?? null;
			}
			const planeMatch = selector.match(/\[data-gizmo-plane="([^\"]+)"\]/);
			return planeMatch ? (planeElements.get(planeMatch[1]) ?? null) : null;
		},
		setAttribute(name, value) {
			this.attributes.set(name, value);
		},
	};
	const controller = createViewportToolController({
		store: {
			viewportToolMode: { value: "transform" },
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
		viewportGizmo,
		viewportGizmoSvg,
		getActiveToolCamera: () => camera,
		assetController: {
			getSceneAsset: () => null,
			getSceneRaycastTargets: () => [],
			getSceneAssetForObject: () => null,
			selectSceneAsset: () => {},
		},
		beginHistoryTransaction: () => {},
		commitHistoryTransaction: () => {},
	});
	return {
		controller,
		handleElements,
		ringElements,
		viewportGizmo,
		viewportGizmoSvg,
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

{
	const camera = new THREE.OrthographicCamera(-5, 5, 5, -5, 0.1, 100);
	camera.position.set(0, 10, 0);
	camera.up.set(0, 0, -1);
	camera.lookAt(0, 0, 0);
	camera.updateProjectionMatrix();
	camera.updateMatrixWorld(true);
	const harness = createGizmoHarness({ camera });
	harness.controller.setCustomGizmoDelegate({
		getViewportGizmoConfig: () => ({
			pivotWorld: new THREE.Vector3(0, 0, 0),
			basisWorld: {
				x: new THREE.Vector3(1, 0, 0),
				y: new THREE.Vector3(0, 1, 0),
				z: new THREE.Vector3(0, 0, 1),
			},
			showMoveAxes: true,
			showMovePlanes: false,
			showRotate: true,
			showScale: false,
		}),
	});

	harness.controller.syncViewportTransformGizmo();

	assert.equal(
		harness.handleElements.get("move-y")?.classList.contains("is-hidden"),
		true,
	);
	assert.equal(
		harness.ringElements.get("rotate-y-front")?.classList.contains("is-hidden"),
		false,
	);
	assert.equal(
		harness.ringElements.get("rotate-y-back")?.classList.contains("is-hidden"),
		false,
	);
}

console.log("✅ CAMERA_FRAMES viewport tool controller tests passed!");
