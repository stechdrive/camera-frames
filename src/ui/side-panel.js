import { html } from "htm/preact";
import { useState } from "preact/hooks";
import { FRAME_MAX_COUNT } from "../constants.js";
import { getAnchorOptions } from "../i18n.js";
import { WorkbenchIcon } from "./workbench-icons.js";
import { HeaderMenu, HeaderWordmark } from "./workbench-primitives.js";
import {
	ExportSection,
	ExportSettingsSection,
	FooterSection,
	FramesSection,
	INSPECTOR_TAB_CAMERA,
	INSPECTOR_TAB_EXPORT,
	InspectorTabs,
	OutputFrameSection,
	ReferenceSection,
	SceneSection,
	ShotCameraSection,
	ViewSection,
	WorkbenchHeader,
} from "./workbench-sections.js";

export function SidePanel({ store, controller, locale, t, refs }) {
	const [activeInspectorTab, setActiveInspectorTab] =
		useState(INSPECTOR_TAB_CAMERA);
	const [draggedAssetId, setDraggedAssetId] = useState(null);
	const [dragHoverState, setDragHoverState] = useState(null);
	const workbenchCollapsed = store.workbenchCollapsed.value;
	const mode = store.mode.value;
	const modeLabel = store.modeLabel.value;
	const sceneUnitBadge = store.sceneUnitBadge.value;
	const sceneBadge = store.sceneBadge.value;
	const sceneSummary = store.sceneSummary.value;
	const sceneScaleSummary = store.sceneScaleSummary.value;
	const sceneAssets = store.sceneAssets.value;
	const selectedSceneAsset = store.selectedSceneAsset.value;
	const activeShotCamera = store.workspace.activeShotCamera.value;
	const shotCameraClipMode = store.shotCamera.clippingMode.value;
	const exportFormat = store.shotCamera.exportFormat.value;
	const exportGridOverlay = store.shotCamera.exportGridOverlay.value;
	const exportGridLayerMode = store.shotCamera.exportGridLayerMode.value;
	const exportModelLayers = store.shotCamera.exportModelLayers.value;
	const exportSplatLayers = store.shotCamera.exportSplatLayers.value;
	const cameraSummary = store.cameraSummary.value;
	const fovLabel = store.fovLabel.value;
	const equivalentMmValue = store.equivalentMmValue.value;
	const equivalentMmLabel = store.equivalentMmLabel.value;
	const viewportFovLabel = store.viewportFovLabel.value;
	const viewportEquivalentMmValue = store.viewportEquivalentMmValue.value;
	const viewportEquivalentMmLabel = store.viewportEquivalentMmLabel.value;
	const frameDocuments = store.frames.documents.value;
	const activeFrameId = store.frames.activeId.value;
	const frameCount = store.frames.count.value;
	const frameLimitReached = frameCount >= FRAME_MAX_COUNT;
	const exportSizeLabel = store.exportSizeLabel.value;
	const widthLabel = store.widthLabel.value;
	const heightLabel = store.heightLabel.value;
	const exportBusy = store.exportBusy.value;
	const exportStatusLabel = store.exportStatusLabel.value;
	const exportTarget = store.exportOptions.target.value;
	const exportPresetIds = store.exportOptions.presetIds.value;
	const exportFormatLabel =
		exportTarget === "current"
			? t(`exportFormat.${exportFormat}`)
			: t("field.exportFormat");
	const exportSelectionMissing =
		exportTarget === "selected" && exportPresetIds.length === 0;
	const anchorOptions = getAnchorOptions(locale);
	const workbenchAutoCollapsed = store.workbenchAutoCollapsed.value;
	const collapseWorkbench = () => {
		store.workbenchManualCollapsed.value = true;
		store.workbenchManualExpanded.value = false;
	};
	const expandWorkbench = () => {
		store.workbenchManualCollapsed.value = false;
		store.workbenchManualExpanded.value = workbenchAutoCollapsed;
	};
	const toggleWorkbenchCollapsed = () => {
		if (workbenchCollapsed) {
			expandWorkbench();
			return;
		}
		collapseWorkbench();
	};
	const projectMenuItems = [
		{
			id: "open-project",
			icon: "folder-open",
			label: t("action.openProject"),
			onClick: () => controller()?.openProject(),
		},
		{
			id: "open-working-project",
			icon: "folder-open",
			label: t("action.openWorkingProject"),
			onClick: () => controller()?.openWorkingProject(),
		},
		{
			id: "save-project",
			icon: "save",
			label: t("action.saveProject"),
			onClick: () => controller()?.saveProject(),
		},
		{
			id: "export-project",
			icon: "package",
			label: t("action.exportProject"),
			onClick: () => controller()?.exportProject(),
		},
		{
			id: "clear-scene",
			icon: "trash",
			label: t("action.clear"),
			destructive: true,
			onClick: () => controller()?.clearScene(),
		},
	];
	const fileMenuChildren = html`
		<div class="workbench-menu__group">
			<button
				id="open-files"
				type="button"
				class="workbench-menu__item"
				onClick=${() => controller()?.openFiles()}
			>
				<span class="workbench-menu__item-icon">
					<${WorkbenchIcon} name="folder-open" size=${14} />
				</span>
				<span>${t("action.openFiles")}</span>
			</button>
			<div class="workbench-menu__field">
				<label for="header-url-input">${t("field.remoteUrl")}</label>
				<input
					id="header-url-input"
					type="text"
					placeholder="https://.../scene.spz or model.glb"
					value=${store.remoteUrl.value}
					onInput=${(event) => {
						store.remoteUrl.value = event.currentTarget.value;
					}}
					onKeyDown=${(event) => {
						if (event.key === "Enter") {
							event.preventDefault();
							controller()?.loadRemoteUrls();
						}
					}}
				/>
			</div>
			<button
				id="load-url"
				type="button"
				class="workbench-menu__item"
				onClick=${() => controller()?.loadRemoteUrls()}
			>
				<span class="workbench-menu__item-icon">
					<${WorkbenchIcon} name="folder-open" size=${14} />
				</span>
				<span>${t("action.loadUrl")}</span>
			</button>
		</div>
	`;

	if (workbenchCollapsed) {
		return html`
			<div class="workbench-collapse-chip-wrap">
				<${HeaderMenu}
					label=${t("section.file")}
					items=${projectMenuItems}
				>
					${fileMenuChildren}
				<//>
				<button
					type="button"
					class="workbench-collapse-chip"
					aria-label=${t("action.expandWorkbench")}
					onClick=${toggleWorkbenchCollapsed}
				>
					<${HeaderWordmark} title="CAMERA_FRAMES" compact=${true} />
					<span class="workbench-collapse-chip__icon">
						<${WorkbenchIcon} name="chevron-right" size=${14} />
					</span>
				</button>
			</div>
		`;
	}

	return html`
		<div class="workbench-shell" ref=${refs?.workbenchShellRef}>
			<div
				class="workbench-column workbench-column--left"
				ref=${refs?.workbenchLeftColumnRef}
			>
				<section class="workbench-card workbench-card--topbar">
					<${WorkbenchHeader}
						t=${t}
						compact=${true}
						collapsed=${false}
						onToggleCollapse=${toggleWorkbenchCollapsed}
						projectMenuItems=${projectMenuItems}
						remoteUrl=${store.remoteUrl.value}
						onRemoteUrlInput=${(value) => {
							store.remoteUrl.value = value;
						}}
						onLoadRemoteUrls=${() => controller()?.loadRemoteUrls()}
						onOpenFiles=${() => controller()?.openFiles()}
						menuChildren=${fileMenuChildren}
					/>
					<${ViewSection}
						controller=${controller}
						mode=${mode}
						modeLabel=${modeLabel}
						selectedSceneAsset=${selectedSceneAsset}
						store=${store}
						t=${t}
						viewportEquivalentMmLabel=${viewportEquivalentMmLabel}
						viewportEquivalentMmValue=${viewportEquivalentMmValue}
						viewportFovLabel=${viewportFovLabel}
					/>
					<${FooterSection} store=${store} />
				</section>
				<section class="workbench-card workbench-card--scene">
					<${SceneSection}
						controller=${controller}
						sceneAssets=${sceneAssets}
						sceneBadge=${sceneBadge}
						sceneScaleSummary=${sceneScaleSummary}
						sceneSummary=${sceneSummary}
						sceneUnitBadge=${sceneUnitBadge}
						selectedSceneAsset=${selectedSceneAsset}
						store=${store}
						t=${t}
						draggedAssetId=${draggedAssetId}
						setDraggedAssetId=${setDraggedAssetId}
						dragHoverState=${dragHoverState}
						setDragHoverState=${setDragHoverState}
					/>
				</section>
			</div>
			<div
				class="workbench-column workbench-column--right"
				ref=${refs?.workbenchRightColumnRef}
			>
				<section class="workbench-card workbench-card--inspector">
					<${InspectorTabs}
						activeTab=${activeInspectorTab}
						setActiveTab=${setActiveInspectorTab}
						t=${t}
					/>
					<div class="workbench-inspector-stack">
						${
							activeInspectorTab === INSPECTOR_TAB_CAMERA &&
							html`
								<${ShotCameraSection}
									activeShotCamera=${activeShotCamera}
									cameraSummary=${cameraSummary}
									controller=${controller}
									equivalentMmLabel=${equivalentMmLabel}
									equivalentMmValue=${equivalentMmValue}
									fovLabel=${fovLabel}
									shotCameraClipMode=${shotCameraClipMode}
									store=${store}
									t=${t}
								/>
								<${OutputFrameSection}
									anchorOptions=${anchorOptions}
									controller=${controller}
									exportSizeLabel=${exportSizeLabel}
									heightLabel=${heightLabel}
									store=${store}
									t=${t}
									widthLabel=${widthLabel}
								/>
								<${ReferenceSection}
									controller=${controller}
									store=${store}
									t=${t}
								/>
								<${FramesSection}
									activeFrameId=${activeFrameId}
									controller=${controller}
									frameCount=${frameCount}
									frameDocuments=${frameDocuments}
									frameLimitReached=${frameLimitReached}
									t=${t}
								/>
							`
						}
						${
							activeInspectorTab === INSPECTOR_TAB_EXPORT &&
							html`
								<${ExportSettingsSection}
									activeShotCamera=${activeShotCamera}
									controller=${controller}
									exportFormat=${exportFormat}
									exportGridLayerMode=${exportGridLayerMode}
									exportGridOverlay=${exportGridOverlay}
									exportModelLayers=${exportModelLayers}
									exportSplatLayers=${exportSplatLayers}
									store=${store}
									t=${t}
								/>
								<${ExportSection}
									controller=${controller}
									exportBusy=${exportBusy}
									exportFormatLabel=${exportFormatLabel}
									exportPresetIds=${exportPresetIds}
									exportSelectionMissing=${exportSelectionMissing}
									exportStatusLabel=${exportStatusLabel}
									exportTarget=${exportTarget}
									store=${store}
									t=${t}
								/>
							`
						}
					</div>
				</section>
			</div>
		</div>
	`;
}
