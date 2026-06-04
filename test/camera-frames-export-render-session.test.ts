import assert from "node:assert/strict";
import * as THREE from "three";
import {
	renderGuideLayerPixels,
	renderScenePixelsWithReadiness,
} from "../src/controllers/export/render-session.js";

{
	const result = await renderGuideLayerPixels(
		{
			camera: { id: "camera" },
			width: 10,
			height: 20,
			gridVisible: false,
			eyeLevelVisible: false,
		},
		{},
	);
	assert.equal(result, null);
}

{
	const guideStates = [];
	const rendererCalls = [];
	const target = { id: "target" };
	const previousTarget = { id: "previous-target" };
	const previousColor = new THREE.Color(0x223344);
	const pixels = await renderGuideLayerPixels(
		{
			camera: { id: "camera" },
			width: 2,
			height: 1,
			gridVisible: true,
			eyeLevelVisible: false,
			gridLayerMode: "bottom",
		},
		{
			ensureRenderTarget: (width, height) => {
				assert.equal(width, 2);
				assert.equal(height, 1);
				return target;
			},
			renderer: {
				autoClear: false,
				getRenderTarget() {
					return previousTarget;
				},
				getClearAlpha() {
					return 0.4;
				},
				getClearColor(targetColor) {
					return targetColor.copy(previousColor);
				},
				setRenderTarget(nextTarget) {
					rendererCalls.push(["setRenderTarget", nextTarget]);
				},
				setClearColor(color, alpha) {
					rendererCalls.push([
						"setClearColor",
						color?.isColor ? `#${color.getHexString()}` : color,
						alpha,
					]);
				},
				clear(color, depth, stencil) {
					rendererCalls.push(["clear", color, depth, stencil]);
				},
				readRenderTargetPixels(readTarget, x, y, width, height, buffer) {
					rendererCalls.push([
						"readRenderTargetPixels",
						readTarget,
						x,
						y,
						width,
						height,
					]);
					buffer.set([1, 2, 3, 4, 5, 6, 7, 8]);
				},
			},
			guideOverlay: {
				captureState() {
					return { previous: true };
				},
				applyState(state) {
					guideStates.push(state);
				},
				renderBackground(renderer, camera) {
					rendererCalls.push(["renderBackground", renderer, camera]);
				},
				renderOverlay(renderer, camera) {
					rendererCalls.push(["renderOverlay", renderer, camera]);
				},
			},
			flipPixels: (buffer, width, height) => {
				assert.deepEqual(Array.from(buffer), [1, 2, 3, 4, 5, 6, 7, 8]);
				assert.equal(width, 2);
				assert.equal(height, 1);
				return new Uint8Array([8, 7, 6, 5, 4, 3, 2, 1]);
			},
		},
	);

	assert.deepEqual(Array.from(pixels), [8, 7, 6, 5, 4, 3, 2, 1]);
	assert.deepEqual(guideStates, [
		{
			gridVisible: true,
			eyeLevelVisible: false,
			gridLayerMode: "bottom",
		},
		{ previous: true },
	]);
	assert.deepEqual(rendererCalls[0], ["setRenderTarget", target]);
	assert.deepEqual(rendererCalls.at(-2), ["setRenderTarget", previousTarget]);
	assert.deepEqual(rendererCalls.at(-1), ["setClearColor", "#223344", 0.4]);
}

