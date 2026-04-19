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
	"drop-hint": async (docs) => {
		await docs.waitForReady();
	},
	"first-scene-loaded": async (docs) => {
		await loadBase(docs);
	},

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
	"inspector-tabs": async (docs) => {
		await loadBase(docs);
		activateInspectorTab(docs, "camera");
	},
	"pie-menu": async (docs) => {
		await loadBase(docs);
		docs.controller?.openViewportPieMenuAtCenter?.();
		await docs.waitForReady();
	},
	"splat-edit-toolbar": async (docs) => {
		await loadBase(docs);
		docs.controller?.setSplatEditMode?.(true);
		await docs.waitForReady();
	},

	// --- Chapter 03: Open / Save -----------------------------------------
	"open-menu": async (docs) => {
		await loadBase(docs);
		document
			.querySelector(".workbench-menu__trigger")
			?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		await docs.waitForReady();
	},
	"remote-url-input": async (docs) => {
		await loadBase(docs);
		document.getElementById("header-url-input")?.focus();
	},
	"confirm-new-project": async (docs) => {
		await loadBase(docs);
		docs.controller?.startNewProject?.();
		await docs.waitForReady();
	},

	// --- Chapter 05: Shot Camera -----------------------------------------
	"shot-camera-manager": async (docs) => {
		await loadBase(docs);
		activateInspectorTab(docs, "camera");
		docs.setAnnotations([
			{ n: 1, selector: "#add-shot-camera", label: "追加" },
			{ n: 2, selector: "#duplicate-shot-camera", label: "複製" },
			{ n: 3, selector: "#delete-shot-camera", label: "削除" },
			{
				n: 4,
				selector: ".shot-camera-manager-list",
				label: "shot 一覧",
			},
		]);
	},
	"camera-mode-render-box": async (docs) => {
		await loadBase(docs);
		docs.controller?.setMode?.("camera");
		await docs.waitForReady();
	},

	// --- Chapter 06: Output Frame / FRAME --------------------------------
	"render-box-camera-mode": async (docs) => {
		await loadBase(docs);
		docs.controller?.setMode?.("camera");
		await docs.waitForReady();
		docs.setAnnotations([
			{
				n: 1,
				selector: ".render-box__resize-handle--top-right",
				label: "リサイズハンドル",
			},
			{
				n: 2,
				selector: ".render-box__pan-edge--top",
				label: "パンエッジ",
			},
			{ n: 3, selector: "#anchor-dot", label: "anchor dot" },
			{ n: 4, selector: "#render-box-meta", label: "meta ラベル" },
		]);
	},
	"multiple-frames": async (docs) => {
		await loadBase(docs);
		docs.controller?.setMode?.("camera");
		docs.controller?.createFrame?.();
		await docs.waitForReady();
	},
	"trajectory-spline": async (docs) => {
		await loadBase(docs);
		docs.controller?.setMode?.("camera");
		docs.controller?.createFrame?.();
		docs.controller?.setFrameTrajectoryMode?.("spline");
		docs.controller?.setFrameTrajectoryEditMode?.(true);
		await docs.waitForReady();
	},

	// --- Chapter 07: Reference images ------------------------------------
	"reference-edit-mode": async (docs) => {
		await loadBase(docs);
		docs.controller?.toggleViewportReferenceImageEditMode?.();
		await docs.waitForReady();
	},

	// --- Chapter 08: Viewport tools --------------------------------------
	"tool-rail": async (docs) => {
		await loadBase(docs);
	},
	"pie-menu-expanded": async (docs) => {
		await loadBase(docs);
		docs.controller?.openViewportPieMenuAtCenter?.();
		await docs.waitForReady();
	},
	"transform-gizmo": async (docs) => {
		await loadBase(docs);
		docs.controller?.setViewportTransformMode?.(true);
		await docs.waitForReady();
	},
	"axis-gizmo": async (docs) => {
		await loadBase(docs);
		docs.controller?.setViewportProjectionMode?.("orthographic");
		await docs.waitForReady();
	},
	"measurement-overlay": async (docs) => {
		await loadBase(docs);
		docs.controller?.setMeasurementMode?.(true);
		await docs.waitForReady();
	},

	// --- Chapter 09: Per-splat edit --------------------------------------
	"per-splat-edit-toolbar": async (docs) => {
		await loadBase(docs);
		docs.controller?.setSplatEditMode?.(true);
		await docs.waitForReady();
		docs.setAnnotations([
			{
				n: 1,
				selector: ".viewport-splat-edit-toolbar__group:nth-of-type(1)",
				label: "Tool 選択",
			},
			{
				n: 2,
				selector: ".viewport-splat-edit-toolbar__group:nth-of-type(2)",
				label: "選択操作",
			},
			{
				n: 3,
				selector: ".viewport-splat-edit-toolbar__group:nth-of-type(3)",
				label: "編集アクション",
			},
			{
				n: 4,
				selector: ".viewport-splat-edit-toolbar__info",
				label: "選択数",
			},
		]);
	},
	"per-splat-brush-preview": async (docs) => {
		await loadBase(docs);
		docs.controller?.setSplatEditMode?.(true);
		docs.controller?.setSplatEditTool?.("brush");
		await docs.waitForReady();
	},
	"per-splat-box-tool": async (docs) => {
		await loadBase(docs);
		docs.controller?.setSplatEditMode?.(true);
		docs.controller?.setSplatEditTool?.("box");
		await docs.waitForReady();
	},

	// --- Chapter 10: Export ----------------------------------------------
	"export-output-section": async (docs) => {
		await loadBase(docs);
		activateInspectorTab(docs, "export");
	},
	"export-progress": async (docs) => {
		await loadBase(docs);
		activateInspectorTab(docs, "export");
		// Fire-and-forget to leave the progress overlay visible for capture.
		docs.controller?.downloadOutput?.();
		await new Promise((resolve) => setTimeout(resolve, 500));
	},
};

export default { scenarios };
