import assert from "node:assert/strict";
import { createUiSyncController } from "../src/controllers/ui-sync-controller.js";

function createDropHint() {
	const classes = new Set();
	return {
		classList: {
			toggle(token, force) {
				if (force) {
					classes.add(token);
					return true;
				}
				classes.delete(token);
				return false;
			},
		},
		has(token) {
			return classes.has(token);
		},
	};
}

function createHarness({ totalLoadedItems = 0, referenceImageCount = 0 } = {}) {
	const dropHint = createDropHint();
	const controller = createUiSyncController({
		store: {
			referenceImages: {
				items: {
					value: Array.from({ length: referenceImageCount }, (_, index) => ({
						id: `reference-item-${index}`,
					})),
				},
			},
			sceneBadge: { value: "" },
			sceneSummary: { value: "" },
			sceneScaleSummary: { value: "" },
			selectedSceneAssetIds: { value: [] },
			selectedSceneAssetId: { value: null },
			sceneAssets: { value: [] },
			cameraSummary: { value: "" },
			shotCamera: {
				clippingMode: { value: "auto" },
				positionX: { value: 0 },
				positionY: { value: 0 },
				positionZ: { value: 0 },
				yawDeg: { value: 0 },
				pitchDeg: { value: 0 },
				rollDeg: { value: 0 },
			},
		},
		state: {
			lastCameraSummary: "",
			lastSceneSummary: "",
			lastSceneScaleSummary: "",
			mode: "viewport",
			interactionMode: "select",
			outputFrameSelected: false,
			baseFovX: 55,
		},
		sceneState: { assets: [] },
		viewportShell: { classList: { toggle() {} } },
		renderBox: { classList: { toggle() {} } },
		dropHint,
		fpsMovement: { moveSpeed: 1 },
		currentLocale: () => "en",
		t: (key) => key,
		syncActiveShotCameraFromDocument: () => {},
		isZoomToolActive: () => false,
		updateOutputFrameOverlay: () => {},
		getSceneAssetCounts: () => ({ totalCount: 0 }),
		getSceneBounds: () => null,
		getTotalLoadedItems: () => totalLoadedItems,
		getActiveShotCamera: () => ({
			near: 0.1,
		}),
		getActiveCamera: () => ({
			position: { x: 0, y: 0, z: 0 },
			near: 0.1,
			far: 1000,
			getWorldDirection() {
				return { x: 0, y: 0, z: -1 };
			},
		}),
		getProjectionState: () => ({
			targetFrustum: {
				width: 1,
				height: 1,
			},
		}),
		getShotCameraPoseAngles: () => ({
			yawDeg: 0,
			pitchDeg: 0,
			rollDeg: 0,
		}),
		getActiveShotCameraDocument: () => ({
			name: "Camera A",
		}),
	});
	return { controller, dropHint };
}

{
	const { controller, dropHint } = createHarness();
	controller.updateDropHint();
	assert.equal(dropHint.has("is-hidden"), false);
}

{
	const { controller, dropHint } = createHarness({
		referenceImageCount: 1,
	});
	controller.updateDropHint();
	assert.equal(dropHint.has("is-hidden"), true);
}

{
	const { controller, dropHint } = createHarness({
		totalLoadedItems: 1,
	});
	controller.updateDropHint();
	assert.equal(dropHint.has("is-hidden"), true);
}

console.log("✅ CAMERA_FRAMES ui sync controller tests passed!");