{
	const backendCalls = [];
	let now = 0;
	const result = await renderScenePixelsWithReadiness(
		{
			scene: { id: "scene" },
			camera: { id: "camera" },
			width: 100,
			height: 50,
			sceneAssets: [{ id: "asset-a" }],
			readinessPolicy: { splatWarmupPasses: 3, maxWaitMs: 2000 },
		},
		{
			buildReadinessPlan: ({ sceneAssets, policy }) => {
				assert.deepEqual(sceneAssets, [{ id: "asset-a" }]);
				assert.deepEqual(policy, {
					splatWarmupPasses: 3,
					maxWaitMs: 2000,
				});
				return { warmupPasses: 2, maxWaitMs: 100 };
			},
			finalizeReadiness: (plan, state) => ({ plan, state }),
			getNowMs: () => {
				now += 10;
				return now;
			},
			renderBackend: {
				async prepareFrame(config) {
					backendCalls.push(["prepareFrame", config]);
				},
				async renderFrame(config) {
					backendCalls.push(["renderFrame", config]);
				},
				async readPixels(config) {
					backendCalls.push(["readPixels", config]);
					return new Uint8Array([9, 8, 7, 6]);
				},
			},
		},
	);

	assert.deepEqual(Array.from(result.pixels), [9, 8, 7, 6]);
	const firstTrace = result.readiness.state.trace;
	assert.equal(firstTrace.strategy, "probe-safe");
	assert.equal(firstTrace.passes.length, 3);
	assert.equal(firstTrace.passes[0].needsWarmup, true);
	assert.equal(firstTrace.passes[2].needsFinalPass, true);
	assert.equal(firstTrace.readPixelsMs > 0, true);
	assert.equal(firstTrace.elapsedMs >= firstTrace.readPixelsMs, true);
	assert.deepEqual(
		{
			...result.readiness,
			state: {
				...result.readiness.state,
				trace: "checked",
			},
		},
		{
		plan: { warmupPasses: 2, maxWaitMs: 100 },
		state: {
			completedWarmupPasses: 2,
			completedRenderPasses: 3,
			settledPassesPlanned: 0,
			completedSettledPasses: 0,
			probeSupported: false,
			lastReadinessProbe: null,
			timedOut: false,
			trace: "checked",
		},
		},
	);
	assert.equal(
		backendCalls.filter(([kind]) => kind === "prepareFrame").length,
		3,
	);
	assert.equal(
		backendCalls.filter(([kind]) => kind === "renderFrame").length,
		3,
	);
	assert.deepEqual(backendCalls.at(-1), [
		"readPixels",
		{ width: 100, height: 50 },
	]);
}

{
	const backendCalls = [];
	const probes = [
		{
			supported: true,
			pending: true,
			pendingCounts: { pagerFetchers: 1 },
			pendingReasons: ["pagerFetchers:1"],
		},
		{
			supported: true,
			pending: false,
			pendingCounts: {},
			pendingReasons: [],
		},
		{
			supported: true,
			pending: false,
			pendingCounts: {},
			pendingReasons: [],
		},
	];
	let now = 0;
	const result = await renderScenePixelsWithReadiness(
		{
			scene: { id: "scene" },
			camera: { id: "camera" },
			width: 64,
			height: 32,
			sceneAssets: [{ id: "asset-a" }],
		},
		{
			buildReadinessPlan: () => ({
				warmupPasses: 1,
				settledPasses: 2,
				maxWaitMs: 100,
			}),
			finalizeReadiness: (plan, state) => ({ plan, state }),
			getNowMs: () => {
				now += 5;
				return now;
			},
			renderBackend: {
				async prepareFrame(config) {
					backendCalls.push(["prepareFrame", config]);
				},
				async renderFrame(config) {
					backendCalls.push(["renderFrame", config]);
				},
				captureReadinessState(config) {
					const probe = probes.shift();
					backendCalls.push(["captureReadinessState", config, probe]);
					return probe;
				},
				async readPixels(config) {
					backendCalls.push(["readPixels", config]);
					return new Uint8Array([1, 1, 1, 1]);
				},
			},
		},
	);

	assert.deepEqual(Array.from(result.pixels), [1, 1, 1, 1]);
	assert.equal(
		backendCalls.filter(([kind]) => kind === "prepareFrame").length,
		3,
	);
	assert.equal(
		backendCalls.filter(([kind]) => kind === "renderFrame").length,
		3,
	);
	assert.equal(
		backendCalls.filter(([kind]) => kind === "captureReadinessState").length,
		3,
	);
	const settledTrace = result.readiness.state.trace;
	assert.equal(settledTrace.strategy, "probe-safe");
	assert.equal(settledTrace.passes.length, 3);
	assert.deepEqual(
		settledTrace.passes.map((pass) => pass.probe?.pending),
		[true, false, false],
	);
	assert.deepEqual(
		{
			...result.readiness.state,
			trace: "checked",
		},
		{
		completedWarmupPasses: 1,
		completedRenderPasses: 3,
		settledPassesPlanned: 2,
		completedSettledPasses: 2,
		probeSupported: true,
		lastReadinessProbe: {
			supported: true,
			pending: false,
			pendingCounts: {},
			pendingReasons: [],
		},
		timedOut: false,
		trace: "checked",
		},
	);
}

