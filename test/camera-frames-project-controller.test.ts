import assert from "node:assert/strict";
import { createProjectController } from "../src/controllers/project-controller.js";
import { buildCameraFramesProjectArchive } from "../src/project-file.js";

function t(key, values = {}) {
	switch (key) {
		case "overlay.importPhaseVerify":
			return "Verify";
		case "overlay.importPhaseExpand":
			return "Expand";
		case "overlay.importPhaseLoad":
			return "Load";
		case "overlay.importPhaseApply":
			return "Apply";
		case "overlay.importTitle":
			return "Import";
		case "overlay.importMessage":
			return "Importing project";
		case "status.projectLoaded":
			return "Project loaded";
		case "status.workingStateRestored":
			return `Working state restored: ${values.name ?? ""}`;
		default:
			return key;
	}
}

function createHarness(overrides = {}) {
	const store = {
		overlay: { value: null },
	};
	const statusEvents = [];
	const applyOpenedProjectCalls = [];
	const projectController = createProjectController({
		store,
		projectInput: null,
		assetController: {
			loadSources: async () => {},
			applyWorkingProjectSceneState: async () => {},
			captureWorkingProjectSceneState: () => ({
				assets: [],
				selectedAssetKeys: [],
				activeAssetKey: "",
			}),
			...(overrides.assetController ?? {}),
		},
		applySavedProjectState: () => {},
		applyOpenedProject: async (...args) => {
			applyOpenedProjectCalls.push(args);
			await overrides.applyOpenedProject?.(...args);
		},
		buildProjectFilename: () => "test-project.ssproj",
		captureProjectState: () => ({
			workspace: {
				activeShotCameraId: "",
				viewport: {
					baseFovX: 55,
					pose: {
						position: { x: 0, y: 0, z: 0 },
						quaternion: { x: 0, y: 0, z: 0, w: 1 },
						up: { x: 0, y: 1, z: 0 },
					},
				},
			},
			shotCameras: [],
			scene: {
				assets: [],
				referenceImages: [],
			},
		}),
		clearHistory: () => {},
		updateUi: () => {},
		setStatus: (status) => {
			statusEvents.push(status);
		},
		t,
	});

	return {
		projectController,
		store,
		statusEvents,
		applyOpenedProjectCalls,
	};
}

{
	const harness = createHarness();
	const brokenProjectFile = new File(
		[new Uint8Array([1, 2, 3, 4])],
		"broken.ssproj",
	);
	await assert.rejects(
		harness.projectController.openProjectSource(brokenProjectFile),
	);
	assert.equal(harness.store.overlay.value, null);
}

{
	const harness = createHarness();
	const projectSnapshot = {
		workspace: {
			activeShotCameraId: "",
			viewport: {
				baseFovX: 55,
				pose: {
					position: { x: 0, y: 0, z: 0 },
					quaternion: { x: 0, y: 0, z: 0, w: 1 },
					up: { x: 0, y: 1, z: 0 },
				},
			},
		},
		shotCameras: [],
		scene: {
			assets: [],
			referenceImages: [],
		},
	};
	const archive = await buildCameraFramesProjectArchive(projectSnapshot);
	const projectFile = new File([archive], "scene.ssproj");
	await harness.projectController.openProjectSource(projectFile);
	assert.equal(harness.store.overlay.value, null);
	assert.equal(harness.applyOpenedProjectCalls.length, 1);
}

console.log("✅ CAMERA_FRAMES project controller tests passed!");
