import assert from "node:assert/strict";
import * as THREE from "three";
import {
	computeWorkspacePaneViewportScissor,
	createWorkspaceSparkRendererManager,
	withWorkspacePaneRendererState,
} from "../src/engine/workspace-multi-view.js";

function createRendererStub({ pixelRatio = 2 } = {}) {
	let viewport = new THREE.Vector4(0, 0, 800, 600);
	let scissor = new THREE.Vector4(5, 6, 700, 500);
	let scissorTest = false;
	const getDrawingBufferSize = (target) =>
		target.set(800 * pixelRatio, 600 * pixelRatio);

	return {
		getViewport(target) {
			return target.copy(viewport);
		},
		setViewport(x, y, width, height) {
			viewport = x?.isVector4
				? x.clone()
				: new THREE.Vector4(x, y, width, height);
		},
		getScissor(target) {
			return target.copy(scissor);
		},
		setScissor(x, y, width, height) {
			scissor = x?.isVector4
				? x.clone()
				: new THREE.Vector4(x, y, width, height);
		},
		getScissorTest() {
			return scissorTest;
		},
		setScissorTest(value) {
			scissorTest = Boolean(value);
		},
		getPixelRatio() {
			return pixelRatio;
		},
		getDrawingBufferSize,
	};
}

function vector4Values(vector) {
	return [vector.x, vector.y, vector.z, vector.w];
}

{
	const result = computeWorkspacePaneViewportScissor({
		canvasRect: {
			left: 100,
			top: 50,
			right: 900,
			bottom: 650,
			width: 800,
			height: 600,
		},
		shellRect: {
			left: 120,
			top: 70,
			right: 880,
			bottom: 630,
			width: 760,
			height: 560,
		},
		paneRect: {
			left: 80,
			top: 40,
			right: 520,
			bottom: 340,
			width: 440,
			height: 300,
		},
	});

	assert.deepEqual(result, {
		viewport: { x: 20, y: 310, width: 400, height: 270 },
		scissor: { x: 20, y: 310, width: 400, height: 270 },
		visible: true,
	});
}

{
	const result = computeWorkspacePaneViewportScissor({
		canvasRect: { x: 10, y: 20, width: 100, height: 80 },
		paneRect: { x: 90, y: 70, width: 80, height: 80 },
	});

	assert.deepEqual(result, {
		viewport: { x: 80, y: 0, width: 20, height: 30 },
		scissor: { x: 80, y: 0, width: 20, height: 30 },
		visible: true,
	});
}

{
	const renderer = createRendererStub({ pixelRatio: 2 });
	const originalGetDrawingBufferSize = renderer.getDrawingBufferSize;
	const renderRect = {
		viewport: { x: 100, y: 50, width: 300, height: 200 },
		scissor: { x: 110, y: 60, width: 280, height: 180 },
	};

	const result = withWorkspacePaneRendererState(
		{ renderer, renderRect },
		(state) => {
			assert.deepEqual(
				vector4Values(renderer.getViewport(new THREE.Vector4())),
				[100, 50, 300, 200],
			);
			assert.deepEqual(
				vector4Values(renderer.getScissor(new THREE.Vector4())),
				[110, 60, 280, 180],
			);
			assert.equal(renderer.getScissorTest(), true);
			assert.deepEqual(
				renderer.getDrawingBufferSize(new THREE.Vector2()).toArray(),
				[600, 400],
			);
			assert.deepEqual(state.drawingBufferSize, {
				width: 600,
				height: 400,
			});
			assert.equal(state.pixelRatio, 2);
			return "rendered";
		},
	);

	assert.equal(result, "rendered");
	assert.equal(renderer.getDrawingBufferSize, originalGetDrawingBufferSize);
	assert.deepEqual(
		vector4Values(renderer.getViewport(new THREE.Vector4())),
		[0, 0, 800, 600],
	);
	assert.deepEqual(
		vector4Values(renderer.getScissor(new THREE.Vector4())),
		[5, 6, 700, 500],
	);
	assert.equal(renderer.getScissorTest(), false);
	assert.deepEqual(
		renderer.getDrawingBufferSize(new THREE.Vector2()).toArray(),
		[1600, 1200],
	);
}

