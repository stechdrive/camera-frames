import assert from "node:assert/strict";
import { DEFAULT_CAMERA_FAR, DEFAULT_CAMERA_NEAR } from "../src/constants.js";
import { DEFAULT_SHOT_CAMERA_BASE_FOVX } from "../src/engine/camera-lens.js";
import {
	WORKSPACE_PANE_CAMERA,
	WORKSPACE_PANE_VIEWPORT,
	createDefaultShotCameraDocuments,
	createDefaultWorkspacePanes,
	createFrameDocument,
	createShotCameraDocument,
	getActiveFrameDocument,
	getActiveShotCameraDocument,
	getActiveWorkspacePane,
	getFrameDisplayLabel,
	getFrameDocumentId,
	getNextFrameNumber,
	getNextShotCameraNumber,
	getShotCameraDocumentId,
	getWorkspaceModeLabelKey,
	sanitizeFrameName,
	setSinglePaneRole,
} from "../src/workspace-model.js";

const panes = createDefaultWorkspacePanes();
assert.equal(panes.length, 1);
assert.equal(panes[0].role, WORKSPACE_PANE_CAMERA);
assert.equal(getWorkspaceModeLabelKey(panes[0]), "mode.camera");

const viewportPanes = setSinglePaneRole(panes, WORKSPACE_PANE_VIEWPORT);
assert.equal(viewportPanes[0].role, WORKSPACE_PANE_VIEWPORT);
assert.equal(
	getActiveWorkspacePane(viewportPanes, "pane-main")?.role,
	WORKSPACE_PANE_VIEWPORT,
);

const shotCameras = createDefaultShotCameraDocuments();
assert.equal(shotCameras.length, 1);
assert.equal(shotCameras[0].id, "shot-camera-1");
assert.equal(shotCameras[0].lens.baseFovX, DEFAULT_SHOT_CAMERA_BASE_FOVX);
assert.equal(shotCameras[0].clipping.mode, "auto");
assert.equal(shotCameras[0].clipping.near, DEFAULT_CAMERA_NEAR);
assert.equal(shotCameras[0].clipping.far, DEFAULT_CAMERA_FAR);
assert.equal(shotCameras[0].outputFrame.anchor, "center");
assert.equal(shotCameras[0].outputFrame.viewZoom, 1);
assert.equal(shotCameras[0].outputFrame.centerX, 0.5);
assert.equal(shotCameras[0].outputFrame.centerY, 0.5);
assert.equal(shotCameras[0].outputFrame.viewportCenterX, 0.5);
assert.equal(shotCameras[0].outputFrame.viewportCenterY, 0.5);
assert.equal(shotCameras[0].outputFrame.viewportCenterAuto, true);
assert.equal(shotCameras[0].outputFrame.fitScale, 0);
assert.equal(shotCameras[0].outputFrame.fitViewportWidth, 0);
assert.equal(shotCameras[0].outputFrame.fitViewportHeight, 0);
assert.equal(shotCameras[0].exportSettings.exportName, "cf-%cam");
assert.equal(shotCameras[0].exportSettings.exportFormat, "psd");
assert.equal(shotCameras[0].exportSettings.exportGridOverlay, true);
assert.equal(shotCameras[0].exportSettings.exportGridLayerMode, "bottom");
assert.equal(shotCameras[0].exportSettings.exportModelLayers, true);
assert.equal(shotCameras[0].exportSettings.exportSplatLayers, true);
assert.equal(shotCameras[0].frameMask.mode, "off");
assert.equal(shotCameras[0].frameMask.opacityPct, 80);
assert.deepEqual(shotCameras[0].frameMask.selectedIds, []);
assert.equal(shotCameras[0].navigation.rollLock, false);
assert.equal(shotCameras[0].frames.length, 1);
assert.equal(shotCameras[0].activeFrameId, "frame-1");
assert.equal(shotCameras[0].frames[0].name, "FRAME A");
assert.equal(shotCameras[0].frames[0].scale, 1);
assert.equal(shotCameras[0].frames[0].x, 0.5);
assert.equal(shotCameras[0].frames[0].y, 0.5);
assert.deepEqual(shotCameras[0].frames[0].anchor, { x: 0.5, y: 0.5 });
assert.equal(
	getActiveShotCameraDocument(shotCameras, "shot-camera-1")?.id,
	"shot-camera-1",
);

