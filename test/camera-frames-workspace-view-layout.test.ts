import assert from "node:assert/strict";
import {
	WORKSPACE_LAYOUT_SINGLE,
	WORKSPACE_LAYOUT_SPLIT,
	WORKSPACE_PANE_CAMERA,
	WORKSPACE_PANE_CAMERA_ID,
	WORKSPACE_PANE_VIEWPORT,
	WORKSPACE_PANE_VIEWPORT_ID,
	createDefaultWorkspacePanes,
} from "../src/workspace-model.js";
import {
	DEFAULT_WORKSPACE_SPLIT_RATIO,
	WORKSPACE_SPLIT_RATIO_MAX,
	WORKSPACE_SPLIT_RATIO_MIN,
	WORKSPACE_VIEW_LAYOUT_STORAGE_KEY,
	WORKSPACE_VIEW_LAYOUT_VERSION,
	clampWorkspaceSplitRatio,
	createDefaultWorkspaceViewLayout,
	getVisibleWorkspacePaneIds,
	getVisibleWorkspacePanes,
	getWorkspacePaneForRole,
	getWorkspacePaneIdForRole,
	readPersistedWorkspaceViewLayout,
	resolveWorkspaceSplitRatioForSize,
	sanitizeWorkspaceViewLayout,
	writePersistedWorkspaceViewLayout,
} from "../src/app/workspace-view-layout.js";

const defaultLayout = createDefaultWorkspaceViewLayout();
assert.deepEqual(defaultLayout, {
	layout: WORKSPACE_LAYOUT_SINGLE,
	splitRatio: DEFAULT_WORKSPACE_SPLIT_RATIO,
	activePaneId: WORKSPACE_PANE_CAMERA_ID,
});
assert.equal(WORKSPACE_SPLIT_RATIO_MIN, 0.2);
assert.equal(WORKSPACE_SPLIT_RATIO_MAX, 0.8);
assert.equal(WORKSPACE_VIEW_LAYOUT_VERSION, 1);
assert.equal(
	WORKSPACE_VIEW_LAYOUT_STORAGE_KEY,
	"camera-frames.workspaceViewLayout",
);

assert.equal(
	getWorkspacePaneIdForRole(WORKSPACE_PANE_CAMERA),
	WORKSPACE_PANE_CAMERA_ID,
);
assert.equal(
	getWorkspacePaneIdForRole(WORKSPACE_PANE_VIEWPORT),
	WORKSPACE_PANE_VIEWPORT_ID,
);
assert.equal(getWorkspacePaneIdForRole("unknown"), null);

const panes = createDefaultWorkspacePanes();
assert.equal(
	getWorkspacePaneForRole(panes, WORKSPACE_PANE_CAMERA)?.id,
	WORKSPACE_PANE_CAMERA_ID,
);
assert.equal(
	getWorkspacePaneForRole(panes, WORKSPACE_PANE_VIEWPORT)?.id,
	WORKSPACE_PANE_VIEWPORT_ID,
);
assert.equal(getWorkspacePaneForRole(panes, "unknown"), null);

assert.equal(clampWorkspaceSplitRatio(0.1), WORKSPACE_SPLIT_RATIO_MIN);
assert.equal(clampWorkspaceSplitRatio(0.65), 0.65);
assert.equal(clampWorkspaceSplitRatio(0.9), WORKSPACE_SPLIT_RATIO_MAX);
assert.equal(
	clampWorkspaceSplitRatio(Number.NaN),
	DEFAULT_WORKSPACE_SPLIT_RATIO,
);

assert.deepEqual(
	sanitizeWorkspaceViewLayout({
		layout: WORKSPACE_LAYOUT_SINGLE,
		splitRatio: 0.75,
		activePaneId: WORKSPACE_PANE_VIEWPORT_ID,
	}),
	{
		layout: WORKSPACE_LAYOUT_SINGLE,
		splitRatio: 0.75,
		activePaneId: WORKSPACE_PANE_VIEWPORT_ID,
	},
);
assert.deepEqual(
	sanitizeWorkspaceViewLayout({
		layout: "quad",
		splitRatio: 9,
		activePaneId: "missing-pane",
	}),
	{
		layout: WORKSPACE_LAYOUT_SINGLE,
		splitRatio: WORKSPACE_SPLIT_RATIO_MAX,
		activePaneId: WORKSPACE_PANE_CAMERA_ID,
	},
);
assert.equal(
	sanitizeWorkspaceViewLayout({ activePaneId: WORKSPACE_PANE_VIEWPORT })
		.activePaneId,
	WORKSPACE_PANE_VIEWPORT_ID,
);