{
	const renderer = createRendererStub({ pixelRatio: 1.5 });
	const originalGetDrawingBufferSize = renderer.getDrawingBufferSize;
	const expectedError = new Error("render failed");

	assert.throws(
		() =>
			withWorkspacePaneRendererState(
				{
					renderer,
					renderRect: {
						viewport: { x: 10, y: 20, width: 101, height: 51 },
						scissor: { x: 10, y: 20, width: 101, height: 51 },
					},
				},
				() => {
					assert.deepEqual(
						renderer.getDrawingBufferSize(new THREE.Vector2()).toArray(),
						[151, 76],
					);
					throw expectedError;
				},
			),
		(error) => error === expectedError,
	);

	assert.equal(renderer.getDrawingBufferSize, originalGetDrawingBufferSize);
	assert.deepEqual(
		vector4Values(renderer.getViewport(new THREE.Vector4())),
		[0, 0, 800, 600],
	);
	assert.deepEqual(
		vector4Values(renderer.getScissor(new THREE.Vector4())),
		[5, 6, 700, 500],
	);
	assert.equal(renderer.getScissorTest(), false);
}

{
	class FakeSparkRenderer {
		constructor(options) {
			this.options = options;
			this.enableLod = options.enableLod;
			this.enableDriveLod = options.enableDriveLod;
			this.enableLodFetching = options.enableLodFetching;
			this.lodWorker = null;
			this.pager = undefined;
			this.lodInstances = new Map();
			this.orderingTexture = { id: Symbol("ordering") };
			this.sortedCenter = { id: Symbol("center") };
			this.currentLod = { id: Symbol("lod") };
			this.disposeCalls = 0;
			this.geometry = {
				disposeCalls: 0,
				dispose() {
					this.disposeCalls += 1;
				},
			};
			const materialA = {
				disposeCalls: 0,
				dispose() {
					this.disposeCalls += 1;
				},
			};
			const materialB = {
				disposeCalls: 0,
				dispose() {
					this.disposeCalls += 1;
				},
			};
			this.material = [materialA, materialB, materialA];
		}

		dispose() {
			this.disposeCalls += 1;
			for (const instance of this.lodInstances.values()) {
				instance.texture?.dispose?.();
			}
			this.lodInstances.clear();
		}
	}

	const renderer = {};
	const primaryClock = { id: Symbol("clock") };
	const primarySpark = {
		renderer,
		sortRadial: true,
		lodSplatScale: 0.75,
		autoUpdate: true,
		preUpdate: true,
		clock: primaryClock,
		enableLod: true,
		enableDriveLod: true,
		enableLodFetching: true,
		lodWorker: { id: Symbol("worker") },
		pager: { id: Symbol("pager") },
		lodInstances: new Map(),
		disposeCalls: 0,
	};
	const manager = createWorkspaceSparkRendererManager({
		primarySpark,
		SparkRendererImpl: FakeSparkRenderer,
	});
	const cameraSpark = manager.create("camera");
	const viewportSpark = manager.ensure("viewport", {
		lodSplatScale: 0.5,
		enableDriveLod: true,
		enableLodFetching: true,
	});

	assert.notEqual(cameraSpark, viewportSpark);
	assert.notEqual(cameraSpark.orderingTexture, viewportSpark.orderingTexture);
	assert.notEqual(cameraSpark.sortedCenter, viewportSpark.sortedCenter);
	assert.notEqual(cameraSpark.currentLod, viewportSpark.currentLod);
	assert.equal(cameraSpark.options.renderer, renderer);
	assert.equal(cameraSpark.options.sortRadial, true);
	assert.equal(cameraSpark.options.lodSplatScale, 0.75);
	assert.equal(cameraSpark.options.clock, primaryClock);
	assert.equal(cameraSpark.options.enableLod, true);
	assert.equal(cameraSpark.options.enableDriveLod, false);
	assert.equal(cameraSpark.options.enableLodFetching, false);
	assert.equal(viewportSpark.options.renderer, renderer);
	assert.equal(viewportSpark.options.lodSplatScale, 0.5);
	assert.equal(viewportSpark.options.enableDriveLod, false);
	assert.equal(viewportSpark.options.enableLodFetching, false);

	const borrowedTexture = {
		disposeCalls: 0,
		dispose() {
			this.disposeCalls += 1;
		},
	};
	const primaryMesh = { id: "primary-mesh" };
	const primaryLodInstance = {
		lodId: 1,
		numSplats: 10,
		indices: new Uint32Array(0),
		texture: borrowedTexture,
	};
	primarySpark.lodInstances.set(primaryMesh, primaryLodInstance);
	cameraSpark.lodInstances.set({ id: "stale-mesh" }, { texture: {} });
	assert.equal(manager.syncPrimaryLodInstances("camera"), cameraSpark);
	assert.deepEqual(
		[...cameraSpark.lodInstances],
		[[primaryMesh, primaryLodInstance]],
	);
	assert.equal(manager.ensure("camera"), cameraSpark);
	assert.equal(manager.get("viewport"), viewportSpark);
	assert.equal(manager.size, 2);
	assert.deepEqual(manager.getLodOwnershipState(), {
		primary: {
			enableLod: true,
			enableDriveLod: true,
			enableLodFetching: true,
			hasLodWorker: true,
			hasPager: true,
			lodInstanceCount: 1,
		},
		followers: [
			{
				viewId: "camera",
				enableLod: true,
				enableDriveLod: false,
				enableLodFetching: false,
				hasLodWorker: false,
				hasPager: false,
				lodInstanceCount: 1,
			},
			{
				viewId: "viewport",
				enableLod: true,
				enableDriveLod: false,
				enableLodFetching: false,
				hasLodWorker: false,
				hasPager: false,
				lodInstanceCount: 0,
			},
		],
		driverCount: 1,
	});
	assert.throws(() => manager.create("camera"), /already exists/);

	assert.equal(manager.disposeView("camera"), true);
	assert.equal(manager.disposeView("camera"), false);
	assert.equal(cameraSpark.disposeCalls, 1);
	assert.equal(borrowedTexture.disposeCalls, 0);
	assert.equal(cameraSpark.geometry.disposeCalls, 1);
	assert.deepEqual(
		cameraSpark.material.map((material) => material.disposeCalls),
		[1, 1, 1],
	);
	assert.equal(viewportSpark.disposeCalls, 0);
	assert.equal(manager.size, 1);

	manager.clear();
	assert.equal(viewportSpark.disposeCalls, 1);
	assert.equal(viewportSpark.geometry.disposeCalls, 1);
	assert.deepEqual(
		viewportSpark.material.map((material) => material.disposeCalls),
		[1, 1, 1],
	);
	assert.equal(manager.size, 0);
	assert.equal(manager.disposed, false);

	const recreatedViewportSpark = manager.ensure("viewport");
	assert.notEqual(recreatedViewportSpark, viewportSpark);
	assert.equal(manager.size, 1);

	manager.dispose();
	manager.dispose();
	assert.equal(recreatedViewportSpark.disposeCalls, 1);
	assert.equal(recreatedViewportSpark.geometry.disposeCalls, 1);
	assert.deepEqual(
		recreatedViewportSpark.material.map((material) => material.disposeCalls),
		[1, 1, 1],
	);
	assert.equal(primarySpark.disposeCalls, 0);
	assert.equal(manager.size, 0);
	assert.equal(manager.disposed, true);
	assert.throws(() => manager.ensure("new-view"), /has been disposed/);
}

console.log("✅ CAMERA_FRAMES workspace multi-view tests passed!");
