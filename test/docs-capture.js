// Help screenshot capture scenarios.
// Each key is the image id referenced by the chapter Markdown's
// `![...](../assets/screenshots/ja/<id>.png)` links, and matches the
// `screenshots[].id` / `screenshots[].scenario` field in the chapter
// frontmatter. The capture pipeline saves with the key as filename.
//
// Scenarios intentionally avoid persisting state. The bridge resets
// annotations / help modal / pie menu / overlay between runs by default,
// and loadProject auto-dismisses the "replace current project?" prompt.

const CF_TEST_PROJECT_PATH = "/.local/cf-test/cf-test2.ssproj";

async function loadBase(docs) {
	await docs.loadProject(CF_TEST_PROJECT_PATH);
}

const INSPECTOR_TAB_INDEX = {
	scene: 0,
	camera: 1,
	reference: 2,
	export: 3,
};

function activateInspectorTab(_docs, tabId) {
	const index = INSPECTOR_TAB_INDEX[tabId];
	if (!Number.isInteger(index)) return;
	const tabs = document.querySelectorAll(
		'.workbench-tabs button[role="tab"]',
	);
	const tab = tabs[index];
	if (tab && tab.getAttribute("aria-selected") !== "true") {
		tab.click();
	}
}

export const scenarios = {
	// --- Chapter 01: Getting started -------------------------------------
	// --- Chapter 02: UI layout -------------------------------------------
	"app-layout-overview": async (docs) => {
		await loadBase(docs);
		docs.setAnnotations([
			{ n: 1, selector: "#viewport", label: "Viewport" },
			{
				n: 2,
				selector: ".workbench-card--tool-rail",
				label: "Tool Rail",
			},
			{
				n: 3,
				selector: ".workbench-card--inspector",
				label: "Inspector",
			},
			{
				n: 4,
				selector: ".viewport-project-status",
				label: "Project Status HUD",
			},
		]);
	},

	// --- Chapter 05: Shot Camera -----------------------------------------

	// --- Chapter 06: Output Frame / FRAME --------------------------------
	"trajectory-spline": async (docs) => {
		await loadBase(docs);
		docs.controller?.setMode?.("camera");
		docs.controller?.createFrame?.();
		docs.controller?.setFrameTrajectoryMode?.("spline");
		docs.controller?.setFrameTrajectoryEditMode?.(true);
		await docs.waitForReady();
	},

	// --- Chapter 07: Reference images ------------------------------------

	// --- Chapter 08: Viewport tools --------------------------------------
	"transform-gizmo": async (docs) => {
		await loadBase(docs);
		docs.controller?.setViewportTransformMode?.(true);
		await docs.waitForReady();
	},

	// --- Chapter 09: Per-splat edit --------------------------------------
	// --- Chapter 10: Export ----------------------------------------------
};

export default { scenarios };
