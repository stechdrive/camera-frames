import assert from "node:assert/strict";
import { BASE_RENDER_BOX } from "../src/constants.js";
import { createReferenceImageTransformState } from "../src/controllers/reference-image/transform-state.js";

const originalDocument = globalThis.document;

class FakeElement {
	constructor(rect, width, height) {
		this._rect = rect;
		this.clientWidth = width;
		this.clientHeight = height;
		this.clientLeft = 0;
		this.clientTop = 0;
	}
	getBoundingClientRect() {
		return this._rect;
	}
}

{
	const renderBoxElement = new FakeElement(
		{ left: 100, top: 50, right: 300, bottom: 150, width: 200, height: 100 },
		200,
		100,
	);
	const viewportShellElement = new FakeElement(
		{ left: 80, top: 20, right: 360, bottom: 220, width: 280, height: 200 },
		280,
		200,
	);
	globalThis.document = {
		getElementById: (id) =>
			id === "viewport-shell" ? viewportShellElement : null,
	};
	const store = {
		referenceImages: {
			previewLayers: {
				value: [
					{
						id: "item-1",
						leftPx: 20,
						topPx: 10,
						widthPx: 40,
						heightPx: 20,
						rotationDeg: 15,
					},
				],
			},
			selectionBoxLogical: { value: null },
			selectionAnchor: { value: null },
		},
	};
	const item = {
		id: "item-1",
		assetId: "asset-1",
		offsetPx: { x: 0, y: 0 },
		anchor: { ax: 0.5, ay: 0.5 },
		scalePct: 100,
		rotationDeg: 15,
	};
	const api = createReferenceImageTransformState({
		store,
		renderBox: { current: renderBoxElement },
		getDocument: () => ({}),
		getSelectedItemIds: () => ["item-1"],
		getActiveShotCameraDocument: () => ({
			outputFrame: { anchor: "center" },
		}),
		getOutputSizeState: () => ({ width: 1000, height: 500 }),
		getResolvedShotItems: () => ({
			preset: { baseRenderBox: BASE_RENDER_BOX },
			override: null,
			items: [item],
			assetsById: new Map([
				[
					"asset-1",
					{
						id: "asset-1",
						sourceMeta: { appliedSize: { w: 100, h: 50 } },
					},
				],
			]),
		}),
	});

	const logicalContext = api.getLogicalTransformContext();
	assert.equal(logicalContext.outputSize.w, 1000);
	assert.equal(logicalContext.outputSize.h, 500);
	assert.equal(logicalContext.renderBoxAnchor.ax, 0.5);

	const transformState = api.buildSelectionTransformState();
	assert.equal(transformState.selectionBoxLogical.width, 100);
	assert.equal(transformState.selectionBoxLogical.height, 50);
	assert.equal(transformState.selectionBoxLogical.rotationDeg, 15);
	assert.equal(transformState.selectionBoxScreen.left, 20);
	assert.equal(transformState.selectionBoxScreen.top, 10);
	assert.equal(transformState.screenPivot.x, 40);
	assert.equal(transformState.screenPivot.y, 20);
}

{
	const store = {
		referenceImages: {
			previewLayers: { value: [] },
			selectionBoxLogical: {
				value: {
					left: 100,
					top: 50,
					width: 200,
					height: 100,
					rotationDeg: 20,
					anchorX: 0.25,
					anchorY: 0.75,
				},
			},
			selectionAnchor: { value: { x: 0.25, y: 0.75 } },
		},
	};
	const api = createReferenceImageTransformState({
		store,
		renderBox: null,
		getDocument: () => ({}),
		getSelectedItemIds: () => ["item-1", "item-2"],
		getActiveShotCameraDocument: () => ({
			outputFrame: { anchor: "center" },
		}),
		getOutputSizeState: () => ({ width: 1000, height: 500 }),
		getResolvedShotItems: () => ({
			preset: { baseRenderBox: BASE_RENDER_BOX },
			override: null,
			items: [
				{
					id: "item-1",
					assetId: "asset-1",
					offsetPx: { x: 0, y: 0 },
					anchor: { ax: 0.5, ay: 0.5 },
					scalePct: 100,
					rotationDeg: 20,
				},
				{
					id: "item-2",
					assetId: "asset-2",
					offsetPx: { x: 0, y: 0 },
					anchor: { ax: 0.5, ay: 0.5 },
					scalePct: 100,
					rotationDeg: 20,
				},
			],
			assetsById: new Map([
				[
					"asset-1",
					{
						id: "asset-1",
						sourceMeta: { appliedSize: { w: 100, h: 50 } },
					},
				],
				[
					"asset-2",
					{
						id: "asset-2",
						sourceMeta: { appliedSize: { w: 100, h: 50 } },
					},
				],
			]),
		}),
	});

	const transformState = api.buildSelectionTransformState({
		includeScreenState: false,
	});
	assert.equal(transformState.selectionBoxLogical.left, 100);
	assert.equal(transformState.selectionBoxLogical.top, 50);
	assert.equal(transformState.selectionBoxLogical.anchorX, 0.25);
	assert.equal(transformState.selectionBoxLogical.anchorY, 0.75);
	assert.ok(Number.isFinite(transformState.pivot.x));
	assert.ok(Number.isFinite(transformState.pivot.y));
}

globalThis.document = originalDocument;

console.log("✅ CAMERA_FRAMES reference image transform state tests passed!");