{
	const backendCalls = [];
	let now = 0;
	const result = await renderScenePixelsWithReadiness(
		{
			scene: { id: "scene" },
			camera: { id: "camera" },
			width: 32,
			height: 16,
			sceneAssets: [{ id: "model-a" }],
		},
		{
			buildReadinessPlan: () => ({
				warmupPasses: 0,
				settledPasses: 0,
				maxWaitMs: 100,
			}),
			finalizeReadiness: (plan, state) => ({ plan, state }),
			getNowMs: () => {
				now += 5;
				return now;
			},
			renderBackend: {
				async prepareFrame(config) {
					backendCalls.push(["prepareFrame", config]);
				},
				async renderFrame(config) {
					backendCalls.push(["renderFrame", config]);
				},
				captureReadinessState() {
					throw new Error("readiness probe should not run");
				},
				async readPixels(config) {
					backendCalls.push(["readPixels", config]);
					return new Uint8Array([2, 2, 2, 2]);
				},
			},
		},
	);

	assert.deepEqual(Array.from(result.pixels), [2, 2, 2, 2]);
	assert.equal(
		backendCalls.filter(([kind]) => kind === "prepareFrame").length,
		1,
	);
	assert.equal(
		backendCalls.filter(([kind]) => kind === "renderFrame").length,
		1,
	);
	const noProbeTrace = result.readiness.state.trace;
	assert.equal(noProbeTrace.passes.length, 1);
	assert.equal(noProbeTrace.passes[0].probe, null);
	assert.deepEqual(
		{
			...result.readiness.state,
			trace: "checked",
		},
		{
		completedWarmupPasses: 0,
		completedRenderPasses: 1,
		settledPassesPlanned: 0,
		completedSettledPasses: 0,
		probeSupported: false,
		lastReadinessProbe: null,
		timedOut: false,
		trace: "checked",
		},
	);
}

{
	const backendCalls = [];
	let now = 0;
	const result = await renderScenePixelsWithReadiness(
		{
			scene: { id: "scene" },
			camera: { id: "camera" },
			width: 16,
			height: 8,
			sceneAssets: [{ id: "asset-a" }],
		},
		{
			buildReadinessPlan: () => ({
				readinessStrategy: "probe-early",
				warmupPasses: 2,
				warmupPassesRequired: 0,
				settledPasses: 2,
				maxWaitMs: 100,
			}),
			finalizeReadiness: (plan, state) => ({ plan, state }),
			getNowMs: () => {
				now += 1;
				return now;
			},
			renderBackend: {
				async prepareFrame(config) {
					backendCalls.push(["prepareFrame", config]);
				},
				async renderFrame(config) {
					backendCalls.push(["renderFrame", config]);
				},
				captureReadinessState(config) {
					backendCalls.push(["captureReadinessState", config]);
					return {
						supported: true,
						pending: false,
						pendingCounts: {},
						pendingReasons: [],
					};
				},
				async readPixels(config) {
					backendCalls.push(["readPixels", config]);
					return new Uint8Array([3, 3, 3, 3]);
				},
			},
		},
	);

	assert.deepEqual(Array.from(result.pixels), [3, 3, 3, 3]);
	assert.equal(
		backendCalls.filter(([kind]) => kind === "prepareFrame").length,
		2,
	);
	assert.deepEqual(
		{
			...result.readiness.state,
			trace: {
				strategy: result.readiness.state.trace.strategy,
				passes: result.readiness.state.trace.passes.length,
			},
		},
		{
			completedWarmupPasses: 0,
			completedRenderPasses: 2,
			settledPassesPlanned: 2,
			completedSettledPasses: 2,
			probeSupported: true,
			lastReadinessProbe: {
				supported: true,
				pending: false,
				pendingCounts: {},
				pendingReasons: [],
			},
			timedOut: false,
			trace: {
				strategy: "probe-early",
				passes: 2,
			},
		},
	);
}

console.log("✅ CAMERA_FRAMES export render session tests passed!");
