import assert from "node:assert/strict";
import { BASE_RENDER_BOX } from "../src/constants.js";
import { createOutputFrameFitStateController } from "../src/controllers/output-frame/fit-state.js";
import { createProjectDirtyStateController } from "../src/controllers/project/dirty-state.js";
import { createCameraFramesStore } from "../src/store.js";

const store = createCameraFramesStore();
const cameraPaneSize = { width: 1600, height: 900 };
const getWorkbenchLayoutState = () => {
	const safeRight = Math.max(1, cameraPaneSize.width - 360);
	return {
		viewportWidth: cameraPaneSize.width,
		viewportHeight: cameraPaneSize.height,
		stackedLayout: false,
		safeWidth: safeRight,
		safeLeft: 0,
		safeRight,
		safeTop: 0,
		safeBottom: cameraPaneSize.height,
		safeHeight: cameraPaneSize.height,
	};
};
const fitState = createOutputFrameFitStateController({
	store,
	getActiveShotCameraDocument: () => store.workspace.activeShotCamera.value,
	getOutputFrameDocumentState: (documentState) =>
		documentState?.outputFrame ?? {},
	getOutputSizeState: () => ({ ...BASE_RENDER_BOX }),
	getViewportSize: () => ({ ...cameraPaneSize }),
	getWorkbenchContainerSize: () => ({ ...cameraPaneSize }),
	getWorkbenchLayoutState,
	isPhoneLikeTouchViewport: () => false,
});
const captureProjectState = () => ({
	workspace: {
		activeShotCameraId: store.workspace.activeShotCameraId.value,
	},
	shotCameras: store.workspace.shotCameras.value,
	scene: {
		assets: [],
		lighting: null,
		referenceImages: null,
	},
	animation: store.animation.document.value,
});
const dirtyState = createProjectDirtyStateController({ captureProjectState });
const shotDocument = store.workspace.activeShotCamera.value;
assert.ok(shotDocument);
const storedViewZoom = shotDocument.outputFrame.viewZoom;
const storedOutputFrame = structuredClone(shotDocument.outputFrame);
const initialDirtySignature = dirtyState.getProjectDirtySignature();
dirtyState.markCurrentProjectClean();

fitState.handleResize();
const widePaneEffectiveViewZoom = store.renderBox.viewZoom.value;
assert.equal(
	widePaneEffectiveViewZoom,
	store.renderBox.autoViewZoom.value?.value,
);
assert.equal(
	widePaneEffectiveViewZoom,
	fitState.getOutputFramePresentationState(shotDocument).viewZoom,
);
assert.notEqual(widePaneEffectiveViewZoom, storedViewZoom);
assert.equal(shotDocument.outputFrame.viewZoom, storedViewZoom);
assert.deepEqual(shotDocument.outputFrame, storedOutputFrame);
assert.equal(dirtyState.getProjectDirtySignature(), initialDirtySignature);
assert.equal(dirtyState.isProjectDirty(), false);

cameraPaneSize.width = 1200;
fitState.handleResize();
const narrowPaneEffectiveViewZoom = store.renderBox.viewZoom.value;
assert.equal(
	narrowPaneEffectiveViewZoom,
	store.renderBox.autoViewZoom.value?.value,
);
assert.equal(
	narrowPaneEffectiveViewZoom,
	fitState.getOutputFramePresentationState(shotDocument).viewZoom,
);
assert.notEqual(narrowPaneEffectiveViewZoom, widePaneEffectiveViewZoom);
assert.equal(shotDocument.outputFrame.viewZoom, storedViewZoom);
assert.deepEqual(shotDocument.outputFrame, storedOutputFrame);
assert.equal(dirtyState.getProjectDirtySignature(), initialDirtySignature);
assert.equal(dirtyState.isProjectDirty(), false);

console.log("✅ CAMERA_FRAMES output frame fit dirty-state tests passed!");
