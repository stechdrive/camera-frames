import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createWorkspaceViewLayoutCommands } from "../src/app/workspace-view-layout-commands.js";
import {
	WORKSPACE_LAYOUT_SINGLE,
	WORKSPACE_LAYOUT_SPLIT,
	WORKSPACE_PANE_CAMERA_ID,
	WORKSPACE_PANE_VIEWPORT_ID,
	createDefaultWorkspacePanes,
} from "../src/workspace-model.js";

function signal(value) {
	return { value };
}

function createHarness() {
	const panes = createDefaultWorkspacePanes();
	const store = {
		workspace: {
			layout: signal(WORKSPACE_LAYOUT_SINGLE),
			splitRatio: signal(0.5),
			activePaneId: signal(WORKSPACE_PANE_CAMERA_ID),
			panes: signal(panes),
		},
	};
	const calls = [];
	const paneElements = new Map([
		[
			WORKSPACE_PANE_CAMERA_ID,
			{
				getBoundingClientRect: () => ({
					left: 0,
					top: 0,
					right: 400,
					bottom: 600,
					width: 400,
					height: 600,
				}),
			},
		],
		[
			WORKSPACE_PANE_VIEWPORT_ID,
			{
				getBoundingClientRect: () => ({
					left: 408,
					top: 0,
					right: 800,
					bottom: 600,
					width: 392,
					height: 600,
				}),
			},
		],
	]);
	const cameraController = {
		setMode(role, options) {
			const pane = panes.find((candidate) => candidate.role === role);
			if (!pane || pane.id === store.workspace.activePaneId.value) {
				return false;
			}
			store.workspace.activePaneId.value = pane.id;
			calls.push(["mode", role, options]);
			return true;
		},
	};
	const commands = createWorkspaceViewLayoutCommands({
		store,
		getCameraController: () => cameraController,
		getWorkspacePaneElement: (paneId) => paneElements.get(paneId),
		clearWorkspaceInteractions: () => calls.push(["clear"]),
		clearSecondaryRenderers: () => calls.push(["secondary-clear"]),
		focusWorkspaceSurface: () => calls.push(["focus"]),
		updateUi: (options) => calls.push(["ui", options]),
		setStatus: (message) => calls.push(["status", message]),
		t: (key, params) => (params?.name ? `${key}:${params.name}` : key),
	});
	return { calls, commands, paneElements, store };
}

{
	// A hidden camera pane stays measurable so the legacy single-Viewport
	// reference preview can use output-frame geometry. It must not steal pointer
	// activation from the only visible pane when both DOM rects overlap.
	const { commands, paneElements, store } = createHarness();
	store.workspace.activePaneId.value = WORKSPACE_PANE_VIEWPORT_ID;
	for (const paneId of [WORKSPACE_PANE_CAMERA_ID, WORKSPACE_PANE_VIEWPORT_ID]) {
		paneElements.set(paneId, {
			getBoundingClientRect: () => ({
				left: 0,
				top: 0,
				right: 800,
				bottom: 600,
				width: 800,
				height: 600,
			}),
		});
	}
	assert.equal(
		commands.activateWorkspacePaneAtPointer({
			clientX: 200,
			clientY: 300,
			target: { closest: () => null },
		}),
		false,
	);
	assert.equal(store.workspace.activePaneId.value, WORKSPACE_PANE_VIEWPORT_ID);
}

{
	const { calls, commands, store } = createHarness();
	assert.equal(commands.showDualWorkspace(), true);
	assert.equal(store.workspace.layout.value, WORKSPACE_LAYOUT_SPLIT);
	assert.equal(
		commands.activateWorkspacePane(WORKSPACE_PANE_VIEWPORT_ID),
		true,
	);
	assert.equal(store.workspace.activePaneId.value, WORKSPACE_PANE_VIEWPORT_ID);
	assert.equal(commands.closeWorkspacePane(WORKSPACE_PANE_VIEWPORT_ID), true);
	assert.equal(store.workspace.layout.value, WORKSPACE_LAYOUT_SINGLE);
	assert.equal(store.workspace.activePaneId.value, WORKSPACE_PANE_CAMERA_ID);
	assert.equal(calls.filter(([name]) => name === "secondary-clear").length, 1);
	assert.equal(calls.filter(([name]) => name === "focus").length, 2);
	assert.ok(
		calls
			.filter(([name]) => name === "ui")
			.every(([, options]) => options?.syncProjectPresentation === false),
	);
}

{
	const { calls, commands } = createHarness();
	commands.resetToSingleWorkspace();
	assert.equal(calls.filter(([name]) => name === "secondary-clear").length, 1);
}

{
	const { commands, store } = createHarness();
	commands.showDualWorkspace();
	assert.equal(
		commands.activateWorkspacePaneAtPointer({
			clientX: 700,
			clientY: 300,
			target: { closest: () => null },
		}),
		true,
	);
	assert.equal(store.workspace.activePaneId.value, WORKSPACE_PANE_VIEWPORT_ID);
	assert.equal(
		commands.activateWorkspacePaneAtPointer({
			clientX: 200,
			clientY: 300,
			target: { closest: () => ({ className: "workspace-splitter" }) },
		}),
		false,
	);
}

{
	const { commands, store } = createHarness();
	assert.equal(
		commands.setWorkspaceSplitRatio(0.1, {
			orientation: "horizontal",
			width: 1000,
		}),
		true,
	);
	assert.ok(store.workspace.splitRatio.value > 0.2);
	assert.ok(store.workspace.splitRatio.value < 0.21);
	assert.equal(
		commands.setWorkspaceSplitRatio(0.2, {
			orientation: "horizontal",
			width: 600,
		}),
		true,
	);
	assert.ok(store.workspace.splitRatio.value > 0.26);
}

{
	// Layout-only UI updates must keep their options at the composition boundary;
	// otherwise a pane resize can expose harmless runtime camera float drift as dirty.
	const controllerSource = readFileSync(
		new URL("../src/controller.js", import.meta.url),
		"utf8",
	);
	const bindingStart = controllerSource.indexOf(
		"workspaceViewLayoutCommands = createWorkspaceViewLayoutCommands({",
	);
	const bindingEnd = controllerSource.indexOf("\n\t});", bindingStart);
	assert.ok(bindingStart >= 0 && bindingEnd > bindingStart);
	const bindingSource = controllerSource.slice(bindingStart, bindingEnd);
	assert.match(bindingSource, /\n\t\tupdateUi,\r?\n/);
}

console.log("✅ CAMERA_FRAMES workspace view layout commands tests passed!");
