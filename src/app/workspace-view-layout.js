import {
	WORKSPACE_LAYOUT_SINGLE,
	WORKSPACE_LAYOUT_SPLIT,
	WORKSPACE_PANE_CAMERA,
	WORKSPACE_PANE_CAMERA_ID,
	WORKSPACE_PANE_VIEWPORT,
	WORKSPACE_PANE_VIEWPORT_ID,
} from "../workspace-model.js";

export const WORKSPACE_VIEW_LAYOUT_STORAGE_KEY =
	"camera-frames.workspaceViewLayout";
export const WORKSPACE_VIEW_LAYOUT_VERSION = 1;
export const DEFAULT_WORKSPACE_SPLIT_RATIO = 0.5;
export const WORKSPACE_SPLIT_RATIO_MIN = 0.2;
export const WORKSPACE_SPLIT_RATIO_MAX = 0.8;
export const WORKSPACE_SPLITTER_SIZE_PX = 8;
export const WORKSPACE_MIN_PANE_SIZE_PX = 200;

export function createDefaultWorkspaceViewLayout() {
	return {
		layout: WORKSPACE_LAYOUT_SINGLE,
		splitRatio: DEFAULT_WORKSPACE_SPLIT_RATIO,
		activePaneId: WORKSPACE_PANE_CAMERA_ID,
	};
}

export function getWorkspacePaneIdForRole(role) {
	if (role === WORKSPACE_PANE_CAMERA) {
		return WORKSPACE_PANE_CAMERA_ID;
	}
	if (role === WORKSPACE_PANE_VIEWPORT) {
		return WORKSPACE_PANE_VIEWPORT_ID;
	}
	return null;
}

export function getWorkspacePaneForRole(panes, role) {
	const paneId = getWorkspacePaneIdForRole(role);
	if (!paneId || !Array.isArray(panes)) {
		return null;
	}
	return (
		panes.find((pane) => pane?.id === paneId) ??
		panes.find((pane) => pane?.role === role) ??
		null
	);
}

export function clampWorkspaceSplitRatio(raw) {
	const numeric = Number(raw);
	if (!Number.isFinite(numeric)) {
		return DEFAULT_WORKSPACE_SPLIT_RATIO;
	}
	return Math.min(
		WORKSPACE_SPLIT_RATIO_MAX,
		Math.max(WORKSPACE_SPLIT_RATIO_MIN, numeric),
	);
}

export function resolveWorkspaceSplitRatioForSize({
	splitRatio,
	availableSize,
	minPaneSize = 0,
} = {}) {
	const storedRatio = clampWorkspaceSplitRatio(splitRatio);
	const size = Number(availableSize);
	const minimum = Math.max(0, Number(minPaneSize) || 0);
	if (!Number.isFinite(size) || size <= 0 || minimum <= 0) {
		return storedRatio;
	}
	if (minimum * 2 >= size) {
		return DEFAULT_WORKSPACE_SPLIT_RATIO;
	}

	const minimumRatio = Math.max(WORKSPACE_SPLIT_RATIO_MIN, minimum / size);
	const maximumRatio = Math.min(WORKSPACE_SPLIT_RATIO_MAX, 1 - minimum / size);
	return Math.min(maximumRatio, Math.max(minimumRatio, storedRatio));
}

function sanitizeActivePaneId(value) {
	if (
		value === WORKSPACE_PANE_CAMERA_ID ||
		value === WORKSPACE_PANE_VIEWPORT_ID
	) {
		return value;
	}
	return getWorkspacePaneIdForRole(value) ?? WORKSPACE_PANE_CAMERA_ID;
}

export function sanitizeWorkspaceViewLayout(value) {
	const defaults = createDefaultWorkspaceViewLayout();
	return {
		layout:
			value?.layout === WORKSPACE_LAYOUT_SINGLE ||
			value?.layout === WORKSPACE_LAYOUT_SPLIT
				? value.layout
				: defaults.layout,
		splitRatio: clampWorkspaceSplitRatio(value?.splitRatio),
		activePaneId: sanitizeActivePaneId(value?.activePaneId),
	};
}

export function getVisibleWorkspacePaneIds(value) {
	const layout = sanitizeWorkspaceViewLayout(value);
	return layout.layout === WORKSPACE_LAYOUT_SINGLE
		? [layout.activePaneId]
		: [WORKSPACE_PANE_CAMERA_ID, WORKSPACE_PANE_VIEWPORT_ID];
}

export function getVisibleWorkspacePanes(panes, value) {
	if (!Array.isArray(panes)) {
		return [];
	}
	const visiblePaneIds = new Set(getVisibleWorkspacePaneIds(value));
	return panes.filter((pane) => visiblePaneIds.has(pane?.id));
}

export function readPersistedWorkspaceViewLayout({ storage } = {}) {
	const store = storage ?? getDefaultStorage();
	if (!store) {
		return createDefaultWorkspaceViewLayout();
	}
	try {
		const rawValue = store.getItem(WORKSPACE_VIEW_LAYOUT_STORAGE_KEY);
		if (!rawValue) {
			return createDefaultWorkspaceViewLayout();
		}
		const parsed = JSON.parse(rawValue);
		if (parsed?.version !== WORKSPACE_VIEW_LAYOUT_VERSION) {
			return createDefaultWorkspaceViewLayout();
		}
		return sanitizeWorkspaceViewLayout(parsed);
	} catch {
		return createDefaultWorkspaceViewLayout();
	}
}

export function writePersistedWorkspaceViewLayout(value, { storage } = {}) {
	const store = storage ?? getDefaultStorage();
	if (!store) {
		return;
	}
	try {
		if (value === null || value === undefined) {
			store.removeItem(WORKSPACE_VIEW_LAYOUT_STORAGE_KEY);
			return;
		}
		const payload = {
			version: WORKSPACE_VIEW_LAYOUT_VERSION,
			...sanitizeWorkspaceViewLayout(value),
		};
		store.setItem(WORKSPACE_VIEW_LAYOUT_STORAGE_KEY, JSON.stringify(payload));
	} catch {
		// localStorage may be unavailable or full. View layout remains usable for
		// the current session and falls back to defaults on the next launch.
	}
}

function getDefaultStorage() {
	if (typeof window === "undefined") {
		return null;
	}
	try {
		return window.localStorage ?? null;
	} catch {
		return null;
	}
}
