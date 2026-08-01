import {
	WORKSPACE_MIN_PANE_SIZE_PX,
	WORKSPACE_SPLITTER_SIZE_PX,
	getWorkspacePaneForRole,
	resolveWorkspaceSplitRatioForSize,
	writePersistedWorkspaceViewLayout,
} from "./workspace-view-layout.js";
import {
	WORKSPACE_LAYOUT_SINGLE,
	WORKSPACE_LAYOUT_SPLIT,
} from "../workspace-model.js";

function getCurrentLayoutState(store) {
	return {
		layout: store.workspace.layout.value,
		splitRatio: store.workspace.splitRatio.value,
		activePaneId: store.workspace.activePaneId.value,
	};
}

export function createWorkspaceViewLayoutCommands({
	store,
	getCameraController,
	getWorkspacePaneElement,
	clearWorkspaceInteractions = () => {},
	clearSecondaryRenderers = () => {},
	focusWorkspaceSurface = () => {},
	updateUi = () => {},
	setStatus = () => {},
	t = (key) => key,
}) {
	function persistWorkspaceViewLayout() {
		writePersistedWorkspaceViewLayout(getCurrentLayoutState(store));
	}

	function activateWorkspacePane(paneId, { silent = false } = {}) {
		const pane = store.workspace.panes.value.find(
			(candidate) => candidate.id === paneId,
		);
		if (!pane) {
			return false;
		}
		return getCameraController?.()?.setMode?.(pane.role, { silent }) ?? false;
	}

	function activateWorkspacePaneAtPointer(event) {
		const target = event?.target;
		if (
			target?.closest?.(
				".workspace-pane__chrome, .workspace-splitter, .viewport-project-status, .background-task-pill, .viewport-splat-edit-toolbar, .viewport-pie",
			)
		) {
			return false;
		}
		const clientX = Number(event?.clientX);
		const clientY = Number(event?.clientY);
		if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) {
			return false;
		}

		const pointerCandidatePanes =
			store.workspace.layout.value === WORKSPACE_LAYOUT_SINGLE
				? store.workspace.panes.value.filter(
						(pane) => pane.id === store.workspace.activePaneId.value,
					)
				: store.workspace.panes.value;
		for (const pane of pointerCandidatePanes) {
			const element = getWorkspacePaneElement?.(pane.id);
			const rect = element?.getBoundingClientRect?.();
			if (
				!(rect?.width > 0) ||
				!(rect?.height > 0) ||
				clientX < rect.left ||
				clientX > rect.right ||
				clientY < rect.top ||
				clientY > rect.bottom
			) {
				continue;
			}
			return activateWorkspacePane(pane.id, { silent: true });
		}
		return false;
	}

	function showDualWorkspace() {
		if (store.workspace.layout.value === WORKSPACE_LAYOUT_SPLIT) {
			return false;
		}
		clearWorkspaceInteractions();
		store.workspace.layout.value = WORKSPACE_LAYOUT_SPLIT;
		persistWorkspaceViewLayout();
		updateUi({ syncProjectPresentation: false });
		setStatus(t("status.dualWorkspaceEnabled"));
		focusWorkspaceSurface();
		return true;
	}

	function closeWorkspacePane(paneId) {
		if (store.workspace.layout.value !== WORKSPACE_LAYOUT_SPLIT) {
			return false;
		}
		const closedPane = store.workspace.panes.value.find(
			(pane) => pane.id === paneId,
		);
		const remainingPane = store.workspace.panes.value.find(
			(pane) => pane.id !== paneId,
		);
		if (!closedPane || !remainingPane) {
			return false;
		}

		clearWorkspaceInteractions();
		clearSecondaryRenderers();
		store.workspace.layout.value = WORKSPACE_LAYOUT_SINGLE;
		const activated = activateWorkspacePane(remainingPane.id, { silent: true });
		if (!activated) {
			store.workspace.activePaneId.value = remainingPane.id;
			persistWorkspaceViewLayout();
			updateUi({ syncProjectPresentation: false });
		}
		setStatus(
			t("status.workspacePaneClosed", {
				name: t(`mode.${closedPane.role}`),
			}),
		);
		focusWorkspaceSurface();
		return true;
	}

	function setWorkspaceSplitRatio(
		nextRatio,
		{ orientation = "horizontal", width = 0, height = 0, persist = true } = {},
	) {
		const availableSize =
			Math.max(Number(orientation === "vertical" ? height : width) || 0, 0) -
			WORKSPACE_SPLITTER_SIZE_PX;
		const resolvedRatio = resolveWorkspaceSplitRatioForSize({
			splitRatio: nextRatio,
			availableSize,
			minPaneSize: WORKSPACE_MIN_PANE_SIZE_PX,
		});
		if (Math.abs(store.workspace.splitRatio.value - resolvedRatio) < 1e-6) {
			return false;
		}
		store.workspace.splitRatio.value = resolvedRatio;
		if (persist) {
			persistWorkspaceViewLayout();
		}
		return true;
	}

	function setMode(mode, options) {
		const pane = getWorkspacePaneForRole(store.workspace.panes.value, mode);
		return pane ? activateWorkspacePane(pane.id, options) : false;
	}

	return {
		persistWorkspaceViewLayout,
		activateWorkspacePane,
		activateWorkspacePaneAtPointer,
		showDualWorkspace,
		closeWorkspacePane,
		setWorkspaceSplitRatio,
		setMode,
		getCurrentLayoutState: () => getCurrentLayoutState(store),
		resetToSingleWorkspace() {
			clearSecondaryRenderers();
			store.workspace.layout.value = WORKSPACE_LAYOUT_SINGLE;
			persistWorkspaceViewLayout();
			updateUi({ syncProjectPresentation: false });
		},
	};
}