assert.deepEqual(getVisibleWorkspacePaneIds(defaultLayout), [
	WORKSPACE_PANE_CAMERA_ID,
]);
assert.deepEqual(
	getVisibleWorkspacePaneIds({
		...defaultLayout,
		layout: WORKSPACE_LAYOUT_SPLIT,
	}),
	[WORKSPACE_PANE_CAMERA_ID, WORKSPACE_PANE_VIEWPORT_ID],
);
const viewportOnlyLayout = {
	layout: WORKSPACE_LAYOUT_SINGLE,
	splitRatio: 0.5,
	activePaneId: WORKSPACE_PANE_VIEWPORT_ID,
};
assert.deepEqual(getVisibleWorkspacePaneIds(viewportOnlyLayout), [
	WORKSPACE_PANE_VIEWPORT_ID,
]);
assert.deepEqual(
	getVisibleWorkspacePanes(panes, viewportOnlyLayout).map((pane) => pane.id),
	[WORKSPACE_PANE_VIEWPORT_ID],
);

assert.equal(
	resolveWorkspaceSplitRatioForSize({
		splitRatio: 0.2,
		availableSize: 1000,
		minPaneSize: 300,
	}),
	0.3,
);
assert.equal(
	resolveWorkspaceSplitRatioForSize({
		splitRatio: 0.8,
		availableSize: 1000,
		minPaneSize: 300,
	}),
	0.7,
);
assert.equal(
	resolveWorkspaceSplitRatioForSize({
		splitRatio: 0.75,
		availableSize: 500,
		minPaneSize: 300,
	}),
	DEFAULT_WORKSPACE_SPLIT_RATIO,
);
assert.equal(
	resolveWorkspaceSplitRatioForSize({
		splitRatio: 0.75,
		availableSize: 0,
		minPaneSize: 300,
	}),
	0.75,
);

{
	const memory = new Map<string, string>();
	const storage = {
		getItem: (key: string) => memory.get(key) ?? null,
		setItem: (key: string, value: string) => {
			memory.set(key, value);
		},
		removeItem: (key: string) => {
			memory.delete(key);
		},
	};

	assert.deepEqual(
		readPersistedWorkspaceViewLayout({ storage }),
		defaultLayout,
	);
	writePersistedWorkspaceViewLayout(viewportOnlyLayout, { storage });
	assert.deepEqual(
		JSON.parse(memory.get(WORKSPACE_VIEW_LAYOUT_STORAGE_KEY) ?? "null"),
		{
			version: WORKSPACE_VIEW_LAYOUT_VERSION,
			...viewportOnlyLayout,
		},
	);
	assert.deepEqual(
		readPersistedWorkspaceViewLayout({ storage }),
		viewportOnlyLayout,
	);

	memory.set(WORKSPACE_VIEW_LAYOUT_STORAGE_KEY, "not-json");
	assert.deepEqual(
		readPersistedWorkspaceViewLayout({ storage }),
		defaultLayout,
	);
	memory.set(
		WORKSPACE_VIEW_LAYOUT_STORAGE_KEY,
		JSON.stringify({
			version: WORKSPACE_VIEW_LAYOUT_VERSION + 1,
			...viewportOnlyLayout,
		}),
	);
	assert.deepEqual(
		readPersistedWorkspaceViewLayout({ storage }),
		defaultLayout,
	);

	writePersistedWorkspaceViewLayout(null, { storage });
	assert.equal(memory.has(WORKSPACE_VIEW_LAYOUT_STORAGE_KEY), false);
}

{
	const throwingStorage = {
		getItem() {
			throw new Error("storage unavailable");
		},
		setItem() {
			throw new Error("storage unavailable");
		},
		removeItem() {
			throw new Error("storage unavailable");
		},
	};
	assert.deepEqual(
		readPersistedWorkspaceViewLayout({ storage: throwingStorage }),
		defaultLayout,
	);
	assert.doesNotThrow(() =>
		writePersistedWorkspaceViewLayout(defaultLayout, {
			storage: throwingStorage,
		}),
	);
}

console.log("✅ CAMERA_FRAMES workspace view layout tests passed!");
