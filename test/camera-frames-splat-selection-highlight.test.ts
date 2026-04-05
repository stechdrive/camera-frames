import assert from "node:assert/strict";
import { createSplatSelectionHighlightController } from "../src/engine/splat-selection-highlight.js";

class FakeRgbaArray {
	constructor({ array, count, capacity } = {}) {
		this.array = array ?? new Uint8Array((count ?? 0) * 4);
		this.count = count ?? 0;
		this.capacity = capacity ?? this.count;
		this.needsUpdate = false;
		this.disposed = false;
		this.texture = { needsUpdate: false };
	}

	getTexture() {
		this.texture.needsUpdate = true;
		return this.texture;
	}

	dispose() {
		this.disposed = true;
	}
}

function createSplatMesh(colors) {
	return {
		splats: {
			getNumSplats() {
				return colors.length;
			},
		},
		splatRgba: null,
		updateGeneratorCalls: 0,
		updateGenerator() {
			this.updateGeneratorCalls += 1;
		},
		forEachSplat(callback) {
			colors.forEach((entry, index) => {
				callback(index, null, null, null, entry.opacity, entry.color);
			});
		},
	};
}

{
	const mesh = createSplatMesh([
		{ color: { r: 0.2, g: 0.4, b: 0.6 }, opacity: 0.75 },
		{ color: { r: 0.9, g: 0.1, b: 0.2 }, opacity: 0.5 },
	]);
	const asset = {
		id: "splat-1",
		kind: "splat",
		disposeTarget: mesh,
	};
	const controller = createSplatSelectionHighlightController({
		RgbaArrayImpl: FakeRgbaArray,
		highlightRgba: { r: 255, g: 0, b: 0 },
		highlightMix: 1,
	});

	controller.sync({
		scopeAssets: [asset],
		selectedSplatsByAssetId: new Map([["splat-1", new Set([1])]]),
	});

	assert.ok(mesh.splatRgba instanceof FakeRgbaArray);
	assert.equal(mesh.updateGeneratorCalls, 1);
	assert.deepEqual(
		Array.from(mesh.splatRgba.array.slice(0, 4)),
		[51, 102, 153, 191],
	);
	assert.deepEqual(
		Array.from(mesh.splatRgba.array.slice(4, 8)),
		[255, 0, 0, 128],
	);

	controller.clear();

	assert.equal(mesh.splatRgba, null);
	assert.equal(mesh.updateGeneratorCalls, 2);
}

{
	const previousRgba = { array: new Uint8Array([1, 2, 3, 4]) };
	const mesh = createSplatMesh([{ color: { r: 0, g: 0, b: 0 }, opacity: 1 }]);
	mesh.splatRgba = previousRgba;
	const asset = {
		id: "splat-2",
		kind: "splat",
		disposeTarget: mesh,
	};
	const controller = createSplatSelectionHighlightController({
		RgbaArrayImpl: FakeRgbaArray,
		highlightRgba: { r: 0, g: 255, b: 0 },
		highlightMix: 1,
	});

	controller.sync({
		scopeAssets: [asset],
		selectedSplatsByAssetId: new Map([["splat-2", new Set([0])]]),
	});
	controller.sync({
		scopeAssets: [asset],
		selectedSplatsByAssetId: new Map(),
	});

	assert.equal(mesh.splatRgba, previousRgba);
	assert.equal(mesh.updateGeneratorCalls, 2);
}

{
	const mesh = createSplatMesh([
		{ color: { r: 0.4, g: 0.4, b: 0.4 }, opacity: 1 },
	]);
	const asset = {
		id: "splat-hidden",
		kind: "splat",
		disposeTarget: mesh,
	};
	const controller = createSplatSelectionHighlightController({
		RgbaArrayImpl: FakeRgbaArray,
		highlightRgba: { r: 0, g: 255, b: 0 },
		highlightMix: 1,
	});

	controller.sync({
		scopeAssets: [asset],
		selectedSplatsByAssetId: new Map([["splat-hidden", new Set([0])]]),
		hiddenSelectedSplatsByAssetId: new Map([["splat-hidden", new Set([0])]]),
	});

	assert.deepEqual(
		Array.from(mesh.splatRgba.array.slice(0, 4)),
		[102, 102, 102, 0],
	);
}

console.log("✅ CAMERA_FRAMES splat selection highlight tests passed!");
