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
		},
		{
			buildReadinessPlan: ({ sceneAssets }) => {
				assert.deepEqual(sceneAssets, [{ id: "asset-a" }]);
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
	assert.deepEqual(result.readiness, {
		plan: { warmupPasses: 2, maxWaitMs: 100 },
		state: {
			completedWarmupPasses: 2,
			timedOut: false,
		},
	});
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

console.log("✅ CAMERA_FRAMES export render session tests passed!");
