import assert from "node:assert/strict";
import {
	buildReferenceImageMultiSelectionInspectorSignature,
	buildReferenceImageMultiSelectionInspectorState,
	captureReferenceImageMultiSelectionBaseline,
} from "../src/controllers/reference-image/inspector-state.js";

const baseItems = [
	{
		id: "item-a",
		opacity: 0.5,
		scalePct: 100,
		offsetPx: { x: 10, y: 20 },
		rotationDeg: 0,
		anchor: { ax: 0.5, ay: 0.5 },
	},
	{
		id: "item-b",
		opacity: 0.5,
		scalePct: 100,
		offsetPx: { x: -5, y: 8 },
		rotationDeg: 0,
		anchor: { ax: 0.5, ay: 0.5 },
	},
];

{
	const baselineItems = captureReferenceImageMultiSelectionBaseline(baseItems);
	const inspectorState = buildReferenceImageMultiSelectionInspectorState({
		selectedItems: [
			{
				...baseItems[0],
				scalePct: 125,
				offsetPx: { x: 14, y: 18 },
				rotationDeg: 30,
			},
			{
				...baseItems[1],
				scalePct: 125,
				offsetPx: { x: -1, y: 6 },
				rotationDeg: 30,
			},
		],
		baselineItems,
		session: { id: "session-a" },
	});

	assert.deepEqual(inspectorState, {
		selectionCount: 2,
		session: { id: "session-a" },
		sharedOpacityPercent: 50,
		averageOpacityPercent: 50,
		scaleDeltaPercent: 25,
		offsetXDelta: 4,
		offsetYDelta: -2,
		rotationDeltaDeg: 30,
	});
}

{
	const baselineItems = captureReferenceImageMultiSelectionBaseline(baseItems);
	const inspectorState = buildReferenceImageMultiSelectionInspectorState({
		selectedItems: [
			{
				...baseItems[0],
				rotationDeg: 190,
			},
			{
				...baseItems[1],
				rotationDeg: 190,
			},
		],
		baselineItems,
	});

	assert.equal(inspectorState.rotationDeltaDeg, -170);
}

{
	const baseSignature = buildReferenceImageMultiSelectionInspectorSignature({
		selectedItemIds: ["item-a", "item-b"],
		selectedItems: baseItems,
		selectionAnchor: { x: 0.2, y: 0.8 },
		selectionBoxLogical: {
			left: 10,
			top: 20,
			width: 100,
			height: 40,
			rotationDeg: 15,
			anchorX: 0.2,
			anchorY: 0.8,
		},
	});
	const movedAnchorSignature =
		buildReferenceImageMultiSelectionInspectorSignature({
			selectedItemIds: ["item-a", "item-b"],
			selectedItems: baseItems,
			selectionAnchor: { x: 0.7, y: 0.3 },
			selectionBoxLogical: {
				left: 10,
				top: 20,
				width: 100,
				height: 40,
				rotationDeg: 15,
				anchorX: 0.7,
				anchorY: 0.3,
			},
		});

	assert.notEqual(baseSignature, movedAnchorSignature);
}

console.log("✅ CAMERA_FRAMES reference image inspector state tests passed!");