const nextShotNumber = getNextShotCameraNumber(shotCameras);
assert.equal(nextShotNumber, 2);
assert.equal(getFrameDisplayLabel(1), "A");
assert.equal(getFrameDisplayLabel(20), "T");

const duplicatedShotCamera = createShotCameraDocument({
	id: getShotCameraDocumentId(nextShotNumber),
	name: "Camera 2",
	source: shotCameras[0],
});
assert.equal(duplicatedShotCamera.id, "shot-camera-2");
assert.equal(duplicatedShotCamera.name, "Camera 2");
assert.equal(duplicatedShotCamera.outputFrame.anchor, "center");
assert.equal(duplicatedShotCamera.outputFrame.viewportCenterAuto, true);
assert.equal(duplicatedShotCamera.exportSettings.exportFormat, "psd");
assert.equal(duplicatedShotCamera.exportSettings.exportGridOverlay, true);
assert.equal(duplicatedShotCamera.exportSettings.exportGridLayerMode, "bottom");
assert.equal(duplicatedShotCamera.exportSettings.exportModelLayers, true);
assert.equal(duplicatedShotCamera.exportSettings.exportSplatLayers, true);
assert.equal(duplicatedShotCamera.frameMask.mode, "off");
assert.equal(duplicatedShotCamera.frameMask.opacityPct, 80);
assert.deepEqual(duplicatedShotCamera.frameMask.selectedIds, []);
assert.equal(duplicatedShotCamera.navigation.rollLock, false);
assert.notEqual(duplicatedShotCamera.outputFrame, shotCameras[0].outputFrame);
assert.notEqual(
	duplicatedShotCamera.exportSettings,
	shotCameras[0].exportSettings,
);
assert.notEqual(duplicatedShotCamera.frameMask, shotCameras[0].frameMask);
assert.notEqual(duplicatedShotCamera.navigation, shotCameras[0].navigation);
assert.notEqual(duplicatedShotCamera.frames, shotCameras[0].frames);
assert.equal(duplicatedShotCamera.frames[0].id, "frame-1");
assert.deepEqual(duplicatedShotCamera.frames[0].anchor, { x: 0.5, y: 0.5 });
assert.notEqual(
	duplicatedShotCamera.frames[0].anchor,
	shotCameras[0].frames[0].anchor,
);

const nextFrameNumber = getNextFrameNumber(shotCameras[0].frames);
assert.equal(nextFrameNumber, 2);

const duplicatedFrame = createFrameDocument({
	id: getFrameDocumentId(nextFrameNumber),
	name: "FRAME B",
	source: shotCameras[0].frames[0],
});
assert.equal(duplicatedFrame.id, "frame-2");
assert.equal(duplicatedFrame.name, "FRAME B");
assert.equal(duplicatedFrame.scale, shotCameras[0].frames[0].scale);
assert.deepEqual(duplicatedFrame.anchor, { x: 0.5, y: 0.5 });
assert.notEqual(duplicatedFrame.anchor, shotCameras[0].frames[0].anchor);
assert.equal(
	getActiveFrameDocument(shotCameras[0].frames, shotCameras[0].activeFrameId)
		?.id,
	"frame-1",
);

assert.equal(
	sanitizeFrameName("  Frame\t\tName \n 01  ", "FRAME A"),
	"Frame Name 01",
);
assert.equal(sanitizeFrameName("", "FRAME A"), "FRAME A");
assert.equal(sanitizeFrameName(`${"A".repeat(80)}`, "FRAME A").length, 64);

const sanitizedFrame = createFrameDocument({
	id: getFrameDocumentId(3),
	name: "  Frame\t\nName  ",
	source: shotCameras[0].frames[0],
});
assert.equal(sanitizedFrame.name, "Frame Name");

const sanitizedShotCamera = createShotCameraDocument({
	id: getShotCameraDocumentId(3),
	name: "Camera 3",
	source: {
		...shotCameras[0],
		frames: [
			{
				...shotCameras[0].frames[0],
				id: getFrameDocumentId(1),
				name: "  Odd\t\nFrame  Name  ",
			},
		],
	},
});
assert.equal(sanitizedShotCamera.frames[0].name, "Odd Frame Name");

console.log("✅ CAMERA_FRAMES workspace model tests passed!");
