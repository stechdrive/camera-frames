// Help screenshot capture scenarios.
// Each scenario receives the dev-only `__CF_DOCS__` bridge and drives the app
// into the state illustrated by the matching screenshot in
// docs/help/ja/*.md (frontmatter.screenshots[].scenario).
//
// Scenarios intentionally avoid persisting state. The bridge resets
// annotations / help modal / pie menu between runs by default.

const CF_TEST_PROJECT_PATH = "/.local/cf-test/cf-test.ssproj";

async function loadBase(docs) {
	await docs.loadProject(CF_TEST_PROJECT_PATH);
}

function activateInspectorTab(docs, tabId) {
	const tab = document.querySelector(
		`.workbench-tabs button[role="tab"][aria-label="${tabId}"], .workbench-tabs button[role="tab"][data-tab-id="${tabId}"]`,
	);
	if (tab) tab.click();
}

export const scenarios = {
	// --- Chapter 01: Getting started -------------------------------------
	"startup-empty": async (docs) => {
		await docs.waitForReady();
	},
	"scene-loaded-cf-test": async (docs) => {
		await loadBase(docs);
	},

	// --- Chapter 02: UI layout -------------------------------------------
	"cf-test-loaded-default-layout": async (docs) => {
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
	"cf-test-inspector-tabs": async (docs) => {
		await loadBase(docs);
		activateInspectorTab(docs, "camera");
	},
	"cf-test-pie-menu-open": async (docs) => {
		await loadBase(docs);
		docs.controller?.openViewportPieMenuAtCenter?.();
		await docs.waitForReady();
	},
	"cf-test-splat-edit-active": async (docs) => {
		await loadBase(docs);
		docs.controller?.setSplatEditMode?.(true);
		await docs.waitForReady();
	},

	// --- Chapter 03: Open / Save -----------------------------------------
	"cf-test-file-menu-open": async (docs) => {
		await loadBase(docs);
		document
			.querySelector(".workbench-menu__trigger")
			?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		await docs.waitForReady();
	},
	"cf-test-remote-url-empty": async (docs) => {
		await loadBase(docs);
		document.getElementById("header-url-input")?.focus();
	},
	"cf-test-new-project-confirm": async (docs) => {
		await loadBase(docs);
		docs.controller?.startNewProject?.();
		await docs.waitForReady();
	},

	// --- Chapter 05: Shot Camera -----------------------------------------
	"cf-test-shot-manager": async (docs) => {
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
	"cf-test-shot-properties": async (docs) => {
		await loadBase(docs);
		activateInspectorTab(docs, "camera");
	},
	"cf-test-camera-mode": async (docs) => {
		await loadBase(docs);
		docs.controller?.setMode?.("camera");
		await docs.waitForReady();
	},

	// --- Chapter 06: Output Frame / FRAME --------------------------------
	"cf-test-output-frame-section": async (docs) => {
		await loadBase(docs);
		activateInspectorTab(docs, "camera");
	},
	"cf-test-render-box": async (docs) => {
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
	"cf-test-multiple-frames": async (docs) => {
		await loadBase(docs);
		docs.controller?.setMode?.("camera");
		docs.controller?.createFrame?.();
		await docs.waitForReady();
	},
	"cf-test-trajectory-spline-edit": async (docs) => {
		await loadBase(docs);
		docs.controller?.setMode?.("camera");
		docs.controller?.createFrame?.();
		docs.controller?.setFrameTrajectoryMode?.("spline");
		docs.controller?.setFrameTrajectoryEditMode?.(true);
		await docs.waitForReady();
	},

	// --- Chapter 07: Reference images ------------------------------------
	"cf-test-reference-presets": async (docs) => {
		await loadBase(docs);
		activateInspectorTab(docs, "reference");
	},
	"cf-test-reference-manager": async (docs) => {
		await loadBase(docs);
		activateInspectorTab(docs, "reference");
	},
	"cf-test-reference-edit-mode": async (docs) => {
		await loadBase(docs);
		docs.controller?.toggleViewportReferenceImageEditMode?.();
		await docs.waitForReady();
	},

	// --- Chapter 08: Viewport tools --------------------------------------
	"cf-test-tool-rail": async (docs) => {
		await loadBase(docs);
	},
	"cf-test-pie-menu-hover": async (docs) => {
		await loadBase(docs);
		docs.controller?.openViewportPieMenuAtCenter?.();
		await docs.waitForReady();
	},
	"cf-test-transform-gizmo": async (docs) => {
		await loadBase(docs);
		docs.controller?.setViewportTransformMode?.(true);
		await docs.waitForReady();
	},
	"cf-test-axis-gizmo": async (docs) => {
		await loadBase(docs);
		docs.controller?.setViewportProjectionMode?.("orthographic");
		await docs.waitForReady();
	},
	"cf-test-measurement": async (docs) => {
		await loadBase(docs);
		docs.controller?.setMeasurementMode?.(true);
		await docs.waitForReady();
	},

	// --- Chapter 09: Per-splat edit --------------------------------------
	"cf-test-per-splat-toolbar": async (docs) => {
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
	"cf-test-per-splat-brush": async (docs) => {
		await loadBase(docs);
		docs.controller?.setSplatEditMode?.(true);
		docs.controller?.setSplatEditTool?.("brush");
		await docs.waitForReady();
	},
	"cf-test-per-splat-box": async (docs) => {
		await loadBase(docs);
		docs.controller?.setSplatEditMode?.(true);
		docs.controller?.setSplatEditTool?.("box");
		await docs.waitForReady();
	},

	// --- Chapter 10: Export ----------------------------------------------
	"cf-test-export-output": async (docs) => {
		await loadBase(docs);
		activateInspectorTab(docs, "export");
	},
	"cf-test-export-settings": async (docs) => {
		await loadBase(docs);
		activateInspectorTab(docs, "export");
	},
	"cf-test-export-progress": async (docs) => {
		await loadBase(docs);
		activateInspectorTab(docs, "export");
		// Fire-and-forget to leave the progress overlay visible for capture.
		docs.controller?.downloadOutput?.();
		await new Promise((resolve) => setTimeout(resolve, 500));
	},
};

export default { scenarios };
