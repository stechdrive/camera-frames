import assert from "node:assert/strict";
import * as THREE from "three";
import {
	DEFAULT_EXPORT_SUPER_XY,
	createSparkExportRendererManager,
} from "../src/engine/spark-export-renderer.js";

function createRendererStub() {
	let currentTarget = null;
	let clearAlpha = 1;
	let clearColor = new THREE.Color(0xffffff);
	const calls = [];

	return {
		get calls() {
			return calls;
		},
		get autoClear() {
			return this._autoClear ?? false;
		},
		set autoClear(value) {
			this._autoClear = value;
			calls.push(["autoClear", value]);
		},
		getRenderTarget() {
			return currentTarget;
		},
		setRenderTarget(target) {
			currentTarget = target;
			calls.push(["setRenderTarget", target]);
		},
		getClearAlpha() {
			return clearAlpha;
		},
		setClearColor(color, alpha) {
			clearColor =
				color instanceof THREE.Color ? color.clone() : new THREE.Color(color);
			clearAlpha = alpha;
			calls.push(["setClearColor", clearColor.getHex(), alpha]);
		},
		getClearColor(target) {
			return target.copy(clearColor);
		},
		clear(color, depth, stencil) {
			calls.push(["clear", color, depth, stencil]);
		},
		_autoClear: false,
	};
}

{
	const renderer = createRendererStub();
	const sourceSpark = {
		renderer,
		target: null,
		backTarget: null,
		superXY: DEFAULT_EXPORT_SUPER_XY,
		superPixels: null,
		targetPixels: null,
		encodeLinear: false,
		update() {},
		renderTargetCalls: 0,
		renderTarget() {
			this.renderTargetCalls += 1;
		},
		readTarget() {
			return new Uint8Array();
		},
	};

	const manager = createSparkExportRendererManager({ sourceSpark });
	manager.renderFrame({
		scene: {},
		camera: {},
		width: 16,
		height: 8,
	});

	const clearIndex = renderer.calls.findIndex((entry) => entry[0] === "clear");
	const renderIndex = renderer.calls.findIndex(
		(entry) => entry[0] === "setRenderTarget" && entry[1] === null,
	);

	assert.notEqual(clearIndex, -1);
	assert.notEqual(renderIndex, -1);
	assert.equal(sourceSpark.renderTargetCalls, 1);
	assert.equal(renderer.getClearAlpha(), 1);
	assert.equal(renderer.getClearColor(new THREE.Color()).getHex(), 0xffffff);
}

console.log("✅ CAMERA_FRAMES spark export renderer tests passed!");
