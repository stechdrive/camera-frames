import assert from "node:assert/strict";
import { createDefaultAnimationDocument } from "../src/animation/animation-model.js";
import { createProjectDirtyStateController } from "../src/controllers/project/dirty-state.js";
import { createDefaultShotCameraDocuments } from "../src/workspace-model.js";

const observedQuaternionX = -0.07530506817916678;
const state = {
	shotQuaternionX: observedQuaternionX,
	viewportPositionX: 1,
	outputFrameWidthScale: 1,
};
const baseShotCamera = createDefaultShotCameraDocuments()[0];

function createPose({ positionX = 0, quaternionX = 0 } = {}) {
	return {
		position: { x: positionX, y: 2, z: 3 },
		quaternion: { x: quaternionX, y: 0, z: 0, w: 1 },
		up: { x: 0, y: 1, z: 0 },
	};
}

function captureProjectState() {
	const shotCamera = structuredClone(baseShotCamera);
	shotCamera.outputFrame.widthScale = state.outputFrameWidthScale;
	return {
		workspace: {
			activeShotCameraId: shotCamera.id,
			viewport: {
				baseFovX: 60,
				baseFovXDirty: false,
				pose: createPose({ positionX: state.viewportPositionX }),
			},
		},
		shotCameras: [
			{
				...shotCamera,
				pose: createPose({ quaternionX: state.shotQuaternionX }),
			},
		],
		scene: {
			assets: [],
			lighting: null,
			referenceImages: null,
		},
		animation: createDefaultAnimationDocument(),
	};
}

const dirtyState = createProjectDirtyStateController({
	captureProjectState,
	getCurrentPackageFingerprint: () => "package-fingerprint",
});

dirtyState.markCurrentProjectClean();
dirtyState.markCurrentPackageClean();
state.shotQuaternionX = -0.07530506817916655;
assert.equal(dirtyState.isProjectDirty(), false);
assert.equal(dirtyState.isPackageDirty(), false);

state.shotQuaternionX = observedQuaternionX + 1e-8;
assert.equal(dirtyState.isProjectDirty(), true);

state.shotQuaternionX = observedQuaternionX;
dirtyState.markCurrentProjectClean();
state.viewportPositionX = 1.0000000000000002;
assert.equal(dirtyState.isProjectDirty(), false);

state.viewportPositionX = 1;
dirtyState.markCurrentProjectClean();
state.outputFrameWidthScale += 1e-8;
assert.equal(dirtyState.isProjectDirty(), true);

console.log("✅ CAMERA_FRAMES project dirty-state tests passed!");
