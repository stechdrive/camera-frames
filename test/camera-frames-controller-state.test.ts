import assert from "node:assert/strict";
import { createControllerState } from "../src/app/controller-state.js";

{
	const store = {
		mode: { value: "camera" },
		baseFovX: { value: 50 },
		viewportBaseFovX: { value: 42 },
		viewportBaseFovXDirty: { value: false },
		renderBox: {
			widthScale: { value: 0.8 },
			heightScale: { value: 0.6 },
			viewZoom: { value: 1.25 },
			anchor: { value: "center" },
		},
	};
	const calls = [];
	const { state, outputFrameResizeHandles, sceneState } = createControllerState(
		{
			store,
			updateActiveShotCameraDocument: (updateDocument) => {
				const documentState = {
					lens: { baseFovX: 10 },
					outputFrame: {
						widthScale: 1,
						heightScale: 1,
						viewZoom: 1,
						anchor: "top-left",
					},
				};
				updateDocument(documentState);
				calls.push(documentState);
			},
		},
	);

	assert.equal(state.mode, "camera");
	assert.equal(state.baseFovX, 50);
	assert.equal(state.viewportBaseFovX, 42);
	assert.equal(state.outputFrame.widthScale, 0.8);
	assert.equal(state.outputFrame.heightScale, 0.6);
	assert.equal(state.outputFrame.viewZoom, 1.25);
	assert.equal(state.outputFrame.anchor, "center");
	assert.equal(state.interactionMode, "navigate");
	assert.equal(sceneState.nextAssetId, 1);
	assert.equal(outputFrameResizeHandles.top.x, 0.5);

	state.baseFovX = 55;
	state.viewportBaseFovX = 46;
	state.viewportBaseFovXDirty = true;
	state.outputFrame.widthScale = 0.9;
	state.outputFrame.heightScale = 0.7;
	state.outputFrame.viewZoom = 1.5;
	state.outputFrame.anchor = "bottom-right";

	assert.equal(store.viewportBaseFovX.value, 46);
	assert.equal(store.viewportBaseFovXDirty.value, true);
	assert.deepEqual(
		calls.map((documentState) => ({
			baseFovX: documentState.lens.baseFovX,
			widthScale: documentState.outputFrame.widthScale,
			heightScale: documentState.outputFrame.heightScale,
			viewZoom: documentState.outputFrame.viewZoom,
			anchor: documentState.outputFrame.anchor,
		})),
		[
			{
				baseFovX: 55,
				widthScale: 1,
				heightScale: 1,
				viewZoom: 1,
				anchor: "top-left",
			},
			{
				baseFovX: 10,
				widthScale: 0.9,
				heightScale: 1,
				viewZoom: 1,
				anchor: "top-left",
			},
			{
				baseFovX: 10,
				widthScale: 1,
				heightScale: 0.7,
				viewZoom: 1,
				anchor: "top-left",
			},
			{
				baseFovX: 10,
				widthScale: 1,
				heightScale: 1,
				viewZoom: 1.5,
				anchor: "top-left",
			},
			{
				baseFovX: 10,
				widthScale: 1,
				heightScale: 1,
				viewZoom: 1,
				anchor: "bottom-right",
			},
		],
	);
}

console.log("✅ CAMERA_FRAMES controller state tests passed!");
